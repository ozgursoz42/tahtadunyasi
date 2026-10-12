/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PieceType =
  | 'LONG_PLANK'     // Uzun tahta (140x18)
  | 'SHORT_PLANK'    // Kısa tahta (80x18)
  | 'VERTICAL_POST'  // Dikey ahşap direk (20x90)
  | 'ROUND_LOG'      // Yuvarlak kütük (r=18)
  | 'INCLINE_RAMP'   // Eğik rampa (120x24)
  | 'WATER_WHEEL'    // Döner çark (r=38)
  | 'PLATFORM'       // Geniş platform (110x20)
  | 'SEESAW'         // Denge ağırlığı / kaldıraç (130x16)
  | 'HINGED_GATE'    // Hareketli eklem / kapı (16x80)
  | 'LOCK_PIN';      // Kilitleme pimi

export interface PieceInfo {
  type: PieceType;
  name: string;
  shortDesc: string;
  width: number;
  height: number;
  radius?: number;
  color: string;
  iconType: string;
}

export interface PlacedPiece {
  id: string;
  type: PieceType;
  x: number;
  y: number;
  angle: number; // degrees 0-360
  initialX: number;
  initialY: number;
  initialAngle: number;
  isLocked?: boolean;
}

export interface GuideSlot {
  x: number;
  y: number;
  angle: number;
  type: PieceType;
  label?: string;
}

export interface StaticRock {
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
  borderRadius?: number;
  label?: string;
}

export interface WaterSource {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rate: number; // drops per second
}

export interface WaterMillTarget {
  id: string;
  x: number;
  y: number;
  radius: number;
  requiredTurns: number;
  currentTurns: number;
  angle: number;
  angularVelocity: number;
  paddles: number;
}

export interface BellTarget {
  id: string;
  x: number;
  y: number;
  radius: number;
  hit: boolean;
  swingAngle: number;
}

export interface SeesawMechanism {
  id: string;
  pivotX: number;
  pivotY: number;
  length: number;
  angle: number; // current angle in radians
  angularVelocity: number;
  minAngle: number;
  maxAngle: number;
  leftWeight: number;
  rightWeight: number;
}

export interface GateMechanism {
  id: string;
  pivotX: number;
  pivotY: number;
  length: number;
  angle: number;
  isOpen: boolean;
  linkedTriggerId?: string; // id of seesaw or bell that opens it
}

export interface LevelGoal {
  type: 'SPIN_MILL' | 'RING_BELL' | 'DUAL_MILLS' | 'COMBO';
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  isComplete: boolean;
}

export interface LevelDefinition {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  availablePieces: Partial<Record<PieceType, number>>;
  waterSource?: WaterSource;
  secondaryWaterSource?: WaterSource;
  mills: WaterMillTarget[];
  bells: BellTarget[];
  seesaws?: SeesawMechanism[];
  gates?: GateMechanism[];
  rocks: StaticRock[];
  preplacedPieces?: PlacedPiece[];
  guideSlots: GuideSlot[];
  hints: string[];
  goal: LevelGoal;
  maxPiecesFor3Stars: number;
}

export interface WaterParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  hasPowered?: boolean;
}

export interface DynamicLog {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  angularVelocity: number;
  initialX: number;
  initialY: number;
}

export interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

export type SimState = 'BUILDING' | 'RUNNING' | 'PAUSED' | 'WON' | 'FAILED';
