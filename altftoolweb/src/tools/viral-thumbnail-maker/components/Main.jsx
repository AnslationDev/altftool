"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Download,
  RotateCcw,
  RefreshCw,
  Video,
  Trash2,
  Zap,
  Clock,
  AlertTriangle,
} from "lucide-react";

const STYLE_OPTIONS = [
  { key: "gaming", label: "Gaming", emoji: "🎮", desc: "Neon glows, 3D renders, epic action" },
  { key: "tech", label: "Tech / Coding", emoji: "💻", desc: "Cyberpunk circuits, futuristic grids" },
  { key: "finance", label: "Finance", emoji: "💰", desc: "Gold charts, luxury contrast" },
  { key: "storytelling", label: "Storytelling", emoji: "🎬", desc: "Cinematic shadows, mystery" },
  { key: "education", label: "Education", emoji: "📚", desc: "Clean workspace, creative icons" },
  { key: "fitness", label: "Fitness", emoji: "💪", desc: "Bold energy, dynamic motion" },
  { key: "food", label: "Food", emoji: "🍕", desc: "Vibrant colors, appetizing close-ups" },
  { key: "travel", label: "Travel", emoji: "✈️", desc: "Scenic landscapes, wanderlust" },
];

const COLOR_OPTIONS = [
  { key: "cyan-purple", label: "Cyan & Purple", colors: ["#00F2FE", "#7C3AED"] },
  { key: "red-black", label: "Red & Black", colors: ["#FF0844", "#1A1A2E"] },
  { key: "yellow-black", label: "Yellow & Dark", colors: ["#FEE140", "#0F172A"] },
  { key: "green-neon", label: "Neon Green", colors: ["#38EF7D", "#0B151A"] },
  { key: "orange-warm", label: "Warm Orange", colors: ["#F97316", "#451A03"] },
  { key: "pink-purple", label: "Pink Gradient", colors: ["#EC4899", "#6D28D9"] },
];

