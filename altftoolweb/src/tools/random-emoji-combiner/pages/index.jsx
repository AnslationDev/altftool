"use client";

import { useState, useCallback, useEffect } from "react";
import { Copy, Check, Heart, Shuffle, Lock, Unlock, Sparkles } from "lucide-react";

const EMOJI_POOL = [
  "🦄", "🔥", "🌈", "🐸", "👑", "🎸", "🍕", "🚀", "🦖", "🎩",
  "🐧", "⚡", "🐉", "💎", "🌊", "🌙", "☀️", "🌸", "🍄", "🐚",
  "🦋", "🐝", "🪐", "🌍", "🎭", "🎪", "🎨", "🎵", "🎶", "🎬",
  "🏆", "🥇", "🛡️", "🗡️", "🏹", "🧙", "🧝", "🧛", "🧟", "🦸",
  "🦹", "🤖", "👽", "👻", "💀", "🎃", "🕷️", "🦂", "🐙", "🦈",
  "🐋", "🦕", "🦖", "🐲", "🦄", "🐺", "🦊", "🐱", "🦁", "🐯",
  "🐻", "🐼", "🐨", "🐸", "🐵", "🦍", "🐧", "🐦", "🦅", "🦉",
  "🦇", "🐞", "🐜", "🪲", "🦎", "🐍", "🐢", "🐊", "🦈", "🐬",
  "🍕", "🍔", "🌮", "🌯", "🍣", "🍜", "🍝", "🥗", "🍩", "🍪",
  "🍫", "🍭", "🍦", "🧁", "🎂", "🍰", "☕", "🧃", "🥤", "🍷",
];

const EMOJI_COUNT = 3;

function getRandomEmojis(locked, all) {
  return all.map((_, i) => {
    if (locked[i]) return all[i];
    return EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
  });
}

export default function ToolHome() {
  const [emojis, setEmojis] = useState(() =>
    Array.from({ length: EMOJI_COUNT }, () => EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)])
  );
  const [locked, setLocked] = useState([false, false, false]);
  const [favorites, setFavorites] = useState([]);
  const [copied, setCopied] = useState(false);
  const [animating, setAnimating] = useState(false);

  const combination = emojis.join(" ");

  const handleGenerate = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setEmojis((prev) => getRandomEmojis(locked, prev));
      setAnimating(false);
    }, 300);
  }, [locked]);

  const toggleLock = (index) => {
    setLocked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(combination);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const toggleFavorite = () => {
    setFavorites((prev) => {
      if (prev.includes(combination)) return prev.filter((c) => c !== combination);
      return [...prev, combination];
    });
  };
  const isFavorite = favorites.includes(combination);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Random Emoji Combiner",
            "description": "Generate hilarious random emoji combinations online. Mix, lock favorites, and discover unexpected emoji pairs for fun and creativity.",
            "applicationCategory": "EntertainmentApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>
            Random Emoji Combiner
          </h1>
          <p className="text-lg opacity-80" style={{ color: "var(--muted-foreground)" }}>
            Generate funny emoji combinations
          </p>
        </div>

        <div className="rounded-2xl p-8 border text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className={`flex justify-center items-center gap-4 sm:gap-8 text-6xl sm:text-7xl mb-8 transition-all ${animating ? "scale-90 opacity-50" : "scale-100 opacity-100"}`}>
            {emojis.map((emoji, i) => (
              <div key={i} className="relative group">
                <span className="inline-block">{emoji}</span>
                <button
                  onClick={() => toggleLock(i)}
                  className="absolute -top-2 -right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "var(--background)" }}
                >
                  {locked[i] ? <Lock size={14} style={{ color: "var(--primary)" }} /> : <Unlock size={14} style={{ color: "var(--muted-foreground)" }} />}
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all active:scale-95"
              style={{ background: "var(--primary)" }}
            >
              <Shuffle size={18} /> Generate
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold border transition-all active:scale-95"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={toggleFavorite}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold border transition-all active:scale-95"
              style={{ borderColor: "var(--border)", color: isFavorite ? "var(--primary)" : "var(--foreground)" }}
            >
              <Heart size={18} fill={isFavorite ? "var(--primary)" : "none"} />
              {isFavorite ? "Favorited" : "Favorite"}
            </button>
          </div>

          {favorites.length > 0 && (
            <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: "var(--foreground)" }}>
                Favorites ({favorites.length})
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {favorites.map((fav, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setFavorites((prev) => prev.filter((_, j) => j !== i));
                    }}
                    className="px-3 py-1.5 rounded-lg text-lg border transition-all hover:opacity-70"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {fav} ✕
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
