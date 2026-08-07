/**
 * Shipping and delivery policy generator with a working-day ETA calculator.
 *
 * The delivery estimate is a plain working-day walk:
 *
 *   dispatch date  = order date (or the next day if the cut-off has passed)
 *                    advanced by the processing days, counting working days only
 *   delivery window = dispatch date advanced by the zone's minimum and maximum
 *                    transit days, again counting working days only
 *
 * Non-working days are Sundays, optionally Saturdays, and any holiday the
 * merchant lists. Cash on delivery can add its own extra days because many
 * carriers route COD parcels differently.
 *
 * The policy clauses rest on published rules:
 *
 *  - Consumer Protection (E-Commerce) Rules 2020, Rule 5(3): a seller must
 *    provide, among other things, delivery and shipment details, the cost of
 *    return shipping, and refund, exchange and warranty terms, before a
 *    consumer agrees to buy.
 *  - Consumer Protection (E-Commerce) Rules 2020, Rule 4(5): a consumer
 *    complaint must be acknowledged within 48 hours and redressed within one
 *    month.
 *  - Consumer Protection Act 2019, Section 2(11): not delivering what was
 *    promised, or delivering it damaged, is a deficiency in service.
 *  - Consumer Protection Act 2019, Section 69: two years to file a complaint.
 *  - Legal Metrology (Packaged Commodities) Rules 2011, Rule 6: every
 *    pre-packaged commodity must carry the packer's name and address, net
 *    quantity, retail sale price inclusive of all taxes, consumer care details
 *    and the month and year of packing - the same declarations have to appear
 *    on the e-commerce listing.
 *  - Carriage by Road Act 2007, Section 10: a common carrier is liable for
 *    loss or damage to consigned goods; Section 16: no suit or legal
 *    proceeding lies against a common carrier unless written notice of the
 *    loss or damage is given within 180 days of the date of booking. That
 *    180-day figure is why the drafted policy asks customers to report damage
 *    promptly and keeps the carrier claim window visible.
 *
 * Informational only; not legal advice.
 */

/** Rule 4(5), Consumer Protection (E-Commerce) Rules 2020. */
export const ACK_HOURS_LIMIT = 48;
/** Rule 4(5) outer limit for redressal, in days. */
export const REDRESS_DAYS_LIMIT = 30;
/** Section 16, Carriage by Road Act 2007 - notice window for a carrier claim. */
export const CARRIER_NOTICE_DAYS = 180;
/** Section 69, Consumer Protection Act 2019. */
export const COMPLAINT_LIMITATION_YEARS = 2;

const MS_PER_DAY = 86400000;
/** Safety stop so a calendar with too many holidays cannot loop forever. */
const MAX_CALENDAR_WALK_DAYS = 400;
/** Longest a free-text field may run. */
const MAX_FIELD = 120;
/** Minutes in a day, used to validate cut-off times. */
const MINUTES_IN_DAY = 1440;

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

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Typical Indian surface-courier transit bands, in working days after dispatch.
 * These are ordinary commercial ranges, not statutory limits - a merchant
 * should replace them with the numbers its own carrier contract promises.
 */
export const DELIVERY_ZONES = [
  {
    id: "local",
    label: "Local / same city",
    minDays: 1,
    maxDays: 2,
    example: "Within the city the parcel is dispatched from",
  },
  {
    id: "metro",
    label: "Metro to metro",
    minDays: 2,
    maxDays: 3,
    example: "Delhi, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad",
  },
  {
    id: "same-state",
    label: "Same state, non-metro",
    minDays: 2,
    maxDays: 4,
    example: "District towns and taluka headquarters in the dispatch state",
  },
  {
    id: "rest-of-india",
    label: "Rest of India",
    minDays: 4,
    maxDays: 7,
    example: "All other serviceable PIN codes on the mainland",
  },
  {
    id: "remote",
    label: "North-East, J&K, Ladakh, Andaman and Lakshadweep",
    minDays: 7,
    maxDays: 12,
    example: "Hill, island and restricted-access PIN codes",
  },
];

