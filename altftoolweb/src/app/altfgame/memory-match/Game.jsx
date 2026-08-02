"use client";

import { useState, useEffect, useCallback } from 'react';
import Card from './components/Card';
import { generateDeck, formatTime, DIFFICULTIES } from './utils';
import audioManager from './AudioManager';

const MemoryMatchGame = () => {
    // Game Configuration State
    const [difficulty, setDifficulty] = useState('easy');

    // Game Play State
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]); // Stores indices
    const [moves, setMoves] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // Prevents interaction during animations

    // Initialize Game
    const startNewGame = useCallback((selectedDifficulty = difficulty) => {
        // Init Audio Context on first interaction
        audioManager.init();

        const newDeck = generateDeck(selectedDifficulty);
        setCards(newDeck);
        setFlippedCards([]);
        setMoves(0);
        setTimer(0);
        setIsPlaying(true);
        setIsGameOver(false);
        setIsProcessing(false);
    }, [difficulty]);

    // Initial Start
    useEffect(() => {
        startNewGame();
    }, []); // Run once on mount

    // Timer Logic
    useEffect(() => {
        let interval;
        if (isPlaying && !isGameOver) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isGameOver]);

    // Check for Win
    useEffect(() => {
        if (cards.length > 0 && cards.every(card => card.isMatched)) {
            setIsGameOver(true);
            setIsPlaying(false);
            audioManager.playWin();
        }
    }, [cards]);

    // Handle Card Click
    const handleCardClick = (clickedCard) => {
        // Validation: Ignore if processing, game over, already flipped, or matched
        if (
            isProcessing ||
            !isPlaying ||
            isGameOver ||
            clickedCard.isFlipped ||
            clickedCard.isMatched
        ) return;

        audioManager.playFlip();

        // Find index of clicked card
        const clickedIndex = cards.findIndex(c => c.id === clickedCard.id);

        // Flip the card
        const newCards = [...cards];
        newCards[clickedIndex].isFlipped = true;
        setCards(newCards);

        const newFlipped = [...flippedCards, clickedIndex];
        setFlippedCards(newFlipped);

        // If 2 cards flipped, check match
        if (newFlipped.length === 2) {
            setIsProcessing(true);
            setMoves(prev => prev + 1);

            const [firstIndex, secondIndex] = newFlipped;
            const firstCard = cards[firstIndex];
            const secondCard = cards[clickedIndex];

            if (firstCard.value === secondCard.value) {
                // MATCH!
                audioManager.playMatch();
                setTimeout(() => {
                    const matchedCards = [...newCards];
                    matchedCards[firstIndex].isMatched = true;
                    matchedCards[clickedIndex].isMatched = true;
                    // Keep them flipped but mark matched
                    setCards(matchedCards);
                    setFlippedCards([]);
                    setIsProcessing(false);
                }, 500);
            } else {
                // NO MATCH
                setTimeout(() => {
                    audioManager.playMismatch();
                    const resetCards = [...newCards];
                    resetCards[firstIndex].isFlipped = false;
                    resetCards[clickedIndex].isFlipped = false;
                    setCards(resetCards);
                    setFlippedCards([]);
                    setIsProcessing(false);
                }, 1000);
            }
        }
    };

    // Dynamic Grid Classes
    const getGridClass = () => {
        switch (difficulty) {
            case 'easy': return 'grid-cols-4 max-w-sm'; // 4x4
            case 'medium': return 'grid-cols-4 sm:grid-cols-5 max-w-md'; // 4x5 or 5x4
            case 'hard': return 'grid-cols-6 max-w-lg'; // 6x6
            default: return 'grid-cols-4';
        }
    };

    return (
        <div className="h-full w-full bg-gray-900 text-white p-2 md:p-4 flex flex-col items-center justify-start md:justify-center font-sans overflow-y-auto scrollbar-hide">

            {/* Header / HUD */}
            <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between mb-4 gap-4 shrink-0">
                <div className="flex flex-col items-center md:items-start">
                    <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                        MEMORY MATCH
                    </h2>
                    <div className="text-gray-400 text-xs font-medium tracking-widest">ARCADE EDITION</div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 bg-gray-800/50 px-6 py-2 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Time</span>
                        <span className="text-lg font-mono font-bold text-white">{formatTime(timer)}</span>
                    </div>
                    <div className="w-px h-6 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Moves</span>
                        <span className="text-lg font-mono font-bold text-indigo-400">{moves}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <select
                        value={difficulty}
                        onChange={(e) => {
                            setDifficulty(e.target.value);
                            startNewGame(e.target.value);
                        }}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        {Object.entries(DIFFICULTIES).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => startNewGame()}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        Restart
                    </button>
                </div>
            </div>

            {/* Game Grid */}
            <div className={`grid gap-2 w-full mx-auto transition-all duration-300 ${getGridClass()}`}>
                {cards.map((card) => (
                    <Card
                        key={card.id}
                        card={card}
                        onClick={handleCardClick}
                        disabled={isProcessing}
                    />
                ))}
            </div>

            {/* Game Over Modal */}
            {isGameOver && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="text-6xl mb-4 animate-bounce">🏆</div>
                        <h2 className="text-3xl font-black text-white mb-2">Victory!</h2>
                        <p className="text-gray-400 mb-8">You cleared the board.</p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-900/50 p-4 rounded-xl">
                                <div className="text-sm text-gray-500 uppercase font-bold">Time</div>
                                <div className="text-2xl font-mono font-bold text-white">{formatTime(timer)}</div>
                            </div>
                            <div className="bg-gray-900/50 p-4 rounded-xl">
                                <div className="text-sm text-gray-500 uppercase font-bold">Moves</div>
                                <div className="text-2xl font-mono font-bold text-indigo-400">{moves}</div>
                            </div>
                        </div>

                        <button
                            onClick={() => startNewGame()}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold text-lg shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemoryMatchGame;
