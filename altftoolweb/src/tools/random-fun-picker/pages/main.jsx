"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@altftool/ui";
import { UtensilsCrossed, HelpCircle, Users, BarChart3, Heart, Clock } from "lucide-react";
import LunchPicker from "../components/LunchPicker";
import TruthDareEngine from "../components/TruthDareEngine";
import NameSelector from "../components/NameSelector";
import { useLunch } from "../hooks/useLunch";
import { useTruthDare } from "../hooks/useTruthDare";
import { useNameSelector } from "../hooks/useNameSelector";

const TABS = [
  { key: "lunch", label: "Lunch Chooser", icon: UtensilsCrossed, color: "text-orange-500" },
  { key: "truthdare", label: "Truth or Dare", icon: HelpCircle, color: "text-violet-500" },
  { key: "names", label: "Name Selector", icon: Users, color: "text-blue-500" },
];

export default function RandomFunPickerPage() {
  const [activeTab, setActiveTab] = useState("lunch");
  const lunch = useLunch();
  const truthDare = useTruthDare();
  const nameSelector = useNameSelector();

  const totalStats = {
    lunchPicks: lunch.recent.length,
    truthDarePlays: truthDare.skipped + (truthDare.current ? 1 : 0),
    namesPicked: nameSelector.winners.length,
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === " " && !e.target.matches("input,textarea,select")) {
        e.preventDefault();
        if (activeTab === "lunch") lunch.pick();
        else if (activeTab === "truthdare") truthDare.pick();
        else if (activeTab === "names") nameSelector.pickOne();
      }
      if (e.key >= "1" && e.key <= "3") {
        const idx = parseInt(e.key) - 1;
        setActiveTab(TABS[idx]?.key || activeTab);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTab, lunch, truthDare, nameSelector]);

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-(--foreground)">Random Fun Picker</h1>
            <p className="text-sm text-(--muted-foreground) mt-1">Pick a lunch spot, play Truth or Dare, or randomly select names.</p>
          </div>
          <div className="flex gap-2">
            <StatBadge icon={UtensilsCrossed} value={totalStats.lunchPicks} label="Lunches" />
            <StatBadge icon={HelpCircle} value={totalStats.truthDarePlays} label="Plays" />
            <StatBadge icon={Users} value={totalStats.namesPicked} label="Names" />
          </div>
        </div>

        <div className="flex gap-1.5 p-1 rounded-xl bg-(--muted) border border-(--border)">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-(--card) text-(--foreground) shadow-sm border border-(--border)"
                  : "text-(--muted-foreground) hover:text-(--foreground)"
              }`}
            >
              <tab.icon size="16" className={tab.color} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "lunch" && (
            <LunchPicker
              filters={lunch.filters}
              setFilters={lunch.setFilters}
              filtered={lunch.filtered}
              selected={lunch.selected}
              animating={lunch.animating}
              recent={lunch.recent}
              favorites={lunch.favorites}
              onPick={lunch.pick}
              onToggleFavorite={lunch.toggleFavorite}
            />
          )}
          {activeTab === "truthdare" && (
            <TruthDareEngine
              mode={truthDare.mode}
              setMode={truthDare.setMode}
              difficulty={truthDare.difficulty}
              setDifficulty={truthDare.setDifficulty}
              pack={truthDare.pack}
              setPack={truthDare.setPack}
              current={truthDare.current}
              showCountdown={truthDare.showCountdown}
              favorites={truthDare.favorites}
              customQuestions={truthDare.customQuestions}
              isAnimating={truthDare.isAnimating}
              skipped={truthDare.skipped}
              onPick={truthDare.pick}
              onSkip={truthDare.skip}
              onToggleFavorite={truthDare.toggleFavorite}
              onAddCustom={truthDare.addCustom}
              onRemoveCustom={truthDare.removeCustom}
            />
          )}
          {activeTab === "names" && (
            <NameSelector
              names={nameSelector.names}
              winners={nameSelector.winners}
              selected={nameSelector.selected}
              history={nameSelector.history}
              isAnimating={nameSelector.isAnimating}
              search={nameSelector.search}
              multipleCount={nameSelector.multipleCount}
              filteredNames={nameSelector.filteredNames}
              duplicates={nameSelector.duplicates}
              onAdd={nameSelector.addName}
              onAddMultiple={nameSelector.addNames}
              onRemove={nameSelector.removeName}
              onClear={nameSelector.clearNames}
              onPickOne={nameSelector.pickOne}
              onPickMultiple={nameSelector.pickMultiple}
              onReset={nameSelector.resetSelection}
              onExclude={nameSelector.excludeWinner}
              onClearHistory={nameSelector.clearHistory}
              onSearch={nameSelector.setSearch}
              onMultipleCount={nameSelector.setMultipleCount}
            />
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h2 className="text-lg font-bold text-(--foreground) mb-2">How to Use</h2>
            <ul className="space-y-1 text-sm text-(--muted-foreground) list-disc list-inside">
              <li><strong>Lunch Chooser:</strong> Filter by cuisine, budget, and type, then let fate decide.</li>
              <li><strong>Truth or Dare:</strong> Pick a mode and difficulty, then challenge your friends.</li>
              <li><strong>Name Selector:</strong> Add names, search, filter, and pick winners.</li>
            </ul>
            <div className="mt-3 flex gap-3 text-xs text-(--muted-foreground)">
              <span><kbd className="px-1.5 py-0.5 rounded bg-(--muted) font-mono">Space</kbd> Pick</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-(--muted) font-mono">1-3</kbd> Switch tab</span>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold text-(--foreground) mb-4">FAQ</h2>
            <div className="space-y-3">
              {[
                { q: "Is my data saved?", a: "All data is stored locally in your browser. Nothing is sent to servers." },
                { q: "Can I add custom questions?", a: "Yes! In Truth or Dare, click the + button to add custom questions." },
                { q: "How do I import names?", a: "Upload a CSV file or paste a list of names separated by new lines." },
              ].map((faq) => (
                <div key={faq.q}>
                  <h3 className="text-sm font-semibold text-(--foreground)">{faq.q}</h3>
                  <p className="text-sm text-(--muted-foreground)">{faq.a}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-(--muted) border border-(--border)">
      <Icon size="14" className="text-(--muted-foreground)" />
      <span className="text-xs font-semibold text-(--foreground)">{value}</span>
      <span className="text-[10px] text-(--muted-foreground) hidden sm:inline">{label}</span>
    </div>
  );
}
