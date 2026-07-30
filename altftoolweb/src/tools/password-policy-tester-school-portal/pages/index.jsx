"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Eye, EyeOff, GraduationCap, RotateCcw, Sparkles } from "lucide-react";
import {
  GOOD_LENGTH,
  MIN_LENGTH,
  PASSPHRASE_WORDS,
  buildPassphrase,
  evaluateSchoolPassword,
} from "../lib";

const DEFAULTS = {
  password: "Aarav2012",
  name: "Aarav Menon",
  username: "aarav.menon",
  school: "Green Valley School",
  birthYear: "2012",
};

const START_INDEXES = [3, 17, 42, 61];
const START_DIGITS = "41";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

/** Random word positions, drawn in an event handler so rendering stays pure. */
function drawIndexes(count) {
  const values = new Uint32Array(count + 1);
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(values);
  } else {
    for (let i = 0; i < values.length; i += 1) values[i] = Math.floor(Math.random() * 4294967295);
  }
  return {
    indexes: Array.from(values.slice(0, count), (value) => value % PASSPHRASE_WORDS.length),
    digits: String(values[count] % 100).padStart(2, "0"),
  };
}

export default function ToolHome() {
  const [password, setPassword] = useState(DEFAULTS.password);
  const [name, setName] = useState(DEFAULTS.name);
  const [username, setUsername] = useState(DEFAULTS.username);
  const [school, setSchool] = useState(DEFAULTS.school);
  const [birthYear, setBirthYear] = useState(DEFAULTS.birthYear);
  const [reveal, setReveal] = useState(true);
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(4);
  const [phraseSeed, setPhraseSeed] = useState({ indexes: START_INDEXES, digits: START_DIGITS });

  const result = useMemo(
    () => evaluateSchoolPassword({ password, name, username, school, birthYear }),
    [password, name, username, school, birthYear]
  );
  const failed = Boolean(result.error);

  const suggestion = useMemo(
    () => buildPassphrase(phraseSeed.indexes, "-", phraseSeed.digits),
    [phraseSeed]
  );

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "School Portal Password Policy Tester",
      `Safety score: ${result.score} out of 100 — ${result.verdict}`,
      `Checks passed: ${result.passedCount} of ${result.ruleCount}`,
      `Length: ${result.length} characters`,
      `How it was measured: ${result.model}`,
      `Guessing it on a school login: ${result.crackTimes.online}`,
      "Checks:",
    ];
    result.rules.forEach((rule) => {
      lines.push(`- ${rule.passed ? "OK" : "FIX"} ${rule.label}: ${rule.detail}`);
    });
    return lines.join("\n");
  }, [failed, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setPassword(DEFAULTS.password);
    setName(DEFAULTS.name);
    setUsername(DEFAULTS.username);
    setSchool(DEFAULTS.school);
    setBirthYear(DEFAULTS.birthYear);
    setWordCount(4);
    setPhraseSeed({ indexes: START_INDEXES, digits: START_DIGITS });
    setReveal(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          School logins
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          School Portal Password Policy Tester
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A school password does not have to fend off a supercomputer — it has to fend off the person
          sitting next to you, who already knows your name, your birthday and your school. This
          checker looks for exactly that, in plain language, and can build you a passphrase instead.
          Nothing you type is sent anywhere.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="school-password">
            Password idea
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="school-password"
              className={INPUT_CLASS}
              type={reveal ? "text" : "password"}
              autoComplete="off"
              spellCheck={false}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setReveal((value) => !value)}
              aria-label={reveal ? "Hide the password" : "Show the password"}
              className={GHOST_BTN}
            >
              {reveal ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              {reveal ? "Hide" : "Show"}
            </button>
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Try an idea you have not used yet. Never type a password you already use into a website.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="school-name">
              Your name
            </label>
            <input
              id="school-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="school-username">
              School login name
            </label>
            <input
              id="school-username"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="school-name-of-school">
              School name
            </label>
            <input
              id="school-name-of-school"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={school}
              onChange={(event) => setSchool(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="school-year">
              Year you were born
            </label>
            <input
              id="school-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={birthYear}
              onChange={(event) => setBirthYear(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Safety score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${result.score} / 100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? DASH : `${result.verdict} · ${result.passedCount} of ${result.ruleCount} checks passed`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the password check result"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={failed ? "No score yet" : `Safety score ${result.score} out of 100`}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: failed ? "0%" : `${result.score}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Length", failed ? DASH : `${result.length} characters`],
            ["How it was measured", failed ? DASH : result.model],
            ["Someone guessing at the login page", failed ? DASH : result.crackTimes.online],
            ["If the school's password file ever leaked", failed ? DASH : result.crackTimes.offlineFast],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="max-w-[55%] text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Every check, explained</h2>
        {failed ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {result.rules.map((rule) => (
              <li key={rule.id} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      rule.passed
                        ? "bg-[var(--success-soft)] text-[var(--success)]"
                        : "bg-[var(--danger-soft)] text-[var(--danger)]"
                    }`}
                  >
                    {rule.passed ? "Good" : "Fix this"}
                  </span>
                  <span className="text-sm font-semibold">{rule.label}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{rule.requirement}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{rule.detail}</p>
                {!rule.passed && (
                  <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">{rule.tip}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Build a passphrase instead</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          Four ordinary words picked at random are easier to remember than one clever word and far
          harder to guess, because nothing about them points back to you.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">Words:</span>
          {[3, 4, 5, 6].map((count) => (
            <button
              key={count}
              type="button"
              aria-pressed={wordCount === count}
              onClick={() => {
                setWordCount(count);
                setPhraseSeed(drawIndexes(count));
              }}
              className={`min-h-11 min-w-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                wordCount === count
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
              }`}
            >
              {count}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPhraseSeed(drawIndexes(wordCount))}
            aria-label="Make a new passphrase"
            className={PRIMARY_BTN}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            New passphrase
          </button>
        </div>

        {suggestion.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {suggestion.error}
          </p>
        ) : (
          <div className="mt-4 rounded-lg bg-[var(--muted)] p-4">
            <p className="break-all font-mono text-lg font-semibold">{suggestion.phrase}</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {suggestion.length} characters · guessing it at a school login would take{" "}
              {suggestion.onlineTime}.
            </p>
            <button
              type="button"
              onClick={() => setPassword(suggestion.phrase)}
              className={`mt-3 ${GHOST_BTN}`}
            >
              Test this one above
            </button>
          </div>
        )}

        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          The word list is published on this page, so the strength shown already assumes an attacker
          has it. That is fine for a school login that locks after a few wrong tries — do not reuse a
          passphrase from a public list for email, banking or anything that matters.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Three habits worth more than any password rule</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>Use a different password for school than for anything else, especially your email.</li>
          <li>
            Never share it, not even with a best friend — most school account trouble starts with a
            password that was shared once.
          </li>
          <li>
            Aim for {GOOD_LENGTH}+ characters and at least {MIN_LENGTH}. Length is what actually
            helps; symbols dotted about are mostly decoration.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational tool. Your school's own password rules come first, and a teacher or IT helpdesk
        is the right person to ask if an account has been used by someone else.
      </p>
    </main>
  );
}
