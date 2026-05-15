import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScoreMeter from './ScoreMeter';
import InputSliders from './InputSlider';
import MoodTracker from './MoodTracker';
import HabitTracker from './HabitTracker';
import FocusTimer from './FocusTimer';
import GoalList from './GoalList';
import Features from './Features';
import TodoMini from './TodoMini';
import Charts from './Charts';
import StreakCalendar from './StreakCalendar';
import QuoteCard from './QuoteCards';
import { useProductivity } from '../context/ProductivityContext';
import { Zap, X, RotateCcw } from 'lucide-react';

export default function Dashboard() {
    const { usedHours, resetAllData } = useProductivity();
    const [dismissedCapacityAt, setDismissedCapacityAt] = useState(null);
    const showPopup = usedHours >= 23.9 && dismissedCapacityAt !== usedHours;
    const dismissCapacityPopup = () => setDismissedCapacityAt(usedHours);

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all data? This will clear your current progress.")) {
            resetAllData();
        }
    };

    return (
        <div className="min-h-screen bg-(--background) text-(--foreground) selection:bg-blue-500/20 relative overflow-x-hidden transition-colors duration-500">


            <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
                {/* Header Section */}
                <header className="mb-12 text-center space-y-4 relative">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center"
                    >
                        <h1 className="heading animate-fade-up">
                            Life Productivity <span className="text-blue-500">Score</span>
                        </h1>
                        <p className="description animate-fade-up opacity-70 mt-2">
                            Master your routine, track progress, and unlock potential.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center mt-6"
                    >
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all duration-300 text-[10px] font-black uppercase tracking-widest"
                        >
                            <RotateCcw size={14} />
                            Reset Dashboard
                        </button>
                    </motion.div>
                </header>

                {/* Main Content Card - Reference to Habit Cost Calculator */}
                <div className="bg-(--card) rounded-3xl border border-white/5 overflow-hidden transition-all duration-500">
                    <div className="p-6 md:p-10 space-y-12">

                        {/* Summary Section */}
                        <section className="animate-fade-up">
                            <ScoreMeter />
                        </section>

                        {/* Core Inputs Section */}
                        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-up [animation-delay:200ms]">
                            <div className="lg:col-span-8">
                                <InputSliders />
                            </div>
                            <div className="lg:col-span-4">
                                <MoodTracker />
                            </div>
                        </section>

                        {/* Tools Section */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-up [animation-delay:400ms]">
                            <FocusTimer />
                            <HabitTracker />
                        </section>

                        {/* Data Visualization Section */}
                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-up [animation-delay:600ms]">
                            <Charts />
                            <StreakCalendar />
                        </section>

                        <section className="animate-fade-up [animation-delay:700ms]">
                            <TodoMini />
                        </section>

                        {/* Inspiration Section */}
                        <footer className="pt-8 border-t border-(--secondary)/10 animate-fade-up [animation-delay:800ms]">
                            <QuoteCard />
                        </footer>
                    </div>
                </div>
            </div>

            {/* 24-Hour Limit Notification */}
            <AnimatePresence>
                {showPopup && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={dismissCapacityPopup}
                            className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="max-w-md w-full bg-(--card) border border-blue-500/20 rounded-[40px] p-10 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-blue-500" />
                            <button
                                onClick={dismissCapacityPopup}
                                className="absolute top-6 right-6 p-2 rounded-2xl bg-black/5 dark:bg-white/5 text-(--secondary) hover:text-(--foreground) transition-all"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-6 rounded-[32px] bg-blue-500/10 text-blue-500 w-fit mx-auto mb-8">
                                <Zap size={48} strokeWidth={2.5} />
                            </div>

                            <h2 className="text-4xl font-extrabold text-(--foreground) mb-4 tracking-tighter">
                                Capacity <span className="text-blue-500">Full</span>
                            </h2>
                            <p className="text-(--secondary) font-medium mb-10 leading-relaxed opacity-60">
                                You&apos;ve fully allocated all 24 hours of your day. To prioritize new activities, please reduce time from another area first.
                            </p>

                            <button
                                onClick={dismissCapacityPopup}
                                className="w-full py-5 rounded-[24px] bg-blue-600 text-white font-extrabold uppercase tracking-widest hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/40"
                            >
                                Optimize Now
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Features />
        </div>
    );
}
