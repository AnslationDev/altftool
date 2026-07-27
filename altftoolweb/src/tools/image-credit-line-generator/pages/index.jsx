"use client";

import { useMemo, useState } from "react";
import { Camera, Check, Copy, RotateCcw, TriangleAlert } from "lucide-react";

import { CREDIT_STYLES, RIGHTS_TERMS, buildCreditLine } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  style: "wire",
  photographer: "Jane Doe",
  agency: "Northwind Press",
  owner: "",
  source: "",
  handle: "",
  year: "",
  rights: "editorial",
};

const FIELDS = [
  ["photographer", "Photographer / creator", "Jane Doe"],
  ["agency", "Agency or publication to credit", "Northwind Press"],
  ["owner", "Collection or rights owner", "Tate Collection"],
  ["source", "Source (where the file came from)", "Northwind photo archive"],
  ["handle", "Social handle (for the social style)", "janedoe"],
  ["year", "Year", "2024"],
];

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied("");
  };

  const result = useMemo(() => buildCreditLine(form), [form]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      result.creditLine,
      "",
      "IPTC fields:",
      ...result.iptc.map((row) => `${row.field}: ${row.value}`),
    ].join("\n");
  }, [result]);

  const copyValue = async (key, value) => {
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
    setForm(DEFAULTS);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Camera className="h-4 w-4" aria-hidden="true" />
          Metadata and credits
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Image Credit Line Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build the credit line in wire, magazine, caption, social, museum or academic style —
          and get the four IPTC fields the file itself should carry, each with a different value.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cred-style">
              Credit style
            </label>
            <select id="cred-style" className={`mt-2 ${INPUT_CLASS}`} value={form.style} onChange={set("style")}>
              {Object.entries(CREDIT_STYLES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          {FIELDS.map(([key, labelText, placeholder]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`cred-${key}`}>
                {labelText}
              </label>
              <input
                id={`cred-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                inputMode={key === "year" ? "numeric" : "text"}
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cred-rights">
              Usage terms
            </label>
            <select id="cred-rights" className={`mt-2 ${INPUT_CLASS}`} value={form.rights} onChange={set("rights")}>
              {Object.entries(RIGHTS_TERMS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Credit line</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {["Creator (By-line)", "Credit Line", "Source", "Copyright Notice"].map((label) => (
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
                  Credit line
                </p>
                <p className="mt-1 break-words text-xl font-semibold leading-8 text-[var(--primary)] sm:text-2xl">
                  {result.creditLine}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{result.styleNote}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyValue("summary", summary)}
                  aria-label="Copy the credit line and IPTC fields"
                  className={GHOST_BTN}
                >
                  {copied === "summary" ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied === "summary" ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {result.iptc.map((row) => (
                <div key={row.field} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="shrink-0 text-[var(--muted-foreground)]">
                    {row.field}
                    <span className="mt-0.5 block text-xs">{row.purpose}</span>
                  </dt>
                  <dd className="text-right font-semibold">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {result.warnings.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Check before you publish</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                {result.warnings.map((warning) => (
                  <li
                    key={warning}
                    className="flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
                  >
                    <TriangleAlert className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">The same credit in every style</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Style
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Credit line
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Copy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.allStyles.map(([name, line]) => (
                    <tr key={name} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{name}</td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{line}</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => copyValue(name, line)}
                          aria-label={`Copy the ${name} credit line`}
                          className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                        >
                          {copied === name ? (
                            <Check className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Copy className="h-4 w-4" aria-hidden="true" />
                          )}
                          {copied === name ? "Copied!" : "Copy"}
                        </button>
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
        Write the credit into the file&apos;s IPTC metadata as well as the caption. Captions get
        rewritten and stripped as an image travels; embedded metadata is what survives.
      </p>
    </main>
  );
}
