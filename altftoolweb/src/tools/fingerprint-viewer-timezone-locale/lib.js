/**
 * Timezone and locale fingerprint analysis.
 *
 * A page can read your IANA timezone, your language list and every formatting
 * preference the Internationalisation API resolves, all without a prompt.
 * Together those answer three questions a tracker cares about: roughly where
 * you are, what you speak, and whether those two agree.
 *
 * The module computes, from arguments only:
 *  - the real UTC offset of a timezone on a given date, by formatting that
 *    instant in the zone and differencing it against UTC,
 *  - whether the zone shifts between January and July, i.e. observes DST,
 *  - how rare the offset's minute component is (:00 is ordinary, :30 less so,
 *    :45 exists in only a handful of zones worldwide),
 *  - whether the timezone's country and the language tag's region disagree,
 *    which is the classic tell of a VPN or a relocated account,
 *  - concrete formatting samples: date order, decimal separator, hour cycle.
 *
 * Pure. Every date is passed in; nothing reads the clock or the DOM.
 */

/* ------------------------------------------------------------------ */
/* Zone -> country, from the IANA tz database zone1970.tab             */
/* ------------------------------------------------------------------ */

/**
 * A working subset of the tz database: the zones that carry most of the
 * world's browser traffic. Anything not listed resolves to "unknown", which is
 * reported honestly rather than guessed.
 */
export const ZONE_COUNTRY = {
  "Africa/Cairo": ["EG", "Egypt"],
  "Africa/Johannesburg": ["ZA", "South Africa"],
  "Africa/Lagos": ["NG", "Nigeria"],
  "Africa/Nairobi": ["KE", "Kenya"],
  "America/Argentina/Buenos_Aires": ["AR", "Argentina"],
  "America/Bogota": ["CO", "Colombia"],
  "America/Chicago": ["US", "United States"],
  "America/Denver": ["US", "United States"],
  "America/Halifax": ["CA", "Canada"],
  "America/Los_Angeles": ["US", "United States"],
  "America/Mexico_City": ["MX", "Mexico"],
  "America/New_York": ["US", "United States"],
  "America/Phoenix": ["US", "United States"],
  "America/Sao_Paulo": ["BR", "Brazil"],
  "America/Santiago": ["CL", "Chile"],
  "America/Toronto": ["CA", "Canada"],
  "America/Vancouver": ["CA", "Canada"],
  "Asia/Bangkok": ["TH", "Thailand"],
  "Asia/Colombo": ["LK", "Sri Lanka"],
  "Asia/Dhaka": ["BD", "Bangladesh"],
  "Asia/Dubai": ["AE", "United Arab Emirates"],
  "Asia/Hong_Kong": ["HK", "Hong Kong"],
  "Asia/Jakarta": ["ID", "Indonesia"],
  "Asia/Jerusalem": ["IL", "Israel"],
  "Asia/Kabul": ["AF", "Afghanistan"],
  "Asia/Karachi": ["PK", "Pakistan"],
  "Asia/Kathmandu": ["NP", "Nepal"],
  "Asia/Kolkata": ["IN", "India"],
  "Asia/Kuala_Lumpur": ["MY", "Malaysia"],
  "Asia/Manila": ["PH", "Philippines"],
  "Asia/Riyadh": ["SA", "Saudi Arabia"],
  "Asia/Seoul": ["KR", "South Korea"],
  "Asia/Shanghai": ["CN", "China"],
  "Asia/Singapore": ["SG", "Singapore"],
  "Asia/Taipei": ["TW", "Taiwan"],
  "Asia/Tokyo": ["JP", "Japan"],
  "Asia/Yangon": ["MM", "Myanmar"],
  "Australia/Adelaide": ["AU", "Australia"],
  "Australia/Brisbane": ["AU", "Australia"],
  "Australia/Eucla": ["AU", "Australia"],
  "Australia/Perth": ["AU", "Australia"],
  "Australia/Sydney": ["AU", "Australia"],
  "Europe/Amsterdam": ["NL", "Netherlands"],
  "Europe/Berlin": ["DE", "Germany"],
  "Europe/Brussels": ["BE", "Belgium"],
  "Europe/Dublin": ["IE", "Ireland"],
  "Europe/Istanbul": ["TR", "Turkey"],
  "Europe/Lisbon": ["PT", "Portugal"],
  "Europe/London": ["GB", "United Kingdom"],
  "Europe/Madrid": ["ES", "Spain"],
  "Europe/Moscow": ["RU", "Russia"],
  "Europe/Paris": ["FR", "France"],
  "Europe/Rome": ["IT", "Italy"],
  "Europe/Stockholm": ["SE", "Sweden"],
  "Europe/Warsaw": ["PL", "Poland"],
  "Europe/Zurich": ["CH", "Switzerland"],
  "Pacific/Auckland": ["NZ", "New Zealand"],
  "Pacific/Chatham": ["NZ", "New Zealand"],
  "Pacific/Honolulu": ["US", "United States"],
  UTC: ["", "No country — UTC itself"],
};

