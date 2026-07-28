/**
 * Home service entry consent form builder.
 *
 * Pure module - no React, no DOM, no clocks. It writes the permission a
 * householder gives a technician to enter, and computes the three numbers that
 * cause most of the arguments afterwards:
 *
 *   1. THE WINDOW  - how long the arrival window actually is, and the point at
 *                    which the visit counts as a no-show.
 *   2. THE BILL    - labour billed in whole increments with a minimum charge,
 *                    plus call-out, parts and tax.
 *   3. THE DEADLINE- the exact moment free cancellation stops.
 *
 * Entry consent matters because permission to enter a home is revocable and
 * limited: a person invited in for one purpose has no authority to wander, and
 * consent given by one occupier does not bind another.
 */

// Trades bill part-hours in whole blocks. Half an hour is the common block.
export const DEFAULT_BILLING_INCREMENT_MINUTES = 30;

// Most call-outs carry a first-hour minimum whatever the job turns out to be.
export const DEFAULT_MINIMUM_BILLABLE_MINUTES = 60;

// Free-cancellation notice. A full working day is the usual trade standard.
export const DEFAULT_CANCELLATION_NOTICE_HOURS = 24;

// An arrival window wider than this is effectively "some time today" and is
// worth pushing back on before you agree to wait in.
export const WIDE_WINDOW_MINUTES = 240;

export const MAX_WINDOW_MINUTES = 720;
export const MAX_JOB_MINUTES = 24 * 60;
export const MAX_TAX_PERCENT = 40;
export const MAX_NOTICE_HOURS = 168;

export const ACCESS_METHODS = [
  { id: "presentThroughout", label: "An adult occupier will be present for the whole visit", supervised: true },
  { id: "presentAtStart", label: "An occupier lets the technician in and stays in the property", supervised: true },
  { id: "keySafe", label: "Key safe or lockbox code given for this visit only", supervised: false },
  { id: "buildingStaff", label: "Building security or facilities staff will open up", supervised: false },
  { id: "neighbour", label: "A named neighbour or relative holds the key", supervised: false },
];

export const SERVICE_TYPES = [
  { id: "appliance", label: "Appliance repair or installation" },
  { id: "plumbing", label: "Plumbing" },
  { id: "electrical", label: "Electrical work" },
  { id: "hvac", label: "Air conditioning or heating service" },
  { id: "pestControl", label: "Pest control treatment" },
  { id: "internet", label: "Internet, cable or satellite installation" },
  { id: "cleaning", label: "Deep cleaning" },
  { id: "survey", label: "Inspection or survey only" },
];

// Jobs that disturb the fabric of the property or leave a residue need their own
// clauses - isolation of services, ventilation, re-entry times.
export const DISRUPTIVE_SERVICES = new Set(["plumbing", "electrical", "hvac", "pestControl"]);

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const check = new Date(Date.UTC(y, m - 1, d));
  return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
}

