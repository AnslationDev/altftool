import React from 'react';
import { motion } from 'framer-motion';
import { useProductivity } from '../context/ProductivityContext';
import { Activity, Zap, Moon, Briefcase } from 'lucide-react';

const ScoreMeter = () => {
    const { score, sleep, work, energy, usedHours } = useProductivity();

    const circumference = 2 * Math.PI * 80;
    const offset = circumference - (score / 100) * circumference;

    const getStatusLabel = (score) => {
        if (score >= 90) return { label: 'Elite', color: 'text-blue-500', bg: 'bg-blue-500/10' };
        if (score >= 75) return { label: 'High', color: 'text-blue-500', bg: 'bg-blue-500/10' };
        if (score >= 60) return { label: 'Steady', color: 'text-blue-500', bg: 'bg-blue-500/10' };
        return { label: 'Needs Focus', color: 'text-(--secondary)', bg: 'bg-(--secondary)/10' };
    };

    const status = getStatusLabel(score);

    return (
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            {/* Left side: Premium Gauge */}
            <div className="relative flex-shrink-0 group">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-700" />
                <svg width="200" height="200" className="transform -rotate-90 relative">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="10" className="text-(--secondary) opacity-5" />
                    <motion.circle
                        cx="100" cy="100" r="80" fill="none"
                        stroke="#3b82f6"
                        strokeWidth="12" strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-7xl font-[900] text-(--foreground) tracking-tighter leading-none">
                        {score}
                    </span>
                    <span className="text-[10px] font-black text-(--foreground) uppercase tracking-[0.3em] mt-1 opacity-60">Score</span>
                </div>
            </div>

            {/* Right side: Key Analytics */}
            <div className="flex-1 w-full space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-[900] text-(--foreground) tracking-tight flex items-center gap-3">
                            <Zap className="text-blue-500" size={24} fill="currentColor" />
                            Performance Insights
                        </h2>
                        <p className="text-[11px] font-bold text-(--foreground) uppercase tracking-[0.4em] mt-1 opacity-60">Dynamic lifestyle analysis</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/10 ${status.bg} ${status.color}`}>
                        {status.label}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 md:gap-12 py-6 border-y border-(--foreground)/10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-(--foreground) text-[10px] font-black uppercase tracking-widest opacity-60">
                            <Moon size={12} className="text-blue-500" /> Sleep
                        </div>
                        <p className="text-3xl font-[900] text-(--foreground) tracking-tighter">
                            {sleep.toFixed(1)}<span className="text-[10px] font-bold opacity-50 ml-1 uppercase">hrs</span>
                        </p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-(--foreground) text-[10px] font-black uppercase tracking-widest opacity-60">
                            <Briefcase size={12} className="text-blue-500" /> Work
                        </div>
                        <p className="text-3xl font-[900] text-(--foreground) tracking-tighter">
                            {work.toFixed(1)}<span className="text-[10px] font-bold opacity-50 ml-1 uppercase">hrs</span>
                        </p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-(--foreground) text-[10px] font-black uppercase tracking-widest opacity-60">
                            <Activity size={12} className="text-blue-500" /> Energy
                        </div>
                        <p className="text-3xl font-[900] text-(--foreground) tracking-tighter">
                            {energy}<span className="text-[10px] font-bold opacity-50 ml-1 uppercase">/10</span>
                        </p>
                    </div>
                </div>

                {/* Daily Progress */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-(--foreground) opacity-60">Time Pool Allocation</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{Math.round(usedHours)} / 24 <span className="opacity-50">hrs used</span></span>
                    </div>
                    <div className="h-2 w-full bg-(--secondary)/10 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(usedHours / 24) * 100}%` }}
                            className={`h-full transition-colors duration-500 ${usedHours >= 23.9 ? 'bg-blue-400' : 'bg-blue-500'}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScoreMeter;