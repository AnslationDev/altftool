"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeAndSimplifyText } from "../actions.js";
import Features from "./Features.jsx";


const countSyllables = (word) => {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
};

const analyzeText = (text) => {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
        return {
            totalWords: 0,
            totalSentences: 0,
            avgSentenceLength: 0,
            avgWordLength: 0,
            avgSyllablesPerWord: 0,
            readabilityScore: 0,
            readabilityLabel: "N/A",
            complexWords: [],
            longSentences: [],
            highlightedHtml: "",
            suggestions: [],
        };
    }

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const words = text.match(/\b\w+\b/g) || [];

    const totalWords = words.length;
    const totalSentences = sentences.length;
    const totalCharacters = words.reduce((sum, w) => sum + w.length, 0);

    const avgSentenceLength = totalSentences > 0 ? totalWords / totalSentences : 0;
    const avgWordLength = totalWords > 0 ? totalCharacters / totalWords : 0;

    let totalSyllables = 0;
    const complexWords = [];
    const longSentences = [];

    words.forEach((word) => {
        const syllables = countSyllables(word);
        totalSyllables += syllables;
        if (syllables >= 3 || word.length > 7) {
            complexWords.push(word);
        }
    });

    sentences.forEach((sentence) => {
        const sentenceWords = sentence.match(/\b\w+\b/g) || [];
        if (sentenceWords.length > 20) {
            longSentences.push(sentence.trim());
        }
    });

    const avgSyllablesPerWord = totalWords > 0 ? totalSyllables / totalWords : 0;

    let readabilityScore = 0;
    if (totalWords > 0 && totalSentences > 0) {
        readabilityScore =
            206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
        readabilityScore = Math.max(0, Math.min(100, Math.round(readabilityScore)));
    }

    let readabilityLabel = "N/A";
    if (readabilityScore >= 70) readabilityLabel = "Easy";
    else if (readabilityScore >= 40) readabilityLabel = "Medium";
    else if (readabilityScore > 0) readabilityLabel = "Hard";

    let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const highlightedHtml = safeText.replace(/\b\w+\b/g, (match) => {
        const syllables = countSyllables(match);
        if (syllables >= 3 || match.length > 7) {
            return `<span class="complex-word">${match}</span>`;
        }
        return match;
    });

    const suggestions = [];
    if (readabilityLabel === "Hard" || readabilityLabel === "Medium") {
        if (avgSentenceLength > 20)
            suggestions.push("Your sentences are quite long. Consider splitting them.");
        if (complexWords.length > totalWords * 0.15)
            suggestions.push("You are using many complex words. Try simpler alternatives.");
        if (totalSentences > 0 && totalWords / totalSentences > 25)
            suggestions.push("Text is dense. Break it into shorter paragraphs.");
    } else if (readabilityLabel === "Easy" && totalWords > 0) {
        suggestions.push("Your text is easy to read. Great job!");
    }

    return {
        totalWords,
        totalSentences,
        avgSentenceLength: avgSentenceLength.toFixed(1),
        avgWordLength: avgWordLength.toFixed(1),
        avgSyllablesPerWord: avgSyllablesPerWord.toFixed(2),
        readabilityScore,
        readabilityLabel,
        complexWords,
        longSentences,
        highlightedHtml,
        suggestions,
    };
};

// ----------------------------------------------------------------------
// 2. UI Components
// ----------------------------------------------------------------------

const Icons = {
    Book: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
    Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    Brain: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.97-4.06 2.5 2.5 0 0 1-1.35-4.48 2.5 2.5 0 0 1 1.35-4.48 2.5 2.5 0 0 1 2.97-4.06A2.5 2.5 0 0 1 9.5 2z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.97-4.06 2.5 2.5 0 0 0 1.35-4.48 2.5 2.5 0 0 0-1.35-4.48 2.5 2.5 0 0 0-2.97-4.06A2.5 2.5 0 0 0 14.5 2z" /></svg>,
    Loader: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>,
    ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
};

