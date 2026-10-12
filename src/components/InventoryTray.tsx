/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PIECE_CATALOG } from '../game/levels';
import { PieceType } from '../game/types';
import { sound } from '../game/audio';

interface InventoryTrayProps {
  availableCounts: Partial<Record<PieceType, number>>;
  selectedPieceType: PieceType | null;
  onSelectPieceType: (type: PieceType) => void;
  onSpawnPiece: (type: PieceType) => void;
  isSimulating: boolean;
}

export const InventoryTray: React.FC<InventoryTrayProps> = ({
  availableCounts,
  selectedPieceType,
  onSelectPieceType,
  onSpawnPiece,
  isSimulating,
}) => {
  const pieceTypes = Object.keys(availableCounts) as PieceType[];

  const handlePieceClick = (type: PieceType) => {
    if (isSimulating) return;
    const remaining = availableCounts[type] || 0;
    if (remaining <= 0) {
      sound.playWoodClick(0.6);
      return;
    }
    sound.playWoodClick(1.2);
    onSelectPieceType(type);
    onSpawnPiece(type);
  };

  return (
    <div className="w-full bg-[#29180d] border-t-2 border-[#543319] px-2 py-2 shadow-inner">
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
          AHŞAP ENVANTERİ
        </span>
        <span className="text-[10px] text-amber-400/80">
          {isSimulating ? 'Simülasyon çalışıyor (Parçalar kilitli)' : 'Alana yerleştirmek için dokunun'}
        </span>
      </div>

      {/* Horizontal Tray of Pieces */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {pieceTypes.map((type) => {
          const info = PIECE_CATALOG[type];
          if (!info) return null;
          const count = availableCounts[type] || 0;
          const isSelected = selectedPieceType === type;
          const isDepleted = count <= 0;

          return (
            <button
              key={type}
              onClick={() => handlePieceClick(type)}
              disabled={isSimulating || isDepleted}
              className={`flex flex-col items-center justify-between min-w-[78px] h-[82px] p-1.5 rounded-xl border-2 transition-all relative shrink-0 ${
                isDepleted
                  ? 'opacity-40 bg-[#1c1209] border-[#382010] cursor-not-allowed'
                  : isSelected
                  ? 'bg-[#5c3519] border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)] scale-[1.02]'
                  : 'bg-[#3b2210] border-[#663b19] hover:bg-[#4d2c14] hover:border-[#854d20] active:scale-95'
              }`}
            >
              {/* Badge for remaining count */}
              <span
                className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-md text-[10px] font-black leading-none border ${
                  isDepleted
                    ? 'bg-red-950 text-red-300 border-red-800'
                    : count === 1
                    ? 'bg-amber-900 text-amber-200 border-amber-600'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}
              >
                {count > 90 ? '∞' : `x${count}`}
              </span>

              {/* Graphic Preview */}
              <div className="flex items-center justify-center w-full h-10 mt-1">
                {renderPiecePreview(type)}
              </div>

              {/* Piece Name */}
              <span className="text-[10px] font-bold text-amber-100 text-center leading-tight mt-1 truncate max-w-full">
                {info.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Mini SVG preview icons for each wooden piece
function renderPiecePreview(type: PieceType) {
  switch (type) {
    case 'LONG_PLANK':
      return (
        <div className="w-14 h-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-sm border border-amber-400 shadow-sm flex items-center justify-between px-1">
          <div className="w-1 h-1 rounded-full bg-amber-900" />
          <div className="w-1 h-1 rounded-full bg-amber-900" />
        </div>
      );
    case 'SHORT_PLANK':
      return (
        <div className="w-9 h-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-sm border border-amber-400 shadow-sm flex items-center justify-between px-0.5">
          <div className="w-1 h-1 rounded-full bg-amber-900" />
          <div className="w-1 h-1 rounded-full bg-amber-900" />
        </div>
      );
    case 'VERTICAL_POST':
      return (
        <div className="w-2.5 h-8 bg-gradient-to-b from-amber-700 via-amber-600 to-amber-800 rounded-sm border border-amber-500 shadow-sm flex flex-col items-center justify-between py-1">
          <div className="w-1 h-1 rounded-full bg-amber-950" />
          <div className="w-1 h-1 rounded-full bg-amber-950" />
        </div>
      );
    case 'ROUND_LOG':
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 border-2 border-amber-400 shadow-sm flex items-center justify-center">
          <div className="w-3 h-3 rounded-full border border-amber-800/80 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-amber-950" />
          </div>
        </div>
      );
    case 'INCLINE_RAMP':
      return (
        <svg width="40" height="20" viewBox="0 0 40 20" className="overflow-visible">
          <polygon points="2,18 38,18 38,2" fill="#ea580c" stroke="#f97316" strokeWidth="1.5" />
          <line x1="2" y1="18" x2="38" y2="2" stroke="#ffedd5" strokeWidth="1" />
        </svg>
      );
    case 'WATER_WHEEL':
      return (
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 bg-amber-800/50 flex items-center justify-center relative animate-[spin_8s_linear_infinite]">
          <div className="w-full h-0.5 bg-amber-400 absolute" />
          <div className="h-full w-0.5 bg-amber-400 absolute" />
          <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-900 z-10" />
        </div>
      );
    case 'SEESAW':
      return (
        <div className="flex flex-col items-center">
          <div className="w-12 h-2 bg-gradient-to-r from-amber-600 to-amber-700 rounded-sm border border-amber-400 -rotate-6" />
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-stone-400" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-3 bg-amber-600 rounded-sm border border-amber-400" />
      );
  }
}
