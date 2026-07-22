'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HangmanLogic, CATEGORIES, MAX_ATTEMPTS } from './logic/GameLogic';
import { RotateCcw, Volume2, VolumeX, Trophy, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Sound Helper ---
const playSound = (type, enabled) => {
    if (!enabled) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'win') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.setValueAtTime(600, now + 0.2);
            osc.frequency.setValueAtTime(1000, now + 0.4);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 1.0);
            osc.start(now);
            osc.stop(now + 1.0);
        } else if (type === 'lose') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.5);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        }
    } catch (e) {
        console.error("Audio failed", e);
    }
};

export default function HangmanGame() {
    // State
    const [logic] = useState(() => new HangmanLogic());
    const [gameState, setGameState] = useState(logic.getGameState());
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('GENERAL');

    // Force re-render helper
    const updateState = useCallback(() => {
        setGameState(logic.getGameState());
    }, [logic]);

    // Handle Category Change
    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        logic.reset(cat);
        updateState();
    };

    // Handle Guess
    const handleGuess = useCallback((letter) => {
        if (gameState.status !== 'PLAYING') return;

        const result = logic.guess(letter);
        if (result) {
            updateState();
            if (result.correct) {
                playSound('correct', soundEnabled);
                if (result.status === 'WON') {
                    playSound('win', soundEnabled);
                    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                }
            } else {
                playSound('wrong', soundEnabled);
                if (result.status === 'LOST') {
                    playSound('lose', soundEnabled);
                }
            }
        }
    }, [logic, gameState.status, soundEnabled, updateState]);

    // Keyboard Input
    useEffect(() => {
        const handleKeyDown = (e) => {
            const char = e.key.toUpperCase();
            if (char >= 'A' && char <= 'Z') {
                handleGuess(char);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleGuess]);

    // Restart
    const handleRestart = () => {
        logic.reset(selectedCategory);
        updateState();
    };

    // SVG Drawing Parts
    const renderHangman = () => {
        const parts = [
            // 1. Base
            <line key="base" x1="20" y1="280" x2="180" y2="280" stroke="currentColor" strokeWidth="4" />,
            // 2. Pole
            <line key="pole" x1="100" y1="280" x2="100" y2="40" stroke="currentColor" strokeWidth="4" />,
            // 3. Beam
            <line key="beam" x1="100" y1="40" x2="220" y2="40" stroke="currentColor" strokeWidth="4" />,
            // 4. Rope
            <line key="rope" x1="220" y1="40" x2="220" y2="80" stroke="currentColor" strokeWidth="4" />,
            // 5. Head
            <circle key="head" cx="220" cy="100" r="20" stroke="currentColor" strokeWidth="4" fill="none" />,
            // 6. Body
            <line key="body" x1="220" y1="120" x2="220" y2="200" stroke="currentColor" strokeWidth="4" />,
            // 7. Arms
            <React.Fragment key="arms">
                <line x1="220" y1="140" x2="190" y2="170" stroke="currentColor" strokeWidth="4" />
                <line x1="220" y1="140" x2="250" y2="170" stroke="currentColor" strokeWidth="4" />
            </React.Fragment>,
            // 8. Legs
            <React.Fragment key="legs">
                <line x1="220" y1="200" x2="190" y2="240" stroke="currentColor" strokeWidth="4" />
                <line x1="220" y1="200" x2="250" y2="240" stroke="currentColor" strokeWidth="4" />
            </React.Fragment>
        ];

        return (
            <svg viewBox="0 0 300 300" className="w-full h-full text-gray-800 dark:text-gray-200">
                {parts.slice(0, gameState.wrongGuesses)}
            </svg>
        );
    };

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-4 font-sans select-none rounded-xl">

            {/* Header */}
            <div className="flex w-full max-w-2xl justify-between items-center mb-6 px-4">
                <div className="flex items-center gap-4">
                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="px-3 py-1 bg-white dark:bg-gray-800 border rounded-lg text-sm font-bold shadow-sm outline-none"
                    >
                        {Object.keys(CATEGORIES).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {gameState.category}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-2 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-50 transition-colors"
                    >
                        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <button
                        onClick={handleRestart}
                        className="p-2 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-50 transition-colors"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>

            {/* Game Area */}
            <div className="flex flex-col md:flex-row w-full max-w-4xl gap-8 items-center justify-center">

                {/* Hangman Drawing */}
                <div className="w-64 h-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 flex items-center justify-center">
                    {renderHangman()}
                </div>

                {/* Word & Status */}
                <div className="flex flex-col items-center justify-center flex-1 w-full">

                    {/* Status Message */}
                    <div className="h-12 mb-4 flex items-center">
                        {gameState.status === 'WON' && (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-xl animate-bounce">
                                <Trophy size={24} /> YOU WON!
                            </div>
                        )}
                        {gameState.status === 'LOST' && (
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xl animate-pulse">
                                <AlertCircle size={24} /> GAME OVER
                            </div>
                        )}
                        {gameState.status === 'PLAYING' && (
                            <div className="text-gray-500 font-medium">
                                Guesses Left: <span className="text-indigo-600 font-bold text-lg">{MAX_ATTEMPTS - gameState.wrongGuesses}</span>
                            </div>
                        )}
                    </div>

                    {/* The Word */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {gameState.word.split('').map((char, idx) => {
                            const isRevealed = gameState.guessedLetters.includes(char) || gameState.status !== 'PLAYING';
                            const isSpace = char === ' ';

                            if (isSpace) return <div key={idx} className="w-8" />;

                            return (
                                <div
                                    key={idx}
                                    className={`w-10 h-12 md:w-12 md:h-14 flex items-center justify-center text-2xl md:text-3xl font-black rounded-lg border-b-4 transition-all duration-300
                                        ${isRevealed
                                            ? (gameState.status === 'LOST' && !gameState.guessedLetters.includes(char) ? "text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20" : "text-gray-800 dark:text-white border-indigo-500 bg-white dark:bg-gray-700 shadow-sm")
                                            : "text-transparent border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
                                        }
                                    `}
                                >
                                    {isRevealed ? char : ''}
                                </div>
                            );
                        })}
                    </div>

                    {/* Keyboard */}
                    <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                        {alphabet.map(letter => {
                            const isGuessed = gameState.guessedLetters.includes(letter);
                            const isCorrect = isGuessed && gameState.word.includes(letter);
                            const isWrong = isGuessed && !gameState.word.includes(letter);

                            let btnClass = "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 hover:-translate-y-1 shadow-sm border-b-2 border-gray-200 dark:border-gray-600";
                            if (isCorrect) btnClass = "bg-green-500 text-white border-green-700 shadow-inner opacity-50 cursor-not-allowed";
                            if (isWrong) btnClass = "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 border-transparent shadow-inner opacity-50 cursor-not-allowed";

                            return (
                                <button
                                    key={letter}
                                    onClick={() => handleGuess(letter)}
                                    disabled={isGuessed || gameState.status !== 'PLAYING'}
                                    className={`w-10 h-12 rounded-lg font-bold text-lg transition-all duration-150 ${btnClass}`}
                                >
                                    {letter}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

             {/* Play Again Button (Overlay Style for Mobile/Desktop) */}
             {gameState.status !== 'PLAYING' && (
                <div className="mt-8 animate-fade-in">
                    <button
                        onClick={handleRestart}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <RotateCcw size={20} /> Play Again
                    </button>
                </div>
            )}
        </div>
    );
}
