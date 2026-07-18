"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Compass,
  Copy,
  Info,
  LocateFixed,
  MapPin,
  Moon,
  Navigation,
  Settings,
  Sunrise,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { CITIES, HIGH_LAT_RULES, KAABA, METHODS, PRAYER_META } from "../data";

const STORE_KEY = "altf:prayer-times-qibla:settings";

const DEG = Math.PI / 180;
const sin = (d) => Math.sin(d * DEG);
const cos = (d) => Math.cos(d * DEG);
const tan = (d) => Math.tan(d * DEG);
const arcsin = (x) => Math.asin(x) / DEG;
const arccos = (x) => Math.acos(x) / DEG;
const arctan2 = (y, x) => Math.atan2(y, x) / DEG;
const arccot = (x) => Math.atan2(1, x) / DEG;

const fixAngle = (a) => {
  const r = a - 360 * Math.floor(a / 360);
  return r < 0 ? r + 360 : r;
};
const fixHour = (a) => {
  const r = a - 24 * Math.floor(a / 24);
  return r < 0 ? r + 24 : r;
};
const timeDiff = (a, b) => fixHour(b - a);

function julianDate(year, month, day) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

function sunPosition(jd) {
  const d = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * d);
  const q = fixAngle(280.459 + 0.98564736 * d);
  const l = fixAngle(q + 1.915 * sin(g) + 0.02 * sin(2 * g));
  const e = 23.439 - 0.00000036 * d;
  const ra = arctan2(cos(e) * sin(l), cos(l)) / 15;
  return { decl: arcsin(sin(e) * sin(l)), eqt: q / 15 - fixHour(ra) };
}

const midDay = (jd, t) => fixHour(12 - sunPosition(jd + t).eqt);

function sunAngleTime(jd, t, angle, lat, ccw) {
  const { decl } = sunPosition(jd + t);
  const inner = (-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat));
  if (inner > 1 || inner < -1) return NaN;
  const span = arccos(inner) / 15;
  return midDay(jd, t) + (ccw ? -span : span);
}

function asrAngleTime(jd, t, factor, lat) {
  const { decl } = sunPosition(jd + t);
  return sunAngleTime(jd, t, -arccot(factor + tan(Math.abs(lat - decl))), lat, false);
}

function nightPortion(angle, night, rule) {
  if (rule === "anglebased") return (angle / 60) * night;
  if (rule === "oneseventh") return night / 7;
  return night / 2;
}

function adjustHighLat(time, base, angle, night, ccw, rule) {
  const portion = nightPortion(angle, night, rule);
  const diff = ccw ? timeDiff(time, base) : timeDiff(base, time);
  if (!Number.isFinite(time) || diff > portion) return base + (ccw ? -portion : portion);
  return time;
}

function computeTimes({ year, month, day, lat, lng, tz, method, asrFactor, highLatRule }) {
  const jd = julianDate(year, month, day) - lng / (15 * 24);
  const fajrAngle = method.fajrAngle;
  const ishaAngle = method.ishaAngle;
  const ishaMinutes = method.ishaMinutes;

  let t = { fajr: 5 / 24, sunrise: 6 / 24, dhuhr: 12 / 24, asr: 13 / 24, sunset: 18 / 24, isha: 18 / 24 };
  for (let i = 0; i < 3; i += 1) {
    t = {
      fajr: sunAngleTime(jd, t.fajr, fajrAngle, lat, true) / 24,
      sunrise: sunAngleTime(jd, t.sunrise, 0.833, lat, true) / 24,
      dhuhr: midDay(jd, t.dhuhr) / 24,
      asr: asrAngleTime(jd, t.asr, asrFactor, lat) / 24,
      sunset: sunAngleTime(jd, t.sunset, 0.833, lat, false) / 24,
      isha: (ishaMinutes ? 18 : sunAngleTime(jd, t.isha, ishaAngle, lat, false)) / 24,
    };
  }

  const offset = tz - lng / 15;
  const out = {};
  Object.keys(t).forEach((key) => {
    out[key] = t[key] * 24 + offset;
  });

  let adjusted = false;
  if (highLatRule !== "none" && Number.isFinite(out.sunrise) && Number.isFinite(out.sunset)) {
    const night = timeDiff(out.sunset, out.sunrise);
    const beforeFajr = out.fajr;
    const beforeIsha = out.isha;
    out.fajr = adjustHighLat(out.fajr, out.sunrise, fajrAngle, night, true, highLatRule);
    if (!ishaMinutes) out.isha = adjustHighLat(out.isha, out.sunset, ishaAngle, night, false, highLatRule);
    adjusted = out.fajr !== beforeFajr || out.isha !== beforeIsha;
  }

  out.maghrib = out.sunset;
  if (ishaMinutes) out.isha = out.maghrib + ishaMinutes / 60;
  out.dhuhr += 1 / 60;
  out.midnight =
    Number.isFinite(out.sunset) && Number.isFinite(out.sunrise)
      ? out.sunset + timeDiff(out.sunset, out.sunrise) / 2
      : NaN;
  out.adjusted = adjusted;
  return out;
}

