/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BellTarget,
  DynamicLog,
  GateMechanism,
  LevelDefinition,
  PlacedPiece,
  SeesawMechanism,
  SplashParticle,
  StaticRock,
  WaterMillTarget,
  WaterParticle,
} from './types';
import { sound } from './audio';

export const ARENA_WIDTH = 480;
export const ARENA_HEIGHT = 720;
const GRAVITY = 720; // px/s^2

export interface PhysicsEngineState {
  waterParticles: WaterParticle[];
  dynamicLogs: DynamicLog[];
  mills: WaterMillTarget[];
  bells: BellTarget[];
  seesaws: SeesawMechanism[];
  gates: GateMechanism[];
  splashParticles: SplashParticle[];
  waterTimer: number;
}

export class PhysicsEngine {
  private level: LevelDefinition;
  private pieces: PlacedPiece[];
  public state: PhysicsEngineState;
  private isSimulating: boolean = false;

  constructor(level: LevelDefinition, pieces: PlacedPiece[]) {
    this.level = level;
    this.pieces = pieces;
    this.state = this.initSimulationState();
  }

  public reset(level: LevelDefinition, pieces: PlacedPiece[]) {
    this.level = level;
    this.pieces = pieces;
    this.state = this.initSimulationState();
    this.isSimulating = false;
  }

  public setSimulating(simulating: boolean) {
    this.isSimulating = simulating;
    if (!simulating) {
      // Reset dynamic bodies back to starting spots
      this.state = this.initSimulationState();
    }
  }

  private initSimulationState(): PhysicsEngineState {
    // Clone mills
    const mills: WaterMillTarget[] = (this.level.mills || []).map((m) => ({
      ...m,
      currentTurns: 0,
      angle: m.angle || 0,
      angularVelocity: 0,
      paddles: m.paddles || 8,
    }));

    // Clone bells
    const bells: BellTarget[] = (this.level.bells || []).map((b) => ({
      ...b,
      hit: false,
      swingAngle: 0,
    }));

    // Clone seesaws
    const seesaws: SeesawMechanism[] = (this.level.seesaws || []).map((s) => ({
      ...s,
      angle: s.angle || 0,
      angularVelocity: 0,
      leftWeight: 0,
      rightWeight: 0,
    }));

    // Clone gates
    const gates: GateMechanism[] = (this.level.gates || []).map((g) => ({
      ...g,
      angle: g.angle || 0,
      isOpen: false,
    }));

    // Find any ROUND_LOG in placed pieces and turn into dynamic log
    const dynamicLogs: DynamicLog[] = [];
    this.pieces.forEach((p) => {
      if (p.type === 'ROUND_LOG') {
        dynamicLogs.push({
          id: p.id,
          x: p.x,
          y: p.y,
          vx: 0,
          vy: 0,
          radius: 17,
          angle: (p.angle * Math.PI) / 180,
          angularVelocity: 0,
          initialX: p.x,
          initialY: p.y,
        });
      }
    });

    return {
      waterParticles: [],
      dynamicLogs,
      mills,
      bells,
      seesaws,
      gates,
      splashParticles: [],
      waterTimer: 0,
    };
  }

  public update(dt: number) {
    if (!this.isSimulating) return;

    // Sub-stepping for ultra smooth fluid and no collision tunneling
    const subSteps = 3;
    const subDt = dt / subSteps;

    for (let step = 0; step < subSteps; step++) {
      this.stepPhysics(subDt);
    }

    // Update splash visual particles
    this.updateSplashes(dt);

    // Update bells swing decay
    this.state.bells.forEach((bell) => {
      if (Math.abs(bell.swingAngle) > 0.01) {
        bell.swingAngle *= Math.pow(0.85, dt * 60);
      } else {
        bell.swingAngle = 0;
      }
    });
  }

