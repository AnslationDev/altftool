import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, RefreshCw, Lightbulb } from 'lucide-react';
import Card from './ui/Card';

const QUOTES = [
    { text: "Productivity is being able to do things that you were never able to do before.", author: "Franz Kafka" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
    { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
];

const QuoteCard = () => {
    const [index, setIndex] = useState(0);
    const quote = QUOTES[index];

    const refresh = () => {
        setIndex((prev) => (prev + 1) % QUOTES.length);
    };

    return (
        <Card variant="gradient" className="overflow-hidden border-none">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-(--primary)/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 py-2">
                <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-lg bg-(--primary)/20 text-(--primary)">
                                <Lightbulb size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-(--primary)">Daily Catalyst</span>
                        </div>
                        
                        <div className="relative">
                            <Quote className="absolute -top-2 -left-2 w-8 h-8 text-(--primary) opacity-10" />
                            <motion.p 
                                key={quote.text}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xl sm:text-2xl font-black leading-tight text-(--foreground) italic tracking-tight"
                            >
                                "{quote.text}"
                            </motion.p>
                        </div>
                        
                        <motion.p 
                            key={quote.author}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-xs font-bold mt-4 text-(--secondary) opacity-60 flex items-center gap-2"
                        >
                            <span className="w-4 h-px bg-(--secondary) opacity-30" />
                            {quote.author}
                        </motion.p>
                    </div>
                    
                    <motion.button
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.5 }}
                        onClick={refresh}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-(--secondary) hover:text-(--foreground) hover:bg-white/10 transition-all shadow-xl"
                    >
                        <RefreshCw size={20} />
                    </motion.button>
                </div>
            </div>
        </Card>
    );
};

export default QuoteCard;
