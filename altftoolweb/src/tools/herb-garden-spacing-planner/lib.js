/**
 * Kitchen herb garden spacing.
 *
 * SPACING RULE — each herb is given a square of side equal to its recommended
 * in-row spacing, which is the standard way extension services state herb
 * spacing (plant-to-plant distance in every direction). The footprint of one
 * plant is therefore spacing^2, and the number that fit a rectangular bed is
 * floor(length / spacing) x floor(width / spacing), because part of a square
 * cannot hold a plant.
 *
 * The spacing, minimum soil depth and daily sun figures below are the mature
 * habit of each herb as published in horticulture extension guides; they are
 * growing guidance, not a standard, and vary with cultivar and climate.
 *
 * COMPANION NOTES — only well-documented interactions are recorded: mint and
 * lemongrass spread by runners and take over a shared bed, and fennel is
 * widely reported to suppress neighbouring herbs, so it is flagged rather than
 * silently mixed in.
 */

/** Each herb: spacing (cm), minimum soil depth (cm), sun hours a day, habit notes. */
export const HERBS = [
  {
    id: "basil",
    name: "Basil",
    botanical: "Ocimum basilicum",
    spacingCm: 30,
    depthCm: 20,
    sunHours: [6, 8],
    lifespan: "Annual",
    habit: "bushy",
    note: "Pinch the growing tip above a leaf pair every fortnight to stop it flowering.",
    companions: ["tomato", "oregano", "parsley"],
  },
  {
    id: "mint",
    name: "Mint",
    botanical: "Mentha spicata",
    spacingCm: 45,
    depthCm: 25,
    sunHours: [4, 6],
    lifespan: "Perennial",
    habit: "running",
    invasive: true,
    note: "Spreads by underground runners — give it its own pot or it will swallow the bed.",
    companions: [],
  },
  {
    id: "coriander",
    name: "Coriander (dhania)",
    botanical: "Coriandrum sativum",
    spacingCm: 15,
    depthCm: 20,
    sunHours: [4, 6],
    lifespan: "Annual",
    habit: "upright",
    note: "Direct sow; it bolts fast above about 30 °C, so sow a fresh row every three weeks.",
    companions: ["basil", "chives"],
  },
  {
    id: "parsley",
    name: "Parsley",
    botanical: "Petroselinum crispum",
    spacingCm: 20,
    depthCm: 25,
    sunHours: [4, 6],
    lifespan: "Biennial",
    habit: "clumping",
    note: "Slow to germinate — soaking the seed overnight helps.",
    companions: ["basil", "chives"],
  },
  {
    id: "thyme",
    name: "Thyme",
    botanical: "Thymus vulgaris",
    spacingCm: 25,
    depthCm: 15,
    sunHours: [6, 8],
    lifespan: "Perennial",
    habit: "low spreading",
    note: "Wants gritty, sharply drained soil; the commonest way to kill it is overwatering.",
    companions: ["rosemary", "sage", "oregano"],
  },
  {
    id: "rosemary",
    name: "Rosemary",
    botanical: "Salvia rosmarinus",
    spacingCm: 60,
    depthCm: 30,
    sunHours: [6, 8],
    lifespan: "Perennial shrub",
    habit: "shrubby",
    note: "Becomes a woody shrub — give it the back of the bed and space it wide.",
    companions: ["thyme", "sage"],
  },
  {
    id: "oregano",
    name: "Oregano",
    botanical: "Origanum vulgare",
    spacingCm: 30,
    depthCm: 20,
    sunHours: [6, 8],
    lifespan: "Perennial",
    habit: "low spreading",
    note: "Flavour is strongest in poor, dry soil and full sun.",
    companions: ["basil", "thyme"],
  },
  {
    id: "chives",
    name: "Chives",
    botanical: "Allium schoenoprasum",
    spacingCm: 15,
    depthCm: 15,
    sunHours: [4, 6],
    lifespan: "Perennial",
    habit: "clumping",
    note: "Cut whole leaves at the base rather than trimming the tips.",
    companions: ["parsley", "coriander"],
  },
  {
    id: "sage",
    name: "Sage",
    botanical: "Salvia officinalis",
    spacingCm: 45,
    depthCm: 25,
    sunHours: [6, 8],
    lifespan: "Perennial",
    habit: "shrubby",
    note: "Prune hard in spring or the centre goes woody and bare.",
    companions: ["rosemary", "thyme"],
  },
  {
    id: "curry-leaf",
    name: "Curry leaf",
    botanical: "Murraya koenigii",
    spacingCm: 90,
    depthCm: 45,
    sunHours: [6, 8],
    lifespan: "Perennial tree",
    habit: "small tree",
    note: "Grows into a small tree — best in its own deep pot rather than a shared bed.",
    companions: [],
  },
  {
    id: "lemongrass",
    name: "Lemongrass",
    botanical: "Cymbopogon citratus",
    spacingCm: 60,
    depthCm: 35,
    sunHours: [6, 8],
    lifespan: "Perennial",
    habit: "clumping grass",
    invasive: true,
    note: "The clump widens every season; divide it each year or it crowds its neighbours.",
    companions: [],
  },
  {
    id: "ajwain-leaf",
    name: "Ajwain leaf (Indian borage)",
    botanical: "Plectranthus amboinicus",
    spacingCm: 40,
    depthCm: 20,
    sunHours: [4, 6],
    lifespan: "Perennial",
    habit: "succulent trailing",
    note: "Roots from a cutting in water within a fortnight; tolerates shade well.",
    companions: [],
  },
  {
    id: "fenugreek",
    name: "Fenugreek (methi)",
    botanical: "Trigonella foenum-graecum",
    spacingCm: 10,
    depthCm: 15,
    sunHours: [4, 6],
    lifespan: "Annual",
    habit: "dense sowing",
    note: "Broadcast thickly and cut the whole crop at 4-5 weeks; it does not regrow well.",
    companions: [],
  },
  {
    id: "dill",
    name: "Dill",
    botanical: "Anethum graveolens",
    spacingCm: 25,
    depthCm: 30,
    sunHours: [6, 8],
    lifespan: "Annual",
    habit: "tall upright",
    note: "Deep taproot — sow where it will stay, it resents transplanting.",
    companions: ["coriander"],
  },
  {
    id: "fennel",
    name: "Fennel",
    botanical: "Foeniculum vulgare",
    spacingCm: 45,
    depthCm: 40,
    sunHours: [6, 8],
    lifespan: "Perennial",
    habit: "tall upright",
    antagonist: true,
    note: "Widely reported to suppress nearby herbs and to cross with dill — plant it apart.",
    companions: [],
  },
];

