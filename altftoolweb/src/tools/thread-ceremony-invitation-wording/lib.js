/**
 * Thread ceremony (upanayanam / janeu / munj) invitation wording builder.
 *
 * Pure module: no React, no DOM, no Date.now. Every date and time used in the
 * invitation is passed in, so the same input always produces the same wording.
 *
 * Names and customs referenced:
 *  - The samskara is called Upanayana in Sanskrit. Regionally it is Janeu or
 *    Yagyopavit Sanskar in the north, Munj or Vratabandha in Maharashtra,
 *    Upanayanam or Brahmopadesam in Tamil Nadu, Upanayanam or Odugu in Andhra
 *    and Telangana, Upanayana or Vratabandha in Karnataka, Janoi or Yagnopavit
 *    Sanskar in Gujarat, and Upanayan or Paita in Bengal.
 *  - The central rite is the Gayatri upadesam - the boy is taught the Gayatri
 *    mantra by his father or guru - followed by the tying of the yajnopavita,
 *    the three-strand sacred thread.
 *  - Bhikshandehi, where the boy asks elders for his first alms, and Kashi
 *    Yatra, the symbolic setting out for Kashi, are commonly part of the day.
 *  - Manusmriti 2.36 prescribes the eighth year from conception for a Brahmin
 *    boy, the eleventh for a Kshatriya and the twelfth for a Vaishya. In
 *    practice families follow their own custom and the priest's muhurtham, so
 *    the age note here is informational only.
 */

/** Manusmriti 2.36 - prescribed year (from conception) for a Brahmin boy. */
export const TRADITIONAL_AGE_BRAHMIN = 8;

/** Manusmriti 2.36 - prescribed year for a Kshatriya boy. */
export const TRADITIONAL_AGE_KSHATRIYA = 11;

/** Manusmriti 2.36 - prescribed year for a Vaishya boy. */
export const TRADITIONAL_AGE_VAISHYA = 12;

/** Strands in the yajnopavita worn by a brahmachari. */
export const YAJNOPAVITA_STRANDS = 3;

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

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const STYLES = [
  {
    id: "north-janeu",
    label: "North Indian - Janeu / Yagyopavit Sanskar",
    ceremonyName: "Yagyopavit Sanskar (Janeu)",
    invocation: "|| Shri Ganeshaya Namah ||",
    honorific: "Chiranjeev",
    mealLine: "Prasad and lunch will follow the havan.",
  },
  {
    id: "maharashtrian-munj",
    label: "Maharashtrian - Munj / Vratabandha",
    ceremonyName: "Munj (Vratabandha)",
    invocation: "|| Shri Ganeshaya Namah ||",
    honorific: "Chi.",
    mealLine: "Bhojan will be served after the Munj vidhi.",
  },
  {
    id: "tamil-brahmopadesam",
    label: "Tamil - Upanayanam / Brahmopadesam",
    ceremonyName: "Upanayanam (Brahmopadesam)",
    invocation: "|| Om Sri Gurubhyo Namaha ||",
    honorific: "Chi.",
    mealLine: "Bhojanam will be served after the Brahmopadesam.",
  },
  {
    id: "telugu-upanayanam",
    label: "Telugu - Upanayanam / Odugu",
    ceremonyName: "Upanayanam",
    invocation: "|| Sri Gurubhyo Namaha ||",
    honorific: "Chi.",
    mealLine: "Bhojanam will be served after the muhurtham.",
  },
  {
    id: "kannada-vratabandha",
    label: "Kannada - Upanayana / Vratabandha",
    ceremonyName: "Upanayana (Vratabandha)",
    invocation: "|| Shri Gurubhyo Namaha ||",
    honorific: "Chi.",
    mealLine: "Bhojana will be served after the Upanayana.",
  },
  {
    id: "gujarati-janoi",
    label: "Gujarati - Janoi / Yagnopavit Sanskar",
    ceremonyName: "Yagnopavit Sanskar (Janoi)",
    invocation: "|| Shree Ganeshaya Namah ||",
    honorific: "Chi.",
    mealLine: "Bhojan will follow the Yagnopavit vidhi.",
  },
  {
    id: "bengali-upanayan",
    label: "Bengali - Upanayan / Paita",
    ceremonyName: "Upanayan (Paita)",
    invocation: "|| Om Shri Durgayai Namah ||",
    honorific: "Kalyaniyeshu",
    mealLine: "Bhog and lunch will follow the ceremony.",
  },
];

