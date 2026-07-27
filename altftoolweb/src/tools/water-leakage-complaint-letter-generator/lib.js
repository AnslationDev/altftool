/**
 * Water Leakage / Seepage Complaint Letter Generator.
 *
 * Who pays for a leak in an Indian co-operative housing society is decided by
 * WHERE the water comes from, not by who suffers the damage. The split used
 * here follows the Model Bye-laws for Co-operative Housing Societies
 * (Maharashtra, 2014 revision), which most state model bye-laws mirror:
 *
 *  - Bye-law No. 160: the SOCIETY maintains and repairs its property — the
 *    structure, terrace and roof, external walls, common water tanks, pumps,
 *    common drainage and the main/common water and waste lines.
 *  - Bye-law No. 161(a): each MEMBER maintains and repairs, at their own cost,
 *    everything inside their flat — internal plumbing, sanitary fittings,
 *    taps, waste pipes serving only that flat, floor waterproofing and
 *    internal walls.
 *  - Bye-law No. 161(b)/(c): where a member's neglected internal repair causes
 *    leakage into another flat, that member must carry out the repair at their
 *    own cost; if the member fails to do so, the society may get the work done
 *    and recover the cost from that member.
 *
 * Escalation routes referenced in the drafted letters:
 *  - Section 91, Maharashtra Co-operative Societies Act 1960 — disputes between
 *    a member and the society go to the Co-operative Court.
 *  - Consumer Protection Act 2019, Section 2(11) — failure by the society to
 *    provide maintenance it collects charges for can be pleaded as deficiency
 *    in service before a District Consumer Commission.
 *  - Municipal nuisance provisions (e.g. Section 381, Mumbai Municipal
 *    Corporation Act 1888) — persistent dampness and stagnant water can be
 *    reported to the local ward office as a health nuisance.
 *
 * Nothing here is legal advice; the letter is a template to be checked against
 * your own society's registered bye-laws and state law.
 */

/** Longest a single free-text field may be, so the letter stays readable. */
const MAX_FIELD = 120;
/** Shortest and longest repair deadline a complaint may reasonably demand. */
const MIN_DEADLINE_DAYS = 1;
const MAX_DEADLINE_DAYS = 90;
/** Longest plausible run of days a leak has been observed before complaining. */
const MAX_OBSERVED_DAYS = 3650;

const MONTH_NAMES = [
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

/**
 * Where the water is coming from, and who the bye-laws make responsible.
 * `party` is "member" when Bye-law 161 puts the repair on a flat owner, and
 * "society" when Bye-law 160 puts it on the managing committee.
 */
export const LEAK_SOURCES = [
  {
    id: "upstairs-bathroom",
    label: "Bathroom / toilet of the flat directly above",
    party: "member",
    where: "the bathroom or toilet floor of the flat directly above mine",
    byelaw:
      "Bye-law No. 161 places internal plumbing, sanitary fittings and floor waterproofing inside a flat on that flat's member, and requires the member to repair a leak that damages the flat below at their own cost.",
  },
  {
    id: "upstairs-kitchen",
    label: "Kitchen sink or waste line of the flat above",
    party: "member",
    where: "the kitchen sink and waste line of the flat directly above mine",
    byelaw:
      "Bye-law No. 161 makes each member responsible for the waste pipes and fittings that serve only their own flat.",
  },
  {
    id: "adjacent-flat",
    label: "Adjoining flat on the same floor",
    party: "member",
    where: "the adjoining flat on my floor, through the shared internal wall",
    byelaw:
      "Bye-law No. 161 makes a member responsible for internal repairs in their flat, including a leak that travels into a neighbouring flat.",
  },
  {
    id: "terrace",
    label: "Terrace or roof slab above the top-floor flat",
    party: "society",
    where: "the terrace slab above my flat",
    byelaw:
      "Bye-law No. 160 makes the society responsible for maintaining and waterproofing the terrace and roof, which are society property and not part of any flat.",
  },
  {
    id: "external-wall",
    label: "External wall / façade seepage",
    party: "society",
    where: "the external wall of the building",
    byelaw:
      "Bye-law No. 160 makes the society responsible for the external walls and the structure of the building, including plastering and external waterproofing.",
  },
  {
    id: "common-stack",
    label: "Common drainage or soil stack in the duct",
    party: "society",
    where: "the common drainage stack running through the service duct",
    byelaw:
      "Bye-law No. 160 makes the society responsible for the common water lines and drainage stacks that serve more than one flat.",
  },
  {
    id: "overhead-tank",
    label: "Overhead or underground water tank / pump room",
    party: "society",
    where: "the overhead water tank and its overflow line",
    byelaw:
      "Bye-law No. 160 makes the society responsible for the common water tanks, pumps and the pipes connected to them.",
  },
  {
    id: "unknown",
    label: "Source not yet identified",
    party: "society",
    where: "a source above or behind my flat that has not yet been identified",
    byelaw:
      "Until the source is traced, Bye-law No. 160 requires the society to inspect the structure and common lines and to establish where the water is entering from.",
  },
];

/** How far the complaint has already escalated. */
export const STAGES = [
  {
    id: "first",
    label: "First written complaint",
    defaultDeadlineDays: 15,
    tone: "I request that the leak be inspected and repaired",
    escalation:
      "If the repair is not carried out within the time requested, I will be constrained to escalate the matter to the managing committee in writing and thereafter to the Registrar of Co-operative Societies.",
  },
  {
    id: "reminder",
    label: "Reminder (complaint already made)",
    defaultDeadlineDays: 10,
    tone: "I must again ask that the leak be inspected and repaired",
    escalation:
      "Should the repair remain outstanding after this reminder, I will treat the delay as a failure to maintain the property and will place the matter before the general body and the Registrar of Co-operative Societies.",
  },
  {
    id: "final",
    label: "Final notice before legal action",
    defaultDeadlineDays: 7,
    tone: "I call upon you by way of final notice to inspect and repair the leak",
    escalation:
      "If the repair is not completed within this final period, I shall proceed without further notice — by way of a dispute under Section 91 of the Co-operative Societies Act, a complaint of deficiency in service under the Consumer Protection Act 2019, and a nuisance complaint to the municipal ward office — and shall claim the cost of restoring my flat together with the cost of these proceedings.",
  },
];

/** Visible damage the complainant can tick, in rough order of severity. */
export const DAMAGE_ITEMS = [
  { id: "damp-patch", label: "Damp patches on the ceiling or wall", text: "spreading damp patches on the ceiling and wall" },
  { id: "peeling", label: "Peeling paint or plaster falling off", text: "peeling paint and falling plaster" },
  { id: "dripping", label: "Active dripping water", text: "water dripping continuously into the room" },
  { id: "mould", label: "Mould or fungus growth", text: "black mould and fungus growth" },
  { id: "electrical", label: "Water near wiring, switches or fittings", text: "water reaching electrical wiring and fittings, which is a live safety hazard" },
  { id: "furniture", label: "Damage to furniture, flooring or belongings", text: "damage to furniture, flooring and stored belongings" },
  { id: "smell", label: "Persistent damp smell", text: "a persistent damp smell in the room" },
];

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

/**
 * Parse a yyyy-mm-dd string into a UTC-midnight timestamp.
 * Returns null when the string is missing or not a real calendar date.
 * @param {string} iso
 * @returns {number|null}
 */
export function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return stamp;
}