  private stepPhysics(dt: number) {
    // 1. Water emission
    if (this.level.waterSource) {
      this.state.waterTimer += dt;
      const interval = 1 / (this.level.waterSource.rate || 35);
      while (this.state.waterTimer >= interval) {
        this.state.waterTimer -= interval;
        if (this.state.waterParticles.length < 280) {
          const ws = this.level.waterSource;
          const jitterX = (Math.random() - 0.5) * 6;
          const jitterY = (Math.random() - 0.5) * 2;
          this.state.waterParticles.push({
            x: ws.x + jitterX,
            y: ws.y + jitterY,
            vx: ws.vx + (Math.random() - 0.5) * 15,
            vy: ws.vy + (Math.random() - 0.5) * 10,
            life: 0,
            maxLife: 6.5,
            radius: 5.5,
          });
        }
      }
    }

    // Secondary water source if level has one
    if (this.level.secondaryWaterSource) {
      if (Math.random() < 0.4) {
        const sws = this.level.secondaryWaterSource;
        this.state.waterParticles.push({
          x: sws.x + (Math.random() - 0.5) * 6,
          y: sws.y,
          vx: sws.vx + (Math.random() - 0.5) * 10,
          vy: sws.vy,
          life: 0,
          maxLife: 6.5,
          radius: 5.5,
        });
      }
    }

    // 2. Water particles update & collisions
    for (let i = this.state.waterParticles.length - 1; i >= 0; i--) {
      const p = this.state.waterParticles[i];
      p.life += dt;

      // Gravity
      p.vy += GRAVITY * dt;
      p.vx *= 0.998; // slight drag

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Collide with boundary
      if (p.x < p.radius) {
        p.x = p.radius;
        p.vx = -p.vx * 0.3;
      } else if (p.x > ARENA_WIDTH - p.radius) {
        p.x = ARENA_WIDTH - p.radius;
        p.vx = -p.vx * 0.3;
      }

      // Bottom kill
      if (p.y > ARENA_HEIGHT + 20 || p.life > p.maxLife) {
        this.state.waterParticles.splice(i, 1);
        continue;
      }

      // Collide with placed wooden pieces (excluding logs & wheels)
      for (const piece of this.pieces) {
        if (piece.type === 'ROUND_LOG' || piece.type === 'WATER_WHEEL') continue;
        this.collideWaterWithPiece(p, piece);
      }

      // Collide with static rocks / ground
      for (const rock of this.level.rocks) {
        this.collideWaterWithRock(p, rock);
      }

      // Collide with watermills -> delivers torque & rotates wheel
      for (const mill of this.state.mills) {
        this.collideWaterWithMill(p, mill);
      }

      // Collide with seesaws
      for (const seesaw of this.state.seesaws) {
        this.collideWaterWithSeesaw(p, seesaw);
      }

      // Collide with gates (if closed)
      for (const gate of this.state.gates) {
        if (!gate.isOpen) {
          this.collideWaterWithGate(p, gate);
        }
      }
    }

    // 3. Dynamic logs update & collisions
    for (const log of this.state.dynamicLogs) {
      log.vy += GRAVITY * 1.1 * dt;
      log.vx *= 0.995;

      log.x += log.vx * dt;
      log.y += log.vy * dt;

      // Angular roll
      log.angle += (log.vx / log.radius) * dt;

      // Collide with arena boundaries
      if (log.x - log.radius < 0) {
        log.x = log.radius;
        log.vx = -log.vx * 0.4;
      } else if (log.x + log.radius > ARENA_WIDTH) {
        log.x = ARENA_WIDTH - log.radius;
        log.vx = -log.vx * 0.4;
      }

      // Collide with placed pieces
      for (const piece of this.pieces) {
        if (piece.type === 'ROUND_LOG') continue;
        this.collideLogWithPiece(log, piece);
      }

      // Collide with static rocks
      for (const rock of this.level.rocks) {
        this.collideLogWithRock(log, rock);
      }

      // Collide with bells (Win trigger!)
      for (const bell of this.state.bells) {
        const dx = log.x - bell.x;
        const dy = log.y - bell.y;
        const dist = Math.sqrt(dx * dy + dy * dy);
        if (dist < log.radius + bell.radius) {
          if (!bell.hit) {
            bell.hit = true;
            bell.swingAngle = 0.45;
            sound.playBellRing();
            this.addSplashes(bell.x, bell.y, '#f59e0b', 12);
          }
          // Bounce off bell
          log.vx = -log.vx * 0.5;
        }
      }

      // Collide with seesaws
      for (const seesaw of this.state.seesaws) {
        this.collideLogWithSeesaw(log, seesaw);
      }

      // Collide with gates
      for (const gate of this.state.gates) {
        if (!gate.isOpen) {
          this.collideLogWithGate(log, gate);
        }
      }
    }

    // 4. Update Watermills rotation & inertia
    for (const mill of this.state.mills) {
      // Friction / resistance
      mill.angularVelocity *= Math.pow(0.96, dt * 60);

      // Rotate
      const deltaAngle = mill.angularVelocity * dt;
      mill.angle += deltaAngle;

      // Accumulate turns
      const prevTurns = mill.currentTurns;
      mill.currentTurns += Math.abs(deltaAngle) / (2 * Math.PI);

      if (Math.floor(mill.currentTurns * 8) > Math.floor(prevTurns * 8)) {
        sound.playGearTick();
      }
    }

    // 5. Update seesaws
    for (const seesaw of this.state.seesaws) {
      // Natural spring or return torque
      const targetAngle = (seesaw.rightWeight - seesaw.leftWeight) * 0.35;
      const angleDiff = targetAngle - seesaw.angle;
      seesaw.angularVelocity += angleDiff * 15 * dt;
      seesaw.angularVelocity *= 0.92;
      seesaw.angle += seesaw.angularVelocity * dt;

      // Clamp angle
      if (seesaw.angle < seesaw.minAngle) {
        seesaw.angle = seesaw.minAngle;
        seesaw.angularVelocity = 0;
      }
      if (seesaw.angle > seesaw.maxAngle) {
        seesaw.angle = seesaw.maxAngle;
        seesaw.angularVelocity = 0;
      }

      // Reset weights for next tick accumulation
      seesaw.leftWeight *= 0.85;
      seesaw.rightWeight *= 0.85;

      // Check linked gate
      if (seesaw.angle > 0.18) {
        const linkedGate = this.state.gates.find((g) => g.linkedTriggerId === seesaw.id);
        if (linkedGate && !linkedGate.isOpen) {
          linkedGate.isOpen = true;
          sound.playWoodSnap();
        }
      }
    }
  }

