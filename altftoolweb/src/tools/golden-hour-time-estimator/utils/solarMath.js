/**
 * Solar Mathematics & Astronomical Calculations for Golden Hour Estimator
 * Implements the standard NOAA Solar Position equations to calculate solar elevation,
 * sunrise, sunset, golden hour, and blue hour windows fully offline.
 */

// Preset photography-grade locations across the globe
export const LOCATION_PRESETS = [
  { id: "gps", name: "Current Location", lat: null, lng: null, timezone: "auto" },
  { id: "new-york", name: "New York, USA", lat: 40.7128, lng: -74.0060, timezone: "America/New_York" },
  { id: "los-angeles", name: "Los Angeles, USA", lat: 34.0522, lng: -118.2437, timezone: "America/Los_Angeles" },
  { id: "london", name: "London, UK", lat: 51.5074, lng: -0.1278, timezone: "Europe/London" },
  { id: "paris", name: "Paris, France", lat: 48.8566, lng: 2.3522, timezone: "Europe/Paris" },
  { id: "tokyo", name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, timezone: "Asia/Tokyo" },
  { id: "sydney", name: "Sydney, Australia", lat: -33.8688, lng: 151.2093, timezone: "Australia/Sydney" },
  { id: "dubai", name: "Dubai, UAE", lat: 25.2048, lng: 55.2708, timezone: "Asia/Dubai" },
  { id: "reykjavik", name: "Reykjavik, Iceland", lat: 64.1466, lng: -21.9426, timezone: "Atlantic/Reykjavik" },
  { id: "cape-town", name: "Cape Town, South Africa", lat: -33.9249, lng: 18.4241, timezone: "Africa/Johannesburg" },
  { id: "mumbai", name: "Mumbai, India", lat: 19.0760, lng: 72.8777, timezone: "Asia/Kolkata" },
  { id: "cairo", name: "Cairo, Egypt", lat: 30.0444, lng: 31.2357, timezone: "Africa/Cairo" },
  { id: "rio", name: "Rio de Janeiro, Brazil", lat: -22.9068, lng: -43.1729, timezone: "America/Sao_Paulo" },
];

/**
 * Calculates the timezone offset of a given timezone ID at a specific date
 * Returns the offset in hours (e.g. -5 for EST, -4 for EDT, +5.5 for IST)
 */
export function getTimezoneOffset(timeZone, date) {
  if (!timeZone || timeZone === "auto") {
    // Fallback to native local system offset
    return -date.getTimezoneOffset() / 60;
  }
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    if (!tzPart) return -date.getTimezoneOffset() / 60;
    const val = tzPart.value; // e.g. "GMT-04:00", "GMT+5:30", "GMT", "UTC"
    if (val === "GMT" || val === "UTC") return 0;
    const match = val.match(/GMT([+-])(\d+):?(\d*)/);
    if (!match) return 0;
    const sign = match[1] === "+" ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = match[3] ? parseInt(match[3], 10) : 0;
    return sign * (hours + minutes / 60);
  } catch (e) {
    console.error("Error calculating timezone offset", e);
    return -date.getTimezoneOffset() / 60;
  }
}

/**
 * Core NOAA Solar Calculations
 * Evaluates the solar elevation angle for all 1440 minutes of a given day.
 * Uses numerical transition searching to resolve sunrise, sunset, golden/blue hours.
 */
