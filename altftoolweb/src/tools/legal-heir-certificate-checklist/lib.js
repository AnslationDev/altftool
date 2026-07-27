/**
 * Which succession instrument an Indian family actually needs after a death, the
 * Class I shares where they can be computed, and the documents each route wants.
 *
 * The commonest and most expensive mistake is treating a legal heir certificate as a
 * document of title. It is not. It identifies the surviving heirs so a department or
 * employer can release service benefits; moving a bank balance or a shareholding out
 * of an intestate estate needs a succession certificate from a civil court.
 *
 * Rule sources:
 *
 *  - Indian Succession Act, 1925, Part X (sections 370 to 390): a succession
 *    certificate is granted by the District Judge in respect of DEBTS and SECURITIES
 *    of a person who died intestate — bank balances, deposits, shares, debentures and
 *    bonds. Section 373 requires the court to issue notice and hear objections before
 *    granting it, which is why this route takes months rather than weeks.
 *
 *  - Court Fees Act, 1870, Schedule I Article 12: the fee on a succession certificate
 *    is ad valorem on the value of the estate covered. The percentage, and the cap
 *    where a state applies one, are fixed by state amendment, so they are inputs here
 *    rather than constants.
 *
 *  - Indian Succession Act, 1925, sections 57 and 213: probate of a Will is
 *    compulsory for Wills made by Hindus, Buddhists, Sikhs and Jains within the areas
 *    that were the ordinary original civil jurisdiction of the High Courts of
 *    Calcutta, Madras and Bombay, or where the Will covers immovable property in
 *    those areas. Elsewhere probate is optional but often demanded by registrars and
 *    banks. Letters of administration are granted under sections 218 to 234 where
 *    there is no executor, or none willing to act.
 *
 *  - Hindu Succession Act, 1956, section 8 with section 10: on the intestacy of a
 *    male Hindu the Class I heirs take, and the shares are worked out as — Rule 1,
 *    the widow, or all the widows together, take one share; Rule 2, each surviving
 *    son, each surviving daughter and the mother take one share each; Rule 3, the
 *    heirs in the branch of each pre-deceased son or pre-deceased daughter take one
 *    share between them.
 *
 *  - Hindu Succession (Amendment) Act, 2005: a daughter is a coparcener by birth on
 *    the same footing as a son. Vineeta Sharma v. Rakesh Sharma (2020) confirmed that
 *    the right arises by birth and does not depend on the father having been alive on
 *    9 September 2005.
 *
 *  - Hindu Succession Act, 1956, section 15(1)(a): on the intestacy of a female
 *    Hindu, the property devolves first on her sons and daughters, including the
 *    children of any pre-deceased son or daughter, and her husband — a different set
 *    from section 8, and one that does not include her mother at this stage.
 *
 *  - Muslim Personal Law (Shariat) Application Act, 1937 governs succession among
 *    Muslims, where shares are fixed by rules this module does not attempt to model.
 *    Christians and Parsis are governed by Part V of the Indian Succession Act, 1925;
 *    section 33 gives the widow of a Christian intestate one-third where there are
 *    lineal descendants.
 *
 *  - A nominee is a trustee for the heirs, not an owner. Sarbati Devi v. Usha Devi
 *    (1984) settled this for life insurance, and Shakti Yezdani v. Jayanand
 *    Salgaonkar (2023) held that nomination under the Companies Act does not displace
 *    succession law for shares.
 *
 * Informational only. It is not legal advice; consult a lawyer on your own facts.
 */

/** Personal laws this module recognises, and whether it can compute intestate shares. */
export const RELIGIONS = [
  {
    id: "hindu",
    label: "Hindu, Buddhist, Sikh or Jain",
    computesShares: true,
    law: "Hindu Succession Act, 1956",
  },
  {
    id: "muslim",
    label: "Muslim",
    computesShares: false,
    law: "Muslim Personal Law (Shariat) Application Act, 1937",
  },
  {
    id: "christian",
    label: "Christian",
    computesShares: false,
    law: "Indian Succession Act, 1925, Part V",
  },
  {
    id: "parsi",
    label: "Parsi",
    computesShares: false,
    law: "Indian Succession Act, 1925, Part V",
  },
  {
    id: "other",
    label: "Other or inter-faith marriage",
    computesShares: false,
    law: "Indian Succession Act, 1925",
  },
];

