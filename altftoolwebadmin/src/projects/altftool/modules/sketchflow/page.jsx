"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, RotateCcw, Save } from "lucide-react";

import { emitAlert } from "@/lib/alertBus";
import { ALL_TOOLS, DEFAULT_HOME_CONTENT, fetchHome, saveHome } from "./service/sketchflow.service";
import { Field, Grid, IconSelect, ImageField, ListEditor, TextArea } from "./components/fields";

const TABS = [
  { key: "branding", label: "Branding" },
  { key: "tools", label: "Toolbar" },
  { key: "defaults", label: "Defaults" },
  { key: "ui", label: "UI Copy" },
  { key: "seo", label: "SEO" },
  { key: "settings", label: "Settings" },
];

function deepMerge(base, override) {
  if (Array.isArray(base)) return Array.isArray(override) ? override : base;
  if (base && typeof base === "object") {
    const out = { ...base };
    const src = override && typeof override === "object" ? override : {};
    // Iterate base keys so ALL default fields are always populated, even when
    // Firestore doesn't yet have a key added in a newer version of the defaults.
    for (const key of Object.keys(base)) out[key] = deepMerge(base[key], src[key]);
    return out;
  }
  return override === undefined || override === null ? base : override;
}

const clone = (value) => JSON.parse(JSON.stringify(value));

