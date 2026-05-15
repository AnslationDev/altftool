import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useProductivity } from '../context/ProductivityContext';
import Card from './ui/Card';

const StreakCalendar = () => {
    const { history, streak } = useProductivity();
    const today = new Date();
    const [currentDate, setCurrentDate] = React.useState(today);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    const blanks = Array.from({ length: startDay }, (_, i) => i);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Get days from history that belong to the current month/year
    const streakDays = history
        .filter(h => {
            const d = new Date(h.date);
            return d.getMonth() === month && d.getFullYear() === year && h.score > 70;
        })
        .map(h => new Date(h.date).getDate());

    const monthlyCompletion = days.length > 0 ? Math.round((streakDays.length / days.length) * 100) : 0;

    return (
        <Card variant="glass" className="h-full p-8 shadow-sm border-white/10 dark:border-white/5">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-xs font-black flex items-center gap-3 text-(--foreground) uppercase tracking-[0.2em] opacity-60">
                    <CalendarIcon size={16} className="text-blue-500" />
                    Streak Tracker
                </h3>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-(--foreground) opacity-40">
                        {monthNames[month]} {year}
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentDate(new Date(year, month - 1))}
                            className="p-1.5 rounded-lg hover:bg-blue-500/10 text-(--foreground) opacity-40 hover:opacity-100 transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setCurrentDate(new Date(year, month + 1))}
                            className="p-1.5 rounded-lg hover:bg-blue-500/10 text-(--foreground) opacity-40 hover:opacity-100 transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-y-4 text-center mb-4">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <span key={day} className="text-[9px] font-black uppercase tracking-widest text-(--foreground) opacity-20">
                        {day}
                    </span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-3 gap-x-2">
                {blanks.map(i => (
                    <div key={`blank-${i}`} className="aspect-square" />
                ))}
                {days.map(day => {
                    const isStreak = streakDays.includes(day);
                    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    
                    return (
                        <div 
                            key={day} 
                            className="aspect-square flex items-center justify-center relative group cursor-pointer"
                        >
                            {isStreak && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute inset-0 bg-blue-500/10 rounded-xl border border-blue-500/20" 
                                />
                            )}
                            {isToday && (
                                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-blue-500 rounded-full z-10" />
                            )}
                            <span className={`text-xs font-bold relative z-10 ${isStreak ? 'text-blue-500' : 'text-(--foreground) opacity-40 group-hover:opacity-100'} transition-all`}>
                                {day}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-(--foreground) opacity-40">Current Streak</p>
                        <p className="text-xl font-black text-(--foreground) tracking-tighter">{streak} Days</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-(--foreground) opacity-40">Monthly Focus</p>
                    <p className="text-xl font-black text-blue-500 tracking-tighter">{monthlyCompletion}%</p>
                </div>
            </div>
        </Card>
    );
};

export default StreakCalendar;
