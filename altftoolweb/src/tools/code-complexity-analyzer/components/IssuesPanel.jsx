import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AlertTriangle, Sparkles, Search, 
    Filter, ArrowRight, Zap, 
    AlertCircle, AlertOctagon, Info
} from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

const SEVERITY_CONFIG = {
    HIGH: { 
        bg: 'bg-blue-50/50 dark:bg-blue-900/10', 
        badge: 'primary', 
        icon: AlertOctagon,
        color: '#3b82f6'
    },
    MEDIUM: { 
        bg: 'bg-blue-50/50 dark:bg-blue-900/10', 
        badge: 'primary', 
        icon: AlertTriangle,
        color: '#3b82f6'
    },
    LOW: { 
        bg: 'bg-blue-50/50 dark:bg-blue-900/10', 
        badge: 'primary', 
        icon: Info,
        color: '#3b82f6'
    },
};

const SMELL_LABELS = {
    LONG_FUNCTION: 'Long Function',
    DEEP_NESTING: 'Deep Nesting',
    TOO_MANY_PARAMS: 'Too Many Params',
    HIGH_COMPLEXITY: 'High Complexity',
    EXCESSIVE_CONDITIONS: 'Excessive Conditions',
    EXCESSIVE_LOOPS: 'Excessive Loops',
    CALLBACK_HELL: 'Callback Hell',
    REPEATED_CONDITIONS: 'Repeated Conditions',
    LARGE_SWITCH: 'Large Switch',
};

export default function IssuesPanel({ smells, suggestions, onNavigate }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('ALL');
    const [activeTab, setActiveTab] = useState('issues');

    const filteredSmells = useMemo(() => {
        return smells.filter(s => {
            if (filterSeverity !== 'ALL' && s.severity !== filterSeverity) return false;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return s.message.toLowerCase().includes(term) || s.type.toLowerCase().includes(term) || (s.functionName || '').toLowerCase().includes(term);
            }
            return true;
        });
    }, [smells, filterSeverity, searchTerm]);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const item = {
        hidden: { x: -10, opacity: 0 },
        show: { x: 0, opacity: 1 }
    };

    return (
        <Card noPadding variant="flat" className="flex flex-col min-h-[400px] border border-(--border) bg-(--card) shadow-lg overflow-hidden">
            {/* Header Tabs */}
            <div className="flex p-1 bg-(--muted) border-b border-(--border)">
                <button
                    onClick={() => setActiveTab('issues')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'issues' ? 'bg-(--primary) text-(--primary-foreground) shadow-md' : 'text-(--muted-foreground) hover:text-(--foreground)'}`}
                >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Issues <span className="opacity-70">({smells.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('suggestions')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'suggestions' ? 'bg-(--primary) text-(--primary-foreground) shadow-md' : 'text-(--muted-foreground) hover:text-(--foreground)'}`}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    Suggestions <span className="opacity-70">({suggestions?.length || 0})</span>
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'issues' ? (
                    <motion.div
                        key="issues"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col"
                    >
                        {/* Filters */}
                        <div className="p-4 space-y-4 border-b border-(--border)">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--muted-foreground)" />
                                <input 
                                    type="text" 
                                    placeholder="Search issues, functions..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-(--muted) border border-(--border) rounded-xl text-xs font-bold text-(--foreground) outline-none focus:ring-2 focus:ring-(--primary)/20 transition-all placeholder:text-(--muted-foreground)/60"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant={filterSeverity === 'ALL' ? 'primary' : 'secondary'} 
                                    size="xs" 
                                    onClick={() => setFilterSeverity('ALL')}
                                    className="!rounded-full"
                                >
                                    All
                                </Button>
                                {['HIGH', 'MEDIUM', 'LOW'].map(sev => (
                                    <Button 
                                        key={sev}
                                        variant={filterSeverity === sev ? 'primary' : 'secondary'} 
                                        size="xs" 
                                        onClick={() => setFilterSeverity(sev)}
                                        className="!rounded-full"
                                    >
                                        {sev}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* List */}
                        <motion.div 
                            variants={container} 
                            initial="hidden" 
                            animate="show"
                            className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px] custom-scrollbar"
                        >
                            {filteredSmells.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-3">
                                        <Zap className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <p className="text-xs font-black text-(--muted-foreground) uppercase tracking-widest">Code is clean!</p>
                                </div>
                            ) : (
                                filteredSmells.map((smell, i) => {
                                    const config = SEVERITY_CONFIG[smell.severity];
                                    const Icon = config.icon;
                                    return (
                                        <motion.div
                                            key={i}
                                            variants={item}
                                            onClick={() => onNavigate && onNavigate(smell.startLine)}
                                            className={`p-4 rounded-xl border border-(--border) hover:border-(--primary)/30 hover:bg-(--card-hover-bg) transition-all cursor-pointer group ${config.bg}`}
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm text-[${config.color}]`}>
                                                        <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                                                    </div>
                                                    <span className="text-xs font-black text-(--foreground)">
                                                        {SMELL_LABELS[smell.type] || smell.type}
                                                    </span>
                                                </div>
                                                <Badge variant={config.badge}>L{smell.startLine}</Badge>
                                            </div>
                                            <p className="text-[11px] text-(--foreground) font-bold opacity-80 leading-relaxed mb-3">
                                                {smell.message}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-700 dark:text-blue-300 group-hover:translate-x-1 transition-transform">
                                                <span>Refactoring Tip</span>
                                                <ArrowRight className="w-3 h-3" />
                                                <span className="text-blue-600 dark:text-blue-400">{smell.suggestion}</span>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="suggestions"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar"
                    >
                        {!suggestions || suggestions.length === 0 ? (
                            <div className="py-12 text-center">
                                <Sparkles className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No suggestions yet</p>
                            </div>
                        ) : (
                            suggestions.map((sug, i) => (
                                <Card key={i} variant="flat" className="relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl" />
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="primary">{sug.priority}</Badge>
                                        <h4 className="text-xs font-black text-(--foreground)">{sug.title}</h4>
                                    </div>
                                    <p className="text-[11px] text-(--foreground) font-bold opacity-80 leading-relaxed mb-3">{sug.description}</p>
                                    {sug.example && (
                                        <pre className="p-3 rounded-xl bg-slate-900 text-[10px] text-slate-300 font-mono overflow-x-auto">
                                            {sug.example}
                                        </pre>
                                    )}
                                    <Button 
                                        variant="ghost" 
                                        size="xs" 
                                        className="mt-3 !p-0 hover:!bg-transparent text-blue-600"
                                        onClick={() => onNavigate(sug.startLine)}
                                    >
                                        View in Code <ArrowRight className="ml-1 w-3 h-3" />
                                    </Button>
                                </Card>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
