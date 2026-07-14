"use client";

import { useState } from "react";
import { Users, Sparkles, RefreshCw, Copy, Download, Info, Check, Award } from "lucide-react";
import { getDeterministicMatch } from "../../love-calculator/utils/compatibilityUtils";

export default function ToolHome() {
  const [yourName, setYourName] = useState("");
  const [friendName, setFriendName] = useState("");
  
  // Sliders states (1-10)
  const [trust, setTrust] = useState(5);
  const [humor, setHumor] = useState(5);
  const [loyalty, setLoyalty] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [historyVal, setHistoryVal] = useState(5);

  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!yourName.trim() || !friendName.trim()) return;

    setCalculating(true);
    setResult(null);

    setTimeout(() => {
      const baseScore = getDeterministicMatch(yourName, friendName);
      
      // Calculate slider average on 0-100 scale
      const sliderAvg = ((trust + humor + loyalty + communication + historyVal) / 50) * 100;
      
      // Combine base name hash score (35% weight) with slider score (65% weight)
      const finalScore = Math.max(15, Math.min(100, Math.round(baseScore * 0.35 + sliderAvg * 0.65)));

      setResult({
        score: finalScore,
        baseScore,
        trustPercent: trust * 10,
        humorPercent: humor * 10,
        loyaltyPercent: loyalty * 10,
        communicationPercent: communication * 10,
        historyPercent: historyVal * 10
      });
      setCalculating(false);
    }, 1500);
  };

  const getBadgeDetails = (score) => {
    if (score >= 95) {
      return {
        badge: "Ride-or-Die Gold Badge 🏆",
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        text: "Outstanding! Your bond is legendary. You share absolute trust, identical humor, and unmatched loyalty. You've earned the Gold Badge—this friendship is built for a lifetime!"
      };
    }
    if (score >= 80) {
      return {
        badge: "Platinum Confidant Badge 🎖️",
        color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
        text: "Incredible bond! You count on each other for everything. Highly supportive, loyal, and communicative. Platinum buddies are rare; keep this connection strong!"
      };
    }
    if (score >= 60) {
      return {
        badge: "Silver Companion Badge 🥈",
        color: "text-slate-400 bg-slate-400/10 border-slate-400/20",
        text: "Solid connection! You are good pals who have great laughs and can share deep talks. With continued support and more shared memories, this bond has high potential."
      };
    }
    return {
      badge: "Bronze Buddy Badge 🥉",
      color: "text-amber-700 bg-amber-700/10 border-amber-700/20",
      text: "A friendly and pleasant connection. You are casual friends who enjoy hanging out occasionally. Focus on spending more quality one-on-one time to deepen the relationship."
    };
  };

  const formatReportText = () => {
    if (!result) return "";
    const badge = getBadgeDetails(result.score);
    return `=== ALTFTool Friendship Score Report ===
Date: ${new Date().toLocaleDateString()}
Names: ${yourName} & ${friendName}

Friendship Score: ${result.score}/100
Achievement: ${badge.badge}
------------------------------------------
Trust score: ${result.trustPercent}%
Humor & Jokes: ${result.humorPercent}%
Loyalty index: ${result.loyaltyPercent}%
Communication: ${result.communicationPercent}%
Shared History: ${result.historyPercent}%

Evaluation:
${badge.text}
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
    a.download = `friendship-score-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setYourName("");
    setFriendName("");
    setTrust(5);
    setHumor(5);
    setLoyalty(5);
    setCommunication(5);
    setHistoryVal(5);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 mb-1">
            <Users className="text-cyan-500" size={32} />
          </div>
          <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Friendship Score
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Evaluate your connection parameters to calculate a professional Friendship Score and unlock achievement badges.
          </p>
        </div>

        {/* Workspace Card */}
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

              {/* Sliders Block */}
              <div className="space-y-5 pt-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                  <Sparkles size={14} className="text-cyan-500" /> Rate Friendship Characteristics (1 to 10)
                </h4>
                
                {/* Slider 1: Trust */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-foreground">
                    <span>Trust & Secret Keeping</span>
                    <span className="font-bold text-cyan-500">{trust}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={trust}
                    onChange={(e) => setTrust(parseInt(e.target.value))}
                    className="w-full accent-primary bg-[var(--anslation-ds-soft)] h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Slider 2: Humor */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-foreground">
                    <span>Humor, Laughter & Inside Jokes</span>
                    <span className="font-bold text-cyan-500">{humor}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={humor}
                    onChange={(e) => setHumor(parseInt(e.target.value))}
                    className="w-full accent-primary bg-[var(--anslation-ds-soft)] h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Slider 3: Loyalty */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-foreground">
                    <span>Loyalty & Standing Up For You</span>
                    <span className="font-bold text-cyan-500">{loyalty}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={loyalty}
                    onChange={(e) => setLoyalty(parseInt(e.target.value))}
                    className="w-full accent-primary bg-[var(--anslation-ds-soft)] h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Slider 4: Communication */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-foreground">
                    <span>Communication & Deep Conversations</span>
                    <span className="font-bold text-cyan-500">{communication}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={communication}
                    onChange={(e) => setCommunication(parseInt(e.target.value))}
                    className="w-full accent-primary bg-[var(--anslation-ds-soft)] h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Slider 5: History */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-foreground">
                    <span>Shared History & Quality Time</span>
                    <span className="font-bold text-cyan-500">{historyVal}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={historyVal}
                    onChange={(e) => setHistoryVal(parseInt(e.target.value))}
                    className="w-full accent-primary bg-[var(--anslation-ds-soft)] h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 flex items-center justify-center gap-2 shadow"
              >
                <Users size={18} /> Compute Friendship Score
              </button>

            </form>
          ) : calculating ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="alt-ui-spinner alt-ui-spinner--lg mb-6 border-t-cyan-500" />
              <h4 className="font-semibold text-lg text-foreground animate-pulse">Running Friendship Calculator...</h4>
              <p className="text-sm text-muted-foreground mt-2">Integrating individual slider metrics with name rolling compatibility values.</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Score Circular progress */}
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
                    {result.score}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Friendship score</span>
                  <p className="text-sm text-muted-foreground font-medium">
                    Bond evaluation for {yourName} & {friendName}
                  </p>
                </div>
              </div>

              {/* Achievement Badge */}
              <div className={`border rounded-2xl p-5 flex items-center gap-4 ${getBadgeDetails(result.score).color}`}>
                <Award className="flex-shrink-0" size={36} />
                <div className="space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-wide">Awarded Achievement</span>
                  <h4 className="text-base font-bold text-foreground capitalize">
                    {getBadgeDetails(result.score).badge}
                  </h4>
                  <p className="text-xs leading-relaxed opacity-90">
                    {getBadgeDetails(result.score).text}
                  </p>
                </div>
              </div>

              {/* Pillars breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-cyan-500" /> Friendship Parameters
                </h4>
                <div className="bg-card rounded-2xl p-5 border border-border space-y-4 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Trust Rating</span>
                      <span>{result.trustPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${result.trustPercent}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Humor / Playfulness</span>
                      <span>{result.humorPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${result.humorPercent}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Loyalty Matrix</span>
                      <span>{result.loyaltyPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${result.loyaltyPercent}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Communication Resonance</span>
                      <span>{result.communicationPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${result.communicationPercent}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Shared History & Bond Time</span>
                      <span>{result.historyPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${result.historyPercent}%` }} />
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

        {/* Explain info */}
        <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <Info className="text-primary flex-shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">How is this analyzed?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Friendship Score calculates name pairing hashes (35% weight) and averages it with 5 core sliders rated by the user (65% weight). The score is computed client-side. Intended solely for entertainment!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
