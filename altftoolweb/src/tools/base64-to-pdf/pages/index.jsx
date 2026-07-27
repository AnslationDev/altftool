"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, FileText, RotateCcw } from "lucide-react";

import { analyzeBase64Pdf, MAX_PREVIEW_BYTES, formatBytes } from "../lib";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** A hand-built, spec-valid one-page PDF 1.4, so first paint shows a real decode. */
const SAMPLE_BASE64 =
  "JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgMzAwIDEyMF0vQ29udGVudHMgNCAwIFIvUmVzb3VyY2VzPDwvRm9udDw8L0YxIDUgMCBSPj4+Pj4+ZW5kb2JqCjQgMCBvYmo8PC9MZW5ndGggNTA+PnN0cmVhbQpCVCAvRjEgMTggVGYgMjQgNDQgVGQgKEFsdEZUb29sIHNhbXBsZSBQREYpIFRqIEVUCmVuZHN0cmVhbWVuZG9iago1IDAgb2JqPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj5lbmRvYmoKNiAwIG9iajw8L1RpdGxlKEFsdEZUb29sIHNhbXBsZSkvUHJvZHVjZXIoQWx0RlRvb2wpPj5lbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTIgMDAwMDAgbiAKMDAwMDAwMDEwMSAwMDAwMCBuIAowMDAwMDAwMjExIDAwMDAwIG4gCjAwMDAwMDAzMDUgMDAwMDAgbiAKMDAwMDAwMDM2NiAwMDAwMCBuIAp0cmFpbGVyPDwvU2l6ZSA3L1Jvb3QgMSAwIFIvSW5mbyA2IDAgUj4+CnN0YXJ0eHJlZgo0MjYKJSVFT0YK";

const DASH = "—";
const integer = new Intl.NumberFormat("en-US");

function base64ToBlob(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: "application/pdf" });
}

export default function ToolHome() {
  const [input, setInput] = useState(SAMPLE_BASE64);
  const [copied, setCopied] = useState("");
  const [blobUrl, setBlobUrl] = useState("");
  const copyTimer = useRef(null);

  const result = useMemo(() => analyzeBase64Pdf(input), [input]);
  const failed = Boolean(result.error);
  const payload = failed ? "" : result.base64;

  useEffect(() => {
    if (!payload) {
      setBlobUrl("");
      return undefined;
    }
    let url = "";
    try {
      url = URL.createObjectURL(base64ToBlob(payload));
    } catch {
      url = "";
    }
    setBlobUrl(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [payload]);

  const copy = async (key, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  };

  const download = () => {
    if (!blobUrl) return;
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const yesNo = (value) => (value ? "Yes" : "No");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <FileText aria-hidden="true" className="h-6 w-6 text-[var(--primary)]" />
          Base64 to PDF
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Paste raw Base64 or a <code>data:application/pdf;base64,</code> URL. The bytes are decoded in your browser,
          checked against the PDF header and trailer defined in ISO 32000-1, then previewed and offered as a download.
          Nothing is uploaded.
        </p>
      </header>

      <div className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="pdf-b64">
            Base64 PDF data
          </label>
          <textarea
            id="pdf-b64"
            className={`${TEXTAREA_CLASS} mt-1.5 min-h-40`}
            value={input}
            spellCheck={false}
            onChange={(event) => setInput(event.target.value)}
            placeholder="JVBERi0xLjcK... or data:application/pdf;base64,JVBERi0..."
          />
          <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
            Every real PDF starts with <code>%PDF-</code>, which is always <code>JVBERi0</code> in Base64. Limit{" "}
            {formatBytes(MAX_PREVIEW_BYTES)}.
          </p>
        </div>

        {failed ? (
          <p
            role="alert"
            className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Decoded PDF</p>
          <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">{failed ? DASH : result.sizeLabel}</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {failed
              ? DASH
              : `PDF ${result.version}${result.pageCountVisible ? ` · ${result.pageObjects} page${result.pageObjects === 1 ? "" : "s"}` : ""}`}
          </p>

          <div className="mt-4 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--background)]">
            {failed || !blobUrl ? (
              <p className="flex min-h-40 items-center justify-center px-3 text-sm text-[var(--muted-foreground)]">
                No preview {DASH} fix the input above.
              </p>
            ) : (
              <iframe title="Decoded PDF preview" src={blobUrl} className="h-80 w-full border-0" />
            )}
          </div>

          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">PDF version</dt>
              <dd className="font-semibold text-[var(--foreground)]">{failed ? DASH : result.version}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Decoded bytes</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.bytes)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Base64 characters</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.base64Length)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Encoding overhead</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : `+${result.overheadPercent}%`}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Page objects found</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : result.pageCountVisible ? integer.format(result.pageObjects) : "Hidden (compressed)"}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Encrypted</dt>
              <dd className="font-semibold text-[var(--foreground)]">{failed ? DASH : yesNo(result.encrypted)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Linearized (fast web view)</dt>
              <dd className="font-semibold text-[var(--foreground)]">{failed ? DASH : yesNo(result.linearized)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Interactive form</dt>
              <dd className="font-semibold text-[var(--foreground)]">{failed ? DASH : yesNo(result.hasAcroForm)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Ends with %%EOF</dt>
              <dd className="font-semibold text-[var(--foreground)]">{failed ? DASH : yesNo(result.hasEof)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Document title</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed || !result.title ? DASH : result.title}
              </dd>
            </div>
          </dl>

          {!failed && result.truncated ? (
            <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
              The cross-reference table or the %%EOF marker is missing, so this Base64 is probably truncated. Most
              viewers will still try to repair it, but pages may be lost.
            </p>
          ) : null}
          {!failed && !result.truncated ? (
            <p className="mt-3 text-xs text-[var(--success)]">
              Structurally complete: header, startxref and %%EOF are all present.
            </p>
          ) : null}
          {!failed && result.mimeMismatch ? (
            <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
              The data URL declares <strong>{result.declaredMime}</strong>, but these bytes are a PDF.
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className={PRIMARY_BTN}
              onClick={download}
              disabled={failed}
              aria-label="Download the decoded PDF file"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              Download PDF
            </button>
            <button
              type="button"
              className={GHOST_BTN}
              onClick={() => copy("dataurl", failed ? "" : result.dataUrl)}
              disabled={failed}
              aria-label="Copy the PDF data URL to the clipboard"
            >
              {copied === "dataurl" ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              {copied === "dataurl" ? "Copied!" : "Copy data URL"}
            </button>
            <button
              type="button"
              className={GHOST_BTN}
              onClick={() =>
                copy(
                  "summary",
                  failed
                    ? ""
                    : `PDF ${result.version}, ${result.sizeLabel} (${result.bytes} bytes), encrypted: ${yesNo(
                        result.encrypted,
                      )}, %%EOF present: ${yesNo(result.hasEof)}`,
                )
              }
              disabled={failed}
              aria-label="Copy the PDF summary to the clipboard"
            >
              {copied === "summary" ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              {copied === "summary" ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              className={GHOST_BTN}
              onClick={() => {
                setInput(SAMPLE_BASE64);
                setCopied("");
              }}
              aria-label="Reset to the sample PDF"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Reset
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
