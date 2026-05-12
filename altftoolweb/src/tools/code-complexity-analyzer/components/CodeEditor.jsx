import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Terminal, FileCode, CheckCircle2, 
    Zap, Maximize2, Minimize2, Copy, Check 
} from 'lucide-react';

const SYNTAX_COLORS = {
    keyword: '#c678dd', // Purple
    identifier: '#abb2bf', // Off-white
    string: '#98c379', // Green
    number: '#d19a66', // Orange
    comment: '#5c6370', // Grey
    operator: '#56b6c2', // Cyan
    bracket: '#abb2bf', // Off-white
    punctuation: '#abb2bf', // Off-white
    builtins: '#e06c75', // Red/Pink
    function: '#61afef', // Blue
};

function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightLine(lineText) {
    let result = '';
    let i = 0;
    const len = lineText.length;

    while (i < len) {
        if (lineText[i] === '/' && lineText[i + 1] === '/') {
            result += '<span style="color:' + SYNTAX_COLORS.comment + '">' + escapeHtml(lineText.substring(i)) + '</span>';
            break;
        }
        if (lineText[i] === '"' || lineText[i] === "'" || lineText[i] === '`') {
            const quote = lineText[i];
            let j = i + 1;
            while (j < len) {
                if (lineText[j] === '\\') { j += 2; continue; }
                if (lineText[j] === quote) { j++; break; }
                j++;
            }
            result += '<span style="color:' + SYNTAX_COLORS.string + '">' + escapeHtml(lineText.substring(i, j)) + '</span>';
            i = j;
            continue;
        }
        if (/[0-9]/.test(lineText[i])) {
            let j = i;
            while (j < len && /[0-9.xXa-fA-F]/.test(lineText[j])) j++;
            result += '<span style="color:' + SYNTAX_COLORS.number + '">' + escapeHtml(lineText.substring(i, j)) + '</span>';
            i = j;
            continue;
        }
        if (/[a-zA-Z_$]/.test(lineText[i])) {
            let j = i;
            while (j < len && /[a-zA-Z0-9_$]/.test(lineText[j])) j++;
            const word = lineText.substring(i, j);
            const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'throw', 'try', 'catch', 'finally', 'new', 'delete', 'typeof', 'instanceof', 'class', 'extends', 'super', 'this', 'import', 'export', 'default', 'from', 'async', 'await', 'yield', 'static', 'true', 'false', 'null', 'undefined', 'void', 'of', 'in', 'def', 'elif', 'except', 'lambda', 'None', 'True', 'False', 'print', 'public', 'private', 'protected', 'abstract', 'interface'];
            const builtins = ['console', 'Math', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Promise', 'Error', 'JSON', 'Date', 'Map', 'Set', 'RegExp'];
            
            if (keywords.includes(word)) {
                result += '<span style="color:' + SYNTAX_COLORS.keyword + '">' + escapeHtml(word) + '</span>';
            } else if (builtins.includes(word)) {
                result += '<span style="color:' + SYNTAX_COLORS.builtins + '">' + escapeHtml(word) + '</span>';
            } else {
                // Check if followed by ( for function highlighting
                let next = j;
                while (next < len && /\s/.test(lineText[next])) next++;
                if (next < len && lineText[next] === '(') {
                    result += '<span style="color:' + SYNTAX_COLORS.function + '">' + escapeHtml(word) + '</span>';
                } else {
                    result += '<span style="color:' + SYNTAX_COLORS.identifier + '">' + escapeHtml(word) + '</span>';
                }
            }
            i = j;
            continue;
        }
        if ('+-*/%=<>!&|^~?'.includes(lineText[i])) {
            let j = i;
            while (j < len && '+-*/%=<>!&|^~?'.includes(lineText[j])) j++;
            result += '<span style="color:' + SYNTAX_COLORS.operator + '">' + escapeHtml(lineText.substring(i, j)) + '</span>';
            i = j;
            continue;
        }
        if ('(){}[]'.includes(lineText[i])) {
            result += '<span style="color:' + SYNTAX_COLORS.bracket + '">' + escapeHtml(lineText[i]) + '</span>';
            i++;
            continue;
        }
        result += escapeHtml(lineText[i]);
        i++;
    }
    return result || ' ';
}

