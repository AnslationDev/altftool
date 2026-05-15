"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Astronomy from "astronomy-engine";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle,
  Clipboard,
  Compass,
  Copy,
  Crosshair,
  Download,
  FileJson,
  Gauge,
  Grid3X3,
  Loader2,
  MapPin,
  Moon,
  Orbit,
  Printer,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Sun,
  XCircle,
} from "lucide-react";

const SIGNS = [
  { sanskrit: "Mesha", english: "Aries", short: "Ar", lord: "Mars", element: "Fire", modality: "Movable" },
  { sanskrit: "Vrishabha", english: "Taurus", short: "Ta", lord: "Venus", element: "Earth", modality: "Fixed" },
  { sanskrit: "Mithuna", english: "Gemini", short: "Ge", lord: "Mercury", element: "Air", modality: "Dual" },
  { sanskrit: "Karka", english: "Cancer", short: "Cn", lord: "Moon", element: "Water", modality: "Movable" },
  { sanskrit: "Simha", english: "Leo", short: "Le", lord: "Sun", element: "Fire", modality: "Fixed" },
  { sanskrit: "Kanya", english: "Virgo", short: "Vi", lord: "Mercury", element: "Earth", modality: "Dual" },
  { sanskrit: "Tula", english: "Libra", short: "Li", lord: "Venus", element: "Air", modality: "Movable" },
  { sanskrit: "Vrishchika", english: "Scorpio", short: "Sc", lord: "Mars", element: "Water", modality: "Fixed" },
  { sanskrit: "Dhanu", english: "Sagittarius", short: "Sg", lord: "Jupiter", element: "Fire", modality: "Dual" },
  { sanskrit: "Makara", english: "Capricorn", short: "Cp", lord: "Saturn", element: "Earth", modality: "Movable" },
  { sanskrit: "Kumbha", english: "Aquarius", short: "Aq", lord: "Saturn", element: "Air", modality: "Fixed" },
  { sanskrit: "Meena", english: "Pisces", short: "Pi", lord: "Jupiter", element: "Water", modality: "Dual" },
];

const NAKSHATRAS = [
  ["Ashwini", "Ketu"],
  ["Bharani", "Venus"],
  ["Krittika", "Sun"],
  ["Rohini", "Moon"],
  ["Mrigashira", "Mars"],
  ["Ardra", "Rahu"],
  ["Punarvasu", "Jupiter"],
  ["Pushya", "Saturn"],
  ["Ashlesha", "Mercury"],
  ["Magha", "Ketu"],
  ["Purva Phalguni", "Venus"],
  ["Uttara Phalguni", "Sun"],
  ["Hasta", "Moon"],
  ["Chitra", "Mars"],
  ["Swati", "Rahu"],
  ["Vishakha", "Jupiter"],
  ["Anuradha", "Saturn"],
  ["Jyeshtha", "Mercury"],
  ["Mula", "Ketu"],
  ["Purva Ashadha", "Venus"],
  ["Uttara Ashadha", "Sun"],
  ["Shravana", "Moon"],
  ["Dhanishta", "Mars"],
  ["Shatabhisha", "Rahu"],
  ["Purva Bhadrapada", "Jupiter"],
  ["Uttara Bhadrapada", "Saturn"],
  ["Revati", "Mercury"],
].map(([name, lord], index) => ({ name, lord, index }));

const DASHA_SEQUENCE = [
  ["Ketu", 7],
  ["Venus", 20],
  ["Sun", 6],
  ["Moon", 10],
  ["Mars", 7],
  ["Rahu", 18],
  ["Jupiter", 16],
  ["Saturn", 19],
  ["Mercury", 17],
].map(([lord, years]) => ({ lord, years }));

const PLANET_DEFS = [
  { key: "Sun", label: "Sun", body: Astronomy.Body.Sun, code: "Su", nature: "Soul, authority, vitality" },
  { key: "Moon", label: "Moon", body: Astronomy.Body.Moon, code: "Mo", nature: "Mind, emotions, comfort" },
  { key: "Mars", label: "Mars", body: Astronomy.Body.Mars, code: "Ma", nature: "Courage, energy, action" },
  { key: "Mercury", label: "Mercury", body: Astronomy.Body.Mercury, code: "Me", nature: "Speech, logic, trade" },
  { key: "Jupiter", label: "Jupiter", body: Astronomy.Body.Jupiter, code: "Ju", nature: "Wisdom, growth, dharma" },
  { key: "Venus", label: "Venus", body: Astronomy.Body.Venus, code: "Ve", nature: "Art, comfort, relationships" },
  { key: "Saturn", label: "Saturn", body: Astronomy.Body.Saturn, code: "Sa", nature: "Discipline, duty, endurance" },
];

