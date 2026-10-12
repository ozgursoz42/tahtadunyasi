/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Grid, Lightbulb, Star } from 'lucide-react';
import { LevelDefinition } from '../game/types';
import { sound } from '../game/audio';

interface TopBarProps {
  level: LevelDefinition;
  earnedStars: number;
  availableHints: number;
  onOpenLevelSelect: () => void;
  onResetLevel: () => void;
  onToggleHint: () => void;
  onOpenHelp: () => void;
  showHints: boolean;
  isSimulating: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  level,
  earnedStars,
  availableHints,
  onOpenLevelSelect,
  onResetLevel,
  onToggleHint,
  onOpenHelp,
  showHints,
  isSimulating,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.isMuted());

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="relative w-full z-20 flex flex-col bg-[#2e1d11] border-b-2 border-[#543319] text-amber-50 shadow-md">
      {/* Top action row */}
      <div className="flex items-center justify-between px-3 py-2">
        {/* Left: Level Select Button */}
        <button
          onClick={onOpenLevelSelect}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#452712] hover:bg-[#5c3519] active:scale-95 text-amber-100 rounded-lg border border-[#784620] shadow-sm text-xs font-semibold transition"
          title="Bölüm Seçimi"
          aria-label="Bölüm Seçimi"
        >
          <Grid className="w-4 h-4 text-amber-300" />
          <span className="hidden sm:inline">Bölümler</span>
        </button>

        {/* Center: Stars & Level Header */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-0.5">
            {[1, 2, 3].map((starNum) => (
              <Star
                key={starNum}
                className={`w-4 h-4 transition-all duration-300 ${
                  starNum <= earnedStars
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                    : 'text-amber-900/60'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-amber-300">
            BÖLÜM {level.id} · {level.title}
          </span>
        </div>

        {/* Right actions: Audio, Reset, Hints, Help */}
        <div className="flex items-center gap-1.5">
          {/* Hint button */}
          <button
            onClick={onToggleHint}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-semibold transition active:scale-95 ${
              showHints
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'bg-[#452712] text-amber-200 border-[#784620] hover:bg-[#5c3519]'
            }`}
            title="İpucu Göster"
          >
            <Lightbulb className={`w-3.5 h-3.5 ${showHints ? 'text-slate-950 fill-current' : 'text-amber-300'}`} />
            <span className="text-[11px]">{availableHints}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onResetLevel}
            className="p-1.5 bg-[#452712] hover:bg-[#5c3519] active:scale-95 text-amber-200 rounded-lg border border-[#784620] shadow-sm transition"
            title="Yeniden Başlat"
            aria-label="Yeniden Başlat"
          >
            <RotateCcw className="w-4 h-4 text-amber-300" />
          </button>

          {/* Audio toggle */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 bg-[#452712] hover:bg-[#5c3519] active:scale-95 text-amber-200 rounded-lg border border-[#784620] shadow-sm transition"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
            aria-label="Ses Kontrolü"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-300" />
            )}
          </button>

          {/* Help button */}
          <button
            onClick={onOpenHelp}
            className="p-1.5 bg-[#452712] hover:bg-[#5c3519] active:scale-95 text-amber-200 rounded-lg border border-[#784620] shadow-sm transition"
            title="Nasıl Oynanır?"
            aria-label="Nasıl Oynanır"
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>

      {/* Goal Banner Strip */}
      <div className="bg-[#201309] px-3 py-1 flex items-center justify-between border-t border-[#40240f] text-[11px]">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="font-extrabold text-amber-400 shrink-0">HEDEF:</span>
          <span className="font-medium text-amber-200 truncate">
            {level.subtitle} — {level.description}
          </span>
        </div>
        {isSimulating && (
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold tracking-wider animate-pulse border border-emerald-700 shrink-0">
            ÇALIŞIYOR
          </span>
        )}
      </div>
    </header>
  );
};
