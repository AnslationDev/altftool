// Shared formatting keeps the hero and every timezone card on the same
// 12/24-hour setting.

// Some ICU builds expose older IANA link names. Keep current city names
// searchable and visible without changing the canonical zone identifier that
// Intl needs for formatting.
const TIME_ZONE_CITY_ALIASES = Object.freeze({
  "Africa/Asmera": "Asmara",
  "America/Godthab": "Nuuk",
  "Asia/Ashkhabad": "Ashgabat",
  "Asia/Calcutta": "Kolkata",
  "Asia/Chungking": "Chongqing",
  "Asia/Dacca": "Dhaka",
  "Asia/Katmandu": "Kathmandu",
  "Asia/Macao": "Macau",
  "Asia/Rangoon": "Yangon",
  "Asia/Saigon": "Ho Chi Minh City",
  "Asia/Ulan_Bator": "Ulaanbaatar",
  "Europe/Kiev": "Kyiv",
  "Pacific/Ponape": "Pohnpei",
  "Pacific/Truk": "Chuuk",
});

export const formatTimeZoneCity = (timeZone) =>
  TIME_ZONE_CITY_ALIASES[timeZone] ||
  String(timeZone).split("/").pop().replace(/_/g, " ");

export const getTimeZoneSearchText = (timeZone) =>
  `${timeZone} ${TIME_ZONE_CITY_ALIASES[timeZone] || ""}`.toLocaleLowerCase(
    "en-US",
  );

/**
 * Format a Date as a clock reading.
 *
 * The explicit h23 cycle matters at midnight: some ICU builds resolve
 * `hour12: false` to h24 and render midnight as 24:00:00 instead of 00:00:00.
 */
export const formatClockTime = (date, hour12 = true, timeZone) =>
  date?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    ...(timeZone ? { timeZone } : {}),
    ...(hour12 ? { hour12: true } : { hourCycle: "h23" }),
  }) || "--:--:--";

const readUtcOffsetMinutes = (timeZone, instant = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  }).formatToParts(instant);

  const rawOffset = parts.find(
    (part) => part.type === "timeZoneName",
  )?.value;

  if (rawOffset === "GMT" || rawOffset === "UTC") return 0;

  const match = rawOffset?.match(
    /(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?/,
  );
  if (!match) return null;

  const [, sign, hours, minutes = "00"] = match;
  const total = Number(hours) * 60 + Number(minutes);
  return sign === "-" ? -total : total;
};

/**
 * Resolve the UTC offset for an IANA zone at a real instant.
 *
 * Passing a real instant lets Intl apply the selected zone's daylight-saving
 * rules correctly without treating a remote wall-clock reading as local time.
 */
export const formatUtcOffset = (timeZone, instant = new Date()) => {
  try {
    const totalMinutes = readUtcOffsetMinutes(timeZone, instant);
    if (totalMinutes === null) return null;

    const sign = totalMinutes < 0 ? "-" : "+";
    const absoluteMinutes = Math.abs(totalMinutes);
    const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
    const minutes = String(absoluteMinutes % 60).padStart(2, "0");
    return `UTC${sign}${hours}:${minutes}`;
  } catch {
    return null;
  }
};

/**
 * Best-effort seasonal DST state using the zone's January/July offsets.
 * The clock itself never depends on this label; Intl always formats the real
 * instant with the full IANA rule set, including transitions.
 */
export const isDstActive = (timeZone, instant = new Date()) => {
  try {
    const year = instant.getUTCFullYear();
    const current = readUtcOffsetMinutes(timeZone, instant);
    const january = readUtcOffsetMinutes(
      timeZone,
      new Date(Date.UTC(year, 0, 1, 12)),
    );
    const july = readUtcOffsetMinutes(
      timeZone,
      new Date(Date.UTC(year, 6, 1, 12)),
    );

    if (
      current === null ||
      january === null ||
      july === null ||
      january === july
    ) {
      return false;
    }

    return current === Math.max(january, july);
  } catch {
    return false;
  }
};
