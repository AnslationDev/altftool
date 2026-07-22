/**
 * AI-assisted flashcard generator (Client-side)
 * Uses pattern matching and NLP-lite logic to extract Q&A pairs from notes.
 */
export const parseAIGeneratedCards = (text) => {
  if (!text || text.trim().length < 10) return [];

  const lines = text.split(/\n+/).filter(line => line.trim().length > 0);
  const cards = [];

  lines.forEach(line => {
    // Pattern 1: Term - Definition (e.g., "Photosynthesis: The process of...")
    const colonMatch = line.match(/^([^:?]+):\s*(.+)$/);
    if (colonMatch) {
      cards.push({
        id: Math.random().toString(36).substr(2, 9),
        front: colonMatch[1].trim(),
        back: colonMatch[2].trim(),
        difficulty: 'medium',
        createdAt: new Date().toISOString(),
      });
      return;
    }

    // Pattern 2: Question ? Answer
    const questionMatch = line.match(/^([^?]+\?)\s*(.+)$/);
    if (questionMatch) {
      cards.push({
        id: Math.random().toString(36).substr(2, 9),
        front: questionMatch[1].trim(),
        back: questionMatch[2].trim(),
        difficulty: 'medium',
        createdAt: new Date().toISOString(),
      });
      return;
    }

    // Pattern 3: Sentence with "is" or "means"
    const isMatch = line.match(/^([^.]{3,30}?)\s+(is|means|refers to|is defined as)\s+(.+)$/i);
    if (isMatch) {
      cards.push({
        id: Math.random().toString(36).substr(2, 9),
        front: `What is ${isMatch[1].trim()}?`,
        back: isMatch[3].trim().charAt(0).toUpperCase() + isMatch[3].trim().slice(1),
        difficulty: 'medium',
        createdAt: new Date().toISOString(),
      });
      return;
    }

    // Generic fallback for short sentences
    if (line.length > 20 && line.length < 200) {
        const words = line.trim().split(' ');
        if (words.length > 5) {
             cards.push({
                id: Math.random().toString(36).substr(2, 9),
                front: words.slice(0, 3).join(' ') + '...',
                back: line.trim(),
                difficulty: 'medium',
                createdAt: new Date().toISOString(),
            });
        }
    }
  });

  // Deduplicate and filter
  return cards.filter((card, index, self) =>
    index === self.findIndex((t) => t.front === card.front)
  );
};