export const HERBS_BY_ID = Object.fromEntries(HERBS.map((herb) => [herb.id, herb]));

/** 1 inch = 2.54 cm exactly; 1 foot = 30.48 cm exactly. */
export const CM_PER_UNIT = { cm: 1, in: 2.54, ft: 30.48 };

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** How many plants of one herb fit a bed on a square grid. */
export function capacityFor(spacingCm, bedLengthCm, bedWidthCm) {
  if (!(spacingCm > 0) || !(bedLengthCm > 0) || !(bedWidthCm > 0)) return 0;
  return Math.floor(bedLengthCm / spacingCm) * Math.floor(bedWidthCm / spacingCm);
}

/**
 * @param {object} input
 * @param {number} input.bedLength      bed length in `unit`
 * @param {number} input.bedWidth       bed width in `unit`
 * @param {"cm"|"in"|"ft"} input.unit
 * @param {Array<{id: string, count: number}>} input.selection
 */
export function planHerbGarden({ bedLength, bedWidth, unit = "cm", selection = [] }) {
  if (!isNum(bedLength) || !isNum(bedWidth)) {
    return { error: "Enter a valid bed length and width." };
  }
  const factor = CM_PER_UNIT[unit];
  if (!factor) return { error: "Choose centimetres, inches or feet." };
  if (bedLength <= 0 || bedWidth <= 0) return { error: "Bed length and width must be greater than zero." };

  const bedLengthCm = bedLength * factor;
  const bedWidthCm = bedWidth * factor;
  if (bedLengthCm > 5000 || bedWidthCm > 5000) {
    return { error: "This planner is for beds up to 50 m on a side." };
  }

  const picked = selection
    .filter((item) => item && HERBS_BY_ID[item.id] && Number(item.count) > 0)
    .map((item) => ({ herb: HERBS_BY_ID[item.id], count: Math.floor(Number(item.count)) }));

  if (picked.length === 0) {
    return { error: "Pick at least one herb and set how many plants you want." };
  }
  if (picked.some((item) => item.count > 5000)) {
    return { error: "Enter 5,000 plants or fewer for any single herb." };
  }

  const bedAreaCm2 = bedLengthCm * bedWidthCm;

  const plants = picked.map(({ herb, count }) => {
    const footprintCm2 = herb.spacingCm * herb.spacingCm;
    return {
      id: herb.id,
      name: herb.name,
      botanical: herb.botanical,
      count,
      spacingCm: herb.spacingCm,
      depthCm: herb.depthCm,
      sunHours: herb.sunHours,
      lifespan: herb.lifespan,
      note: herb.note,
      footprintCm2,
      areaCm2: footprintCm2 * count,
      capacityAlone: capacityFor(herb.spacingCm, bedLengthCm, bedWidthCm),
      rowsIfAlone: Math.floor(bedWidthCm / herb.spacingCm),
      perRowIfAlone: Math.floor(bedLengthCm / herb.spacingCm),
    };
  });

  const totalPlants = plants.reduce((sum, plant) => sum + plant.count, 0);
  const usedAreaCm2 = plants.reduce((sum, plant) => sum + plant.areaCm2, 0);
  const utilisationPct = (usedAreaCm2 / bedAreaCm2) * 100;
  const spareAreaCm2 = bedAreaCm2 - usedAreaCm2;
  const fits = usedAreaCm2 <= bedAreaCm2;

  const minPotDepthCm = plants.reduce((deepest, plant) => Math.max(deepest, plant.depthCm), 0);
  const minSunHours = plants.reduce((most, plant) => Math.max(most, plant.sunHours[0]), 0);

  const warnings = [];
  if (!fits) {
    warnings.push(
      `The plan needs ${Math.round(usedAreaCm2 / 100) / 100} m² but the bed offers ${
        Math.round(bedAreaCm2 / 100) / 100
      } m² — drop plants or enlarge the bed.`,
    );
  }
  picked.forEach(({ herb }) => {
    if (herb.invasive) {
      warnings.push(`${herb.name} spreads by runners — sink it in its own pot inside the bed.`);
    }
    if (herb.antagonist) {
      warnings.push(`${herb.name} is best grown away from the rest of the herb bed.`);
    }
    if (herb.spacingCm >= 60) {
      warnings.push(`${herb.name} needs ${herb.spacingCm} cm all round — put it at the back of the bed.`);
    }
  });

  const shadeLovers = plants.filter((plant) => plant.sunHours[1] <= 6).map((plant) => plant.name);
  const sunLovers = plants.filter((plant) => plant.sunHours[0] >= 6).map((plant) => plant.name);
  if (shadeLovers.length > 0 && sunLovers.length > 0) {
    warnings.push(
      `Mixed light needs: ${sunLovers.join(", ")} want 6+ hours of sun, while ${shadeLovers.join(", ")} are happy with 4-6 — group them at opposite ends.`,
    );
  }

  return {
    bedLengthCm,
    bedWidthCm,
    bedAreaCm2,
    bedAreaM2: bedAreaCm2 / 10000,
    plants,
    totalPlants,
    usedAreaCm2,
    usedAreaM2: usedAreaCm2 / 10000,
    spareAreaCm2,
    spareAreaM2: spareAreaCm2 / 10000,
    utilisationPct,
    fits,
    minPotDepthCm,
    minSunHours,
    warnings,
  };
}
