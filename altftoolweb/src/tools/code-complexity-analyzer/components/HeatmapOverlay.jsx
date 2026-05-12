import { useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = {
    low: 'rgba(34, 197, 94, 0.15)',
    medium: 'rgba(234, 179, 8, 0.2)',
    high: 'rgba(239, 68, 68, 0.25)',
    none: 'transparent',
};

const BORDER_COLORS = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#ef4444',
    none: 'transparent',
};

export default function HeatmapOverlay({ lineCount, lineComplexityMap, activeLine, onLineClick }) {
    const heatmapLines = useMemo(() => {
        const result = [];
        for (let i = 1; i <= lineCount; i++) {
            const info = lineComplexityMap ? lineComplexityMap[i] : undefined;
            result.push({
                line: i,
                level: info ? info.level : 'none',
                complexity: info ? info.complexity : 0,
                functionName: info ? info.functionName : '',
            });
        }
        return result;
    }, [lineCount, lineComplexityMap]);

    return (
        <div className="flex h-full flex-col bg-[#0a0f1e]"> {/* Matched editor background */}
            <div className="border-b border-slate-800/50 px-1 py-4">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-1 h-3 rounded-full bg-red-500/60" />
                    <div className="w-1 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-1 h-3 rounded-full bg-emerald-500/60" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar" style={{ lineHeight: '24px' }}>
                {heatmapLines.map((item) => (
                    <motion.div
                        key={item.line}
                        whileHover={{ x: 2 }}
                        className="group relative flex cursor-pointer items-center transition-colors duration-200"
                        style={{
                            height: '24px',
                            backgroundColor: item.line === activeLine ? 'rgba(77, 170, 252, 0.1)' : COLORS[item.level],
                            borderLeft: '4px solid ' + (item.line === activeLine ? '#4daafc' : BORDER_COLORS[item.level]),
                        }}
                        onClick={() => onLineClick && onLineClick(item.line)}
                        title={item.functionName ? `${item.functionName} (Complexity: ${item.complexity})` : `Line ${item.line}`}
                    >
                        {item.level !== 'none' && (
                            <div
                                className="h-full absolute left-0"
                                style={{
                                    width: Math.min(100, (item.complexity / 25) * 100) + '%',
                                    backgroundColor: BORDER_COLORS[item.level],
                                    opacity: 0.1,
                                }}
                            />
                        )}
                        {item.line === activeLine && (
                            <motion.div 
                                layoutId="heatmap-active"
                                className="absolute inset-0 bg-indigo-500/5 pointer-events-none"
                            />
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
