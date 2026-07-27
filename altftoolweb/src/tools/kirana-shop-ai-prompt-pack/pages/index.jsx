"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Store } from "lucide-react";

import {
  LANGUAGES,
  MAX_TARGET_CHARS,
  MIN_TARGET_CHARS,
  TASKS,
  TONES,
  buildPrompt,
  getTask,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-28 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_TASK = "offer-message";
const DEFAULT_VALUES = {
  offer:
    "Sugar 1kg at 42 instead of 48\nAll Britannia biscuits buy 3 get 1 free\nOffer valid Saturday and Sunday only",
  shop: "Gupta Kirana Store",
  area: "Sector 12, Noida",
};

const DASH = "—";

export default function ToolHome() {
  const [taskId, setTaskId] = useState(DEFAULT_TASK);
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [languageId, setLanguageId] = useState("hinglish");
  const [toneId, setToneId] = useState("friendly");
  const [targetChars, setTargetChars] = useState("400");
  const [shopContext, setShopContext] = useState("");
  const [copied, setCopied] = useState(false);

  const task = getTask(taskId) || TASKS[0];

  const result = useMemo(
    () =>
      buildPrompt({
        taskId,
        values,
        languageId,
        toneId,
        targetChars: targetChars.trim() === "" ? Number.NaN : Number(targetChars),
        shopContext,
      }),
    [taskId, values, languageId, toneId, targetChars, shopContext],
  );

  const setField = (fieldId, next) => {
    setValues((current) => ({ ...current, [fieldId]: next }));
    setCopied(false);
  };

  const copyResult = async () => {
    if (result.error || !result.prompt) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTaskId(DEFAULT_TASK);
    setValues(DEFAULT_VALUES);
    setLanguageId("hinglish");
    setToneId("friendly");
    setTargetChars("400");
    setShopContext("");
    setCopied(false);
  };

  const stat = (value) => (result.error ? DASH : value);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Store className="h-4 w-4" aria-hidden="true" />
          Kirana prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Kirana Shop AI Prompt Pack</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the job, fill in your own numbers and get a complete, structured prompt you can paste
          into any AI chat: reorder notes, offer broadcasts, customer replies and udhaar reminders,
          in the language your customers actually read.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">What do you need written?</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {TASKS.map((item) => {
              const active = item.id === taskId;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setTaskId(item.id);
                    setCopied(false);
                  }}
                  className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  <span className="block font-semibold text-[var(--foreground)]">{item.label}</span>
                  <span className="mt-0.5 block text-xs leading-5">{item.blurb}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4">
          {task.fields.map((field) =>
            field.multiline ? (
              <div key={field.id}>
                <label className={LABEL_CLASS} htmlFor={`kirana-${field.id}`}>
                  {field.label}
                  {field.required ? "" : " (optional)"}
                </label>
                <textarea
                  id={`kirana-${field.id}`}
                  className={`mt-2 ${TEXTAREA_CLASS}`}
                  rows={4}
                  placeholder={field.placeholder}
                  value={values[field.id] || ""}
                  onChange={(event) => setField(field.id, event.target.value)}
                />
              </div>
            ) : (
              <div key={field.id}>
                <label className={LABEL_CLASS} htmlFor={`kirana-${field.id}`}>
                  {field.label}
                  {field.required ? "" : " (optional)"}
                </label>
                <input
                  id={`kirana-${field.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  placeholder={field.placeholder}
                  value={values[field.id] || ""}
                  onChange={(event) => setField(field.id, event.target.value)}
                />
              </div>
            ),
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kirana-language">
              Language
            </label>
            <select
              id="kirana-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={languageId}
              onChange={(event) => {
                setLanguageId(event.target.value);
                setCopied(false);
              }}
            >
              {LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kirana-tone">
              Tone
            </label>
            <select
              id="kirana-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={toneId}
              onChange={(event) => {
                setToneId(event.target.value);
                setCopied(false);
              }}
            >
              {TONES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kirana-length">
              Message length limit (characters)
            </label>
            <input
              id="kirana-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_TARGET_CHARS}
              max={MAX_TARGET_CHARS}
              step="20"
              value={targetChars}
              onChange={(event) => {
                setTargetChars(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kirana-context">
              Extra background (optional)
            </label>
            <input
              id="kirana-context"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Open 7am-10pm, home delivery within 2km"
              value={shopContext}
              onChange={(event) => {
                setShopContext(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Prompt size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {stat(`~${NUM.format(result.tokenEstimate || 0)} tokens`)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {stat(`${result.taskLabel} ${DASH} ${result.channel}`)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated kirana shop prompt"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Words in the prompt", stat(NUM.format(result.wordCount || 0))],
            ["Characters in the prompt", stat(NUM.format(result.charCount || 0))],
            ["Length cap set for the reply", stat(`${NUM.format(result.targetChars || 0)} characters`)],
            [
              "If sent as SMS instead",
              stat(`${NUM.format(result.smsParts || 0)} part${result.smsParts === 1 ? "" : "s"}`),
            ],
            ["Fits one WhatsApp message", stat(result.fitsWhatsApp ? "Yes" : "No, split it")],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {result.error ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your prompt</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)]">
              {result.prompt}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The prompt tells the assistant never to invent a price, date or quantity you did not supply.
        Always read the generated message before you send it, especially anything about money owed.
      </p>
    </main>
  );
}