const TITHI_NAMES = [
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Purnima",
];

const YOGA_NAMES = [
  "Vishkambha",
  "Priti",
  "Ayushman",
  "Saubhagya",
  "Shobhana",
  "Atiganda",
  "Sukarma",
  "Dhriti",
  "Shoola",
  "Ganda",
  "Vriddhi",
  "Dhruva",
  "Vyaghata",
  "Harshana",
  "Vajra",
  "Siddhi",
  "Vyatipata",
  "Variyana",
  "Parigha",
  "Shiva",
  "Siddha",
  "Sadhya",
  "Shubha",
  "Shukla",
  "Brahma",
  "Indra",
  "Vaidhriti",
];

const KARANA_NAMES = [
  "Bava",
  "Balava",
  "Kaulava",
  "Taitila",
  "Gara",
  "Vanija",
  "Vishti",
  "Shakuni",
  "Chatushpada",
  "Naga",
  "Kimstughna",
];

const TIMEZONE_PRESETS = [
  { label: "IST +5:30", value: 5.5 },
  { label: "UTC +0", value: 0 },
  { label: "GST +4", value: 4 },
  { label: "CET +1", value: 1 },
  { label: "EST -5", value: -5 },
  { label: "PST -8", value: -8 },
];

const AYANAMSA_OPTIONS = {
  lahiri: { label: "Lahiri", offset: 0 },
  krishnamurti: { label: "Krishnamurti", offset: -0.1 },
  raman: { label: "Raman", offset: -1.45 },
};

const DEFAULT_FORM = {
  name: "Sample Native",
  birthDate: "1998-08-15",
  birthTime: "10:30",
  place: "New Delhi, India",
  latitude: "28.6139",
  longitude: "77.2090",
  timezoneOffset: "5.5",
  ayanamsa: "lahiri",
};

const CHART_LAYOUT = [
  [12, 1, 2, 3],
  [11, null, null, 4],
  [10, null, null, 5],
  [9, 8, 7, 6],
];

const REVEAL_STEPS = [
  "Calculating lagna",
  "Reading Moon nakshatra",
  "Mapping planetary houses",
  "Preparing dasha timeline",
];

function normalizeAngle(value) {
  return ((value % 360) + 360) % 360;
}

function angleDelta(from, to) {
  return ((to - from + 540) % 360) - 180;
}

function degToRad(value) {
  return (value * Math.PI) / 180;
}

function radToDeg(value) {
  return (value * 180) / Math.PI;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parseNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getJulianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function getAyanamsa(date, mode) {
  const yearLength = 365.2425;
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);
  const decimalYear =
    date.getUTCFullYear() + (date.getTime() - startOfYear) / 86400000 / yearLength;
  const lahiri = 23.85675 + (decimalYear - 2000) * 0.013968;
  return lahiri + (AYANAMSA_OPTIONS[mode]?.offset || 0);
}

function getSignInfo(longitude) {
  const normalized = normalizeAngle(longitude);
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized - signIndex * 30;
  return {
    signIndex,
    sign: SIGNS[signIndex],
    degreeInSign,
  };
}

function getNakshatra(longitude) {
  const span = 360 / 27;
  const padaSpan = span / 4;
  const normalized = normalizeAngle(longitude);
  const index = Math.floor(normalized / span);
  const degreeInNakshatra = normalized - index * span;
  return {
    ...NAKSHATRAS[index],
    degreeInNakshatra,
    pada: Math.floor(degreeInNakshatra / padaSpan) + 1,
    remainingFraction: 1 - degreeInNakshatra / span,
  };
}

function formatDegree(value) {
  const normalized = normalizeAngle(value);
  const degrees = Math.floor(normalized);
  const minutes = Math.floor((normalized - degrees) * 60);
  const seconds = Math.round((((normalized - degrees) * 60) - minutes) * 60);
  return `${degrees}d ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

function formatSignDegree(longitude) {
  const info = getSignInfo(longitude);
  return `${formatDegree(info.degreeInSign)} ${info.sign.short}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function buildUtcDate({ birthDate, birthTime, timezoneOffset }) {
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);
  const offset = Number(timezoneOffset);

  if (![year, month, day, hour, minute, offset].every(Number.isFinite)) {
    throw new Error("Please enter a valid date, time, and timezone offset.");
  }

  return new Date(Date.UTC(year, month - 1, day, hour, minute) - offset * 60 * 60 * 1000);
}

