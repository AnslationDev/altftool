"use client";

import { useState, useCallback, useEffect } from "react";
import { Copy, Check, Share2, RefreshCw, Sparkles, Cookie } from "lucide-react";

const FORTUNES = {
  General: [
    { msg: "Tomorrow is luckier than today.", number: 7, color: "Gold", emoji: "🌟", day: "Thursday" },
    { msg: "A stranger will improve your week.", number: 12, color: "Blue", emoji: "💙", day: "Monday" },
    { msg: "You'll discover something valuable.", number: 3, color: "Green", emoji: "🍀", day: "Wednesday" },
    { msg: "Don't ignore your curiosity.", number: 8, color: "Purple", emoji: "🔮", day: "Friday" },
    { msg: "A surprise is heading your way.", number: 21, color: "Red", emoji: "🎁", day: "Saturday" },
    { msg: "Small steps lead to big changes.", number: 5, color: "Teal", emoji: "🦋", day: "Tuesday" },
    { msg: "Your patience will be rewarded soon.", number: 9, color: "Silver", emoji: "⏳", day: "Sunday" },
    { msg: "Trust the process, not the outcome.", number: 14, color: "Indigo", emoji: "🌀", day: "Thursday" },
  ],
  Love: [
    { msg: "Love is closer than you think.", number: 2, color: "Pink", emoji: "💕", day: "Friday" },
    { msg: "A conversation will change everything.", number: 6, color: "Rose", emoji: "🌹", day: "Saturday" },
    { msg: "Your heart knows the answer already.", number: 11, color: "Red", emoji: "❤️", day: "Monday" },
    { msg: "Someone is thinking of you right now.", number: 4, color: "Peach", emoji: "💭", day: "Wednesday" },
    { msg: "A second chance may be coming.", number: 22, color: "Lavender", emoji: "💜", day: "Tuesday" },
  ],
  Career: [
    { msg: "Your hard work is about to pay off.", number: 10, color: "Gold", emoji: "🏆", day: "Monday" },
    { msg: "A new opportunity will present itself.", number: 15, color: "Green", emoji: "📈", day: "Wednesday" },
    { msg: "Collaboration is your key to success.", number: 18, color: "Teal", emoji: "🤝", day: "Thursday" },
    { msg: "Leadership comes naturally to you.", number: 1, color: "Crimson", emoji: "👑", day: "Friday" },
    { msg: "Take that risk. It's worth it.", number: 13, color: "Orange", emoji: "🚀", day: "Tuesday" },
  ],
  Money: [
    { msg: "A financial surprise is coming.", number: 8, color: "Gold", emoji: "💰", day: "Thursday" },
    { msg: "Save now, enjoy later.", number: 16, color: "Green", emoji: "💵", day: "Monday" },
    { msg: "An investment will grow beyond expectations.", number: 25, color: "Silver", emoji: "📊", day: "Wednesday" },
    { msg: "Generosity attracts abundance.", number: 20, color: "Purple", emoji: "🪙", day: "Saturday" },
  ],
  Adventure: [
    { msg: "An adventure awaits around the corner.", number: 17, color: "Blue", emoji: "🗺️", day: "Friday" },
    { msg: "Pack your bags. Change is coming.", number: 23, color: "Orange", emoji: "✈️", day: "Sunday" },
    { msg: "A new path will reveal itself.", number: 19, color: "Teal", emoji: "🌄", day: "Tuesday" },
    { msg: "Say yes to the unknown.", number: 4, color: "Coral", emoji: "🎒", day: "Thursday" },
  ],
  Funny: [
    { msg: "You're not crazy. The world is.", number: 42, color: "Rainbow", emoji: "🤪", day: "Saturday" },
    { msg: "You will soon trip over something. Not a metaphor.", number: 69, color: "Chartreuse", emoji: "🦶", day: "Tuesday" },
    { msg: "The WiFi will be great today. That's the peak.", number: 99, color: "Blue", emoji: "📶", day: "Wednesday" },
    { msg: "Your pet judges you. And approves.", number: 13, color: "Brown", emoji: "🐾", day: "Monday" },
    { msg: "Eat the cookie. You deserve it.", number: 1, color: "Golden Brown", emoji: "🍪", day: "Every day" },
  ],
  Weird: [
    { msg: "A pigeon will teach you something important.", number: 37, color: "Gray", emoji: "🕊️", day: "Sunday" },
    { msg: "The spoon is not a liar.", number: 88, color: "Silver", emoji: "🥄", day: "Thursday" },
    { msg: "Somewhere, a potato is thinking of you.", number: 0, color: "Brown", emoji: "🥔", day: "Never" },
    { msg: "You exist. That's weird. Congrats.", number: 404, color: "Invisible", emoji: "👻", day: "Yesterday" },
    { msg: "A duck will witness your greatest moment.", number: 7, color: "Yellow", emoji: "🦆", day: "Wetnesday" },
  ],
};