const StatCard = ({ label, value, icon: Icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-(--card) p-5 rounded-2xl border border-(--border) shadow-sm flex items-center gap-4"
    >
        <div className={`p-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20`}>
            <Icon />
        </div>
        <div>
            <p className="text-xs font-bold text-(--secondary) uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-black text-(--foreground)">{value}</p>
        </div>
    </motion.div>
);

// ----------------------------------------------------------------------
// 3. Main Component
// ----------------------------------------------------------------------

const VocabularyComplexityAnalyzer = () => {
    const [text, setText] = useState("");
    const [debouncedText, setDebouncedText] = useState("");
    const [wordMapping, setWordMapping] = useState({});
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedText(text);
        }, 300);
        return () => clearTimeout(timer);
    }, [text]);

    const analysis = useMemo(() => analyzeText(debouncedText), [debouncedText]);

    const handleAnalyze = () => {
        if (!debouncedText.trim()) return;
        setWordMapping({});

        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append("paragraph", debouncedText);
                const result = await analyzeAndSimplifyText(formData);
                setWordMapping(result.wordMapping || {});
            } catch (err) {
                console.error("Analysis error:", err);
            }
        });
    };

    const hasMapping = Object.keys(wordMapping).length > 0;

    return (
        <div className="min-h-screen bg-(--background) text-(--foreground) font-sans py-10 px-4 md:px-6">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent"
                    >
                        Vocabulary Analyzer
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-(--secondary) font-medium text-lg"
                    >
                        Master your writing with AI-driven complexity insights.
                    </motion.p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Words" value={analysis.totalWords} icon={Icons.Book} color="text-blue-500" />
                    <StatCard label="Sentences" value={analysis.totalSentences} icon={Icons.Zap} color="text-blue-500" />
                    <StatCard label="Avg Sentence" value={analysis.avgSentenceLength} icon={Icons.Search} color="text-blue-500" />
                    <StatCard label="Readability" value={analysis.readabilityScore} icon={Icons.Brain} color="text-blue-500" />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Editor & Highlights */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-(--card) rounded-3xl border border-(--border) shadow-xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-(--border) flex justify-between items-center">
                                <h3 className="font-bold text-sm uppercase tracking-widest text-(--secondary)">Editor Workspace</h3>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!text.trim() || isPending}
                                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isPending ? <Icons.Loader /> : <Icons.Zap />}
                                    {isPending ? "Analyzing..." : "Analyze Vocabulary"}
                                </button>
                            </div>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Paste your text here to see complex words and get suggestions..."
                                className="w-full h-80 p-8 bg-transparent resize-none outline-none text-lg leading-relaxed placeholder-(--secondary) opacity-80"
                            />
                        </motion.div>

                        {/* Live Highlight Preview */}
                        <AnimatePresence>
                            {debouncedText && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-(--card)/50 p-6 rounded-2xl border border-(--border) italic"
                                >
                                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-(--secondary) uppercase tracking-widest">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        Complex Word Highlights
                                    </div>
                                    <div
                                        className="text-lg leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: analysis.highlightedHtml }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right: Insights & Score */}
                    <div className="space-y-6">
                        {/* Score Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-(--card) p-8 rounded-3xl border border-(--border) shadow-lg text-center"
                        >
                            <h3 className="text-xs font-bold text-(--secondary) uppercase tracking-widest mb-6">Readability Ease</h3>
                            <div className="relative inline-flex items-center justify-center mb-6">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-(--border)" />
                                    <circle
                                        cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeLinecap="round"
                                        strokeDasharray={2 * Math.PI * 58}
                                        strokeDashoffset={(2 * Math.PI * 58) - ((analysis.readabilityScore / 100) * (2 * Math.PI * 58))}
                                        className={`transition-all duration-1000 text-blue-600`}
                                    />
                                </svg>
                                <span className="absolute text-4xl font-black">{analysis.readabilityScore}</span>
                            </div>
                            <div className={`text-lg font-bold text-blue-600`}>
                                {analysis.readabilityLabel} Level
                            </div>
                        </motion.div>

                        {/* AI Suggestions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-(--card) p-6 rounded-3xl border border-(--border) shadow-lg"
                        >
                            <h3 className="text-xs font-bold text-(--secondary) uppercase tracking-widest mb-4 flex items-center gap-2">
                                <div className="text-blue-600"><Icons.Zap /></div> AI Insights
                            </h3>
                            {analysis.suggestions.length > 0 ? (
                                <ul className="space-y-4">
                                    {analysis.suggestions.map((s, i) => (
                                        <li key={i} className="flex gap-3 text-sm font-medium leading-relaxed">
                                            <span className="text-blue-600">•</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-(--secondary) italic opacity-60">Enter text to generate writing insights.</p>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Section: Synonyms & Alternatives */}
                <AnimatePresence>
                    {hasMapping && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-(--card) rounded-3xl border border-(--border) shadow-xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-(--border) bg-gradient-to-r from-blue-500/5 to-transparent">
                                <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-3">
                                    <div className="text-blue-600"><Icons.Brain /></div> Smart Synonym Recommendations
                                </h3>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(wordMapping).map(([original, { chosen, alternatives }], idx) => (
                                    <motion.div
                                        key={original}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-(--background) p-5 rounded-2xl border border-(--border) hover:border-blue-500/30 transition-colors group"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-lg font-black text-(--foreground) underline decoration-blue-500/40 decoration-2 underline-offset-4">{original}</span>
                                            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <Icons.ChevronRight />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {chosen && (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[10px] font-bold text-(--secondary) uppercase tracking-tighter">Best Fit:</span>
                                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-lg text-sm font-black border border-blue-500/20">{chosen}</span>
                                                </div>
                                            )}
                                            {alternatives && alternatives.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-(--border)">
                                                    {alternatives.filter(a => a !== chosen).map(alt => (
                                                        <span key={alt} className="px-2 py-0.5 bg-(--card) rounded-md text-[11px] font-medium text-(--secondary) border border-(--border)">{alt}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <style jsx>{`
                    :global(.complex-word) {
                        text-decoration: underline;
                        text-decoration-color: #3b82f6;
                        text-decoration-thickness: 2px;
                        text-underline-offset: 4px;
                        font-weight: 700;
                        color: var(--foreground);
                    }
                `}</style>
            </div>

            <Features />
        </div>

    );
};

export default VocabularyComplexityAnalyzer;