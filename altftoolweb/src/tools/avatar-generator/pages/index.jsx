"use client";

import { useCallback, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import {
  Download,
  Copy,
  RefreshCw,
  Shuffle,
  Sparkles,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { nanoid } from "nanoid";

import Preview from "../components/Preview";
import ControlsPanel from "../components/ControlsPanel";
import Description from "../components/Description";
import { cloneDefaultConfig } from "../utils/defaults";
import {
  generateConfigFromSeed,
  generateAiConfig,
} from "../utils/avatarSvg";
import { downloadAvatarPng, copyAvatar } from "../utils/download";

export default function ToolHome() {
  const [config, setConfig] = useState(() => cloneDefaultConfig());
  const [busy, setBusy] = useState(null); // "download" | "copy" | null
  const [error, setError] = useState("");
  const svgRef = useRef(null);

  const setSvgNode = useCallback((node) => {
    svgRef.current = node;
  }, []);

  const update = (patch) => setConfig((c) => ({ ...c, ...patch }));
  const updateColor = (key, value) =>
    setConfig((c) => ({ ...c, colors: { ...c.colors, [key]: value } }));
  const updateFeature = (key, value) =>
    setConfig((c) => ({ ...c, features: { ...c.features, [key]: value } }));

  const handleRandomize = () => {
    setError("");
    const seed = nanoid(10);
    setConfig({ ...generateConfigFromSeed(seed), seed });
  };

  const handleAiGenerate = () => {
    setError("");
    const seed = nanoid(10);
    setConfig({ ...generateAiConfig(seed), seed });
  };

  const handleReset = () => {
    setError("");
    setConfig(cloneDefaultConfig());
    toast.success("Reset to defaults");
  };

  const handleDownload = async () => {
    if (!svgRef.current) return;
    setBusy("download");
    setError("");
    try {
      await downloadAvatarPng(svgRef.current, `avatar-${config.style}-${config.seed}.png`);
      toast.success("Avatar downloaded");
    } catch (err) {
      setError("Failed to download avatar. Please try again.");
      toast.error("Download failed");
    } finally {
      setBusy(null);
    }
  };

  const handleCopy = async () => {
    if (!svgRef.current) return;
    setBusy("copy");
    setError("");
    try {
      const res = await copyAvatar(svgRef.current);
      if (res.ok && res.method === "png") {
        toast.success("Avatar copied to clipboard");
      } else if (res.ok && res.method === "svg") {
        toast.success("Avatar SVG copied (image paste not supported here)");
      } else {
        setError("Clipboard not supported in this browser.");
        toast.error("Copy not supported");
      }
    } catch (err) {
      setError("Failed to copy avatar. Please try again.");
      toast.error("Copy failed");
    } finally {
      setBusy(null);
    }
  };

  const primaryBtn =
    "inline-flex items-center justify-center gap-2 bg-(--primary) text-(--primary-foreground) hover:opacity-90 rounded-xl font-semibold transition active:scale-95 px-4 py-2.5 text-sm disabled:opacity-50";
  const ghostBtn =
    "inline-flex items-center justify-center gap-2 border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted) rounded-xl font-medium transition active:scale-95 px-4 py-2.5 text-sm disabled:opacity-50";

  return (
    <div className="min-h-screen bg-(--background) p-4 text-(--foreground) md:p-8">
      <Toaster position="top-center" richColors />

      {/* Hero */}
      <div className="mb-8 pt-6 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-(--primary)/30 bg-(--primary)/10 px-4 py-1.5 text-xs font-semibold text-(--primary)">
          <Sparkles size={14} />
          AI-style Avatar Studio
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Avatar Generator
        </h1>
        <p className="description mx-auto mt-3 max-w-xl text-(--muted-foreground)">
          Design unique, scalable avatars with custom styles, colors and facial
          features. Download as PNG or copy instantly.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Preview + actions */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm">
            <Preview config={config} onRef={setSvgNode} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              type="button"
              onClick={handleRandomize}
              className={ghostBtn}
              aria-label="Randomize avatar"
            >
              <Shuffle size={16} />
              Random
            </button>
            <button
              type="button"
              onClick={handleAiGenerate}
              className={primaryBtn}
              aria-label="AI generate avatar"
            >
              <Sparkles size={16} />
              AI Generate
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={busy !== null}
              className={primaryBtn}
              aria-label="Download avatar as PNG"
            >
              {busy === "download" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              PNG
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={busy !== null}
              className={ghostBtn}
              aria-label="Copy avatar to clipboard"
            >
              {busy === "copy" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Copy size={16} />
              )}
              Copy
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className={`${ghostBtn} w-full justify-center`}
            aria-label="Reset all settings"
          >
            <RotateCcw size={16} />
            Reset configuration
          </button>

          {busy && (
            <div className="flex items-center gap-2 rounded-xl border border-(--border) bg-(--muted) px-4 py-3 text-sm text-(--muted-foreground)">
              <Loader2 size={16} className="animate-spin text-(--primary)" />
              {busy === "download" ? "Rendering PNG…" : "Copying avatar…"}
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300"
            >
              {error}
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <ControlsPanel
          config={config}
          onStyle={(style) => update({ style })}
          onColor={updateColor}
          onBackground={(background) => update({ background })}
          onFeature={updateFeature}
        />
      </div>

      <Description />
    </div>
  );
}
