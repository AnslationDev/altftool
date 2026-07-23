"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  Clipboard,
  Copy,
  Download,
  Filter,
  Landmark,
  MapPin,
  PartyPopper,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CURRENT_YEAR = new Date().getFullYear();

const STATE_OPTIONS = [
  { value: "all", label: "All India" },
  { value: "andhra-pradesh", label: "Andhra Pradesh" },
  { value: "delhi", label: "Delhi" },
  { value: "gujarat", label: "Gujarat" },
  { value: "karnataka", label: "Karnataka" },
  { value: "kerala", label: "Kerala" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "punjab", label: "Punjab" },
  { value: "rajasthan", label: "Rajasthan" },
  { value: "tamil-nadu", label: "Tamil Nadu" },
  { value: "uttar-pradesh", label: "Uttar Pradesh" },
  { value: "west-bengal", label: "West Bengal" },
];

const TYPE_OPTIONS = ["All types", "National", "Festival", "Regional", "Bank"];

const FIXED_HOLIDAYS = [
  ["01-01", "New Year Day", "Regional", ["all"], "Widely observed in many offices and schools."],
  ["01-14", "Makar Sankranti", "Festival", ["all", "gujarat", "rajasthan", "maharashtra", "karnataka"], "Harvest festival and kite-flying season."],
  ["01-15", "Pongal / Thiruvalluvar Day", "Regional", ["tamil-nadu"], "Major Tamil Nadu harvest holiday window."],
  ["01-26", "Republic Day", "National", ["all"], "National public holiday across India."],
  ["04-14", "Dr. B. R. Ambedkar Jayanti", "National", ["all"], "Observed in many public offices and institutions."],
  ["05-01", "Maharashtra Day / Labour Day", "Regional", ["maharashtra", "all"], "State day in Maharashtra and Labour Day in several regions."],
  ["08-15", "Independence Day", "National", ["all"], "National public holiday across India."],
  ["10-02", "Gandhi Jayanti", "National", ["all"], "National public holiday across India."],
  ["12-25", "Christmas Day", "National", ["all"], "Public holiday for Christmas."],
];

