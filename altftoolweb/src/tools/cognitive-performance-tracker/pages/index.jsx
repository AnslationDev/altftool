"use client";

import { useState } from "react";
import {
  Activity,
  LayoutDashboard,
  ClipboardCheck,
  BarChart2,
  Target,
  Lightbulb,
  History,
  AlertCircle,
} from "lucide-react";
import { useTracker } from "../hooks/useTracker";
import { PHASES } from "../constants/trackerConfig";
import Dashboard from "../components/Dashboard";
import DailyCheckIn from "../components/DailyCheckIn";
import Charts from "../components/Charts";
import Goals from "../components/Goals";
import Insights from "../components/Insights";
import HistoryView from "../components/History";

const TABS = [
  { id: PHASES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { id: PHASES.CHECKIN, label: "Check-In", icon: ClipboardCheck },
  { id: PHASES.HISTORY, label: "Charts", icon: BarChart2 },
  { id: PHASES.GOALS, label: "Goals", icon: Target },
  { id: PHASES.INSIGHTS, label: "Insights", icon: Lightbulb },
  { id: PHASES.SETTINGS, label: "History", icon: History },
];

export default function ToolHome() {
  const [activeTab, setActiveTab] = useState(PHASES.DASHBOARD);
  const tracker = useTracker();

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] transition-colors py-6 px-4">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10">
          <Activity className="h-8 w-8 text-teal-600" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Cognitive Performance Tracker
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
          Track your cognitive performance over time with daily check-ins, focus scores, and interactive analytics.
        </p>
        <p className="mx-auto mt-2 max-w-xl rounded-xl bg-amber-500/10 p-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertCircle className="mr-1 inline h-3.5 w-3.5" />
          This tool is for self-improvement only and should not be used to diagnose any medical condition.
        </p>
      </header>

      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap justify-center gap-1 rounded-xl bg-[var(--section-highlight)] p-1">
          {TABS.map((tab) => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-[var(--card)] text-[var(--primary)] shadow"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <IconComp className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === PHASES.DASHBOARD && <Dashboard tracker={tracker} />}

        {activeTab === PHASES.CHECKIN && (
          <DailyCheckIn onSubmit={tracker.addCheckIn} existingCheckIn={tracker.todayCheckIn} />
        )}

        {activeTab === PHASES.HISTORY && <Charts checkIns={tracker.checkIns} />}

        {activeTab === PHASES.GOALS && (
          <Goals
            goals={tracker.goals}
            onUpdate={tracker.updateGoals}
            earnedBadges={tracker.earnedBadges}
            streak={tracker.streak}
          />
        )}

        {activeTab === PHASES.INSIGHTS && <Insights insights={tracker.insights} checkIns={tracker.checkIns} />}

        {activeTab === PHASES.SETTINGS && (
          <HistoryView checkIns={tracker.checkIns} onRemove={tracker.removeCheckIn} />
        )}
      </div>
    </div>
  );
}
