import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronRight, Zap, HelpCircle, 
    Repeat, RefreshCw, GitBranch, 
    Shield, Anchor, Box, FileCode
} from 'lucide-react';

function TreeNode({ node, depth, onNavigate, activeLine, isLast }) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isActive = activeLine && node.startLine <= activeLine && (node.endLine ? activeLine <= node.endLine : true);

    const handleClick = useCallback(() => {
        if (hasChildren) setExpanded(!expanded);
        if (onNavigate) onNavigate(node.startLine);
    }, [hasChildren, expanded, node.startLine, onNavigate]);

    const getIcon = (type) => {
        const iconMap = {
            function: <FileCode className="w-3.5 h-3.5 text-indigo-500" />,
            if: <GitBranch className="w-3.5 h-3.5 text-amber-500" />,
            'else if': <GitBranch className="w-3.5 h-3.5 text-amber-500" />,
            else: <GitBranch className="w-3.5 h-3.5 text-amber-500" />,
            for: <Repeat className="w-3.5 h-3.5 text-emerald-500" />,
            while: <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />,
            switch: <Anchor className="w-3.5 h-3.5 text-purple-500" />,
            try: <Shield className="w-3.5 h-3.5 text-cyan-500" />,
            catch: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
        };
        return iconMap[type] || <Box className="w-3.5 h-3.5 text-slate-400" />;
    };

    return (
        <div className="relative">
            <div
                className={`group flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-200 min-w-fit ${isActive ? 'bg-(--primary)/10 ring-1 ring-(--primary)/30' : 'hover:bg-(--muted)'}`}
                style={{ marginLeft: depth * 12 }}
                onClick={handleClick}
            >
                {hasChildren ? (
                    <motion.div
                        animate={{ rotate: expanded ? 90 : 0 }}
                        className="p-0.5 rounded text-slate-400"
                    >
                        <ChevronRight className="w-3 h-3" />
                    </motion.div>
                ) : <div className="w-4" />}
                
                <span className="flex-shrink-0">{getIcon(node.type)}</span>
                <span className={`text-[11px] font-black ${isActive ? 'text-(--primary)' : 'text-(--foreground)'}`}>
                    {node.name}
                </span>
                
                {node.startLine && (
                    <span className="ml-auto text-[9px] font-black text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        L{node.startLine}
                    </span>
                )}
            </div>

            <AnimatePresence>
                {expanded && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {node.children.map((child, i) => (
                            <TreeNode 
                                key={i} 
                                node={child} 
                                depth={depth + 1} 
                                onNavigate={onNavigate} 
                                activeLine={activeLine} 
                                isLast={i === node.children.length - 1} 
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function TreeView({ tree, onNavigate, activeLine }) {
    if (!tree || tree.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-(--border) rounded-2xl bg-(--card)">
                <Box className="w-8 h-8 text-(--muted-foreground)/30 mb-3" />
                <p className="text-xs font-black text-(--muted-foreground) uppercase tracking-widest">No Structure Detected</p>
            </div>
        );
    }
    return (
        <div className="space-y-1">
            {tree.map((node, i) => (
                <TreeNode 
                    key={i} 
                    node={node} 
                    depth={0} 
                    onNavigate={onNavigate} 
                    activeLine={activeLine} 
                    isLast={i === tree.length - 1} 
                />
            ))}
        </div>
    );
}

const AlertCircle = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);
