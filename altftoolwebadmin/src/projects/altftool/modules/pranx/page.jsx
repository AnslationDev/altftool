"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, RotateCcw, Save, ZoomIn } from "lucide-react";

import { emitAlert } from "@/lib/alertBus";
import { DEFAULT_PRANX_CONTENT, fetchPranxHome, savePranxHome } from "./service/pranx.service";
import { Field, Grid, ImageField, ListEditor, TextArea, ToggleField, getImageUrl, GENERAL_ASSETS, SLIDER_BACKGROUNDS, THUMBNAILS, ImageLightbox, extractImagesFromContent, getPrankDefaultImage } from "./components/fields";

const TABS = [
  { key: "header", label: "Header" },
  { key: "hero", label: "Hero & Slides" },
  { key: "effects", label: "Effects Toggles" },
  { key: "tiles", label: "Showcase Gallery" },
  { key: "instructions", label: "Instructions Guide" },
  { key: "footer", label: "Footer" },
  { key: "media", label: "Media & Audio Explorer" },
];

function deepMerge(base, override) {
  if (Array.isArray(base)) return Array.isArray(override) ? override : base;
  if (base && typeof base === "object") {
    const out = { ...base };
    const src = override && typeof override === "object" ? override : {};
    for (const key of Object.keys(base)) out[key] = deepMerge(base[key], src[key]);
    return out;
  }
  return override === undefined || override === null ? base : override;
}

const clone = (value) => JSON.parse(JSON.stringify(value));

export default function PranxModule() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState("header");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await fetchPranxHome();
        if (active) setContent(deepMerge(DEFAULT_PRANX_CONTENT, stored || {}));
      } catch (err) {
        if (active) {
          setContent(clone(DEFAULT_PRANX_CONTENT));
          emitAlert({ type: "error", title: "Load failed", message: err?.message || "Showing defaults." });
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const set = (path, value) => {
    setDirty(true);
    setContent((prev) => {
      const next = clone(prev);
      let node = next;
      for (let i = 0; i < path.length - 1; i += 1) node = node[path[i]];
      node[path[path.length - 1]] = value;
      return next;
    });
  };

  const sectionSetter = (section) => (key, value) => set([section, key], value);

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePranxHome(content);
      setDirty(false);
      emitAlert({ type: "success", title: "Saved", message: "Public Pranx configuration updated successfully." });
    } catch (err) {
      emitAlert({ type: "error", title: "Save failed", message: err?.message || "Could not save settings." });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all fields to original defaults? (No changes will be saved until you hit Save changes.)")) {
      setContent(clone(DEFAULT_PRANX_CONTENT));
      setDirty(true);
    }
  };

  if (loading || !content) {
    return (
      <div className="flex items-center gap-2.5 p-10 text-sm text-[var(--muted)]">
        <Loader2 size={18} className="animate-spin" /> Loading Pranx Studio content…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold text-[var(--foreground)] sm:text-xl">
              Pranx Studio · Editor
            </h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Modify the branding, sliders, default glitch settings, and pranks showcase directory.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]"
            >
              <RotateCcw size={14} /> <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold text-[var(--primary-foreground)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-3 -mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-t-lg border-b-2 px-3.5 py-2 text-sm font-semibold transition ${tab === t.key
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "header" && <HeaderTab content={content} set={set} setField={sectionSetter("header")} />}
      {tab === "hero" && <HeroTab content={content} set={set} setField={sectionSetter("hero")} />}
      {tab === "effects" && <EffectsTab content={content} set={set} />}
      {tab === "tiles" && <TilesTab content={content} set={set} />}
      {tab === "instructions" && <InstructionsTab content={content} set={set} setField={sectionSetter("instructions")} />}
      {tab === "footer" && <FooterTab content={content} setField={sectionSetter("footer")} />}
      {tab === "media" && <MediaTab content={content} />}
    </div>
  );
}

