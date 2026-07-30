'use client'

import React, { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import {
    Download, Loader2, Sword, RefreshCcw, Type,
    Palette, Search, ChevronDown, Check, EyeOff, Eye
} from "lucide-react";

export default function NinjaTextGenerator() {
    // Core States
    const [inputText, setInputText] = useState("Hey...");
    const [displayedText, setDisplayedText] = useState("Hey...");
    const [isAnimating, setIsAnimating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [activeTab, setActiveTab] = useState("content");

    // Dropdown Logic States
    const [dropdownOpen, setDropdownOpen] = useState(null); // 'ninjaChar', 'slashStyle', 'dojoTheme'
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownContainerRef = useRef(null);

    // Advanced Parameters Config
    const [typingSpeed, setTypingSpeed] = useState(80);
    const [selectedNinja, setSelectedNinja] = useState("shadow");
    const [slashStyle, setSlashStyle] = useState("katana");
    const [dojoTheme, setDojoTheme] = useState("parchment");

    const animationRef = useRef(null);
    const previewRef = useRef(null);

    // Registries for Custom Search Dropdowns
    const ninjaRegistry = [
        { id: "shadow", label: "Classic Shadow Ninja 🥷" },
        { id: "kunoichi", label: "Kunoichi Assassin 🥷" },
        { id: "samurai", label: "Ronin Samurai 🥷" },
        { id: "stealth", label: "Stealth Master 👤" }
    ];

    const slashRegistry = [
        { id: "katana", label: "Katana Spark Sparks ⚔️" },
        { id: "shuriken", label: "Shuriken Critical Hit 💥" },
        { id: "smoke", label: "Smoke Evade Screen 💨" }
    ];

    const dojoThemesRegistry = [
        { id: "parchment", label: "Aged Dojo Parchment", bg: "bg-[#F3EAD3] border-[#CBB68E]", text: "text-[#2B1B10]", layer: "#F3EAD3" },
        { id: "white", label: "Minimal Clean White", bg: "bg-white border-neutral-200", text: "text-neutral-800", layer: "#FFFFFF" },
        { id: "dark", label: "Obsidian Ninja Night", bg: "bg-neutral-900 border-neutral-800", text: "text-neutral-100", layer: "#171717" },
        { id: "neon", label: "Cyber Synth Neon Edge", bg: "bg-black border-[#F43F5E]", text: "text-[#F43F5E]", layer: "#000000" }
    ];

    useEffect(() => {
        triggerNinjaAnimation("HELLO NINJA...");

        const handleClickOutside = (event) => {
            if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target)) {
                setDropdownOpen(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (animationRef.current) clearInterval(animationRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const triggerNinjaAnimation = (textToAnimate) => {
        if (animationRef.current) clearInterval(animationRef.current);

        setIsAnimating(true);
        setDisplayedText("");

        let targetText = textToAnimate.toUpperCase();
        let currentLength = 0;

        animationRef.current = setInterval(() => {
            if (currentLength < targetText.length) {
                currentLength++;
                setDisplayedText(targetText.slice(0, currentLength));
            } else {
                clearInterval(animationRef.current);
                setIsAnimating(false);
            }
        }, typingSpeed);
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        triggerNinjaAnimation(inputText.trim());
    };

    const handleDownload = async () => {
        if (!previewRef.current) return;
        setIsDownloading(true);
        try {
            await document.fonts.ready;
            const themeColors = dojoThemesRegistry.find(t => t.id === dojoTheme) || dojoThemesRegistry[0];
            const dataUrl = await toPng(previewRef.current, {
                pixelRatio: 3,
                backgroundColor: themeColors.layer
            });
            saveAs(dataUrl, `ninja-strike-${Date.now()}.png`);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDownloading(false);
        }
    };

    const activeThemeData = dojoThemesRegistry.find(t => t.id === dojoTheme) || dojoThemesRegistry[0];

    // Generic Custom Search-Enabled Dropdown Component Renderer
    const renderSearchDropdown = (id, label, currentVal, setVal, options) => {
        const isOpen = dropdownOpen === id;
        const activeOption = options.find(o => o.id === currentVal) || options[0];
        const filtered = options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase().trim()));

        return (
            <div className="space-y-1 relative" onMouseDown={(e) => e.stopPropagation()}>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 tracking-wider">{label}</label>
                <button
                    type="button"
                    onClick={() => { setDropdownOpen(isOpen ? null : id); setSearchQuery(""); }}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md text-xs bg-white text-neutral-700 flex items-center justify-between hover:border-neutral-300 transition outline-none"
                >
                    <span>{activeOption.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>
                {isOpen && (
                    <div className="absolute left-0 right-0 mt-1 border border-neutral-200 rounded-lg bg-white shadow-xl z-50 overflow-hidden max-h-48 flex flex-col">
                        <div className="p-2 border-b border-neutral-100 bg-neutral-50 flex items-center gap-1.5 shrink-0">
                            <Search className="w-3.5 h-3.5 text-neutral-400" />
                            <input
                                type="text" placeholder="Search parameters..." value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-xs border-none outline-none text-neutral-800"
                            />
                        </div>
                        <div className="overflow-y-auto flex-1 py-1">
                            {filtered.length > 0 ? (
                                filtered.map(opt => (
                                    <button
                                        key={opt.id} type="button"
                                        onClick={() => { setVal(opt.id); setDropdownOpen(null); setSearchQuery(""); }}
                                        className="w-full px-3 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
                                    >
                                        <span>{opt.label}</span>
                                        {currentVal === opt.id && <Check className="w-3.5 h-3.5 text-neutral-900" />}
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-3 text-xs text-neutral-400 italic text-center">No results found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-white" ref={dropdownContainerRef}>

            {/* ── LEFT CONFIGURATION PANEL ── */}
            <div className="lg:col-span-5 h-full flex flex-col justify-between border-r border-neutral-200 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">

                    <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                        <div>
                            <h2 className="text-sm font-bold tracking-tight flex items-center gap-2 text-neutral-900">
                                <Sword className="w-4 h-4 text-neutral-500" />
                                Ninja Text Matrix
                            </h2>
                            <p className="text-[11px] text-neutral-400 mt-0.5">Dynamic combat slash broadside vector deck</p>
                        </div>
                    </div>

                    {/* Tab Selection Hub */}
                    <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200/60">
                        <button onClick={() => setActiveTab("content")} className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition ${activeTab === "content" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-500"}`}>Inscribe</button>
                        <button onClick={() => setActiveTab("style")} className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition ${activeTab === "style" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-500"}`}>Dojo Presets</button>
                    </div>

                    {activeTab === "content" && (
                        <div className="space-y-4 bg-neutral-50/40 border border-neutral-200 rounded-xl p-4">
                            <div>
                                <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">Your Message Input</label>
                                <input
                                    type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} maxLength={40}
                                    placeholder="TYPE INSCRIPTION HERE..."
                                    className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs font-mono bg-white text-neutral-800 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase text-neutral-400">
                                    <span>Strike Typing Velocity</span>
                                    <span className="font-mono text-neutral-800">{typingSpeed}ms</span>
                                </div>
                                <input type="range" min={40} max={200} step={40} value={typingSpeed} onChange={(e) => setTypingSpeed(Number(e.target.value))} className="w-full accent-neutral-900 cursor-pointer h-1 bg-neutral-100 appearance-none rounded-lg" />
                            </div>
                            <button onClick={handleGenerate} disabled={isAnimating || !inputText.trim()} className="w-full py-2 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider rounded-md transition hover:bg-neutral-900 flex items-center justify-center gap-1.5 shadow-xs">
                                <RefreshCcw className={`w-3 h-3 ${isAnimating ? 'animate-spin' : ''}`} /> Slash Vector
                            </button>
                        </div>
                    )}

                    {activeTab === "style" && (
                        <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4">
                            {renderSearchDropdown("ninjaChar", "Select Clan Character", selectedNinja, setSelectedNinja, ninjaRegistry)}
                            {renderSearchDropdown("slashStyle", "Combat Visual FX Action", slashStyle, setSlashStyle, slashRegistry)}
                            {renderSearchDropdown("dojoTheme", "Dojo Plate Blueprint", dojoTheme, setDojoTheme, dojoThemesRegistry)}
                        </div>
                    )}
                </div>

                {/* Fixed Footer Control Actions */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-200 space-y-2 shrink-0">
                    <button onClick={() => setShowPreview(!showPreview)} className="w-full py-1.5 border border-neutral-200 bg-white rounded-md text-[10px] font-black uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 transition flex items-center justify-center gap-1.5">
                        {showPreview ? <><EyeOff className="w-3.5 h-3.5" /> Collapse Canvas</> : <><Eye className="w-3.5 h-3.5" /> Expand Canvas</>}
                    </button>
                    <button onClick={handleDownload} disabled={isDownloading || isAnimating} className="w-full bg-neutral-950 text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition hover:bg-neutral-900 flex items-center justify-center gap-2">
                        {isDownloading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Etching Matrix...</> : <><Download className="w-3.5 h-3.5" /> Export Ninja Strike (PNG)</>}
                    </button>
                </div>
            </div>

            {/* ── RIGHT CANVAS PREVIEW PANEL (Fixed: Size scale increased from max-w-sm to max-w-xl layout blocks) ── */}
            <div className="lg:col-span-7 h-full overflow-y-auto bg-neutral-50/50 p-5 md:p-6 flex flex-col items-center justify-start relative">
                {showPreview && (
                    <div
                        ref={previewRef}
                        // Upgraded: Canvas dimensions stretched using max-w-xl with increased px-10 py-14 padding density
                        className={`w-full max-w-xl border border-neutral-300 rounded-xl px-10 py-14 min-h-[180px] shadow-2xl relative flex items-center overflow-hidden select-none my-auto transition-all duration-200 ${activeThemeData.bg}`}
                    >
                        {/* Dynamic Horizontal Scanning Lines based on theme selection */}
                        {dojoTheme === 'neon' && (
                            <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(244,63,94,0.06)_1px,rgba(244,63,94,0.06)_2px)]" />
                        )}

                        <div className="w-full relative flex items-center justify-between gap-6 z-10">
                            <span
                                className={`text-2xl sm:text-3xl font-black uppercase break-all flex-1 leading-snug tracking-wide ${activeThemeData.text}`}
                                style={{
                                    fontFamily: "'Permanent Marker', 'Comic Sans MS', cursive, sans-serif",
                                    letterSpacing: '0.04em'
                                }}
                            >
                                {displayedText}
                            </span>

                            {/* Animated Slashing Avatar Puppet node */}
                            <div
                                className={`inline-block text-5xl shrink-0 transform origin-bottom transition-all duration-150 ${isAnimating ? 'animate-sword-slash' : 'scale-100'}`}
                                style={{ marginTop: '-4px' }}
                            >
                                {selectedNinja === 'kunoichi' ? "🥷‍♀️" : selectedNinja === 'stealth' ? "👤" : "🥷"}

                                {/* Dynamic Action Combat Indicators based on Dropdown Variable state */}
                                {isAnimating && (
                                    <span className="absolute -top-3 -right-4 text-2xl animate-pulse opacity-90">
                                        {slashStyle === 'shuriken' ? "💥" : slashStyle === 'smoke' ? "💨" : "⚔️"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Injected Combat Slash Keyframes matrix framework mapping layout actions */}
            <style jsx global>{`
                @keyframes swordSlash {
                    0%, 100% { transform: translateX(0px) rotate(0deg); }
                    25% { transform: translateX(6px) rotate(10deg) scale(1.05); }
                    50% { transform: translateX(-2px) rotate(-6deg); }
                    75% { transform: translateX(4px) rotate(6deg); }
                }
                .animate-sword-slash {
                    animation: swordSlash 0.22s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}