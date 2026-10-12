/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ARENA_HEIGHT, ARENA_WIDTH, PhysicsEngine } from '../game/physics';
import { GameRenderer } from '../game/renderer';
import { LevelDefinition, PieceType, PlacedPiece } from '../game/types';
import { sound } from '../game/audio';

interface GameCanvasProps {
  level: LevelDefinition;
  placedPieces: PlacedPiece[];
  isSimulating: boolean;
  simSpeed: number;
  showHints: boolean;
  selectedPieceId: string | null;
  onSelectPiece: (id: string | null) => void;
  onUpdatePiece: (updated: PlacedPiece) => void;
  onRemovePiece: (id: string) => void;
  onLevelWon: (stars: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  placedPieces,
  isSimulating,
  simSpeed,
  showHints,
  selectedPieceId,
  onSelectPiece,
  onUpdatePiece,
  onRemovePiece,
  onLevelWon,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const physicsRef = useRef<PhysicsEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  const [invalidPieceId, setInvalidPieceId] = useState<string | null>(null);
  const [levelCompleted, setLevelCompleted] = useState<boolean>(false);

  // Drag interaction state
  const dragRef = useRef<{
    isDragging: boolean;
    isRotating: boolean;
    targetPieceId: string | null;
    startX: number;
    startY: number;
    pieceStartX: number;
    pieceStartY: number;
    pieceStartAngle: number;
  }>({
    isDragging: false,
    isRotating: false,
    targetPieceId: null,
    startX: 0,
    startY: 0,
    pieceStartX: 0,
    pieceStartY: 0,
    pieceStartAngle: 0,
  });

  // Re-initialize physics when level or pieces change
  useEffect(() => {
    if (!physicsRef.current) {
      physicsRef.current = new PhysicsEngine(level, placedPieces);
    } else {
      physicsRef.current.reset(level, placedPieces);
    }
    setLevelCompleted(false);
  }, [level, placedPieces]);

  // Handle simulation start/stop
  useEffect(() => {
    if (physicsRef.current) {
      physicsRef.current.setSimulating(isSimulating);
    }
  }, [isSimulating]);

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new GameRenderer(ctx);

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const rawDt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const dt = rawDt * (isSimulating ? simSpeed : 1.0);

      if (physicsRef.current && rendererRef.current) {
        // Update physics
        if (isSimulating) {
          physicsRef.current.update(dt);

          // Check win conditions
          const state = physicsRef.current.state;
          let isWon = false;

          if (level.goal.type === 'SPIN_MILL') {
            const allMillsReady = state.mills.length > 0 && state.mills.every((m) => m.currentTurns >= m.requiredTurns);
            if (allMillsReady) {
              isWon = true;
            }
          } else if (level.goal.type === 'RING_BELL') {
            const allBellsHit = state.bells.length > 0 && state.bells.every((b) => b.hit);
            if (allBellsHit) {
              isWon = true;
            }
          } else if (level.goal.type === 'DUAL_MILLS') {
            const allComplete = state.mills.length > 0 && state.mills.every((m) => m.currentTurns >= m.requiredTurns);
            if (allComplete) {
              isWon = true;
            }
          } else if (level.goal.type === 'COMBO') {
            const millsDone = state.mills.length === 0 || state.mills.every((m) => m.currentTurns >= m.requiredTurns);
            const bellsDone = state.bells.length === 0 || state.bells.every((b) => b.hit);
            if (millsDone && bellsDone) {
              isWon = true;
            }
          }

          if (isWon && !levelCompleted) {
            setLevelCompleted(true);
            sound.playVictory();
            // Calculate stars
            const piecesUsed = placedPieces.length;
            let stars = 1;
            if (piecesUsed <= level.maxPiecesFor3Stars) {
              stars = 3;
            } else if (piecesUsed <= level.maxPiecesFor3Stars + 1) {
              stars = 2;
            }
            onLevelWon(stars);
          }
        }

        // Render frame
        const pState = physicsRef.current.state;
        rendererRef.current.render(
          level,
          placedPieces,
          pState.waterParticles,
          pState.dynamicLogs,
          pState.mills,
          pState.bells,
          pState.seesaws,
          pState.gates,
          pState.splashParticles,
          {
            selectedPieceId,
            draggedPieceId: dragRef.current.isDragging ? dragRef.current.targetPieceId : null,
            isSimulating,
            showHints,
            invalidPieceId,
            animTime: currentTime / 1000,
          }
        );
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    level,
    placedPieces,
    isSimulating,
    simSpeed,
    showHints,
    selectedPieceId,
    invalidPieceId,
    levelCompleted,
    onLevelWon,
  ]);

