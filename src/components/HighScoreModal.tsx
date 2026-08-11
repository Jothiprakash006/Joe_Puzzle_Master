import React, { useState } from 'react';
import { Trophy, X, Trash2, Award, Clock } from 'lucide-react';
import { HighScore, DifficultyLevel, DIFFICULTIES, GameMode } from '../types/game';
import { getHighScores, clearHighScores } from '../utils/storage';
import { audio } from '../utils/audio';

interface HighScoreModalProps {
  onClose: () => void;
}

export const HighScoreModal: React.FC<HighScoreModalProps> = ({ onClose }) => {
  const [scores, setScores] = useState<HighScore[]>(getHighScores());
  const [selectedDiff, setSelectedDiff] = useState<DifficultyLevel | 'all'>('all');
  const [selectedMode, setSelectedMode] = useState<GameMode | 'all'>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    audio.playClick();
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    clearHighScores();
    setScores([]);
    setConfirmClear(false);
  };

  const filteredScores = scores
    .filter((s) => selectedDiff === 'all' || s.difficulty === selectedDiff)
    .filter((s) => selectedMode === 'all' || s.mode === selectedMode);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl flex flex-col max-h-[85vh] space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-gaming text-xl sm:text-2xl font-bold text-white tracking-wider">
                HALL OF FAME
              </h2>
              <p className="text-xs text-slate-400">Local High Scores Leaderboard</p>
            </div>
          </div>

          <button
            onClick={() => { audio.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters (Difficulty & Mode) */}
        <div className="space-y-3">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-bold uppercase text-slate-400 shrink-0 mr-1">Size:</span>
            <button
              onClick={() => { audio.playClick(); setSelectedDiff('all'); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedDiff === 'all' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' : 'bg-slate-900/80 text-slate-400 hover:text-white'
              }`}
            >
              All Sizes
            </button>
            {(Object.keys(DIFFICULTIES) as DifficultyLevel[]).map((diff) => (
              <button
                key={diff}
                onClick={() => { audio.playClick(); setSelectedDiff(diff); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedDiff === diff ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' : 'bg-slate-900/80 text-slate-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Mode Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-bold uppercase text-slate-400 shrink-0 mr-1">Mode:</span>
            {[
              { id: 'all', label: 'All Modes' },
              { id: 'standard', label: 'Standard' },
              { id: 'snap', label: 'Strict' },
              { id: 'time_attack', label: 'Time Attack' },
              { id: 'zen', label: 'Zen' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => { audio.playClick(); setSelectedMode(m.id as any); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedMode === m.id ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30' : 'bg-slate-900/80 text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table / List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {filteredScores.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Award className="w-12 h-12 mx-auto opacity-30 text-amber-400" />
              <p className="font-gaming text-sm font-bold text-slate-400">No high scores found!</p>
              <p className="text-xs">Complete a puzzle in this category to set the first record.</p>
            </div>
          ) : (
            filteredScores.map((scoreEntry, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const rankColor = rank === 1 ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' : rank === 2 ? 'text-slate-300 border-slate-400/40 bg-slate-400/10' : rank === 3 ? 'text-amber-600 border-amber-600/40 bg-amber-600/10' : 'text-slate-500 border-white/5 bg-slate-900/40';

              return (
                <div
                  key={scoreEntry.id}
                  className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all ${
                    isTop3 ? 'bg-slate-900/80 border-white/15 shadow-md' : 'bg-slate-900/40 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-gaming font-bold text-xs sm:text-sm shrink-0 ${rankColor}`}>
                      #{rank}
                    </div>

                    {/* Info */}
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm truncate">{scoreEntry.imageTitle}</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-gaming font-semibold shrink-0">
                          {scoreEntry.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-400" /> {formatTime(scoreEntry.timeTaken)}</span>
                        <span>• {scoreEntry.moves} moves</span>
                        <span className="hidden sm:inline">• {scoreEntry.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <div className="font-gaming font-black text-sm sm:text-base text-amber-300 drop-shadow">
                      {scoreEntry.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-emerald-400">
                      {scoreEntry.accuracy}% Acc
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handleClear}
            disabled={scores.length === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              confirmClear ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-900/80 hover:bg-slate-800 text-red-400 hover:text-red-300 border border-white/10'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmClear ? 'Click to Confirm Clear All' : 'Clear Scores'}</span>
          </button>

          <button
            onClick={() => { audio.playClick(); onClose(); }}
            className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-gaming text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
