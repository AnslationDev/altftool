"use client";

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, FileText, Zap, BookOpen, Globe, Code, Sparkles, Mic, MicOff, BarChart3, Trash2 } from 'lucide-react';
import Features from '../components/Features';

const VALIDATION_RULES = [
  { name: 'Repeated Words', pattern: /\b(\w+)\s+\1\b/gi, message: 'Repeated word', category: 'grammar', suggestion: (m) => m.split(/\s+/)[0] },
  { name: 'Extra Spaces', pattern: /\s{2,}/g, message: 'Multiple spaces', category: 'suggestion', suggestion: () => ' ' },
  { name: 'Capitalization', pattern: /(^|[.!?]\s+)([a-z])/g, message: 'Missing capital', category: 'suggestion', suggestion: (m, p1, p2) => p1 + p2.toUpperCase() }
];

const calculateInsights = (input) => {
  if (!input.trim()) return { mostUsedWord: '-', longestSentence: '-', avgWordLength: 0 };
  const wordsArray = input.toLowerCase().match(/\b(\w+)\b/g) || [];
  const sentencesArray = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const wordFreq = {};
  wordsArray.forEach(w => wordFreq[w] = (wordFreq[w] || 0) + 1);
  const mostUsed = Object.keys(wordFreq).reduce((a, b) => wordFreq[a] > wordFreq[b] ? a : b, '-');
  const longest = sentencesArray.reduce((a, b) => a.length > b.length ? a : b, '-');
  const avgLen = wordsArray.length > 0 ? (wordsArray.join('').length / wordsArray.length).toFixed(1) : 0;
  return { mostUsedWord: mostUsed, longestSentence: longest.length > 30 ? longest.substring(0, 30) + '...' : longest, avgWordLength: avgLen };
};

