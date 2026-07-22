"use client";

import { useState } from "react";
import { Heart, Copy, Sparkles, Zap, Check, Dog } from "lucide-react";

/* -------------------- DATA -------------------- */
const petData = {
  dog: ["Buddy", "Rocky", "Max", "Charlie", "Leo", "Tiger", "Bruno", "Shadow"],
  cat: ["Luna", "Bella", "Milo", "Simba", "Kitty", "Coco", "Nala", "Oreo"],
  rabbit: ["Fluffy", "Snowy", "Bunny", "Cotton", "Hopper", "Cloud"],
  parrot: ["Mithu", "Rio", "Kiwi", "Sunny", "Peppy", "Coco"],
  hamster: ["Nibbles", "Peanut", "Hazel", "Cookie", "Marshmallow"],
};

const styles = ["Cute", "Royal", "Funny", "Cool", "Unique", "Traditional"];

const petEmojis = {
  dog: "🐕",
  cat: "🐈",
  rabbit: "🐰",
  parrot: "🦜",
  hamster: "🐹",
};

/* -------------------- NAME LOGIC -------------------- */
const generateCreativeName = (base, style, keyword) => {
  const prefixes = {
    Cute: ["Little", "Sweet", "Baby", "Tiny", "Lovely"],
    Royal: ["Sir", "Lady", "Prince", "Princess", "Duke"],
    Funny: ["Mister", "Captain", "Professor", "Doctor", "Agent"],
    Cool: ["Shadow", "Blaze", "Storm", "Thunder", "Frost"],
    Unique: ["Cosmic", "Mystic", "Nova", "Echo", "Phoenix"],
    Traditional: ["Old", "Classic", "Vintage", "Timeless", "Heritage"],
  };

  const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

  let name = keyword ? keyword + base : base;
  if (prefixes[style] && Math.random() > 0.5) {
    name = random(prefixes[style]) + " " + name;
  }
  return name;
};

/* ==================== COMPONENT ==================== */
export default function PetNameGenerator() {
  const [petType, setPetType] = useState("dog");
  const [style, setStyle] = useState("Cute");
  const [keyword, setKeyword] = useState("");
  const [names, setNames] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [copiedName, setCopiedName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  /* -------- GENERATION -------- */
  const generateNames = () => {
    setIsGenerating(true);
    const base = petData[petType];
    const used = new Set();
    const result = [];

    while (result.length < 15) {
      const baseName = base[Math.floor(Math.random() * base.length)];
      const name = generateCreativeName(baseName, style, keyword);
      if (!used.has(name)) {
        used.add(name);
        result.push(name);
      }
    }

    setTimeout(() => {
      setNames(result);
      setIsGenerating(false);
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 400); // reduced timeout slightly for better UX
  };

  const toggleFavorite = (name) => {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const copyName = (name) => {
    navigator.clipboard.writeText(name);
    setCopiedName(name);
    setTimeout(() => setCopiedName(""), 1500);
  };

  /* ==================== UI ==================== */
  return (
    <div className="min-h-screen bg-(--background) py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-(--primary)/10 mb-2">
            <Dog className="w-8 h-8 text-(--primary)" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-(--foreground) tracking-tight">
            Find The Perfect Pet Name
          </h1>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Generate unique, creative names instantly for your furry, feathery, or fuzzy friends.
          </p>
        </div>

        {/* GENERATOR CARD */}
        <div id="generator" className="bg-(--card) border border-(--border) rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 mb-8 text-(--foreground)">
            <Sparkles className="text-(--primary) w-6 h-6" />
            Customize Your Pet Name
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* PET TYPE */}
            <div>
              <p className="font-semibold mb-3 text-(--foreground)">Pet Type</p>
              <div className="space-y-2">
                {Object.keys(petData).map((pet) => (
                  <button
                    key={pet}
                    onClick={() => setPetType(pet)}
                    className={`w-full px-4 py-2.5 rounded-xl border transition-all capitalize font-medium flex items-center justify-center gap-2
                      ${
                        petType === pet
                          ? "bg-(--primary) text-white border-(--primary)"
                          : "bg-(--background) text-(--foreground) border-(--border) hover:border-(--primary)/50"
                      }`}
                  >
                    <span>{petEmojis[pet]}</span> {pet}
                  </button>
                ))}
              </div>
            </div>

            {/* STYLE */}
            <div>
              <p className="font-semibold mb-3 text-(--foreground)">Style</p>
              <div className="space-y-2">
                {styles.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`w-full px-4 py-2.5 rounded-xl border transition-all font-medium
                      ${
                        style === s
                          ? "bg-(--primary) text-white border-(--primary)"
                          : "bg-(--background) text-(--foreground) border-(--border) hover:border-(--primary)/50"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* KEYWORD */}
            <div>
              <p className="font-semibold mb-3 text-(--foreground)">Custom Prefix</p>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. Mr, Baby"
                className="w-full h-11 px-4 rounded-xl bg-(--background) border border-(--border) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/30 transition-all"
              />
              <p className="text-xs text-(--muted-foreground) mt-2">
                Optional: Add a custom prefix to blend with the generated names.
              </p>
            </div>
          </div>

          <button
            onClick={generateNames}
            disabled={isGenerating}
            className="mt-8 w-full h-12 rounded-xl bg-(--primary) text-white font-semibold flex items-center justify-center gap-2 hover:bg-(--primary)/90 transition-all active:scale-[0.98]"
          >
            {isGenerating ? (
              <span className="animate-pulse">Generating Magic...</span>
            ) : (
              <>
                Start Generating <Zap className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* RESULTS SECTION */}
        {names.length > 0 && (
          <div id="results" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-(--foreground)">Generated Names</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {names.map((name) => (
                <div
                  key={name}
                  className="bg-(--card) border border-(--border) rounded-xl p-4 flex justify-between items-center hover:border-(--primary)/30 transition-colors group"
                >
                  <span className="font-semibold text-(--foreground) break-words text-lg">
                    {name}
                  </span>

                  <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyName(name)}
                      className="p-2 rounded-lg hover:bg-(--muted) text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                      title="Copy name"
                    >
                      {copiedName === name ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={() => toggleFavorite(name)}
                      className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                      title={favorites.includes(name) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          favorites.includes(name)
                            ? "fill-red-500 text-red-500"
                            : "text-(--muted-foreground) hover:text-red-500"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* FAVORITES SECTION */}
            {favorites.length > 0 && (
              <div className="bg-(--card) border border-(--border) rounded-2xl p-6 md:p-8 mt-8 shadow-sm">
                <h3 className="text-xl font-bold text-(--foreground) mb-6 flex items-center gap-2">
                  <Heart className="w-6 h-6 fill-red-500 text-red-500" />
                  Your Favorites ({favorites.length})
                </h3>

                <div className="flex flex-wrap gap-3">
                  {favorites.map((fav, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full bg-(--background) text-(--foreground) border border-(--border) font-medium text-sm flex items-center gap-2 shadow-sm"
                    >
                      {fav}
                      <button
                        onClick={() => toggleFavorite(fav)}
                        className="text-(--muted-foreground) hover:text-red-500 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