export function calculateLightingTimes(lat, lng, date, tzOffset) {
  const elevations = [];
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // Helper: day of year
  const getDayOfYear = (d) => {
    const yrStart = new Date(d.getFullYear(), 0, 0);
    const diff = d.getTime() - yrStart.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  // 1. Calculate elevations at each minute of the day (0 to 1439)
  for (let m = 0; m < 1440; m++) {
    const localHour = m / 60;
    const utcHour = localHour - tzOffset;

    const localTimeMs = startOfDay.getTime() + m * 60 * 1000;
    const utcDate = new Date(localTimeMs);
    const N = getDayOfYear(utcDate);

    // Fractional year in radians
    const d = (2 * Math.PI / 365) * (N - 1 + (utcHour - 12) / 24);

    // Equation of Time (minutes)
    const eqtime = 229.18 * (
      0.000075 +
      0.001868 * Math.cos(d) -
      0.032077 * Math.sin(d) -
      0.014615 * Math.cos(2 * d) -
      0.040849 * Math.sin(2 * d)
    );

    // Solar Declination (radians)
    const decl = 0.006918 -
      0.399912 * Math.cos(d) +
      0.070257 * Math.sin(d) -
      0.006758 * Math.cos(2 * d) +
      0.000907 * Math.sin(2 * d) -
      0.002697 * Math.cos(3 * d) +
      0.00148 * Math.sin(3 * d);

    // Lat in radians
    const latRad = (lat * Math.PI) / 180;

    // True Solar Time
    const timeOffset = eqtime + 4 * lng; // in minutes
    const trueSolarTime = utcHour * 60 + timeOffset; // in minutes

    // Hour Angle (degrees)
    let ha = trueSolarTime / 4 - 180;
    while (ha < -180) ha += 360;
    while (ha > 180) ha -= 360;
    const haRad = (ha * Math.PI) / 180;

    // Zenith angle
    const sinZenith = Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(haRad);
    const zenithRad = Math.acos(Math.max(-1, Math.min(1, sinZenith)));
    const elevation = 90 - (zenithRad * 180) / Math.PI;

    elevations.push({ minute: m, elevation });
  }

  // 2. Identify Solar Noon (maximum solar elevation of the day)
  let maxElevation = -999;
  let minElevation = 999;
  let solarNoonMinute = 720;
  
  for (let m = 0; m < 1440; m++) {
    const el = elevations[m].elevation;
    if (el > maxElevation) {
      maxElevation = el;
      solarNoonMinute = m;
    }
    if (el < minElevation) {
      minElevation = el;
    }
  }

  // 3. Finding Transitions: helper to search and interpolate crossing points
  const findTransition = (targetAngle, direction, startRange, endRange) => {
    let crossings = [];
    for (let m = startRange; m < endRange; m++) {
      const idx = (m + 1440) % 1440;
      const nextIdx = (m + 1) % 1440;

      const el = elevations[idx].elevation;
      const nextEl = elevations[nextIdx].elevation;

      const crossed = (el <= targetAngle && nextEl >= targetAngle) || (el >= targetAngle && nextEl <= targetAngle);
      if (crossed) {
        const isUp = nextEl > el;
        if (direction === "any" || (direction === "up" && isUp) || (direction === "down" && !isUp)) {
          // Linear interpolation for higher accuracy
          const fraction = (targetAngle - el) / (nextEl - el);
          const exactMin = m + fraction;
          crossings.push(exactMin);
        }
      }
    }
    return crossings.length > 0 ? crossings[0] : null;
  };

  // Standard sunrise/sunset crossings at -0.833 degrees (accounting for atmospheric refraction)
  const sunriseMin = findTransition(-0.833, "up", 0, solarNoonMinute);
  const sunsetMin = findTransition(-0.833, "down", solarNoonMinute, 1439);

  // Morning Golden Hour: rises from -6° to +6°
  const morningGoldenStart = findTransition(-6.0, "up", 0, solarNoonMinute);
  const morningGoldenEnd = findTransition(6.0, "up", 0, solarNoonMinute);

  // Evening Golden Hour: sinks from +6° to -6°
  const eveningGoldenStart = findTransition(6.0, "down", solarNoonMinute, 1439);
  const eveningGoldenEnd = findTransition(-6.0, "down", solarNoonMinute, 1439);

  // Morning Blue Hour: rises from -6° to -4°
  const morningBlueStart = findTransition(-6.0, "up", 0, solarNoonMinute);
  const morningBlueEnd = findTransition(-4.0, "up", 0, solarNoonMinute);

  // Evening Blue Hour: sinks from -4° to -6°
  const eveningBlueStart = findTransition(-4.0, "down", solarNoonMinute, 1439);
  const eveningBlueEnd = findTransition(-6.0, "down", solarNoonMinute, 1439);

  // Check Polar conditions
  let polarStatus = null; // "day" or "night" or null
  if (maxElevation < -0.833) {
    polarStatus = "night"; // Polar Night - sun never rises
  } else if (minElevation > -0.833) {
    polarStatus = "day"; // Polar Day (Midnight Sun) - sun never sets
  }

  return {
    elevations,
    maxElevation,
    minElevation,
    polarStatus,
    solarNoon: solarNoonMinute,
    sunrise: sunriseMin,
    sunset: sunsetMin,
    morningGolden: { start: morningGoldenStart, end: morningGoldenEnd },
    eveningGolden: { start: eveningGoldenStart, end: eveningGoldenEnd },
    morningBlue: { start: morningBlueStart, end: morningBlueEnd },
    eveningBlue: { start: eveningBlueStart, end: eveningBlueEnd },
  };
}

/**
 * Classifies current lighting conditions based on sun altitude and movement
 */
export function detectLightingPhase(elevation, isBeforeNoon) {
  if (elevation > 6.0) {
    return {
      id: "daylight",
      name: "Daylight",
      description: "Direct sunlight, high contrast and strong shadows.",
      color: "from-amber-400 to-sky-400 shadow-amber-500/20",
      textColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      icon: "sun",
      advice: "Use filters (polarizer/ND) or look for open shade to soften harsh glare.",
    };
  } else if (elevation >= -4.0 && elevation <= 6.0) {
    return {
      id: "golden_hour",
      name: isBeforeNoon ? "Morning Golden Hour" : "Evening Golden Hour",
      description: "Soft, golden-orange warm directional light. Long magical shadows.",
      color: "from-orange-500 to-amber-500 shadow-orange-500/30 animate-pulse-slow",
      textColor: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      icon: "sunset",
      advice: "Perfect for portraits, landscape flare, and dramatic silhouettes.",
    };
  } else if (elevation >= -6.0 && elevation < -4.0) {
    return {
      id: "blue_hour",
      name: isBeforeNoon ? "Morning Blue Hour" : "Evening Blue Hour",
      description: "Cool blue, violet and pink hues in the sky. Calm atmospheric ambient lighting.",
      color: "from-indigo-600 to-violet-600 shadow-indigo-500/30 animate-pulse-slow",
      textColor: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      icon: "moon",
      advice: "Magical for glowing cityscapes, water reflections, and moody long exposures.",
    };
  } else if (elevation >= -12.0 && elevation < -6.0) {
    return {
      id: "twilight",
      name: isBeforeNoon ? "Dawn / Twilight" : "Dusk / Twilight",
      description: "Sun is below the horizon. Atmospheric gradients are visible.",
      color: "from-purple-800 to-indigo-950 shadow-purple-500/10",
      textColor: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      icon: "cloud-moon",
      advice: "Great for capturing early skylines. Keep your tripod ready for low light.",
    };
  } else {
    return {
      id: "night",
      name: "Night",
      description: "Complete dark sky. Perfect window for astrophotography.",
      color: "from-slate-900 via-slate-950 to-zinc-950 border border-slate-800",
      textColor: "text-slate-400",
      bgColor: "bg-slate-500/5",
      borderColor: "border-slate-800/40",
      icon: "stars",
      advice: "Ideal for star trails, Milky Way, and light painting photography.",
    };
  }
}

/**
 * Formats minute of the day (0-1439) into a 12-hour AM/PM string
 */
export function formatMinuteToTime(min) {
  if (min === null || isNaN(min)) return "--:--";
  const totalMinutes = Math.round(min);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * Format minutes remaining into a reader-friendly countdown text (e.g. 1h 24m)
 */
export function formatDuration(totalMin) {
  if (totalMin === null || isNaN(totalMin)) return "0m";
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m}m`;
}
