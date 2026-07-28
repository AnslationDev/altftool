"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageSquare, RotateCcw } from "lucide-react";

import {
  CATEGORIES,
  LANGUAGES,
  MAX_QUICK_REPLIES,
  MESSAGE_MAX_CHARS,
  PLACEHOLDERS,
  SHORTCUT_MAX_CHARS,
  buildTemplateSet,
} from "../lib";

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_SELECTED = [
  "greeting",
  "away",
  "hours",
  "catalogue",
  "order-status",
  "delay",
  "refund",
  "thanks",
];

const DEFAULTS = {
  business: "Nayak Handlooms",
  agent: "Sunita",
  hours: "Mon-Sat, 10am to 7pm",
  eta: "3-5 days",
  validity: "the end of this week",
  catalogue: "wa.me/c/919999900000",
  phone: "+91 99999 00000",
  language: "en",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [copied, setCopied] = useState("");

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const result = useMemo(() => buildTemplateSet({ ...form, selected }), [form, selected]);
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
    setSelected(DEFAULT_SELECTED);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Customer replies
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          WhatsApp Business Reply Templates
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in your business details once and get a full set of customer replies with valid
          quick-reply shortcuts, checked against the {MESSAGE_MAX_CHARS}-character message limit.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="wa-business">
              Business name
            </label>
            <input id="wa-business" className={`mt-2 ${INPUT}`} value={form.business} onChange={setField("business")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="wa-agent">
              Your name
            </label>
            <input id="wa-agent" className={`mt-2 ${INPUT}`} value={form.agent} onChange={setField("agent")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="wa-hours">
              Business hours
            </label>
            <input id="wa-hours" className={`mt-2 ${INPUT}`} value={form.hours} onChange={setField("hours")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="wa-eta">
              Usual delivery time
            </label>
            <input id="wa-eta" className={`mt-2 ${INPUT}`} value={form.eta} onChange={setField("eta")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="wa-catalogue">
              Catalogue link
            </label>
            <input id="wa-catalogue" className={`mt-2 ${INPUT}`} value={form.catalogue} onChange={setField("catalogue")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="wa-phone">
              Phone number
            </label>
            <input id="wa-phone" className={`mt-2 ${INPUT}`} value={form.phone} onChange={setField("phone")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="wa-validity">
              How long a quote stays valid
            </label>
            <input id="wa-validity" className={`mt-2 ${INPUT}`} value={form.validity} onChange={setField("validity")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="wa-language">
              Language
            </label>
            <select id="wa-language" className={`mt-2 ${INPUT}`} value={form.language} onChange={setField("language")}>
              {LANGUAGES.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Templates to include</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {CATEGORIES.map((category) => (
              <label
                key={category.id}
                htmlFor={`wa-cat-${category.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`wa-cat-${category.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={selected.includes(category.id)}
                  onChange={() => toggle(category.id)}
                />
                <span>{category.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
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
              Templates ready
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.items.length}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Select at least one template."
                : `${result.quickReplyCount} quick replies + ${result.automatedCount} automated messages`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("all", result.exportText)}
              aria-label="Copy every generated template"
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
          {[
            ["Quick-reply slots used", failed ? DASH : `${result.quickReplyCount} of ${MAX_QUICK_REPLIES}`],
            ["Average message length", failed ? DASH : `${result.averageChars} characters`],
            ["Longest message", failed ? DASH : `${result.longestLabel} — ${result.longestChars} characters`],
            ["Message limit", `${MESSAGE_MAX_CHARS} characters`],
            ["Shortcut limit", `${SHORTCUT_MAX_CHARS} characters, no spaces`],
            [
              "Unfilled placeholders",
              failed ? DASH : result.unresolvedTokens.length ? result.unresolvedTokens.join(", ") : "None",
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
        <section className="mt-6 space-y-4">
          {result.items.map((item) => (
            <article key={item.id} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">{item.label}</h2>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {item.isAutomated
                      ? "Save this under Business tools → Automated messages"
                      : `Shortcut ${item.shortcut}`}
                    {" · "}
                    {item.chars} / {MESSAGE_MAX_CHARS} characters
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copy(item.id, item.message)}
                  aria-label={`Copy the ${item.label} template`}
                  className={GHOST_BTN}
                >
                  {copied === item.id ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied === item.id ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
                {item.message}
              </p>
              {item.unresolved.length > 0 && (
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Fill in {item.unresolved.join(", ")} above, or this text will send literally.
                </p>
              )}
            </article>
          ))}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Placeholders used</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Token</th>
                <th scope="col" className="py-2 font-semibold">Filled from</th>
              </tr>
            </thead>
            <tbody>
              {PLACEHOLDERS.map((placeholder) => (
                <tr key={placeholder.token} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-mono text-xs">{placeholder.token}</td>
                  <td className="py-2">{placeholder.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Return windows, delivery times and payment terms here are placeholders — replace them with
        your own published policy before you save the templates. Never ask a customer for an OTP,
        card number or PIN over chat.
      </p>
    </main>
  );
}