function qiblaBearing(lat, lng) {
  const dLng = KAABA.lng - lng;
  return fixAngle(arctan2(sin(dLng), cos(lat) * tan(KAABA.lat) - sin(lat) * cos(dLng)));
}

function greatCircleKm(lat, lng) {
  const dLat = (KAABA.lat - lat) * DEG;
  const dLng = (KAABA.lng - lng) * DEG;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * DEG) * Math.cos(KAABA.lat * DEG) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const COMPASS_POINTS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

const compassWord = (bearing) => COMPASS_POINTS[Math.round(fixAngle(bearing) / 22.5) % 16];

const COMPASS_LONG = {
  N: "north", NNE: "north-northeast", NE: "northeast", ENE: "east-northeast",
  E: "east", ESE: "east-southeast", SE: "southeast", SSE: "south-southeast",
  S: "south", SSW: "south-southwest", SW: "southwest", WSW: "west-southwest",
  W: "west", WNW: "west-northwest", NW: "northwest", NNW: "north-northwest",
};

function tzOffsetHours(timeZone, date) {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const map = {};
    dtf.formatToParts(date).forEach((part) => {
      map[part.type] = part.value;
    });
    const asUTC = Date.UTC(+map.year, +map.month - 1, +map.day, +map.hour % 24, +map.minute, +map.second);
    return (asUTC - date.getTime() + date.getMilliseconds()) / 3600000;
  } catch {
    return -date.getTimezoneOffset() / 60;
  }
}

const hhmm = (hours, use24) => {
  if (!Number.isFinite(hours)) return "--:--";
  const total = Math.round(fixHour(hours) * 60);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  if (use24) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const suffix = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const isoDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const parseIso = (value) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

function CompassRose({ bearing }) {
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  return (
    <svg viewBox="0 0 240 240" className="h-64 w-64" role="img" aria-label={`Qibla compass, bearing ${Math.round(bearing)} degrees`}>
      <circle cx="120" cy="120" r="108" fill="var(--muted)" stroke="var(--border)" strokeWidth="2" />
      <circle cx="120" cy="120" r="86" fill="none" stroke="var(--border)" strokeWidth="1" />
      {ticks.map((angle) => {
        const major = angle % 45 === 0;
        const len = major ? 12 : angle % 15 === 0 ? 7 : 4;
        const r1 = 108;
        const r2 = 108 - len;
        return (
          <line
            key={angle}
            x1={120 + r1 * sin(angle)}
            y1={120 - r1 * cos(angle)}
            x2={120 + r2 * sin(angle)}
            y2={120 - r2 * cos(angle)}
            stroke={major ? "var(--foreground)" : "var(--muted-foreground)"}
            strokeWidth={major ? 2 : 1}
            opacity={major ? 0.9 : 0.45}
          />
        );
      })}
      {[
        ["N", 0], ["E", 90], ["S", 180], ["W", 270],
      ].map(([label, angle]) => (
        <text
          key={label}
          x={120 + 72 * sin(angle)}
          y={120 - 72 * cos(angle) + 5}
          textAnchor="middle"
          fontSize="15"
          fontWeight="700"
          fill={label === "N" ? "var(--primary)" : "var(--muted-foreground)"}
        >
          {label}
        </text>
      ))}
      <g transform={`rotate(${bearing} 120 120)`}>
        <line x1="120" y1="120" x2="120" y2="34" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
        <polygon points="120,24 112,44 128,44" fill="var(--primary)" />
        <line x1="120" y1="120" x2="120" y2="176" stroke="var(--muted-foreground)" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
        <rect x="112" y="14" width="16" height="16" rx="2" fill="var(--primary)" opacity="0.25" />
      </g>
      <circle cx="120" cy="120" r="6" fill="var(--primary)" />
      <text x="120" y="212" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--foreground)">
        {Math.round(bearing)}° {compassWord(bearing)}
      </text>
    </svg>
  );
}

