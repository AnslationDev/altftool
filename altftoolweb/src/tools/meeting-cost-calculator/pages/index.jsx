"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  Clipboard,
  Download,
  RefreshCw,
  Timer,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SAMPLE_ROLES = [
  { id: "engineering", name: "Engineering", attendees: 4, hourlyRate: 2200 },
  { id: "design", name: "Design", attendees: 2, hourlyRate: 1800 },
  { id: "product", name: "Product", attendees: 2, hourlyRate: 2500 },
  { id: "leadership", name: "Leadership", attendees: 1, hourlyRate: 4200 },
];

const SAMPLE = {
  durationMinutes: 60,
  prepMinutes: 10,
  followupMinutes: 10,
  meetingsPerWeek: 3,
  workingWeeks: 48,
  productivityLoss: 15,
  roles: SAMPLE_ROLES,
};

const COLORS = ["#2563eb", "#059669", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

function formatMoney(value, compact = false) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(Number.isFinite(value) ? value : 0);
}

function formatNumber(value, digits = 0) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatHours(minutes) {
  return `${formatNumber(minutes / 60, 1)}h`;
}

function clampNumber(value, min = 0, max = 100000000) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(min, number), max);
}

function calculateMeeting(values) {
  const durationMinutes = clampNumber(values.durationMinutes, 1, 1440);
  const prepMinutes = clampNumber(values.prepMinutes, 0, 1440);
  const followupMinutes = clampNumber(values.followupMinutes, 0, 1440);
  const meetingsPerWeek = clampNumber(values.meetingsPerWeek, 0, 1000);
  const workingWeeks = clampNumber(values.workingWeeks, 1, 60);
  const productivityLoss = clampNumber(values.productivityLoss, 0, 100) / 100;
  const totalMinutesPerPerson = durationMinutes + prepMinutes + followupMinutes;
  const totalHoursPerPerson = totalMinutesPerPerson / 60;

  const roles = values.roles.map((role) => {
    const attendees = clampNumber(role.attendees, 0, 100000);
    const hourlyRate = clampNumber(role.hourlyRate, 0, 10000000);
    const baseCost = attendees * hourlyRate * totalHoursPerPerson;
    const lossCost = baseCost * productivityLoss;
    return {
      ...role,
      attendees,
      hourlyRate,
      baseCost,
      lossCost,
      totalCost: baseCost + lossCost,
      hours: attendees * totalHoursPerPerson,
    };
  });

  const attendees = roles.reduce((sum, role) => sum + role.attendees, 0);
  const blendedRate = attendees
    ? roles.reduce((sum, role) => sum + role.attendees * role.hourlyRate, 0) / attendees
    : 0;
  const meetingCost = roles.reduce((sum, role) => sum + role.totalCost, 0);
  const baseCost = roles.reduce((sum, role) => sum + role.baseCost, 0);
  const lossCost = roles.reduce((sum, role) => sum + role.lossCost, 0);
  const weeklyCost = meetingCost * meetingsPerWeek;
  const annualCost = weeklyCost * workingWeeks;
  const annualHours = roles.reduce((sum, role) => sum + role.hours, 0) * meetingsPerWeek * workingWeeks;
  const dailyCost = weeklyCost / 5;
  const suggestedShortMeeting = roles.reduce((sum, role) => {
    const shorterHours = Math.max(0.1, (Math.max(15, durationMinutes - 15) + prepMinutes + followupMinutes) / 60);
    return sum + role.attendees * role.hourlyRate * shorterHours * (1 + productivityLoss);
  }, 0);
  const savingPerMeeting = Math.max(0, meetingCost - suggestedShortMeeting);

  return {
    roles,
    attendees,
    blendedRate,
    totalMinutesPerPerson,
    totalHoursPerPerson,
    meetingCost,
    baseCost,
    lossCost,
    weeklyCost,
    annualCost,
    annualHours,
    dailyCost,
    savingPerMeeting,
  };
}

