"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Brain,
  CheckCircle2,
  Download,
  Hash,
  History,
  Layers,
  RefreshCcw,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SafeResponsiveContainer from "@/components/charts/SafeResponsiveContainer";

const MODES = [
  { id: "digits-forward", label: "Digits Forward", icon: Hash, desc: "Remember a sequence of numbers in order" },
  { id: "digits-reverse", label: "Digits Reverse", icon: Hash, desc: "Remember numbers and recall them in reverse" },
];

const PHASES = { IDLE: "idle", SHOW: "show", INPUT: "input", FEEDBACK: "feedback", COMPLETE: "complete" };

const SHOW_DELAY_MS = 1000;
const SHOW_PER_ITEM_MS = 800;

function generateSequence(length) {
  const seq = [];
  for (let i = 0; i < length; i++) seq.push(Math.floor(Math.random() * 10));
  return seq;
}

function getSequenceDisplay(seq) {
  return seq.join(", ");
}

function getSpanGrade(span) {
  if (span >= 9) return { label: "Exceptional", tone: "good", desc: "Elite memory — well above the 7±2 average. Consider memory sports training." };
  if (span >= 7) return { label: "Above Average", tone: "good", desc: "You exceed Miller's 7±2 average. Strong working memory capacity." };
  if (span >= 5) return { label: "Average", tone: "default", desc: "Within the normal human range of 5–9 items. Typical adult short-term memory." };
  if (span >= 3) return { label: "Below Average", tone: "watch", desc: "On the lower end of normal. Chunking strategies and practice can help." };
  return { label: "Needs Practice", tone: "warn", desc: "Below typical range. Sleep, focus, and training exercises can improve this." };
}

function exportCsv(attempts, span, bestSpan) {
  const rows = [
    ["#", "Mode", "Sequence Length", "Result", "Time (ms)"],
    ...attempts.map((a, i) => [i + 1, a.mode, a.length, a.correct ? "Correct" : "Wrong", a.timeMs || ""]),
    ["", "", "", "", ""],
    ["Summary", "", "", "", ""],
    ["Current Span", span, "", "", ""],
    ["Best Span", bestSpan, "", "", ""],
  ];
  const csv = rows.map((row) => row.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "digit-span-test.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-rose-500/10 text-rose-600"
        : tone === "watch"
          ? "bg-amber-500/10 text-amber-600"
          : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
          <p className="mt-1 text-xl font-extrabold text-[var(--foreground)]">{value}</p>
          {detail && <p className="mt-1 break-words text-sm leading-5 text-[var(--muted-foreground)]">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-[var(--primary)]" />}
          {title}
        </h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-lg">
      <p className="font-semibold text-[var(--foreground)]">Attempt {item.attempt}</p>
      <p className="text-[var(--primary)]">Span: {item.span}</p>
      <p className="text-[var(--muted-foreground)]">{item.correct ? "Correct" : "Wrong"}</p>
    </div>
  );
}

function AccuracyTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-lg">
      <p className="font-semibold text-[var(--foreground)]">Length {item.length}</p>
      <p className="text-[var(--primary)]">{item.accuracy}% accuracy</p>
      <p className="text-[var(--muted-foreground)]">{item.correct}/{item.total} correct</p>
    </div>
  );
}

