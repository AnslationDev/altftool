"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Check, Copy, Download, RotateCcw, Upload } from "lucide-react";

import {
  convertXmlToJson,
  INDENT_OPTIONS,
  MAX_INPUT_BYTES,
  PRESET_IDS,
  PRESETS,
  SAMPLE_XML,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full min-h-56 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-relaxed text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN");
const INDENT_LABEL = { 0: "Minified (no indent)", 2: "2 spaces", 4: "4 spaces" };

export default function ToolHome() {
  const [xml, setXml] = useState(SAMPLE_XML);
  const [preset, setPreset] = useState("fastXmlParser");
  const [indent, setIndent] = useState(2);
  const [forceArrayTags, setForceArrayTags] = useState("");
  const [parseNumbers, setParseNumbers] = useState(false);
  const [textKeyOverride, setTextKeyOverride] = useState("");
  const [fileName, setFileName] = useState("");
  const [readError, setReadError] = useState("");
  const [copied, setCopied] = useState(false);

  const overrides = useMemo(
    () => (textKeyOverride.trim() ? { textKey: textKeyOverride.trim() } : {}),
    [textKeyOverride],
  );

  const result = useMemo(
    () =>
      convertXmlToJson(xml, {
        preset,
        overrides,
        indent,
        forceArrayTags,
        parseNumbers,
        parseBooleans: parseNumbers,
      }),
    [xml, preset, overrides, indent, forceArrayTags, parseNumbers],
  );

  const error = readError || result.error || null;
  const activePreset = PRESETS[preset] || PRESETS.fastXmlParser;

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const onFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_INPUT_BYTES) {
      setReadError(`"${file.name}" is larger than the ${Math.round(MAX_INPUT_BYTES / 1024 / 1024)} MB limit.`);
      return;
    }
    try {
      const text = await file.text();
      setXml(text);
      setFileName(file.name);
      setReadError("");
    } catch {
      setReadError("That file could not be read in this browser.");
    }
  };

  const download = () => {
    if (result.error) return;
    const base = fileName.replace(/\.xml$/i, "") || result.rootName || "data";
    const blob = new Blob([result.json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${base}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(result.json);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setXml(SAMPLE_XML);
    setPreset("fastXmlParser");
    setIndent(2);
    setForceArrayTags("");
    setParseNumbers(false);
    setTextKeyOverride("");
    setFileName("");
    setReadError("");
    setCopied(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <ArrowRightLeft className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          XML to JSON Converter
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Convert XML into the exact JSON shape your parser already expects — fast-xml-parser,
          xml2js, xml-js compact, BadgerFish or plain keys.
        </p>
      </header>

      <div>
        <label className={LABEL_CLASS} htmlFor="x2jc-xml">
          XML input
        </label>
        <textarea
          id="x2jc-xml"
          className={`${TEXTAREA_CLASS} mt-1`}
          value={xml}
          onChange={(event) => {
            setXml(event.target.value);
            setReadError("");
          }}
          spellCheck={false}
          placeholder="<order id='SO-1'><line sku='A'>Item</line></order>"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={LABEL_CLASS} htmlFor="x2jc-preset">
            Output convention
          </label>
          <select
            id="x2jc-preset"
            className={`${INPUT_CLASS} mt-1`}
            value={preset}
            onChange={(event) => setPreset(event.target.value)}
          >
            {PRESET_IDS.map((id) => (
              <option key={id} value={id}>
                {PRESETS[id].label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">{activePreset.note}</p>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="x2jc-indent">
            Indentation
          </label>
          <select
            id="x2jc-indent"
            className={`${INPUT_CLASS} mt-1`}
            value={String(indent)}
            onChange={(event) => setIndent(Number(event.target.value))}
          >
            {INDENT_OPTIONS.map((option) => (
              <option key={option} value={String(option)}>
                {INDENT_LABEL[option]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="x2jc-force">
            Always array for these tags (comma separated)
          </label>
          <input
            id="x2jc-force"
            type="text"
            className={`${INPUT_CLASS} mt-1`}
            value={forceArrayTags}
            onChange={(event) => setForceArrayTags(event.target.value)}
            placeholder="line, item"
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="x2jc-textkey">
            Text key override (blank uses the preset&apos;s)
          </label>
          <input
            id="x2jc-textkey"
            type="text"
            className={`${INPUT_CLASS} mt-1`}
            value={textKeyOverride}
            onChange={(event) => setTextKeyOverride(event.target.value)}
            maxLength={16}
            placeholder={activePreset.textKey}
          />
        </div>

        <div>
          <span className={LABEL_CLASS}>Value typing</span>
          <label className="mt-1 flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="x2jc-numbers">
            <input
              id="x2jc-numbers"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={parseNumbers}
              onChange={(event) => setParseNumbers(event.target.checked)}
            />
            Parse numbers and true/false
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className={GHOST_BTN} htmlFor="x2jc-file">
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload .xml
          <input id="x2jc-file" type="file" accept=".xml,text/xml,application/xml" className="sr-only" onChange={onFile} />
        </label>
        <button type="button" className={PRIMARY_BTN} onClick={copy} disabled={Boolean(error)} aria-label="Copy the JSON output to the clipboard">
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy JSON"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={download} disabled={Boolean(error)} aria-label="Download the JSON file">
          <Download className="h-4 w-4" aria-hidden="true" />
          Download .json
        </button>
        <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset every option and restore the sample XML">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
        {fileName ? <span className="text-xs text-[var(--muted-foreground)]">{fileName}</span> : null}
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      {!error && result.collisions.length > 0 ? (
        <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          Plain mode merges attributes into ordinary keys, and these clash with a child element of
          the same name: {result.collisions.join(", ")}. Pick a prefixed or grouped convention to
          keep them apart.
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">JSON characters produced</p>
        <p className="mt-1 text-4xl font-bold tabular-nums text-[var(--foreground)]">
          {error ? DASH : NUM.format(result.bytes)}
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Convention</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">{error ? DASH : result.presetLabel}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Root element</dt>
            <dd className="font-mono text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : `<${result.rootName}>`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Elements / attributes</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : `${NUM.format(result.elements)} / ${NUM.format(result.attributes)}`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Deepest nesting</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : `${NUM.format(result.depth)} levels`}
            </dd>
          </div>
        </dl>
      </section>

      {!error ? (
        <section className="mt-5">
          <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">JSON output</h2>
          <pre className="max-h-[32rem] overflow-auto rounded-xl bg-[var(--card)] p-4 font-mono text-xs leading-relaxed text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {result.json}
          </pre>
        </section>
      ) : null}

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">What each convention does</h2>
        <div className="overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <caption className="sr-only">Comparison of the supported JSON output conventions</caption>
            <thead>
              <tr className="bg-[var(--card)]">
                <th scope="col" className="px-3 py-2 text-left font-semibold text-[var(--foreground)]">Convention</th>
                <th scope="col" className="px-3 py-2 text-left font-semibold text-[var(--foreground)]">Attributes</th>
                <th scope="col" className="px-3 py-2 text-left font-semibold text-[var(--foreground)]">Text</th>
                <th scope="col" className="px-3 py-2 text-left font-semibold text-[var(--foreground)]">Single child</th>
              </tr>
            </thead>
            <tbody>
              {PRESET_IDS.map((id) => {
                const item = PRESETS[id];
                const attributes =
                  item.attributeMode === "prefix"
                    ? `prefix "${item.attributePrefix}"`
                    : item.attributeMode === "group"
                      ? `grouped under "${item.attributeGroupKey}"`
                      : item.attributeMode === "merge"
                        ? "merged as plain keys"
                        : "dropped";
                return (
                  <tr key={id} className="border-t border-[var(--border)]">
                    <th scope="row" className="px-3 py-2 text-left font-semibold text-[var(--foreground)]">
                      {item.label}
                    </th>
                    <td className="px-3 py-2 text-[var(--muted-foreground)]">{attributes}</td>
                    <td className="px-3 py-2 font-mono text-xs text-[var(--muted-foreground)]">{item.textKey}</td>
                    <td className="px-3 py-2 text-[var(--muted-foreground)]">
                      {item.alwaysArray ? "always an array" : "object or string"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
