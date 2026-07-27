"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FolderTree, RotateCcw } from "lucide-react";

import {
  CASE_STYLES,
  DATE_FORMATS,
  SEPARATORS,
  TOKENS,
  buildNamingConvention,
} from "../lib";

const DEFAULT_ORDER = ["brand", "project", "assetType", "variant", "dimensions", "date", "version"];

const DEFAULT_VALUES = {
  brand: "Northwind",
  project: "Spring Sale 2026",
  assetType: "logo",
  descriptor: "primary lockup",
  variant: "dark",
  colourMode: "rgb",
  dimensions: "1024x256",
  locale: "en-GB",
  extension: "svg",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [order, setOrder] = useState(DEFAULT_ORDER);
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [separator, setSeparator] = useState("-");
  const [caseStyle, setCaseStyle] = useState("lower");
  const [dateFormat, setDateFormat] = useState("YYYYMMDD");
  const [sampleDate, setSampleDate] = useState("2026-03-09");
  const [version, setVersion] = useState("2");
  const [versionPad, setVersionPad] = useState("2");
  const [folder, setFolder] = useState("brand/2026/spring-sale");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildNamingConvention({
        order,
        values,
        separator,
        caseStyle,
        dateFormat,
        sampleDate,
        version: Number(version),
        versionPad: Number(versionPad),
        folder,
      }),
    [order, values, separator, caseStyle, dateFormat, sampleDate, version, versionPad, folder],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const toggleToken = (key) => {
    setOrder((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : TOKENS.map((token) => token.key).filter(
            (tokenKey) => current.includes(tokenKey) || tokenKey === key,
          ),
    );
  };

  const moveToken = (key, direction) => {
    setOrder((current) => {
      const index = current.indexOf(key);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= current.length) return current;
      const copy = [...current];
      copy[index] = copy[next];
      copy[next] = key;
      return copy;
    });
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setOrder(DEFAULT_ORDER);
    setValues(DEFAULT_VALUES);
    setSeparator("-");
    setCaseStyle("lower");
    setDateFormat("YYYYMMDD");
    setSampleDate("2026-03-09");
    setVersion("2");
    setVersionPad("2");
    setFolder("brand/2026/spring-sale");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FolderTree className="h-4 w-4" aria-hidden="true" />
          Asset naming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Brand Asset Naming Convention Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Choose the tokens, order, separator and case, then check the result against the real
          filename limits on Windows, macOS, Linux and Amazon S3.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Tokens and order</h2>
        <ul className="mt-3 space-y-2">
          {TOKENS.map((token) => {
            const active = order.includes(token.key);
            const position = order.indexOf(token.key);
            return (
              <li
                key={token.key}
                className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2"
              >
                <input
                  id={`token-${token.key}`}
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--primary)]"
                  checked={active}
                  onChange={() => toggleToken(token.key)}
                />
                <label className="flex-1 text-sm font-semibold" htmlFor={`token-${token.key}`}>
                  {token.label}
                  <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                    {token.hint}
                  </span>
                </label>
                {active && (
                  <span className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveToken(token.key, -1)}
                      aria-label={`Move ${token.label} earlier`}
                      disabled={position <= 0}
                      className="min-h-11 min-w-11 rounded-md border border-[var(--border)] text-sm font-semibold disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveToken(token.key, 1)}
                      aria-label={`Move ${token.label} later`}
                      disabled={position === order.length - 1}
                      className="min-h-11 min-w-11 rounded-md border border-[var(--border)] text-sm font-semibold disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      ↓
                    </button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Style rules</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="naming-separator">
              Separator
            </label>
            <select
              id="naming-separator"
              className={`mt-2 ${INPUT_CLASS}`}
              value={separator}
              onChange={(event) => setSeparator(event.target.value)}
            >
              {SEPARATORS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="naming-case">
              Case
            </label>
            <select
              id="naming-case"
              className={`mt-2 ${INPUT_CLASS}`}
              value={caseStyle}
              onChange={(event) => setCaseStyle(event.target.value)}
            >
              {CASE_STYLES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="naming-dateformat">
              Date format
            </label>
            <select
              id="naming-dateformat"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dateFormat}
              onChange={(event) => setDateFormat(event.target.value)}
            >
              {DATE_FORMATS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="naming-sampledate">
              Sample date
            </label>
            <input
              id="naming-sampledate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={sampleDate}
              onChange={(event) => setSampleDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="naming-version">
              Version number
            </label>
            <input
              id="naming-version"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={version}
              onChange={(event) => setVersion(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="naming-pad">
              Version digits
            </label>
            <input
              id="naming-pad"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="4"
              step="1"
              value={versionPad}
              onChange={(event) => setVersionPad(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Sample values</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {TOKENS.filter((token) => token.key !== "date" && token.key !== "version").map((token) => (
            <div key={token.key}>
              <label className={LABEL_CLASS} htmlFor={`value-${token.key}`}>
                {token.label}
              </label>
              <input
                id={`value-${token.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={values[token.key] ?? ""}
                onChange={(event) =>
                  setValues((current) => ({ ...current, [token.key]: event.target.value }))
                }
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="value-extension">
              File extension
            </label>
            <input
              id="value-extension"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={values.extension ?? ""}
              onChange={(event) =>
                setValues((current) => ({ ...current, extension: event.target.value }))
              }
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="value-folder">
              Folder path (for the 260-character check)
            </label>
            <input
              id="value-folder"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Example filename
            </p>
            <p className="mt-1 break-all font-mono text-xl font-semibold text-[var(--primary)] sm:text-2xl">
              {hasError ? dash : result.primary}
            </p>
            <p className="mt-1 break-all text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : result.pattern}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the naming convention as Markdown"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy rules"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Filename length", dash],
                ["Bytes (UTF-8)", dash],
                ["Full path length", dash],
                ["POSIX portable", dash],
              ]
            : [
                ["Filename length", `${result.validation.chars} characters (limit 255 bytes)`],
                ["Bytes (UTF-8)", `${result.validation.bytes} bytes`],
                ["Full path length", `${result.validation.fullPath} characters (Windows MAX_PATH 260)`],
                ["POSIX portable", result.validation.portable ? "Yes" : "No"],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.validation.issues.length > 0 && (
          <ul role="alert" className="mt-4 space-y-2">
            {result.validation.issues.map((issue) => (
              <li
                key={issue}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {issue}
              </li>
            ))}
          </ul>
        )}
        {!hasError && result.validation.warnings.length > 0 && (
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.validation.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {warning}
              </li>
            ))}
          </ul>
        )}
        {!hasError &&
          result.validation.issues.length === 0 &&
          result.validation.warnings.length === 0 && (
            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--success)]">
              Passes every filename check for Windows, macOS, Linux and Amazon S3.
            </p>
          )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">The convention applied to a real export set</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Asset
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Filename
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.examples.map((row) => (
                  <tr key={row.filename} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {row.assetType} · {row.descriptor}
                    </td>
                    <td className="py-2 break-all font-mono">{row.filename}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">{result.sepNote}</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{result.caseNote}</p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Checks cover the POSIX portable filename character set, the Windows reserved names and
        forbidden characters, the 255-byte path component limit, the 260-character legacy MAX_PATH
        and the 1024-byte Amazon S3 key limit. Your DAM or CDN may impose stricter rules on top.
      </p>
    </main>
  );
}