function Card({ title, hint, children }) {
  return (
    <section className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      {title ? (
        <header className="mb-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">{title}</h3>
          {hint ? <p className="mt-0.5 text-xs text-[var(--muted)]">{hint}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

function HeaderTab({ content, set, setField }) {
  const h = content.header;
  return (
    <Card title="Header Configuration" hint="Customize Logo branding and navbar links.">
      <Field label="Logo Title Text" value={h.logoText} onChange={(v) => setField("logoText", v)} />
      <div className="mt-2">
        <ListEditor
          title="Branding / Navigation Links"
          itemLabel="Navigation Link"
          items={h.links}
          onChange={(v) => set(["header", "links"], v)}
          makeEmpty={() => ({ label: "", href: "#gallery" })}
          renderItem={(item, on) => (
            <Grid>
              <Field label="Label" value={item.label} onChange={(v) => on({ ...item, label: v })} />
              <Field label="Link (href)" value={item.href} onChange={(v) => on({ ...item, href: v })} />
            </Grid>
          )}
        />
      </div>
    </Card>
  );
}

function HeroTab({ content, set, setField }) {
  const hero = content.hero;
  return (
    <>
      <Card title="Hero Text & Search Fields" hint="Branding headline details.">
        <Field label="Title Headline (H1)" value={hero.title} onChange={(v) => setField("title", v)} />
        <TextArea label="Subtext / Paragraph" value={hero.subtext} onChange={(v) => setField("subtext", v)} />
        <Field label="Search Box Placeholder" value={hero.searchPlaceholder} onChange={(v) => setField("searchPlaceholder", v)} />
      </Card>

      <Card title="Slider Carousel Elements" hint="Cards displayed sequentially on the left.">
        <ListEditor
          itemLabel="Slide Info"
          items={hero.slides}
          onChange={(v) => set(["hero", "slides"], v)}
          makeEmpty={() => ({ title: "", body: "", image: "" })}
          renderItem={(item, on) => (
            <>
              <Grid>
                <Field label="Title" value={item.title} onChange={(v) => on({ ...item, title: v })} />
                <Field label="Description Body" value={item.body} onChange={(v) => on({ ...item, body: v })} />
              </Grid>
              <ImageField label="Slide Image" value={item.image} onChange={(v) => on({ ...item, image: v })} content={content} />
            </>
          )}
        />
      </Card>
    </>
  );
}

function EffectsTab({ content, set }) {
  const eff = content.effects;
  return (
    <Card title="Homepage Interactive Effects" hint="Control default behaviors of mischievous scripts.">
      <ToggleField
        label="Scroll Sounds"
        value={eff.scrollSounds}
        onChange={(v) => set(["effects", "scrollSounds"], v)}
        desc="Generate synthesized blips when scrolling the viewport."
      />
      <ToggleField
        label="Title Glitcher & Synth sweeps"
        value={eff.glitchTitle}
        onChange={(v) => set(["effects", "glitchTitle"], v)}
        desc="Cycle browser page title through dynamic values and run synth sweeps."
      />
      <ToggleField
        label="Insects (Mosquito Flight)"
        value={eff.insects}
        onChange={(v) => set(["effects", "insects"], v)}
        desc="Display and loop a flying mosquito overlay bug on the homepage."
      />
      <ToggleField
        label="Welcome Dialog Popup"
        value={eff.welcomePopup}
        onChange={(v) => set(["effects", "welcomePopup"], v)}
        desc="Prompt users with the start welcome overlay banner upon loading."
      />
    </Card>
  );
}

function TilesTab({ content, set }) {
  return (
    <Card title="Pranks Directory Tiles" hint="Rearrange gallery items or customize their cards.">
      <ListEditor
        itemLabel="Prank Tile"
        items={content.tiles}
        onChange={(v) => set(["tiles"], v)}
        makeEmpty={() => ({ title: "", slug: "", badge: "", enabled: true, image: "" })}
        renderItem={(item, on) => (
          <>
            <Grid>
              <Field label="Prank Title" value={item.title} onChange={(v) => on({ ...item, title: v })} />
              <Field label="Identifier Slug" value={item.slug} onChange={(v) => on({ ...item, slug: v })} />
            </Grid>
            <Grid>
              <Field label="Badge (e.g. 'New', 'Updated')" value={item.badge} onChange={(v) => on({ ...item, badge: v })} />
              <div className="pt-2">
                <ToggleField
                  label="Enabled / Visible"
                  value={item.enabled !== false}
                  onChange={(v) => on({ ...item, enabled: v })}
                />
              </div>
            </Grid>
            <ImageField
              label="Custom Card Image (Optional)"
              value={item.image || ""}
              onChange={(v) => on({ ...item, image: v })}
              content={content}
              fallbackUrl={getPrankDefaultImage(item.slug)}
            />
          </>
        )}
      />
    </Card>
  );
}

function InstructionsTab({ content, set, setField }) {
  const inst = content.instructions;
  return (
    <Card title="User Instructions Guide" hint="Static directions block at the bottom of the page.">
      <Field label="Block Title" value={inst.title} onChange={(v) => setField("title", v)} />
      <TextArea label="Description Body" value={inst.body} onChange={(v) => setField("body", v)} />
      <ImageField label="Instruction Banner" value={inst.image} onChange={(v) => setField("image", v)} content={content} />
      <Field label="Steps List Header" value={inst.stepsTitle} onChange={(v) => setField("stepsTitle", v)} />
      <div className="mt-2">
        <ListEditor
          title="Sequential Steps"
          itemLabel="Step Line"
          items={inst.steps}
          onChange={(v) => set(["instructions", "steps"], v)}
          makeEmpty={() => ""}
          renderItem={(item, on) => <TextArea label="" value={item} onChange={on} rows={2} />}
        />
      </div>
    </Card>
  );
}

function FooterTab({ content, setField }) {
  const f = content.footer;
  return (
    <Card title="Footer Layout" hint="Disclaimer text and licensing info.">
      <TextArea label="Legal Warning / Disclaimer" value={f.disclaimer} onChange={(v) => setField("disclaimer", v)} rows={4} />
      <Field label="Copyright Notice" value={f.copyright} onChange={(v) => setField("copyright", v)} />
    </Card>
  );
}

// Web Audio API Synthesizer helpers for local audio testing in admin
function getAdminAudioContext() {
  if (typeof window === "undefined") return null;
  const BrowserAudioContext = window.AudioContext || window.webkitAudioContext;
  if (!BrowserAudioContext) return null;
  if (!window.__adminAudioContext) {
    window.__adminAudioContext = new BrowserAudioContext();
  }
  const context = window.__adminAudioContext;
  if (context.state === "suspended") {
    context.resume().catch(() => { });
  }
  return context;
}

function playSynthTone({ frequency = 440, endFrequency, type = "sine", gain = 0.04, duration = 0.12, delay = 0 }) {
  try {
    const context = getAdminAudioContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    const start = context.currentTime + delay;
    const end = start + duration;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(20, frequency), start);
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), end);
    }
    volume.gain.setValueAtTime(0.0001, start);
    volume.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    volume.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(volume);
    volume.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  } catch { }
}

function playSynthNoise({ gain = 0.035, duration = 0.12, filter = 1800, delay = 0 }) {
  try {
    const context = getAdminAudioContext();
    if (!context) return;
    const sampleRate = context.sampleRate;
    const frameCount = Math.max(1, Math.floor(sampleRate * duration));
    const buffer = context.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frameCount);
    }
    const source = context.createBufferSource();
    const band = context.createBiquadFilter();
    const volume = context.createGain();
    const start = context.currentTime + delay;
    const end = start + duration;
    band.type = "bandpass";
    band.frequency.setValueAtTime(filter, start);
    band.Q.setValueAtTime(6, start);
    volume.gain.setValueAtTime(0.0001, start);
    volume.gain.exponentialRampToValueAtTime(gain, start + 0.01);
    volume.gain.exponentialRampToValueAtTime(0.0001, end);
    source.buffer = buffer;
    source.connect(band);
    band.connect(volume);
    volume.connect(context.destination);
    source.start(start);
    source.stop(end + 0.02);
  } catch { }
}