  // Segment collision helper
  private collideWaterWithPiece(p: WaterParticle, piece: PlacedPiece) {
    const { width, height } = this.getPieceDims(piece);
    const rad = (piece.angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Transform particle into piece local coordinates
    const dx = p.x - piece.x;
    const dy = p.y - piece.y;
    const localX = cos * dx + sin * dy;
    const localY = -sin * dx + cos * dy;

    const hw = width / 2;
    const hh = height / 2;

    // Check box intersection
    if (
      localX >= -hw - p.radius &&
      localX <= hw + p.radius &&
      localY >= -hh - p.radius &&
      localY <= hh + p.radius
    ) {
      // Calculate penetration depths
      const penLeft = localX - (-hw);
      const penRight = hw - localX;
      const penTop = localY - (-hh);
      const penBottom = hh - localY;

      const minPen = Math.min(penLeft, penRight, penTop, penBottom);

      // Local normal
      let normLocalX = 0;
      let normLocalY = 0;

      if (minPen === penTop) {
        normLocalY = -1;
      } else if (minPen === penBottom) {
        normLocalY = 1;
      } else if (minPen === penLeft) {
        normLocalX = -1;
      } else {
        normLocalX = 1;
      }

      // Convert normal back to world
      const worldNormX = cos * normLocalX - sin * normLocalY;
      const worldNormY = sin * normLocalX + cos * normLocalY;

      // Push particle out
      const push = (minPen + p.radius) * 0.7;
      p.x += worldNormX * push;
      p.y += worldNormY * push;

      // Reflect velocity with friction along plank & bounce
      const dot = p.vx * worldNormX + p.vy * worldNormY;
      if (dot < 0) {
        // Normal component
        const vNormalX = worldNormX * dot;
        const vNormalY = worldNormY * dot;
        // Tangent component
        const vTangentX = p.vx - vNormalX;
        const vTangentY = p.vy - vNormalY;

        const restitution = 0.25; // mild bounce
        const friction = 0.94; // slides smoothly down plank

        p.vx = vTangentX * friction - vNormalX * restitution;
        p.vy = vTangentY * friction - vNormalY * restitution;

        if (Math.random() < 0.08) {
          sound.playWaterSplash();
          this.addSplashes(p.x, p.y, '#38bdf8', 1);
        }
      }
    }
  }

  private collideWaterWithRock(p: WaterParticle, rock: StaticRock) {
    const hw = rock.width / 2;
    const hh = rock.height / 2;
    const cx = rock.x + hw;
    const cy = rock.y + hh;

    if (
      p.x >= rock.x - p.radius &&
      p.x <= rock.x + rock.width + p.radius &&
      p.y >= rock.y - p.radius &&
      p.y <= rock.y + rock.height + p.radius
    ) {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const penX = hw + p.radius - Math.abs(dx);
      const penY = hh + p.radius - Math.abs(dy);

      if (penX < penY) {
        p.x += Math.sign(dx) * penX;
        p.vx = -p.vx * 0.3;
      } else {
        p.y += Math.sign(dy) * penY;
        p.vy = -p.vy * 0.2;
      }
    }
  }

  private collideWaterWithMill(p: WaterParticle, mill: WaterMillTarget) {
    const dx = p.x - mill.x;
    const dy = p.y - mill.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= mill.radius + p.radius && dist >= mill.radius * 0.25) {
      // Calculate paddle impact torque: cross product of r and particle velocity
      // r = (dx, dy), v = (p.vx, p.vy)
      // torque = dx * p.vy - dy * p.vx
      const torque = (dx * p.vy - dy * p.vx) / (mill.radius * 18);
      mill.angularVelocity += torque * 0.18;

      // Deflect water droplet
      p.vx *= 0.4;
      p.vy *= 0.4;
      p.x += (dx / dist) * 2;
      p.y += (dy / dist) * 2;

      if (!p.hasPowered) {
        p.hasPowered = true;
        this.addSplashes(p.x, p.y, '#7dd3fc', 2);
      }
    }
  }

