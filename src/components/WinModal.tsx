import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, Clock, Flame, Award, Share2, Check, ArrowRight, RotateCcw, Home, Sparkles, Zap } from 'lucide-react';
import { GameState, DIFFICULTIES, DifficultyLevel } from '../types/game';
import { audio } from '../utils/audio';

interface WinModalProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onNextDifficulty: (nextDiff: DifficultyLevel) => void;
  onHome: () => void;
  isNewHighScore: boolean;
}

export const WinModal: React.FC<WinModalProps> = ({
  gameState,
  onPlayAgain,
  onNextDifficulty,
  onHome,
  isNewHighScore,
}) => {
  const [copied, setCopied] = useState(false);
  const { difficulty, mode, imageTitle, timer, moves, maxCombo, score, correctPlacements, totalAttempts } = gameState;
  const config = DIFFICULTIES[difficulty];

  // Calculate Stars
  const accuracy = totalAttempts > 0 ? Math.min(100, Math.round((correctPlacements / totalAttempts) * 100)) : 100;
  let stars = 1;
  if (timer <= config.starThresholds.time * 1.5 && moves <= config.starThresholds.moves * 1.5) {
    stars = 2;
  }
  if (timer <= config.starThresholds.time && moves <= config.starThresholds.moves) {
    stars = 3;
  }

  // Trigger Confetti Fireworks on mount
  useEffect(() => {
    audio.playVictory();

    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a855f7', '#3b82f6', '#06b6d4', '#f59e0b'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ec4899', '#8b5cf6', '#10b981', '#fbbf24'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  // Format Timer
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  // Next difficulty mapping
  const diffOrder: DifficultyLevel[] = ['2x2', '3x3', '4x4', '5x5', '6x6', '8x8'];
  const currentIdx = diffOrder.indexOf(difficulty);
  const nextDiff = currentIdx < diffOrder.length - 1 ? diffOrder[currentIdx + 1] : null;

  // Share summary
  const handleShare = () => {
    audio.playClick();
    const starEmoji = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    const text = `🧩 JOE PUZZLE MASTER VICTORY!\n${imageTitle} (${config.label})\nMode: ${mode}\nScore: ${score.toLocaleString()} pts ${starEmoji}\nTime: ${formatTime(timer)} | Moves: ${moves} | Combo: ${maxCombo}x\nAccuracy: ${accuracy}%\n\nCan you beat my score?`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/30 text-center space-y-6 overflow-hidden">
        {/* Glow Background Decor */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/30 rounded-full blur-3xl pointer-events-none" />

        {/* Victory Header */}
        <div className="relative z-10 space-y-2">
          {isNewHighScore && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-gaming text-xs font-black uppercase tracking-wider animate-bounce shadow-lg">
              <Trophy className="w-3.5 h-3.5 fill-current" />
              <span>NEW HIGH SCORE RECORD!</span>
            </div>
          )}
          <h2 className="font-gaming text-3xl sm:text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-cyan-300 bg-clip-text text-transparent tracking-tight">
            PUZZLE SOLVED!
          </h2>
          <p className="text-slate-300 font-medium text-sm">
            You conquered <span className="text-purple-300 font-bold">{imageTitle}</span> on <span className="text-cyan-300 font-bold">{config.id}</span>!
          </p>
        </div>

        {/* Star Rating Display */}
        <div className="flex justify-center items-center gap-3 py-2">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars;
            return (
              <div
                key={starIdx}
                className={`transition-all duration-500 transform ${
                  isEarned
                    ? 'scale-110 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                    : 'scale-90 text-slate-700 opacity-40'
                }`}
              >
                <Star className={`w-10 h-10 sm:w-12 sm:h-12 ${isEarned ? 'fill-amber-400 animate-pulse' : ''}`} />
              </div>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 rounded-2xl p-4 border border-white/10 text-left">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> Time
            </span>
            <div className="font-gaming font-bold text-sm sm:text-base text-white">
              {formatTime(timer)}
            </div>
            <div className="text-[9px] text-slate-400">Target: {formatTime(config.starThresholds.time)}</div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-400" /> Moves
            </span>
            <div className="font-gaming font-bold text-sm sm:text-base text-white">
              {moves}
            </div>
            <div className="text-[9px] text-slate-400">Target: {config.starThresholds.moves}</div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" /> Combo
            </span>
            <div className="font-gaming font-bold text-sm sm:text-base text-amber-300">
              {maxCombo}x Max
            </div>
            <div className="text-[9px] text-slate-400">Streak Record</div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-400" /> Accuracy
            </span>
            <div className="font-gaming font-bold text-sm sm:text-base text-emerald-400">
              {accuracy}%
            </div>
            <div className="text-[9px] text-slate-400">Precision</div>
          </div>
        </div>

        {/* Final Score Banner */}
        <div className="bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-900/60 rounded-xl p-3 border border-purple-500/40 flex items-center justify-between px-4">
          <span className="font-gaming text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" /> Final Score:
          </span>
          <span className="font-gaming text-xl sm:text-2xl font-black text-amber-300 drop-shadow">
            {score.toLocaleString()} <span className="text-xs font-normal">PTS</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { audio.playClick(); onPlayAgain(); }}
              className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-gaming text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Play Again</span>
            </button>

            {nextDiff ? (
              <button
                onClick={() => { audio.playClick(); onNextDifficulty(nextDiff); }}
                className="py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-gaming text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-purple-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Next ({nextDiff})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => { audio.playClick(); onHome(); }}
                className="py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-gaming text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-purple-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Home className="w-4 h-4" />
                <span>Home Screen</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { audio.playClick(); onHome(); }}
              className="flex-1 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Choose New Image</span>
            </button>

            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
