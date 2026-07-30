/**
 * Robot Vacuum Mapping Privacy Guide — checklist scoring plus a data-footprint
 * model that maps each cloud feature you leave switched on to the kinds of
 * household data that leave the house because of it.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 *
 * Setting names follow the mainstream apps (Roborock: Me > Settings > Privacy
 * and Map management; Ecovacs Home: Settings > Privacy; iRobot Home: Settings >
 * Data sharing / Smart Map). Follow the description rather than an exact label.
 */

/**
 * The checklist.
 *
 * weight   = share of the 100-point score, ranked by consequence. Controls that
 *            stop the floor plan, camera frames or account being reachable by
 *            someone else outrank tidy-up items.
 * critical = enough on its own to expose the interior of your home, so it caps
 *            the score (CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    id: "unique-password",
    group: "Account and cloud",
    title: "Use a password unique to the vacuum account",
    detail:
      "The app account holds your floor plan, cleaning history and, on camera models, obstacle photographs. Reused passwords make an unrelated site breach into an indoor mapping leak.",
    weight: 11,
    critical: true,
  },
  {
    id: "two-factor",
    group: "Account and cloud",
    title: "Turn on two-factor authentication where the app offers it",
    detail:
      "Vacuum apps have been slower than camera apps to add it, but most major brands now support a verification code or a linked-account sign-in. Enable it before anything else on this list.",
    weight: 11,
    critical: true,
  },
  {
    id: "shared-members",
    group: "Account and cloud",
    title: "Review shared home members and linked apps",
    detail:
      "Anybody added to the home, and every voice assistant or automation platform you have connected, can usually see the map and the schedule. Remove the ones you no longer use.",
    weight: 7,
    critical: true,
  },
  {
    id: "map-sync",
    group: "Mapping data",
    title: "Check whether maps are stored in the cloud or only on the robot",
    detail:
      "A LIDAR map is a measured floor plan: room sizes, doorways, furniture positions. Some models keep it on-device and sync only a thumbnail; others upload the full map so multi-floor and sharing features work.",
    weight: 9,
    critical: false,
  },
  {
    id: "delete-old-maps",
    group: "Mapping data",
    title: "Delete saved maps you no longer need",
    detail:
      "Old maps of a previous flat, or of a layout you have since changed, sit in the account indefinitely. Deleting them is the only way to make sure they are not in the next export or breach.",
    weight: 7,
    critical: false,
  },
  {
    id: "room-labels",
    group: "Mapping data",
    title: "Do not label rooms with people's names",
    detail:
      "\"Emma's bedroom\" turns a floor plan into a plan of who sleeps where, and those labels travel to every linked assistant. Use neutral labels such as Bedroom 1.",
    weight: 5,
    critical: false,
  },
  {
    id: "no-go-zones",
    group: "Mapping data",
    title: "Set no-go zones around private and sensitive areas",
    detail:
      "No-go zones stop the robot mapping and photographing rooms in detail — a home office with client paperwork, or a bedroom. They reduce what exists to be leaked rather than just who can see it.",
    weight: 5,
    critical: false,
  },
  {
    id: "camera-uploads",
    group: "Cameras and sensors",
    title: "Turn off obstacle-photo and image upload",
    detail:
      "Camera-equipped models photograph obstacles at floor level and may upload them for recognition or review. In 2022 images captured by development Roombas, including a person on a toilet, reached a third-party labelling workforce and then the internet — the mechanism was data sharing, not a hack.",
    weight: 10,
    critical: true,
  },
  {
    id: "improvement-programme",
    group: "Cameras and sensors",
    title: "Leave the product-improvement and beta programmes",
    detail:
      "These consent screens are what allow raw sensor data, including images, to be sent for human review and annotation. Opting out is a single toggle and costs you nothing but early features.",
    weight: 7,
    critical: false,
  },
  {
    id: "mic-off",
    group: "Cameras and sensors",
    title: "Disable the microphone and voice features you do not use",
    detail:
      "Several models carry a microphone for voice prompts or assistant features. Security researchers demonstrated remote camera and microphone access on Ecovacs models at DEF CON in 2024; an unused sensor that is switched off cannot be repurposed.",
    weight: 5,
    critical: false,
  },
  {
    id: "run-doors-closed",
    group: "Cameras and sensors",
    title: "Run it with private rooms closed, especially remote sessions",
    detail:
      "Remote-viewing and patrol modes turn the robot into a mobile camera you are not standing next to. Closing doors is a physical control no firmware update can undo.",
    weight: 4,
    critical: false,
  },
  {
    id: "iot-vlan",
    group: "Network and lifecycle",
    title: "Put the robot on a guest network or IoT VLAN",
    detail:
      "Isolation limits what a compromised vacuum can reach on your network. Client isolation on a guest Wi-Fi network is the version of this that works on an ordinary home router.",
    weight: 6,
    critical: false,
  },
  {
    id: "firmware",
    group: "Network and lifecycle",
    title: "Keep firmware current",
    detail:
      "Disclosed vacuum bugs have included Bluetooth pairing flaws reachable from outside the house. Vendors patch them quietly, so enable automatic updates or check the app monthly.",
    weight: 5,
    critical: false,
  },
  {
    id: "factory-reset",
    group: "Network and lifecycle",
    title: "Factory reset and unlink before selling or binning it",
    detail:
      "A reset clears stored maps, Wi-Fi credentials and the account binding from the robot. Unlink it in the app as well, so the map does not stay in your cloud account either.",
    weight: 5,
    critical: false,
  },
  {
    id: "data-request",
    group: "Network and lifecycle",
    title: "Read the retention policy and use the deletion request",
    detail:
      "Major brands publish what they keep and for how long, and offer an in-app or web deletion request. It is the only route to removing data already uploaded.",
    weight: 3,
    critical: false,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Account and cloud",
  "Mapping data",
  "Cameras and sensors",
  "Network and lifecycle",
];

/** Sum of all weights. Authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ticked at first paint because most setups already have them. */
export const DEFAULT_DONE = ["unique-password", "firmware"];

