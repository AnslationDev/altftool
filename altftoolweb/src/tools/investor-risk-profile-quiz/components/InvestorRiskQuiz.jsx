"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  ShieldAlert, ShieldCheck, HelpCircle, ArrowRight, ArrowLeft, RotateCcw,
  TrendingUp, AlertTriangle, Coins, Briefcase, Award, CheckCircle, Trash2,
  PieChart, Calendar, DollarSign, Activity, Eye, Zap, Flame
} from "lucide-react";
import { QUESTIONS, getProfileByScore, fmt } from "../data/data";

const ANIM_STYLES = `
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.15); }
  50% { box-shadow: 0 0 25px 6px rgba(59, 130, 246, 0.25); }
}
@keyframes pulse-glow-success {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.15); }
  50% { box-shadow: 0 0 25px 6px rgba(16, 185, 129, 0.25); }
}
@keyframes pulse-glow-danger {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.15); }
  50% { box-shadow: 0 0 25px 6px rgba(239, 68, 68, 0.25); }
}
@keyframes progress-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes float-badge {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes page-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.quiz-glow { animation: pulse-glow 3.5s ease-in-out infinite; }
.quiz-glow-success { animation: pulse-glow-success 3.5s ease-in-out infinite; }
.quiz-glow-danger { animation: pulse-glow-danger 3.5s ease-in-out infinite; }
.quiz-shimmer {
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary) 35%, rgba(255, 255, 255, 0.4) 50%, var(--primary) 65%, var(--primary) 100%);
  background-size: 200% 100%;
  animation: progress-shimmer 2.2s linear infinite;
}
.quiz-float { animation: float-badge 3.5s ease-in-out infinite; }
.quiz-fadein { animation: page-fade-in 0.35s ease-out; }
`;

// Helper for educational insights
const QUESTION_EXPLANATIONS = {
  1: "Shorter timelines require stability to protect capital from sudden drawdowns before withdrawal.",
  2: "Emotional response drives investor behavior. Sticking to plan prevents high buy-high sell-low cycles.",
  3: "A clear objective anchors asset choices, separating yield chasers from long-term value builders.",
  4: "Advanced instruments carry structural risks. Knowing limits protects capital.",
  5: "Allocation under unexpected gains acts as a litmus test for speculative impulses.",
  6: "Sleepless nights indicate overallocation to high-beta volatile assets.",
  7: "Your maximum tolerance defines the buffer size needed in high-safety stable holdings.",
  8: "Active spot holdings multiply upside but demand high resilience.",
  9: "Emergency buffers separate survival pools from active risk capital.",
  10: "DeFi smart-contract risks and rug-pulls are high. Audits act as shields."
};

function useCountUp(target) {
  const [val, setVal] = useState(target);
  const ref = useRef(null);
  const prev = useRef(target);

  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (Math.abs(target - from) < 0.01) {
      setVal(target);
      return;
    }
    const t0 = performance.now();
    const run = (now) => {
      const p = Math.min(1, (now - t0) / 600);
      const e = 1 - Math.pow(1 - p, 4); // Quartic ease-out
      setVal(from + (target - from) * e);
      if (p < 1) ref.current = requestAnimationFrame(run);
    };
    ref.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(ref.current);
  }, [target]);

  return val;
}

