export const ACHIEVEMENTS = [
  {
    id: "first_flip",
    title: "First Toss",
    description: "Flip your first coin",
    icon: "🪙",
    requirement: (stats) => stats.flips >= 1,
  },
  {
    id: "flip_10",
    title: "Decisive Mind",
    description: "Reach 10 total flips",
    icon: "⚡",
    requirement: (stats) => stats.flips >= 10,
  },
  {
    id: "flip_50",
    title: "Coin Master",
    description: "Reach 50 total flips",
    icon: "🏆",
    requirement: (stats) => stats.flips >= 50,
  },
  {
    id: "flip_100",
    title: "Centurion",
    description: "Reach 100 total flips",
    icon: "👑",
    requirement: (stats) => stats.flips >= 100,
  },
  {
    id: "streak_3",
    title: "On a Roll",
    description: "Get a 3-flip streak on the same side",
    icon: "🔥",
    requirement: (stats) => stats.bestLength >= 3,
  },
  {
    id: "streak_5",
    title: "Unstoppable",
    description: "Get a 5-flip streak on the same side",
    icon: "🌟",
    requirement: (stats) => stats.bestLength >= 5,
  },
  {
    id: "balanced",
    title: "Perfect Balance",
    description: "Reach equal Heads & Tails (at least 20 flips)",
    icon: "⚖️",
    requirement: (stats) => stats.flips >= 20 && stats.heads === stats.tails,
  },
  {
    id: "skin_collector",
    title: "Coin Collector",
    description: "Try at least 3 coin skins",
    icon: "🎨",
    requirement: (stats, extra) => (extra?.usedSkinsCount || 1) >= 3,
  },
  {
    id: "auto_flipper",
    title: "Hands Free",
    description: "Enable Auto-Flip mode",
    icon: "🤖",
    requirement: (stats, extra) => extra?.autoFlipUsed === true,
  },
  {
    id: "series_victor",
    title: "Series Champion",
    description: "Win a Best-of series",
    icon: "🥇",
    requirement: (stats, extra) => extra?.seriesWinner === true,
  },
];

export function checkNewAchievements(currentUnlocked = [], stats, extra = {}) {
  const newlyUnlocked = [];
  ACHIEVEMENTS.forEach((ach) => {
    if (!currentUnlocked.includes(ach.id)) {
      if (ach.requirement(stats, extra)) {
        newlyUnlocked.push(ach.id);
      }
    }
  });
  return newlyUnlocked;
}
