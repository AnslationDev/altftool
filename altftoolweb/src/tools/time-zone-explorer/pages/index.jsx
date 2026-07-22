"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Clock, Globe, RotateCcw, Info, Copy, Download, CheckCircle2, Plus, X, ArrowRightLeft, MapPin } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const TIMEZONE_CITIES = [
  { city: "New York", tz: "America/New_York", country: "USA", abbr: "EST", flag: "🇺🇸" },
  { city: "Los Angeles", tz: "America/Los_Angeles", country: "USA", abbr: "PST", flag: "🇺🇸" },
  { city: "Chicago", tz: "America/Chicago", country: "USA", abbr: "CST", flag: "🇺🇸" },
  { city: "London", tz: "Europe/London", country: "UK", abbr: "GMT", flag: "🇬🇧" },
  { city: "Paris", tz: "Europe/Paris", country: "France", abbr: "CET", flag: "🇫🇷" },
  { city: "Berlin", tz: "Europe/Berlin", country: "Germany", abbr: "CET", flag: "🇩🇪" },
  { city: "Rome", tz: "Europe/Rome", country: "Italy", abbr: "CET", flag: "🇮🇹" },
  { city: "Madrid", tz: "Europe/Madrid", country: "Spain", abbr: "CET", flag: "🇪🇸" },
  { city: "Amsterdam", tz: "Europe/Amsterdam", country: "Netherlands", abbr: "CET", flag: "🇳🇱" },
  { city: "Moscow", tz: "Europe/Moscow", country: "Russia", abbr: "MSK", flag: "🇷🇺" },
  { city: "Dubai", tz: "Asia/Dubai", country: "UAE", abbr: "GST", flag: "🇦🇪" },
  { city: "Mumbai", tz: "Asia/Kolkata", country: "India", abbr: "IST", flag: "🇮🇳" },
  { city: "Delhi", tz: "Asia/Kolkata", country: "India", abbr: "IST", flag: "🇮🇳" },
  { city: "Singapore", tz: "Asia/Singapore", country: "Singapore", abbr: "SGT", flag: "🇸🇬" },
  { city: "Hong Kong", tz: "Asia/Hong_Kong", country: "Hong Kong", abbr: "HKT", flag: "🇭🇰" },
  { city: "Shanghai", tz: "Asia/Shanghai", country: "China", abbr: "CST", flag: "🇨🇳" },
  { city: "Tokyo", tz: "Asia/Tokyo", country: "Japan", abbr: "JST", flag: "🇯🇵" },
  { city: "Seoul", tz: "Asia/Seoul", country: "South Korea", abbr: "KST", flag: "🇰🇷" },
  { city: "Sydney", tz: "Australia/Sydney", country: "Australia", abbr: "AEST", flag: "🇦🇺" },
  { city: "Melbourne", tz: "Australia/Melbourne", country: "Australia", abbr: "AEST", flag: "🇦🇺" },
  { city: "Auckland", tz: "Pacific/Auckland", country: "New Zealand", abbr: "NZST", flag: "🇳🇿" },
  { city: "Toronto", tz: "America/Toronto", country: "Canada", abbr: "EST", flag: "🇨🇦" },
  { city: "Vancouver", tz: "America/Vancouver", country: "Canada", abbr: "PST", flag: "🇨🇦" },
  { city: "São Paulo", tz: "America/Sao_Paulo", country: "Brazil", abbr: "BRT", flag: "🇧🇷" },
  { city: "Mexico City", tz: "America/Mexico_City", country: "Mexico", abbr: "CST", flag: "🇲🇽" },
  { city: "Cairo", tz: "Africa/Cairo", country: "Egypt", abbr: "EET", flag: "🇪🇬" },
  { city: "Lagos", tz: "Africa/Lagos", country: "Nigeria", abbr: "WAT", flag: "🇳🇬" },
  { city: "Johannesburg", tz: "Africa/Johannesburg", country: "South Africa", abbr: "SAST", flag: "🇿🇦" },
  { city: "Bangkok", tz: "Asia/Bangkok", country: "Thailand", abbr: "ICT", flag: "🇹🇭" },
  { city: "Jakarta", tz: "Asia/Jakarta", country: "Indonesia", abbr: "WIB", flag: "🇮🇩" },
  { city: "Istanbul", tz: "Europe/Istanbul", country: "Turkey", abbr: "TRT", flag: "🇹🇷" },
  { city: "Karachi", tz: "Asia/Karachi", country: "Pakistan", abbr: "PKT", flag: "🇵🇰" },
  { city: "Dhaka", tz: "Asia/Dhaka", country: "Bangladesh", abbr: "BST", flag: "🇧🇩" },
  { city: "Lima", tz: "America/Lima", country: "Peru", abbr: "PET", flag: "🇵🇪" },
  { city: "Buenos Aires", tz: "America/Argentina/Buenos_Aires", country: "Argentina", abbr: "ART", flag: "🇦🇷" },
  { city: "Santiago", tz: "America/Santiago", country: "Chile", abbr: "CLT", flag: "🇨🇱" },
  { city: "Berlin", tz: "Europe/Berlin", country: "Germany", abbr: "CET", flag: "🇩🇪" },
  { city: "Warsaw", tz: "Europe/Warsaw", country: "Poland", abbr: "CET", flag: "🇵🇱" },
  { city: "Stockholm", tz: "Europe/Stockholm", country: "Sweden", abbr: "CET", flag: "🇸🇪" },
  { city: "Athens", tz: "Europe/Athens", country: "Greece", abbr: "EET", flag: "🇬🇷" },
];