export default function SketchFlowModule() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState("branding");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await fetchHome();
        if (active) setContent(deepMerge(DEFAULT_HOME_CONTENT, stored || {}));
      } catch (err) {
        if (active) {
          setContent(clone(DEFAULT_HOME_CONTENT));
          emitAlert({ type: "error", title: "Load failed", message: err?.message || "Showing defaults." });
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
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
      await saveHome(content);
      setDirty(false);
      emitAlert({ type: "success", title: "Saved", message: "Refresh the site to see your changes." });
    } catch (err) {
      emitAlert({ type: "error", title: "Save failed", message: err?.message || "Could not save." });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all fields to the original defaults? (Nothing is saved until you click Save.)")) {
      setContent(clone(DEFAULT_HOME_CONTENT));
      setDirty(true);
    }
  };

  if (loading || !content) {
    return (
      <div className="flex items-center gap-2.5 p-10 text-sm text-[var(--muted)]">
        <Loader2 size={18} className="animate-spin" /> Loading SketchFlow content…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold text-[var(--foreground)] sm:text-xl">
              SketchFlow · Home Page
            </h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Edit every configurable part of <code className="rounded bg-[var(--surface-soft)] px-1 py-0.5">/sketchflow</code>. Changes go live on the next refresh.
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

        <div className="mt-3 -mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-t-lg border-b-2 px-3.5 py-2 text-sm font-semibold transition ${
                tab === t.key
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "branding" && <BrandingTab content={content} setField={sectionSetter("branding")} />}
      {tab === "tools" && <ToolsTab content={content} set={set} />}
      {tab === "defaults" && <DefaultsTab content={content} set={set} setField={sectionSetter("defaults")} />}
      {tab === "ui" && <UiTab content={content} setField={sectionSetter("ui")} />}
      {tab === "seo" && <SeoTab content={content} setField={sectionSetter("seo")} />}
      {tab === "settings" && <SettingsTab content={content} setField={sectionSetter("settings")} />}
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

function BrandingTab({ content, setField }) {
  const b = content.branding;
  return (
    <Card title="Branding" hint="App name, tagline, accent color, and logo icon shown in the top bar.">
      <Field label="App name" value={b.appName} onChange={(v) => setField("appName", v)} />
      <Field label="Tagline" value={b.tagline} onChange={(v) => setField("tagline", v)} />
      <Grid>
        <Field label="Accent color" value={b.accentColor} onChange={(v) => setField("accentColor", v)} placeholder="#6965db" />
        <IconSelect label="Brand icon" value={b.brandIconKey} onChange={(v) => setField("brandIconKey", v)} />
      </Grid>
    </Card>
  );
}

function ToolsTab({ content, set }) {
  const items = content.tools?.items || ALL_TOOLS;

  // Ensure `items` always contains every tool from ALL_TOOLS so the toggle
  // checkboxes are never out of sync with what gets saved. Missing tools are
  // added back with their default (enabled: true) before the toggle is applied.
  const normaliseItems = (sourceItems) => {
    const byId = Object.fromEntries(sourceItems.map((t) => [t.id, t]));
    return ALL_TOOLS.map((defaultTool) => byId[defaultTool.id] || { ...defaultTool });
  };

  const handleToggle = (id, enabled) => {
    const normalised = normaliseItems(items);
    set(
      ["tools", "items"],
      normalised.map((tool) => (tool.id === id ? { ...tool, enabled } : tool)),
    );
  };

  return (
    <>
      <Card title="Toolbar visibility" hint="Enable or disable tools. Disabled tools disappear from the left toolbar and command palette.">
        <div className="grid gap-3 sm:grid-cols-2">
          {ALL_TOOLS.map((defaultTool) => {
            const tool = items.find((item) => item.id === defaultTool.id) || defaultTool;
            const isEnabled = tool.enabled !== false;
            return (
              <div
                key={defaultTool.id}
                className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition hover:border-[color:var(--primary)]/30"
              >
                <div>
                  <h4 className="text-sm font-bold text-[var(--foreground)]">{tool.label || defaultTool.label}</h4>
                  <p className="text-xs text-[var(--muted)]">{tool.id} · shortcut {tool.shortcut || defaultTool.shortcut}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(tool.id, !isEnabled)}
                  className="flex items-center"
                  aria-label={isEnabled ? `Disable ${tool.label}` : `Enable ${tool.label}`}
                >
                  <div className={`flex h-5 w-5 items-center justify-center rounded-[6px] border transition-all ${isEnabled ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)] group-hover:border-gray-400"}`}>
                    {isEnabled && <Check className="h-3.5 w-3.5" />}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Tool labels & shortcuts" hint="Customize how each tool appears in the toolbar.">
        <ListEditor
          itemLabel="Tool"
          items={items}
          onChange={(v) => set(["tools", "items"], v)}
          makeEmpty={() => ({ id: "select", label: "Selection", shortcut: "V", enabled: true })}
          renderItem={(item, on) => (
            <Grid>
              <Field label="Tool ID" value={item.id} onChange={(v) => on({ ...item, id: v })} />
              <Field label="Label" value={item.label} onChange={(v) => on({ ...item, label: v })} />
              <Field label="Shortcut key" value={item.shortcut} onChange={(v) => on({ ...item, shortcut: v.toUpperCase() })} />
            </Grid>
          )}
        />
      </Card>
    </>
  );
}

function DefaultsTab({ content, set, setField }) {
  const d = content.defaults;
  return (
    <>
      <Card title="Stroke & fill" hint="Default style applied to new elements on the canvas.">
        <Grid>
          <Field label="Stroke color" value={d.strokeColor} onChange={(v) => setField("strokeColor", v)} />
          <Field label="Background color" value={d.backgroundColor} onChange={(v) => setField("backgroundColor", v)} />
          <Field label="Fill style" value={d.fillStyle} onChange={(v) => setField("fillStyle", v)} placeholder="hachure, solid, cross-hatch…" />
          <Field label="Stroke width" value={d.strokeWidth} onChange={(v) => setField("strokeWidth", Number(v) || 0)} />
          <Field label="Stroke style" value={d.strokeStyle} onChange={(v) => setField("strokeStyle", v)} placeholder="solid, dashed, dotted" />
          <Field label="Roughness" value={d.roughness} onChange={(v) => setField("roughness", Number(v) || 0)} />
          <Field label="Opacity (%)" value={d.opacity} onChange={(v) => setField("opacity", Number(v) || 0)} />
        </Grid>
      </Card>

      <Card title="Text" hint="Default font settings for new text elements.">
        <Grid>
          <Field label="Font size" value={d.fontSize} onChange={(v) => setField("fontSize", Number(v) || 0)} />
          <Field label="Text align" value={d.textAlign} onChange={(v) => setField("textAlign", v)} placeholder="left, center, right" />
        </Grid>
        <Field label="Font family" value={d.fontFamily} onChange={(v) => setField("fontFamily", v)} />
        <ListEditor
          title="Font options (properties panel dropdown)"
          itemLabel="Font"
          items={d.fontOptions || []}
          onChange={(v) => set(["defaults", "fontOptions"], v)}
          makeEmpty={() => "system-ui, sans-serif"}
          renderItem={(item, on) => <Field label="" value={item} onChange={on} />}
        />
      </Card>

      <Card title="Arrows" hint="Default arrowhead settings for new arrow elements.">
        <Grid>
          <Field label="Arrow type" value={d.arrowType} onChange={(v) => setField("arrowType", v)} placeholder="straight, curved" />
          <Field label="Start arrowhead" value={d.startArrowhead} onChange={(v) => setField("startArrowhead", v)} placeholder="none, arrow, dot…" />
          <Field label="End arrowhead" value={d.endArrowhead} onChange={(v) => setField("endArrowhead", v)} placeholder="triangle, arrow, dot…" />
        </Grid>
      </Card>
    </>
  );
}

function UiTab({ content, setField }) {
  const ui = content.ui;
  return (
    <Card title="UI copy & assets" hint="Labels and assets used inside the canvas app.">
      <Field label="Command palette placeholder" value={ui.commandPalettePlaceholder} onChange={(v) => setField("commandPalettePlaceholder", v)} />
      <Field label="Properties panel title" value={ui.propertiesTitle} onChange={(v) => setField("propertiesTitle", v)} />
      <Field label="Export file prefix" value={ui.exportFilePrefix} onChange={(v) => setField("exportFilePrefix", v)} placeholder="sketchflow" />
      <Field label="Google Font URL" value={ui.googleFontUrl} onChange={(v) => setField("googleFontUrl", v)} placeholder="https://fonts.googleapis.com/..." />
    </Card>
  );
}

function SeoTab({ content, setField }) {
  const seo = content.seo;
  return (
    <Card title="SEO & social sharing" hint="Meta tags for search engines and Open Graph previews.">
      <Field label="Meta title" value={seo.metaTitle} onChange={(v) => setField("metaTitle", v)} />
      <TextArea label="Meta description" value={seo.metaDescription} onChange={(v) => setField("metaDescription", v)} rows={3} />
      <TextArea label="Keywords (comma separated)" value={seo.keywords} onChange={(v) => setField("keywords", v)} rows={2} />
      <Grid>
        <Field label="OpenGraph title" value={seo.ogTitle} onChange={(v) => setField("ogTitle", v)} />
        <Field label="OpenGraph description" value={seo.ogDescription} onChange={(v) => setField("ogDescription", v)} />
      </Grid>
      <ImageField label="OpenGraph image" value={seo.ogImage} onChange={(v) => setField("ogImage", v)} />
    </Card>
  );
}

function SettingsTab({ content, setField }) {
  const settings = content.settings;
  const camera = settings.cameraDefault || { x: 420, y: 240, zoom: 1 };
  return (
    <Card title="App settings" hint="Canvas behavior, camera defaults, and advanced overrides.">
      <div className="mb-4 flex items-center gap-3">
        <input
          type="checkbox"
          id="gridEnabled"
          checked={Boolean(settings.gridEnabled)}
          onChange={(e) => setField("gridEnabled", e.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
        />
        <label htmlFor="gridEnabled" className="text-sm font-medium text-[var(--foreground)]">
          Enable grid by default
        </label>
      </div>
      <Grid>
        <Field label="Grid step (px)" value={settings.gridStep} onChange={(v) => setField("gridStep", Number(v) || 0)} />
        <Field label="History limit" value={settings.historyLimit} onChange={(v) => setField("historyLimit", Number(v) || 0)} />
        <Field label="Autosave interval (ms)" value={settings.autosaveIntervalMs} onChange={(v) => setField("autosaveIntervalMs", Number(v) || 0)} />
      </Grid>
      <div className="mb-4 flex items-center gap-3">
        <input
          type="checkbox"
          id="darkModeDefault"
          checked={Boolean(settings.darkModeDefault)}
          onChange={(e) => setField("darkModeDefault", e.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
        />
        <label htmlFor="darkModeDefault" className="text-sm font-medium text-[var(--foreground)]">
          Dark mode by default
        </label>
      </div>
      <div className="mb-4 flex items-center gap-3">
        <input
          type="checkbox"
          id="includeBackgroundDefault"
          checked={Boolean(settings.includeBackgroundDefault)}
          onChange={(e) => setField("includeBackgroundDefault", e.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
        />
        <label htmlFor="includeBackgroundDefault" className="text-sm font-medium text-[var(--foreground)]">
          Include background in PNG export by default
        </label>
      </div>
      <Field label="localStorage key" value={settings.storageKey} onChange={(v) => setField("storageKey", v)} placeholder="altftool-sketchflow-scene-v1" />
      <Grid>
        <Field label="Camera X" value={camera.x} onChange={(v) => setField("cameraDefault", { ...camera, x: Number(v) || 0 })} />
        <Field label="Camera Y" value={camera.y} onChange={(v) => setField("cameraDefault", { ...camera, y: Number(v) || 0 })} />
        <Field label="Camera zoom" value={camera.zoom} onChange={(v) => setField("cameraDefault", { ...camera, zoom: Number(v) || 1 })} />
      </Grid>
      <TextArea
        label="Custom JSON (advanced)"
        value={JSON.stringify(settings.customJson ?? {}, null, 2)}
        onChange={(v) => {
          try {
            setField("customJson", JSON.parse(v));
          } catch {
            // ignore invalid JSON during typing
          }
        }}
        rows={6}
        placeholder="{}"
      />
      <p className="mt-1 text-xs text-[var(--muted)]">Must be valid JSON. Merged into runtime settings on the frontend.</p>
    </Card>
  );
}
