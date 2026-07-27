/**
 * Creator Gear Packing List — capacity, power and weight maths.
 *
 * Pure module: no React, no DOM, no clock.
 */

/**
 * Storage from bitrate. Camera bitrates are quoted in megabits per second and
 * card capacities in decimal gigabytes, so:
 *   GB = Mbps x seconds / 8 / 1000
 */
export const BITS_PER_BYTE = 8;
export const MEGABYTES_PER_GIGABYTE = 1000;

/** Never leave with a single battery or a single card, whatever the maths says. */
export const MINIMUM_SPARES = 2;

/**
 * IATA dangerous-goods rules for spare lithium-ion batteries: spares travel in
 * carry-on only; up to 100 Wh needs no approval, 100-160 Wh needs airline
 * approval and is limited to two spares, and above 160 Wh is forbidden in
 * passenger baggage.
 */
export const LITHIUM_WH_LIMITS = { noApproval: 100, withApproval: 160, maxApprovedSpares: 2 };

/** Common recording bitrates, in megabits per second. */
export const BITRATE_PRESETS = [
  { id: "h264-1080", label: "1080p H.264, ~50 Mbps", mbps: 50 },
  { id: "h265-4k", label: "4K H.265, ~100 Mbps", mbps: 100 },
  { id: "allintra-4k", label: "4K All-Intra, ~400 Mbps", mbps: 400 },
  { id: "prores-hq", label: "4K ProRes 422 HQ, ~880 Mbps", mbps: 880 },
];

export const SHOOT_TYPES = [
  {
    id: "studio-interview",
    label: "Studio or office interview",
    needs: ["camera", "audio", "lighting", "support", "power", "data", "utility"],
  },
  {
    id: "run-and-gun",
    label: "Run and gun / documentary",
    needs: ["camera", "audio", "support", "power", "data", "utility"],
  },
  {
    id: "event",
    label: "Event coverage",
    needs: ["camera", "audio", "support", "power", "data", "utility", "safety"],
  },
  {
    id: "product",
    label: "Product / tabletop",
    needs: ["camera", "lighting", "support", "power", "data", "utility"],
  },
  {
    id: "travel-vlog",
    label: "Travel vlog",
    needs: ["camera", "audio", "support", "power", "data", "utility"],
  },
];

/**
 * Gear catalogue. `grams` are typical shipping weights for a mid-range item —
 * swap in your own kit's numbers if you need an accurate baggage figure.
 * `qty` is a fixed count; `perCamera`, `perSpeaker` and `perLight` scale.
 */
export const GEAR_CATALOG = [
  { id: "body", category: "camera", name: "Camera body", grams: 700, perCamera: 1 },
  { id: "lens-primary", category: "camera", name: "Primary lens", grams: 500, perCamera: 1 },
  { id: "lens-second", category: "camera", name: "Second lens", grams: 450, qty: 1, types: ["run-and-gun", "event", "travel-vlog"] },
  { id: "macro", category: "camera", name: "Macro or close-up lens", grams: 480, qty: 1, types: ["product"] },
  { id: "nd", category: "camera", name: "ND filter set", grams: 160, qty: 1, outdoorOnly: true },
  { id: "cleaning", category: "camera", name: "Lens cloth and blower", grams: 60, qty: 1 },

  { id: "lav", category: "audio", name: "Lavalier mic", grams: 90, perSpeaker: 1 },
  { id: "shotgun", category: "audio", name: "Shotgun mic", grams: 300, qty: 1 },
  { id: "recorder", category: "audio", name: "Audio recorder", grams: 300, qty: 1 },
  { id: "headphones", category: "audio", name: "Closed-back headphones", grams: 250, qty: 1 },
  { id: "windshield", category: "audio", name: "Windshield / deadcat", grams: 60, qty: 1, outdoorOnly: true },
  { id: "audio-cables", category: "audio", name: "Spare audio cables", grams: 180, qty: 2 },

  { id: "key-light", category: "lighting", name: "LED panel", grams: 900, perLight: 1 },
  { id: "light-stand", category: "lighting", name: "Light stand", grams: 1200, perLight: 1 },
  { id: "softbox", category: "lighting", name: "Softbox or diffusion", grams: 600, perLight: 1 },
  { id: "reflector", category: "lighting", name: "Reflector", grams: 400, qty: 1 },
  { id: "sandbag", category: "lighting", name: "Sandbag", grams: 2200, perLight: 1, outdoorOnly: true },

  { id: "tripod", category: "support", name: "Tripod with fluid head", grams: 1800, qty: 1 },
  { id: "gimbal", category: "support", name: "Gimbal", grams: 1100, qty: 1, types: ["run-and-gun", "event", "travel-vlog"] },
  { id: "clamp", category: "support", name: "Clamps and magic arm", grams: 500, qty: 1, types: ["product", "studio-interview"] },

  { id: "camera-battery", category: "power", name: "Camera battery", grams: 90, computed: "batteries" },
  { id: "charger", category: "power", name: "Battery charger", grams: 200, qty: 1 },
  { id: "power-bank", category: "power", name: "USB power bank", grams: 400, qty: 1, noMainsOnly: true },
  { id: "extension", category: "power", name: "Extension lead and adapters", grams: 400, qty: 1, mainsOnly: true },

  { id: "card", category: "data", name: "Memory card", grams: 5, computed: "cards" },
  { id: "reader", category: "data", name: "Card reader", grams: 40, qty: 1 },
  { id: "ssd", category: "data", name: "Backup SSD", grams: 60, computed: "drives" },
  { id: "laptop", category: "data", name: "Laptop for offload", grams: 1600, qty: 1 },

  { id: "tape", category: "utility", name: "Gaffer tape", grams: 300, qty: 1 },
  { id: "notebook", category: "utility", name: "Notebook and marker", grams: 150, qty: 1 },
  { id: "ties", category: "utility", name: "Cable ties and velcro", grams: 120, qty: 1 },
  { id: "rain-cover", category: "utility", name: "Rain cover", grams: 200, qty: 1, outdoorOnly: true },
  { id: "torch", category: "utility", name: "Head torch", grams: 120, qty: 1, nightOnly: true },

  { id: "first-aid", category: "safety", name: "Small first aid kit", grams: 400, qty: 1 },
  { id: "hi-vis", category: "safety", name: "Hi-vis vest", grams: 180, qty: 1, outdoorOnly: true },
];

