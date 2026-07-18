"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CarFront,
  CheckCircle2,
  Flag,
  History,
  Info,
  ListChecks,
  RotateCcw,
  Timer,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { CATEGORIES, QUESTIONS, RULE_CARDS } from "../data";

const TEST_SIZE = 20;
const TEST_SECONDS = 20 * 60;
const PASS_MARK = 12;

const STORE_STATS = "altf:rto-mock-test:stats";
const STORE_REVISE = "altf:rto-mock-test:revise";

const SIGN_INK = {
  red: "#C8102E",
  blue: "#0B4EA2",
  white: "#FFFFFF",
  dark: "#1A1A1A",
};

const shuffle = (input) => {
  const list = [...input];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = list[i];
    list[i] = list[j];
    list[j] = swap;
  }
  return list;
};

const prepare = (question) => {
  const order = shuffle([0, 1, 2, 3]);
  return {
    ...question,
    opts: order.map((index) => question.options[index]),
    correct: order.indexOf(question.answer),
  };
};

const buildPaper = () => {
  const byCategory = CATEGORIES.map((category) =>
    shuffle(QUESTIONS.filter((question) => question.cat === category.id))
  );
  const picked = [];
  byCategory.forEach((pool) => {
    picked.push(...pool.slice(0, 2));
  });
  const used = new Set(picked.map((question) => question.id));
  const filler = shuffle(QUESTIONS.filter((question) => !used.has(question.id)));
  picked.push(...filler.slice(0, TEST_SIZE - picked.length));
  return shuffle(picked).slice(0, TEST_SIZE).map(prepare);
};

const clockText = (totalSeconds) => {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const readStore = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const writeStore = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
};

function SignGlyph({ sign, size = 92 }) {
  if (!sign) return null;
  const { kind, glyph } = sign;
  const label = `Traffic sign illustration: ${kind.replace(/-/g, " ")} ${glyph || ""}`.trim();

  const face = (() => {
    if (kind === "stop") {
      const points = Array.from({ length: 8 }, (_, i) => {
        const angle = (Math.PI / 4) * i + Math.PI / 8;
        return `${50 + 46 * Math.cos(angle)},${50 + 46 * Math.sin(angle)}`;
      }).join(" ");
      return (
        <>
          <polygon points={points} fill={SIGN_INK.red} stroke={SIGN_INK.white} strokeWidth="4" />
          <text x="50" y="57" textAnchor="middle" fontSize="20" fontWeight="700" fill={SIGN_INK.white}>
            STOP
          </text>
        </>
      );
    }
    if (kind === "giveway") {
      return (
        <>
          <polygon points="50,92 6,14 94,14" fill={SIGN_INK.white} stroke={SIGN_INK.red} strokeWidth="10" />
          <text x="50" y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill={SIGN_INK.dark}>
            GIVE
          </text>
          <text x="50" y="57" textAnchor="middle" fontSize="13" fontWeight="700" fill={SIGN_INK.dark}>
            WAY
          </text>
        </>
      );
    }
    if (kind === "cautionary") {
      return (
        <>
          <polygon points="50,8 94,86 6,86" fill={SIGN_INK.white} stroke={SIGN_INK.red} strokeWidth="8" />
          <text x="50" y="74" textAnchor="middle" fontSize="30" fontWeight="700" fill={SIGN_INK.dark}>
            {glyph}
          </text>
        </>
      );
    }
    if (kind === "informatory") {
      return (
        <>
          <rect x="10" y="20" width="80" height="60" rx="6" fill={SIGN_INK.blue} stroke={SIGN_INK.white} strokeWidth="4" />
          <text x="50" y="62" textAnchor="middle" fontSize="34" fontWeight="700" fill={SIGN_INK.white}>
            {glyph}
          </text>
        </>
      );
    }
    if (kind === "blue-circle") {
      return (
        <>
          <circle cx="50" cy="50" r="42" fill={SIGN_INK.blue} stroke={SIGN_INK.white} strokeWidth="4" />
          <text x="50" y="64" textAnchor="middle" fontSize="42" fontWeight="700" fill={SIGN_INK.white}>
            {glyph}
          </text>
        </>
      );
    }
    if (kind === "no-entry") {
      return (
        <>
          <circle cx="50" cy="50" r="42" fill={SIGN_INK.red} stroke={SIGN_INK.white} strokeWidth="4" />
          <rect x="22" y="43" width="56" height="14" rx="2" fill={SIGN_INK.white} />
        </>
      );
    }
    return (
      <>
        <circle cx="50" cy="50" r="42" fill={SIGN_INK.white} stroke={SIGN_INK.red} strokeWidth="9" />
        <text x="50" y="63" textAnchor="middle" fontSize={String(glyph).length > 2 ? "20" : "30"} fontWeight="700" fill={SIGN_INK.dark}>
          {glyph}
        </text>
        {kind === "prohibitory-bar" && (
          <line x1="22" y1="78" x2="78" y2="22" stroke={SIGN_INK.red} strokeWidth="9" strokeLinecap="round" />
        )}
      </>
    );
  })();

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label} className="shrink-0">
      {face}
    </svg>
  );
}

