/**
 * Travel power bank sizing.
 *
 * A power bank's headline mAh figure is measured at the internal lithium cell's nominal
 * voltage, not at the 5 V it hands to your phone. The only fair way to compare a bank with
 * a device battery is to convert both to watt-hours:
 *
 *     Wh = (mAh / 1000) x nominal cell voltage
 *
 * Some of that stored energy is lost boosting 3.6-3.7 V cell voltage up to the 5 V / 9 V /
 * 20 V the USB port delivers, in the cable, and again in the device's own charging circuit.
 * That is why a 10,000 mAh bank never gives a 5,000 mAh phone two full charges.
 *
 * Airline rule used for the warnings: the ICAO Technical Instructions, mirrored by IATA
 * Dangerous Goods Regulations and the US FAA/DOT, allow lithium-ion batteries and power
 * banks in CARRY-ON baggage only. Up to 100 Wh needs no approval; 100-160 Wh needs the
 * operator's approval and is limited to two spare batteries per passenger; above 160 Wh is
 * forbidden in passenger baggage. 100 Wh at 3.7 V is about 27,027 mAh, which is why
 * "airline safe" banks stop around 26,800-27,000 mAh.
 */

/** Nominal voltage of the lithium cells inside a power bank; mAh ratings are quoted at this. */
export const BANK_NOMINAL_VOLTAGE = 3.7;

/**
 * Round-trip loss from cell to device battery: boost conversion, cable resistance and the
 * device's own charge controller. Real-world measurements for USB power banks land between
 * about 0.75 and 0.90; 0.85 is a reasonable planning default.
 */
export const DEFAULT_TRANSFER_EFFICIENCY = 0.85;

/** ICAO/IATA/FAA thresholds for lithium batteries in passenger baggage, in watt-hours. */
export const AIRLINE_NO_APPROVAL_WH = 100;
export const AIRLINE_APPROVAL_WH = 160;
/** Spare batteries permitted in the 100-160 Wh band, per passenger, with operator approval. */
export const AIRLINE_APPROVAL_SPARE_LIMIT = 2;

/** Largest single bank that stays under the 100 Wh no-approval limit at 3.7 V. */
export const LARGEST_AIRLINE_SAFE_MAH = Math.floor(
  (AIRLINE_NO_APPROVAL_WH / BANK_NOMINAL_VOLTAGE) * 1000,
);

/** Common retail capacities, used to suggest the next size up. */
export const COMMON_BANK_SIZES_MAH = [5000, 10000, 15000, 20000, 24000, 26800];

/**
 * Device presets. Capacities are typical published figures for the class of device and the
 * nominal voltage of its battery chemistry (single-cell Li-po ~3.8 V, multi-cell packs higher).
 */