export const CATEGORY_LABELS = {
  camera: "Camera",
  audio: "Audio",
  lighting: "Lighting",
  support: "Support",
  power: "Power",
  data: "Data",
  utility: "Utility",
  safety: "Safety",
};

export const LIMITS = {
  minRecordMinutes: 1,
  maxRecordMinutes: 2880,
  minBatteryMinutes: 5,
  maxBatteryMinutes: 600,
  minBitrate: 1,
  maxBitrate: 5000,
  minCardGb: 1,
  maxCardGb: 4000,
  minCameras: 1,
  maxCameras: 8,
  minSpeakers: 0,
  maxSpeakers: 8,
  minLights: 0,
  maxLights: 8,
  minBackups: 0,
  maxBackups: 3,
};

/**
 * Batteries required for a recording block.
 * ceil(recordMinutes x safetyFactor / minutesPerBattery), never below the
 * minimum spare count, and multiplied by the number of bodies.
 */
export function batteriesNeeded({
  recordMinutes,
  minutesPerBattery,
  safetyFactor = 1.5,
  cameraCount = 1,
} = {}) {
  const minutes = Number(recordMinutes);
  const perBattery = Number(minutesPerBattery);
  const safety = Number(safetyFactor);
  const cameras = Number(cameraCount);

  if (![minutes, perBattery, safety, cameras].every(Number.isFinite)) {
    return { error: "Enter valid numbers for recording time, battery runtime and camera count." };
  }
  if (minutes < LIMITS.minRecordMinutes || minutes > LIMITS.maxRecordMinutes) {
    return { error: `Recording time must be between ${LIMITS.minRecordMinutes} and ${LIMITS.maxRecordMinutes} minutes.` };
  }
  if (perBattery < LIMITS.minBatteryMinutes || perBattery > LIMITS.maxBatteryMinutes) {
    return { error: `Battery runtime must be between ${LIMITS.minBatteryMinutes} and ${LIMITS.maxBatteryMinutes} minutes.` };
  }
  if (safety < 1 || safety > 4) return { error: "Safety factor must be between 1 and 4." };
  if (cameras < LIMITS.minCameras || cameras > LIMITS.maxCameras) {
    return { error: `Camera count must be between ${LIMITS.minCameras} and ${LIMITS.maxCameras}.` };
  }

  const perCamera = Math.max(MINIMUM_SPARES, Math.ceil((minutes * safety) / perBattery));
  return {
    perCamera,
    total: perCamera * Math.round(cameras),
    coveredMinutes: perCamera * perBattery,
    safetyFactor: safety,
  };
}

/**
 * Card and backup storage from bitrate.
 * GB = Mbps x minutes x 60 / 8 / 1000, per camera.
 */
