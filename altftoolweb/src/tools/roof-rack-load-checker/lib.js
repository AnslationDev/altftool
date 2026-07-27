/**
 * Roof rack load check: what you are allowed to carry, and what it does to the
 * vehicle.
 *
 * THE BINDING LIMIT. Two separate ratings apply and the lower one wins:
 *
 *   - the vehicle's dynamic roof load, published in the owner's handbook, which
 *     is the maximum mass on the roof while the vehicle is moving;
 *   - the rack or bar system's own rated load, published by the rack maker.
 *
 * Crucially the rack itself counts against that limit, as does a roof box or a
 * bike carrier, so:
 *
 *   available for cargo = min(vehicle limit, rack limit) - rack - accessories
 *
 * The static roof load, which applies only when parked, is much higher and is
 * the figure a roof tent is assessed against. It is never a substitute for the
 * dynamic figure while driving, and it must come from the manufacturer rather
 * than be assumed from a multiple.
 *
 * PAYLOAD. Roof load is part of the vehicle's payload, not extra to it, so it
 * also has to fit inside gross vehicle mass:
 *
 *   kerb weight + occupants + interior load + roof load <= gross vehicle mass
 *
 * CENTRE OF GRAVITY AND ROLLOVER. Adding mass on the roof raises the combined
 * centre of gravity, which is a mass-weighted average of the two heights:
 *
 *   h = (m_vehicle x h_vehicle + m_roof x h_roof) / (m_vehicle + m_roof)
 *
 * The standard measure of rollover resistance is NHTSA's Static Stability
 * Factor:
 *
 *   SSF = track width / (2 x centre of gravity height)
 *
 * NHTSA's published rollover star bands are SSF >= 1.45 for five stars,
 * 1.25-1.44 for four, 1.13-1.24 for three, 1.04-1.12 for two and below 1.04
 * for one. A modest roof load can move a vehicle a whole band.
 *
 * AERODYNAMIC PENALTY. Drag force is 0.5 x air density x CdA x speed squared,
 * so the extra work done over a distance d by an added frontal area is
 * 0.5 x rho x deltaCdA x v^2 x d. Dividing by the fuel's energy content and the
 * drivetrain efficiency gives the extra fuel. The deltaCdA values below are
 * typical rather than measured for your specific box, so treat the result as
 * indicative.
 */

/** ISA air density at sea level and 15 °C, kg/m³. */
export const AIR_DENSITY = 1.225;

/** Lower heating value of petrol, MJ per litre. */
export const PETROL_MJ_PER_LITRE = 34.2;

/** Typical tank-to-wheel efficiency of a petrol car at steady highway speed. */
export const DRIVETRAIN_EFFICIENCY = 0.25;

/** NHTSA Static Stability Factor bands for the rollover star rating. */
export const SSF_BANDS = [
  { min: 1.45, stars: 5, label: "Five-star band", note: "Among the most rollover-resistant passenger vehicles." },
  { min: 1.25, stars: 4, label: "Four-star band", note: "Typical of a saloon or estate car." },
  { min: 1.13, stars: 3, label: "Three-star band", note: "Typical of a crossover or small SUV." },
  { min: 1.04, stars: 2, label: "Two-star band", note: "Typical of a tall SUV or a van. Load height matters here." },
  { min: 0, stars: 1, label: "One-star band", note: "The least rollover-resistant band in NHTSA's scale." },
];

/**
 * Typical additional CdA for common roof loads, in square metres. These are
 * representative figures for planning, not measurements of a specific product.
 */
export const ACCESSORY_TYPES = [
  { id: "none", label: "Bare roof bars only", deltaCdA: 0.08, weight: 0, note: "Even empty bars cost fuel. Take them off when they are not in use." },
  { id: "box-small", label: "Small roof box (300–400 L)", deltaCdA: 0.22, weight: 14, note: "The lowest-drag way to carry soft luggage on a roof." },
  { id: "box-large", label: "Large roof box (500–600 L)", deltaCdA: 0.3, weight: 20, note: "Mount it as far forward as the bars allow, without blocking the tailgate." },
  { id: "bikes-2", label: "Two upright bike carriers", deltaCdA: 0.45, weight: 8, note: "Bikes upright on the roof are the worst case for both drag and height." },
  { id: "kayak", label: "Kayak or board carrier", deltaCdA: 0.15, weight: 6, note: "Low drag for its size, but check the overhang rules where you are driving." },
  { id: "tent", label: "Roof tent (folded)", deltaCdA: 0.55, weight: 55, note: "Assessed against the static roof load when pitched and the dynamic one when driving." },
  { id: "custom", label: "Something else", deltaCdA: 0.25, weight: 0, note: "Enter the weight from the product label and adjust the drag area if you know it." },
];

/** Sanity ceilings so a typo cannot produce a confident-looking wrong answer. */
export const MAX_ROOF_LIMIT_KG = 500;
export const MAX_VEHICLE_MASS_KG = 7500;

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
};

