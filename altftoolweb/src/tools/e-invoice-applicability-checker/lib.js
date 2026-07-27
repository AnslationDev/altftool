/**
 * GST e-invoicing applicability — Rule 48(4) of the CGST Rules, 2017.
 *
 * The mandate is turnover-driven and permanent: once PAN-level aggregate
 * turnover EXCEEDS a notified threshold in ANY financial year from 2017-18
 * onwards, the registered person must report B2B / export / SEZ / deemed-export
 * documents to an Invoice Registration Portal (IRP) and quote the IRN.
 * A later fall in turnover does not switch the obligation off.
 */

/** 1 crore in rupees. */
export const CRORE = 10000000;

/**
 * Notified phase-in of the e-invoicing threshold.
 * `thresholdCr` is the aggregate-turnover figure that must be EXCEEDED
 * (the notifications use "exceeds", so an exactly equal turnover is outside).
 * Sources are the CGST (Central Tax) notifications listed against each row.
 */
export const E_INVOICE_PHASES = [
  {
    thresholdCr: 500,
    from: "2020-10-01",
    notification: "Notification 61/2020 & 70/2020 – Central Tax",
  },
  {
    thresholdCr: 100,
    from: "2021-01-01",
    notification: "Notification 88/2020 – Central Tax",
  },
  {
    thresholdCr: 50,
    from: "2021-04-01",
    notification: "Notification 5/2021 – Central Tax",
  },
  {
    thresholdCr: 20,
    from: "2022-04-01",
    notification: "Notification 1/2022 – Central Tax",
  },
  {
    thresholdCr: 10,
    from: "2022-10-01",
    notification: "Notification 17/2022 – Central Tax",
  },
  {
    thresholdCr: 5,
    from: "2023-08-01",
    notification: "Notification 10/2023 – Central Tax",
  },
];

/** Lowest threshold notified so far — the test that applies to new businesses today. */
export const CURRENT_THRESHOLD_CR = 5;

/**
 * GSTN advisory: documents must be reported to the IRP within 30 days of the
 * document date. The window applied to AATO >= Rs 100 crore from 1 Nov 2023 and
 * was extended to AATO >= Rs 10 crore with effect from 1 April 2025.
 */
export const IRP_REPORTING_WINDOW_DAYS = 30;
export const IRP_REPORTING_WINDOW_AATO_CR = 10;

/**
 * Dynamic QR code on B2C invoices — Rule 46(r) read with Notification 14/2020,
 * applicable where aggregate turnover exceeds Rs 500 crore.
 */
export const B2C_DYNAMIC_QR_THRESHOLD_CR = 500;

/**
 * Entity classes excluded from e-invoicing irrespective of turnover.
 * Exclusions come from the proviso to Notification 13/2020 – Central Tax as
 * amended by Notifications 61/2020, 23/2021 and later.
 */
export const ENTITY_TYPES = [
  {
    id: "regular",
    label: "Regular taxpayer (manufacturer, trader, service provider)",
    exempt: false,
  },
  {
    id: "sez-developer",
    label: "SEZ developer",
    exempt: false,
    note: "SEZ developers are covered. Only SEZ units are carved out.",
  },
  {
    id: "sez-unit",
    label: "SEZ unit",
    exempt: true,
    reason: "SEZ units are excluded by Notification 61/2020 – Central Tax.",
  },
  {
    id: "bank",
    label: "Bank, NBFC or other financial institution",
    exempt: true,
    reason:
      "Insurers, banking companies, financial institutions and NBFCs are excluded by the proviso to Notification 13/2020 – Central Tax.",
  },
  {
    id: "insurer",
    label: "Insurance company",
    exempt: true,
    reason:
      "Insurers are excluded by the proviso to Notification 13/2020 – Central Tax.",
  },
  {
    id: "gta",
    label: "Goods transport agency (road transport of goods)",
    exempt: true,
    reason:
      "A GTA supplying goods transport by road is excluded by Notification 13/2020 – Central Tax.",
  },
  {
    id: "passenger-transport",
    label: "Passenger transport service supplier",
    exempt: true,
    reason:
      "Suppliers of passenger transportation service are excluded by Notification 13/2020 – Central Tax.",
  },
  {
    id: "cinema",
    label: "Multiplex / cinematograph film exhibition service",
    exempt: true,
    reason:
      "Admission to exhibition of cinematograph films in multiplex screens is excluded by Notification 13/2020 – Central Tax.",
  },
  {
    id: "government",
    label: "Government department or local authority",
    exempt: true,
    reason:
      "Government departments and local authorities were excluded by Notification 23/2021 – Central Tax.",
  },
];

/** Document types that must carry an IRN once the mandate applies. */
export const COVERED_DOCUMENTS = [
  "Tax invoices for B2B supplies to GST-registered buyers",
  "Credit notes and debit notes against those B2B invoices",
  "Export invoices (with payment of tax and under LUT/bond)",
  "Supplies to SEZ units and SEZ developers",
  "Deemed exports and supplies to government departments registered for TDS",
];

/** Documents outside Rule 48(4) even for a covered taxpayer. */
export const EXCLUDED_DOCUMENTS = [
  "B2C invoices issued to unregistered consumers",
  "Bills of supply issued by composition dealers and for exempt supplies",
  "Delivery challans, job-work challans and financial/commercial credit notes",
  "Self-invoices raised for reverse-charge purchases from unregistered suppliers",
  "Imports, and entries in the ISD invoice stream",
];

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