export function formatLongDate(iso) {
  if (!isValidIsoDate(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

export function minutesFromHhmm(value) {
  if (typeof value !== "string") return null;
  const match = HHMM.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function hhmmFromMinutes(minutes) {
  if (!Number.isFinite(minutes)) return "";
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`;
}

export function addDaysIso(iso, days) {
  if (!isValidIsoDate(iso) || !Number.isFinite(days)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d) + Math.trunc(days) * 86400000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

/**
 * Subtract hours from a date + time-of-day, rolling back across midnight.
 * @returns {null|{date: string, time: string}}
 */
export function subtractHours(iso, startMinutes, hours) {
  if (!isValidIsoDate(iso) || !Number.isFinite(startMinutes) || !Number.isFinite(hours)) return null;
  const total = startMinutes - hours * 60;
  const dayShift = Math.floor(total / 1440);
  const date = addDaysIso(iso, dayShift);
  if (!date) return null;
  return { date, time: hhmmFromMinutes(total) };
}

/**
 * Labour billed in whole increments, never below the minimum charge.
 * @returns {null|{billedMinutes, billedHours}}
 */
export function billableLabour({ jobMinutes, incrementMinutes, minimumMinutes }) {
  if (!Number.isFinite(jobMinutes) || jobMinutes <= 0 || jobMinutes > MAX_JOB_MINUTES) return null;
  if (!Number.isFinite(incrementMinutes) || incrementMinutes < 1 || incrementMinutes > 240) return null;
  if (!Number.isFinite(minimumMinutes) || minimumMinutes < 0 || minimumMinutes > MAX_JOB_MINUTES) return null;
  const rounded = Math.ceil(jobMinutes / incrementMinutes) * incrementMinutes;
  const billedMinutes = Math.max(rounded, minimumMinutes);
  return { billedMinutes, billedHours: billedMinutes / 60 };
}

const clean = (value) => String(value ?? "").trim();

function lookup(list, id, fallback) {
  return list.find((item) => item.id === id) || fallback;
}

/**
 * Build the entry consent form.
 * @returns {{error: string}} on bad input, otherwise the document and figures.
 */
export function buildHomeServiceEntryConsent(input = {}) {
  const occupierName = clean(input.occupierName);
  const occupierPhone = clean(input.occupierPhone);
  const propertyAddress = clean(input.propertyAddress);
  const companyName = clean(input.companyName);
  const technicianName = clean(input.technicianName);
  const jobReference = clean(input.jobReference);
  const workDescription = clean(input.workDescription);
  const offLimitsAreas = clean(input.offLimitsAreas);
  const petsNote = clean(input.petsNote);
  const currencySymbol = clean(input.currencySymbol) || "INR";
  const visitDate = clean(input.visitDate);
  const windowStart = clean(input.windowStart);
  const windowEnd = clean(input.windowEnd);
  const accessId = clean(input.accessId) || "presentThroughout";
  const serviceId = clean(input.serviceId) || "appliance";
  const homeRecording = Boolean(input.homeRecording);
  const idCheckRequired = Boolean(input.idCheckRequired);
  const utilitiesIsolated = Boolean(input.utilitiesIsolated);

  const jobMinutes = Number(input.jobMinutes);
  const incrementMinutes = Number(input.incrementMinutes ?? DEFAULT_BILLING_INCREMENT_MINUTES);
  const minimumMinutes = Number(input.minimumMinutes ?? DEFAULT_MINIMUM_BILLABLE_MINUTES);
  const callOutFee = Number(input.callOutFee ?? 0);
  const hourlyRate = Number(input.hourlyRate);
  const partsCost = Number(input.partsCost ?? 0);
  const taxPercent = Number(input.taxPercent ?? 0);
  const damageExcess = Number(input.damageExcess ?? 0);
  const cancellationNoticeHours = Number(
    input.cancellationNoticeHours === undefined || input.cancellationNoticeHours === ""
      ? DEFAULT_CANCELLATION_NOTICE_HOURS
      : input.cancellationNoticeHours,
  );

  if (!occupierName) return { error: "Enter the name of the person giving permission to enter." };
  if (!propertyAddress) return { error: "Enter the address the technician is being let into." };
  if (!companyName) return { error: "Enter the service company's name." };
  if (!workDescription) {
    return { error: "Describe the work. Permission to enter is limited to the job you describe, so a blank here makes the consent meaningless." };
  }
  if (!isValidIsoDate(visitDate)) return { error: "Enter a valid visit date in YYYY-MM-DD form." };

  const startMinutes = minutesFromHhmm(windowStart);
  const endMinutes = minutesFromHhmm(windowEnd);
  if (startMinutes === null || endMinutes === null) {
    return { error: "Enter the arrival window as 24-hour HH:MM times." };
  }
  const windowMinutes = endMinutes - startMinutes;
  if (windowMinutes <= 0) return { error: "The end of the arrival window must be after the start." };
  if (windowMinutes > MAX_WINDOW_MINUTES) {
    return { error: `An arrival window longer than ${MAX_WINDOW_MINUTES / 60} hours is not a window - ask for a narrower slot.` };
  }

  const labour = billableLabour({ jobMinutes, incrementMinutes, minimumMinutes });
  if (!labour) {
    return { error: `Check the job length: 1-${MAX_JOB_MINUTES} minutes, billing increment 1-240 minutes, minimum charge 0-${MAX_JOB_MINUTES} minutes.` };
  }

  const moneyFields = [callOutFee, hourlyRate, partsCost, damageExcess];
  if (moneyFields.some((value) => !Number.isFinite(value) || value < 0)) {
    return { error: "Charges cannot be negative or blank - use 0 where nothing applies." };
  }
  if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > MAX_TAX_PERCENT) {
    return { error: `Tax must be between 0% and ${MAX_TAX_PERCENT}%.` };
  }
  if (
    !Number.isFinite(cancellationNoticeHours) ||
    cancellationNoticeHours < 0 ||
    cancellationNoticeHours > MAX_NOTICE_HOURS
  ) {
    return { error: `Cancellation notice must be between 0 and ${MAX_NOTICE_HOURS} hours.` };
  }

  const labourCost = labour.billedHours * hourlyRate;
  const subtotal = callOutFee + labourCost + partsCost;
  const taxAmount = subtotal * (taxPercent / 100);
  const totalCost = subtotal + taxAmount;

  const cancelBy = subtractHours(visitDate, startMinutes, cancellationNoticeHours);
  const access = lookup(ACCESS_METHODS, accessId, ACCESS_METHODS[0]);
  const service = lookup(SERVICE_TYPES, serviceId, SERVICE_TYPES[0]);
  const disruptive = DISRUPTIVE_SERVICES.has(service.id);

  const money = (value) => `${currencySymbol} ${Math.round(value).toLocaleString("en-IN")}`;
  const windowHours = windowMinutes / 60;

  const warnings = [];
  if (windowMinutes > WIDE_WINDOW_MINUTES) {
    warnings.push(`A ${(Math.round(windowHours * 10) / 10).toFixed(1)}-hour arrival window means someone waits in for most of the day. Ask for a two-hour slot and a call ahead.`);
  }
  if (!access.supervised) {
    warnings.push("Nobody from the household will be present. Change any shared code straight after the visit, and take photographs of the work area before and after.");
  }
  if (!idCheckRequired) {
    warnings.push("No ID check is required by this form. Add one - checking a photo ID and the job reference at the door is the single cheapest protection against a bogus caller.");
  }
  if (homeRecording) {
    warnings.push("Cameras or a smart doorbell are recording. Tell the technician before they start; recording someone at work without telling them is both rude and, in many places, a legal problem.");
  }
  if (disruptive && !utilitiesIsolated) {
    warnings.push(`${service.label} normally needs water, gas or power isolated before work starts. Agree who does that, and who turns it back on.`);
  }
  if (damageExcess === 0) {
    warnings.push("No damage excess is stated, so any accidental damage is a negotiation later. Ask for the company's public liability cover and note the policy number on the form.");
  }
  if (cancellationNoticeHours === 0) {
    warnings.push("With zero notice required, either side can cancel on the doorstep. Most trades expect a working day's notice both ways.");
  }
  if (labour.billedMinutes > jobMinutes) {
    warnings.push(`The quote bills ${labour.billedMinutes} minutes for a ${Math.round(jobMinutes)}-minute job because of the minimum charge and the ${incrementMinutes}-minute rounding block.`);
  }

  const sections = [
    {
      heading: "1. Permission to enter",
      body: [
        `${occupierName}, an adult occupier of ${propertyAddress}, permits ${companyName}${technicianName ? ` and its technician ${technicianName}` : ""} to enter the property on ${formatLongDate(visitDate)} between ${windowStart} and ${windowEnd} for the sole purpose described below.`,
        "This permission covers that purpose and no other. It does not authorise entry on any other date, entry by anyone not named or identified at the door, or access to any part of the property not needed for the work.",
        "The occupier may withdraw this permission at any time, including during the visit, by asking the technician to leave.",
      ].join(" "),
    },
    {
      heading: "2. The work",
      body: [
        `Service: ${service.label}.`,
        `Job reference: ${jobReference || "________________"}.`,
        `Work agreed: ${workDescription}`,
        "Anything beyond this description - additional repairs, replacement parts or a second visit - needs the occupier's agreement before it is started or charged.",
      ].join("\n"),
    },
    {
      heading: "3. Access and identification",
      body: [
        `Access method: ${access.label}.`,
        idCheckRequired
          ? "Before entry, the technician will show a photo ID card carrying their name and their employer's name, and will state the job reference. The occupier may refuse entry if either is missing."
          : "No ID check has been specified. The occupier may still ask for photo ID and the job reference at the door, and may refuse entry if they are not produced.",
        access.id === "keySafe"
          ? "The code given is for this visit only and will be changed immediately afterwards. It must not be recorded, photographed or shared with anyone outside the visiting team."
          : null,
        "Alarm codes, if any, are given verbally at the door and are not written on this form.",
      ].filter(Boolean).join(" "),
    },
    {
      heading: "4. Where the technician may go",
      body: [
        "The technician may enter only the rooms needed for the work, and the route to them.",
        offLimitsAreas ? `Off limits: ${offLimitsAreas}.` : "Off limits: ______________________________________.",
        petsNote ? `Pets on site: ${petsNote}.` : "Pets on site: ______________________________________.",
        "Doors, windows and gates opened during the visit are closed again before the technician leaves.",
      ].join(" "),
    },
    {
      heading: "5. Safety",
      body: [
        utilitiesIsolated
          ? "Water, gas or electrical supplies to the work area will be isolated before work starts, and restored and tested before the technician leaves."
          : "The occupier and the technician will agree at the door which supplies need isolating and who restores them.",
        disruptive
          ? "The occupier will be told before work starts how long the area must stay clear, what ventilation is needed, and when it is safe to re-enter and to let children or pets back in."
          : "The occupier will be told of anything that must be kept clear during the work.",
        "The technician will not leave tools, hot surfaces, open panels, exposed wiring or chemicals unattended in an occupied area.",
      ].join(" "),
    },
    {
      heading: "6. Recording in the home",
      body: homeRecording
        ? "The property has cameras or a video doorbell that may record while the technician is present. The occupier confirms they have told the technician, that recording is confined to the work area and entrances, and that footage is kept only as long as needed and shared only where the law requires it."
        : "The occupier confirms no camera or recording device is running in the areas the technician will work in. If that changes, the occupier will tell the technician before recording starts.",
    },
    {
      heading: "7. Charges",
      body: [
        `Call-out: ${money(callOutFee)}.`,
        `Labour: ${labour.billedHours.toFixed(2)} hours at ${money(hourlyRate)} per hour = ${money(labourCost)}, billed in ${incrementMinutes}-minute blocks with a minimum of ${minimumMinutes} minutes.`,
        `Parts and materials: ${money(partsCost)}.`,
        taxPercent > 0 ? `Tax at ${taxPercent}%: ${money(taxAmount)}.` : "No tax applied to this quote.",
        `Estimated total: ${money(totalCost)}.`,
        "This is an estimate for the work described. Extra time, extra parts or a return visit are quoted and agreed before they are started.",
      ].join(" "),
    },
    {
      heading: "8. Damage and liability",
      body: [
        `${companyName} is responsible for damage caused by its own work or by its technician's carelessness, and will repair or make good such damage.`,
        damageExcess > 0
          ? `The occupier agrees to bear the first ${money(damageExcess)} of any single claim, and the company covers the balance.`
          : "No excess applies to accidental damage claims.",
        "The occupier is asked to move fragile and valuable items out of the work area before the visit; the company is not responsible for items left in the way after being asked to move them.",
        "Nothing in this form limits liability for death or personal injury caused by negligence, or overrides the occupier's statutory rights.",
        "The occupier confirms they are entitled to give this permission for the property. Where the property is rented or shared, the occupier confirms the landlord or the other occupiers have been informed as their agreement requires.",
      ].join(" "),
    },
    {
      heading: "9. Cancellation and no-show",
      body: [
        cancelBy
          ? `Either side may cancel free of charge until ${formatLongDate(cancelBy.date)} at ${cancelBy.time}, which is ${Math.round(cancellationNoticeHours)} hours before the window opens.`
          : "Cancellation terms to be agreed.",
        `If the technician has not arrived by ${windowEnd}, the visit counts as a missed appointment: the occupier is free to leave, no call-out is payable, and the company rebooks at the occupier's convenience.`,
        "If nobody is available to give access during the agreed window, the call-out fee remains payable.",
      ].join(" "),
    },
    {
      heading: "10. Signatures",
      body: [
        `Occupier: ${occupierName}${occupierPhone ? `    Phone: ${occupierPhone}` : ""}`,
        "Signature: ______________________    Date and time: ______________",
        "",
        `Technician (for ${companyName}): ${technicianName || "______________________"}`,
        "ID shown:  Yes / No        Signature: ______________________",
        "Time in: ____________    Time out: ____________",
      ].join("\n"),
    },
  ];

  const documentText = [
    "HOME SERVICE ENTRY CONSENT AND WORK AUTHORISATION",
    "",
    ...sections.flatMap((section) => [section.heading, section.body, ""]),
    "Informational template only, not legal advice. Consumer, tenancy and trade-licensing rules differ by country - take professional advice before relying on this for anything contentious.",
  ].join("\n");

  return {
    sections,
    documentText,
    windowMinutes,
    windowHours,
    billedMinutes: labour.billedMinutes,
    billedHours: labour.billedHours,
    jobMinutes: Math.round(jobMinutes),
    labourCost,
    callOutFee,
    partsCost,
    subtotal,
    taxAmount,
    taxPercent,
    totalCost,
    damageExcess,
    cancelBy,
    cancellationNoticeHours: Math.round(cancellationNoticeHours),
    accessLabel: access.label,
    supervised: access.supervised,
    serviceLabel: service.label,
    currencySymbol,
    warnings,
  };
}