function buildSummary(values, metrics) {
  return [
    "Meeting Cost Calculator Summary",
    `Total attendees: ${formatNumber(metrics.attendees)}`,
    `Meeting duration: ${values.durationMinutes} minutes`,
    `Prep + follow-up: ${values.prepMinutes + values.followupMinutes} minutes`,
    `Blended hourly rate: ${formatMoney(metrics.blendedRate)}`,
    `Single meeting cost: ${formatMoney(metrics.meetingCost)}`,
    `Weekly meeting cost: ${formatMoney(metrics.weeklyCost)}`,
    `Annual meeting cost: ${formatMoney(metrics.annualCost)}`,
    `Annual hours spent: ${formatNumber(metrics.annualHours, 1)} hours`,
    `Estimated productivity loss: ${formatMoney(metrics.lossCost)} per meeting`,
    `Potential saving if shortened by 15 minutes: ${formatMoney(metrics.savingPerMeeting)} per meeting`,
    `Roles: ${metrics.roles.map((role) => `${role.name} (${role.attendees} x ${formatMoney(role.hourlyRate)}/hr)`).join(", ")}`,
  ].join("\n");
}

function exportCsv(metrics) {
  const rows = [
    ["Role", "Attendees", "Hourly Rate", "Hours", "Base Cost", "Productivity Loss", "Total Cost"],
    ...metrics.roles.map((role) => [
      role.name,
      role.attendees,
      Math.round(role.hourlyRate),
      role.hours.toFixed(2),
      Math.round(role.baseCost),
      Math.round(role.lossCost),
      Math.round(role.totalCost),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "meeting-cost-summary.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Field({ label, value, onChange, suffix, min = 0, max = 100000000, step = 1 }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block break-words text-sm font-semibold text-[var(--foreground)]">{label}</span>
      <div className="flex min-w-0 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--background)] focus-within:border-[var(--primary)] focus-within:shadow-[var(--anslation-ds-focus-ring)]">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(clampNumber(event.target.value, min, max))}
          className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-[var(--foreground)] outline-none"
        />
        {suffix ? (
          <span className="flex shrink-0 items-center border-l border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted-foreground)]">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-rose-500/10 text-rose-600"
        : tone === "violet"
          ? "bg-violet-500/10 text-violet-600"
          : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
          <p className="tool-money-value mt-1 text-[var(--foreground)]">{value}</p>
          <p className="mt-1 break-words text-sm leading-5 text-[var(--muted-foreground)]">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function SectionCard({ title, description, icon: Icon, children }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
      <div className="mb-4 flex min-w-0 items-start gap-3">
        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div className="min-w-0">
          <h2 className="break-words text-xl font-semibold text-[var(--foreground)]">{title}</h2>
          {description ? <p className="mt-1 break-words text-sm leading-6 text-[var(--muted-foreground)]">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-[var(--anslation-ds-shadow-md)]">
      <p className="font-semibold text-[var(--foreground)]">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-[var(--muted-foreground)]">
          {item.name}: {formatMoney(item.value)}
        </p>
      ))}
    </div>
  );
}

export default function MeetingCostCalculator() {
  const [values, setValues] = useState(SAMPLE);
  const [newRoleName, setNewRoleName] = useState("");
  const [copied, setCopied] = useState(false);
  const metrics = useMemo(() => calculateMeeting(values), [values]);

  const updateValue = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const updateRole = (id, key, value) => {
    setValues((current) => ({
      ...current,
      roles: current.roles.map((role) =>
        role.id === id
          ? {
              ...role,
              [key]: key === "name" ? value : clampNumber(value, 0, key === "attendees" ? 100000 : 10000000),
            }
          : role,
      ),
    }));
  };

  const addRole = () => {
    const name = newRoleName.trim();
    if (!name) return;
    setValues((current) => ({
      ...current,
      roles: [
        ...current.roles,
        {
          id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
          name,
          attendees: 1,
          hourlyRate: 1500,
        },
      ],
    }));
    setNewRoleName("");
  };

  const removeRole = (id) => {
    setValues((current) => ({
      ...current,
      roles: current.roles.filter((role) => role.id !== id),
    }));
  };

  const copySummary = async () => {
    await navigator.clipboard?.writeText(buildSummary(values, metrics));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const singleAttendeeCost = metrics.attendees > 0 ? metrics.meetingCost / metrics.attendees : 0;
  const pieData = metrics.roles.filter((role) => role.totalCost > 0).map((role) => ({
    name: role.name,
    value: role.totalCost,
  }));
  const recurringData = [
    { name: "One Meeting", value: metrics.meetingCost },
    { name: "Weekly", value: metrics.weeklyCost },
    { name: "Annual", value: metrics.annualCost },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto w-full max-w-[1240px]">
        <header className="text-center">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-600">
                <Users className="h-3.5 w-3.5" />
                Meeting cost insight
              </span>
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-bold text-[var(--foreground)]">
                <Timer className="h-3.5 w-3.5 text-[var(--primary)]" />
                {formatHours(metrics.totalMinutesPerPerson)} per attendee
              </span>
            </div>
            <h1 className="heading mx-auto max-w-5xl text-center">Meeting Cost Calculator</h1>
            <p className="description mx-auto mt-3 max-w-4xl text-center">
              Estimate the real cost of meetings from attendees, duration, hourly rates,
              preparation time, follow-up work, and recurring calendar frequency.
            </p>
          </div>

          <div className="tool-card-grid mx-auto mt-8 w-full max-w-5xl">
            <MetricCard
              icon={Wallet}
              label="Single Meeting Cost"
              value={formatMoney(metrics.meetingCost)}
              detail={`${formatNumber(metrics.attendees)} attendees at blended ${formatMoney(metrics.blendedRate)}/hr`}
              tone="violet"
            />
            <MetricCard
              icon={CalendarClock}
              label="Annual Cost"
              value={formatMoney(metrics.annualCost)}
              detail={`${formatNumber(values.meetingsPerWeek, 1)} meetings/week for ${formatNumber(values.workingWeeks)} weeks`}
              tone="warn"
            />
            <MetricCard
              icon={TrendingDown}
              label="15 Min Saving"
              value={formatMoney(metrics.savingPerMeeting)}
              detail="Potential saving per meeting if shortened"
              tone="good"
            />
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            icon={Users}
            label="Attendees"
            value={formatNumber(metrics.attendees)}
            detail={`${formatHours(metrics.totalMinutesPerPerson)} loaded time each`}
          />
          <MetricCard
            icon={BriefcaseBusiness}
            label="Base Labor Cost"
            value={formatMoney(metrics.baseCost)}
            detail="Direct salary time estimate"
          />
          <MetricCard
            icon={TrendingUp}
            label="Productivity Loss"
            value={formatMoney(metrics.lossCost)}
            detail={`${formatNumber(values.productivityLoss, 1)}% context-switching buffer`}
            tone="warn"
          />
          <MetricCard
            icon={Timer}
            label="Annual Hours"
            value={`${formatNumber(metrics.annualHours, 1)}h`}
            detail="Total team time per year"
            tone="violet"
          />
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <SectionCard title="Meeting Inputs" description="Set meeting duration, recurring schedule and productivity buffer." icon={Timer}>
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                <Field label="Meeting Duration" value={values.durationMinutes} onChange={(value) => updateValue("durationMinutes", value)} suffix="min" min={1} max={1440} />
                <Field label="Prep Time / Attendee" value={values.prepMinutes} onChange={(value) => updateValue("prepMinutes", value)} suffix="min" max={1440} />
                <Field label="Follow-up Time / Attendee" value={values.followupMinutes} onChange={(value) => updateValue("followupMinutes", value)} suffix="min" max={1440} />
                <Field label="Meetings Per Week" value={values.meetingsPerWeek} onChange={(value) => updateValue("meetingsPerWeek", value)} suffix="/wk" max={1000} step={0.5} />
                <Field label="Working Weeks / Year" value={values.workingWeeks} onChange={(value) => updateValue("workingWeeks", value)} suffix="weeks" min={1} max={60} />
                <Field label="Productivity Loss" value={values.productivityLoss} onChange={(value) => updateValue("productivityLoss", value)} suffix="%" max={100} />
              </div>

              <div className="tool-action-grid mt-5">
                <button type="button" onClick={() => setValues(SAMPLE)} className="btn-secondary">
                  <RefreshCw className="h-4 w-4" />
                  Load Sample
                </button>
                <button
                  type="button"
                  onClick={() => setValues({ ...SAMPLE, durationMinutes: 30, prepMinutes: 0, followupMinutes: 0, meetingsPerWeek: 1 })}
                  className="btn-secondary"
                >
                  <Timer className="h-4 w-4" />
                  Lean Meeting
                </button>
                <button type="button" onClick={copySummary} className="btn-secondary">
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied" : "Copy Summary"}
                </button>
                <button type="button" onClick={() => exportCsv(metrics)} className="btn-primary">
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Attendee Groups" description="Add roles with headcount and average hourly rate." icon={UserPlus}>
              <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row">
                <input
                  value={newRoleName}
                  onChange={(event) => setNewRoleName(event.target.value)}
                  placeholder="New role or team"
                  className="h-11 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
                <button type="button" onClick={addRole} className="btn-primary sm:w-auto">
                  <UserPlus className="h-4 w-4" />
                  Add Role
                </button>
              </div>

              <div className="grid min-w-0 gap-3">
                {values.roles.map((role) => (
                  <article key={role.id} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_90px_130px_auto] sm:items-end">
                      <label className="block min-w-0">
                        <span className="mb-2 block text-xs font-semibold uppercase text-[var(--muted-foreground)]">Role</span>
                        <input
                          value={role.name}
                          onChange={(event) => updateRole(role.id, "name", event.target.value)}
                          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                        />
                      </label>
                      <Field label="People" value={role.attendees} onChange={(value) => updateRole(role.id, "attendees", value)} max={100000} />
                      <Field label="Rate" value={role.hourlyRate} onChange={(value) => updateRole(role.id, "hourlyRate", value)} suffix="₹/hr" />
                      <button
                        type="button"
                        onClick={() => removeRole(role.id)}
                        className="btn-secondary h-11 px-3 sm:w-11"
                        aria-label={`Remove ${role.name}`}
                      >
                        ×
                      </button>
                    </div>
                    <div className="mt-3 flex min-w-0 flex-wrap gap-3 text-sm text-[var(--muted-foreground)]">
                      <span className="break-words">Cost: <b className="text-[var(--foreground)]">{formatMoney(metrics.roles.find((item) => item.id === role.id)?.totalCost || 0)}</b></span>
                      <span className="break-words">Hours: <b className="text-[var(--foreground)]">{formatNumber(metrics.roles.find((item) => item.id === role.id)?.hours || 0, 1)}h</b></span>
                    </div>
                  </article>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="min-w-0 space-y-6">
            <SectionCard title="Recurring Cost View" description="Single, weekly, and annual meeting cost escalation." icon={BarChart3}>
              <div className="h-72 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recurringData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <YAxis width={58} tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="value" name="Cost" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
              <SectionCard title="Role Cost Split" description="Which teams drive the meeting cost." icon={Users}>
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.roles} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <YAxis width={56} tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="totalCost" name="Cost" radius={[8, 8, 0, 0]}>
                        {metrics.roles.map((role, index) => (
                          <Cell key={role.id} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Cost Composition" description="Role share in one meeting." icon={Wallet}>
                <div className="h-56 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius="55%" outerRadius="82%" paddingAngle={3} dataKey="value" nameKey="name">
                        {pieData.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                      <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                        <span className="min-w-0 break-words">{item.name}</span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-[var(--foreground)]">{formatMoney(item.value, true)}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </section>

            <SectionCard title="Decision Signals" description="Quick indicators for calendar hygiene." icon={TrendingDown}>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  ["Cost / Attendee", singleAttendeeCost, "Average share per person"],
                  ["Daily Burn", metrics.dailyCost, "Based on weekly recurrence"],
                  ["Annual Savings", metrics.savingPerMeeting * values.meetingsPerWeek * values.workingWeeks, "If shortened by 15 minutes"],
                  ["Base Cost", metrics.baseCost, "Direct attendance time"],
                  ["Loss Buffer", metrics.lossCost, "Context-switching estimate"],
                  ["Loaded Hours", metrics.attendees * metrics.totalHoursPerPerson, "One meeting team hours"],
                ].map(([label, value, detail]) => (
                  <article key={label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">
                      {label.includes("Hours") ? `${formatNumber(value, 1)}h` : formatMoney(value)}
                    </p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{detail}</p>
                  </article>
                ))}
              </div>
            </SectionCard>
          </div>
        </section>

        <div className="mt-6 rounded-lg border border-violet-500/30 bg-violet-500/10 p-4 text-sm leading-6 text-violet-700">
          Meeting cost is an estimate based on hourly rates and time assumptions. Use it to compare options, not as payroll accounting.
        </div>
      </div>
    </main>
  );
}