/** NHTSA band for a Static Stability Factor. */
export function ssfBand(ssf) {
  if (!Number.isFinite(ssf) || ssf <= 0) return null;
  return SSF_BANDS.find((band) => ssf >= band.min) || SSF_BANDS[SSF_BANDS.length - 1];
}

/**
 * Static Stability Factor: half the track width divided by the centre of
 * gravity height. Both in the same unit.
 */
export function staticStabilityFactor(trackWidth, cogHeight) {
  const t = num(trackWidth);
  const h = num(cogHeight);
  if (!Number.isFinite(t) || !Number.isFinite(h) || t <= 0 || h <= 0) return null;
  return t / (2 * h);
}

/**
 * Mass-weighted combined centre of gravity height for two masses at two
 * heights, in the unit the heights are given in.
 */
export function combinedCogHeight(massA, heightA, massB, heightB) {
  const total = massA + massB;
  if (!Number.isFinite(total) || total <= 0) return null;
  return (massA * heightA + massB * heightB) / total;
}

/**
 * Extra fuel burnt per 100 km by an added frontal area at a steady speed.
 *
 * @param {number} deltaCdA     added drag area, m²
 * @param {number} speedKmh     steady cruising speed
 * @param {number} [efficiency] tank-to-wheel efficiency
 * @returns {number|null} litres per 100 km
 */
export function extraFuelPer100Km(deltaCdA, speedKmh, efficiency = DRIVETRAIN_EFFICIENCY) {
  const cda = num(deltaCdA);
  const v = num(speedKmh) / 3.6;
  const eff = num(efficiency);
  if (!Number.isFinite(cda) || cda < 0) return null;
  if (!Number.isFinite(v) || v <= 0) return null;
  if (!Number.isFinite(eff) || eff <= 0 || eff > 1) return null;
  const dragForce = 0.5 * AIR_DENSITY * cda * v * v; // newtons
  const workJoules = dragForce * 100000; // over 100 km
  return workJoules / (PETROL_MJ_PER_LITRE * 1e6 * eff);
}

/**
 * Full roof load check.
 *
 * @param {object} input all masses in kg, all lengths in mm, speed in km/h
 * @returns {object} { error } or the check
 */
