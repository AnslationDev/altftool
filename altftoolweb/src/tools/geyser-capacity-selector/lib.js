/**
 * Storage water heater (geyser) sizing from first principles.
 *
 * Nobody bathes at tank temperature. You mix stored hot water with cold until
 * it is comfortable, so the hot water actually drawn is a fraction of the bath
 * volume. Energy balance on the mix gives:
 *
 *   V_hot = V_bath x (T_bath - T_cold) / (T_tank - T_cold)
 *
 * A 20 L bucket at 40 C, from a 60 C tank with 20 C mains, therefore needs
 * only 10 L of stored hot water.
 *
 * A storage tank does not deliver its full nominal volume at temperature —
 * cold water entering at the bottom mixes with what is left as you draw, so
 * the outlet cools before the tank empties. The usable fraction before the
 * outlet drops noticeably is around 0.9 for a well-baffled vertical tank:
 *
 *   V_tank = total hot water needed in one burst / DRAWDOWN_EFFICIENCY
 *
 * Heating time and energy come straight from the heat equation, with the
 * element treated as almost fully efficient because resistive heating puts
 * essentially all its energy into the water (standing losses aside):
 *
 *   Q = m x c x dT          c = 4186 J/(kg.K), m = litres x 1 kg/L
 *   t = Q / (P x eta)
 */

/** Specific heat capacity of water near room temperature, J/(kg.K). */
export const SPECIFIC_HEAT_WATER = 4186;

/** Water density used for litres to kilograms, kg/L. */
export const WATER_DENSITY_KG_PER_L = 1;

/** Usable share of nominal tank volume before the outlet cools noticeably. */
export const DRAWDOWN_EFFICIENCY = 0.9;

/** Electric element efficiency into the water; the rest is standing loss. */
export const ELEMENT_EFFICIENCY = 0.95;

export const JOULES_PER_KWH = 3600000;

/** Storage geyser sizes sold in India, in litres (1-3 L are instant heaters). */
export const STANDARD_SIZES = [1, 3, 6, 10, 15, 25, 35];

/** Typical shower head flow rates, litres per minute. */
export const SHOWER_FLOWS = [
  { id: "low", label: "Aerated / low flow", lpm: 6 },
  { id: "normal", label: "Standard shower", lpm: 8 },
  { id: "rain", label: "Rain shower / overhead", lpm: 12 },
];

export const BATH_MODES = [
  { id: "bucket", label: "Bucket bath" },
  { id: "shower", label: "Shower" },
];

export const MIN_TEMP_C = 0;
export const MAX_TEMP_C = 100;

/** Smallest standard tank that meets the requirement, or null if none does. */
export function nextTankSize(litres) {
  return STANDARD_SIZES.find((size) => size >= litres - 1e-9) ?? null;
}

/** Litres of tank-temperature water needed to make a bath at T_bath. */
export function hotWaterForMix({ bathLitres, bathC, coldC, tankC }) {
  const spread = Number(tankC) - Number(coldC);
  if (!(spread > 0)) return null;
  const rise = Number(bathC) - Number(coldC);
  if (rise <= 0) return 0;
  return (Number(bathLitres) * rise) / spread;
}

/** Energy in kWh to raise `litres` by `deltaC`, including element efficiency. */
export function heatingEnergyKwh(litres, deltaC) {
  const joules =
    Number(litres) * WATER_DENSITY_KG_PER_L * SPECIFIC_HEAT_WATER * Number(deltaC);
  if (!Number.isFinite(joules) || joules < 0) return null;
  return joules / JOULES_PER_KWH / ELEMENT_EFFICIENCY;
}

/** Minutes for an element of `watts` to raise `litres` by `deltaC`. */
export function heatingMinutes({ litres, deltaC, watts }) {
  const w = Number(watts);
  if (!(w > 0)) return null;
  const joules = Number(litres) * WATER_DENSITY_KG_PER_L * SPECIFIC_HEAT_WATER * Number(deltaC);
  if (!Number.isFinite(joules) || joules < 0) return null;
  return joules / (w * ELEMENT_EFFICIENCY) / 60;
}

/** How many baths one full tank gives, given the hot litres each bath draws. */
export function bathsPerTank({ tankLitres, hotPerBath }) {
  const hot = Number(hotPerBath);
  if (!(hot > 0)) return null;
  return (Number(tankLitres) * DRAWDOWN_EFFICIENCY) / hot;
}

