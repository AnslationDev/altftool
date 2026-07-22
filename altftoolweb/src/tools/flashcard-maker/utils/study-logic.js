/**
 * Spaced Repetition & Study Logic
 */

export const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', color: 'bg-green-100 text-green-700' },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'hard', label: 'Hard', color: 'bg-red-100 text-red-700' },
];

export const getNextCard = (cards, currentIndex, shuffle = false) => {
  if (!cards.length) return null;
  if (shuffle) {
    return Math.floor(Math.random() * cards.length);
  }
  return (currentIndex + 1) % cards.length;
};

export const calculateProgress = (session) => {
  const total = session.correct + session.incorrect;
  if (total === 0) return 0;
  return Math.round((session.correct / total) * 100);
};

export const sortCards = (cards, criteria) => {
  const sorted = [...cards];
  switch (criteria) {
    case 'alphabetical':
      return sorted.sort((a, b) => a.front.localeCompare(b.front));
    case 'difficulty':
      const order = { easy: 0, medium: 1, hard: 2 };
      return sorted.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
    case 'recent':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    default:
      return sorted;
  }
};

export const filterCards = (cards, query, difficulty) => {
  return cards.filter(card => {
    const matchesQuery = card.front.toLowerCase().includes(query.toLowerCase()) ||
                         card.back.toLowerCase().includes(query.toLowerCase());
    const matchesDifficulty = !difficulty || card.difficulty === difficulty;
    return matchesQuery && matchesDifficulty;
  });
};
