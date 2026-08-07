/**
 * Pet Ownership NOC Request Generator.
 *
 * A housing society in India cannot lawfully impose a blanket ban on pets, but
 * a resident who asks properly — and who can show licence, vaccination and
 * hygiene compliance — almost always avoids the fight altogether. The letter
 * and the readiness score below are built on:
 *
 *  - Animal Welfare Board of India circular of 26 February 2015 on pets in
 *    housing societies: a society's bye-laws or a general body resolution
 *    cannot prohibit residents from keeping pet dogs, cannot require a pet to
 *    be removed, and cannot object merely to a dog barking. Societies may,
 *    however, make reasonable rules about hygiene and conduct in common areas.
 *  - Prevention of Cruelty to Animals Act 1960, Section 11: abandoning an
 *    animal in circumstances likely to cause it suffering is a punishable
 *    offence, which is what a forced-removal demand pushes an owner towards.
 *  - Article 51A(g) of the Constitution: a fundamental duty of every citizen to
 *    have compassion for living creatures.
 *  - Municipal dog licensing: most municipal corporations require a dog to be
 *    registered/licensed and to hold a current anti-rabies certificate. Local
 *    rules differ, so the letter states the requirement, not a fee.
 *  - Anti-rabies vaccination schedule: after the primary course, dogs and cats
 *    receive a booster every 12 months, which is the interval used below.
 *
 * This is an informational template, not legal advice.
 */

/** Anti-rabies booster interval for dogs and cats, in days (annual booster). */
export const RABIES_BOOSTER_DAYS = 365;
/** How many days before the booster is due that the tool starts warning. */
export const BOOSTER_WARNING_DAYS = 30;
/** Free-text field cap so the letter stays readable. */
const MAX_FIELD = 120;
/** Reply window a request may reasonably ask for. */
const MIN_REPLY_DAYS = 3;
const MAX_REPLY_DAYS = 60;
/** Oldest plausible vaccination record, in days before the letter. */
const MAX_VACCINE_AGE_DAYS = 3650;

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

const MS_PER_DAY = 86400000;

/**
 * Pet types the letter can cover. `licensable` marks species for which
 * municipal registration and an annual anti-rabies booster are normally
 * expected; `commonArea` describes how the pet moves through shared space.
 */
export const PET_TYPES = [
  {
    id: "dog-small",
    label: "Dog — small breed (under 10 kg)",
    noun: "small-breed dog",
    licensable: true,
    commonArea: "carried or walked on a short leash through the lobby",
  },
  {
    id: "dog-medium",
    label: "Dog — medium breed (10-25 kg)",
    noun: "medium-breed dog",
    licensable: true,
    commonArea: "walked on a short leash through the lobby",
  },
  {
    id: "dog-large",
    label: "Dog — large breed (over 25 kg)",
    noun: "large-breed dog",
    licensable: true,
    commonArea: "walked on a short leash and, in crowded lifts, with a muzzle",
  },
  {
    id: "cat",
    label: "Cat",
    noun: "cat",
    licensable: true,
    commonArea: "carried in a closed carrier whenever it leaves the flat",
  },
  {
    id: "rabbit",
    label: "Rabbit or guinea pig",
    noun: "house rabbit",
    licensable: false,
    commonArea: "kept indoors and carried in a closed carrier when it leaves the flat",
  },
  {
    id: "bird",
    label: "Bird",
    noun: "pet bird",
    licensable: false,
    commonArea: "kept inside the flat at all times",
  },
  {
    id: "fish",
    label: "Fish or aquarium",
    noun: "aquarium",
    licensable: false,
    commonArea: "kept entirely inside the flat",
  },
];

