"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Copy,
  Check,
  Code2,
  FileDown,
  ImageDown,
  FileText,
  Contact,
  Star,
  Clock3,
  Trash2,
  Moon,
  Sun,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { qrPayload, buildVCard, analyzeSignature } from "../lib/signatureHtml";
import {
  copyRenderedSignature,
  copyHtmlSource,
  downloadHtml,
  downloadPng,
  downloadPdf,
  downloadVCard,
} from "../lib/exportUtils";

const CLIENT_TABS = [
  { id: "gmail", label: "Gmail", chrome: "#F6F8FC", note: "" },
  { id: "outlook", label: "Outlook", chrome: "#F3F2F1", note: "Outlook renders square corners — this preview shows that." },
  { id: "apple", label: "Apple Mail", chrome: "#FFFFFF", note: "" },
  { id: "yahoo", label: "Yahoo", chrome: "#F7F5FB", note: "" },
];

const LEVEL_META = {
  error: { icon: XCircle, cls: "text-danger", soft: "bg-danger-soft" },
  warning: { icon: AlertTriangle, cls: "text-warning", soft: "bg-warning-soft" },
  info: { icon: Info, cls: "text-info", soft: "bg-info-soft" },
  pass: { icon: CheckCircle2, cls: "text-success", soft: "bg-success-soft" },
};

const INSTALL_GUIDES = [
  {
    client: "Gmail",
    steps: [
      'Click "Copy signature" above.',
      "In Gmail, open Settings (gear icon) → See all settings.",
      'Scroll to "Signature", click "Create new", and paste (Ctrl/Cmd+V) into the editor.',
      'Set it as default for new emails and replies, then click "Save Changes" at the bottom.',
    ],
  },
  {
    client: "Outlook",
    steps: [
      'Click "Copy signature" above.',
      "In Outlook, go to Settings → Account → Signatures (or File → Options → Mail → Signatures on desktop).",
      "Create a new signature and paste it into the editor.",
      "Choose it as the default for new messages and replies, then save.",
    ],
  },
  {
    client: "Apple Mail",
    steps: [
      'Click "Copy signature" above.',
      "In Mail, open Settings (Cmd+,) → Signatures.",
      "Select your account, click +, and paste into the signature area.",
      'Untick "Always match my default message font" so the design is kept.',
    ],
  },
  {
    client: "Yahoo Mail",
    steps: [
      'Click "Copy signature" above.',
      "In Yahoo Mail, open Settings → More Settings → Writing email.",
      "Toggle the signature on for your account and paste into the box.",
      "Changes save automatically.",
    ],
  },
];

function ExportButton({ icon: Icon, label, onClick, disabled, busy }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) bg-(--background) px-3 py-1.5 text-xs font-medium text-(--foreground) transition-colors hover:border-(--primary) hover:text-(--primary) disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {busy ? "Working…" : label}
    </button>
  );
}

