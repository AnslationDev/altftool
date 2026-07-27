/**
 * Adhesive selection for a pair of substrates.
 *
 * An adhesive bond needs three things, and most failures are a shortage of
 * one of them rather than the glue being "not strong enough".
 *
 * 1. WETTING. The adhesive has to spread across the surface, which it only
 *    does when the substrate's surface energy comfortably exceeds the
 *    adhesive's surface tension. Common adhesives sit around 30-35 mN/m, and
 *    the industry cut-off for a "low surface energy" plastic is about
 *    34 mN/m. Polypropylene (29), polyethylene (31), silicone rubber (24) and
 *    PTFE (18) all fall below it, which is why glue beads up and peels off
 *    them however long you clamp it.
 *
 * 2. GAP. Cyanoacrylate and PVA are thin and need a fit within roughly
 *    0.1 mm. Epoxy and polyurethane fill millimetres. Sealants and hybrid
 *    polymers fill much more but trade away rigidity to do it.
 *
 * 3. MOVEMENT AND EXPOSURE. A rigid bond across two materials with different
 *    thermal expansion, or across a joint that moves, fails at the bond line
 *    no matter how strong it is. Sealants classified to ASTM C920 class 25
 *    accommodate +/-25% joint movement; a rigid structural adhesive
 *    accommodates essentially none.
 *
 * Strengths quoted are typical lap-shear values on prepared substrates, from
 * published manufacturer data ranges. They are for comparison between
 * families, not for design — a structural joint needs the specific product's
 * datasheet and a safety factor.
 */

/** Below this surface energy, in mN/m, a plastic needs treatment or a specialist adhesive. */
export const LOW_SURFACE_ENERGY_THRESHOLD = 34;

/** Typical surface tension of a general-purpose liquid adhesive, mN/m. */
export const TYPICAL_ADHESIVE_SURFACE_TENSION = 33;

/**
 * Substrates. surfaceEnergy in mN/m where the figure is meaningful; porous
 * substrates bond mechanically as well as chemically so the number matters
 * much less and is left null.
 */
export const MATERIALS = [
  { id: "wood", label: "Wood (solid timber)", surfaceEnergy: null, porous: true, flexible: false },
  { id: "mdf", label: "MDF, chipboard or ply", surfaceEnergy: null, porous: true, flexible: false },
  { id: "paper", label: "Paper, card or fabric", surfaceEnergy: null, porous: true, flexible: true },
  { id: "leather", label: "Leather", surfaceEnergy: null, porous: true, flexible: true },
  { id: "masonry", label: "Concrete, brick or plaster", surfaceEnergy: null, porous: true, flexible: false },
  { id: "stone", label: "Stone, granite or marble", surfaceEnergy: null, porous: true, flexible: false },
  { id: "ceramic", label: "Ceramic or porcelain tile", surfaceEnergy: 300, porous: false, flexible: false },
  { id: "glass", label: "Glass or mirror", surfaceEnergy: 300, porous: false, flexible: false },
  { id: "steel", label: "Steel or iron", surfaceEnergy: 500, porous: false, flexible: false },
  { id: "aluminium", label: "Aluminium", surfaceEnergy: 500, porous: false, flexible: false },
  { id: "pvc", label: "Rigid PVC or ABS", surfaceEnergy: 40, porous: false, flexible: false },
  { id: "acrylic", label: "Acrylic (PMMA) or polycarbonate", surfaceEnergy: 42, porous: false, flexible: false },
  { id: "pp", label: "Polypropylene (PP)", surfaceEnergy: 29, porous: false, flexible: false },
  { id: "pe", label: "Polyethylene (PE, HDPE)", surfaceEnergy: 31, porous: false, flexible: false },
  { id: "ptfe", label: "PTFE / Teflon", surfaceEnergy: 18, porous: false, flexible: false },
  { id: "rubber", label: "Rubber, EPDM or neoprene", surfaceEnergy: 33, porous: false, flexible: true },
  { id: "silicone-rubber", label: "Silicone rubber", surfaceEnergy: 24, porous: false, flexible: true },
  { id: "foam", label: "Polystyrene or PU foam", surfaceEnergy: 38, porous: true, flexible: true },
  { id: "painted", label: "Painted or varnished surface", surfaceEnergy: 43, porous: false, flexible: false },
];

