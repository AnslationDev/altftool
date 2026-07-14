"use client";

import { useState } from "react";
import { Smile, Sparkles, ChevronRight, ChevronLeft, RefreshCw, Copy, Download, Info, Check, Heart } from "lucide-react";
import { getDeterministicMatch } from "../../love-calculator/utils/compatibilityUtils";

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "How do they behave when you are around?",
    options: [
      { text: "They actively tease, smile, or flirt with me", value: 15 },
      { text: "They seem shy or nervous but stay close", value: 10 },
      { text: "They act regular/friendly as with anyone else", value: 5 },
      { text: "They rarely make eye contact or notice me", value: -10 }
    ]
  },
  {
    id: 2,
    question: "Who initiates your text chats or calls?",
    options: [
      { text: "They initiate most of the time", value: 20 },
      { text: "We both initiate pretty much equally", value: 15 },
      { text: "It's almost always me starting them", value: -5 },
      { text: "We don't text or talk outside of group chats", value: -10 }
    ]
  },
  {
    id: 3,
    question: "Do they remember small details you mention?",
    options: [
      { text: "Yes, they recall tiny details from weeks ago!", value: 15 },
      { text: "Sometimes they surprise me by remembering", value: 8 },
      { text: "Not really, I find myself repeating details", value: -5 },
      { text: "We haven't had deep enough conversations yet", value: 0 }
    ]
  },
  {
    id: 4,
    question: "Have they suggested hanging out one-on-one?",
    options: [
      { text: "Yes, they've suggested plans multiple times!", value: 20 },
      { text: "Once or twice, but in a casual group context", value: 10 },
      { text: "We've talked about it but never set a date", value: 5 },
      { text: "No, we only hang out if others are around", value: 0 }
    ]
  }
];