  private collideWaterWithSeesaw(p: WaterParticle, seesaw: SeesawMechanism) {
    const rad = seesaw.angle;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const dx = p.x - seesaw.pivotX;
    const dy = p.y - seesaw.pivotY;
    const localX = cos * dx + sin * dy;
    const localY = -sin * dx + cos * dy;

    const hw = seesaw.length / 2;
    const hh = 10;

    if (
      localX >= -hw - p.radius &&
      localX <= hw + p.radius &&
      localY >= -hh - p.radius &&
      localY <= hh + p.radius
    ) {
      // Add weight to left or right arm
      if (localX < 0) {
        seesaw.leftWeight += 0.8;
      } else {
        seesaw.rightWeight += 0.8;
      }

      // Bounce water
      p.vy = -Math.abs(p.vy) * 0.2;
      p.vx += localX > 0 ? 30 : -30;
    }
  }

  private collideWaterWithGate(p: WaterParticle, gate: GateMechanism) {
    // Gate is a vertical barrier swinging around top pivot
    const gx = gate.pivotX;
    const gy = gate.pivotY;
    const gLen = gate.length;

    if (p.x >= gx - 8 && p.x <= gx + 8 && p.y >= gy && p.y <= gy + gLen) {
      p.x = gx - p.radius;
      p.vx = -Math.abs(p.vx) * 0.3;
    }
  }