  // Convert screen touch/mouse client coordinates into logical (480x720) canvas coordinates
  const getCanvasCoords = useCallback((clientX: number, clientY: number): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = ARENA_WIDTH / rect.width;
    const scaleY = ARENA_HEIGHT / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // Pointer / Touch Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isSimulating) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords) return;

    // Check if clicked rotation handle of selected piece
    if (selectedPieceId) {
      const selected = placedPieces.find((p) => p.id === selectedPieceId);
      if (selected) {
        const ringRadius = Math.max(getPieceRadius(selected.type) + 20, 48);
        const rad = (selected.angle * Math.PI) / 180;
        const handleX = selected.x + Math.cos(rad) * ringRadius;
        const handleY = selected.y + Math.sin(rad) * ringRadius;

        const distToHandle = Math.hypot(coords.x - handleX, coords.y - handleY);
        if (distToHandle <= 24) {
          dragRef.current = {
            isDragging: false,
            isRotating: true,
            targetPieceId: selected.id,
            startX: coords.x,
            startY: coords.y,
            pieceStartX: selected.x,
            pieceStartY: selected.y,
            pieceStartAngle: selected.angle,
          };
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          sound.playWoodSnap();
          return;
        }
      }
    }

    // Check if clicked any placed piece (top-most first)
    for (let i = placedPieces.length - 1; i >= 0; i--) {
      const piece = placedPieces[i];
      if (isPointInsidePiece(coords.x, coords.y, piece)) {
        onSelectPiece(piece.id);
        dragRef.current = {
          isDragging: true,
          isRotating: false,
          targetPieceId: piece.id,
          startX: coords.x,
          startY: coords.y,
          pieceStartX: piece.x,
          pieceStartY: piece.y,
          pieceStartAngle: piece.angle,
        };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        sound.playWoodClick(1.0);
        return;
      }
    }

    // Clicked empty area -> deselect
    onSelectPiece(null);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.targetPieceId) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords) return;

    const piece = placedPieces.find((p) => p.id === dragRef.current.targetPieceId);
    if (!piece) return;

    if (dragRef.current.isRotating) {
      // Calculate angle from piece center to current pointer
      const dx = coords.x - piece.x;
      const dy = coords.y - piece.y;
      let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (angleDeg < 0) angleDeg += 360;

      // Magnetic angle snapping to 15-degree steps
      const snapStep = 15;
      const snapped = Math.round(angleDeg / snapStep) * snapStep;
      if (Math.abs(angleDeg - snapped) < 4) {
        angleDeg = snapped;
      }

      onUpdatePiece({
        ...piece,
        angle: angleDeg,
      });
    } else if (dragRef.current.isDragging) {
      const dx = coords.x - dragRef.current.startX;
      const dy = coords.y - dragRef.current.startY;

      let newX = dragRef.current.pieceStartX + dx;
      let newY = dragRef.current.pieceStartY + dy;

      // Magnetic snap to guide slots if close
      for (const slot of level.guideSlots) {
        if (slot.type === piece.type) {
          const dist = Math.hypot(newX - slot.x, newY - slot.y);
          if (dist < 28) {
            newX = slot.x;
            newY = slot.y;
            break;
          }
        }
      }

      // Clamp to arena bounds
      newX = Math.max(25, Math.min(ARENA_WIDTH - 25, newX));
      newY = Math.max(30, Math.min(ARENA_HEIGHT - 30, newY));

      onUpdatePiece({
        ...piece,
        x: newX,
        y: newY,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current.targetPieceId) {
      sound.playWoodClick(0.9);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }
    dragRef.current = {
      isDragging: false,
      isRotating: false,
      targetPieceId: null,
      startX: 0,
      startY: 0,
      pieceStartX: 0,
      pieceStartY: 0,
      pieceStartAngle: 0,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full flex items-center justify-center overflow-hidden bg-[#1f140c] select-none touch-none"
    >
      <canvas
        ref={canvasRef}
        width={ARENA_WIDTH}
        height={ARENA_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full max-w-[500px] max-h-[750px] object-contain shadow-2xl rounded-none md:rounded-lg cursor-crosshair border-x border-[#3b2210]"
        style={{
          aspectRatio: '480/720',
        }}
      />
    </div>
  );
};

// Hit-test point inside oriented piece
function isPointInsidePiece(px: number, py: number, piece: PlacedPiece): boolean {
  const rad = (piece.angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const dx = px - piece.x;
  const dy = py - piece.y;
  const localX = cos * dx + sin * dy;
  const localY = -sin * dx + cos * dy;

  if (piece.type === 'ROUND_LOG') {
    return Math.hypot(dx, dy) <= 22;
  }

  const { w, h } = getPieceBoundingDims(piece.type);
  return Math.abs(localX) <= w / 2 + 10 && Math.abs(localY) <= h / 2 + 10;
}

function getPieceRadius(type: PieceType): number {
  switch (type) {
    case 'LONG_PLANK':
      return 70;
    case 'SHORT_PLANK':
      return 40;
    case 'VERTICAL_POST':
      return 45;
    case 'ROUND_LOG':
      return 18;
    case 'INCLINE_RAMP':
      return 55;
    case 'SEESAW':
      return 65;
    default:
      return 40;
  }
}

function getPieceBoundingDims(type: PieceType): { w: number; h: number } {
  switch (type) {
    case 'LONG_PLANK':
      return { w: 140, h: 22 };
    case 'SHORT_PLANK':
      return { w: 80, h: 22 };
    case 'VERTICAL_POST':
      return { w: 24, h: 90 };
    case 'ROUND_LOG':
      return { w: 36, h: 36 };
    case 'INCLINE_RAMP':
      return { w: 110, h: 26 };
    case 'SEESAW':
      return { w: 130, h: 20 };
    default:
      return { w: 90, h: 20 };
  }
}