/**
 * Adhesive families. gapFillMm is the largest gap the family bridges without
 * losing its properties; strengthMPa is a typical lap-shear range midpoint;
 * movementPct is the joint movement the cured product tolerates.
 */
export const ADHESIVES = [
  {
    id: "pva",
    label: "PVA wood glue",
    bonds: ["wood", "mdf", "paper", "masonry", "foam"],
    preferred: ["wood", "mdf", "paper"],
    minGapMm: 0,
    gapFillMm: 0.1,
    strengthMPa: 10,
    movementPct: 0,
    waterproof: false,
    waterResistant: false,
    paintable: true,
    maxTempC: 60,
    openTimeMin: 8,
    clampMin: 30,
    fullCureH: 24,
    note: "On long-grain timber the glue line ends up stronger than the wood. It needs a close fit and real clamping pressure, and it is not for anything that gets wet unless it is a Type II or III exterior grade.",
  },
  {
    id: "pu-glue",
    label: "Polyurethane glue (expanding)",
    bonds: ["wood", "mdf", "masonry", "stone", "ceramic", "steel", "aluminium", "pvc", "foam", "glass"],
    preferred: ["masonry", "stone"],
    minGapMm: 0,
    gapFillMm: 3,
    strengthMPa: 12,
    movementPct: 5,
    waterproof: true,
    waterResistant: true,
    paintable: true,
    maxTempC: 100,
    openTimeMin: 25,
    clampMin: 90,
    fullCureH: 24,
    note: "Cures by reacting with moisture and foams as it goes, so it fills gaps but the foam has little strength — clamp it hard or it pushes the joint apart. It stains skin brown for a week.",
  },
  {
    id: "epoxy",
    label: "Two-part epoxy",
    bonds: ["wood", "mdf", "masonry", "stone", "ceramic", "glass", "steel", "aluminium", "pvc", "acrylic", "painted"],
    preferred: ["steel", "aluminium", "glass", "ceramic", "stone"],
    minGapMm: 0,
    gapFillMm: 5,
    strengthMPa: 20,
    movementPct: 0,
    waterproof: true,
    waterResistant: true,
    paintable: true,
    maxTempC: 120,
    openTimeMin: 20,
    clampMin: 60,
    fullCureH: 24,
    note: "The structural choice for dissimilar rigid materials, and the only common household adhesive with real strength on metal. Rigid when cured, so it is the wrong answer for anything that flexes.",
  },
  {
    id: "ca",
    label: "Cyanoacrylate (super glue)",
    bonds: ["ceramic", "glass", "steel", "aluminium", "pvc", "acrylic", "rubber", "wood", "leather"],
    preferred: ["acrylic", "pvc", "rubber"],
    minGapMm: 0,
    gapFillMm: 0.05,
    strengthMPa: 15,
    movementPct: 0,
    waterproof: false,
    waterResistant: true,
    paintable: false,
    maxTempC: 80,
    openTimeMin: 0.2,
    clampMin: 1,
    fullCureH: 24,
    note: "Sets in seconds and is brittle in shear and peel. Excellent for a close-fitting repair, poor for anything loaded, and it whitens surrounding surfaces as it cures.",
  },
  {
    id: "contact",
    label: "Contact adhesive (neoprene)",
    bonds: ["wood", "mdf", "leather", "rubber", "pvc", "painted", "paper", "masonry"],
    preferred: ["leather", "rubber", "mdf"],
    minGapMm: 0,
    gapFillMm: 0.3,
    strengthMPa: 3,
    movementPct: 10,
    waterproof: false,
    waterResistant: true,
    paintable: false,
    maxTempC: 70,
    openTimeMin: 15,
    clampMin: 0,
    fullCureH: 24,
    note: "Coat both faces, let them go touch-dry, then press. Instant grab and no clamping, but no repositioning either — where it lands is where it stays. Solvent grades need real ventilation.",
  },
  {
    id: "ms-polymer",
    label: "MS polymer / hybrid grab adhesive",
    bonds: ["wood", "mdf", "masonry", "stone", "ceramic", "glass", "steel", "aluminium", "pvc", "acrylic", "painted", "foam", "rubber"],
    preferred: ["masonry", "painted", "foam"],
    minGapMm: 1,
    gapFillMm: 6,
    strengthMPa: 2,
    movementPct: 25,
    waterproof: true,
    waterResistant: true,
    paintable: true,
    maxTempC: 90,
    openTimeMin: 15,
    clampMin: 0,
    fullCureH: 48,
    note: "Bonds nearly everything including damp surfaces, stays flexible, is paintable and contains no solvent or isocyanate. Strength is modest, so use bead area rather than clamping force.",
  },
  {
    id: "silicone",
    label: "Silicone sealant (neutral cure)",
    bonds: ["glass", "ceramic", "steel", "aluminium", "pvc", "acrylic", "stone", "masonry", "silicone-rubber"],
    preferred: ["glass", "ceramic", "silicone-rubber"],
    minGapMm: 3,
    gapFillMm: 12,
    strengthMPa: 1,
    movementPct: 25,
    waterproof: true,
    waterResistant: true,
    paintable: false,
    maxTempC: 180,
    openTimeMin: 10,
    clampMin: 0,
    fullCureH: 24,
    note: "A sealant, not a structural adhesive. Choose neutral cure near metal and mirrors — acetoxy silicone releases acetic acid, which corrodes metal and lifts mirror backing. Nothing paints over it.",
  },
  {
    id: "acrylic-sealant",
    label: "Acrylic sealant (decorator's caulk)",
    bonds: ["wood", "mdf", "masonry", "painted", "pvc"],
    preferred: ["painted", "wood", "mdf"],
    minGapMm: 3,
    gapFillMm: 8,
    strengthMPa: 0.5,
    movementPct: 8,
    waterproof: false,
    waterResistant: false,
    paintable: true,
    maxTempC: 70,
    openTimeMin: 10,
    clampMin: 0,
    fullCureH: 24,
    note: "For filling the gap between trim and wall before painting. Low movement capability and not for wet areas — in a bathroom it goes mouldy and shrinks away within a season.",
  },
  {
    id: "pu-sealant",
    label: "Polyurethane sealant",
    bonds: ["masonry", "stone", "wood", "steel", "aluminium", "pvc", "painted", "ceramic"],
    preferred: ["masonry", "stone"],
    minGapMm: 3,
    gapFillMm: 15,
    strengthMPa: 1.5,
    movementPct: 25,
    waterproof: true,
    waterResistant: true,
    paintable: true,
    maxTempC: 90,
    openTimeMin: 20,
    clampMin: 0,
    fullCureH: 72,
    note: "The exterior movement-joint sealant: tough, paintable, and it takes abrasion. Slower to cure than silicone and it will not bond to a wet surface.",
  },
  {
    id: "solvent-cement",
    label: "Solvent cement (PVC/ABS)",
    bonds: ["pvc"],
    preferred: ["pvc"],
    minGapMm: 0,
    gapFillMm: 0.2,
    strengthMPa: 25,
    movementPct: 0,
    waterproof: true,
    waterResistant: true,
    paintable: false,
    maxTempC: 60,
    openTimeMin: 0.5,
    clampMin: 2,
    fullCureH: 24,
    note: "Not glue at all — it dissolves both faces so they fuse into one piece. Only works when both parts are the same plastic, and only on PVC, CPVC or ABS with the matching cement.",
  },
  {
    id: "hot-melt",
    label: "Hot melt (EVA glue stick)",
    bonds: ["wood", "mdf", "paper", "foam", "pvc", "leather", "fabric"],
    preferred: ["paper", "foam"],
    minGapMm: 0.2,
    gapFillMm: 3,
    strengthMPa: 2,
    movementPct: 5,
    waterproof: false,
    waterResistant: true,
    paintable: false,
    maxTempC: 60,
    openTimeMin: 0.3,
    clampMin: 0.5,
    fullCureH: 0.1,
    note: "Instant, forgiving and weak. It softens again well below boiling point, so anything in a hot car or in sunlight will let go.",
  },
  {
    id: "lse-ca",
    label: "CA with polyolefin primer, or LSE structural acrylic",
    bonds: ["pp", "pe", "ptfe", "silicone-rubber", "rubber", "pvc", "acrylic", "steel", "aluminium"],
    preferred: ["pp", "pe", "ptfe", "silicone-rubber"],
    minGapMm: 0,
    gapFillMm: 0.2,
    strengthMPa: 8,
    movementPct: 0,
    waterproof: false,
    waterResistant: true,
    paintable: false,
    maxTempC: 80,
    openTimeMin: 1,
    clampMin: 2,
    fullCureH: 24,
    note: "The only realistic route onto polypropylene, polyethylene and silicone rubber without industrial flame or plasma treatment. Prime the surface first, and expect a fraction of the strength you would get on metal.",
  },
];

