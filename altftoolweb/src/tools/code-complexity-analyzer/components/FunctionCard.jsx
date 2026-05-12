import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronDown, Zap, Code, Layout, 
    Layers, Users, Clock, ArrowRight,
    AlertCircle, CheckCircle2
} from 'lucide-react';
import Badge from './ui/Badge';
import Card from './ui/Card';

function MetricBadge({ label, value, color }) {
    return (
        <div className="rounded-xl bg-(--muted) p-2.5 border border-(--border)">
            <div className="text-[9px] font-black uppercase tracking-widest text-(--muted-foreground) mb-1">{label}</div>
            <div className="text-sm font-black" style={{ color }}>{value}</div>
        </div>
    );
}

export default function FunctionCard({ fn, suggestions, onNavigate, isWorstOffender }) {
    const [expanded, setExpanded] = useState(false);
    
    const complexityColor = '#3b82f6';

    const getComplexityLabel = (s) => {
        if (s > 15) return { text: 'High Risk', variant: 'primary' };
        if (s > 10) return { text: 'Medium Risk', variant: 'primary' };
        return { text: 'Stable', variant: 'primary' };
    };

    const flags = useMemo(() => {
        const f = [];
        if (fn.loc > 40) f.push({ label: 'Long Function', type: 'primary' });
        if (fn.nestingDepth > 3) f.push({ label: 'Deep Nesting', type: 'primary' });
        if (fn.paramCount > 4) f.push({ label: 'Many Params', type: 'primary' });
        return f;
    }, [fn]);

    const complexityBadge = fn.complexity > 15 
        ? <Badge variant="primary" icon={AlertCircle}>High Complexity</Badge>
        : fn.complexity > 10 
            ? <Badge variant="primary" icon={Zap}>Moderate</Badge>
            : <Badge variant="primary" icon={CheckCircle2}>Simple</Badge>;

    return (
        <Card noPadding variant="flat" className={`group border border-(--border) bg-(--card) transition-all hover:shadow-md ${isWorstOffender ? 'ring-2 ring-blue-500/20' : ''}`}>
            <div 
                className="p-5 cursor-pointer flex items-center justify-between"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div 
                        className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${complexityColor}20`, color: complexityColor }}
                    >
                        <span className="text-lg font-black">{fn.complexity}</span>
                        <span className="text-[8px] font-black uppercase tracking-tighter">Score</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-(--foreground) leading-none">{fn.name}</h4>
                            {isWorstOffender && <Badge variant="primary">Worst Offender</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black text-(--muted-foreground) uppercase tracking-wide">
                            <span className="flex items-center gap-1"><Layout className="w-3 h-3" /> Lines {fn.startLine}–{fn.endLine}</span>
                            <span className="flex items-center gap-1"><Code className="w-3 h-3" /> {fn.loc} LOC</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {flags.map((flag, i) => (
                            <div key={i} className="w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 bg-blue-500" title={flag.label} />
                        ))}
                    </div>
                    <motion.div 
                        animate={{ rotate: expanded ? 180 : 0 }}
                        className="p-1.5 rounded-lg bg-(--muted) text-(--muted-foreground)"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-5 space-y-5">
                            
                            <div className="grid grid-cols-3 gap-3">
                                <MetricBadge label="Cognitive" value={fn.cognitiveComplexity} color={fn.cognitiveComplexity > 15 ? '#3b82f6' : '#64748b'} />
                                <MetricBadge label="Difficulty" value={fn.halstead.difficulty} color="#64748b" />
                                <MetricBadge label="Nesting" value={fn.nestingDepth} color={fn.nestingDepth > 3 ? '#3b82f6' : '#64748b'} />
                                <MetricBadge label="Params" value={fn.paramCount} color={fn.paramCount > 4 ? '#3b82f6' : '#64748b'} />
                                <MetricBadge label="Loops" value={fn.loopCount} color="#64748b" />
                                <MetricBadge label="Conditions" value={fn.conditionalCount} color="#64748b" />
                            </div>

                            {suggestions && suggestions.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Refactoring Suggestions</h4>
                                    <div className="space-y-2">
                                        {suggestions.map((sug, i) => (
                                            <div key={i} className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Zap className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{sug.title}</span>
                                                </div>
                                                <p className="text-[11px] text-blue-600 dark:text-blue-400/80 leading-relaxed">{sug.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button 
                                onClick={() => onNavigate(fn.startLine)}
                                className="w-full py-2.5 btn-primary flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                            >
                                Jump to Implementation <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
