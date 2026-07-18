"use client";

import { useMemo, useState } from "react";
import {
  Car,
  CircleAlert,
  CircleCheck,
  Copy,
  Info,
  Palette,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import {
  DELHI_CLASSES,
  DIPLOMATIC_SERIES,
  DISTRICTS,
  EXAMPLES,
  FUN_FACTS,
  HSRP_FACTS,
  LEGACY_CODES,
  PLATE_TYPES,
  STATE_CODES,
  STATE_NOTES,
} from "../data";

const RE_BH = /^(\d{2})BH(\d{4})([A-Z]{1,2})$/;
const RE_DIPLOMATIC = /^(\d{1,3})(CD|CC|UN)(\d{1,4})$/;
const RE_STANDARD = /^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/;

const FANCY_NUMBERS = new Set([
  "0001",
  "0007",
  "0009",
  "0100",
  "0111",
  "0777",
  "0786",
  "1000",
  "1111",
  "2222",
  "3333",
  "4444",
  "5555",
  "6666",
  "7777",
  "8888",
  "9999",
]);

const normalize = (raw) => String(raw).toUpperCase().replace(/[^A-Z0-9]/g, "");

function decodePlate(raw) {
  const clean = normalize(raw);
  const invalid = (reason, detail) => ({ status: "invalid", clean, reason, detail });

  if (!clean) return { status: "empty" };

  const bh = RE_BH.exec(clean);
  if (bh) {
    const [, year, number, series] = bh;
    return {
      status: "ok",
      format: "BH (Bharat) series",
      clean,
      formatted: `${year} BH ${number} ${series}`,
      plateHint: "White plate, black text",
      rows: [
        {
          label: "Format",
          value: "Bharat (BH) series",
          hint: "Registered nationally, not with any one state. It moves with you when you are transferred.",
        },
        {
          label: "Year of first registration",
          value: `20${year}`,
          hint: "The opening two digits are a year, not an RTO code. BH is the only format that works this way.",
        },
        {
          label: "Vehicle number",
          value: number,
          hint: FANCY_NUMBERS.has(number) ? "A fancy number - these are auctioned, not allotted." : null,
        },
        {
          label: "Series",
          value: series,
          hint: "Runs A to Z, then AA to ZZ, once the four-digit block is exhausted.",
        },
        {
          label: "Road tax",
          value: "Paid every two years",
          hint: "Instead of fifteen years up front. No NOC or re-registration when you change states.",
        },
      ],
    };
  }

  if (/^\d{2}BH/.test(clean)) {
    return invalid(
      "This looks like a BH-series number, but the rest does not fit the pattern.",
      "A BH plate reads YY BH NNNN XX: two year digits, BH, a four-digit number, then one or two letters. Example: 22 BH 1234 A."
    );
  }

  const diplomatic = RE_DIPLOMATIC.exec(clean);
  if (diplomatic) {
    const [, countryCode, kind, number] = diplomatic;
    return {
      status: "ok",
      format: "Diplomatic",
      clean,
      formatted: `${countryCode} ${kind} ${number}`,
      plateHint: "Blue plate, white text",
      rows: [
        { label: "Format", value: "Diplomatic plate", hint: "Issued by the Ministry of External Affairs, not an RTO." },
        {
          label: "Country code",
          value: countryCode,
          hint: "A number assigned to each mission. It replaces the state code entirely.",
        },
        { label: "Series", value: kind, hint: DIPLOMATIC_SERIES[kind] },
        { label: "Vehicle number", value: number, hint: null },
      ],
    };
  }

  const standard = RE_STANDARD.exec(clean);
  if (standard) {
    const [, code, districtRaw, series, numberRaw] = standard;
    const state = STATE_CODES[code] || LEGACY_CODES[code];
    if (!state) {
      return invalid(
        `"${code}" is not an assigned state or UT code.`,
        "India uses 36 codes, plus BH for the Bharat series and CD, CC or UN for diplomatic plates. The full list is below."
      );
    }

    const districtKey = districtRaw.padStart(2, "0");
    const districtName = DISTRICTS[code]?.[districtKey] || null;
    const number = numberRaw.padStart(4, "0");

    let classLetter = null;
    let seriesLetters = series;
    if (code === "DL" && series.length > 0 && DELHI_CLASSES[series[0]]) {
      classLetter = series[0];
      seriesLetters = series.slice(1);
    }

    const formatted = (
      classLetter
        ? `DL ${Number(districtRaw)}${classLetter} ${seriesLetters} ${number}`
        : `${code} ${districtKey} ${series} ${number}`
    )
      .replace(/\s+/g, " ")
      .trim();

    const rows = [
      {
        label: "State / UT",
        value: state.name,
        hint: state.legacy || `${state.type} code "${code}".`,
      },
      {
        label: "RTO district",
        value: districtName || `District code ${districtKey}`,
        hint: districtName
          ? `RTO ${districtKey} of ${state.name}.`
          : `This tool does not carry a district map for ${state.name} yet, so only the code itself is shown. It is a valid RTO code.`,
      },
    ];

    if (classLetter) {
      rows.push({
        label: "Vehicle class",
        value: DELHI_CLASSES[classLetter],
        hint: `Delhi appends a class letter to the RTO code, so the "${classLetter}" in DL ${Number(districtRaw)}${classLetter} is the vehicle type.`,
      });
    }

    rows.push({
      label: "Series",
      value: seriesLetters || "None",
      hint: seriesLetters
        ? `Each series holds 10,000 numbers. ${seriesLetters.length === 3 ? "A three-letter series means a very busy RTO." : "Single letters run out first, then two, then three."}`
        : "An early plate from before this RTO started using series letters.",
    });

    rows.push({
      label: "Vehicle number",
      value: number,
      hint: FANCY_NUMBERS.has(number)
        ? "A fancy number. RTOs auction these rather than allot them in sequence, and the popular ones go for lakhs."
        : number.startsWith("00")
          ? "Numbers below 100 are written with leading zeros. These low numbers are auctioned, not allotted."
          : numberRaw.length < 4
            ? `You entered "${numberRaw}", which is padded to four digits on the plate.`
            : null,
    });

    return {
      status: "ok",
      format: "Standard all-India format",
      clean,
      formatted,
      plateHint: "White plate for private use, yellow if commercial",
      stateNote: STATE_NOTES[code] || null,
      rows,
    };
  }

  if (/^\d/.test(clean)) {
    return invalid(
      "This opens with digits, so it can only be a BH-series or a diplomatic number, and it fits neither.",
      "BH reads YY BH NNNN XX, for example 22 BH 1234 A. Diplomatic reads NN CD NNNN, for example 13 CD 0001."
    );
  }

  const head = clean.slice(0, 2);
  if (!/^[A-Z]{2}$/.test(head)) {
    return invalid(
      "A registration number opens with a two-letter state code.",
      "Examples: MH for Maharashtra, DL for Delhi, KA for Karnataka."
    );
  }
  if (!STATE_CODES[head] && !LEGACY_CODES[head]) {
    return invalid(
      `"${head}" is not an assigned state or UT code.`,
      "India uses 36 codes, plus BH for the Bharat series and CD, CC or UN for diplomatic plates. The full list is below."
    );
  }
  if (!/^[A-Z]{2}\d/.test(clean)) {
    return invalid(
      "A two-digit RTO district code must follow the state code.",
      `Example: ${head} 12 AB 1234.`
    );
  }

  const districtMatch = /^[A-Z]{2}(\d+)/.exec(clean);
  if (districtMatch && districtMatch[1].length > 2) {
    return invalid(
      `The RTO district code is at most two digits, but this has ${districtMatch[1].length}.`,
      `Example: ${head} 12 AB 1234.`
    );
  }

  const seriesMatch = /^[A-Z]{2}\d{1,2}([A-Z]+)\d{1,4}$/.exec(clean);
  if (seriesMatch && seriesMatch[1].length > 3) {
    return invalid(
      `The series is at most three letters, but "${seriesMatch[1]}" is ${seriesMatch[1].length}.`,
      "Series run A to Z, then AA to ZZ, then AAA to ZZZ."
    );
  }

  const trailing = /(\d+)$/.exec(clean);
  if (!trailing) {
    return invalid(
      "The number must end with the vehicle number, not a letter.",
      "Only BH-series plates end in a letter, and those open with two year digits."
    );
  }
  if (trailing[1].length > 4) {
    return invalid(
      `The vehicle number is at most four digits, but this has ${trailing[1].length}.`,
      "Example: MH 12 AB 1234."
    );
  }

  return invalid(
    "This does not match any Indian registration format.",
    "The standard pattern is a two-letter state code, a two-digit RTO code, up to three series letters, then a number of up to four digits. Example: MH 12 AB 1234."
  );
}

function PlateVisual({ text, bg, fg, outline }) {
  return (
    <div
      className="flex items-stretch overflow-hidden rounded-md border-2"
      style={{ background: bg, borderColor: outline ? "#111111" : bg }}
    >
      <div
        className="flex w-9 shrink-0 flex-col items-center justify-center gap-0.5"
        style={{ background: "#12369E", color: "#FFFFFF" }}
      >
        <span className="text-[9px] font-bold leading-none">IND</span>
      </div>
      <div className="flex flex-1 items-center justify-center px-3 py-4">
        <p
          className="text-center font-mono text-xl font-bold tracking-[0.15em] sm:text-2xl"
          style={{ color: fg }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [input, setInput] = useState("MH 12 AB 1234");
  const [codeFilter, setCodeFilter] = useState("");
  const [copied, setCopied] = useState(false);

  const decoded = useMemo(() => decodePlate(input), [input]);

  const stateRows = useMemo(() => {
    const query = codeFilter.trim().toLowerCase();
    const all = [
      ...Object.entries(STATE_CODES).map(([code, value]) => ({ code, ...value })),
      ...Object.entries(LEGACY_CODES).map(([code, value]) => ({ code, ...value })),
    ];
    if (!query) return all;
    return all.filter(
      (row) => row.code.toLowerCase().includes(query) || row.name.toLowerCase().includes(query)
    );
  }, [codeFilter]);

  const report = useMemo(() => {
    if (decoded.status === "ok") {
      return [
        "Indian Number Plate Decoder",
        "",
        `Registration: ${decoded.formatted}`,
        `Format: ${decoded.format}`,
        "",
        ...decoded.rows.map((row) => `${row.label}: ${row.value}`),
        decoded.stateNote ? `\nNote: ${decoded.stateNote}` : "",
        `\nGenerated: ${new Date().toLocaleString()}`,
      ]
        .filter(Boolean)
        .join("\n");
    }
    if (decoded.status === "invalid") {
      return [
        "Indian Number Plate Decoder",
        "",
        `Input: ${input}`,
        "Result: not a valid Indian registration number",
        `Reason: ${decoded.reason}`,
        decoded.detail,
      ].join("\n");
    }
    return "Enter a registration number to decode it.";
  }, [decoded, input]);

  const copyResult = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Car className="h-4 w-4" />
            Registration decoder
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Indian Number Plate Decoder</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Every Indian number plate carries four pieces of information: the state, the RTO district,
            the series and the number. Type any registration to pull them apart, including BH-series and
            diplomatic plates.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="grid gap-6 self-start">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <label className="block">
                <span className="text-sm font-semibold">Registration number</span>
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="MH 12 AB 1234"
                  autoComplete="off"
                  spellCheck="false"
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-lg uppercase tracking-widest outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-1.5 block text-[11px] leading-4 text-[var(--muted-foreground)]">
                  Spaces, hyphens and lower case are all fine. Nothing is sent anywhere - the whole
                  lookup runs on this page.
                </span>
              </label>

              <div className="mt-4 rounded-md bg-[var(--muted)] p-3">
                <p className="text-xs font-semibold">The three valid formats</p>
                <div className="mt-2 grid gap-1.5 text-[11px] leading-4 text-[var(--muted-foreground)]">
                  <p>
                    <span className="font-mono font-semibold text-[var(--foreground)]">
                      XX 00 AB 0000
                    </span>{" "}
                    — standard: state, RTO, series, number
                  </p>
                  <p>
                    <span className="font-mono font-semibold text-[var(--foreground)]">
                      00 BH 0000 A
                    </span>{" "}
                    — Bharat series: year, BH, number, series
                  </p>
                  <p>
                    <span className="font-mono font-semibold text-[var(--foreground)]">00 CD 0000</span>{" "}
                    — diplomatic: country, CD/CC/UN, number
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-sm font-semibold">Try an example</span>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
                  {EXAMPLES.map((example) => (
                    <button
                      key={example.value}
                      type="button"
                      onClick={() => setInput(example.value)}
                      className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left transition hover:border-[var(--primary)]"
                    >
                      <span className="font-mono text-sm font-semibold">{example.label}</span>
                      <span className="text-[11px] text-[var(--muted-foreground)]">{example.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 self-start">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              {decoded.status === "empty" ? (
                <div className="flex items-center gap-3 py-6">
                  <ScanLine className="h-5 w-5 text-[var(--muted-foreground)]" />
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Type a registration number to decode it.
                  </p>
                </div>
              ) : null}

              {decoded.status === "invalid" ? (
                <div aria-live="polite">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: "var(--anslation-ds-danger-soft)" }}
                    >
                      <CircleAlert className="h-3.5 w-3.5" />
                      Not a valid registration number
                    </span>
                  </div>
                  <p className="mt-4 text-lg font-semibold">{decoded.reason}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    {decoded.detail}
                  </p>
                  <div className="mt-4 rounded-md bg-[var(--muted)] p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Read as{" "}
                      <span className="font-mono font-semibold text-[var(--foreground)]">
                        {decoded.clean || "nothing"}
                      </span>{" "}
                      after stripping spaces and punctuation.
                    </p>
                  </div>
                </div>
              ) : null}

              {decoded.status === "ok" ? (
                <div aria-live="polite">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: "var(--anslation-ds-success-soft)" }}
                    >
                      <CircleCheck className="h-3.5 w-3.5" />
                      {decoded.format}
                    </span>
                    <button
                      type="button"
                      onClick={copyResult}
                      className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied" : "Copy decoded"}
                    </button>
                  </div>

                  <div className="mt-4 max-w-md">
                    <PlateVisual text={decoded.formatted} bg="#FFFFFF" fg="#111111" outline />
                    <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">
                      Shown on a private white plate. {decoded.plateHint}.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {decoded.rows.map((row) => (
                      <div key={row.label} className="rounded-md bg-[var(--muted)] p-4">
                        <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                          {row.label}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-[var(--primary)]">{row.value}</p>
                        {row.hint ? (
                          <p className="mt-1 text-[11px] leading-4 text-[var(--muted-foreground)]">
                            {row.hint}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  {decoded.stateNote ? (
                    <div className="mt-4 flex gap-2 rounded-md border border-[var(--border)] p-3">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                      <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                        {decoded.stateNote}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="text-sm font-semibold">What the plate colour tells you</h2>
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            The background colour is not decoration. It is the vehicle category, and it decides what the
            vehicle is legally allowed to do.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {PLATE_TYPES.map((plate) => (
              <div
                key={plate.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <PlateVisual
                  text={plate.sample}
                  bg={plate.bg}
                  fg={plate.fg}
                  outline={plate.outline}
                />
                <p className="mt-3 text-sm font-semibold">{plate.use}</p>
                <p className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                  {plate.name}
                </p>
                <p className="mt-1.5 text-[11px] leading-4 text-[var(--muted-foreground)]">
                  {plate.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="text-sm font-semibold">HSRP and FASTag</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {HSRP_FACTS.map((fact) => (
                <div key={fact.title} className="rounded-md bg-[var(--muted)] p-4">
                  <p className="text-sm font-semibold">{fact.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{fact.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="text-sm font-semibold">Things worth knowing</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {FUN_FACTS.map((fact) => (
                <div key={fact.title} className="rounded-md bg-[var(--muted)] p-4">
                  <p className="text-sm font-semibold">{fact.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{fact.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-sm font-semibold">All 36 state and UT codes</h2>
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                28 states and 8 union territories, plus four codes that were retired but are still on the
                road.
              </p>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                Filter by code or state
              </span>
              <input
                type="text"
                value={codeFilter}
                onChange={(event) => setCodeFilter(event.target.value)}
                placeholder="KA, Kerala, Goa..."
                className="mt-1 h-10 w-full min-w-[220px] rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>
          </div>

          {stateRows.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted-foreground)]">
              No code matches that search.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                    <th className="py-2 pr-3 font-semibold">Code</th>
                    <th className="py-2 pr-3 font-semibold">State / UT</th>
                    <th className="py-2 pr-3 font-semibold">Type</th>
                    <th className="py-2 font-semibold">District map in this tool</th>
                  </tr>
                </thead>
                <tbody>
                  {stateRows.map((row) => (
                    <tr key={row.code} className="border-b border-[var(--border)] align-top">
                      <td className="py-2.5 pr-3">
                        <button
                          type="button"
                          onClick={() => setInput(`${row.code} 01 AB 1234`)}
                          className="font-mono font-semibold text-[var(--primary)]"
                        >
                          {row.code}
                        </button>
                      </td>
                      <td className="py-2.5 pr-3">
                        <p className="font-semibold">{row.name}</p>
                        {row.legacy ? (
                          <p className="mt-0.5 max-w-[320px] text-[11px] leading-4 text-[var(--muted-foreground)]">
                            {row.legacy}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{row.type}</td>
                      <td className="py-2.5 text-[var(--muted-foreground)]">
                        {DISTRICTS[row.code]
                          ? `${Object.keys(DISTRICTS[row.code]).length} RTOs mapped`
                          : "State only"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            RTO district maps are bundled for Maharashtra, Delhi, Karnataka, Tamil Nadu, Uttar Pradesh,
            Gujarat, Rajasthan and West Bengal. For other states the code is still validated, and the
            district is reported as the raw RTO number. New RTOs are added by state governments from time
            to time.
          </p>
        </section>
      </div>
    </main>
  );
}
