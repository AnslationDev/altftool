"use client";

import { useMemo, useState } from "react";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";

function normalizeName(name) {
  return name.trim();
}

function parseNames(text) {
  return Array.from(
    new Set(
      text
        .split(/[\n,]/)
        .map(normalizeName)
        .filter(Boolean)
    )
  );
}

function buildExclusionSet(exclusionText) {
  const set = new Set();
  exclusionText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const parts = line.split("-").map((p) => p.trim()).filter(Boolean);
      if (parts.length !== 2) return;
      set.add(`${parts[0]}=>${parts[1]}`);
      set.add(`${parts[1]}=>${parts[0]}`);
    });
  return set;
}

function isValidPair(giver, receiver, exclusionSet, previousYearSet) {
  if (giver === receiver) return false;
  if (exclusionSet.has(`${giver}=>${receiver}`)) return false;
  if (previousYearSet.has(`${giver}=>${receiver}`)) return false;
  return true;
}

function generatePairs(names, exclusionSet, previousYearSet, maxAttempts = 4000) {
  if (names.length < 2) return null;
  for (let a = 0; a < maxAttempts; a += 1) {
    const receivers = [...names];
    for (let i = receivers.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
    }
    let valid = true;
    for (let i = 0; i < names.length; i += 1) {
      if (!isValidPair(names[i], receivers[i], exclusionSet, previousYearSet)) {
        valid = false;
        break;
      }
    }
    if (valid) return names.map((giver, i) => ({ giver, receiver: receivers[i] }));
  }
  return null;
}

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function ToolHome() {
  const [namesText, setNamesText] = useState("Arun\nNeha\nRavi\nSneha\nAman\nKiran");
  const [exclusionsText, setExclusionsText] = useState("Arun - Neha\nRavi - Sneha");
  const [previousYearText, setPreviousYearText] = useState("");
  const [budgetHint, setBudgetHint] = useState("1000");
  const [attemptLimit, setAttemptLimit] = useState("5000");
  const [pairs, setPairs] = useState([]);
  const [revealFor, setRevealFor] = useState("");
  const [revealCode, setRevealCode] = useState("");
  const [revealResult, setRevealResult] = useState("");
  const [error, setError] = useState("");

  const names = useMemo(() => parseNames(namesText), [namesText]);
  const exclusionSet = useMemo(() => buildExclusionSet(exclusionsText), [exclusionsText]);
  const previousYearSet = useMemo(() => buildExclusionSet(previousYearText), [previousYearText]);

  const impossibleReason = useMemo(() => {
    if (names.length < 2) return "Add at least 2 participants.";
    const blocked = names.filter((giver) => names.filter((receiver) => isValidPair(giver, receiver, exclusionSet, previousYearSet)).length === 0);
    if (blocked.length) return `No valid recipients available for: ${blocked.join(", ")}.`;
    return "";
  }, [names, exclusionSet, previousYearSet]);

  const revealTarget = useMemo(() => {
    if (!revealFor) return "";
    return pairs.find((p) => p.giver === revealFor)?.receiver || "";
  }, [pairs, revealFor]);

  const fairness = useMemo(() => {
    if (!pairs.length) return null;
    const uniqueReceivers = new Set(pairs.map((p) => p.receiver)).size;
    const conflictCount = pairs.filter((p) => exclusionSet.has(`${p.giver}=>${p.receiver}`)).length;
    return {
      uniqueReceivers,
      conflictCount,
      quality: uniqueReceivers === pairs.length && conflictCount === 0 ? "Excellent" : "Needs Review",
    };
  }, [pairs, exclusionSet]);

  const maskedPairs = useMemo(() => pairs.map((p) => ({ ...p, code: randomCode() })), [pairs]);

  const onGenerate = () => {
    setError("");
    setRevealFor("");
    setRevealResult("");
    if (impossibleReason) {
      setPairs([]);
      setError(impossibleReason);
      return;
    }
    const generated = generatePairs(names, exclusionSet, previousYearSet, Math.max(200, Number(attemptLimit) || 5000));
    if (!generated) {
      setPairs([]);
      setError("Unable to generate valid pairings with current constraints. Relax exclusions or increase attempts.");
      return;
    }
    setPairs(generated);
  };

  const copyPairs = async () => {
    if (!pairs.length) return;
    const text = pairs.map((p) => `${p.giver} -> ${p.receiver}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError("Clipboard copy failed. You can still copy manually.");
    }
  };

  const exportJSON = () => {
    if (!pairs.length) return;
    const payload = { generatedAt: new Date().toISOString(), budgetHint, attemptLimit, participants: names, exclusions: exclusionsText, previousYear: previousYearText, pairs };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "secret-santa-pairs.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (!pairs.length) return;
    const rows = ["giver,receiver", ...pairs.map((p) => `"${p.giver}","${p.receiver}"`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "secret-santa-pairs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const revealByCode = () => {
    const found = maskedPairs.find((p) => p.code === revealCode.trim().toUpperCase());
    setRevealResult(found ? `${found.giver} gives gift to ${found.receiver}` : "No match for this code.");
  };

  return (
    <div className="px-4 py-6 sspg-shell">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="heading animate-fade-up">Secret Santa Pair Generator</h1>
          <p className="description mt-1 text-(--secondary) text-2xl animate-fade-up">
            Generate fair and private Secret Santa assignments with exclusions and advanced controls.
          </p>
        </div>

        <div className="rounded-2xl sspg-main-card overflow-hidden">
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold">Setup</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl sspg-panel p-4">
                <label className="text-sm font-semibold mb-2 block">Participants (one per line or comma-separated)</label>
                <textarea value={namesText} onChange={(e) => setNamesText(e.target.value)} className="w-full min-h-44 px-3 py-2 sspg-field" placeholder="Aarav\nPriya\nKabir" />
              </div>

              <div className="rounded-xl sspg-panel p-4">
                <label className="text-sm font-semibold mb-2 block">Exclusions (format: Name A - Name B)</label>
                <textarea value={exclusionsText} onChange={(e) => setExclusionsText(e.target.value)} className="w-full min-h-20 px-3 py-2 sspg-field mb-3" placeholder="Aarav - Priya" />
                <label className="text-sm font-semibold mb-2 block">Previous-Year Pairings (optional)</label>
                <textarea value={previousYearText} onChange={(e) => setPreviousYearText(e.target.value)} className="w-full min-h-20 px-3 py-2 sspg-field" placeholder="Aarav - Kabir" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="rounded-xl sspg-panel p-4"><p className="text-xs uppercase text-(--muted-foreground)">Participants</p><p className="text-2xl font-bold">{names.length}</p></div>
              <div className="rounded-xl sspg-panel p-4"><p className="text-xs uppercase text-(--muted-foreground)">Budget Hint</p><input value={budgetHint} onChange={(e) => setBudgetHint(e.target.value)} className="mt-1 w-full px-3 py-2 sspg-field" /></div>
              <div className="rounded-xl sspg-panel p-4"><p className="text-xs uppercase text-(--muted-foreground)">Attempt Limit</p><input value={attemptLimit} onChange={(e) => setAttemptLimit(e.target.value)} className="mt-1 w-full px-3 py-2 sspg-field" /></div>
              <div className="rounded-xl sspg-panel p-4"><p className="text-xs uppercase text-(--muted-foreground)">Rules</p><p className="text-sm mt-1">No self-match + exclusion + previous-year protection</p></div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={onGenerate} className="px-5 py-3 rounded-xl font-bold sspg-btn-primary">Generate Pairings</button>
              {pairs.length > 0 && <button onClick={copyPairs} className="px-5 py-3 rounded-xl font-semibold sspg-btn-secondary">Copy All</button>}
              {pairs.length > 0 && <button onClick={exportJSON} className="px-5 py-3 rounded-xl font-semibold sspg-btn-secondary">Export JSON</button>}
              {pairs.length > 0 && <button onClick={exportCSV} className="px-5 py-3 rounded-xl font-semibold sspg-btn-secondary">Export CSV</button>}
            </div>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

            {pairs.length > 0 && (
              <div className="space-y-4 border-t border-(--border) pt-6">
                {fairness && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="sspg-chip">Unique receivers: {fairness.uniqueReceivers}/{pairs.length}</span>
                    <span className="sspg-chip">Conflict count: {fairness.conflictCount}</span>
                    <span className="sspg-chip">Quality: {fairness.quality}</span>
                  </div>
                )}

                <div className="rounded-xl sspg-panel p-4">
                  <h3 className="font-semibold mb-2">Private Reveal</h3>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <select value={revealFor} onChange={(e) => setRevealFor(e.target.value)} className="px-3 py-2 sspg-field">
                      <option value="">Select participant</option>
                      {pairs.map((p) => <option key={p.giver} value={p.giver}>{p.giver}</option>)}
                    </select>
                    {revealFor && <p className="text-sm font-semibold">{revealFor} gives gift to: <span className="text-(--primary)">{revealTarget}</span></p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input value={revealCode} onChange={(e) => setRevealCode(e.target.value)} placeholder="Reveal code" className="px-3 py-2 sspg-field" />
                    <button onClick={revealByCode} className="px-4 py-2 rounded-lg sspg-btn-secondary font-semibold">Reveal by Code</button>
                    {revealResult && <p className="text-sm font-semibold">{revealResult}</p>}
                  </div>
                </div>

                <div className="rounded-xl sspg-panel p-4">
                  <h3 className="font-semibold mb-3">Generated Pairings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {pairs.map((p) => (
                      <div key={`${p.giver}-${p.receiver}`} className="rounded-lg border border-(--border) bg-(--card) px-3 py-2">
                        <span className="font-semibold">{p.giver}</span>{" -> "}{p.receiver}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl sspg-panel p-4">
                  <h3 className="font-semibold mb-3">Anonymous Reveal Codes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {maskedPairs.map((p) => (
                      <div key={`${p.giver}-${p.code}`} className="rounded-lg border border-(--border) bg-(--card) px-3 py-2">
                        <span className="font-semibold">{p.giver}</span>: {p.code}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <HowItWorks />
        <Features />
      </div>
    </div>
  );
}
