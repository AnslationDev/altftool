"use client";

import {
  ArrowRight, Sparkles, Newspaper, ShieldAlert, Film,
  Cat, Sword, Zap, CheckCircle2
} from "lucide-react";

export default function LandingInfo({ onTabChange }) {

  const generatorCards = [
    {
      id: "newspaper",
      title: "Vintage Broadsheet",
      desc: "Replicate industrial letterpress layout prints from the early 1900s.",
      icon: Newspaper,
      badge: "Editorial",
      color: "from-amber-500/10 to-amber-600/5 hover:border-amber-500/30",
      iconColor: "text-amber-600"
    },
    {
      id: "wanted",
      title: "Outlaw Bounty Warrant",
      desc: "Generate custom old-west frontier rewards with custom criminal photo sketches.",
      icon: ShieldAlert,
      badge: "Retro West",
      color: "from-red-500/10 to-red-600/5 hover:border-red-500/30",
      iconColor: "text-red-600"
    },
    {
      id: "clapper",
      title: "Hollywood Clapper Director",
      desc: "Vectorize set production slates featuring interactive mechanical clap physics.",
      icon: Film,
      badge: "Cinematic",
      color: "from-blue-500/10 to-blue-600/5 hover:border-blue-500/30",
      iconColor: "text-blue-600"
    },
    {
      id: "cat",
      title: "Talking Cat Scribe",
      desc: "Animate modular talking cat breed models with voice pitch frequency filters.",
      icon: Cat,
      badge: "Interactive",
      color: "from-emerald-500/10 to-emerald-600/5 hover:border-emerald-500/30",
      iconColor: "text-emerald-600"
    },
    {
      id: "ninja",
      title: "Ninja Text Strike",
      desc: "Inscribe messages using stealth katana or shuriken strike speed typing cycles.",
      icon: Sword,
      badge: "Combat FX",
      color: "from-rose-500/10 to-rose-600/5 hover:border-rose-500/30",
      iconColor: "text-rose-600"
    },
    {
      id: "wizard",
      title: "Wizard Spell Inscriber",
      desc: "Nostalgic typewriter animation layouts embedded over dynamic arcane plates.",
      icon: Sparkles,
      badge: "Fantasy",
      color: "from-purple-500/10 to-purple-600/5 hover:border-purple-500/30",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="h-full w-full overflow-y-auto bg-background text-foreground">

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-12 pb-10 flex flex-col items-center text-center px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-radial from-neutral-200/40 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 shadow-sm">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-[9px] font-black uppercase text-muted">
              Studio Suite Edition v2.0 Active
            </span>
          </div>

          {/*
            This is the Home tab's panel heading, not the page's. It only
            exists while `activeTab === "landing"`; switch to Newspaper or
            Wanted and it unmounts, so as an <h1> the studio's top-level
            heading came and went with client state. The page's own H1 is the
            masthead in ../page.jsx, which is rendered on every tab. Level
            only — the type utilities are on this element, so it paints
            identically.
          */}
          <h2 className="text-3xl font-black uppercase leading-tight text-foreground sm:text-4xl md:text-5xl">
            Transform Ideas Into <br />
            <span className="text-primary">
              Retro Visual Assets
            </span>
          </h2>

          <p className="mx-auto max-w-lg text-xs font-medium leading-relaxed text-muted md:text-sm">
            Your high-fidelity generation pipeline for crafting modular newspapers, bounty posters, responsive slates, interactive scripts, and custom art elements.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onTabChange("newspaper")}
              className="group flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-xs font-black uppercase text-primary-foreground shadow-md transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE CARD PIPELINES ── */}
      <section className="mx-auto max-w-6xl border-t border-border px-6 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <h2 className="text-[10px] font-black uppercase text-muted">Available generators</h2>
            <p className="mt-0.5 text-lg font-bold text-foreground">Explore creative tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generatorCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <button
                key={idx}
                onClick={() => onTabChange(card.id)}
                className="group block rounded-xl border border-border bg-surface p-5 text-left shadow-sm transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="rounded-lg border border-border bg-surface-soft p-2 text-primary shadow-sm">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[8px] font-black uppercase text-primary">
                    {card.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase text-foreground">
                    {card.title}
                  </h3>
                  <p className="text-[11px] font-medium leading-relaxed text-muted">
                    {card.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
