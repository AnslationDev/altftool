"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, FileLock, RotateCcw, Upload } from "lucide-react";

import {
  DEFAULT_ALGORITHM,
  MAX_BYTES,
  SRI_ALGORITHMS,
  buildSriTag,
  computeIntegrity,
  parseIntegrityAttribute,
  textToBytes,
} from "../lib";

const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE = `/* paste the exact bytes you will ship */
(function () {
  "use strict";
  console.log("hello");
})();
`;

const DEFAULTS = {
  text: SAMPLE,
  url: "https://cdn.example.com/lib/app.min.js",
  tagType: "script",
  crossOrigin: true,
  defer: false,
  algorithms: [DEFAULT_ALGORITHM],
};

const TAG_TYPES = [
  { id: "script", label: "Classic <script>" },
  { id: "module", label: "ES module <script type=module>" },
  { id: "stylesheet", label: "Stylesheet <link rel=stylesheet>" },
  { id: "preload-script", label: "Preload script" },
  { id: "preload-style", label: "Preload stylesheet" },
];

const DASH = "—";
const BYTES = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [fileBytes, setFileBytes] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [url, setUrl] = useState(DEFAULTS.url);
  const [tagType, setTagType] = useState(DEFAULTS.tagType);
  const [crossOrigin, setCrossOrigin] = useState(DEFAULTS.crossOrigin);
  const [defer, setDefer] = useState(DEFAULTS.defer);
  const [algorithms, setAlgorithms] = useState(DEFAULTS.algorithms);
  const [digestState, setDigestState] = useState({ digests: [], byteLength: 0 });
  const [checkValue, setCheckValue] = useState("");
  const [copied, setCopied] = useState("");

  const bytes = useMemo(() => fileBytes ?? textToBytes(text), [fileBytes, text]);

  useEffect(() => {
    let cancelled = false;
    computeIntegrity(bytes, algorithms).then((result) => {
      if (!cancelled) setDigestState(result);
    });
    return () => {
      cancelled = true;
    };
  }, [bytes, algorithms]);

  const expressions = digestState.digests ? digestState.digests.map((d) => d.expression) : [];
  const tag = buildSriTag({ url, expressions, tagType, crossOrigin, defer });

  const attributeCheck = useMemo(
    () => (checkValue.trim() ? parseIntegrityAttribute(checkValue) : null),
    [checkValue],
  );

  const error = fileError || digestState.error || tag.error || "";
  const ok = !error;
  const strongest = ok && expressions.length ? expressions[expressions.length - 1] : "";

  const toggleAlgorithm = (id) => {
    setAlgorithms((prev) => {
      const next = prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id];
      return SRI_ALGORITHMS.map((a) => a.id).filter((a) => next.includes(a));
    });
    setCopied("");
  };

  const onFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    setFileError("");
    if (file.size > MAX_BYTES) {
      setFileError("That file is larger than 25 MB. Hash the built bundle you actually ship instead.");
      return;
    }
    const buffer = await file.arrayBuffer();
    setFileBytes(new Uint8Array(buffer));
    setFileName(file.name);
    setCopied("");
  };

  const clearFile = () => {
    setFileBytes(null);
    setFileName("");
    setFileError("");
    setCopied("");
  };

  const copy = async (key, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setText(DEFAULTS.text);
    setFileBytes(null);
    setFileName("");
    setFileError("");
    setUrl(DEFAULTS.url);
    setTagType(DEFAULTS.tagType);
    setCrossOrigin(DEFAULTS.crossOrigin);
    setDefer(DEFAULTS.defer);
    setAlgorithms(DEFAULTS.algorithms);
    setCheckValue("");
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileLock className="h-4 w-4" aria-hidden="true" />
          Subresource integrity
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Subresource Integrity Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Hash the exact bytes you ship and get the matching <code>integrity</code> attribute and
          tag. The digest is computed in this tab with the Web Crypto API — nothing is uploaded.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className={LABEL} htmlFor="sri-text">
            File contents
          </label>
          <label
            htmlFor="sri-file"
            className={`${GHOST_BTN} cursor-pointer px-3 text-xs`}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Choose a file
          </label>
          <input id="sri-file" type="file" className="sr-only" onChange={onFile} />
        </div>
        {fileName ? (
          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
            Hashing <span className="font-mono font-semibold text-[var(--foreground)]">{fileName}</span>
            <button
              type="button"
              onClick={clearFile}
              className="min-h-11 rounded-md px-2 font-semibold text-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              Use the pasted text instead
            </button>
          </p>
        ) : (
          <textarea
            id="sri-text"
            className={`mt-2 ${AREA}`}
            rows={7}
            spellCheck={false}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setCopied("");
            }}
          />
        )}

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Hash algorithms</legend>
          <div className="mt-2 grid gap-2">
            {SRI_ALGORITHMS.map((algorithm) => (
              <label
                key={algorithm.id}
                htmlFor={`sri-algo-${algorithm.id}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`sri-algo-${algorithm.id}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={algorithms.includes(algorithm.id)}
                  onChange={() => toggleAlgorithm(algorithm.id)}
                />
                <span>
                  <span className="font-semibold">{algorithm.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {algorithm.note}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="sri-url">
              Resource URL
            </label>
            <input
              id="sri-url"
              className={`mt-2 ${FIELD}`}
              type="text"
              inputMode="url"
              spellCheck={false}
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setCopied("");
              }}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="sri-tag-type">
              Tag to generate
            </label>
            <select
              id="sri-tag-type"
              className={`mt-2 ${FIELD}`}
              value={tagType}
              onChange={(event) => {
                setTagType(event.target.value);
                setCopied("");
              }}
            >
              {TAG_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 grid gap-2">
          <label
            htmlFor="sri-crossorigin"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <input
              id="sri-crossorigin"
              type="checkbox"
              className="h-5 w-5 shrink-0 accent-[var(--primary)]"
              checked={crossOrigin}
              onChange={(event) => {
                setCrossOrigin(event.target.checked);
                setCopied("");
              }}
            />
            <span>Add crossorigin=&quot;anonymous&quot;</span>
          </label>
          {tagType === "script" ? (
            <label
              htmlFor="sri-defer"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <input
                id="sri-defer"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={defer}
                onChange={(event) => {
                  setDefer(event.target.checked);
                  setCopied("");
                }}
              />
              <span>Add defer</span>
            </label>
          ) : null}
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Integrity attribute
            </p>
            <p className="mt-1 break-all font-mono text-sm font-semibold leading-6 text-[var(--primary)] sm:text-base">
              {ok && strongest ? strongest : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("integrity", ok ? tag.integrity : "")}
              aria-label="Copy the integrity attribute value"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied === "integrity" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "integrity" ? "Copied!" : "Copy hash"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the generator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Bytes hashed</dt>
            <dd className="text-right font-semibold">
              {ok ? `${BYTES.format(digestState.byteLength ?? 0)} bytes` : DASH}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Expressions in the attribute</dt>
            <dd className="text-right font-semibold">{ok ? expressions.length : DASH}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Browser will enforce</dt>
            <dd className="text-right font-semibold">
              {ok && expressions.length
                ? `${SRI_ALGORITHMS.find((a) => a.id === algorithms[algorithms.length - 1])?.label ?? DASH} only`
                : DASH}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">CORS required</dt>
            <dd className="text-right font-semibold">
              {ok ? (tag.crossOriginRequired ? "Yes, cross-origin URL" : "No, same-origin URL") : DASH}
            </dd>
          </div>
        </dl>

        {ok && tag.warnings && tag.warnings.length ? (
          <div className="mt-4 grid gap-2">
            {tag.warnings.map((warning) => (
              <p
                key={warning}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm leading-6 text-[var(--warning)]"
              >
                {warning}
              </p>
            ))}
          </div>
        ) : null}
      </section>

      {ok ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Ready-to-paste tag</h2>
              <button
                type="button"
                onClick={() => copy("tag", tag.html)}
                aria-label="Copy the generated HTML tag"
                className={`${GHOST_BTN} px-3 text-xs`}
              >
                {copied === "tag" ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied === "tag" ? "Copied!" : "Copy tag"}
              </button>
            </div>
            <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              <pre className="min-w-max font-mono text-xs leading-6">{tag.html}</pre>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">All computed digests</h2>
            <div className="mt-3 grid gap-2">
              {digestState.digests.map((digest) => (
                <div
                  key={digest.id}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {digest.label}
                  </p>
                  <p className="mt-1 break-all font-mono text-xs leading-5">{digest.expression}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL} htmlFor="sri-check">
          Check an existing integrity attribute
        </label>
        <textarea
          id="sri-check"
          className={`mt-2 ${AREA}`}
          rows={3}
          spellCheck={false}
          placeholder="sha384-… sha256-…"
          value={checkValue}
          onChange={(event) => setCheckValue(event.target.value)}
        />
        {attributeCheck ? (
          <div className="mt-3 grid gap-2 text-sm">
            {attributeCheck.error ? (
              <p className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]" role="alert">
                {attributeCheck.error}
              </p>
            ) : (
              <>
                {attributeCheck.entries.map((entry) => (
                  <p
                    key={entry.token}
                    className={`break-all rounded-md px-3 py-2 text-xs leading-5 ${
                      entry.valid
                        ? "bg-[var(--success-soft)] text-[var(--success)]"
                        : "bg-[var(--danger-soft)] text-[var(--danger)]"
                    }`}
                  >
                    <span className="font-mono">{entry.token}</span>
                    {entry.problem ? <span className="mt-1 block">{entry.problem}</span> : null}
                  </p>
                ))}
                {attributeCheck.valid ? (
                  <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                    Strongest algorithm present is {attributeCheck.strongest}, so the browser enforces{" "}
                    {attributeCheck.effective.length} expression
                    {attributeCheck.effective.length === 1 ? "" : "s"} and ignores the rest.
                  </p>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Integrity metadata pins one exact byte sequence. If the CDN serves a differently compressed
        or minified build, the hash will not match and the resource will be blocked — regenerate the
        attribute whenever the file changes.
      </p>
    </main>
  );
}
