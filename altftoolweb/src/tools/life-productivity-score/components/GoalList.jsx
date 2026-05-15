import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, Circle, Target, Sparkles } from 'lucide-react';
import { useProductivity } from '../context/ProductivityContext';
import Card from './ui/Card';
import Button from './ui/Button';

const GoalList = () => {
    const { goals, addGoal, removeGoal, toggleGoal } = useProductivity();
    const [input, setInput] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        addGoal(input.trim());
        setInput('');
    };

    const completed = goals.filter(g => g.completed).length;
    const progress = goals.length > 0 ? (completed / goals.length) * 100 : 0;

    return (
        <Card variant="glass" className="flex flex-col h-full p-6 border-white/10 dark:border-white/5">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black flex items-center gap-3 text-(--foreground) uppercase tracking-[0.2em] opacity-60">
                    <Target size={16} className="text-blue-500" />
                    Milestones
                </h3>
                {goals.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <span className="text-[10px] font-black text-blue-500 tabular-nums">{completed}/{goals.length}</span>
                    </div>
                )}
            </div>

            {/* Progress Visualization */}
            <div className="mb-8 px-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-(--foreground) mb-2 opacity-60">
                    <span>Goal Achievement</span>
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

            <form onSubmit={handleAdd} className="flex gap-2 mb-8">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Next big thing..."
                    className="flex-1 bg-(--foreground)/5 border border-(--foreground)/5 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:opacity-30"
                />
                <Button type="submit" size="sm" className="px-3 bg-blue-600 hover:bg-blue-500" disabled={!input.trim()}>
                    <Plus size={18} />
                </Button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar max-h-[300px]">
                <AnimatePresence mode="popLayout">
                    {goals.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-10 opacity-30"
                        >
                            <Target className="mx-auto mb-3" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest">No milestones set</p>
                        </motion.div>
                    ) : (
                        goals.map((goal, idx) => (
                            <motion.div
                                key={goal.id}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`
                                    group flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer
                                    ${goal.completed 
                                        ? 'bg-blue-500/5 border-blue-500/10' 
                                        : 'bg-(--foreground)/5 border-transparent hover:border-(--foreground)/10'
                                    }
                                `}
                                onClick={() => toggleGoal(goal.id)}
                            >
                                <div className={`${goal.completed ? 'text-blue-500' : 'text-(--secondary) opacity-30'}`}>
                                    {goal.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                </div>
                                <span className={`text-sm font-medium transition-all ${goal.completed ? 'line-through opacity-40' : 'text-(--foreground)'}`}>
                                    {goal.text}
                                </span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeGoal(goal.id); }}
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

export default GoalList;