function ScoreRing({ score, total }) {
  const pct = total === 0 ? 0 : score / total;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const passed = score >= PASS_MARK;
  return (
    <svg viewBox="0 0 130 130" className="h-36 w-36" role="img" aria-label={`Score ${score} out of ${total}`}>
      <circle cx="65" cy="65" r={radius} fill="none" stroke="var(--border)" strokeWidth="11" />
      <circle
        cx="65"
        cy="65"
        r={radius}
        fill="none"
        stroke={passed ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)"}
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray={`${circumference * pct} ${circumference}`}
        transform="rotate(-90 65 65)"
      />
      <text x="65" y="62" textAnchor="middle" fontSize="30" fontWeight="700" fill="var(--foreground)">
        {score}
      </text>
      <text x="65" y="84" textAnchor="middle" fontSize="14" fill="var(--muted-foreground)">
        of {total}
      </text>
    </svg>
  );
}

function OptionRow({ text, index, state, onSelect, disabled }) {
  const letters = ["A", "B", "C", "D"];
  const tone =
    state === "correct"
      ? "border-[var(--anslation-ds-success)] bg-[var(--muted)]"
      : state === "wrong"
        ? "border-[var(--anslation-ds-danger)] bg-[var(--muted)]"
        : state === "chosen"
          ? "border-[var(--primary)] bg-[var(--muted)]"
          : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]";

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      disabled={disabled}
      className={`flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left text-sm leading-6 transition disabled:cursor-default ${tone}`}
    >
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-xs font-semibold">
        {letters[index]}
      </span>
      <span className="flex-1 font-medium">{text}</span>
      {state === "correct" && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--anslation-ds-success)]" />}
      {state === "wrong" && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--anslation-ds-danger)]" />}
    </button>
  );
}

