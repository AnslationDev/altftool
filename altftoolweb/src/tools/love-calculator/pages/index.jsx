"use client";

import { useState } from "react";
import { Heart, RefreshCw, Copy, Download, Share2, Sparkles, Check, Info } from "lucide-react";
import { getDeterministicMatch } from "../utils/compatibilityUtils";

export default function ToolHome() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!name1.trim() || !name2.trim()) return;

    setCalculating(true);
    setResult(null);

    // Simulate analysis delay
    setTimeout(() => {
      const score = getDeterministicMatch(name1, name2);
      
      // Calculate sub-scores deterministically using the score as a seed
      const chemistry = Math.round(((score * 7) % 31) + 69);
      const trust = Math.round(((score * 13) % 31) + 69);
      const communication = Math.round(((score * 17) % 31) + 69);
      const fun = Math.round(((score * 23) % 31) + 69);

      // Count L-O-V-E-S characters
      const combined = (name1 + name2).toLowerCase();
      const lovesCount = {
        l: (combined.match(/l/g) || []).length,
        o: (combined.match(/o/g) || []).length,
        v: (combined.match(/v/g) || []).length,
        e: (combined.match(/e/g) || []).length,
        s: (combined.match(/s/g) || []).length,
      };

      setResult({
        score,
        chemistry,
        trust,
        communication,
        fun,
        lovesCount,
      });
      setCalculating(false);
    }, 1500);
  };

  const getMatchVerdict = (score) => {
    if (score >= 85) return { label: "Perfect Match! 💖", color: "text-rose-500", text: "Outstanding synergy! Your communication and values align perfectly. You share a deep, natural connection that has high potential to stand the test of time." };
    if (score >= 70) return { label: "Strong Connection! 💕", color: "text-pink-500", text: "A highly promising connection! There is great chemistry and solid trust here. Focus on active listening and shared experiences to deepen your bond even further." };
    if (score >= 50) return { label: "Good Potential! 🌱", color: "text-teal-500", text: "You have a solid foundation with room to grow. You might find that you have different approaches to certain topics, but with mutual respect, you can build something beautiful." };
    return { label: "Work in Progress! ⚡", color: "text-amber-500", text: "This match suggests you may face communication gaps or different expectations. Focus on understanding each other's love languages and giving space to grow together." };
  };

  const formatReportText = () => {
    if (!result) return "";
    const verdict = getMatchVerdict(result.score);
    return `=== ALTFTool Love Compatibility Report ===
Date: ${new Date().toLocaleDateString()}
Partners: ${name1} & ${name2}

Overall Match: ${result.score}% - ${verdict.label}
------------------------------------------
Chemistry: ${result.chemistry}%
Trust: ${result.trust}%
Communication: ${result.communication}%
Fun & Playfulness: ${result.fun}%

Compatibility Analysis:
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
    a.download = `love-compatibility-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setName1("");
    setName2("");
    setResult(null);
  };

  const lovesCharTotal = result ? Object.values(result.lovesCount).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 mb-1">
            <Heart className="text-rose-500 fill-rose-500 animate-pulse" size={32} />
          </div>
          <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Love Calculator
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Test compatibility between two names using deterministic compatibility scoring.
          </p>
        </div>

        {/* Workspace Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">
          {!result && !calculating ? (
            <form onSubmit={handleCalculate} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name1" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    First Name
                  </label>
                  <input
                    id="name1"
                    type="text"
                    required
                    value={name1}
                    onChange={(e) => setName1(e.target.value)}
                    placeholder="Enter name"
                    className="w-full h-10 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/25 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="name2" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Second Name
                  </label>
                  <input
                    id="name2"
                    type="text"
                    required
                    value={name2}
                    onChange={(e) => setName2(e.target.value)}
                    placeholder="Enter partner name"
                    className="w-full h-10 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/25 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 flex items-center justify-center gap-2 shadow"
              >
                <Heart size={18} className="fill-current" /> Calculate Compatibility
              </button>
            </form>
          ) : calculating ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="alt-ui-spinner alt-ui-spinner--lg mb-6 border-t-rose-500" />
              <h4 className="font-semibold text-lg text-foreground animate-pulse">Calculating Synergy...</h4>
              <p className="text-sm text-muted-foreground mt-2">Checking compatibility matching matrix.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Verdict Header */}
              <div className="text-center space-y-4">
                <div className="relative inline-flex items-center justify-center">
                  {/* Progress Circle Container */}
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
                      stroke="#F43F5E"
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
                  <h3 className={`text-xl font-bold ${getMatchVerdict(result.score).color}`}>
                    {getMatchVerdict(result.score).label}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Compatibility Index for {name1} & {name2}
                  </p>
                </div>
              </div>

              {/* Analysis Text Card */}
              <div className="bg-[var(--anslation-ds-soft)] rounded-2xl p-5 border border-border">
                <p className="text-sm text-foreground leading-relaxed">
                  {getMatchVerdict(result.score).text}
                </p>
              </div>

              {/* Sub Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background p-4 rounded-xl border border-border space-y-2">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>Chemistry</span>
                    <span>{result.chemistry}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${result.chemistry}%` }} />
                  </div>
                </div>
                <div className="bg-background p-4 rounded-xl border border-border space-y-2">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>Trust</span>
                    <span>{result.trust}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 rounded-full" style={{ width: `${result.trust}%` }} />
                  </div>
                </div>
                <div className="bg-background p-4 rounded-xl border border-border space-y-2">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>Communication</span>
                    <span>{result.communication}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${result.communication}%` }} />
                  </div>
                </div>
                <div className="bg-background p-4 rounded-xl border border-border space-y-2">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>Fun & Playfulness</span>
                    <span>{result.fun}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${result.fun}%` }} />
                  </div>
                </div>
              </div>

              {/* L-O-V-E-S Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-rose-500" /> Letter Compatibility Matrix (L-O-V-E-S)
                </h4>
                <div className="bg-background rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-center text-xs">
                    <thead>
                      <tr className="bg-[var(--anslation-ds-soft)] border-b border-border text-foreground font-bold">
                        <th className="py-2.5 px-3">L</th>
                        <th className="py-2.5 px-3">O</th>
                        <th className="py-2.5 px-3">V</th>
                        <th className="py-2.5 px-3">E</th>
                        <th className="py-2.5 px-3">S</th>
                        <th className="py-2.5 px-3 bg-rose-500/10 text-rose-600">Total Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-muted-foreground font-medium">
                        <td className="py-3 px-3 border-r border-border/50">{result.lovesCount.l}</td>
                        <td className="py-3 px-3 border-r border-border/50">{result.lovesCount.o}</td>
                        <td className="py-3 px-3 border-r border-border/50">{result.lovesCount.v}</td>
                        <td className="py-3 px-3 border-r border-border/50">{result.lovesCount.e}</td>
                        <td className="py-3 px-3 border-r border-border/50">{result.lovesCount.s}</td>
                        <td className="py-3 px-3 font-bold bg-rose-500/5 text-rose-500">{lovesCharTotal}</td>
                      </tr>
                    </tbody>
                  </table>
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

        {/* Disclaimer FAQ info */}
        <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <Info className="text-primary flex-shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">How is this calculated?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This Love Calculator uses a deterministic character sequence hashing algorithm combined with a character count analysis. Calculations run fully inside your browser tab to guarantee 100% privacy. Results are intended purely for fun and entertainment purposes!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
