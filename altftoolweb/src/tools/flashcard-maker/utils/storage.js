const STORAGE_KEY = 'flashcard_maker_decks';

export const saveDecks = (decks) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  }
};

export const loadDecks = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved decks', e);
        return [];
      }
    }
  }
  return [
    {
      id: 'default',
      name: 'General Knowledge',
      cards: [
        {
          id: '1',
          front: 'What is the capital of France?',
          back: 'Paris',
          difficulty: 'easy',
          lastStudied: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          front: 'What is photosynthesis?',
          back: 'The process plants use to make food using sunlight.',
          difficulty: 'medium',
          lastStudied: null,
          createdAt: new Date().toISOString(),
        }
      ]
    }
  ];
};

export const exportDecks = (decks) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(decks));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `flashcards_export_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