/** Rupee value of a turnover expressed in crore. */
export function croreToRupees(crore) {
  if (!isFiniteNumber(crore)) return 0;
  return crore * CRORE;
}

/** Look up an entity definition; falls back to the regular taxpayer class. */
export function getEntityType(id) {
  return ENTITY_TYPES.find((entity) => entity.id === id) || ENTITY_TYPES[0];
}

/**
 * Decide whether e-invoicing applies.
 *
 * @param {object} input
 * @param {number} input.highestTurnoverCr  Highest PAN-level aggregate turnover,
 *   in Rs crore, in any financial year from 2017-18 onwards.
 * @param {number} input.lastYearTurnoverCr Aggregate turnover of the last
 *   completed financial year, in Rs crore (drives the 30-day IRP window).
 * @param {string} input.entityType         One of ENTITY_TYPES[].id
 * @param {boolean} input.hasB2BSupplies    Whether any B2B/export/SEZ supply is made.
 * @returns {object} result, or { error } when the input cannot be used.
 */
export function checkEInvoiceApplicability({
  highestTurnoverCr,
  lastYearTurnoverCr,
  entityType = "regular",
  hasB2BSupplies = true,
} = {}) {
  if (!isFiniteNumber(highestTurnoverCr) || !isFiniteNumber(lastYearTurnoverCr)) {
    return { error: "Enter turnover figures as numbers in Rs crore." };
  }
  if (highestTurnoverCr < 0 || lastYearTurnoverCr < 0) {
    return { error: "Aggregate turnover cannot be negative." };
  }
  // India's largest company reports well under Rs 10 lakh crore of turnover,
  // so anything past this is a typing slip rather than a real figure.
  if (highestTurnoverCr > 1000000 || lastYearTurnoverCr > 1000000) {
    return {
      error:
        "That turnover is beyond any real Indian taxpayer. Enter the figure in Rs crore, not rupees.",
    };
  }
  if (lastYearTurnoverCr > highestTurnoverCr) {
    return {
      error:
        "Last year's turnover cannot exceed the highest turnover of any year. Raise the highest-ever figure.",
    };
  }

  const entity = getEntityType(entityType);

  // Highest threshold actually crossed gives the earliest mandate date.
  const crossed = E_INVOICE_PHASES.filter(
    (phase) => highestTurnoverCr > phase.thresholdCr,
  );
  const firstPhase = crossed.length > 0 ? crossed[0] : null;

  const turnoverQualifies = firstPhase !== null;
  const applicable = turnoverQualifies && !entity.exempt && hasB2BSupplies;

  const reportingWindowApplies =
    applicable && lastYearTurnoverCr >= IRP_REPORTING_WINDOW_AATO_CR;

  const dynamicQrApplies =
    !entity.exempt && highestTurnoverCr > B2C_DYNAMIC_QR_THRESHOLD_CR;

  let verdict;
  let reason;
  if (entity.exempt) {
    verdict = "exempt";
    reason = entity.reason;
  } else if (!turnoverQualifies) {
    verdict = "below-threshold";
    reason = `Aggregate turnover has never exceeded Rs ${CURRENT_THRESHOLD_CR} crore, the lowest threshold notified so far, so Rule 48(4) does not apply yet.`;
  } else if (!hasB2BSupplies) {
    verdict = "no-covered-supplies";
    reason =
      "The turnover test is met, but e-invoicing attaches only to B2B, export, SEZ and deemed-export documents. Register on the IRP before your first such supply.";
  } else {
    verdict = "applicable";
    reason = `Aggregate turnover crossed Rs ${firstPhase.thresholdCr} crore, so e-invoicing has been mandatory since ${firstPhase.from} and stays mandatory even if turnover later falls.`;
  }

  const headroomCr = CURRENT_THRESHOLD_CR - highestTurnoverCr;

  return {
    verdict,
    applicable,
    reason,
    entityLabel: entity.label,
    entityNote: entity.note || "",
    entityExempt: entity.exempt,
    turnoverQualifies,
    highestTurnoverCr,
    lastYearTurnoverCr,
    highestTurnoverRupees: croreToRupees(highestTurnoverCr),
    thresholdCrossedCr: firstPhase ? firstPhase.thresholdCr : null,
    mandateFrom: firstPhase ? firstPhase.from : null,
    notification: firstPhase ? firstPhase.notification : null,
    currentThresholdCr: CURRENT_THRESHOLD_CR,
    headroomCr: headroomCr > 0 ? headroomCr : 0,
    reportingWindowApplies,
    reportingWindowDays: reportingWindowApplies ? IRP_REPORTING_WINDOW_DAYS : null,
    dynamicQrApplies,
    documents: COVERED_DOCUMENTS,
    excluded: EXCLUDED_DOCUMENTS,
  };
}

/**
 * Last date to report a document to the IRP under the 30-day window.
 * @param {string} documentDate ISO date (YYYY-MM-DD) of the invoice.
 * @returns {{ error: string } | { deadline: string, days: number }}
 */
export function irpReportingDeadline(documentDate) {
  if (typeof documentDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(documentDate)) {
    return { error: "Enter the document date as YYYY-MM-DD." };
  }
  const base = new Date(`${documentDate}T00:00:00Z`);
  if (Number.isNaN(base.getTime())) {
    return { error: "That is not a valid calendar date." };
  }
  const deadline = new Date(base.getTime());
  deadline.setUTCDate(deadline.getUTCDate() + IRP_REPORTING_WINDOW_DAYS);
  return {
    deadline: deadline.toISOString().slice(0, 10),
    days: IRP_REPORTING_WINDOW_DAYS,
  };
}
