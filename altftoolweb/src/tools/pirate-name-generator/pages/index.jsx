"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Shuffle, Copy, Check, Anchor, Ship } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const PIRATES = [
  { name: "Captain Black Beard", ship: "The Revenge", crew: 45, bounty: "2,500,000", ocean: "Caribbean", weapon: "Cutlass", motto: "Take what ye can!" },
  { name: "Salty Jack", ship: "Sea Serpent", crew: 22, bounty: "850,000", ocean: "Atlantic", weapon: "Flintlock", motto: "A fair wind and foul plunder!" },
  { name: "Scarface Morgan", ship: "Bloody Dawn", crew: 38, bounty: "1,800,000", ocean: "Pacific", weapon: "Boarding Axe", motto: "Dead men tell no tales!" },
  { name: "Mad Anne Flint", ship: "Iron Kraken", crew: 55, bounty: "3,200,000", ocean: "Indian", weapon: "Dual Pistols", motto: "A woman's wrath be worse than the storm!" },
  { name: "Storm Captain Briggs", ship: "Thunder Wave", crew: 30, bounty: "1,200,000", ocean: "Arctic", weapon: "Harpoon", motto: "The storm is my ally!" },
  { name: "Dread Pirate Hawkins", ship: "Shadow Pearl", crew: 60, bounty: "4,500,000", ocean: "Caribbean", weapon: "Saber", motto: "Fortune favors the bold!" },
  { name: "One-Eyed Pete", ship: "The Barnacle", crew: 15, bounty: "600,000", ocean: "Mediterranean", weapon: "Blunderbuss", motto: "Keep a weather eye!" },
  { name: "Silent Kate", ship: "Whisper Wind", crew: 28, bounty: "950,000", ocean: "Pacific", weapon: "Rapier", motto: "Strike swift, vanish silent!" },
  { name: "Redbeard Rex", ship: "Crimson Tide", crew: 50, bounty: "2,800,000", ocean: "Atlantic", weapon: "Boarding Pike", motto: "Red sky at morn, sailors be warned!" },
  { name: "Barnacle Bill", ship: "The Rusty Hook", crew: 12, bounty: "300,000", ocean: "Caribbean", weapon: "Grappling Hook", motto: "Slow and steady fills the chest!" },
  { name: "Captain Raven", ship: "Nightfall", crew: 35, bounty: "1,500,000", ocean: "Indian", weapon: "Stiletto", motto: "In darkness we sail!" },
  { name: "Iron Hook Harris", ship: "Steel Serpent", crew: 42, bounty: "2,100,000", ocean: "Atlantic", weapon: "Iron Hook", motto: "No port is safe!" },
  { name: "Scurvy Dog Smith", ship: "The Rat Trap", crew: 8, bounty: "150,000", ocean: "Caribbean", weapon: "Broken Bottle", motto: "Even a mangy dog bites!" },
  { name: "Calico Jane", ship: "Calypso's Kiss", crew: 33, bounty: "1,100,000", ocean: "Pacific", weapon: "Whip", motto: "Tie 'em to the mast!" },
  { name: "Blacktooth McGraw", ship: "The Maelstrom", crew: 48, bounty: "3,000,000", ocean: "Arctic", weapon: "Cannon", motto: "Sink 'em all!" },
];

function getRandomPirate() {
  return PIRATES[Math.floor(Math.random() * PIRATES.length)];
}

export default function ToolHome() {
  const [pirate, setPirate] = useState(null);
  const [animating, setAnimating] = useState(false);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const generateTimerRef = useRef(null);
  const fadeInFrameRef = useRef(null);

  // Clear any pending re-roll animation timers/frames on unmount so a click
  // right before navigating away doesn't call setState after unmount.
  useEffect(() => {
    return () => {
      if (generateTimerRef.current) window.clearTimeout(generateTimerRef.current);
      if (fadeInFrameRef.current) window.cancelAnimationFrame(fadeInFrameRef.current);
    };
  }, []);

  const handleGenerate = useCallback(() => {
    setAnimating(true);
    generateTimerRef.current = window.setTimeout(() => {
      setPirate(getRandomPirate());
      // Flip back to opacity-100 on the next frame instead of in the same
      // commit as the content swap -- otherwise React batches both state
      // updates together, the new content never paints at opacity-0, and
      // the fade-in half of the crossfade never actually plays.
      fadeInFrameRef.current = window.requestAnimationFrame(() => {
        fadeInFrameRef.current = window.requestAnimationFrame(() => {
          setAnimating(false);
        });
      });
    }, 250);
  }, []);

  const handleCopy = () => {
    if (!pirate) return;
    const text = `${pirate.name}\nShip: ${pirate.ship}\nCrew: ${pirate.crew}\nBounty: $${pirate.bounty}\nOcean: ${pirate.ocean}\nWeapon: ${pirate.weapon}\nMotto: "${pirate.motto}"`;
    copy("pirate", text, { label: "pirate details" });
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Pirate Name Generator",
            "description": "Generate swashbuckling pirate names with ships, bounties, and mottos. Find your perfect pirate identity for adventures, games, and cosplay.",
            "applicationCategory": "EntertainmentApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />
      <div className="max-w-xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>
            Pirate Name Generator
          </h1>
          <p className="text-lg opacity-80" style={{ color: "var(--muted-foreground)" }}>
            Ahoy! Generate yer pirate identity
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-primary-foreground text-lg transition-all active:scale-[0.98]"
            style={{ background: "var(--primary)" }}
          >
            <Shuffle size={22} /> Generate Pirate
          </button>

          {pirate && (
            <div
              className={`rounded-2xl p-6 border transition-all duration-300 ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
              aria-live="polite"
              role="status"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <Anchor size={28} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold" style={{ color: "var(--foreground)" }}>{pirate.name}</h2>
                  <p className="text-xs font-semibold" style={{ color: "var(--primary)" }}>Ship: {pirate.ship}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-foreground)" }}>Crew Size</p>
                  <p className="text-lg font-extrabold" style={{ color: "var(--foreground)" }}>{pirate.crew}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-foreground)" }}>Bounty</p>
                  <p className="text-lg font-extrabold" style={{ color: "var(--warning-text)" }}>${pirate.bounty}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-foreground)" }}>Ocean</p>
                  <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{pirate.ocean}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-foreground)" }}>Weapon</p>
                  <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{pirate.weapon}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl text-center italic mb-4 border" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                &ldquo;{pirate.motto}&rdquo;
              </div>

              <button
                onClick={handleCopy}
                aria-label={isCopied("pirate") ? "Copied pirate details to clipboard" : "Copy pirate details"}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all"
                style={{ borderColor: "var(--border)", color: isCopied("pirate") ? "var(--primary)" : "var(--foreground)" }}
              >
                {isCopied("pirate") ? <Check size={16} /> : <Copy size={16} />}
                {isCopied("pirate") ? "Copied!" : "Copy Pirate"}
              </button>
              <span className="sr-only" role="status" aria-live="polite">
                {announcement}
              </span>
            </div>
          )}

          {!pirate && (
            <div className="rounded-2xl p-12 border text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <Ship size={48} className="mx-auto mb-4 opacity-40" style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Click generate to meet yer pirate self</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
