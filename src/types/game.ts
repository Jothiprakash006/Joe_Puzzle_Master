export type DifficultyLevel = '2x2' | '3x3' | '4x4' | '5x5' | '6x6' | '8x8';

export interface DifficultyConfig {
  id: DifficultyLevel;
  label: string;
  gridSize: number;
  totalPieces: number;
  timeLimit?: number; // in seconds for Time Attack
  starThresholds: { time: number; moves: number }; // Target for 3 stars
  baseScore: number;
}

export const DIFFICULTIES: Record<DifficultyLevel, DifficultyConfig> = {
  '2x2': {
    id: '2x2',
    label: 'Easy (2×2)',
    gridSize: 2,
    totalPieces: 4,
    timeLimit: 30,
    starThresholds: { time: 10, moves: 6 },
    baseScore: 500,
  },
  '3x3': {
    id: '3x3',
    label: 'Normal (3×3)',
    gridSize: 3,
    totalPieces: 9,
    timeLimit: 90,
    starThresholds: { time: 30, moves: 15 },
    baseScore: 1000,
  },
  '4x4': {
    id: '4x4',
    label: 'Hard (4×4)',
    gridSize: 4,
    totalPieces: 16,
    timeLimit: 180,
    starThresholds: { time: 60, moves: 30 },
    baseScore: 2500,
  },
  '5x5': {
    id: '5x5',
    label: 'Expert (5×5)',
    gridSize: 5,
    totalPieces: 25,
    timeLimit: 300,
    starThresholds: { time: 120, moves: 50 },
    baseScore: 5000,
  },
  '6x6': {
    id: '6x6',
    label: 'Master (6×6)',
    gridSize: 6,
    totalPieces: 36,
    timeLimit: 450,
    starThresholds: { time: 240, moves: 80 },
    baseScore: 8000,
  },
  '8x8': {
    id: '8x8',
    label: 'Impossible (8×8)',
    gridSize: 8,
    totalPieces: 64,
    timeLimit: 720,
    starThresholds: { time: 480, moves: 150 },
    baseScore: 15000,
  },
};

export type GameMode = 'standard' | 'snap' | 'time_attack' | 'zen';
export type PieceStyle = 'modern' | 'jigsaw';
export type ThemeMode = 'night';

export interface PuzzlePiece {
  id: string;
  index: number;
  row: number;
  col: number;
  currentPos: { x: number; y: number }; // Grid position or tray coordinate
  targetPos: { x: number; y: number }; // Correct grid coordinate (col, row)
  isLocked: boolean;
  isInTray: boolean;
  dataUrl: string;
  // For classic jigsaw shapes: tabs on top, right, bottom, left (-1: blank/inward, 0: flat edge, 1: tab/outward)
  tabs?: [number, number, number, number];
}

export type GameStatus = 'start' | 'uploading' | 'playing' | 'paused' | 'won' | 'gameover';

export interface MoveHistory {
  pieceId: string;
  from: { isInTray: boolean; pos: { x: number; y: number } };
  to: { isInTray: boolean; pos: { x: number; y: number } };
  wasLocked: boolean;
}

export interface GameState {
  status: GameStatus;
  difficulty: DifficultyLevel;
  mode: GameMode;
  pieceStyle: PieceStyle;
  imageSrc: string | null;
  imageTitle: string;
  pieces: PuzzlePiece[];
  timer: number; // Seconds elapsed or remaining
  moves: number;
  combo: number;
  maxCombo: number;
  score: number;
  correctPlacements: number;
  totalAttempts: number;
  history: MoveHistory[];
  hintPieceId: string | null;
  isPeeking: boolean;
  gridGuide: boolean;
  shakeIntensity: 'none' | 'mild' | 'intense';
  floatingTexts: { id: string; text: string; x: number; y: number; color: string }[];
}

export interface HighScore {
  id: string;
  date: string;
  difficulty: DifficultyLevel;
  mode: GameMode;
  score: number;
  timeTaken: number;
  moves: number;
  accuracy: number;
  imageTitle: string;
}

export interface UserSettings {
  theme: ThemeMode;
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
}
