'use client'

import React, { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import {
    Volume2, Loader2, Download, Cat, Type, Palette,
    Sliders, RotateCcw, Eye, EyeOff, Search, ChevronDown, Check
} from "lucide-react";

export default function RealTalkingCatGenerator() {
    const [theme, setTheme] = useState("light");

    // Core Layout Alignment Hook States
    const [inputText, setInputText] = useState("You can change\nthe stuff I say.");
    const [displayedText, setDisplayedText] = useState("You can change\nthe stuff I say.");
    const [isAnimating, setIsAnimating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [activeTab, setActiveTab] = useState("content");

    // Premium Native Dropdown Interaction States
    const [dropdownOpen, setDropdownOpen] = useState(null); // 'catBreed', 'bubbleStyle', 'canvasTheme'
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownContainerRef = useRef(null);

    // Advanced Configuration Options
    const [catBreed, setCatBreed] = useState("tabby");
    const [bubbleStyle, setBubbleStyle] = useState("classic");
    const [canvasTheme, setCanvasTheme] = useState("skyblue");
    const [voicePitch, setVoicePitch] = useState(1.8);
    const [voiceRate, setVoiceRate] = useState(1.15);

    const animationRef = useRef(null);
    const previewRef = useRef(null);

    useEffect(() => {
        const checkTheme = () => {
            const isDark = document.querySelector('[data-theme="dark"]') !== null;
            setTheme(isDark ? "dark" : "light");
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        // Global click listener to automatically close custom dropdowns on outside clicks
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
            if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
        };
    }, []);

    // Expanded Premium Model Cat Photo Assets Registries
    const catBreedRegistry = [
        { id: "tabby", label: "Domestic Tabby Shorthair", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=500&auto=format&fit=crop" },
        { id: "black", label: "Midnight Mystic Black Cat", image: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=500&auto=format&fit=crop" },
        { id: "siamese", label: "Royal Seal-Point Siamese", image: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=500&auto=format&fit=crop" },
        { id: "ginger", label: "Marmalade Ginger Tom Cat", image: "https://images.unsplash.com/photo-1574158622643-69d34d72650a?q=80&w=500&auto=format&fit=crop" },
        { id: "persian", label: "Fluffy White Persian Aristocrat", image: "https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=500&auto=format&fit=crop" },
        { id: "calico", label: "Tricolor Patchwork Calico", image: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?q=80&w=500&auto=format&fit=crop" },
        { id: "bengal", label: "Wild Leopard Bengal Miniature", image: "https://images.unsplash.com/photo-1577023311546-cdc07a8454d9?q=80&w=500&auto=format&fit=crop" },
        { id: "scottish", label: "Scottish Fold Round Portrait", image: "https://images.unsplash.com/photo-1561948955-570b270e7c36?q=80&w=500&auto=format&fit=crop" }
    ];

    const bubbleStylesRegistry = [
        { id: "classic", label: "Classic Soft Curved Balloon" },
        { id: "sharp", label: "Retro Sharp Exploding Frame" },
        { id: "cloud", label: "Whimsical Slumber Thought Cloud" }
    ];

    const canvasThemesRegistry = [
        { id: "skyblue", label: "Classic Sky Blue Studio" },
        { id: "peach", label: "Soft Pink Pastel Bubblegum" },
        { id: "synthwave", label: "Retro Synthwave Purple Deep" },
        { id: "light", label: "Minimal Clean Industrial Gray" }
    ];

    const activeBreedData = catBreedRegistry.find(b => b.id === catBreed) || catBreedRegistry[0];

    const speakPhraseWithCatPitch = (phraseToSpeak) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(phraseToSpeak);
        const allVoices = window.speechSynthesis.getVoices();

        const catVoice = allVoices.find(voice =>
            voice.name.toLowerCase().includes('zira') ||
            voice.name.toLowerCase().includes('google us english') ||
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('samantha')
        );

        if (catVoice) utterance.voice = catVoice;
        utterance.pitch = voicePitch;
        utterance.rate = voiceRate;

        utterance.onstart = () => { setIsAnimating(true); triggerMouthMovementLayout(); };
        utterance.onend = () => { setIsAnimating(false); if (animationRef.current) clearInterval(animationRef.current); };
        utterance.onerror = () => { setIsAnimating(false); if (animationRef.current) clearInterval(animationRef.current); };

        window.speechSynthesis.speak(utterance);
    };

    const triggerMouthMovementLayout = () => {
        if (animationRef.current) clearInterval(animationRef.current);
        let switchFrame = false;
        animationRef.current = setInterval(() => {
            switchFrame = !switchFrame;
            const mouthElement = document.getElementById("cat-mouth-puppet");
            if (mouthElement) {
                if (switchFrame) {
                    mouthElement.style.height = "16px";
                    mouthElement.style.transform = "scaleY(1.2)";
                } else {
                    mouthElement.style.height = "5px";
                    mouthElement.style.transform = "scaleY(0.5)";
                }
            }
        }, 100);
    };

    const triggerTextTypewriterAnimation = (targetText) => {
        if (animationRef.current) clearInterval(animationRef.current);
        setIsAnimating(true);
        setDisplayedText("");
        let currentLength = 0;

        animationRef.current = setInterval(() => {
            if (currentLength < targetText.length) {
                currentLength++;
                setDisplayedText(targetText.slice(0, currentLength));
            } else {
                clearInterval(animationRef.current);
                setIsAnimating(false);
            }
        }, 40);
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        triggerTextTypewriterAnimation(inputText.trim());
    };

    const handleVoicePlayback = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        setDisplayedText(inputText.trim());
        speakPhraseWithCatPitch(inputText.trim());
    };

    const handleDownload = async () => {
        if (!previewRef.current) return;
        setIsDownloading(true);
        try {
            await document.fonts.ready;
            const dataUrl = await toPng(previewRef.current, { pixelRatio: 3, backgroundColor: '#ffffff' });
            saveAs(dataUrl, `talking-cat-${Date.now()}.png`);
        } catch (err) {
            console.error(err);
        } finally { // Fixed: Swapped "declare" back with "finally"
            setIsDownloading(false);
        }
    };

    const resetFields = () => {
        setInputText("You can change\nthe stuff I say.");
        setDisplayedText("You can change\nthe stuff I say.");
        setCatBreed("tabby");
        setBubbleStyle("classic");
        setCanvasTheme("skyblue");
        setVoicePitch(1.8);
        setVoiceRate(1.15);
    };

    const getThemeColors = () => {
        switch (canvasTheme) {
            case "peach": return { bg: "#FBCFE8" };
            case "synthwave": return { bg: "#4C1D95" };
            case "light": return { bg: "#E5E7EB" };
            default: return { bg: "#6699cc" };
        }
    };

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
                    <div className="absolute left-0 right-0 mt-1 border border-neutral-200 rounded-lg bg-white shadow-xl z-50 overflow-hidden max-h-52 flex flex-col">
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
                                <div className="px-3 py-3 text-xs text-neutral-400 italic text-center">No matching configurations</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-white" ref={dropdownContainerRef}>

            {/* ── LEFT UTILITY CONFIGURATION SIDEBAR DECK ── */}
            <div className="lg:col-span-5 h-full flex flex-col justify-between border-r border-neutral-200 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">

                    {/* Header Row */}
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                        <div>
                            <h2 className="text-sm font-bold tracking-tight flex items-center gap-2 text-neutral-900">
                                <Cat className="w-4 h-4 text-neutral-500" />
                                Talking Cat Workspace
                            </h2>
                            <p className="text-[11px] text-neutral-400 mt-0.5">Dynamic token dialogue puppet generator</p>
                        </div>
                        <button onClick={resetFields} className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border border-neutral-200 rounded-md hover:bg-neutral-50 transition">
                            <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                    </div>

                    {/* Navigation Tab Hub Menu */}
                    <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200/60">
                        <button onClick={() => setActiveTab("content")} className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition ${activeTab === "content" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-500 hover:bg-neutral-200"}`}>
                            Dialogue Text
                        </button>
                        <button onClick={() => setActiveTab("breed")} className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition ${activeTab === "breed" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-500 hover:bg-neutral-200"}`}>
                            Cat Identity
                        </button>
                        <button onClick={() => setActiveTab("audio")} className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition ${activeTab === "audio" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-500 hover:bg-neutral-200"}`}>
                            Vocal Engine
                        </button>
                    </div>

                    {/* Tab Panels content logic */}
                    {activeTab === "content" && (
                        <div className="space-y-4 bg-neutral-50/40 border border-neutral-200 rounded-xl p-4">
                            <div>
                                <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">Cat's Speech Bubble Inscription</label>
                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    rows={3}
                                    className="w-full p-2.5 border border-neutral-200 bg-white rounded-md text-xs font-mono resize-none focus:outline-none"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button type="button" onClick={handleGenerate} disabled={isAnimating} className="flex-1 py-2 bg-neutral-950 text-white rounded-md font-bold text-xs uppercase tracking-wider transition disabled:opacity-40 shadow-xs">
                                    Print Lines
                                </button>
                                <button type="button" onClick={handleVoicePlayback} className="flex items-center justify-center gap-1.5 px-3.5 py-2 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold rounded-md transition shadow-3xs">
                                    <Volume2 className="w-3.5 h-3.5 text-neutral-500" /> Speak Meow!
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "breed" && (
                        <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4">
                            {renderSearchDropdown("catBreed", "Select Cat Breed", catBreed, setCatBreed, catBreedRegistry)}
                            {renderSearchDropdown("bubbleStyle", "Comic Balloon Shape", bubbleStyle, setBubbleStyle, bubbleStylesRegistry)}
                            {renderSearchDropdown("canvasTheme", "Studio Backdrop Tint", canvasTheme, setCanvasTheme, canvasThemesRegistry)}
                        </div>
                    )}

                    {activeTab === "audio" && (
                        <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase text-neutral-400">
                                    <span>Vocal Frequency Pitch</span>
                                    <span className="font-mono text-neutral-800">{voicePitch}x</span>
                                </div>
                                <input type="range" min={1.0} max={2.0} step={0.1} value={voicePitch} onChange={(e) => setVoicePitch(Number(e.target.value))} className="w-full accent-neutral-900 cursor-pointer h-1 rounded-lg bg-neutral-100 appearance-none" />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase text-neutral-400">
                                    <span>Speech Velocity Chatter Rate</span>
                                    <span className="font-mono text-neutral-800">{voiceRate}x</span>
                                </div>
                                <input type="range" min={0.8} max={1.6} step={0.05} value={voiceRate} onChange={(e) => setVoiceRate(Number(e.target.value))} className="w-full accent-neutral-900 cursor-pointer h-1 rounded-lg bg-neutral-100 appearance-none" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Exporter Utility Bottom Section */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-200 space-y-2 shrink-0">
                    <button onClick={() => setShowPreview(!showPreview)} className="w-full py-1.5 border border-neutral-200 bg-white rounded-md text-[10px] font-black uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 transition flex items-center justify-center gap-1.5">
                        {showPreview ? <><EyeOff className="w-3.5 h-3.5" /> Hide Stage View</> : <><Eye className="w-3.5 h-3.5" /> Display Stage View</>}
                    </button>
                    <button onClick={handleDownload} disabled={isDownloading || isAnimating} className="w-full bg-neutral-950 text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition hover:bg-neutral-900 disabled:opacity-40 flex items-center justify-center gap-2">
                        {isDownloading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing Output...</> : <><Download className="w-3.5 h-3.5" /> Export Cat Dispatch (PNG)</>}
                    </button>
                </div>
            </div>

            {/* ── RIGHT CANVAS PREVIEW PANEL ── */}
            <div className="lg:col-span-7 h-full overflow-y-auto bg-neutral-50/50 p-5 md:p-6 flex flex-col items-center justify-start relative">
                {showPreview && (
                    <div
                        ref={previewRef}
                        className="w-full max-w-xl border border-neutral-200 aspect-[2/1.1] relative flex items-center justify-between overflow-hidden select-none bg-white my-auto shadow-xl rounded-lg"
                    >
                        {/* Backdrop Gradient Clip-path Layer */}
                        <div
                            className="absolute right-0 top-0 bottom-0 w-[75%] h-full z-0 transition-colors duration-200"
                            style={{
                                backgroundColor: getThemeColors().bg,
                                clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%, 8% 50%)',
                            }}
                        />

                        {/* Cat Model Element Wrapper */}
                        <div className="relative w-[45%] h-full z-10 flex items-end left-2">
                            <img
                                src={activeBreedData.image}
                                alt={activeBreedData.label}
                                className="w-full h-[95%] object-cover object-left grayscale contrast-125 sepia-15 brightness-95"
                                style={{
                                    clipPath: 'ellipse(85% 90% at 15% 90%)',
                                    mixBlendMode: 'multiply'
                                }}
                            />

                            {/* Mouth Element Controller */}
                            <div
                                id="cat-mouth-puppet"
                                className="absolute bottom-[22px] left-[39%] w-6 h-1.5 scale-y-50 bg-[#221108] rounded-full border-t border-black transition-all duration-75"
                            />
                        </div>

                        {/* Speech Bubble Module */}
                        <div className="w-[55%] pr-5 z-10 relative flex items-center justify-start">
                            {bubbleStyle !== 'cloud' && (
                                <div className="absolute left-[-11px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[14px] border-r-white z-20"></div>
                            )}

                            <div className={`bg-white px-4 py-3 w-full min-h-[105px] flex items-center justify-center border border-neutral-200 shadow-sm ${bubbleStyle === 'sharp' ? 'rounded-none border-2 border-neutral-950' :
                                bubbleStyle === 'cloud' ? 'rounded-full border-dashed' : 'rounded-[1.8rem]'
                                }`}>
                                <p className={`text-neutral-900 text-sm font-bold text-center whitespace-pre-line leading-tight tracking-wide ${bubbleStyle === 'sharp' ? 'font-mono uppercase text-[11px]' : 'font-sans'}`}>
                                    {displayedText}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}