function playAdminPranxSound(kind, seed = 0) {
  const pitch = Math.abs(seed) % 480;
  if (kind === "scroll") {
    playSynthTone({ type: "square", frequency: 180 + pitch, endFrequency: 260 + pitch, duration: 0.045, gain: 0.018 });
  } else if (kind === "glitch") {
    playSynthNoise({ filter: 1300 + pitch, duration: 0.1, gain: 0.03 });
    playSynthTone({ type: "sawtooth", frequency: 140 + pitch / 5, endFrequency: 720 + pitch / 3, duration: 0.12, gain: 0.022 });
  } else if (kind === "jurassic-alert") {
    playSynthNoise({ filter: 900 + pitch, duration: 0.16, gain: 0.045 });
    playSynthTone({ type: "square", frequency: 520, endFrequency: 390, duration: 0.18, gain: 0.04 });
    playSynthTone({ type: "sawtooth", frequency: 260, endFrequency: 720, duration: 0.2, gain: 0.026, delay: 0.16 });
    playSynthTone({ type: "square", frequency: 610, endFrequency: 450, duration: 0.14, gain: 0.032, delay: 0.36 });
  } else if (kind === "mosquito") {
    playSynthTone({ type: "sine", frequency: 720, endFrequency: 980, duration: 0.18, gain: 0.016 });
    playSynthTone({ type: "triangle", frequency: 940, endFrequency: 690, duration: 0.18, gain: 0.012, delay: 0.16 });
  } else if (kind === "welcome") {
    playSynthTone({ type: "sine", frequency: 523.25, duration: 0.13, gain: 0.035 });
    playSynthTone({ type: "sine", frequency: 659.25, duration: 0.13, gain: 0.032, delay: 0.1 });
    playSynthTone({ type: "sine", frequency: 783.99, duration: 0.18, gain: 0.03, delay: 0.2 });
  } else if (kind === "joke") {
    playSynthTone({ type: "triangle", frequency: 330, endFrequency: 520, duration: 0.08, gain: 0.03 });
    playSynthTone({ type: "square", frequency: 760, duration: 0.045, gain: 0.018, delay: 0.07 });
  } else if (kind === "toggle-off") {
    playSynthTone({ type: "triangle", frequency: 420, endFrequency: 220, duration: 0.1, gain: 0.026 });
  } else {
    playSynthTone({ type: "triangle", frequency: 520, endFrequency: 760, duration: 0.1, gain: 0.028 });
    playSynthTone({ type: "sine", frequency: 880, duration: 0.08, gain: 0.022, delay: 0.08 });
  }
}