const MS_PER_DAY = 86400000;

/**
 * Add whole days to a yyyy-mm-dd date. Pure — the caller supplies the date.
 * @param {string} iso   Start date as yyyy-mm-dd.
 * @param {number} days  Whole days to add (may be 0).
 * @returns {{iso:string, long:string}|{error:string}}
 */
export function addDays(iso, days) {
  const start = parseIsoDate(iso);
  if (start === null) return { error: "Enter a valid date in yyyy-mm-dd form." };
  if (!Number.isFinite(days) || !Number.isInteger(days)) {
    return { error: "The number of days must be a whole number." };
  }
  const end = new Date(start + days * MS_PER_DAY);
  const yyyy = String(end.getUTCFullYear()).padStart(4, "0");
  const mm = String(end.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(end.getUTCDate()).padStart(2, "0");
  return {
    iso: `${yyyy}-${mm}-${dd}`,
    long: `${end.getUTCDate()} ${MONTH_NAMES[end.getUTCMonth()]} ${end.getUTCFullYear()}`,
  };
}

function joinList(items) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * Build the complaint letter.
 *
 * @param {object} input
 * @param {string} input.sourceId        One of LEAK_SOURCES ids.
 * @param {string} input.stageId         One of STAGES ids.
 * @param {string} input.letterDate      Date of the letter, yyyy-mm-dd.
 * @param {number} input.deadlineDays    Days allowed for the repair.
 * @param {number} input.observedDays    How many days the leak has been visible.
 * @param {string[]} input.damageIds     Ticked DAMAGE_ITEMS ids.
 * @param {string} input.senderName      Complainant's name.
 * @param {string} input.senderFlat      Complainant's flat number.
 * @param {string} input.societyName     Society / apartment association name.
 * @param {string} input.sourceFlat      Flat the water comes from (member cases).
 * @param {boolean} [input.copyToSociety] Mark a copy to the committee on a member letter.
 * @returns {{subject:string, letter:string, responsibleParty:string, addressee:string,
 *            deadlineLong:string, deadlineIso:string, byelawNote:string, escalation:string}
 *          | {error:string}}
 */
export function buildLeakageComplaint({
  sourceId,
  stageId,
  letterDate,
  deadlineDays,
  observedDays,
  damageIds = [],
  senderName,
  senderFlat,
  societyName,
  sourceFlat = "",
  copyToSociety = true,
}) {
  const source = LEAK_SOURCES.find((s) => s.id === sourceId);
  const stage = STAGES.find((s) => s.id === stageId);
  if (!source || !stage) {
    return { error: "Choose where the water is coming from and how far the complaint has gone." };
  }

  const name = clean(senderName);
  const flat = clean(senderFlat);
  const society = clean(societyName);
  const fromFlat = clean(sourceFlat);
  if (!name) return { error: "Enter the name the letter is signed with." };
  if (!flat) return { error: "Enter your own flat number." };
  if (!society) return { error: "Enter the name of the society or apartment association." };
  if ([name, flat, society, fromFlat].some((v) => v.length > MAX_FIELD)) {
    return { error: `Keep each name or flat number under ${MAX_FIELD} characters.` };
  }
  if (source.party === "member" && !fromFlat) {
    return { error: "Enter the flat number the water is coming from — a letter to a neighbour has to name the flat." };
  }

  const days = Number(deadlineDays);
  if (!Number.isFinite(days) || !Number.isInteger(days) || days < MIN_DEADLINE_DAYS || days > MAX_DEADLINE_DAYS) {
    return {
      error: `Give the repair a deadline between ${MIN_DEADLINE_DAYS} and ${MAX_DEADLINE_DAYS} days — a deadline outside that range is not a reasonable demand.`,
    };
  }

  const seen = Number(observedDays);
  if (!Number.isFinite(seen) || !Number.isInteger(seen) || seen < 0 || seen > MAX_OBSERVED_DAYS) {
    return { error: `Enter how long the leak has been visible, as a whole number of days from 0 to ${MAX_OBSERVED_DAYS}.` };
  }

  const deadline = addDays(letterDate, days);
  if (deadline.error) return { error: `Letter date: ${deadline.error}` };
  const dated = addDays(letterDate, 0);

  const damages = DAMAGE_ITEMS.filter((d) => damageIds.includes(d.id)).map((d) => d.text);
  if (damages.length === 0) {
    return { error: "Tick at least one kind of damage — a complaint with no described damage carries no weight." };
  }

  const toSociety = source.party === "society";
  const addressee = toSociety
    ? `The Secretary / Managing Committee, ${society}`
    : `The Occupant / Owner, Flat ${fromFlat}, ${society}`;

  const durationPhrase =
    seen === 0
      ? "since today"
      : seen === 1
        ? "for the past one day"
        : seen < 30
          ? `for the past ${seen} days`
          : seen < 365
            ? `for the past ${Math.round(seen / 30)} months (about ${seen} days)`
            : `for over ${Math.floor(seen / 365)} year${seen >= 730 ? "s" : ""} (about ${seen} days)`;

  const subject = toSociety
    ? `Complaint of water leakage / seepage into Flat ${flat} and request for repair by ${deadline.long}`
    : `Water leakage from Flat ${fromFlat} into Flat ${flat} — request for repair by ${deadline.long}`;

  const urgency = damageIds.includes("electrical")
    ? " Water has reached electrical wiring and fittings, so this is now a safety hazard and cannot wait for the next routine maintenance round."
    : "";

  const body = [
    `Date: ${dated.long}`,
    "",
    `To,`,
    addressee,
    "",
    `Subject: ${subject}`,
    "",
    toSociety ? "Dear Sir / Madam," : "Dear Neighbour,",
    "",
    `I am ${name}, the occupant of Flat ${flat} in ${society}. I am writing to place on record that water has been leaking into my flat from ${source.where}, and that the leak has been visible ${durationPhrase}.`,
    "",
    `The damage so far includes ${joinList(damages)}. The affected area is getting worse with every day the source is left unrepaired.${urgency}`,
    "",
    `${source.byelaw} On that basis, ${stage.tone} at the cost of the party responsible under the bye-laws. The work should be completed on or before ${deadline.long}, that is ${days} day${days === 1 ? "" : "s"} from the date of this letter.`,
    "",
    `I am willing to give access to my flat at any reasonable hour so that the source can be traced and the repair carried out, and I request that I be told in advance when the inspection will take place.`,
    "",
    stage.escalation,
    "",
    `Kindly acknowledge receipt of this letter in writing.`,
    "",
    "Yours faithfully,",
    "",
    name,
    `Flat ${flat}, ${society}`,
  ];

  if (!toSociety && copyToSociety) {
    body.push("", `Copy to: The Secretary / Managing Committee, ${society}, for record and for action under Bye-law No. 161 if the repair is not carried out.`);
  }

  return {
    subject,
    letter: body.join("\n"),
    responsibleParty: toSociety ? "The society (managing committee)" : `The member of Flat ${fromFlat}`,
    addressee,
    deadlineLong: deadline.long,
    deadlineIso: deadline.iso,
    byelawNote: source.byelaw,
    escalation: stage.escalation,
  };
}
