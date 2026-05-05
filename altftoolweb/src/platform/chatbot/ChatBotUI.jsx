"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, ArrowRight, Zap, ShoppingCart, Tag, Gamepad2, Wrench, Search, MessageSquare, Video, Globe, GraduationCap } from 'lucide-react';
import { agent } from './ChatBotBrain';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import ManagedImage from '@/components/ui/ManagedImage';

/* ──────────────────────── styles (injected once) ──────────────────────── */
const glowCSS = `
@keyframes electron-orbit {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes float-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
  50%      { transform: scale(1.06); box-shadow: 0 0 24px 4px rgba(59,130,246,0.25); }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes gradient-x {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
.electron-border {
  background: linear-gradient(90deg, #3b82f6, #06b6d4, #8b5cf6, #3b82f6);
  background-size: 300% 100%;
  animation: electron-orbit 4s ease infinite;
}
.electron-input-wrap {
  position: relative;
}
.electron-input-wrap::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 9999px;
  background: linear-gradient(90deg, #3b82f6, #06b6d4, #8b5cf6, #ec4899, #3b82f6);
  background-size: 400% 100%;
  animation: electron-orbit 3s ease infinite;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.electron-input-wrap:focus-within::before {
  opacity: 1;
}
.electron-input-wrap > * {
  position: relative;
  z-index: 1;
}
.chat-shimmer {
  background: linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%);
  background-size: 200% 100%;
  animation: shimmer 3s infinite;
}
.gradient-text {
  background: linear-gradient(135deg, #3b82f6, #06b6d4, #8b5cf6);
  background-size: 200% 200%;
  animation: gradient-x 4s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
`;

const getIconForType = (type) => {
    switch (type) {
        case 'store':
        case 'category':
        case 'product':
        case 'sale':
            return ShoppingCart;
        case 'deal':
            return Tag;
        case 'game':
            return Gamepad2;
        case 'tool':
        case 'software':
        case 'extension':
            return Wrench;
        case 'blog':
        case 'news':
        case 'topic':
            return MessageSquare;
        case 'video':
            return Video;
        case 'course':
        case 'academy':
            return GraduationCap;
        case 'search':
            return Search;
        default:
            return Globe;
    }
};

