"use client";

import { useState, useCallback } from "react";
import {
  HelpCircle,
  X,
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  CopyPlus,
  Code2,
} from "lucide-react";

/* ─────────────────────────────────────────────
   TYPES
   { q: string, a: string }[]
───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   HTML GENERATOR
───────────────────────────────────────────── */
function generateHTML({ faqs, title, wrapClass, iconStyle }) {
  const wrap = wrapClass?.trim() || "FAQ_WRAPPER";
  const iconAttr = iconStyle !== "none" ? ` data-icon="${iconStyle}"` : "";

  let html = "<!-- FAQ Start -->\n";
  if (title?.trim()) html += `<h2 class="FAQ_HEADING">${title.trim()}</h2>\n`;
  html += `<div class="${wrap}"${iconAttr}>\n`;

  faqs.forEach((f) => {
    html += `\n  <div class="FAQ_ITEM">\n`;
    html += `    <button class="FAQ_Q">\n`;
    html += `      <span>${f.q || ""}</span>\n`;
    if (iconStyle !== "none") html += `      <span class="FAQ_ICON"></span>\n`;
    html += `    </button>\n`;
    html += `    <div class="FAQ_A">\n      <p>${f.a || ""}</p>\n    </div>\n`;
    html += `  </div>`;
  });

  html += "\n\n</div>\n<!-- FAQ End -->";
  return html;
}