export const DEVICE_PRESETS = [
  { id: "phone-large", label: "Smartphone (5000 mAh class)", capacityMah: 5000, nominalV: 3.85 },
  { id: "phone-compact", label: "Smartphone (compact, 4000 mAh)", capacityMah: 4000, nominalV: 3.85 },
  { id: "tablet", label: "Tablet (8000 mAh class)", capacityMah: 8000, nominalV: 3.8 },
  { id: "earbuds", label: "Wireless earbuds + case", capacityMah: 600, nominalV: 3.8 },
  { id: "smartwatch", label: "Smartwatch", capacityMah: 350, nominalV: 3.85 },
  { id: "ereader", label: "E-reader", capacityMah: 1500, nominalV: 3.7 },
  { id: "action-cam", label: "Action camera battery", capacityMah: 1250, nominalV: 3.85 },
  { id: "mirrorless", label: "Mirrorless camera battery (2-cell)", capacityMah: 2200, nominalV: 7.2 },
  { id: "drone", label: "Drone flight battery (3-cell)", capacityMah: 3850, nominalV: 11.55 },
  { id: "laptop", label: "USB-C laptop (needs a PD bank)", capacityMah: 6000, nominalV: 11.4 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** mAh at a stated nominal voltage -> watt-hours. */
export function mahToWh(mah, volts = BANK_NOMINAL_VOLTAGE) {
  if (!isNum(mah) || !isNum(volts) || mah < 0 || volts <= 0) return 0;
  return (mah / 1000) * volts;
}

/** Watt-hours -> mAh at a stated nominal voltage. */
export function whToMah(wh, volts = BANK_NOMINAL_VOLTAGE) {
  if (!isNum(wh) || !isNum(volts) || wh < 0 || volts <= 0) return 0;
  return (wh / volts) * 1000;
}

/**
 * Which airline band a battery of `wh` watt-hours falls into.
 * @returns {{band:"free"|"approval"|"forbidden", label:string, detail:string}}
 */
export function airlineBand(wh) {
  if (!isNum(wh) || wh < 0) {
    return { band: "free", label: "Not applicable", detail: "Enter a capacity first." };
  }
  if (wh <= AIRLINE_NO_APPROVAL_WH) {
    return {
      band: "free",
      label: `Under ${AIRLINE_NO_APPROVAL_WH} Wh`,
      detail: "Allowed in carry-on baggage without airline approval. Never in checked baggage.",
    };
  }
  if (wh <= AIRLINE_APPROVAL_WH) {
    return {
      band: "approval",
      label: `${AIRLINE_NO_APPROVAL_WH}-${AIRLINE_APPROVAL_WH} Wh`,
      detail: `Carry-on only and needs the operator's approval, with a limit of ${AIRLINE_APPROVAL_SPARE_LIMIT} spare batteries per passenger.`,
    };
  }
  return {
    band: "forbidden",
    label: `Over ${AIRLINE_APPROVAL_WH} Wh`,
    detail: "Not permitted in passenger baggage at all. Split the capacity across smaller banks.",
  };
}

/** Smallest common retail size at or above `mah`, or null when nothing on the list is big enough. */
export function suggestBankSize(mah) {
  if (!isNum(mah) || mah <= 0) return null;
  return COMMON_BANK_SIZES_MAH.find((size) => size >= mah) ?? null;
}

/**
 * Size a power bank for a trip.
 *
 * @param {object} input
 * @param {Array<{name?:string, capacityMah:number, nominalV:number, rechargesPerDay:number}>} input.devices
 * @param {number} input.days                 nights/days without a mains socket
 * @param {number} [input.efficiency]         0-1 fraction of stored energy that reaches devices
 * @param {number} [input.reservePct]         safety margin added on top of the calculated need
 * @returns {{error:string}|object}
 */
export function planPowerBank({
  devices,
  days,
  efficiency = DEFAULT_TRANSFER_EFFICIENCY,
  reservePct = 15,
}) {
  if (!Array.isArray(devices) || devices.length === 0) {
    return { error: "Add at least one device to charge." };
  }
  if (!isNum(days) || days <= 0) {
    return { error: "Days away from a socket must be greater than zero." };
  }
  if (days > 365) {
    return { error: "Plan a trip of 365 days or fewer — beyond that, plan a solar panel instead." };
  }
  if (!isNum(efficiency) || efficiency <= 0 || efficiency > 1) {
    return { error: "Transfer efficiency must be between 1% and 100%." };
  }
  if (!isNum(reservePct) || reservePct < 0 || reservePct > 200) {
    return { error: "Safety reserve must be between 0% and 200%." };
  }

  const rows = [];
  let dailyWh = 0;

  for (const device of devices) {
    const capacityMah = Number(device?.capacityMah);
    const nominalV = Number(device?.nominalV);
    const rechargesPerDay = Number(device?.rechargesPerDay);

    if (!isNum(capacityMah) || capacityMah <= 0) {
      return { error: `Battery capacity for "${device?.name || "a device"}" must be greater than zero.` };
    }
    if (!isNum(nominalV) || nominalV <= 0 || nominalV > 60) {
      return { error: `Battery voltage for "${device?.name || "a device"}" must be between 0 and 60 V.` };
    }
    if (!isNum(rechargesPerDay) || rechargesPerDay < 0 || rechargesPerDay > 24) {
      return { error: `Recharges per day for "${device?.name || "a device"}" must be between 0 and 24.` };
    }

    const perChargeWh = mahToWh(capacityMah, nominalV);
    const perDayWh = perChargeWh * rechargesPerDay;
    dailyWh += perDayWh;
    rows.push({
      name: device?.name || "Device",
      capacityMah,
      nominalV,
      rechargesPerDay,
      perChargeWh,
      perDayWh,
      tripWh: perDayWh * days,
    });
  }

  if (dailyWh <= 0) {
    return { error: "Set at least one device to be recharged more than zero times a day." };
  }

  const deliveredWh = dailyWh * days;
  const targetDeliveredWh = deliveredWh * (1 + reservePct / 100);
  const requiredStoredWh = targetDeliveredWh / efficiency;
  const requiredRatedMah = whToMah(requiredStoredWh, BANK_NOMINAL_VOLTAGE);

  const banksNeeded = Math.max(1, Math.ceil(requiredRatedMah / LARGEST_AIRLINE_SAFE_MAH));
  const perBankMah = requiredRatedMah / banksNeeded;

  for (const row of rows) {
    row.shareOfTrip = (row.tripWh / deliveredWh) * 100;
  }
  rows.sort((a, b) => b.tripWh - a.tripWh);

  return {
    days,
    efficiency,
    reservePct,
    rows,
    dailyDeliveredWh: dailyWh,
    deliveredWh,
    targetDeliveredWh,
    reserveWh: targetDeliveredWh - deliveredWh,
    lossesWh: requiredStoredWh - targetDeliveredWh,
    requiredStoredWh,
    requiredRatedMah,
    suggestedSizeMah: suggestBankSize(requiredRatedMah),
    banksNeeded,
    perBankMah,
    perBankWh: mahToWh(perBankMah, BANK_NOMINAL_VOLTAGE),
    airline: airlineBand(requiredStoredWh),
    largestAirlineSafeMah: LARGEST_AIRLINE_SAFE_MAH,
  };
}
