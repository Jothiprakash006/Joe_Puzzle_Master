import { HighScore, UserSettings, GameState } from '../types/game';

const SETTINGS_KEY = 'puzzle_master_settings_v1';
const HIGHSCORES_KEY = 'puzzle_master_highscores_v1';
const AUTOSAVE_KEY = 'puzzle_master_autosave_v1';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'night',
  soundEnabled: true,
  musicEnabled: false,
  volume: 0.6,
};

export function getSettings(): UserSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(saved);
    return { ...DEFAULT_SETTINGS, ...parsed, theme: 'night' };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
}

export function getHighScores(): HighScore[] {
  try {
    const saved = localStorage.getItem(HIGHSCORES_KEY);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch (e) {
    return [];
  }
}

export function saveHighScore(score: Omit<HighScore, 'id' | 'date'>): HighScore {
  const current = getHighScores();
  const newEntry: HighScore = {
    ...score,
    id: 'hs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    date: new Date().toLocaleDateString(),
  };

  const updated = [...current, newEntry].sort((a, b) => b.score - a.score).slice(0, 50); // Keep top 50 across modes
  try {
    localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(updated));
  } catch (e) {}
  return newEntry;
}

export function clearHighScores(): void {
  try {
    localStorage.removeItem(HIGHSCORES_KEY);
  } catch (e) {}
}

export function saveGameProgress(state: GameState): void {
  try {
    // We only save necessary fields to avoid storage quota overflow
    const minimalState = {
      difficulty: state.difficulty,
      mode: state.mode,
      pieceStyle: state.pieceStyle,
      imageSrc: state.imageSrc,
      imageTitle: state.imageTitle,
      pieces: state.pieces,
      timer: state.timer,
      moves: state.moves,
      combo: state.combo,
      maxCombo: state.maxCombo,
      score: state.score,
      correctPlacements: state.correctPlacements,
      totalAttempts: state.totalAttempts,
      history: state.history,
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(minimalState));
  } catch (e) {
    console.warn('Could not auto-save game progress to localStorage', e);
  }
}

export function getSavedGameProgress(): Partial<GameState> | null {
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (e) {
    return null;
  }
}

export function clearSavedGameProgress(): void {
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
  } catch (e) {}
}
