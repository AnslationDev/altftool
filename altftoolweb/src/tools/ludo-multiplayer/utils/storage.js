const STATS_KEY = "altft-ludo-stats";
const SETTINGS_KEY = "altft-ludo-settings";

export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : getDefaultStats();
  } catch {
    return getDefaultStats();
  }
}

export function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : getDefaultSettings();
  } catch {
    return getDefaultSettings();
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

function getDefaultStats() {
  return {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    totalTurns: 0,
    totalDiceRolls: 0,
    longestGame: 0,
    fastestWin: Infinity,
    aiDifficultyStats: { easy: { wins: 0, losses: 0 }, medium: { wins: 0, losses: 0 }, hard: { wins: 0, losses: 0 } },
  };
}

function getDefaultSettings() {
  return {
    boardTheme: "classic",
    animationSpeed: "normal",
    soundEnabled: true,
    musicEnabled: false,
    diceTheme: "classic",
    tokenTheme: "classic",
    backgroundTheme: "classic",
  };
}