export default function CodeEditor({ 
    code, 
    onChange, 
    activeLine, 
    onLineClick, 
    lineComplexityMap,
    samples,
    onSampleChange,
    language,
    isAnalyzing
}) {
    const textareaRef = useRef(null);
    const highlightRef = useRef(null);
    const lineNumberRef = useRef(null);
    const [cursorLine, setCursorLine] = useState(1);
    const [isCopied, setIsCopied] = useState(false);

    const lines = useMemo(() => code.split('\n'), [code]);

    const handleScroll = useCallback(() => {
        if (textareaRef.current && highlightRef.current && lineNumberRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
            lineNumberRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    }, []);

    const handleInput = useCallback((e) => {
        onChange(e.target.value);
    }, [onChange]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newCode = code.substring(0, start) + '  ' + code.substring(end);
            onChange(newCode);
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 2;
            }, 0);
        }
    }, [code, onChange]);

    const handleClick = useCallback(() => {
        if (textareaRef.current) {
            const pos = textareaRef.current.selectionStart;
            const textBefore = code.substring(0, pos);
            const lineNum = textBefore.split('\n').length;
            setCursorLine(lineNum);
            if (onLineClick) onLineClick(lineNum);
        }
    }, [code, onLineClick]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [code]);

    useEffect(() => {
        if (activeLine && textareaRef.current) {
            const lineHeight = 24;
            const scrollTarget = (activeLine - 1) * lineHeight - textareaRef.current.clientHeight / 2;
            textareaRef.current.scrollTo({
                top: Math.max(0, scrollTarget),
                behavior: 'smooth'
            });
        }
    }, [activeLine]);

    return (
        <div className="relative flex flex-col h-full bg-(--card) rounded-2xl overflow-hidden border border-(--border) shadow-md">
            
            {/* Editor Top Bar - Professional Minimalist */}
            <div className="flex items-center justify-between px-5 py-2.5 bg-(--muted) border-b border-(--border)">
                <div className="flex items-center gap-4 flex-1">
                    {/* Minimal Sample Selector */}
                    {samples && (
                        <div className="relative group">
                            <select
                                onChange={onSampleChange}
                                className="appearance-none bg-(--background) border border-(--border) rounded-xl px-4 py-1.5 pr-10 text-[10px] font-black uppercase tracking-wider shadow-sm outline-none focus:ring-2 focus:ring-(--primary)/20 transition-all cursor-pointer hover:border-(--primary)/30"
                            >
                                <option value="">Select Sample...</option>
                                {samples.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    )}

                    <div className="h-4 w-[1px] bg-(--border)" />
                    
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-(--primary)/10 rounded-lg">
                            <FileCode className="w-3.5 h-3.5 text-(--primary)" />
                        </div>
                        <span className="text-[10px] font-black text-(--foreground) uppercase tracking-[0.2em] hidden sm:inline">Studio Editor</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Minimal Status Badges */}
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-(--primary)/5 text-(--primary) text-[9px] font-black uppercase tracking-widest border border-(--primary)/10">
                            {language}
                        </span>
                        {isAnalyzing && (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/5 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/10 animate-pulse">
                                Analyzing
                            </span>
                        )}
                    </div>

                    <div className="h-4 w-[1px] bg-(--border) mx-1" />

                    <button 
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-(--background) border border-(--border) hover:border-(--primary)/40 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                    >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-(--muted-foreground)" />}
                        <span className="text-(--foreground)">{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                    
                    <button className="p-2 hover:bg-(--background) border border-transparent hover:border-(--border) rounded-xl transition-all group shadow-none hover:shadow-sm">
                        <Maximize2 className="w-3.5 h-3.5 text-(--muted-foreground) group-hover:text-(--foreground)" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative flex flex-1 overflow-hidden font-mono text-[13px]">
                {/* Gutter / Line Numbers */}
                <div
                    ref={lineNumberRef}
                    className="overflow-hidden bg-(--muted) py-4 text-right select-none border-r border-(--border)"
                    style={{ minWidth: '56px', lineHeight: '24px' }}
                >
                    {lines.map((_, idx) => {
                        const lineNum = idx + 1;
                        const isActive = lineNum === (activeLine || cursorLine);
                        const complexity = lineComplexityMap ? lineComplexityMap[lineNum]?.complexity : 0;
                        const complexityColor = complexity > 15 ? '#f85149' : complexity > 10 ? '#d29922' : complexity > 5 ? '#58a6ff' : 'transparent';
                        
                        return (
                            <div
                                key={lineNum}
                                className="relative pr-4 transition-all duration-200"
                                style={{
                                    height: '24px',
                                    color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                                    fontWeight: isActive ? '900' : '400',
                                }}
                                onClick={() => onLineClick && onLineClick(lineNum)}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 w-1 h-full bg-(--primary)" />
                                )}
                                {complexity > 0 && (
                                    <div 
                                        className="absolute right-0 top-[4px] w-[2px] h-[16px] rounded-full" 
                                        style={{ backgroundColor: complexityColor }}
                                    />
                                )}
                                {lineNum}
                            </div>
                        );
                    })}
                </div>

                {/* Editor Content */}
                <div className="relative flex-1 overflow-hidden bg-(--background)">
                    <pre
                        ref={highlightRef}
                        className="pointer-events-none absolute inset-0 overflow-hidden py-4 pl-6 pr-6 custom-scrollbar"
                        style={{ lineHeight: '24px', tabSize: 2, whiteSpace: 'pre', color: 'var(--foreground)' }}
                        aria-hidden="true"
                    >
                        {lines.map((line, idx) => {
                            const lineNum = idx + 1;
                            const isActive = lineNum === (activeLine || cursorLine);
                            return (
                                <div
                                    key={idx}
                                    className="transition-colors duration-200"
                                    style={{
                                        height: '24px',
                                        backgroundColor: isActive ? 'var(--primary-hover)' : 'transparent',
                                        opacity: isActive ? 0.8 : 1
                                    }}
                                    dangerouslySetInnerHTML={{ __html: highlightLine(line) }}
                                />
                            );
                        })}
                    </pre>
                    <textarea
                        ref={textareaRef}
                        value={code}
                        onChange={handleInput}
                        onScroll={handleScroll}
                        onKeyDown={handleKeyDown}
                        onClick={handleClick}
                        onKeyUp={handleClick}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        className="absolute inset-0 w-full h-full resize-none bg-transparent py-4 pl-6 pr-6 text-transparent caret-(--primary) outline-none selection:bg-(--primary)/30 custom-scrollbar"
                        style={{ lineHeight: '24px', tabSize: 2, whiteSpace: 'pre', fontFamily: 'inherit' }}
                    />
                </div>
            </div>

            {/* Status Bar - Refined */}
            <div className="flex items-center justify-between px-6 py-2 bg-(--card) border-t border-(--border)">
                <div className="flex items-center gap-8 text-[9px] font-black text-(--muted-foreground) uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 group cursor-pointer">
                        <div className="p-1 rounded-md bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                            <Terminal className="w-3 h-3" />
                        </div>
                        <span>JavaScript Core</span>
                    </div>
                    <div className="flex items-center gap-2.5 hover:text-(--foreground) transition-colors cursor-pointer group">
                        <div className="p-1 rounded-md bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
                            <Zap className="w-3 h-3 text-amber-500" />
                        </div>
                        <span>UTF-8</span>
                    </div>
                </div>
                <div className="flex items-center gap-8 text-[9px] font-black text-(--muted-foreground) uppercase tracking-[0.2em]">
                    <span className="hover:text-(--foreground) transition-colors cursor-pointer">Line {cursorLine}, Column 1</span>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors cursor-pointer group">
                        <div className="p-1 rounded-md bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <span>Ready</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
