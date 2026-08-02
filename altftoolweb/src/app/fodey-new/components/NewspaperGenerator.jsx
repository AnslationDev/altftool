'use client'

import React, { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import {
    Download, Loader2, Type, Layout, Sliders,
    Eye, EyeOff, FileText, Settings, Quote, Image as ImageIcon,
    Upload, Link as LinkIcon, Trash2, RotateCcw, ChevronDown, ChevronUp,
    Palette, Newspaper as NewsIcon, ShieldCheck, Search, Check
} from "lucide-react";

export default function UltimateVintageNewspaper() {
    const [theme, setTheme] = useState("light");

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

    // Core State Variables
    const [newspaperName, setNewspaperName] = useState("The Daily Chronicle");
    const [dateText, setDateText] = useState("Sunday, August 30, 2006");
    const [price, setPrice] = useState("FIVE CENTS");
    const [issueNo, setIssueNo] = useState("NO. 42");
    const [volume, setVolume] = useState("VOL. CXXIV");
    const [location, setLocation] = useState("NEW YORK");
    const [established, setEstablished] = useState("ESTD. 1892");
    const [edition, setEdition] = useState("SPECIAL EDITION");
    const [leftEar, setLeftEar] = useState("WEATHER: FAIR, 72°");
    const [rightEar, setRightEar] = useState("PRICE: FIVE CENTS");
    const [headline, setHeadline] = useState("MARTIANS INVADE EARTH");
    const [subheadline, setSubheadline] = useState("Incredible Sighting of Alien Fleet Verified • Military on High Alert Worldwide");
    const [storyText, setStoryText] = useState(
        "Incredible as it may seem, it has been confirmed that a large martian invasion fleet has landed on earth tonight.\n\nFirst vessels were sighted over Great Britain, Denmark and Norway already in the late evening from where, as further reports indicate, the fleet headed towards the North Pole and Santa Claus was taken hostage by the invaders.\n\nAfterwards they split apart in order to approach most major cities around the earth. The streets filled as thousands fled their homes, many only wearing their pajamas. Military forces remain on high alert as the crafts hover menacingly above metropolitan areas.\n\nEyewitness accounts describe the alien vessels as massive, silent, and glowing with an otherworldly green luminescence. Scientists at the Royal Observatory have confirmed that the objects are not of terrestrial origin, though their exact purpose remains unknown."
    );
    const [author, setAuthor] = useState("By JAMES WHITAKER • Staff Correspondent");

    // Graphic Modules
    const [showImage, setShowImage] = useState(true);
    const [imageSource, setImageSource] = useState("url");
    const [imageUrl, setImageUrl] = useState("");
    const [uploadedImage, setUploadedImage] = useState(null);
    const [imageCaption, setImageCaption] = useState("Artist's illustration of the giant alien craft hovering above the city skyline at dusk.");
    const fileInputRef = useRef(null);

    // Premium Native Dropdown States
    const [dropdownOpen, setDropdownOpen] = useState(null); // 'mastheadFont', 'photoFrame', 'columnBorder'
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownContainerRef = useRef(null);

    // Dynamic Typography & Structural Settings
    const [columns, setColumns] = useState(2);
    const [mastheadFont, setMastheadFont] = useState("serif"); // serif, gothic, sans
    const [columnBorderStyle, setColumnBorderStyle] = useState("hairline"); // none, hairline, double
    const [photoFrameStyle, setPhotoFrameStyle] = useState("block"); // block, corner-tabs
    const [canvasFilter, setCanvasFilter] = useState("vintage"); // vintage, raw, sepia, contrast
    const [showBreakingBadge, setShowBreakingBadge] = useState(true);
    const [breakingBadgeText, setBreakingBadgeText] = useState("LATE CITY EDITION");

    const [headlineFont, setHeadlineFont] = useState("serif");
    const [bodyFont, setBodyFont] = useState("serif");
    const [inkDensity, setInkDensity] = useState(95);
    const [paperTextureLevel, setPaperTextureLevel] = useState(20);
    const [paperColor, setPaperColor] = useState("#d4d4d4");
    const [showVintageAd, setShowVintageAd] = useState(true);
    const [adText, setAdText] = useState("BUY WAR BONDS TODAY • INVEST IN FREEDOM • SUPPORT OUR TROOPS");
    const [showDropCap, setShowDropCap] = useState(true);
    const [showQuote, setShowQuote] = useState(true);
    const [quoteText, setQuoteText] = useState("The situation is grave, and forces across the globe are on maximum alert. We urge all citizens to remain calm and follow official instructions.");
    const [quoteAuthor, setQuoteAuthor] = useState("— General Headquarters");

    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [activeTab, setActiveTab] = useState("text_content");
    const [expandedSections, setExpandedSections] = useState({ basic: true, headlines: true });
    const previewRef = useRef(null);

    // Dropdown Registry Definitions Mapping Custom Nodes
    const mastheadFontsRegistry = [
        { id: "serif", label: "Standard 1900s Broadsheet Serif" },
        { id: "gothic", label: "Old-English Gothic Blackletter" },
        { id: "sans", label: "Bold Editorial Heavy Sans" }
    ];

    const photoFramesRegistry = [
        { id: "block", label: "Industrial Lithograph Box" },
        { id: "corner-tabs", label: "Vintage Metal Corner Tabs" }
    ];

    const columnBordersRegistry = [
        { id: "none", label: "Open Free-Flowing Layout" },
        { id: "hairline", label: "Clean Retro Hairline" },
        { id: "double", label: "Authentic Engraved Double-Line" }
    ];

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => { setUploadedImage(reader.result); setImageUrl(""); };
            reader.readAsDataURL(file);
        }
    };

    const clearUploadedImage = () => {
        setUploadedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const getActiveImage = () => imageSource === 'upload' ? uploadedImage : imageUrl;
    const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

    const handleDownload = async () => {
        if (!previewRef.current) return;
        setIsDownloading(true);
        setDownloadError(false);
        try {
            await document.fonts.ready;
            const dataUrl = await toPng(previewRef.current, { pixelRatio: 3, backgroundColor: paperColor, cacheBust: true });
            saveAs(dataUrl, `vintage-newspaper-${Date.now()}.png`);
        } catch (err) {
            console.error(err);
            setDownloadError(true);
        } finally {
            setIsDownloading(false);
        }
    };

    const resetToDefault = () => {
        setNewspaperName("The Daily Chronicle");
        setHeadline("MARTIANS INVADE EARTH");
        setStoryText("Incredible as it may seem, it has been confirmed that a large martian invasion fleet has landed on earth tonight.\n\nFirst vessels were sighted over Great Britain, Denmark and Norway already in the late evening...");
        setPaperColor("#d4d4d4"); setInkDensity(95); setPaperTextureLevel(20); setColumns(2);
        setMastheadFont("serif"); setColumnBorderStyle("hairline"); setPhotoFrameStyle("block"); setCanvasFilter("vintage");
        setShowImage(true); setShowQuote(true); setShowVintageAd(true); setImageUrl(""); setUploadedImage(null);
    };

    const splitStory = () => {
        if (columns === 1) return { firstHalf: storyText, secondHalf: "" };
        const sentences = storyText.split(/(?<=[.!?])\s+/);
        const midPoint = Math.floor(sentences.length / 2);
        return { firstHalf: sentences.slice(0, midPoint).join(" "), secondHalf: sentences.slice(midPoint).join(" ") };
    };

    const { firstHalf, secondHalf } = splitStory();
    const firstLetter = firstHalf?.charAt(0) || "";
    const restOfText = firstHalf?.substring(1) || "";

    const getFilterClass = () => {
        switch (canvasFilter) {
            case "raw": return "grayscale brightness-100 contrast-125";
            case "sepia": return "sepia brightness-90 contrast-110 hue-rotate-15";
            case "contrast": return "grayscale brightness-90 contrast-200 saturate-0";
            default: return "grayscale contrast-125 sepia-15";
        }
    };

    const getMastheadStyle = () => {
        if (mastheadFont === "gothic") return { fontFamily: "'Old London', 'Palatino', 'Georgia', serif", letterSpacing: "0.02em", transform: "scaleY(1.1)" };
        if (mastheadFont === "sans") return { fontFamily: "'Arial Black', 'Impact', sans-serif", letterSpacing: "-0.04em" };
        return { fontFamily: "'Times New Roman', Georgia, serif", letterSpacing: "-0.01em" };
    };

    // Generic Custom Native Search Dropdown Matrix Renderer
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

    return (
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-white" ref={dropdownContainerRef}>

            {/* ── LEFT EDITOR SIDEBAR PANEL ── */}
            <div className="lg:col-span-5 h-full flex flex-col justify-between border-r border-neutral-200 overflow-hidden">

                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">

                    {/* Header Details */}
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                        <div>
                            <h2 className="text-md font-bold tracking-tight flex items-center gap-2 text-neutral-900">
                                <FileText className="w-4 h-4 text-neutral-500" />
                                Vintage Broadsheet Studio
                            </h2>
                            <p className="text-[11px] text-neutral-400 mt-0.5">Industrial letterpress styling configuration engine</p>
                        </div>
                        <button onClick={resetToDefault} className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border border-neutral-200 rounded-md hover:bg-neutral-50 transition">
                            <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                    </div>

                    {/* Tab Selection Row */}
                    <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200/60 flex-wrap">
                        {[
                            { id: "text_content", icon: Type, label: "Content" },
                            { id: "illustration", icon: ImageIcon, label: "Image" },
                            { id: "masthead_ears", icon: Settings, label: "Masthead" },
                            { id: "layout_elements", icon: Layout, label: "Layout" },
                            { id: "press_settings", icon: Sliders, label: "Filters & Ink" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-md text-[10px] font-black uppercase tracking-wider transition ${activeTab === tab.id ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-500"}`}
                            >
                                <tab.icon className="w-3 h-3 mr-1" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Section Tab Switchboard */}
                    {activeTab === "text_content" && (
                        <div className="bg-neutral-50/60 rounded-xl border border-neutral-200 overflow-hidden">
                            <button onClick={() => toggleSection('basic')} className="w-full flex justify-between items-center p-3.5 hover:bg-neutral-100 transition">
                                <span className="font-bold text-xs uppercase tracking-wider text-neutral-700">📰 Identity Parameters</span>
                                {expandedSections.basic ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
                            </button>
                            {expandedSections.basic && (
                                <div className="p-3.5 pt-0 space-y-3 border-t border-neutral-100 bg-white">
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">Newspaper Name</label>
                                        <input type="text" value={newspaperName} onChange={(e) => setNewspaperName(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md bg-transparent text-xs" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">Date String</label>
                                            <input type="text" value={dateText} onChange={(e) => setDateText(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md bg-transparent text-xs" />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">Location Origin</label>
                                            <input type="text" value={location} onChange={(e) => setLocation(e.target.value.toUpperCase())} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md bg-transparent text-xs" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input type="text" value={volume} onChange={(e) => setVolume(e.target.value.toUpperCase())} placeholder="VOL" className="w-full px-2 py-1.5 border border-neutral-200 rounded-md text-xs text-center" />
                                        <input type="text" value={issueNo} onChange={(e) => setIssueNo(e.target.value.toUpperCase())} placeholder="ISSUE" className="w-full px-2 py-1.5 border border-neutral-200 rounded-md text-xs text-center" />
                                        <input type="text" value={price} onChange={(e) => setPrice(e.target.value.toUpperCase())} placeholder="PRICE" className="w-full px-2 py-1.5 border border-neutral-200 rounded-md text-xs text-center" />
                                    </div>
                                </div>
                            )}

                            <button onClick={() => toggleSection('headlines')} className="w-full flex justify-between items-center p-3.5 border-t border-neutral-200 hover:bg-neutral-100 transition">
                                <span className="font-bold text-xs uppercase tracking-wider text-neutral-700">📝 Headlines & Story Copy</span>
                                {expandedSections.headlines ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
                            </button>
                            {expandedSections.headlines && (
                                <div className="p-3.5 pt-0 space-y-3 border-t border-neutral-100 bg-white">
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">Main Deck Headline</label>
                                        <textarea value={headline} onChange={(e) => setHeadline(e.target.value.toUpperCase())} rows={2} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md bg-transparent text-xs font-bold leading-tight" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">Subheadline / Accent String</label>
                                        <input type="text" value={subheadline} onChange={(e) => setSubheadline(e.target.value.toUpperCase())} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md bg-transparent text-xs" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">Byline Credit</label>
                                        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md bg-transparent text-xs italic" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase text-neutral-400 tracking-wider mb-1">Article Body Text</label>
                                        <textarea value={storyText} onChange={(e) => setStoryText(e.target.value)} rows={5} className="w-full px-3 py-2 border border-neutral-200 rounded-md text-xs font-serif leading-relaxed resize-none bg-transparent" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "illustration" && (
                        <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4">
                            <div className="flex items-center justify-between pb-1">
                                <label className="text-xs font-bold uppercase text-neutral-700 flex items-center gap-2">
                                    <ImageIcon className="w-3.5 h-3.5" /> Render Image File
                                </label>
                                <input type="checkbox" checked={showImage} onChange={(e) => setShowImage(e.target.checked)} className="w-4 h-4 accent-neutral-900" />
                            </div>
                            {showImage && (
                                <div className="space-y-3 pt-2 border-t border-neutral-100">
                                    <div className="grid grid-cols-2 gap-1 bg-neutral-100 p-0.5 rounded-md text-[10px] font-bold">
                                        <button onClick={() => setImageSource("url")} className={`py-1 rounded ${imageSource === "url" ? "bg-white shadow-xs" : "opacity-60"}`}>URL Source</button>
                                        <button onClick={() => setImageSource("upload")} className={`py-1 rounded ${imageSource === "upload" ? "bg-white shadow-xs" : "opacity-60"}`}>Disk Upload</button>
                                    </div>
                                    {imageSource === "url" ? (
                                        <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs" />
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-1.5 text-xs border border-dashed rounded-md hover:bg-neutral-50 transition">Select Photo</button>
                                            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                                            {uploadedImage && <button onClick={clearUploadedImage} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md"><Trash2 className="w-3.5 h-3.5" /></button>}
                                        </div>
                                    )}

                                    {/* Fixed: Replaced raw select block with searchable premium design */}
                                    {renderSearchDropdown("photoFrame", "Illustration Frame Border", photoFrameStyle, setPhotoFrameStyle, photoFramesRegistry)}

                                    <input type="text" value={imageCaption} onChange={(e) => setImageCaption(e.target.value)} placeholder="Caption..." className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs italic" />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "masthead_ears" && (
                        <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[9px] font-bold uppercase text-neutral-400 mb-1">Left Column Ear</label>
                                    <input type="text" value={leftEar} onChange={(e) => setLeftEar(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold uppercase text-neutral-400 mb-1">Right Column Ear</label>
                                    <input type="text" value={rightEar} onChange={(e) => setRightEar(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs" />
                                </div>
                            </div>

                            {/* Fixed: Replaced raw select block with searchable premium design */}
                            {renderSearchDropdown("mastheadFont", "Masthead Font Archetype", mastheadFont, setMastheadFont, mastheadFontsRegistry)}

                            <div className="space-y-2 pt-2 border-t border-neutral-100">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase text-neutral-700">Front-Page Special Badge</label>
                                    <input type="checkbox" checked={showBreakingBadge} onChange={(e) => setShowBreakingBadge(e.target.checked)} className="w-4 h-4 accent-neutral-900" />
                                </div>
                                {showBreakingBadge && (
                                    <input type="text" value={breakingBadgeText} onChange={(e) => setBreakingBadgeText(e.target.value.toUpperCase())} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs font-bold" />
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "layout_elements" && (
                        <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4">
                            <div>
                                <label className="block text-[9px] font-bold uppercase text-neutral-400 mb-1.5">Column Grid Dividers</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 2, 3].map((num) => (
                                        <button key={num} onClick={() => setColumns(num)} className={`py-1 border rounded-md text-xs font-bold transition ${columns === num ? "bg-neutral-900 text-white" : "bg-transparent hover:bg-neutral-50"}`}>
                                            {num} {num === 1 ? "Column" : "Cols"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Fixed: Replaced raw select block with searchable premium design */}
                            {renderSearchDropdown("columnBorder", "Internal Column Border Style", columnBorderStyle, setColumnBorderStyle, columnBordersRegistry)}

                            <div className="space-y-2 pt-2 border-t border-neutral-100">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase text-neutral-700">Callout Quote Block</label>
                                    <input type="checkbox" checked={showQuote} onChange={(e) => setShowQuote(e.target.checked)} className="w-4 h-4 accent-neutral-900" />
                                </div>
                                {showQuote && (
                                    <>
                                        <textarea value={quoteText} onChange={(e) => setQuoteText(e.target.value)} rows={2} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs italic" />
                                        <input type="text" value={quoteAuthor} onChange={(e) => setQuoteAuthor(e.target.value)} className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs" />
                                    </>
                                )}
                            </div>

                            <div className="space-y-2 pt-2 border-t border-neutral-100 flex flex-col gap-1.5">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={showDropCap} onChange={(e) => setShowDropCap(e.target.checked)} className="w-3.5 h-3.5 accent-neutral-900" />
                                    <span className="text-xs font-semibold text-neutral-700">Enable First Letter Drop-Cap</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={showVintageAd} onChange={(e) => setShowVintageAd(e.target.checked)} className="w-3.5 h-3.5 accent-neutral-900" />
                                    <span className="text-xs font-semibold text-neutral-700">Display Footer Promo Banner</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === "press_settings" && (
                        <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1">Graphic Aging Filter Archetype</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: "vintage", label: "Lithograph Tone" },
                                        { id: "raw", label: "Raw Press Copy" },
                                        { id: "sepia", label: "Century Sepia" },
                                        { id: "contrast", label: "High Ink Contrast" }
                                    ].map((f) => (
                                        <button
                                            key={f.id}
                                            type="button"
                                            onClick={() => setCanvasFilter(f.id)}
                                            className={`p-2 border rounded-md text-left text-[11px] font-bold transition-all ${canvasFilter === f.id ? "border-neutral-950 bg-neutral-50" : "border-neutral-200 hover:bg-neutral-50/50"
                                                }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-neutral-100">
                                <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1">Broadsheet Paper Hue</label>
                                <input type="color" value={paperColor} onChange={(e) => setPaperColor(e.target.value)} className="w-full h-8 rounded border cursor-pointer bg-transparent" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1">Ink Bleed Density ({inkDensity}%)</label>
                                <input type="range" min={60} max={100} value={inkDensity} onChange={(e) => setInkDensity(Number(e.target.value))} className="w-full accent-neutral-900 cursor-pointer" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Core Engine Exporter */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-200 space-y-2 shrink-0">
                    <button onClick={handleDownload} disabled={isDownloading} className="w-full bg-neutral-950 text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition hover:bg-neutral-900 disabled:opacity-40 flex items-center justify-center gap-2">
                        {isDownloading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Pressing Matrix...</> : <><Download className="w-3.5 h-3.5" /> Export Broadsheet Layout (PNG)</>}
                    </button>
                    {downloadError && (
                        <p className="text-[10px] font-bold text-red-600 text-center">Export failed. Please try again.</p>
                    )}
                </div>
            </div>

            {/* ── RIGHT CANVAS PREVIEW PANEL ── */}
            <div className="lg:col-span-7 h-full overflow-y-auto bg-neutral-50/50 p-5 md:p-6 flex flex-col items-center justify-start relative">

                <div className="absolute top-4 right-4 z-30">
                    <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 shadow-3xs rounded-md text-[10px] font-black uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 transition">
                        {showPreview ? <><EyeOff className="w-3 h-3" /> Hide Canvas</> : <><Eye className="w-3 h-3" /> Show Canvas</>}
                    </button>
                </div>

                {showPreview && (
                    <div ref={previewRef} className="w-full max-w-xl my-auto shadow-xl transition-all duration-300 relative border border-[#8b7a66]" style={{ backgroundColor: paperColor, fontFamily: "'Times New Roman', Georgia, serif" }}>

                        {/* Pulp Grain Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-15" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "100px" }} />

                        <div className="p-6 relative z-10" style={{ color: '#1a1a1a', opacity: inkDensity / 100 }}>

                            {/* Optional Breaking News Flash Box */}
                            {showBreakingBadge && (
                                <div className="w-full text-center border-2 border-black py-0.5 mb-2 text-[9px] font-black tracking-widest bg-black text-white uppercase font-sans">
                                    ★ ★ {breakingBadgeText} ★ ★
                                </div>
                            )}

                            {/* Broadsheet Masthead Header */}
                            <div className="grid grid-cols-12 gap-2 border-b-4 border-black pb-2.5 items-center">
                                {leftEar && <div className="col-span-3 border border-black p-1 text-[7px] font-black text-center uppercase leading-tight">{leftEar}</div>}
                                {/* The masthead of the fake newspaper the user is drawing, not a
                                    heading of this page: it is whatever they typed, it lives inside
                                    the export canvas (previewRef -> toPng), and as an <h1> it put a
                                    second top-level heading on /fodey-new the moment this tab was
                                    opened. A div is the honest element — the artwork keeps its type
                                    from the same class list and inline style, and it is one grid
                                    child among divs, so the render and the PNG are unchanged. */}
                                <div style={getMastheadStyle()} className={`${leftEar && rightEar ? "col-span-6" : "col-span-12"} text-3xl font-black uppercase text-center leading-none tracking-tighter`}>{newspaperName}</div>
                                {rightEar && <div className="col-span-3 border border-black p-1 text-[7px] font-black text-center uppercase leading-tight">{rightEar}</div>}

                                <div className="col-span-12 border-t border-black/40 pt-1.5 flex justify-between text-[8px] font-bold uppercase">
                                    <span>{volume} {issueNo}</span>
                                    <span>{dateText}</span>
                                    <span>{location}</span>
                                    <span>PRICE {price}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-[8px] border-b border-black/30 py-0.5 mt-0.5 uppercase font-bold">
                                <span>{edition}</span>
                                <span>{established}</span>
                            </div>

                            {/* Headline Group */}
                            <div className="py-2.5 border-b border-black/30 space-y-1">
                                <h2 className={`tracking-tight leading-none uppercase font-black text-2xl ${headlineFont === 'sans' ? 'font-sans' : 'font-serif'}`}>{headline}</h2>
                                {subheadline && <p className="text-[10px] font-bold uppercase tracking-wide border-t border-black/20 pt-1.5">{subheadline}</p>}
                                {author && <p className="text-[9px] italic pt-0.5">{author}</p>}
                            </div>

                            {/* Image Grid Frame with Custom Border Archetypes */}
                            {showImage && getActiveImage() && (
                                <div className={`mt-3 flex flex-col items-center p-1.5 bg-black/5 border-black/20 ${photoFrameStyle === 'corner-tabs' ? 'border-2 border-double relative before:content-[""] before:absolute before:top-0 before:left-0 before:w-2 before:h-2 before:border-t-2 before:border-l-2 before:border-black' : 'border'
                                    }`}>
                                    <img src={getActiveImage()} alt="News rendering layout" className={`w-full h-auto object-contain grayscale contrast-150 ${getFilterClass()}`} style={{ maxHeight: "150px" }} onError={(e) => e.target.style.display = 'none'} />
                                    {imageCaption && <p className="text-[8px] italic mt-1 text-center leading-tight">{imageCaption}</p>}
                                </div>
                            )}

                            {/* Blockquotes */}
                            {showQuote && (
                                <div className="mt-3 border-l-2 border-black bg-black/5 p-2 italic text-center text-xs">
                                    <p className="font-bold">"{quoteText}"</p>
                                    {quoteAuthor && <p className="text-[9px] mt-0.5 font-sans not-italic font-medium">{quoteAuthor}</p>}
                                </div>
                            )}

                            {/* Paragraph Columns Section with Configurable Separators */}
                            <div className={`mt-3 grid grid-cols-1 ${columns >= 2 ? 'md:grid-cols-2' : ''} ${columns === 3 ? 'lg:grid-cols-3' : ''} gap-4 text-justify`}>
                                <div className={`text-[11px] leading-relaxed font-serif ${bodyFont === 'sans' ? 'font-sans' : 'font-serif'}`}>
                                    {showDropCap && firstLetter && <span className="float-left text-4xl font-bold leading-none mr-1.5 mt-0.5">{firstLetter}</span>}
                                    {showDropCap ? restOfText : firstHalf}
                                </div>
                                {columns >= 2 && secondHalf && (
                                    <div className={`text-[11px] leading-relaxed font-serif pl-3 ${columnBorderStyle === 'hairline' ? 'border-l border-black/20' :
                                        columnBorderStyle === 'double' ? 'border-l-4 border-double border-black/40' : ''
                                        } ${bodyFont === 'sans' ? 'font-sans' : 'font-serif'}`}>
                                        {secondHalf}
                                    </div>
                                )}
                            </div>

                            {/* Advertisement Footer Strip */}
                            {showVintageAd && (
                                <div className="mt-3 pt-1.5 border-t border-black/30">
                                    <div className="border border-black p-1 text-center text-[8px] font-mono font-black tracking-wider bg-black/5">{adText}</div>
                                </div>
                            )}
                        </div>

                        {/* Paper Backdrop Texture lines */}
                        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,0,0,0.06)_1px,rgba(0,0,0,0.06)_2px)]" style={{ opacity: paperTextureLevel / 100 }} />
                    </div>
                )}
            </div>

        </div>
    );
}