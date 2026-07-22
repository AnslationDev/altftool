'use client'

import React, { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import {
    Download, Loader2, Wand2, RefreshCcw, Type,
    Palette, Search, ChevronDown, Check, EyeOff, Eye
} from "lucide-react";

export default function WizardTextGenerator() {
    const [theme, setTheme] = useState("light");

    // Core Layout States
    const [inputText, setInputText] = useState("Hello Adventure");
    const [displayedText, setDisplayedText] = useState("Hello Adventure...");
    const [isAnimating, setIsAnimating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [activeTab, setActiveTab] = useState("content");

    // Search Dropdown States
    const [dropdownOpen, setDropdownOpen] = useState(null); // 'wizardChar', 'fontStyle', 'scrollTheme'
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownContainerRef = useRef(null);

    // Config Parameters
    const [typingSpeed, setTypingSpeed] = useState(100);
    const [selectedWizard, setSelectedWizard] = useState("wizard_classic");
    const [fontStyle, setFontStyle] = useState("permanent_marker");
    const [scrollTheme, setScrollTheme] = useState("parchment_aged");

    const animationRef = useRef(null);
    const previewRef = useRef(null);

    const wizardRegistry = [
        { id: "wizard_classic", label: "Grand Master Wizard 🧙‍♂️" },
        { id: "witch_mystic", label: "Mystic Moon Witch 🧙‍♀️" },
        { id: "elf_scribe", label: "Woodland Scribe Elf 🧝‍♂️" }
    ];

    const fontStylesRegistry = [
        { id: "permanent_marker", label: "Permanent Marker Script" },
        { id: "serif", label: "Traditional Arcane Serif" },
        { id: "monospace", label: "Retro Typewriter Mono" }
    ];

    const scrollThemesRegistry = [
        { id: "parchment_aged", label: "Enchanted Script Parchment", bg: "bg-[#F4EAD4] border-[#D4C29D]", text: "text-[#3A2A18]", layer: "#F4EAD4" },
        { id: "white", label: "Pristine Minimal Stark White", bg: "bg-white border-neutral-200", text: "text-neutral-800", layer: "#FFFFFF" },
        { id: "dark", label: "Obsidian Ninja Night", bg: "bg-neutral-900 border-neutral-800", text: "text-neutral-100", layer: "#171717" },
        { id: "cyber_grid", label: "Matrix Obsidian Laser Void", bg: "bg-[#020617] border-[#06B6D4]", text: "text-[#22D3EE]", layer: "#020617" }
    ];

    useEffect(() => {
        triggerWizardAnimation(inputText || "Hello Adventure");

        const checkTheme = () => {
            const isDark = document.querySelector('[data-theme="dark"]') !== null;
            setTheme(isDark ? "dark" : "light");
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        const handleClickOutside = (event) => {
            if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target)) {
                setDropdownOpen(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            observer.disconnect();
            document.removeEventListener("mousedown", handleClickOutside);
            if (animationRef.current) clearInterval(animationRef.current);
        };
    }, [typingSpeed]);

    const triggerWizardAnimation = (textToAnimate) => {
        if (animationRef.current) clearInterval(animationRef.current);
        setIsAnimating(true);
        setDisplayedText("");

        let targetText = textToAnimate.trim();
        let currentLength = 0;

        animationRef.current = setInterval(() => {
            if (currentLength < targetText.length) {
                currentLength++;
                setDisplayedText(targetText.slice(0, currentLength) + (currentLength === targetText.length ? "..." : "|"));
            } else {
                clearInterval(animationRef.current);
                setIsAnimating(false);
            }
        }, typingSpeed);
    };

    const handleGenerateSpell = (e) => {
        if (e) e.preventDefault();
        triggerWizardAnimation(inputText || "Hello Adventure");
    };

    const handleDownload = async () => {
        if (!previewRef.current) return;
        setIsDownloading(true);
        try {
            await document.fonts.ready;
            const themeColors = scrollThemesRegistry.find(t => t.id === scrollTheme) || scrollThemesRegistry[0];
            const dataUrl = await toPng(previewRef.current, { pixelRatio: 3, backgroundColor: themeColors.layer });
            saveAs(dataUrl, `wizard-slate-${Date.now()}.png`);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDownloading(false);
        }
    };

    const activeThemeData = scrollThemesRegistry.find(t => t.id === scrollTheme) || scrollThemesRegistry[0];

    const renderSearchDropdown = (id, label, currentVal, setVal, options) => {
        const isOpen = dropdownOpen === id;
        const activeOption = options.find(o => o.id === currentVal) || options[0];
        const filtered = options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase().trim()));

        return (
            <div className="space-y-1 relative" onMouseDown={(e) => e.stopPropagation()}>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 tracking-wider">{label}</label>
                <button
                    type="button" onClick={() => { setDropdownOpen(isOpen ? null : id); setSearchQuery(""); }}
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
                                type="text" placeholder="Search..." value={searchQuery}
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

    const getFontStyles = () => {
        if (fontStyle === "serif") return { fontFamily: "Georgia, serif" };
        if (fontStyle === "monospace") return { fontFamily: "'Courier New', monospace", fontWeight: "900" };
        return { fontFamily: "'Permanent Marker', cursive, sans-serif" };
    };

    return (
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-white" ref={dropdownContainerRef}>

            {/* ── LEFT CONFIGURATION PANEL ── */}
            <div className="lg:col-span-5 h-full flex flex-col justify-between border-r border-neutral-200 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
                    <div className="border-b border-neutral-100 pb-3">
                        <h2 className="text-sm font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                            <Wand2 className="w-4 h-4 text-neutral-500" /> Wizard Scroll Inscriber
                        </h2>
                    </div>

                    <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200/60">
                        <button onClick={() => setActiveTab("content")} className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition ${activeTab === "content" ? "bg-neutral-900 text-white" : "text-neutral-500"}`}>Inscribe</button>
                        <button onClick={() => setActiveTab("style")} className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition ${activeTab === "style" ? "bg-neutral-900 text-white" : "text-neutral-500"}`}>Presets</button>
                    </div>

                    {activeTab === "content" && (
                        <div className="space-y-4 bg-neutral-50/40 border border-neutral-200 rounded-xl p-4">
                            <div>
                                <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">Your Message Input</label>
                                <input
                                    type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-200 rounded-md text-xs font-mono" placeholder="Message lines..."
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase text-neutral-400">
                                    <span>Typing Speed</span><span className="font-mono text-neutral-800">{typingSpeed}ms</span>
                                </div>
                                <input type="range" min={40} max={200} step={20} value={typingSpeed} onChange={(e) => setTypingSpeed(Number(e.target.value))} className="w-full accent-neutral-900 h-1 bg-neutral-100 appearance-none rounded-lg" />
                            </div>
                            <button onClick={handleGenerateSpell} disabled={isAnimating || !inputText.trim()} className="w-full py-2 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider rounded-md transition hover:bg-neutral-900 flex items-center justify-center gap-1.5">
                                <RefreshCcw className={`w-3 h-3 ${isAnimating ? 'animate-spin' : ''}`} /> Invoke Runes
                            </button>
                        </div>
                    )}

                    {activeTab === "style" && (
                        <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4">
                            {renderSearchDropdown("wizardChar", "Select Wizard Scribe", selectedWizard, setSelectedWizard, wizardRegistry)}
                            {renderSearchDropdown("fontStyle", "Incantation Lettering Style", fontStyle, setFontStyle, fontStylesRegistry)}
                            {renderSearchDropdown("scrollTheme", "Scroll Canvas Template", scrollTheme, setScrollTheme, scrollThemesRegistry)}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-neutral-50 border-t border-neutral-200 space-y-2 shrink-0">
                    <button onClick={() => setShowPreview(!showPreview)} className="w-full py-1.5 border border-neutral-200 bg-white rounded-md text-[10px] font-black uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 transition flex items-center justify-center gap-1.5">
                        {showPreview ? <><EyeOff className="w-3.5 h-3.5" /> Collapse Canvas</> : <><Eye className="w-3.5 h-3.5" /> Expand Canvas</>}
                    </button>
                    <button onClick={handleDownload} disabled={isDownloading || isAnimating} className="w-full bg-neutral-950 text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition hover:bg-neutral-900 flex items-center justify-center gap-2">
                        {isDownloading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Etching Matrix...</> : "Export Scroll Matrix (PNG)"}
                    </button>
                </div>
            </div>

            {/* ── RIGHT CANVAS PREVIEW PANEL (Size expanded to max-w-xl) ── */}
            <div className="lg:col-span-7 h-full overflow-y-auto bg-neutral-50/50 p-5 md:p-6 flex flex-col items-center justify-start relative">
                {showPreview && (
                    <div ref={previewRef} className={`w-full max-w-xl border px-8 py-12 min-h-[220px] shadow-xl relative flex items-center overflow-hidden select-none my-auto transition-all duration-200 ${activeThemeData.bg}`}>
                        {scrollTheme === 'cyber_grid' && <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(6,182,212,0.04)_1px,rgba(6,182,212,0.04)_2px)]" />}
                        <div className="w-full relative flex items-center flex-wrap pr-16 z-10">
                            <span className={`text-2xl sm:text-3xl font-black uppercase break-all mr-3 leading-tight ${activeThemeData.text}`} style={getFontStyles()}>
                                {displayedText}
                            </span>
                            <div className={`inline-block text-4xl transform ${isAnimating ? 'animate-bounce' : 'scale-100'}`} style={{ marginTop: '-4px' }}>
                                {selectedWizard === 'witch_mystic' ? "🧙‍♀️" : selectedWizard === 'elf_scribe' ? "🧝‍♂️" : "🧙‍♂️"}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}