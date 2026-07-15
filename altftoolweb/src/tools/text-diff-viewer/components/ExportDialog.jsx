import { useState } from "react";
import { Modal, Button } from "@altftool/ui";
import { FileDown, FileJson, FileText, Code, Check } from "lucide-react";
import { generateDiffHtml, generateDiffMarkdown, generateDiffJson } from "../utils/diffEngine";
import { downloadText, copyToClipboard } from "../utils/helpers";

export default function ExportDialog({ open, onClose, textA, textB, options }) {
  const [copied, setCopied] = useState("");

  const handleCopy = (format) => {
    let content = "";
    if (format === "html") content = generateDiffHtml(textA, textB, options);
    else if (format === "markdown") content = generateDiffMarkdown(textA, textB, options);
    else if (format === "json") content = generateDiffJson(textA, textB, options);
    copyToClipboard(content);
    setCopied(format);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleDownload = (format) => {
    let content = "", ext = "";
    if (format === "html") { content = generateDiffHtml(textA, textB, options); ext = "html"; }
    else if (format === "markdown") { content = generateDiffMarkdown(textA, textB, options); ext = "md"; }
    else if (format === "json") { content = generateDiffJson(textA, textB, options); ext = "json"; }
    downloadText(content, `diff.${ext}`);
  };

  const formats = [
    { key: "html", label: "HTML", desc: "Styled diff with colors", icon: Code },
    { key: "markdown", label: "Markdown", desc: "GitHub-flavored diff", icon: FileText },
    { key: "json", label: "JSON", desc: "Structured diff data", icon: FileJson },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Export Diff" size="sm">
      <div className="space-y-3">
        {formats.map((fmt) => (
          <div key={fmt.key} className="flex items-center gap-3 p-3 rounded-xl border border-(--border) bg-(--muted)">
            <div className="w-9 h-9 rounded-lg bg-(--card) flex items-center justify-center">
              <fmt.icon size="16" className="text-(--primary)" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-(--foreground)">{fmt.label}</p>
              <p className="text-xs text-(--muted-foreground)">{fmt.desc}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="secondary" size="sm" onClick={() => handleCopy(fmt.key)}>
                {copied === fmt.key ? <Check size="14" /> : "Copy"}
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleDownload(fmt.key)}>
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