/** Steps a customer must take when a parcel arrives damaged or short. */
export const DAMAGE_STEPS = [
  {
    id: "refuse",
    label: "Refuse a visibly damaged parcel at the door",
    text: "If the outer packing is torn, wet, re-taped or the seal is broken, refuse delivery and ask the rider to mark it as damaged. A refused parcel comes straight back to us and is replaced or refunded without any further proof.",
  },
  {
    id: "unboxing",
    label: "Ask for an unboxing video for high-value orders",
    text: "For orders above the value stated below, please record a single continuous unboxing video that shows the sealed parcel, the shipping label and the opening. It is the fastest way to settle a shortage or breakage claim with the carrier.",
  },
  {
    id: "photos",
    label: "Photographs of the parcel, label and contents",
    text: "Photograph the outer packing from all sides, the shipping label with the AWB number, and the damaged item as it lies in the box before you move it.",
  },
  {
    id: "keep-packing",
    label: "Keep the packaging until the claim closes",
    text: "Please keep the box and all packing material until the claim is settled. Carriers routinely ask to inspect the packing, and a claim can fail without it.",
  },
  {
    id: "report-window",
    label: "Report within a fixed window",
    text: "Report the damage or shortage within the reporting window stated below, counted from the delivery timestamp on the tracking page.",
  },
];

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

/**
 * Parse yyyy-mm-dd into a UTC-midnight timestamp, or null when unreal.
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
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return stamp;
}

function toIso(stamp) {
  const date = new Date(stamp);
  const yyyy = String(date.getUTCFullYear()).padStart(4, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function describe(stamp) {
  const date = new Date(stamp);
  return {
    iso: toIso(stamp),
    long: `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
    weekday: WEEKDAY_NAMES[date.getUTCDay()],
  };
}

/**
 * Format a minutes-from-midnight value as a 12-hour clock time.
 * @param {number} minutes
 * @returns {string|null}
 */
export function formatClock(minutes) {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes >= MINUTES_IN_DAY) return null;
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const suffix = hour24 < 12 ? "am" : "pm";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

/**
 * Turn an "HH:MM" 24-hour string into minutes past midnight.
 * Returns null when the string is not a real time.
 * @param {string} value
 * @returns {number|null}
 */