export default function InvestorRiskQuiz() {
  const [step, setStep] = useState("landing"); // landing, quiz, result
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: score }
  const [history, setHistory] = useState([]);
  const [showExplanation, setShowExplanation] = useState(true);

  // Results interactive variables
  const [simAmount, setSimAmount] = useState(50000);
  const [stressScenario, setStressScenario] = useState("bull"); // bull, bear, flat

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("investor_risk_quiz_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Could not load history", e);
    }
  }, []);

  const totalQuestions = QUESTIONS.length;
  const currentQuestion = QUESTIONS[currentIdx];

  const answersFilledCount = Object.keys(answers).length;
  const progressPct = (answersFilledCount / totalQuestions) * 100;

  const scoreOutOf100 = useMemo(() => {
    const rawSum = Object.values(answers).reduce((sum, score) => sum + score, 0);
    return Math.round(((rawSum - 10) / 90) * 100);
  }, [answers]);

  const animatedScore = useCountUp(step === "result" ? scoreOutOf100 : 0);

  const finalProfile = useMemo(() => {
    return getProfileByScore(scoreOutOf100);
  }, [scoreOutOf100]);

  // Dimension sub-scoring logic
  const dimensionScores = useMemo(() => {
    if (answersFilledCount === 0) return { capacity: 0, psychology: 0, capability: 0, exposure: 0 };

    // Dimension 1: Capacity (Q1 Horizon, Q9 Emergency) -> max 20, min 2
    const capacityRaw = (answers[1] || 1) + (answers[9] || 1);
    // Dimension 2: Psychology (Q2 Dip Reaction, Q6 Volatility) -> max 20, min 2
    const psychologyRaw = (answers[2] || 1) + (answers[6] || 1);
    // Dimension 3: Capability (Q4 Experience, Q10 Security stance) -> max 20, min 2
    const capabilityRaw = (answers[4] || 1) + (answers[10] || 1);
    // Dimension 4: Exposure Stance (Q3 Goal, Q5 Windfall, Q7 Loss accept, Q8 Spot expose) -> max 40, min 4
    const exposureRaw = (answers[3] || 1) + (answers[5] || 1) + (answers[7] || 1) + (answers[8] || 1);

    return {
      capacity: Math.round(((capacityRaw - 2) / 18) * 100),
      psychology: Math.round(((psychologyRaw - 2) / 18) * 100),
      capability: Math.round(((capabilityRaw - 2) / 18) * 100),
      exposure: Math.round(((exposureRaw - 4) / 36) * 100)
    };
  }, [answers, answersFilledCount]);

  // Stress scenario yield projections
  const scenarioProjections = useMemo(() => {
    const allocation = finalProfile.allocation;
    let totalReturnPct = 0;

    // Projected returns per scenario
    const returnRates = {
      bull: { "Cash / Stablecoins": 6, "Staked Blue-Chips (ETH/BTC)": 90, "Low-Risk TradFi / DeFi Yields": 10, "Stablecoins & Cash": 6, "Blue-Chip Cryptos (BTC/ETH)": 110, "Major Altcoins & L1s": 220, "Stablecoins & Cash Reserves": 6, "High-Growth Altcoins / Layer 2s": 240, "Emerging Sectors (DePIN/AI)": 390, "High-Growth Altcoins / L2s": 240, "Micro-Caps / DePIN / Memes": 480, "High-Yield Speculative DeFi Pools": 180 },
      bear: { "Cash / Stablecoins": 5, "Staked Blue-Chips (ETH/BTC)": -45, "Low-Risk TradFi / DeFi Yields": 4, "Stablecoins & Cash": 5, "Blue-Chip Cryptos (BTC/ETH)": -50, "Major Altcoins & L1s": -75, "Stablecoins & Cash Reserves": 5, "High-Growth Altcoins / Layer 2s": -80, "Emerging Sectors (DePIN/AI)": -90, "High-Growth Altcoins / L2s": -80, "Micro-Caps / DePIN / Memes": -95, "High-Yield Speculative DeFi Pools": -85 },
      flat: { "Cash / Stablecoins": 6, "Staked Blue-Chips (ETH/BTC)": 8, "Low-Risk TradFi / DeFi Yields": 7, "Stablecoins & Cash": 6, "Blue-Chip Cryptos (BTC/ETH)": 10, "Major Altcoins & L1s": 5, "Stablecoins & Cash Reserves": 6, "High-Growth Altcoins / Layer 2s": 12, "Emerging Sectors (DePIN/AI)": 15, "High-Growth Altcoins / L2s": 12, "Micro-Caps / DePIN / Memes": 8, "High-Yield Speculative DeFi Pools": 14 }
    };

    allocation.forEach(alloc => {
      const rate = returnRates[stressScenario][alloc.name] || 0;
      totalReturnPct += (alloc.pct / 100) * rate;
    });

    const finalVal = simAmount * (1 + (totalReturnPct / 100));
    return {
      returnPct: totalReturnPct,
      netProfit: finalVal - simAmount,
      finalValue: finalVal
    };
  }, [finalProfile, stressScenario, simAmount]);

  const handleSelectOption = (qId, score) => {
    const nextAnswers = { ...answers, [qId]: score };
    setAnswers(nextAnswers);

    setTimeout(() => {
      if (currentIdx < totalQuestions - 1) {
        setCurrentIdx(prev => prev + 1);
      }
    }, 180);
  };

  const handleComplete = () => {
    if (answersFilledCount < totalQuestions) return;

    const finalScore = scoreOutOf100;
    const profile = getProfileByScore(finalScore);

    const newEntry = {
      date: new Date().toLocaleDateString(),
      score: finalScore,
      profileName: profile.name,
      id: Date.now()
    };

    const nextHistory = [newEntry, ...history].slice(0, 5);
    setHistory(nextHistory);
    try {
      localStorage.setItem("investor_risk_quiz_history", JSON.stringify(nextHistory));
    } catch (e) {
      console.error(e);
    }

    setStep("result");
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentIdx(0);
    setStep("quiz");
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("investor_risk_quiz_history");
    } catch (e) {}
  };

  const profileGlowClass = () => {
    if (scoreOutOf100 >= 76) return "quiz-glow-danger border-red-500/40 bg-red-500/5";
    if (scoreOutOf100 >= 51) return "quiz-glow border-[var(--primary)]/40 bg-[var(--primary)]/5";
    return "quiz-glow-success border-emerald-500/40 bg-emerald-500/5";
  };

  return (
    <div className="space-y-5 quiz-fadein">
      <style>{ANIM_STYLES}</style>

      {/* ── LANDING SCREEN ────────────────────────────────────────────── */}
      {step === "landing" && (
        <div className="space-y-5">
          <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-2 text-[var(--primary)]">
                <ShieldCheck className="h-6 w-6" />
                <span className="text-xs font-bold uppercase tracking-widest">Scientific Portfolio Assessment</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] leading-tight">
                Understand Your Capital Comfort Zone
              </h3>
              <p className="text-sm text-[var(--secondary-foreground)] leading-relaxed font-semibold">
                Before purchasing volatile tokens, liquidity mining, or launching leveraged margin accounts, mapping out your precise risk profile is critical.
                Our 10-step quiz analyzes your time horizon, financial buffer, loss comfort, and overall risk resilience to deliver a recommended portfolio asset allocation.
              </p>
              <div className="pt-2">
                <button onClick={() => { setAnswers({}); setCurrentIdx(0); setStep("quiz"); }}
                  className="rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-3 text-sm font-bold flex items-center gap-2 hover:bg-[var(--primary)]/90 cursor-default shrink-0">
                  Begin Quiz Assessment <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="quiz-float relative flex items-center justify-center h-32 w-32 rounded-full border border-[var(--primary)]/40 bg-[var(--background)] shadow-lg shrink-0">
              <ShieldAlert className="h-16 w-16 text-[var(--primary)]" />
              <span className="absolute -bottom-2 bg-[var(--primary)] text-[var(--primary-foreground)] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                10 Steps
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: "Risk Horizon", desc: "Map your timeline against market cyclicality & potential bear markets.", icon: Calendar },
              { title: "Loss Thresholds", desc: "Understand your cognitive response to heavy double-digit drawdowns.", icon: AlertTriangle },
              { title: "Asset Mix Recommendation", desc: "Unlock a custom target asset allocation (Staking, Alts, Cash).", icon: Coins }
            ].map(({ title, desc, icon: Icon }) => (
              <div key={title} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 flex gap-3 items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[var(--foreground)]">{title}</h4>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {history.length > 0 && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--secondary-foreground)]">Your Recent Quiz Takes</span>
                <button onClick={clearHistory} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-default">
                  <Trash2 className="h-3 w-3" /> Clear History
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {history.map(item => (
                  <div key={item.id} className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-[var(--foreground)]">{item.profileName}</div>
                      <div className="text-[9px] text-[var(--muted-foreground)] font-mono">{item.date}</div>
                    </div>
                    <span className="text-xs font-mono font-black text-[var(--primary)]">Score: {item.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── QUIZ SCREEN ───────────────────────────────────────────────── */}
      {step === "quiz" && (
        <div className="space-y-4 quiz-fadein">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase">
              <span className="text-[var(--primary)]">Question {currentIdx + 1} of {totalQuestions}</span>
              <span className="text-[var(--muted-foreground)]">{currentQuestion.category}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-[var(--background)] border border-[var(--border)] overflow-hidden">
              <div className="quiz-shimmer h-full rounded-full" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] text-[9px] font-black uppercase tracking-widest">
                  <HelpCircle className="h-3 w-3" /> Category: {currentQuestion.category}
                </div>
                <button onClick={() => setShowExplanation(e => !e)}
                  className="text-[10px] text-[var(--primary)] font-bold hover:underline flex items-center gap-1 cursor-default">
                  <Eye className="h-3.5 w-3.5" /> {showExplanation ? "Hide Context" : "Show Context"}
                </button>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[var(--foreground)] leading-relaxed">
                {currentQuestion.text}
              </h3>
              {showExplanation && (
                <div className="rounded-lg border border-dashed border-[var(--primary)]/20 bg-[var(--primary)]/5 p-3 text-xs text-[var(--secondary-foreground)] leading-relaxed">
                  <strong>Evaluation Rationale:</strong> {QUESTION_EXPLANATIONS[currentQuestion.id]}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {currentQuestion.options.map(opt => {
                const isSelected = answers[currentQuestion.id] === opt.score;
                return (
                  <button key={opt.key} onClick={() => handleSelectOption(currentQuestion.id, opt.score)}
                    className={`rounded-xl border p-4 text-left flex items-start gap-3 transition-colors ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--primary)]/40"
                    } cursor-default`}>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black shrink-0 ${
                      isSelected ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}>
                      {opt.key}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)] self-center leading-relaxed">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => currentIdx > 0 && setCurrentIdx(prev => prev - 1)} disabled={currentIdx === 0}
              className={`rounded-xl border px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 ${
                currentIdx === 0 ? "opacity-40 cursor-not-allowed" : "border-[var(--card-border)] bg-[var(--card)] hover:bg-[var(--muted)]/30 cursor-default"
              }`}>
              <ArrowLeft className="h-3.5 w-3.5" /> Previous Question
            </button>

            {currentIdx < totalQuestions - 1 ? (
              <button onClick={() => setCurrentIdx(prev => prev + 1)} disabled={!answers[currentQuestion.id]}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 ${
                  !answers[currentQuestion.id] ? "opacity-40 cursor-not-allowed bg-[var(--muted)]" : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 cursor-default"
                }`}>
                Next Question <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button onClick={handleComplete} disabled={answersFilledCount < totalQuestions}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 ${
                  answersFilledCount < totalQuestions ? "opacity-40 cursor-not-allowed bg-[var(--muted)]" : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 cursor-default"
                }`}>
                Complete Assessment <CheckCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── RESULT SCREEN ─────────────────────────────────────────────── */}
      {step === "result" && (
        <div className="space-y-4 quiz-fadein">

          {/* Top Banner with radial risk gauge */}
          <div className={`rounded-xl border p-6 flex flex-col md:flex-row gap-6 justify-between items-center ${profileGlowClass()}`}>
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[var(--primary)]/10 text-[var(--primary)]">
                <Award className="h-3.5 w-3.5" /> Evaluated Risk Category
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] leading-none">
                {finalProfile.name}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--secondary-foreground)] leading-relaxed font-semibold">
                {finalProfile.description}
              </p>

              {/* Target Personas Matcher bar */}
              <div className="pt-2 space-y-1.5">
                <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Score Position vs Target Personas</p>
                <div className="relative h-6 w-full rounded-lg bg-[var(--background)] border border-[var(--border)] overflow-hidden">
                  <div className="h-full bg-[var(--primary)]/20" style={{ width: `${scoreOutOf100}%` }} />

                  {/* Persona Target Points */}
                  <div className="absolute inset-0 flex justify-between px-2 items-center text-[8px] font-bold text-[var(--muted-foreground)] pointer-events-none">
                    <span className={scoreOutOf100 < 25 ? "text-emerald-400 font-extrabold" : ""}>Buffett (15)</span>
                    <span className={scoreOutOf100 >= 25 && scoreOutOf100 < 60 ? "text-[var(--primary)] font-extrabold" : ""}>Index Fund (45)</span>
                    <span className={scoreOutOf100 >= 60 && scoreOutOf100 < 80 ? "text-amber-400 font-extrabold" : ""}>Satoshi Disciple (70)</span>
                    <span className={scoreOutOf100 >= 80 ? "text-red-400 font-extrabold" : ""}>WSB Ape (95)</span>
                  </div>

                  {/* Current Score Pin */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-[var(--primary)]" style={{ left: `${scoreOutOf100}%` }} />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button onClick={handleReset} className="rounded-xl border border-[var(--primary)]/30 bg-[var(--background)] px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 hover:bg-[var(--muted)]/30 cursor-default">
                  <RotateCcw className="h-3.5 w-3.5 text-[var(--primary)]" /> Retake Assessment
                </button>
                <button onClick={() => setStep("landing")} className="rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 hover:bg-[var(--primary)]/90 cursor-default">
                  Go to Quiz Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="relative h-36 w-36 flex items-center justify-center shrink-0">
              <svg className="h-full w-full transform -rotate-90">
                <circle cx="72" cy="72" r="54" stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="transparent" />
                <circle cx="72" cy="72" r="54"
                  stroke={scoreOutOf100 >= 76 ? "#ef4444" : scoreOutOf100 >= 51 ? "var(--primary)" : "#10b981"}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 * (1 - (animatedScore / 100))}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute text-center">
                <div className="text-3xl font-black font-mono text-[var(--foreground)]">{Math.round(animatedScore)}</div>
                <div className="text-[8px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Risk Score</div>
              </div>
            </div>
          </div>

          {/* New Interactive 4-Dimension Profile Analysis */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--secondary-foreground)] flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-[var(--primary)]" /> Dimensional Score Profile
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "Financial Capacity", score: dimensionScores.capacity, desc: "Timelines & cushion buffers" },
                { name: "Risk Psychology", score: dimensionScores.psychology, desc: "Reaction to double-digit dips" },
                { name: "Capability Vector", score: dimensionScores.capability, desc: "Tech & smart contract experience" },
                { name: "Exposure Stance", score: dimensionScores.exposure, desc: "Growth & asset targets" }
              ].map(dim => (
                <div key={dim.name} className="rounded-xl border border-[var(--card-border)] bg-[var(--background)]/50 p-4 space-y-2">
                  <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider block">{dim.name}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono text-[var(--foreground)]">{dim.score}</span>
                    <span className="text-[10px] font-bold text-[var(--muted-foreground)] font-mono">/100</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--background)] overflow-hidden border border-[var(--border)]">
                    <div className="h-full bg-[var(--primary)]" style={{ width: `${dim.score}%` }} />
                  </div>
                  <span className="text-[9px] text-[var(--muted-foreground)] block leading-tight">{dim.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Allocation & Custom USD Simulator */}
          <div className="grid gap-4 lg:grid-cols-2">

            {/* Suggested Asset Allocation & Dynamic Calculator */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--secondary-foreground)] flex items-center gap-1.5">
                  <PieChart className="h-4 w-4 text-[var(--primary)]" /> Optimal Asset Allocation
                </h4>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-[var(--primary)]" />
                  <input type="number" min={100} max={10000000} step={1000} value={simAmount} onChange={e => setSimAmount(Math.max(0, +e.target.value))}
                    className="w-24 rounded border border-[var(--input-border)] bg-[var(--background)] px-2 py-0.5 text-xs font-mono font-bold text-[var(--foreground)] outline-none" />
                </div>
              </div>

              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                Based on your preferences, this is your mathematically optimized portfolio allocation. Drag the slider to simulate allocations for a custom portfolio capital size:
              </p>

              {/* Slider controls */}
              <div className="space-y-1">
                <input type="range" min={1000} max={500000} step={1000} value={simAmount} onChange={e => setSimAmount(+e.target.value)}
                  className="w-full accent-[var(--primary)] cursor-pointer" />
                <div className="flex justify-between text-[9px] font-mono text-[var(--muted-foreground)]">
                  <span>$1,000</span>
                  <span className="text-[var(--primary)] font-black">$500,000</span>
                </div>
              </div>

              {/* Segmented allocation bar */}
              <div className="h-6 w-full rounded-full overflow-hidden flex border border-[var(--border)] bg-[var(--background)]">
                {finalProfile.allocation.map(alloc => (
                  <div key={alloc.name}
                    style={{ width: `${alloc.pct}%`, backgroundColor: alloc.color }}
                    className="h-full relative group first:rounded-l-full last:rounded-r-full" />
                ))}
              </div>

              {/* Dynamic Allocation Legend with USD values */}
              <div className="flex flex-col gap-2 pt-1">
                {finalProfile.allocation.map(alloc => {
                  const usdVal = (alloc.pct / 100) * simAmount;
                  return (
                    <div key={alloc.name} className="flex items-center justify-between text-xs rounded-lg border border-[var(--card-border)] bg-[var(--background)]/40 p-2.5">
                      <div className="flex items-center gap-2 truncate mr-3">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: alloc.color }} />
                        <span className="font-semibold text-[var(--foreground)] truncate">{alloc.name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono shrink-0">
                        <span className="text-[10px] text-[var(--muted-foreground)]">({alloc.pct}%)</span>
                        <span className="font-black text-[var(--foreground)]">${fmt(usdVal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strategic Advice Card & Dynamic Stress Tester */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 flex flex-col justify-between space-y-4">

              {/* Dynamic Stress Tester */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--secondary-foreground)] flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-[var(--primary)]" /> Scenario Stress-Testing Engine
                </h4>
                <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                  Toggle different market cycles to stress-test your optimized portfolio allocation's projected 12-month value:
                </p>

                {/* Scenario tabs */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "bull", label: "Alt Season Bull", icon: Flame, color: "text-red-400" },
                    { key: "bear", label: "Crypto Winter", icon: AlertTriangle, color: "text-amber-400" },
                    { key: "flat", label: "Sideways / Accum", icon: Activity, color: "text-[var(--primary)]" }
                  ].map(sc => (
                    <button key={sc.key} onClick={() => setStressScenario(sc.key)}
                      className={`rounded-lg border p-2 flex flex-col items-center gap-1 cursor-default text-center transition-all ${
                        stressScenario === sc.key
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/20"
                      }`}>
                      <sc.icon className={`h-4 w-4 ${sc.color}`} />
                      <span className="text-[9px] font-black">{sc.label}</span>
                    </button>
                  ))}
                </div>

                {/* Projected Stress Stats */}
                <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--background)]/30 p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted-foreground)]">Projected Portfolio Return</span>
                    <span className={`font-mono font-black ${scenarioProjections.returnPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {scenarioProjections.returnPct >= 0 ? "+" : ""}{fmt(scenarioProjections.returnPct, 1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted-foreground)]">Net Gain / Loss ($)</span>
                    <span className={`font-mono font-black ${scenarioProjections.netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {scenarioProjections.netProfit >= 0 ? "+" : ""}${fmt(scenarioProjections.netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-1.5 border-t border-[var(--card-border)]">
                    <span className="font-bold text-[var(--foreground)]">Projected Capital Ending</span>
                    <span className="font-mono font-black text-[var(--primary)]">${fmt(scenarioProjections.finalValue)}</span>
                  </div>
                </div>
              </div>

              {/* Strategic Advice Points */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--secondary-foreground)] flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-[var(--primary)]" /> Custom Strategic Principles
                </h4>
                <div className="flex flex-col gap-2.5">
                  {finalProfile.advice.map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <CheckCircle className="h-3.5 w-3.5 text-[var(--primary)] shrink-0 mt-0.5" />
                      <p className="text-[11px] text-[var(--secondary-foreground)] leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alert Note */}
              <div className="rounded-xl border border-dashed border-[var(--primary)]/30 bg-[var(--primary)]/5 p-3.5 flex gap-3">
                <AlertTriangle className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                <p className="text-[9px] text-[var(--secondary-foreground)] leading-relaxed">
                  <strong>Disclaimer:</strong> This assessment tool estimates capital risk profiles for educational purposes. It does not constitute certified investment advice. Always complete personal research (DYOR) before buying assets.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