const CATEGORIES = Object.keys(FORTUNES);

function randomFortune() {
  const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const fortunes = FORTUNES[cat];
  const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  return { ...fortune, category: cat };
}

export default function ToolHome() {
  const [fortune, setFortune] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    setFlipping(true);
    setTimeout(() => {
      setFortune(randomFortune());
      setFlipping(false);
    }, 400);
  }, []);

  const handleCopy = async () => {
    if (!fortune) return;
    const text = `🥠 Fortune Cookie\n\n"${fortune.msg}"\n\nLucky #: ${fortune.number}  |  Color: ${fortune.color}\nEmoji: ${fortune.emoji}  |  Day: ${fortune.day}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleShare = async () => {
    if (!fortune || !navigator.share) return;
    try {
      await navigator.share({
        title: "My Fortune Cookie",
        text: `🐣 "${fortune.msg}" — Lucky #${fortune.number}, ${fortune.color}, ${fortune.emoji}`,
      });
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
            "name": "Fortune Cookie Generator",
            "description": "Generate fun fortune cookie messages with lucky numbers, colors, and smooth card flip animations. Get your daily fortune and wisdom instantly.",
            "applicationCategory": "EntertainmentApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />
      <div className="max-w-lg mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>
            Fortune Cookie Generator
          </h1>
          <p className="text-lg opacity-80" style={{ color: "var(--muted-foreground)" }}>
            Crack open your fortune
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white text-lg transition-all active:scale-[0.98]"
            style={{ background: "var(--primary)" }}
          >
            <RefreshCw size={22} /> Open a Fortune Cookie
          </button>

          {fortune && (
            <div className="perspective-1000">
              <div className={`rounded-2xl p-6 border transition-all duration-500 ${flipping ? "rotate-y-180 opacity-0" : "rotate-y-0 opacity-100"}`} style={{ background: "var(--card)", borderColor: "var(--border)", transformStyle: "preserve-3d" }}>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 rounded-full" style={{ background: "var(--background)" }}>
                    <Cookie size={36} style={{ color: "var(--primary)" }} />
                  </div>
                </div>

                <div className="p-4 rounded-xl text-center italic mb-4 border-2 border-dashed" style={{ borderColor: "var(--primary)", background: "var(--background)", color: "var(--foreground)" }}>
                  &ldquo;{fortune.msg}&rdquo;
                </div>

                <div className="text-center mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: "var(--background)", color: "var(--primary)" }}>
                    {fortune.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 mt-4">
                  <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                    <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-foreground)" }}>Lucky Number</p>
                    <p className="text-2xl font-extrabold" style={{ color: "var(--primary)" }}>{fortune.number}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                    <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-foreground)" }}>Lucky Color</p>
                    <p className="text-lg font-extrabold" style={{ color: "var(--foreground)" }}>{fortune.color}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                    <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-foreground)" }}>Lucky Emoji</p>
                    <p className="text-3xl">{fortune.emoji}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: "var(--background)" }}>
                    <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: "var(--muted-foreground)" }}>Lucky Day</p>
                    <p className="text-lg font-extrabold" style={{ color: "var(--foreground)" }}>{fortune.day}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all"
                    style={{ borderColor: "var(--border)", color: copied ? "var(--primary)" : "var(--foreground)" }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
            </div>
          )}

          {!fortune && (
            <div className="rounded-2xl p-12 border text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <Cookie size={48} className="mx-auto mb-4 opacity-40" style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Click to crack open your fortune cookie</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .rotate-y-0 { transform: rotateY(0deg); }
      `}</style>
    </div>
  );
}
