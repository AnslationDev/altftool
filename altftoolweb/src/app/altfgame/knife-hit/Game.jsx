'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCw, Trophy, Zap, Apple, Target } from 'lucide-react';
import { useGameSounds } from "@/app/altfgame/_lib/sounds";

export default function KnifeHitGame() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const gameAreaRef = useRef(null);

    // Game State (React State for UI/Logic that changes infrequently)
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [knivesLeft, setKnivesLeft] = useState(10);
    const [gameWon, setGameWon] = useState(false);
    const [gameLost, setGameLost] = useState(false);
    useGameSounds({ won: gameWon, lost: gameLost, score, level, sounds: { point: 'hit' } });
    const [fruits, setFruits] = useState([]);
    const [cutFruits, setCutFruits] = useState(0);
    const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });

    // Animation State (Refs for high-performance loop)
    const rotationRef = useRef(0);
    const throwingKnifeRef = useRef(null); // { startTime, startY, targetY, duration }
    const requestRef = useRef();

    // Responsive canvas dimensions
    const getCenterX = () => canvasSize.width / 2;
    const getCenterY = () => canvasSize.height / 2;
    const getWheelRadius = () => Math.min(canvasSize.width, canvasSize.height) * 0.25; // 25% of canvas
    const getKnifeLength = () => Math.min(canvasSize.width, canvasSize.height) * 0.12;

    // Level configuration - SUPER FAST SPEEDS
    const levelConfig = {
        // Beginner Phase (Fast Start)
        1: { totalFruits: 5, minFruits: 3, speed: 1.5, knives: 8 },
        2: { totalFruits: 6, minFruits: 4, speed: 1.8, knives: 10 },
        3: { totalFruits: 7, minFruits: 5, speed: 2.2, knives: 12 },

        // Intermediate Phase (Speed Up)
        4: { totalFruits: 8, minFruits: 6, speed: 2.8, knives: 12 },
        5: { totalFruits: 9, minFruits: 7, speed: 3.2, knives: 14 },
        6: { totalFruits: 10, minFruits: 8, speed: 3.6, knives: 14 },

        // Advanced Phase (Precision & Speed)
        7: { totalFruits: 11, minFruits: 9, speed: 4.2, knives: 16 },
        8: { totalFruits: 12, minFruits: 10, speed: 4.8, knives: 16 },
        9: { totalFruits: 13, minFruits: 11, speed: 5.5, knives: 18 },
        10: { totalFruits: 14, minFruits: 12, speed: 6.0, knives: 18 },

        // Expert Phase (Super Fast)
        11: { totalFruits: 15, minFruits: 13, speed: 6.8, knives: 20 },
        12: { totalFruits: 16, minFruits: 14, speed: 7.5, knives: 20 },
        13: { totalFruits: 15, minFruits: 14, speed: 8.2, knives: 18 },
        14: { totalFruits: 16, minFruits: 15, speed: 9.0, knives: 20 },
        15: { totalFruits: 17, minFruits: 16, speed: 9.8, knives: 22 },

        // Master Phase (Insane Speed)
        16: { totalFruits: 18, minFruits: 17, speed: 10.5, knives: 24 },
        17: { totalFruits: 12, minFruits: 11, speed: 12.0, knives: 15 },
        18: { totalFruits: 19, minFruits: 18, speed: 11.5, knives: 25 },
        19: { totalFruits: 20, minFruits: 19, speed: 12.5, knives: 26 },
        20: { totalFruits: 20, minFruits: 20, speed: 14.0, knives: 28 }
    };

    // Procedural generation for infinite levels
    const getCurrentConfig = (lvl = level) => {
        if (levelConfig[lvl]) return levelConfig[lvl];

        // For levels > 20, generate harder configs
        const baseSpeed = 8.0;
        const speedMultiplier = (lvl - 20) * 0.5;
        const cappedSpeed = Math.min(baseSpeed + speedMultiplier, 25.0); // Cap speed at 25 (Super Fast)

        return {
            totalFruits: Math.min(15 + Math.floor((lvl - 20) / 2), 24),
            minFruits: Math.min(12 + Math.floor((lvl - 20) / 2), 22),
            speed: cappedSpeed,
            knives: Math.min(20 + Math.floor((lvl - 20) / 3), 35)
        };
    };

    // Fruit types
    const fruitTypes = [
        { name: 'Apple', color: '#FF3B30', emoji: '🍎' },
        { name: 'Orange', color: '#FF9500', emoji: '🍊' },
        { name: 'Watermelon', color: '#34C759', emoji: '🍉' },
        { name: 'Banana', color: '#FFD60A', emoji: '🍌' },
        { name: 'Grapes', color: '#AF52DE', emoji: '🍇' },
        { name: 'Strawberry', color: '#FF2D55', emoji: '🍓' }
    ];

    // Responsive canvas sizing
    useEffect(() => {
        const updateCanvasSize = () => {
            if (!gameAreaRef.current) return;

            const area = gameAreaRef.current;
            const width = area.clientWidth;
            const height = area.clientHeight;
            const maxSize = Math.min(width, height) * 0.95;
            const size = Math.max(280, maxSize);

            setCanvasSize({ width: size, height: size });
        };

        updateCanvasSize();
        const observer = new ResizeObserver(updateCanvasSize);
        if (gameAreaRef.current) observer.observe(gameAreaRef.current);
        window.addEventListener('resize', updateCanvasSize);

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            observer.disconnect();
        };
    }, []);

    // Initialize level
    const initializeLevel = (lvl) => {
        const config = getCurrentConfig(lvl);
        const newFruits = [];
        const angleStep = 360 / config.totalFruits;

        for (let i = 0; i < config.totalFruits; i++) {
            const angle = i * angleStep;
            const fruitType = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];

            newFruits.push({
                id: i,
                baseAngle: angle,
                type: fruitType,
                isCut: false,
                hitRadius: getWheelRadius() * 0.27
            });
        }

        setFruits(newFruits);
        setKnivesLeft(config.knives);
        setCutFruits(0);
        rotationRef.current = 0;
        throwingKnifeRef.current = null;
    };

    const resetGame = () => {
        setScore(0);
        setLevel(1);
        setGameWon(false);
        setGameLost(false);
        initializeLevel(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const nextLevel = () => {
        const newLevel = level + 1;
        setLevel(newLevel);
        setGameWon(false);
        setGameLost(false);
        initializeLevel(newLevel);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        if (canvasSize.width > 0) initializeLevel(1);
    }, [canvasSize]);

    // Helpers for Draw
    const getFruitPosition = useCallback((fruit, currentRotation) => {
        const angle = ((fruit.baseAngle + currentRotation) % 360) * Math.PI / 180;
        const wheelRadius = getWheelRadius();
        return {
            x: getCenterX() + Math.cos(angle) * wheelRadius,
            y: getCenterY() + Math.sin(angle) * wheelRadius
        };
    }, [canvasSize]);

    const drawKnife = useCallback((ctx, x, y, scale = 1) => {
        const knifeLength = getKnifeLength();
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Handle
        ctx.fillStyle = '#654321';
        ctx.fillRect(-10, 0, 20, 30);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-8, 5, 16, 3);
        ctx.fillRect(-8, 15, 16, 3);
        ctx.fillRect(-8, 25, 16, 3);

        // Blade
        ctx.fillStyle = '#E0E0E0';
        ctx.beginPath();
        ctx.moveTo(0, -knifeLength);
        ctx.lineTo(-12, 0);
        ctx.lineTo(12, 0);
        ctx.closePath();
        ctx.fill();

        // Details
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-4, -knifeLength + 5);
        ctx.lineTo(-4, -5);
        ctx.stroke();

        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -knifeLength);
        ctx.lineTo(-12, 0);
        ctx.lineTo(12, 0);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }, [canvasSize]);

    // --- MAIN GAME LOOP ---
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvasSize;
        const centerX = getCenterX();
        const centerY = getCenterY();
        const wheelRadius = getWheelRadius();

        // 1. Update Physics/State
        if (!gameWon && !gameLost) {
            const config = getCurrentConfig();
            rotationRef.current = (rotationRef.current + config.speed) % 360;

            if (throwingKnifeRef.current) {
                const { startTime, startY, targetY, duration } = throwingKnifeRef.current;
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const currentY = startY - (startY - targetY) * progress;

                throwingKnifeRef.current.currentY = currentY; // Update current position in ref

                if (progress >= 1) {
                    // Hit Check Logic handled immediately
                    const knifeX = centerX;
                    const knifeY = centerY - wheelRadius;
                    let hitIndex = -1;

                    for (let i = 0; i < fruits.length; i++) {
                        if (fruits[i].isCut) continue;
                        const fruitPos = getFruitPosition(fruits[i], rotationRef.current);
                        const dx = knifeX - fruitPos.x;
                        const dy = knifeY - fruitPos.y;
                        if (Math.sqrt(dx * dx + dy * dy) < fruits[i].hitRadius) {
                            hitIndex = i;
                            break;
                        }
                    }

                    // Reset Throwing State
                    throwingKnifeRef.current = null;

                    // Handle Hit Outcome
                    if (hitIndex !== -1) {
                        const newFruits = [...fruits];
                        newFruits[hitIndex].isCut = true;
                        setFruits(newFruits);

                        const actualCutCount = newFruits.filter(f => f.isCut).length;
                        setCutFruits(actualCutCount);
                        setScore(s => s + 20);

                        // Win if reached target OR if all fruits on screen are cut (safety check)
                        if (actualCutCount >= config.totalFruits || actualCutCount >= fruits.length) {
                            setTimeout(() => {
                                setScore(s => s + 100);
                                setGameWon(true);
                            }, 300);
                        }
                    } else {
                        const remaining = knivesLeft - 1;
                        setKnivesLeft(remaining);

                        if (remaining === 0) {
                            setTimeout(() => {
                                const currentCut = fruits.filter(f => f.isCut).length;
                                // Double check (redundant but safe)
                                if (currentCut >= config.minFruits) {
                                    setGameWon(true);
                                } else {
                                    if (currentCut >= config.totalFruits) {
                                        setGameWon(true);
                                    } else {
                                        setGameLost(true);
                                    }
                                }
                            }, 300);
                        }
                    }
                }
            }
        }

        // 2. Draw Everything
        ctx.clearRect(0, 0, width, height);

        // Background Gradient
        const grad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, width * 0.7);
        grad.addColorStop(0, '#1a0f2e');
        grad.addColorStop(1, '#0a0515');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Wheel
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.beginPath();
        ctx.arc(0, 0, wheelRadius + 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 0, 128, 0.6)';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, wheelRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(138, 43, 226, 0.2)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 0, 128, 0.5)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 0, 128, 0.4)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        // Fruits
        fruits.forEach((fruit) => {
            const pos = getFruitPosition(fruit, rotationRef.current);
            const fruitSize = Math.min(50, wheelRadius * 0.33);

            ctx.save();
            ctx.translate(pos.x, pos.y);

            if (fruit.isCut) {
                ctx.globalAlpha = 0.6;
                ctx.font = `${fruitSize - 10}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(fruit.type.emoji, -30, 0);
                ctx.fillText(fruit.type.emoji, 30, 0);

                ctx.fillStyle = fruit.type.color;
                ctx.globalAlpha = 0.4;
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const dist = 20;
                    ctx.beginPath();
                    ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, fruit.hitRadius + 15, 0, Math.PI * 2);
                ctx.strokeStyle = fruit.type.color;
                ctx.lineWidth = 3;
                ctx.globalAlpha = 0.2;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(0, 0, fruit.hitRadius, 0, Math.PI * 2);
                ctx.fillStyle = fruit.type.color;
                ctx.globalAlpha = 0.1;
                ctx.fill();
                ctx.strokeStyle = fruit.type.color;
                ctx.lineWidth = 3;
                ctx.globalAlpha = 0.6;
                ctx.stroke();

                ctx.globalAlpha = 1;
                ctx.shadowColor = fruit.type.color;
                ctx.shadowBlur = 25;
                ctx.font = `bold ${fruitSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(fruit.type.emoji, 0, 0);
                ctx.shadowBlur = 0;
            }
            ctx.restore();
        });

        // Target Line & Bottom Knife (Static)
        if (!throwingKnifeRef.current && !gameWon && !gameLost) {
            ctx.setLineDash([10, 10]);
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX, height - 40);
            ctx.lineTo(centerX, centerY - wheelRadius);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.arc(centerX, centerY - wheelRadius, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2;
            ctx.stroke();

            drawKnife(ctx, centerX, height - 40, 1.2);
        }

        // Active Throwing Knife
        if (throwingKnifeRef.current) {
            const { currentY } = throwingKnifeRef.current;
            if (currentY !== undefined) {
                drawKnife(ctx, centerX, currentY, 1.2);

                // Trail effect
                for (let i = 1; i <= 3; i++) {
                    ctx.globalAlpha = 0.2 / i;
                    drawKnife(ctx, centerX, currentY + i * 20, 1.2);
                }
                ctx.globalAlpha = 1;
            }
        }

        requestRef.current = requestAnimationFrame(animate);

    }, [canvasSize, fruits, gameWon, gameLost, knivesLeft, getFruitPosition, drawKnife]); // Dep list

    // Start/Stop Loop
    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [animate]);

    // Trigger Throw
    const throwKnife = () => {
        if (gameWon || gameLost || throwingKnifeRef.current !== null || knivesLeft <= 0) return;

        const startY = canvasSize.height - 50;
        const targetY = getCenterY() - getWheelRadius();

        throwingKnifeRef.current = {
            startY,
            targetY,
            currentY: startY,
            startTime: Date.now(),
            duration: 150 // 150ms for SUPER FAST throw
        };
    };

    // Input Handlers
    useEffect(() => {
        const handleClick = (e) => {
            if (e.target === canvasRef.current) {
                e.preventDefault();
                throwKnife();
            }
        };

        const handleTouch = (e) => {
            if (e.target === canvasRef.current) {
                e.preventDefault();
                throwKnife();
            }
        };

        const handleSpace = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                throwKnife();
            }
        };

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('click', handleClick);
            canvas.addEventListener('touchstart', handleTouch, { passive: false });
        }
        document.addEventListener('keydown', handleSpace);

        return () => {
            if (canvas) {
                canvas.removeEventListener('click', handleClick);
                canvas.removeEventListener('touchstart', handleTouch);
            }
            document.removeEventListener('keydown', handleSpace);
        };
    }, [gameWon, gameLost, knivesLeft, canvasSize]); // Reduced deps as throwKnife is stable ref-based (mostly)

    const config = getCurrentConfig();

    return (
        <div className="h-full w-full bg-gradient-to-br from-[#130b24] via-[#1f1130] to-[#130b24] flex flex-col overflow-hidden font-sans select-none relative">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@600;700&display=swap');

                body { font-family: 'Rajdhani', sans-serif; margin: 0; padding: 0; overflow: hidden; }
                .orbitron { font-family: 'Orbitron', sans-serif; }

                @keyframes pulse-soft { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.05); opacity: 1; } }
                @keyframes slide-up-fade { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

                .animate-slide-up { animation: slide-up-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-float { animation: float 3s ease-in-out infinite; }
                .animate-pulse-soft { animation: pulse-soft 2s infinite; }

                .neon-text { text-shadow: 0 0 10px rgba(255, 0, 128, 0.5), 0 0 20px rgba(255, 0, 128, 0.3); }
                .neon-border { box-shadow: 0 0 15px rgba(255, 0, 128, 0.3), inset 0 0 15px rgba(255, 0, 128, 0.1); }

                .glass-panel {
                    background: rgba(20, 15, 40, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }

                .knife-slot {
                    width: 6px; height: 14px;
                    background: #333;
                    border-radius: 2px;
                    transition: all 0.3s;
                }
                .knife-slot.active {
                    background: linear-gradient(180deg, #E0E0E0, #999);
                    box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
                    transform: scale(1.1);
                }
            `}</style>

            {/* HEADER: Title & Stats */}
            <header className="flex-none w-full px-4 py-3 sm:px-8 sm:py-4 flex justify-between items-center z-20 glass-panel border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-600/20 flex items-center justify-center border border-pink-500/30 animate-pulse-soft">
                        <span className="text-2xl">🔪</span>
                    </div>
                    <div>
                        <h2 className="orbitron text-xl sm:text-2xl md:text-3xl font-black text-white neon-text tracking-widest leading-none">
                            KNIFE HIT
                        </h2>
                        <div className="flex items-center gap-2 text-pink-300/80 text-xs sm:text-sm font-bold tracking-wider">
                            <span>LEVEL {level}</span>
                            <span className="w-1 h-1 bg-pink-500 rounded-full"></span>
                            <span>MIN {config.minFruits}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-6">
                    <div className="text-right">
                        <div className="text-xs text-pink-300/60 font-bold tracking-wider mb-0.5">SCORE</div>
                        <div className="orbitron text-2xl sm:text-3xl font-black text-white leading-none">
                            {score}
                        </div>
                    </div>
                    <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
                    <div className="text-right hidden sm:block">
                        <div className="text-xs text-green-300/60 font-bold tracking-wider mb-0.5">FRUITS</div>
                        <div className="orbitron text-2xl sm:text-3xl font-black text-green-400 leading-none">
                            {cutFruits}<span className="text-lg text-white/40">/{config.totalFruits}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN GAME AREA */}
            <main ref={gameAreaRef} className="flex-1 w-full relative flex items-center justify-center overflow-hidden min-h-0">
                {/* Canvas Container */}
                <div className="relative z-10 transition-all duration-300 ease-out" style={{ width: canvasSize.width, height: canvasSize.height }}>
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        className="w-full h-full rounded-full cursor-pointer touch-none drop-shadow-2xl"
                        style={{ filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.5))' }}
                    />

                    {/* Floating Level Indicator (Center) */}
                    {!gameWon && !gameLost && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                            <span className="orbitron text-8xl text-white font-black">{level}</span>
                        </div>
                    )}
                </div>

                {/* OVERLAY: Game Lost */}
                {gameLost && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-slide-up">
                        <div className="glass-panel p-8 rounded-3xl text-center max-w-sm mx-4 border border-red-500/30 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                            <h2 className="orbitron text-5xl font-black text-red-500 mb-2 neon-text">FAILED</h2>
                            <p className="text-red-200 mb-6 font-bold tracking-wide">LEVEL {level} • SCORE {score}</p>

                            <div className="grid grid-cols-2 gap-4 mb-8 text-left bg-black/20 p-4 rounded-xl">
                                <div>
                                    <div className="text-xs text-white/50 mb-1">REQUIRED</div>
                                    <div className="text-xl font-bold text-white">{config.minFruits} Fruits</div>
                                </div>
                                <div>
                                    <div className="text-xs text-white/50 mb-1">YOU CUT</div>
                                    <div className="text-xl font-bold text-red-400">{cutFruits} Fruits</div>
                                </div>
                            </div>

                            <button
                                onClick={resetGame}
                                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-black py-4 px-8 rounded-xl text-xl orbitron flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-lg shadow-red-900/50"
                            >
                                <RotateCw size={22} /> TRY AGAIN
                            </button>
                        </div>
                    </div>
                )}

                {/* OVERLAY: Game Won */}
                {gameWon && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-slide-up">
                        <div className="glass-panel p-8 rounded-3xl text-center max-w-sm mx-4 border border-green-500/30 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-green-500/20 blur-3xl rounded-full pointer-events-none"></div>

                            <h2 className="orbitron text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-600 mb-2">
                                VICTORY
                            </h2>
                            <p className="text-green-200 mb-6 font-bold tracking-wide">LEVEL {level} COMPLETED</p>

                            <div className="flex justify-center items-end gap-2 mb-8">
                                <span className="text-5xl font-black text-white orbitron">{score}</span>
                                <span className="text-sm text-white/50 mb-2 font-bold">PTS</span>
                            </div>

                            {level < 1000 ? (
                                <button
                                    onClick={nextLevel}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black py-4 px-8 rounded-xl text-xl orbitron flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-lg shadow-green-900/50 animate-pulse-soft"
                                >
                                    NEXT LEVEL <Zap size={22} fill="currentColor" />
                                </button>
                            ) : (
                                <button
                                    onClick={resetGame}
                                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-black py-4 px-8 rounded-xl text-xl orbitron flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-lg shadow-orange-900/50"
                                >
                                    <Trophy size={22} /> PLAY AGAIN
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* FOOTER: Controls & Info */}
            <footer className="flex-none w-full p-4 z-20 glass-panel border-t border-white/5 pb-6 sm:pb-4">
                <div className="max-w-4xl mx-auto flex flex-col items-center">

                    {/* Knives Indicator */}
                    <div className="flex items-center gap-1 mb-3 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
                        {Array.from({ length: Math.min(knivesLeft, 15) }).map((_, i) => (
                            <div key={i} className="knife-slot active"></div>
                        ))}
                        {knivesLeft > 15 && <span className="text-xs text-white/70 ml-1 font-bold">+{knivesLeft - 15}</span>}
                        {knivesLeft === 0 && <span className="text-xs text-red-400 font-bold ml-1">EMPTY</span>}
                    </div>

                    {/* Instructions */}
                    <p className="text-white/40 text-xs sm:text-sm font-medium tracking-wide flex items-center gap-2">
                        <span className="hidden sm:inline">TAP OR PRESS SPACE TO THROW</span>
                        <span className="sm:hidden">TAP TO THROW</span>
                        <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span>
                        <span className="text-yellow-400/80">AVOID KNIVES</span>
                    </p>
                </div>
            </footer>
        </div>
    );
}
