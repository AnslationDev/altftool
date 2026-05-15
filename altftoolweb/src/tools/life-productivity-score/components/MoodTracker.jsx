import React from 'react';
import { motion } from 'framer-motion';
import Card from './ui/Card';
import { useProductivity } from '../context/ProductivityContext';
import {
    Smile,
    Meh,
    Frown,
    Moon,
    Flame,
    Theater
} from 'lucide-react';

const MOODS = [
    { icon: Smile, label: 'Happy', color: '#2563eb', key: '😊' },
    { icon: Meh, label: 'Neutral', color: '#2563eb', key: '😐' },
    { icon: Moon, label: 'Tired', color: '#2563eb', key: '😴' },
    { icon: Frown, label: 'Low', color: '#2563eb', key: '😔' },
    { icon: Flame, label: 'Motivated', color: '#2563eb', key: '🔥' },
];

const MoodTracker = () => {
    const { mood, setMood } = useProductivity();

    return (
        <Card variant="outline" className="h-full bg-(--secondary)/5 border-transparent">
            <h3 className="text-xs font-black mb-8 flex items-center gap-3 text-(--foreground) uppercase tracking-[0.2em] opacity-40">
                <Theater size={16} className="text-blue-500" />
                Daily Vibe
            </h3>
            <div className="space-y-3">
                {MOODS.map((m) => {
                    const isActive = mood === m.key;
                    const Icon = m.icon;
                    return (
                        <motion.button
                            key={m.label}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setMood(m.key)}
                            className={`
                                flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 border w-full
                                ${isActive
                                    ? 'border-blue-500/30 bg-blue-500/5'
                                    : 'border-transparent hover:bg-(--foreground)/5'
                                }
                            `}
                        >
                            <div className={`p-2 rounded-xl transition-all flex items-center justify-center ${isActive ? 'bg-blue-500 text-white' : 'bg-(--secondary)/10 text-(--secondary) opacity-60'}`}>
                                <Icon size={18} />
                            </div>
                            <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-blue-500' : 'text-(--secondary) opacity-40'}`}>
                                {m.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-mood"
                                    className="ml-auto w-2 h-2 rounded-full bg-blue-500"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </Card>
    );
};

export default MoodTracker;