const ChatBotUI = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: "Hey! I'm **AltFBot** — your Search Guide. Ask me anything about our tools, extensions, or exclusive deals.",
            suggestions: ['Show Exclusive Deals', 'BuySmart Shopping', 'Find a tool', 'Read Blogs']
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const scrollRef = useRef(null);
    const msgIdRef = useRef(1);
    const nextId = useCallback(() => ++msgIdRef.current, []);
    const stylesInjected = useRef(false);

    // Inject glow CSS once
    useEffect(() => {
        if (stylesInjected.current) return;
        const styleEl = document.createElement('style');
        styleEl.textContent = glowCSS;
        document.head.appendChild(styleEl);
        stylesInjected.current = true;
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = useCallback((text = input) => {
        const trimmed = typeof text === 'string' ? text.trim() : '';
        if (!trimmed) return;

        const userMessage = { id: nextId(), type: 'user', text: trimmed };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        const fetchReply = async () => {
            await new Promise(r => setTimeout(r, 200)); // Short 200ms delay for UX feel
            try {
                const response = await agent.getResponse(trimmed);
                setMessages(prev => [...prev, {
                    id: nextId(),
                    type: 'bot',
                    text: response.text,
                    links: response.links,
                    suggestions: response.suggestions
                }]);
            } catch (err) {
                console.error('ChatBot response error:', err);
                setMessages(prev => [...prev, {
                    id: nextId(),
                    type: 'bot',
                    text: "Sorry, I ran into an issue. Please try again in a moment.",
                    suggestions: ['Show Exclusive Deals', 'Find a tool', 'Read Blogs']
                }]);
            } finally {
                setIsTyping(false);
            }
        };
        fetchReply();
    }, [input, nextId]);

    const toggleChat = async () => {
        if (!isOpen) {
            setIsLoadingData(true);
            await agent.hydrate();
            setIsLoadingData(false);
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-[9999] font-sans antialiased">

            {/* ───────── Launcher ───────── */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    disabled={isLoadingData}
                    style={{ animation: 'float-pulse 3s ease-in-out infinite' }}
                    className="group relative flex h-[60px] w-[60px] items-center justify-center rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-70 overflow-hidden"
                >
                    {/* Animated gradient border */}
                    <span className="electron-border absolute inset-0 rounded-2xl" />
                    <span className="absolute inset-[2px] rounded-[14px] bg-white dark:bg-zinc-950" />

                    <span className="relative z-10">
                        {isLoadingData ? (
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        ) : (
                            <ManagedImage src="/favicon1.png" alt="AltBot" loading="eager" className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-110" />
                        )}
                    </span>
                </button>
            )}

            {/* ───────── Chat Window ───────── */}
            {isOpen && (
                <div className="flex h-[82vh] max-h-[740px] min-h-[520px] w-[92vw] sm:w-[420px] origin-bottom-right flex-col overflow-hidden rounded-3xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_32px_80px_-12px_rgba(0,0,0,0.6)] transition-all animate-in zoom-in-95 fade-in duration-300">

                    {/* ── Header ── */}
                    <div className="relative overflow-hidden border-b border-zinc-100/80 dark:border-zinc-800/50 px-5 pt-5 pb-4">
                        {/* Subtle gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/10" />
                        <div className="absolute inset-0 chat-shimmer" />

                        <div className="relative flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                                {/* Logo with glow ring */}
                                <div className="relative">
                                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-purple-500/20 blur-md" />
                                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-700/60 shadow-lg overflow-hidden p-1.5">
                                        <ManagedImage src="/favicon1.png" alt="AltBot" loading="eager" className="h-full w-full object-contain" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                        AltFTool <span className="gradient-text">Search</span>
                                    </h2>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                        </span>
                                        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                                            Always online
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100/80 hover:text-zinc-600 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-300 transition-all duration-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* ── Messages ── */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto px-4 py-5 space-y-5 scroll-smooth"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(161,161,170,0.2) transparent' }}
                    >
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex w-full animate-in fade-in slide-in-from-bottom-3 duration-300 ${msg.type === 'user' ? 'justify-end pl-10' : 'justify-start pr-10'}`}
                            >
                                <div className={`flex flex-col gap-1.5 max-w-full ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>

                                    {/* Bot avatar row */}
                                    {msg.type === 'bot' && (
                                        <div className="flex items-center gap-2 mb-1 pl-0.5">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border border-blue-100/60 dark:border-blue-800/40 shadow-sm overflow-hidden p-0.5">
                                                <ManagedImage src="/favicon1.png" alt="AltBot" loading="eager" className="h-full w-full object-contain" />
                                            </div>
                                            <span className="text-[10px] font-bold tracking-widest uppercase gradient-text">AltF Agent</span>
                                        </div>
                                    )}

                                    {/* Message bubble */}
                                    <div className={`relative px-4 py-3 text-[13.5px] leading-relaxed transition-all duration-200 ${msg.type === 'user'
                                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-2xl rounded-tr-md shadow-lg shadow-blue-500/15'
                                        : 'bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm text-zinc-700 dark:text-zinc-200 rounded-2xl rounded-tl-md border border-zinc-200/40 dark:border-zinc-800/40 prose prose-sm dark:prose-invert prose-p:leading-normal prose-p:my-1 prose-pre:bg-zinc-800 prose-pre:text-zinc-100 prose-a:text-blue-500 dark:prose-a:text-blue-400 prose-strong:text-zinc-900 dark:prose-strong:text-white'
                                        }`}
                                    >
                                        {msg.type === 'bot' ? (
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>

                                    {/* Links */}
                                    {msg.links && msg.links.length > 0 && (
                                        <div className="flex flex-col gap-1.5 pt-2 w-full">
                                            {msg.links.map((link, idx) => {
                                                const Icon = getIconForType(link.type);
                                                return (
                                                    <Link
                                                        key={idx}
                                                        href={link.path}
                                                        className="group flex items-center justify-between rounded-xl border border-zinc-200/60 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm p-3 transition-all duration-200 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-px"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 text-blue-600 dark:text-blue-400">
                                                                <Icon className="h-3.5 w-3.5" />
                                                            </div>
                                                            <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">{link.name}</span>
                                                        </div>
                                                        <div className="h-5 w-5 rounded-full bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-center transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30">
                                                            <ArrowRight className="h-3 w-3 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Suggestions */}
                                    {msg.suggestions && msg.suggestions.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {msg.suggestions.map((suggestion, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSend(suggestion)}
                                                    className="rounded-full border border-zinc-200/60 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm px-3.5 py-1.5 text-[12px] font-medium text-zinc-500 dark:text-zinc-400 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300/50 dark:hover:border-blue-700/50 hover:-translate-y-px hover:shadow-sm"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 justify-start">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 mb-1 pl-0.5">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border border-blue-100/60 dark:border-blue-800/40 shadow-sm overflow-hidden p-0.5">
                                            <ManagedImage src="/favicon1.png" alt="AltBot" loading="eager" className="h-full w-full object-contain" />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest uppercase gradient-text">Searching</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200/40 dark:border-zinc-800/40 px-5 py-4 w-fit">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 dark:bg-blue-500 shadow-sm shadow-blue-400/30" />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 dark:bg-cyan-500 shadow-sm shadow-cyan-400/30 [animation-delay:0.15s]" />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 dark:bg-purple-500 shadow-sm shadow-purple-400/30 [animation-delay:0.3s]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Footer / Input ── */}
                    <div className="border-t border-zinc-100/80 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-4">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                        >
                            <div className="electron-input-wrap rounded-full">
                                <div className="relative flex items-center rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onFocus={() => setInputFocused(true)}
                                        onBlur={() => setInputFocused(false)}
                                        placeholder="Ask AltFBot anything..."
                                        className="w-full bg-transparent pl-5 pr-14 py-3.5 text-[13.5px] text-zinc-800 dark:text-zinc-100 outline-none placeholder:text-zinc-400/70 dark:placeholder:text-zinc-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim()}
                                        className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-105 hover:shadow-blue-500/30 active:scale-95 disabled:scale-100 disabled:opacity-25 disabled:shadow-none disabled:saturate-0"
                                    >
                                        <Send className="h-4 w-4 translate-x-[1px]" />
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="flex items-center justify-center gap-1.5 mt-3 opacity-40">
                            <Search className="h-3 w-3" />
                            <span className="text-[10px] font-medium tracking-wider uppercase text-zinc-400 dark:text-zinc-600">Powered by AltF Search Engine</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBotUI;
