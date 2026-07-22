'use client'

import React, { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import {
    Download, Loader2, Upload, Link as LinkIcon, RotateCcw,
    Type, Palette, ShieldAlert, Sliders, Search, ChevronDown, Check
} from "lucide-react";

export default function WantedPosterGenerator() {
    const [theme, setTheme] = useState("light");

    // Core Content Fields
    const [name, setName] = useState("WILD BILL HICKOK");
    const [crime, setCrime] = useState("DEAD OR ALIVE FOR TRAIN ROBBERY");
    const [reward, setReward] = useState("$5,000");
    const [description, setDescription] = useState("KNOWN TO FREQUENT SALOONS. ARMED AND EXTREMELY DANGEROUS. APPROACH WITH UTMOST CAUTION.");
    const [imageUrl, setImageUrl] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);

    // Advanced Custom Features Layout States
    const [posterTint, setPosterTint] = useState("aged_ochre");
    const [bountyType, setBountyType] = useState("dead_or_alive");
    const [typographyClass, setTypographyClass] = useState("woodblock");
    const [borderWeight, setBorderWeight] = useState("double");

    // Premium Dropdowns Configuration Hook States
    const [dropdownOpen, setDropdownOpen] = useState(null); // 'posterTint', 'bountyType', 'typographyClass', 'borderWeight'
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownContainerRef = useRef(null);

    const fileInputRef = useRef(null);
    const previewRef = useRef(null);
    const [activeTab, setActiveTab] = useState("content");

    // Custom Registries Arrays Mapping Configuration
    const posterTintsRegistry = [
        { id: "aged_ochre", label: "Traditional Aged Ochre Broadside" },
        { id: "sun_bleached", label: "Sun-Bleached Desert Canvas" },
        { id: "sepia_charcoal", label: "Burned Charcoal Heavy Sepia" }
    ];

    const bountyTypesRegistry = [
        { id: "dead_or_alive", label: "Dead or Alive Bounty Warrant" },
        { id: "questioning", label: "Wanted For Questioning Only" },
        { id: "captured", label: "Captured Sheriff Receipt Banner" }
    ];

    const typographiesRegistry = [
        { id: "woodblock", label: "Authentic Frontier Woodblock Slab" },
        { id: "serif", label: "Standard Industrial Editorial Serif" },
        { id: "typewriter", label: "Rustic Outpost Mechanical Typewriter" }
    ];

    const bordersRegistry = [
        { id: "double", label: "Classic Double-Line Matrix" },
        { id: "rustic_thick", label: "Heavy Thick Block Border" },
        { id: "clean", label: "Minimal Clean Hairline" }
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

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = async () => {
        if (!previewRef.current) return;
        setIsDownloading(true);
        try {
            await document.fonts.ready;
            const bgMap = { aged_ochre: "#E6D5B8", sun_bleached: "#F2EADB", sepia_charcoal: "#CBB393" };
            const dataUrl = await toPng(previewRef.current, {
                pixelRatio: 3,
                backgroundColor: bgMap[posterTint] || "#E6D5B8"
            });
            saveAs(dataUrl, `wanted-${name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}.png`);
        } catch (err) {
            console.error("Failed to generate image:", err);
        } finally {
            setIsDownloading(false);
        }
    };

    const resetFields = () => {
        setName("WILD BILL HICKOK");
        setCrime("DEAD OR ALIVE FOR TRAIN ROBBERY");
        setReward("$5,000");
        setDescription("KNOWN TO FREQUENT SALOONS. ARMED AND EXTREMELY DANGEROUS. APPROACH WITH UTMOST CAUTION.");
        setImageUrl("");
        setPosterTint("aged_ochre");
        setBountyType("dead_or_alive");
        setTypographyClass("woodblock");
        setBorderWeight("double");
    };

    const getPosterStyles = () => {
        switch (posterTint) {
            case "sun_bleached": return { cardBg: "bg-[#F2EADB]", text: "text-[#36261C]", tintLayer: "rgba(54,38,28,0.02)" };
            case "sepia_charcoal": return { cardBg: "bg-[#CBB393]", text: "text-[#1C120C]", tintLayer: "rgba(28,18,12,0.08)" };
            default: return { cardBg: "bg-[#E6D5B8]", text: "text-[#2B1B10]", tintLayer: "rgba(43,27,16,0.05)" };
        }
    };

    const getFontStyles = () => {
        if (typographyClass === "serif") return { heading: "font-serif font-black tracking-normal", body: "font-serif font-bold" };
        if (typographyClass === "typewriter") return { heading: "font-mono font-black tracking-tight", body: "font-mono font-medium" };
        return { heading: "font-serif font-black tracking-[0.12em]", body: "font-serif font-extrabold" };
    };

    const getBorderClass = () => {
        if (borderWeight === "rustic_thick") return "border-[20px] border-[#3D2516]";
        if (borderWeight === "clean") return "border-4 border-[#3D2516]";
        return "border-[12px] border-double border-[#3D2516]";
    };

    const activePoster = getPosterStyles();
    const activeFonts = getFontStyles();

    // Generic Custom Search-Enabled Dropdown Renderer to process Next.js structures natively
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
                                type="text" placeholder="Search setting..." value={searchQuery}
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

                {/* Scrollable Control Elements */}
                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">

                    {/* Header Title Gutter */}
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                        <div>
                            <h2 className="text-md font-bold tracking-tight flex items-center gap-2 text-neutral-900">
                                <ShieldAlert className="w-4 h-4 text-neutral-500" />
                                Outlaw Bounty Slate
                            </h2>
                            <p className="text-[11px] text-neutral-400 mt-0.5">Old-west frontier broadside reward generator</p>
                        </div>
                        <button onClick={resetFields} className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border border-neutral-200 rounded-md hover:bg-neutral-50 transition">
                            <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                    </div>

                    {/* Minimal Tabs Switchboard */}
                    <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200/60">
                        <button onClick={() => setActiveTab("content")} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition ${activeTab === "content" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-500 hover:bg-neutral-200"}`}>
                            <Type className="w-3 h-3" /> Poster Text
                        </button>
                        <button onClick={() => setActiveTab("styling")} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition ${activeTab === "styling" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-500 hover:bg-neutral-200"}`}>
                            <Sliders className="w-3 h-3" /> Aging Filters
                        </button>
                    </div>

                    {/* Content Section Tab Controls */}
                    {activeTab === "content" && (
                        <div className="space-y-4 bg-neutral-50/40 border border-neutral-200 rounded-xl p-4">
                            <div>
                                <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">Bounty Amount / Reward</label>
                                <input type="text" value={reward} onChange={(e) => setReward(e.target.value.toUpperCase())} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs font-mono font-bold text-amber-800" />
                            </div>

                            <div>
                                <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">Outlaw Full Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs font-bold" />
                            </div>

                            <div>
                                <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">Primary Accusation / Mandate</label>
                                <input type="text" value={crime} onChange={(e) => setCrime(e.target.value.toUpperCase())} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs" />
                            </div>

                            <div>
                                <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">Description & Bounty Directives</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value.toUpperCase())} rows={3} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs resize-none leading-relaxed" />
                            </div>

                            {/* Image Controls Group */}
                            <div className="space-y-2 pt-2 border-t border-neutral-100">
                                <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider">Outlaw Sketch Picture</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="py-1.5 text-xs border border-dashed rounded-md hover:bg-neutral-50 transition font-medium">Upload File</button>
                                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                    <div className="relative flex items-center">
                                        <LinkIcon className="absolute left-2.5 w-3 h-3 text-neutral-400 pointer-events-none" />
                                        <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL..." className="w-full pl-7 pr-2 py-1.5 text-xs border border-neutral-200 rounded-md" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "styling" && (
                        <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4">
                            {/* Updated: Swapped out all native select dropdowns with custom React Search components */}
                            {renderSearchDropdown("posterTint", "Poster Paper Age Grain", posterTint, setPosterTint, posterTintsRegistry)}
                            {renderSearchDropdown("bountyType", "Bounty Class Order", bountyType, setBountyType, bountyTypesRegistry)}
                            {renderSearchDropdown("typographyClass", "Woodblock Typography Core", typographyClass, setTypographyClass, typographiesRegistry)}
                            {renderSearchDropdown("borderWeight", "Border Framing Weight", borderWeight, setBorderWeight, bordersRegistry)}
                        </div>
                    )}
                </div>

                {/* Fixed Control Footer Exporter */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-200 space-y-2 shrink-0">
                    <button onClick={handleDownload} disabled={isDownloading} className="w-full bg-neutral-950 text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition hover:bg-neutral-900 disabled:opacity-40 flex items-center justify-center gap-2">
                        {isDownloading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Distressing Poster...</> : <><Download className="w-3.5 h-3.5" /> Export Frontier Poster (PNG)</>}
                    </button>
                </div>
            </div>

            {/* ── RIGHT CANVAS PREVIEW PANEL ── */}
            <div className="lg:col-span-7 h-full overflow-y-auto bg-neutral-50/50 p-5 md:p-6 flex flex-col items-center justify-start relative">

                <div
                    ref={previewRef}
                    className={`w-full max-w-sm ${activePoster.cardBg} ${activePoster.text} ${getBorderClass()} p-6 md:p-8 shadow-xl space-y-4 select-none relative my-auto transition-colors duration-200`}
                    style={{
                        backgroundImage: `radial-gradient(circle at 50% 50%, transparent 55%, ${activePoster.tintLayer} 100%)`
                    }}
                >
                    {/* Atmospheric Lithograph Grain Overlay */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#000_2px,#000_4px)]" />

                    {/* Top Headers Row */}
                    <div className="text-center space-y-1">
                        <h2 className={`text-5xl font-black text-center leading-none drop-shadow-2xs ${activeFonts.heading}`}>
                            WANTED
                        </h2>

                        {reward && (
                            <div className="pt-1.5 pb-1 border-t-2 border-b-2 border-[#3D2516] inline-block w-full">
                                <div className="text-2xl font-black tracking-wide text-center leading-none uppercase font-sans">
                                    {reward} REWARD
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Bounty Order Block */}
                    <div className="text-center text-[10px] font-black tracking-widest uppercase border-b-2 border-[#3D2516]/40 pb-1 opacity-80">
                        {bountyType === 'questioning' && "★ WANTED FOR GENERAL QUESTIONING ★"}
                        {bountyType === 'captured' && "★ CAPTURED SHERIFF FILING RECEIPT ★"}
                        {bountyType === 'dead_or_alive' && "★ DEAD OR ALIVE BY WARRANTRY ORDER ★"}
                    </div>

                    {/* Name Plate */}
                    <div className="text-center py-1">
                        <h3 className="text-xl font-black uppercase tracking-wider font-serif bg-[#3D2516] text-[#E6D5B8] px-2 py-1.5 rounded-2xs shadow-xs truncate">
                            {name || "RENEGADE OUTLAW"}
                        </h3>
                    </div>

                    {/* Depiction Portrait Sandbox Box */}
                    <div className="flex justify-center my-1.5">
                        <div className="w-36 h-40 bg-[#D6C2A1]/40 border-2 border-[#3D2516] shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="outlaw file drawing"
                                    className="w-full h-full object-cover grayscale contrast-135 sepia-25 brightness-90"
                                    style={{ mixBlendMode: "multiply" }}
                                />
                            ) : (
                                <div className="text-center p-4 space-y-1 opacity-50 select-none">
                                    <div className="text-3xl">👤</div>
                                    <div className="text-[8px] font-mono tracking-tight font-black uppercase">No Portrait File On Record</div>
                                </div>
                            )}
                            <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.25)] pointer-events-none" />
                        </div>
                    </div>

                    {/* Star Typography Break Separator */}
                    <div className="flex items-center justify-center gap-1.5 opacity-60 text-[9px]">
                        <span>★</span><span>★</span><span>★</span>
                    </div>

                    {/* Accusation Decrees */}
                    <div className="text-center space-y-2">
                        {crime && (
                            <p className={`font-black text-sm tracking-wide leading-tight border-b border-dashed border-[#3D2516]/30 pb-1.5 uppercase ${activeFonts.body}`}>
                                {crime}
                            </p>
                        )}

                        {description && (
                            <p className="text-[10px] font-bold leading-relaxed text-justify uppercase px-1 max-w-xs mx-auto opacity-90 font-serif">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Lower Authority Callout Stamp */}
                    <div className="border-t border-[#3D2516]/60 pt-2 text-center select-none">
                        <div className="text-[8px] font-mono font-black tracking-widest uppercase opacity-65">
                            BY MARSHAL COMMISSION // GENERAL TERRITORY OFFICE
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}