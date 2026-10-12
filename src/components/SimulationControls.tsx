/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCw, Trash2, FastForward, Undo2, RefreshCw } from 'lucide-react';
import { sound } from '../game/audio';

interface SimulationControlsProps {
  isSimulating: boolean;
  simSpeed: number;
  hasSelectedPiece: boolean;
  onToggleSimulate: () => void;
  onToggleSpeed: () => void;
  onRotateSelected: (degrees: number) => void;
  onDeleteSelected: () => void;
  onClearAll: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isSimulating,
  simSpeed,
  hasSelectedPiece,
  onToggleSimulate,
  onToggleSpeed,
  onRotateSelected,
  onDeleteSelected,
  onClearAll,
}) => {
  const handleSimToggle = () => {
    sound.playRunStart();
    onToggleSimulate();
  };

  const handleRotate = (deg: number) => {
    sound.playWoodSnap();
    onRotateSelected(deg);
  };

  const handleDelete = () => {
    sound.playTrash();
    onDeleteSelected();
  };

  return (
    <div className="w-full bg-[#201309] border-t border-[#452712] px-3 py-2 flex items-center justify-between gap-2 shadow-lg">
      {/* Left toolset: Rotate & Delete selected piece */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleRotate(15)}
          disabled={!hasSelectedPiece || isSimulating}
          className={`flex items-center gap-1 px-2 py-2 rounded-lg border text-xs font-bold transition active:scale-95 ${
            hasSelectedPiece && !isSimulating
              ? 'bg-[#4a2b14] text-amber-200 border-[#7a4822] hover:bg-[#61381a]'
              : 'opacity-40 bg-[#29170a] text-amber-500/40 border-[#3d200e] cursor-not-allowed'
          }`}
          title="Seçili parçayı 15° döndür"
        >
          <RotateCw className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[11px] font-mono">+15°</span>
        </button>

        <button
          onClick={() => handleRotate(45)}
          disabled={!hasSelectedPiece || isSimulating}
          className={`flex items-center gap-1 px-2 py-2 rounded-lg border text-xs font-bold transition active:scale-95 ${
            hasSelectedPiece && !isSimulating
              ? 'bg-[#4a2b14] text-amber-200 border-[#7a4822] hover:bg-[#61381a]'
              : 'opacity-40 bg-[#29170a] text-amber-500/40 border-[#3d200e] cursor-not-allowed'
          }`}
          title="Seçili parçayı 45° döndür"
        >
          <RotateCw className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[11px] font-mono">+45°</span>
        </button>

        <button
          onClick={handleDelete}
          disabled={!hasSelectedPiece || isSimulating}
          className={`p-2 rounded-lg border transition active:scale-95 ${
            hasSelectedPiece && !isSimulating
              ? 'bg-rose-950/80 text-rose-200 border-rose-800 hover:bg-rose-900'
              : 'opacity-30 bg-[#29170a] text-rose-500/40 border-[#3d200e] cursor-not-allowed'
          }`}
          title="Seçili parçayı envantere geri al"
        >
          <Trash2 className="w-4 h-4 text-rose-300" />
        </button>

        <button
          onClick={onClearAll}
          disabled={isSimulating}
          className="p-2 rounded-lg border border-[#4a2811] bg-[#29170a] hover:bg-[#3d200e] text-amber-400/80 text-xs transition active:scale-95"
          title="Tüm yerleştirilen tahtaları temizle"
        >
          <Undo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Center / Right: Big Juicy Green "▶ ÇALIŞTIR" Button */}
      <div className="flex items-center gap-2">
        {/* Speed button (1x / 2x) */}
        {isSimulating && (
          <button
            onClick={onToggleSpeed}
            className={`flex items-center gap-1 px-2 py-2 rounded-lg border text-xs font-black transition active:scale-95 ${
              simSpeed > 1
                ? 'bg-amber-500 text-slate-950 border-amber-300'
                : 'bg-[#3d2210] text-amber-200 border-[#663b19]'
            }`}
            title="Simülasyon hızı"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{simSpeed}x</span>
          </button>
        )}

        <button
          onClick={handleSimToggle}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm tracking-wide uppercase transition-all duration-200 ${
            isSimulating
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-50 border-2 border-amber-400 shadow-[0_4px_16px_rgba(217,119,6,0.4)] active:scale-95'
              : 'green-run-button text-white active:scale-95 animate-[pulse_3s_ease-in-out_infinite]'
          }`}
        >
          {isSimulating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
              <span>DÜZENLE</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>ÇALIŞTIR</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
