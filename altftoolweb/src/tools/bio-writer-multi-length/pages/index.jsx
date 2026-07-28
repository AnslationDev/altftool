"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, UserRound } from "lucide-react";

import { PRONOUNS, VOICES, buildBios } from "../lib";

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
  name: "Kavya Rao",
  role: "product designer",
  specialism: "accessible fintech interfaces",
  audience: "early-stage fintech teams",
  achievements:
    "redesigned the onboarding flow for a 2 million user lending app, cutting drop-off by 18%; shipped a design system now used by four product teams; written 30 articles on accessible forms",
  credentials: "a degree in visual communication from NID and WCAG 2.2 certification",
  location: "Bengaluru",
  personal: "she trains for long-distance cycling and volunteers at a community makerspace",
  cta: "Get in touch at kavya.example@mail.com if you are building something people find hard to use",
  voice: "third",
  pronounId: "she",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => buildBios(form), [form]);
  const failed = Boolean(result.error);

  const copy = async (what, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  const allBios = failed
    ? ""
    : result.bios.map((bio) => `${bio.target}-word version (${bio.wordCount} words)\n\n${bio.text}`).join("\n\n---\n\n");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <UserRound className="h-4 w-4" aria-hidden="true" />
          Profile copy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Multi Length Bio Writer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One set of facts, three bios — the 50-word speaker blurb, the 100-word about paragraph and
          the 250-word long form — in first or third person, with the character limits of each place
          you will paste them.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="bw-name">
              Your name
            </label>
            <input id="bw-name" className={`mt-2 ${INPUT}`} value={form.name} onChange={setField("name")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bw-role">
              Role or title
            </label>
            <input id="bw-role" className={`mt-2 ${INPUT}`} value={form.role} onChange={setField("role")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bw-voice">
              Voice
            </label>
            <select id="bw-voice" className={`mt-2 ${INPUT}`} value={form.voice} onChange={setField("voice")}>
              {VOICES.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="bw-pronoun">
              Pronoun for third person
            </label>
            <select
              id="bw-pronoun"
              className={`mt-2 ${INPUT}`}
              value={form.pronounId}
              onChange={setField("pronounId")}
              disabled={form.voice === "first"}
            >
              {PRONOUNS.map((pronoun) => (
                <option key={pronoun.id} value={pronoun.id}>
                  {pronoun.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="bw-specialism">
              What you specialise in
            </label>
            <input id="bw-specialism" className={`mt-2 ${INPUT}`} value={form.specialism} onChange={setField("specialism")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bw-audience">
              Who you work with
            </label>
            <input id="bw-audience" className={`mt-2 ${INPUT}`} value={form.audience} onChange={setField("audience")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="bw-achievements">
              Achievements — separate with semicolons, written as &quot;shipped X&quot;, &quot;led Y&quot;
            </label>
            <textarea id="bw-achievements" rows={4} className={`mt-2 ${AREA}`} value={form.achievements} onChange={setField("achievements")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="bw-credentials">
              Qualifications or credentials
            </label>
            <input id="bw-credentials" className={`mt-2 ${INPUT}`} value={form.credentials} onChange={setField("credentials")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bw-location">
              Location (optional)
            </label>
            <input id="bw-location" className={`mt-2 ${INPUT}`} value={form.location} onChange={setField("location")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bw-personal">
              Personal line for the long bio
            </label>
            <input id="bw-personal" className={`mt-2 ${INPUT}`} value={form.personal} onChange={setField("personal")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="bw-cta">
              Closing call to action
            </label>
            <input id="bw-cta" className={`mt-2 ${INPUT}`} value={form.cta} onChange={setField("cta")} />
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
              Bio checks passed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${result.score}/${result.scoreMax}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Add a name and a role to build the bios."
                : `${result.bios.length} versions · ${result.pronounLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("all", allBios)}
              aria-label="Copy all three bio versions"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied === "all" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "all" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(failed
            ? [["50-word version", DASH], ["100-word version", DASH], ["250-word version", DASH]]
            : result.bios.map((bio) => [
                `${bio.target}-word version`,
                `${bio.wordCount} words · ${bio.charCount} characters`,
              ])
          ).map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-2 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Achievements used</dt>
            <dd className="text-right font-semibold">{failed ? DASH : result.achievementCount}</dd>
          </div>
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 space-y-4">
            {result.bios.map((bio) => (
              <article key={bio.target} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">Up to {bio.target} words</h2>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {bio.wordCount} words · {bio.charCount} characters ·{" "}
                      {bio.fitsLimit ? `${bio.remaining} words to spare` : `${Math.abs(bio.remaining)} words over`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(String(bio.target), bio.text)}
                    aria-label={`Copy the ${bio.target} word bio`}
                    className={GHOST_BTN}
                  >
                    {copied === String(bio.target) ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied === String(bio.target) ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
                  {bio.text}
                </p>
                {bio.thin && (
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Under {bio.floor} words — add another achievement or a longer personal line to
                    fill this version out.
                  </p>
                )}
              </article>
            ))}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Where the 50-word version fits</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Field</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Limit</th>
                    <th scope="col" className="py-2 text-right font-semibold">Fits</th>
                  </tr>
                </thead>
                <tbody>
                  {result.platformFit.map((platform) => (
                    <tr key={platform.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{platform.label}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{platform.limit}</td>
                      <td className={`py-2 text-right font-semibold ${platform.fits ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                        {platform.fits ? "Yes" : `${platform.over} over`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Checks</h2>
            <ul className="mt-3 space-y-2 text-sm">
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
                    <span className="sr-only">{item.ok ? " — passed" : " — not met"}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything the bios claim comes from what you typed — check the numbers and credentials are
        accurate before publishing, since a bio is the version of you that travels without you.
      </p>
    </main>
  );
}