function AudioPreview({ label, src }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(getImageUrl(src));
      audioRef.current.loop = true;
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch((err) => alert("Audio play blocked by browser: " + err.message));
      setPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="min-w-0 pr-4">
        <p className="text-sm font-bold text-[var(--foreground)]">{label}</p>
        <p className="text-[10px] text-[var(--muted)] truncate" title={src}>{src}</p>
      </div>
      <button
        type="button"
        onClick={toggle}
        className={`rounded-lg px-4 py-2 text-xs font-bold transition whitespace-nowrap ${playing
          ? "bg-red-500 text-white hover:bg-red-650"
          : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
          }`}
      >
        {playing ? "Stop" : "Play Loop"}
      </button>
    </div>
  );
}

function SynthPreview({ label, kind }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="min-w-0 pr-4">
        <p className="text-sm font-bold text-[var(--foreground)]">{label}</p>
        <p className="text-[10px] text-[var(--muted)] uppercase font-semibold">Web Audio Synthesizer</p>
      </div>
      <button
        type="button"
        onClick={() => playAdminPranxSound(kind)}
        className="rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 text-xs font-bold transition hover:opacity-90"
      >
        Play Preview
      </button>
    </div>
  );
}

function MediaTab({ content }) {
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("all-images");

  const dynamicImages = content ? extractImagesFromContent(content) : [];

  const soundTracks = [
    { label: "Ambient Forest Track", src: "/sounds/forest.mp3" },
    { label: "Ambient Ocean Track", src: "/sounds/ocean.mp3" },
    { label: "Ambient Rain Track", src: "/sounds/rain.mp3" },
  ];

  const synthSounds = [
    { label: "Viewport Scroll Sound", kind: "scroll" },
    { label: "Glitch Sweep Noise", kind: "glitch" },
    { label: "Mosquito Buzzing", kind: "mosquito" },
    { label: "Welcome Popup Chimes", kind: "welcome" },
    { label: "Prank Card Hover/Click", kind: "joke" },
    { label: "Jurassic Siren Alarm", kind: "jurassic-alert" },
    { label: "System Error Sound", kind: "error" },
  ];

  const imageCategories = [
    { id: "all-images", label: `Local Assets (${GENERAL_ASSETS.length + SLIDER_BACKGROUNDS.length + THUMBNAILS.length})` },
    ...(dynamicImages.length > 0 ? [{ id: "active-site", label: `Active on Site (${dynamicImages.length})` }] : []),
  ];

  const renderImages = () => {
    if (activeSubTab === "active-site") {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {dynamicImages.map((img) => (
            <div
              key={img.path}
              onClick={() => setLightboxSrc(img.path)}
              className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden cursor-zoom-in hover:border-[var(--primary)] transition hover:shadow-md text-left"
            >
              <div className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden border-b border-[var(--border)]">
                <img
                  src={getImageUrl(img.path)}
                  alt={img.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ZoomIn className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-bold text-[var(--foreground)]">{img.name}</p>
                <p className="truncate text-[10px] text-[var(--muted)] mt-0.5" title={img.path}>{img.path}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--muted)] mb-3">General Brand Assets</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {GENERAL_ASSETS.map((img) => (
              <div
                key={img.path}
                onClick={() => setLightboxSrc(img.path)}
                className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden cursor-zoom-in hover:border-[var(--primary)] transition hover:shadow-md text-left"
              >
                <div className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden border-b border-[var(--border)]">
                  <img
                    src={getImageUrl(img.path)}
                    alt={img.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-bold text-[var(--foreground)]">{img.name}</p>
                  <p className="truncate text-[10px] text-[var(--muted)] mt-0.5" title={img.path}>{img.path}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--muted)] mb-3">Slider Carousel Backgrounds</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {SLIDER_BACKGROUNDS.map((img) => (
              <div
                key={img.path}
                onClick={() => setLightboxSrc(img.path)}
                className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden cursor-zoom-in hover:border-[var(--primary)] transition hover:shadow-md text-left"
              >
                <div className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden border-b border-[var(--border)]">
                  <img
                    src={getImageUrl(img.path)}
                    alt={img.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-bold text-[var(--foreground)]">{img.name}</p>
                  <p className="truncate text-[10px] text-[var(--muted)] mt-0.5" title={img.path}>{img.path}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--muted)] mb-3">Simulator Gallery Thumbnails</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {THUMBNAILS.map((img) => (
              <div
                key={img.path}
                onClick={() => setLightboxSrc(img.path)}
                className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden cursor-zoom-in hover:border-[var(--primary)] transition hover:shadow-md text-left"
              >
                <div className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden border-b border-[var(--border)]">
                  <img
                    src={getImageUrl(img.path)}
                    alt={img.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-bold text-[var(--foreground)]">{img.name}</p>
                  <p className="truncate text-[10px] text-[var(--muted)] mt-0.5" title={img.path}>{img.path}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card title="Standalone Audio Explorer" hint="Play looped ambient tracks or trigger synthesised game audio effects.">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--muted)] mb-3">Ambient Audio Tracks</h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {soundTracks.map((track) => (
            <AudioPreview key={track.src} label={track.label} src={track.src} />
          ))}
        </div>

        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--muted)] mb-3">Synthesised Audio Effects</h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {synthSounds.map((sound) => (
            <SynthPreview key={sound.kind} label={sound.label} kind={sound.kind} />
          ))}
        </div>
      </Card>

      <Card title="Image Assets Explorer" hint="View full-size previews of static visual assets and active storage uploads.">
        {/* Sub tabs */}
        <div className="flex gap-1 border-b border-[var(--border)] pb-3 mb-5 overflow-x-auto">
          {imageCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveSubTab(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${activeSubTab === cat.id
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {renderImages()}
      </Card>

      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}
