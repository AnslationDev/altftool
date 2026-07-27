"use client";

import { useMemo, useState } from "react";
import { Braces, Check, Copy, RotateCcw } from "lucide-react";

import {
  ARRAY_FORMATS,
  OBJECT_FORMATS,
  SPACE_FORMATS,
  buildQuery,
  parseJsonInput,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-US");

const DEFAULT_JSON = JSON.stringify(
  {
    q: "café latte & pastry",
    page: 2,
    tags: ["new", "sale"],
    filter: { colour: "blue", size: "M" },
    inStock: true,
  },
  null,
  2,
);

const DEFAULT_BASE = "https://api.example.com/v1/search";

export default function ToolHome() {
  const [json, setJson] = useState(DEFAULT_JSON);
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE);
  const [arrayFormat, setArrayFormat] = useState("repeat");
  const [objectFormat, setObjectFormat] = useState("brackets");
  const [spaceFormat, setSpaceFormat] = useState("percent20");
  const [strict, setStrict] = useState(false);
  const [encodeBrackets, setEncodeBrackets] = useState(true);
  const [skipNull, setSkipNull] = useState(true);
  const [sortKeys, setSortKeys] = useState(false);
  const [copied, setCopied] = useState("");

  const result = useMemo(() => {
    const parsed = parseJsonInput(json);
    if (parsed.error) return { error: parsed.error };
    return buildQuery(parsed.value, {
      arrayFormat,
      objectFormat,
      spaceFormat,
      strict,
      encodeBrackets,
      skipNull,
      sortKeys,
      baseUrl,
    });
  }, [json, arrayFormat, objectFormat, spaceFormat, strict, encodeBrackets, skipNull, sortKeys, baseUrl]);

  const arrayNote = ARRAY_FORMATS.find((entry) => entry.id === arrayFormat)?.note ?? "";
  const objectNote = OBJECT_FORMATS.find((entry) => entry.id === objectFormat)?.note ?? "";

  const copy = async (value, key) => {
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
    setJson(DEFAULT_JSON);
    setBaseUrl(DEFAULT_BASE);
    setArrayFormat("repeat");
    setObjectFormat("brackets");
    setSpaceFormat("percent20");
    setStrict(false);
    setEncodeBrackets(true);
    setSkipNull(true);
    setSortKeys(false);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Braces className="h-4 w-4" aria-hidden="true" />
          RFC 3986 §2.3
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Query Parameter Encoder Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a JSON object into a query string that survives the trip. Pick how arrays and nested
          objects are flattened, whether a space is %20 or +, and see every parameter encoded one by
          one.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="qp-json">
          Parameters as JSON
        </label>
        <textarea
          id="qp-json"
          className={`mt-2 ${AREA_CLASS}`}
          rows={10}
          spellCheck={false}
          value={json}
          onChange={(event) => setJson(event.target.value)}
        />

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="qp-base">
            Base URL (optional)
          </label>
          <input
            id="qp-base"
            className={`mt-2 ${INPUT_CLASS} font-mono text-sm`}
            type="text"
            inputMode="url"
            spellCheck={false}
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="qp-array">
              Arrays
            </label>
            <select
              id="qp-array"
              className={`mt-2 ${INPUT_CLASS}`}
              value={arrayFormat}
              onChange={(event) => setArrayFormat(event.target.value)}
            >
              {ARRAY_FORMATS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{arrayNote}</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="qp-object">
              Nested objects
            </label>
            <select
              id="qp-object"
              className={`mt-2 ${INPUT_CLASS}`}
              value={objectFormat}
              onChange={(event) => setObjectFormat(event.target.value)}
            >
              {OBJECT_FORMATS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{objectNote}</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="qp-space">
              A space becomes
            </label>
            <select
              id="qp-space"
              className={`mt-2 ${INPUT_CLASS}`}
              value={spaceFormat}
              onChange={(event) => setSpaceFormat(event.target.value)}
            >
              {SPACE_FORMATS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          {[
            ["qp-strict", "Strict RFC 3986 — also encode ! ' ( ) *", strict, setStrict],
            ["qp-brackets", "Percent-encode [ and ] in keys", encodeBrackets, setEncodeBrackets],
            ["qp-null", "Drop parameters whose value is null", skipNull, setSkipNull],
            ["qp-sort", "Sort keys alphabetically", sortKeys, setSortKeys],
          ].map(([id, label, value, setter]) => (
            <label
              key={id}
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
              htmlFor={id}
            >
              <input
                id={id}
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={value}
                onChange={(event) => setter(event.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Query string
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Parameters", "Encoded length", "Full URL"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold text-[var(--muted-foreground)]">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Query string
                </p>
                <p className="mt-1 break-all font-mono text-lg font-semibold text-[var(--primary)] sm:text-xl">
                  ?{result.query}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copy(result.fullUrl || `?${result.query}`, "query")}
                  aria-label="Copy the encoded query string"
                  className={GHOST_BTN}
                >
                  {copied === "query" ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied === "query" ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Parameters", NUM.format(result.count)],
                ["Encoded length", `${NUM.format(result.length)} characters`],
                ["Full URL", result.fullUrl || result.baseError || "(no base URL given)"],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="min-w-0 break-all text-right font-mono font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {result.warnings.length > 0 && (
              <ul className="mt-4 space-y-2 text-xs leading-5">
                {result.warnings.map((warning) => (
                  <li
                    key={warning}
                    className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
                  >
                    {warning}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Parameter by parameter</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Key
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Raw value
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Encoded
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.pairs.map((row, index) => (
                    <tr
                      key={`${row.key}-${index}`}
                      className="border-b border-[var(--border)] align-top last:border-0"
                    >
                      <td className="py-2 pr-3 break-all font-mono">{row.encodedKey}</td>
                      <td className="py-2 pr-3 break-words text-[var(--muted-foreground)]">
                        {row.value === "" ? "(empty)" : row.value}
                      </td>
                      <td
                        className={`py-2 break-all font-mono ${
                          row.changed ? "text-[var(--primary)]" : ""
                        }`}
                      >
                        {row.encodedValue === "" ? "(empty)" : row.encodedValue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Non-ASCII text is encoded as the percent-encoded bytes of its UTF-8 form, so “é” costs three
        characters and most emoji cost twelve. There is no standard for arrays or nested objects in a
        query string — check what your server expects before you pick a format.
      </p>
    </main>
  );
}