function getGeoEclipticLongitude(body, time) {
  if (body === Astronomy.Body.Moon) {
    return Astronomy.EclipticGeoMoon(time).lon;
  }

  const vector = Astronomy.GeoVector(body, time, true);
  return Astronomy.Ecliptic(vector).elon;
}

function getSiderealLongitude(body, time, ayanamsa) {
  return normalizeAngle(getGeoEclipticLongitude(body, time) - ayanamsa);
}

function getMeanNodeLongitude(date, ayanamsa) {
  const t = (getJulianDay(date) - 2451545.0) / 36525;
  const tropicalNode =
    125.04452 - 1934.136261 * t + 0.0020708 * t * t + (t * t * t) / 450000;
  return normalizeAngle(tropicalNode - ayanamsa);
}

function getAscendant(time, latitude, longitude, ayanamsa) {
  const localSidereal = normalizeAngle(Astronomy.SiderealTime(time) * 15 + longitude);
  const epsilon = degToRad(23.439291);
  const theta = degToRad(localSidereal);
  const phi = degToRad(clamp(latitude, -66.5, 66.5));
  const ascTropical = normalizeAngle(
    radToDeg(
      Math.atan2(
        -Math.cos(theta),
        Math.sin(theta) * Math.cos(epsilon) + Math.tan(phi) * Math.sin(epsilon),
      ),
    ),
  );

  return normalizeAngle(ascTropical - ayanamsa);
}

function createPlanetPosition(definition, time, ayanamsa, ascSignIndex) {
  const longitude = getSiderealLongitude(definition.body, time, ayanamsa);
  const before = getSiderealLongitude(definition.body, time.AddDays(-0.5), ayanamsa);
  const after = getSiderealLongitude(definition.body, time.AddDays(0.5), ayanamsa);
  const signInfo = getSignInfo(longitude);
  const nakshatra = getNakshatra(longitude);

  return {
    ...definition,
    longitude,
    signIndex: signInfo.signIndex,
    sign: signInfo.sign,
    degreeInSign: signInfo.degreeInSign,
    nakshatra,
    house: ((signInfo.signIndex - ascSignIndex + 12) % 12) + 1,
    retrograde: angleDelta(before, after) < 0,
  };
}

function createNodePosition(label, code, longitude, ascSignIndex) {
  const signInfo = getSignInfo(longitude);
  return {
    key: label,
    label,
    code,
    nature: label === "Rahu" ? "Desire, amplification, unusual paths" : "Release, insight, past patterns",
    longitude,
    signIndex: signInfo.signIndex,
    sign: signInfo.sign,
    degreeInSign: signInfo.degreeInSign,
    nakshatra: getNakshatra(longitude),
    house: ((signInfo.signIndex - ascSignIndex + 12) % 12) + 1,
    retrograde: true,
  };
}

function createDashaTimeline(moonNakshatra, birthUtc) {
  const startIndex = DASHA_SEQUENCE.findIndex((item) => item.lord === moonNakshatra.lord);
  const ordered = [
    ...DASHA_SEQUENCE.slice(startIndex),
    ...DASHA_SEQUENCE.slice(0, startIndex),
    ...DASHA_SEQUENCE.slice(startIndex),
  ];

  let currentStart = new Date(birthUtc);
  const timeline = [];

  ordered.slice(0, 9).forEach((period, index) => {
    const years = index === 0 ? period.years * moonNakshatra.remainingFraction : period.years;
    const end = new Date(currentStart.getTime() + years * 365.2425 * 24 * 60 * 60 * 1000);

    timeline.push({
      lord: period.lord,
      years,
      start: currentStart,
      end,
      balance: index === 0,
    });

    currentStart = end;
  });

  return timeline;
}

function createPanchang(sunLongitude, moonLongitude) {
  const moonSunDistance = normalizeAngle(moonLongitude - sunLongitude);
  const tithiNumber = Math.floor(moonSunDistance / 12) + 1;
  const paksha = tithiNumber <= 15 ? "Shukla" : "Krishna";
  const tithiName =
    tithiNumber === 30
      ? "Amavasya"
      : TITHI_NAMES[(tithiNumber - 1) % 15];
  const yogaIndex = Math.floor(normalizeAngle(sunLongitude + moonLongitude) / (360 / 27));
  const karanaIndex = Math.floor(moonSunDistance / 6);

  return {
    tithi: `${paksha} ${tithiName}`,
    tithiNumber,
    paksha,
    yoga: YOGA_NAMES[yogaIndex],
    karana: KARANA_NAMES[karanaIndex % KARANA_NAMES.length],
    moonSunDistance,
  };
}

