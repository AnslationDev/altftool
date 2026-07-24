"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  buildFamilyProtocol,
  generateFamilySafeWord,
} from "../lib/generateSafeWord.mjs";

const WORD_COUNTS = [4, 5, 6];
const DIGIT_COUNTS = [2, 3, 4];

function generate(wordCount, digitCount) {
  try {
    return { value: generateFamilySafeWord({ wordCount, digitCount }), error: "" };
  } catch {
    return {
      value: null,
      error: "Secure browser randomness is unavailable. Try a current browser before creating a code.",
    };
  }
}

export default function FamilySafeWordGenerator() {
  const [wordCount, setWordCount] = useState(5);
  const [digitCount, setDigitCount] = useState(3);
  const [result, setResult] = useState({ value: null, error: "" });
  const [copied, setCopied] = useState(false);

  const protocol = useMemo(
    () => buildFamilyProtocol(result.value?.phrase || ""),
    [result.value?.phrase],
  );

  const refresh = () => {
    setCopied(false);
    setResult(generate(wordCount, digitCount));
  };

  const copyPhrase = async () => {
    if (!result.value) return;
    const didCopy = await safeCopyText(result.value.phrase);
    setCopied(didCopy);
    if (didCopy) window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Voice-clone scam defense
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Family Safe-Word Generator
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
              Create a phrase your family can use to verify unexpected emergency calls and
              messages. Generation happens only in this tab.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] p-4 lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-[var(--foreground)]">
              <LockKeyhole className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
              No account or storage
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              The phrase is generated with browser cryptography and is not saved by this tool.
              Record it offline with trusted family members.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.55fr)]">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Your private phrase</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                More parts are harder to guess but take longer to say.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-bold text-[var(--foreground)]">
              Number of words
              <select
                value={wordCount}
                onChange={(event) => setWordCount(Number(event.target.value))}
                className="input-field min-h-11 w-full"
              >
                {WORD_COUNTS.map((count) => (
                  <option key={count} value={count}>
                    {count} words
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-bold text-[var(--foreground)]">
              Final digits
              <select
                value={digitCount}
                onChange={(event) => setDigitCount(Number(event.target.value))}
                className="input-field min-h-11 w-full"
              >
                {DIGIT_COUNTS.map((count) => (
                  <option key={count} value={count}>
                    {count} digits
                  </option>
                ))}
              </select>
            </label>
          </div>

          {result.error ? (
            <p
              className="mt-5 rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger)]"
              role="alert"
            >
              {result.error}
            </p>
          ) : result.value ? (
            <div className="mt-5 rounded-lg border border-[var(--border-strong)] bg-[var(--background)] p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                Say every part exactly
              </p>
              <p className="mt-3 break-words font-mono text-xl font-bold leading-8 text-[var(--foreground)] sm:text-2xl">
                {result.value.phrase}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="btn-primary inline-flex min-h-11 items-center gap-2 px-4"
                  onClick={copyPhrase}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Clipboard className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Copy phrase"}
                </button>
                <button
                  type="button"
                  className="btn-secondary inline-flex min-h-11 items-center gap-2 px-4"
                  onClick={refresh}
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Generate another
                </button>
              </div>
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                Estimated search space: about{" "}
                <strong className="text-[var(--foreground)]">
                  {Math.floor(result.value.entropyBits)} bits
                </strong>
                . This helps against guessing; it cannot prove who is calling.
              </p>
            </div>
          ) : (
            <div
              className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 text-sm text-[var(--muted-foreground)]"
              aria-live="polite"
            >
              <p>Choose the phrase length, then generate it only when you are ready to record it.</p>
              <button
                type="button"
                className="btn-primary mt-4 inline-flex min-h-11 items-center gap-2 px-4"
                onClick={refresh}
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                Generate private phrase
              </button>
            </div>
          )}

          <p className="mt-4 flex gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            <TriangleAlert
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]"
              aria-hidden="true"
            />
            Changing the selectors does not change the displayed phrase until you choose
            “Generate another,” which prevents accidental replacement.
          </p>
        </section>

        <aside className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Family verification rule</h2>
          <ol className="mt-4 space-y-3">
            {protocol.map((step, index) => (
              <li
                key={step}
                className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary)]">
                  {index + 1}
                </span>
                <span className="text-sm leading-6 text-[var(--foreground)]">{step}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <section className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5">
        <h2 className="font-bold text-[var(--foreground)]">Important limitation</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A safe word is one layer of verification, not an emergency service or identity
          guarantee. Do not send money, disclose an OTP, or install an app because a caller knows
          the phrase. Call back using a number you already trust.
        </p>
      </section>
    </main>
  );
}
