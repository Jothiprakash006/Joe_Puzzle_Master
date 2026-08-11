import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Shuffle, Lightbulb, Undo2, Eye, EyeOff, Grid, Clock, Trophy, Flame, Zap, Award, Sparkles } from 'lucide-react';
import { GameState, PuzzlePiece, DIFFICULTIES } from '../types/game';
import { audio } from '../utils/audio';

interface GameBoardProps {
  gameState: GameState;
  onPieceDrop: (pieceId: string, targetRow: number, targetCol: number, toTray: boolean) => void;
  onUndo: () => void;
  onHint: () => void;
  onShuffleTray: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onToggleGridGuide: () => void;
  onTogglePeek: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onPieceDrop,
  onUndo,
  onHint,
  onShuffleTray,
  onTogglePause,
  onRestart,
  onToggleGridGuide,
  onTogglePeek,
}) => {
  const {
    difficulty,
    mode,
    pieceStyle,
    imageSrc,
    imageTitle,
    pieces,
    timer,
    moves,
    combo,
    score,
    hintPieceId,
    isPeeking,
    gridGuide,
    shakeIntensity,
    floatingTexts,
  } = gameState;

  const config = DIFFICULTIES[difficulty];
  const gridSize = config.gridSize;
  const totalPieces = config.totalPieces;
  const lockedCount = pieces.filter((p) => p.isLocked).length;
  const progressPercent = Math.round((lockedCount / totalPieces) * 100);

  // Dragging State
  const [draggingPiece, setDraggingPiece] = useState<PuzzlePiece | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [hoverTray, setHoverTray] = useState<boolean>(false);
  const [trayFilter, setTrayFilter] = useState<'all' | 'edge' | 'inner'>('all');

  const boardRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (key === 'h') {
        e.preventDefault();
        onHint();
      } else if (key === 'u' && (e.ctrlKey || e.metaKey || !e.shiftKey)) {
        e.preventDefault();
        onUndo();
      } else if (key === 'p') {
        e.preventDefault();
        onTogglePause();
      } else if (key === ' ') {
        e.preventDefault();
        onTogglePeek();
      } else if (key === 'r' && e.shiftKey) {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onHint, onUndo, onTogglePause, onTogglePeek, onRestart]);

  // Format Timer (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start Dragging
  const handlePointerDown = (e: React.PointerEvent, piece: PuzzlePiece) => {
    if (piece.isLocked || gameState.status === 'paused') return;
    e.preventDefault();
    e.stopPropagation();

    audio.playPickup();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setPointerPos({ x: e.clientX, y: e.clientY });
    setDraggingPiece(piece);
  };

  // Drag Move handler on window
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!draggingPiece) return;
      e.preventDefault();
      setPointerPos({ x: e.clientX, y: e.clientY });

      // Check if hovering over board cells
      if (boardRef.current) {
        const boardRect = boardRef.current.getBoundingClientRect();
        if (
          e.clientX >= boardRect.left &&
          e.clientX <= boardRect.right &&
          e.clientY >= boardRect.top &&
          e.clientY <= boardRect.bottom
        ) {
          const cellWidth = boardRect.width / gridSize;
          const cellHeight = boardRect.height / gridSize;
          const col = Math.floor((e.clientX - boardRect.left) / cellWidth);
          const row = Math.floor((e.clientY - boardRect.top) / cellHeight);
          if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
            setHoveredCell({ row, col });
            setHoverTray(false);
            return;
          }
        }
      }

      // Check if hovering over Tray
      if (trayRef.current) {
        const trayRect = trayRef.current.getBoundingClientRect();
        if (
          e.clientX >= trayRect.left &&
          e.clientX <= trayRect.right &&
          e.clientY >= trayRect.top &&
          e.clientY <= trayRect.bottom
        ) {
          setHoverTray(true);
          setHoveredCell(null);
          return;
        }
      }

      setHoveredCell(null);
      setHoverTray(false);
    },
    [draggingPiece, gridSize]
  );

  // Drag End handler on window
  const handlePointerUp = useCallback(() => {
    if (!draggingPiece) return;

    if (hoveredCell) {
      // Dropped onto grid cell
      onPieceDrop(draggingPiece.id, hoveredCell.row, hoveredCell.col, false);
    } else if (hoverTray) {
      // Dropped back to tray
      onPieceDrop(draggingPiece.id, 0, 0, true);
    } else {
      // Dropped outside -> default back to tray or stay
      onPieceDrop(draggingPiece.id, 0, 0, draggingPiece.isInTray);
    }

    setDraggingPiece(null);
    setHoveredCell(null);
    setHoverTray(false);
  }, [draggingPiece, hoveredCell, hoverTray, onPieceDrop]);

  useEffect(() => {
    if (draggingPiece) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [draggingPiece, handlePointerMove, handlePointerUp]);

  // Filter tray pieces
  const trayPieces = pieces
    .filter((p) => p.isInTray && !p.isLocked && p.id !== draggingPiece?.id)
    .filter((p) => {
      if (trayFilter === 'edge') {
        return p.row === 0 || p.row === gridSize - 1 || p.col === 0 || p.col === gridSize - 1;
      }
      if (trayFilter === 'inner') {
        return p.row > 0 && p.row < gridSize - 1 && p.col > 0 && p.col < gridSize - 1;
      }
      return true;
    });

  // Screen shake animation class
  const shakeClass =
    shakeIntensity === 'intense'
      ? 'animate-shake-intense'
      : shakeIntensity === 'mild'
      ? 'animate-shake-mild'
      : '';

  return (
    <div className={`max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 ${shakeClass}`}>
      {/* 1. TOP STATUS & METRICS BAR */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Left: Mode & Difficulty Badges */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-gaming font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-purple-400" />
            {config.id} ({gridSize}×{gridSize})
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold uppercase tracking-wider hidden xs:inline-flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            {mode.replace('_', ' ')}
          </span>
        </div>

        {/* Center: Progress & Combo Badge */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Progress Bar */}
          <div className="flex flex-col items-center min-w-[120px] sm:min-w-[180px]">
            <div className="w-full flex justify-between text-xs font-bold text-slate-300 mb-1">
              <span>Progress</span>
              <span className="text-purple-400">{lockedCount}/{totalPieces} ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Combo Multiplier Badge */}
          {combo > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white font-gaming text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/40 animate-bounce">
              <Flame className="w-4 h-4 fill-current animate-pulse" />
              <span>{combo}x COMBO!</span>
            </div>
          )}
        </div>

        {/* Right: Timer, Moves, Score */}
        <div className="flex items-center gap-3 sm:gap-5 text-sm font-gaming font-bold">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 border ${
            mode === 'time_attack' && timer <= 15
              ? 'border-red-500 text-red-400 animate-pulse'
              : 'border-white/10 text-slate-200'
          }`}>
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{formatTime(timer)}</span>
          </div>

          {/* Moves */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 border border-white/10 text-slate-200 hidden xs:flex">
            <span className="text-slate-400 text-xs">MOVES:</span>
            <span className="text-purple-300">{moves}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-purple-500/40 text-amber-300 shadow-md">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{score.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <button
            onClick={() => { audio.playClick(); onTogglePause(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            {gameState.status === 'paused' ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{gameState.status === 'paused' ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={() => { audio.playClick(); onRestart(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            title="Restart Puzzle (Shift+R)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Restart</span>
          </button>

          <button
            onClick={() => { audio.playClick(); onUndo(); }}
            disabled={gameState.history.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Undo Last Move (U or Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Undo</span>
          </button>

          <button
            onClick={() => { audio.playClick(); onHint(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            title="Flash Hint / Auto-Lock Piece (H)"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Hint</span>
          </button>

          <button
            onClick={() => { audio.playClick(); onShuffleTray(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            title="Shuffle Pieces in Tray"
          >
            <Shuffle className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden md:inline">Shuffle Tray</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => { audio.playClick(); onToggleGridGuide(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              gridGuide ? 'bg-purple-600/30 border-purple-400 text-purple-200' : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle Grid Guide Outline"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid Guide</span>
          </button>

          <button
            onClick={() => { audio.playClick(); onTogglePeek(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isPeeking ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200' : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Hold Space or Click to Peek Reference Image"
          >
            {isPeeking ? <EyeOff className="w-3.5 h-3.5 text-cyan-300" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Peek Original</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN GAME ARENA: PUZZLE BOARD & PIECE TRAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">
        {/* Floating Text Animations (Combo / Points / Feedback) */}
        <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
          {floatingTexts.map((ft) => (
            <div
              key={ft.id}
              className="absolute animate-float-up font-gaming font-extrabold text-base sm:text-lg tracking-wider drop-shadow-md z-50 pointer-events-none"
              style={{
                left: ft.x,
                top: ft.y,
                color: ft.color,
                textShadow: '0 0 10px rgba(0,0,0,0.8), 0 0 20px currentColor',
              }}
            >
              {ft.text}
            </div>
          ))}
        </div>

        {/* LEFT/TOP: PUZZLE BOARD GRID */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="relative p-3 rounded-3xl glass-panel border border-white/15 shadow-2xl bg-slate-950/80 max-w-full">
            {/* Board Header / Title */}
            <div className="flex items-center justify-between mb-2 px-2 text-xs text-slate-400">
              <span className="font-semibold uppercase truncate max-w-[200px] text-purple-300">{imageTitle}</span>
              <span>Drop onto grid cells</span>
            </div>

            {/* Grid Container */}
            <div
              ref={boardRef}
              className="relative w-[320px] xs:w-[400px] sm:w-[500px] md:w-[560px] aspect-square rounded-2xl overflow-hidden bg-slate-900/90 shadow-inner border-2 border-purple-500/30 select-none"
            >
              {/* Reference Peek Overlay */}
              {isPeeking && imageSrc && (
                <div className="absolute inset-0 z-30 animate-fadeIn bg-black/40 backdrop-blur-xs">
                  <img src={imageSrc} alt="Original Reference" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  <div className="absolute bottom-3 right-3 bg-slate-950/80 px-3 py-1 rounded-full border border-cyan-400/50 text-cyan-300 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <Eye className="w-3.5 h-3.5 animate-pulse" />
                    <span>Reference View Active</span>
                  </div>
                </div>
              )}

              {/* Grid Cells Background / Guide Outlines */}
              <div
                className="absolute inset-0 grid pointer-events-none"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
                  const r = Math.floor(idx / gridSize);
                  const c = idx % gridSize;
                  const isHovered = hoveredCell?.row === r && hoveredCell?.col === c && draggingPiece;
                  const isHintTarget = hintPieceId && pieces.find(p => p.id === hintPieceId)?.targetPos.x === c && pieces.find(p => p.id === hintPieceId)?.targetPos.y === r;

                  return (
                    <div
                      key={idx}
                      className={`relative transition-all duration-150 ${
                        gridGuide ? 'border border-white/10' : ''
                      } ${
                        isHovered
                          ? 'bg-purple-500/40 border-2 border-purple-400 shadow-[inset_0_0_20px_rgba(168,85,247,0.5)] z-10 scale-[0.99]'
                          : isHintTarget
                          ? 'bg-amber-500/30 border-2 border-amber-400 animate-pulse z-10 shadow-[inset_0_0_20px_rgba(245,158,11,0.6)]'
                          : ''
                      }`}
                    >
                      {/* Cell Coordinate Number (faint when empty) */}
                      {gridGuide && !pieces.some(p => !p.isInTray && p.currentPos.x === c && p.currentPos.y === r) && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white/10 pointer-events-none">
                          {r + 1},{c + 1}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Render Pieces Placed on the Board */}
              {pieces
                .filter((p) => !p.isInTray && p.id !== draggingPiece?.id)
                .map((piece) => {
                  const widthPct = 100 / gridSize;
                  const heightPct = 100 / gridSize;
                  const leftPct = piece.currentPos.x * widthPct;
                  const topPct = piece.currentPos.y * heightPct;
                  const isHinted = piece.id === hintPieceId;

                  return (
                    <div
                      key={piece.id}
                      onPointerDown={(e) => handlePointerDown(e, piece)}
                      style={{
                        position: 'absolute',
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                        touchAction: 'none',
                      }}
                      className={`transition-transform duration-200 ${
                        piece.isLocked
                          ? 'cursor-default z-10'
                          : 'cursor-grab active:cursor-grabbing z-20 hover:scale-[1.02] hover:z-30'
                      } ${isHinted ? 'ring-4 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.8)] z-30 animate-pulse' : ''}`}
                    >
                      <img
                        src={piece.dataUrl}
                        alt="piece"
                        className={`w-full h-full object-cover select-none pointer-events-none ${
                          piece.isLocked
                            ? 'drop-shadow-sm brightness-100'
                            : 'drop-shadow-lg ring-1 ring-purple-400/50 rounded-xs'
                        }`}
                        draggable={false}
                      />
                      {piece.isLocked && pieceStyle === 'modern' && (
                        <div className="absolute inset-0 border border-emerald-400/20 pointer-events-none" />
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Reference Corner Thumbnail Widget */}
            {!isPeeking && imageSrc && (
              <div className="absolute -bottom-4 -left-4 z-20 hidden sm:block group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-purple-500/50 shadow-2xl bg-slate-950/90 transition-all duration-300 group-hover:scale-150 group-hover:border-purple-400 group-hover:shadow-purple-500/50 group-hover:z-30 origin-bottom-left cursor-pointer">
                  <img src={imageSrc} alt="Thumb" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:opacity-0 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white bg-slate-900/80 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Reference
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT/BOTTOM: PIECE TRAY / DECK */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div
            ref={trayRef}
            className={`glass-panel rounded-3xl p-4 border transition-all duration-200 flex flex-col h-[400px] sm:h-[530px] shadow-xl ${
              hoverTray ? 'border-purple-400 bg-purple-950/30 ring-2 ring-purple-400/40' : 'border-white/10'
            }`}
          >
            {/* Tray Header & Filter Tabs */}
            <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="font-gaming text-sm sm:text-base font-bold text-white">
                  PIECE TRAY ({trayPieces.length})
                </h3>
              </div>

              {/* Filter Tabs (All / Edges / Inner) */}
              <div className="flex items-center bg-slate-900/80 rounded-lg p-0.5 border border-white/10 text-xs">
                <button
                  onClick={() => { audio.playClick(); setTrayFilter('all'); }}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                    trayFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => { audio.playClick(); setTrayFilter('edge'); }}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                    trayFilter === 'edge' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Edges
                </button>
                <button
                  onClick={() => { audio.playClick(); setTrayFilter('inner'); }}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                    trayFilter === 'inner' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Inner
                </button>
              </div>
            </div>

            {/* Tray Scrollable Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              {trayPieces.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Award className="w-10 h-10 mb-2 opacity-30 text-purple-400" />
                  <p className="font-gaming text-sm font-bold text-slate-400">Tray is Empty!</p>
                  <p className="text-xs mt-1">All pieces are placed on the board.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-2">
                  {trayPieces.map((piece) => {
                    const isHinted = piece.id === hintPieceId;
                    return (
                      <div
                        key={piece.id}
                        onPointerDown={(e) => handlePointerDown(e, piece)}
                        style={{ touchAction: 'none' }}
                        className={`group relative aspect-square rounded-xl overflow-hidden bg-slate-900/80 border transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-105 hover:z-10 hover:shadow-lg ${
                          isHinted
                            ? 'border-amber-400 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.7)] animate-pulse'
                            : 'border-white/10 hover:border-purple-500/60'
                        }`}
                      >
                        <img
                          src={piece.dataUrl}
                          alt="tray-piece"
                          className="w-full h-full object-cover select-none pointer-events-none transition-transform group-hover:scale-105"
                          draggable={false}
                        />
                        {isHinted && (
                          <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 rounded-full p-0.5 shadow animate-bounce">
                            <Lightbulb className="w-3 h-3 fill-current" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tray Footer */}
            <div className="pt-2 mt-2 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
              <span>💡 Drag pieces to board</span>
              <span>{trayPieces.length} available</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DRAGGING FLOATING GHOST ELEMENT */}
      {draggingPiece && (
        <div
          style={{
            position: 'fixed',
            left: pointerPos.x - dragOffset.x,
            top: pointerPos.y - dragOffset.y,
            width: boardRef.current ? boardRef.current.clientWidth / gridSize : 100,
            height: boardRef.current ? boardRef.current.clientHeight / gridSize : 100,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          className="rounded-lg shadow-[0_15px_35px_rgba(0,0,0,0.7),0_0_25px_rgba(168,85,247,0.6)] border-2 border-purple-400 scale-110 rotate-2 transition-transform duration-75 select-none"
        >
          <img src={draggingPiece.dataUrl} alt="dragging" className="w-full h-full object-cover rounded-md" />
        </div>
      )}
    </div>
  );
};