export const TONES = [
  {
    id: "traditional",
    label: "Traditional and formal",
    opening:
      "With the blessings of the Almighty and our elders, we joyfully invite you to the {ceremony} of our son",
    closing:
      "Your gracious presence and blessings on this auspicious occasion will complete our joy.",
  },
  {
    id: "warm",
    label: "Warm and modern",
    opening: "We are so happy to invite you to the {ceremony} of our son",
    closing: "It would mean a lot to us to have you there for the morning and to stay on for lunch.",
  },
  {
    id: "brief",
    label: "Brief and practical",
    opening: "You are invited to the {ceremony} of",
    closing: "Please do come and bless him.",
  },
];

const byId = (list, id) => list.find((item) => item.id === id) || null;

const clean = (value) => String(value == null ? "" : value).trim().replace(/\s+/g, " ");

/** Days in a given month; month is 1-12. */
function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Parse a strict YYYY-MM-DD string, rejecting impossible dates like 2026-02-30. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return null;
  if (day > daysInMonth(year, month)) return null;
  return { year, month, day, ordinal: year * 10000 + month * 100 + day };
}

/** Parse a 24-hour HH:MM string into hours and minutes. */
export function parseTime(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

/** "07:30" -> "7:30 AM"; "00:05" -> "12:05 AM"; "13:00" -> "1:00 PM". */
export function formatTime12(value) {
  const parsed = parseTime(value);
  if (!parsed) return "";
  const suffix = parsed.hours < 12 ? "AM" : "PM";
  const hour12 = parsed.hours % 12 === 0 ? 12 : parsed.hours % 12;
  return `${hour12}:${String(parsed.minutes).padStart(2, "0")} ${suffix}`;
}

/** "2026-04-12" -> "Sunday, 12 April 2026". */
export function formatLongDate(value) {
  const parsed = parseIsoDate(value);
  if (!parsed) return "";
  const weekday = WEEKDAYS[new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)).getUTCDay()];
  return `${weekday}, ${parsed.day} ${MONTHS[parsed.month - 1]} ${parsed.year}`;
}

/**
 * Exact calendar age on a given date, borrowing days from the month before the
 * target date. Returns null when either date is invalid or the birth date is
 * after the ceremony date.
 */