/**
 * @param {object} input
 * @param {string} input.mode          "bucket" or "shower".
 * @param {number} input.bucketLitres  Litres in one bucket.
 * @param {number} input.buckets       Buckets one person uses.
 * @param {number} input.showerMinutes Minutes one person showers.
 * @param {number} input.flowLpm       Shower flow, litres per minute.
 * @param {number} input.usersInBurst  People bathing back to back.
 * @param {number} input.bathC         Comfortable bathing temperature.
 * @param {number} input.coldC         Mains inlet temperature.
 * @param {number} input.tankC         Thermostat setting.
 * @param {number} input.elementWatts  Heating element rating.
 * @param {number} [input.tariff]      Electricity price per kWh.
 * @returns {object} sizing breakdown or { error }.
 */
export function selectGeyser({
  mode = "bucket",
  bucketLitres = 20,
  buckets = 1,
  showerMinutes = 8,
  flowLpm = 8,
  usersInBurst = 2,
  bathC = 40,
  coldC = 20,
  tankC = 60,
  elementWatts = 2000,
  tariff = 0,
}) {
  const bucketL = Number(bucketLitres);
  const bucketCount = Number(buckets);
  const minutes = Number(showerMinutes);
  const flow = Number(flowLpm);
  const users = Number(usersInBurst);
  const bath = Number(bathC);
  const cold = Number(coldC);
  const tank = Number(tankC);
  const watts = Number(elementWatts);
  const rate = Number(tariff);

  if (
    ![bucketL, bucketCount, minutes, flow, users, bath, cold, tank, watts, rate].every((n) =>
      Number.isFinite(n),
    )
  ) {
    return { error: "Enter valid numbers in every field." };
  }
  if (!BATH_MODES.some((m) => m.id === mode)) return { error: "Choose bucket bath or shower." };
  if (!(users >= 1)) return { error: "At least one person has to bathe." };
  if (users > 12) return { error: "This model covers up to 12 people bathing back to back." };
  if (mode === "bucket" && (!(bucketL > 0) || bucketL > 50)) {
    return { error: "Bucket size should be between 1 and 50 litres." };
  }
  if (mode === "bucket" && (!(bucketCount > 0) || bucketCount > 10)) {
    return { error: "Buckets per person should be between 1 and 10." };
  }
  if (mode === "shower" && (!(minutes > 0) || minutes > 60)) {
    return { error: "Shower time should be between 1 and 60 minutes." };
  }
  if (mode === "shower" && (!(flow > 0) || flow > 30)) {
    return { error: "Shower flow should be between 1 and 30 litres a minute." };
  }
  if ([bath, cold, tank].some((t) => t < MIN_TEMP_C || t > MAX_TEMP_C)) {
    return { error: `Temperatures must be between ${MIN_TEMP_C} and ${MAX_TEMP_C} C.` };
  }
  if (tank <= cold) return { error: "The tank has to be hotter than the incoming mains water." };
  if (bath <= cold) {
    return { error: "Your bathing temperature is at or below the mains temperature — no heating needed." };
  }
  if (bath >= tank) {
    return { error: "Set the thermostat above your bathing temperature, or there is nothing to mix with." };
  }
  if (!(watts >= 500) || watts > 10000) {
    return { error: "Element rating should be between 500 W and 10,000 W." };
  }
  if (rate < 0) return { error: "Electricity tariff cannot be negative." };

  const bathLitresPerPerson = mode === "bucket" ? bucketL * bucketCount : minutes * flow;
  const hotPerPerson = hotWaterForMix({
    bathLitres: bathLitresPerPerson,
    bathC: bath,
    coldC: cold,
    tankC: tank,
  });
  const totalHot = hotPerPerson * users;
  const requiredTank = totalHot / DRAWDOWN_EFFICIENCY;

  const largest = STANDARD_SIZES[STANDARD_SIZES.length - 1];
  const match = nextTankSize(requiredTank);
  const recommended = match ?? largest;
  const exceedsCatalogue = match === null;

  const deltaT = tank - cold;
  const energyKwh = heatingEnergyKwh(recommended, deltaT);
  const heatMinutes = heatingMinutes({ litres: recommended, deltaC: deltaT, watts });

  // How many people the recommended tank actually serves in one burst.
  const servesUsers = hotPerPerson > 0
    ? Math.floor((recommended * DRAWDOWN_EFFICIENCY) / hotPerPerson)
    : 0;

  return {
    bathLitresPerPerson,
    hotPerPerson,
    totalHot,
    requiredTank,
    recommended,
    exceedsCatalogue,
    deltaT,
    energyKwh,
    heatMinutes,
    costPerHeat: rate > 0 ? energyKwh * rate : 0,
    servesUsers,
    coldMixedIn: bathLitresPerPerson - hotPerPerson,
    hotSharePct: bathLitresPerPerson > 0 ? (hotPerPerson / bathLitresPerPerson) * 100 : 0,
    tanksNeeded: exceedsCatalogue ? Math.ceil(requiredTank / largest) : 1,
  };
}
