export const EMOJIS = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨',
    '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦',
    '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝',
    '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂'
];

export const DIFFICULTIES = {
    easy: { rows: 4, cols: 4, pairs: 8, label: 'Easy' },
    medium: { rows: 5, cols: 4, pairs: 10, label: 'Medium' },
    hard: { rows: 6, cols: 6, pairs: 18, label: 'Hard' }
};

export const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const generateDeck = (difficulty) => {
    const config = DIFFICULTIES[difficulty];
    const selectedEmojis = shuffleArray(EMOJIS).slice(0, config.pairs);
    const deck = [...selectedEmojis, ...selectedEmojis];

    return shuffleArray(deck).map((emoji, index) => ({
        id: `card-${index}`,
        value: emoji,
        isFlipped: false,
        isMatched: false
    }));
};

export const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
