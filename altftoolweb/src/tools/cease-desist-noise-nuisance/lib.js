/**
 * Noise nuisance cease-and-desist letter builder with an incident log.
 *
 * Rules encoded below (India, informational only — not legal advice):
 *  - Noise Pollution (Regulation and Control) Rules, 2000, Schedule: ambient air quality standards
 *    in respect of noise, in dB(A) Leq, by area category and by time.
 *      Industrial area  : 75 day / 70 night
 *      Commercial area  : 65 day / 55 night
 *      Residential area : 55 day / 45 night
 *      Silence zone     : 50 day / 40 night
 *    Rule 3(1) explanation: "day time" is 6.00 a.m. to 10.00 p.m. and "night time" is
 *    10.00 p.m. to 6.00 a.m.
 *  - Rule 3(5): a silence zone is an area of not less than 100 metres around hospitals,
 *    educational institutions and courts, so declared by the competent authority.
 *  - Rule 5(2): a loudspeaker or public address system shall not be used at night (between
 *    10.00 p.m. and 6.00 a.m.) except in closed premises such as auditoria, conference rooms,
 *    community halls and banquet halls.
 *  - Rule 8(1): where the noise level exceeds the ambient standard by 10 dB(A) or more, a person
 *    may complain to the designated authority, which may act against the source.
 *  - Private nuisance in tort: an unreasonable and substantial interference with a person's use
 *    and enjoyment of their land, remedied by an injunction and damages.
 *  - Public nuisance is a criminal offence under the Bharatiya Nyaya Sanhita, 2023, which replaced
 *    the corresponding provisions of the Indian Penal Code, 1860; a Magistrate may also make a
 *    conditional order for the removal of a nuisance under the Bharatiya Nagarik Suraksha
 *    Sanhita, 2023, which replaced the Code of Criminal Procedure, 1973.
 *
 * All maths here is pure — every date and time arrives as a string from the caller.
 */

/** Schedule to the Noise Pollution (Regulation and Control) Rules, 2000, in dB(A) Leq. */
export const NOISE_LIMITS = [
  { id: "industrial", label: "Industrial area", day: 75, night: 70 },
  { id: "commercial", label: "Commercial area", day: 65, night: 55 },
  { id: "residential", label: "Residential area", day: 55, night: 45 },
  { id: "silence", label: "Silence zone (hospital, school, court)", day: 50, night: 40 },
];

/** Rule 3(1) explanation: night time runs from 22:00 to 06:00. */
export const NIGHT_START_MINUTE = 22 * 60;
export const NIGHT_END_MINUTE = 6 * 60;

/** Rule 8(1): a complaint may be made once the ambient standard is exceeded by this much. */
export const COMPLAINT_THRESHOLD_DB = 10;

const MINUTES_PER_DAY = 1440;

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

function parseIso(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day, stamp };
}

export function formatLongDate(iso) {
  const parsed = parseIso(iso);
  if (!parsed) return "";
  return `${parsed.day} ${MONTHS[parsed.month - 1]} ${parsed.year}`;
}

