/**
 * International call cost comparison.
 *
 * Four ways of calling home from abroad are priced against the same call
 * volume, so the totals are directly comparable:
 *
 *   1. Home-carrier roaming / IDD  = minutes x rate + calls x connection fee
 *   2. Local prepaid SIM           = SIM cost + minutes x local IDD rate
 *   3. VoIP over mobile data       = billable minutes x MB/min / 1000 x price per GB
 *   4. International calling pack  = pack price + overage minutes x overage rate
 *
 * All arithmetic is done in the single currency the caller selects; the tool
 * does not convert between currencies and never invents an exchange rate.
 */

/**
 * VoIP payload rates. WhatsApp, FaceTime Audio and Signal voice calls measure
 * around 0.5 MB per minute at default codec settings; video calls measure
 * around 5 MB per minute.
 */
export const VOIP_MB_PER_MINUTE = {
  voice: { label: "Voice call (VoIP)", rate: 0.5 },
  video: { label: "Video call (VoIP)", rate: 5 },
};

/** Operators sell data in decimal units: 1 GB = 1000 MB. */
export const MB_PER_GB = 1000;

/**
 * Currencies offered. Locale is used only for Intl.NumberFormat output.
 */
export const CURRENCIES = {
  USD: { code: "USD", locale: "en-US", label: "US Dollar (USD)" },
  EUR: { code: "EUR", locale: "de-DE", label: "Euro (EUR)" },
  GBP: { code: "GBP", locale: "en-GB", label: "Pound Sterling (GBP)" },
  INR: { code: "INR", locale: "en-IN", label: "Indian Rupee (INR)" },
  AED: { code: "AED", locale: "en-AE", label: "UAE Dirham (AED)" },
  SGD: { code: "SGD", locale: "en-SG", label: "Singapore Dollar (SGD)" },
  AUD: { code: "AUD", locale: "en-AU", label: "Australian Dollar (AUD)" },
  CAD: { code: "CAD", locale: "en-CA", label: "Canadian Dollar (CAD)" },
};

/**
 * EU Regulation 2018/1971 caps calls made from your home EU/EEA country to
 * another EU/EEA country at EUR 0.19 per minute excluding VAT (SMS EUR 0.06),
 * in force since 15 May 2019. Separately, "Roam Like At Home" (in force since
 * 15 June 2017) means calls made while roaming inside the EU/EEA are billed at
 * your domestic rate. Both are reference figures, not applied automatically.
 */
export const EU_INTRA_EU_CALL_CAP_EUR_PER_MINUTE = 0.19;