export function parseClock(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Split a free-text list of holiday dates into an array of yyyy-mm-dd strings.
 * Separators may be commas, semicolons, spaces or line breaks.
 * @param {string} value
 * @returns {string[]}
 */
export function splitHolidayList(value) {
  return String(value ?? "")
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isWorkingDay(stamp, { shipsOnSaturday, shipsOnSunday, holidaySet }) {
  const day = new Date(stamp).getUTCDay();
  if (day === 0 && !shipsOnSunday) return false;
  if (day === 6 && !shipsOnSaturday) return false;
  return !holidaySet.has(toIso(stamp));
}

/**
 * Advance a date by a number of working days. Zero returns the same date if it
 * is already a working day, otherwise the next working day.
 *
 * @param {number} startStamp UTC-midnight timestamp.
 * @param {number} days       Whole working days to add.
 * @param {{shipsOnSaturday:boolean, shipsOnSunday:boolean, holidaySet:Set<string>}} calendar
 * @returns {number|null} Timestamp, or null if no working day is reachable.
 */
function addWorkingDays(startStamp, days, calendar) {
  let cursor = startStamp;
  let walked = 0;
  while (!isWorkingDay(cursor, calendar)) {
    cursor += MS_PER_DAY;
    walked += 1;
    if (walked > MAX_CALENDAR_WALK_DAYS) return null;
  }
  let remaining = days;
  while (remaining > 0) {
    cursor += MS_PER_DAY;
    walked += 1;
    if (walked > MAX_CALENDAR_WALK_DAYS) return null;
    if (isWorkingDay(cursor, calendar)) remaining -= 1;
  }
  return cursor;
}

/**
 * Estimate the dispatch date and the delivery window for one order.
 *
 * @param {object} input
 * @param {string} input.orderDate        yyyy-mm-dd the order is placed.
 * @param {number} input.orderMinutes     Minutes past midnight the order is placed.
 * @param {number} input.cutoffMinutes    Same-day dispatch cut-off, minutes past midnight.
 * @param {number} input.processingDays   Working days needed to pack and hand over.
 * @param {string} input.zoneId           One of DELIVERY_ZONES ids.
 * @param {boolean} [input.shipsOnSaturday]
 * @param {boolean} [input.shipsOnSunday]
 * @param {string[]} [input.holidays]     yyyy-mm-dd dates with no dispatch or delivery.
 * @param {boolean} [input.isCod]         Cash on delivery order.
 * @param {number} [input.codExtraDays]   Extra working days a COD parcel takes.
 * @returns {{missedCutoff:boolean, preparationStart:object, dispatch:object,
 *            earliest:object, latest:object, zoneLabel:string,
 *            minTransitDays:number, maxTransitDays:number,
 *            calendarDaysMin:number, calendarDaysMax:number} | {error:string}}
 */
export function computeDeliveryEstimate({
  orderDate,
  orderMinutes,
  cutoffMinutes,
  processingDays,
  zoneId,
  shipsOnSaturday = true,
  shipsOnSunday = false,
  holidays = [],
  isCod = false,
  codExtraDays = 0,
}) {
  const start = parseIsoDate(orderDate);
  if (start === null) return { error: "Enter a valid order date in yyyy-mm-dd form." };

  const placed = Number(orderMinutes);
  const cutoff = Number(cutoffMinutes);
  const processing = Number(processingDays);
  const codExtra = Number(codExtraDays);

  if (![placed, cutoff, processing, codExtra].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for the order time, cut-off and processing days." };
  }
  if (!Number.isInteger(placed) || placed < 0 || placed >= MINUTES_IN_DAY) {
    return { error: "Order time must be a real time of day." };
  }
  if (!Number.isInteger(cutoff) || cutoff < 0 || cutoff >= MINUTES_IN_DAY) {
    return { error: "The dispatch cut-off must be a real time of day." };
  }
  if (!Number.isInteger(processing) || processing < 0 || processing > 30) {
    return { error: "Processing time must be a whole number of working days from 0 to 30." };
  }
  if (!Number.isInteger(codExtra) || codExtra < 0 || codExtra > 10) {
    return { error: "Extra COD days must be a whole number from 0 to 10." };
  }

  const zone = DELIVERY_ZONES.find((item) => item.id === zoneId);
  if (!zone) return { error: "Choose a delivery zone." };

  const holidaySet = new Set();
  for (const holiday of holidays) {
    const stamp = parseIsoDate(holiday);
    if (stamp === null) {
      return { error: `"${holiday}" is not a valid holiday date - use yyyy-mm-dd.` };
    }
    holidaySet.add(toIso(stamp));
  }

  const calendar = { shipsOnSaturday, shipsOnSunday, holidaySet };
  if (!shipsOnSaturday && !shipsOnSunday && holidaySet.size > 260) {
    return { error: "With this many holidays there is no working day left to dispatch on." };
  }

  const missedCutoff = placed >= cutoff;
  const preparationStamp = missedCutoff ? start + MS_PER_DAY : start;

  const preparationWalked = addWorkingDays(preparationStamp, 0, calendar);
  if (preparationWalked === null) {
    return { error: "No working day is available to dispatch on - check the holiday list." };
  }

  const dispatchStamp = addWorkingDays(preparationStamp, processing, calendar);
  if (dispatchStamp === null) {
    return { error: "No working day is available to dispatch on - check the holiday list." };
  }

  const codDays = isCod ? codExtra : 0;
  const minTransitDays = zone.minDays + codDays;
  const maxTransitDays = zone.maxDays + codDays;

  const earliestStamp = addWorkingDays(dispatchStamp + MS_PER_DAY, minTransitDays - 1, calendar);
  const latestStamp = addWorkingDays(dispatchStamp + MS_PER_DAY, maxTransitDays - 1, calendar);
  if (earliestStamp === null || latestStamp === null) {
    return { error: "No working day is available for delivery - check the holiday list." };
  }

  return {
    missedCutoff,
    preparationStart: describe(preparationWalked),
    dispatch: describe(dispatchStamp),
    earliest: describe(earliestStamp),
    latest: describe(latestStamp),
    zoneLabel: zone.label,
    minTransitDays,
    maxTransitDays,
    calendarDaysMin: Math.round((earliestStamp - start) / MS_PER_DAY),
    calendarDaysMax: Math.round((latestStamp - start) / MS_PER_DAY),
  };
}

/**
 * Assemble the published shipping and delivery policy.
 *
 * @param {object} input
 * @param {string} input.storeName
 * @param {string} input.dispatchCity
 * @param {string} input.contactEmail
 * @param {string} input.effectiveDate    yyyy-mm-dd
 * @param {number} input.cutoffMinutes
 * @param {number} input.processingDays
 * @param {string[]} input.zoneIds
 * @param {boolean} input.shipsOnSaturday
 * @param {boolean} input.shipsOnSunday
 * @param {number} input.freeShippingAbove   0 disables free shipping.
 * @param {number} input.flatShippingFee
 * @param {boolean} input.codAvailable
 * @param {number} input.codFee
 * @param {number} input.codLimit
 * @param {number} input.codExtraDays
 * @param {string[]} input.damageStepIds
 * @param {number} input.damageReportHours
 * @param {number} input.unboxingThreshold
 * @param {number} input.ackHours
 * @param {number} input.redressDays
 * @returns {{policyText:string, clauses:{title:string, body:string}[],
 *            effectiveLong:string, zoneCount:number} | {error:string}}
 */
export function buildShippingPolicy({
  storeName,
  dispatchCity,
  contactEmail,
  effectiveDate,
  cutoffMinutes,
  processingDays,
  zoneIds = [],
  shipsOnSaturday = true,
  shipsOnSunday = false,
  freeShippingAbove = 0,
  flatShippingFee = 0,
  codAvailable = true,
  codFee = 0,
  codLimit = 0,
  codExtraDays = 0,
  damageStepIds = [],
  damageReportHours = 48,
  unboxingThreshold = 5000,
  ackHours,
  redressDays,
}) {
  const store = clean(storeName);
  const city = clean(dispatchCity);
  const email = clean(contactEmail);

  if (!store) return { error: "Enter the store or brand name." };
  if (!city) return { error: "Enter the city you dispatch from." };
  if (!email) return { error: "Enter a support email for delivery queries." };
  if ([store, city, email].some((value) => value.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }

  const effectiveStamp = parseIsoDate(effectiveDate);
  if (effectiveStamp === null) return { error: "Enter a valid effective date." };
  const effectiveLong = describe(effectiveStamp).long;

  const cutoffText = formatClock(Number(cutoffMinutes));
  if (!cutoffText) return { error: "The dispatch cut-off must be a real time of day." };

  const processing = Number(processingDays);
  if (!Number.isInteger(processing) || processing < 0 || processing > 30) {
    return { error: "Processing time must be a whole number of working days from 0 to 30." };
  }

  const zones = DELIVERY_ZONES.filter((zone) => zoneIds.includes(zone.id));
  if (zones.length === 0) {
    return { error: "Select at least one delivery zone to publish timelines for." };
  }

  const numbers = {
    freeShippingAbove: Number(freeShippingAbove),
    flatShippingFee: Number(flatShippingFee),
    codFee: Number(codFee),
    codLimit: Number(codLimit),
    unboxingThreshold: Number(unboxingThreshold),
  };
  if (!Object.values(numbers).every((value) => Number.isFinite(value) && value >= 0)) {
    return { error: "Shipping, COD and threshold amounts must be valid non-negative numbers." };
  }

  const codExtra = Number(codExtraDays);
  if (!Number.isInteger(codExtra) || codExtra < 0 || codExtra > 10) {
    return { error: "Extra COD days must be a whole number from 0 to 10." };
  }

  const damageHours = Number(damageReportHours);
  if (!Number.isInteger(damageHours) || damageHours < 1 || damageHours > 720) {
    return { error: "The damage reporting window must be between 1 and 720 hours." };
  }

  const ack = Number(ackHours);
  if (!Number.isInteger(ack) || ack < 1 || ack > ACK_HOURS_LIMIT) {
    return {
      error: `Acknowledgement time must be 1 to ${ACK_HOURS_LIMIT} hours - Rule 4(5) of the Consumer Protection (E-Commerce) Rules 2020 caps it at ${ACK_HOURS_LIMIT} hours.`,
    };
  }

  const redress = Number(redressDays);
  if (!Number.isInteger(redress) || redress < 1 || redress > REDRESS_DAYS_LIMIT) {
    return { error: `Resolution time must be 1 to ${REDRESS_DAYS_LIMIT} days under Rule 4(5).` };
  }

  const steps = DAMAGE_STEPS.filter((step) => damageStepIds.includes(step.id));

  const workingDayText = shipsOnSunday
    ? "all seven days"
    : shipsOnSaturday
      ? "Monday to Saturday"
      : "Monday to Friday";

  const clauses = [
    {
      title: "1. Where we ship from and when",
      body: `${store} dispatches from ${city}. We pack and hand over parcels ${workingDayText}, excluding public holidays we announce on the site. Orders confirmed before ${cutoffText} enter the same day's packing run; orders after that go into the next working day's run. ${processing === 0 ? "Orders are handed to the carrier the same working day they enter a packing run." : `Packing takes ${processing} working day${processing === 1 ? "" : "s"} after that.`}`,
    },
    {
      title: "2. Delivery timelines by zone",
      body: `Transit time is counted in working days after dispatch, not from the moment you place the order:\n${zones
        .map((zone) => `- ${zone.label} (${zone.example}): ${zone.minDays} to ${zone.maxDays} working days.`)
        .join("\n")}\nThese are the ranges our carriers commit to. Weather, strikes, festival volumes and local restrictions can push a parcel beyond them; we will tell you if that happens to your order.`,
    },
    {
      title: "3. Shipping charges",
      body:
        numbers.freeShippingAbove > 0
          ? `Shipping is free on orders of Rs ${numbers.freeShippingAbove} and above. Below that, a flat shipping charge of Rs ${numbers.flatShippingFee} applies and is shown before you pay, never added afterwards.`
          : numbers.flatShippingFee > 0
            ? `A flat shipping charge of Rs ${numbers.flatShippingFee} applies to every order and is shown before you pay.`
            : "Shipping is included in the price shown; no charge is added at checkout.",
    },
    {
      title: "4. Cash on delivery",
      body: codAvailable
        ? `Cash on delivery is available on serviceable PIN codes${numbers.codLimit > 0 ? ` for orders up to Rs ${numbers.codLimit}` : ""}.${numbers.codFee > 0 ? ` A COD handling fee of Rs ${numbers.codFee} is added and shown at checkout.` : ""}${codExtra > 0 ? ` COD parcels take about ${codExtra} working day${codExtra === 1 ? "" : "s"} longer than prepaid parcels because of the way carriers route them.` : ""} Please keep the exact amount ready; riders may not carry change, and a refused COD parcel that returns to us may make future COD orders unavailable on that address.`
        : "We do not offer cash on delivery. All orders are prepaid, which also makes any refund faster because the money returns to the same instrument.",
    },
    {
      title: "5. Address, PIN code and delivery attempts",
      body: `Please check the address, PIN code and phone number before paying; once a parcel is handed to the carrier the address can only be changed if the carrier allows it. Carriers normally make up to three delivery attempts and then return the parcel to us. If a parcel comes back because the address was wrong, nobody was available, or the phone was unreachable, we refund the item value and retain the actual to-and-fro freight, which we will show you on the carrier invoice.`,
    },
    {
      title: "6. Tracking",
      body: `A tracking number is emailed to you when the carrier scans the parcel in. Tracking can take up to 24 hours to start updating. If tracking has not moved for three working days, write to ${email} with the order number and we will open a trace with the carrier.`,
    },
    {
      title: "7. Damaged, short or tampered parcels",
      body:
        steps.length > 0
          ? `${steps
              .map((step) =>
                step.id === "unboxing"
                  ? step.text.replace(
                      "above the value stated below",
                      `above Rs ${numbers.unboxingThreshold}`,
                    )
                  : step.id === "report-window"
                    ? step.text.replace(
                        "within the reporting window stated below",
                        `within ${damageHours} hours of delivery`,
                      )
                    : step.text,
              )
              .map((text) => `- ${text}`)
              .join("\n")}\nOnce we have what we need we replace or refund without waiting for the carrier claim to close. A carrier claim itself must be notified in writing within ${CARRIER_NOTICE_DAYS} days of booking under Section 16 of the Carriage by Road Act 2007, which we handle on your behalf.`
          : `Report any damage, shortage or tampering within ${damageHours} hours of delivery with photographs of the parcel and the shipping label. We replace or refund without waiting for the carrier claim to close.`,
    },
    {
      title: "8. What is on the label",
      body: "Every pre-packed item we ship carries the declarations required by Rule 6 of the Legal Metrology (Packaged Commodities) Rules 2011 - the packer's name and address, net quantity, the retail sale price inclusive of all taxes, consumer care details and the month and year of packing. The same details appear on the product page before you buy.",
    },
    {
      title: "9. Delays and your rights",
      body: `If we cannot dispatch within the timeline shown on the product page, we will tell you and you may cancel for a full refund. Write to ${email} for anything to do with delivery; we acknowledge within ${ack} hour${ack === 1 ? "" : "s"} and resolve within ${redress} day${redress === 1 ? "" : "s"}, inside the 48-hour and one-month limits in Rule 4(5) of the Consumer Protection (E-Commerce) Rules 2020. If you remain dissatisfied, you may approach the District Consumer Disputes Redressal Commission within ${COMPLAINT_LIMITATION_YEARS} years of the cause of action under Section 69 of the Consumer Protection Act 2019.`,
    },
  ];

  const policyText = [
    `${store.toUpperCase()} - SHIPPING AND DELIVERY POLICY`,
    `Effective from ${effectiveLong}`,
    "",
    ...clauses.flatMap((clause) => [clause.title, clause.body, ""]),
    `Delivery queries: ${email}`,
  ]
    .join("\n")
    .trim();

  return { policyText, clauses, effectiveLong, zoneCount: zones.length };
}
