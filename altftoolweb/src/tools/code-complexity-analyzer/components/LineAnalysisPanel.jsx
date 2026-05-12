import { motion } from 'framer-motion';
import { 
    Info, Zap, FileCode, Search, 
    ChevronRight, Activity, Terminal
} from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';

export default function LineAnalysisPanel({ lineNum, tokens, complexity }) {
    if (!lineNum) return null;

    const level = complexity?.level || 'low';
    const score = complexity?.complexity || 1;

    const getComplexityLabel = (s) => {
        if (s > 15) return { text: 'High Risk', variant: 'primary' };
        if (s > 10) return { text: 'Medium Risk', variant: 'primary' };
        return { text: 'Stable', variant: 'primary' };
    };

    const status = getComplexityLabel(score);

    return (
        <Card variant="flat" noPadding className="border border-(--border) bg-(--card) shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-(--muted) border-b border-(--border)">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-(--background) rounded-lg shadow-sm border border-(--border)">
                        <Terminal className="w-3.5 h-3.5 text-(--primary)" />
                    </div>
                    <span className="text-xs font-black text-(--foreground)">Line Inspector</span>
                </div>
                <Badge variant="neutral">L{lineNum}</Badge>
            </div>

            <div className="p-5 space-y-5">
                {/* Complexity Summary */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-(--primary)">Complexity</div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-black text-(--foreground)">{score}</span>
                                <Badge variant={status.variant}>{status.text}</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Token Breakdown */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-(--primary)">Token Analysis</h4>
                        <span className="text-[10px] font-bold text-(--muted-foreground)">{tokens?.length || 0} items</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                        {tokens && tokens.length > 0 ? (
                            tokens.map((token, i) => (
                                <motion.span 
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="px-2 py-1 rounded-md bg-(--muted) border border-(--border) text-[10px] font-mono font-bold shadow-sm hover:border-(--primary)/30 transition-colors"
                                >
                                    <span className="opacity-50 mr-1 text-(--muted-foreground)">{token.type}:</span>
                                    <span className="text-(--primary) font-black">{token.value}</span>
                                </motion.span>
                            ))
                        ) : (
                            <p className="text-[11px] italic text-(--muted-foreground) py-2">No functional tokens found on this line.</p>
                        )}
                    </div>
                </div>

                {/* Contextual Info */}
                {complexity?.functionName && (
                    <div className="pt-4 border-t border-(--border) flex items-center justify-between text-[11px] font-bold text-(--foreground)">
                        <span className="flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5" /> Scope:</span>
                        <span className="text-(--primary) bg-(--primary)/10 px-2 py-0.5 rounded-lg">{complexity.functionName}</span>
                    </div>
                )}
            </div>
        </Card>
    );
}