/** Score bands, read top-down: the first band the score reaches wins. */
export const BANDS = [
  { id: "hardened", min: 90, label: "Hardened", hint: "The map stays small, local where possible, and hard to reach." },
  { id: "strong", min: 70, label: "Well configured", hint: "Solid. Tidy the stored maps and labels next." },
  { id: "partial", min: 40, label: "Partly configured", hint: "A floor plan of your home is still one password away." },
  { id: "at-risk", min: 0, label: "Exposed", hint: "Map, schedule and possibly camera frames are reachable with one credential." },
];

/** A missing critical control caps the band at "Partly configured". */
export const CRITICAL_CAP_PERCENT = 69;

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));

/** First band whose minimum the percent reaches. Percent clamped to 0..100. */
export function bandFor(percent) {
  const value = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  return BANDS.find((band) => value >= band.min) || BANDS[BANDS.length - 1];
}

function normalise(doneIds) {
  const seen = new Set();
  for (const raw of doneIds) {
    if (typeof raw === "string" && byId.has(raw)) seen.add(raw);
  }
  return seen;
}

/**
 * Score a set of completed control ids. Unknown ids and duplicates are ignored.
 *
 * @param {string[]} doneIds ids from CHECKLIST the user has completed.
 * @returns {object} score summary, or { error } for unusable input.
 */
export function scoreChecklist(doneIds) {
  if (!Array.isArray(doneIds)) {
    return { error: "Completed steps must be provided as a list." };
  }
  if (!(TOTAL_WEIGHT > 0)) {
    return { error: "This checklist has no weighted steps to score." };
  }

  const done = normalise(doneIds);
  let points = 0;
  const missingCritical = [];
  const remaining = [];

  for (const item of CHECKLIST) {
    if (done.has(item.id)) {
      points += item.weight;
    } else {
      remaining.push(item);
      if (item.critical) missingCritical.push(item);
    }
  }

  const rawPercent = Math.round((points / TOTAL_WEIGHT) * 100);
  const capped = missingCritical.length > 0 && rawPercent > CRITICAL_CAP_PERCENT;
  const percent = capped ? CRITICAL_CAP_PERCENT : rawPercent;
  const band = bandFor(percent);

  const groups = GROUPS.map((name) => {
    const items = CHECKLIST.filter((item) => item.group === name);
    const doneCount = items.filter((item) => done.has(item.id)).length;
    return {
      name,
      done: doneCount,
      total: items.length,
      percent: items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0,
    };
  });

  const nextActions = remaining
    .slice()
    .sort((a, b) => Number(b.critical) - Number(a.critical) || b.weight - a.weight)
    .slice(0, 3);

  return {
    points,
    maxPoints: TOTAL_WEIGHT,
    rawPercent,
    percent,
    capped,
    completed: done.size,
    total: CHECKLIST.length,
    band: band.id,
    bandLabel: band.label,
    bandHint: band.hint,
    missingCritical,
    remaining,
    groups,
    nextActions,
  };
}

/**
 * The categories of household data a robot vacuum can send off the premises.
 * `sensitivity` is a 1-3 ranking used only to order the report: 3 = content
 * that identifies people or the inside of rooms, 1 = metadata.
 */
