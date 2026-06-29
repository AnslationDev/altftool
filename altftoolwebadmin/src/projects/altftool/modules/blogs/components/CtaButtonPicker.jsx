"use client";

import { useState } from "react";
import {
  Zap,
  X,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Plus,
  Smile,
} from "lucide-react";

/* ─────────────────────────────────────────────
   CTA VARIANT CONFIG
───────────────────────────────────────────── */
const CTA_VARIANTS = [
  { id: "CTA_PRIMARY",   label: "Primary",   defaultIcon: "🚀", defaultText: "Get Started Now",   desc: "Default blue — main action" },
  { id: "CTA_SECONDARY", label: "Secondary", defaultIcon: "💡", defaultText: "Learn More",         desc: "Blue outline on transparent" },
  { id: "CTA_GRADIENT",  label: "Gradient",  defaultIcon: "🔥", defaultText: "Try It Free",        desc: "Orange-red gradient, high CTR" },
  { id: "CTA_SUCCESS",   label: "Success",   defaultIcon: "✅", defaultText: "Confirm & Continue", desc: "Green — positive confirmation" },
  { id: "CTA_WARNING",   label: "Warning",   defaultIcon: "🔔", defaultText: "Take Action",        desc: "Amber — attention grabbing" },
  { id: "CTA_DANGER",    label: "Danger",    defaultIcon: "⚠️", defaultText: "Delete Account",     desc: "Red — destructive / urgent" },
];

/* ─────────────────────────────────────────────
   HTML GENERATOR
   Omits <span class="CTA_ICON"> entirely when icon is blank.
───────────────────────────────────────────── */
function generateHTML({ variantId, icon, text, href }) {
  const hasIcon = icon.trim() !== "";
  const iconSpan = hasIcon
    ? `\n    <span class="CTA_ICON">${icon.trim()}</span>`
    : "";
  return `<!-- CTA Start -->
<div class="CTA_CK_BANNER">
  <a href="${href || "#"}" target="_blank" class="CTA_CK ${variantId}">${iconSpan}
    <span class="CTA_TEXT">${text}</span>
  </a>
</div>
<!-- CTA End -->`;
}