/** How the request is being made — this sets the tone, not the rights. */
export const REQUEST_CONTEXTS = [
  {
    id: "fresh",
    label: "First request, before bringing the pet home",
    defaultReplyDays: 15,
    opener:
      "I am planning to bring a pet home and would like the committee's no-objection on record before I do so.",
    closing:
      "I would be grateful for the committee's written no-objection, and I am happy to meet the committee or attend the next meeting to answer any questions.",
  },
  {
    id: "existing",
    label: "Pet already at home, regularising the record",
    defaultReplyDays: 15,
    opener:
      "I already keep a pet in my flat and would like the committee's no-objection recorded formally, along with the compliance documents on file.",
    closing:
      "I would be grateful for the committee's written no-objection so that the records are complete, and I remain available for any inspection or clarification.",
  },
  {
    id: "objection",
    label: "After a verbal objection or complaint",
    defaultReplyDays: 15,
    opener:
      "I understand that a concern has been raised about the pet I keep in my flat, and I would like to address it in writing and place my compliance on record.",
    closing:
      "I would like to resolve this amicably. I request the committee to record its no-objection and, if any specific conduct issue remains, to tell me exactly what it is so that I can fix it.",
  },
  {
    id: "notice",
    label: "In reply to a written notice asking for removal",
    defaultReplyDays: 10,
    opener:
      "I am replying to the notice asking me to remove my pet from my flat, and I request the committee to reconsider it.",
    closing:
      "I ask the committee to withdraw the notice and record its no-objection. I would much rather settle this within the society than take it further, and I am willing to accept any reasonable conduct condition the committee proposes.",
  },
];

/**
 * Commitments and documents a resident can offer. `weight` is how much each
 * contributes to the readiness score; licence, vaccination and waste clean-up
 * carry the most weight because they are what a committee can most
 * legitimately ask to see or verify.
 */
export const COMMITMENTS = [
  { id: "licence", label: "Municipal pet licence / registration obtained", weight: 3, text: "the pet is registered with the municipal authority and I will keep the registration current", petOnly: true },
  { id: "vaccination", label: "Anti-rabies and routine vaccinations current", weight: 3, text: "vaccinations including anti-rabies are up to date and I will share the vaccination card whenever asked", petOnly: true },
  { id: "sterilised", label: "Pet is sterilised", weight: 1, text: "the pet is sterilised" },
  { id: "leash", label: "Leash / carrier in all common areas", weight: 2, text: "the pet will be on a short leash or in a closed carrier at all times in the lobby, lift, staircase and compound" },
  { id: "waste", label: "Waste picked up immediately, own bags carried", weight: 3, text: "I will carry waste bags on every walk and clean up immediately, and the pet will not be allowed to soil the lift, staircase, lobby, garden or parking area" },
  { id: "quiet", label: "Noise managed, pet not left alone barking", weight: 2, text: "the pet will not be left alone for long stretches, and I will act on any noise complaint the same day" },
  { id: "grooming", label: "Regular grooming and de-worming", weight: 1, text: "the pet is groomed and de-wormed on a regular schedule" },
  { id: "insurance", label: "Third-party pet liability cover taken", weight: 1, text: "I have taken third-party pet liability cover and will share the policy details" },
  { id: "damage", label: "Willing to bear the cost of any damage caused", weight: 2, text: "I will bear the cost of any damage or soiling caused by my pet in the common areas" },
  { id: "training", label: "Basic obedience training completed or planned", weight: 1, text: "the pet has completed basic obedience training" },
];

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

/**
 * Parse a yyyy-mm-dd string into a UTC-midnight timestamp, or null.
 * @param {string} iso
 * @returns {number|null}
 */
export function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return stamp;
}