function DayStrip({ times, nowHours, use24 }) {
  const marks = [
    { id: "fajr", label: "Fajr" },
    { id: "sunrise", label: "Sunrise" },
    { id: "dhuhr", label: "Dhuhr" },
    { id: "asr", label: "Asr" },
    { id: "maghrib", label: "Maghrib" },
    { id: "isha", label: "Isha" },
  ].filter((mark) => Number.isFinite(times[mark.id]));

  return (
    <div>
      <div className="relative h-14 w-full overflow-hidden rounded-md border border-[var(--border)] bg-[var(--muted)]">
        {Number.isFinite(times.sunrise) && Number.isFinite(times.sunset) && (
          <div
            className="absolute inset-y-0 bg-[var(--primary)] opacity-15"
            style={{
              left: `${(fixHour(times.sunrise) / 24) * 100}%`,
              width: `${((fixHour(times.sunset) - fixHour(times.sunrise)) / 24) * 100}%`,
            }}
          />
        )}
        {marks.map((mark) => (
          <div
            key={mark.id}
            className="absolute inset-y-0 w-0.5 bg-[var(--primary)]"
            style={{ left: `${(fixHour(times[mark.id]) / 24) * 100}%` }}
            title={`${mark.label} ${hhmm(times[mark.id], use24)}`}
          />
        ))}
        {nowHours !== null && (
          <div
            className="absolute inset-y-0 w-0.5"
            style={{ left: `${(fixHour(nowHours) / 24) * 100}%`, background: "var(--anslation-ds-danger)" }}
            title="Now"
          />
        )}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-[var(--muted-foreground)]">
        {["00:00", "06:00", "12:00", "18:00", "24:00"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [cityId, setCityId] = useState("delhi");
  const [coords, setCoords] = useState(null);
  const [methodId, setMethodId] = useState("mwl");
  const [madhab, setMadhab] = useState("shafi");
  const [highLatRule, setHighLatRule] = useState("anglebased");
  const [use24, setUse24] = useState(true);
  const [dateValue, setDateValue] = useState(() => isoDate(new Date()));
  const [search, setSearch] = useState("");
  const [geoState, setGeoState] = useState("idle");
  const [geoError, setGeoError] = useState("");
  const [now, setNow] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.cityId && CITIES.some((city) => city.id === saved.cityId)) setCityId(saved.cityId);
        if (saved.coords && typeof saved.coords.lat === "number") setCoords(saved.coords);
        if (saved.methodId && METHODS.some((method) => method.id === saved.methodId)) setMethodId(saved.methodId);
        if (saved.madhab === "shafi" || saved.madhab === "hanafi") setMadhab(saved.madhab);
        if (saved.highLatRule && HIGH_LAT_RULES.some((rule) => rule.id === saved.highLatRule)) {
          setHighLatRule(saved.highLatRule);
        }
        if (typeof saved.use24 === "boolean") setUse24(saved.use24);
      }
    } catch {
      /* storage unavailable */
    }
    setNow(new Date());
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const persist = (patch) => {
    try {
      const current = { cityId, coords, methodId, madhab, highLatRule, use24 };
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ ...current, ...patch }));
    } catch {
      /* storage unavailable */
    }
  };

  const place = useMemo(() => {
    if (coords) {
      return {
        id: "custom",
        name: "My location",
        region: `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°`,
        lat: coords.lat,
        lng: coords.lng,
        tz: coords.tz,
      };
    }
    return CITIES.find((city) => city.id === cityId) || CITIES[0];
  }, [coords, cityId]);

  const method = useMemo(() => METHODS.find((item) => item.id === methodId) || METHODS[0], [methodId]);
  const asrFactor = madhab === "hanafi" ? 2 : 1;
  const selectedDate = useMemo(() => parseIso(dateValue), [dateValue]);

  const tzOffset = useMemo(() => tzOffsetHours(place.tz, selectedDate), [place.tz, selectedDate]);

  const times = useMemo(
    () =>
      computeTimes({
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1,
        day: selectedDate.getDate(),
        lat: place.lat,
        lng: place.lng,
        tz: tzOffset,
        method,
        asrFactor,
        highLatRule,
      }),
    [selectedDate, place, tzOffset, method, asrFactor, highLatRule]
  );

  const bearing = useMemo(() => qiblaBearing(place.lat, place.lng), [place]);
  const distance = useMemo(() => greatCircleKm(place.lat, place.lng), [place]);

  const nowHours = useMemo(() => {
    if (!now) return null;
    const localOffset = tzOffsetHours(place.tz, now);
    return fixHour(now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600 + localOffset);
  }, [now, place.tz]);

  const isToday = useMemo(() => (now ? isoDate(now) === dateValue : false), [now, dateValue]);

  const nextPrayer = useMemo(() => {
    if (nowHours === null || !isToday) return null;
    const list = PRAYER_META.map((meta) => ({ ...meta, at: times[meta.id] })).filter((item) =>
      Number.isFinite(item.at)
    );
    if (list.length === 0) return null;
    const upcoming = list.find((item) => item.at > nowHours);
    const target = upcoming || { ...list[0], at: list[0].at + 24 };
    return { ...target, in: target.at - nowHours };
  }, [nowHours, isToday, times]);

  const monthRows = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      const rowDate = new Date(year, month, day);
      const rowTz = tzOffsetHours(place.tz, rowDate);
      const rowTimes = computeTimes({
        year,
        month: month + 1,
        day,
        lat: place.lat,
        lng: place.lng,
        tz: rowTz,
        method,
        asrFactor,
        highLatRule,
      });
      return { day, date: rowDate, times: rowTimes };
    });
  }, [selectedDate, place, method, asrFactor, highLatRule]);

  const filteredCities = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return CITIES;
    return CITIES.filter(
      (city) => city.name.toLowerCase().includes(query) || city.region.toLowerCase().includes(query)
    );
  }, [search]);

  const useMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("error");
      setGeoError("This browser does not expose a geolocation API.");
      return;
    }
    setGeoState("asking");
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        };
        setCoords(next);
        setGeoState("ok");
        persist({ coords: next });
      },
      (error) => {
        setGeoState("error");
        setGeoError(
          error.code === 1
            ? "Permission denied. Pick a city from the list instead — the results are identical."
            : "Could not read your location. Pick a city from the list instead."
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  };

  const countdown = () => {
    if (!nextPrayer) return "--:--:--";
    const totalSeconds = Math.max(0, Math.round(nextPrayer.in * 3600));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const summary = useMemo(
    () =>
      [
        `Prayer times — ${place.name}${place.region ? `, ${place.region}` : ""}`,
        `Date: ${selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
        `Method: ${method.name} · Asr: ${madhab === "hanafi" ? "Hanafi" : "Shafi"}`,
        "",
        ...PRAYER_META.map((meta) => `${meta.name.padEnd(8)} ${hhmm(times[meta.id], use24)}`),
        "",
        `Sunrise  ${hhmm(times.sunrise, use24)}`,
        `Midnight ${hhmm(times.midnight, use24)}`,
        "",
        `Qibla: ${Math.round(bearing)}° (${compassWord(bearing)}) from true north · ${Math.round(distance).toLocaleString("en-IN")} km to Mecca`,
        "",
        "Computed offline with standard solar equations. Verify locally before relying on it.",
      ].join("\n"),
    [place, selectedDate, method, madhab, times, use24, bearing, distance]
  );

  const copySummary = async () => {
    const ok = await safeCopyText(summary);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const polarNote = !Number.isFinite(times.sunrise) || !Number.isFinite(times.sunset);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Compass className="h-4 w-4" />
            Offline &middot; no network
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Prayer Times &amp; Qibla Direction</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            The five daily prayer times and the Qibla bearing for any city, worked out on your device from the standard
            solar equations — solar declination, the equation of time and hour angles. Nothing is fetched and nothing is
            sent anywhere.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[360px_1fr]">
          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4 text-[var(--primary)]" />
                  Location
                </p>
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-xs"
                  disabled={geoState === "asking"}
                >
                  <LocateFixed className="h-4 w-4" />
                  {geoState === "asking" ? "Asking…" : "Use my location"}
                </button>
              </div>

              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                Your browser asks before sharing coordinates, and they never leave this page.
              </p>

              {geoState === "error" && (
                <p
                  className="mt-3 rounded-md border px-3 py-2 text-xs leading-5"
                  style={{ borderColor: "var(--anslation-ds-danger)", color: "var(--anslation-ds-danger)" }}
                  role="alert"
                >
                  {geoError}
                </p>
              )}

              {coords && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md bg-[var(--muted)] px-3 py-2">
                  <span className="text-xs font-semibold">
                    Using {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCoords(null);
                      setGeoState("idle");
                      persist({ coords: null });
                    }}
                    className="text-xs font-semibold text-[var(--primary)]"
                  >
                    Use city list
                  </button>
                </div>
              )}

              <label className="mt-4 block">
                <span className="text-sm font-semibold">Search cities</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Delhi, Dubai, London…"
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>

              <div className="mt-3 max-h-64 overflow-y-auto rounded-md border border-[var(--border)]">
                {filteredCities.length === 0 ? (
                  <p className="p-3 text-xs text-[var(--muted-foreground)]">No city matches that search.</p>
                ) : (
                  filteredCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        setCityId(city.id);
                        setCoords(null);
                        setGeoState("idle");
                        persist({ cityId: city.id, coords: null });
                      }}
                      className={`flex w-full items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2 text-left text-sm transition last:border-b-0 ${
                        !coords && cityId === city.id
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "hover:bg-[var(--muted)]"
                      }`}
                    >
                      <span className="font-semibold">{city.name}</span>
                      <span className="text-xs opacity-70">{city.region}</span>
                    </button>
                  ))
                )}
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-semibold">Date</span>
                <input
                  type="date"
                  value={dateValue}
                  onChange={(event) => setDateValue(event.target.value || isoDate(new Date()))}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              {!isToday && now && (
                <button
                  type="button"
                  onClick={() => setDateValue(isoDate(new Date()))}
                  className="mt-2 text-xs font-semibold text-[var(--primary)]"
                >
                  Back to today
                </button>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <button
                type="button"
                onClick={() => setShowSettings((value) => !value)}
                className="flex w-full items-center justify-between gap-3"
              >
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <Settings className="h-4 w-4 text-[var(--primary)]" />
                  Calculation settings
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">{showSettings ? "Hide" : "Show"}</span>
              </button>

              <div className="mt-3 grid gap-1.5 text-xs text-[var(--muted-foreground)]">
                <p>
                  {method.short} &middot; Asr {madhab === "hanafi" ? "Hanafi" : "Shafi"} &middot;{" "}
                  {use24 ? "24-hour" : "12-hour"}
                </p>
              </div>

              {showSettings && (
                <div className="mt-4 grid gap-4">
                  <div>
                    <p className="mb-2 text-sm font-semibold">Calculation convention</p>
                    <div className="grid gap-2">
                      {METHODS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setMethodId(item.id);
                            persist({ methodId: item.id });
                          }}
                          className={`rounded-md border px-3 py-2.5 text-left text-sm transition ${
                            methodId === item.id
                              ? "border-[var(--primary)] bg-[var(--muted)]"
                              : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                          }`}
                        >
                          <span className="block font-semibold">{item.name}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                            {item.note}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold">Asr madhab</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "shafi", label: "Shafi", hint: "Shadow = 1× object" },
                        { id: "hanafi", label: "Hanafi", hint: "Shadow = 2× object" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setMadhab(item.id);
                            persist({ madhab: item.id });
                          }}
                          className={`rounded-md border px-3 py-2.5 text-left text-sm transition ${
                            madhab === item.id
                              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                          }`}
                        >
                          <span className="block font-semibold">{item.label}</span>
                          <span className="mt-0.5 block text-xs opacity-80">{item.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold">High-latitude rule</p>
                    <select
                      value={highLatRule}
                      onChange={(event) => {
                        setHighLatRule(event.target.value);
                        persist({ highLatRule: event.target.value });
                      }}
                      aria-label="High latitude rule"
                      className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    >
                      {HIGH_LAT_RULES.map((rule) => (
                        <option key={rule.id} value={rule.id}>
                          {rule.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                      {HIGH_LAT_RULES.find((rule) => rule.id === highLatRule)?.note}
                    </p>
                  </div>

                  <label className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">24-hour clock</span>
                    <input
                      type="checkbox"
                      checked={use24}
                      onChange={(event) => {
                        setUse24(event.target.checked);
                        persist({ use24: event.target.checked });
                      }}
                      className="h-5 w-5 accent-[var(--primary)]"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">
                    {place.name}
                    {place.region && !coords ? `, ${place.region}` : ""}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {selectedDate.toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    &middot; UTC{tzOffset >= 0 ? "+" : ""}
                    {tzOffset}
                  </p>
                </div>
                <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy times"}
                </button>
              </div>

              {nextPrayer && (
                <div className="mt-5 flex flex-wrap items-center gap-4 rounded-lg bg-[var(--muted)] p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Next prayer</p>
                    <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">{nextPrayer.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      at {hhmm(nextPrayer.at, use24)}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Time remaining</p>
                    <p className="mt-1 text-3xl font-semibold tabular-nums" aria-live="polite">
                      {countdown()}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-5 grid gap-2.5 sm:grid-cols-2 2xl:grid-cols-5">
                {PRAYER_META.map((meta) => {
                  const isNext = nextPrayer?.id === meta.id;
                  return (
                    <div
                      key={meta.id}
                      className={`rounded-md border p-4 transition ${
                        isNext
                          ? "border-[var(--primary)] bg-[var(--muted)]"
                          : "border-[var(--border)] bg-[var(--background)]"
                      }`}
                    >
                      <p className={`text-xs font-semibold uppercase ${isNext ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}>
                        {meta.name}
                      </p>
                      <p className="mt-1 text-xl font-semibold tabular-nums">{hhmm(times[meta.id], use24)}</p>
                      <p className="mt-1.5 text-[11px] leading-4 text-[var(--muted-foreground)]">{meta.meaning}</p>
                    </div>
                  );
                })}
              </div>

              <div className="tool-compact-grid mt-4">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                    <Sunrise className="h-3.5 w-3.5" />
                    Sunrise
                  </p>
                  <p className="mt-1 font-semibold tabular-nums">{hhmm(times.sunrise, use24)}</p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                    <Moon className="h-3.5 w-3.5" />
                    Islamic midnight
                  </p>
                  <p className="mt-1 font-semibold tabular-nums">{hhmm(times.midnight, use24)}</p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Day length</p>
                  <p className="mt-1 font-semibold tabular-nums">
                    {Number.isFinite(times.sunrise) && Number.isFinite(times.sunset)
                      ? `${Math.floor(timeDiff(times.sunrise, times.sunset))}h ${Math.round(
                          (timeDiff(times.sunrise, times.sunset) % 1) * 60
                        )}m`
                      : "--"}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Day timeline</p>
                <DayStrip times={times} nowHours={isToday ? nowHours : null} use24={use24} />
              </div>

              {times.adjusted && (
                <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  <Info className="mr-1.5 inline h-3.5 w-3.5 align-[-2px] text-[var(--primary)]" />
                  At this latitude and date the sun never dips to the {method.short} twilight angle, so Fajr and/or Isha
                  were estimated using the <strong className="text-[var(--foreground)]">{HIGH_LAT_RULES.find((rule) => rule.id === highLatRule)?.name}</strong> rule.
                  Local mosques may follow a different convention.
                </p>
              )}

              {polarNote && (
                <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  <Info className="mr-1.5 inline h-3.5 w-3.5 align-[-2px] text-[var(--primary)]" />
                  The sun does not rise or set at this location on this date (midnight sun or polar night), so
                  sunrise-based times are undefined. Follow the timings of the nearest practising community.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
                <Navigation className="h-5 w-5 text-[var(--primary)]" />
                Qibla direction
              </h2>
              <div className="mt-5 flex flex-wrap items-center gap-8">
                <CompassRose bearing={bearing} />
                <div className="min-w-[240px] flex-1">
                  <p className="text-4xl font-semibold text-[var(--primary)]">
                    {Math.round(bearing)}° &mdash; {compassWord(bearing)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    From {place.name}, face {COMPASS_LONG[compassWord(bearing)]} — {bearing.toFixed(2)}° measured
                    clockwise from <strong className="text-[var(--foreground)]">true north</strong>.
                  </p>
                  <div className="tool-compact-grid mt-4">
                    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                      <p className="text-xs text-[var(--muted-foreground)]">Distance to Mecca</p>
                      <p className="mt-1 font-semibold">
                        {Math.round(distance).toLocaleString("en-IN")} km
                      </p>
                    </div>
                    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                      <p className="text-xs text-[var(--muted-foreground)]">Your coordinates</p>
                      <p className="mt-1 font-semibold tabular-nums">
                        {place.lat.toFixed(2)}°, {place.lng.toFixed(2)}°
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-6 text-[var(--muted-foreground)]">
                    Formula: bearing = atan2( sin(Δλ), cos(φ₁)·tan(φ₂) − sin(φ₁)·cos(Δλ) ) — the initial great-circle
                    heading from your position (φ₁, λ₁) to the Kaaba at 21.4225°N, 39.8262°E.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--muted)] p-4">
                <p className="text-xs leading-6 text-[var(--muted-foreground)]">
                  <strong className="text-[var(--foreground)]">This bearing is from true north, not magnetic north.</strong>{" "}
                  A phone or handheld compass points to magnetic north, which differs from true north by the local
                  magnetic declination — anywhere from under a degree in much of India to more than 15° in parts of
                  North America and the far north. Add the local declination (east positive) to convert. Phone
                  compasses also drift near metal, speakers, cars and magnets, so calibrate with a figure-of-eight
                  motion first and cross-check outdoors.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              Monthly timetable &mdash;{" "}
              {selectedDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              {place.name} &middot; {method.short} &middot; Asr {madhab === "hanafi" ? "Hanafi" : "Shafi"}
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  {["Date", "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"].map((head) => (
                    <th key={head} className="px-3 py-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthRows.map((row) => {
                  const highlight = row.day === selectedDate.getDate();
                  return (
                    <tr
                      key={row.day}
                      className={`border-b border-[var(--border)] last:border-b-0 ${
                        highlight ? "bg-[var(--muted)] font-semibold" : ""
                      }`}
                    >
                      <td className="px-3 py-2">
                        {row.day}{" "}
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {row.date.toLocaleDateString("en-IN", { weekday: "short" })}
                        </span>
                      </td>
                      {["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"].map((key) => (
                        <td key={key} className="px-3 py-2 tabular-nums">
                          {hhmm(row.times[key], use24)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-sm font-semibold">How these times are worked out</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              For your date the tool computes the sun&apos;s declination and the equation of time from its mean anomaly
              and ecliptic longitude, then solves the hour angle for each event. Sunrise and sunset use a standard
              0.833° depression that allows for refraction and the sun&apos;s radius. Fajr and Isha use the twilight
              angle of the convention you pick. Asr is the moment an object&apos;s shadow reaches its own length
              ({madhab === "hanafi" ? "twice" : "once"}) plus its noon shadow. Dhuhr is solar noon plus one minute.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-sm font-semibold">Accuracy and local practice</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Computed sunrise and sunset agree with high-precision ephemeris software to within a few seconds, but
              prayer timetables are a matter of local convention as much as astronomy. Mosques round times, add safety
              margins, and may follow a different convention or madhab from the one selected here. Treat this as a
              reliable reference and follow your local mosque where they differ.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
