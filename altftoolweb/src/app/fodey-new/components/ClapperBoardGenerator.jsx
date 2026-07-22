'use client'

import React, { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import {
    Download, Loader2, Film, Sliders, Type, ChevronDown, Check, Search, Eye, EyeOff, RotateCcw,
    Clapperboard as ClapIcon
} from "lucide-react";

export default function ClapperBoardGenerator() {
    const [theme, setTheme] = useState("light");

    // Clapperboard Fields
    const [production, setProduction] = useState("THE MARTIAN INVASION");
    const [prodCo, setProdCo] = useState("WARNER BROS. PICTURES");
    const [director, setDirector] = useState("STEVEN SPIELBERG");
    const [cameraman, setCameraman] = useState("EMMANUEL LUBEZKI");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [scene, setScene] = useState("42");
    const [take, setTake] = useState("7");
    const [roll, setRoll] = useState("A");
    const [sound, setSound] = useState("SYNC");

    // Creative Enhancement States
    const [slateStyle, setSlateStyle] = useState("ebony"); // ebony, acrylic, woodgrain
    const [fontArchetype, setFontArchetype] = useState("sans"); // sans, serif, handwritten
    const [chalkOpacity, setChalkOpacity] = useState(90);
    const [isClapping, setIsClapping] = useState(false);

    // Premium Native Dropdown States
    const [dropdownOpen, setDropdownOpen] = useState(null); // 'slateStyle', 'fontArchetype'
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownContainerRef = useRef(null);

    const [isDownloading, setIsDownloading] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [activeTab, setActiveTab] = useState("basic");
    const previewRef = useRef(null);

    // Dropdown Registries Options mapping
    const slateStylesRegistry = [
        { id: "ebony", label: "Classic Traditional Charcoal Slate" },
        { id: "acrylic", label: "Modern Studio White Acrylic Blackboard" },
        { id: "woodgrain", label: "Retro Vintage Hardwood Plate" }
    ];

    const fontArchetypesRegistry = [
        { id: "sans", label: "Bold Engraved Studio Sans" },
        { id: "serif", label: "Traditional Layout Monospace Block" },
        { id: "handwritten", label: "Raw Script Handwritten Set Chalk" }
    ];

    useEffect(() => {
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
        };
    }, []);

    const triggerClapAnimation = () => {
        setIsClapping(true);
        setTimeout(() => setIsClapping(false), 300);
    };

    const handleInputChange = (setter, value) => {
        setter(value);
        triggerClapAnimation();
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const dateObj = new Date(dateString);
        return dateObj.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const handleDownload = async () => {
        if (!previewRef.current) return;
        setIsDownloading(true);
        try {
            await document.fonts.ready;
            const dataUrl = await toPng(previewRef.current, {
                pixelRatio: 3,
                backgroundColor: "transparent",
            });
            saveAs(dataUrl, `hollywood-clapperboard-${Date.now()}.png`);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDownloading(false);
        }
    };

    const resetToDefault = () => {
        setProduction("THE MARTIAN INVASION");
        setProdCo("WARNER BROS. PICTURES");
        setDirector("STEVEN SPIELBERG");
        setCameraman("EMMANUEL LUBEZKI");
        setDate(new Date().toISOString().split("T")[0]);
        setScene("42");
        setTake("7");
        setRoll("A");
        setSound("SYNC");
        setSlateStyle("ebony");
        setFontArchetype("sans");
        setChalkOpacity(90);
    };

    const getSlateColors = () => {
        switch (slateStyle) {
            case "acrylic":
                return { bg: "bg-neutral-50 text-neutral-900 border-neutral-300", text: "text-neutral-900", line: "border-neutral-900", textHue: "#171717" };
            case "woodgrain":
                return { bg: "bg-amber-950 text-amber-100 border-amber-900 shadow-inner", text: "text-amber-100", line: "border-amber-700/60", textHue: "#fef3c7" };
            default:
                return { bg: "bg-[#1A1A1A] text-white border-neutral-900", text: "text-neutral-200", line: "border-white", textHue: "#e5e5e5" };
        }
    };

    const getTypographyClass = () => {
        if (fontArchetype === "serif") return "font-serif tracking-normal uppercase";
        if (fontArchetype === "handwritten") return "font-mono tracking-wide lowercase italic";
        return "font-sans font-black tracking-wider uppercase";
    };

    const boardStyle = getSlateColors();

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
                                        onClick={() => { setVal(opt.id); setDropdownOpen(null); setSearchQuery(""); triggerClapAnimation(); }}
                                        className="w-full px-3 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
                                    >
                                        <span>{opt.label}</span>
                                        {currentVal === opt.id && <Check className="w-3.5 h-3.5 text-neutral-900" />}
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-3 text-xs text-neutral-400 italic text-center">No configurations found</div>
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

                {/* Scrollable Upper Control Block */}
                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">

                    {/* Header Details */}
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                        <div>
                            <h2 className="text-md font-bold tracking-tight flex items-center gap-2 text-neutral-900">
                                <ClapIcon className="w-4 h-4 text-neutral-500" />
                                Hollywood Clapper Director
                            </h2>
                            <p className="text-[11px] text-neutral-400 mt-0.5">Production slate vectorization workspace</p>
                        </div>
                        <button onClick={resetToDefault} className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border border-neutral-200 rounded-md hover:bg-neutral-50 transition">
                            <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                    </div>

                    {/* Tab Navigation Menu */}
                    <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200/60 flex-wrap">
                        <button onClick={() => setActiveTab("basic")} className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md text-[10px] font-black uppercase tracking-wider transition ${activeTab === "basic" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-500 hover:bg-neutral-200"}`}>
                            <Type className="w-3 h-3" /> Slate Texts
                        </button>
                        <button onClick={() => setActiveTab("display")} className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md text-[10px] font-black uppercase tracking-wider transition ${activeTab === "display" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-500 hover:bg-neutral-200"}`}>
                            <Sliders className="w-3 h-3" /> Material & Fonts
                        </button>
                    </div>

                    {/* Content Section Tab Switches */}
                    {activeTab === "basic" && (
                        <div className="space-y-4 bg-neutral-50/40 border border-neutral-200 rounded-xl p-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">SCENE</label>
                                    <input type="text" value={scene} onChange={(e) => handleInputChange(setScene, e.target.value.toUpperCase())} className="w-full px-2 py-1.5 border border-neutral-200 rounded-md bg-white text-xs text-center font-bold font-mono" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">TAKE</label>
                                    <input type="text" value={take} onChange={(e) => handleInputChange(setTake, e.target.value.toUpperCase())} className="w-full px-2 py-1.5 border border-neutral-200 rounded-md bg-white text-xs text-center font-bold font-mono" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">ROLL</label>
                                    <input type="text" value={roll} onChange={(e) => handleInputChange(setRoll, e.target.value.toUpperCase())} className="w-full px-2 py-1.5 border border-neutral-200 rounded-md bg-white text-xs text-center font-bold font-mono" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">DATE STR</label>
                                    <input type="date" value={date} onChange={(e) => handleInputChange(setDate, e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md bg-white text-xs font-semibold" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">SOUND AUDIO</label>
                                    <input type="text" value={sound} onChange={(e) => handleInputChange(setSound, e.target.value.toUpperCase())} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md bg-white text-xs font-semibold" placeholder="e.g. SYNC / MOS" />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2 border-t border-neutral-100">
                                <div>
                                    <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">PRODUCTION IDENTITY</label>
                                    <input type="text" value={production} onChange={(e) => handleInputChange(setProduction, e.target.value.toUpperCase())} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md bg-white text-xs font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">STUDIO / PROD. CO.</label>
                                    <input type="text" value={prodCo} onChange={(e) => handleInputChange(setProdCo(e.target.value.toUpperCase()))} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md bg-white text-xs font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">DIRECTOR NAME</label>
                                    <input type="text" value={director} onChange={(e) => handleInputChange(setDirector, e.target.value.toUpperCase())} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md bg-white text-xs font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">CAMERAMAN CHIEF</label>
                                    <input type="text" value={cameraman} onChange={(e) => handleInputChange(setCameraman, e.target.value.toUpperCase())} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md bg-white text-xs font-medium" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "display" && (
                        <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4">
                            {renderSearchDropdown("slateStyle", "Slate Skin Board Material", slateStyle, setSlateStyle, slateStylesRegistry)}
                            {renderSearchDropdown("fontArchetype", "Production Notation Font", fontArchetype, setFontArchetype, fontArchetypesRegistry)}

                            <div className="pt-2 border-t border-neutral-100">
                                <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1">Chalk Line Bleed Opacity ({chalkOpacity}%)</label>
                                <input type="range" min={40} max={100} value={chalkOpacity} onChange={(e) => setChalkOpacity(Number(e.target.value))} className="w-full accent-neutral-900 cursor-pointer" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Fixed Control Footer Exporter */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-200 space-y-3 shrink-0">
                    <button onClick={() => setShowPreview(!showPreview)} className="w-full py-1.5 border border-neutral-200 bg-white rounded-md text-[11px] font-bold text-neutral-600 hover:bg-neutral-50 transition flex items-center justify-center gap-1.5">
                        {showPreview ? <><EyeOff className="w-3.5 h-3.5" /> Collapse Screen Preview</> : <><Eye className="w-3.5 h-3.5" /> Expand Screen Preview</>}
                    </button>
                    <button onClick={handleDownload} disabled={isDownloading} className="w-full bg-neutral-950 text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition hover:bg-neutral-900 disabled:opacity-40 flex items-center justify-center gap-2">
                        {isDownloading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Rendering PNG Vector...</> : <><Download className="w-3.5 h-3.5" /> Export High-Res Clapper (PNG)</>}
                    </button>
                </div>
            </div>

            {/* ── RIGHT CANVAS PREVIEW PANEL ── */}
            <div className="lg:col-span-7 h-full overflow-y-auto bg-neutral-50/50 p-5 md:p-6 flex flex-col items-center justify-center relative">

                {showPreview && (
                    <div ref={previewRef} className="w-full max-w-md select-none p-4 bg-transparent relative my-auto">

                        {/* TOP MOVING CLAPPER STICK (Animate Rotation Trigger) */}
                        <div
                            className="h-11 w-full rounded-t-sm mb-1 shadow-md border-b-4 border-neutral-950 relative z-30"
                            style={{
                                background: slateStyle === 'acrylic'
                                    ? 'repeating-linear-gradient(-45deg, #F5F5F5, #F5F5F5 25px, #171717 25px, #171717 50px)'
                                    : 'repeating-linear-gradient(-45deg, #1A1A1A, #1A1A1A 25px, #FFFFFF 25px, #FFFFFF 50px)',
                                transform: isClapping ? 'rotate(0deg) translateY(0px)' : 'rotate(-9deg) translateY(-3px) translateX(-5px)',
                                transformOrigin: 'bottom left',
                                transition: 'transform 0.12s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        />

                        {/* HINGE PIN BRACKET BLOCK */}
                        <div className="absolute top-[34px] left-2 w-9 h-9 bg-neutral-800 border border-neutral-600 rounded-xs z-40 flex flex-wrap p-1 gap-1 shadow-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                        </div>

                        {/* MAIN SLATE PLATFORM LAYER */}
                        <div className={`border-4 rounded-b-md shadow-2xl overflow-hidden font-sans relative ${boardStyle.bg}`}>

                            {/* LOWER STATIONARY STICK STRIP */}
                            <div
                                className={`h-11 w-full border-b-4 ${boardStyle.line}`}
                                style={{
                                    background: slateStyle === 'acrylic'
                                        ? 'repeating-linear-gradient(-45deg, #F5F5F5, #F5F5F5 25px, #171717 25px, #171717 50px)'
                                        : 'repeating-linear-gradient(-45deg, #1A1A1A, #1A1A1A 25px, #FFFFFF 25px, #FFFFFF 50px)'
                                }}
                            />

                            {/* CORE HOLLYWOOD MATRIX DATAGRID */}
                            <div className="p-4 space-y-3 tracking-wide" style={{ color: boardStyle.textHue, opacity: chalkOpacity / 100 }}>

                                {/* PROD DISPLAY ENTRY */}
                                <div className={`border-b-2 pb-1.5 text-center ${boardStyle.line}`}>
                                    <div className="text-[10px] font-black tracking-widest text-left opacity-60">PRODUCTION</div>
                                    <div className={`text-lg font-black tracking-normal min-h-[24px] truncate mt-0.5 ${getTypographyClass()}`}>{production || "—"}</div>
                                </div>

                                {/* SCENE | TAKE | ROLL ROW TRIPLE ELEMENT */}
                                <div className={`grid grid-cols-12 border-b-2 text-center ${boardStyle.line}`}>
                                    <div className={`col-span-4 border-r-2 pb-2 ${boardStyle.line}`}>
                                        <div className="text-[10px] font-black text-left opacity-60">SCENE</div>
                                        <div className="text-2xl font-black mt-1 min-h-[32px] font-mono tracking-normal text-center">{scene || "—"}</div>
                                    </div>
                                    <div className={`col-span-4 border-r-2 pb-2 ${boardStyle.line}`}>
                                        <div className="text-[10px] font-black text-left opacity-60">TAKE</div>
                                        <div className="text-2xl font-black mt-1 min-h-[32px] font-mono tracking-normal text-center">{take || "—"}</div>
                                    </div>
                                    <div className="col-span-4 pb-2">
                                        <div className="text-[10px] font-black text-left opacity-60">ROLL</div>
                                        <div className="text-2xl font-black mt-1 min-h-[32px] font-mono tracking-normal text-center">{roll || "—"}</div>
                                    </div>
                                </div>

                                {/* DATE & SOUND ROW */}
                                <div className={`grid grid-cols-12 border-b-2 ${boardStyle.line}`}>
                                    <div className={`col-span-7 border-r-2 pb-1.5 ${boardStyle.line}`}>
                                        <div className="text-[10px] font-black opacity-60">DATE</div>
                                        <div className="text-base font-bold font-mono text-center mt-0.5 min-h-[22px] tracking-normal">
                                            {formatDate(date)}
                                        </div>
                                    </div>
                                    <div className="col-span-5 pl-2 pb-1.5">
                                        <div className="text-[10px] font-black opacity-60">SOUND</div>
                                        <div className="text-base font-bold font-mono text-center mt-0.5 min-h-[22px] tracking-normal">
                                            {sound || "—"}
                                        </div>
                                    </div>
                                </div>

                                {/* ROW 3: PROD CO */}
                                <div className={`border-b-2 pb-1 flex items-baseline justify-between gap-4 ${boardStyle.line}`}>
                                    <span className="text-[10px] font-black opacity-60 shrink-0">PROD.CO.</span>
                                    <span className={`text-xs font-bold truncate ${getTypographyClass()}`}>{prodCo || "—"}</span>
                                </div>

                                {/* ROW 4: DIRECTOR */}
                                <div className={`border-b-2 pb-1 flex items-baseline justify-between gap-4 ${boardStyle.line}`}>
                                    <span className="text-[10px] font-black opacity-60 shrink-0">DIRECTOR</span>
                                    <span className={`text-xs font-bold truncate ${getTypographyClass()}`}>{director || "—"}</span>
                                </div>

                                {/* ROW 5: CAMERAMAN */}
                                <div className="pb-0.5 flex items-baseline justify-between gap-4">
                                    <span className="text-[10px] font-black opacity-60 shrink-0">CAMERAMAN</span>
                                    <span className={`text-xs font-bold truncate ${getTypographyClass()}`}>{cameraman || "—"}</span>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}