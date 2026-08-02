"use client";

import { useState, useCallback } from "react";
import { Shuffle, Copy, Check, Sparkles, Wand2 } from "lucide-react";

const WIZARDS = [
  { name: "Eldrin Stormcloak", school: "Evocation", staff: "Oak Dragon Staff", spell: "Lightning Bolt", level: 9, familiar: "Phoenix", quote: "The storm answers my call!" },
  { name: "Magnus Emberheart", school: "Pyromancy", staff: "Crystal Flame Rod", spell: "Fireball", level: 8, familiar: "Salamander", quote: "Burn brighter than the sun!" },
  { name: "Althor Moonwhisper", school: "Illusion", staff: "Silver Crescent Staff", spell: "Mirror Image", level: 7, familiar: "Owl", quote: "Reality is but a suggestion." },
  { name: "Zephyrus Oakstaff", school: "Druidism", staff: "Living Oak Staff", spell: "Nature's Wrath", level: 8, familiar: "Wolf", quote: "The forest protects its own." },
  { name: "Seraphina Frostveil", school: "Cryomancy", staff: "Glacial Scepter", spell: "Blizzard", level: 9, familiar: "Arctic Fox", quote: "Embrace the eternal cold." },
  { name: "Theron Voidgaze", school: "Necromancy", staff: "Bone Staff of Souls", spell: "Raise Dead", level: 10, familiar: "Raven", quote: "Death is merely a doorway." },
  { name: "Lyra Sunweaver", school: "Abjuration", staff: "Golden Dawn Rod", spell: "Prismatic Barrier", level: 7, familiar: "Hawk", quote: "Light shall shield the worthy." },
  { name: "Gideon Runehand", school: "Enchantment", staff: "Rune-etched Staff", spell: "Mass Charm", level: 6, familiar: "Cat", quote: "A word is all it takes." },
  { name: "Morgana Tidesong", school: "Aquamancy", staff: "Coral Trident Staff", spell: "Tidal Wave", level: 8, familiar: "Dolphin", quote: "The deep remembers." },
  { name: "Finnian Sparkwhistle", school: "Artifice", staff: "Clockwork Staff", spell: "Summon Golem", level: 5, familiar: "Mechanical Bird", quote: "Magic and science are one." },
  { name: "Rowan Thornweaver", school: "Witchcraft", staff: "Twisted Briar Staff", spell: "Hex of Decay", level: 6, familiar: "Toad", quote: "From the earth, all power flows." },
  { name: "Cassius Starfall", school: "Divination", staff: "Astral Crystal Staff", spell: "True Sight", level: 7, familiar: "Owl", quote: "The stars whisper all secrets." },
  { name: "Elara Mistvale", school: "Conjuration", staff: "Misty Willow Staff", spell: "Summon Elemental", level: 8, familiar: "Butterfly", quote: "From thin air, I create." },
  { name: "Orion Thunderstep", school: "Tempest", staff: "Iron Storm Staff", spell: "Chain Lightning", level: 9, familiar: "Eagle", quote: "Thunder shakes the heavens!" },
  { name: "Vesper Nightshade", school: "Shadow Magic", staff: "Obsidian Dagger Staff", spell: "Shadow Walk", level: 7, familiar: "Bat", quote: "Darkness is not evil, it is power." },
  { name: "Corvin Ashford", school: "Transmutation", staff: "Mercury Staff", spell: "Turn to Gold", level: 6, familiar: "Chameleon", quote: "Change is the only constant." },
  { name: "Iris Dawnweaver", school: "Light Magic", staff: "Prism Staff", spell: "Radiant Burst", level: 8, familiar: "Firefly", quote: "Light pierces all darkness." },
  { name: "Malachai Soulrender", school: "Blood Magic", staff: "Crimson Bone Staff", spell: "Life Drain", level: 9, familiar: "Vulture", quote: "Life for power, always." },
  { name: "Petra Stoneheart", school: "Geomancy", staff: "Granite Pillar Staff", spell: "Earthquake", level: 7, familiar: "Badger", quote: "The mountain does not yield." },
  { name: "Sylvan Greenleaf", school: "Herbalism", staff: "Vine-wrapped Branch", spell: "Healing Bloom", level: 5, familiar: "Rabbit", quote: "Nature heals all wounds." },
];

function getRandomWizard() {
  return WIZARDS[Math.floor(Math.random() * WIZARDS.length)];
}

export default function ToolHome() {
  const [wizard, setWizard] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setWizard(getRandomWizard());
      setAnimating(false);
    }, 250);
  }, []);

  const handleCopy = async () => {
    if (!wizard) return;
    const text = `${wizard.name}\nSchool: ${wizard.school}\nStaff: ${wizard.staff}\nSpell: ${wizard.spell}\nLevel: ${wizard.level}\nFamiliar: ${wizard.familiar}\nQuote: "${wizard.quote}"`;
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
            "name": "Wizard Name Generator",
            "description": "Generate mystical wizard names with magic schools, staff types, and enchanted quotes. Discover your fantasy wizard identity for RPGs and stories.",
            "applicationCategory": "EntertainmentApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />
      <div className="max-w-xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>
            Wizard Name Generator
          </h1>
          <p className="text-lg opacity-80" style={{ color: "var(--muted-foreground)" }}>
            Discover your fantasy wizard identity
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-lg transition-all active:scale-[0.98]"
            style={{ background: "var(--primary)" }}
          >
            <Shuffle size={22} /> Summon Wizard
          </button>

          {wizard && (
            <div className={`rounded-2xl p-6 border transition-all duration-300 ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`} style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <Wand2 size={28} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>{wizard.name}</h2>
                  <p className="text-xs font-semibold" style={{ color: "var(--primary)" }}>{wizard.school}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-foreground)" }}>Staff</p>
                  <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{wizard.staff}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-foreground)" }}>Level</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full" style={{ background: i < wizard.level ? "var(--primary)" : "var(--border)" }} />
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-foreground)" }}>Spell Specialty</p>
                  <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{wizard.spell}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-foreground)" }}>Familiar</p>
                  <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{wizard.familiar}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl text-center italic mb-4 border" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                &ldquo;{wizard.quote}&rdquo;
              </div>

              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all"
                style={{ borderColor: "var(--border)", color: copied ? "var(--primary)" : "var(--foreground)" }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Wizard"}
              </button>
            </div>
          )}

          {!wizard && (
            <div className="rounded-2xl p-12 border text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <Sparkles size={48} className="mx-auto mb-4 opacity-40" style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Click summon to meet your wizard</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