  // Dynamic log collisions
  private collideLogWithPiece(log: DynamicLog, piece: PlacedPiece) {
    const { width, height } = this.getPieceDims(piece);
    const rad = (piece.angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const dx = log.x - piece.x;
    const dy = log.y - piece.y;
    const localX = cos * dx + sin * dy;
    const localY = -sin * dx + cos * dy;

    const hw = width / 2;
    const hh = height / 2;

    const clampedX = Math.max(-hw, Math.min(hw, localX));
    const clampedY = Math.max(-hh, Math.min(hh, localY));

    const diffX = localX - clampedX;
    const diffY = localY - clampedY;
    const distSq = diffX * diffX + diffY * diffY;

    if (distSq < log.radius * log.radius) {
      const dist = Math.sqrt(distSq) || 0.001;
      const pen = log.radius - dist;

      const normLocalX = diffX / dist;
      const normLocalY = diffY / dist;

      const worldNormX = cos * normLocalX - sin * normLocalY;
      const worldNormY = sin * normLocalX + cos * normLocalY;

      // Push out
      log.x += worldNormX * pen;
      log.y += worldNormY * pen;

      // Velocity reflection
      const dot = log.vx * worldNormX + log.vy * worldNormY;
      if (dot < 0) {
        const vNormalX = worldNormX * dot;
        const vNormalY = worldNormY * dot;
        const vTangentX = log.vx - vNormalX;
        const vTangentY = log.vy - vNormalY;

        log.vx = vTangentX * 0.98 - vNormalX * 0.35;
        log.vy = vTangentY * 0.98 - vNormalY * 0.35;

        // Apply rolling friction
        log.angularVelocity = (log.vx / log.radius) * 1.5;

        if (Math.abs(dot) > 60) {
          sound.playWoodClick(0.8);
        }
      }
    }
  }

  private collideLogWithRock(log: DynamicLog, rock: StaticRock) {
    const hw = rock.width / 2;
    const hh = rock.height / 2;
    const cx = rock.x + hw;
    const cy = rock.y + hh;

    const clampedX = Math.max(rock.x, Math.min(rock.x + rock.width, log.x));
    const clampedY = Math.max(rock.y, Math.min(rock.y + rock.height, log.y));

    const diffX = log.x - clampedX;
    const diffY = log.y - clampedY;
    const distSq = diffX * diffX + diffY * diffY;

    if (distSq < log.radius * log.radius) {
      const dist = Math.sqrt(distSq) || 0.001;
      const pen = log.radius - dist;
      const normX = diffX / dist;
      const normY = diffY / dist;

      log.x += normX * pen;
      log.y += normY * pen;

      const dot = log.vx * normX + log.vy * normY;
      if (dot < 0) {
        log.vx -= normX * dot * 1.35;
        log.vy -= normY * dot * 1.35;
        if (Math.abs(dot) > 70) {
          sound.playWoodClick(0.7);
        }
      }
    }
  }

  private collideLogWithSeesaw(log: DynamicLog, seesaw: SeesawMechanism) {
    const rad = seesaw.angle;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const dx = log.x - seesaw.pivotX;
    const dy = log.y - seesaw.pivotY;
    const localX = cos * dx + sin * dy;
    const localY = -sin * dx + cos * dy;

    const hw = seesaw.length / 2;
    const hh = 8;

    if (
      localX >= -hw - log.radius &&
      localX <= hw + log.radius &&
      localY >= -hh - log.radius &&
      localY <= hh + log.radius
    ) {
      // Depress seesaw side
      if (localX < 0) {
        seesaw.leftWeight += 50;
      } else {
        seesaw.rightWeight += 50;
      }

      // Rest log on seesaw surface
      log.y = seesaw.pivotY + sin * localX - log.radius - 2;
      log.vy = 0;
      log.vx += Math.sin(seesaw.angle) * 40;
    }
  }

  private collideLogWithGate(log: DynamicLog, gate: GateMechanism) {
    const gx = gate.pivotX;
    const gy = gate.pivotY;
    const gLen = gate.length;

    if (log.x >= gx - 12 && log.x <= gx + 12 && log.y >= gy && log.y <= gy + gLen) {
      log.x = gx - log.radius;
      log.vx = -Math.abs(log.vx) * 0.4;
      sound.playWoodClick(0.9);
    }
  }

  private getPieceDims(piece: PlacedPiece): { width: number; height: number } {
    switch (piece.type) {
      case 'LONG_PLANK':
        return { width: 140, height: 16 };
      case 'SHORT_PLANK':
        return { width: 80, height: 16 };
      case 'VERTICAL_POST':
        return { width: 20, height: 90 };
      case 'INCLINE_RAMP':
        return { width: 110, height: 22 };
      case 'PLATFORM':
        return { width: 110, height: 18 };
      case 'SEESAW':
        return { width: 130, height: 14 };
      case 'HINGED_GATE':
        return { width: 16, height: 75 };
      case 'LOCK_PIN':
        return { width: 16, height: 40 };
      default:
        return { width: 60, height: 16 };
    }
  }

  private addSplashes(x: number, y: number, color: string, count: number = 3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * 60;
      this.state.splashParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        alpha: 1.0,
        size: 2 + Math.random() * 3,
        color,
      });
    }
  }

  private updateSplashes(dt: number) {
    for (let i = this.state.splashParticles.length - 1; i >= 0; i--) {
      const s = this.state.splashParticles[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += GRAVITY * 0.4 * dt;
      s.alpha -= dt * 2.5;
      if (s.alpha <= 0) {
        this.state.splashParticles.splice(i, 1);
      }
    }
  }
}
