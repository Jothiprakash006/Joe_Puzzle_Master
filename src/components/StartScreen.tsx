import { useState, useRef } from 'react';
import { Upload, Sparkles, Zap, Trophy, Play, Check, Clock, RefreshCw, Eye, ShieldAlert, Heart, Layers, Grid } from 'lucide-react';
import { DifficultyLevel, DIFFICULTIES, GameMode, PieceStyle, GameState } from '../types/game';
import { PRESET_IMAGES, CATEGORIES, PresetImage } from '../data/presetImages';
import { audio } from '../utils/audio';

interface StartScreenProps {
  onStartGame: (
    imageSrc: string | File,
    title: string,
    difficulty: DifficultyLevel,
    mode: GameMode,
    style: PieceStyle
  ) => void;
  onResumeGame: (savedState: Partial<GameState>) => void;
  savedGame: Partial<GameState> | null;
  isLoading: boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onResumeGame,
  savedGame,
  isLoading,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('3x3');
  const [selectedMode, setSelectedMode] = useState<GameMode>('standard');
  const [selectedStyle, setSelectedStyle] = useState<PieceStyle>('modern');
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>('All');
  const [selectedPreset, setSelectedPreset] = useState<PresetImage | null>(PRESET_IMAGES[0]);
  const [customImageFile, setCustomImageFile] = useState<File | null>(null);
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }
    audio.playClick();
    setCustomImageFile(file);
    const url = URL.createObjectURL(file);
    setCustomImagePreview(url);
    setSelectedPreset(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleLaunch = () => {
    if (isLoading) return;
    audio.playClick();
    if (customImageFile) {
      onStartGame(
        customImageFile,
        customImageFile.name.replace(/\.[^/.]+$/, ''),
        selectedDifficulty,
        selectedMode,
        selectedStyle
      );
    } else if (selectedPreset) {
      onStartGame(
        selectedPreset.url,
        selectedPreset.title,
        selectedDifficulty,
        selectedMode,
        selectedStyle
      );
    }
  };

  const filteredPresets = selectedCategory === 'All'
    ? PRESET_IMAGES
    : PRESET_IMAGES.filter((img) => img.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 text-slate-100 animate-fadeIn">
      {/* Hero Banner / Resume Saved Game */}
      <div className="text-center mb-10">
        <h2 className="font-gaming text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-cyan-300 bg-clip-text text-transparent mb-4">
          CHOOSE YOUR PUZZLE
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Upload your own favorite photo or pick from our curated collection of cyberpunk and sci-fi masterpieces. Slice, drag, and snap your way to victory!
        </p>

        {/* Resume Saved Game Banner */}
        {savedGame && savedGame.pieces && savedGame.pieces.length > 0 && (
          <div className="mt-6 max-w-lg mx-auto bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-2 border-purple-500/50 rounded-2xl p-4 shadow-xl shadow-purple-500/20 flex items-center justify-between gap-4 backdrop-blur-md">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-300 bg-purple-500/30 px-2 py-0.5 rounded">
                Auto-Saved Run Found
              </span>
              <h4 className="font-gaming font-bold text-base text-white mt-1">
                {savedGame.imageTitle || 'Unfinished Puzzle'} ({savedGame.difficulty})
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Progress: {savedGame.correctPlacements || 0} / {savedGame.pieces.length} pieces locked • Mode: {savedGame.mode}
              </p>
            </div>
            <button
              onClick={() => {
                audio.playClick();
                onResumeGame(savedGame);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-gaming text-sm font-bold rounded-xl shadow-lg shadow-purple-600/40 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              Resume
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Selection (Upload & Preset Gallery) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10">
            <h3 className="font-gaming text-lg sm:text-xl font-bold flex items-center gap-2 mb-4 text-purple-200">
              <Eye className="w-5 h-5 text-purple-400" />
              1. SELECT ARTWORK
            </h3>

            {/* Upload Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDraggingFile
                  ? 'border-purple-400 bg-purple-500/20 scale-[1.01]'
                  : customImagePreview
                  ? 'border-emerald-500/50 bg-emerald-950/20 hover:bg-emerald-900/30'
                  : 'border-white/20 bg-slate-900/50 hover:border-purple-500/50 hover:bg-purple-950/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {customImagePreview ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-emerald-400 shadow-lg">
                    <img src={customImagePreview} alt="Upload preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                      <Check className="w-8 h-8 text-emerald-400 drop-shadow" />
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase mb-1">
                      Custom Upload Ready
                    </span>
                    <p className="font-medium text-white text-sm truncate max-w-xs">
                      {customImageFile?.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click or drop another image to replace
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-sm sm:text-base text-slate-200">
                    Click to upload your own photo or drop file here
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports JPG, PNG, and WebP • Auto-cropped to clean square
                  </p>
                </div>
              )}
            </div>

            {/* Preset Gallery */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Or pick from our Curated Library:
                </span>
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      audio.playClick();
                      setSelectedCategory(cat);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 scale-105'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                {filteredPresets.map((preset) => {
                  const isSelected = selectedPreset?.id === preset.id && !customImagePreview;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        audio.playClick();
                        setSelectedPreset(preset);
                        setCustomImageFile(null);
                        setCustomImagePreview(null);
                      }}
                      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2 aspect-square ${
                        isSelected
                          ? 'border-purple-500 ring-4 ring-purple-500/30 scale-[0.98] shadow-lg shadow-purple-500/40'
                          : 'border-white/10 hover:border-white/30 hover:scale-105'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        crossOrigin="anonymous"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-2.5">
                        <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">
                          {preset.category}
                        </span>
                        <h4 className="text-xs font-bold text-white leading-tight truncate">
                          {preset.title}
                        </h4>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Difficulty, Modes, and Launch Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 space-y-6">
            {/* 2. Difficulty Selection */}
            <div>
              <h3 className="font-gaming text-lg sm:text-xl font-bold flex items-center gap-2 mb-3 text-cyan-200">
                <Trophy className="w-5 h-5 text-cyan-400" />
                2. DIFFICULTY LEVEL
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(Object.keys(DIFFICULTIES) as DifficultyLevel[]).map((diff) => {
                  const config = DIFFICULTIES[diff];
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      onClick={() => {
                        audio.playClick();
                        setSelectedDifficulty(diff);
                      }}
                      className={`p-3 rounded-xl text-left transition-all duration-200 border cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-br from-cyan-600/30 to-blue-600/30 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/30'
                          : 'bg-slate-900/70 hover:bg-slate-800/80 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-gaming font-bold text-white block">
                          {config.id}
                        </span>
                        <span className="text-[11px] font-semibold text-cyan-300 block">
                          {config.label.split(' ')[0]}
                        </span>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{config.totalPieces} pcs</span>
                        <span className="text-amber-400 font-bold">+{config.baseScore}pt</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Game Mode & Style */}
            <div>
              <h3 className="font-gaming text-lg sm:text-xl font-bold flex items-center gap-2 mb-3 text-pink-200">
                <Zap className="w-5 h-5 text-pink-400" />
                3. MODE & STYLE
              </h3>

              {/* Game Modes */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { id: 'standard', label: 'Standard', desc: 'Free drag & magnetic snap', icon: Layers },
                  { id: 'snap', label: 'Strict Mode', desc: 'Bounce back on wrong placement', icon: ShieldAlert },
                  { id: 'time_attack', label: 'Time Attack', desc: 'Race against ticking clock', icon: Clock },
                  { id: 'zen', label: 'Zen Mode', desc: 'No timers, purely relaxing', icon: Heart },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = selectedMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        audio.playClick();
                        setSelectedMode(m.id as GameMode);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-pink-600/30 to-purple-600/30 border-pink-400 ring-1 ring-pink-400/50'
                          : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/10'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-pink-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate">{m.label}</div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">{m.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Piece Style Selector */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'modern', label: 'Modern Neon Grid', desc: 'Sleek 3D glowing cards', icon: Grid },
                  { id: 'jigsaw', label: 'Classic Jigsaw', desc: 'Real interlocking tabs', icon: Sparkles },
                ].map((st) => {
                  const Icon = st.icon;
                  const isSelected = selectedStyle === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        audio.playClick();
                        setSelectedStyle(st.id as PieceStyle);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-purple-400 ring-1 ring-purple-400/50'
                          : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/10'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{st.label}</div>
                        <div className="text-[10px] text-slate-400">{st.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch Game Button */}
            <div className="pt-2">
              <button
                onClick={handleLaunch}
                disabled={isLoading || (!customImagePreview && !selectedPreset)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-gaming text-lg font-extrabold tracking-wider uppercase shadow-xl shadow-purple-600/40 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>SLICING PUZZLE...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-current" />
                    <span>START JOE PUZZLE MASTER</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Pro Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono">H</kbd> for hints or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono">Space</kbd> to peek reference!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