const FESTIVAL_BY_YEAR = {
  2025: [
    ["02-26", "Maha Shivratri", "Festival", ["all", "uttar-pradesh", "rajasthan", "maharashtra"], "Major Hindu festival."],
    ["03-14", "Holi", "Festival", ["all", "uttar-pradesh", "rajasthan", "delhi"], "Festival of colours."],
    ["03-31", "Eid al-Fitr", "Festival", ["all"], "Moon-sighting based date; verify locally."],
    ["04-06", "Ram Navami", "Festival", ["all", "uttar-pradesh"], "Celebrates the birth of Lord Rama."],
    ["04-10", "Mahavir Jayanti", "Festival", ["all"], "Jain festival."],
    ["04-18", "Good Friday", "National", ["all"], "Christian observance."],
    ["05-12", "Buddha Purnima", "Festival", ["all"], "Buddhist observance."],
    ["06-07", "Eid al-Adha / Bakrid", "Festival", ["all"], "Moon-sighting based date; verify locally."],
    ["07-06", "Muharram", "Festival", ["all"], "Moon-sighting based date; verify locally."],
    ["08-09", "Raksha Bandhan", "Festival", ["all", "uttar-pradesh", "rajasthan", "delhi"], "Sibling festival."],
    ["08-16", "Janmashtami", "Festival", ["all", "uttar-pradesh", "rajasthan"], "Birth of Lord Krishna."],
    ["08-27", "Ganesh Chaturthi", "Regional", ["maharashtra", "karnataka", "all"], "Major festival in Maharashtra and western India."],
    ["09-05", "Onam / Milad-un-Nabi", "Regional", ["kerala", "all"], "Kerala harvest festival and Islamic observance."],
    ["10-02", "Dussehra", "Festival", ["all", "west-bengal", "karnataka"], "Vijayadashami holiday."],
    ["10-20", "Diwali", "Festival", ["all"], "Festival of lights."],
    ["11-05", "Guru Nanak Jayanti", "Festival", ["all", "punjab", "delhi"], "Sikh observance."],
  ],
  2026: [
    ["02-15", "Maha Shivratri", "Festival", ["all", "uttar-pradesh", "rajasthan", "maharashtra"], "Major Hindu festival."],
    ["03-04", "Holi", "Festival", ["all", "uttar-pradesh", "rajasthan", "delhi"], "Festival of colours."],
    ["03-20", "Eid al-Fitr", "Festival", ["all"], "Moon-sighting based date; verify locally."],
    ["03-26", "Ram Navami", "Festival", ["all", "uttar-pradesh"], "Celebrates the birth of Lord Rama."],
    ["03-31", "Mahavir Jayanti", "Festival", ["all"], "Jain festival."],
    ["04-03", "Good Friday", "National", ["all"], "Christian observance."],
    ["05-01", "Buddha Purnima", "Festival", ["all"], "Buddhist observance."],
    ["05-27", "Eid al-Adha / Bakrid", "Festival", ["all"], "Moon-sighting based date; verify locally."],
    ["06-26", "Muharram", "Festival", ["all"], "Moon-sighting based date; verify locally."],
    ["08-25", "Milad-un-Nabi", "Festival", ["all"], "Moon-sighting based date; verify locally."],
    ["08-26", "Onam", "Regional", ["kerala"], "Kerala harvest festival."],
    ["08-28", "Raksha Bandhan", "Festival", ["all", "uttar-pradesh", "rajasthan", "delhi"], "Sibling festival."],
    ["09-04", "Janmashtami", "Festival", ["all", "uttar-pradesh", "rajasthan"], "Birth of Lord Krishna."],
    ["09-14", "Ganesh Chaturthi", "Regional", ["maharashtra", "karnataka", "all"], "Major festival in Maharashtra and western India."],
    ["10-20", "Dussehra", "Festival", ["all", "west-bengal", "karnataka"], "Vijayadashami holiday."],
    ["11-08", "Diwali", "Festival", ["all"], "Festival of lights."],
    ["11-24", "Guru Nanak Jayanti", "Festival", ["all", "punjab", "delhi"], "Sikh observance."],
  ],
  2027: [
    ["03-06", "Maha Shivratri", "Festival", ["all", "uttar-pradesh", "rajasthan", "maharashtra"], "Major Hindu festival."],
    ["03-10", "Eid al-Fitr", "Festival", ["all"], "Moon-sighting based date; verify locally."],
    ["03-22", "Holi", "Festival", ["all", "uttar-pradesh", "rajasthan", "delhi"], "Festival of colours."],
    ["03-26", "Good Friday", "National", ["all"], "Christian observance."],
    ["04-15", "Ram Navami", "Festival", ["all", "uttar-pradesh"], "Celebrates the birth of Lord Rama."],
    ["04-18", "Mahavir Jayanti", "Festival", ["all"], "Jain festival."],
    ["05-17", "Eid al-Adha / Bakrid", "Festival", ["all"], "Moon-sighting based date; verify locally."],
    ["05-20", "Buddha Purnima", "Festival", ["all"], "Buddhist observance."],
    ["06-16", "Muharram", "Festival", ["all"], "Moon-sighting based date; verify locally."],
    ["08-15", "Milad-un-Nabi", "Festival", ["all"], "Moon-sighting based date; verify locally."],
    ["08-17", "Raksha Bandhan", "Festival", ["all", "uttar-pradesh", "rajasthan", "delhi"], "Sibling festival."],
    ["08-25", "Janmashtami", "Festival", ["all", "uttar-pradesh", "rajasthan"], "Birth of Lord Krishna."],
    ["09-04", "Ganesh Chaturthi", "Regional", ["maharashtra", "karnataka", "all"], "Major festival in Maharashtra and western India."],
    ["09-14", "Onam", "Regional", ["kerala"], "Kerala harvest festival."],
    ["10-09", "Dussehra", "Festival", ["all", "west-bengal", "karnataka"], "Vijayadashami holiday."],
    ["10-29", "Diwali", "Festival", ["all"], "Festival of lights."],
    ["11-14", "Guru Nanak Jayanti", "Festival", ["all", "punjab", "delhi"], "Sikh observance."],
  ],
};

const STATE_SPECIFIC = [
  ["01-13", "Lohri", "Regional", ["punjab", "delhi"], "North India winter harvest celebration."],
  ["03-30", "Rajasthan Day", "Regional", ["rajasthan"], "State formation day."],
  ["04-15", "Bengali New Year / Poila Boishakh", "Regional", ["west-bengal"], "Bengali new year celebration."],
  ["05-01", "Gujarat Day", "Regional", ["gujarat"], "State formation day."],
  ["06-01", "Karnataka State Planning Day", "Regional", ["karnataka"], "Useful planning placeholder for state observances."],
  ["08-16", "Parsi New Year", "Regional", ["maharashtra", "gujarat"], "Regional observance in parts of western India."],
  ["11-01", "Kannada Rajyotsava", "Regional", ["karnataka"], "Karnataka state formation day."],
];

