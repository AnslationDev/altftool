/**
 * Muhurat Terms Glossary — reference vocabulary plus the classical day-division maths.
 *
 * Definitions follow the standard Panchang (five-limb almanac) tradition as set out
 * in Indian calendrical works such as the Surya Siddhanta and the Rashtriya Panchang.
 * Nothing here is astrological advice; it explains what the terms mean and how the
 * published time windows are arithmetically derived.
 */

export const CATEGORIES = [
  { id: "panchang", label: "Panchang element", note: "The five limbs every traditional almanac lists for a day." },
  { id: "auspicious", label: "Auspicious period", note: "Windows traditionally chosen for beginnings." },
  { id: "inauspicious", label: "Period to avoid", note: "Windows traditionally avoided for beginnings." },
  { id: "ceremony", label: "Ceremony muhurat", note: "Named muhurats for specific life-cycle rites." },
  { id: "calendar", label: "Calendar & reckoning", note: "Months, eras, pakshas and the units of time." },
  { id: "astronomy", label: "Astronomical term", note: "The sky positions the almanac is computed from." },
];

/** Classical division: one full day and night (ahoratra) is split into 30 muhurtas. */
export const MUHURTAS_PER_AHORATRA = 30;
/** Daylight alone is split into 15 muhurtas; night into the other 15. */
export const MUHURTAS_PER_DAY_HALF = 15;
/** Abhijit is the 8th of the 15 daytime muhurtas, so it straddles local solar noon. */
export const ABHIJIT_MUHURTA_INDEX = 8;
/** Brahma Muhurta is the 14th of the 15 night muhurtas — the second-last before sunrise. */
export const BRAHMA_MUHURTA_INDEX = 14;
/** Rahu Kaal, Gulika Kaal and Yamaganda each occupy one of eight equal daylight parts. */
export const DAY_PARTS = 8;

/**
 * Which of the eight daylight parts each period falls in, by weekday.
 * Index 0 = Sunday. Values are 1-based part numbers as printed in Panchangs.
 */
export const RAHU_KAAL_PART = [8, 2, 7, 5, 6, 4, 3];
export const GULIKA_KAAL_PART = [7, 6, 5, 4, 3, 2, 1];
export const YAMAGANDA_PART = [5, 4, 3, 2, 1, 7, 6];

export const WEEKDAYS = [
  "Sunday (Ravivara)",
  "Monday (Somavara)",
  "Tuesday (Mangalavara)",
  "Wednesday (Budhavara)",
  "Thursday (Guruvara)",
  "Friday (Shukravara)",
  "Saturday (Shanivara)",
];