function BreakdownBars({ rows }) {
  return (
    <div className="grid gap-3">
      {rows.map((row) => {
        const pct = row.total === 0 ? 0 : Math.round((row.score / row.total) * 100);
        return (
          <div key={row.id}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold">{row.label}</span>
              <span className="text-[var(--muted-foreground)]">
                {row.score}/{row.total}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: pct >= 60 ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ToolHome() {
  const [tab, setTab] = useState("test");
  const [paper, setPaper] = useState(null);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState([]);
  const [index, setIndex] = useState(0);
  const [endsAt, setEndsAt] = useState(null);
  const [remaining, setRemaining] = useState(TEST_SECONDS);
  const [result, setResult] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const [practiceCat, setPracticeCat] = useState(CATEGORIES[0].id);
  const [practiceDeck, setPracticeDeck] = useState([]);
  const [practicePick, setPracticePick] = useState({});

  const [reviseIds, setReviseIds] = useState([]);
  const [stats, setStats] = useState({ attempts: 0, best: 0, history: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStats(readStore(STORE_STATS, { attempts: 0, best: 0, history: [] }));
    setReviseIds(readStore(STORE_REVISE, []));
    setPracticeDeck(shuffle(QUESTIONS.filter((question) => question.cat === CATEGORIES[0].id)).map(prepare));
    setHydrated(true);
  }, []);

  const pickCategory = (id) => {
    setPracticeCat(id);
    setPracticeDeck(shuffle(QUESTIONS.filter((question) => question.cat === id)).map(prepare));
    setPracticePick({});
  };

  const finishTest = useCallback(() => {
    if (!paper) return;

    const detail = paper.map((question) => ({
      id: question.id,
      cat: question.cat,
      q: question.q,
      sign: question.sign,
      why: question.why,
      opts: question.opts,
      correct: question.correct,
      chosen: answers[question.id] ?? null,
      ok: answers[question.id] === question.correct,
    }));
    const score = detail.filter((row) => row.ok).length;
    const passed = score >= PASS_MARK;
    const breakdown = CATEGORIES.map((category) => {
      const rows = detail.filter((row) => row.cat === category.id);
      return {
        id: category.id,
        label: category.short,
        total: rows.length,
        score: rows.filter((row) => row.ok).length,
      };
    }).filter((row) => row.total > 0);

    const nextRevise = Array.from(
      new Set([...reviseIds, ...detail.filter((row) => !row.ok).map((row) => row.id)])
    );
    const nextStats = {
      attempts: stats.attempts + 1,
      best: Math.max(stats.best, score),
      history: [{ at: Date.now(), score, total: paper.length, passed }, ...stats.history].slice(0, 12),
    };

    writeStore(STORE_REVISE, nextRevise);
    writeStore(STORE_STATS, nextStats);

    setResult({ detail, score, total: paper.length, breakdown, passed });
    setReviseIds(nextRevise);
    setStats(nextStats);
    setPaper(null);
    setEndsAt(null);
    setConfirming(false);
  }, [paper, answers, reviseIds, stats]);

  useEffect(() => {
    if (!endsAt) return undefined;
    const tick = () => {
      const left = Math.round((endsAt - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0) finishTest();
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt, finishTest]);

  const startTest = (source) => {
    const questions = source && source.length >= 5 ? shuffle(source).slice(0, TEST_SIZE).map(prepare) : buildPaper();
    setPaper(questions);
    setAnswers({});
    setMarked([]);
    setIndex(0);
    setResult(null);
    setConfirming(false);
    setRemaining(TEST_SECONDS);
    setEndsAt(Date.now() + TEST_SECONDS * 1000);
    setTab("test");
  };

  const abandonTest = () => {
    setPaper(null);
    setEndsAt(null);
    setConfirming(false);
    setResult(null);
  };

  const reviseQuestions = useMemo(
    () => QUESTIONS.filter((question) => reviseIds.includes(question.id)),
    [reviseIds]
  );

  const clearRevise = () => {
    setReviseIds([]);
    writeStore(STORE_REVISE, []);
  };

  const dropFromRevise = (id) => {
    const next = reviseIds.filter((item) => item !== id);
    setReviseIds(next);
    writeStore(STORE_REVISE, next);
  };

  const addToRevise = (id) => {
    if (reviseIds.includes(id)) return;
    const next = [...reviseIds, id];
    setReviseIds(next);
    writeStore(STORE_REVISE, next);
  };

  const resetHistory = () => {
    const blank = { attempts: 0, best: 0, history: [] };
    setStats(blank);
    writeStore(STORE_STATS, blank);
  };

  const active = paper ? paper[index] : null;
  const answeredCount = paper ? paper.filter((question) => answers[question.id] !== undefined).length : 0;
  const lowTime = remaining <= 120;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <CarFront className="h-4 w-4" />
            Learner&apos;s licence practice
          </div>
          <h1 className="text-4xl font-semibold leading-tight">RTO Driving Licence Mock Test</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            {QUESTIONS.length} RTO-style questions on traffic signs, road rules, right of way, documents, penalties and
            safe driving. Sit a timed 20-question mock, or practise one category at a time with instant explanations.
          </p>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Pass mark {PASS_MARK}/{TEST_SIZE} ({Math.round((PASS_MARK / TEST_SIZE) * 100)}%) &middot; {TEST_SECONDS / 60}{" "}
            minute limit &middot; everything runs on your device
          </p>
        </section>

        {!paper && !result && (
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Sections">
            {[
              { id: "test", label: "Mock test", icon: Timer },
              { id: "practice", label: "Practice", icon: BookOpen },
              { id: "revise", label: `Revise these${reviseIds.length ? ` (${reviseIds.length})` : ""}`, icon: Flag },
              { id: "rules", label: "Quick reference", icon: ListChecks },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition ${
                    tab === item.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        {paper && active && (
          <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_300px]">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Question {index + 1} of {paper.length} &middot;{" "}
                  {CATEGORIES.find((category) => category.id === active.cat)?.short}
                </p>
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold tabular-nums ${
                    lowTime ? "border-[var(--anslation-ds-danger)] text-[var(--anslation-ds-danger)]" : "border-[var(--border)] text-[var(--muted-foreground)]"
                  }`}
                  aria-live="polite"
                >
                  <Timer className="h-4 w-4" />
                  {clockText(remaining)}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-start gap-5">
                {active.sign && (
                  <div className="rounded-md border border-[var(--border)] bg-[var(--muted)] p-3">
                    <SignGlyph sign={active.sign} />
                  </div>
                )}
                <h2 className="min-w-[260px] flex-1 text-lg font-semibold leading-7">{active.q}</h2>
              </div>

              <div className="mt-5 grid gap-2.5">
                {active.opts.map((text, optionIndex) => (
                  <OptionRow
                    key={text}
                    text={text}
                    index={optionIndex}
                    state={answers[active.id] === optionIndex ? "chosen" : "idle"}
                    onSelect={(value) => setAnswers((current) => ({ ...current, [active.id]: value }))}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setMarked((current) =>
                      current.includes(active.id)
                        ? current.filter((item) => item !== active.id)
                        : [...current, active.id]
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    marked.includes(active.id)
                      ? "border-[var(--primary)] text-[var(--primary)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  <Flag className="h-4 w-4" />
                  {marked.includes(active.id) ? "Marked for review" : "Mark for review"}
                </button>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIndex((current) => Math.max(0, current - 1))}
                    disabled={index === 0}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>
                  {index < paper.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setIndex((current) => Math.min(paper.length - 1, current + 1))}
                      className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-1.5 text-sm font-semibold text-[var(--primary-foreground)]"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirming(true)}
                      className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-1.5 text-sm font-semibold text-[var(--primary-foreground)]"
                    >
                      Submit test
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">Progress</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]" aria-live="polite">
                {answeredCount} of {paper.length} answered
              </p>
              <div className="mt-4 grid grid-cols-10 gap-1.5 2xl:grid-cols-5">
                {paper.map((question, dotIndex) => {
                  const isAnswered = answers[question.id] !== undefined;
                  const isMarked = marked.includes(question.id);
                  const isActive = dotIndex === index;
                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => setIndex(dotIndex)}
                      aria-label={`Go to question ${dotIndex + 1}${isAnswered ? ", answered" : ""}${isMarked ? ", marked for review" : ""}`}
                      aria-current={isActive ? "true" : undefined}
                      className={`flex h-9 items-center justify-center rounded-md border text-xs font-semibold transition ${
                        isActive
                          ? "border-[var(--primary)] ring-2 ring-[var(--primary)]"
                          : "border-[var(--border)]"
                      } ${
                        isMarked
                          ? "text-[var(--primary)]"
                          : isAnswered
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "bg-[var(--background)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      {dotIndex + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-1.5 text-xs text-[var(--muted-foreground)]">
                <p>Filled = answered &middot; teal number = marked for review</p>
              </div>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="mt-5 w-full rounded-md bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]"
              >
                Submit test
              </button>
              <button type="button" onClick={abandonTest} className="btn-secondary mt-2 w-full min-h-9 px-3 py-1.5 text-sm">
                Quit without scoring
              </button>
            </div>
          </section>
        )}

        {confirming && (
          <div className="mt-6 rounded-lg border border-[var(--primary)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-base font-semibold">Submit this test?</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              You have answered {answeredCount} of {paper?.length ?? TEST_SIZE} questions
              {answeredCount < (paper?.length ?? TEST_SIZE)
                ? ` — the remaining ${(paper?.length ?? TEST_SIZE) - answeredCount} will be marked wrong.`
                : "."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={finishTest}
                className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
              >
                Yes, submit
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                Keep answering
              </button>
            </div>
          </div>
        )}

        {result && (
          <section className="mt-6 grid gap-6">
            <div className="grid gap-6 2xl:grid-cols-[380px_1fr]">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-5">
                  <ScoreRing score={result.score} total={result.total} />
                  <div>
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase"
                      style={{
                        background: result.passed ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      {result.passed ? <Trophy className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {result.passed ? "Pass" : "Fail"}
                    </span>
                    <p className="mt-3 text-2xl font-semibold">
                      {Math.round((result.score / result.total) * 100)}%
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      Pass mark is {PASS_MARK}/{result.total}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startTest(null)}
                    className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    New test
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResult(null);
                      setTab("revise");
                    }}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <Flag className="h-4 w-4" />
                    Revise mistakes
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <p className="mb-4 text-sm font-semibold">Category breakdown</p>
                <BreakdownBars rows={result.breakdown} />
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">Full review</p>
              <div className="mt-4 grid gap-4">
                {result.detail.map((row, rowIndex) => (
                  <div key={row.id} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                    <div className="flex flex-wrap items-start gap-4">
                      {row.sign && <SignGlyph sign={row.sign} size={64} />}
                      <div className="min-w-[240px] flex-1">
                        <p className="text-sm font-semibold leading-6">
                          {rowIndex + 1}. {row.q}
                        </p>
                        <div className="mt-3 grid gap-2 text-sm">
                          <p className="flex flex-wrap items-center gap-2">
                            <span className="text-[var(--muted-foreground)]">Your answer:</span>
                            <span
                              className="font-semibold"
                              style={{ color: row.ok ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)" }}
                            >
                              {row.chosen === null ? "Not answered" : row.opts[row.chosen]}
                            </span>
                          </p>
                          {!row.ok && (
                            <p className="flex flex-wrap items-center gap-2">
                              <span className="text-[var(--muted-foreground)]">Correct answer:</span>
                              <span className="font-semibold" style={{ color: "var(--anslation-ds-success)" }}>
                                {row.opts[row.correct]}
                              </span>
                            </p>
                          )}
                        </div>
                        <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
                          <Info className="mr-1.5 inline h-3.5 w-3.5 align-[-2px] text-[var(--primary)]" />
                          {row.why}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!paper && !result && tab === "test" && (
          <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_340px]">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-xl font-semibold">Sit a mock test</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                {TEST_SIZE} questions drawn at random from all {CATEGORIES.length} categories, with the options shuffled
                each time. You get {TEST_SECONDS / 60} minutes and need {PASS_MARK} correct to pass — the same shape as a
                typical Indian learner&apos;s licence test.
              </p>
              <div className="tool-compact-grid mt-5">
                {[
                  ["Questions", `${TEST_SIZE}`],
                  ["Time limit", `${TEST_SECONDS / 60} min`],
                  ["Pass mark", `${PASS_MARK} correct`],
                  ["Question bank", `${QUESTIONS.length}`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startTest(null)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]"
                >
                  <Zap className="h-4 w-4" />
                  Start {TEST_SIZE}-question test
                </button>
                {reviseQuestions.length >= 5 && (
                  <button type="button" onClick={() => startTest(reviseQuestions)} className="btn-secondary min-h-11 px-4 py-2.5 text-sm">
                    <Flag className="h-4 w-4" />
                    Test me on my mistakes ({reviseQuestions.length})
                  </button>
                )}
              </div>
              <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--muted)] p-4">
                <p className="text-xs leading-6 text-[var(--muted-foreground)]">
                  <strong className="text-[var(--foreground)]">This is practice, not an official test.</strong> It is not
                  affiliated with any RTO or transport authority and passing here does not grant a licence. Question
                  patterns and penalties follow the Motor Vehicles Act as amended in 2019, but rules and fines vary by
                  state and change over time — always confirm with your regional transport office.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-sm font-semibold">
                  <History className="h-4 w-4 text-[var(--primary)]" />
                  Your attempts
                </p>
                {hydrated && stats.attempts > 0 && (
                  <button type="button" onClick={resetHistory} className="text-xs font-semibold text-[var(--primary)]">
                    Reset
                  </button>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Attempts</p>
                  <p className="mt-1 text-2xl font-semibold">{hydrated ? stats.attempts : 0}</p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Best score</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                    {hydrated ? stats.best : 0}
                    <span className="text-sm text-[var(--muted-foreground)]">/{TEST_SIZE}</span>
                  </p>
                </div>
              </div>
              {hydrated && stats.history.length > 0 ? (
                <div className="mt-4 grid gap-1.5">
                  {stats.history.map((row) => (
                    <div
                      key={row.at}
                      className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs"
                    >
                      <span className="text-[var(--muted-foreground)]">
                        {new Date(row.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {row.score}/{row.total}
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: row.passed ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)" }}
                      >
                        {row.passed ? "Pass" : "Fail"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-xs leading-6 text-[var(--muted-foreground)]">
                  No attempts yet. Your scores are saved on this device only.
                </p>
              )}
            </div>
          </section>
        )}

        {!paper && !result && tab === "practice" && (
          <section className="mt-6 grid gap-6 2xl:grid-cols-[300px_1fr]">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="mb-3 text-sm font-semibold">Browse by category</p>
              <div className="grid gap-2">
                {CATEGORIES.map((category) => {
                  const count = QUESTIONS.filter((question) => question.cat === category.id).length;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => pickCategory(category.id)}
                      className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-left text-sm font-semibold transition ${
                        practiceCat === category.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <span>{category.short}</span>
                      <span className="text-xs opacity-70">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-xl font-semibold">
                {CATEGORIES.find((category) => category.id === practiceCat)?.label}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                {CATEGORIES.find((category) => category.id === practiceCat)?.blurb}
              </p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Answer to see instant feedback. Anything you get wrong is added to &ldquo;Revise these&rdquo;.
              </p>

              <div className="mt-5 grid gap-4">
                {practiceDeck.map((question, questionIndex) => {
                  const picked = practicePick[question.id];
                  const answered = picked !== undefined;
                  return (
                    <div key={question.id} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                      <div className="flex flex-wrap items-start gap-4">
                        {question.sign && (
                          <div className="rounded-md border border-[var(--border)] bg-[var(--muted)] p-2">
                            <SignGlyph sign={question.sign} size={72} />
                          </div>
                        )}
                        <p className="min-w-[240px] flex-1 text-sm font-semibold leading-6">
                          {questionIndex + 1}. {question.q}
                        </p>
                      </div>
                      <div className="mt-3 grid gap-2">
                        {question.opts.map((text, optionIndex) => {
                          let state = "idle";
                          if (answered) {
                            if (optionIndex === question.correct) state = "correct";
                            else if (optionIndex === picked) state = "wrong";
                          }
                          return (
                            <OptionRow
                              key={text}
                              text={text}
                              index={optionIndex}
                              state={state}
                              disabled={answered}
                              onSelect={(value) => {
                                setPracticePick((current) => ({ ...current, [question.id]: value }));
                                if (value !== question.correct) addToRevise(question.id);
                              }}
                            />
                          );
                        })}
                      </div>
                      {answered && (
                        <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
                          <Info className="mr-1.5 inline h-3.5 w-3.5 align-[-2px] text-[var(--primary)]" />
                          {question.why}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {!paper && !result && tab === "revise" && (
          <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Revise these</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                  Every question you have answered wrong, saved on this device. Tick one off once you are confident.
                </p>
              </div>
              {hydrated && reviseQuestions.length > 0 && (
                <button type="button" onClick={clearRevise} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <RotateCcw className="h-4 w-4" />
                  Clear all
                </button>
              )}
            </div>

            {!hydrated || reviseQuestions.length === 0 ? (
              <p className="mt-5 rounded-md bg-[var(--muted)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Nothing here yet. Sit a mock test or use practice mode — anything you get wrong lands here automatically.
              </p>
            ) : (
              <div className="mt-5 grid gap-4">
                {reviseQuestions.map((question) => (
                  <div key={question.id} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                    <div className="flex flex-wrap items-start gap-4">
                      {question.sign && <SignGlyph sign={question.sign} size={64} />}
                      <div className="min-w-[240px] flex-1">
                        <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                          {CATEGORIES.find((category) => category.id === question.cat)?.short}
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6">{question.q}</p>
                        <p className="mt-2 text-sm">
                          <span className="text-[var(--muted-foreground)]">Correct answer: </span>
                          <span className="font-semibold" style={{ color: "var(--anslation-ds-success)" }}>
                            {question.options[question.answer]}
                          </span>
                        </p>
                        <p className="mt-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
                          {question.why}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => dropFromRevise(question.id)}
                        className="btn-secondary min-h-9 px-3 py-1.5 text-xs"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Got it
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {!paper && !result && tab === "rules" && (
          <section className="mt-6 grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-xl font-semibold">Rules of the road — quick reference</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                The facts that show up most often in the learner&apos;s test. Read this once before every mock attempt.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {RULE_CARDS.map((card) => (
                  <div key={card.title} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-sm font-semibold text-[var(--primary)]">{card.title}</p>
                    <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">{card.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">Sign shapes at a glance</p>
              <div className="mt-4 flex flex-wrap gap-5">
                {[
                  { sign: { kind: "mandatory", glyph: "50" }, label: "Mandatory — speed limit" },
                  { sign: { kind: "no-entry", glyph: "" }, label: "Mandatory — no entry" },
                  { sign: { kind: "prohibitory-bar", glyph: "P" }, label: "Mandatory — no parking" },
                  { sign: { kind: "blue-circle", glyph: "↑" }, label: "Compulsory ahead" },
                  { sign: { kind: "cautionary", glyph: "!" }, label: "Cautionary — warning" },
                  { sign: { kind: "informatory", glyph: "H" }, label: "Informatory — hospital" },
                  { sign: { kind: "stop", glyph: "STOP" }, label: "Stop" },
                  { sign: { kind: "giveway", glyph: "" }, label: "Give way" },
                ].map((item) => (
                  <div key={item.label} className="w-28 text-center">
                    <div className="flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--muted)] p-2">
                      <SignGlyph sign={item.sign} size={64} />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
