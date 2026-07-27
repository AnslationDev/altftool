/**
 * PET and PST day: the pace you actually have to run, the measurements you have to
 * clear, and what to carry to the ground.
 *
 * Rule sources — the figures below are the qualifying standards printed in the
 * recruitment notices themselves:
 *
 *  SSC Constable (General Duty) in CAPFs, NIA, SSF and Rifleman in Assam Rifles.
 *  Physical Efficiency Test:
 *    - Male: 5 km run in 24 minutes.
 *    - Female: 1.6 km run in 8 minutes 30 seconds.
 *    - Candidates of the Ladakh region: male 1.6 km in 6 minutes 30 seconds,
 *      female 800 metres in 4 minutes.
 *  Physical Standard Test, height:
 *    - All candidates other than those below: male 170 cm, female 157 cm.
 *    - Garhwalis, Kumaonis, Gorkhas, Dogras, Marathas, and candidates from Sikkim,
 *      Nagaland, Arunachal Pradesh, Manipur, Tripura, Mizoram, Meghalaya, Assam,
 *      Himachal Pradesh, Jammu & Kashmir and Ladakh: male 165 cm, female 155 cm.
 *    - Scheduled Tribe candidates: male 162.5 cm, female 150 cm.
 *  Physical Standard Test, chest (male candidates only, expansion is a minimum):
 *    - All candidates other than those below: 80 cm unexpanded, 85 cm expanded.
 *    - The hill and north-eastern categories above: 78 cm unexpanded, 83 cm expanded.
 *    - Scheduled Tribe candidates: 76 cm unexpanded, 81 cm expanded.
 *  Female candidates have no chest measurement; weight has to be proportionate to
 *  height and age under the medical standards.
 *
 *  Army Agniveer (General Duty) Physical Fitness Test:
 *    - 1.6 km run, Group I up to 5 minutes 30 seconds, Group II 5 minutes 31 seconds
 *      to 5 minutes 45 seconds. Beam pull-ups and the 9-foot ditch and zig-zag
 *      balance are assessed alongside. Height and chest standards for Army
 *      recruitment vary by state, region and category, so they are not fixed here.
 *
 * Every one of these is republished with each notification, and relaxations differ
 * between forces. Read the notice for the post you have applied to, and see a doctor
 * before training hard for a timed run.
 */

/** Standard athletics lap used for splitting a run, in metres. */
export const DEFAULT_LAP_METRES = 400;

/** Minimum chest expansion demanded by the SSC GD notice, in centimetres. */
export const SSC_GD_CHEST_EXPANSION_CM = 5;

const MAX_DISTANCE_METRES = 42195;
const MAX_LIMIT_SECONDS = 4 * 3600;

/**
 * Qualifying standards. distanceMetres and limitSeconds are the run; heightCm,
 * chestMinCm and chestExpandedCm are the PST figures where the notice sets them.
 */