export function computeAgeOnDate(birthIso, onIso) {
  const birth = parseIsoDate(birthIso);
  const on = parseIsoDate(onIso);
  if (!birth || !on) return null;
  if (birth.ordinal > on.ordinal) return null;

  let years = on.year - birth.year;
  let months = on.month - birth.month;
  let days = on.day - birth.day;

  if (days < 0) {
    const previousMonth = on.month === 1 ? 12 : on.month - 1;
    const previousYear = on.month === 1 ? on.year - 1 : on.year;
    days += daysInMonth(previousYear, previousMonth);
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  return { years, months, days };
}

/**
 * Build the invitation wording.
 *
 * @param {object} input
 * @param {string} input.boyName        Name of the child.
 * @param {string} [input.fatherName]
 * @param {string} [input.motherName]
 * @param {string} [input.grandparents] Free text, e.g. "grandson of ...".
 * @param {string} [input.familyName]   Signed as "the ... family".
 * @param {string} input.ceremonyDate   YYYY-MM-DD.
 * @param {string} input.muhurthamTime  HH:MM in 24-hour form.
 * @param {string} input.venue          Venue name and address.
 * @param {string} [input.styleId]      One of STYLES ids.
 * @param {string} [input.toneId]       One of TONES ids.
 * @param {string} [input.birthDate]    YYYY-MM-DD, optional, for the age note.
 * @param {string} [input.rsvp]         Phone or contact line.
 * @param {boolean} [input.includeKashiYatra] Mention Kashi Yatra and Bhikshandehi.
 * @param {boolean} [input.includeMeal]       Mention the meal after the rite.
 * @returns {{error:string}|object}
 */
export function buildThreadCeremonyInvitation(input) {
  const data = input && typeof input === "object" ? input : {};

  const boyName = clean(data.boyName);
  const fatherName = clean(data.fatherName);
  const motherName = clean(data.motherName);
  const grandparents = clean(data.grandparents);
  const familyName = clean(data.familyName);
  const venue = clean(data.venue);
  const rsvp = clean(data.rsvp);

  if (!boyName) return { error: "Enter the name of the boy whose ceremony it is." };
  if (boyName.length > 60) return { error: "Name is too long - keep it under 60 characters." };
  if (!venue) return { error: "Enter the venue so guests know where to come." };

  const date = parseIsoDate(data.ceremonyDate);
  if (!date) return { error: "Pick a valid ceremony date." };

  const time = parseTime(data.muhurthamTime);
  if (!time) return { error: "Enter the muhurtham time in 24-hour HH:MM form, for example 07:30." };

  const style = byId(STYLES, data.styleId) || STYLES[0];
  const tone = byId(TONES, data.toneId) || TONES[0];

  let ageNote = "";
  let age = null;
  if (clean(data.birthDate)) {
    age = computeAgeOnDate(data.birthDate, data.ceremonyDate);
    if (!age) {
      return { error: "The date of birth must be a valid date on or before the ceremony date." };
    }
    const monthPart = age.months === 1 ? "1 month" : `${age.months} months`;
    ageNote = `He will be ${age.years} years and ${monthPart} old on the day. Manusmriti 2.36 names the eighth year for a Brahmin boy, the eleventh for a Kshatriya and the twelfth for a Vaishya; families follow their own custom and the priest's muhurtham.`;
  }

  const dateLong = formatLongDate(data.ceremonyDate);
  const time12 = formatTime12(data.muhurthamTime);

  const parentLine = (() => {
    if (fatherName && motherName) return `son of ${motherName} and ${fatherName}`;
    if (fatherName) return `son of ${fatherName}`;
    if (motherName) return `son of ${motherName}`;
    return "";
  })();

  const opening = tone.opening.replace("{ceremony}", style.ceremonyName);

  const lines = [style.invocation, "", opening, "", `${style.honorific} ${boyName}`];

  if (parentLine) lines.push(parentLine);
  if (grandparents) lines.push(grandparents);

  lines.push("", `Muhurtham: ${dateLong} at ${time12}`, `Venue: ${venue}`);

  if (data.includeKashiYatra) {
    lines.push(
      "",
      "Do join us for the Gayatri upadesam, the tying of the yajnopavita, Bhikshandehi and the Kashi Yatra.",
    );
  }
  if (data.includeMeal) {
    lines.push(style.mealLine);
  }

  lines.push("", tone.closing);

  if (familyName) lines.push("", `- The ${familyName} family`);
  if (rsvp) lines.push(`RSVP: ${rsvp}`);

  const invitation = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  const shortInvitation = [
    `${style.ceremonyName} of ${style.honorific} ${boyName}`,
    `${dateLong}, ${time12}`,
    venue,
    rsvp ? `RSVP: ${rsvp}` : "",
    "Do come and bless him.",
  ]
    .filter(Boolean)
    .join("\n");

  const wordCount = invitation.split(/\s+/).filter(Boolean).length;

  return {
    style,
    tone,
    invitation,
    shortInvitation,
    dateLong,
    time12,
    ageNote,
    age,
    wordCount,
    characterCount: invitation.length,
    shortCharacterCount: shortInvitation.length,
  };
}
