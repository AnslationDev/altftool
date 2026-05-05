import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";

export default function ChangelogGenerator({ result, v1Label = "v1", v2Label = "v2" }) {
  const [version, setVersion] = useState("");
  const [improved, setImproved] = useState("");
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const improvedList = improved
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const generateChangelog = () => {
    const lines = [];
    lines.push(`# API Changelog`);
    lines.push(`## Version ${version || v2Label} — ${date}`);
    lines.push(`*Comparing ${v1Label} → ${v2Label}*`);
    lines.push("");

    if (result.added.length > 0) {
      lines.push(`### ✅ Added`);
      result.added.forEach((e) => lines.push(`- \`${e}\``));
      lines.push("");
    }

    if (result.removed.length > 0) {
      lines.push(`### ❌ Removed`);
      result.removed.forEach((e) => lines.push(`- \`${e}\``));
      lines.push("");
    }

    if (improvedList.length > 0) {
      lines.push(`### 🔧 Improved`);
      improvedList.forEach((e) => lines.push(`- ${e}`));
      lines.push("");
    }

    if (result.unchanged.length > 0) {
      lines.push(`### ✔ Unchanged`);
      result.unchanged.forEach((e) => lines.push(`- \`${e}\``));
    }

    return lines.join("\n");
  };

  const changelog = generateChangelog();

  const copy = async () => {
    await navigator.clipboard.writeText(changelog);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([changelog], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `changelog-${version || v2Label}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--muted)] space-y-4">

      {/* Header */}
      <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">
        Changelog Generator
      </p>

      {/* Version input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="text-xs text-[var(--muted-foreground)] mb-1 block">
            Version Name
          </label>
          <input
            type="text"
            placeholder="e.g. 1.1, 2.0.0"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)]
            bg-[var(--background)] text-[var(--foreground)]
            focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>

      {/* Improved — manual input */}
      <div>
        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">
          🔧 Improved (one per line)
        </label>
        <textarea
          rows={3}
          placeholder={`POST /login — faster response time\nGET /users — added pagination`}
          value={improved}
          onChange={(e) => setImproved(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)]
          bg-[var(--background)] text-[var(--foreground)]
          focus:outline-none focus:border-[var(--primary)] resize-none
          placeholder:text-[var(--muted-foreground)]"
        />
      </div>

      {/* Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-[var(--muted-foreground)]">Preview</p>
          <div className="flex gap-2">
            <button
              onClick={copy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs 
              bg-[var(--primary)] text-[var(--primary-foreground)]
              rounded-lg font-medium hover:opacity-90 cursor-pointer"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={download}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs
              border border-[var(--border)] text-[var(--muted-foreground)]
              rounded-lg font-medium hover:bg-[var(--card)] cursor-pointer"
            >
              <Download size={13} /> Download .md
            </button>
          </div>
        </div>
        <pre className="text-xs font-mono bg-[var(--background)] p-4 rounded-lg
        border border-[var(--border)] text-[var(--foreground)]
        overflow-x-auto whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
          {changelog}
        </pre>
      </div>

    </div>
  );
}