export function checkRoofLoad({
  vehicleRoofLimit,
  rackRatedLoad,
  rackWeight,
  accessoryType = "box-large",
  accessoryWeight,
  cargoWeight,
  kerbWeight,
  grossVehicleMass,
  occupantsWeight = 0,
  interiorLoad = 0,
  trackWidth,
  cogHeight,
  roofLoadHeight,
  cruiseSpeed = 100,
  deltaCdA,
} = {}) {
  const accessory = ACCESSORY_TYPES.find((a) => a.id === accessoryType) || ACCESSORY_TYPES[2];

  const roofLimit = num(vehicleRoofLimit);
  if (!Number.isFinite(roofLimit) || roofLimit <= 0) {
    return { error: "Enter the vehicle's dynamic roof load from the owner's handbook, in kilograms." };
  }
  if (roofLimit > MAX_ROOF_LIMIT_KG) {
    return { error: `A dynamic roof load above ${MAX_ROOF_LIMIT_KG} kg is not a passenger vehicle figure — check the handbook value.` };
  }

  const rackLimit = rackRatedLoad === "" || rackRatedLoad === undefined || rackRatedLoad === null
    ? Infinity
    : num(rackRatedLoad);
  if (!Number.isFinite(rackLimit) && rackLimit !== Infinity) {
    return { error: "The rack's rated load has to be a number in kilograms, or left blank." };
  }
  if (rackLimit !== Infinity && rackLimit <= 0) {
    return { error: "The rack's rated load has to be greater than zero." };
  }

  const rack = num(rackWeight);
  const extras = num(accessoryWeight);
  const cargo = num(cargoWeight);
  for (const [value, name] of [[rack, "rack weight"], [extras, "accessory weight"], [cargo, "cargo weight"]]) {
    if (!Number.isFinite(value) || value < 0) {
      return { error: `The ${name} has to be zero or more kilograms.` };
    }
  }

  const bindingLimit = Math.min(roofLimit, rackLimit);
  const bindingSource = rackLimit < roofLimit ? "the rack system" : "the vehicle";
  const onRoof = rack + extras + cargo;
  const overhead = rack + extras;
  const cargoAllowance = bindingLimit - overhead;
  const remaining = bindingLimit - onRoof;
  const withinLimit = remaining >= 0;
  const utilisation = bindingLimit > 0 ? (onRoof / bindingLimit) * 100 : null;

  // Payload check, only if the vehicle masses were supplied.
  const kerb = num(kerbWeight);
  const gvm = num(grossVehicleMass);
  const people = num(occupantsWeight) || 0;
  const inside = num(interiorLoad) || 0;
  let payload = null;
  if (Number.isFinite(kerb) && Number.isFinite(gvm) && kerb > 0 && gvm > 0) {
    if (kerb > MAX_VEHICLE_MASS_KG || gvm > MAX_VEHICLE_MASS_KG) {
      return { error: `Kerb weight and gross vehicle mass above ${MAX_VEHICLE_MASS_KG} kg are outside the range this check covers.` };
    }
    if (gvm <= kerb) {
      return { error: "Gross vehicle mass has to be greater than kerb weight — check both figures on the VIN plate." };
    }
    const capacity = gvm - kerb;
    const used = people + inside + onRoof;
    payload = {
      capacity: round(capacity),
      used: round(used),
      remaining: round(capacity - used),
      withinLimit: used <= capacity,
      utilisation: round((used / capacity) * 100, 1),
      laden: round(kerb + used),
      gvm: round(gvm),
    };
  }

  // Stability, only if the geometry was supplied.
  const track = num(trackWidth);
  const baseCog = num(cogHeight);
  const loadHeight = num(roofLoadHeight);
  let stability = null;
  if (
    Number.isFinite(track) && track > 0 &&
    Number.isFinite(baseCog) && baseCog > 0 &&
    Number.isFinite(loadHeight) && loadHeight > 0 &&
    Number.isFinite(kerb) && kerb > 0
  ) {
    if (loadHeight <= baseCog) {
      return { error: "The roof load sits above the vehicle's centre of gravity — the load height should be greater than the centre of gravity height." };
    }
    const ladenBase = kerb + people + inside;
    const beforeSsf = staticStabilityFactor(track, baseCog);
    const newCog = combinedCogHeight(ladenBase, baseCog, onRoof, loadHeight);
    const afterSsf = staticStabilityFactor(track, newCog);
    const beforeBand = ssfBand(beforeSsf);
    const afterBand = ssfBand(afterSsf);
    stability = {
      trackWidth: round(track),
      baseCog: round(baseCog),
      loadedCog: round(newCog, 1),
      cogRise: round(newCog - baseCog, 1),
      beforeSsf: round(beforeSsf, 3),
      afterSsf: round(afterSsf, 3),
      ssfDrop: round(beforeSsf - afterSsf, 3),
      ssfDropPercent: round(((beforeSsf - afterSsf) / beforeSsf) * 100, 1),
      beforeStars: beforeBand.stars,
      afterStars: afterBand.stars,
      afterLabel: afterBand.label,
      afterNote: afterBand.note,
      bandDropped: afterBand.stars < beforeBand.stars,
    };
  }

  // Aerodynamic penalty.
  const cda = deltaCdA === "" || deltaCdA === undefined || deltaCdA === null
    ? accessory.deltaCdA
    : num(deltaCdA);
  const speed = num(cruiseSpeed);
  let drag = null;
  if (Number.isFinite(cda) && cda >= 0 && Number.isFinite(speed) && speed > 0) {
    const litres = extraFuelPer100Km(cda, speed);
    if (litres !== null) {
      drag = {
        deltaCdA: round(cda, 3),
        speed: round(speed),
        dragForce: round(0.5 * AIR_DENSITY * cda * (speed / 3.6) ** 2, 1),
        litresPer100Km: round(litres, 2),
      };
    }
  }

  const warnings = [];
  if (!withinLimit) {
    warnings.push(
      `The roof is ${round(Math.abs(remaining), 1)} kg over the ${round(bindingLimit)} kg limit set by ${bindingSource}. Move that weight inside the vehicle before driving.`,
    );
  } else if (utilisation !== null && utilisation > 90) {
    warnings.push(
      `The roof is at ${round(utilisation)}% of its limit, which leaves nothing for a wet tent, a snow-covered box or a heavier bike than planned. Weigh the load rather than estimating it.`,
    );
  }
  if (payload && !payload.withinLimit) {
    warnings.push(
      `Total laden mass of ${payload.laden} kg exceeds the ${payload.gvm} kg gross vehicle mass by ${Math.abs(payload.remaining)} kg. Roof load counts as payload, not as extra to it.`,
    );
  }
  if (stability && stability.bandDropped) {
    warnings.push(
      `The load drops the Static Stability Factor from ${stability.beforeSsf} to ${stability.afterSsf}, moving the vehicle from NHTSA's ${stability.beforeStars}-star rollover band to the ${stability.afterStars}-star band. Reduce speed, especially in crosswinds and on sudden lane changes.`,
    );
  }
  if (accessory.id === "tent") {
    warnings.push(
      "A roof tent is only assessed against the static roof load once pitched. While driving, the dynamic figure above is the one that applies, and it is usually far lower than the tent's own rating suggests.",
    );
  }

  return {
    vehicleRoofLimit: round(roofLimit),
    rackRatedLoad: rackLimit === Infinity ? null : round(rackLimit),
    bindingLimit: round(bindingLimit),
    bindingSource,
    rackWeight: round(rack, 1),
    accessoryWeight: round(extras, 1),
    accessoryLabel: accessory.label,
    accessoryNote: accessory.note,
    cargoWeight: round(cargo, 1),
    overhead: round(overhead, 1),
    onRoof: round(onRoof, 1),
    cargoAllowance: round(cargoAllowance, 1),
    remaining: round(remaining, 1),
    withinLimit,
    utilisation: utilisation === null ? null : round(utilisation, 1),
    payload,
    stability,
    drag,
    warnings,
  };
}