function deduplicateCities(cities) {
  const seen = new Set();
  return cities.filter((c) => {
    const key = `${c.city}-${c.tz}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const ALL_CITIES = deduplicateCities(TIMEZONE_CITIES);

function getTimeInTz(tz) {
  try {
    return new Date().toLocaleString("en-US", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  } catch { return "--:--:--"; }
}

function getDateInTz(tz) {
  try {
    return new Date().toLocaleDateString("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric", year: "numeric" });
  } catch { return "---"; }
}

function getHourInTz(tz) {
  try {
    const h = parseInt(new Date().toLocaleString("en-US", { timeZone: tz, hour: "numeric", hour12: false }));
    return h;
  } catch { return 12; }
}

function getOffsetStr(tz) {
  try {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" });
    const parts = fmt.formatToParts(now);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart ? tzPart.value : "";
  } catch { return ""; }
}

function isDST(tz) {
  try {
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1).toLocaleString("en-US", { timeZone: tz, timeZoneName: "short" });
    const jul = new Date(now.getFullYear(), 6, 1).toLocaleString("en-US", { timeZone: tz, timeZoneName: "short" });
    const cur = now.toLocaleString("en-US", { timeZone: tz, timeZoneName: "short" });
    if (jan === jul) return false;
    return cur.includes("DT") || (!cur.includes("ST") && cur !== jan);
  } catch { return false; }
}

function getDayPeriod(hour) {
  if (hour >= 6 && hour < 12) return { label: "Morning", color: "text-amber-600", bg: "bg-amber-50", icon: "🌅" };
  if (hour >= 12 && hour < 17) return { label: "Afternoon", color: "text-orange-600", bg: "bg-orange-50", icon: "☀️" };
  if (hour >= 17 && hour < 21) return { label: "Evening", color: "text-purple-600", bg: "bg-purple-50", icon: "🌆" };
  return { label: "Night", color: "text-indigo-600", bg: "bg-indigo-50", icon: "🌙" };
}

function ClockDisplay({ hour, minute, second }) {
  const radius = 52;
  const hrAngle = ((hour % 12) + minute / 60) * 30;
  const minAngle = (minute + second / 60) * 6;
  const secAngle = second * 6;

  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28">
      <circle cx="60" cy="60" r={radius} fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      {[...Array(12)].map((_, i) => {
        const a = (i * 30 - 90) * Math.PI / 180;
        return <circle key={i} cx={60 + 46 * Math.cos(a)} cy={60 + 46 * Math.sin(a)} r="2" fill="var(--muted)" />;
      })}
      <line x1="60" y1="60" x2={60 + 28 * Math.cos((hrAngle - 90) * Math.PI / 180)} y2={60 + 28 * Math.sin((hrAngle - 90) * Math.PI / 180)} stroke="var(--foreground)" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="60" y1="60" x2={60 + 38 * Math.cos((minAngle - 90) * Math.PI / 180)} y2={60 + 38 * Math.sin((minAngle - 90) * Math.PI / 180)} stroke="var(--foreground)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="60" x2={60 + 42 * Math.cos((secAngle - 90) * Math.PI / 180)} y2={60 + 42 * Math.sin((secAngle - 90) * Math.PI / 180)} stroke="var(--primary)" strokeWidth="1" strokeLinecap="round" />
      <circle cx="60" cy="60" r="3" fill="var(--primary)" />
    </svg>
  );
}

function CityCard({ city, onRemove, isPrimary }) {
  const hour = getHourInTz(city.tz);
  const period = getDayPeriod(hour);
  const timeStr = getTimeInTz(city.tz);
  const dateStr = getDateInTz(city.tz);
  const offsetStr = getOffsetStr(city.tz);
  const dst = isDST(city.tz);

  return (
    <div className={`rounded-lg border p-4 ${isPrimary ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20 bg-[var(--card)]" : "border-[var(--border)] bg-[var(--card)]"} shadow-[var(--anslation-ds-shadow-sm)] transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{city.flag}</span>
            <h3 className="text-base font-bold text-[var(--foreground)]">{city.city}</h3>
            {isPrimary && <span className="text-[10px] font-bold uppercase bg-[var(--primary)] text-white px-1.5 py-0.5 rounded">Home</span>}
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">{city.country} · {city.abbr} · {offsetStr}</p>
        </div>
        {onRemove && (
          <button onClick={() => onRemove(city.city)} className="rounded-full p-1 hover:bg-[var(--muted)] transition-all">
            <X className="h-4 w-4 text-[var(--muted)]" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <ClockDisplay hour={parseInt(timeStr.split(":")[0]) || 0} minute={parseInt(timeStr.split(":")[1]) || 0} second={parseInt(timeStr.split(":")[2]) || 0} />
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-black text-[var(--foreground)] tabular-nums">{timeStr}</p>
          <p className="text-xs text-[var(--muted)] mt-1">{dateStr}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${period.bg} ${period.color}`}>
              {period.icon} {period.label}
            </span>
            {dst && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">DST Active</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [cities, setCities] = useState([ALL_CITIES[0], ALL_CITIES[3], ALL_CITIES[16]]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [convertFrom, setConvertFrom] = useState(ALL_CITIES[0]);
  const [convertTo, setConvertTo] = useState(ALL_CITIES[16]);
  const [convertTime, setConvertTime] = useState("");
  const [copied, setCopied] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredCities = ALL_CITIES.filter(
    (c) => !cities.find((ci) => ci.city === c.city && ci.tz === c.tz) &&
      (c.city.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 8);

  const addCity = (city) => {
    if (cities.find((c) => c.city === city.city && c.tz === city.tz)) return;
    setCities((prev) => [...prev, city]);
    setSearch("");
    setShowDropdown(false);
  };

  const removeCity = (cityName) => {
    setCities((prev) => prev.filter((c) => c.city !== cityName));
  };

  const setHome = (city) => {
    setCities((prev) => {
      const others = prev.filter((c) => c.city !== city.city || c.tz !== city.tz);
      return [city, ...others];
    });
  };

  const convertTimeBetween = () => {
    if (!convertTime) return null;
    const [h, m] = convertTime.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    const now = new Date();
    const fromTz = convertFrom.tz;
    const toTz = convertTo.tz;
    const fromStr = now.toLocaleString("en-US", { timeZone: fromTz, year: "numeric", month: "2-digit", day: "2-digit" });
    const [mo, d, y] = fromStr.split("/");
    const srcDate = new Date(parseInt(y), parseInt(mo) - 1, parseInt(d), h, m, 0);
    const srcUtc = srcDate.getTime() - (new Date().toLocaleString("en-US", { timeZone: fromTz })).includes("PM") && h < 12 ? 0 : 0;

    const options = { timeZone: toTz, hour: "2-digit", minute: "2-digit", hour12: true, weekday: "short", month: "short", day: "numeric" };
    try {
      const formatter = new Intl.DateTimeFormat("en-US", options);
      return formatter.format(srcDate);
    } catch { return "Invalid"; }
  };

  const buildReportText = () => {
    const now = new Date().toLocaleString("en-US", { timeZone: "UTC", timeZoneName: "short" });
    return `
TIME ZONE EXPLORER REPORT
Generated: ${new Date().toLocaleString()}
---------------------------------
ACTIVE CITIES (${cities.length}):
${cities.map((c) => {
  const t = getTimeInTz(c.tz);
  const d = getDateInTz(c.tz);
  const off = getOffsetStr(c.tz);
  const dst = isDST(c.tz);
  return `${c.flag} ${c.city} (${c.country}) — ${t} ${off} — ${d}${dst ? " [DST]" : ""}`;
}).join("\n")}

TIME DIFFERENCES:
${cities.map((c, i) => {
  if (i === 0) return "";
  const h1 = getHourInTz(cities[0].tz);
  const h2 = getHourInTz(c.tz);
  const diff = ((h2 - h1 + 24) % 24);
  return `${cities[0].city} → ${c.city}: ${diff === 0 ? "Same time" : diff > 0 ? `+${diff}h ahead` : `${24 + diff}h behind`}`;
}).filter(Boolean).join("\n")}

---------------------------------
Time Zone Explorer — Educational tool
    `.trim();
  };

  const copyReport = async () => {
    const success = await safeCopyText(buildReportText());
    if (success) { setCopied(true); setTimeout(() => setCopied(false), 1200); }
  };

  const downloadReport = () => {
    const blob = new Blob([buildReportText()], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Timezone_Report.txt";
    link.click();
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>This tool uses your browser&apos;s built-in Intl API for real-time, accurate time zone data. All times update live every second.</p>
          </div>
        </div>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase text-indigo-700">
            <Clock className="h-4 w-4" />
            Real-time world clocks
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Time Zone Explorer</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Compare times across world cities with live-updating analog clocks, DST detection, time difference calculations, and a built-in time converter.
          </p>
        </section>

        {/* Add City Search */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="relative">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Add a city... (e.g. Tokyo, Mumbai, London)"
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              />
            </div>
            {showDropdown && search && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-md)] max-h-60 overflow-y-auto">
                {filteredCities.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-[var(--muted)]">No cities found</p>
                ) : (
                  filteredCities.map((c) => (
                    <button key={`${c.city}-${c.tz}`} onClick={() => addCity(c)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-all hover:bg-[var(--muted)]">
                      <span className="text-lg">{c.flag}</span>
                      <div>
                        <span className="font-semibold text-[var(--foreground)]">{c.city}</span>
                        <span className="ml-2 text-[var(--muted)]">{c.country}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </section>

        {/* City Clocks */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">World Clocks ({cities.length})</h2>
            <button onClick={() => setCities([ALL_CITIES[0], ALL_CITIES[3], ALL_CITIES[16]])} className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold transition-all hover:bg-[var(--muted)]">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>

          {cities.length === 0 ? (
            <p className="text-center text-sm text-[var(--muted)] py-8">Add cities using the search above</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cities.map((c, i) => (
                <div key={`${c.city}-${c.tz}`} className="relative">
                  <CityCard city={c} onRemove={removeCity} isPrimary={i === 0} />
                  {i > 0 && (
                    <div className="mt-2 flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
                      <ArrowRightLeft className="h-3 w-3" />
                      <span className="font-semibold">
                        {(() => {
                          const diff = ((getHourInTz(c.tz) - getHourInTz(cities[0].tz) + 24) % 24);
                          if (diff === 0) return "Same time";
                          return diff > 0 ? `+${diff}h ahead of ${cities[0].city}` : `${24 - diff}h behind ${cities[0].city}`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Time Converter */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Time Converter</h2>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] items-end">
            <div>
              <label className="text-xs font-bold uppercase text-[var(--muted)]">From</label>
              <select value={convertFrom.city} onChange={(e) => setConvertFrom(ALL_CITIES.find((c) => c.city === e.target.value))} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)]">
                {ALL_CITIES.map((c) => <option key={`from-${c.city}-${c.tz}`} value={c.city}>{c.flag} {c.city} ({c.abbr})</option>)}
              </select>
              <input type="time" value={convertTime} onChange={(e) => setConvertTime(e.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)]" />
            </div>
            <div className="flex items-center justify-center pb-2">
              <ArrowRightLeft className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[var(--muted)]">To</label>
              <select value={convertTo.city} onChange={(e) => setConvertTo(ALL_CITIES.find((c) => c.city === e.target.value))} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)]">
                {ALL_CITIES.map((c) => <option key={`to-${c.city}-${c.tz}`} value={c.city}>{c.flag} {c.city} ({c.abbr})</option>)}
              </select>
              {convertTime && (
                <div className="mt-2 rounded-lg bg-[var(--background)] border border-[var(--border)] p-3 text-center">
                  <p className="text-xs text-[var(--muted)] uppercase font-bold">Converted Time</p>
                  <p className="text-xl font-black text-[var(--foreground)] mt-1">{convertTimeBetween()}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={copyReport} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[var(--muted)]">
            {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy Report"}
          </button>
          <button onClick={downloadReport} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[var(--muted)]">
            <Download className="h-4 w-4" /> Download
          </button>
        </div>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">About Time Zones</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">How Time Zones Work</p>
              <p>The Earth rotates 15° per hour, creating 24 time zones. UTC (Coordinated Universal Time) is the primary time standard. Most zones are offset by whole hours, but some like India (+5:30) and Nepal (+5:45) use 30 or 45-minute offsets. The International Date Line roughly follows the 180° meridian.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Daylight Saving Time</p>
              <p>Many countries advance clocks 1 hour in spring (&ldquo;spring forward&rdquo;) and back 1 hour in autumn (&ldquo;fall back&rdquo;) to extend evening daylight. Not all regions observe DST — most of Africa, Asia, and equatorial regions do not. Some US states have opted out of DST entirely.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
