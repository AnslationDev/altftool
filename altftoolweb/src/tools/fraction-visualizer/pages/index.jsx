"use client";

import { useState, useMemo } from "react";
import {
  PieChart,
  BarChart3,
  ArrowRightLeft,
  Equal,
  Plus,
  Minus,
  X,
  Divide,
  Percent,
  Hash,
  Shuffle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import Header from "../components/Header";
import PieChartViz from "../components/PieChartViz";
import FractionBarViz from "../components/FractionBarViz";
import NumberLineViz from "../components/NumberLineViz";
import AreaModelViz from "../components/AreaModelViz";
import FractionInput from "../components/FractionInput";
import ComparisonDisplay from "../components/ComparisonDisplay";
import {
  simplifyFraction,
  toMixedNumber,
  toDecimal,
  toPercentage,
  findEquivalentFractions,
  addFractions,
  subtractFractions,
  multiplyFractions,
  divideFractions,
  generateFractionQuestion,
} from "../utils/fractionMath";
import { LEARNING_MODULES, VISUAL_MODES, OPERATION_LABELS } from "../constants";

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

function ModuleSelector({ active, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {LEARNING_MODULES.map((mod) => (
        <button
          key={mod.id}
          onClick={() => onSelect(mod.id)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            active === mod.id
              ? "bg-[var(--primary)] text-white shadow-md"
              : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
          }`}
        >
          {mod.label}
        </button>
      ))}
    </div>
  );
}

function VisualizationSelector({ active, onSelect }) {
  return (
    <div className="flex gap-2">
      {VISUAL_MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onSelect(mode.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            active === mode.id
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}

function RenderVisualization({ mode, numerator, denominator, color, label }) {
  switch (mode) {
    case "pie":
      return <PieChartViz numerator={numerator} denominator={denominator} color={color} label={label} />;
    case "bar":
      return <FractionBarViz numerator={numerator} denominator={denominator} color={color} label={label} />;
    case "number-line":
      return <NumberLineViz numerator={numerator} denominator={denominator} color={color} label={label} />;
    case "area":
      return <AreaModelViz numerator={numerator} denominator={denominator} color={color} label={label} />;
    default:
      return <PieChartViz numerator={numerator} denominator={denominator} color={color} label={label} />;
  }
}

export default function FractionVisualizer() {
  const [activeModule, setActiveModule] = useState("representation");
  const [vizMode, setVizMode] = useState("pie");

  // Fraction 1
  const [n1, setN1] = useState(3);
  const [d1, setD1] = useState(4);

  // Fraction 2 (for compare/operations)
  const [n2, setN2] = useState(2);
  const [d2, setD2] = useState(3);

  // Practice mode
  const [practiceQuestion, setPracticeQuestion] = useState(null);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceResult, setPracticeResult] = useState(null);
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 });

  const simplified1 = useMemo(() => simplifyFraction(n1, d1), [n1, d1]);
  const mixed1 = useMemo(() => toMixedNumber(n1, d1), [n1, d1]);
  const decimal1 = useMemo(() => toDecimal(n1, d1), [n1, d1]);
  const percent1 = useMemo(() => toPercentage(n1, d1), [n1, d1]);
  const equivalents1 = useMemo(() => findEquivalentFractions(n1, d1, 5), [n1, d1]);

  const simplified2 = useMemo(() => simplifyFraction(n2, d2), [n2, d2]);

  const operationResult = useMemo(() => {
    switch (activeModule) {
      case "addition": return addFractions(n1, d1, n2, d2);
      case "subtraction": return subtractFractions(n1, d1, n2, d2);
      case "multiplication": return multiplyFractions(n1, d1, n2, d2);
      case "division": return divideFractions(n1, d1, n2, d2);
      default: return addFractions(n1, d1, n2, d2);
    }
  }, [activeModule, n1, d1, n2, d2]);

  const isOperationModule = ["addition", "subtraction", "multiplication", "division"].includes(activeModule);
  const isCompareModule = activeModule === "compare";

  const handleNewPractice = () => {
    const types = ["addition", "subtraction", "multiplication", "division"];
    const type = types[Math.floor(Math.random() * types.length)];
    setPracticeQuestion(generateFractionQuestion(type));
    setPracticeAnswer("");
    setPracticeResult(null);
  };

  const handleCheckPractice = () => {
    if (!practiceQuestion) return;
    const [ansN, ansD] = practiceAnswer.split("/").map(Number);
    if (isNaN(ansN) || isNaN(ansD) || ansD === 0) {
      setPracticeResult(false);
      return;
    }
    const correct = simplifyFraction(ansN, ansD);
    const isCorrect = correct.n === practiceQuestion.result.n && correct.d === practiceQuestion.result.d;
    setPracticeResult(isCorrect);
    setPracticeScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  return (
    <div className="bg-[var(--background)] px-4 py-6 text-[var(--foreground)] transition-colors sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Header />

        {/* Module Selector */}
        <SectionCard title="Learning Module" icon={BookIcon}>
          <ModuleSelector active={activeModule} onSelect={setActiveModule} />
        </SectionCard>

        {/* Visualization Controls */}
        <SectionCard
          title="Visualization"
          icon={PieChart}
          action={<VisualizationSelector active={vizMode} onSelect={setVizMode} />}
        >
          <div className="space-y-6">
            {/* Fraction Inputs */}
            <div className="flex flex-wrap items-end justify-center gap-6">
              <FractionInput
                numerator={n1}
                denominator={d1}
                onNumeratorChange={setN1}
                onDenominatorChange={setD1}
                label="Fraction 1"
              />
              {isOperationModule && (
                <>
                  <div className="pb-6 text-2xl font-extrabold text-[var(--primary)]">
                    {OPERATION_LABELS[activeModule] || "+"}
                  </div>
                  <FractionInput
                    numerator={n2}
                    denominator={d2}
                    onNumeratorChange={setN2}
                    onDenominatorChange={setD2}
                    label="Fraction 2"
                  />
                </>
              )}
            </div>

            {/* Quick Fractions */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5],
                [1, 6], [5, 6], [1, 8], [3, 8], [5, 8], [7, 8], [1, 10], [7, 10],
              ].map(([n, d]) => (
                <button
                  key={`${n}-${d}`}
                  onClick={() => { setN1(n); setD1(d); }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    n1 === n && d1 === d
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
                  }`}
                >
                  {n}/{d}
                </button>
              ))}
            </div>

            {/* Main Visualization */}
            <div className="flex justify-center">
              <RenderVisualization mode={vizMode} numerator={n1} denominator={d1} color="var(--primary)" />
            </div>

            {/* Operation Result */}
            {isOperationModule && (
              <div className="flex flex-col items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
                <p className="text-sm font-bold text-[var(--muted-foreground)]">Result</p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <PieChartViz numerator={n1} denominator={d1} size={100} color="var(--primary)" label={`${n1}/${d1}`} />
                  <span className="text-2xl font-extrabold text-[var(--primary)]">{OPERATION_LABELS[activeModule]}</span>
                  <PieChartViz numerator={n2} denominator={d2} size={100} color="#22D3EE" label={`${n2}/${d2}`} />
                  <span className="text-2xl font-extrabold text-[var(--foreground)]">=</span>
                  <PieChartViz
                    numerator={operationResult.n}
                    denominator={operationResult.d}
                    size={100}
                    color="#8B5CF6"
                    label={`${operationResult.n}/${operationResult.d}`}
                  />
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-[var(--muted-foreground)]">
                  <span>Simplified: <strong className="text-[var(--foreground)]">{operationResult.n}/{operationResult.d}</strong></span>
                  <span>Decimal: <strong className="text-[var(--foreground)]">{toDecimal(operationResult.n, operationResult.d)}</strong></span>
                  <span>Percentage: <strong className="text-[var(--foreground)]">{toPercentage(operationResult.n, operationResult.d)}%</strong></span>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Fraction Details */}
        {activeModule === "representation" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Fraction Details" icon={TrendingUp}>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                  <span className="text-sm text-[var(--muted-foreground)]">Original</span>
                  <span className="text-sm font-bold text-[var(--foreground)]">{n1}/{d1}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                  <span className="text-sm text-[var(--muted-foreground)]">Simplified</span>
                  <span className="text-sm font-bold text-[var(--primary)]">{simplified1.n}/{simplified1.d}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                  <span className="text-sm text-[var(--muted-foreground)]">Decimal</span>
                  <span className="text-sm font-bold text-[var(--foreground)]">{decimal1}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                  <span className="text-sm text-[var(--muted-foreground)]">Percentage</span>
                  <span className="text-sm font-bold text-[var(--foreground)]">{percent1}%</span>
                </div>
                {mixed1.whole !== 0 && (
                  <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                    <span className="text-sm text-[var(--muted-foreground)]">Mixed Number</span>
                    <span className="text-sm font-bold text-[var(--foreground)]">
                      {mixed1.whole} {mixed1.n}/{mixed1.d}
                    </span>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Equivalent Fractions" icon={Equal}>
              <div className="space-y-2">
                {equivalents1.map((eq, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {n1}/{d1} = {eq.n}/{eq.d}
                    </span>
                    <span className="text-xs font-bold text-[var(--primary)]">
                      ×{i + 2}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* Compare Module */}
        {isCompareModule && (
          <ComparisonDisplay fractions={[{ n: n1, d: d1 }, { n: n2, d: d2 }]} />
        )}

        {/* Practice Mode */}
        <SectionCard title="Practice Mode" icon={Shuffle} action={
          <button
            onClick={handleNewPractice}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
          >
            <Shuffle className="h-3.5 w-3.5" />
            New Question
          </button>
        }>
          {practiceQuestion ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-4 text-2xl font-extrabold">
                <span>{practiceQuestion.f1.n}/{practiceQuestion.f1.d}</span>
                <span className="text-[var(--primary)]">{practiceQuestion.operation}</span>
                <span>{practiceQuestion.f2.n}/{practiceQuestion.f2.d}</span>
                <span>=</span>
                <span className="text-[var(--muted-foreground)]">?</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <input
                  type="text"
                  placeholder="n/d"
                  value={practiceAnswer}
                  onChange={(e) => setPracticeAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCheckPractice()}
                  className="h-12 w-32 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-center text-lg font-bold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
                />
                <button
                  onClick={handleCheckPractice}
                  className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
                >
                  Check
                </button>
              </div>
              {practiceResult !== null && (
                <div className={`flex items-center justify-center gap-2 rounded-xl p-3 text-sm font-bold ${
                  practiceResult ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                }`}>
                  {practiceResult ? (
                    <><CheckCircle2 className="h-5 w-5" /> Correct!</>
                  ) : (
                    <><XCircle className="h-5 w-5" /> Wrong! The answer is {practiceQuestion.result.n}/{practiceQuestion.result.d}</>
                  )}
                </div>
              )}
              <div className="text-center text-sm text-[var(--muted-foreground)]">
                Score: {practiceScore.correct}/{practiceScore.total}
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-[var(--muted-foreground)]">
              Click "New Question" to start practicing fraction operations!
            </p>
          )}
        </SectionCard>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          All calculations run in your browser. No data is stored or uploaded.
        </p>
      </div>
    </div>
  );
}

function BookIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
