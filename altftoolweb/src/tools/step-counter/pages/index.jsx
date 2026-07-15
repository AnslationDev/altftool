"use client";

import { Footprints, ShieldCheck, Sparkles } from "lucide-react";
import useStepCounter from "../utils/useStepCounter";
import TrackerCard from "../components/TrackerCard.jsx";
import StatTiles from "../components/StatTiles.jsx";
import TodaySummary from "../components/TodaySummary.jsx";
import StreakCard from "../components/StreakCard.jsx";
import QuickStats from "../components/QuickStats.jsx";
import WeeklyChart from "../components/WeeklyChart.jsx";
import { AchievementBadges, RecentAchievements } from "../components/Achievements.jsx";
import ExploreFitnessTools from "../components/ExploreFitnessTools.jsx";
import StepFaqAbout from "../components/StepFaqAbout.jsx";

function HeroBadge({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--card) px-2.5 py-1 text-[11px] font-semibold text-(--muted-foreground)">
      <Icon size={12} aria-hidden="true" className="text-(--primary-hover) dark:text-(--primary)" />
      {children}
    </span>
  );
}

export default function StepCounterApp() {
  const counter = useStepCounter();

  return (
    <div className="font-secondary space-y-5 pb-2 text-(--foreground) sm:space-y-6">
      {/* Hero */}
      <header className="flex flex-wrap items-center gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] text-white shadow-[0_8px_20px_color-mix(in_srgb,var(--primary)_30%,transparent)]"
          style={{ background: "var(--anslation-ds-cta-gradient)" }}
        >
          <Footprints size={28} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-(--foreground) sm:text-[28px]">
            Step Counter
          </h1>
          <p className="mt-0.5 text-sm text-(--muted-foreground)">
            Track your daily steps and monitor activity progress easily.
          </p>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <HeroBadge icon={Sparkles}>100% Free</HeroBadge>
          <HeroBadge icon={ShieldCheck}>Private &amp; Secure</HeroBadge>
        </div>
      </header>

      {/* Tracker + today panel */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          <TrackerCard
            steps={counter.todaySteps}
            goal={counter.goal}
            progress={counter.progress}
            isActive={counter.isActive}
            sensorMode={counter.sensorMode}
            errorMsg={counter.errorMsg}
            onStart={counter.start}
            onPause={counter.pause}
            onAddSteps={counter.addSteps}
            onSetGoal={counter.setGoal}
            onReset={counter.resetToday}
          />
          <StatTiles steps={counter.todaySteps} activeMs={counter.activeMs} />
        </div>

        <div className="min-w-0 space-y-4">
          <TodaySummary
            steps={counter.todaySteps}
            goal={counter.goal}
            activeMs={counter.activeMs}
          />
          <StreakCard streak={counter.streak} week={counter.week} />
        </div>
      </div>

      <QuickStats lifetime={counter.lifetime} />

      <div className="grid items-stretch gap-4 lg:grid-cols-[1.35fr_1fr]">
        <WeeklyChart week={counter.week} goal={counter.goal} />
        <RecentAchievements unlocked={counter.unlocked} />
      </div>

      <AchievementBadges achievements={counter.achievements} />

      <ExploreFitnessTools />

      <StepFaqAbout />
    </div>
  );
}