function toDate(year, monthDay) {
  const [month, day] = monthDay.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date) {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function makeHoliday(year, row, source = "Official planning") {
  const [monthDay, name, type, regions, note] = row;
  const date = toDate(year, monthDay);
  return {
    id: `${year}-${monthDay}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    date,
    dateKey: `${year}-${monthDay}`,
    name,
    type,
    regions,
    note,
    source,
    day: date.toLocaleDateString("en-IN", { weekday: "long" }),
    month: date.getMonth(),
  };
}

function getSecondAndFourthSaturdays(year, month) {
  const days = [];
  for (let day = 1; day <= 31; day += 1) {
    const date = new Date(year, month, day);
    if (date.getMonth() !== month) break;
    if (date.getDay() === 6) days.push(date);
  }
  return [days[1], days[3]].filter(Boolean);
}

function getSundays(year, month) {
  const days = [];
  for (let day = 1; day <= 31; day += 1) {
    const date = new Date(year, month, day);
    if (date.getMonth() !== month) break;
    if (date.getDay() === 0) days.push(date);
  }
  return days;
}

function buildHolidayList(year) {
  const fixed = FIXED_HOLIDAYS.map((row) => makeHoliday(year, row));
  const yearly = (FESTIVAL_BY_YEAR[year] || []).map((row) => makeHoliday(year, row, "Festival calendar"));
  const state = STATE_SPECIFIC.map((row) => makeHoliday(year, row, "State planning"));

  return [...fixed, ...yearly, ...state]
    .filter((holiday, index, list) => list.findIndex((item) => item.dateKey === holiday.dateKey && item.name === holiday.name) === index)
    .sort((a, b) => a.date - b.date);
}

function getLongWeekends(holidays) {
  return holidays.filter((holiday) => {
    const day = holiday.date.getDay();
    return day === 1 || day === 5;
  });
}

function downloadCsv(rows) {
  const csv = [
    ["Date", "Day", "Holiday", "Type", "Regions", "Note"],
    ...rows.map((item) => [
      formatDate(item.date),
      item.day,
      item.name,
      item.type,
      item.regions.join(" | "),
      item.note,
    ]),
  ]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "indian-holidays.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function getTypeAccent(type) {
  if (type === "National") {
    return {
      icon: "bg-blue-500/10 text-blue-600",
      pill: "bg-blue-500/10 text-blue-600 ring-blue-500/20",
      border: "border-l-blue-500",
      dot: "bg-blue-500",
    };
  }
  if (type === "Bank") {
    return {
      icon: "bg-emerald-500/10 text-emerald-600",
      pill: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
      border: "border-l-emerald-500",
      dot: "bg-emerald-500",
    };
  }
  if (type === "Regional") {
    return {
      icon: "bg-amber-500/10 text-amber-600",
      pill: "bg-amber-500/10 text-amber-600 ring-amber-500/20",
      border: "border-l-amber-500",
      dot: "bg-amber-500",
    };
  }
  return {
    icon: "bg-purple-500/10 text-purple-600",
    pill: "bg-purple-500/10 text-purple-600 ring-purple-500/20",
    border: "border-l-purple-500",
    dot: "bg-purple-500",
  };
}

function StatCard({ icon: Icon, label, value, detail, tone = "blue" }) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "amber"
        ? "bg-amber-500/10 text-amber-600"
        : tone === "rose"
          ? "bg-rose-500/10 text-rose-600"
          : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <article className="tool-card group min-w-0 overflow-hidden !p-4 transition-transform duration-200 hover:-translate-y-0.5 sm:!p-5 xl:!p-6">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 ${toneClass}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        <div className="min-w-0">
          <p className="break-words text-[0.68rem] font-bold uppercase tracking-wide text-[var(--muted-foreground)] sm:text-xs">{label}</p>
          <p className="mt-1 break-words text-xl font-black leading-tight text-[var(--foreground)] sm:text-2xl xl:text-3xl">{value}</p>
          <p className="mt-2 hidden break-words text-sm text-[var(--muted-foreground)] sm:block">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function HolidayCard({ holiday }) {
  const accent = getTypeAccent(holiday.type);

  return (
    <article className={`overflow-hidden rounded-xl border border-[var(--border)] border-l-4 ${accent.border} bg-[var(--background)] p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5`}>
      <div className="grid min-w-0 gap-4 sm:grid-cols-[88px_minmax(0,1fr)]">
        <div className="flex w-fit flex-row items-center gap-3 rounded-lg bg-[var(--section-highlight)] px-3 py-2 sm:w-full sm:flex-col sm:items-start sm:gap-1 sm:px-4 sm:py-3">
          <span className="text-2xl font-black leading-none text-[var(--primary)]">{holiday.date.getDate()}</span>
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">{MONTHS[holiday.month].slice(0, 3)}</span>
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">{holiday.day.slice(0, 3)}</span>
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">{formatDate(holiday.date)}</p>
              <h3 className="mt-1 break-words text-lg font-black leading-snug text-[var(--foreground)]">{holiday.name}</h3>
            </div>
            <span className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold ring-1 ${accent.pill}`}>{holiday.type}</span>
          </div>
          <p className="mt-3 break-words text-sm leading-6 text-[var(--muted-foreground)]">{holiday.note}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {holiday.regions.slice(0, 3).map((region) => (
              <span key={region} className="rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                {region === "all" ? "All India" : region.replaceAll("-", " ")}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function IndianHolidayFinder() {
  const [year, setYear] = useState(Math.min(Math.max(CURRENT_YEAR, 2025), 2027));
  const [month, setMonth] = useState("all");
  const [state, setState] = useState("all");
  const [type, setType] = useState("All types");
  const [query, setQuery] = useState("");

  const holidays = useMemo(() => buildHolidayList(year), [year]);
  const bankDays = useMemo(() => {
    const selectedMonths = month === "all" ? MONTHS.map((_, index) => index) : [Number(month)];
    return selectedMonths.flatMap((monthIndex) => [
      ...getSecondAndFourthSaturdays(year, monthIndex).map((date) => ({
        id: `${date.toISOString()}-bank-saturday`,
        date,
        dateKey: date.toISOString().slice(0, 10),
        name: "Bank Holiday Saturday",
        type: "Bank",
        regions: ["all"],
        note: "Second or fourth Saturday banking closure.",
        source: "Banking schedule",
        day: date.toLocaleDateString("en-IN", { weekday: "long" }),
        month: monthIndex,
      })),
      ...getSundays(year, monthIndex).map((date) => ({
        id: `${date.toISOString()}-bank-sunday`,
        date,
        dateKey: date.toISOString().slice(0, 10),
        name: "Sunday Bank Holiday",
        type: "Bank",
        regions: ["all"],
        note: "Weekly banking closure.",
        source: "Banking schedule",
        day: date.toLocaleDateString("en-IN", { weekday: "long" }),
        month: monthIndex,
      })),
    ]);
  }, [month, year]);

  const visibleHolidays = useMemo(() => {
    const combined = type === "Bank" ? bankDays : [...holidays, ...bankDays];
    const text = query.trim().toLowerCase();
    return combined
      .filter((holiday) => month === "all" || holiday.month === Number(month))
      .filter((holiday) => state === "all" || holiday.regions.includes("all") || holiday.regions.includes(state))
      .filter((holiday) => type === "All types" || holiday.type === type)
      .filter((holiday) => !text || `${holiday.name} ${holiday.type} ${holiday.note}`.toLowerCase().includes(text))
      .sort((a, b) => a.date - b.date);
  }, [bankDays, holidays, month, query, state, type]);

  const upcoming = useMemo(() => {
    const today = new Date();
    const thisYear = year === today.getFullYear();
    const baseline = thisYear ? new Date(today.getFullYear(), today.getMonth(), today.getDate()) : new Date(year, 0, 1);
    return visibleHolidays.find((holiday) => holiday.date >= baseline) || visibleHolidays[0];
  }, [visibleHolidays, year]);

  const longWeekends = useMemo(() => getLongWeekends(visibleHolidays), [visibleHolidays]);
  const selectedMonthIndex = month === "all" ? new Date().getMonth() : Number(month);
  const monthStart = new Date(year, selectedMonthIndex, 1);
  const daysInMonth = new Date(year, selectedMonthIndex + 1, 0).getDate();
  const monthMarkers = visibleHolidays.filter((holiday) => holiday.month === selectedMonthIndex);
  const calendarCells = [
    ...Array.from({ length: monthStart.getDay() }, (_, index) => ({ id: `empty-${index}`, empty: true })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const markers = monthMarkers.filter((holiday) => holiday.date.getDate() === day);
      return { id: `day-${day}`, day, markers };
    }),
  ];

  const stateLabel = STATE_OPTIONS.find((option) => option.value === state)?.label || "All India";

  const copySummary = async () => {
    const lines = visibleHolidays
      .slice(0, 20)
      .map((holiday) => `${formatDate(holiday.date)} - ${holiday.name} (${holiday.type})`);
    await navigator.clipboard.writeText([`Indian holidays for ${stateLabel}, ${year}`, ...lines].join("\n"));
  };

  const upcomingAccent = upcoming ? getTypeAccent(upcoming.type) : getTypeAccent("National");

  return (
    <main className="mx-auto w-full max-w-[1360px] px-4 pb-12 pt-8 text-[var(--foreground)] sm:px-6 sm:pt-10 lg:px-8">
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,var(--section-highlight),var(--background)_48%,rgba(59,130,246,0.08))] p-5 shadow-sm sm:p-7 xl:p-8">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)] xl:gap-10">
          <div className="min-w-0 text-center lg:text-left">
            <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--background)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)] ring-1 ring-[var(--border)]">
                <Sparkles className="h-4 w-4" />
                India holiday planner
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-600 ring-1 ring-emerald-500/20">
                <ShieldCheck className="h-4 w-4" />
                Browser-side calendar
              </span>
            </div>
            <h1 className="mt-5 break-words bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl lg:text-6xl">
              Indian Holiday Finder
            </h1>
            <p className="mx-auto mt-4 max-w-3xl break-words text-base leading-7 text-[var(--muted-foreground)] sm:text-lg lg:mx-0">
              Find Indian public holidays, festival dates, state-wise observances, banking weekends, upcoming holidays, and long-weekend planning windows in one responsive dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-md">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Next matching holiday</p>
            <div className="mt-4 flex min-w-0 items-start gap-4">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${upcomingAccent.icon}`}>
                <PartyPopper className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">{upcoming ? upcoming.name : "No holiday"}</h2>
                <p className="mt-2 text-sm font-semibold text-[var(--muted-foreground)]">{upcoming ? `${formatDate(upcoming.date)} - ${upcoming.day}` : "Try another filter"}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[var(--section-highlight)] p-3">
                <p className="text-xs font-bold uppercase text-[var(--muted-foreground)]">Region</p>
                <p className="mt-1 break-words text-sm font-black text-[var(--foreground)]">{stateLabel}</p>
              </div>
              <div className="rounded-xl bg-[var(--section-highlight)] p-3">
                <p className="text-xs font-bold uppercase text-[var(--muted-foreground)]">Year</p>
                <p className="mt-1 text-sm font-black text-[var(--foreground)]">{year}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarDays} label="Matches" value={visibleHolidays.length} detail={`${stateLabel} holiday results`} />
        <StatCard icon={PartyPopper} label="Upcoming" value={upcoming ? upcoming.name : "None"} detail={upcoming ? formatDate(upcoming.date) : "No matching holiday"} tone="green" />
        <StatCard icon={Star} label="Long weekends" value={longWeekends.length} detail="Friday or Monday holidays" tone="amber" />
        <StatCard icon={Landmark} label="Bank closures" value={bankDays.length} detail={month === "all" ? "All months selected" : MONTHS[selectedMonthIndex]} />
      </section>

      <section className="tool-card mt-6 !p-4 sm:!p-5 xl:!p-6">
        <div className="mb-5 flex min-w-0 items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--section-highlight)] text-[var(--primary)]">
            <Filter className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Search holidays</h2>
            <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Filter by year, month, state, holiday type, or festival name.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[0.8fr_1fr_1.15fr_1fr_1.3fr]">
          <label className="min-w-0">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <CalendarDays className="h-4 w-4 text-[var(--primary)]" />
              Year
            </span>
            <select value={year} onChange={(event) => setYear(Number(event.target.value))} className="w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]">
              {[2025, 2026, 2027].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="min-w-0">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <Filter className="h-4 w-4 text-[var(--primary)]" />
              Month
            </span>
            <select value={month} onChange={(event) => setMonth(event.target.value)} className="w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]">
              <option value="all">All months</option>
              {MONTHS.map((item, index) => (
                <option key={item} value={index}>{item}</option>
              ))}
            </select>
          </label>

          <label className="min-w-0">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <MapPin className="h-4 w-4 text-[var(--primary)]" />
              State
            </span>
            <select value={state} onChange={(event) => setState(event.target.value)} className="w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]">
              {STATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="min-w-0">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <Star className="h-4 w-4 text-[var(--primary)]" />
              Type
            </span>
            <select value={type} onChange={(event) => setType(event.target.value)} className="w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]">
              {TYPE_OPTIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="min-w-0">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <Search className="h-4 w-4 text-[var(--primary)]" />
              Search
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Diwali, bank, Holi..."
              className="w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            />
          </label>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-8">
        <div className="grid gap-6">
          <article className="tool-card !p-4 sm:!p-5 xl:!p-6">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Calendar view</p>
                <h2 className="mt-1 break-words text-2xl font-black text-[var(--foreground)]">{MONTHS[selectedMonthIndex]} {year}</h2>
              </div>
              <div className="tool-action-grid w-full sm:w-auto">
                <button type="button" onClick={copySummary} className="tool-action-btn">
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                <button type="button" onClick={() => downloadCsv(visibleHolidays)} className="tool-action-btn tool-primary-btn">
                  <Download className="h-4 w-4" />
                  CSV
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="rounded-md bg-[var(--section-highlight)] px-2 py-2 text-center text-[0.68rem] font-bold uppercase text-[var(--muted-foreground)]">
                  {day}
                </div>
              ))}
              {calendarCells.map((cell) => (
                <div
                  key={cell.id}
                  className={`min-h-14 rounded-lg border p-2 transition-colors sm:min-h-20 ${cell.empty
                      ? "border-transparent"
                      : cell.markers.length
                        ? "border-blue-400/40 bg-blue-500/10 shadow-sm"
                        : "border-[var(--border)] bg-[var(--background)]"
                    }`}
                >
                  {!cell.empty ? (
                    <>
                      <p className="text-sm font-black text-[var(--foreground)]">{cell.day}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {cell.markers.slice(0, 3).map((marker) => (
                          <span key={marker.id} className={`h-2 w-2 rounded-full ${getTypeAccent(marker.type).dot}`} title={marker.name} />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 sm:p-5">
              <p className="text-sm font-semibold text-[var(--foreground)]">Planning note</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Lunar festival dates and local state notifications can shift by official announcement. Use this finder for planning, then verify critical leave, school, bank, or compliance dates with the latest local circular.
              </p>
            </div>
          </article>

          <article className="tool-card !p-4 sm:!p-5 xl:!p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Long Weekend Finder</h2>
                <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">Friday and Monday holidays that can create extended travel windows.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {longWeekends.slice(0, 6).map((holiday) => (
                <div key={holiday.id} className="flex min-w-0 flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="break-words font-bold text-[var(--foreground)]">{holiday.name}</span>
                  <span className="text-sm font-semibold text-[var(--muted-foreground)]">{formatDate(holiday.date)} - {holiday.day}</span>
                </div>
              ))}
              {!longWeekends.length ? <p className="text-sm text-[var(--muted-foreground)]">No long-weekend matches in this filter.</p> : null}
            </div>
          </article>
        </div>

        <article className="tool-card !p-4 sm:!p-5 xl:!p-6">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--section-highlight)] text-[var(--primary)]">
              <Clipboard className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Holiday results</p>
              <h2 className="mt-1 break-words text-2xl font-black text-[var(--foreground)]">{stateLabel} calendar</h2>
            </div>
          </div>

          <div className="mt-5 grid max-h-none gap-3 overflow-visible pr-0 xl:max-h-[820px] xl:overflow-y-auto xl:pr-2">
            {visibleHolidays.map((holiday) => (
              <HolidayCard key={`${holiday.id}-${holiday.type}`} holiday={holiday} />
            ))}
            {!visibleHolidays.length ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6 text-center">
                <p className="font-bold text-[var(--foreground)]">No holiday found</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">Try another month, state, type, or search keyword.</p>
              </div>
            ) : null}
          </div>
        </article>
      </section>
    </main>
  );
}