export const DATA_CLASSES = [
  {
    id: "floorplan",
    label: "Measured floor plan",
    why: "Room dimensions, doorways and furniture positions — effectively a survey of your home.",
    sensitivity: 3,
  },
  {
    id: "images",
    label: "Camera frames of your floor",
    why: "Obstacle photographs and live video taken at ankle height, in whatever room the robot is in.",
    sensitivity: 3,
  },
  {
    id: "audio",
    label: "Microphone audio",
    why: "Voice prompts and assistant features keep a microphone live inside the house.",
    sensitivity: 3,
  },
  {
    id: "labels",
    label: "Room names you typed",
    why: "Labels such as a child's name attach people to specific rooms on the map.",
    sensitivity: 2,
  },
  {
    id: "occupancy",
    label: "When the home is empty",
    why: "Cleaning schedules and run history are a reliable model of when nobody is in.",
    sensitivity: 2,
  },
  {
    id: "location",
    label: "Home location",
    why: "App location permissions and Wi-Fi data tie the map to a street address.",
    sensitivity: 2,
  },
  {
    id: "identity",
    label: "Account identity",
    why: "Email, phone and linked-platform identities join this data to the rest of your accounts.",
    sensitivity: 1,
  },
];

/**
 * Cloud features you can switch on, and the data classes each one causes to
 * leave the house. A class is "exposed" if at least one enabled feature drives
 * it, which is why switching off a single toggle sometimes changes nothing.
 */
export const FEATURES = [
  {
    id: "cloud-map",
    label: "Maps saved to the cloud (multi-floor, map sharing)",
    classes: ["floorplan", "labels", "location", "identity"],
  },
  {
    id: "obstacle-photos",
    label: "Obstacle photo upload / AI obstacle recognition",
    classes: ["images", "floorplan", "identity"],
  },
  {
    id: "remote-view",
    label: "Remote live view or home patrol",
    classes: ["images", "floorplan", "occupancy"],
  },
  {
    id: "improvement",
    label: "Product improvement or beta data sharing",
    classes: ["images", "floorplan", "occupancy", "identity"],
  },
  {
    id: "microphone",
    label: "Microphone or in-app voice assistant enabled",
    classes: ["audio", "identity"],
  },
  {
    id: "voice-link",
    label: "Linked to Alexa, Google Home or a smart-home platform",
    classes: ["labels", "occupancy", "identity"],
  },
  {
    id: "cloud-schedule",
    label: "Cloud schedules and away-mode automations",
    classes: ["occupancy", "identity"],
  },
  {
    id: "app-location",
    label: "Location permission granted to the app",
    classes: ["location", "identity"],
  },
];

/** Footprint bands as a share of the data classes that are exposed. */
export const FOOTPRINT_BANDS = [
  { id: "minimal", max: 20, label: "Minimal", hint: "Almost nothing about the inside of your home leaves it." },
  { id: "moderate", max: 50, label: "Moderate", hint: "Layout and timing data are leaving; images and audio are not." },
  { id: "broad", max: 80, label: "Broad", hint: "A detailed picture of the home and its routine is in the cloud." },
  { id: "full", max: 100, label: "Full", hint: "Layout, imagery and routine are all leaving the house." },
];

const featureById = new Map(FEATURES.map((feature) => [feature.id, feature]));

/**
 * Which household data classes leave the house given the features left on.
 *
 * @param {string[]} enabledIds ids from FEATURES that are switched on.
 * @returns {object} footprint report, or { error } for unusable input.
 */
export function profileDataFootprint(enabledIds) {
  if (!Array.isArray(enabledIds)) {
    return { error: "Enabled features must be provided as a list." };
  }

  const enabled = [];
  const seen = new Set();
  for (const raw of enabledIds) {
    if (typeof raw === "string" && featureById.has(raw) && !seen.has(raw)) {
      seen.add(raw);
      enabled.push(featureById.get(raw));
    }
  }

  const classes = DATA_CLASSES.map((entry) => {
    const drivers = enabled.filter((feature) => feature.classes.includes(entry.id));
    return {
      ...entry,
      exposed: drivers.length > 0,
      drivers: drivers.map((feature) => feature.label),
    };
  });

  const exposed = classes.filter((entry) => entry.exposed);
  const total = DATA_CLASSES.length;
  const percent = total > 0 ? Math.round((exposed.length / total) * 100) : 0;
  const band =
    FOOTPRINT_BANDS.find((entry) => percent <= entry.max) ||
    FOOTPRINT_BANDS[FOOTPRINT_BANDS.length - 1];

  // Turning one feature off only helps for classes nothing else still drives.
  const reducers = enabled
    .map((feature) => {
      const removed = classes.filter(
        (entry) => entry.exposed && entry.drivers.length === 1 && entry.drivers[0] === feature.label
      );
      return {
        id: feature.id,
        label: feature.label,
        removes: removed.map((entry) => entry.label),
        removedCount: removed.length,
      };
    })
    .filter((entry) => entry.removedCount > 0)
    .sort((a, b) => b.removedCount - a.removedCount);

  return {
    classes,
    exposedCount: exposed.length,
    totalClasses: total,
    percent,
    band: band.id,
    bandLabel: band.label,
    bandHint: band.hint,
    enabledCount: enabled.length,
    reducers,
    highSensitivityExposed: exposed.filter((entry) => entry.sensitivity === 3).length,
  };
}
