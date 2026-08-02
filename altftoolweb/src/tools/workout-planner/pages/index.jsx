"use client";

import { useEffect, useMemo, useState } from "react";
import AnalyticsCards from "../components/AnalyticsCards";
import CoachPanel from "../components/CoachPanel";
import DailyRoundCharts from "../components/DailyRoundCharts";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import PlanForm from "../components/PlanForm";
import SessionCard from "../components/SessionCard";
import { buildTimeline, calcNutrition, completionStats, sessionKey } from "../utils/planner";

const STORAGE_KEY = "workout-planner-pro-v1";

export default function ToolHome() {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("strength");
  const [daysPerWeek, setDaysPerWeek] = useState("4");
  const [duration, setDuration] = useState("45");
  const [level, setLevel] = useState("intermediate");
  const [equipment, setEquipment] = useState("basic");
  const [focusArea, setFocusArea] = useState("Full Body");
  const [weight, setWeight] = useState("70");
  const [blockWeeks, setBlockWeeks] = useState("8");
  const [injuryFlag, setInjuryFlag] = useState(false);
  const [timeCap, setTimeCap] = useState("60");
  const [restDays, setRestDays] = useState("Sun");
  const [calendarDays, setCalendarDays] = useState("Mon,Wed,Fri,Sat");
  const [reminderTime, setReminderTime] = useState("18:00");
  const [submitted, setSubmitted] = useState(false);
  const [logs, setLogs] = useState({});

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setName(parsed.name || "");
      setGoal(parsed.goal || "strength");
      setDaysPerWeek(parsed.daysPerWeek || "4");
      setDuration(parsed.duration || "45");
      setLevel(parsed.level || "intermediate");
      setEquipment(parsed.equipment || "basic");
      setFocusArea(parsed.focusArea || "Full Body");
      setWeight(parsed.weight || "70");
      setBlockWeeks(parsed.blockWeeks || "8");
      setInjuryFlag(Boolean(parsed.injuryFlag));
      setTimeCap(parsed.timeCap || "60");
      setRestDays(parsed.restDays || "Sun");
      setCalendarDays(parsed.calendarDays || "Mon,Wed,Fri,Sat");
      setReminderTime(parsed.reminderTime || "18:00");
      setLogs(parsed.logs && typeof parsed.logs === "object" && !Array.isArray(parsed.logs) ? parsed.logs : {});
      setSubmitted(Boolean(parsed.submitted));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name,
        goal,
        daysPerWeek,
        duration,
        level,
        equipment,
        focusArea,
        weight,
        blockWeeks,
        injuryFlag,
        timeCap,
        restDays,
        calendarDays,
        reminderTime,
        logs,
        submitted,
      })
    );
  }, [name, goal, daysPerWeek, duration, level, equipment, focusArea, weight, blockWeeks, injuryFlag, timeCap, restDays, calendarDays, reminderTime, logs, submitted]);

  // Which required fields are currently empty/zero, so a "Generate Pro Plan" click that
  // can't produce a timeline shows a reason instead of the results section just never
  // appearing with no feedback at all.
  const missingFields = useMemo(() => {
    const parsedDays = Number(daysPerWeek);
    const parsedDuration = Math.min(Number(duration), Number(timeCap) || Number(duration));
    const parsedBlock = Number(blockWeeks);
    const missing = [];
    if (!parsedDays) missing.push("Days");
    if (!parsedDuration) missing.push("Duration");
    if (!parsedBlock) missing.push("Weeks");
    return missing;
  }, [daysPerWeek, duration, timeCap, blockWeeks]);

  const timeline = useMemo(() => {
    const parsedDays = Number(daysPerWeek);
    const parsedDuration = Math.min(Number(duration), Number(timeCap) || Number(duration));
    const parsedBlock = Number(blockWeeks);
    if (!parsedDays || !parsedDuration || !parsedBlock) return [];
    return buildTimeline({
      daysPerWeek: parsedDays,
      duration: parsedDuration,
      goal,
      level,
      equipment,
      focusArea,
      blockWeeks: parsedBlock,
      injuryFlag,
    });
  }, [daysPerWeek, duration, goal, level, equipment, focusArea, blockWeeks, injuryFlag, timeCap]);

  const nutrition = useMemo(() => calcNutrition(goal, weight), [goal, weight]);
  const stats = useMemo(() => completionStats(logs, timeline), [logs, timeline]);

  // Whenever the timeline regenerates from an input change, drop any logged
  // completion/RPE entries that no longer correspond to a session in the new
  // timeline so stale data can never misattach to a different session or day.
  useEffect(() => {
    const validKeys = new Set(timeline.map((session) => sessionKey(session)));
    setLogs((prev) => {
      let changed = false;
      const next = {};
      for (const key of Object.keys(prev)) {
        if (validKeys.has(key)) {
          next[key] = prev[key];
        } else {
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [timeline]);

  const nextSteps = useMemo(() => {
    if (!timeline.length) return [];
    return [
      `Schedule sessions on ${calendarDays} with reminder at ${reminderTime}.`,
      `Respect time cap (${timeCap} min) and rest day plan (${restDays}).`,
      "Log completion and RPE after each workout for progression decisions.",
      "At end of week, adjust load by 2.5-5% only when adherence is high and fatigue is controlled.",
    ];
  }, [timeline, calendarDays, reminderTime, timeCap, restDays]);

  const toggleComplete = (key) => {
    setLogs((prev) => {
      const current = prev[key] || { completed: false, rpe: 7 };
      return { ...prev, [key]: { ...current, completed: !current.completed } };
    });
  };

  const updateRpe = (key, value) => {
    setLogs((prev) => {
      const current = prev[key] || { completed: false, rpe: 7 };
      const parsed = Number(value);
      // The RPE input's min=1/max=10 attributes are never enforced (no <form> to
      // trigger HTML5 validation), so clamp here -- the one place RPE is written --
      // to keep the stored value inside the documented 1-10 scale that the Avg RPE
      // analytics tile and the coach's fatigue-trend threshold both assume.
      const rpe = Number.isFinite(parsed) ? Math.min(10, Math.max(1, parsed)) : current.rpe;
      return { ...prev, [key]: { ...current, rpe } };
    });
  };

  const downloadJSON = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      name: name || "Workout Planner",
      settings: { goal, level, equipment, daysPerWeek, duration, blockWeeks, timeCap, restDays, calendarDays, reminderTime },
      nutrition,
      timeline,
      stats,
      nextSteps,
      logs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workout-plan.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 py-6 min-h-screen bg-(--background)">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="heading animate-fade-up">Workout Planner Pro</h1>
          <p className="description mt-1 text-(--secondary) text-2xl animate-fade-up">
            Smart periodized plans with progression, constraints, analytics, and coach feedback.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-(--border) bg-(--card) shadow-sm">
          <div className="p-6 space-y-6">
            <PlanForm
              values={{ name, goal, level, daysPerWeek, duration, blockWeeks, weight, timeCap, equipment, focusArea, restDays, reminderTime, calendarDays, injuryFlag }}
              setters={{ setName, setGoal, setLevel, setDaysPerWeek, setDuration, setBlockWeeks, setWeight, setTimeCap, setEquipment, setFocusArea, setRestDays, setReminderTime, setCalendarDays, setInjuryFlag }}
              onGenerate={() => setSubmitted(true)}
              onExport={downloadJSON}
              onPrint={() => window.print()}
            />

            {submitted && timeline.length === 0 && (
              <p role="alert" className="text-sm font-medium text-(--danger)">
                {missingFields.length > 0
                  ? `Enter a value for ${missingFields.join(", ")} before generating a plan.`
                  : "Enter valid Days, Duration and Weeks values before generating a plan."}
              </p>
            )}

            {submitted && timeline.length > 0 && (
              <div className="mt-4 pt-6 border-t border-(--border) space-y-6 animate-fade-up">
                <AnalyticsCards stats={stats} nutrition={nutrition} totalSessions={timeline.length} />

                <div>
                  <h3 className="text-xl font-bold mb-3">Periodized Timeline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {timeline.map((session) => (
                      <SessionCard
                        key={session.day}
                        session={session}
                        sessionKey={sessionKey(session)}
                        log={logs[sessionKey(session)]}
                        onToggleComplete={toggleComplete}
                        onUpdateRpe={updateRpe}
                      />
                    ))}
                  </div>
                </div>

                <DailyRoundCharts timeline={timeline} />

                <CoachPanel coach={stats.coach} nextSteps={nextSteps} />
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
