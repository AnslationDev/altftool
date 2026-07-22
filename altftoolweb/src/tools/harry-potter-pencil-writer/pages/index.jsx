"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Settings2, Download, Copy, Share2, Type, TypeOutline } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";

export default function HarryPotterPencilWriter() {
  const [text, setText] = useState("");
  const [font, setFont] = useState("magical");
  const [size, setSize] = useState(48);
  const [glowEffect, setGlowEffect] = useState(true);

  const fontStyles = {
    magical: { fontFamily: "'Cinzel Decorative', serif" },
    parchment: { fontFamily: "'MedievalSharp', cursive" },
    ancient: { fontFamily: "'UnifrakturMaguntia', cursive" },
  };

  const displayText = text || "Your magical text will appear here...";

  const handleDownload = async () => {
    const element = document.getElementById("text-display");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#0B1120", // match dark mode background for better contrast
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = "magical-text.png";
      link.href = canvas.toDataURL();
      link.click();

      toast.success("Your magical text has been downloaded!", {
        description: "Check your downloads folder",
      });
    } catch (error) {
      toast.error("Failed to download image", {
        description: "Please try again",
      });
    }
  };

  const handleCopy = () => {
    if (!text) {
      toast.error("No text to copy!", {
        description: "Please enter some text first",
      });
      return;
    }

    navigator.clipboard.writeText(text);
    toast.success("Text copied to clipboard!", {
      description: "Share your magical words",
    });
  };

  const handleShare = async () => {
    if (!text) {
      toast.error("No text to share!", {
        description: "Please enter some text first",
      });
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Magical Text",
          text: text,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-(--background) py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4 mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-(--primary)/10 mb-2">
            <Sparkles className="w-8 h-8 text-(--primary)" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-(--foreground) tracking-tight">
            Magical Pencil Writer
          </h1>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Transform your ordinary words into magical enchantments. Choose your spell-binding style and watch the magic unfold.
          </p>
        </motion.div>

        {/* Text Input Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-3"
        >
          <label htmlFor="magical-text" className="text-lg font-medium text-(--foreground) flex items-center gap-2">
            <Type className="w-5 h-5 text-(--primary)" />
            Write Your Spell Here
          </label>
          <textarea
            id="magical-text"
            placeholder="Type your magical message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[120px] p-4 text-lg bg-(--card) text-(--foreground) border border-(--border) rounded-xl focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30 transition-all resize-y"
          />
        </motion.div>

        {/* Font Selector */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-3"
        >
          <label htmlFor="font-select" className="text-lg font-medium text-(--foreground) block">
            Choose Your Magical Font
          </label>
          <select
            id="font-select"
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-(--border) bg-(--card) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/30 transition-all"
          >
            <option value="magical">Magical Enchantment (Cinzel)</option>
            <option value="parchment">Ancient Parchment (MedievalSharp)</option>
            <option value="ancient">Mystic Runes (UnifrakturMaguntia)</option>
          </select>
        </motion.div>

        {/* Text Display */}
        <motion.div
          id="text-display"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-(--card) border-2 border-(--border) rounded-xl p-8 md:p-12 min-h-[300px] flex items-center justify-center relative overflow-hidden"
        >
          {/* Magical shimmer effect */}
          {glowEffect && (
            <motion.div
              className="absolute inset-0 opacity-10 pointer-events-none"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                background: "linear-gradient(45deg, transparent 30%, var(--primary) 50%, transparent 70%)",
                backgroundSize: "200% 200%",
              }}
            />
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="relative z-10 text-center w-full break-words"
          >
            <p
              className={`${!text ? "text-(--muted-foreground)" : "text-(--foreground)"} ${glowEffect && text ? "drop-shadow-[0_0_8px_var(--primary)]" : ""}`}
              style={{
                fontSize: `${size}px`,
                lineHeight: 1.2,
                ...fontStyles[font]
              }}
            >
              {displayText}
            </p>
          </motion.div>
        </motion.div>

        {/* Customization Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-(--card) border border-(--border) rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Settings2 className="w-5 h-5 text-(--secondary)" />
            <h3 className="text-xl font-semibold text-(--foreground)">Customize Your Magic</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="size-slider" className="text-sm font-medium text-(--foreground) mb-3 block">
                Text Size: {size}px
              </label>
              <input
                id="size-slider"
                type="range"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                min={24}
                max={96}
                step={4}
                className="w-full h-2 bg-(--border) rounded-lg appearance-none cursor-pointer accent-(--primary)"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="glow-switch" className="text-sm font-medium text-(--foreground) cursor-pointer">
                Magical Glow Effect
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="glow-switch"
                  checked={glowEffect}
                  onChange={(e) => setGlowEffect(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-(--border) peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--primary)"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Export Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-(--primary) text-white font-medium rounded-xl hover:bg-(--primary)/90 transition-all hover:scale-105 active:scale-95"
          >
            <Download className="w-5 h-5" />
            Download Image
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-3 bg-(--secondary) text-[#0B1120] font-medium rounded-xl hover:bg-(--secondary)/90 transition-all hover:scale-105 active:scale-95"
          >
            <Copy className="w-5 h-5" />
            Copy Text
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 border-2 border-(--border) text-(--foreground) font-medium rounded-xl hover:bg-(--border)/50 transition-all hover:scale-105 active:scale-95"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </motion.div>
      </div>
    </div>
  );
}
