"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  Wand2,
  X,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { COMMON_PASSWORDS, DICTIONARY_WORDS, KEYBOARD_ROWS, PASSPHRASE_WORDS } from "../data";

const CHAR_SETS = [
  { id: "lower", label: "Lowercase", hint: "a-z", size: 26, test: (value) => /[a-z]/.test(value) },
  { id: "upper", label: "Uppercase", hint: "A-Z", size: 26, test: (value) => /[A-Z]/.test(value) },
  { id: "digit", label: "Digits", hint: "0-9", size: 10, test: (value) => /[0-9]/.test(value) },
  { id: "symbol", label: "Symbols", hint: "!@#$%", size: 33, test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const SCENARIOS = [
  { id: "throttled", label: "Online attack, rate limited", detail: "100 guesses / second", rate: 1e2 },
  { id: "unthrottled", label: "Online attack, no rate limit", detail: "10 thousand guesses / second", rate: 1e4 },
  { id: "slow", label: "Offline crack, slow hash (bcrypt)", detail: "10 thousand guesses / second", rate: 1e4 },
  { id: "gpu", label: "Offline crack, fast hash (GPU)", detail: "10 billion guesses / second", rate: 1e10 },
  { id: "rig", label: "Dedicated cracking rig", detail: "1 trillion guesses / second", rate: 1e12 },
];

const SCORE_LEVELS = [
  { label: "Very weak", tone: "var(--anslation-ds-danger)" },
  { label: "Weak", tone: "var(--anslation-ds-danger)" },
  { label: "Fair", tone: "var(--anslation-ds-warning)" },
  { label: "Strong", tone: "var(--primary)" },
  { label: "Excellent", tone: "var(--anslation-ds-success)" },
];

const EXAMPLES = [
  { label: "Season + year", value: "Summer2024!" },
  { label: "Leet speak", value: "P@ssw0rd123" },
  { label: "Keyboard run", value: "qwerty12345" },
  { label: "Random 14", value: "vT7#kQz2Lm!9Xw" },
];

const LEET_MAP = { "@": "a", "3": "e", "0": "o", "1": "i", $: "s" };

const SEPARATORS = ["-", ".", "_", "+", "=", "!", "?", "&"];

const WORD_SET = new Set([
  ...DICTIONARY_WORDS,
  ...COMMON_PASSWORDS.filter((word) => /^[a-z]+$/.test(word)),
]);

const WORD_LIST = [...WORD_SET];

const numberFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function unleet(value) {
  let output = "";
  for (const char of value) output += LEET_MAP[char] || char;
  return output;
}

function listOf(items) {
  if (items.length <= 1) return items[0] || "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function plural(value, unit) {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

function humanizeSeconds(seconds) {
  if (!Number.isFinite(seconds)) return "centuries";
  if (seconds < 1) return "instant";
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = minutes / 60;
  if (hours < 24) return plural(Math.round(hours), "hour");
  const days = hours / 24;
  if (days < 31) return plural(Math.round(days), "day");
  const months = days / 30.44;
  if (months < 12) return plural(Math.round(months), "month");
  const years = days / 365.25;
  if (years < 100) return plural(Math.round(years), "year");
  return "centuries";
}

function scoreForBits(bits) {
  if (bits < 28) return 0;
  if (bits < 36) return 1;
  if (bits < 60) return 2;
  if (bits < 128) return 3;
  return 4;
}

function keyboardRun(value) {
  for (let start = 0; start < value.length; start += 1) {
    for (let end = value.length; end - start >= 4; end -= 1) {
      const chunk = value.slice(start, end);
      for (const row of KEYBOARD_ROWS) {
        if (row.includes(chunk)) return chunk;
        if ([...row].reverse().join("").includes(chunk)) return chunk;
      }
    }
  }
  return null;
}

function analyze(password) {
  const length = password.length;
  const activeSets = CHAR_SETS.filter((set) => set.test(password));
  const poolSize = activeSets.reduce((total, set) => total + set.size, 0);
  const poolBits = poolSize > 0 ? Math.log2(poolSize) : 0;
  const rawBits = length * poolBits;

  const findings = [];
  const lower = password.toLowerCase();

  if (length > 0) {
    const commonIndex = COMMON_PASSWORDS.indexOf(lower);
    if (commonIndex >= 0) {
      findings.push({
        id: "common",
        label: "On the common-password list",
        detail: `Ranked #${commonIndex + 1} among the most-used passwords ever leaked. Cracking tools try this list first, so extra length or symbols would not help here.`,
        fix: "Choose something that has never appeared on a leaked list.",
        cap: 0,
        ceiling: Math.log2(commonIndex + 1),
      });
    }

    const shape = lower.match(/^([a-z]{3,})([0-9]{0,4})([^a-z0-9]{0,2})$/);
    if (commonIndex < 0 && shape && WORD_SET.has(shape[1])) {
      const [, base, digits, symbols] = shape;
      const ceiling =
        Math.log2(WORD_SET.size) +
        digits.length * Math.log2(10) +
        symbols.length * Math.log2(33) +
        (/[A-Z]/.test(password) ? 1 : 0);
      findings.push({
        id: "word-shape",
        label: digits ? "Dictionary word plus digits" : "A single dictionary word",
        detail: digits
          ? `"${base}" followed by "${digits}"${symbols ? ` and "${symbols}"` : ""} is the very first shape a cracking tool tries. A wordlist attack needs only about ${numberFormat.format(2 ** ceiling)} guesses, not ${numberFormat.format(2 ** rawBits)}.`
          : `"${base}" is a plain dictionary word, so a wordlist attack needs roughly ${numberFormat.format(WORD_SET.size)} guesses.`,
        fix: "Break the word up, or string several unrelated words together instead of one.",
        cap: 1,
        ceiling,
      });
    }

    const deleeted = unleet(lower);
    if (deleeted !== lower) {
      const leetShape = deleeted.match(/^([a-z]{3,})([0-9]{0,4})([^a-z0-9]{0,2})$/);
      const exact = leetShape && WORD_SET.has(leetShape[1]) ? leetShape[1] : null;
      const candidate = exact || WORD_LIST.find((word) => word.length >= 4 && deleeted.includes(word));
      const embedded = candidate && !lower.includes(candidate) ? candidate : null;
      if (embedded) {
        const swaps = [...lower].filter((char) => LEET_MAP[char]).length;
        findings.push({
          id: "leet",
          label: "Leet-speak dictionary word",
          detail: `Undoing @ to a, 3 to e, 0 to o, 1 to i and $ to s turns this into "${deleeted}", which contains "${embedded}". Cracking tools apply those swaps automatically, so they cost an attacker about ${swaps} bit${swaps === 1 ? "" : "s"} of extra work.`,
          fix: "Character swaps add almost nothing. Change the word itself, not its spelling.",
          cap: 1,
          ceiling: Math.log2(WORD_SET.size) + swaps + 4,
        });
      }
    }

    const run = keyboardRun(lower);
    if (run) {
      findings.push({
        id: "keyboard",
        label: "Keyboard pattern",
        detail: `"${run}" is a straight run across the keyboard. There are only a couple hundred such runs, so those ${run.length} characters behave like a single choice.`,
        fix: "Avoid straight lines such as qwerty, asdf, or 12345.",
        cap: 1,
        penalty: Math.max(0, run.length * poolBits - Math.log2(8 * 10 * 2)),
      });
    }

    const repeat = lower.match(/(.)\1{2,}/);
    if (repeat) {
      findings.push({
        id: "repeat",
        label: "Repeated characters",
        detail: `"${repeat[0]}" is the same character ${repeat[0].length} times over. A repeat is one choice plus a length, not ${repeat[0].length} independent choices.`,
        fix: "Replace the repeated run with different characters.",
        cap: 2,
        penalty: Math.max(0, repeat[0].length * poolBits - (poolBits + Math.log2(repeat[0].length))),
      });
    }

    const cycle = lower.match(/^(.{1,3})\1+$/);
    if (cycle) {
      findings.push({
        id: "cycle",
        label: "Short block repeated",
        detail: `The whole password is "${cycle[1]}" repeated ${length / cycle[1].length} times, so only ${cycle[1].length} character${cycle[1].length === 1 ? "" : "s"} carry any real randomness.`,
        fix: "Repeating a block adds no strength. Extend it with fresh characters instead.",
        cap: 1,
        ceiling: cycle[1].length * poolBits + 2,
      });
    }

    const year = password.match(/(19[5-9][0-9]|20[0-2][0-9]|2030)/);
    if (year) {
      findings.push({
        id: "year",
        label: "Contains a year",
        detail: `"${year[0]}" sits in the 1950-2030 range attackers try first: birth years, graduation years, and the current year.`,
        fix: "Drop the year, or swap it for digits that mean nothing to you.",
        cap: 3,
        penalty: Math.max(0, 4 * poolBits - Math.log2(81)),
      });
    }
  }

  let ceiling = rawBits;
  let penalised = rawBits;
  findings.forEach((finding) => {
    if (typeof finding.ceiling === "number") ceiling = Math.min(ceiling, finding.ceiling);
    if (typeof finding.penalty === "number") penalised -= finding.penalty;
  });
  const effectiveBits = Math.max(0, Math.min(ceiling, penalised));

  let score = scoreForBits(effectiveBits);
  findings.forEach((finding) => {
    if (typeof finding.cap === "number") score = Math.min(score, finding.cap);
  });

  const suggestions = [];
  if (length > 0) {
    if (length < 12) {
      suggestions.push("Aim for at least 12 characters. Length buys more strength than any symbol trick.");
    }
    const missing = CHAR_SETS.filter((set) => !set.test(password));
    if (missing.length && length < 20) {
      suggestions.push(`Widen the character pool by adding ${listOf(missing.map((set) => set.label.toLowerCase()))}.`);
    }
    findings.forEach((finding) => suggestions.push(finding.fix));
    if (!suggestions.length) {
      suggestions.push("Nothing to fix here. Keep it in a password manager so you never have to retype it.");
    }
    suggestions.push("Use a different password on every site. Reuse is what turns one breach into many.");
  }

  return {
    length,
    activeSets,
    poolSize,
    poolBits,
    rawBits,
    effectiveBits,
    score,
    findings,
    suggestions,
  };
}

function randomInt(max) {
  const buffer = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;
  let value = limit;
  while (value >= limit) {
    window.crypto.getRandomValues(buffer);
    value = buffer[0];
  }
  return value % max;
}

function makePassphrase(count) {
  const words = [];
  while (words.length < count) {
    const word = PASSPHRASE_WORDS[randomInt(PASSPHRASE_WORDS.length)];
    if (!words.includes(word)) words.push(word);
  }
  const capitalizeAt = randomInt(count);
  const shaped = words.map((word, index) =>
    index === capitalizeAt ? word[0].toUpperCase() + word.slice(1) : word
  );
  const separator = SEPARATORS[randomInt(SEPARATORS.length)];
  return `${shaped.join(separator)}${separator}${String(randomInt(100)).padStart(2, "0")}`;
}

function passphraseBits(count) {
  let bits = 0;
  for (let i = 0; i < count; i += 1) bits += Math.log2(PASSPHRASE_WORDS.length - i);
  return bits + Math.log2(count) + Math.log2(SEPARATORS.length) + Math.log2(100);
}

function crackSeconds(bits, rate) {
  const guesses = 2 ** Math.max(0, bits - 1);
  return guesses / rate;
}

export default function ToolHome() {
  const [password, setPassword] = useState("Summer2024!");
  const [visible, setVisible] = useState(false);
  const [wordCount, setWordCount] = useState(4);
  const [passphrase, setPassphrase] = useState("");
  const [copied, setCopied] = useState(false);

  const analysis = useMemo(() => analyze(password), [password]);

  const regenerate = useCallback((count) => {
    try {
      setPassphrase(makePassphrase(count));
    } catch {
      setPassphrase("");
    }
  }, []);

  useEffect(() => {
    regenerate(wordCount);
  }, [regenerate, wordCount]);

  const level = SCORE_LEVELS[analysis.score];
  const phraseBits = passphraseBits(wordCount);

  const copyPassphrase = async () => {
    if (!passphrase) return;
    const success = await safeCopyText(passphrase);
    if (!success) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ShieldCheck className="h-4 w-4" />
            Runs entirely offline
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Password Strength Checker</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            See how long your password would survive a real attack — entropy maths, crack-time estimates across five
            attacker budgets, and the exact patterns that give it away.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <label className="block">
                <span className="text-sm font-semibold">Password to test</span>
                <div className="relative mt-2">
                  <input
                    type={visible ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    placeholder="Type or paste a password"
                    className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 pr-12 font-mono outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                  <button
                    type="button"
                    onClick={() => setVisible((value) => !value)}
                    className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
                    aria-label={visible ? "Hide password" : "Show password"}
                  >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <div
                className="mt-3 flex items-start gap-2 rounded-md p-3"
                style={{ background: "var(--anslation-ds-success-soft)" }}
              >
                <Lock
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: "var(--anslation-ds-success)" }}
                  aria-hidden="true"
                />
                <p className="text-xs leading-5" style={{ color: "var(--anslation-ds-success)" }}>
                  <strong>Checked locally — never leaves your browser.</strong> Every calculation on this page runs in
                  your own tab. Nothing is uploaded, logged, or saved.
                </p>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold">Try an example</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {EXAMPLES.map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      onClick={() => setPassword(example.value)}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-sm font-semibold uppercase tracking-wide">Generate a passphrase instead</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                A few unrelated words you can actually remember beat a short word with symbols jammed into it.
              </p>

              <div className="mt-4 flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="flex-1 break-all font-mono text-sm font-semibold" aria-live="polite">
                  {passphrase || "Generating…"}
                </p>
                <button
                  type="button"
                  onClick={() => regenerate(wordCount)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--primary)]"
                  aria-label="Generate a new passphrase"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={copyPassphrase}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--primary)]"
                  aria-label="Copy passphrase"
                >
                  {copied ? (
                    <Check className="h-4 w-4" style={{ color: "var(--anslation-ds-success)" }} />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-semibold">Words: {wordCount}</span>
                <input
                  type="range"
                  min={4}
                  max={7}
                  step={1}
                  value={wordCount}
                  onChange={(event) => setWordCount(Number(event.target.value))}
                  className="mt-2 w-full accent-[var(--primary)]"
                />
              </label>

              <div className="mt-3 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                <p>
                  <strong className="text-[var(--foreground)]">≈ {phraseBits.toFixed(1)} bits</strong> —{" "}
                  {wordCount} distinct words from a {PASSPHRASE_WORDS.length}-word list, one word capitalised, a random
                  separator, and two digits.
                </p>
                <p className="mt-2">
                  We count the real choices the generator makes, not the character count. The recipe is public, so
                  pretending a 30-character string is 190 bits would be lying to you.{" "}
                  {phraseBits < 60
                    ? "Push it to 7 words for anything that matters — email, banking, or your password manager."
                    : "That is solid for everyday accounts."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Overall strength</p>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: "var(--muted)", color: level.tone }}
                >
                  {analysis.length ? level.label : "Waiting for input"}
                </span>
              </div>

              <div className="mt-3 flex gap-1.5" aria-live="polite" aria-label={`Strength: ${level.label}`}>
                {SCORE_LEVELS.map((item, index) => (
                  <div
                    key={item.label}
                    className="h-2.5 flex-1 rounded-full transition-colors"
                    style={{
                      background: analysis.length && index <= analysis.score ? level.tone : "var(--muted)",
                    }}
                  />
                ))}
              </div>

              <div className="tool-compact-grid mt-5">
                {[
                  ["Length", analysis.length],
                  ["Character pool", analysis.poolSize],
                  ["Raw entropy", `${analysis.rawBits.toFixed(1)} bits`],
                  ["After patterns", `${analysis.effectiveBits.toFixed(1)} bits`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: raw entropy = log2(poolSize<sup>length</sup>) = {analysis.length} × log2({analysis.poolSize}) ={" "}
                {analysis.rawBits.toFixed(1)} bits. That assumes every character was picked at random — the patterns
                below undo that assumption and cap the score.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {CHAR_SETS.map((set) => {
                  const active = set.test(password);
                  return (
                    <span
                      key={set.id}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
                      style={{
                        borderColor: active ? "var(--anslation-ds-success)" : "var(--border)",
                        color: active ? "var(--anslation-ds-success)" : "var(--muted-foreground)",
                        background: active ? "var(--anslation-ds-success-soft)" : "transparent",
                      }}
                    >
                      {active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {set.label}
                      <span className="font-normal opacity-70">{set.hint}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Time to crack</h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Based on {analysis.effectiveBits.toFixed(1)} bits, assuming an attacker searches half the keyspace on
                average.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[26rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left">
                      <th className="pb-2 font-semibold">Attacker</th>
                      <th className="pb-2 font-semibold">Speed</th>
                      <th className="pb-2 text-right font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCENARIOS.map((scenario) => {
                      const seconds = crackSeconds(analysis.effectiveBits, scenario.rate);
                      const risky = seconds < 86400 * 30;
                      return (
                        <tr key={scenario.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-2.5 pr-3">{scenario.label}</td>
                          <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{scenario.detail}</td>
                          <td
                            className="py-2.5 text-right font-semibold"
                            style={{
                              color: !analysis.length
                                ? "var(--muted-foreground)"
                                : risky
                                  ? "var(--anslation-ds-danger)"
                                  : "var(--anslation-ds-success)",
                            }}
                          >
                            {analysis.length ? humanizeSeconds(seconds) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {analysis.findings.length > 0 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <TriangleAlert className="h-4 w-4" style={{ color: "var(--anslation-ds-warning)" }} />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    Patterns found ({analysis.findings.length})
                  </h2>
                </div>
                <div className="mt-4 grid gap-3">
                  {analysis.findings.map((finding) => (
                    <div
                      key={finding.id}
                      className="rounded-md border-l-2 bg-[var(--muted)] p-3"
                      style={{ borderColor: "var(--anslation-ds-warning)" }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{finding.label}</p>
                        <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                          caps score at {SCORE_LEVELS[finding.cap].label.toLowerCase()}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{finding.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.suggestions.length > 0 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-[var(--primary)]" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">What to do next</h2>
                </div>
                <ul className="mt-4 grid gap-2.5">
                  {analysis.suggestions.map((suggestion) => (
                    <li key={suggestion} className="flex items-start gap-2 text-sm leading-6">
                      <Check
                        className="mt-1 h-3.5 w-3.5 shrink-0"
                        style={{ color: "var(--primary)" }}
                        aria-hidden="true"
                      />
                      <span className="text-[var(--muted-foreground)]">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