/**
 * Zones that cover very large populations, so reporting one of them puts you
 * in a big crowd. A small-population zone is far more identifying.
 */
export const HIGH_POPULATION_ZONES = [
  "America/Chicago",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/New_York",
  "America/Sao_Paulo",
  "Asia/Dhaka",
  "Asia/Jakarta",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Manila",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Europe/Berlin",
  "Europe/London",
  "Europe/Moscow",
  "Europe/Paris",
];

export function zoneCountry(timeZone) {
  const entry = ZONE_COUNTRY[timeZone];
  if (!entry) return { code: null, name: "Not in the reference list" };
  return { code: entry[0] || null, name: entry[1] };
}

/* ------------------------------------------------------------------ */
/* Offsets                                                             */
/* ------------------------------------------------------------------ */

/**
 * UTC offset of a zone at a given instant, in minutes east of UTC.
 * The instant is formatted in the target zone and read back as if it were UTC;
 * the difference is the offset. This is the standard technique and needs no
 * offset table of our own.
 */
export function zoneOffsetMinutes(timeZone, date) {
  const stamp = date instanceof Date ? date.getTime() : Number(date);
  if (!Number.isFinite(stamp)) return { error: "Reference instant is not a valid date." };
  let parts;
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(new Date(stamp));
  } catch {
    return { error: `"${timeZone}" is not a timezone this browser recognises.` };
  }
  const map = {};
  for (const part of parts) map[part.type] = part.value;
  const asIfUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour) % 24,
    Number(map.minute),
    Number(map.second),
  );
  if (!Number.isFinite(asIfUTC)) return { error: "Could not read that timezone." };
  return { minutes: Math.round((asIfUTC - stamp) / 60000) };
}

