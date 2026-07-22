"use client";

import { useState, useCallback, useEffect } from "react";
import { Shuffle, Copy, Check, Sparkles, Skull, Shield, Zap, Eye, Flame, Cloud, Star, Moon } from "lucide-react";

const VILLAINS = [
  { name: "Lord Oblivion", title: "The Eternal Void", origin: "Born from a dying star", ability: "Erase memories and matter", threat: "Extinction", phrase: "You will be forgotten." },
  { name: "Doctor Chaos", title: "Master of Entropy", origin: "Mad scientist experiment gone wrong", ability: "Probability manipulation", threat: "Global", phrase: "Order is an illusion!" },
  { name: "The Crimson Phantom", title: "Ghost of the Night", origin: "Betrayed hero resurrected", ability: "Intangibility and fear induction", threat: "City", phrase: "Fear me, for I am nothing." },
  { name: "Queen Venom", title: "The Poison Empress", origin: "Ancient serpent queen", ability: "Deadly toxins and mind control", threat: "Continental", phrase: "One drop changes everything." },
  { name: "Baron Nightmare", title: "Dream Walker", origin: "Cursed by a dream demon", ability: "Enter and control dreams", threat: "Global", phrase: "Sleep is my playground." },
  { name: "General Frost", title: "The Ice Tyrant", origin: "Arctic military experiment", ability: "Flash freeze anything", threat: "Continental", phrase: "Feel the cold embrace." },
  { name: "Madame Shadow", title: "Silent Blade", origin: "Assassin from parallel dimension", ability: "Step through shadows", threat: "City", phrase: "Darkness is my ally." },
  { name: "Overlord X", title: "The Extraterrestrial", origin: "Alien conqueror", ability: "Advanced tech and mind control", threat: "Extinction", phrase: "Resistance is futile." },
  { name: "The Iron Maiden", title: "Steel Executioner", origin: "Cybernetic warrior revived", ability: "Magnetic manipulation", threat: "Global", phrase: "Your metal will obey me." },
  { name: "Professor Paradox", title: "Time Breaker", origin: "Chronal accident", ability: "Time loops and age reversal", threat: "Universal", phrase: "Causality is optional." },
  { name: "Blackout", title: "The Light Eater", origin: "Energy vampire experiment", ability: "Absorb all light and power", threat: "Global", phrase: "Let there be darkness." },
  { name: "The Puppeteer", title: "String Master", origin: "Shadow organization leader", ability: "Invisible wire control", threat: "City", phrase: "Dance for me." },
  { name: "Viper", title: "The Toxic One", origin: "Venomous mutation", ability: "Acid blood and venom bite", threat: "City", phrase: "One kiss and it's over." },
  { name: "Necro", title: "Lord of the Dead", origin: "Ancient necromancer", ability: "Raise the dead", threat: "Continental", phrase: "Death is just the beginning." },
  { name: "Tempest", title: "Storm Bringer", origin: "Weather control experiment", ability: "Control hurricanes and lightning", threat: "Continental", phrase: "The sky obeys me." },
  { name: "Mindbreaker", title: "The Thought Thief", origin: "Psychic lab escapee", ability: "Mental manipulation and illusions", threat: "Global", phrase: "Your mind is mine." },
  { name: "Razor", title: "The Unseen", origin: "Military super soldier", ability: "Super speed and precision", threat: "City", phrase: "You won't see it coming." },
  { name: "Plague", title: "The Contagion", origin: "Biological weapon", ability: "Disease generation", threat: "Extinction", phrase: "Health is temporary." },
  { name: "The Siren", title: "Voice of Destruction", origin: "Ancient sea spirit", ability: "Hypnotic voice and sound waves", threat: "Global", phrase: "Listen closely..." },
  { name: "Warlock", title: "Dark Arts Master", origin: "Forbidden magic user", ability: "Dark magic and summoning", threat: "Continental", phrase: "Magic demands sacrifice." },
];

const THREAT_COLORS = {
  City: "#14B8A6",
  Global: "#F59E0B",
  Continental: "#EF4444",
  Extinction: "#7C3AED",
  Universal: "#000000",
};

function getRandomVillain() {
  return VILLAINS[Math.floor(Math.random() * VILLAINS.length)];
}

export default function ToolHome() {
  const [villain, setVillain] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setVillain(getRandomVillain());
      setAnimating(false);
    }, 250);
  }, []);

  const handleCopy = async () => {
    if (!villain) return;
    const text = `${villain.name} — ${villain.title}\nOrigin: ${villain.origin}\nAbility: ${villain.ability}\nThreat Level: ${villain.threat}\nPhrase: "${villain.phrase}"`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Random Villain Name Generator",
            "description": "Generate dramatic villain names and identities with evil titles, dark abilities, and catchphrases. Perfect for stories, games, and roleplay.",
            "applicationCategory": "EntertainmentApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />
      <div className="max-w-xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>
            Villain Name Generator
          </h1>
          <p className="text-lg opacity-80" style={{ color: "var(--muted-foreground)" }}>
            Create dramatic villain identities
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-lg transition-all active:scale-[0.98]"
            style={{ background: "var(--primary)" }}
          >
            <Shuffle size={22} /> Generate Villain
          </button>

          {villain && (
            <div className={`rounded-2xl p-6 border transition-all duration-300 ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`} style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 rounded-full" style={{ background: "var(--background)" }}>
                  <Skull size={36} style={{ color: THREAT_COLORS[villain.threat] || "var(--primary)" }} />
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-center mb-1" style={{ color: "var(--foreground)" }}>{villain.name}</h2>
              <p className="text-sm font-semibold text-center mb-4" style={{ color: "var(--primary)" }}>{villain.title}</p>

              <div className="space-y-3 mb-4">
                <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-foreground)" }}>Origin</p>
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>{villain.origin}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-foreground)" }}>Special Ability</p>
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>{villain.ability}</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Threat Level</p>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full text-white uppercase" style={{ background: THREAT_COLORS[villain.threat] || "var(--primary)" }}>
                    {villain.threat}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl text-center italic mb-4 border" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                &ldquo;{villain.phrase}&rdquo;
              </div>

              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all"
                style={{ borderColor: "var(--border)", color: copied ? "var(--primary)" : "var(--foreground)" }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Villain"}
              </button>
            </div>
          )}

          {!villain && (
            <div className="rounded-2xl p-12 border text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <Skull size={48} className="mx-auto mb-4 opacity-40" style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Click generate to create your villain</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