export const TERMS = [
  // --- Panchang elements ---
  { term: "Panchang", also: "Panchanga", category: "panchang", short: "The traditional Indian almanac for a single day, built from five elements.", detail: "Panchanga literally means 'five limbs': tithi, vara, nakshatra, yoga and karana. A Panchang states the value of each of the five for a given date and place, along with sunrise, sunset and the derived auspicious and inauspicious windows." },
  { term: "Tithi", category: "panchang", short: "A lunar day — the time the Moon takes to gain 12 degrees of elongation on the Sun.", detail: "Thirty tithis make one lunar month, fifteen in each paksha. Because the Moon's speed varies, a tithi runs anywhere from about 19 to about 26 hours, so a tithi rarely starts at sunrise and its ending time is printed in every Panchang." },
  { term: "Vara", also: "Vaara", category: "panchang", short: "The weekday, counted from sunrise to sunrise rather than midnight to midnight.", detail: "The seven varas are named for the Sun, Moon, Mars, Mercury, Jupiter, Venus and Saturn, the same planetary order that underlies the Western weekday names. Traditionally the day changes at local sunrise, not at midnight." },
  { term: "Nakshatra", category: "panchang", short: "One of 27 lunar mansions, each an equal 13 degrees 20 minutes arc of the ecliptic.", detail: "27 x 13 degrees 20 minutes = 360 degrees. The nakshatra of a moment is the one the Moon occupies. Each is subdivided into four padas of 3 degrees 20 minutes, which is what birth-star charts refer to." },
  { term: "Yoga", category: "panchang", short: "One of 27 divisions formed by adding the Sun's and Moon's longitudes.", detail: "The combined longitude is divided into 27 parts of 13 degrees 20 minutes. This is a calendrical yoga and is unrelated to the physical practice of yoga; the well-known names include Vishkambha, Siddhi, Vyatipata and Vaidhriti." },
  { term: "Karana", category: "panchang", short: "Half a tithi — 60 karanas fall in a lunar month.", detail: "Eleven karanas exist. Seven movable ones repeat eight times each (56) and four fixed ones occur once each (4), giving 60 per lunar month. The seventh movable karana, Vishti, is the one commonly called Bhadra." },

  // --- Auspicious periods ---
  { term: "Muhurta", also: "Muhurat", category: "auspicious", short: "A unit of about 48 minutes, and by extension any chosen auspicious moment.", detail: "A full day and night is divided into 30 muhurtas, so an average muhurta is 1440 / 30 = 48 minutes. In practice daylight is divided into 15 and night into 15, so a summer daytime muhurta is longer than 48 minutes and a winter one shorter." },
  { term: "Abhijit Muhurat", category: "auspicious", short: "The 8th of the 15 daytime muhurtas — the window straddling local solar noon.", detail: "Because it is the middle daytime muhurta it always contains true midday for the place. It is widely treated as a fallback window for starting work when no other muhurat is available. It is conventionally not used on Wednesdays in several regional traditions." },
  { term: "Brahma Muhurta", category: "auspicious", short: "The 14th of the 15 night muhurtas, ending roughly 48 minutes before sunrise.", detail: "With a twelve-hour night it runs from about 96 minutes to about 48 minutes before sunrise. Classical texts recommend it for study, recitation and meditation; the timing shifts through the year with the length of the night." },
  { term: "Choghadiya", also: "Chogadiya", category: "auspicious", short: "Eight equal parts of daylight and eight of night, each labelled good, neutral or best avoided.", detail: "Each choghadiya lasts one eighth of the daylight (about 90 minutes at the equinox). Amrit, Shubh and Labh are treated as favourable, Char as neutral or good for travel, and Rog, Kaal and Udveg as best avoided. The sequence rotates with the weekday." },
  { term: "Amrit Kaal", category: "auspicious", short: "A short favourable window derived from the running nakshatra's duration.", detail: "It is calculated from a fixed fraction of the current nakshatra span, so its length and position change every day and every place. Panchangs print it as an explicit clock range rather than a rule of thumb." },
  { term: "Sarvartha Siddhi Yoga", category: "auspicious", short: "A weekday and nakshatra pairing treated as favourable for almost any purpose.", detail: "The name means 'accomplishment of all objectives'. It occurs when a specific nakshatra is running on a specific weekday, for example Hasta on a Sunday or Ashwini on a Monday, and it is one of the most commonly cited general-purpose yogas." },
  { term: "Amrit Siddhi Yoga", category: "auspicious", short: "Another weekday-nakshatra pairing regarded as strongly favourable.", detail: "Formed by combinations such as Rohini on a Monday or Pushya on a Thursday. Where an Amrit Siddhi combination clashes with a Mrityu (adverse) combination, Panchangs usually print both and note the overlap." },
  { term: "Ravi Yoga", category: "auspicious", short: "A nakshatra combination said to override several adverse indications.", detail: "It is calculated from the position of the Moon's nakshatra relative to the Sun's. Panchangs list its start and end clock times for the day rather than a rule the reader applies by hand." },
  { term: "Dwipushkar and Tripushkar Yoga", category: "auspicious", short: "Combinations said to double or triple the result of what is begun.", detail: "Formed when particular tithis, weekdays and nakshatras coincide. Because outcomes are considered multiplied in either direction, tradition uses these windows for acquisitions rather than for anything one would not want repeated." },
  { term: "Pushya Nakshatra", category: "auspicious", short: "The 8th nakshatra, treated as the most favourable for purchases and new ventures.", detail: "Pushya falling on a Thursday is called Guru Pushya and on a Sunday Ravi Pushya; both are heavily used for buying gold, vehicles and property. Pushya is traditionally not used for weddings." },
  { term: "Godhuli Bela", category: "auspicious", short: "The 'cow-dust hour' at dusk, used for weddings in several regional traditions.", detail: "It refers to the short period around sunset when cattle return home. It is used as a wedding muhurat particularly in north Indian practice, and its timing follows sunset for the place and date." },
  { term: "Hora", category: "auspicious", short: "A planetary hour — daylight and night each split into 12 parts ruled by a planet in turn.", detail: "The first hora of the day is ruled by the planet of the weekday, and the sequence then follows the Chaldean order Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon. Hora lengths equal one twelfth of the actual daylight or night length, so they are not exactly 60 minutes." },

  // --- Periods to avoid ---
  { term: "Rahu Kaal", also: "Rahu Kalam", category: "inauspicious", short: "One of eight equal daylight parts, differing by weekday, avoided for starting anything new.", detail: "Daylight is divided into eight parts. The part that counts as Rahu Kaal is the 8th on Sunday, 2nd on Monday, 7th on Tuesday, 5th on Wednesday, 6th on Thursday, 4th on Friday and 3rd on Saturday. Its length equals daylight divided by eight, so it is longer in summer than in winter." },
  { term: "Gulika Kaal", also: "Gulikai, Mandi", category: "inauspicious", short: "Another of the eight daylight parts, associated with the shadow point Gulika.", detail: "By the usual table it is the 7th part on Sunday, 6th on Monday, 5th on Tuesday, 4th on Wednesday, 3rd on Thursday, 2nd on Friday and 1st on Saturday. It is avoided for beginnings in south Indian practice in particular." },
  { term: "Yamaganda", also: "Yamaganda Kaal", category: "inauspicious", short: "A third eighth-of-daylight window avoided for auspicious beginnings.", detail: "It falls in the 5th part on Sunday, 4th on Monday, 3rd on Tuesday, 2nd on Wednesday, 1st on Thursday, 7th on Friday and 6th on Saturday. Rahu Kaal, Gulika Kaal and Yamaganda together account for three of the eight daylight parts on any weekday." },
  { term: "Durmuhurtam", also: "Durmuhurta", category: "inauspicious", short: "One or two specific muhurtas of the day marked unfavourable, varying by weekday.", detail: "Unlike Rahu Kaal, which is one eighth of daylight, a durmuhurtam is one fifteenth of daylight because it is counted in muhurtas. Panchangs print it as a clock range, and on some weekdays there are two separate ranges." },
  { term: "Varjyam", also: "Varjya", category: "inauspicious", short: "A portion of each nakshatra's run that is set aside as unfit for new work.", detail: "Each of the 27 nakshatras has its own fraction, expressed in ghatis, which is converted to a clock window using the nakshatra's actual start and end times for that day and place." },
  { term: "Bhadra", also: "Vishti Karana", category: "inauspicious", short: "The seventh movable karana, avoided for auspicious work while it runs.", detail: "Bhadra occurs several times a month and may fall by day or by night. Traditional practice distinguishes where Bhadra is considered to be 'residing', and many almanacs note whether it affects the earth, the heavens or the underworld on that occasion." },
  { term: "Panchak", category: "inauspicious", short: "The roughly five-day stretch while the Moon transits the last five nakshatras.", detail: "It runs from the second half of Dhanishta through Shatabhisha, Purva Bhadrapada, Uttara Bhadrapada and Revati. Certain specific activities such as roofing a house or buying fuel are traditionally deferred, rather than all activity." },
  { term: "Adhik Maas", also: "Purushottam Maas, Mala Maas", category: "inauspicious", short: "The intercalary lunar month inserted to keep the lunar and solar years aligned.", detail: "A lunar year of twelve months is about eleven days shorter than a solar year, so an extra month is added roughly every 32 to 33 months — seven times in 19 years. Auspicious ceremonies are generally deferred out of it, although devotional observance is encouraged." },
  { term: "Kharmas", also: "Malmas, Dhanurmas", category: "inauspicious", short: "The solar month while the Sun transits Sagittarius, and again while it transits Pisces.", detail: "Roughly mid-December to mid-January and mid-March to mid-April in the current alignment. Weddings and housewarmings are commonly deferred until the Sun moves into the next sign." },
  { term: "Chaturmas", category: "inauspicious", short: "The four monsoon months from Devshayani Ekadashi to Prabodhini Ekadashi.", detail: "Traditionally observed from the eleventh day of the bright half of Ashadha to the same tithi in Kartika. Weddings and several other ceremonies are deferred, while vows, fasting and study are emphasised." },
  { term: "Shukra Asta and Guru Asta", category: "inauspicious", short: "The weeks when Venus or Jupiter is too close to the Sun to be seen.", detail: "Combustion makes the planet invisible in twilight for a period that varies by planet and by cycle. Because Venus and Jupiter are the karakas for marriage in this tradition, wedding muhurats are not issued during their combustion." },
  { term: "Holashtak", category: "inauspicious", short: "The eight days ending at Holika Dahan, when auspicious ceremonies are deferred.", detail: "It runs from the eighth day of the bright half of Phalguna to the full moon. The observance is strongest in north India, particularly Punjab, Himachal Pradesh and parts of Haryana." },
  { term: "Pitru Paksha", also: "Shraddha Paksha, Mahalaya Paksha", category: "inauspicious", short: "A sixteen-day fortnight dedicated to ancestral rites, when new ventures are deferred.", detail: "It runs through the dark half of Bhadrapada, ending at Sarva Pitru Amavasya. Shraddha and tarpana are performed; purchases and celebrations are generally postponed to the Navratri that follows." },
  { term: "Sutak and Patak", category: "inauspicious", short: "The ritual-impurity window around an eclipse, a birth or a death.", detail: "For a solar eclipse the eclipse sutak conventionally begins about 12 hours before contact and for a lunar eclipse about 9 hours before. Temples close and cooking and worship are paused until the eclipse ends and a bath is taken." },

  // --- Ceremony muhurats ---
  { term: "Vivah Muhurat", category: "ceremony", short: "The chosen window for the wedding ceremony itself, usually the phera or lagna.", detail: "Selection combines the tithi, nakshatra, weekday and lagna with the visibility of Venus and Jupiter. Because of Chaturmas, Kharmas and planetary combustion, most years have only a limited number of published wedding dates." },
  { term: "Griha Pravesh", category: "ceremony", short: "The housewarming muhurat for entering a newly built or newly bought home.", detail: "Traditional practice distinguishes Apoorva (a brand-new house), Sapoorva (returning after a long absence) and Dwandwah (re-entering after repairs), each with its own preferred months and nakshatras." },
  { term: "Bhoomi Pujan", also: "Shilanyas", category: "ceremony", short: "The groundbreaking or foundation-stone muhurat before construction begins.", detail: "Bhoomi Pujan is the worship of the site before digging; Shilanyas is the laying of the first stone. Both are timed to a fixed lagna and generally avoid Rahu Kaal and the Panchak window for the site's location." },
  { term: "Namkaran", category: "ceremony", short: "The naming ceremony, classically held on the eleventh or twelfth day after birth.", detail: "One of the sixteen samskaras. The chosen syllable for the name is often taken from the pada of the nakshatra the Moon occupied at birth, which is why the birth nakshatra is recorded so carefully." },
  { term: "Annaprashan", category: "ceremony", short: "The first-solid-food muhurat, usually in the sixth to eighth month.", detail: "Traditionally held in an even month for a boy and an odd month for a girl in many regional practices. The window avoids the Panchak nakshatras and the weekday's Rahu Kaal." },
  { term: "Mundan", also: "Chudakarana", category: "ceremony", short: "The first head-shaving muhurat, typically in the first or third year.", detail: "One of the sixteen samskaras. It is conventionally not performed during Adhik Maas, in the child's birth month, or while the Moon transits certain nakshatras." },
  { term: "Upanayana", also: "Janeu, Yagnopavita", category: "ceremony", short: "The sacred-thread initiation muhurat marking the start of formal study.", detail: "Classically timed to specific months and to nakshatras associated with learning. Vidyarambha, the separate rite for beginning letters, is often timed to Vijayadashami or to the Ashwini and Hasta nakshatras." },
  { term: "Vahan Kharidi Muhurat", category: "ceremony", short: "The window chosen for taking delivery of a vehicle.", detail: "Pushya, Rohini, Hasta, Anuradha and Revati are among the nakshatras usually preferred, and delivery is scheduled outside Rahu Kaal and Yamaganda for the day. It is a modern application of a classical purchase muhurat." },

  // --- Calendar and reckoning ---
  { term: "Paksha", category: "calendar", short: "A fortnight — the waxing Shukla Paksha or the waning Krishna Paksha.", detail: "Shukla Paksha runs from the new moon to the full moon, Krishna Paksha from the full moon to the new moon. Each holds fifteen tithis, so the tithi number alone is ambiguous without the paksha." },
  { term: "Amanta and Purnimanta", category: "calendar", short: "The two conventions for where a lunar month begins — at the new moon or at the full moon.", detail: "Amanta reckoning, used in Gujarat, Maharashtra and most of the south, ends the month at the new moon. Purnimanta reckoning, used across most of the north, ends it at the full moon. The same date can therefore carry two different month names." },
  { term: "Sankranti", category: "calendar", short: "The Sun's entry into a new sidereal zodiac sign; twelve occur each year.", detail: "Makar Sankranti, the entry into Capricorn, falls around 14 January in the current alignment and drifts about one day every 70 years because the sidereal zodiac is fixed to the stars rather than to the equinox." },
  { term: "Ekadashi", category: "calendar", short: "The eleventh tithi of each paksha, observed as a fast — 24 in a normal year.", detail: "There are two Ekadashis a lunar month, so 24 in a common year and 26 in a year with an Adhik Maas. Devshayani and Prabodhini Ekadashi bracket the Chaturmas period." },
  { term: "Amavasya and Purnima", category: "calendar", short: "New moon and full moon — the two hinge points of the lunar month.", detail: "Amavasya is the thirtieth tithi and Purnima the fifteenth. Many muhurats avoid both, though specific observances such as Kartik Purnima and Mahalaya Amavasya are timed to them deliberately." },
  { term: "Ghati and Vighati", category: "calendar", short: "Traditional time units: one ghati is 24 minutes, one vighati is 24 seconds.", detail: "Sixty ghatis make a full day of 1440 minutes and sixty vighatis make a ghati. Classical rules — Varjyam fractions for instance — are stated in ghatis, which is why converting them needs the actual sunrise for the place." },
  { term: "Vikram Samvat", category: "calendar", short: "A calendar era running about 57 years ahead of the Common Era.", detail: "Its epoch is 57 BCE. The Shaka Samvat, used in the Indian national civil calendar, has an epoch of 78 CE and so runs about 78 years behind the Common Era." },
  { term: "Nanda, Bhadra, Jaya, Rikta, Purna", category: "calendar", short: "The five-fold classification of tithis by their number within the paksha.", detail: "Tithis 1, 6 and 11 are Nanda; 2, 7 and 12 Bhadra; 3, 8 and 13 Jaya; 4, 9 and 14 Rikta; 5, 10 and 15 Purna. Rikta tithis are the ones generally avoided for beginnings." },

  // --- Astronomical terms ---
  { term: "Lagna", also: "Ascendant", category: "astronomy", short: "The zodiac sign rising on the eastern horizon at a given moment and place.", detail: "The lagna changes about every two hours and depends on latitude, so a muhurat fixed by lagna is genuinely local — the same clock time gives a different lagna in Chennai and in Delhi." },
  { term: "Rashi", category: "astronomy", short: "A zodiac sign — one of twelve equal 30 degree arcs of the ecliptic.", detail: "Each rashi spans 2 and 1/4 nakshatras, since 30 divided by 13 degrees 20 minutes equals 2.25. Moon sign (Chandra rashi) rather than Sun sign is the usual reference point in Indian practice." },
  { term: "Ayanamsa", category: "astronomy", short: "The offset between the tropical zodiac and the sidereal zodiac used in Indian reckoning.", detail: "It grows by about 50.3 arcseconds a year through the precession of the equinoxes and currently stands near 24 degrees. Different schools use slightly different values, chiefly Lahiri, Raman and Krishnamurti, which is why two Panchangs can disagree by a few minutes." },
  { term: "Nirayana and Sayana", category: "astronomy", short: "Sidereal and tropical measurement — the two ways of fixing zodiac positions.", detail: "Nirayana positions are measured from a fixed star point and are what Indian Panchangs use. Sayana positions are measured from the vernal equinox. The difference between them is the ayanamsa." },
  { term: "Udaya Lagna and Sunrise reckoning", category: "astronomy", short: "The rule that the traditional day begins at local sunrise, not at midnight.", detail: "Because tithi, nakshatra and vara are all read from sunrise, a Panchang is valid for one place only. Sunrise in Kolkata and in Ahmedabad differ by well over an hour, which shifts every derived window with it." },
];