export const STANDARDS = [
  {
    id: "sscgd-male-general",
    label: "SSC GD — male, general category",
    force: "SSC Constable (GD)",
    distanceMetres: 5000,
    limitSeconds: 24 * 60,
    heightCm: 170,
    chestMinCm: 80,
    chestExpandedCm: 85,
  },
  {
    id: "sscgd-male-hill",
    label: "SSC GD — male, hill and north-eastern category",
    force: "SSC Constable (GD)",
    distanceMetres: 5000,
    limitSeconds: 24 * 60,
    heightCm: 165,
    chestMinCm: 78,
    chestExpandedCm: 83,
  },
  {
    id: "sscgd-male-st",
    label: "SSC GD — male, Scheduled Tribe",
    force: "SSC Constable (GD)",
    distanceMetres: 5000,
    limitSeconds: 24 * 60,
    heightCm: 162.5,
    chestMinCm: 76,
    chestExpandedCm: 81,
  },
  {
    id: "sscgd-male-ladakh",
    label: "SSC GD — male, Ladakh region",
    force: "SSC Constable (GD)",
    distanceMetres: 1600,
    limitSeconds: 6 * 60 + 30,
    heightCm: 165,
    chestMinCm: 78,
    chestExpandedCm: 83,
  },
  {
    id: "sscgd-female-general",
    label: "SSC GD — female, general category",
    force: "SSC Constable (GD)",
    distanceMetres: 1600,
    limitSeconds: 8 * 60 + 30,
    heightCm: 157,
    chestMinCm: null,
    chestExpandedCm: null,
  },
  {
    id: "sscgd-female-hill",
    label: "SSC GD — female, hill and north-eastern category",
    force: "SSC Constable (GD)",
    distanceMetres: 1600,
    limitSeconds: 8 * 60 + 30,
    heightCm: 155,
    chestMinCm: null,
    chestExpandedCm: null,
  },
  {
    id: "sscgd-female-st",
    label: "SSC GD — female, Scheduled Tribe",
    force: "SSC Constable (GD)",
    distanceMetres: 1600,
    limitSeconds: 8 * 60 + 30,
    heightCm: 150,
    chestMinCm: null,
    chestExpandedCm: null,
  },
  {
    id: "sscgd-female-ladakh",
    label: "SSC GD — female, Ladakh region",
    force: "SSC Constable (GD)",
    distanceMetres: 800,
    limitSeconds: 4 * 60,
    heightCm: 155,
    chestMinCm: null,
    chestExpandedCm: null,
  },
  {
    id: "agniveer-gd-group1",
    label: "Army Agniveer (GD) — run, Group I",
    force: "Indian Army Agniveer",
    distanceMetres: 1600,
    limitSeconds: 5 * 60 + 30,
    heightCm: null,
    chestMinCm: null,
    chestExpandedCm: null,
  },
  {
    id: "agniveer-gd-group2",
    label: "Army Agniveer (GD) — run, Group II",
    force: "Indian Army Agniveer",
    distanceMetres: 1600,
    limitSeconds: 5 * 60 + 45,
    heightCm: null,
    chestMinCm: null,
    chestExpandedCm: null,
  },
  {
    id: "custom",
    label: "Another force — I will enter the standard",
    force: "From your own notification",
    distanceMetres: 1600,
    limitSeconds: 6 * 60,
    heightCm: null,
    chestMinCm: null,
    chestExpandedCm: null,
  },
];

/**
 * Combine a minutes field and a seconds field into total seconds.
 * Returns 0 for anything that is not a usable pair, so the caller never sees NaN.
 *
 * @param {number|string} minutes
 * @param {number|string} seconds
 * @returns {number}
 */
export function toSeconds(minutes, seconds) {
  const mins = Number(minutes === "" || minutes === null || minutes === undefined ? 0 : minutes);
  const secs = Number(seconds === "" || seconds === null || seconds === undefined ? 0 : seconds);
  if (!Number.isFinite(mins) || !Number.isFinite(secs)) return 0;
  const total = mins * 60 + secs;
  return total < 0 ? -1 : total;
}

/**
 * Split total seconds back into whole minutes and remaining seconds.
 *
 * @param {number} total
 * @returns {{ minutes:number, seconds:number }}
 */
export function fromSeconds(total) {
  const value = Number(total);
  if (!Number.isFinite(value) || value < 0) return { minutes: 0, seconds: 0 };
  return { minutes: Math.floor(value / 60), seconds: Math.round(value % 60) };
}

/**
 * Format seconds as "24:00" or "5:30", padding the seconds.
 *
 * @param {number} seconds
 * @returns {string}
 */
export function formatPace(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const total = Math.round(seconds * 10) / 10;
  const minutes = Math.floor(total / 60);
  const rest = total - minutes * 60;
  const restLabel = rest < 10 ? `0${rest.toFixed(1)}` : rest.toFixed(1);
  return `${minutes}:${restLabel.replace(/\.0$/, "")}`;
}

/**
 * Format a whole-second gap as "+18 s" or "-42 s".
 *
 * @param {number} seconds
 * @returns {string}
 */
