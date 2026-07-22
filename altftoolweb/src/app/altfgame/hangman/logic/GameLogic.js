
// Categories and Words Data
export const CATEGORIES = {
    MOVIES: [
        "AVATAR", "TITANIC", "INCEPTION", "GLADIATOR", "INTERSTELLAR",
        "FROZEN", "JOKER", "MATRIX", "ROCKY", "ALIEN", "JAWS", "GODFATHER"
    ],
    ANIMALS: [
        "ELEPHANT", "GIRAFFE", "DOLPHIN", "KANGAROO", "PENGUIN",
        "CHEETAH", "GORILLA", "PLATYPUS", "SQUIRREL", "OCTOPUS", "HAMSTER"
    ],
    COUNTRIES: [
        "AUSTRALIA", "BRAZIL", "CANADA", "DENMARK", "EGYPT",
        "FRANCE", "GERMANY", "INDIA", "JAPAN", "KENYA", "MEXICO", "NORWAY"
    ],
    SPORTS: [
        "CRICKET", "FOOTBALL", "TENNIS", "HOCKEY", "BASEBALL",
        "RUGBY", "GOLF", "BOXING", "SWIMMING", "VOLLEYBALL", "BADMINTON"
    ],
    GENERAL: [
        "ADVENTURE", "BREAKFAST", "COMPUTER", "DIAMOND", "ECLIPSE",
        "FESTIVAL", "GALAXY", "HARMONY", "INTERNET", "JOURNEY", "LIBRARY"
    ]
};

export const MAX_ATTEMPTS = 8; // Corresponds to 8 hangman stages

export class HangmanLogic {
    constructor(category = 'GENERAL') {
        this.category = category;
        this.reset(category);
    }

    reset(category) {
        this.category = category || this.category;
        const words = CATEGORIES[this.category];
        this.word = words[Math.floor(Math.random() * words.length)];
        this.guessedLetters = new Set();
        this.wrongGuesses = 0;
        this.status = 'PLAYING'; // PLAYING, WON, LOST
    }

    guess(letter) {
        letter = letter.toUpperCase();

        if (this.status !== 'PLAYING') return null;
        if (this.guessedLetters.has(letter)) return null; // Already guessed

        this.guessedLetters.add(letter);

        if (this.word.includes(letter)) {
            // Correct guess
            if (this.checkWin()) {
                this.status = 'WON';
            }
            return { correct: true, status: this.status };
        } else {
            // Incorrect guess
            this.wrongGuesses++;
            if (this.wrongGuesses >= MAX_ATTEMPTS) {
                this.status = 'LOST';
            }
            return { correct: false, status: this.status };
        }
    }

    checkWin() {
        // Check if all letters in word are guessed
        // Ignore spaces if we had them (current lists are single words mostly, but good practice)
        for (let char of this.word) {
            if (char !== ' ' && !this.guessedLetters.has(char)) {
                return false;
            }
        }
        return true;
    }

    getMaskedWord() {
        return this.word.split('').map(char => {
            if (char === ' ') return ' ';
            return this.guessedLetters.has(char) ? char : '_';
        }).join(' ');
    }

    getGameState() {
        return {
            word: this.word, // For debug/end game
            maskedWord: this.getMaskedWord(),
            guessedLetters: Array.from(this.guessedLetters),
            wrongGuesses: this.wrongGuesses,
            maxAttempts: MAX_ATTEMPTS,
            status: this.status,
            category: this.category
        };
    }
}