const collator = new Intl.Collator("en", { sensitivity: "base" });

/** Convert minutes past midnight into a 24-hour HH:MM string. */
export function formatClock(minutes) {
  if (!Number.isFinite(minutes)) return "—";
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Parse an "HH:MM" string into minutes past midnight, or NaN. */
export function parseClock(value) {
  const match = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(String(value ?? ""));
  if (!match) return NaN;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return NaN;
  return h * 60 + m;
}

/**
 * Classical day divisions for one date and place.
 * Inputs are minutes past midnight for sunrise and sunset, plus a weekday index
 * (0 = Sunday). Returns clock windows in minutes past midnight.
 */
export function computeDayDivisions({ sunrise, sunset, weekday = 0 } = {}) {
  const rise = Number(sunrise);
  const set = Number(sunset);
  const day = Number(weekday);

  if (!Number.isFinite(rise) || !Number.isFinite(set)) {
    return { error: "Enter sunrise and sunset as 24-hour times, for example 06:15." };
  }
  if (rise < 0 || rise > 1439 || set < 0 || set > 1439) {
    return { error: "Sunrise and sunset must fall within a single 24-hour day." };
  }
  if (set <= rise) {
    return { error: "Sunset must be later than sunrise on the same calendar day." };
  }
  if (!Number.isInteger(day) || day < 0 || day > 6) {
    return { error: "Choose a weekday between Sunday and Saturday." };
  }

  const daylight = set - rise;
  const night = 1440 - daylight;
  if (daylight < 60) {
    return { error: "Daylight of under an hour is outside the range these divisions assume." };
  }

  const dayMuhurta = daylight / MUHURTAS_PER_DAY_HALF;
  const nightMuhurta = night / MUHURTAS_PER_DAY_HALF;
  const dayPart = daylight / DAY_PARTS;

  const partWindow = (partNumber) => ({
    start: rise + (partNumber - 1) * dayPart,
    end: rise + partNumber * dayPart,
    part: partNumber,
  });

  return {
    daylight,
    night,
    dayMuhurta,
    nightMuhurta,
    dayPart,
    solarNoon: rise + daylight / 2,
    abhijit: {
      start: rise + (ABHIJIT_MUHURTA_INDEX - 1) * dayMuhurta,
      end: rise + ABHIJIT_MUHURTA_INDEX * dayMuhurta,
    },
    brahmaMuhurta: {
      // The 14th of 15 night muhurtas, counted backwards from the coming sunrise:
      // it ends one night-muhurta before sunrise and starts two before.
      start: rise - (MUHURTAS_PER_DAY_HALF - BRAHMA_MUHURTA_INDEX + 1) * nightMuhurta,
      end: rise - (MUHURTAS_PER_DAY_HALF - BRAHMA_MUHURTA_INDEX) * nightMuhurta,
    },
    rahuKaal: partWindow(RAHU_KAAL_PART[day]),
    gulikaKaal: partWindow(GULIKA_KAAL_PART[day]),
    yamaganda: partWindow(YAMAGANDA_PART[day]),
    weekday: WEEKDAYS[day],
  };
}

function matchesQuery(entry, needle) {
  if (!needle) return true;
  return [entry.term, entry.also || "", entry.short, entry.detail]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

/** Filter the glossary by keyword and category. */
export function searchTerms({ query = "", category = "all", sort = "az" } = {}) {
  const needle = String(query ?? "").trim().toLowerCase();
  if (needle.length > 60) {
    return { error: "Search text is too long — try a single word.", items: [], total: 0 };
  }
  if (category !== "all" && !CATEGORIES.some((entry) => entry.id === category)) {
    return { error: "Unknown glossary category selected.", items: [], total: 0 };
  }

  const items = TERMS.filter((entry) => {
    if (category !== "all" && entry.category !== category) return false;
    return matchesQuery(entry, needle);
  });

  const order = CATEGORIES.map((entry) => entry.id);
  const sorted = items.slice().sort((a, b) => {
    if (sort === "za") return collator.compare(b.term, a.term);
    if (sort === "category") {
      const diff = order.indexOf(a.category) - order.indexOf(b.category);
      return diff !== 0 ? diff : collator.compare(a.term, b.term);
    }
    return collator.compare(a.term, b.term);
  });

  return { items: sorted, total: sorted.length };
}

/** Per-category counts for a result set. */
export function summarise(items = []) {
  const list = Array.isArray(items) ? items : [];
  const counts = new Map();
  for (const entry of list) counts.set(entry.category, (counts.get(entry.category) || 0) + 1);
  return {
    count: list.length,
    byCategory: CATEGORIES.map((entry) => ({
      id: entry.id,
      label: entry.label,
      count: counts.get(entry.id) || 0,
    })),
  };
}
