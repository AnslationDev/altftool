"use client";

import { motion } from "framer-motion";
import { Check, Copy, Download, FileCode2, History, Save, Terminal } from "lucide-react";
import { copyToClipboard } from "../utils/copyToClipboard";
import { downloadTXT } from "../utils/downloadTXT";

function Preview({ form, code }) {
  const id = String(form.sectionId || form.customTarget || "section").replace(/^#/, "") || "section";

  return (
    <div className="jump-preview-surface min-h-[220px] overflow-auto rounded-2xl border border-(--border) bg-(--background)/40 p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        <a href={`#preview-${id}`} className="pp-button-secondary">Anchor</a>
        <button type="button" className="pp-button-secondary" onClick={() => document.getElementById(`preview-${id}`)?.scrollIntoView({ behavior: "smooth" })}>
          Button
        </button>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-(--border) bg-(--muted)/25 p-5">
          <p className="text-sm font-bold text-(--muted-foreground)">Preview Spacer</p>
        </div>
        <section id={`preview-${id}`} className="rounded-2xl border border-teal-400/35 bg-teal-400/10 p-5">
          <p className="text-xs font-bold uppercase text-teal-400">Target</p>
          <h3 className="mt-1 text-lg font-black">{form.linkText || form.buttonLabel || form.routeName}</h3>
          <p className="mt-2 text-sm text-(--muted-foreground)">Generated from the current input and synced with the code panel.</p>
        </section>
      </div>
      {!code && <p className="mt-4 text-sm text-(--muted-foreground)">Complete the active fields to generate a live snippet.</p>}
    </div>
  );
}

export default function OutputSection({ code, activeType, copied, setCopied, stats, validation, history, saveSnapshot, form }) {
  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const filename = `${activeType.id || "jump-code"}.${activeType.language === "html" ? "html" : activeType.language === "jsx" ? "jsx" : "js"}`;

  return (
    <div className="grid min-w-0 gap-6">
      <div className="pp-glass min-w-0 rounded-3xl p-4">
        <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-black">Generated Code Output</h2>
            <p className="text-sm text-(--muted-foreground)">Real {activeType.label} code from your current inputs.</p>
          </div>
          <div className="flex min-w-0 flex-wrap gap-2">
            <button type="button" className="pp-button-secondary flex-1 sm:flex-none" onClick={handleCopy} disabled={!code} style={{ opacity: code ? 1 : 0.5 }}>
              {copied ? <Check className="h-4 w-4 text-teal-400" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button type="button" className="pp-button-secondary flex-1 sm:flex-none" onClick={() => downloadTXT(code, filename)} disabled={!code} style={{ opacity: code ? 1 : 0.5 }}>
              <Download className="h-4 w-4" />
              Download
            </button>
            <button type="button" className="pp-button-secondary flex-1 sm:flex-none" onClick={saveSnapshot} disabled={!code} style={{ opacity: code ? 1 : 0.5 }}>
              <Save className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>

        <div className="mb-4 grid min-w-0 gap-3 sm:grid-cols-3">
          {[
            { label: "Language", value: stats.language, icon: Terminal },
            { label: "Lines", value: stats.lines, icon: FileCode2 },
            { label: "Readiness", value: `${validation.valid ? 100 : 0}%`, icon: Check },
          ].map(({ label, value, icon: Icon }) => (
            <motion.div key={label} layout className="rounded-xl border border-blue-400/25 bg-blue-400/10 p-3">
              <div className="mb-2 flex items-center justify-between gap-2 text-xs font-bold uppercase text-blue-400">
                <span>{label}</span>
                <Icon className="h-4 w-4" />
              </div>
              <p className="break-words text-xl font-black">{value}</p>
            </motion.div>
          ))}
        </div>

        <pre className="min-h-[300px] max-h-[540px] overflow-auto rounded-2xl border border-(--border) bg-(--background)/55 p-4 text-xs leading-6 text-(--foreground) sm:text-sm">
          <code className="jump-code-output">{code || `Missing required fields: ${validation.missing.join(", ")}`}</code>
        </pre>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <div className="pp-glass min-w-0 rounded-3xl p-4">
          <h2 className="mb-3 text-xl font-black">Live Preview</h2>
          <Preview form={form} code={code} />
        </div>

        <div className="pp-glass min-w-0 rounded-3xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <History className="h-4 w-4 text-blue-400" />
            <h2 className="text-xl font-black">Saved History</h2>
          </div>
          <div className="grid max-h-[300px] gap-2 overflow-auto">
            {history.length === 0 && <p className="text-sm text-(--muted-foreground)">Saved snippets appear here.</p>}
            {history.map((item) => (
              <button key={item.id} type="button" onClick={() => copyToClipboard(item.code)} className="rounded-2xl border border-(--border) bg-(--muted)/25 p-3 text-left">
                <p className="text-sm font-black">{item.type}</p>
                <p className="text-xs text-(--muted-foreground)">{new Date(item.createdAt).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
