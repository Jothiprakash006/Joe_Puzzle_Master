import React from 'react';
import { HelpCircle, X, Layers, ShieldAlert, Clock, Heart, Zap, Award, Keyboard } from 'lucide-react';
import { audio } from '../utils/audio';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl flex flex-col max-h-[85vh] space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-gaming text-xl sm:text-2xl font-bold text-white tracking-wider">
                HOW TO PLAY
              </h2>
              <p className="text-xs text-slate-400">Master the puzzle grid & maximize your score</p>
            </div>
          </div>

          <button
            onClick={() => { audio.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Core Mechanics */}
        <div className="space-y-3">
          <h3 className="font-gaming text-sm sm:text-base font-bold text-purple-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            1. CORE GAMEPLAY
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-white/5">
            Grab puzzle pieces from the <strong className="text-purple-300">Piece Tray</strong> at the bottom/right and drag them onto the <strong className="text-cyan-300">Puzzle Board Grid</strong>. When you drop a piece onto its exact target cell, it will magnetically <strong className="text-amber-300">SNAP</strong> and lock into place with celebratory sound and screen shake!
          </p>
        </div>

        {/* 2. Game Modes */}
        <div className="space-y-3">
          <h3 className="font-gaming text-sm sm:text-base font-bold text-cyan-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            2. GAME MODES
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'Standard Mode', desc: 'Free drag & drop anywhere. Pieces snap only when dropped on their target cell.', icon: Layers, color: 'text-purple-400' },
              { title: 'Strict (Snap Mode)', desc: 'Precision test! If you drop a piece on the wrong cell, it bounces back with an error penalty.', icon: ShieldAlert, color: 'text-red-400' },
              { title: 'Time Attack', desc: 'Adrenaline rush! Race against a ticking countdown timer. Fast combo snaps add bonus points.', icon: Clock, color: 'text-amber-400' },
              { title: 'Zen Mode', desc: 'Zero timer pressure, unlimited undos, relaxing ambient synthwave background music.', icon: Heart, color: 'text-pink-400' },
            ].map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 flex items-start gap-3">
                  <div className={`p-2 rounded-xl bg-white/5 shrink-0 ${m.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{m.title}</h4>
                    <p className="text-xs text-slate-400 leading-tight mt-1">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Scoring & Combos */}
        <div className="space-y-3">
          <h3 className="font-gaming text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            3. SCORING & STARS ⭐
          </h3>
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 text-xs sm:text-sm text-slate-300 space-y-2">
            <p>• <strong className="text-amber-300">Combo Multipliers:</strong> Chain correct snaps consecutively without dropping incorrectly to build up to <strong className="text-orange-400">5x COMBO</strong> multipliers!</p>
            <p>• <strong className="text-cyan-300">3-Star Ratings:</strong> Solve the puzzle under the target time and move threshold to earn a prestigious 3-Star rating.</p>
            <p>• <strong className="text-emerald-300">High Accuracy:</strong> Every clean placement boosts your accuracy percentage, which heavily influences your final leaderboard rank!</p>
          </div>
        </div>

        {/* 4. Keyboard Shortcuts */}
        <div className="space-y-3">
          <h3 className="font-gaming text-sm sm:text-base font-bold text-pink-300 flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-pink-400" />
            4. KEYBOARD SHORTCUTS
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              { key: 'H', action: 'Flash Hint / Auto-Lock' },
              { key: 'U', action: 'Undo Last Move' },
              { key: 'P', action: 'Pause / Resume Game' },
              { key: 'Space', action: 'Peek Original Reference' },
              { key: 'Shift + R', action: 'Restart Puzzle' },
            ].map((k, i) => (
              <div key={i} className="bg-slate-900/80 px-3 py-2 rounded-xl border border-white/10 flex items-center justify-between">
                <span className="text-slate-400">{k.action}</span>
                <kbd className="px-2 py-0.5 bg-purple-500/20 text-purple-300 font-mono font-bold rounded border border-purple-500/40">{k.key}</kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 text-right">
          <button
            onClick={() => { audio.playClick(); onClose(); }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-gaming text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            Got It, Let&apos;s Play!
          </button>
        </div>
      </div>
    </div>
  );
};