/** Asset classes, and the instrument each one usually needs. */
export const ASSET_CLASSES = [
  {
    id: "serviceBenefits",
    label: "Pension, gratuity, provident fund and service dues",
  },
  {
    id: "bankAndSecurities",
    label: "Bank deposits, shares, bonds and mutual funds",
  },
  { id: "immovable", label: "Land, a house or a flat" },
  { id: "insurance", label: "Life insurance proceeds" },
  { id: "utilities", label: "Electricity, gas, telephone and society records" },
];

/** Share of a Christian intestate's estate that goes to the widow where lineal descendants survive. */
export const CHRISTIAN_WIDOW_SHARE_FRACTION = "one-third under section 33";

const round2 = (value) => Math.round(value * 100) / 100;
const round4 = (value) => Math.round(value * 10000) / 10000;

/**
 * Class I shares on a Hindu intestacy.
 *
 * For a male intestate this applies section 10: all widows take one share between
 * them, each son, each daughter and the mother take one share, and the heirs in the
 * branch of each pre-deceased child take one share between them. For a female
 * intestate it applies section 15(1)(a): sons, daughters, the children of any
 * pre-deceased child, and the husband share equally.
 *
 * @param {object} input
 * @param {"male"|"female"} input.gender
 * @param {number} input.widows              Surviving widows (male intestate).
 * @param {boolean} input.husbandAlive       Surviving husband (female intestate).
 * @param {number} input.sons
 * @param {number} input.daughters
 * @param {boolean} input.motherAlive        Counts only for a male intestate.
 * @param {number} input.predeceasedChildBranches
 * @returns {{ totalShares:number, unitFraction:number, rows:Array }|null} null where nothing devolves.
 */
export function computeHinduClassOneShares({
  gender = "male",
  widows = 0,
  husbandAlive = false,
  sons = 0,
  daughters = 0,
  motherAlive = false,
  predeceasedChildBranches = 0,
} = {}) {
  const widowCount = Math.max(0, Math.floor(Number(widows) || 0));
  const sonCount = Math.max(0, Math.floor(Number(sons) || 0));
  const daughterCount = Math.max(0, Math.floor(Number(daughters) || 0));
  const branchCount = Math.max(
    0,
    Math.floor(Number(predeceasedChildBranches) || 0),
  );

  const rows = [];
  let totalShares = 0;

  if (gender === "male") {
    if (widowCount > 0) totalShares += 1; // Rule 1: all widows take one share together.
    totalShares += sonCount + daughterCount;
    if (motherAlive) totalShares += 1;
    totalShares += branchCount;
  } else {
    if (husbandAlive) totalShares += 1;
    totalShares += sonCount + daughterCount + branchCount;
  }

  if (totalShares === 0) return null;

  const unit = 1 / totalShares;
  // Percentages are produced here so the view layer never has to do arithmetic.
  const pct = (fraction) => round2(fraction * 100);

  if (gender === "male" && widowCount > 0) {
    rows.push({
      id: "widow",
      label:
        widowCount === 1
          ? "Widow"
          : `${widowCount} widows (one share between them)`,
      count: widowCount,
      groupShare: round4(unit),
      perPersonShare: round4(unit / widowCount),
      groupPercent: pct(unit),
      perPersonPercent: pct(unit / widowCount),
      note:
        widowCount > 1
          ? "Rule 1 of section 10 gives all widows a single share, divided equally among them."
          : "Rule 1 of section 10 gives the widow one share.",
    });
  }
  if (gender === "female" && husbandAlive) {
    rows.push({
      id: "husband",
      label: "Husband",
      count: 1,
      groupShare: round4(unit),
      perPersonShare: round4(unit),
      groupPercent: pct(unit),
      perPersonPercent: pct(unit),
      note: "Section 15(1)(a) puts the husband alongside the children.",
    });
  }
  if (sonCount > 0) {
    rows.push({
      id: "sons",
      label: sonCount === 1 ? "Son" : `${sonCount} sons`,
      count: sonCount,
      groupShare: round4(unit * sonCount),
      perPersonShare: round4(unit),
      groupPercent: pct(unit * sonCount),
      perPersonPercent: pct(unit),
      note: "One share each.",
    });
  }
  if (daughterCount > 0) {
    rows.push({
      id: "daughters",
      label: daughterCount === 1 ? "Daughter" : `${daughterCount} daughters`,
      count: daughterCount,
      groupShare: round4(unit * daughterCount),
      perPersonShare: round4(unit),
      groupPercent: pct(unit * daughterCount),
      perPersonPercent: pct(unit),
      note: "One share each, on exactly the same footing as a son since the 2005 amendment.",
    });
  }
  if (gender === "male" && motherAlive) {
    rows.push({
      id: "mother",
      label: "Mother",
      count: 1,
      groupShare: round4(unit),
      perPersonShare: round4(unit),
      groupPercent: pct(unit),
      perPersonPercent: pct(unit),
      note: "A Class I heir in her own right under section 8.",
    });
  }
  if (branchCount > 0) {
    rows.push({
      id: "branches",
      label: `${branchCount} branch(es) of a pre-deceased child`,
      count: branchCount,
      groupShare: round4(unit * branchCount),
      perPersonShare: round4(unit),
      groupPercent: pct(unit * branchCount),
      perPersonPercent: pct(unit),
      note: "Rule 3: the heirs in each branch take one share between them, divided within the branch.",
    });
  }

  return { totalShares, unitFraction: round4(unit), rows };
}