export default function DigitSpanTest() {
  const [mode, setMode] = useState("digits-forward");
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [span, setSpan] = useState(3);
  const [bestSpan, setBestSpan] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [showIndex, setShowIndex] = useState(-1);
  const [userInput, setUserInput] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [maxConsecutiveCorrect, setMaxConsecutiveCorrect] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [feedbackAnswer, setFeedbackAnswer] = useState("");
  const timerRef = useRef(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const accuracy = useMemo(() => {
    if (attempts.length === 0) return 0;
    return Math.round((attempts.filter((a) => a.correct).length / attempts.length) * 100);
  }, [attempts]);

  const spanChart = useMemo(
    () => attempts.map((a, i) => ({ attempt: i + 1, span: a.length, correct: a.correct, colour: a.correct ? "#059669" : "#ef4444" })),
    [attempts]
  );

  const accuracyByLength = useMemo(() => {
    const map = {};
    attempts.forEach((a) => {
      if (!map[a.length]) map[a.length] = { correct: 0, total: 0 };
      map[a.length].total++;
      if (a.correct) map[a.length].correct++;
    });
    return Object.entries(map)
      .map(([len, d]) => ({ length: Number(len), accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0, correct: d.correct, total: d.total }))
      .sort((a, b) => a.length - b.length);
  }, [attempts]);

  const startTest = useCallback(() => {
    cleanup();
    const seq = generateSequence(span);
    setSequence(seq);
    setPhase(PHASES.SHOW);
    setShowIndex(0);

    let idx = 0;
    const advance = () => {
      idx++;
      if (idx < seq.length) {
        setShowIndex(idx);
        timerRef.current = setTimeout(advance, SHOW_PER_ITEM_MS);
      } else {
        setShowIndex(-1);
        setPhase(PHASES.INPUT);
        setUserInput("");
        setStartTime(performance.now());
      }
    };
    timerRef.current = setTimeout(advance, SHOW_DELAY_MS);
  }, [span, cleanup]);

  const handleSubmit = useCallback(() => {
    const elapsed = startTime ? performance.now() - startTime : 0;
    const isReverse = mode === "digits-reverse";
    const correctSeq = isReverse ? [...sequence].reverse() : sequence;
    const userSeq = userInput
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean);
    const isCorrect = userSeq.length === correctSeq.length && userSeq.every((v, i) => String(v).toUpperCase() === String(correctSeq[i]).toUpperCase());

    const answer = isReverse ? correctSeq.join(", ") : getSequenceDisplay(sequence);

    setAttempts((prev) => [...prev, { mode, length: span, correct: isCorrect, timeMs: Math.round(elapsed) }]);
    setFeedbackCorrect(isCorrect);
    setFeedbackAnswer(answer);
    setPhase(PHASES.FEEDBACK);

    if (isCorrect) {
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      setConsecutiveWrong(0);
      if (newConsecutive > maxConsecutiveCorrect) setMaxConsecutiveCorrect(newConsecutive);
      const newSpan = span + 1;
      setSpan(newSpan);
      if (newSpan > bestSpan) setBestSpan(newSpan);
    } else {
      setConsecutiveWrong((prev) => prev + 1);
      setConsecutiveCorrect(0);
      if (consecutiveWrong >= 1 || span <= 3) {
        if (span > 3) setSpan(span - 1);
      }
    }
  }, [userInput, mode, sequence, span, startTime, consecutiveCorrect, consecutiveWrong, maxConsecutiveCorrect, bestSpan]);

  const handleContinue = useCallback(() => {
    cleanup();
    setStartTime(null);
    setPhase(PHASES.IDLE);
    setUserInput("");
  }, [cleanup]);

  const handleReset = useCallback(() => {
    cleanup();
    setPhase(PHASES.IDLE);
    setSpan(3);
    setBestSpan(0);
    setSequence([]);
    setShowIndex(-1);
    setUserInput("");
    setAttempts([]);
    setConsecutiveCorrect(0);
    setConsecutiveWrong(0);
    setMaxConsecutiveCorrect(0);
  }, [cleanup]);

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] transition-colors py-6 px-4">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10">
            <Brain className="h-8 w-8 text-teal-600" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Digit Span Test
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
            Measure your short-term working memory capacity with standard forward and reverse digit span tests.
          </p>
        </header>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            icon={Target}
            label="Current Span"
            value={`${span} items`}
            detail={getSpanGrade(span).desc.split(".")[0]}
            tone={span >= 7 ? "good" : span <= 4 ? "watch" : "default"}
          />
          <MetricCard
            icon={Trophy}
            label="Best Span"
            value={bestSpan > 0 ? `${bestSpan} items` : "—"}
            detail={bestSpan > 0 ? getSpanGrade(bestSpan).label : "Complete a round"}
            tone={bestSpan >= 7 ? "good" : "default"}
          />
          <MetricCard
            icon={CheckCircle2}
            label="Accuracy"
            value={`${accuracy}%`}
            detail={`${attempts.filter((a) => a.correct).length} of ${attempts.length} correct`}
            tone={accuracy >= 80 ? "good" : accuracy < 50 ? "warn" : "default"}
          />
          <MetricCard
            icon={Layers}
            label="Streak"
            value={`${consecutiveCorrect}`}
            detail={`Max streak: ${maxConsecutiveCorrect} • Attempts: ${attempts.length}`}
            tone={consecutiveCorrect >= 3 ? "good" : "default"}
          />
        </div>

        {/* Mode Selection */}
        <SectionCard title="Test Mode" icon={Brain} action={
          <button onClick={handleReset} className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
            <RefreshCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        }>
          <div className="grid gap-3 sm:grid-cols-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => { if (phase === PHASES.IDLE) setMode(m.id); }}
                disabled={phase !== PHASES.IDLE}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  mode === m.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30"
                } disabled:opacity-50`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  mode === m.id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "bg-[var(--section-highlight)] text-[var(--muted-foreground)]"
                }`}>
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--foreground)]">{m.label}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Test Area */}
        <div className="mt-6">
          {/* IDLE */}
          {phase === PHASES.IDLE && (
            <div
              onClick={startTest}
              className="flex h-80 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-4 border-dashed border-[var(--primary)]/30 bg-[var(--primary)]/5 transition-all hover:border-[var(--primary)]/60 hover:bg-[var(--primary)]/10 sm:h-96"
              role="button"
              tabIndex={0}
            >
              <Brain className="mb-4 h-16 w-16 text-[var(--primary)]" />
              <p className="text-2xl font-extrabold text-[var(--foreground)]">Start Test</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Current level: <span className="font-bold text-[var(--primary)]">{span} items</span> — {MODES.find((m) => m.id === mode)?.label}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Click or press Space to begin</p>
            </div>
          )}

          {/* SHOWING SEQUENCE */}
          {phase === PHASES.SHOW && (
            <div className="flex h-80 w-full flex-col items-center justify-center rounded-3xl border-4 border-amber-400 bg-amber-50 transition-all sm:h-96">
              <p className="mb-4 text-sm font-bold uppercase text-amber-600">Memorise This Sequence</p>
              <p className="mb-2 text-xs text-amber-500">
                Item {Math.min(showIndex + 1, sequence.length)} of {sequence.length}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {sequence.map((item, i) => {
                  const isCurrent = i === showIndex;
                  const isPast = i < showIndex;
                  return (
                    <span
                      key={i}
                      className={`text-5xl font-extrabold transition-all duration-300 ${
                        isCurrent ? "scale-125 text-amber-600 drop-shadow-lg" : isPast ? "scale-90 text-amber-600/30" : "scale-90 opacity-10"
                      }`}
                    >
                      {item}
                    </span>
                  );
                })}
              </div>
              <div className="mt-6 flex gap-1.5">
                {sequence.map((_, i) => (
                  <div key={i} className={`h-2 w-2 rounded-full transition-all ${i < showIndex ? "bg-amber-500" : i === showIndex ? "bg-amber-400 animate-pulse" : "bg-amber-200"}`} />
                ))}
              </div>
            </div>
          )}

          {/* INPUT */}
          {phase === PHASES.INPUT && (
            <div className="flex h-80 w-full flex-col items-center justify-center rounded-3xl border-4 border-[var(--primary)] bg-[var(--primary)]/5 transition-all sm:h-96">
              <p className="mb-4 text-sm font-bold uppercase text-[var(--primary)]">Your Turn — Recall the Sequence</p>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">
                Separate items with commas or spaces
              </p>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && userInput.trim() && handleSubmit()}
                autoFocus
                placeholder={"1, 2, 3..."}
                className="h-14 w-full max-w-md rounded-xl border-2 border-[var(--primary)] bg-[var(--card)] px-5 text-center text-lg font-bold text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
              <button
                onClick={handleSubmit}
                disabled={!userInput.trim()}
                className="btn-primary mt-4 rounded-xl px-8 py-3 text-sm font-bold disabled:opacity-40"
              >
                Submit Answer
              </button>
            </div>
          )}

          {/* FEEDBACK */}
          {phase === PHASES.FEEDBACK && (
            <div className={`flex h-80 w-full flex-col items-center justify-center rounded-3xl border-4 transition-all sm:h-96 ${
              feedbackCorrect ? "border-emerald-500 bg-emerald-500/10" : "border-rose-500 bg-rose-500/10"
            }`}>
              {feedbackCorrect ? (
                <CheckCircle2 className="mb-4 h-16 w-16 text-emerald-500" />
              ) : (
                <XCircle className="mb-4 h-16 w-16 text-rose-500" />
              )}
              <p className={`text-3xl font-extrabold ${feedbackCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                {feedbackCorrect ? "Correct!" : "Wrong"}
              </p>
              {!feedbackCorrect && (
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Correct answer: <span className="font-bold text-[var(--foreground)]">{feedbackAnswer}</span>
                </p>
              )}
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Next level: <span className="font-bold text-[var(--primary)]">{span} items</span>
              </p>
              <button onClick={handleContinue} className="btn-primary mt-4 rounded-xl px-8 py-3 text-sm font-bold">
                Continue
              </button>
            </div>
          )}
        </div>

        {/* Keyboard hint */}
        <p className="mb-6 mt-3 text-center text-xs text-[var(--muted-foreground)]">
          Press <kbd className="rounded border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 font-mono text-xs text-[var(--foreground)]">Space</kbd> to start • <kbd className="rounded border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 font-mono text-xs text-[var(--foreground)]">Enter</kbd> to submit
        </p>

        {/* Results + Charts */}
        {attempts.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)]">
            <SectionCard
              title="Attempt History"
              icon={History}
              action={
                <button onClick={() => exportCsv(attempts, span, bestSpan)} className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </button>
              }
            >
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {attempts.map((a, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                    a.correct ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"
                  }`}>
                    <span className="w-8 text-sm font-bold text-[var(--muted-foreground)]">#{i + 1}</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      a.correct ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                    }`}>
                      {a.correct ? "PASS" : "FAIL"}
                    </span>
                    <span className="text-sm font-semibold text-[var(--foreground)]">
                      {a.mode === 'digits-forward' ? 'Forward' : 'Reverse'} — {a.length} items
                    </span>
                    <span className="ml-auto text-xs text-[var(--muted-foreground)]">
                      {a.correct && a.timeMs ? `${a.timeMs}ms` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <div className="space-y-6">
              <SectionCard title="Span Over Time" icon={BarChart3}>
                <div className="h-56">
                  <SafeResponsiveContainer width="100%" height="100%">
                    <LineChart data={spanChart} margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                      <XAxis dataKey="attempt" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="span" stroke="#2563eb" strokeWidth={2.5} dot={(props) => {
                        const { cx, cy, payload } = props;
                        return <circle key={cx} cx={cx} cy={cy} r={4} fill={(payload.correct ? "#059669" : "#ef4444")} stroke="#fff" strokeWidth={2} />;
                      }} />
                    </LineChart>
                  </SafeResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Accuracy by Length" icon={Target}>
                <div className="h-48">
                  <SafeResponsiveContainer width="100%" height="100%">
                    <BarChart data={accuracyByLength} margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                      <XAxis dataKey="length" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} label={{ value: "Items", position: "bottom", fontSize: 10, fill: "var(--muted-foreground)" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${v}%`} />
                      <Tooltip content={<AccuracyTooltip />} />
                      <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                        {accuracyByLength.map((d, i) => (
                          <Cell key={i} fill={d.accuracy >= 80 ? "#059669" : d.accuracy >= 50 ? "#f59e0b" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </SafeResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Your Grade" icon={Trophy}>
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-[var(--foreground)]">{span}</p>
                  <p className="mt-1 text-sm font-bold text-[var(--primary)]">{getSpanGrade(span).label}</p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">{getSpanGrade(span).desc}</p>
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {/* Neuroscience Info */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <SectionCard title="Miller's Law (7±2)" icon={Brain}>
            <div className="space-y-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="mb-1 text-sm font-bold text-[var(--foreground)]">The Magic Number 7</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  In 1956, George Miller published "The Magical Number Seven, Plus or Minus Two" — showing most adults can hold 5–9 items in short-term memory. Your digit span is a direct measure of this capacity.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="mb-1 text-sm font-bold text-[var(--foreground)]">Chunking Improves Span</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Grouping items into meaningful chunks (e.g. 1-9-4-7 → "1947") effectively multiplies your capacity. Phone numbers use this principle.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="mb-1 text-sm font-bold text-[var(--foreground)]">Reverse Span = Working Memory</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Reverse digit span measures working memory — the ability to hold AND manipulate information. This correlates more strongly with IQ than forward span.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="How to Improve" icon={Target}>
            <div className="space-y-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="mb-1 text-sm font-bold text-[var(--foreground)]">Practice Daily</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Consistent practice over 2–4 weeks can increase digit span by 1–3 items. The brain adapts through neuroplasticity.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="mb-1 text-sm font-bold text-[var(--foreground)]">Use Visualisation</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Visualise numbers as images or stories. Memory athletes use the "method of loci" — associating items with locations in a familiar place.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="mb-1 text-sm font-bold text-[var(--foreground)]">Sleep & Focus</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Sleep deprivation reduces working memory by 10–30%. Test yourself when well-rested for the most accurate baseline measurement.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          All data is processed in your browser. Your memory test results are never stored or uploaded.
        </p>
      </div>
  );
}
