import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, Code2, AlertTriangle, TreePine,
    Zap, Download, RotateCcw,
    Settings2, ChevronRight, LayoutGrid, Sparkles,
    Maximize2, Terminal
} from 'lucide-react';
import { useCodeAnalysis } from '../hooks/useCodeAnalysis';
import CodeEditor from '../components/CodeEditor.jsx';
import MetricsDashboard from '../components/MetricsDashboard.jsx';
import FunctionCard from '../components/FunctionCard.jsx';
import IssuesPanel from '../components/IssuesPanel.jsx';
import TreeView from '../components/TreeView.jsx';
import LineAnalysisPanel from '../components/LineAnalysisPanel.jsx';
import HeatmapOverlay from '../components/HeatmapOverlay.jsx';
import { SAMPLES } from '../data/SimpleCode';
import { getSupportedLanguages } from '../utils/languageSupport';
import Features from '../components/Features.jsx';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import './index.css';

const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'functions', label: 'Functions', icon: Code2 },
    { id: 'issues', label: 'Issues', icon: AlertTriangle },
];

export default function App() {
    const [activeTab, setActiveTab] = useState('overview');
    const [activeLine, setActiveLine] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    const {
        code,
        language,
        analysis,
        isAnalyzing,
        updateCode,
        runAnalysis,
        exportAnalysis
    } = useCodeAnalysis(SAMPLES[1].code, 'javascript');

    const handleLineClick = useCallback((lineNum) => {
        setActiveLine(lineNum);
    }, []);

    const handleSampleChange = useCallback((e) => {
        const sample = SAMPLES.find(s => s.id === e.target.value);
        if (sample) {
            updateCode(sample.code);
            runAnalysis();
        }
    }, [updateCode, runAnalysis]);

    const handleExport = useCallback(async (format) => {
        setIsExporting(true);
        try {
            const result = exportAnalysis(format);
            const blob = new Blob([result], { type: format === 'json' ? 'application/json' : 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `code-analysis.${format}`;
            a.click();
        } finally {
            setIsExporting(false);
        }
    }, [exportAnalysis]);

    const lineCount = useMemo(() => code.split('\n').length, [code]);

    return (
        <div className="min-h-screen bg-(--background) text-(--foreground) pb-20 font-sans transition-colors duration-300">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

                {/* Hero Header */}
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-4 py-2 bg-(--primary)/10 rounded-full mb-6 border border-(--primary)/20"
                    >
                        <Sparkles className="w-4 h-4 text-(--primary)" />
                        <span className="text-[10px] font-black text-(--primary) uppercase tracking-widest">Static Code Intelligence</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="heading mb-4"
                    >
                        Code Complexity Analyzer
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="description max-w-2xl mx-auto mb-8"
                    >
                        Analyze your code structure and complexity in real-time with our full-screen studio editor.
                    </motion.p>

                    <Button variant="secondary" icon={RotateCcw} onClick={() => runAnalysis()} pill>
                        Reset
                    </Button>
                </div>

                {/* FULL WIDTH EDITOR SECTION */}
                <div className="space-y-12">

                    {/* Main Editor - Now Full Width */}
                    <div className="w-full">
                        <Card noPadding variant="glass" className="relative group overflow-hidden shadow-2xl">


                            <div className="flex h-[700px]"> {/* Increased height */}
                                {/* Main Editor */}
                                <div className="flex-1 overflow-hidden">
                                    <CodeEditor
                                        code={code}
                                        onChange={updateCode}
                                        activeLine={activeLine}
                                        onLineClick={handleLineClick}
                                        lineComplexityMap={analysis?.lineMap}
                                        samples={SAMPLES}
                                        onSampleChange={handleSampleChange}
                                        language={language}
                                        isAnalyzing={isAnalyzing}
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* DASHBOARD & SIDEBAR COMPONENTS STACKED FOR BETTER VISIBILITY */}
                    <div className="flex flex-col gap-12">

                        {/* Top Section: Analysis Tabs */}
                        <div className="w-full space-y-8">
                            <div className="space-y-6">
                                <div className="flex p-1 bg-(--muted) rounded-2xl w-fit">
                                    {TABS.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`relative flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black transition-all duration-300 ${activeTab === tab.id ? 'text-(--primary-foreground)' : 'text-slate-400 dark:text-slate-500 hover:text-(--foreground)'}`}
                                        >
                                            {activeTab === tab.id && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute inset-0 bg-(--primary) shadow-md rounded-xl"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <tab.icon className={`relative z-10 w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                                            <span className="relative z-10 uppercase tracking-widest">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {activeTab === 'overview' && analysis && (
                                            <MetricsDashboard analysis={analysis} />
                                        )}

                                        {activeTab === 'functions' && analysis && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {analysis?.complexity?.functionDetails?.map((fn, i) => (
                                                    <FunctionCard
                                                        key={i}
                                                        fn={fn}
                                                        suggestions={analysis?.suggestionsByFunction?.[fn.name]}
                                                        onNavigate={handleLineClick}
                                                        isWorstOffender={fn.name === analysis?.complexity?.highest?.name}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {activeTab === 'issues' && analysis && (
                                            <IssuesPanel smells={analysis.smells} suggestions={analysis.suggestions} onNavigate={handleLineClick} />
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Bottom Section: Structure & Inspector Side-by-Side */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Structure Card - Wider Span */}
                            <div className="lg:col-span-8 space-y-8">
                                <Card noPadding variant="glass" className="max-h-[600px] flex flex-col overflow-hidden">
                                    <div className="flex flex-col gap-3 px-6 py-5 bg-(--muted) border-b border-(--border)">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-(--primary) rounded-xl">
                                                    <TreePine className="w-4 h-4 text-(--primary-foreground)" />
                                                </div>
                                                <h3 className="text-sm font-black text-(--foreground) uppercase tracking-widest whitespace-nowrap">Structure</h3>
                                            </div>
                                            <Badge variant="info" className="!bg-(--primary)/10 !text-(--primary) shrink-0">{analysis?.parsed?.functions?.length || 0} Blocks</Badge>
                                        </div>
                                    </div>
                                    <div className="p-6 overflow-auto flex-1 custom-scrollbar">
                                        <TreeView
                                            tree={analysis?.structureTree}
                                            onNavigate={handleLineClick}
                                            activeLine={activeLine}
                                        />
                                    </div>
                                </Card>
                            </div>

                            {/* Secondary Section - Narrower Span */}
                            <div className="lg:col-span-4 space-y-8">
                                {/* Line Inspector Card */}
                                {activeLine && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <LineAnalysisPanel
                                            lineNum={activeLine}
                                            tokens={analysis?.lineTokens?.[activeLine]}
                                            complexity={analysis?.lineMap?.[activeLine]}
                                        />
                                    </motion.div>
                                )}

                                {/* Pro Insights Card */}
                                <Card variant="glass" className="p-8 bg-(--primary)/5 border-(--primary)/20 border shadow-lg">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-(--primary) rounded-xl flex items-center justify-center shadow-lg shadow-(--primary)/20">
                                            <Settings2 className="w-5 h-5 text-(--primary-foreground)" />
                                        </div>
                                        <h3 className="text-lg font-black text-(--foreground) tracking-tight">Pro Insights</h3>
                                    </div>
                                    <p className="text-sm text-(--muted-foreground) leading-relaxed font-bold">
                                        Click any function in the explorer to jump to its implementation. The heatmap shows you the complexity at a glance.
                                    </p>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main >

            {/* Footer */}
            <Features />

        </div >
    );
}