function calculateKundli(form) {
  const latitude = parseNumber(form.latitude);
  const longitude = parseNumber(form.longitude);

  if (latitude === null || longitude === null) {
    throw new Error("Latitude and longitude are required for lagna and houses.");
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error("Latitude must be between -90 and 90, longitude between -180 and 180.");
  }

  const birthUtc = buildUtcDate(form);
  const time = Astronomy.MakeTime(birthUtc);
  const ayanamsa = getAyanamsa(birthUtc, form.ayanamsa);
  const ascendantLongitude = getAscendant(time, latitude, longitude, ayanamsa);
  const ascSignInfo = getSignInfo(ascendantLongitude);
  const rahuLongitude = getMeanNodeLongitude(birthUtc, ayanamsa);
  const ketuLongitude = normalizeAngle(rahuLongitude + 180);

  const planets = [
    ...PLANET_DEFS.map((definition) =>
      createPlanetPosition(definition, time, ayanamsa, ascSignInfo.signIndex),
    ),
    createNodePosition("Rahu", "Ra", rahuLongitude, ascSignInfo.signIndex),
    createNodePosition("Ketu", "Ke", ketuLongitude, ascSignInfo.signIndex),
  ];

  const moon = planets.find((planet) => planet.key === "Moon");
  const sun = planets.find((planet) => planet.key === "Sun");
  const dashaTimeline = createDashaTimeline(moon.nakshatra, birthUtc);
  const panchang = createPanchang(sun.longitude, moon.longitude);
  const houseSigns = Array.from({ length: 12 }, (_, index) => {
    const signIndex = (ascSignInfo.signIndex + index) % 12;
    return {
      house: index + 1,
      signIndex,
      sign: SIGNS[signIndex],
      planets: planets.filter((planet) => planet.house === index + 1),
    };
  });
  const atmakaraka = planets
    .filter((planet) => !["Rahu", "Ketu"].includes(planet.key))
    .sort((a, b) => b.degreeInSign - a.degreeInSign)[0];
  const elementCounts = planets.reduce((acc, planet) => {
    acc[planet.sign.element] = (acc[planet.sign.element] || 0) + 1;
    return acc;
  }, {});

  return {
    form: {
      ...form,
      latitude,
      longitude,
      timezoneOffset: Number(form.timezoneOffset),
    },
    birthUtc,
    ayanamsa,
    ascendant: {
      longitude: ascendantLongitude,
      ...ascSignInfo,
      nakshatra: getNakshatra(ascendantLongitude),
    },
    planets,
    houseSigns,
    moon,
    sun,
    panchang,
    dashaTimeline,
    atmakaraka,
    elementCounts,
  };
}

function buildSummary(result) {
  const lines = [
    `Kundli Summary: ${result.form.name || "Native"}`,
    `Birth: ${result.form.birthDate} ${result.form.birthTime}, UTC offset ${result.form.timezoneOffset}`,
    `Place: ${result.form.place || "Custom location"} (${result.form.latitude}, ${result.form.longitude})`,
    `Ayanamsa: ${AYANAMSA_OPTIONS[result.form.ayanamsa]?.label || "Lahiri"} (${result.ayanamsa.toFixed(4)} deg)`,
    `Lagna: ${result.ascendant.sign.sanskrit} (${result.ascendant.sign.english}) ${formatSignDegree(result.ascendant.longitude)}`,
    `Moon Sign: ${result.moon.sign.sanskrit} (${result.moon.sign.english})`,
    `Janma Nakshatra: ${result.moon.nakshatra.name} Pada ${result.moon.nakshatra.pada}, Lord ${result.moon.nakshatra.lord}`,
    `Panchang: ${result.panchang.tithi}, Yoga ${result.panchang.yoga}, Karana ${result.panchang.karana}`,
    `Current Mahadasha Balance: ${result.dashaTimeline[0].lord} until ${formatDate(result.dashaTimeline[0].end)}`,
    "",
    "Planet Positions:",
    ...result.planets.map(
      (planet) =>
        `${planet.label}: ${formatSignDegree(planet.longitude)}, House ${planet.house}, ${planet.nakshatra.name} Pada ${planet.nakshatra.pada}${planet.retrograde ? " Rx" : ""}`,
    ),
  ];

  return lines.join("\n");
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-lg border border-(--border) bg-(--card) p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
            {label}
          </p>
          <p className="mt-1 font-semibold text-(--foreground)">{value}</p>
          {detail && <p className="mt-1 text-sm text-(--muted-foreground)">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-(--foreground)">{label}</span>
      {children}
    </label>
  );
}

