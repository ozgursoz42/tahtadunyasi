/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LEVELS } from './game/levels';
import { PieceType, PlacedPiece } from './game/types';
import { TopBar } from './components/TopBar';
import { GameCanvas } from './components/GameCanvas';
import { InventoryTray } from './components/InventoryTray';
import { SimulationControls } from './components/SimulationControls';
import { VictoryModal, LevelSelectModal, HelpModal } from './components/Modals';
import { sound } from './game/audio';

export default function App() {
  // Current active level
  const [currentLevelId, setCurrentLevelId] = useState<number>(() => {
    const saved = localStorage.getItem('tahta_current_level');
    return saved ? Math.min(Math.max(1, parseInt(saved, 10)), LEVELS.length) : 1;
  });

  const level = useMemo(() => {
    return LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];
  }, [currentLevelId]);

  // Placed pieces on stage
  const [placedPieces, setPlacedPieces] = useState<PlacedPiece[]>([]);

  // Selected piece
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  // Simulation run state & speed
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);

  // Hints
  const [showHints, setShowHints] = useState<boolean>(false);
  const [availableHints, setAvailableHints] = useState<number>(() => {
    const saved = localStorage.getItem('tahta_hints_count');
    return saved !== null ? parseInt(saved, 10) : 3;
  });

  // Progression & Stars storage
  const [levelStars, setLevelStars] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem('tahta_stars_record');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState<number>(() => {
    const saved = localStorage.getItem('tahta_unlocked_level');
    return saved ? Math.max(1, parseInt(saved, 10)) : 1;
  });

  // Modals state
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);
  const [victoryStars, setVictoryStars] = useState<number>(1);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Load level initial configuration
  useEffect(() => {
    // Reset simulation
    setIsSimulating(false);
    setSelectedPieceId(null);
    setShowHints(false);

    // If level has pre-placed pieces
    const initialPieces: PlacedPiece[] = (level.preplacedPieces || []).map((p) => ({
      ...p,
      id: p.id || `pre_${Math.random().toString(36).substring(2, 7)}`,
      initialX: p.x,
      initialY: p.y,
      initialAngle: p.angle,
    }));
    setPlacedPieces(initialPieces);

    localStorage.setItem('tahta_current_level', String(currentLevelId));
  }, [currentLevelId, level]);

  // Compute remaining inventory counts
  const availableCounts = useMemo(() => {
    const counts: Partial<Record<PieceType, number>> = { ...level.availablePieces };

    placedPieces.forEach((p) => {
      // Don't deduct pre-placed pieces if locked
      if (!p.isLocked && counts[p.type] !== undefined) {
        counts[p.type] = Math.max(0, (counts[p.type] || 0) - 1);
      }
    });

    return counts;
  }, [level.availablePieces, placedPieces]);

  // Spawn new piece from inventory into arena center
  const handleSpawnPiece = useCallback((type: PieceType) => {
    if (isSimulating) return;

    // Default spawn coordinate (center of arena with slight variation)
    const spawnX = 240 + (Math.random() - 0.5) * 40;
    const spawnY = 280 + (Math.random() - 0.5) * 40;

    // Check if there is a matching guide slot that doesn't have a piece yet
    let targetX = spawnX;
    let targetY = spawnY;
    let targetAngle = 0;

    const unfilledSlot = level.guideSlots.find(
      (slot) => slot.type === type && !placedPieces.some((p) => Math.hypot(p.x - slot.x, p.y - slot.y) < 25)
    );

    if (unfilledSlot) {
      targetX = unfilledSlot.x;
      targetY = unfilledSlot.y;
      targetAngle = unfilledSlot.angle;
    }

    const newPiece: PlacedPiece = {
      id: `piece_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      x: targetX,
      y: targetY,
      angle: targetAngle,
      initialX: targetX,
      initialY: targetY,
      initialAngle: targetAngle,
    };

    setPlacedPieces((prev) => [...prev, newPiece]);
    setSelectedPieceId(newPiece.id);
    sound.playWoodSnap();
  }, [isSimulating, level.guideSlots, placedPieces]);

  // Update piece position or angle
  const handleUpdatePiece = useCallback((updated: PlacedPiece) => {
    setPlacedPieces((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  // Remove selected piece back to inventory
  const handleDeleteSelected = useCallback(() => {
    if (!selectedPieceId || isSimulating) return;
    setPlacedPieces((prev) => prev.filter((p) => p.id !== selectedPieceId));
    setSelectedPieceId(null);
  }, [selectedPieceId, isSimulating]);

  // Clear all pieces
  const handleClearAll = useCallback(() => {
    if (isSimulating) return;
    sound.playTrash();
    setPlacedPieces((level.preplacedPieces || []).map((p) => ({ ...p })));
    setSelectedPieceId(null);
  }, [isSimulating, level.preplacedPieces]);

  // Rotate selected piece by degrees
  const handleRotateSelected = useCallback((degrees: number) => {
    if (!selectedPieceId || isSimulating) return;
    setPlacedPieces((prev) =>
      prev.map((p) => {
        if (p.id === selectedPieceId) {
          const newAngle = (p.angle + degrees) % 360;
          return { ...p, angle: newAngle };
        }
        return p;
      })
    );
  }, [selectedPieceId, isSimulating]);

  // Toggle simulate
  const handleToggleSimulate = useCallback(() => {
    setIsSimulating((prev) => {
      const next = !prev;
      if (!next) {
        // Return pieces to their initial build positions
        setPlacedPieces((current) =>
          current.map((p) => ({
            ...p,
            x: p.initialX,
            y: p.initialY,
            angle: p.initialAngle,
          }))
        );
      } else {
        // Store initial positions before run starts
        setPlacedPieces((current) =>
          current.map((p) => ({
            ...p,
            initialX: p.x,
            initialY: p.y,
            initialAngle: p.angle,
          }))
        );
      }
      return next;
    });
  }, []);

  // Toggle speed
  const handleToggleSpeed = useCallback(() => {
    setSimSpeed((prev) => (prev === 1 ? 2 : 1));
  }, []);

  // Reset level
  const handleResetLevel = useCallback(() => {
    sound.playWoodClick();
    setIsSimulating(false);
    setSelectedPieceId(null);
    setPlacedPieces((level.preplacedPieces || []).map((p) => ({ ...p })));
  }, [level.preplacedPieces]);

  // Toggle Hints
  const handleToggleHint = useCallback(() => {
    if (showHints) {
      setShowHints(false);
    } else {
      if (availableHints > 0) {
        setShowHints(true);
        setAvailableHints((prev) => {
          const next = Math.max(0, prev - 1);
          localStorage.setItem('tahta_hints_count', String(next));
          return next;
        });
        sound.playWoodSnap();
      } else {
        sound.playWoodClick(0.6);
      }
    }
  }, [showHints, availableHints]);

  // Level Won
  const handleLevelWon = useCallback((stars: number) => {
    setVictoryStars(stars);
    setIsVictoryOpen(true);

    // Save stars
    setLevelStars((prev) => {
      const updated = {
        ...prev,
        [currentLevelId]: Math.max(prev[currentLevelId] || 0, stars),
      };
      localStorage.setItem('tahta_stars_record', JSON.stringify(updated));
      return updated;
    });

    // Unlock next level
    if (currentLevelId >= highestUnlockedLevel && currentLevelId < LEVELS.length) {
      const nextUnlocked = currentLevelId + 1;
      setHighestUnlockedLevel(nextUnlocked);
      localStorage.setItem('tahta_unlocked_level', String(nextUnlocked));
    }
  }, [currentLevelId, highestUnlockedLevel]);

  // Next level navigation
  const handleNextLevel = useCallback(() => {
    setIsVictoryOpen(false);
    if (currentLevelId < LEVELS.length) {
      setCurrentLevelId((prev) => prev + 1);
    }
  }, [currentLevelId]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-[#140b05] text-amber-50">
      {/* Outer Mobile Frame Container (Responsive 9:16) */}
      <main className="w-full h-screen max-w-[480px] max-h-[920px] flex flex-col justify-between overflow-hidden shadow-2xl relative bg-[#241308] border-x border-[#452712]">
        {/* 1. Ergonomic Top Bar */}
        <TopBar
          level={level}
          earnedStars={levelStars[level.id] || 0}
          availableHints={availableHints}
          onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
          onResetLevel={handleResetLevel}
          onToggleHint={handleToggleHint}
          onOpenHelp={() => setIsHelpOpen(true)}
          showHints={showHints}
          isSimulating={isSimulating}
        />

        {/* 2. Central Playing Arena (Canvas) */}
        <GameCanvas
          level={level}
          placedPieces={placedPieces}
          isSimulating={isSimulating}
          simSpeed={simSpeed}
          showHints={showHints}
          selectedPieceId={selectedPieceId}
          onSelectPiece={setSelectedPieceId}
          onUpdatePiece={handleUpdatePiece}
          onRemovePiece={handleDeleteSelected}
          onLevelWon={handleLevelWon}
        />

        {/* 3. Bottom Simulation Controls (Run / Rotate / Delete) */}
        <SimulationControls
          isSimulating={isSimulating}
          simSpeed={simSpeed}
          hasSelectedPiece={selectedPieceId !== null}
          onToggleSimulate={handleToggleSimulate}
          onToggleSpeed={handleToggleSpeed}
          onRotateSelected={handleRotateSelected}
          onDeleteSelected={handleDeleteSelected}
          onClearAll={handleClearAll}
        />

        {/* 4. Horizontal Wooden Piece Inventory Tray */}
        <InventoryTray
          availableCounts={availableCounts}
          selectedPieceType={
            selectedPieceId
              ? placedPieces.find((p) => p.id === selectedPieceId)?.type || null
              : null
          }
          onSelectPieceType={() => {}}
          onSpawnPiece={handleSpawnPiece}
          isSimulating={isSimulating}
        />

        {/* Victory Modal */}
        <VictoryModal
          isOpen={isVictoryOpen}
          level={level}
          stars={victoryStars}
          piecesUsed={placedPieces.length}
          onNextLevel={handleNextLevel}
          onReplay={() => {
            setIsVictoryOpen(false);
            handleResetLevel();
          }}
        />

        {/* Level Select Modal */}
        <LevelSelectModal
          isOpen={isLevelSelectOpen}
          levels={LEVELS}
          currentLevelId={currentLevelId}
          highestUnlockedLevel={highestUnlockedLevel}
          levelStars={levelStars}
          onSelectLevel={setCurrentLevelId}
          onClose={() => setIsLevelSelectOpen(false)}
        />

        {/* Help & Guide Modal */}
        <HelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      </main>
    </div>
  );
}
