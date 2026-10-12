/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BellTarget,
  DynamicLog,
  GateMechanism,
  GuideSlot,
  LevelDefinition,
  PlacedPiece,
  SeesawMechanism,
  SplashParticle,
  StaticRock,
  WaterMillTarget,
  WaterParticle,
} from './types';
import { ARENA_HEIGHT, ARENA_WIDTH } from './physics';

export interface RenderOptions {
  selectedPieceId: string | null;
  draggedPieceId: string | null;
  isSimulating: boolean;
  showHints: boolean;
  invalidPieceId: string | null;
  animTime: number;
}

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(
    level: LevelDefinition,
    placedPieces: PlacedPiece[],
    waterParticles: WaterParticle[],
    dynamicLogs: DynamicLog[],
    mills: WaterMillTarget[],
    bells: BellTarget[],
    seesaws: SeesawMechanism[],
    gates: GateMechanism[],
    splashes: SplashParticle[],
    options: RenderOptions
  ) {
    const { ctx } = this;

    // Clear canvas
    ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    // 1. Draw Forest & Valley Diorama Background
    this.drawBackground(level, options.animTime);

    // 2. Draw Static Rocks / Terrain with moss & wood supports
    this.drawTerrain(level.rocks);

    // 3. Draw Water Sources & Cascades
    if (level.waterSource) {
      this.drawWaterSource(level.waterSource.x, level.waterSource.y, options.animTime);
    }
    if (level.secondaryWaterSource) {
      this.drawWaterSource(level.secondaryWaterSource.x, level.secondaryWaterSource.y, options.animTime);
    }

    // 4. Draw Guide Slots (Ghost outlines if in build mode or hints active)
    if (!options.isSimulating) {
      this.drawGuideSlots(level.guideSlots, options.showHints, options.animTime);
    }

    // 5. Draw Mechanisms (Gates, Seesaws)
    this.drawGates(gates);
    this.drawSeesaws(seesaws);

    // 6. Draw Placed Wooden Pieces
    this.drawPieces(placedPieces, options);

    // 7. Draw Dynamic Logs
    this.drawDynamicLogs(dynamicLogs);

    // 8. Draw Watermills / Wheels
    this.drawMills(mills, options.animTime);

    // 9. Draw Brass Bells
    this.drawBells(bells);

    // 10. Draw Water Stream & Particles
    this.drawWaterParticles(waterParticles);

    // 11. Draw Water Splashes & Foam
    this.drawSplashes(splashes);

    // 12. Draw Selected Piece Controls (Rotation Ring & Handles)
    if (!options.isSimulating && options.selectedPieceId) {
      const selected = placedPieces.find((p) => p.id === options.selectedPieceId);
      if (selected) {
        this.drawSelectionControls(selected, options.animTime);
      }
    }
  }

  // 1. Stylized Forest Background
  private drawBackground(level: LevelDefinition, animTime: number) {
    const { ctx } = this;

    // Sky & atmospheric gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
    skyGrad.addColorStop(0, '#7dd3fc'); // Clear morning cyan
    skyGrad.addColorStop(0.35, '#bae6fd');
    skyGrad.addColorStop(0.7, '#dcfce7'); // Lush forest horizon
    skyGrad.addColorStop(1, '#86efac');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    // Warm Sunbeam rays
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(80, 0);
    ctx.lineTo(0, ARENA_HEIGHT * 0.7);
    ctx.lineTo(120, ARENA_HEIGHT * 0.7);
    ctx.lineTo(110, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(220, 0);
    ctx.lineTo(120, ARENA_HEIGHT);
    ctx.lineTo(260, ARENA_HEIGHT);
    ctx.lineTo(250, 0);
    ctx.fill();
    ctx.restore();

    // Distant mountain layers
    ctx.fillStyle = '#64748b25';
    ctx.beginPath();
    ctx.moveTo(0, 320);
    ctx.lineTo(80, 240);
    ctx.lineTo(190, 310);
    ctx.lineTo(310, 210);
    ctx.lineTo(440, 300);
    ctx.lineTo(480, 270);
    ctx.lineTo(480, ARENA_HEIGHT);
    ctx.lineTo(0, ARENA_HEIGHT);
    ctx.fill();

    // Midground pine tree silhouettes
    ctx.fillStyle = '#16653420';
    for (let x = 10; x < ARENA_WIDTH; x += 45) {
      const treeH = 35 + ((x * 17) % 25);
      const baseY = 360 + ((x * 23) % 40);
      ctx.beginPath();
      ctx.moveTo(x, baseY - treeH);
      ctx.lineTo(x - 14, baseY);
      ctx.lineTo(x + 14, baseY);
      ctx.fill();
    }

    // Animated gentle river at the bottom
    const riverY = ARENA_HEIGHT - 65;
    const riverGrad = ctx.createLinearGradient(0, riverY, 0, ARENA_HEIGHT);
    riverGrad.addColorStop(0, '#38bdf8');
    riverGrad.addColorStop(0.5, '#0284c7');
    riverGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = riverGrad;
    ctx.fillRect(0, riverY, ARENA_WIDTH, 65);

    // River water waves
    ctx.strokeStyle = '#e0f2fe80';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const waveOffset = (animTime * 2.5) % (Math.PI * 2);
    for (let x = 0; x <= ARENA_WIDTH; x += 10) {
      const y = riverY + 8 + Math.sin(x * 0.04 + waveOffset) * 3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // 2. Natural Rocks & Ground Formations
  private drawTerrain(rocks: StaticRock[]) {
    const { ctx } = this;

    rocks.forEach((rock) => {
      ctx.save();
      // Drop shadow for 2.5D depth
      ctx.shadowColor = 'rgba(20, 25, 20, 0.35)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 6;

      // Rock gradient
      const grad = ctx.createLinearGradient(rock.x, rock.y, rock.x + rock.width, rock.y + rock.height);
      grad.addColorStop(0, '#78716c');
      grad.addColorStop(0.5, '#57534e');
      grad.addColorStop(1, '#44403c');
      ctx.fillStyle = grad;

      const r = rock.borderRadius || 10;
      this.roundRect(ctx, rock.x, rock.y, rock.width, rock.height, r);
      ctx.fill();
      ctx.restore();

      // Rock mossy top cap
      ctx.save();
      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath();
      this.roundRect(ctx, rock.x + 2, rock.y + 2, rock.width - 4, Math.min(12, rock.height * 0.25), [r, r, 0, 0]);
      ctx.fill();

      // Lighter highlights on rock edge
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rock.x + 4, rock.y + 4);
      ctx.lineTo(rock.x + rock.width - 4, rock.y + 4);
      ctx.stroke();

      // Rock label if exists (e.g. "Değirmen Temeli")
      if (rock.label && rock.height > 60) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(rock.label, rock.x + rock.width / 2, rock.y + rock.height / 2 + 4);
      }
      ctx.restore();
    });
  }

  // 3. Water Source / Spring
  private drawWaterSource(x: number, y: number, animTime: number) {
    const { ctx } = this;

    ctx.save();
    // Wooden spout box
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    this.roundRect(ctx, x - 26, y - 24, 52, 28, 4);
    ctx.fill();
    ctx.stroke();

    // Brass spout nozzle
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.arc(x, y - 4, 10, 0, Math.PI * 2);
    ctx.fill();

    // Cascading water spout stream
    const pulse = Math.sin(animTime * 6) * 2;
    const waterGrad = ctx.createLinearGradient(x - 8, y, x + 8, y + 25);
    waterGrad.addColorStop(0, '#e0f2fe');
    waterGrad.addColorStop(0.4, '#38bdf8');
    waterGrad.addColorStop(1, '#0284c7');

    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.moveTo(x - 8 + pulse, y);
    ctx.lineTo(x + 8 - pulse, y);
    ctx.lineTo(x + 11, y + 25);
    ctx.lineTo(x - 11, y + 25);
    ctx.closePath();
    ctx.fill();

    // Foam sparkles
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + Math.sin(animTime * 12) * 4, y + 10, 2.5, 0, Math.PI * 2);
    ctx.arc(x - Math.cos(animTime * 10) * 5, y + 18, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 4. Guide Slots
  private drawGuideSlots(slots: GuideSlot[], showHints: boolean, animTime: number) {
    const { ctx } = this;

    slots.forEach((slot) => {
      ctx.save();
      ctx.translate(slot.x, slot.y);
      ctx.rotate((slot.angle * Math.PI) / 180);

      const dims = this.getTypeDims(slot.type);

      // Dashed ghost outline
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = showHints ? 3 : 2;

      if (showHints) {
        // Glowing gold animation for active hints
        const glow = 0.5 + Math.sin(animTime * 4) * 0.3;
        ctx.strokeStyle = `rgba(245, 158, 11, ${glow})`;
        ctx.fillStyle = `rgba(254, 240, 138, ${glow * 0.35})`;
      } else {
        ctx.strokeStyle = 'rgba(120, 53, 15, 0.38)';
        ctx.fillStyle = 'rgba(254, 243, 199, 0.15)';
      }

      if (slot.type === 'ROUND_LOG') {
        ctx.beginPath();
        ctx.arc(0, 0, dims.radius || 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        this.roundRect(ctx, -dims.width / 2, -dims.height / 2, dims.width, dims.height, 4);
        ctx.fill();
        ctx.stroke();
      }

      // Slot label
      if (showHints && slot.label) {
        ctx.setLineDash([]);
        ctx.fillStyle = '#78350f';
        ctx.font = '700 10px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(slot.label, 0, 3);
      }

      ctx.restore();
    });
  }

  // 5. Gates & Seesaws
  private drawGates(gates: GateMechanism[]) {
    const { ctx } = this;
    gates.forEach((gate) => {
      ctx.save();
      ctx.translate(gate.pivotX, gate.pivotY);

      // Pivot bracket
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Gate arm
      const rad = gate.isOpen ? -Math.PI * 0.45 : gate.angle;
      ctx.rotate(rad);

      // Wooden gate beam
      const grad = ctx.createLinearGradient(-7, 0, 7, 0);
      grad.addColorStop(0, '#92400e');
      grad.addColorStop(0.5, '#b45309');
      grad.addColorStop(1, '#78350f');
      ctx.fillStyle = grad;

      this.roundRect(ctx, -7, 0, 14, gate.length, 3);
      ctx.fill();

      // Iron studs on gate
      ctx.fillStyle = '#1c1917';
      for (let y = 14; y < gate.length; y += 18) {
        ctx.beginPath();
        ctx.arc(0, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  private drawSeesaws(seesaws: SeesawMechanism[]) {
    const { ctx } = this;
    seesaws.forEach((seesaw) => {
      ctx.save();
      // Fulcrum triangle
      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.moveTo(seesaw.pivotX, seesaw.pivotY);
      ctx.lineTo(seesaw.pivotX - 16, seesaw.pivotY + 28);
      ctx.lineTo(seesaw.pivotX + 16, seesaw.pivotY + 28);
      ctx.closePath();
      ctx.fill();

      // Seesaw bar
      ctx.translate(seesaw.pivotX, seesaw.pivotY);
      ctx.rotate(seesaw.angle);

      const hw = seesaw.length / 2;
      const hh = 7;

      // Wooden bar
      const barGrad = ctx.createLinearGradient(0, -hh, 0, hh);
      barGrad.addColorStop(0, '#d97706');
      barGrad.addColorStop(0.5, '#b45309');
      barGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = barGrad;

      this.roundRect(ctx, -hw, -hh, seesaw.length, hh * 2, 4);
      ctx.fill();

      // Left catch tray
      ctx.fillStyle = '#92400e';
      this.roundRect(ctx, -hw - 4, -hh - 8, 16, 10, 2);
      ctx.fill();

      // Right counterweight box
      this.roundRect(ctx, hw - 12, -hh - 8, 16, 10, 2);
      ctx.fill();

      // Center brass pivot rivet
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    });
  }

  // 6. Placed Wooden Pieces
  private drawPieces(pieces: PlacedPiece[], options: RenderOptions) {
    const { ctx } = this;

    pieces.forEach((piece) => {
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate((piece.angle * Math.PI) / 180);

      const dims = this.getTypeDims(piece.type);
      const isSelected = piece.id === options.selectedPieceId;
      const isInvalid = piece.id === options.invalidPieceId;

      // 2.5D Drop shadow
      ctx.shadowColor = 'rgba(30, 20, 10, 0.4)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;

      if (piece.type === 'ROUND_LOG') {
        this.drawWoodLog(dims.radius || 17, isSelected, isInvalid);
      } else if (piece.type === 'INCLINE_RAMP') {
        this.drawInclineRamp(dims.width, dims.height, isSelected, isInvalid);
      } else {
        this.drawWoodPlank(dims.width, dims.height, isSelected, isInvalid, piece.type);
      }

      ctx.restore();
    });
  }

  // Tactile Wooden Plank with Wood Grain & Brass Screws
  private drawWoodPlank(
    width: number,
    height: number,
    isSelected: boolean,
    isInvalid: boolean,
    type: string
  ) {
    const { ctx } = this;
    const hw = width / 2;
    const hh = height / 2;

    // Wood base gradient
    const grad = ctx.createLinearGradient(0, -hh, 0, hh);
    if (isInvalid) {
      grad.addColorStop(0, '#f87171');
      grad.addColorStop(1, '#b91c1c');
    } else {
      grad.addColorStop(0, '#f59e0b'); // Warm honey oak
      grad.addColorStop(0.3, '#d97706');
      grad.addColorStop(0.7, '#b45309');
      grad.addColorStop(1, '#78350f');
    }
    ctx.fillStyle = grad;

    this.roundRect(ctx, -hw, -hh, width, height, 4);
    ctx.fill();

    // Wood grain lines
    ctx.save();
    ctx.strokeStyle = 'rgba(69, 26, 3, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-hw + 6, -hh + height * 0.35);
    ctx.bezierCurveTo(-hw * 0.3, -hh + height * 0.25, hw * 0.3, -hh + height * 0.45, hw - 6, -hh + height * 0.35);
    ctx.moveTo(-hw + 8, -hh + height * 0.65);
    ctx.bezierCurveTo(-hw * 0.2, -hh + height * 0.75, hw * 0.4, -hh + height * 0.55, hw - 8, -hh + height * 0.65);
    ctx.stroke();

    // Chamfered top highlight & bottom shadow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-hw + 3, -hh + 1.5);
    ctx.lineTo(hw - 3, -hh + 1.5);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.moveTo(-hw + 3, hh - 1.5);
    ctx.lineTo(hw - 3, hh - 1.5);
    ctx.stroke();
    ctx.restore();

    // Brass screw rivets on ends
    const rivetX = hw - 9;
    this.drawBrassRivet(-rivetX, 0);
    this.drawBrassRivet(rivetX, 0);

    // If Vertical post, draw middle rivet too
    if (type === 'VERTICAL_POST') {
      this.drawBrassRivet(0, 0);
    }

    // Selection border
    if (isSelected) {
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      this.roundRect(ctx, -hw - 2, -hh - 2, width + 4, height + 4, 6);
      ctx.stroke();
    }
  }

  // Round Wooden Log with Tree Growth Rings
  private drawWoodLog(radius: number, isSelected: boolean, isInvalid: boolean) {
    const { ctx } = this;

    // Outer bark gradient
    const barkGrad = ctx.createRadialGradient(0, 0, radius * 0.4, 0, 0, radius);
    if (isInvalid) {
      barkGrad.addColorStop(0, '#fca5a5');
      barkGrad.addColorStop(1, '#991b1b');
    } else {
      barkGrad.addColorStop(0, '#d97706'); // Sapwood
      barkGrad.addColorStop(0.7, '#b45309');
      barkGrad.addColorStop(0.9, '#92400e');
      barkGrad.addColorStop(1, '#451a03'); // Outer bark
    }
    ctx.fillStyle = barkGrad;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Tree rings
    ctx.strokeStyle = 'rgba(69, 26, 3, 0.35)';
    ctx.lineWidth = 1;
    [0.35, 0.6, 0.8].forEach((scale) => {
      ctx.beginPath();
      ctx.arc(0, 0, radius * scale, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Pith center dot
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Specular light arc
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 2, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();

    if (isSelected) {
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Incline Wedge Ramp
  private drawInclineRamp(width: number, height: number, isSelected: boolean, isInvalid: boolean) {
    const { ctx } = this;
    const hw = width / 2;
    const hh = height / 2;

    const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
    grad.addColorStop(0, '#ea580c');
    grad.addColorStop(1, '#9a3412');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(-hw, hh);
    ctx.lineTo(hw, hh);
    ctx.lineTo(hw, -hh);
    ctx.closePath();
    ctx.fill();

    // Smooth slope highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-hw, hh);
    ctx.lineTo(hw, -hh);
    ctx.stroke();

    if (isSelected) {
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  private drawBrassRivet(x: number, y: number) {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x, y, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Rivet center slit
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 2, y);
    ctx.lineTo(x + 2, y);
    ctx.stroke();
    ctx.restore();
  }

  // 7. Dynamic Logs
  private drawDynamicLogs(logs: DynamicLog[]) {
    const { ctx } = this;

    logs.forEach((log) => {
      ctx.save();
      ctx.translate(log.x, log.y);
      ctx.rotate(log.angle);

      // Shadow
      ctx.shadowColor = 'rgba(30, 20, 10, 0.45)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;

      this.drawWoodLog(log.radius, false, false);
      ctx.restore();
    });
  }

  // 8. Watermills / Wheels
  private drawMills(mills: WaterMillTarget[], animTime: number) {
    const { ctx } = this;

    mills.forEach((mill) => {
      ctx.save();
      ctx.translate(mill.x, mill.y);

      // Mill Support Scaffolding (behind wheel)
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(-24, mill.radius + 30);
      ctx.lineTo(-14, mill.radius + 30);
      ctx.lineTo(-10, 0);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(24, mill.radius + 30);
      ctx.lineTo(14, mill.radius + 30);
      ctx.lineTo(10, 0);
      ctx.fill();

      // Rotate wheel
      ctx.rotate(mill.angle);

      // Outer wooden rim
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, mill.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Rim bevel
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, mill.radius + 3, 0, Math.PI * 2);
      ctx.stroke();

      // 8 Paddle blades
      const paddles = mill.paddles || 8;
      const angleStep = (Math.PI * 2) / paddles;

      for (let i = 0; i < paddles; i++) {
        const a = i * angleStep;
        ctx.save();
        ctx.rotate(a);

        // Paddle wooden blade
        const bladeGrad = ctx.createLinearGradient(0, 0, 0, -mill.radius - 8);
        bladeGrad.addColorStop(0, '#92400e');
        bladeGrad.addColorStop(1, '#d97706');
        ctx.fillStyle = bladeGrad;

        this.roundRect(ctx, -5, -mill.radius - 8, 10, 16, 2);
        ctx.fill();

        // Water catching cup groove
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(-3, -mill.radius - 6, 6, 3);

        // Wooden spoke connecting to center hub
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -mill.radius);
        ctx.stroke();

        ctx.restore();
      }

      // Center Brass Hub & Pin
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Turns Progress Ring indicator above mill
      ctx.save();
      const progress = Math.min(1, mill.currentTurns / mill.requiredTurns);
      const isComplete = mill.currentTurns >= mill.requiredTurns;

      // Gauge background badge
      ctx.fillStyle = isComplete ? '#10b981' : '#1e293b';
      ctx.beginPath();
      ctx.arc(mill.x, mill.y - mill.radius - 18, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Progress arc
      ctx.strokeStyle = isComplete ? '#34d399' : '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        mill.x,
        mill.y - mill.radius - 18,
        14,
        -Math.PI / 2,
        -Math.PI / 2 + progress * Math.PI * 2
      );
      ctx.stroke();

      // Turn count text
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${Math.floor(mill.currentTurns)}/${mill.requiredTurns}`,
        mill.x,
        mill.y - mill.radius - 14
      );
      ctx.restore();
    });
  }

  // 9. Brass Bell Target
  private drawBells(bells: BellTarget[]) {
    const { ctx } = this;

    bells.forEach((bell) => {
      ctx.save();
      ctx.translate(bell.x, bell.y - 12);
      ctx.rotate(bell.swingAngle);

      // Brass bell suspension bracket
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-4, -8, 8, 8);

      // Bell dome gradient
      const bellGrad = ctx.createLinearGradient(-18, 0, 18, 26);
      bellGrad.addColorStop(0, '#fef08a');
      bellGrad.addColorStop(0.3, '#f59e0b');
      bellGrad.addColorStop(0.8, '#d97706');
      bellGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = bellGrad;

      // Bell shape
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.bezierCurveTo(-14, 8, -20, 18, -20, 24);
      ctx.lineTo(20, 24);
      ctx.bezierCurveTo(20, 18, 14, 8, 6, 0);
      ctx.closePath();
      ctx.fill();

      // Bottom flared rim
      ctx.fillStyle = '#b45309';
      this.roundRect(ctx, -22, 22, 44, 6, 3);
      ctx.fill();

      // Clapper ball
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(0, 28, 5, 0, Math.PI * 2);
      ctx.fill();

      // Shimmer reflection
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-8, 12, 10, -Math.PI * 0.4, -Math.PI * 0.1);
      ctx.stroke();

      ctx.restore();

      // Radiant sound waves if struck
      if (bell.hit && Math.abs(bell.swingAngle) > 0.05) {
        ctx.save();
        ctx.strokeStyle = '#f59e0b80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bell.x, bell.y, bell.radius + 12, -Math.PI * 0.7, -Math.PI * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(bell.x, bell.y, bell.radius + 20, -Math.PI * 0.7, -Math.PI * 0.3);
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  // 10. Water Particles
  private drawWaterParticles(particles: WaterParticle[]) {
    const { ctx } = this;
    if (particles.length === 0) return;

    ctx.save();
    particles.forEach((p) => {
      // Glow translucent drop
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#7dd3fc');
      grad.addColorStop(0.8, '#0284c7');
      grad.addColorStop(1, '#0369a1');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // 11. Splashes
  private drawSplashes(splashes: SplashParticle[]) {
    const { ctx } = this;
    if (splashes.length === 0) return;

    ctx.save();
    splashes.forEach((s) => {
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // 12. Selection & Rotation Ring Controls
  private drawSelectionControls(piece: PlacedPiece, animTime: number) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(piece.x, piece.y);

    const dims = this.getTypeDims(piece.type);
    const ringRadius = Math.max(dims.width / 2 + 20, 48);

    // Subtle rotation halo ring
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Rotation Handle along piece angle
    const rad = (piece.angle * Math.PI) / 180;
    const handleX = Math.cos(rad) * ringRadius;
    const handleY = Math.sin(rad) * ringRadius;

    // Handle line
    ctx.setLineDash([]);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(handleX, handleY);
    ctx.stroke();

    // Rotation circular grip handle
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(handleX, handleY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rotate icon arrows
    ctx.fillStyle = '#451a03';
    ctx.font = '700 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('↻', handleX, handleY + 4);

    // Degree badge above piece
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.roundRect(ctx, -24, -ringRadius - 26, 48, 20, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(piece.angle)}°`, 0, -ringRadius - 12);

    ctx.restore();
  }

  private getTypeDims(type: string): { width: number; height: number; radius?: number } {
    switch (type) {
      case 'LONG_PLANK':
        return { width: 140, height: 16 };
      case 'SHORT_PLANK':
        return { width: 80, height: 16 };
      case 'VERTICAL_POST':
        return { width: 20, height: 90 };
      case 'ROUND_LOG':
        return { width: 34, height: 34, radius: 17 };
      case 'INCLINE_RAMP':
        return { width: 110, height: 22 };
      case 'WATER_WHEEL':
        return { width: 76, height: 76, radius: 38 };
      case 'PLATFORM':
        return { width: 110, height: 18 };
      case 'SEESAW':
        return { width: 130, height: 14 };
      case 'HINGED_GATE':
        return { width: 16, height: 75 };
      case 'LOCK_PIN':
        return { width: 16, height: 40 };
      default:
        return { width: 80, height: 16 };
    }
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number | number[]
  ) {
    if (typeof r === 'number') {
      r = [r, r, r, r];
    }
    const [tl, tr, br, bl] = r;
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
    ctx.lineTo(x + w, y + h - br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    ctx.lineTo(x + bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
    ctx.lineTo(x, y + tl);
    ctx.quadraticCurveTo(x, y, x + tl, y);
    ctx.closePath();
  }
}
