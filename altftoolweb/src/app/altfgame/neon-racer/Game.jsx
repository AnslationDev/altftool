"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from './logic/GameEngine';
import { UIOverlay } from './components/UIOverlay';
import { AudioManager } from './logic/AudioManager';

/**
 * NeonRacer Game Component
 * Redesigned from scratch with modular architecture.
 * Features:
 * - 100% Viewport Height (dvh)
 * - Separation of Logic, Rendering, and Input
 * - Multi-car support
 * - Responsive Canvas
 */
const NeonRacerGame = () => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const audioManagerRef = useRef(null);

    // UI State (synced with Engine)
    const [gameState, setGameState] = useState('START'); // START, PLAYING, GAME_OVER
    const [score, setScore] = useState({ score: 0, speed: 0, distance: 0 });
    const [isGameOver, setIsGameOver] = useState(false);

    // Initialize Audio
    useEffect(() => {
        audioManagerRef.current = new AudioManager();
        return () => {
            // cleanup if needed
        };
    }, []);

    const handleGameOver = useCallback((finalScore) => {
        setIsGameOver(true);
        setGameState('GAME_OVER');
        if (audioManagerRef.current) audioManagerRef.current.playCrash();
    }, []);

    const handleScoreUpdate = useCallback((newScore) => {
        setScore(newScore);
    }, []);

    // Engine Initialization
    useEffect(() => {
        if (!canvasRef.current) return;

        engineRef.current = new GameEngine(
            canvasRef.current,
            handleGameOver,
            handleScoreUpdate
        );

        // Resize Observer for robust responsiveness
        const resizeObserver = new ResizeObserver(() => {
            if (containerRef.current && canvasRef.current && engineRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                // Handle DPI
                const dpr = window.devicePixelRatio || 1;
                canvasRef.current.width = clientWidth * dpr;
                canvasRef.current.height = clientHeight * dpr;

                // Scale context to match DPI
                const ctx = canvasRef.current.getContext('2d');
                ctx.scale(dpr, dpr);

                // Logic dimensions need to know CSS pixels
                engineRef.current.canvas.width = clientWidth; // Logical width
                engineRef.current.canvas.height = clientHeight; // Logical height

                // But wait, if we scale ctx, we don't need to change logic coords?
                // Actually, if we set canvas.width to dpr * width, the canvas internal size is huge.
                // If we scale ctx, then drawing at 100,100 draws at 200,200 physical pixels.
                // So engine logic should work in CSS pixels.
                // Let's fix the engine to use logical size.

                // Hack: We store logical size in a custom property or just pass it to resize
                engineRef.current.canvas.logicalWidth = clientWidth;
                engineRef.current.canvas.logicalHeight = clientHeight;

                engineRef.current.resize();
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            if (engineRef.current) engineRef.current.cleanup();
        };
    }, [handleGameOver, handleScoreUpdate]);

    const handleStart = () => {
        if (engineRef.current) {
            setGameState('PLAYING');
            setIsGameOver(false);
            engineRef.current.start();
            if (audioManagerRef.current) audioManagerRef.current.init(); // Unlock audio context
        }
    };

    const handleRestart = () => {
        if (engineRef.current) {
            engineRef.current.reset();
            setGameState('PLAYING');
            setIsGameOver(false);
            engineRef.current.start();
        }
    };

    // Touch Handling (Delegated to InputManager via Engine)
    const handleTouchStart = (e) => {
        if (gameState !== 'PLAYING') return;

        // Prevent default to stop scrolling/zooming
        // e.preventDefault(); // React synthetic events might complain, but touch-none in CSS handles most

        if (engineRef.current) {
            const touch = e.touches[0];
            const { clientWidth } = containerRef.current;
            engineRef.current.inputManager.handleTouch(touch.clientX, clientWidth);
        }
    };

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full bg-black overflow-hidden touch-none select-none"
            onTouchStart={handleTouchStart}
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050510] to-[#1a0b2e] -z-10"></div>

            <canvas
                ref={canvasRef}
                className="block w-full h-full focus:outline-none"
                style={{ touchAction: 'none' }}
            />

            <UIOverlay
                gameState={gameState}
                score={score}
                isGameOver={isGameOver}
                onStart={handleStart}
                onRestart={handleRestart}
            />
        </div>
    );
};

export default NeonRacerGame;
