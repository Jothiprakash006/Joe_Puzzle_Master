import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Maximize, Minimize, Trophy, HelpCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { audio } from '../utils/audio';

interface NavbarProps {
  onOpenHighScores: () => void;
  onOpenHowToPlay: () => void;
  isPlaying: boolean;
  onBackToHome: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHighScores,
  onOpenHowToPlay,
  isPlaying,
  onBackToHome,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b px-4 py-3 transition-colors duration-300 bg-slate-950/80 border-white/10 text-slate-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand or Back Button */}
        <div className="flex items-center gap-3">
          {isPlaying ? (
            <button
              onClick={() => {
                audio.playClick();
                onBackToHome();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer active:scale-95 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white"
              title="Return to Home Screen"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
          ) : null}

          <div 
            onClick={() => { if (isPlaying) onBackToHome(); }}
            className={`flex items-center gap-2.5 ${isPlaying ? 'cursor-pointer' : ''}`}
          >
            <div className="w-9 h-9 rounded-xl p-0.5 shadow-lg flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 shadow-purple-500/30 animate-pulse-glow">
              <div className="w-full h-full rounded-[10px] flex items-center justify-center bg-slate-950">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <h1 className="font-gaming text-lg sm:text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-300">
                JOE PUZZLE MASTER
              </h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold -mt-1 hidden xs:block text-purple-400">
                Ultra-Responsive Drag & Drop
              </p>
            </div>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Controls */}
          <div className="flex items-center rounded-xl p-1 border bg-slate-900/80 border-white/10">
            <button
              onClick={() => {
                audio.playClick();
                onToggleSound();
              }}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                soundEnabled 
                  ? 'text-purple-400 bg-purple-500/20 hover:bg-purple-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                audio.playClick();
                onToggleMusic();
              }}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                musicEnabled 
                  ? 'text-cyan-400 bg-cyan-500/20 hover:bg-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title={musicEnabled ? 'Mute Background Music' : 'Play Background Music'}
            >
              <Music className={`w-4 h-4 ${musicEnabled ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => {
              audio.playClick();
              toggleFullscreen();
            }}
            className="p-2 rounded-xl border transition-colors cursor-pointer bg-slate-900/80 hover:bg-slate-800 border-white/10 text-slate-300 hover:text-white"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* High Scores Button */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenHighScores();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-sm cursor-pointer active:scale-95 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/30 text-amber-300 hover:text-amber-200"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Scores</span>
          </button>

          {/* How to Play Button */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenHowToPlay();
            }}
            className="p-2 rounded-xl border transition-colors cursor-pointer bg-slate-900/80 hover:bg-slate-800 border-white/10 text-slate-300 hover:text-white"
            title="How to Play & Controls"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
