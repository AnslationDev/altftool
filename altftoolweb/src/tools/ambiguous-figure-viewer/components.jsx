// src/tools/ambiguous-figure-viewer/components.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  ChevronRight,
  Eye,
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
  Search,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,var(--primary)/0.08,transparent)]" />
      <motion.div
        className="absolute left-[6%] top-[10%] h-56 w-56 rounded-full bg-[var(--primary)] opacity-[0.08] blur-3xl"
        animate={{ x: [0, 24, -12, 0], y: [0, -18, 16, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[12%] right-[5%] h-72 w-72 rounded-full bg-[var(--primary)] opacity-[0.05] blur-3xl"
        animate={{ x: [0, -32, 18, 0], y: [0, 18, -16, 0], scale: [1, 0.95, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
      />
    </div>
  );
}

function FallbackArtwork({ illusion, compact = false }) {
  const id = illusion.id;

  return (
    <div className={`ambiguous-artwork ambiguous-artwork-${id} ${compact ? "is-compact" : ""}`}>
      <div className="art-grid" />
      <div className="art-shape art-shape-a" />
      <div className="art-shape art-shape-b" />
      <div className="art-shape art-shape-c" />
      <div className="art-center">
        <Eye className="h-5 w-5" />
      </div>
    </div>
  );
}

function IllusionArtwork({ illusion, compact = false, className = "" }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[var(--background)] ${className}`}>
      {!failed ? (
        <img
          src={illusion.image}
          alt={illusion.title}
          onError={() => setFailed(true)}
          className="h-full w-full bg-[var(--background)] object-contain transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <FallbackArtwork illusion={illusion} compact={compact} />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />
    </div>
  );
}

export function IllusionCard({ illusion, onClick }) {
  return (
    <motion.button
      layout
      onClick={() => onClick(illusion)}
      className="group min-w-0 overflow-hidden rounded-[1.35rem] border border-[var(--border)] bg-[var(--card)] text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/35"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      type="button"
    >
      <div className="aspect-[16/10] w-full overflow-hidden border-b border-[var(--border)]">
        <IllusionArtwork illusion={illusion} compact />
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="break-words text-lg font-black leading-snug text-[var(--foreground)] transition group-hover:text-[var(--primary)]">
              {illusion.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted-foreground)]">
              {illusion.description}
            </p>
          </div>
          <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--primary)] transition group-hover:bg-[var(--primary)] group-hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-bold text-[var(--primary)]">
            {illusion.difficulty}
          </span>
          <span className="max-w-full rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-bold text-[var(--muted-foreground)]">
            {illusion.perceptionType}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export function IllusionViewer({ illusion, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [activeHint, setActiveHint] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [mode, setMode] = useState("normal");
  const [stats, setStats] = useState(() => ({ firstSeen: null, switches: 0, startTime: Date.now() }));
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const frameRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (mode !== "spotlight") return;
      const rect = frameRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMousePos({
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mode]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "+") setZoom((value) => Math.min(value + 0.2, 2.4));
      if (event.key === "-") setZoom((value) => Math.max(value - 0.2, 0.8));
      if (event.key === "r") setZoom(1);
      if (event.key === "b") setMode((value) => (value === "blur" ? "normal" : "blur"));
      if (event.key === "s") setMode((value) => (value === "spotlight" ? "normal" : "spotlight"));
      if (event.key === "i") setMode((value) => (value === "invert" ? "normal" : "invert"));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handlePerceptionSwitch = (id) => {
    const interpretation = illusion.interpretations.find((item) => item.id === id);
    if (!interpretation) return;

    if (!stats.firstSeen) {
      setStats((previous) => ({
        ...previous,
        firstSeen: interpretation.label,
        firstSwitchTime: (Date.now() - previous.startTime) / 1000,
        switches: previous.switches + 1,
      }));
    } else {
      setStats((previous) => ({ ...previous, switches: previous.switches + 1 }));
    }

    setHighlight(id);
    setActiveHint(interpretation.hint);
  };

  const resetView = () => {
    setZoom(1);
    setMode("normal");
    setHighlight(null);
    setActiveHint(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="viewer-overlay fixed inset-0 z-50 overflow-y-auto px-3 py-3 sm:px-5 sm:py-5"
    >
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-4">
        <div className="sticky top-0 z-20 rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-3 shadow-sm backdrop-blur sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={onClose}
                className="btn-secondary h-11 w-11 shrink-0 !p-0"
                type="button"
                aria-label="Close viewer"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black text-[var(--foreground)] sm:text-xl">
                  {illusion.title}
                </h2>
                <p className="truncate text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                  {illusion.perceptionType}
                </p>
              </div>
            </div>

            <div className="flex max-w-full gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:justify-end lg:overflow-visible lg:pb-0">
              {illusion.interpretations.map((interpretation) => (
                <button
                  key={interpretation.id}
                  onClick={() => handlePerceptionSwitch(interpretation.id)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition ${
                    highlight === interpretation.id
                      ? "bg-[var(--primary)] text-white"
                      : "border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  }`}
                  type="button"
                >
                  {interpretation.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm sm:p-4">
            <div
              ref={frameRef}
              className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-[var(--background)] sm:min-h-[480px] lg:min-h-[610px]"
              style={{ "--x": `${mousePos.x}%`, "--y": `${mousePos.y}%` }}
            >
              <motion.div
                className="h-full w-full origin-center"
                animate={{ scale: zoom }}
                transition={{ type: "spring", stiffness: 190, damping: 24 }}
              >
                <IllusionArtwork
                  illusion={illusion}
                  className={`${
                    mode === "blur"
                      ? "blur-md"
                      : mode === "contrast"
                        ? "contrast-200"
                        : mode === "invert"
                          ? "invert"
                          : mode === "spotlight"
                            ? "spotlight-mask"
                            : ""
                  }`}
                />
              </motion.div>

              <AnimatePresence>
                {activeHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    className="absolute bottom-4 left-4 right-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-3 text-sm font-semibold leading-6 text-[var(--foreground)] shadow-xl backdrop-blur sm:left-1/2 sm:right-auto sm:max-w-xl sm:-translate-x-1/2 sm:px-4"
                  >
                    {activeHint}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Panel title="Viewing Tools" icon={Maximize2}>
              <div className="grid grid-cols-2 gap-2">
                <IconButton icon={<ZoomIn size={17} />} onClick={() => setZoom((value) => Math.min(value + 0.2, 2.4))} label="Zoom In" />
                <IconButton icon={<ZoomOut size={17} />} onClick={() => setZoom((value) => Math.max(value - 0.2, 0.8))} label="Zoom Out" />
                <IconButton active={mode === "blur"} icon={<Layers size={17} />} onClick={() => setMode((value) => (value === "blur" ? "normal" : "blur"))} label="Blur" />
                <IconButton active={mode === "spotlight"} icon={<Search size={17} />} onClick={() => setMode((value) => (value === "spotlight" ? "normal" : "spotlight"))} label="Spotlight" />
                <IconButton active={mode === "invert"} icon={<Minimize2 size={17} />} onClick={() => setMode((value) => (value === "invert" ? "normal" : "invert"))} label="Invert" />
                <IconButton icon={<RotateCcw size={17} />} onClick={resetView} label="Reset" />
              </div>
            </Panel>

            <Panel title="Session Stats" icon={Brain}>
              <div className="grid grid-cols-2 gap-3">
                <StatItem label="First Seen" value={stats.firstSeen || "..."} />
                <StatItem label="Switch Time" value={stats.firstSwitchTime ? `${stats.firstSwitchTime.toFixed(1)}s` : "..."} />
                <StatItem label="Switches" value={stats.switches} />
                <StatItem label="Zoom" value={`${Math.round(zoom * 100)}%`} />
              </div>
            </Panel>

            <Panel title="How to Read It" icon={Sparkles}>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                Try one interpretation button, then relax your focus and look for the second meaning. Zoom, blur, or spotlight can make hidden edges easier to notice.
              </p>
            </Panel>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="min-w-0 break-words text-base font-black text-[var(--foreground)]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function IconButton({ icon, onClick, active, label }) {
  return (
    <button
      onClick={onClick}
      className={`min-w-0 rounded-xl border px-3 py-3 text-sm font-bold transition ${
        active
          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
      }`}
      title={label}
      type="button"
    >
      <span className="flex items-center justify-center gap-2">
        {icon}
        <span className="truncate">{label}</span>
      </span>
    </button>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
      <p className="break-words text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-1 truncate text-lg font-black text-[var(--foreground)]">{value}</p>
    </div>
  );
}

export function ScientificEducation() {
  const sections = [
    {
      title: "How Perception Switches",
      content: "Ambiguous figures provide two or more stable interpretations. Since the sensory input is constant, the change happens inside the brain.",
      icon: Brain,
    },
    {
      title: "Bistable Perception",
      content: "Neural groups compete for dominance. When one representation fatigues, perception can suddenly flip to the other meaning.",
      icon: Sparkles,
    },
    {
      title: "Top-Down Processing",
      content: "Expectations, memories, and context influence which interpretation your visual system chooses first.",
      icon: Eye,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {sections.map(({ title, content, icon: Icon }) => (
        <div
          key={title}
          className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 transition hover:border-[var(--primary)]"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
            <Icon className="h-5 w-5" />
          </div>
          <h4 className="break-words text-base font-black text-[var(--foreground)]">{title}</h4>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{content}</p>
        </div>
      ))}
    </div>
  );
}