export default function MainComponent() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(1);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const [locationResults, setLocationResults] = useState([]);
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTimerRef = useRef(null);

  const updateForm = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const clearGenerateTimer = () => {
    if (generateTimerRef.current) {
      window.clearTimeout(generateTimerRef.current);
      generateTimerRef.current = null;
    }
  };

  const generateChart = ({ nextForm = form, reveal = true } = {}) => {
    try {
      const nextResult = calculateKundli(nextForm);
      clearGenerateTimer();
      setSelectedHouse(1);
      setError("");

      if (!reveal) {
        setResult(nextResult);
        setIsGenerating(false);
        setStatus("Birth chart generated.");
        return;
      }

      setResult(null);
      setIsGenerating(true);
      setStatus("Preparing your birth chart...");
      generateTimerRef.current = window.setTimeout(() => {
        setResult(nextResult);
        setSelectedHouse(1);
        setIsGenerating(false);
        setStatus("Birth chart revealed.");
        generateTimerRef.current = null;
      }, 1300);
    } catch (err) {
      clearGenerateTimer();
      setIsGenerating(false);
      setError(err.message || "Could not generate the chart. Check birth details and try again.");
      setStatus("");
    }
  };

  useEffect(() => {
    generateChart({ reveal: false });
    return () => clearGenerateTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedHouseData = useMemo(() => {
    if (!result) return null;
    return result.houseSigns.find((house) => house.house === selectedHouse);
  }, [result, selectedHouse]);

  const searchPlace = async () => {
    if (!form.place.trim()) return;
    setIsSearchingPlace(true);
    setError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
          form.place,
        )}`,
      );
      const data = await response.json();
      setLocationResults(Array.isArray(data) ? data : []);
      if (!data?.length) setStatus("No matching place found. Enter coordinates manually.");
    } catch {
      setError("Place lookup failed. You can still enter latitude and longitude manually.");
    } finally {
      setIsSearchingPlace(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateForm("latitude", position.coords.latitude.toFixed(5));
        updateForm("longitude", position.coords.longitude.toFixed(5));
        setStatus("Device coordinates added.");
      },
      () => setError("Could not access device location."),
      { enableHighAccuracy: true, timeout: 6000 },
    );
  };

  const applyLocation = (item) => {
    updateForm("place", item.display_name);
    updateForm("latitude", Number(item.lat).toFixed(5));
    updateForm("longitude", Number(item.lon).toFixed(5));
    setLocationResults([]);
    setStatus("Location coordinates added.");
  };

  const copySummary = async () => {
    if (!result) return;
    await navigator.clipboard?.writeText(buildSummary(result));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const exportJson = () => {
    if (!result) return;
    const payload = {
      ...result,
      birthUtc: result.birthUtc.toISOString(),
      dashaTimeline: result.dashaTimeline.map((item) => ({
        ...item,
        start: item.start.toISOString(),
        end: item.end.toISOString(),
      })),
    };
    downloadFile(
      JSON.stringify(payload, null, 2),
      `${(form.name || "kundli").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "kundli"}-birth-chart.json`,
      "application/json",
    );
  };

  const elementTotal = result
    ? Object.values(result.elementCounts).reduce((sum, count) => sum + count, 0)
    : 0;

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="heading">Kundli / Birth Chart Generator</h1>
        <p className="description mt-3">
          Create a Vedic-style birth chart with lagna, planetary placements,
          nakshatra, panchang, dasha balance, and export controls.
        </p>
      </div>

      <section className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-(--foreground)">Birth Details</h2>
              <p className="mt-1 text-sm text-(--muted-foreground)">
                Exact time and coordinates improve lagna and house accuracy.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {TIMEZONE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => updateForm("timezoneOffset", String(preset.value))}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  Number(form.timezoneOffset) === preset.value
                    ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                    : "border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary)"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tool-card-grid mt-6">
          <Field label="Name">
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none transition focus:border-(--primary)"
              placeholder="Native name"
            />
          </Field>

          <Field label="Birth Date">
            <input
              type="date"
              value={form.birthDate}
              onChange={(event) => updateForm("birthDate", event.target.value)}
              className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none transition focus:border-(--primary)"
            />
          </Field>

          <Field label="Birth Time">
            <input
              type="time"
              value={form.birthTime}
              onChange={(event) => updateForm("birthTime", event.target.value)}
              className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none transition focus:border-(--primary)"
            />
          </Field>

          <Field label="UTC Offset">
            <input
              type="number"
              step="0.25"
              value={form.timezoneOffset}
              onChange={(event) => updateForm("timezoneOffset", event.target.value)}
              className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none transition focus:border-(--primary)"
              placeholder="5.5"
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_180px_180px_180px]">
          <Field label="Birth Place">
            <div className="flex gap-2">
              <input
                type="text"
                value={form.place}
                onChange={(event) => updateForm("place", event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") searchPlace();
                }}
                className="min-w-0 flex-1 rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none transition focus:border-(--primary)"
                placeholder="City, country"
              />
              <button
                type="button"
                onClick={searchPlace}
                className="btn-secondary inline-flex items-center gap-2"
              >
                {isSearchingPlace ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Find
              </button>
            </div>
          </Field>

          <Field label="Latitude">
            <input
              type="number"
              step="0.0001"
              value={form.latitude}
              onChange={(event) => updateForm("latitude", event.target.value)}
              className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none transition focus:border-(--primary)"
            />
          </Field>

          <Field label="Longitude">
            <input
              type="number"
              step="0.0001"
              value={form.longitude}
              onChange={(event) => updateForm("longitude", event.target.value)}
              className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none transition focus:border-(--primary)"
            />
          </Field>

          <Field label="Ayanamsa">
            <select
              value={form.ayanamsa}
              onChange={(event) => updateForm("ayanamsa", event.target.value)}
              className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none transition focus:border-(--primary)"
            >
              {Object.entries(AYANAMSA_OPTIONS).map(([key, option]) => (
                <option key={key} value={key}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {!!locationResults.length && (
          <div className="mt-4 grid gap-2 rounded-lg border border-(--border) bg-(--background) p-3">
            {locationResults.map((item) => (
              <button
                key={`${item.place_id}-${item.lat}-${item.lon}`}
                type="button"
                onClick={() => applyLocation(item)}
                className="flex items-start gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-(--section-highlight)"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-(--primary)" />
                <span>
                  <span className="block text-sm font-medium text-(--foreground)">
                    {item.display_name}
                  </span>
                  <span className="mt-1 block text-xs text-(--muted-foreground)">
                    {Number(item.lat).toFixed(5)}, {Number(item.lon).toFixed(5)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={generateChart}
            disabled={isGenerating}
            className="btn-primary inline-flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? "Revealing Chart..." : "Generate Kundli"}
          </button>
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={isGenerating}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Crosshair className="h-4 w-4" />
            Use GPS
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(DEFAULT_FORM);
              setLocationResults([]);
              generateChart({ nextForm: DEFAULT_FORM });
            }}
            disabled={isGenerating}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Load Sample
          </button>
        </div>
      </section>

      {(error || status) && (
        <div
          className={`flex items-start gap-3 rounded-lg border p-4 ${
            error
              ? "border-red-500/40 bg-red-500/10 text-red-600"
              : "border-green-500/40 bg-green-500/10 text-green-700"
          }`}
        >
          {error ? (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p className="text-sm font-medium">{error || status}</p>
        </div>
      )}

      {isGenerating && (
        <section className="overflow-hidden rounded-lg border border-(--border) bg-(--section-highlight) p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row 2xl:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--primary) text-(--primary-foreground)">
                <Star className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-(--primary)">
                  Revealing Chart
                </p>
                <h2 className="mt-1 text-xl font-bold text-(--foreground)">
                  Aligning the birth details
                </h2>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  The chart will appear once lagna, nakshatra, houses, and dasha
                  are prepared.
                </p>
              </div>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2 2xl:w-[520px]">
              {REVEAL_STEPS.map((step, index) => (
                <div
                  key={step}
                  className="rounded-lg border border-(--border) bg-(--background) p-3"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-(--foreground)">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--primary) text-xs text-(--primary-foreground)">
                      {index + 1}
                    </span>
                    {step}
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-(--section-highlight)">
                    <div
                      className="h-full rounded-full bg-(--primary)"
                      style={{
                        width: `${42 + index * 16}%`,
                        animation: `pulse 1s ease-in-out ${index * 120}ms infinite alternate`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {result && (
        <>
          <div className="tool-card-grid">
            <StatCard
              icon={Compass}
              label="Lagna"
              value={`${result.ascendant.sign.sanskrit} (${result.ascendant.sign.english})`}
              detail={`${formatSignDegree(result.ascendant.longitude)} | Lord ${result.ascendant.sign.lord}`}
            />
            <StatCard
              icon={Moon}
              label="Moon Sign"
              value={`${result.moon.sign.sanskrit} (${result.moon.sign.english})`}
              detail={`${result.moon.nakshatra.name} Pada ${result.moon.nakshatra.pada}`}
            />
            <StatCard
              icon={CalendarDays}
              label="Panchang"
              value={result.panchang.tithi}
              detail={`${result.panchang.yoga} Yoga | ${result.panchang.karana} Karana`}
            />
            <StatCard
              icon={Gauge}
              label="Mahadasha Balance"
              value={result.dashaTimeline[0].lord}
              detail={`Until ${formatDate(result.dashaTimeline[0].end)}`}
            />
          </div>

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-(--foreground)">Lagna Chart</h2>
                  <p className="mt-1 text-sm text-(--muted-foreground)">
                    Whole sign houses from the calculated ascendant.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copySummary}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={exportJson}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <FileJson className="h-4 w-4" />
                    JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                </div>
              </div>

              <div className="mt-5 grid aspect-square max-h-[720px] min-h-[360px] grid-cols-4 grid-rows-4 overflow-hidden rounded-lg border border-(--border) bg-(--background)">
                {CHART_LAYOUT.flatMap((row, rowIndex) =>
                  row.map((houseNumber, columnIndex) => {
                    if (!houseNumber) {
                      if (rowIndex === 1 && columnIndex === 1) {
                        return (
                          <div
                            key="center"
                            className="col-span-2 row-span-2 flex flex-col items-center justify-center border border-(--border) bg-(--section-highlight) p-4 text-center"
                          >
                            <Grid3X3 className="mb-3 h-8 w-8 text-(--primary)" />
                            <p className="text-lg font-bold text-(--foreground)">
                              {result.form.name || "Native"}
                            </p>
                            <p className="mt-1 text-sm text-(--muted-foreground)">
                              {result.form.birthDate} at {result.form.birthTime}
                            </p>
                            <p className="mt-2 text-xs text-(--muted-foreground)">
                              Ayanamsa {result.ayanamsa.toFixed(4)} deg
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }

                    const house = result.houseSigns[houseNumber - 1];
                    const isSelected = selectedHouse === houseNumber;

                    return (
                      <button
                        key={houseNumber}
                        type="button"
                        onClick={() => setSelectedHouse(houseNumber)}
                        className={`flex min-h-24 flex-col justify-between border border-(--border) p-3 text-left transition ${
                          isSelected
                            ? "bg-(--section-highlight) ring-2 ring-inset ring-(--primary)"
                            : "hover:bg-(--section-highlight)"
                        }`}
                      >
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold uppercase text-(--muted-foreground)">
                            House {house.house}
                          </span>
                          <span className="rounded-md bg-(--card) px-2 py-1 text-xs font-semibold text-(--primary)">
                            {house.sign.short}
                          </span>
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-(--foreground)">
                            {house.sign.sanskrit}
                          </span>
                          <span className="mt-1 flex flex-wrap gap-1">
                            {house.planets.length ? (
                              house.planets.map((planet) => (
                                <span
                                  key={planet.key}
                                  className="rounded-md bg-(--primary) px-1.5 py-0.5 text-xs font-semibold text-(--primary-foreground)"
                                  title={planet.label}
                                >
                                  {planet.code}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-(--muted-foreground)">Empty</span>
                            )}
                          </span>
                        </span>
                      </button>
                    );
                  }),
                )}
              </div>
            </section>

            <aside className="space-y-6">
              <section className="bg-(--card) border border-(--border) rounded-lg p-5">
                <h2 className="font-semibold text-(--foreground)">Selected House</h2>
                {selectedHouseData && (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-lg border border-(--border) bg-(--background) p-4">
                      <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
                        House {selectedHouseData.house}
                      </p>
                      <p className="mt-1 text-lg font-bold text-(--foreground)">
                        {selectedHouseData.sign.sanskrit} ({selectedHouseData.sign.english})
                      </p>
                      <p className="mt-2 text-sm text-(--muted-foreground)">
                        Lord {selectedHouseData.sign.lord} | {selectedHouseData.sign.element} |{" "}
                        {selectedHouseData.sign.modality}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {selectedHouseData.planets.length ? (
                        selectedHouseData.planets.map((planet) => (
                          <div
                            key={planet.key}
                            className="rounded-lg border border-(--border) bg-(--background) p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-(--foreground)">{planet.label}</p>
                              <span className="text-xs font-medium text-(--primary)">
                                {planet.retrograde ? "Retrograde" : "Direct"}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-(--muted-foreground)">
                              {formatSignDegree(planet.longitude)} | {planet.nakshatra.name} Pada{" "}
                              {planet.nakshatra.pada}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="rounded-lg border border-dashed border-(--border) p-4 text-sm text-(--muted-foreground)">
                          No planets are placed in this whole sign house.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </section>

              <section className="bg-(--card) border border-(--border) rounded-lg p-5">
                <h2 className="font-semibold text-(--foreground)">Chart Highlights</h2>
                <div className="mt-4 space-y-3">
                  {[
                    ["Sun Sign", `${result.sun.sign.sanskrit} (${result.sun.sign.english})`],
                    ["Atmakaraka", `${result.atmakaraka.label} in House ${result.atmakaraka.house}`],
                    ["Janma Nakshatra", `${result.moon.nakshatra.name}, Pada ${result.moon.nakshatra.pada}`],
                    ["Birth UTC", result.birthUtc.toISOString().replace(".000Z", "Z")],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-(--muted-foreground)">{label}</span>
                      <span className="text-right font-medium text-(--foreground)">{value}</span>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>

          <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                  <Orbit className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-(--foreground)">Planetary Positions</h2>
                  <p className="mt-1 text-sm text-(--muted-foreground)">
                    Sidereal longitude, sign, house, nakshatra, and motion signal.
                  </p>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto rounded-lg border border-(--border)">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-(--background) text-xs uppercase text-(--muted-foreground)">
                    <tr>
                      <th className="px-4 py-3">Planet</th>
                      <th className="px-4 py-3">Longitude</th>
                      <th className="px-4 py-3">Sign</th>
                      <th className="px-4 py-3">House</th>
                      <th className="px-4 py-3">Nakshatra</th>
                      <th className="px-4 py-3">Nature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--border)">
                    {result.planets.map((planet) => (
                      <tr key={planet.key} className="bg-(--card)">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 font-semibold text-(--foreground)">
                            <span className="rounded-md bg-(--primary) px-2 py-1 text-xs text-(--primary-foreground)">
                              {planet.code}
                            </span>
                            {planet.label}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-(--foreground)">
                          {formatDegree(planet.longitude)}
                        </td>
                        <td className="px-4 py-3 text-(--foreground)">
                          {planet.sign.sanskrit} ({planet.sign.english})
                        </td>
                        <td className="px-4 py-3 text-(--foreground)">House {planet.house}</td>
                        <td className="px-4 py-3 text-(--foreground)">
                          {planet.nakshatra.name} Pada {planet.nakshatra.pada}
                        </td>
                        <td className="px-4 py-3 text-(--muted-foreground)">
                          {planet.nature}
                          {planet.retrograde ? " | Rx" : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <section className="bg-(--card) border border-(--border) rounded-lg p-5">
                <h2 className="font-semibold text-(--foreground)">Element Balance</h2>
                <div className="mt-4 space-y-3">
                  {["Fire", "Earth", "Air", "Water"].map((element) => {
                    const count = result.elementCounts[element] || 0;
                    const width = elementTotal ? (count / elementTotal) * 100 : 0;
                    return (
                      <div key={element}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-(--foreground)">{element}</span>
                          <span className="text-(--muted-foreground)">{count} placements</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-(--background)">
                          <div
                            className="h-full rounded-full bg-(--primary)"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="bg-(--card) border border-(--border) rounded-lg p-5">
                <h2 className="font-semibold text-(--foreground)">Vimshottari Dasha</h2>
                <div className="mt-4 space-y-3">
                  {result.dashaTimeline.slice(0, 6).map((period) => (
                    <div
                      key={`${period.lord}-${period.start.toISOString()}`}
                      className="rounded-lg border border-(--border) bg-(--background) p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-(--foreground)">
                          {period.lord} {period.balance ? "Balance" : "Mahadasha"}
                        </p>
                        <p className="text-xs text-(--muted-foreground)">
                          {period.years.toFixed(2)} yrs
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-(--muted-foreground)">
                        {formatDate(period.start)} to {formatDate(period.end)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">
              Calculations are browser-side astronomical estimates for astrology
              and learning use. Exact professional Panchang values can vary by
              school, ayanamsa, house system, and local sunrise rules.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