export function addDays(iso, days) {
  const parsed = parseIso(iso);
  if (!parsed || !Number.isFinite(days)) return "";
  const next = new Date(parsed.stamp + Math.trunc(days) * 86400000);
  const pad = (value) => String(value).padStart(2, "0");
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

/** Converts "HH:MM" to minutes past midnight, or null when unreadable. */
export function minutesFromClock(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function clockFromMinutes(total) {
  if (!Number.isFinite(total)) return "";
  const wrapped = ((Math.round(total) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Splits a span (in minutes past midnight, end may run past 1440) into day and night minutes,
 * where night is 22:00-06:00 under Rule 3(1) of the Noise Rules, 2000.
 */
export function splitDayNight(startMinute, endMinute) {
  let night = 0;
  let day = 0;
  for (let minute = startMinute; minute < endMinute; minute += 1) {
    const clock = ((minute % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    if (clock >= NIGHT_START_MINUTE || clock < NIGHT_END_MINUTE) night += 1;
    else day += 1;
  }
  return { dayMinutes: day, nightMinutes: night };
}

export function zoneById(id) {
  return NOISE_LIMITS.find((zone) => zone.id === id) || NOISE_LIMITS[2];
}

/**
 * Scores one logged incident against the Schedule limits for the chosen zone.
 * Returns { error } when the times cannot be read.
 */
export function scoreIncident(incident = {}, zoneId = "residential") {
  const zone = zoneById(zoneId);
  const start = minutesFromClock(incident.start);
  const end = minutesFromClock(incident.end);
  if (start === null || end === null) return { error: "Use 24-hour HH:MM times, for example 22:30." };

  const endAdjusted = end <= start ? end + MINUTES_PER_DAY : end;
  const durationMinutes = endAdjusted - start;
  if (durationMinutes <= 0 || durationMinutes > MINUTES_PER_DAY) {
    return { error: "An incident must be longer than zero minutes and shorter than 24 hours." };
  }

  const { dayMinutes, nightMinutes } = splitDayNight(start, endAdjusted);
  const applicableLimit = nightMinutes > 0 ? zone.night : zone.day;
  const decibels = Number(incident.decibels);
  const hasReading = Number.isFinite(decibels) && decibels > 0;
  const excess = hasReading ? decibels - applicableLimit : null;

  return {
    durationMinutes,
    dayMinutes,
    nightMinutes,
    applicableLimit,
    decibels: hasReading ? decibels : null,
    excess,
    overLimit: hasReading ? decibels > applicableLimit : false,
    complaintGrade: hasReading ? excess >= COMPLAINT_THRESHOLD_DB : false,
  };
}

function formatDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return "0 min";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} hr`;
  return `${hours} hr ${rest} min`;
}

/**
 * Builds the incident summary and the cease-and-desist letter.
 * Pure: dates and times are supplied by the caller.
 */
export function buildNoiseLetter(input = {}) {
  const senderName = String(input.senderName || "").trim();
  const senderAddress = String(input.senderAddress || "").trim();
  const recipientName = String(input.recipientName || "").trim();
  const recipientAddress = String(input.recipientAddress || "").trim();
  const letterDate = String(input.letterDate || "").trim();
  const zoneId = String(input.zoneId || "residential").trim();
  const source = String(input.source || "").trim();
  const remedy = String(input.remedy || "").trim();
  const complyDays = Number(input.complyDays ?? 7);
  const deliveryMode = String(input.deliveryMode || "").trim() || "registered post with acknowledgement due";
  const includeLegalRoute = input.includeLegalRoute !== false;
  const incidents = Array.isArray(input.incidents) ? input.incidents : [];

  if (!senderName) return { error: "Enter your own name — an unsigned letter carries no weight." };
  if (!recipientName) return { error: "Enter the name or flat number of the person the letter goes to." };
  if (!parseIso(letterDate)) return { error: "Enter a valid letter date." };
  if (!source) return { error: "Describe the source of the noise, for example a loudspeaker or late-night drilling." };
  if (!Number.isFinite(complyDays) || complyDays < 1 || complyDays > 90) {
    return { error: "Give the neighbour between 1 and 90 days to comply." };
  }

  const usable = incidents.filter(
    (item) => parseIso(item.date) && minutesFromClock(item.start) !== null && minutesFromClock(item.end) !== null,
  );
  if (usable.length === 0) {
    return { error: "Log at least one incident with a valid date and 24-hour start and end times." };
  }

  const zone = zoneById(zoneId);
  const scored = [];
  for (const item of usable) {
    const score = scoreIncident(item, zoneId);
    if (score.error) return { error: `${formatLongDate(item.date)}: ${score.error}` };
    scored.push({ ...item, ...score });
  }

  scored.sort((a, b) => (parseIso(a.date).stamp - parseIso(b.date).stamp) || 0);

  const totalMinutes = scored.reduce((sum, item) => sum + item.durationMinutes, 0);
  const nightMinutes = scored.reduce((sum, item) => sum + item.nightMinutes, 0);
  const nightIncidents = scored.filter((item) => item.nightMinutes > 0).length;
  const measured = scored.filter((item) => item.decibels !== null);
  const overLimit = measured.filter((item) => item.overLimit).length;
  const complaintGrade = measured.filter((item) => item.complaintGrade).length;
  const worstExcess = measured.reduce(
    (worst, item) => (item.excess !== null && item.excess > worst ? item.excess : worst),
    Number.NEGATIVE_INFINITY,
  );
  const peakDb = measured.reduce((peak, item) => (item.decibels > peak ? item.decibels : peak), 0);

  const firstDate = scored[0].date;
  const lastDate = scored[scored.length - 1].date;
  const deadline = addDays(letterDate, Math.trunc(complyDays));

  const notes = [];
  notes.push(
    `Your area is treated as a ${zone.label.toLowerCase()}, where the Schedule to the Noise Pollution (Regulation and Control) Rules, 2000 sets ${zone.day} dB(A) by day and ${zone.night} dB(A) at night.`,
  );
  if (nightIncidents > 0) {
    notes.push(
      `${nightIncidents} of the ${scored.length} logged incidents fell wholly or partly inside the 10 p.m. to 6 a.m. night window.`,
    );
  }
  if (complaintGrade > 0) {
    notes.push(
      `${complaintGrade} incident(s) exceeded the applicable limit by ${COMPLAINT_THRESHOLD_DB} dB(A) or more, which is the level at which Rule 8(1) allows a complaint to the designated authority.`,
    );
  }
  if (measured.length === 0) {
    notes.push(
      "No decibel readings were logged. A phone sound-level app reading, noted with the date and time, makes the log far harder to dismiss.",
    );
  }

  const logLines = scored.map((item) => {
    const parts = [
      formatLongDate(item.date),
      `${item.start}-${item.end}`,
      formatDuration(item.durationMinutes),
      item.decibels !== null ? `${item.decibels} dB(A) vs ${item.applicableLimit} dB(A) limit` : `limit ${item.applicableLimit} dB(A)`,
    ];
    const description = String(item.description || "").trim();
    if (description) parts.push(description);
    return `  ${parts.join(" | ")}`;
  });

  const lines = [];
  lines.push(senderName);
  if (senderAddress) lines.push(senderAddress);
  lines.push("");
  lines.push(`Date: ${formatLongDate(letterDate)}`);
  lines.push("");
  lines.push(`To: ${recipientName}`);
  if (recipientAddress) lines.push(recipientAddress);
  lines.push("");
  lines.push("Subject: Notice to cease and desist from causing a noise nuisance");
  lines.push("");
  lines.push(`Dear ${recipientName},`);
  lines.push("");
  lines.push(
    `I live at ${senderAddress || "the adjoining premises"}. Since ${formatLongDate(firstDate)} I have been disturbed repeatedly by ${source} coming from your premises. This letter records those occasions and asks you to stop.`,
  );
  lines.push("");
  lines.push(`Record of incidents (${scored.length} occasions between ${formatLongDate(firstDate)} and ${formatLongDate(lastDate)})`);
  lines.push(...logLines);
  lines.push("");
  lines.push(`Total disturbance logged: ${formatDuration(totalMinutes)}, of which ${formatDuration(nightMinutes)} fell in the 10 p.m. to 6 a.m. night period.`);
  lines.push("");
  lines.push("The legal position");
  notes.forEach((note) => lines.push(`  - ${note}`));
  if (nightMinutes > 0) {
    lines.push(
      "  - Rule 5(2) of the same Rules prohibits the use of a loudspeaker or public address system between 10 p.m. and 6 a.m. except inside closed premises.",
    );
  }
  lines.push(
    "  - Independently of the Rules, persistent noise that unreasonably interferes with my use and enjoyment of my home is a private nuisance in tort, for which a civil court can grant an injunction and damages.",
  );
  lines.push("");
  lines.push("What I am asking you to do");
  lines.push(`  - ${remedy || `Stop ${source} entirely between 10 p.m. and 6 a.m., and keep it within the limits above at all other times.`}`);
  lines.push(`  - Confirm in writing, by ${formatLongDate(deadline)}, that you will do so.`);
  lines.push("");
  if (includeLegalRoute) {
    lines.push(
      `If the disturbance continues after ${formatLongDate(deadline)}, I intend to complain to the local police and to the authority designated under Rule 8 of the Noise Pollution (Regulation and Control) Rules, 2000, to seek an order for removal of the nuisance from the jurisdictional Magistrate, and to bring a civil suit for an injunction and damages. I would much rather resolve this between us.`,
    );
    lines.push("");
  }
  lines.push(
    `This letter is being sent by ${deliveryMode}, and I am keeping a copy along with the log above.`,
  );
  lines.push("");
  lines.push("Yours sincerely,");
  lines.push("");
  lines.push("");
  lines.push(senderName);

  return {
    letter: lines.join("\n"),
    incidentCount: scored.length,
    nightIncidents,
    totalMinutes,
    nightMinutes,
    totalDurationText: formatDuration(totalMinutes),
    nightDurationText: formatDuration(nightMinutes),
    overLimit,
    complaintGrade,
    peakDb: measured.length > 0 ? peakDb : null,
    worstExcess: measured.length > 0 && Number.isFinite(worstExcess) ? worstExcess : null,
    zone,
    deadline,
    deadlineText: formatLongDate(deadline),
    firstDate,
    lastDate,
    rows: scored.map((item) => ({
      date: formatLongDate(item.date),
      window: `${item.start}-${item.end}`,
      duration: formatDuration(item.durationMinutes),
      night: item.nightMinutes > 0,
      decibels: item.decibels,
      limit: item.applicableLimit,
      excess: item.excess,
      description: String(item.description || "").trim(),
    })),
    notes,
  };
}
