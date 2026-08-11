import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StartScreen } from './components/StartScreen';
import { GameBoard } from './components/GameBoard';
import { WinModal } from './components/WinModal';
import { GameOverModal } from './components/GameOverModal';
import { HighScoreModal } from './components/HighScoreModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { GameState, DifficultyLevel, GameMode, PieceStyle, ThemeMode, DIFFICULTIES, MoveHistory } from './types/game';
import { prepareSquareImage, createPuzzlePieces } from './utils/imageUtils';
import { getSettings, saveSettings, saveHighScore, saveGameProgress, getSavedGameProgress, clearSavedGameProgress, getHighScores } from './utils/storage';
import { audio } from './utils/audio';

export default function App() {
  // Settings & Themes
  const initialSettings = getSettings();
  const [soundEnabled, setSoundEnabled] = useState<boolean>(initialSettings.soundEnabled);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(initialSettings.musicEnabled);

  // Modals
  const [showHighScores, setShowHighScores] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Loading state when slicing images
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Saved Game Check
  const [savedGame, setSavedGame] = useState<Partial<GameState> | null>(null);

  useEffect(() => {
    const saved = getSavedGameProgress();
    if (saved && saved.pieces && saved.pieces.length > 0) {
      setSavedGame(saved);
    }
    // Initialize audio settings
    audio.setSoundEnabled(soundEnabled);
    audio.setMusicEnabled(musicEnabled);
  }, []);

  // Set body theme background for night mode
  useEffect(() => {
    document.body.className = `theme-night min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden transition-colors duration-300`;
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.setSoundEnabled(next);
    saveSettings({ theme: 'night', soundEnabled: next, musicEnabled, volume: 0.6 });
  };

  const handleToggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    audio.setMusicEnabled(next);
    saveSettings({ theme: 'night', soundEnabled, musicEnabled: next, volume: 0.6 });
  };

  // Core Game State
  const [gameState, setGameState] = useState<GameState>({
    status: 'start',
    difficulty: '3x3',
    mode: 'standard',
    pieceStyle: 'modern',
    imageSrc: null,
    imageTitle: 'Custom Art',
    pieces: [],
    timer: 0,
    moves: 0,
    combo: 0,
    maxCombo: 0,
    score: 0,
    correctPlacements: 0,
    totalAttempts: 0,
    history: [],
    hintPieceId: null,
    isPeeking: false,
    gridGuide: true,
    shakeIntensity: 'none',
    floatingTexts: [],
  });

  // Timer Loop & Time Attack check
  useEffect(() => {
    let interval: any = null;
    if (gameState.status === 'playing') {
      interval = setInterval(() => {
        setGameState((prev) => {
          if (prev.status !== 'playing') return prev;

          if (prev.mode === 'time_attack') {
            const nextTime = prev.timer - 1;
            if (nextTime <= 0) {
              audio.playWrong();
              return { ...prev, timer: 0, status: 'gameover' };
            }
            return { ...prev, timer: nextTime };
          } else {
            return { ...prev, timer: prev.timer + 1 };
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.status]);

  // Auto-save game progress periodically or on move
  useEffect(() => {
    if (gameState.status === 'playing' || gameState.status === 'paused') {
      saveGameProgress(gameState);
    }
  }, [gameState.pieces, gameState.moves, gameState.status]);

  // Launch New Game
  const startNewGame = async (
    imageSrc: string | File,
    title: string,
    difficulty: DifficultyLevel,
    mode: GameMode,
    style: PieceStyle
  ) => {
    setIsProcessing(true);
    try {
      const { dataUrl, title: cleanTitle } = await prepareSquareImage(imageSrc);
      const config = DIFFICULTIES[difficulty];
      const pieces = await createPuzzlePieces(dataUrl, config.gridSize, style);

      const initialTimer = mode === 'time_attack' ? config.timeLimit || 120 : 0;

      setGameState({
        status: 'playing',
        difficulty,
        mode,
        pieceStyle: style,
        imageSrc: dataUrl,
        imageTitle: cleanTitle || title,
        pieces,
        timer: initialTimer,
        moves: 0,
        combo: 0,
        maxCombo: 0,
        score: 0,
        correctPlacements: 0,
        totalAttempts: 0,
        history: [],
        hintPieceId: null,
        isPeeking: false,
        gridGuide: true,
        shakeIntensity: 'none',
        floatingTexts: [],
      });
      setIsNewHighScore(false);
      clearSavedGameProgress();
    } catch (e) {
      console.error('Error starting game:', e);
      alert('Could not start puzzle. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Resume Auto-Saved Game
  const resumeSavedGame = (saved: Partial<GameState>) => {
    if (!saved || !saved.pieces) return;
    setGameState((prev) => ({
      ...prev,
      ...saved,
      status: 'playing',
      shakeIntensity: 'none',
      floatingTexts: [],
      hintPieceId: null,
      isPeeking: false,
    } as GameState));
  };

  // Spawn Floating Text (Combo, Points)
  const spawnFloatingText = useCallback((text: string, x: number, y: number, color: string = '#f59e0b') => {
    const id = 'ft_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    setGameState((prev) => ({
      ...prev,
      floatingTexts: [...prev.floatingTexts, { id, text, x, y, color }],
    }));
    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        floatingTexts: prev.floatingTexts.filter((t) => t.id !== id),
      }));
    }, 1200);
  }, []);

  // Trigger Screen Shake
  const triggerShake = useCallback((intensity: 'mild' | 'intense') => {
    setGameState((prev) => ({ ...prev, shakeIntensity: intensity }));
    setTimeout(() => {
      setGameState((prev) => ({ ...prev, shakeIntensity: 'none' }));
    }, 500);
  }, []);

  // Handle Piece Drop Mechanics
  const handlePieceDrop = (pieceId: string, targetRow: number, targetCol: number, toTray: boolean) => {
    setGameState((prev) => {
      if (prev.status !== 'playing') return prev;

      const pieceIndex = prev.pieces.findIndex((p) => p.id === pieceId);
      if (pieceIndex === -1) return prev;

      const piece = prev.pieces[pieceIndex];
      if (piece.isLocked) return prev;

      const isExactMatch = !toTray && piece.targetPos.y === targetRow && piece.targetPos.x === targetCol;
      const totalAttempts = prev.totalAttempts + 1;

      // Calculate approximate screen position for floating text
      const screenX = window.innerWidth * 0.45;
      const screenY = window.innerHeight * 0.35;

      // 1. EXACT TARGET MATCH SNAP!
      if (isExactMatch) {
        audio.playSnap();
        const nextCombo = prev.combo + 1;
        const maxCombo = Math.max(prev.maxCombo, nextCombo);

        if (nextCombo > 1) {
          audio.playCombo(nextCombo);
          triggerShake(nextCombo >= 3 ? 'intense' : 'mild');
          spawnFloatingText(`+${nextCombo * 150} COMBO x${nextCombo}!`, screenX, screenY - 30, '#ec4899');
        } else {
          triggerShake('mild');
          spawnFloatingText('+100 PERFECT SNAP!', screenX, screenY, '#38bdf8');
        }

        const scoreBonus = 100 * nextCombo;
        const nextScore = prev.score + scoreBonus;
        const correctPlacements = prev.correctPlacements + 1;

        // Create undo move history
        const moveEntry: MoveHistory = {
          pieceId: piece.id,
          from: { isInTray: piece.isInTray, pos: { ...piece.currentPos } },
          to: { isInTray: false, pos: { x: targetCol, y: targetRow } },
          wasLocked: false,
        };

        const updatedPieces = prev.pieces.map((p) =>
          p.id === pieceId
            ? { ...p, isLocked: true, isInTray: false, currentPos: { x: targetCol, y: targetRow } }
            : p
        );

        // Check Victory Condition
        const allLocked = updatedPieces.every((p) => p.isLocked);
        if (allLocked) {
          clearSavedGameProgress();
          const config = DIFFICULTIES[prev.difficulty];
          const finalAccuracy = Math.round((correctPlacements / totalAttempts) * 100);
          const finalScore = nextScore + config.baseScore;

          // Check if it beat any high score
          const currentHighs = getHighScores();
          const bestInCat = currentHighs.find((h) => h.difficulty === prev.difficulty && h.mode === prev.mode);
          const isNewRecord = !bestInCat || finalScore > bestInCat.score;
          setIsNewHighScore(isNewRecord);

          saveHighScore({
            difficulty: prev.difficulty,
            mode: prev.mode,
            score: finalScore,
            timeTaken: prev.timer,
            moves: prev.moves + 1,
            accuracy: finalAccuracy,
            imageTitle: prev.imageTitle,
          });

          return {
            ...prev,
            pieces: updatedPieces,
            moves: prev.moves + 1,
            combo: nextCombo,
            maxCombo,
            score: finalScore,
            correctPlacements,
            totalAttempts,
            history: [...prev.history, moveEntry],
            status: 'won',
          };
        }

        return {
          ...prev,
          pieces: updatedPieces,
          moves: prev.moves + 1,
          combo: nextCombo,
          maxCombo,
          score: nextScore,
          correctPlacements,
          totalAttempts,
          history: [...prev.history, moveEntry],
        };
      }

      // 2. WRONG CELL DROP OR TRAY
      if (toTray) {
        audio.playDrop();
        const updatedPieces = prev.pieces.map((p) =>
          p.id === pieceId
            ? { ...p, isInTray: true, currentPos: { x: 0, y: 0 } }
            : p
        );
        return {
          ...prev,
          pieces: updatedPieces,
          combo: 0,
        };
      }

      // Dropped on board, but wrong target cell
      if (prev.mode === 'snap') {
        // Strict Mode: Error penalty and bounce back
        audio.playWrong();
        triggerShake('mild');
        spawnFloatingText('MISMATCH! BOUNCE BACK!', screenX, screenY, '#ef4444');
        return {
          ...prev,
          combo: 0,
          totalAttempts,
          score: Math.max(0, prev.score - 20),
        };
      } else {
        // Standard / Time Attack / Zen: Allow staging placement on unlocked cells!
        const occupant = prev.pieces.find(
          (p) => !p.isInTray && p.currentPos.x === targetCol && p.currentPos.y === targetRow
        );

        if (occupant && occupant.isLocked) {
          // Cannot replace locked piece -> bounce back
          audio.playDrop();
          return { ...prev, combo: 0, totalAttempts };
        }

        audio.playDrop();
        const moveEntry: MoveHistory = {
          pieceId: piece.id,
          from: { isInTray: piece.isInTray, pos: { ...piece.currentPos } },
          to: { isInTray: false, pos: { x: targetCol, y: targetRow } },
          wasLocked: false,
        };

        const updatedPieces = prev.pieces.map((p) => {
          if (p.id === pieceId) {
            return { ...p, isInTray: false, currentPos: { x: targetCol, y: targetRow } };
          }
          if (occupant && p.id === occupant.id) {
            // Swap occupant back to tray or to where the dragging piece came from
            return { ...p, isInTray: piece.isInTray, currentPos: { ...piece.currentPos } };
          }
          return p;
        });

        return {
          ...prev,
          pieces: updatedPieces,
          moves: prev.moves + 1,
          combo: 0,
          totalAttempts,
          history: [...prev.history, moveEntry],
        };
      }
    });
  };

  // Undo Move
  const handleUndo = () => {
    setGameState((prev) => {
      if (prev.history.length === 0 || prev.status !== 'playing') return prev;
      audio.playClick();
      const lastMove = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);

      const updatedPieces = prev.pieces.map((p) =>
        p.id === lastMove.pieceId
          ? { ...p, isLocked: false, isInTray: lastMove.from.isInTray, currentPos: { ...lastMove.from.pos } }
          : p
      );

      return {
        ...prev,
        pieces: updatedPieces,
        history: newHistory,
        moves: Math.max(0, prev.moves - 1),
        combo: 0,
      };
    });
  };

  // Hint Mechanism
  const handleHint = () => {
    setGameState((prev) => {
      if (prev.status !== 'playing') return prev;
      audio.playHint();

      const unlocked = prev.pieces.filter((p) => !p.isLocked);
      if (unlocked.length === 0) return prev;

      // Pick random unlocked piece
      const targetPiece = unlocked[Math.floor(Math.random() * unlocked.length)];

      return {
        ...prev,
        hintPieceId: targetPiece.id,
      };
    });

    // Auto-clear hint highlight after 3 seconds
    setTimeout(() => {
      setGameState((prev) => ({ ...prev, hintPieceId: null }));
    }, 3000);
  };

  // Shuffle Tray Pieces
  const handleShuffleTray = () => {
    audio.playClick();
    setGameState((prev) => {
      const trayPieces = prev.pieces.filter((p) => p.isInTray);
      const shuffledIndices = trayPieces.map((p) => p.id).sort(() => Math.random() - 0.5);

      const updatedPieces = prev.pieces.map((p) => {
        if (!p.isInTray) return p;
        const newIdx = shuffledIndices.indexOf(p.id);
        const config = DIFFICULTIES[prev.difficulty];
        const gs = config.gridSize;
        return {
          ...p,
          currentPos: { x: newIdx % gs, y: Math.floor(newIdx / gs) },
        };
      });

      return { ...prev, pieces: updatedPieces };
    });
  };

  // Restart Puzzle (same image and settings)
  const handleRestart = () => {
    if (!gameState.imageSrc) return;
    audio.playClick();
    startNewGame(
      gameState.imageSrc,
      gameState.imageTitle,
      gameState.difficulty,
      gameState.mode,
      gameState.pieceStyle
    );
  };

  // Return to Home Screen
  const handleBackToHome = () => {
    audio.playClick();
    setGameState((prev) => ({ ...prev, status: 'start' }));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenHighScores={() => setShowHighScores(true)}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        isPlaying={gameState.status !== 'start'}
        onBackToHome={handleBackToHome}
        soundEnabled={soundEnabled}
        musicEnabled={musicEnabled}
        onToggleSound={handleToggleSound}
        onToggleMusic={handleToggleMusic}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {gameState.status === 'start' ? (
          <StartScreen
            onStartGame={startNewGame}
            onResumeGame={resumeSavedGame}
            savedGame={savedGame}
            isLoading={isProcessing}
          />
        ) : (
          <GameBoard
            gameState={gameState}
            onPieceDrop={handlePieceDrop}
            onUndo={handleUndo}
            onHint={handleHint}
            onShuffleTray={handleShuffleTray}
            onTogglePause={() => {
              audio.playClick();
              setGameState((prev) => ({
                ...prev,
                status: prev.status === 'paused' ? 'playing' : 'paused',
              }));
            }}
            onRestart={handleRestart}
            onToggleGridGuide={() => {
              audio.playClick();
              setGameState((prev) => ({ ...prev, gridGuide: !prev.gridGuide }));
            }}
            onTogglePeek={() => {
              setGameState((prev) => ({ ...prev, isPeeking: !prev.isPeeking }));
            }}
          />
        )}
      </main>

      {/* Modals */}
      {gameState.status === 'won' && (
        <WinModal
          gameState={gameState}
          onPlayAgain={handleRestart}
          onNextDifficulty={(nextDiff) => {
            if (gameState.imageSrc) {
              startNewGame(gameState.imageSrc, gameState.imageTitle, nextDiff, gameState.mode, gameState.pieceStyle);
            }
          }}
          onHome={handleBackToHome}
          isNewHighScore={isNewHighScore}
        />
      )}

      {gameState.status === 'gameover' && (
        <GameOverModal
          gameState={gameState}
          onRetry={handleRestart}
          onHome={handleBackToHome}
        />
      )}

      {showHighScores && (
        <HighScoreModal onClose={() => setShowHighScores(false)} />
      )}

      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
}
