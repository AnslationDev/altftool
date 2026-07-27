/**
 * GST treatment of education, coaching and training services in India.
 *
 * Source of the exemptions: Notification No. 12/2017-Central Tax (Rate) dated 28 June 2017,
 * principally entry 66 ("educational institution"), entry 69 (NSDC / skill development) and
 * entry 80 (training in arts, culture or sports by a charitable entity registered under
 * section 12AA/12AB of the Income-tax Act).
 *
 * Everything not covered by an exemption entry is a supply of education services under
 * SAC heading 9992, taxed at the standard rate.
 */

/** Standard GST rate on taxable education and training services, SAC 9992. */
export const EDUCATION_GST_RATE = 18;

/**
 * "Educational institution" is defined in clause 2(y) of Notification 12/2017 as one providing
 * services by way of (i) pre-school and school education up to higher secondary or equivalent,
 * (ii) education as part of a curriculum for a qualification recognised by law, or
 * (iii) an approved vocational education course. A coaching centre satisfies none of these.
 */
export const SCENARIOS = [
  {
    id: "school-tuition-fee",
    label: "School tuition fee charged to its own students (pre-school to higher secondary)",
    exempt: true,
    rate: 0,
    authority: "Notification 12/2017-CT(R), entry 66(a)",
    note: "Services by an educational institution to its students, faculty and staff are exempt.",
  },
  {
    id: "degree-college-fee",
    label: "College or university fee for a degree recognised by law",
    exempt: true,
    rate: 0,
    authority: "Notification 12/2017-CT(R), entry 66(a)",
    note: "The qualification must be recognised by a law in force; a private certificate is not.",
  },
  {
    id: "coaching-classes",
    label: "Coaching classes for JEE, NEET, UPSC, CA or school subjects",
    exempt: false,
    rate: EDUCATION_GST_RATE,
    authority: "SAC 9992, standard rate",
    note: "A coaching centre is not an educational institution because it does not itself award a qualification recognised by law.",
  },
  {
    id: "online-course",
    label: "Online course, recorded lectures or e-learning subscription",
    exempt: false,
    rate: EDUCATION_GST_RATE,
    authority: "SAC 9992, standard rate",
    note: "Taxable even when the content mirrors a school syllabus, unless the supplier is itself an educational institution teaching its own enrolled students.",
  },
  {
    id: "private-tuition",
    label: "Private tuition given by an individual tutor",
    exempt: false,
    rate: EDUCATION_GST_RATE,
    authority: "SAC 9992, standard rate",
    note: "Taxable in principle, but registration is only required once aggregate turnover crosses the threshold.",
  },
  {
    id: "approved-vocational",
    label: "Approved vocational education course (NCVT / SCVT affiliated ITI)",
    exempt: true,
    rate: 0,
    authority: "Notification 12/2017-CT(R), entry 66 read with clause 2(h)",
    note: "Only courses run by an affiliated ITI or under the Apprenticeship Act qualify as approved vocational education courses.",
  },
  {
    id: "nsdc-training",
    label: "Skill development training by an NSDC training partner or assessment agency",
    exempt: true,
    rate: 0,
    authority: "Notification 12/2017-CT(R), entry 69",
    note: "Exempt in relation to the National Skill Development Programme and schemes implemented by NSDC.",
  },
  {
    id: "arts-sports-charitable",
    label: "Training in arts, culture or sports by a charitable entity registered u/s 12AA/12AB",
    exempt: true,
    rate: 0,
    authority: "Notification 12/2017-CT(R), entry 80",
    note: "Exemption is for training or coaching of individuals in recreational activities relating to arts, culture or sports.",
  },
  {
    id: "school-transport",
    label: "Transport of students or staff supplied to a school (up to higher secondary)",
    exempt: true,
    rate: 0,
    authority: "Notification 12/2017-CT(R), entry 66(b)(i)",
    note: "Exempt only where the recipient institution provides education up to higher secondary or equivalent.",
  },
  {
    id: "school-catering",
    label: "Catering or mid-day meal supplied to a school (up to higher secondary)",
    exempt: true,
    rate: 0,
    authority: "Notification 12/2017-CT(R), entry 66(b)(ii)",
    note: "Includes any mid-day meals scheme sponsored by the Central or a State Government.",
  },
  {
    id: "school-housekeeping",
    label: "Security, cleaning or housekeeping supplied to a school (up to higher secondary)",
    exempt: true,
    rate: 0,
    authority: "Notification 12/2017-CT(R), entry 66(b)(iii)",
    note: "Same services supplied to a college or university are fully taxable.",
  },
  {
    id: "college-support-service",
    label: "Transport, catering, security or housekeeping supplied to a college or university",
    exempt: false,
    rate: EDUCATION_GST_RATE,
    authority: "Standard rate — entry 66(b) is limited to institutions up to higher secondary",
    note: "This is the most commonly missed distinction in the education exemption.",
  },
  {
    id: "examination-services",
    label: "Admission or examination services supplied to an educational institution",
    exempt: true,
    rate: 0,
    authority: "Notification 12/2017-CT(R), entry 66(b)(iv)",
    note: "This clause is not restricted to schools; it covers admission to, or conduct of examination by, any educational institution.",
  },
  {
    id: "hostel-by-institution",
    label: "Hostel and boarding charged by an educational institution to its own students",
    exempt: true,
    rate: 0,
    authority: "Notification 12/2017-CT(R), entry 66(a) as a composite supply of education",
    note: "Hostel run by a third party is a separate accommodation supply and is judged on its own merits.",
  },
  {
    id: "renting-to-institution",
    label: "Renting commercial premises to a school, college or coaching centre",
    exempt: false,
    rate: EDUCATION_GST_RATE,
    authority: "SAC 9972, standard rate",
    note: "Renting of immovable property is not covered by the education exemption entries.",
  },
  {
    id: "placement-services",
    label: "Campus placement or recruitment services supplied to an institution",
    exempt: false,
    rate: EDUCATION_GST_RATE,
    authority: "SAC 9985, standard rate",
    note: "Placement is a business support service, outside entry 66.",
  },
];

