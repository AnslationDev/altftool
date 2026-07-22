"use client";

import { useState, useCallback, useEffect } from "react";
import { Shuffle, Copy, Check, Sparkles, Star, Zap, Shield, Brain, Eye, Wind, Flame, Droplets, Mountain, Clock, Atom } from "lucide-react";

const POWERS = [
  { name: "Control Gravity", desc: "Manipulate gravitational fields around objects and people within a 50m radius.", weakness: "Motion sickness after heavy use", rarity: "Legendary", category: "Elemental", level: 9 },
  { name: "Freeze Time", desc: "Pause time for up to 12 seconds while you move freely.", weakness: "Aged 1 month per freeze", rarity: "Mythic", category: "Temporal", level: 10 },
  { name: "Speak With Machines", desc: "Communicate telepathically with any electronic device.", weakness: "WiFi interference causes headaches", rarity: "Uncommon", category: "Tech", level: 5 },
  { name: "Create Mini Black Holes", desc: "Summon stable micro black holes that last 3 seconds.", weakness: "Cannot control what they absorb", rarity: "Mythic", category: "Cosmic", level: 10 },
  { name: "Teleport Through Mirrors", desc: "Step into any reflective surface and exit from another.", weakness: "No mirrors = no escape", rarity: "Rare", category: "Spatial", level: 7 },
  { name: "Invisibility", desc: "Bend light around your body to become completely transparent.", weakness: "Sneezes reveal your position", rarity: "Rare", category: "Illusion", level: 6 },
  { name: "Super Strength", desc: "Lift objects up to 100 tons with pure physical power.", weakness: "Strength fades after sunset", rarity: "Common", category: "Physical", level: 4 },
  { name: "Telepathy", desc: "Read surface thoughts within 1km range.", weakness: "Loud thoughts cause migraines", rarity: "Uncommon", category: "Psychic", level: 5 },
  { name: "Weather Control", desc: "Summon rain, lightning, wind, and clear skies at will.", weakness: "Mood affects weather accuracy", rarity: "Legendary", category: "Elemental", level: 8 },
  { name: "Healing Touch", desc: "Accelerate cellular regeneration in living beings.", weakness: "Cannot heal yourself", rarity: "Rare", category: "Life", level: 6 },
  { name: "Shape Shift", desc: "Transform into any living creature you have seen.", weakness: "Stuck as last form for 1 hour after use", rarity: "Legendary", category: "Morphic", level: 8 },
  { name: "Flight", desc: "Soar through the air at speeds up to 500 km/h.", weakness: "Feather allergies grounded you", rarity: "Uncommon", category: "Physical", level: 4 },
  { name: "Force Fields", desc: "Generate impenetrable energy shields up to 10m wide.", weakness: "Each hit drains stamina", rarity: "Rare", category: "Energy", level: 6 },
  { name: "Mind Control", desc: "Briefly influence the decisions of weak-minded individuals.", weakness: "Strong minds resist easily", rarity: "Legendary", category: "Psychic", level: 8 },
  { name: "Elemental Fire", desc: "Generate and control fire from your palms.", weakness: "Fire goes out in vacuum", rarity: "Uncommon", category: "Elemental", level: 5 },
  { name: "Elemental Water", desc: "Control water sources and generate water from moisture.", weakness: "Dehydrates you over time", rarity: "Uncommon", category: "Elemental", level: 5 },
  { name: "Elemental Earth", desc: "Move earth, stone, and minerals with your mind.", weakness: "Cannot affect refined metal", rarity: "Common", category: "Elemental", level: 4 },
  { name: "Elemental Wind", desc: "Summon powerful winds and control air currents.", weakness: "No effect in sealed rooms", rarity: "Common", category: "Elemental", level: 3 },
  { name: "Darkness Manipulation", desc: "Shroud areas in magical darkness only you can see through.", weakness: "Bright light blinds you temporarily", rarity: "Rare", category: "Shadow", level: 6 },
  { name: "Light Manipulation", desc: "Create blinding flashes and concentrated light beams.", weakness: "Needs ambient light to draw from", rarity: "Rare", category: "Light", level: 6 },
  { name: "Plant Control", desc: "Command plants to grow, move, and attack.", weakness: "No effect in deserts or ice", rarity: "Uncommon", category: "Nature", level: 4 },
  { name: "Animal Communication", desc: "Understand and speak with any animal.", weakness: "Animals may ignore you", rarity: "Common", category: "Nature", level: 3 },
  { name: "X-Ray Vision", desc: "See through solid objects up to 2m thick.", weakness: "Lead blocks your sight completely", rarity: "Rare", category: "Sensory", level: 5 },
  { name: "Super Speed", desc: "Move at speeds up to Mach 2 for short bursts.", weakness: "Friction burns if not careful", rarity: "Rare", category: "Physical", level: 6 },
  { name: "Duplication", desc: "Create up to 5 identical copies of yourself.", weakness: "Copies share your pain", rarity: "Legendary", category: "Morphic", level: 7 },
  { name: "Phasing", desc: "Walk through solid matter at will.", weakness: "Cannot breathe while phased", rarity: "Legendary", category: "Spatial", level: 8 },
  { name: "Magnetism", desc: "Control magnetic fields and metal objects.", weakness: "Non-metal objects unaffected", rarity: "Uncommon", category: "Energy", level: 5 },
  { name: "Cryokinesis", desc: "Freeze objects and create ice structures.", weakness: "Shivering makes concentration hard", rarity: "Uncommon", category: "Elemental", level: 5 },
  { name: "Telekinesis", desc: "Move objects with your mind up to 5 tons.", weakness: "Fine control causes nosebleeds", rarity: "Rare", category: "Psychic", level: 6 },
  { name: "Time Sight", desc: "See past events that happened in a location.", weakness: "Cannot control what you see", rarity: "Legendary", category: "Temporal", level: 7 },
];

