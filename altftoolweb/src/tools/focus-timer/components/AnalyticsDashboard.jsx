import FocusCalendar from "./FocusCalendar";
import { Clock, Flame, ZapOff, TrendingUp, CalendarDays } from "lucide-react";
import LevelSystem from "./LevelSystem";

function formatMinutes(min) {
  if (!min || min === 0) return "0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// get last 7 days keys
function getLast7Days() {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

function getDayLabel(dateStr) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date(dateStr).getDay()];
}

// ── Single Stat Card ──
function StatCard({ icon: Icon, iconClass, label, value, sub }) {
  return (
    <div className="bg-(--background) border border-(--border) rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-(--muted)">
          <Icon size={15} className={iconClass} />
        </div>
        <span className="text-xs font-bold font-primary text-(--muted-foreground) uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="font-black font-primary text-(--primary) text-2xl leading-none">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-(--muted-foreground) font-secondary">{sub}</p>
      )}
    </div>
  );
}

// ── Weekly Bar Chart ──
function WeeklyChart({ allStats }) {
  const days = getLast7Days();
  const maxMinutes = Math.max(
    ...days.map((d) => allStats[d]?.focusMinutes || 0),
    1
  );

  return (
    <div className="bg-(--background) border border-(--border) rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-(--primary)" />
        <p className="text-sm font-bold font-primary text-(--foreground)">
          This Week
        </p>
      </div>

      <div className="flex items-end justify-between gap-2 h-24">
        {days.map((dateStr) => {
          const stat = allStats[dateStr];
          const minutes = stat?.focusMinutes || 0;
          const heightPct = Math.round((minutes / maxMinutes) * 100);
          const isToday = dateStr === new Date().toISOString().split("T")[0];

          return (
            <div key={dateStr} className="flex-1 flex flex-col items-center gap-1">
              {/* Bar */}
              <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                <div
                  className={`w-full rounded-t-md transition-all duration-500
                    ${isToday ? "bg-(--primary)" : "bg-(--muted)"}
                    ${minutes === 0 ? "opacity-80" : ""}
                  `}
                  style={{ height: `${Math.max(heightPct, minutes > 0 ? 8 : 4)}%` }}
                  title={`${formatMinutes(minutes)}`}
                />
              </div>
              {/* Day label */}
              <span className={`text-xs font-secondary font-medium
                ${isToday ? "text-(--primary) font-bold" : "text-(--muted-foreground)"}`}>
                {getDayLabel(dateStr)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Export ──
export default function AnalyticsDashboard({ todayStats, getAllStats, totalSessions }) {
  const allStats = getAllStats();
  const totalWeekMinutes = getLast7Days().reduce(
    (acc, d) => acc + (allStats[d]?.focusMinutes || 0), 0
  );

  return (
    <div className="flex flex-col gap-4">

      {/* TODAY HEADING */}
      <div>
        <h2 className="subheading mb-1">Analytics</h2>
        <p className="text-xs text-(--muted-foreground) font-secondary">
          Today&apos;s focus overview
        </p>
      </div>

      {/* TODAY STAT CARDS — 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          icon={Clock}
          iconClass="text-(--primary)"
          label="Focus Time"
          value={formatMinutes(todayStats.focusMinutes)}
          sub="Today's deep work"
        />
        <StatCard
          icon={Flame}
          iconClass="text-orange-500"
          label="Sessions"
          value={todayStats.sessions}
          sub={todayStats.sessions === 1 ? "1 session done" : `${todayStats.sessions} sessions done`}
        />
        <StatCard
          icon={ZapOff}
          iconClass="text-red-400"
          label="Distractions"
          value={todayStats.distractions}
          sub={todayStats.distractions === 0 ? "Perfect focus!" : "Stay strong next time"}
        />
      </div>

      {/* WEEKLY CHART */}
      <WeeklyChart allStats={allStats} />

      {/* THIS WEEK TOTAL */}
      <div className="bg-(--background) border border-(--border) rounded-xl p-4 flex items-center gap-3">
        <div>
          
          <p className="text-sm font-bold font-primary text-(--foreground) inline-flex gap-2">
            <span><TrendingUp size={16} className="text-(--primary) shrink-0" /></span>Week Total
          </p>
          <p className="text-xs text-(--muted-foreground) font-secondary">
            {formatMinutes(totalWeekMinutes)} of focused work this week
          </p>
        </div>
        <p className="ml-auto font-black font-primary text-(--primary) text-xl">
          {formatMinutes(totalWeekMinutes)}
        </p>
      </div>

      {/* CALENDAR */}
      <FocusCalendar allStats={allStats} />

      <LevelSystem totalSessions={totalSessions}/>

    </div>
  );
}