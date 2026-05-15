import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Download, FileText, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { copyToClipboard } from "../utils/copyToClipboard";
import { downloadTXT } from "../utils/downloadTXT";

// Simple markdown-to-HTML renderer for the policy output
function renderMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/^# (.+)$/gm, '<h1 class="pp-policy-h1">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="pp-policy-h2">$2</h2>'.replace("$2", "$1"))
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, '<li class="pp-policy-li">$1</li>')
    .replace(/(<li[\s\S]*?<\/li>)/g, '<ul class="pp-policy-ul">$1</ul>')
    .replace(/\n{2,}/g, '</p><p class="pp-policy-p">')
    .replace(/^(?!<[hul])(.+)$/gm, '<p class="pp-policy-p">$1</p>')
    .replace(/<p class="pp-policy-p"><\/p>/g, "");
}

export default function OutputSection({ policy, isGenerating, error, readiness, stats, copied, setCopied }) {
  const handleCopy = async () => {
    await copyToClipboard(policy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="pp-glass min-w-0 rounded-3xl p-4 sm:p-5 lg:p-6">
      {/* Header */}
      <div className="mb-4 flex min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-black text-(--foreground)">Generated Policy Output</h2>
          <p className="text-sm text-(--muted-foreground)">
            {isGenerating ? "AI is generating your privacy policy…" : "Copy or download the generated privacy policy."}
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-2">
          <button
            type="button"
            className="pp-button-secondary flex-1 sm:flex-none"
            onClick={handleCopy}
            disabled={!policy || isGenerating}
            style={{ opacity: !policy || isGenerating ? 0.5 : 1 }}
          >
            {copied ? <Check className="h-4 w-4 text-teal-400" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            type="button"
            className="pp-button-secondary flex-1 sm:flex-none"
            onClick={() => downloadTXT(policy, `${policy.split("\n")[0]?.replace(/[^a-z0-9]/gi, "-").toLowerCase() || "privacy-policy"}.txt`)}
            disabled={!policy || isGenerating}
            style={{ opacity: !policy || isGenerating ? 0.5 : 1 }}
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid min-w-0 gap-3 sm:grid-cols-3 mb-4">
        {[
          { label: "Readiness", value: `${readiness.score}%`, icon: ShieldCheck },
          { label: "Sections", value: stats.sections || "—", icon: FileText },
          { label: "Words", value: stats.words || "—", icon: FileText },
        ].map(({ label, value, icon: Icon }) => (
          <motion.div
            layout
            key={label}
            className="min-w-0 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-2 flex min-w-0 items-center justify-between gap-2 text-xs font-black uppercase tracking-wide text-blue-600">
              <span className="min-w-0 break-words">{label}</span>
              <Icon className="h-4 w-4 shrink-0" />
            </div>
            <p className="break-words text-2xl font-black text-(--foreground)">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Policy Output Area */}
      <div className="max-h-[680px] min-h-[360px] overflow-auto rounded-2xl border border-(--border) bg-(--background)/55 p-4 sm:p-5">
        <AnimatePresence mode="wait">
          {/* Generating state */}
          {isGenerating && !policy && (
            <motion.div
              key="generating"
              className="flex h-64 flex-col items-center justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm font-bold text-blue-600">Generating your unique privacy policy...</p>
              <p className="text-xs text-(--muted-foreground)">Creating a custom policy for your business</p>
            </motion.div>
          )}

          {/* Error state */}
          {error && !policy && (
            <motion.div
              key="error"
              className="flex h-64 flex-col items-center justify-center gap-3 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AlertCircle className="h-8 w-8 text-red-400" />
              <p className="text-sm font-bold text-red-400">Generation Failed</p>
              <p className="max-w-xs text-xs text-(--muted-foreground)">{error}</p>
            </motion.div>
          )}

          {/* Policy content */}
          {policy && (
            <motion.div
              key="policy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pp-policy-copy"
            >
              <div
                className="policy-rendered-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(policy) }}
              />
              {/* Streaming cursor */}
              {isGenerating && (
                <span className="ml-1 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-teal-400" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
