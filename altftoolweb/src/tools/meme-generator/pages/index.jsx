"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import ManagedImage from "@/components/ui/ManagedImage";
import Features from "../components/Features";

const FONT_OPTIONS = [
  { name: "Impact", value: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif" },
  { name: "Arial", value: "Arial, Helvetica, sans-serif" },
  { name: "Comic Sans", value: "'Comic Sans MS', cursive, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Courier", value: "'Courier New', monospace" },
];

const STICKERS = ["😂", "🔥", "😭", "💀", "😎", "💯", "🚫", "✅", "⚠️", "❤️", "🎯", "🌟", "✨"];

const TEMPLATES = [
  { name: "Drake", url: "https://i.imgflip.com/30b1gx.jpg" },
  { name: "Brain", url: "https://i.imgflip.com/1jwhww.jpg" },
  { name: "Boyfriend", url: "https://i.imgflip.com/1ur9b0.jpg" },
  { name: "Slap", url: "https://i.imgflip.com/9ehk.jpg" },
];

const SOCIAL_PRESETS = [
  { name: "Default", ratio: "auto" },
  { name: "Post 1:1", ratio: "1/1" },
  { name: "Story 9:16", ratio: "9/16" },
  { name: "X 16:9", ratio: "16/9" },
];

const SUGGESTIONS = [
  "Me after 5 mins of study", "Expectation vs Reality", "Internal Screaming", 
  "Absolute Cinema", "Lag gaye bhai..."
];

const loadMemeHistory = () => {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem("meme_history");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export default function ToolHome() {
  const [meme, setMeme] = useState({
    image: null, brightness: 100, contrast: 100, blur: 0, aspectRatio: "auto",
  });

  const [layers, setLayers] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState(loadMemeHistory);
  const memeRef = useRef(null);
  const nextIdRef = useRef(0);

  const createId = useCallback((prefix) => `${prefix}-${++nextIdRef.current}`, []);

  const saveSnapshot = useCallback(() => {
    setUndoStack(prev => [...prev, JSON.stringify(layers)].slice(-20));
  }, [layers]);

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setLayers(JSON.parse(previous));
    setUndoStack(prev => prev.slice(0, -1));
  };

  const handleSaveToHistory = () => {
    if (!meme.image) return;
    const newItem = { id: createId("draft"), meme, layers };
    const updatedHistory = [newItem, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem("meme_history", JSON.stringify(updatedHistory));
    alert("Draft Saved!");
  };

  const removeBackground = () => {
    if (!meme.image) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous"; 
    img.src = meme.image;
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 230 && data[i+1] > 230 && data[i+2] > 230) data[i+3] = 0;
      }
      ctx.putImageData(imageData, 0, 0);
      setMeme({ ...meme, image: canvas.toDataURL("image/png") });
    };
  };

  const addLayer = (type, content = "NEW TEXT") => {
    saveSnapshot();
    const newLayer = {
      id: createId("layer"), type, content, x: 50, y: 50,
      fontSize: type === 'emoji' ? 64 : 36,
      color: "#ffffff", font: FONT_OPTIONS[0].value,
    };
    setLayers([...layers, newLayer]);
    setSelectedId(newLayer.id);
  };

  const updateLayer = (id, key, value) => {
    if (key !== 'x' && key !== 'y') saveSnapshot();
    setLayers(layers.map(l => l.id === id ? { ...l, [key]: value } : l));
  };

  const startDrag = (id, e) => {
    e.stopPropagation();
    setSelectedId(id);
    const rect = memeRef.current.getBoundingClientRect();
    
    const move = (mE) => {
      const clientX = mE.touches ? mE.touches[0].clientX : mE.clientX;
      const clientY = mE.touches ? mE.touches[0].clientY : mE.clientY;
      let x = ((clientX - rect.left) / rect.width) * 100;
      let y = ((clientY - rect.top) / rect.height) * 100;
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));
      setLayers(prev => prev.map(l => l.id === id ? { ...l, x, y } : l));
    };

    const stop = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", stop);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", stop);
  };

  const handleDownload = async () => {
    if (!memeRef.current || !meme.image) return;
    setSelectedId(null);
    setTimeout(async () => {
      const canvas = await html2canvas(memeRef.current, { 
        useCORS: true, 
        scale: 3, 
        backgroundColor: null 
      });
      const link = document.createElement("a");
      link.download = `memeStudio-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }, 150);
  };

  const activeLayer = layers.find(l => l.id === selectedId);

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) select-none pb-12 transition-all">
      {/* ─── HEADER SECTION (Medium Sized) ─── */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14">
        <div className="text-center mb-8 mt-[30]">
          <h1 className="heading mb-4 text-center mt-[-30] text-[40xl] font-extrabold ">
            Meme Generator
          </h1>
          <p className="description text-(--secondary) !text-xl md:!text-2xl mt-3 text-center leading-snug">
            The Ultimate Meme Engine<br />
            Create, Edit, and Share with lightning speed
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col lg:flex-row-reverse gap-8 items-start">
          
          {/* --- RIGHT COLUMN: PREVIEW --- */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-8">
            <div className="rounded-2xl border border-(--border) bg-(--card) p-5 sm:p-7 shadow-xl flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-5 px-1">
                <h2 className="text-ml font-bold uppercase text-(--primary)">Canvas Preview</h2>
                {meme.image && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-(--primary) rounded-full"/> 
                    <span className="text-ml font-bold text-(--primary) uppercase">Studio Live</span>
                  </div>
                )}
              </div>

              <div 
                ref={memeRef}
                className="relative bg-black rounded-xl shadow-lg flex items-center justify-center overflow-hidden touch-none transition-all"
                style={{ 
                  filter: `brightness(${meme.brightness}%) contrast(${meme.contrast}%)`, 
                  aspectRatio: meme.aspectRatio === 'auto' ? 'unset' : meme.aspectRatio, 
                  width: '100%',
                  minHeight: meme.image ? 'auto' : '350px'
                }}
                onClick={() => setSelectedId(null)}
              >
                {meme.image ? (
                  <>
                    <ManagedImage
                      src={meme.image} 
                      alt="Base" 
                      className="w-full h-full object-contain pointer-events-none" 
                      style={{ filter: `blur(${meme.blur}px)` }} 
                      crossOrigin="anonymous" 
                    />
                    {layers.map((l) => (
                      <div
                        key={l.id}
                        onMouseDown={(e) => startDrag(l.id, e)}
                        onTouchStart={(e) => startDrag(l.id, e)}
                        className={`absolute p-2 whitespace-nowrap cursor-move meme-text-pro ${selectedId === l.id ? 'ring-2 ring-(--primary) ring-offset-2 ring-offset-black rounded-sm z-50' : 'z-10'}`}
                        style={{
                          left: `${l.x}%`, top: `${l.y}%`, transform: 'translate(-50%, -50%)',
                          fontSize: `${l.fontSize}px`, color: l.color, fontFamily: l.font,
                        }}
                      >
                        {l.content}
                        {selectedId === l.id && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setLayers(layers.filter(i => i.id !== l.id)); }} 
                            className="absolute -top-3 -right-3 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-lg border-2 border-white font-bold"
                          > × </button>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 text-center  py-24">
                    <p className="text-6xl">🖼️</p>
                    <p className="text-sm font-bold uppercase text-(--primary)">Select Template</p>
                  </div>
                )}
              </div>

              {history.length > 0 && (
                <div className="w-full mt-8 pt-6 border-t border-(--border)">
                  <p className="text-ml font-bold uppercase mb-4 px-1 text-center text-(--primary) ">Recent Drafts</p>
                  <div className="flex gap-4 overflow-x-auto pb-3 px-1 scrollbar-hide">
                    {history.map(item => (
                      <ManagedImage
                        key={item.id} 
                        src={item.meme.image} 
                        alt="Saved meme draft"
                        onClick={() => { setMeme(item.meme); setLayers(item.layers); }} 
                        className="h-14 w-14 flex-shrink-0 object-cover rounded-xl border-2 border-(--border) hover:border-(--primary) transition-all cursor-pointer active:scale-90" 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- LEFT COLUMN: CONTROLS (Medium Fonts) --- */}
          <div className="w-full lg:w-1/2 space-y-7">
            
            <section className="bg-(--card) border border-(--border) rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold uppercase text-(--primary) mb-4"> Studio Layout</h3>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {SOCIAL_PRESETS.map(p => (
                  <button 
                    key={p.name} 
                    onClick={() => setMeme({...meme, aspectRatio: p.ratio})} 
                    className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all whitespace-nowrap ${meme.aspectRatio === p.ratio ? 'bg-(--primary) text-white border-(--primary) shadow-md' : 'bg-gray-50 border-(--border) hover:border-gray-400'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-(--card) border border-(--border) rounded-2xl p-6 shadow-sm space-y-8">
              <h3 className="text-xl font-bold uppercase text-(--primary)">Image Core</h3>
              
              <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
                {TEMPLATES.map(t => (
                  <div key={t.name} className="flex-shrink-0 text-center space-y-2">
                    <ManagedImage
                      src={t.url} 
                      alt={`${t.name} meme template`}
                      onClick={() => setMeme({...meme, image: t.url})} 
                      className="h-16 w-16 object-cover rounded-xl cursor-pointer border-2 border-transparent hover:border-(--primary) transition-all active:scale-90 shadow-sm" 
                    />
                    <p className="text-ml opacity-40 font-bold uppercase tracking-tighter">{t.name}</p>
                  </div>
                ))}
              </div>

              <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-(--border) p-8 text-center transition-all hover:border-(--primary) hover:bg-blue-50/30">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setMeme(prev => ({ ...prev, image: reader.result }));
                      reader.readAsDataURL(file);
                    }
                  }} 
                  className="absolute inset-0 z-10 cursor-pointer opacity-0" 
                />
                <p className="text-ml font-bold uppercase text-gray-400 group-hover:text-(--primary) tracking-widest">
                  Choose Template
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={removeBackground} className="bg-(--primary) text-white text-ml font-bold py-3.5 rounded-xl uppercase tracking-widest transition-all active:scale-95">
                 Remove BG
                </button>
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1"><label className="text-ml font-bold uppercase opacity-40">Blur</label><span className="text-xs font-bold text-(--primary)">{meme.blur}px</span></div>
                  <input type="range" min="0" max="10" value={meme.blur} onChange={(e) => setMeme({...meme, blur: e.target.value})} className="w-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1"><label className="text-ml font-bold uppercase opacity-40">Brightness</label><span className="text-xs font-bold text-(--primary)">{meme.brightness}%</span></div>
                  <input type="range" min="50" max="150" value={meme.brightness} onChange={(e) => setMeme({...meme, brightness: e.target.value})} className="w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1"><label className="text-ml font-bold uppercase opacity-40 ">Contrast</label><span className="text-xs font-bold text-(--primary)">{meme.contrast}%</span></div>
                  <input type="range" min="50" max="150" value={meme.contrast} onChange={(e) => setMeme({...meme, contrast: e.target.value})} className="w-full" />
                </div>
              </div>
            </section>

            <section className="bg-(--card) border border-(--border) rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-xl font-bold uppercase  text-(--primary)">Layer Master</h3>
              
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-50">
                {SUGGESTIONS.map(line => (
                  <button key={line} onClick={() => addLayer('text', line)} className="flex-shrink-0 bg-gray-100 border border-(--border) px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap hover:bg-(--primary) hover:text-white transition-all">+ {line}</button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button onClick={() => addLayer('text')} className="col-span-2 bg-(--primary) py-3.5 font-bold text-white text-ml rounded-xl hover:brightness-105 active:scale-95">ADD TEXT</button>
                <button onClick={handleUndo} disabled={undoStack.length === 0} className="bg-(--primary) py-3.5 font-bold text-white text-ml rounded-xl active:scale-95 ">UNDO</button>
                <button onClick={() => { if(confirm("Clear Everything?")) { saveSnapshot(); setLayers([]); } }} className="border-2 bg-(--primary) border-red-50 text-white py-3.5 font-bold text-ml rounded-xl hover:text-white active:scale-95 uppercase">Clear</button>
              </div>

              {activeLayer && (
                <div className="p-6 bg-gray-50 rounded-2xl border-2 border-(--primary)/10 space-y-6 animate-in fade-in zoom-in-95">
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase opacity-40 px-1">Edit Text</label>
                     <input type="text" value={activeLayer.content} onChange={(e) => updateLayer(selectedId, 'content', e.target.value)} className="w-full bg-white border border-(--border) px-4 py-3.5 text-base rounded-xl font-bold shadow-sm focus:ring-2 focus:ring-(--primary)/20 outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-end px-1"><label className="text-xs font-bold uppercase opacity-40">Size</label><span className="text-xs font-bold text-(--primary)">{activeLayer.fontSize}px</span></div>
                      <input type="range" min="10" max="250" value={activeLayer.fontSize} onChange={(e) => updateLayer(selectedId, 'fontSize', parseInt(e.target.value))} className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase opacity-40 block px-1">Font Family</label>
                      <select value={activeLayer.font} onChange={(e) => updateLayer(selectedId, 'font', e.target.value)} className="w-full text-xs font-bold p-3.5 rounded-xl bg-white border border-(--border) appearance-none shadow-sm cursor-pointer outline-none">
                        {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-40 block px-1">Fill Color</label>
                    <div className="flex gap-4 items-center">
                       <input type="color" value={activeLayer.color} onChange={(e) => updateLayer(selectedId, 'color', e.target.value)} className="h-10 w-20 cursor-pointer rounded-xl overflow-hidden border-2 border-white shadow-md" />
                       <span className="text-sm font-mono font-bold opacity-60 uppercase tracking-tighter">{activeLayer.color}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-50 justify-center">
                {STICKERS.map(s => <button key={s} onClick={() => addLayer('emoji', s)} className="text-4xl hover:scale-125 transition-all active:scale-90 drop-shadow-lg">{s}</button>)}
              </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={handleSaveToHistory} disabled={!meme.image} className="flex-1 rounded-2xl bg-(--primary) border-2 border-(--border) py-4 font-bold text-white shadow-md uppercase text-ml">
                 Save Draft
              </button>
              <button onClick={handleDownload} disabled={!meme.image} className="flex-[2] rounded-2xl bg-(--primary) py-4 font-bold text-white shadow-lg uppercase text-ml">
                 Export Me
              </button>
            </div>
          </div>

        </div>

        <div className="mt-20">
          <Features />
        </div>
      </main>
      
     
    </div>
  );
}