export default function ToolHome() {
  const [yourName, setYourName] = useState("");
  const [crushName, setCrushName] = useState("");
  const [stage, setStage] = useState("input"); // input, quiz, calculating, result
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const startQuiz = (e) => {
    e.preventDefault();
    if (!yourName.trim() || !crushName.trim()) return;
    setStage("quiz");
    setCurrentQ(0);
    setAnswers({});
  };

  const handleSelectOption = (value) => {
    const nextAnswers = { ...answers, [currentQ]: value };
    setAnswers(nextAnswers);

    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Calculate result
      setStage("calculating");
      setTimeout(() => {
        const baseScore = getDeterministicMatch(yourName, crushName);
        
        // Sum up quiz offsets
        const offset = Object.values(nextAnswers).reduce((a, b) => a + b, 0);
        
        // Final score clamped between 15 and 99
        const finalScore = Math.max(15, Math.min(99, baseScore + offset));

        setResult({
          score: finalScore,
          baseScore,
          quizOffset: offset
        });
        setStage("result");
      }, 1500);
    }
  };

  const getCrushVerdict = (score) => {
    if (score >= 85) {
      return {
        label: "Mutual Chemistry! 🔥",
        color: "text-pink-500",
        text: "All signs point to a clear mutual attraction! They are highly engaged, remember details, and enjoy your company. Go ahead and drop a hint or suggest hanging out!"
      };
    }
    if (score >= 70) {
      return {
        label: "Secret Admirer! 💌",
        color: "text-rose-400",
        text: "They definitely have a soft spot for you! The interest is growing, and they notice you. Keep building the connection with fun conversations and shared interests."
      };
    }
    if (score >= 50) {
      return {
        label: "Potential Spark! ✨",
        color: "text-teal-500",
        text: "There is some promise here! You have solid interactions, though the dynamic is currently friendly. Try testing the waters by initiating more individual plans."
      };
    }
    return {
      label: "Friendzone Alert! 🧊",
      color: "text-amber-500",
      text: "Currently, the connection leans heavily towards friendly or casual acquaintance. Don't lose hope—focus on building a comfortable friendship first before making a romantic move."
    };
  };

  const formatReportText = () => {
    if (!result) return "";
    const verdict = getCrushVerdict(result.score);
    return `=== ALTFTool Crush Compatibility Report ===
Date: ${new Date().toLocaleDateString()}
Names: ${yourName} & ${crushName}

Crush Match Percentage: ${result.score}%
Verdict: ${verdict.label}
------------------------------------------
Interaction Analysis:
${verdict.text}
==========================================`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatReportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleDownload = () => {
    const text = formatReportText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crush-percentage-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setYourName("");
    setCrushName("");
    setStage("input");
    setResult(null);
    setAnswers({});
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-pink-500/10 rounded-2xl border border-pink-500/20 mb-1">
            <Smile className="text-pink-500 animate-bounce" size={32} />
          </div>
          <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Crush Percentage
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Find out if they have feelings back by combining name compatibility with real interaction analysis.
          </p>
        </div>

        {/* Core Workspace Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">
          
          {/* Stage 1: Input Names */}
          {stage === "input" && (
            <form onSubmit={startQuiz} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="yourName" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Your Name
                  </label>
                  <input
                    id="yourName"
                    type="text"
                    required
                    value={yourName}
                    onChange={(e) => setYourName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full h-10 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/25 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="crushName" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Crush's Name
                  </label>
                  <input
                    id="crushName"
                    type="text"
                    required
                    value={crushName}
                    onChange={(e) => setCrushName(e.target.value)}
                    placeholder="Enter crush name"
                    className="w-full h-10 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/25 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 flex items-center justify-center gap-2 shadow"
              >
                Start Crush Quiz <ChevronRight size={16} />
              </button>
            </form>
          )}

          {/* Stage 2: Interactive Quiz */}
          {stage === "quiz" && (
            <div className="space-y-6">
              {/* Question Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                  <span>ANALYZING INTERACTIONS</span>
                  <span>QUESTION {currentQ + 1} OF {QUIZ_QUESTIONS.length}</span>
                </div>
                <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-pink-500 transition-all duration-300"
                    style={{ width: `${((currentQ + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question card */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground leading-snug">
                  {QUIZ_QUESTIONS[currentQ].question}
                </h3>
                <div className="grid gap-3">
                  {QUIZ_QUESTIONS[currentQ].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt.value)}
                      className="w-full text-left p-4 rounded-xl border border-border bg-background text-sm font-medium text-foreground hover:border-pink-500 hover:bg-pink-500/5 cursor-pointer transition active:scale-[0.99] duration-100"
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Back navigation */}
              {currentQ > 0 && (
                <button
                  onClick={() => setCurrentQ(currentQ - 1)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold hover:text-foreground cursor-pointer transition"
                >
                  <ChevronLeft size={14} /> Back to previous question
                </button>
              )}
            </div>
          )}

          {/* Stage 3: Loading calculations */}
          {stage === "calculating" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="alt-ui-spinner alt-ui-spinner--lg mb-6 border-t-pink-500" />
              <h4 className="font-semibold text-lg text-foreground animate-pulse">Running Heartbeats Classifier...</h4>
              <p className="text-sm text-muted-foreground mt-2">Correlating name hashes with behavioral statistics.</p>
            </div>
          )}

          {/* Stage 4: Results */}
          {stage === "result" && result && (
            <div className="space-y-8">
              {/* Score Display */}
              <div className="text-center space-y-4">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="var(--border)"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-border"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#EC4899"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 56}
                      strokeDashoffset={2 * Math.PI * 56 * (1 - result.score / 100)}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-3xl font-black text-foreground">
                    {result.score}%
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className={`text-xl font-bold ${getCrushVerdict(result.score).color}`}>
                    {getCrushVerdict(result.score).label}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Interaction compatibility for {yourName} & {crushName}
                  </p>
                </div>
              </div>

              {/* Analysis Text Card */}
              <div className="bg-[var(--anslation-ds-soft)] rounded-2xl p-5 border border-border">
                <p className="text-sm text-foreground leading-relaxed">
                  {getCrushVerdict(result.score).text}
                </p>
              </div>

              {/* Detailed Advices / Next Steps Card */}
              <div className="bg-background p-5 rounded-2xl border border-border space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Heart size={14} className="text-pink-500 fill-current" /> Suggested Actions
                </h4>
                <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-5 leading-relaxed">
                  {result.score >= 85 ? (
                    <>
                      <li>Ask them to hang out one-on-one in a low-pressure setting like grabbing coffee.</li>
                      <li>Initiate a conversation about a shared interest they mentioned recently.</li>
                      <li>Be direct but playful—flirt back when they tease you!</li>
                    </>
                  ) : result.score >= 70 ? (
                    <>
                      <li>Keep the chats going; focus on asking open-ended questions about their hobbies.</li>
                      <li>Find common grounds, like a class, job project, or mutual friends to talk about.</li>
                      <li>Try commenting on their stories or posts occasionally to stay on their radar.</li>
                    </>
                  ) : result.score >= 50 ? (
                    <>
                      <li>Create opportunities to talk more outside of formal or group settings.</li>
                      <li>Observe if they start engaging more or asking questions about you.</li>
                      <li>Initiate a casual lunch or study session before suggesting evening plans.</li>
                    </>
                  ) : (
                    <>
                      <li>Focus on building a solid, comfortable friendship without pushing expectations.</li>
                      <li>Keep interactions casual, lighthearted, and pressure-free.</li>
                      <li>Spend time in group hangouts to get to know their personality better.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 shadow"
                >
                  <Download size={18} /> Download
                </button>

                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-border hover:bg-[var(--anslation-ds-soft)] text-foreground font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100"
                >
                  {copied ? (
                    <>
                      <Check size={18} className="text-teal-500" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={18} /> Copy Report
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100"
                >
                  <RefreshCw size={18} /> Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Explainer FAQ Info */}
        <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <Info className="text-primary flex-shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">How is this score computed?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Crush Percentage matches your name pairings deterministically and overlays adjustments based on real-world interactions. No names or inputs are shared with external servers to guarantee complete privacy. Intended strictly for fun and entertainment!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