export default function PreviewPanel({
  state,
  html,
  exportHtml,
  client,
  onClientChange,
  darkPreview,
  onDarkPreviewChange,
  onQrDataUrl,
  onSaveFavorite,
  recents,
  favorites,
  onLoadEntry,
  onClearRecents,
  onRemoveFavorite,
}) {
  const previewRef = useRef(null);
  const exportRef = useRef(null);
  const qrWrapRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const [copied, setCopied] = useState("");
  const [busy, setBusy] = useState("");
  const [listTab, setListTab] = useState("recent");

  const hasContent = Boolean(state.personal.fullName.trim() || state.personal.email.trim());
  const analysis = analyzeSignature(state, exportHtml);
  const activeClient = CLIENT_TABS.find((c) => c.id === client);
  const qrValue = qrPayload(state);
  const qrEnabled = state.sections.visible.qr && qrValue;

  // qrcode.react draws to a canvas; we read it back as a data URL so the
  // pure-string HTML generator can embed it as a normal <img>.
  useEffect(() => {
    if (!qrEnabled) {
      onQrDataUrl("");
      return;
    }
    const handle = window.setTimeout(() => {
      const canvas = qrWrapRef.current?.querySelector("canvas");
      if (canvas) onQrDataUrl(canvas.toDataURL("image/png"));
    }, 80);
    return () => window.clearTimeout(handle);
  }, [qrEnabled, qrValue, onQrDataUrl]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  async function flash(id, fn) {
    setBusy(id);
    try {
      const ok = await fn();
      if (ok !== false) {
        setCopied(id);
        if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = window.setTimeout(() => setCopied(""), 1600);
      }
    } finally {
      setBusy("");
    }
  }

  const fileBase = (state.personal.fullName || "email-signature").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "email-signature";

  return (
    <div className="space-y-4">
      {/* hidden QR renderer */}
      {qrEnabled && (
        <div ref={qrWrapRef} className="hidden" aria-hidden="true">
          <QRCodeCanvas value={qrValue} size={144} includeMargin />
        </div>
      )}

      {/* Off-screen node bound to the canonical exportHtml (not the possibly
          Outlook-stripped preview tab) so PNG/PDF export always screenshots
          the same markup Copy/Download HTML produce. Positioned off-screen
          rather than display:none so html2canvas can still lay it out. */}
      <div
        ref={exportRef}
        aria-hidden="true"
        style={{ position: "fixed", top: 0, left: "-9999px", width: 680, pointerEvents: "none" }}
        dangerouslySetInnerHTML={{ __html: exportHtml }}
      />

      <div className="rounded-2xl border border-(--card-border) bg-(--card)/80 shadow-lg backdrop-blur-xl">
        <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto border-b border-(--border) p-2.5 sm:flex-wrap">
          {CLIENT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onClientChange(tab.id)}
              className={`shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${client === tab.id ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--muted) text-(--muted-foreground)"}`}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onDarkPreviewChange(!darkPreview)}
            aria-pressed={darkPreview}
            className="ml-auto inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-(--muted) px-3 py-1.5 text-xs font-medium text-(--muted-foreground) hover:text-(--foreground)"
          >
            {darkPreview ? <Sun className="h-3.5 w-3.5" aria-hidden="true" /> : <Moon className="h-3.5 w-3.5" aria-hidden="true" />}
            {darkPreview ? "Light preview" : "Dark preview"}
          </button>
        </div>

        <div className="p-4" style={{ backgroundColor: darkPreview ? "#1F2937" : activeClient.chrome }}>
          <div className={`mx-auto max-w-[680px] rounded-lg p-4 shadow-sm ${darkPreview ? "bg-[#111827]" : "bg-white"}`}>
            <div className={`mb-3 border-b pb-2 text-xs ${darkPreview ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}>
              <span className="font-semibold">{activeClient.label}</span> · New message
            </div>
            <p className={`mb-4 text-sm ${darkPreview ? "text-gray-300" : "text-gray-700"}`}>Hi team,</p>
            <p className={`mb-5 text-sm ${darkPreview ? "text-gray-300" : "text-gray-700"}`}>Looking forward to connecting this week.</p>
            {hasContent ? (
              <div className="overflow-x-auto" ref={previewRef} dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <p className={`text-sm italic ${darkPreview ? "text-gray-500" : "text-gray-400"}`}>Fill in your name and details on the left to see your signature here.</p>
            )}
          </div>
          {activeClient.note && <p className="mx-auto mt-2 max-w-[680px] text-[11px] text-(--muted-foreground)">{activeClient.note}</p>}
        </div>

        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-t border-(--border) p-3 sm:flex-wrap">
          <ExportButton icon={copied === "sig" ? Check : Copy} label={copied === "sig" ? "Copied" : "Copy signature"} disabled={!hasContent} busy={busy === "sig"} onClick={() => flash("sig", () => copyRenderedSignature(exportHtml))} />
          <ExportButton icon={copied === "html" ? Check : Code2} label={copied === "html" ? "Copied" : "Copy HTML"} disabled={!hasContent} busy={busy === "html"} onClick={() => flash("html", () => copyHtmlSource(exportHtml))} />
          <ExportButton icon={FileDown} label="HTML" disabled={!hasContent} onClick={() => downloadHtml(exportHtml, fileBase)} />
          <ExportButton icon={ImageDown} label="PNG" disabled={!hasContent} busy={busy === "png"} onClick={() => flash("png", () => downloadPng(exportRef.current, fileBase))} />
          <ExportButton icon={FileText} label="PDF" disabled={!hasContent} busy={busy === "pdf"} onClick={() => flash("pdf", () => downloadPdf(exportRef.current, fileBase))} />
          <ExportButton icon={Contact} label="vCard" disabled={!state.personal.fullName.trim()} onClick={() => downloadVCard(buildVCard(state), fileBase)} />
          <ExportButton icon={Star} label="Save" disabled={!hasContent} onClick={onSaveFavorite} />
        </div>
      </div>

      <div className="rounded-2xl border border-(--card-border) bg-(--card)/80 p-5 shadow-lg backdrop-blur-xl" aria-live="polite" role="status">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-(--foreground)">
            <ShieldCheck className="h-4 w-4 text-(--primary)" aria-hidden="true" /> Signature quality
          </h3>
          <span className={`rounded-md px-2 py-1 text-xs font-bold ${analysis.score >= 80 ? "bg-success-soft text-success" : analysis.score >= 55 ? "bg-warning-soft text-warning" : "bg-danger-soft text-danger"}`}>
            {analysis.score}/100
          </span>
        </div>
        <div className="space-y-2">
          {analysis.checks.map((check, i) => {
            const meta = LEVEL_META[check.level];
            const Icon = meta.icon;
            return (
              <div key={i} className="flex items-start gap-2.5 rounded-lg border border-(--border) bg-(--background) p-3">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${meta.cls}`} aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-(--foreground)">{check.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-(--muted-foreground)">{check.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-(--card-border) bg-(--card)/80 p-5 shadow-lg backdrop-blur-xl">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setListTab("recent")}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${listTab === "recent" ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--muted) text-(--muted-foreground)"}`}
          >
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> Recent ({recents.length})
          </button>
          <button
            type="button"
            onClick={() => setListTab("favorites")}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${listTab === "favorites" ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--muted) text-(--muted-foreground)"}`}
          >
            <Star className="h-3.5 w-3.5" aria-hidden="true" /> Saved ({favorites.length})
          </button>
          {listTab === "recent" && recents.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Clear all ${recents.length} recent signature(s)? This can't be undone.`)) onClearRecents();
              }}
              className="ml-auto inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border border-(--border) px-3 py-1.5 text-xs font-medium text-(--muted-foreground) transition-colors hover:border-danger hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Clear
            </button>
          )}
        </div>
        {(listTab === "recent" ? recents : favorites).length === 0 ? (
          <p className="text-sm text-(--muted-foreground)">
            {listTab === "recent" ? "Signatures you build will show up here automatically." : "Click Save above to keep a signature permanently."}
          </p>
        ) : (
          <div className="space-y-2">
            {(listTab === "recent" ? recents : favorites).map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 rounded-lg border border-(--border) bg-(--background) p-3">
                <button type="button" onClick={() => onLoadEntry(entry)} className="min-w-0 flex-1 cursor-pointer text-left">
                  <p className="truncate text-sm font-medium text-(--foreground)">{entry.label}</p>
                  <p className="text-xs text-(--muted-foreground)">
                    {entry.company ? `${entry.company} · ` : ""}
                    {new Date(entry.ts).toLocaleString()}
                  </p>
                </button>
                {listTab === "favorites" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Remove "${entry.label}" from saved signatures? This can't be undone.`)) onRemoveFavorite(entry.id);
                    }}
                    aria-label="Remove saved signature"
                    className="shrink-0 cursor-pointer text-(--muted-foreground) hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-(--card-border) bg-(--card)/80 p-5 shadow-lg backdrop-blur-xl">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-(--foreground)">
          <BookOpen className="h-4 w-4 text-(--primary)" aria-hidden="true" /> How to install your signature
        </h3>
        <div className="space-y-2">
          {INSTALL_GUIDES.map((guide) => (
            <details key={guide.client} className="group rounded-lg border border-(--border) bg-(--background)">
              <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-2.5 text-sm font-medium text-(--foreground) [&::-webkit-details-marker]:hidden">
                {guide.client}
                <span className="text-(--muted-foreground) transition-transform group-open:rotate-90">›</span>
              </summary>
              <ol className="space-y-1.5 border-t border-(--border) p-3.5 pl-8 text-sm leading-relaxed text-(--foreground)/85 [list-style:decimal]">
                {guide.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