/**
 * Court fee on a succession certificate, ad valorem with an optional state cap.
 *
 * @param {number} estateValue  Value of the debts and securities covered.
 * @param {number} feePercent   Ad valorem percentage fixed by the state.
 * @param {number} cap          State cap, or 0 for none.
 * @returns {{ gross:number, payable:number, capped:boolean }}
 */
export function computeSuccessionCourtFee(estateValue, feePercent, cap) {
  const value = Number(estateValue) || 0;
  const percent = Number(feePercent) || 0;
  const ceiling = Number(cap) || 0;
  if (value <= 0 || percent <= 0)
    return { gross: 0, payable: 0, capped: false };
  const gross = round2((value * percent) / 100);
  const capped = ceiling > 0 && gross > ceiling;
  return { gross, payable: capped ? round2(ceiling) : gross, capped };
}

function buildDocuments(input) {
  const documents = [
    {
      id: "death",
      label: "Death certificate issued by the municipality or panchayat",
      detail:
        "Nothing moves without this. Take several attested copies; each institution keeps one.",
      required: true,
    },
    {
      id: "applicantId",
      label: "Applicant's photo identity and address proof",
      detail:
        "Aadhaar, PAN, voter ID or passport, with the name matching the relationship proof.",
      required: true,
    },
    {
      id: "deceasedId",
      label: "Deceased's identity and address proof",
      detail:
        "Aadhaar or ration card establishing where the deceased ordinarily resided, which fixes jurisdiction.",
      required: true,
    },
    {
      id: "heirList",
      label: "List of all surviving family members with dates of birth",
      detail:
        "Leaving an heir off is the commonest ground for a certificate being challenged later. Include every Class I heir even where they intend to relinquish.",
      required: true,
    },
    {
      id: "relationship",
      label: "Proof of relationship for each heir",
      detail:
        "Birth certificates, school records, ration card entries or the family register extract.",
      required: true,
    },
    {
      id: "affidavit",
      label: "Affidavit on non-judicial stamp paper",
      detail:
        "Sworn declaration listing the heirs and confirming no others exist.",
      required: true,
    },
    {
      id: "noc",
      label: "No-objection or relinquishment from the other heirs",
      detail:
        "Where one heir applies for release of a benefit, the others usually have to sign a disclaimer before the department will pay.",
      required: true,
    },
    {
      id: "form",
      label:
        "Application in the prescribed form with the fee or court fee stamp",
      detail:
        "Filed with the Tahsildar or revenue authority for a legal heir certificate.",
      required: true,
    },
  ];

  if (input.needsSuccessionCertificate) {
    documents.push({
      id: "petition",
      label: "Petition to the District Judge under section 372",
      detail:
        "Must list the debts and securities and their value, the date of death, the ordinary residence of the deceased and the names of all heirs.",
      required: true,
    });
    documents.push({
      id: "assetSchedule",
      label: "Schedule of debts and securities with balances",
      detail:
        "Bank certificates of balance, demat holding statements and bond or debenture particulars as at the date of death.",
      required: true,
    });
    documents.push({
      id: "courtFee",
      label: "Ad valorem court fee on the value of the estate",
      detail:
        "Charged under Schedule I Article 12 of the Court Fees Act, 1870. The percentage and any cap are fixed by state amendment.",
      required: true,
    });
    documents.push({
      id: "publication",
      label: "Newspaper publication of the court's notice",
      detail:
        "Section 373 requires notice and an opportunity to object before the certificate is granted, which is what makes this route slow.",
      required: true,
    });
  }

  if (input.willExists) {
    documents.push({
      id: "will",
      label: "Original Will, with the attesting witnesses' particulars",
      detail:
        "At least one attesting witness must be available to prove the Will, so trace them early — this is often the delay.",
      required: true,
    });
  }

  if (input.needsProbate) {
    documents.push({
      id: "probatePetition",
      label: "Probate petition to the High Court or District Court",
      detail:
        "Filed by the executor named in the Will, with the valuation of the estate and the court fee on it.",
      required: true,
    });
  }

  if (input.needsLettersOfAdministration) {
    documents.push({
      id: "laPetition",
      label: "Petition for letters of administration",
      detail:
        "Used where there is no Will, or a Will with no executor able or willing to act, under sections 218 to 234.",
      required: true,
    });
  }

  if (input.hasImmovable) {
    documents.push({
      id: "propertyPapers",
      label:
        "Title deed, latest property tax receipt and encumbrance certificate",
      detail:
        "Needed for mutation in the revenue or municipal record. A legal heir certificate alone is not a document of title.",
      required: true,
    });
  }

  if (input.hasServiceBenefits) {
    documents.push({
      id: "serviceRecord",
      label: "Service record, pension payment order and employer's forms",
      detail:
        "The employer or pension disbursing authority has its own family-details form that must match the heir list exactly.",
      required: true,
    });
  }

  if (input.hasInsurance) {
    documents.push({
      id: "policy",
      label: "Policy document, claim form and nomination record",
      detail:
        "The insurer pays the registered nominee, but the nominee holds the money for the heirs rather than owning it.",
      required: true,
    });
  }

  documents.push({
    id: "indemnity",
    label: "Indemnity bond and surety where the institution asks for one",
    detail:
      "Banks frequently accept an indemnity for smaller balances instead of a court certificate.",
    required: false,
  });

  return documents;
}