/* ─────────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────────── */
function CopyButton({ html, size = "default" }) {
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
    setTimeout(() => setCopied(false), 2200);
  };

  const base =
    "inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all";
  const sizes =
    size === "sm"
      ? "text-[10px] px-2.5 py-1.5"
      : "text-xs px-3 py-1.5";
  const style = copied
    ? "bg-green-50 text-green-700 border border-green-200"
    : "bg-gray-900 text-white hover:bg-gray-700";

  return (
    <button onClick={handleCopy} type="button" className={`${base} ${sizes} ${style}`}>
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
   FAQ ITEM ROW (editor)
───────────────────────────────────────────── */
function FAQItemRow({ faq, index, total, onChange, onRemove, onDuplicate, onMove }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white hover:border-gray-200 transition-all">
      {/* Row header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
        <span className="text-[10px] font-bold text-gray-400 min-w-[18px]">
          #{index + 1}
        </span>
        <span className="flex-1 text-xs text-gray-500 truncate">
          {faq.q || "New question"}
        </span>
        <div className="flex items-center gap-1">
          {/* Duplicate */}
          <button
          type="button"
            title="Duplicate"
            onClick={() => onDuplicate(index)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <CopyPlus className="w-3 h-3" />
          </button>
          {/* Move up */}
          <button
          type="button"
            title="Move up"
            disabled={index === 0}
            onClick={() => onMove(index, -1)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          {/* Move down */}
          <button
          type="button"
            title="Move down"
            disabled={index === total - 1}
            onClick={() => onMove(index, 1)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
          {/* Delete */}
          <button
          type="button"
            title="Delete"
            onClick={() => onRemove(index)}
            className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="p-3 flex flex-col gap-2">
        <input
          type="text"
          placeholder="Question"
          value={faq.q}
          onChange={(e) => onChange(index, "q", e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400"
        />
        <textarea
          placeholder="Answer"
          rows={2}
          value={faq.a}
          onChange={(e) => onChange(index, "a", e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 resize-none"
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LIVE PREVIEW ACCORDION ITEM
───────────────────────────────────────────── */
function PreviewItem({ faq, isOpen, onToggle, iconStyle }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
      type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left hover:bg-gray-50 transition"
      >
        <span>{faq.q || "Question"}</span>
        {iconStyle === "chevron" ? (
          isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          )
        ) : iconStyle === "plus" ? (
          <span className="text-gray-400 font-light text-base leading-none shrink-0">
            {isOpen ? "−" : "+"}
          </span>
        ) : null}
      </button>
      {isOpen && faq.a && (
        <div className="px-4 pb-3 text-xs text-gray-500 leading-relaxed border-t border-gray-50">
          {faq.a}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ICON STYLE TOGGLE
───────────────────────────────────────────── */
const ICON_STYLES = [
  { id: "plus", label: "+ / −" },
  { id: "chevron", label: "Chevron" },
  { id: "none", label: "None" },
];

function IconStyleToggle({ value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {ICON_STYLES.map((s) => (
        <button
        type="button"
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition ${
            value === s.id
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT — FAQPicker
───────────────────────────────────────────── */
export default function FAQPicker({ trigger, onInsert }) {
  const [open, setOpen] = useState(false);
  const [faqs, setFaqs] = useState([
    { q: "What is your refund policy?", a: "We offer a full refund within 30 days of purchase, no questions asked." },
    { q: "How do I reset my password?", a: "Click Forgot password on the login page and follow the email instructions." },
  ]);
  const [openIdx, setOpenIdx] = useState(null);
  const [title, setTitle] = useState("");
  const [wrapClass, setWrapClass] = useState("FAQ_WRAPPER");
  const [iconStyle, setIconStyle] = useState("plus");
  const [accordionMode, setAccordionMode] = useState("single");
  const [codeOpen, setCodeOpen] = useState(false);

  const html = generateHTML({ faqs, title, wrapClass, iconStyle });

  const handleInsert = () => {
    if (typeof onInsert !== "function") return;
    onInsert(html);
    setOpen(false);
  };

  const updateFAQ = useCallback((i, key, value) => {
    setFaqs((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: value };
      return next;
    });
  }, []);

  const addFAQ = () => {
    setFaqs((prev) => [...prev, { q: "", a: "" }]);
  };

  const removeFAQ = (i) => {
    setFaqs((prev) => prev.filter((_, idx) => idx !== i));
    setOpenIdx(null);
  };

  const dupFAQ = (i) => {
    setFaqs((prev) => {
      const next = [...prev];
      next.splice(i + 1, 0, { ...prev[i] });
      return next;
    });
  };

  const moveFAQ = (i, dir) => {
    const n = i + dir;
    if (n < 0 || n >= faqs.length) return;
    setFaqs((prev) => {
      const next = [...prev];
      [next[i], next[n]] = [next[n], next[i]];
      return next;
    });
  };

  const togglePreview = (i) => {
    if (accordionMode === "single") {
      setOpenIdx((prev) => (prev === i ? null : i));
    } else {
      setOpenIdx((prev) => (prev === i ? null : i));
    }
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
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
          Insert FAQ Section
        </button>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">FAQ Builder</h2>
                  <p className="text-[10px] text-gray-400">
                    Build, preview, then copy HTML for your CKEditor
                  </p>
                </div>
              </div>
              <button
              type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Config panel */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0 space-y-3">
              <div className="flex gap-3 flex-wrap">
                <div className="flex-[2] min-w-[180px] space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Section heading <span className="font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Frequently Asked Questions"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                  />
                </div>
                <div className="flex-1 min-w-[140px] space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Wrapper class
                  </label>
                  <input
                    type="text"
                    value={wrapClass}
                    onChange={(e) => setWrapClass(e.target.value)}
                    placeholder="FAQ_WRAPPER"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="flex gap-4 flex-wrap items-end">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Icon style
                  </label>
                  <IconStyleToggle value={iconStyle} onChange={setIconStyle} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Accordion behaviour
                  </label>
                  <div className="flex gap-1.5">
                    {[
                      { id: "single", label: "Single open" },
                      { id: "multi", label: "Multi open" },
                    ].map((m) => (
                      <button
                      type="button"
                        key={m.id}
                        onClick={() => setAccordionMode(m.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition ${
                          accordionMode === m.id
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Info strip */}
            <div className="px-6 py-2 bg-blue-50 border-b border-blue-100 shrink-0">
              <p className="text-[10px] text-blue-600 font-medium">
                Add your Q&A pairs → live preview updates below → click{" "}
                <strong>Copy HTML</strong> → paste in CKEditor's{" "}
                <code className="bg-blue-100 px-1 rounded">{"<>"} HTML Embed</code>
              </p>
            </div>

            {/* FAQ items editor */}
            <div className="px-6 py-4 border-b border-gray-100 shrink-0 max-h-[240px] overflow-y-auto space-y-2">
              {faqs.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  No FAQ items yet — click "Add FAQ item" below.
                </p>
              )}
              {faqs.map((faq, i) => (
                <FAQItemRow
                  key={i}
                  faq={faq}
                  index={i}
                  total={faqs.length}
                  onChange={updateFAQ}
                  onRemove={removeFAQ}
                  onDuplicate={dupFAQ}
                  onMove={moveFAQ}
                />
              ))}
              <button
              type="button"
                onClick={addFAQ}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-gray-200 text-[11px] font-semibold text-gray-400 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition mt-1"
              >
                <Plus className="w-3 h-3" /> Add FAQ item
              </button>
            </div>

            {/* Live preview */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              {title && (
                <p className="text-sm font-semibold text-gray-800 mb-3">{title}</p>
              )}
              {faqs.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">
                  Add items above to see a preview.
                </p>
              )}
              {faqs.map((faq, i) => (
                <PreviewItem
                  key={i}
                  faq={faq}
                  isOpen={openIdx === i}
                  onToggle={() => togglePreview(i)}
                  iconStyle={iconStyle}
                />
              ))}
            </div>

            {/* Expandable HTML code block */}
            <div className="shrink-0 border-t border-gray-100">
              <button
              type="button"
                onClick={() => setCodeOpen((v) => !v)}
                className="w-full flex items-center justify-between px-6 py-2.5 bg-gray-50 hover:bg-gray-100 text-xs text-gray-500 hover:text-gray-700 transition"
              >
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3 h-3" /> View generated HTML
                </span>
                {codeOpen ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
              {codeOpen && (
                <div className="bg-gray-900 px-6 py-4 max-h-[180px] overflow-y-auto">
                  <pre className="text-[10px] text-green-300 font-mono whitespace-pre-wrap break-all leading-relaxed">
                    {html}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
              <p className="text-[10px] text-gray-400">
                {faqs.length} item{faqs.length !== 1 ? "s" : ""} ·{" "}
                Styles defined in <code className="bg-gray-100 px-1 rounded">faq.css</code>
              </p>
              <div className="flex items-center gap-2">
                {typeof onInsert === "function" ? (
                  <button
                    type="button"
                    onClick={handleInsert}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Plus className="h-3 w-3" />
                    Insert into content
                  </button>
                ) : null}
                <CopyButton html={html} />
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