/**
 * Weights used to score a candidate. The `preferred` term is what stops the
 * strongest adhesive winning every question: epoxy passes every constraint on
 * a wood-to-wood joint, but PVA is the right answer, so an adhesive that
 * names both substrates as its home ground gets a bonus.
 */
export const SCORE_WEIGHTS = {
  gap: 25,
  water: 20,
  movement: 20,
  strength: 20,
  paintable: 10,
  temperature: 5,
  preferred: 15,
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const MAX_GAP_MM = 50;
const MAX_TEMP_C = 300;

/** Strength, in MPa, below which a bond is not considered structural. */
export const STRUCTURAL_STRENGTH_MPA = 5;

/**
 * Rank adhesives for a joint.
 *
 * @param {object} input
 * @param {string} input.materialA
 * @param {string} input.materialB
 * @param {number} [input.gapMm]        Largest gap the adhesive must bridge.
 * @param {boolean} [input.wet]         Permanently damp, submerged or exterior.
 * @param {boolean} [input.moves]       The joint flexes or expands.
 * @param {boolean} [input.loadBearing] The bond carries real load.
 * @param {boolean} [input.paintOver]   It must be painted afterwards.
 * @param {number} [input.maxTempC]     Highest service temperature.
 */
export function selectAdhesive({
  materialA = "wood",
  materialB = "wood",
  gapMm = 0.1,
  wet = false,
  moves = false,
  loadBearing = false,
  paintOver = false,
  maxTempC = 30,
} = {}) {
  const a = MATERIALS.find((entry) => entry.id === materialA);
  const b = MATERIALS.find((entry) => entry.id === materialB);
  if (!a || !b) return { error: "Choose both materials you are joining." };
  if (![gapMm, maxTempC].every(isNum)) {
    return { error: "Enter the gap and service temperature as numbers." };
  }
  if (gapMm < 0) return { error: "Gap cannot be negative. Use 0 for a close fit." };
  if (gapMm > MAX_GAP_MM) {
    return { error: `A gap of more than ${MAX_GAP_MM} mm is a filler or a mechanical fixing job, not an adhesive one.` };
  }
  if (maxTempC < -60 || maxTempC > MAX_TEMP_C) {
    return { error: `Service temperature should be between −60 and ${MAX_TEMP_C} °C.` };
  }

  const lowEnergy = [...new Map([a, b].map((material) => [material.id, material])).values()].filter(
    (material) =>
      isNum(material.surfaceEnergy) && material.surfaceEnergy <= LOW_SURFACE_ENERGY_THRESHOLD,
  );

  const ranked = [];
  const rejected = [];

  for (const adhesive of ADHESIVES) {
    const bondsA = adhesive.bonds.includes(a.id);
    const bondsB = adhesive.bonds.includes(b.id);
    if (!bondsA || !bondsB) {
      const missing = [...new Set([!bondsA ? a.label : null, !bondsB ? b.label : null])].filter(
        Boolean,
      );
      rejected.push({ adhesive, reason: `Not rated for ${missing.join(" or ")}.` });
      continue;
    }

    const reasons = [];
    const warnings = [];
    let score = 0;

    // Gap: too wide starves the bond, too narrow gives a sealant nothing to
    // work with — ASTM C1193 puts the minimum sealant joint width at about
    // 6 mm for a movement joint, and no gunned bead works in a hairline.
    const minGap = adhesive.minGapMm ?? 0;
    if (gapMm < minGap) {
      warnings.push(
        `Needs a joint of at least ${minGap} mm to form a usable bead; yours is ${gapMm} mm.`,
      );
    } else if (adhesive.gapFillMm >= gapMm) {
      score += SCORE_WEIGHTS.gap;
      reasons.push(`Suits a ${gapMm} mm joint (rated ${minGap} to ${adhesive.gapFillMm} mm).`);
    } else {
      warnings.push(
        `Only bridges ${adhesive.gapFillMm} mm, and your joint is ${gapMm} mm — the bond will be starved.`,
      );
    }

    // Water.
    if (!wet) {
      score += SCORE_WEIGHTS.water;
    } else if (adhesive.waterproof) {
      score += SCORE_WEIGHTS.water;
      reasons.push("Waterproof once cured, so it survives exterior or wet service.");
    } else if (adhesive.waterResistant) {
      score += SCORE_WEIGHTS.water * 0.4;
      warnings.push("Water resistant but not waterproof — occasional splashes only.");
    } else {
      warnings.push("Not water resistant. It will creep and fail in a damp joint.");
    }

    // Movement.
    if (!moves) {
      score += SCORE_WEIGHTS.movement;
    } else if (adhesive.movementPct >= 20) {
      score += SCORE_WEIGHTS.movement;
      reasons.push(`Accommodates about ±${adhesive.movementPct}% joint movement.`);
    } else if (adhesive.movementPct >= 5) {
      score += SCORE_WEIGHTS.movement * 0.4;
      warnings.push(`Only ±${adhesive.movementPct}% movement — fine for small thermal change, not for a working joint.`);
    } else {
      warnings.push("Rigid when cured. A joint that moves will crack the bond line rather than the substrate.");
    }

    // Strength.
    if (!loadBearing) {
      score += SCORE_WEIGHTS.strength;
    } else if (adhesive.strengthMPa >= STRUCTURAL_STRENGTH_MPA) {
      score += SCORE_WEIGHTS.strength;
      reasons.push(`Typical lap shear around ${adhesive.strengthMPa} MPa, enough to be treated as structural.`);
    } else {
      warnings.push(`About ${adhesive.strengthMPa} MPa lap shear — below the ${STRUCTURAL_STRENGTH_MPA} MPa where a bond starts carrying real load.`);
    }

    // Paintability.
    if (!paintOver) {
      score += SCORE_WEIGHTS.paintable;
    } else if (adhesive.paintable) {
      score += SCORE_WEIGHTS.paintable;
      reasons.push("Takes paint once cured.");
    } else {
      warnings.push("Nothing paints over it reliably.");
    }

    // Home ground: both substrates are what this family is made for.
    const preferred = adhesive.preferred ?? [];
    if (preferred.includes(a.id) && preferred.includes(b.id)) {
      score += SCORE_WEIGHTS.preferred;
      reasons.push(`This is the family made for ${a.id === b.id ? a.label.toLowerCase() : "this pair of materials"}.`);
    }

    // Temperature.
    if (adhesive.maxTempC >= maxTempC) {
      score += SCORE_WEIGHTS.temperature;
    } else {
      warnings.push(`Softens above about ${adhesive.maxTempC} °C, below the ${maxTempC} °C you specified.`);
    }

    ranked.push({
      adhesive,
      score,
      reasons,
      warnings,
      suitable: warnings.length === 0,
    });
  }

  ranked.sort((x, y) => y.score - x.score || y.adhesive.strengthMPa - x.adhesive.strengthMPa);

  if (ranked.length === 0) {
    return {
      error: `Nothing in this list bonds ${a.label} to ${b.label} directly. Consider a mechanical fixing, or surface treatment followed by a specialist industrial adhesive.`,
    };
  }

  const best = ranked[0];
  const maxScore = Object.values(SCORE_WEIGHTS).reduce((sum, value) => sum + value, 0);

  let verdict = `${best.adhesive.label} scores ${best.score} of ${maxScore} for this joint. ${best.adhesive.note}`;
  if (lowEnergy.length > 0) {
    verdict = `${lowEnergy.map((material) => material.label).join(" and ")} has a surface energy of ${lowEnergy
      .map((material) => `${material.surfaceEnergy} mN/m`)
      .join(" and ")}, below the ${LOW_SURFACE_ENERGY_THRESHOLD} mN/m an ordinary adhesive needs to wet it. Abrade and prime, or use a polyolefin-specific product. ${verdict}`;
  }

  return {
    materialA: a,
    materialB: b,
    gapMm,
    wet,
    moves,
    loadBearing,
    paintOver,
    maxTempC,
    lowEnergy,
    ranked,
    rejected,
    best,
    maxScore,
    verdict,
  };
}
