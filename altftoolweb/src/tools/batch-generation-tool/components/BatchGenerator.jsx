"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import Header from "./Header";
import { batchGenerationConfig } from "../config/batchGenerationConfig";
import {
  MAX_QUANTITY,
  STORAGE_KEY,
  buildCsv,
  buildOutputs,
  buildTxt,
  downloadBlob,
  formatBytes,
  initialConfig,
  initialField,
  initialFilters,
  loadWorkspace,
  makeId,
  normalizeKey,
  slugify,
  validateConfig,
} from "../utils/generationHelpers";
import {
  Activity,
  AlertTriangle,
  Archive,
  Copy,
  Database,
  Download,
  FileArchive,
  FileText,
  Filter,
  Layers3,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Wand2,
  X,
  Zap,
} from "lucide-react";

export default function BatchGenerationTool() {
  const { labels, messages, placeholders, workflowModes, sortOptions, tokens } = batchGenerationConfig;
  const [workspaceLoaded] = useState(loadWorkspace);
  const [config, setConfig] = useState(workspaceLoaded.config);
  const [fields, setFields] = useState(workspaceLoaded.fields);
  const [templates, setTemplates] = useState(workspaceLoaded.templates);
  const [history, setHistory] = useState(workspaceLoaded.history);
  const [filters, setFilters] = useState(initialFilters);
  const [message, setMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const messageTimer = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ config, fields, templates, history }));
  }, [config, fields, templates, history]);

  const errors = useMemo(() => validateConfig(config, fields), [config, fields]);
  const outputs = useMemo(() => buildOutputs(config, fields), [config, fields]);
  const generated = outputs.filter((item) => item.status === batchGenerationConfig.statuses.generated);
  const failed = outputs.filter((item) => item.status === batchGenerationConfig.statuses.failed);
  const pending = Math.max(0, Number(config.quantity || 0) - generated.length - failed.length);
  const totalBytes = outputs.reduce((sum, item) => sum + item.bytes, 0);
  const successRate = outputs.length ? Math.round((generated.length / outputs.length) * 100) : 0;
  const exportReady = outputs.length > 0 && errors.length === 0 && failed.length === 0;
  const generationSpeed = outputs.length ? `${outputs.length}/tick` : "0/tick";

  const filteredHistory = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return history
      .filter((batch) => {
        const text = `${batch.name} ${batch.type} ${batch.category} ${batch.purpose}`.toLowerCase();
        return (!query || text.includes(query)) && (filters.type === batchGenerationConfig.baseHistoryType || batch.type === filters.type);
      })
      .sort((a, b) => {
        if (filters.sort === "name") return a.name.localeCompare(b.name);
        if (filters.sort === "quantity") return b.quantity - a.quantity;
        return String(b.savedAt).localeCompare(String(a.savedAt));
      });
  }, [filters, history]);

  const historyTypes = useMemo(() => [batchGenerationConfig.baseHistoryType, ...Array.from(new Set(history.map((item) => item.type).filter(Boolean)))], [history]);

  function notify(text) {
    setMessage(text);
    clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(""), batchGenerationConfig.messageTimeout);
  }

  function updateConfig(key, value) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function addField() {
    setFields((current) => [...current, { ...initialField, id: makeId() }]);
  }

  function updateField(id, patch) {
    setFields((current) =>
      current.map((field) => {
        if (field.id !== id) return field;
        const next = { ...field, ...patch };
        if (patch.label !== undefined && !field.key.trim()) next.key = normalizeKey(patch.label);
        if (patch.key !== undefined) next.key = normalizeKey(patch.key);
        return next;
      }),
    );
  }

  function saveTemplate() {
    if (!config.template.trim()) return notify(messages.templateContentRequired);
    const template = {
      id: makeId(),
      name: config.name.trim() || `${batchGenerationConfig.defaultTemplateNamePrefix} ${templates.length + 1}`,
      type: config.type.trim(),
      category: config.category.trim(),
      purpose: config.purpose.trim(),
      template: config.template,
      namingPattern: config.namingPattern,
      fields: fields.map(({ id, ...field }) => ({ ...field, id: makeId() })),
      savedAt: new Date().toISOString(),
    };
    setTemplates((current) => [template, ...current].slice(0, batchGenerationConfig.templateHistoryLimit));
    notify(messages.templateSaved);
  }

  function loadTemplate(template) {
    setConfig((current) => ({
      ...current,
      type: template.type || current.type,
      category: template.category || current.category,
      purpose: template.purpose || current.purpose,
      template: template.template,
      namingPattern: template.namingPattern,
    }));
    setFields(template.fields || []);
    notify(messages.templateLoaded);
  }

  function saveBatch() {
    if (errors.length) return notify(errors[0]);
    const snapshot = {
      id: makeId(),
      name: config.name.trim(),
      type: config.type.trim(),
      category: config.category.trim(),
      purpose: config.purpose.trim(),
      quantity: outputs.length,
      generated: generated.length,
      failed: failed.length,
      config,
      fields,
      outputs,
      savedAt: new Date().toISOString(),
    };
    setHistory((current) => [snapshot, ...current].slice(0, batchGenerationConfig.batchHistoryLimit));
    notify(messages.batchSaved);
  }

  function loadBatch(batch) {
    setConfig({ ...initialConfig, ...batch.config });
    setFields(batch.fields || []);
    notify(messages.batchRestored);
  }

  function resetWorkspace() {
    setConfig(initialConfig);
    setFields([]);
    notify(messages.workspaceReset);
  }

  async function exportZip() {
    if (!exportReady) return notify(errors[0] || messages.resolveBeforeZip);
    setIsExporting(true);
    const zip = new JSZip();
    const folder = zip.folder(slugify(config.name, batchGenerationConfig.defaultExportName));
    outputs.forEach((item) => folder.file(`${slugify(item.title, `output-${item.index}`)}${batchGenerationConfig.exportFiles.txtExtension}`, item.content));
    folder.file(batchGenerationConfig.exportFiles.manifest, JSON.stringify({ config, fields, analytics: { total: outputs.length, successRate, totalBytes }, outputs }, null, 2));
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, `${slugify(config.name, batchGenerationConfig.defaultExportName)}${batchGenerationConfig.exportFiles.zipExtension}`);
    setIsExporting(false);
    notify(messages.zipExported);
  }

  function exportCsv() {
    if (!exportReady) return notify(errors[0] || messages.resolveBeforeCsv);
    downloadBlob(buildCsv(outputs), `${slugify(config.name, batchGenerationConfig.defaultExportName)}${batchGenerationConfig.exportFiles.csvExtension}`, batchGenerationConfig.fileTypes.csv);
    notify(messages.csvExported);
  }

  function exportTxt() {
    if (!exportReady) return notify(errors[0] || messages.resolveBeforeTxt);
    downloadBlob(buildTxt(outputs), `${slugify(config.name, batchGenerationConfig.defaultExportName)}${batchGenerationConfig.exportFiles.txtExtension}`, batchGenerationConfig.fileTypes.txt);
    notify(messages.txtExported);
  }

  async function copyPreview() {
    await navigator.clipboard.writeText(buildTxt(outputs.slice(0, batchGenerationConfig.copyPreviewLimit)));
    notify(messages.previewCopied);
  }

  return (
    <main className="batch-gen-shell overflow-x-hidden text-(--foreground)">
      <div className="mx-auto max-w-5xl space-y-4">
        <Header
          outputsCount={outputs.length}
          generatedCount={generated.length}
          successRate={successRate}
          exportReady={exportReady}
          Stat={Stat}
        />

        {message && (
          <div className="flex items-start justify-between gap-2 rounded-lg border border-(--border) bg-(--card) px-2.5 py-1.5 text-xs font-semibold text-(--foreground)">
            <span className="min-w-0 break-words">{message}</span>
            <button onClick={() => setMessage("")} className="shrink-0 rounded-lg p-1 hover:bg-(--muted)" aria-label={labels.dismissMessage}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-4">
            <Panel title={labels.batchSetup} icon={Settings2}>
              <Field label={labels.batchName} value={config.name} onChange={(value) => updateConfig("name", value)} placeholder={placeholders.batchName} />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <Field label={labels.generationType} value={config.type} onChange={(value) => updateConfig("type", value)} placeholder={placeholders.generationType} />
                <Field label={labels.category} value={config.category} onChange={(value) => updateConfig("category", value)} placeholder={placeholders.category} />
              </div>
              <Select label={labels.workflowMode} value={config.mode} onChange={(value) => updateConfig("mode", value)} options={workflowModes} />
              <Field label={labels.purpose} value={config.purpose} onChange={(value) => updateConfig("purpose", value)} placeholder={placeholders.purpose} />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <Field label={labels.quantity} type="number" min="1" max={MAX_QUANTITY} value={config.quantity} onChange={(value) => updateConfig("quantity", value)} />
                <Field label={labels.namingLogic} value={config.namingPattern} onChange={(value) => updateConfig("namingPattern", value)} placeholder={placeholders.namingPattern} />
              </div>
              <Field label={labels.variationSeed} value={config.variationSeed} onChange={(value) => updateConfig("variationSeed", value)} placeholder={placeholders.variationSeed} />
            </Panel>

            <Panel title={labels.dynamicInputs} icon={Database}>
              <button onClick={addField} className="btn-primary inline-flex w-full items-center justify-center gap-2 px-3 py-2 text-xs">
                <Plus className="h-4 w-4" /> {labels.addField}
              </button>
              <div className="grid gap-1.5">
                {fields.map((field) => (
                  <div key={field.id} className="min-w-0 rounded-lg border border-(--border) bg-(--background) p-2">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                      <Field compact label={labels.label} value={field.label} onChange={(value) => updateField(field.id, { label: value })} />
                      <Field compact label={labels.variableKey} value={field.key} onChange={(value) => updateField(field.id, { key: value })} />
                    </div>
                    <Field compact label={labels.value} value={field.value} onChange={(value) => updateField(field.id, { value })} placeholder={placeholders.fieldValue} textarea />
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <label className="flex min-w-0 items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                        <input type="checkbox" checked={field.required} onChange={(event) => updateField(field.id, { required: event.target.checked })} className="h-3.5 w-3.5 shrink-0 accent-(--primary)" />
                        {labels.required}
                      </label>
                      <button onClick={() => setFields((current) => current.filter((item) => item.id !== field.id))} className="shrink-0 rounded-md bg-(--muted) p-1.5 text-(--primary) hover:bg-(--card-hover-bg)" aria-label={labels.removeField}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {!fields.length && <EmptyState text={messages.emptyFields} />}
              </div>
            </Panel>
          </div>

          <div className="min-w-0 space-y-4">
            <Panel title={labels.templateEngine} icon={Wand2}>
              <Field
                label={labels.templateContent}
                value={config.template}
                onChange={(value) => updateConfig("template", value)}
                placeholder={placeholders.template}
                textarea
                tall
              />
              <div className="flex flex-wrap gap-1.5">
                {[...tokens, ...fields.map((field) => `{${field.key || normalizeKey(field.label)}}`)].map((token) => (
                  <button key={token} onClick={() => updateConfig("template", `${config.template}${config.template ? " " : ""}${token}`)} className="max-w-full rounded-full border border-(--border) bg-(--background) px-2 py-0.5 text-[11px] font-bold text-(--primary) transition hover:bg-(--muted)">
                    <span className="break-all">{token}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button onClick={saveTemplate} className="btn-primary inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs">
                  <Save className="h-3.5 w-3.5" /> {labels.save}
                </button>
                <button onClick={saveBatch} className="btn-secondary inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs">
                  <Archive className="h-3.5 w-3.5" /> {labels.batch}
                </button>
                <button onClick={resetWorkspace} className="btn-secondary inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs">
                  <RotateCcw className="h-3.5 w-3.5" /> {labels.reset}
                </button>
              </div>
            </Panel>

            <Panel title={labels.queueDashboard} icon={Activity}>
              <div className="space-y-2">
                <Progress label={`${generated.length} / ${outputs.length} ${labels.generated.toLowerCase()}`} value={generated.length} total={outputs.length || 1} />
                <div className="grid grid-cols-2 gap-2">
                  <Metric label={labels.pending} value={pending} />
                  <Metric label={labels.failed} value={failed.length} />
                  <Metric label={labels.size} value={formatBytes(totalBytes)} />
                  <Metric label={labels.speed} value={generationSpeed} />
                </div>
                <div className={`rounded-lg border p-2 text-xs font-bold ${exportReady ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-600 dark:text-emerald-200" : "border-amber-400/25 bg-amber-400/10 text-amber-700 dark:text-amber-100"}`}>
                  {exportReady ? messages.exportReady : messages.exportBlocked}
                </div>
              </div>
            </Panel>

            <Panel title={labels.exportPanel} icon={Download}>
              <div className="grid grid-cols-1 gap-2">
                <button onClick={exportZip} disabled={!exportReady || isExporting} className="btn-primary inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50">
                  {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileArchive className="h-3.5 w-3.5" />} {labels.zip}
                </button>
                <button onClick={exportCsv} disabled={!exportReady} className="btn-secondary inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs disabled:opacity-50">
                  <Database className="h-3.5 w-3.5" /> {labels.csv}
                </button>
                <button onClick={exportTxt} disabled={!exportReady} className="btn-secondary inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs disabled:opacity-50">
                  <FileText className="h-3.5 w-3.5" /> {labels.txt}
                </button>
                <button onClick={copyPreview} disabled={!outputs.length} className="btn-secondary inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs disabled:opacity-50">
                  <Copy className="h-3.5 w-3.5" /> {labels.copy}
                </button>
              </div>
            </Panel>

            <Panel title={labels.analytics} icon={Zap}>
              <Metric label={labels.successRate} value={`${successRate}%`} />
              <Metric label={labels.templatesSaved} value={templates.length} />
              <Metric label={labels.batchesSaved} value={history.length} />
              <Metric label={labels.variablesMapped} value={fields.filter((field) => field.key && field.value).length} />
            </Panel>
          </div>
        </section>

        <Panel title={labels.previewValidation} icon={Layers3}>
          {errors.length > 0 && (
            <div className="w-full min-w-0 space-y-1.5 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-xs font-semibold leading-relaxed text-amber-700 dark:text-amber-100">
              {errors.slice(0, batchGenerationConfig.validationLimit).map((error) => (
                <div key={error} className="flex w-full min-w-0 items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0 flex-1 whitespace-normal break-normal">{error}</span>
                </div>
              ))}
            </div>
          )}
          <div className="grid max-h-[420px] min-w-0 grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3 overflow-auto pr-1">
            {outputs.slice(0, batchGenerationConfig.previewLimit).map((item) => (
              <article key={item.id} className="min-w-0 overflow-hidden rounded-xl border border-(--border) bg-(--background) p-3 transition duration-300 hover:border-cyan-400/40 hover:shadow-md hover:shadow-cyan-950/10">
                <div className="mb-2 flex min-w-0 items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-black leading-snug" title={item.title}>{item.title}</h3>
                    <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-wide text-muted-foreground" title={`${item.type || labels.noType} / ${item.category || labels.noCategory}`}>
                      {item.type || labels.noType} / {item.category || labels.noCategory}
                    </p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
                <p className="h-20 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-(--card) p-2 text-xs leading-relaxed text-muted-foreground">{item.content || labels.noOutput}</p>
                {!!item.missing.length && <p className="mt-2 break-words text-xs font-bold text-rose-500">{labels.missing}: {item.missing.join(", ")}</p>}
              </article>
            ))}
            {!outputs.length && <EmptyState text={messages.emptyPreview} />}
          </div>
        </Panel>

        <section className="grid min-w-0 gap-2.5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Panel title={labels.templateManager} icon={Sparkles}>
            <div className="grid min-w-0 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => (
                <HistoryCard key={template.id} labels={labels} title={template.name} meta={`${template.type || labels.noType} / ${template.category || labels.noCategory}`} detail={`${template.fields?.length || 0} ${labels.fields}`} onLoad={() => loadTemplate(template)} onDelete={() => setTemplates((current) => current.filter((item) => item.id !== template.id))} />
              ))}
              {!templates.length && <EmptyState text={messages.emptyTemplates} />}
            </div>
          </Panel>

          <Panel title={labels.savedBatches} icon={Filter}>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
              <div className="relative sm:col-span-1">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <input value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder={placeholders.searchHistory} className="w-full rounded-md border border-(--border) bg-(--background) py-1.5 pl-8 pr-2.5 text-xs outline-none transition focus:border-(--primary)" />
              </div>
              <Select value={filters.type} onChange={(value) => setFilters((current) => ({ ...current, type: value }))} options={historyTypes} />
              <Select value={filters.sort} onChange={(value) => setFilters((current) => ({ ...current, sort: value }))} options={sortOptions} />
            </div>
            <div className="grid min-w-0 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
              {filteredHistory.map((batch) => (
                <HistoryCard key={batch.id} labels={labels} title={batch.name} meta={`${batch.generated}/${batch.quantity} ${labels.generated.toLowerCase()}`} detail={`${batch.type} / ${batch.category}`} onLoad={() => loadBatch(batch)} onDelete={() => setHistory((current) => current.filter((item) => item.id !== batch.id))} />
              ))}
              {!filteredHistory.length && <EmptyState text={messages.emptyHistory} />}
            </div>
          </Panel>
        </section>
      </div>

      <style jsx global>{`
        .batch-gen-shell * {
          min-width: 0;
        }
        .batch-gen-shell textarea,
        .batch-gen-shell input,
        .batch-gen-shell select,
        .batch-gen-shell button {
          max-width: 100%;
        }
      `}</style>
    </main>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="min-w-0 rounded-xl border border-(--border) bg-(--card) p-4 shadow-lg transition duration-300 hover:bg-(--card-hover-bg)">
      <div className="mb-3 flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-(--background) text-(--primary)">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="min-w-0 break-words text-xs font-black uppercase leading-relaxed tracking-[.14em]">{title}</h2>
      </div>
      <div className="min-w-0 space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder = "", textarea = false, type = "text", compact = false, tall = false, ...props }) {
  const base = "w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-(--primary)";
  return (
    <label className="block min-w-0">
      {label && <span className="mb-1.5 block break-words text-[10px] font-black uppercase tracking-[.14em] text-muted-foreground">{label}</span>}
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${base} ${tall ? "min-h-32" : compact ? "min-h-16" : "min-h-24"} resize-y whitespace-pre-wrap break-words`} {...props} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={base} {...props} />
      )}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      {label && <span className="mb-1.5 block break-words text-[10px] font-black uppercase tracking-[.14em] text-muted-foreground">{label}</span>}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm outline-none transition focus:border-(--primary)">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Stat({ label, value, compact = false }) {
  return (
    <div className={`min-w-0 rounded-xl border border-(--border) bg-(--background) ${compact ? "px-4 py-3" : "px-2 py-1.5"}`}>
      <div className="break-words text-[10px] font-black uppercase tracking-widest text-(--muted-foreground)">{label}</div>
      <div className={`${compact ? "mt-1 text-2xl" : "mt-0.5 text-lg"} break-words font-black leading-tight text-(--foreground)`}>{value}</div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-(--border) bg-(--background) px-2.5 py-1.5">
      <div className="break-words text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 break-words text-sm font-black leading-tight">{value}</div>
    </div>
  );
}

function Progress({ label, value, total }) {
  const width = Math.min(100, Math.round((value / total) * 100));
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-black">
        <span className="min-w-0 break-words">{label}</span>
        <span className="shrink-0 text-muted-foreground">{width}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-500/10">
        <div className="h-full rounded-full bg-(--primary) transition-all duration-500" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const styles = batchGenerationConfig.statusStyles;
  return <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest ${styles[status] || styles.pending}`}>{status}</span>;
}

function HistoryCard({ labels, title, meta, detail, onLoad, onDelete }) {
  return (
    <article className="min-w-0 rounded-lg border border-(--border) bg-(--background) p-2 transition hover:border-cyan-400/40">
      <div className="flex min-w-0 items-start justify-between gap-1.5">
        <div className="min-w-0">
          <h3 className="break-words text-xs font-black leading-snug">{title}</h3>
          <p className="mt-0.5 break-words text-[11px] text-muted-foreground">{meta}</p>
          <p className="mt-0.5 break-words text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{detail}</p>
        </div>
        <button onClick={onDelete} className="shrink-0 rounded-md bg-(--muted) p-1.5 text-(--primary) hover:bg-(--card-hover-bg)" aria-label={labels.delete}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <button onClick={onLoad} className="btn-secondary mt-2 inline-flex w-full items-center justify-center gap-1.5 px-2 py-1.5 text-[11px]">
        <Zap className="h-3 w-3" /> {labels.load}
      </button>
    </article>
  );
}

function EmptyState({ text }) {
  return <div className="flex w-full min-w-[140px] items-center justify-center rounded-md border border-dashed border-(--border) bg-(--background) px-2 py-1.5 text-center text-[11px] leading-snug text-muted-foreground sm:min-w-0">{text}</div>;
}