/* ─────────────────────────────────────────────
   LIVE PREVIEW
───────────────────────────────────────────── */
function LivePreview({ variantId, icon, text }) {
  return (
    <div className="CTA_CK_BANNER" style={{ margin: 0 }}>
      <a
        href="#"
        className={`CTA_CK ${variantId}`}
        onClick={(e) => e.preventDefault()}
      >
        {icon.trim() && (
          <span className="CTA_ICON">{icon.trim()}</span>
        )}
        <span className="CTA_TEXT">{text || "Button Preview"}</span>
      </a>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────────── */
function CopyButton({ html }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(html);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = html;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        copied
          ? "bg-success-soft text-success border border-success"
          : "bg-primary text-white hover:bg-primary"
      }`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" /> Copied!
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" /> Copy HTML
        </>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────
   VARIANT CARD
───────────────────────────────────────────── */
function VariantCard({ variant, href, customText, iconOverride, onInsert }) {
  const [expanded, setExpanded] = useState(false);

  const icon =
    iconOverride !== null ? iconOverride : variant.defaultIcon;
  const text = customText || variant.defaultText;
  const html = generateHTML({ variantId: variant.id, icon, text, href });

  return (
    <div className="border border-border rounded-2xl bg-surface-soft overflow-hidden hover:border-border transition-all">
      {/* Preview */}
      <div className="px-4 py-5 flex items-center justify-center min-h-[72px] bg-surface">
        <LivePreview variantId={variant.id} icon={icon} text={text} />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between gap-2 border-t border-border">
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground">{variant.label}</p>
          <p className="text-[10px] text-muted truncate">{variant.desc}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded-lg text-muted hover:text-muted hover:bg-surface-soft transition"
            title="View HTML"
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          {typeof onInsert === "function" ? (
            <button
              type="button"
              onClick={() => onInsert(html)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary"
            >
              <Plus className="h-3 w-3" />
              Insert
            </button>
          ) : null}
          <CopyButton html={html} />
        </div>
      </div>

      {/* Expandable HTML */}
      {expanded && (
        <div className="border-t border-border bg-primary px-4 py-3">
          <pre className="text-[10px] text-success font-mono whitespace-pre-wrap break-all leading-relaxed">
            {html}
          </pre>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT — CTAButtonPicker
───────────────────────────────────────────── */
export default function CTAButtonPicker({ trigger, onInsert }) {
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState("https://");
  const [customText, setCustomText] = useState("");

  // null  → each variant uses its own defaultIcon
  // ""    → no icon on any variant
  // "🎯"  → custom icon applied to all variants
  const [iconOverride, setIconOverride] = useState(null);
  const [iconInput, setIconInput] = useState("");

  const handleIconInput = (val) => {
    setIconInput(val);
    setIconOverride(val === "" ? null : val);
  };

  const handleNoIcon = () => {
    setIconInput("");
    setIconOverride("");
  };

  const handleDefaultIcons = () => {
    setIconInput("");
    setIconOverride(null);
  };

  const noIconActive = iconOverride === "";
  const defaultIconActive = iconOverride === null;
  const customIconActive = !noIconActive && !defaultIconActive;
  const handleInsert = (html) => {
    if (typeof onInsert !== "function") return;
    onInsert(html);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger */}
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-foreground hover:bg-surface-soft hover:border-border transition shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 text-warning" />
          Insert CTA Button
        </button>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-warning-soft flex items-center justify-center">
                  <Zap className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    CTA Button Picker
                  </h2>
                  <p className="text-[10px] text-muted">
                    Copy HTML → paste in CKEditor's Insert HTML
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-surface-soft text-muted hover:text-foreground transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Config */}
            <div className="px-6 py-4 border-b border-border bg-surface-soft shrink-0 space-y-3">

              {/* Row 1 — Link + Label */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Button Link
                  </label>
                  <input
                    type="text"
                    value={href}
                    onChange={(e) => setHref(e.target.value)}
                    placeholder="https://your-link.com"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider">
                    Button Label{" "}
                    <span className="font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Leave blank to use default"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              {/* Row 2 — Icon control */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                  <Smile className="w-3 h-3" /> Icon
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    value={iconInput}
                    onChange={(e) => handleIconInput(e.target.value)}
                    placeholder="Paste any emoji  e.g. 🎯"
                    className={`flex-1 min-w-[160px] text-sm px-3 py-2 rounded-xl border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${
                      customIconActive
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleNoIcon}
                    title="Remove icon from all buttons"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition whitespace-nowrap ${
                      noIconActive
                        ? "bg-primary text-white border-border"
                        : "bg-surface text-muted border-border hover:border-border hover:bg-surface-soft"
                    }`}
                  >
                    <span className="text-sm leading-none">∅</span> No icon
                  </button>
                  <button
                    type="button"
                    onClick={handleDefaultIcons}
                    title="Use each variant's default icon"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition whitespace-nowrap ${
                      defaultIconActive
                        ? "bg-primary text-white border-border"
                        : "bg-surface text-muted border-border hover:border-border hover:bg-surface-soft"
                    }`}
                  >
                    <span className="text-sm leading-none">✦</span> Default icons
                  </button>
                </div>
                <p className="text-[10px] text-muted h-3">
                  {noIconActive &&
                    "Icon removed — all buttons will render text-only."}
                  {defaultIconActive &&
                    "Using each variant's built-in default icon."}
                  {customIconActive &&
                    `"${iconInput}" applied to all variants.`}
                </p>
              </div>
            </div>

            {/* Instruction strip */}
            <div className="px-6 py-2 bg-primary-soft border-b border-primary shrink-0">
              <p className="text-[10px] text-primary font-medium">
                {typeof onInsert === "function" ? (
                  <>
                    Pick a style → click <strong>Insert</strong> to append it to the article, or copy the HTML for manual placement.
                  </>
                ) : (
                  <>
                    Pick a style → click <strong>Copy HTML</strong> → in CKEditor
                    click{" "}
                    <code className="bg-primary-soft px-1 rounded">
                      {"<>"} HTML Embed
                    </code>{" "}
                    or use{" "}
                    <code className="bg-primary-soft px-1 rounded">
                      Insert → HTML
                    </code>{" "}
                    and paste.
                  </>
                )}
              </p>
            </div>

            {/* Variants grid */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CTA_VARIANTS.map((v) => (
                  <VariantCard
                    key={v.id}
                    variant={v}
                    href={href}
                    customText={customText}
                    iconOverride={iconOverride}
                    onInsert={handleInsert}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border bg-surface-soft shrink-0">
              <p className="text-[10px] text-muted text-center">
                Styles are defined in{" "}
                <code className="bg-surface-soft px-1 rounded">
                  cta-buttons.css
                </code>{" "}
                — make sure it's loaded on your public blog pages.
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
