import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MOODS, 
  PALETTE_MODES, 
  COLOR_ROLES, 
  generatePalette, 
  parseMood, 
  getContrastRatio 
} from "../utils/mood-engine";

// --- Icons (Simplified for Age Calculator look) ---
const IconRefresh = ({ spin }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={spin ? "animate-spin" : ""}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
  </svg>
);

const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconUnlock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  </svg>
);

const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

const ToolHome = () => {
  const [mood, setMood] = useState("Happy");
  const [mode, setMode] = useState("Vibrant");
  const [palette, setPalette] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [nlInput, setNlInput] = useState("");
  const [lockedColors, setLockedColors] = useState(new Array(8).fill(false));
  const [activeTab, setActiveTab] = useState("palette");
  const [toast, setToast] = useState("");

  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newPalette = generatePalette(mood, mode, palette, lockedColors);
      setPalette(newPalette);
      setIsGenerating(false);
    }, 500);
  };

  const handleNlSubmit = (e) => {
    if (e) e.preventDefault();
    if (!nlInput.trim()) return;
    const detected = parseMood(nlInput);
    if (detected) {
      setMood(detected);
    }
  };

  const toggleLock = (idx) => {
    const newLocked = [...lockedColors];
    newLocked[idx] = !newLocked[idx];
    setLockedColors(newLocked);
    setToast(newLocked[idx] ? "Color Locked" : "Color Unlocked");
    setTimeout(() => setToast(""), 2000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast("Copied to Clipboard");
    setTimeout(() => setToast(""), 2000);
  };

  const downloadFile = (content, filename, type) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const cssContent = `:root {\n${palette.map((c, i) => `  --color-${COLOR_ROLES[i].toLowerCase().replace(" ", "-")}: ${c.hex};`).join("\n")}\n}`;
  const tailwindContent = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${palette.map((c, i) => `        '${COLOR_ROLES[i].toLowerCase().replace(" ", "-")}': '${c.hex}',`).join("\n")}\n      }\n    }\n  }\n}`;
  const jsonContent = JSON.stringify({ mood, mode, colors: palette.map((c, i) => ({ role: COLOR_ROLES[i], ...c })) }, null, 2);

  return (
    <div className="px-4 py-6">
      {/* Header - Matching Age Calculator exactly */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-(--background) text-(--primary) text-center mb-5"
      >
        <h1 className="heading flex justify-center gap-2 animate-fade-up">
          Emotional Mood - Palette Generator
        </h1>
        <p className="description opacity-90 mt-1 text-(--secondary) text-2xl animate-fade-up mb-6">
          Transform your emotions into beautiful color systems
        </p>
      </motion.div>

      {/* Main Container Card - Matching Age Calculator exactly */}
      <div className="max-w-5xl mx-auto bg-(--card) rounded-xl shadow-lg overflow-hidden py-5 animate-fade-up">
        <div className="p-6 space-y-6">
          
          {/* Input Form Area */}
          <div className="bg-(--background) p-6 rounded-lg border border-(--border) space-y-6">
            
            {/* Natural Language Search */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-(--foreground)">Describe the Feeling</label>
              <form onSubmit={handleNlSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={nlInput}
                  onChange={(e) => setNlInput(e.target.value)}
                  placeholder="e.g. 'Cozy evening by the fireplace'..."
                  className="flex-1 bg-(--card) border border-(--border) rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)"
                />
                <button type="submit" className="btn-primary px-6 py-3 rounded-lg font-bold">Search</button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mood Selection */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-(--foreground)">Select Mood</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(MOODS).slice(0, 10).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${
                        mood === m ? "bg-(--primary) text-white border-(--primary)" : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--primary)"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-(--foreground)">Aesthetic Style</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(PALETTE_MODES).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${
                        mode === m ? "bg-(--primary) text-white border-(--primary)" : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--primary) hover:text-(--primary)"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculate/Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg"
            >
              <IconRefresh spin={isGenerating} />
              {isGenerating ? "Synthesizing..." : "Generate Palette"}
            </button>
          </div>

          {/* Results Tab Navigation */}
          <div className="flex border-b border-(--border)">
            {["palette", "export"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
                  activeTab === t ? "text-(--primary) border-b-2 border-(--primary)" : "text-(--muted-foreground) hover:text-(--foreground)"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Palette Results - Full Width Cards Grid */}
          <AnimatePresence mode="wait">
            {activeTab === "palette" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center bg-(--background) p-4 rounded-xl border border-(--border)"
              >
                {palette.map((color, idx) => (
                  <div key={idx} className="bg-(--card) border border-(--border) rounded-lg p-4 space-y-4 hover:shadow-md transition-all group">
                    <div 
                      className="aspect-video w-full rounded-lg relative overflow-hidden flex items-center justify-center"
                      style={{ backgroundColor: color.hex }}
                    >
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                        <button onClick={() => copyToClipboard(color.hex)} className="p-2 bg-white text-black rounded shadow-lg"><IconCopy /></button>
                        <button onClick={() => toggleLock(idx)} className={`p-2 rounded shadow-lg ${lockedColors[idx] ? "bg-white text-black" : "bg-black/20 text-white"}`}>
                          {lockedColors[idx] ? <IconLock /> : <IconUnlock />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <div className="text-left">
                        <div className="text-[10px] font-bold text-(--muted-foreground) uppercase tracking-tighter">{COLOR_ROLES[idx]}</div>
                        <div className="text-lg font-bold font-mono">{color.hex}</div>
                      </div>
                      {lockedColors[idx] && <div className="text-(--primary)"><IconLock /></div>}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Export Section */}
            {activeTab === "export" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-(--background) p-6 rounded-lg border border-(--border)">
                  <h3 className="text-lg font-bold mb-4">Export Design Tokens</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold uppercase opacity-50">CSS Variables</span>
                          <button onClick={() => copyToClipboard(cssContent)} className="text-xs text-(--primary) font-bold">Copy</button>
                        </div>
                        <pre className="bg-(--card) p-4 rounded border border-(--border) text-[10px] overflow-x-auto">
                          <code>{palette.map((c, i) => `--color-${COLOR_ROLES[i].toLowerCase().replace(" ", "-")}: ${c.hex};`).join("\n")}</code>
                        </pre>
                     </div>
                     <div className="space-y-4">
                        <div className="p-4 bg-(--card) rounded-lg border border-(--border) flex justify-between items-center">
                          <span className="text-sm font-bold">Download JSON Schema</span>
                          <button 
                            onClick={() => downloadFile(jsonContent, "palette-schema.json", "application/json")}
                            className="btn-primary px-4 py-2 rounded text-xs"
                          >
                            Download
                          </button>
                        </div>
                        <div className="p-4 bg-(--card) rounded-lg border border-(--border) flex justify-between items-center">
                          <span className="text-sm font-bold">Tailwind Config</span>
                          <button 
                            onClick={() => copyToClipboard(tailwindContent)}
                            className="btn-primary px-4 py-2 rounded text-xs"
                          >
                            Copy
                          </button>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Global Toast - Matches Age Calculator pattern */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-(--foreground) text-(--background) px-8 py-3 rounded-full shadow-2xl text-xs font-bold z-50 animate-fade-in">
          {toast}
        </div>
      )}

      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        .animate-fade-up { animation: fadeUp 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ToolHome;