function formatStamp(stamp) {
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Work out whether the anti-rabies booster is current on the letter date.
 * Booster interval is RABIES_BOOSTER_DAYS (annual).
 *
 * @param {string} lastVaccinationIso yyyy-mm-dd of the last anti-rabies dose.
 * @param {string} letterIso          yyyy-mm-dd of the letter.
 * @returns {{status:"current"|"due-soon"|"overdue", daysSince:number, daysToDue:number,
 *            dueIso:string, dueLong:string, note:string}|{error:string}}
 */
export function vaccinationStatus(lastVaccinationIso, letterIso) {
  const last = parseIsoDate(lastVaccinationIso);
  const letter = parseIsoDate(letterIso);
  if (last === null) return { error: "Enter the last anti-rabies vaccination date as a real calendar date." };
  if (letter === null) return { error: "Enter the letter date as a real calendar date." };
  const daysSince = Math.round((letter - last) / MS_PER_DAY);
  if (daysSince < 0) return { error: "The vaccination date is after the letter date — check the dates." };
  if (daysSince > MAX_VACCINE_AGE_DAYS) {
    return { error: "That vaccination record is more than ten years old. Enter the most recent dose." };
  }
  const dueStamp = last + RABIES_BOOSTER_DAYS * MS_PER_DAY;
  const daysToDue = Math.round((dueStamp - letter) / MS_PER_DAY);
  let status = "current";
  let note = `The anti-rabies booster is current; the next dose is due on ${formatStamp(dueStamp)}.`;
  if (daysToDue < 0) {
    status = "overdue";
    note = `The anti-rabies booster is overdue by ${Math.abs(daysToDue)} day${Math.abs(daysToDue) === 1 ? "" : "s"}. Get the booster before sending this request — a lapsed certificate is the one objection a committee can fairly make.`;
  } else if (daysToDue <= BOOSTER_WARNING_DAYS) {
    status = "due-soon";
    note = `The anti-rabies booster is due in ${daysToDue} day${daysToDue === 1 ? "" : "s"}, on ${formatStamp(dueStamp)}. Book it now so the certificate stays current while the request is being considered.`;
  }
  return {
    status,
    daysSince,
    daysToDue,
    dueIso: new Date(dueStamp).toISOString().slice(0, 10),
    dueLong: formatStamp(dueStamp),
    note,
  };
}

function joinList(items) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join("; ")}; and ${items[items.length - 1]}`;
}

/**
 * Build the NOC request letter plus a readiness score.
 *
 * The score is the ticked weight over the total weight applicable to that pet
 * type (licence and vaccination items are dropped for species that are not
 * licensed or vaccinated, such as fish), expressed as a whole percentage.
 *
 * @param {object} input
 * @param {string} input.petTypeId       One of PET_TYPES ids.
 * @param {string} input.contextId       One of REQUEST_CONTEXTS ids.
 * @param {string} input.letterDate      yyyy-mm-dd.
 * @param {number} input.replyDays       Days the committee is asked to reply in.
 * @param {string[]} input.commitmentIds Ticked COMMITMENTS ids.
 * @param {string} input.lastVaccination yyyy-mm-dd of the last anti-rabies dose ("" if not applicable).
 * @param {string} input.petName
 * @param {string} input.residentName
 * @param {string} input.flatNumber
 * @param {string} input.societyName
 * @returns {{letter:string, subject:string, readinessScore:number, readinessLabel:string,
 *            missing:string[], vaccination:object|null, replyByLong:string}|{error:string}}
 */
export function buildPetNocRequest({
  petTypeId,
  contextId,
  letterDate,
  replyDays,
  commitmentIds = [],
  lastVaccination = "",
  petName,
  residentName,
  flatNumber,
  societyName,
}) {
  const pet = PET_TYPES.find((p) => p.id === petTypeId);
  const context = REQUEST_CONTEXTS.find((c) => c.id === contextId);
  if (!pet || !context) {
    return { error: "Choose the kind of pet and the situation the request is being made in." };
  }

  const resident = clean(residentName);
  const flat = clean(flatNumber);
  const society = clean(societyName);
  const animal = clean(petName);
  if (!resident) return { error: "Enter the name the request is signed with." };
  if (!flat) return { error: "Enter your flat number." };
  if (!society) return { error: "Enter the name of the society or apartment association." };
  if ([resident, flat, society, animal].some((v) => v.length > MAX_FIELD)) {
    return { error: `Keep each name under ${MAX_FIELD} characters.` };
  }

  const days = Number(replyDays);
  if (!Number.isFinite(days) || !Number.isInteger(days) || days < MIN_REPLY_DAYS || days > MAX_REPLY_DAYS) {
    return { error: `Ask for a reply within ${MIN_REPLY_DAYS} to ${MAX_REPLY_DAYS} days.` };
  }

  const letterStamp = parseIsoDate(letterDate);
  if (letterStamp === null) return { error: "Enter the letter date as a real calendar date." };
  const replyStamp = letterStamp + days * MS_PER_DAY;

  let vaccination = null;
  if (pet.licensable) {
    if (!clean(lastVaccination)) {
      return { error: "Enter the date of the last anti-rabies vaccination — a committee is entitled to see a current certificate." };
    }
    const status = vaccinationStatus(lastVaccination, letterDate);
    if (status.error) return { error: status.error };
    vaccination = status;
  }

  const applicable = COMMITMENTS.filter((c) => (pet.licensable ? true : !c.petOnly));
  const totalWeight = applicable.reduce((sum, c) => sum + c.weight, 0);
  const ticked = applicable.filter((c) => commitmentIds.includes(c.id));
  const tickedWeight = ticked.reduce((sum, c) => sum + c.weight, 0);
  const readinessScore = totalWeight === 0 ? 0 : Math.round((tickedWeight / totalWeight) * 100);
  const missing = applicable.filter((c) => !commitmentIds.includes(c.id)).map((c) => c.label);

  if (ticked.length === 0) {
    return { error: "Tick at least one commitment — a request that promises nothing gives the committee no reason to agree." };
  }

  const readinessLabel =
    readinessScore >= 85
      ? pet.licensable
        ? "Strong — licence, vaccination and hygiene all covered"
        : "Strong — hygiene and conduct commitments all covered"
      : readinessScore >= 60
        ? "Reasonable — a few gaps a committee may query"
        : "Weak — close the gaps below before sending";

  const subject = `Request for no-objection to keep a ${pet.noun}${animal ? ` (${animal})` : ""} in Flat ${flat}`;

  const paragraphs = [
    `Date: ${formatStamp(letterStamp)}`,
    "",
    "To,",
    `The Secretary / Managing Committee, ${society}`,
    "",
    `Subject: ${subject}`,
    "",
    "Dear Sir / Madam,",
    "",
    `I am ${resident}, a resident of Flat ${flat} in ${society}. ${context.opener} The pet is a ${pet.noun}${animal ? ` named ${animal}` : ""}.`,
    "",
    `So that the committee and my neighbours are not inconvenienced in any way, I undertake the following: ${joinList(ticked.map((c) => c.text))}. In the common areas the pet will be ${pet.commonArea}.`,
  ];

  if (vaccination) {
    paragraphs.push(
      "",
      `The last anti-rabies vaccination was administered on ${formatStamp(parseIsoDate(lastVaccination))}, and the next annual booster falls due on ${vaccination.dueLong}. I will file a copy of the current vaccination certificate and the municipal registration with the society office and will replace them each year.`,
    );
  }

  paragraphs.push(
    "",
    "I would also respectfully record, in a spirit of cooperation rather than confrontation, that the Animal Welfare Board of India's circular of 26 February 2015 on pets in housing societies takes the position that a society's bye-laws or a general body resolution cannot prohibit residents from keeping pet dogs or require a pet to be removed, while a society may of course make reasonable rules about conduct and hygiene in common areas. I am glad to comply with every such reasonable rule.",
    "",
    `${context.closing} I request a written response by ${formatStamp(replyStamp)}, that is ${days} day${days === 1 ? "" : "s"} from the date of this letter.`,
    "",
    "Thank you for your consideration.",
    "",
    "Yours sincerely,",
    "",
    resident,
    `Flat ${flat}, ${society}`,
  );

  return {
    letter: paragraphs.join("\n"),
    subject,
    readinessScore,
    readinessLabel,
    missing,
    vaccination,
    replyByLong: formatStamp(replyStamp),
  };
}