/**
 * Decide the instruments needed, compute shares where the law allows it, and build
 * the checklist.
 *
 * @returns {object} result object, or { error } for input that cannot be used.
 */
export function buildLegalHeirChecklist({
  religionId = "hindu",
  gender = "male",
  willExists = false,
  executorNamed = false,
  inPresidencyTownJurisdiction = false,
  assets = [],
  heirs = {},
  estateValue = 0,
  courtFeePercent = 3,
  courtFeeCap = 0,
} = {}) {
  const religion = RELIGIONS.find((entry) => entry.id === religionId);
  if (!religion)
    return { error: "Choose the personal law that applies to the deceased." };
  if (gender !== "male" && gender !== "female") {
    return { error: "Choose whether the deceased was male or female." };
  }

  const numbers = {
    widows: Number(heirs.widows ?? 0),
    sons: Number(heirs.sons ?? 0),
    daughters: Number(heirs.daughters ?? 0),
    predeceasedChildBranches: Number(heirs.predeceasedChildBranches ?? 0),
    estateValue: Number(estateValue),
    courtFeePercent: Number(courtFeePercent),
    courtFeeCap: Number(courtFeeCap),
  };

  if (!Object.values(numbers).every((value) => Number.isFinite(value))) {
    return {
      error: "Enter valid numbers for the heirs, estate value and court fee.",
    };
  }
  if (Object.values(numbers).some((value) => value < 0)) {
    return { error: "Counts, values and rates cannot be negative." };
  }
  if (
    numbers.widows > 20 ||
    numbers.sons > 30 ||
    numbers.daughters > 30 ||
    numbers.predeceasedChildBranches > 30
  ) {
    return {
      error: "Those heir counts are outside the range of this checklist.",
    };
  }
  if (numbers.courtFeePercent > 100)
    return { error: "The court fee percentage cannot exceed 100%." };
  if (numbers.estateValue > 1e12)
    return {
      error: "That estate value is outside the range of this checklist.",
    };

  const assetList = Array.isArray(assets) ? assets : [];
  const has = (id) => assetList.includes(id);

  const hasBankAndSecurities = has("bankAndSecurities");
  const hasImmovable = has("immovable");
  const hasServiceBenefits = has("serviceBenefits");
  const hasInsurance = has("insurance");

  const needsSuccessionCertificate = hasBankAndSecurities && !willExists;
  const needsProbate = willExists && inPresidencyTownJurisdiction;
  const needsLettersOfAdministration =
    (willExists && !executorNamed) ||
    (!willExists && hasImmovable && !needsSuccessionCertificate);

  const instruments = [];
  instruments.push({
    id: "legalHeir",
    label: "Legal heir certificate",
    needed: true,
    issuedBy: "Tahsildar, revenue officer or the municipal authority",
    reason:
      "Identifies the surviving heirs so pension, gratuity, provident fund, insurance and utility records can be released or transferred. It is not a document of title.",
  });
  instruments.push({
    id: "succession",
    label: "Succession certificate",
    needed: needsSuccessionCertificate,
    issuedBy:
      "District Judge, under sections 370 to 390 of the Indian Succession Act, 1925",
    reason: needsSuccessionCertificate
      ? "Bank balances, shares and other securities of an intestate estate can only be transferred against this. Section 373 requires notice and an objection period first."
      : willExists
        ? "Not needed where a valid Will covers the securities — probate or letters of administration take its place."
        : "Only needed where the estate includes debts or securities such as bank deposits or shares.",
  });
  instruments.push({
    id: "probate",
    label: "Probate of the Will",
    needed: needsProbate,
    issuedBy: "High Court or District Court",
    reason: needsProbate
      ? "Compulsory for a Will made by a Hindu, Buddhist, Sikh or Jain within the former presidency towns, or covering immovable property there, under sections 57 and 213."
      : willExists
        ? "Not compulsory outside the former presidency towns, though registrars and banks often ask for it anyway."
        : "Only relevant where a Will exists.",
  });
  instruments.push({
    id: "letters",
    label: "Letters of administration",
    needed: needsLettersOfAdministration,
    issuedBy: "High Court or District Court, under sections 218 to 234",
    reason: needsLettersOfAdministration
      ? willExists
        ? "The Will names no executor able or willing to act, so the court appoints an administrator instead."
        : "There is immovable property in an intestate estate, and a court-appointed administrator is the cleanest route to a marketable title."
      : "Not needed on these answers.",
  });

  const neededInstruments = instruments.filter((entry) => entry.needed);

  const shares =
    religion.computesShares && !willExists
      ? computeHinduClassOneShares({
          gender,
          widows: numbers.widows,
          husbandAlive: Boolean(heirs.husbandAlive),
          sons: numbers.sons,
          daughters: numbers.daughters,
          motherAlive: Boolean(heirs.motherAlive),
          predeceasedChildBranches: numbers.predeceasedChildBranches,
        })
      : null;

  let shareNote;
  if (willExists) {
    shareNote =
      "A valid Will displaces the intestate rules, so shares follow the Will and not the statutory scheme.";
  } else if (!religion.computesShares) {
    shareNote = `Shares here are governed by the ${religion.law}, which this tool does not model. Take the division from a lawyer practising in that law.`;
  } else if (!shares) {
    shareNote =
      "No Class I heir has been entered. Where no Class I heir survives, the property passes to the Class II heirs in the order listed in the Schedule to the Hindu Succession Act.";
  } else {
    shareNote =
      gender === "male"
        ? "Section 10 of the Hindu Succession Act, 1956, applied to a male intestate."
        : "Section 15(1)(a) of the Hindu Succession Act, 1956, applied to a female intestate. Her mother is not among these first-order heirs.";
  }

  const courtFee = needsSuccessionCertificate
    ? computeSuccessionCourtFee(
        numbers.estateValue,
        numbers.courtFeePercent,
        numbers.courtFeeCap,
      )
    : { gross: 0, payable: 0, capped: false };

  const documents = buildDocuments({
    needsSuccessionCertificate,
    needsProbate,
    needsLettersOfAdministration,
    willExists: Boolean(willExists),
    hasImmovable,
    hasServiceBenefits,
    hasInsurance,
  });

  const requiredDocuments = documents.filter((doc) => doc.required);
  const optionalDocuments = documents.filter((doc) => !doc.required);

  return {
    religion,
    gender,
    willExists: Boolean(willExists),
    instruments,
    neededInstruments,
    needsSuccessionCertificate,
    needsProbate,
    needsLettersOfAdministration,
    shares,
    shareNote,
    courtFee,
    estateValue: round2(numbers.estateValue),
    documents,
    requiredDocuments,
    optionalDocuments,
    verdict: `${neededInstruments.length} instrument(s) needed and ${requiredDocuments.length} documents to assemble.`,
  };
}

/**
 * How ready the file is, measured against the required documents only.
 * @returns {{ have:number, total:number, percent:number, missing:Array, ready:boolean }}
 */
export function computeReadiness(documents, haveIds) {
  const list = Array.isArray(documents) ? documents : [];
  const have = Array.isArray(haveIds) ? haveIds : [];
  const requiredDocs = list.filter((doc) => doc.required);
  const missing = requiredDocs.filter((doc) => !have.includes(doc.id));
  const total = requiredDocs.length;
  const held = total - missing.length;
  return {
    have: held,
    total,
    percent: total === 0 ? 0 : Math.round((held / total) * 100),
    missing,
    ready: total > 0 && missing.length === 0,
  };
}

export default buildLegalHeirChecklist;
