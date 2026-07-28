/**
 * Organ donation information checklist — pure data and scoring module.
 * No React, no DOM, no Date.now().
 *
 * Everything here is informational. Consent law is national and changes; the
 * official registry named for each region is the authority, not this file.
 */

/**
 * Consent systems by region.
 * - "opt-in": you are not a donor unless you register.
 * - "opt-out": adults are treated as willing unless they record a decision not
 *   to donate ("deemed consent").
 */
export const REGIONS = [
  {
    key: "in",
    label: "India",
    system: "opt-in",
    registry: "NOTTO — National Organ and Tissue Transplant Organisation",
    law: "Transplantation of Human Organs and Tissues Act, 1994 (amended 2011, Rules 2014)",
    familyRole:
      "A pledge or donor card is not by itself legally sufficient — the family is asked to give consent at the time, so telling them matters more than the card.",
    licenceOption: true,
  },
  {
    key: "uk",
    label: "United Kingdom",
    system: "opt-out",
    registry: "NHS Organ Donor Register",
    law: "Deemed consent: Wales from 1 December 2015, England from 20 May 2020, Scotland from 26 March 2021, Northern Ireland from 1 June 2023",
    familyRole:
      "Even under deemed consent, specialist nurses always speak to the family, and donation would not usually go ahead if the family objects.",
    licenceOption: false,
  },
  {
    key: "us",
    label: "United States",
    system: "opt-in",
    registry: "Your state donor registry (via the DMV or Donate Life America)",
    law: "Revised Uniform Anatomical Gift Act — first-person authorisation is legally binding in all 50 states",
    familyRole:
      "Your registered decision is legally sufficient, but families are still informed — telling them in advance avoids distress and delay.",
    licenceOption: true,
  },
  {
    key: "ca",
    label: "Canada",
    system: "opt-in",
    registry: "Your provincial or territorial registry (Nova Scotia operates deemed consent)",
    law: "Provincial legislation; Nova Scotia's Human Organ and Tissue Donation Act introduced deemed consent in January 2021",
    familyRole: "Families are consulted at the time of donation in every province.",
    licenceOption: true,
  },
  {
    key: "au",
    label: "Australia",
    system: "opt-in",
    registry: "Australian Organ Donor Register (via your Medicare online account)",
    law: "State and territory human tissue Acts",
    familyRole:
      "The family is always asked to confirm the donation, so an unregistered or unspoken wish is easily lost.",
    licenceOption: false,
  },
  {
    key: "es",
    label: "Spain",
    system: "opt-out",
    registry: "Organización Nacional de Trasplantes (ONT)",
    law: "Ley 30/1979 sobre extracción y trasplante de órganos — presumed consent",
    familyRole: "In practice the family is always consulted before donation proceeds.",
    licenceOption: false,
  },
  {
    key: "other",
    label: "Somewhere else",
    system: "varies",
    registry: "Your national transplant or health authority",
    law: "Consent law is set nationally and differs widely",
    familyRole: "In almost every country the family is spoken to before donation goes ahead.",
    licenceOption: false,
  },
];

/** Solid organs routinely transplanted from deceased donors. */
export const DONATABLE_ORGANS = [
  "Kidneys",
  "Liver",
  "Heart",
  "Lungs",
  "Pancreas",
  "Small intestine",
];

/** Tissue donation has a much wider donor pool than organ donation. */
export const DONATABLE_TISSUES = [
  "Corneas",
  "Skin",
  "Bone and tendon",
  "Heart valves",
  "Blood vessels",
];

/** Stages the checklist is grouped into, in the order they should happen. */
export const STAGES = [
  { key: "understand", label: "Understand what you are deciding" },
  { key: "register", label: "Record the decision officially" },
  { key: "family", label: "Have the family conversation" },
  { key: "review", label: "Make sure it stays findable" },
];

/**
 * The two items that decide whether your wishes are actually followed:
 * an official record, and a family that knows about it.
 */
export const CRITICAL_ITEMS = ["register-primary", "family-nextofkin"];

/**
 * Checklist items. `regions` limits an item to specific region keys;
 * `systems` limits it to opt-in or opt-out consent systems.
 */