export function storageNeeded({
  recordMinutes,
  bitrateMbps,
  cameraCount = 1,
  cardGb,
  backupCopies = 1,
} = {}) {
  const minutes = Number(recordMinutes);
  const mbps = Number(bitrateMbps);
  const cameras = Number(cameraCount);
  const card = Number(cardGb);
  const backups = Number(backupCopies);

  if (![minutes, mbps, cameras, card, backups].every(Number.isFinite)) {
    return { error: "Enter valid numbers for recording time, bitrate, cards and backups." };
  }
  if (minutes < LIMITS.minRecordMinutes || minutes > LIMITS.maxRecordMinutes) {
    return { error: `Recording time must be between ${LIMITS.minRecordMinutes} and ${LIMITS.maxRecordMinutes} minutes.` };
  }
  if (mbps < LIMITS.minBitrate || mbps > LIMITS.maxBitrate) {
    return { error: `Bitrate must be between ${LIMITS.minBitrate} and ${LIMITS.maxBitrate} Mbps.` };
  }
  if (card < LIMITS.minCardGb || card > LIMITS.maxCardGb) {
    return { error: `Card size must be between ${LIMITS.minCardGb} and ${LIMITS.maxCardGb} GB.` };
  }
  if (cameras < LIMITS.minCameras || cameras > LIMITS.maxCameras) {
    return { error: `Camera count must be between ${LIMITS.minCameras} and ${LIMITS.maxCameras}.` };
  }
  if (backups < LIMITS.minBackups || backups > LIMITS.maxBackups) {
    return { error: `Backup copies must be between ${LIMITS.minBackups} and ${LIMITS.maxBackups}.` };
  }

  const perCameraGb = (mbps * minutes * 60) / BITS_PER_BYTE / MEGABYTES_PER_GIGABYTE;
  const totalGb = perCameraGb * Math.round(cameras);
  const cardsPerCamera = Math.max(MINIMUM_SPARES, Math.ceil(perCameraGb / card));
  const backupGb = totalGb * Math.round(backups);

  return {
    perCameraGb,
    totalGb,
    cardsPerCamera,
    totalCards: cardsPerCamera * Math.round(cameras),
    backupGb,
    drives: Math.max(Math.round(backups) > 0 ? 1 : 0, Math.round(backups)),
    minutesPerCard: mbps > 0 ? (card * MEGABYTES_PER_GIGABYTE * BITS_PER_BYTE) / mbps / 60 : 0,
  };
}

/** Watt-hours of a battery: Wh = volts x amp-hours (mAh / 1000). */
export function batteryWattHours({ voltage, capacityMah } = {}) {
  const volts = Number(voltage);
  const mah = Number(capacityMah);
  if (!Number.isFinite(volts) || !Number.isFinite(mah) || volts <= 0 || mah <= 0) {
    return { error: "Enter a positive voltage and capacity in mAh." };
  }
  const wattHours = (volts * mah) / 1000;
  let rule;
  if (wattHours <= LITHIUM_WH_LIMITS.noApproval) {
    rule = `Under ${LITHIUM_WH_LIMITS.noApproval} Wh — carry-on only, no airline approval normally needed.`;
  } else if (wattHours <= LITHIUM_WH_LIMITS.withApproval) {
    rule = `Between ${LITHIUM_WH_LIMITS.noApproval} and ${LITHIUM_WH_LIMITS.withApproval} Wh — carry-on only, airline approval required, usually a maximum of ${LITHIUM_WH_LIMITS.maxApprovedSpares} spares.`;
  } else {
    rule = `Over ${LITHIUM_WH_LIMITS.withApproval} Wh — not permitted in passenger baggage; it has to travel as cargo.`;
  }
  return { wattHours, rule, carryOnOnly: true };
}

/** Grams to a rounded kilogram figure. */
export function gramsToKg(grams) {
  const value = Number(grams);
  if (!Number.isFinite(value) || value < 0) return 0;
  return value / 1000;
}

/**
 * Build the packing list.
 *
 * @param {object} input
 * @param {string} input.shootTypeId    one of SHOOT_TYPES.
 * @param {number} input.recordMinutes  rolling minutes you expect to record.
 * @param {number} input.minutesPerBattery runtime of one battery.
 * @param {number} input.bitrateMbps    recording bitrate.
 * @param {number} input.cardGb         capacity of one card.
 * @param {number} input.cameraCount    bodies on the shoot.
 * @param {number} input.speakerCount   people needing a lav.
 * @param {number} input.lightCount     lights you plan to rig.
 * @param {number} input.backupCopies   copies made on the day.
 * @param {boolean} input.outdoor       shooting outside.
 * @param {boolean} input.night         shooting after dark.
 * @param {boolean} input.mainsPower    mains available at the location.
 * @param {boolean} input.flying        travelling by air.
 */