export default function ToolHome() {
  const [text, setText] = useState('');
  const [errors, setErrors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    sentences: 0,
    readability: 0,
    mostUsedWord: '-',
    longestSentence: '-',
    avgWordLength: 0
  });

  // --- Functions ---
  const handleClear = () => {
    setText('');
    setErrors([]);
    setSuggestions([]);
    setStats({
      words: 0, characters: 0, sentences: 0, readability: 0,
      mostUsedWord: '-', longestSentence: '-', avgWordLength: 0
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch { alert("Copy failed"); }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Grammar Checker", text: text });
      } else { alert("Share not supported"); }
    } catch (err) { console.log(err); }
  };

  const handleSave = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grammar-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev + (prev ? " " : "") + transcript);
    };
    isListening ? recognition.stop() : recognition.start();
  };

  const handleRewrite = (type) => {
    if (!text.trim()) return;
    let newText = text;

    if (type === 'professional') {
      newText = newText.charAt(0).toUpperCase() + newText.slice(1);
      newText = newText.replace(/\b(hi|hello|hey)\b/gi, 'Dear recipient,')
                      .replace(/\b(i want)\b/gi, 'I would like to');
    } 
    else if (type === 'simple') {
      const simpleMap = {
        "utilize": "use", "terminate": "end", "subsequently": "after",
        "nevertheless": "but", "assistance": "help", "consequently": "so"
      };
      Object.keys(simpleMap).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        newText = newText.replace(regex, simpleMap[key]);
      });
    } 
    else if (type === 'short') {
      const sentences = newText.split(/[.!?]+/).filter(s => s.trim().length > 4);
      const summarized = sentences.map(s => {
        let trimmed = s.trim();
        const fillers = ["actually", "basically", "really", "very", "literally"];
        fillers.forEach(f => {
          const r = new RegExp(`\\b${f}\\b`, 'gi');
          trimmed = trimmed.replace(r, "");
        });
        const words = trimmed.split(" ").filter(Boolean);
        return words.length > 7 ? words.slice(0, Math.ceil(words.length * 0.65)).join(" ") + "." : trimmed + ".";
      });
      newText = summarized.join(" ");
    }
    setText(newText.replace(/\s+/g, ' ').trim());
  };

  const checkGrammar = useCallback(async () => {
    setIsChecking(true);
    const foundErrors = [];
    const foundSuggestions = [];

    // Local rules
    VALIDATION_RULES.forEach(rule => {
      let match;
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      while ((match = regex.exec(text)) !== null) {
        foundErrors.push({ type: rule.name, message: rule.message, category: rule.category, start: match.index, end: match.index + match[0].length, text: match[0] });
        foundSuggestions.push({ start: match.index, end: match.index + match[0].length, original: match[0], suggestion: typeof rule.suggestion === "function" ? rule.suggestion(...match) : rule.suggestion });
      }
    });

    try {
      if (text.trim()) {
        const res = await fetch("https://api.languagetool.org/v2/check", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ text, language: "en-US" })
        });
        const data = await res.json();
        data.matches.forEach(match => {
          if (!foundErrors.some(e => e.start === match.offset)) {
            foundErrors.push({ type: match.rule.category.name, message: match.message, category: "grammar", start: match.offset, end: match.offset + match.length, text: text.substring(match.offset, match.offset + match.length) });
            if (match.replacements?.length) foundSuggestions.push({ start: match.offset, end: match.offset + match.length, original: text.substring(match.offset, match.offset + match.length), suggestion: match.replacements[0].value });
          }
        });
      }
    } catch (err) { console.log(err); }

    setErrors(foundErrors.sort((a, b) => a.start - b.start));
    setSuggestions(foundSuggestions);
    const insights = calculateInsights(text);
    setStats({ words: text.trim().split(/\s+/).filter(Boolean).length, characters: text.length, sentences: text.split(/[.!?]+/).filter(s => s.trim()).length, readability: 80, ...insights });
    setIsChecking(false);
  }, [text]);

  const renderHighlightedText = () => {
    if (errors.length === 0) return <div className="p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap">{text || 'Start typing...'}</div>;
    const parts = [];
    let lastIndex = 0;
    const colorMap = { grammar: 'bg-red-100 border-red-500', suggestion: 'bg-yellow-100 border-yellow-500', style: 'bg-blue-100 border-blue-500' };

    [...errors].forEach((error, idx) => {
      if (error.start > lastIndex) parts.push(<span key={`t-${idx}`}>{text.slice(lastIndex, error.start)}</span>);
      parts.push(
        <span key={`e-${idx}`} className={`border-b-2 relative group ${colorMap[error.category] || 'bg-red-100 border-red-500'}`}>
          {error.text}
          <span className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-black text-white text-[10px] p-1 rounded z-50 w-48">{error.message}</span>
        </span>
      );
      lastIndex = error.end;
    });
    parts.push(text.slice(lastIndex));
    return <div className="p-4 font-mono text-sm whitespace-pre-wrap">{parts}</div>;
  };

  useEffect(() => {
    const timer = setTimeout(() => { if (text) checkGrammar(); }, 1500);
    return () => clearTimeout(timer);
  }, [checkGrammar, text]);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto text-center pt-8">
        <h1 className="heading animate-fade-up">Grammar Checker</h1>
        <p className="description text-(--secondary) text-2xl mt-2 text-center">Smart insights, tone detection, and grammar check.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 border shadow-2xl border-(--border) rounded-xl mb-4 mt-12 bg-white">
        {/* Stats Bar - Fully Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 text-center">
          <div className="bg-(--card) p-4 rounded-lg"><div className="subheading">Words</div><div className="description">{stats.words}</div></div>
          <div className="bg-(--card) p-4 rounded-lg"><div className="subheading">Characters</div><div className="description">{stats.characters}</div></div>
          <div className="bg-(--card) p-4 rounded-lg"><div className="subheading">Tone</div><div className="description"> Neutral</div></div>
          <div className="bg-(--card) p-4 rounded-lg"><div className="subheading">Sentences</div><div className="description">{stats.sentences}</div></div>
          <div className="bg-(--card) p-4 rounded-lg"><div className="subheading">Readability</div><div className="description">{stats.readability}%</div></div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-(--card) border-2 border-(--border) rounded-lg shadow-sm">
              <div className="border-b border-(--border) px-4 py-3 flex justify-between items-center bg-gray-50/50">
                <h2 className="subheading flex items-center gap-2"><BookOpen size={18} /> Editor</h2>
                <div className="flex gap-3 text-lg font-semibold uppercase">
                  <span className="text-(--foreground)">● Grammar</span>
                  <span className="text-(--foreground)">● Punc</span>
                  <span className="text-(--foreground)">● Style</span>
                </div>
              </div>
              
              <div className="relative h-96 bg-(--background) overflow-hidden">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="absolute inset-0 w-full h-full p-4 text-transparent caret-gray-800 resize-none focus:outline-none font-mono text-sm bg-transparent z-10 leading-relaxed"
                  placeholder="Start typing..."
                />
                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-auto leading-relaxed">
                  {renderHighlightedText()}
                </div>
              </div>

              <div className="border-t border-gray-200 bg-(--card) px-4 py-3 flex gap-2 flex-wrap">
                <button onClick={checkGrammar} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">Check</button>
                <button onClick={handleVoiceInput} className={`px-4 py-2 rounded-lg flex items-center gap-2 border ${isListening ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  {isListening ? <MicOff size={18}/> : <Mic size={18}/>} Voice
                </button>
                <button onClick={handleCopy} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 border hover:bg-gray-200">Copy</button>
                <button onClick={handleShare} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 border hover:bg-gray-200">Share</button>
                <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 border hover:bg-gray-200">Save</button>
                <button onClick={handleClear} className="px-4 py-2 rounded-lg bg-gray-100 text-red-600 border border-red-100 hover:bg-red-50 transition-colors flex items-center gap-2">
                  <Trash2 size={16} /> Clear
                </button>
              </div>
            </div>

            {/* Insights Section */}
            <div className="bg-white border-2 border-(--border) rounded-lg p-5 shadow-sm">
              <h3 className="subheading mb-4 flex items-center gap-2"><BarChart3 size={18}/> Writing Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><p className="text-xl uppercase font-bold text-gray-400">Most Used</p><p className="text-lg font-bold capitalize">{stats.mostUsedWord}</p></div>
                <div><p className="text-xl uppercase font-bold text-gray-400">Avg Word</p><p className="text-lg font-bold">{stats.avgWordLength} chars</p></div>
                <div><p className="text-xl uppercase font-bold text-gray-400">Longest Sentence</p><p className="text-lg italic">&quot;{stats.longestSentence}&quot;</p></div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1 space-y-4">
            <div className="border-2 border-(--border) rounded-lg p-4 bg-(--card)">
              <h2 className="subheading mb-4 flex items-center gap-2"><Sparkles size={18} className="text-yellow-500"/> Quick Rewrites</h2>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleRewrite('professional')} className="text-left px-4 py-2 text-sm bg-white rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors">Professional</button>
                <button onClick={() => handleRewrite('short')} className="text-left px-4 py-2 text-sm bg-white rounded-lg border border-blue-100 hover:bg-purple-50 transition-colors">Short (Summarize)</button>
              </div>
            </div>

            <div className="border-2 border-(--border) rounded-lg shadow-sm sticky top-4 bg-white overflow-hidden">
              <div className="border-b border-(--border) bg-(--card) px-4 py-3 subheading">Suggestions</div>
              <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                {suggestions.length === 0 ? <p className="text-center text-gray-500 py-8 italic">No issues found</p> : 
                  suggestions.map((s, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-red-600 line-through mb-1">{s.original}</div>
                      <div className="text-sm text-green-700 font-bold mb-2">{s.suggestion}</div>
                      <button onClick={() => setText(text.slice(0,s.start)+s.suggestion+text.slice(s.end))} className="w-full bg-green-600 text-white text-xs py-1.5 rounded font-bold uppercase hover:bg-green-700">Apply</button>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
       <Features/>
      </div>
    </div>
  );
}
