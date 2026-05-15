import React, { useState } from 'react';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import Card from './ui/Card';
import { TrendingUp } from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-(--card) backdrop-blur-xl rounded-xl p-3 border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-(--secondary) mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <p className="text-sm font-black text-(--foreground)">
                        Score: {payload[0].value}
                    </p>
                </div>
            </div>
        );
    }
    return null;
}

const MOCK_WEEKLY = [
    { day: 'Mon', score: 65 },
    { day: 'Tue', score: 78 },
    { day: 'Wed', score: 82 },
    { day: 'Thu', score: 70 },
    { day: 'Fri', score: 88 },
    { day: 'Sat', score: 95 },
    { day: 'Sun', score: 84 },
];

const MOCK_MONTHLY = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    score: Math.floor(Math.random() * 40) + 60
}));

const Charts = ({ weeklyData = MOCK_WEEKLY, monthlyData = MOCK_MONTHLY }) => {
    const [tab, setTab] = useState('weekly');

    return (
        <Card variant="outline" className="h-full bg-(--secondary)/5 border-transparent p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <h3 className="text-xs font-black flex items-center gap-3 text-(--foreground) uppercase tracking-[0.2em] opacity-40">
                    <TrendingUp size={16} className="text-blue-500" />
                    Performance Trends
                </h3>
                <div className="flex items-center p-1 rounded-2xl bg-(--foreground)/5 border border-(--foreground)/5">
                    {['weekly', 'monthly'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${tab === t
                                    ? 'bg-blue-600 text-white'
                                    : 'text-(--secondary) hover:text-(--foreground) opacity-40 hover:opacity-100'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="min-h-[256px] w-full sm:min-h-[320px]">
                <ResponsiveContainer width="100%" height={320} minWidth={1} minHeight={256}>
                    {tab === 'weekly' ? (
                        <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-(--secondary) opacity-5" vertical={false} />
                            <XAxis
                                dataKey="day"
                                tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700, className: 'text-(--secondary) opacity-30' }}
                                axisLine={false} tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700, className: 'text-(--secondary) opacity-20' }}
                                axisLine={false} tickLine={false}
                                width={40}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#3b82f6"
                                strokeWidth={4}
                                fill="url(#scoreGrad)"
                                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: 'var(--card)' }}
                                activeDot={{ r: 6, fill: '#fff', stroke: '#3b82f6', strokeWidth: 3 }}
                                animationDuration={1000}
                            />
                        </AreaChart>
                    ) : (
                        <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-(--secondary) opacity-5" vertical={false} />
                            <XAxis
                                dataKey="day"
                                tick={{ fill: 'currentColor', fontSize: 9, fontWeight: 700, className: 'text-(--secondary) opacity-30' }}
                                axisLine={false} tickLine={false}
                                interval={2}
                                dy={10}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700, className: 'text-(--secondary) opacity-20' }}
                                axisLine={false} tickLine={false}
                                width={40}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="score"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                                animationDuration={1000}
                                barSize={10}
                                opacity={0.8}
                            />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] bg-blue-500/5 py-3 rounded-2xl border border-blue-500/10">
                <TrendingUp size={14} />
                +12.5% improvement vs last period
            </div>
        </Card>
    );
};

export default Charts;