export function formatMargin(seconds) {
  if (!Number.isFinite(seconds)) return "—";
  const rounded = Math.round(seconds);
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded} s`;
}

/**
 * The pace maths for a timed qualifying run.
 *
 * @param {object} input
 * @param {number} input.distanceMetres
 * @param {number} input.limitSeconds     The qualifying time.
 * @param {number} [input.lapMetres]      Track lap used for the split table.
 * @param {number} [input.currentBestSeconds] Your latest timed trial, 0 if untested.
 * @returns {object} pace figures and splits, or { error }.
 */
export function computeRunPlan({
  distanceMetres = 5000,
  limitSeconds = 1440,
  lapMetres = DEFAULT_LAP_METRES,
  currentBestSeconds = 0,
} = {}) {
  const distance = Number(distanceMetres);
  const limit = Number(limitSeconds);
  const lap = Number(lapMetres);
  const best = Number(currentBestSeconds);

  if (!Number.isFinite(distance) || distance <= 0) {
    return { error: "Enter the run distance in metres, for example 5000." };
  }
  if (distance > MAX_DISTANCE_METRES) {
    return { error: "No recruitment run is longer than a marathon. Check the distance." };
  }
  if (!Number.isFinite(limit) || limit <= 0) {
    return { error: "Enter the qualifying time as a positive number of seconds." };
  }
  if (limit > MAX_LIMIT_SECONDS) {
    return { error: "A qualifying time over four hours is outside this planner." };
  }
  if (!Number.isFinite(lap) || lap <= 0) {
    return { error: "Lap length must be greater than zero. A standard track lap is 400 metres." };
  }
  if (!Number.isFinite(best) || best < 0) {
    return { error: "Your trial time cannot be negative. Leave it at 0 if you have not timed yourself." };
  }

  const kilometres = distance / 1000;
  const secondsPerKm = limit / kilometres;
  const secondsPerLap = (limit * lap) / distance;
  const speedKmph = kilometres / (limit / 3600);
  const metresPerMinute = distance / (limit / 60);

  const wholeLaps = Math.floor(distance / lap);
  const splits = [];
  for (let index = 1; index <= wholeLaps; index += 1) {
    const covered = index * lap;
    splits.push({
      lap: index,
      metres: covered,
      cumulativeSeconds: (limit * covered) / distance,
    });
  }
  if (distance % lap !== 0) {
    splits.push({ lap: wholeLaps + 1, metres: distance, cumulativeSeconds: limit, partial: true });
  }

  const tested = best > 0;
  const marginSeconds = tested ? limit - best : null;
  const qualifies = tested ? best <= limit : null;
  const improvementNeeded = tested && best > limit ? best - limit : 0;
  const improvementPercent =
    tested && best > 0 ? Math.round(((best - limit) / best) * 1000) / 10 : 0;

  return {
    distanceMetres: distance,
    limitSeconds: limit,
    lapMetres: lap,
    kilometres,
    secondsPerKm,
    secondsPerLap,
    speedKmph: Math.round(speedKmph * 100) / 100,
    metresPerMinute: Math.round(metresPerMinute * 10) / 10,
    lapCount: Math.round((distance / lap) * 100) / 100,
    splits: splits.map((split) => ({
      ...split,
      cumulativeLabel: formatPace(split.cumulativeSeconds),
    })),
    tested,
    currentBestSeconds: best,
    marginSeconds,
    qualifies,
    improvementNeeded,
    improvementPercent: improvementPercent > 0 ? improvementPercent : 0,
  };
}

/**
 * Check measured height and chest against a standard.
 *
 * @param {object} input
 * @param {number|null} input.requiredHeightCm
 * @param {number|null} input.requiredChestCm       Unexpanded minimum.
 * @param {number|null} input.requiredExpandedCm    Expanded minimum.
 * @param {number} input.heightCm
 * @param {number} input.chestUnexpandedCm
 * @param {number} input.chestExpandedCm
 * @returns {object} { checks, allClear } or { error }.
 */
export function checkPhysicalStandards({
  requiredHeightCm = null,
  requiredChestCm = null,
  requiredExpandedCm = null,
  heightCm = 0,
  chestUnexpandedCm = 0,
  chestExpandedCm = 0,
} = {}) {
  const height = Number(heightCm);
  const chest = Number(chestUnexpandedCm);
  const expanded = Number(chestExpandedCm);

  if (![height, chest, expanded].every((value) => Number.isFinite(value))) {
    return { error: "Enter each measurement in centimetres." };
  }
  if ([height, chest, expanded].some((value) => value < 0)) {
    return { error: "Measurements cannot be negative." };
  }
  if (height > 260 || chest > 200 || expanded > 200) {
    return { error: "Those measurements are outside any human range. Check the units — this asks for centimetres." };
  }
  if (expanded > 0 && chest > 0 && expanded < chest) {
    return { error: "The expanded chest measurement cannot be smaller than the unexpanded one." };
  }

  const checks = [];

  if (requiredHeightCm !== null && requiredHeightCm !== undefined) {
    const shortfall = Math.round((requiredHeightCm - height) * 10) / 10;
    checks.push({
      id: "height",
      label: "Height",
      required: `${requiredHeightCm} cm minimum`,
      measured: height > 0 ? `${Math.round(height * 10) / 10} cm` : "not entered",
      pass: height > 0 && height >= requiredHeightCm,
      pending: height === 0,
      note:
        height === 0
          ? "Enter your measured height to check this."
          : height >= requiredHeightCm
            ? `Clear by ${Math.round((height - requiredHeightCm) * 10) / 10} cm.`
            : `Short by ${shortfall} cm. Height carries no relaxation beyond the category standards themselves, so check whether you fall in a relaxed category.`,
    });
  }

  if (requiredChestCm !== null && requiredChestCm !== undefined) {
    const requiredExpansion =
      requiredExpandedCm !== null && requiredExpandedCm !== undefined
        ? Math.round((requiredExpandedCm - requiredChestCm) * 10) / 10
        : SSC_GD_CHEST_EXPANSION_CM;
    const measuredExpansion = Math.round((expanded - chest) * 10) / 10;

    checks.push({
      id: "chest",
      label: "Chest, unexpanded",
      required: `${requiredChestCm} cm minimum`,
      measured: chest > 0 ? `${Math.round(chest * 10) / 10} cm` : "not entered",
      pass: chest > 0 && chest >= requiredChestCm,
      pending: chest === 0,
      note:
        chest === 0
          ? "Enter your relaxed chest measurement to check this."
          : chest >= requiredChestCm
            ? `Clear by ${Math.round((chest - requiredChestCm) * 10) / 10} cm.`
            : `Short by ${Math.round((requiredChestCm - chest) * 10) / 10} cm.`,
    });

    checks.push({
      id: "expansion",
      label: "Chest expansion",
      required: `${requiredExpansion} cm minimum`,
      measured: expanded > 0 && chest > 0 ? `${measuredExpansion} cm` : "not entered",
      pass: chest > 0 && expanded > 0 && measuredExpansion >= requiredExpansion,
      pending: chest === 0 || expanded === 0,
      note:
        chest === 0 || expanded === 0
          ? "Enter both chest measurements to check the expansion."
          : measuredExpansion >= requiredExpansion
            ? `Expansion of ${measuredExpansion} cm meets the ${requiredExpansion} cm minimum.`
            : `Expansion of ${measuredExpansion} cm falls ${Math.round((requiredExpansion - measuredExpansion) * 10) / 10} cm short. Both the unexpanded figure and the expansion have to be met.`,
    });
  }

  const measured = checks.filter((check) => !check.pending);
  return {
    checks,
    measuredCount: measured.length,
    allClear: measured.length > 0 && measured.every((check) => check.pass),
    anyFail: measured.some((check) => !check.pass),
  };
}

/**
 * Kit and routine for the ground.
 *
 * @param {object} [flags]
 * @returns {{ documents:Array, kit:Array, warmUp:Array, avoid:Array }}
 */
export function buildPhysicalTestKit(flags = {}) {
  const documents = [
    {
      id: "admitCard",
      label: "PET/PST admit card, printed",
      detail: "Recruitment grounds have no printer and often no signal. Carry two printed copies.",
    },
    {
      id: "photoId",
      label: "Original photo identity plus a photocopy",
      detail: "Aadhaar is the usual one. The original is checked and returned; the copy is retained.",
    },
    {
      id: "photos",
      label: "Six to eight passport photographs, same as the application",
      detail: "Fresh prints of the identical image. A different photograph raises a verification query.",
    },
    {
      id: "categoryCert",
      label: "Category certificate, if you have claimed relaxation",
      detail:
        "Height and chest relaxations for Scheduled Tribe and the hill categories are only allowed against the certificate in the prescribed format.",
    },
    {
      id: "domicile",
      label: "Domicile or residence certificate where a regional standard is claimed",
      detail:
        "Ladakh, north-eastern and hill-category standards are tied to where you belong, and the ground verifies that against the certificate.",
    },
  ];

  if (flags.exServiceman) {
    documents.push({
      id: "discharge",
      label: "Discharge book and ex-serviceman certificate",
      detail: "Carry the originals — the relaxation is applied at the ground on the discharge particulars.",
    });
  }
  if (flags.sportsQuota) {
    documents.push({
      id: "sports",
      label: "Sports certificates in the prescribed format",
      detail: "Only certificates issued by the recognised authority named in the notice are counted.",
    });
  }

  const kit = [
    {
      id: "shoes",
      label: "Running shoes you have already broken in",
      detail:
        "Never a new pair. A shoe bought the week before causes blisters in the first kilometre and ends the attempt.",
    },
    {
      id: "clothing",
      label: "Light running shorts or track pants and a breathable tee",
      detail: "Nothing loose enough to catch, nothing heavy enough to hold sweat.",
    },
    {
      id: "socks",
      label: "Two pairs of cushioned socks",
      detail: "One to run in, one spare. Damp socks over a long wait are how blisters start.",
    },
    {
      id: "water",
      label: "Water, and an oral rehydration sachet",
      detail:
        "Grounds run from dawn to afternoon and the queue is long. Sip through the wait rather than drinking heavily just before the run.",
    },
    {
      id: "food",
      label: "A light carbohydrate meal two to three hours before, plus a banana",
      detail: "Nothing fried, nothing new. The morning of a timed run is not the day to try a different breakfast.",
    },
    {
      id: "towel",
      label: "Towel, cap and sunscreen",
      detail: "Most of the day is spent standing in the open between events.",
    },
    {
      id: "tape",
      label: "Basic first aid — antiseptic, blister plasters, pain spray",
      detail: "The ground has a medical team for emergencies, not for a hot spot on your heel.",
    },
  ];

  const warmUp = [
    {
      id: "jog",
      label: "10 minutes of easy jogging",
      detail: "Finish it about 20 minutes before your chest number is called, so you are warm but not tired.",
    },
    {
      id: "dynamic",
      label: "Dynamic stretches — leg swings, lunges, high knees, ankle circles",
      detail: "Dynamic movement before a run. Long static holds belong afterwards, not before.",
    },
    {
      id: "strides",
      label: "Four strides of about 80 metres at close to race pace",
      detail: "This wakes up the turnover so the first lap does not feel like a cold start.",
    },
    {
      id: "planFirstLap",
      label: "Rehearse the first lap time in your head",
      detail:
        "Going out too fast is the commonest reason a candidate who can hold the pace still misses the cut-off.",
    },
  ];

  const avoid = [
    {
      id: "newGear",
      label: "New shoes, new clothes, new supplements",
      detail: "Anything untested on a training run is a risk on the one day it counts.",
    },
    {
      id: "sprintStart",
      label: "Sprinting the first lap",
      detail:
        "Run the split table below. Even pacing beats a fast start on every distance in a recruitment run.",
    },
    {
      id: "jewellery",
      label: "Jewellery, chains, watches, metal accessories",
      detail: "They are removed before the measurements and are easily lost in the crowd at a ground.",
    },
    {
      id: "heavyMeal",
      label: "A heavy or oily meal within three hours",
      detail: "Side stitches on a timed run come from eating late far more often than from poor fitness.",
    },
  ];

  return { documents, kit, warmUp, avoid };
}

/**
 * Progress across documents and kit.
 *
 * @param {object} bundle  Result of buildPhysicalTestKit.
 * @param {Array<string>} packedIds
 * @returns {{ packed:number, total:number, percent:number, missing:Array, ready:boolean }}
 */
export function computeGroundReadiness(bundle, packedIds) {
  const packed = Array.isArray(packedIds) ? packedIds : [];
  const items = [
    ...(bundle && Array.isArray(bundle.documents) ? bundle.documents : []),
    ...(bundle && Array.isArray(bundle.kit) ? bundle.kit : []),
  ];
  const missing = items.filter((item) => !packed.includes(item.id));
  const total = items.length;
  const held = total - missing.length;
  return {
    packed: held,
    total,
    percent: total === 0 ? 0 : Math.round((held / total) * 100),
    missing,
    ready: total > 0 && missing.length === 0,
  };
}

export default computeRunPlan;
