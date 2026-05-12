import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    Zap, Activity, Code, Target, 
    ChevronRight, AlertCircle, CheckCircle2 
} from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';

function ScoreRing({ score, grade, size = 120 }) {
    const s = size;
    const radius = (s - 15) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    return (
        <div className="relative flex items-center justify-center" style={{ width: s, height: s }}>
            <svg width={s} height={s} className="-rotate-90 drop-shadow-xl">
                <circle cx={s / 2} cy={s / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                <motion.circle 
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx={s / 2} cy={s / 2} r={radius} fill="none" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} 
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-3xl font-black text-(--foreground)"
                >
                    {score}
                </motion.span>
                <span className="text-[10px] font-black uppercase tracking-widest text-(--muted-foreground)">Score</span>
            </div>

        </div>
    );
}

function StatCard({ icon: Icon, label, value, sub, highlight, color = "indigo" }) {
    const colorClasses = {
        indigo: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
        emerald: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
        amber: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
        red: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
    };

    return (
        <Card variant="glass" className="group !rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl bg-(--primary)/10 text-(--primary)`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-(--primary) leading-none">{label}</span>
            </div>
            <div className="text-2xl font-black text-(--foreground) tracking-tight">{value}</div>
            {sub && <div className="mt-1 text-[11px] font-bold text-(--muted-foreground) leading-tight">{sub}</div>}
        </Card>
    );
}

export default function MetricsDashboard({ analysis }) {
    if (!analysis) return null;
    const { scores, complexity, parsed, smells } = analysis;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            
            {/* Hero Score Card */}
            <Card className="flex flex-col md:flex-row items-center gap-8 p-8 overflow-hidden relative">

                
                <ScoreRing score={scores.overall} grade={scores.grade} />
                
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <Badge variant={scores.overall > 80 ? 'success' : scores.overall > 50 ? 'warning' : 'danger'}>
                            {scores.grade.label}
                        </Badge>

                    </div>
                    <h3 className="text-2xl font-black text-(--foreground) tracking-tight">
                        Maintainability Index
                    </h3>
                    <p className="mt-2 text-sm text-(--muted-foreground) leading-relaxed font-bold">
                        Your code scores <span className="font-bold text-(--primary)">{scores.overall}%</span> for maintainability. 
                        It has <span className="font-black text-blue-600">{smells.length}</span> detected issues that could be improved.
                    </p>
                    
                    <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-(--primary)">Complexity</span>
                            <span className="text-lg font-black text-(--foreground)">{scores.complexity}</span>
                        </div>
                        <div className="w-px h-8 bg-(--border)" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-(--primary)">Readability</span>
                            <span className="text-lg font-black text-(--foreground)">{scores.readability}</span>
                        </div>
                        <div className="w-px h-8 bg-(--border)" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-(--primary)">Stability</span>
                            <span className="text-lg font-black text-(--foreground)">{scores.maintainability}</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Stats Grid - 2x2 Layout for better readability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard icon={Activity} label="Total Lines" value={parsed.totalLines} sub={`${parsed.codeLines} Code · ${parsed.commentLines} Comments`} color="indigo" />
                <StatCard icon={Code} label="Functions" value={parsed.functions.length} sub={`Avg ${complexity.average} complexity`} color="emerald" />
                <StatCard icon={Zap} label="Maintainability" value={`${complexity.maintainabilityIndex}%`} sub={`Vol: ${complexity.halstead.volume}`} color="amber" />
                <StatCard icon={Target} label="Issues" value={smells.length} sub={`${smells.filter(s => s.severity === 'HIGH').length} High Priority`} color="red" />
            </div>

            {/* Visual Charts / Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Complexity Distribution">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <LayoutGrid className="w-3.5 h-3.5" /> Distribution by Function
                    </h4>
                    <div className="flex items-end gap-1.5 h-32">
                        {complexity.functionDetails.map((fn, i) => {
                            const height = Math.max(10, Math.min(100, (fn.complexity / (complexity.highest.complexity || 1)) * 100));
                            const color = 'var(--primary)';
                            return (
                                <motion.div 
                                    key={i} 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    className="flex-1 group relative"
                                >
                                    <div 
                                        className="w-full rounded-t-lg transition-all duration-300 group-hover:brightness-110 shadow-lg shadow-black/5" 
                                        style={{ backgroundColor: color, height: '100%' }}
                                    />
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                        {fn.name}: {fn.complexity}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className="mt-4 flex justify-between text-[10px] font-black text-(--muted-foreground) uppercase tracking-widest">
                        <span>Low</span>
                        <span>Complexity Spectrum</span>
                        <span>High</span>
                    </div>
                </Card>

                <Card className="flex flex-col justify-center">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Halstead Difficulty</span>
                            <span className="text-sm font-black text-slate-800 dark:text-white">{complexity.halstead.difficulty}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${Math.min(100, complexity.halstead.difficulty)}%` }} 
                                className="h-full bg-blue-500" 
                            />
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-[11px] font-bold text-(--muted-foreground) uppercase tracking-tight">Estimated Bugs</span>
                            <span className="text-sm font-black text-(--foreground)">{complexity.halstead.bugs}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${Math.min(100, complexity.halstead.bugs * 50)}%` }} 
                                className="h-full bg-blue-600" 
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
}

const LayoutGrid = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
);