/** GST registration thresholds for a supplier of services, section 22 of the CGST Act, 2017. */
export const SERVICE_REGISTRATION_THRESHOLD = 2000000;
export const SERVICE_REGISTRATION_THRESHOLD_SPECIAL_STATES = 1000000;

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Look up a scenario by id. Returns undefined for an unknown id. */
export function getScenario(id) {
  return SCENARIOS.find((scenario) => scenario.id === id);
}

/**
 * Work out the GST on an education or training supply.
 *
 * @param {object} input
 * @param {string} input.scenarioId  One of SCENARIOS[].id
 * @param {number} input.amount      The consideration.
 * @param {"exclusive"|"inclusive"} input.amountType  Whether `amount` already contains GST.
 * @param {"intra"|"inter"} input.supplyType          Intra-state splits into CGST + SGST.
 * @returns {object} the computed values, or { error } for unusable input.
 */
export function computeEducationGst({
  scenarioId,
  amount,
  amountType = "exclusive",
  supplyType = "intra",
}) {
  const scenario = getScenario(scenarioId);
  if (!scenario) return { error: "Choose one of the listed education or training services." };

  const value = Number(amount);
  if (!Number.isFinite(value)) return { error: "Enter the fee or invoice amount as a number." };
  if (value < 0) return { error: "The amount cannot be negative." };
  if (amountType !== "exclusive" && amountType !== "inclusive") {
    return { error: "Say whether the amount is GST inclusive or exclusive." };
  }

  const rate = scenario.rate;

  let taxableValue;
  if (rate === 0) {
    taxableValue = value;
  } else if (amountType === "inclusive") {
    taxableValue = value / (1 + rate / 100);
  } else {
    taxableValue = value;
  }

  const totalTax = round2(taxableValue * (rate / 100));
  taxableValue = round2(taxableValue);

  const isIntra = supplyType === "intra";
  const cgst = isIntra ? round2(totalTax / 2) : 0;
  const sgst = isIntra ? round2(totalTax - round2(totalTax / 2)) : 0;
  const igst = isIntra ? 0 : totalTax;

  return {
    scenarioId: scenario.id,
    label: scenario.label,
    exempt: scenario.exempt,
    rate,
    authority: scenario.authority,
    note: scenario.note,
    taxableValue,
    cgst,
    sgst,
    igst,
    totalTax,
    invoiceTotal: round2(taxableValue + totalTax),
    supplyType: isIntra ? "intra" : "inter",
  };
}
