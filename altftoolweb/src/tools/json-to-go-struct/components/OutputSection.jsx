"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download, FileJson2, FileText, GitBranch, Layers3, Save } from "lucide-react";
import { copyToClipboard } from "../utils/copyToClipboard";
import { downloadGO } from "../utils/downloadGO";
import { highlightGo } from "../utils/goStructGenerator";

export default function OutputSection({ result, workspace, copied, setCopied, saveHistory }) {
  const code = result?.code || "";

  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="pp-glass min-w-0 rounded-3xl p-4 sm:p-5">
      <div className="mb-4 flex min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-black">Generated Go Preview</h2>
          <p className="text-sm text-(--muted-foreground)">Updates instantly from the current JSON input and settings.</p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-2">
          <button type="button" className="pp-button-secondary flex-1 sm:flex-none" onClick={handleCopy} disabled={!code} style={{ opacity: !code ? 0.5 : 1 }}>
            {copied ? <Check className="h-4 w-4 text-teal-400" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button type="button" className="pp-button-secondary flex-1 sm:flex-none" onClick={() => downloadGO(code, `${workspace.rootName || "struct"}.go`)} disabled={!code} style={{ opacity: !code ? 0.5 : 1 }}>
            <Download className="h-4 w-4" />
            Download
          </button>
          <button type="button" className="pp-button-secondary flex-1 sm:flex-none" onClick={saveHistory} disabled={!code} style={{ opacity: !code ? 0.5 : 1 }}>
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      <div className="mb-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "JSON size", value: `${result.stats.jsonSize} B`, icon: FileJson2 },
          { label: "Fields", value: result.stats.fieldCount, icon: FileText },
          { label: "Structs", value: result.stats.structCount, icon: Layers3 },
          { label: "Depth", value: result.stats.nestingDepth, icon: GitBranch },
          { label: "Lines", value: result.stats.outputLines, icon: FileText },
        ].map(({ label, value, icon: Icon }) => (
          <motion.div key={label} className="min-w-0 rounded-2xl border border-blue-400/25 bg-blue-400/10 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-2 flex min-w-0 items-center justify-between gap-2 text-xs font-bold uppercase text-blue-400">
              <span className="min-w-0 break-words">{label}</span>
              <Icon className="h-4 w-4 shrink-0" />
            </div>
            <p className="break-words text-2xl font-black text-(--foreground)">{value}</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.pre key={code} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="jg-code">
          <code dangerouslySetInnerHTML={{ __html: highlightGo(code) }} />
        </motion.pre>
      </AnimatePresence>

      <details className="mt-4 min-w-0 rounded-2xl border border-(--border) bg-(--background)/40 p-4">
        <summary className="cursor-pointer text-sm font-black">Reverse JSON Preview</summary>
        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-(--muted-foreground)">{result.sampleJson}</pre>
      </details>
    </div>
  );
}