const CATEGORY_ICONS = {
  Elemental: Flame, Temporal: Clock, Tech: Zap, Cosmic: Atom, Spatial: Wind,
  Illusion: Eye, Physical: Zap, Psychic: Brain, Life: Shield, Morphic: Sparkles,
  Energy: Zap, Shadow: Eye, Light: Sparkles, Nature: Mountain, Sensory: Eye,
};

function getRandomPower() {
  return POWERS[Math.floor(Math.random() * POWERS.length)];
}

export default function ToolHome() {
  const [power, setPower] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setPower(getRandomPower());
      setAnimating(false);
    }, 250);
  }, []);

  const handleCopy = async () => {
    if (!power) return;
    const text = `${power.name}\n${power.desc}\nPower Level: ${power.level}/10 | Rarity: ${power.rarity} | Weakness: ${power.weakness}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const CatIcon = power ? CATEGORY_ICONS[power.category] || Sparkles : Sparkles;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Random Superpower Generator",
            "description": "Generate unique fictional superpowers with descriptions, weaknesses, and rarity rankings. Find your ultimate superpower for stories, games, and fun.",
            "applicationCategory": "EntertainmentApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />
      <div className="max-w-xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>
            Random Superpower Generator
          </h1>
          <p className="text-lg opacity-80" style={{ color: "var(--muted-foreground)" }}>
            Discover your unique fictional superpower
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-lg transition-all active:scale-[0.98]"
            style={{ background: "var(--primary)" }}
          >
            <Shuffle size={22} /> Generate Superpower
          </button>

          {power && (
            <div className={`rounded-2xl p-6 border transition-all duration-300 ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`} style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <CatIcon size={28} style={{ color: "var(--primary)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>{power.name}</h2>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: "var(--background)", color: "var(--primary)" }}>
                      {power.category}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{
                      background: "var(--background)",
                      color: power.rarity === "Mythic" ? "#EF4444" : power.rarity === "Legendary" ? "#F59E0B" : power.rarity === "Rare" ? "#8B5CF6" : power.rarity === "Uncommon" ? "#14B8A6" : "#6B7280",
                    }}>
                      {power.rarity}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{power.desc}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>Power Level</p>
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: i < power.level ? "var(--primary)" : "var(--border)" }} />
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>Weakness</p>
                  <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{power.weakness}</p>
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all"
                style={{ borderColor: "var(--border)", color: copied ? "var(--primary)" : "var(--foreground)" }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Power"}
              </button>
            </div>
          )}

          {!power && (
            <div className="rounded-2xl p-12 border text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <Sparkles size={48} className="mx-auto mb-4 opacity-40" style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Click generate to discover your superpower</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