/** Practical caps so a typo cannot produce a meaningless answer. */
export const MAX_DAYS = 365;
export const MAX_MINUTES_PER_DAY = 1440;

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const toNumber = (raw) => {
  if (raw === "" || raw === null || raw === undefined) return 0;
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Compare the cost of the four calling options over one trip.
 *
 * @param {object} input
 * @param {number|string} input.days                    trip length in days
 * @param {number|string} input.minutesPerDay           talk minutes per day
 * @param {number|string} input.callsPerDay             separate calls per day (for connection fees)
 * @param {string}        input.currency                key of CURRENCIES
 * @param {number|string} input.roamingRatePerMinute    home carrier roaming/IDD rate
 * @param {number|string} input.roamingConnectionFee    fixed fee charged per connected call
 * @param {number|string} input.localSimCost            one-off cost of a local prepaid SIM/eSIM
 * @param {number|string} input.localSimRatePerMinute   that SIM's international rate
 * @param {number|string} input.packPrice               price of an international calling pack
 * @param {number|string} input.packIncludedMinutes     minutes included in the pack
 * @param {number|string} input.packOverageRate         per-minute rate once the pack runs out
 * @param {number|string} input.dataPricePerGb          effective price of 1 GB of mobile data
 * @param {string}        input.voipMode                key of VOIP_MB_PER_MINUTE
 * @param {number|string} input.voipWifiPercent         share of VoIP minutes made on free Wi-Fi
 * @returns {object} comparison, or { error } when the input cannot be used.
 */
export function compareCallCosts(input = {}) {
  const currencyKey = input.currency || "USD";
  const currency = CURRENCIES[currencyKey];
  if (!currency) return { error: "Unknown currency selected." };

  const voipMode = input.voipMode || "voice";
  const voip = VOIP_MB_PER_MINUTE[voipMode];
  if (!voip) return { error: "Unknown call type selected." };

  const n = {
    days: toNumber(input.days),
    minutesPerDay: toNumber(input.minutesPerDay),
    callsPerDay: toNumber(input.callsPerDay),
    roamingRatePerMinute: toNumber(input.roamingRatePerMinute),
    roamingConnectionFee: toNumber(input.roamingConnectionFee),
    localSimCost: toNumber(input.localSimCost),
    localSimRatePerMinute: toNumber(input.localSimRatePerMinute),
    packPrice: toNumber(input.packPrice),
    packIncludedMinutes: toNumber(input.packIncludedMinutes),
    packOverageRate: toNumber(input.packOverageRate),
    dataPricePerGb: toNumber(input.dataPricePerGb),
    voipWifiPercent: toNumber(input.voipWifiPercent),
  };

  if (Object.values(n).some((value) => Number.isNaN(value))) {
    return { error: "Every field must be a number." };
  }
  if (Object.values(n).some((value) => value < 0)) {
    return { error: "Rates, prices and durations cannot be negative." };
  }
  if (!(n.days >= 1)) return { error: "Trip length must be at least 1 day." };
  if (n.days > MAX_DAYS) return { error: `Trip length cannot exceed ${MAX_DAYS} days.` };
  if (n.minutesPerDay > MAX_MINUTES_PER_DAY) {
    return { error: `Talk time cannot exceed ${MAX_MINUTES_PER_DAY} minutes a day.` };
  }
  if (n.voipWifiPercent > 100) {
    return { error: "Wi-Fi share cannot exceed 100%." };
  }

  const totalMinutes = n.minutesPerDay * n.days;
  const totalCalls = n.callsPerDay * n.days;

  // 1. Home carrier roaming or international direct dial.
  const roamingTotal =
    totalMinutes * n.roamingRatePerMinute + totalCalls * n.roamingConnectionFee;

  // 2. Local prepaid SIM bought at the destination.
  const localSimTotal = n.localSimCost + totalMinutes * n.localSimRatePerMinute;

  // 3. VoIP over mobile data; minutes made on Wi-Fi cost nothing.
  const voipBillableMinutes = totalMinutes * (1 - n.voipWifiPercent / 100);
  const voipDataMb = voipBillableMinutes * voip.rate;
  const voipTotal = (voipDataMb / MB_PER_GB) * n.dataPricePerGb;

  // 4. International calling pack with included minutes and overage.
  const packOverageMinutes = Math.max(0, totalMinutes - n.packIncludedMinutes);
  const packTotal = n.packPrice + packOverageMinutes * n.packOverageRate;

  const perMinute = (total) => (totalMinutes > 0 ? round(total / totalMinutes, 4) : null);

  const options = [
    {
      id: "roaming",
      label: "Home carrier roaming",
      total: round(roamingTotal, 2),
      perMinute: perMinute(roamingTotal),
      detail: `${round(totalMinutes, 0)} min at ${n.roamingRatePerMinute}/min${
        n.roamingConnectionFee > 0
          ? ` plus ${round(totalCalls, 0)} connection fees of ${n.roamingConnectionFee}`
          : ""
      }`,
    },
    {
      id: "localSim",
      label: "Local prepaid SIM or eSIM",
      total: round(localSimTotal, 2),
      perMinute: perMinute(localSimTotal),
      detail: `${n.localSimCost} up front plus ${round(totalMinutes, 0)} min at ${n.localSimRatePerMinute}/min`,
    },
    {
      id: "voip",
      label: `${voip.label} over data`,
      total: round(voipTotal, 2),
      perMinute: perMinute(voipTotal),
      detail: `${round(voipBillableMinutes, 0)} billable min at ${voip.rate} MB/min = ${round(
        voipDataMb,
        1,
      )} MB of data`,
    },
    {
      id: "pack",
      label: "International calling pack",
      total: round(packTotal, 2),
      perMinute: perMinute(packTotal),
      detail:
        packOverageMinutes > 0
          ? `Pack of ${n.packIncludedMinutes} min plus ${round(packOverageMinutes, 0)} min overage at ${n.packOverageRate}/min`
          : `Pack of ${n.packIncludedMinutes} min covers all ${round(totalMinutes, 0)} min`,
    },
  ].sort((a, b) => a.total - b.total);

  const cheapest = options[0];
  const dearest = options[options.length - 1];
  const ranked = options.map((option, index) => ({
    ...option,
    rank: index + 1,
    extraOverCheapest: round(option.total - cheapest.total, 2),
  }));

  return {
    currency: currency.code,
    locale: currency.locale,
    totalMinutes: round(totalMinutes, 0),
    totalCalls: round(totalCalls, 0),
    voipDataMb: round(voipDataMb, 1),
    voipDataGb: round(voipDataMb / MB_PER_GB, 3),
    packOverageMinutes: round(packOverageMinutes, 0),
    options: ranked,
    cheapestId: cheapest.id,
    cheapestLabel: cheapest.label,
    cheapestTotal: cheapest.total,
    cheapestPerMinute: cheapest.perMinute,
    dearestLabel: dearest.label,
    maxSaving: round(dearest.total - cheapest.total, 2),
  };
}