export function buildPackingList({
  shootTypeId,
  recordMinutes,
  minutesPerBattery,
  bitrateMbps,
  cardGb,
  cameraCount = 1,
  speakerCount = 1,
  lightCount = 2,
  backupCopies = 1,
  outdoor = false,
  night = false,
  mainsPower = true,
  flying = false,
} = {}) {
  const shootType = SHOOT_TYPES.find((item) => item.id === shootTypeId);
  if (!shootType) return { error: "Choose a shoot type." };

  const speakers = Number(speakerCount);
  const lights = Number(lightCount);
  if (!Number.isFinite(speakers) || speakers < LIMITS.minSpeakers || speakers > LIMITS.maxSpeakers) {
    return { error: `Number of speakers must be between ${LIMITS.minSpeakers} and ${LIMITS.maxSpeakers}.` };
  }
  if (!Number.isFinite(lights) || lights < LIMITS.minLights || lights > LIMITS.maxLights) {
    return { error: `Number of lights must be between ${LIMITS.minLights} and ${LIMITS.maxLights}.` };
  }

  const power = batteriesNeeded({ recordMinutes, minutesPerBattery, cameraCount });
  if (power.error) return power;

  const storage = storageNeeded({ recordMinutes, bitrateMbps, cameraCount, cardGb, backupCopies });
  if (storage.error) return storage;

  const cameras = Math.round(Number(cameraCount));
  const computed = {
    batteries: power.total,
    cards: storage.totalCards,
    drives: storage.drives,
  };

  const items = [];
  for (const entry of GEAR_CATALOG) {
    if (!shootType.needs.includes(entry.category)) continue;
    if (entry.types && !entry.types.includes(shootType.id)) continue;
    if (entry.outdoorOnly && !outdoor) continue;
    if (entry.nightOnly && !night) continue;
    if (entry.mainsOnly && !mainsPower) continue;
    if (entry.noMainsOnly && mainsPower) continue;

    let quantity = entry.qty || 0;
    if (entry.perCamera) quantity = entry.perCamera * cameras;
    if (entry.perSpeaker) quantity = entry.perSpeaker * Math.round(speakers);
    if (entry.perLight) quantity = entry.perLight * Math.round(lights);
    if (entry.computed) quantity = computed[entry.computed] || 0;
    if (quantity <= 0) continue;

    items.push({
      id: entry.id,
      category: entry.category,
      name: entry.name,
      quantity,
      grams: entry.grams * quantity,
    });
  }

  const sections = Object.keys(CATEGORY_LABELS)
    .map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      items: items.filter((item) => item.category === category),
    }))
    .filter((section) => section.items.length > 0)
    .map((section) => ({
      ...section,
      grams: section.items.reduce((acc, item) => acc + item.grams, 0),
    }));

  const totalGrams = sections.reduce((acc, section) => acc + section.grams, 0);

  const warnings = [];
  if (!mainsPower) {
    warnings.push(
      "No mains at the location — every light and monitor has to run off battery, so check their runtimes too.",
    );
  }
  if (outdoor && lights > 0) {
    warnings.push("Stands outdoors need weighting. One sandbag per stand is the minimum.");
  }
  if (flying) {
    warnings.push(
      `Flying: spare lithium batteries must travel in carry-on, never in checked baggage. Under ${LITHIUM_WH_LIMITS.noApproval} Wh each is normally fine; ${LITHIUM_WH_LIMITS.noApproval}-${LITHIUM_WH_LIMITS.withApproval} Wh needs airline approval and is capped at ${LITHIUM_WH_LIMITS.maxApprovedSpares} spares.`,
    );
  }
  if (storage.cardsPerCamera <= MINIMUM_SPARES) {
    warnings.push(
      `One card holds about ${Math.round(storage.minutesPerCard)} minutes at this bitrate, so the ${MINIMUM_SPARES}-card minimum is doing the work rather than the maths.`,
    );
  }
  if (speakers === 0) {
    warnings.push("No speakers set, so no lavaliers are listed. Add one per person on camera.");
  }

  return {
    shootType,
    sections,
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
    lineCount: items.length,
    totalGrams,
    totalKg: gramsToKg(totalGrams),
    power,
    storage,
    warnings,
  };
}
