"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Languages, RotateCcw } from "lucide-react";

import {
  FORMAT_PARTS,
  LETTER_TYPES,
  MAX_BODY_WORDS,
  MIN_BODY_WORDS,
  RELATIONS,
  buildPatra,
} from "../lib";

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  typeId: "avkash",
  relationId: "friend",
  senderName: "रोहित वर्मा",
  designation: "कक्षा दसवीं 'अ'",
  senderAddress: "12, गांधी नगर\nजयपुर",
  readerName: "अंकित",
  recipient: "श्रीमान प्रधानाचार्य महोदय",
  office: "सरस्वती बाल विद्यालय",
  place: "जयपुर",
  vishay: "दो दिन के अवकाश हेतु प्रार्थना पत्र",
  dateIso: "2026-08-12",
  body:
    "सविनय निवेदन है कि मैं आपके विद्यालय की कक्षा दसवीं का छात्र हूँ। कल रात से मुझे तेज़ ज्वर है और चिकित्सक ने दो दिन पूर्ण विश्राम करने की सलाह दी है।\n\nअतः आपसे विनम्र निवेदन है कि मुझे 13 अगस्त से 14 अगस्त तक दो दिन का अवकाश प्रदान करने की कृपा करें। विद्यालय आने पर मैं छूटा हुआ समस्त कार्य शीघ्र पूरा कर लूँगा। आपकी अति कृपा होगी।",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => buildPatra(form), [form]);
  const failed = Boolean(result.error);

  const selectedType = LETTER_TYPES.find((item) => item.id === form.typeId) || LETTER_TYPES[0];
  const isFormal = selectedType.kind === "aupcharik";
  const parts = FORMAT_PARTS[selectedType.kind];

  const copy = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Languages className="h-4 w-4" aria-hidden="true" />
          पत्र लेखन
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Hindi Patra Lekhan Format Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          औपचारिक और अनौपचारिक — दोनों हिंदी पत्र प्रारूपों का इंटरैक्टिव मार्गदर्शक। प्रकार चुनिए,
          विवरण भरिए, और सही क्रम में पूरा पत्र देखिए।
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="hp-type">
              पत्र का प्रकार
            </label>
            <select id="hp-type" className={`mt-2 ${INPUT}`} value={form.typeId} onChange={setField("typeId")}>
              <optgroup label="औपचारिक पत्र">
                {LETTER_TYPES.filter((item) => item.kind === "aupcharik").map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} — {item.english}
                  </option>
                ))}
              </optgroup>
              <optgroup label="अनौपचारिक पत्र">
                {LETTER_TYPES.filter((item) => item.kind === "anaupcharik").map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} — {item.english}
                  </option>
                ))}
              </optgroup>
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{selectedType.guidance}</p>
          </div>

          {isFormal ? (
            <>
              <div>
                <label className={LABEL} htmlFor="hp-recipient">
                  प्राप्तकर्ता का पदनाम
                </label>
                <input id="hp-recipient" className={`mt-2 ${INPUT}`} value={form.recipient} onChange={setField("recipient")} />
              </div>
              <div>
                <label className={LABEL} htmlFor="hp-office">
                  कार्यालय / विद्यालय
                </label>
                <input id="hp-office" className={`mt-2 ${INPUT}`} value={form.office} onChange={setField("office")} />
              </div>
              <div>
                <label className={LABEL} htmlFor="hp-place">
                  स्थान
                </label>
                <input id="hp-place" className={`mt-2 ${INPUT}`} value={form.place} onChange={setField("place")} />
              </div>
              <div>
                <label className={LABEL} htmlFor="hp-vishay">
                  विषय
                </label>
                <input id="hp-vishay" className={`mt-2 ${INPUT}`} value={form.vishay} onChange={setField("vishay")} />
              </div>
              <div>
                <label className={LABEL} htmlFor="hp-designation">
                  कक्षा / पद (वैकल्पिक)
                </label>
                <input id="hp-designation" className={`mt-2 ${INPUT}`} value={form.designation} onChange={setField("designation")} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL} htmlFor="hp-relation">
                  पाठक से संबंध
                </label>
                <select id="hp-relation" className={`mt-2 ${INPUT}`} value={form.relationId} onChange={setField("relationId")}>
                  {RELATIONS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL} htmlFor="hp-reader">
                  पाठक का नाम / संबोधन
                </label>
                <input id="hp-reader" className={`mt-2 ${INPUT}`} value={form.readerName} onChange={setField("readerName")} />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL} htmlFor="hp-address">
                  प्रेषक का पता
                </label>
                <textarea id="hp-address" rows={2} className={`mt-2 ${AREA}`} value={form.senderAddress} onChange={setField("senderAddress")} />
              </div>
            </>
          )}

          <div>
            <label className={LABEL} htmlFor="hp-name">
              आपका नाम
            </label>
            <input id="hp-name" className={`mt-2 ${INPUT}`} value={form.senderName} onChange={setField("senderName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="hp-date">
              दिनांक
            </label>
            <input id="hp-date" type="date" className={`mt-2 ${INPUT}`} value={form.dateIso} onChange={setField("dateIso")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="hp-body">
              विषय-वस्तु (अनुच्छेद अलग करने के लिए खाली पंक्ति छोड़ें)
            </label>
            <textarea id="hp-body" rows={7} className={`mt-2 ${AREA}`} value={form.body} onChange={setField("body")} />
          </div>
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              प्रारूप अंक
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${result.score}/${result.scoreMax}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "ऊपर की त्रुटि ठीक कीजिए।" : `${result.kindLabel} · ${result.typeLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copy} aria-label="पत्र कॉपी करें" className={GHOST_BTN} disabled={failed}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "पत्र कॉपी करें"}
            </button>
            <button type="button" onClick={reset} aria-label="सभी फ़ील्ड रीसेट करें" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              रीसेट
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["दिनांक", failed ? DASH : result.dateLabel],
            ["अनुच्छेद", failed ? DASH : String(result.paragraphCount)],
            ["विषय-वस्तु शब्द", failed ? DASH : `${result.wordCount} (लक्ष्य ${MIN_BODY_WORDS}–${MAX_BODY_WORDS})`],
            ["कुल शब्द", failed ? DASH : String(result.totalWords)],
            [
              isFormal ? "विषय पंक्ति" : "स्वनिर्देश",
              failed ? DASH : isFormal ? result.vishay : result.relation?.svanirdesh || DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">तैयार पत्र</h2>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-7">
            {result.letter}
          </pre>
          <ul className="mt-4 space-y-2 text-sm">
            {result.checklist.map((item) => (
              <li key={item.label} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className={
                    item.ok
                      ? "mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full bg-[var(--success)]"
                      : "mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border border-[var(--border)] bg-[var(--muted)]"
                  }
                />
                <span className={item.ok ? "" : "text-[var(--muted-foreground)]"}>
                  {item.label}
                  <span className="sr-only">{item.ok ? " — पूर्ण" : " — अपूर्ण"}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">
          {selectedType.kind === "aupcharik" ? "औपचारिक पत्र" : "अनौपचारिक पत्र"} का क्रम
        </h2>
        <ol className="mt-3 space-y-3 text-sm">
          {parts.map(([name, note], index) => (
            <li key={name} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold text-[var(--primary)]">
                {index + 1}
              </span>
              <span>
                <span className="font-semibold">{name}</span>
                <span className="block text-[var(--muted-foreground)]">{note}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">संबोधन–अभिवादन–स्वनिर्देश मेल</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">संबंध</th>
                <th scope="col" className="py-2 pr-3 font-semibold">संबोधन</th>
                <th scope="col" className="py-2 pr-3 font-semibold">अभिवादन</th>
                <th scope="col" className="py-2 font-semibold">स्वनिर्देश</th>
              </tr>
            </thead>
            <tbody>
              {RELATIONS.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{item.label}</td>
                  <td className="py-2 pr-3">{item.sambodhan}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{item.abhivadan}</td>
                  <td className="py-2">{item.svanirdesh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        प्रारूप बोर्ड और कक्षा के अनुसार थोड़ा बदल सकता है — परीक्षा से पहले अपने पाठ्यक्रम और
        प्रश्न-पत्र के शब्द-सीमा निर्देश अवश्य देख लें।
      </p>
    </main>
  );
}
