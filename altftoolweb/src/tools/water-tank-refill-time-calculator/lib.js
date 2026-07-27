/**
 * Water tank refill time and pumping energy.
 *
 * FILL TIME — a volume balance: the time to fill is the volume still missing
 * divided by the net rate at which water enters, where the net rate is the
 * pump discharge minus any water being drawn off taps at the same time.
 *
 * PUMPING ENERGY — the standard hydraulic power equation
 *     P_hydraulic (W) = rho * g * Q * H
 * with rho = 998 kg/m3 (density of water at 20 degrees C), g = 9.80665 m/s2
 * (standard gravity), Q in m3/s and H the total head in metres. The electrical
 * input is that hydraulic power divided by the wire-to-water efficiency of the
 * motor and pump together, which for a domestic monoblock is typically
 * 40-60 percent. Energy is input power multiplied by the running time.
 *
 * Total head is the static lift (sump water level to tank inlet) plus friction
 * losses in the pipe; a rule of thumb used by pump dealers is to add about
 * 10 percent of the static lift for a short, correctly sized domestic line.
 */

/** Density of fresh water at 20 degrees C, kg/m3. */
export const WATER_DENSITY_KG_PER_M3 = 998;

/** Standard gravity, m/s2 (CGPM definition). */
export const GRAVITY_M_PER_S2 = 9.80665;

/** 1 m3 = 1000 L, so 1 L/min = 1/60000 m3/s. */
export const LPM_TO_M3_PER_S = 1 / 60000;

/** 1 metric horsepower = 735.49875 W (exact by definition). */
export const WATT_PER_METRIC_HP = 735.49875;

/** Typical discharge of common domestic pumps, litres per minute. */
export const PUMP_PRESETS = [
  { id: "hp-half", label: "0.5 HP monoblock", lpm: 30, head: 12 },
  { id: "hp-1", label: "1 HP monoblock", lpm: 60, head: 20 },
  { id: "hp-1-submersible", label: "1 HP borewell submersible", lpm: 45, head: 45 },
  { id: "mains", label: "Direct municipal line", lpm: 15, head: 0 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Whole hours and minutes from a decimal number of minutes. */
export function splitMinutes(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return { hours: 0, minutes: 0 };
  const rounded = Math.round(totalMinutes);
  return { hours: Math.floor(rounded / 60), minutes: rounded % 60 };
}

/**
 * @param {object} input
 * @param {number} input.capacityLitres    total tank capacity
 * @param {number} input.currentLevelPct   how full the tank is right now (0-100)
 * @param {number} input.pumpFlowLpm       pump discharge, litres per minute
 * @param {number} input.drawLpm           water drawn off taps while filling
 * @param {number} input.totalHeadM        static lift plus friction losses
 * @param {number} input.efficiencyPct     wire-to-water efficiency, percent
 * @param {number} input.tariffPerKwh      electricity tariff in currency/kWh
 */
export function computeRefill({
  capacityLitres,
  currentLevelPct,
  pumpFlowLpm,
  drawLpm = 0,
  totalHeadM,
  efficiencyPct,
  tariffPerKwh = 0,
}) {
  const values = [
    capacityLitres,
    currentLevelPct,
    pumpFlowLpm,
    drawLpm,
    totalHeadM,
    efficiencyPct,
    tariffPerKwh,
  ];
  if (!values.every(isNum)) return { error: "Enter a valid number in every field." };
  if (capacityLitres <= 0) return { error: "Tank capacity must be greater than zero." };
  if (capacityLitres > 5_000_000) return { error: "Enter a tank capacity of 5,000,000 litres or less." };
  if (currentLevelPct < 0 || currentLevelPct > 100) {
    return { error: "Current level must be between 0% and 100%." };
  }
  if (pumpFlowLpm <= 0) return { error: "Pump flow rate must be greater than zero." };
  if (drawLpm < 0) return { error: "Simultaneous draw cannot be negative." };
  if (totalHeadM < 0) return { error: "Total head cannot be negative." };
  if (totalHeadM > 500) return { error: "A total head above 500 m is outside domestic pumping." };
  if (efficiencyPct <= 0 || efficiencyPct > 100) {
    return { error: "Pump efficiency must be between 1% and 100%." };
  }
  if (tariffPerKwh < 0) return { error: "Electricity tariff cannot be negative." };

  const netFlowLpm = pumpFlowLpm - drawLpm;
  if (netFlowLpm <= 0) {
    return {
      error: "Taps are drawing at least as fast as the pump delivers, so the tank will never fill.",
    };
  }

  const litresToFill = capacityLitres * (1 - currentLevelPct / 100);
  const minutesToFill = litresToFill / netFlowLpm;
  const hoursToFill = minutesToFill / 60;

  // Hydraulic power delivered to the water at the pump's own discharge rate.
  const flowM3PerS = pumpFlowLpm * LPM_TO_M3_PER_S;
  const hydraulicWatts = WATER_DENSITY_KG_PER_M3 * GRAVITY_M_PER_S2 * flowM3PerS * totalHeadM;
  const inputWatts = hydraulicWatts / (efficiencyPct / 100);

  const energyKwh = (inputWatts / 1000) * hoursToFill;
  const cost = energyKwh * tariffPerKwh;

  const litresDrawnWhileFilling = drawLpm * minutesToFill;
  const litresPumped = pumpFlowLpm * minutesToFill;

  const notes = [];
  if (totalHeadM === 0) {
    notes.push("With zero head the energy figures are zero — set the lift from sump to tank inlet.");
  }
  if (efficiencyPct > 75) {
    notes.push(
      "Domestic monoblock pumps rarely exceed about 60% wire-to-water efficiency, so this cost may be optimistic.",
    );
  }
  if (minutesToFill > 240) {
    notes.push("A fill taking over four hours usually means the pump is undersized for the tank.");
  }

  return {
    litresToFill,
    netFlowLpm,
    minutesToFill,
    hoursToFill,
    ...splitMinutes(minutesToFill),
    litresPerHour: netFlowLpm * 60,
    hydraulicWatts,
    inputWatts,
    inputHp: inputWatts / WATT_PER_METRIC_HP,
    energyKwh,
    cost,
    litresDrawnWhileFilling,
    litresPumped,
    notes,
  };
}
