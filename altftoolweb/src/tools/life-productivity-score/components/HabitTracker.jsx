import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Circle, Trash2, Sparkles } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import Card from './ui/Card';
import Button from './ui/Button';

const HabitTracker = () => {
    const { habits, addHabit, removeHabit, toggleHabit } = useHabits();
    const [inputValue, setInputValue] = React.useState('');

    const completed = habits.filter(h => h.done).length;
    const progress = habits.length > 0 ? (completed / habits.length) * 100 : 0;

    const handleAdd = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        addHabit({ name: inputValue.trim(), done: false });
        setInputValue('');
    };

    return (
        <Card variant="glass" className="flex flex-col h-full p-6 border-white/10 dark:border-white/5">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black flex items-center gap-3 text-(--foreground) uppercase tracking-[0.2em] opacity-60">
                    <CheckCircle2 size={16} className="text-blue-500" />
                    Habit Flow
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <span className="text-[10px] font-black text-blue-500 tabular-nums">{completed}/{habits.length}</span>
                </div>
            </div>

            {/* Progress Visualization */}
            <div className="mb-8 px-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-(--foreground) mb-2 opacity-60">
                    <span>Daily Progress</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-(--secondary)/10 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-blue-500"
                    />
                </div>
            </div>

            {/* Add Habit Form */}
            <form onSubmit={handleAdd} className="flex gap-2 mb-8">
                <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="New habit..."
                    className="flex-1 bg-(--foreground)/5 border border-(--foreground)/5 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:opacity-30"
                />
                <Button type="submit" size="sm" className="px-3 bg-blue-600 hover:bg-blue-500">
                    <Plus size={18} />
                </Button>
            </form>

            {/* Habit List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar max-h-[300px]">
                <AnimatePresence mode="popLayout">
                    {habits.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-10 opacity-30"
                        >
                            <Sparkles className="mx-auto mb-3" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest">No habits yet</p>
                        </motion.div>
                    ) : (
                        habits.map((habit, idx) => (
                            <motion.div
                                key={habit.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`
                                    group flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer
                                    ${habit.done 
                                        ? 'bg-blue-500/5 border-blue-500/10' 
                                        : 'bg-(--foreground)/5 border-transparent hover:border-(--foreground)/10'
                                    }
                                `}
                                onClick={() => toggleHabit(habit.id)}
                            >
                                <div className={`${habit.done ? 'text-blue-500' : 'text-(--secondary) opacity-30'}`}>
                                    {habit.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                </div>
                                <span className={`text-sm font-medium transition-all ${habit.done ? 'line-through opacity-40' : 'text-(--foreground)'}`}>
                                    {habit.name}
                                </span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeHabit(habit.id); }}
                                    className="ml-auto p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-all text-(--secondary) opacity-40"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </Card>
    );
};

export default HabitTracker;
