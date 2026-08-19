"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Sparkles, RefreshCw, Copy, Download, Info, Check } from "lucide-react";
import { getDeterministicMatch } from "../../love-calculator/utils/compatibilityUtils";

const INTERESTS = [
  { id: "gaming", label: "Gaming together" },
  { id: "talks", label: "Deep late-night talks" },
  { id: "travel", label: "Travel & road trips" },
  { id: "memes", label: "Inside jokes & memes" },
  { id: "music", label: "Sharing music & shows" },
  { id: "food", label: "Cooking/Eating out" },
  { id: "support", label: "Mutual emotional support" },
  { id: "work", label: "Studying/Working together" }
];

// Interest categories used to derive the Friendship Pillar sub-scores from
// real quiz answers instead of a finalScore-mod-N trick.
const FUN_INTEREST_IDS = ["gaming", "memes", "music", "food"];
const SUPPORT_INTEREST_IDS = ["talks", "support"];
const LOYALTY_INTEREST_IDS = ["travel", "work"];

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

export default function ToolHome() {
  const [yourName, setYourName] = useState("");
  const [friendName, setFriendName] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [crisisReaction, setCrisisReaction] = useState("");
  const [frequency, setFrequency] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState("");
  const calculateTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (calculateTimeoutRef.current) clearTimeout(calculateTimeoutRef.current);
    };
  }, []);

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!yourName.trim() || !friendName.trim() || !crisisReaction || !frequency) {
      setFormError("Enter both names (not just spaces) and answer both questions before calculating.");
      return;
    }
    setFormError("");

    setCalculating(true);
    setResult(null);

    if (calculateTimeoutRef.current) clearTimeout(calculateTimeoutRef.current);
    calculateTimeoutRef.current = setTimeout(() => {
      const baseScore = getDeterministicMatch(yourName, friendName);

      // Quiz values
      const reactionValue = parseInt(crisisReaction, 10);
      const frequencyValue = parseInt(frequency, 10);
      const interestBonus = selectedInterests.length * 4;

      // Final score clamped from 15 to 99
      const finalScore = Math.max(15, Math.min(99, baseScore + reactionValue + frequencyValue + interestBonus));

      // Sub-scores derived from the actual quiz answers (crisis reaction,
      // interaction frequency, selected activity categories) rather than the
      // finalScore itself, so each pillar reflects a distinct real signal and
      // a low-scoring quiz produces correspondingly low pillar values.
      const funCount = selectedInterests.filter((id) => FUN_INTEREST_IDS.includes(id)).length;
      const supportCount = selectedInterests.filter((id) => SUPPORT_INTEREST_IDS.includes(id)).length;
      const loyaltyCount = selectedInterests.filter((id) => LOYALTY_INTEREST_IDS.includes(id)).length;

      const trust = clampScore(10 + ((reactionValue + 5) / 20) * 85);
      const loyalty = clampScore(15 + (frequencyValue / 15) * 65 + loyaltyCount * 10);
      const fun = clampScore(10 + funCount * 20);
      const support = clampScore(15 + supportCount * 25 + Math.max(0, reactionValue) * 2);

      setResult({
        score: finalScore,
        loyalty,
        trust,
        fun,
        support
      });
      setCalculating(false);
    }, 1500);
  };

  const getFriendshipVerdict = (score) => {
    if (score >= 90) {
      return {
        label: "Ride-or-Die Besties! 🤞",
        color: "text-cyan-500",
        text: "You are absolute soul siblings! Your bond is built on deep trust, loyalty, and a massive supply of shared jokes. You are the kind of friends who could go years without talking and pick up right where you left off. Truly a rare and precious connection!"
      };
    }
    if (score >= 70) {
      return {
        label: "Close Confidants! ✨",
        color: "text-teal-500",
        text: "A fantastic, supportive friendship! You share key values, enjoy hanging out, and can count on each other. Focus on continuing to support each other's growth and making time to build new memories."
      };
    }
    if (score >= 50) {
      return {
        label: "Good Buddies! 🤝",
        color: "text-primary",
        text: "You have a solid, pleasant friendship! You share some common interests and can have great conversations, though you might not be the first person they call in a crisis. A warm and healthy bond!"
      };
    }
    return {
      label: "Casual Acquaintances! 💬",
      color: "text-amber-500",
      text: "Your connection is currently lighthearted and casual. You might hang out in groups or chat occasionally. Try spending more one-on-one time to build a deeper, more personal connection."
    };
  };

  const formatReportText = () => {
    if (!result) return "";
    const verdict = getFriendshipVerdict(result.score);
    return `=== ALTFTool Friendship Compatibility Report ===
Date: ${new Date().toLocaleDateString()}
Friends: ${yourName} & ${friendName}

Friendship Index: ${result.score}%
Verdict: ${verdict.label}
------------------------------------------
Loyalty: ${result.loyalty}%
Trust: ${result.trust}%
Fun & Shared Humor: ${result.fun}%
Mutual Support: ${result.support}%

Bond Evaluation:
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
    a.download = `friendship-meter-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setYourName("");
    setFriendName("");
    setSelectedInterests([]);
    setCrisisReaction("");
    setFrequency("");
    setResult(null);
    setFormError("");
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div role="status" aria-live="polite" className="sr-only">
        {calculating
          ? "Analyzing bond strength."
          : result
            ? `${getFriendshipVerdict(result.score).label} Friendship index ${result.score}%.`
            : ""}
      </div>
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 mb-1">
            <Users className="text-cyan-500" size={32} />
          </div>
          <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Friendship Meter
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Evaluate the loyalty, trust, and alignment metrics of your friendship.
          </p>
        </div>

        {/* Core Workspace Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">
          {!result && !calculating ? (
            <form onSubmit={handleCalculate} className="space-y-6">
              
              {/* Names input grid */}
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
                  <label htmlFor="friendName" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Friend's Name
                  </label>
                  <input
                    id="friendName"
                    type="text"
                    required
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    placeholder="Enter friend's name"
                    className="w-full h-10 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/25 transition"
                  />
                </div>
              </div>

              {/* Shared Activities checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-cyan-500" /> Shared Activities & Chemistry (Select all that apply)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {INTERESTS.map((item) => {
                    const isChecked = selectedInterests.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleInterest(item.id)}
                        aria-pressed={isChecked}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer transition text-left active:scale-[0.98] duration-100 ${
                          isChecked
                            ? "bg-cyan-500/10 border-cyan-500 text-foreground"
                            : "bg-background border-border text-muted-foreground hover:border-cyan-500/50"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? "bg-cyan-500 border-cyan-500 text-white" : "border-border"}`}>
                          {isChecked && <Check size={10} strokeWidth={3} />}
                        </div>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Loyalty questions dropdowns */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="crisis" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    2 AM Crisis Reaction
                  </label>
                  <select
                    id="crisis"
                    required
                    value={crisisReaction}
                    onChange={(e) => setCrisisReaction(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition"
                  >
                    <option value="" disabled>Select how they'd react</option>
                    <option value="15">They'd answer instantly and support me</option>
                    <option value="10">They'd listen and offer advice</option>
                    <option value="5">They'd support, but text in the morning</option>
                    <option value="-5">They'd ignore or complain about the time</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="frequency" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Interaction Frequency
                  </label>
                  <select
                    id="frequency"
                    required
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition"
                  >
                    <option value="" disabled>Select frequency</option>
                    <option value="15">We interact/talk every single day</option>
                    <option value="10">We check in multiple times a week</option>
                    <option value="5">We connect a few times a month</option>
                    <option value="0">Every few months but it's instant pickup</option>
                  </select>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 flex items-center justify-center gap-2 shadow"
              >
                <Users size={18} /> Calculate Friendship Index
              </button>
              {formError && (
                <p role="alert" className="text-xs font-medium text-danger text-center">
                  {formError}
                </p>
              )}

            </form>
          ) : calculating ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="alt-ui-spinner alt-ui-spinner--lg mb-6 border-t-cyan-500" />
              <h4 className="font-semibold text-lg text-foreground animate-pulse">Analyzing Bond Strength...</h4>
              <p className="text-sm text-muted-foreground mt-2">Running trust and shared interests matrices checks.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Verdict Header */}
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
                      stroke="#06B6D4"
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
                  <h3 className={`text-xl font-bold ${getFriendshipVerdict(result.score).color}`}>
                    {getFriendshipVerdict(result.score).label}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Friendship Index for {yourName} & {friendName}
                  </p>
                </div>
              </div>

              {/* Analysis Text Card */}
              <div className="bg-[var(--anslation-ds-soft)] rounded-2xl p-5 border border-border">
                <p className="text-sm text-foreground leading-relaxed">
                  {getFriendshipVerdict(result.score).text}
                </p>
              </div>

              {/* Core value bars */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-cyan-500" /> Friendship Pillars
                </h4>
                <div className="bg-background rounded-2xl p-5 border border-border space-y-4 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Loyalty</span>
                      <span>{result.loyalty}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${result.loyalty}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Trust</span>
                      <span>{result.trust}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${result.trust}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Fun & Humor</span>
                      <span>{result.fun}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${result.fun}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Mutual Support</span>
                      <span>{result.support}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${result.support}%` }} />
                    </div>
                  </div>
                </div>
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

        {/* Info FAQ */}
        <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <Info className="text-primary flex-shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">How is the friendship index analyzed?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Friendship Meter combines name alignment algorithms with selected values for shared activities and loyalty answers. Calculations run entirely client-side. Results are intended solely for fun and entertainment purposes!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
