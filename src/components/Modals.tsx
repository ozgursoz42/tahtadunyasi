/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, X, Play, RotateCcw, Lock, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { LevelDefinition } from '../game/types';
import { PIECE_CATALOG } from '../game/levels';
import { sound } from '../game/audio';

// 1. VICTORY MODAL
interface VictoryModalProps {
  isOpen: boolean;
  level: LevelDefinition;
  stars: number;
  piecesUsed: number;
  onNextLevel: () => void;
  onReplay: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  level,
  stars,
  piecesUsed,
  onNextLevel,
  onReplay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-[#422411] via-[#331a0b] to-[#201006] border-2 border-amber-500/80 rounded-2xl shadow-2xl p-6 text-center text-amber-50 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span className="text-xs font-bold tracking-widest uppercase">HARİKA İŞ!</span>
          <Sparkles className="w-5 h-5 animate-spin" />
        </div>

        <h2 className="text-2xl font-black font-display tracking-tight text-amber-200 mb-1">
          BÖLÜM TAMAMLANDI!
        </h2>
        <p className="text-xs text-amber-300/80 mb-5">{level.title} mekanizması başarıyla çalıştı.</p>

        {/* 3 Stars display */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2, 3].map((starNum) => (
            <div
              key={starNum}
              className={`transition-all duration-500 transform ${
                starNum <= stars
                  ? 'scale-110 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-bounce'
                  : 'text-amber-950/60 scale-90'
              }`}
              style={{ animationDelay: `${starNum * 150}ms` }}
            >
              <Star className="w-10 h-10 fill-current" />
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div className="bg-[#241308] border border-[#4d2810] rounded-xl p-3 mb-6 flex justify-around text-center">
          <div>
            <span className="block text-[10px] text-amber-400/80 font-bold uppercase">Kullanılan</span>
            <span className="text-base font-extrabold text-amber-100 font-mono">{piecesUsed} Parça</span>
          </div>
          <div className="w-px h-8 bg-[#4d2810]" />
          <div>
            <span className="block text-[10px] text-amber-400/80 font-bold uppercase">3 Yıldız Kotası</span>
            <span className="text-base font-extrabold text-amber-300 font-mono">≤ {level.maxPiecesFor3Stars} Parça</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              sound.playWoodClick();
              onReplay();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#3d200e] hover:bg-[#522b13] border border-[#6b3819] rounded-xl text-amber-200 font-bold text-xs transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tekrar Dene</span>
          </button>

          <button
            onClick={() => {
              sound.playWoodClick();
              onNextLevel();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 green-run-button text-white rounded-xl font-black text-sm tracking-wide uppercase transition active:scale-95 shadow-lg shadow-emerald-950/50"
          >
            <span>Sonraki</span>
            <Play className="w-4 h-4 fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. LEVEL SELECT MODAL
interface LevelSelectModalProps {
  isOpen: boolean;
  levels: LevelDefinition[];
  currentLevelId: number;
  highestUnlockedLevel: number;
  levelStars: Record<number, number>;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  levels,
  currentLevelId,
  highestUnlockedLevel,
  levelStars,
  onSelectLevel,
  onClose,
}) => {
  const [selectedChapter, setSelectedChapter] = React.useState<number>(0);

  if (!isOpen) return null;

  const totalEarnedStars = Object.values(levelStars).reduce((sum, s) => sum + s, 0);
  const maxPossibleStars = levels.length * 3;

  const chapters = [
    { id: 0, label: 'Tümü', range: [1, 20] },
    { id: 1, label: '1. Orman', range: [1, 5] },
    { id: 2, label: '2. Kanyon', range: [6, 10] },
    { id: 3, label: '3. Dağ', range: [11, 15] },
    { id: 4, label: '4. Usta', range: [16, 20] },
  ];

  const filteredLevels = levels.filter((lvl) => {
    if (selectedChapter === 0) return true;
    const ch = chapters.find((c) => c.id === selectedChapter);
    if (!ch) return true;
    return lvl.id >= ch.range[0] && lvl.id <= ch.range[1];
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#2b160a] border-2 border-[#663819] rounded-2xl shadow-2xl p-4 sm:p-5 text-amber-50 relative flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#47250e]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base sm:text-lg font-black font-display text-amber-200 leading-tight">
                BÖLÜM SEÇİMİ
              </h2>
              <span className="text-[11px] text-amber-400 font-bold font-mono">
                ⭐ {totalEarnedStars} / {maxPossibleStars} Yıldız
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-[#40200c] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 scrollbar-none shrink-0">
          {chapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                sound.playWoodClick();
                setSelectedChapter(ch.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition shrink-0 ${
                selectedChapter === ch.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-[#3b1f0d] text-amber-200/80 hover:bg-[#4d2811]'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-y-auto pr-1 flex-1 scrollbar-thin">
          {filteredLevels.map((lvl) => {
            const isUnlocked = lvl.id <= highestUnlockedLevel;
            const isCurrent = lvl.id === currentLevelId;
            const stars = levelStars[lvl.id] || 0;

            return (
              <button
                key={lvl.id}
                disabled={!isUnlocked}
                onClick={() => {
                  sound.playWoodClick();
                  onSelectLevel(lvl.id);
                  onClose();
                }}
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl border-2 transition-all relative text-left h-24 ${
                  isCurrent
                    ? 'bg-[#5c3116] border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                    : isUnlocked
                    ? 'bg-[#3b1f0d] border-[#663819] hover:bg-[#4d2811] hover:border-[#854b23] active:scale-95'
                    : 'bg-[#1f1006] border-[#361a09] opacity-45 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-black text-amber-300 font-mono">#{lvl.id}</span>
                  {!isUnlocked && <Lock className="w-3 h-3 text-amber-700" />}
                  {isUnlocked && stars > 0 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>

                <div className="my-auto text-center w-full">
                  <span className="block text-[11px] font-bold text-amber-100 leading-tight truncate">
                    {lvl.title}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex items-center justify-center gap-0.5 w-full pt-0.5">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= stars ? 'text-amber-400 fill-amber-400' : 'text-amber-950/80'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 3. HELP & RULES MODAL
interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#2b160a] border-2 border-[#663819] rounded-2xl shadow-2xl p-5 text-amber-50 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#47250e]">
          <h2 className="text-lg font-black font-display text-amber-200">
            TAHTA DÜNYASI — REHBER
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-[#40200c] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto pr-1 space-y-4 text-xs text-amber-200/90 flex-1">
          {/* Core loop */}
          <div className="bg-[#1f1006] p-3 rounded-xl border border-[#47250e]">
            <h3 className="font-extrabold text-amber-300 text-sm mb-1.5">Nasıl Oynanır?</h3>
            <ol className="list-decimal list-inside space-y-1 text-amber-100">
              <li>Üstteki hedefi incele (örn. Değirmeni çalıştır veya çanı çal).</li>
              <li>Alttaki ahşap envanterinden parçalara dokunarak sahneye yerleştir.</li>
              <li>Parçayı sürükleyerek taşı, döndürme halkasını çevir veya +15° tuşuna bas.</li>
              <li>Büyük yeşil <strong className="text-emerald-400">▶ ÇALIŞTIR</strong> düğmesine bas!</li>
              <li>Fizik ve suyun birbirini tetiklemesini izle, yıldızları topla!</li>
            </ol>
          </div>

          {/* Pieces breakdown */}
          <div>
            <h3 className="font-extrabold text-amber-300 text-sm mb-2">Ahşap Mekanizma Parçaları</h3>
            <div className="space-y-2">
              {Object.values(PIECE_CATALOG).slice(0, 6).map((info) => (
                <div
                  key={info.type}
                  className="flex items-center gap-2.5 bg-[#3b1f0d] p-2 rounded-lg border border-[#542a12]"
                >
                  <div className="w-8 h-8 rounded bg-[#241308] border border-amber-600/40 flex items-center justify-center shrink-0">
                    <span className="text-amber-400 font-bold text-xs">●</span>
                  </div>
                  <div>
                    <span className="block font-bold text-amber-100 text-xs">{info.name}</span>
                    <span className="block text-[11px] text-amber-300/70">{info.shortDesc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 mt-3 border-t border-[#47250e]">
          <button
            onClick={() => {
              sound.playWoodClick();
              onClose();
            }}
            className="w-full py-2.5 green-run-button text-white rounded-xl font-extrabold text-xs tracking-wider uppercase transition active:scale-95 shadow-md"
          >
            Anladım, Oyuna Başla!
          </button>
        </div>
      </div>
    </div>
  );
};