export default function MainComponent() {
  const [topic, setTopic] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("gaming");
  const [selectedColor, setSelectedColor] = useState("cyan-purple");
  const [thumbnailText, setThumbnailText] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const [generatedImages, setGeneratedImages] = useState([]);
  const [history, setHistory] = useState([]);
  const [genError, setGenError] = useState("");
  const [partialNotice, setPartialNotice] = useState("");

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("altft_thumbnail_history");
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  // Persist history, gracefully degrading if the array no longer fits the
  // per-origin localStorage quota (each entry embeds a full-size base64 JPEG).
  // Drop the oldest entries one at a time until the write succeeds instead of
  // silently losing the whole write.
  const saveHistory = (items) => {
    let toSave = items;
    while (toSave.length > 0) {
      try {
        localStorage.setItem("altft_thumbnail_history", JSON.stringify(toSave));
        return;
      } catch {
        toSave = toSave.slice(0, toSave.length - 1);
      }
    }
    try {
      localStorage.removeItem("altft_thumbnail_history");
    } catch {}
  };

  const buildPrompt = () => {
    const stylePrompts = {
      gaming: "dramatic 3D render, epic gaming scene, neon glowing highlights, hyper-detailed, extremely vivid colors, dark background",
      tech: "futuristic cyberpunk technology scene, glowing circuit panels, smooth metallic surfaces, highly polished corporate dynamic design",
      finance: "dramatic luxury finance scene, golden stock charts, stacks of money, extreme luxury contrast lighting, dark sophisticated background",
      storytelling: "cinematic dramatic lighting, mysterious silhouette scene, extremely moody detailed storytelling atmosphere, film grain",
      education: "clean modern educational design, professional creative workspace, bright inspirational icons, high contrast clean setup",
      fitness: "bold dynamic fitness scene, powerful athlete silhouette, energy burst effects, dramatic gym lighting, motivational vibe",
      food: "appetizing food photography, vibrant saturated colors, steam rising, extreme close-up detail, restaurant quality lighting",
      travel: "breathtaking scenic landscape, golden hour lighting, wanderlust adventure vibe, ultra wide cinematic shot",
    };

    const colorPrompts = {
      "cyan-purple": "neon cyan and deep purple highlights, dark slate shadows",
      "red-black": "aggressive crimson red lasers and absolute dark shadows, high threat contrast",
      "yellow-black": "warning yellow hazard patterns and high-contrast dark metallic shadows",
      "green-neon": "electric lime green matrix style digital glow, hyper-vivid contrast",
      "orange-warm": "warm orange sunset glow with deep brown shadows, cozy cinematic",
      "pink-purple": "vibrant pink and purple gradient lighting, modern aesthetic glow",
    };

    const textInstr = thumbnailText
      ? `, with bold large stylized text saying "${thumbnailText}" in a dramatic YouTube thumbnail font`
      : ", no text overlays";

    return `16:9 widescreen YouTube thumbnail for a video about "${topic || "amazing secret hacks"}". ${stylePrompts[selectedStyle]}. ${colorPrompts[selectedColor]}. Extremely high quality, 8k resolution, commercial design, maximum visual impact, high CTR clickbait thumbnail style${textInstr}, professional composition`;
  };

  /* ── Generate one AI image at 640x360 and upscale to 1280x720 ── */
  const loadAIImage = (prompt, seed) => {
    return new Promise((resolve) => {
      // Generate at half resolution (much faster: ~5s vs ~30s)
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=640&height=360&nologo=true&seed=${seed}&t=${Date.now()}`;

      const img = new window.Image();
      img.crossOrigin = "anonymous";

      const timeout = setTimeout(() => {
        img.src = "";
        resolve(null);
      }, 40000);

      img.onload = async () => {
        clearTimeout(timeout);
        try {
          // Upscale to full 1280x720 on canvas
          const canvas = document.createElement("canvas");
          canvas.width = 1280;
          canvas.height = 720;
          const ctx = canvas.getContext("2d");
          // Use smooth upscaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, 1280, 720);
          resolve({
            id: `${Date.now()}-${seed}`,
            url: canvas.toDataURL("image/jpeg", 0.93),
            topic,
            style: selectedStyle,
            color: selectedColor,
            text: thumbnailText,
            timestamp: new Date().toISOString(),
          });
        } catch {
          // Canvas draw/export failed (e.g. a CORS-tainted canvas). Fetch the
          // same image as a blob so the fallback URL is a same-origin blob:
          // URL — the raw cross-origin pollinations.ai URL would silently
          // break the Download button's `download` attribute.
          try {
            const response = await fetch(url);
            const blob = await response.blob();
            resolve({
              id: `${Date.now()}-${seed}`,
              url: URL.createObjectURL(blob),
              topic,
              style: selectedStyle,
              color: selectedColor,
              text: thumbnailText,
              timestamp: new Date().toISOString(),
            });
          } catch {
            resolve({
              id: `${Date.now()}-${seed}`,
              url,
              topic,
              style: selectedStyle,
              color: selectedColor,
              text: thumbnailText,
              timestamp: new Date().toISOString(),
            });
          }
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(null);
      };

      img.src = url;
    });
  };

  /* ── Main generation handler ── */
  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setProgress(5);
    setGeneratedImages([]);
    setGenError("");
    setPartialNotice("");

    const prompt = buildPrompt();
    const results = [];

    // Progress animation. Kept in sync with the batch-completion jumps below
    // (via the shared `progressVal` closure) so the timer's next tick can't
    // overwrite a just-shown higher value with a stale lower one.
    let progressVal = 5;
    const timer = setInterval(() => {
      progressVal = Math.min(progressVal + Math.random() * 4, 92);
      setProgress(progressVal);
    }, 700);

    // Generate in 2 parallel batches of 2 (faster than sequential, more reliable than 4 at once)
    for (let batch = 0; batch < 2; batch++) {
      const seed1 = Math.floor(Math.random() * 999999);
      const seed2 = Math.floor(Math.random() * 999999);

      const [r1, r2] = await Promise.all([
        loadAIImage(prompt, seed1),
        loadAIImage(prompt, seed2),
      ]);

      if (r1) results.push(r1);
      if (r2) results.push(r2);

      // Show results as each batch completes
      if (results.length > 0) {
        setGeneratedImages([...results]);
      }
      progressVal = 50 * (batch + 1);
      setProgress(progressVal);
    }

    clearInterval(timer);
    setProgress(100);

    setTimeout(() => {
      setIsGenerating(false);

      if (results.length > 0) {
        const newHistory = [...results, ...history].slice(0, 20);
        setHistory(newHistory);
        saveHistory(newHistory);
        if (results.length < 4) {
          setPartialNotice(
            `Generated ${results.length} of 4 — the image service dropped the rest. Try Regenerate for the remaining thumbnails.`,
          );
        }
      } else {
        setGenError(
          "We couldn't generate any thumbnails this time — the image service may be busy or unreachable. Please try again.",
        );
      }
    }, 300);
  };

  /* ── Download handler ── */
  const handleDownload = (imageUrl, idx) => {
    const a = document.createElement("a");
    a.download = `thumbnail_${idx + 1}.jpg`;
    a.href = imageUrl;
    a.click();
  };

  const handleClearHistory = () => {
    if (!window.confirm("Clear all thumbnail history? This cannot be undone.")) {
      return;
    }
    setHistory([]);
    saveHistory([]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

      {/* Title Header */}
      <div className="mb-8 text-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-400 mb-2">
          <Video className="h-8 w-8 text-teal-500 shrink-0" /> Viral Thumbnail Maker
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
          Describe your video and let AI generate 4 unique, high-CTR YouTube thumbnails in about a minute.
        </p>
      </div>

      {/* Generator Panel */}
      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 sm:p-8 shadow-md space-y-6">

        {/* Video Topic */}
        <div>
          <label htmlFor="thumb-topic" className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            What is your video about?
          </label>
          <textarea
            id="thumb-topic"
            rows={2}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. I built a mass production factory in Minecraft that broke the game..."
            className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--page) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) transition resize-none text-(--foreground)"
          />
        </div>

        {/* Thumbnail Text (optional) */}
        <div>
          <label htmlFor="thumb-text" className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Text on thumbnail <span className="text-(--muted-foreground) font-normal normal-case">(optional)</span>
          </label>
          <input
            id="thumb-text"
            type="text"
            value={thumbnailText}
            onChange={(e) => setThumbnailText(e.target.value)}
            placeholder="e.g. YOU WON'T BELIEVE THIS..."
            className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--page) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) transition text-(--foreground)"
          />
        </div>

        {/* Visual Style */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5 uppercase tracking-wider">
            Visual Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelectedStyle(opt.key)}
                className={`p-3 rounded-xl border-2 text-left transition cursor-pointer select-none ${
                  selectedStyle === opt.key
                    ? "bg-(--primary)/5 border-(--primary)"
                    : "bg-(--page) border-(--border) hover:border-(--primary)/30"
                }`}
              >
                <div className="text-lg mb-0.5">{opt.emoji}</div>
                <div className="text-xs font-bold text-(--foreground)">{opt.label}</div>
                <div className="text-[10px] text-(--muted-foreground) mt-0.5 leading-tight">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Color Theme */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5 uppercase tracking-wider">
            Color Theme
          </label>
          <div className="flex flex-wrap gap-2.5">
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelectedColor(opt.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-xs font-semibold transition cursor-pointer select-none ${
                  selectedColor === opt.key
                    ? "bg-(--primary)/5 border-(--primary) text-(--primary)"
                    : "bg-(--page) border-(--border) text-(--foreground) hover:border-(--primary)/30"
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ background: `linear-gradient(135deg, ${opt.colors[0]}, ${opt.colors[1]})` }}
                />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!topic.trim() || isGenerating}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-(--primary) text-white font-semibold text-sm hover:opacity-90 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating 4 thumbnails...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate AI Thumbnails
            </>
          )}
        </button>
      </div>

      {/* Loading State - shows alongside already-loaded thumbnails */}
      {isGenerating && (
        <div
          className="mt-8 rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-md text-center space-y-3"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="h-5 w-5 text-(--primary) animate-spin" />
            <div className="text-left">
              <h3 className="font-bold text-(--foreground) text-sm">AI is generating your thumbnails...</h3>
              <p className="text-xs text-(--muted-foreground)">{generatedImages.length}/4 ready · Each image takes ~10-20 seconds</p>
            </div>
          </div>
          <div
            className="w-full max-w-sm mx-auto bg-(--border) h-1.5 rounded-full overflow-hidden"
            role="progressbar"
            aria-label="Thumbnail generation progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div className="bg-(--primary) h-full transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Generation error - shown when every image in the batch failed to load */}
      {!isGenerating && genError && (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-(--danger)/30 bg-(--danger)/10 p-4 text-sm text-(--danger-text) flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {genError}
        </div>
      )}

      {/* Partial batch notice - shown when some but not all 4 images loaded */}
      {!isGenerating && !genError && partialNotice && (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-(--warning)/30 bg-(--warning)/10 p-4 text-sm text-(--warning-text) flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {partialNotice}
        </div>
      )}

      {/* Generated Results - show as they arrive */}
      {generatedImages.length > 0 && (
        <div className="mt-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-(--foreground) flex items-center gap-2">
              <Zap className="w-5 h-5 text-(--primary)" />
              Your AI Thumbnails
            </h2>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-2 border border-(--border) rounded-xl text-xs font-semibold text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--page) transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Regenerate
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {generatedImages.map((item, idx) => (
              <div
                key={item.id}
                className="rounded-2xl border border-(--border) bg-(--surface) shadow-sm hover:shadow-md transition overflow-hidden group"
              >
                {/* Thumbnail Image */}
                <div className="aspect-video bg-slate-900 overflow-hidden relative">
                  <img
                    src={item.url}
                    alt={`Thumbnail variation ${idx + 1}`}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                      #{idx + 1}
                    </span>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="p-3 flex items-center justify-between">
                  <p className="text-xs text-(--muted-foreground) truncate max-w-[60%]">
                    {item.topic}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDownload(item.url, idx)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-(--primary) text-white text-xs font-semibold hover:opacity-90 transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && !isGenerating && (
        <div className="mt-10 rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-(--border) pb-3">
            <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-(--primary)" />
              Recent Thumbnails ({history.length})
            </h3>
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {history.map((item, idx) => (
              <div
                key={item.id || idx}
                role="button"
                tabIndex={0}
                aria-label={`Download thumbnail: ${item.topic || `history item ${idx + 1}`}`}
                className="rounded-xl border border-(--border) overflow-hidden bg-(--page) hover:shadow-md transition cursor-pointer group focus-visible:outline focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-2"
                onClick={() => handleDownload(item.url, idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleDownload(item.url, idx);
                  }
                }}
              >
                <div className="aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.topic}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="p-2">
                  <p className="text-[10px] font-semibold text-(--foreground) truncate">{item.topic}</p>
                  <p className="text-[9px] text-(--muted-foreground) mt-0.5">{STYLE_OPTIONS.find((s) => s.key === item.style)?.emoji} {STYLE_OPTIONS.find((s) => s.key === item.style)?.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
