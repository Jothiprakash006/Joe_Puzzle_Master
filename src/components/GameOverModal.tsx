import React from 'react';
import { AlertTriangle, RotateCcw, Home, Layers } from 'lucide-react';
import { GameState, DIFFICULTIES } from '../types/game';
import { audio } from '../utils/audio';

interface GameOverModalProps {
  gameState: GameState;
  onRetry: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  gameState,
  onRetry,
  onHome,
}) => {
  const { difficulty, imageTitle, pieces, score, moves } = gameState;
  const config = DIFFICULTIES[difficulty];
  const lockedCount = pieces.filter((p) => p.isLocked).length;
  const progressPercent = Math.round((lockedCount / config.totalPieces) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border-2 border-red-500/50 shadow-2xl shadow-red-500/30 text-center space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="font-gaming text-3xl sm:text-4xl font-black text-red-400 tracking-tight drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">
            TIME&apos;S UP!
          </h2>
          <p className="text-slate-300 font-medium text-sm">
            The clock ran out on your <span className="text-red-300 font-bold">{imageTitle}</span> puzzle!
          </p>
        </div>

        {/* Stats Summary */}
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" /> Progress:
            </span>
            <span className="text-white font-gaming">
              {lockedCount}/{config.totalPieces} ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5 text-slate-400">
            <span>Moves Made: <strong className="text-white">{moves}</strong></span>
            <span>Partial Score: <strong className="text-amber-400 font-gaming">{score}</strong></span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              audio.playClick();
              onRetry();
            }}
            className="py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-gaming text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onHome();
            }}
            className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-gaming text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