export const CHECKLIST = [
  {
    id: "understand-organs",
    stage: "understand",
    label: "Know which organs can be donated",
    help: "Kidneys, liver, heart, lungs, pancreas and small intestine are the solid organs routinely transplanted.",
  },
  {
    id: "understand-tissue",
    stage: "understand",
    label: "Know that tissue donation is separate and far more common",
    help: "Corneas, skin, bone, tendon, heart valves and blood vessels can be donated in many more circumstances than solid organs.",
  },
  {
    id: "understand-circumstances",
    stage: "understand",
    label: "Understand how rarely organ donation is possible",
    help: "Deceased organ donation generally requires death in a hospital intensive care setting, which is a small fraction of all deaths.",
  },
  {
    id: "understand-system",
    stage: "understand",
    label: "Check whether your country is opt-in or opt-out",
    help: "Opt-in means nothing happens unless you register. Opt-out means adults are treated as willing unless they record a refusal.",
  },
  {
    id: "understand-living",
    stage: "understand",
    label: "Understand that living donation is a separate decision",
    help: "Donating a kidney or part of a liver while alive has its own assessment, consent process and legal safeguards.",
  },
  {
    id: "understand-beliefs",
    stage: "understand",
    label: "Check any faith or cultural guidance that matters to you",
    help: "Most major faiths permit donation, and many publish specific guidance. Speak to your own faith leader if it matters to your decision.",
  },
  {
    id: "register-primary",
    stage: "register",
    label: "Register your decision with the official registry",
    help: "A registry entry is the record clinicians look for. Note that it is the registry, not a card in your wallet, that is checked.",
    critical: true,
  },
  {
    id: "register-licence",
    stage: "register",
    label: "Add the decision to your driving licence or ID where offered",
    help: "Several registries let you record donor status when applying for or renewing a licence.",
    regions: ["in", "us", "ca"],
  },
  {
    id: "register-optout",
    stage: "register",
    label: "If you do NOT want to donate, record that refusal explicitly",
    help: "Under deemed consent, silence is taken as willingness. Only a recorded decision removes you.",
    systems: ["opt-out"],
  },
  {
    id: "register-specifics",
    stage: "register",
    label: "Record any organs or tissues you want to exclude",
    help: "Most registries let you donate some things and not others — for example organs but not corneas.",
  },
  {
    id: "register-confirmation",
    stage: "register",
    label: "Save the confirmation email or reference number",
    help: "It makes re-checking or updating the entry much easier later.",
  },
  {
    id: "family-nextofkin",
    stage: "family",
    label: "Tell your next of kin, in plain words",
    help: "The single most useful thing you can do. Clinicians speak to the family in almost every jurisdiction, including opt-out ones.",
    critical: true,
  },
  {
    id: "family-second",
    stage: "family",
    label: "Tell a second family member or close friend",
    help: "Your nearest relative may not be reachable or may be too distressed to recall the conversation.",
  },
  {
    id: "family-reasons",
    stage: "family",
    label: "Explain the reasons, not just the decision",
    help: "Families asked to confirm a decision they understand find it far easier to support.",
  },
  {
    id: "family-confirm",
    stage: "family",
    label: "Ask them to say back that they will support it",
    help: "An explicit yes now is worth more than an assumption later.",
  },
  {
    id: "family-representative",
    stage: "family",
    label: "Note who should be contacted, and how",
    help: "Some registries let you name a nominated representative to speak for you.",
  },
  {
    id: "review-doctor",
    stage: "review",
    label: "Mention it to your GP or primary care doctor",
    help: "It can be noted in your medical record alongside other advance decisions.",
  },
  {
    id: "review-not-will",
    stage: "review",
    label: "Do not rely on your will alone",
    help: "Wills are usually read days after death, long after donation is possible.",
  },
  {
    id: "review-move",
    stage: "review",
    label: "Re-register after moving country, state or province",
    help: "Registries do not transfer across borders, and consent law may be completely different.",
  },
  {
    id: "review-lifeevents",
    stage: "review",
    label: "Revisit the decision after major life events",
    help: "Marriage, a new diagnosis or a change of next of kin are all good moments to check the entry is still right.",
  },
];

export function findRegion(key) {
  return REGIONS.find((region) => region.key === key) || REGIONS[REGIONS.length - 1];
}

/** Items that apply to a given region. */
export function applicableItems(regionKey) {
  const region = findRegion(regionKey);
  return CHECKLIST.filter((item) => {
    if (Array.isArray(item.regions) && !item.regions.includes(region.key)) return false;
    if (Array.isArray(item.systems) && !item.systems.includes(region.system)) return false;
    return true;
  });
}

const round = (value, places = 0) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/**
 * Score a set of ticked item ids against the checklist for a region.
 * @returns {object} summary, or { error } for unusable input.
 */
export function summariseChecklist(checkedIds, regionKey) {
  if (!Array.isArray(checkedIds)) {
    return { error: "Pass the ticked items as an array of item ids." };
  }
  const region = findRegion(regionKey);
  const items = applicableItems(region.key);
  const valid = new Set(items.map((item) => item.id));
  const checked = new Set(checkedIds.filter((id) => valid.has(id)));

  const total = items.length;
  if (total === 0) return { error: "No checklist items apply to that region." };

  const done = checked.size;
  const percent = round((done / total) * 100);

  const byStage = STAGES.map((stage) => {
    const stageItems = items.filter((item) => item.stage === stage.key);
    const stageDone = stageItems.filter((item) => checked.has(item.id)).length;
    return {
      key: stage.key,
      label: stage.label,
      total: stageItems.length,
      done: stageDone,
      percent: stageItems.length > 0 ? round((stageDone / stageItems.length) * 100) : 0,
      items: stageItems.map((item) => ({ ...item, checked: checked.has(item.id) })),
    };
  });

  const registered = checked.has("register-primary");
  const familyTold = checked.has("family-nextofkin");

  let readiness;
  if (registered && familyTold) {
    readiness = {
      level: "recorded-and-shared",
      title: "Recorded and shared",
      detail:
        "Your decision is on a register and the people who will be asked about it know. That is the combination most likely to be followed.",
    };
  } else if (registered) {
    readiness = {
      level: "recorded-only",
      title: "Recorded, but unspoken",
      detail:
        "The registry entry exists, but your family has not been told. Clinicians speak to families in almost every country, so this conversation is the missing piece.",
    };
  } else if (familyTold) {
    readiness = {
      level: "shared-only",
      title: "Spoken about, but not recorded",
      detail:
        "Your family knows, but there is no official record to back them up. Registering removes the doubt.",
    };
  } else {
    readiness = {
      level: "not-started",
      title: "Not started",
      detail: "Neither a registry entry nor a family conversation is ticked yet — those two steps matter most.",
    };
  }

  const nextSteps = items
    .filter((item) => !checked.has(item.id))
    .sort((a, b) => (b.critical ? 1 : 0) - (a.critical ? 1 : 0))
    .slice(0, 3)
    .map((item) => item.label);

  return {
    region,
    total,
    done,
    remaining: total - done,
    percent,
    byStage,
    readiness,
    registered,
    familyTold,
    nextSteps,
    criticalMissing: CRITICAL_ITEMS.filter((id) => valid.has(id) && !checked.has(id)),
  };
}
