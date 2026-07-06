"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { saveAutomationSettings } from "../services/automationService";
import { PanelCard, PrimaryButton } from "./shared";

function Toggle({ label, caption, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-border bg-surface-soft/60 p-3">
      <span>
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        {caption ? <span className="mt-0.5 block text-xs leading-5 text-muted">{caption}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
      />
    </label>
  );
}

function NumberField({ label, value, onChange, min = 0, max = 100 }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
      />
    </label>
  );
}

const PROVIDER_OPTIONS = [
  { value: "openai", label: "OpenAI (default)" },
  { value: "gemini", label: "Google Gemini" },
  { value: "claude", label: "Anthropic Claude (needs key)" },
  { value: "deepseek", label: "DeepSeek (needs key)" },
];

const MODEL_HINTS = {
  openai: "gpt-4o",
  gemini: "gemini-2.5-flash",
  claude: "claude-sonnet-5",
  deepseek: "deepseek-chat",
};

function ProviderFields({ lane, form, patch }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">AI provider</span>
        <select
          value={form[lane].provider || "openai"}
          onChange={(e) => {
            patch(lane, "provider", e.target.value);
            patch(lane, "model", MODEL_HINTS[e.target.value] || "");
          }}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        >
          {PROVIDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">Model</span>
        <input
          type="text"
          value={form[lane].model || ""}
          onChange={(e) => patch(lane, "model", e.target.value.trim())}
          placeholder={MODEL_HINTS[form[lane].provider] || "gpt-4o"}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
        />
      </label>
    </div>
  );
}

export default function SettingsPanel({ settings, onSaved }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const patch = (lane, key, value) =>
    setForm((prev) => ({ ...prev, [lane]: { ...prev[lane], [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAutomationSettings(form);
      emitAlert({ type: "success", message: "Automation settings saved." });
      onSaved();
    } catch (error) {
      emitAlert({ type: "error", message: String(error?.message || error) });
    } finally {
      setSaving(false);
    }
  };

  if (!form) return null;

  return (
    <div className="space-y-5">
      <PanelCard
        title="Blog lane"
        caption="AI drafts from the topic queue. Always lands as Draft → In review — never auto-publishes."
      >
        <div className="space-y-3">
          <Toggle
            label="Enable blog generation"
            caption="Hourly cron picks pending topics while the daily limit allows."
            checked={form.blog.enabled}
            onChange={(v) => patch("blog", "enabled", v)}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField label="Daily limit" value={form.blog.dailyLimit} min={1} max={50} onChange={(v) => patch("blog", "dailyLimit", v)} />
            <NumberField label="Per run" value={form.blog.perRun} min={1} max={10} onChange={(v) => patch("blog", "perRun", v)} />
            <NumberField label="Min quality score" value={form.blog.minQualityScore} min={50} max={95} onChange={(v) => patch("blog", "minQualityScore", v)} />
          </div>
          <ProviderFields lane="blog" form={form} patch={patch} />
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">Default author</span>
            <input
              type="text"
              value={form.blog.defaultAuthor}
              onChange={(e) => patch("blog", "defaultAuthor", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </label>
        </div>
      </PanelCard>

      <PanelCard
        title="SEO lane"
        caption="Page-wise metadata + JSON-LD proposals. Applied only when you approve — never writes the config directly."
      >
        <div className="space-y-3">
          <Toggle
            label="Enable SEO proposals"
            caption="Priority: missing metadata, striking-distance GSC pages, pages without overrides."
            checked={form.seo.enabled}
            onChange={(v) => patch("seo", "enabled", v)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Daily page limit" value={form.seo.dailyPageLimit} min={1} max={100} onChange={(v) => patch("seo", "dailyPageLimit", v)} />
            <NumberField label="Per run" value={form.seo.perRun} min={1} max={25} onChange={(v) => patch("seo", "perRun", v)} />
          </div>
          <ProviderFields lane="seo" form={form} patch={patch} />
        </div>
      </PanelCard>

      <PanelCard title="Trending lane" caption="Files rising Search Console queries as blog topic suggestions.">
        <div className="space-y-3">
          <Toggle
            label="Enable trending scans"
            caption="Requires the Search Console connection on the SEO screen."
            checked={form.trending.enabled}
            onChange={(v) => patch("trending", "enabled", v)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Lookback days" value={form.trending.gscLookbackDays} min={7} max={28} onChange={(v) => patch("trending", "gscLookbackDays", v)} />
            <NumberField label="Max suggestions / run" value={form.trending.maxSuggestionsPerRun} min={1} max={25} onChange={(v) => patch("trending", "maxSuggestionsPerRun", v)} />
          </div>
        </div>
      </PanelCard>

      <PanelCard
        title="Safety limits"
        caption="Hard stop across all lanes — once today's estimated OpenAI spend hits the cap, generation skips until tomorrow (UTC)."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField
            label="Daily cost cap (USD)"
            value={form.limits?.dailyCostCapUsd ?? 10}
            min={1}
            max={100}
            onChange={(v) => patch("limits", "dailyCostCapUsd", v)}
          />
        </div>
      </PanelCard>

      <div className="flex justify-end">
        <PrimaryButton onClick={handleSave} disabled={saving}>
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving…" : "Save settings"}
        </PrimaryButton>
      </div>
    </div>
  );
}