export function offsetLabel(minutes) {
  if (!Number.isFinite(minutes)) return "—";
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const mins = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${hours}:${mins}`;
}

/**
 * Only three zones in the tz database use a 45-minute offset — Nepal
 * (+05:45), the Chatham Islands (+12:45) and Australia/Eucla (+08:45) — so
 * that minute component alone is a strong locator. Half-hour offsets cover a
 * larger but still limited set including India, Iran and Newfoundland.
 */
export const OFFSET_RARITY = {
  0: { label: "Ordinary", detail: "Whole-hour offsets cover most of the world." },
  30: {
    label: "Narrowing",
    detail: "Half-hour offsets are used by a limited set of countries, so this cuts the field sharply.",
  },
  45: {
    label: "Very rare",
    detail:
      "Only three zones worldwide use a 45-minute offset: Nepal, the Chatham Islands and Australia/Eucla.",
  },
};

export function offsetRarity(minutes) {
  if (!Number.isFinite(minutes)) return OFFSET_RARITY[0];
  const part = Math.abs(minutes) % 60;
  return OFFSET_RARITY[part] || {
    label: "Unusual",
    detail: "An offset that is not on a quarter-hour boundary is extremely unusual.",
  };
}

/**
 * Compare the January and July offsets of a year. A zone that changes between
 * them observes daylight saving; a zone that does not, does not.
 */
export function dstProfile(timeZone, year) {
  const y = Number(year);
  if (!Number.isInteger(y) || y < 1970 || y > 2100) {
    return { error: "Year must be a whole number between 1970 and 2100." };
  }
  const january = zoneOffsetMinutes(timeZone, new Date(Date.UTC(y, 0, 15, 12)));
  const july = zoneOffsetMinutes(timeZone, new Date(Date.UTC(y, 6, 15, 12)));
  if (january.error) return january;
  if (july.error) return july;
  const observes = january.minutes !== july.minutes;
  return {
    observes,
    januaryMinutes: january.minutes,
    julyMinutes: july.minutes,
    shiftMinutes: Math.abs(july.minutes - january.minutes),
    standardMinutes: Math.min(january.minutes, july.minutes),
  };
}

/* ------------------------------------------------------------------ */
/* Language tags                                                       */
/* ------------------------------------------------------------------ */

/** Split a BCP-47 tag into language, script and region subtags. */
export function parseLanguageTag(tag) {
  const text = String(tag || "").trim();
  if (!text) return { error: "Empty language tag." };
  const parts = text.replace(/_/g, "-").split("-");
  const language = parts[0].toLowerCase();
  if (!/^[a-z]{2,3}$/.test(language)) return { error: `"${tag}" is not a usable language tag.` };
  let script = null;
  let region = null;
  for (const part of parts.slice(1)) {
    if (/^[A-Za-z]{4}$/.test(part) && !script) {
      script = part[0].toUpperCase() + part.slice(1).toLowerCase();
    } else if (/^([A-Za-z]{2}|\d{3})$/.test(part) && !region) {
      region = part.toUpperCase();
    }
  }
  return { language, script, region };
}

/* ------------------------------------------------------------------ */
/* Formatting samples                                                  */
/* ------------------------------------------------------------------ */

/** A fixed instant, so the samples are comparable between machines. */
export const SAMPLE_INSTANT = Date.UTC(2026, 2, 9, 14, 5, 30);
export const SAMPLE_NUMBER = 1234567.89;

export function formattingSamples(locale, timeZone) {
  const safe = (fn, fallback) => {
    try {
      return fn();
    } catch {
      return fallback;
    }
  };
  const date = new Date(SAMPLE_INSTANT);
  const shortDate = safe(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "short", timeZone }).format(date),
    "unavailable",
  );
  const longDate = safe(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone }).format(date),
    "unavailable",
  );
  const time = safe(
    () => new Intl.DateTimeFormat(locale, { timeStyle: "medium", timeZone }).format(date),
    "unavailable",
  );
  const number = safe(() => new Intl.NumberFormat(locale).format(SAMPLE_NUMBER), "unavailable");
  const decimalSeparator = safe(() => {
    const parts = new Intl.NumberFormat(locale).formatToParts(1.5);
    const found = parts.find((part) => part.type === "decimal");
    return found ? found.value : ".";
  }, ".");
  const groupSeparator = safe(() => {
    const parts = new Intl.NumberFormat(locale).formatToParts(1234567);
    const found = parts.find((part) => part.type === "group");
    return found ? found.value : "";
  }, "");
  const grouping = safe(() => new Intl.NumberFormat(locale).format(1234567), "unavailable");
  return { shortDate, longDate, time, number, decimalSeparator, groupSeparator, grouping };
}

/* ------------------------------------------------------------------ */
/* The analysis                                                        */
/* ------------------------------------------------------------------ */

export const EXPOSURE_BANDS = [
  {
    min: 3,
    label: "Stands out",
    tone: "danger",
    summary: "Several of these signals are unusual, and together they place you narrowly.",
  },
  {
    min: 1,
    label: "Somewhat distinctive",
    tone: "warning",
    summary: "Most of your signals are ordinary, but at least one narrows the field.",
  },
  {
    min: 0,
    label: "Blends in",
    tone: "success",
    summary: "These readings match a very large group of browsers.",
  },
];

export function exposureBand(count) {
  return EXPOSURE_BANDS.find((band) => count >= band.min) || EXPOSURE_BANDS[2];
}

/**
 * signals = { timeZone, locale, languages: [], calendar, numberingSystem,
 *             hourCycle, referenceISO }
 */
export function analyseLocale(signals) {
  const s = signals || {};
  const timeZone = String(s.timeZone || "").trim();
  const locale = String(s.locale || "").trim();
  if (!timeZone) return { error: "No timezone was supplied." };
  if (!locale) return { error: "No language tag was supplied." };

  const referenceStamp = s.referenceISO ? Date.parse(s.referenceISO) : SAMPLE_INSTANT;
  if (!Number.isFinite(referenceStamp)) return { error: "Reference date is not a valid date." };

  const offset = zoneOffsetMinutes(timeZone, new Date(referenceStamp));
  if (offset.error) return offset;

  const tag = parseLanguageTag(locale);
  if (tag.error) return tag;

  const year = new Date(referenceStamp).getUTCFullYear();
  const dst = dstProfile(timeZone, year);
  const country = zoneCountry(timeZone);
  const rarity = offsetRarity(offset.minutes);
  const languages = Array.isArray(s.languages) ? s.languages.filter(Boolean).map(String) : [locale];
  const calendar = String(s.calendar || "gregory");
  const numberingSystem = String(s.numberingSystem || "latn");
  const hourCycle = String(s.hourCycle || "h12");
  const samples = formattingSamples(locale, timeZone);

  const regionMismatch = Boolean(
    tag.region && country.code && tag.region !== country.code,
  );

  const rows = [
    {
      id: "timeZone",
      label: "IANA timezone",
      value: timeZone,
      distinctive: !HIGH_POPULATION_ZONES.includes(timeZone),
      note: HIGH_POPULATION_ZONES.includes(timeZone)
        ? "A high-traffic zone shared by a very large population."
        : "Not one of the largest zones, so it narrows you to a smaller group.",
    },
    {
      id: "offset",
      label: "UTC offset on this date",
      value: offsetLabel(offset.minutes),
      distinctive: Math.abs(offset.minutes) % 60 !== 0,
      note: rarity.detail,
    },
    {
      id: "dst",
      label: "Daylight saving",
      value: dst.error ? "unknown" : dst.observes ? `Yes, shifts by ${dst.shiftMinutes} minutes` : "No",
      distinctive: false,
      note: dst.error
        ? dst.error
        : dst.observes
          ? "The offset changes twice a year, so an observer can watch it flip on the changeover date."
          : "A fixed offset all year, which is itself a distinguishing property of the zone.",
    },
    {
      id: "language",
      label: "Primary language tag",
      value: locale,
      distinctive: Boolean(tag.script) || !tag.region,
      note: tag.region
        ? `Language ${tag.language}, region ${tag.region}${tag.script ? `, script ${tag.script}` : ""}.`
        : "No region subtag, so formatting falls back to the language default.",
    },
    {
      id: "languages",
      label: "Accepted languages",
      value: languages.join(", "),
      distinctive: languages.length >= 3,
      note:
        languages.length >= 3
          ? "A long, ordered language list is one of the more identifying header values a browser sends."
          : "A short language list is shared by many people.",
    },
    {
      id: "calendar",
      label: "Calendar",
      value: calendar,
      distinctive: calendar !== "gregory",
      note:
        calendar === "gregory"
          ? "The default nearly everywhere."
          : "A non-Gregorian calendar is rare enough to narrow you considerably.",
    },
    {
      id: "numbering",
      label: "Numbering system",
      value: numberingSystem,
      distinctive: numberingSystem !== "latn",
      note:
        numberingSystem === "latn"
          ? "Latin digits, the overwhelming default."
          : "A non-Latin numbering system is reported by a small minority of browsers.",
    },
    {
      id: "hourCycle",
      label: "Hour cycle",
      value: hourCycle,
      distinctive: hourCycle !== "h12" && hourCycle !== "h23",
      note: "h12 is the 12-hour clock, h23 the 24-hour clock; anything else is unusual.",
    },
    {
      id: "separators",
      label: "Number formatting",
      value: `${samples.grouping} (decimal "${samples.decimalSeparator}")`,
      distinctive: false,
      note: "Grouping and decimal marks follow the locale and quietly confirm the language tag.",
    },
  ];

  const distinctive = rows.filter((row) => row.distinctive).length;
  const score = distinctive + (regionMismatch ? 1 : 0);

  return {
    rows,
    samples,
    timeZone,
    locale,
    offsetMinutes: offset.minutes,
    offsetText: offsetLabel(offset.minutes),
    rarity,
    dst,
    country,
    tag,
    regionMismatch,
    mismatchNote: regionMismatch
      ? `The timezone points at ${country.name} (${country.code}) while the language tag says ${tag.region}. That is normal for expatriates and travellers, and it is also exactly what a VPN looks like.`
      : country.code && tag.region
        ? "Timezone country and language region agree."
        : "Not enough information to compare timezone and language region.",
    distinctive,
    score,
    band: exposureBand(score),
    total: rows.length,
  };
}

/** Sample profiles for comparison. */
export const SAMPLE_PROFILES = [
  {
    id: "india",
    label: "India, English",
    signals: {
      timeZone: "Asia/Kolkata",
      locale: "en-IN",
      languages: ["en-IN", "en"],
      calendar: "gregory",
      numberingSystem: "latn",
      hourCycle: "h12",
    },
  },
  {
    id: "us",
    label: "US east coast, English",
    signals: {
      timeZone: "America/New_York",
      locale: "en-US",
      languages: ["en-US", "en"],
      calendar: "gregory",
      numberingSystem: "latn",
      hourCycle: "h12",
    },
  },
  {
    id: "vpn",
    label: "VPN mismatch example",
    signals: {
      timeZone: "Asia/Kathmandu",
      locale: "de-DE",
      languages: ["de-DE", "de", "en-US", "en"],
      calendar: "gregory",
      numberingSystem: "latn",
      hourCycle: "h23",
    },
  },
];

export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [
    "TIMEZONE AND LOCALE FINGERPRINT",
    `Timezone: ${result.timeZone} (${result.offsetText}, ${result.country.name})`,
    `Language: ${result.locale}`,
    "",
  ];
  result.rows.forEach((row) => {
    lines.push(`${row.label}: ${row.value} — ${row.distinctive ? "distinctive" : "common"}`);
  });
  lines.push(
    "",
    `Region consistency: ${result.regionMismatch ? "mismatch" : "consistent"}`,
    `Distinctive signals: ${result.distinctive} of ${result.total}`,
    `Verdict: ${result.band.label}`,
  );
  return lines.join("\n");
}
