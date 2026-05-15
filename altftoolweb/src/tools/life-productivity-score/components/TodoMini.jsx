import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckSquare, Square, ClipboardList } from 'lucide-react';
import { useProductivity } from '../context/ProductivityContext';
import Card from './ui/Card';
import Button from './ui/Button';

const TodoMini = () => {
    const { todos, addTodo, removeTodo, toggleTodo } = useProductivity();
    const [input, setInput] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        addTodo(input.trim());
        setInput('');
    };

    return (
        <Card variant="outline" className="flex flex-col h-full bg-(--secondary)/5 border-transparent p-6">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black flex items-center gap-3 text-(--foreground) uppercase tracking-[0.2em] opacity-60">
                    <ClipboardList size={16} className="text-blue-500" />
                    Action Items
                </h3>
            </div>

            <form onSubmit={handleAdd} className="flex gap-2 mb-8">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Quick task..."
                    className="flex-1 bg-(--foreground)/5 border border-(--foreground)/5 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:opacity-30"
                />
                <Button type="submit" size="sm" className="px-3 bg-blue-600 hover:bg-blue-500" disabled={!input.trim()}>
                    <Plus size={18} />
                </Button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar max-h-[300px]">
                <AnimatePresence mode="popLayout">
                    {todos.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-10 opacity-30"
                        >
                            <ClipboardList className="mx-auto mb-3" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Inbox clear</p>
                        </motion.div>
                    ) : (
                        todos.map((todo, idx) => (
                            <motion.div
                                key={todo.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`
                                    group flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer
                                    ${todo.completed 
                                        ? 'bg-blue-500/5 border-blue-500/10 opacity-60' 
                                        : 'bg-(--foreground)/5 border-transparent hover:border-(--foreground)/10'
                                    }
                                `}
                                onClick={() => toggleTodo(todo.id)}
                            >
                                <div className={`${todo.completed ? 'text-blue-500' : 'text-(--secondary) opacity-30'}`}>
                                    {todo.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                                </div>
                                <span className={`text-sm font-medium transition-all ${todo.completed ? 'line-through opacity-40' : 'text-(--foreground)'}`}>
                                    {todo.text}
                                </span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeTodo(todo.id); }}
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

export default TodoMini;
