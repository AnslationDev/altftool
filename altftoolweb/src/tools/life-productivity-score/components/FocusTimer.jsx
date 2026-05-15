import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Zap, Plus } from 'lucide-react';
import { useProductivity } from '../context/ProductivityContext';
import Card from './ui/Card';
import Button from './ui/Button';

const FocusTimer = () => {
    const { isTimerRunning, setIsTimerRunning } = useProductivity();
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [totalDuration, setTotalDuration] = useState(25 * 60);
    const [isBreak, setIsBreak] = useState(false);
    const [sessions, setSessions] = useState(0);

    useEffect(() => {
        let interval = null;
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            const advanceTimer = setTimeout(() => {
                setIsTimerRunning(false);
                if (!isBreak) {
                    setSessions(s => s + 1);
                    const nextDuration = 5 * 60;
                    setTimeLeft(nextDuration);
                    setTotalDuration(nextDuration);
                    setIsBreak(true);
                } else {
                    const nextDuration = 25 * 60;
                    setTimeLeft(nextDuration);
                    setTotalDuration(nextDuration);
                    setIsBreak(false);
                }
            }, 0);
            return () => clearTimeout(advanceTimer);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft, isBreak, setIsTimerRunning]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const resetTimer = () => {
        setIsTimerRunning(false);
        const duration = isBreak ? 5 * 60 : 25 * 60;
        setTimeLeft(duration);
        setTotalDuration(duration);
    };

    const incrementTime = () => {
        if (!isTimerRunning) {
            const next = timeLeft + 60;
            setTimeLeft(next);
            setTotalDuration(next);
        }
    };

    const decrementTime = () => {
        if (!isTimerRunning && timeLeft > 60) {
            const next = timeLeft - 60;
            setTimeLeft(next);
            setTotalDuration(next);
        }
    };

    const toggleBreak = () => {
        if (!isBreak) {
            setIsBreak(true);
            setTimeLeft(5 * 60);
            setTotalDuration(5 * 60);
        } else {
            setIsBreak(false);
            setTimeLeft(25 * 60);
            setTotalDuration(25 * 60);
        }
        // Keep running if it was already running, or let user decide?
        // Let's keep it running for a seamless transition to the break clock
    };

    // Flipped Progress: Starts full (100%) and goes to 0%
    const progress = (timeLeft / totalDuration) * 100;

    return (
        <Card variant="glass" className="h-full flex flex-col items-center justify-between p-6 shadow-sm border-white/10 dark:border-white/5">
            <div className="w-full flex items-center justify-between mb-8">
                <h3 className="text-xs font-black flex items-center gap-3 text-(--foreground) uppercase tracking-[0.2em] opacity-60">
                    <Zap size={16} className="text-blue-500" />
                    Deep Work
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <span className="text-[10px] font-black text-blue-500 tabular-nums">{sessions} sessions</span>
                </div>
            </div>

            <div className="relative flex flex-col items-center py-4 w-full">
                {/* Time Adjustment Controls */}
                {!isTimerRunning && (
                    <div className="flex items-center gap-8 mb-4">
                        <button 
                            onClick={decrementTime}
                            className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all active:scale-90"
                        >
                            <RotateCcw size={16} className="-scale-x-100" />
                        </button>
                        <span className="text-[10px] font-black text-(--foreground) uppercase tracking-widest opacity-40">Adjust</span>
                        <button 
                            onClick={incrementTime}
                            className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all active:scale-90"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                )}

                {/* Visual Timer Ring */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                    <svg width="180" height="180" className="transform -rotate-90 relative">
                        <circle cx="90" cy="90" r="82" fill="none" stroke="currentColor" strokeWidth="4" className="text-(--foreground) opacity-5" />
                        <motion.circle
                            cx="90" cy="90" r="82" fill="none"
                            stroke={isBreak ? "#10b981" : "#3b82f6"}
                            strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 82}
                            animate={{ strokeDashoffset: (2 * Math.PI * 82) * (1 - progress / 100) }}
                            transition={{ duration: 1, ease: "linear" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-[900] text-(--foreground) tracking-tighter tabular-nums leading-none mb-1">
                            {formatTime(timeLeft)}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isBreak ? 'text-emerald-500' : 'text-blue-500'}`}>
                            {isBreak ? 'Break' : 'Focus'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="w-full space-y-3 mt-8">
                <div className="flex gap-3">
                    <Button 
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                            isTimerRunning 
                            ? 'bg-(--foreground)/5 text-(--foreground) hover:bg-(--foreground)/10' 
                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm'
                        }`}
                    >
                        {isTimerRunning ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={toggleBreak}
                        className={`p-4 rounded-2xl border-transparent transition-all ${
                            isBreak 
                            ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                            : 'bg-(--foreground)/5 text-(--foreground) opacity-60 hover:opacity-100 hover:bg-(--foreground)/10'
                        }`}
                        title={isBreak ? "Resume Focus" : "Take Break"}
                    >
                        <Coffee size={20} />
                    </Button>
                </div>
                <Button 
                    variant="outline" 
                    onClick={resetTimer}
                    className="w-full py-3 rounded-xl bg-transparent border-transparent hover:bg-(--foreground)/5 text-(--foreground) opacity-30 hover:opacity-60 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    <RotateCcw size={14} /> Reset Session
                </Button>
            </div>
        </Card>
    );
};

export default FocusTimer;
