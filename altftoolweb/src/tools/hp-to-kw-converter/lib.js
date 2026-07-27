/**
 * Power unit conversion.
 *
 * Every unit is defined by how many watts it is worth, so conversion is
 * simply:  watts = value x wattsPerUnit,  then  target = watts / wattsPerUnit.
 *
 * The definitions are exact, not approximations:
 *
 *  - Mechanical horsepower = 550 ft.lbf/s. With 1 ft = 0.3048 m and
 *    1 lbf = 4.4482216152605 N, that is exactly 745.6998715822702 W.
 *  - Metric horsepower (PS, cv, ch, pk) = 75 kgf.m/s. With standard gravity
 *    9.80665 m/s², that is exactly 735.49875 W.
 *  - Electrical horsepower is defined as exactly 746 W, and is what US electric
 *    motor nameplates use.
 *  - Boiler horsepower is 33,475 BTU/h, the heat to evaporate 34.5 lb of water
 *    per hour at 212 °F.
 *  - 1 BTU (International Table) = 1055.05585262 J, so 1 BTU/h = 0.29307107 W.
 *
 * "Brake horsepower" is NOT a separate unit. It is mechanical horsepower
 * measured at the crankshaft on a brake dynamometer, as opposed to wheel
 * horsepower measured at the tyres. The number differs because of where it is
 * measured, which is what the drivetrain-loss section handles.
 */

/** 1 foot = 0.3048 m exactly. */
export const M_PER_FT = 0.3048;
/** 1 pound-force = 4.4482216152605 N exactly. */
export const N_PER_LBF = 4.4482216152605;
/** Standard gravity, m/s². */
export const STANDARD_GRAVITY = 9.80665;
/** 1 BTU (IT) = 1055.05585262 J exactly. */
export const JOULES_PER_BTU = 1055.05585262;
/** Boiler horsepower is defined as 33,475 BTU/h. */
export const BOILER_HP_BTU_PER_HOUR = 33475;

/** 1 ft.lbf = 1.3558179483314004 J. */
export const WATTS_PER_FT_LBF_PER_S = M_PER_FT * N_PER_LBF;
/** 1 BTU/h in watts. */
export const WATTS_PER_BTU_PER_HOUR = JOULES_PER_BTU / 3600;
/** Mechanical horsepower = 550 ft.lbf/s. */
export const WATTS_PER_MECHANICAL_HP = 550 * WATTS_PER_FT_LBF_PER_S;
/** Metric horsepower = 75 kgf.m/s. */
export const WATTS_PER_METRIC_HP = 75 * STANDARD_GRAVITY;

/** Ordered so the result table reads from the units people actually compare. */
export const UNITS = [
  {
    key: "kw",
    label: "Kilowatts (kW)",
    short: "kW",
    watts: 1000,
    note: "SI unit; European vehicle registration documents quote this.",
  },
  {
    key: "hp",
    label: "Mechanical horsepower (hp / bhp)",
    short: "hp",
    watts: WATTS_PER_MECHANICAL_HP,
    note: "550 ft·lbf/s. Brake horsepower is this same unit measured at the crank.",
  },
  {
    key: "ps",
    label: "Metric horsepower (PS / cv / ch / pk)",
    short: "PS",
    watts: WATTS_PER_METRIC_HP,
    note: "75 kgf·m/s. German, Japanese and Italian figures usually mean this.",
  },
  {
    key: "w",
    label: "Watts (W)",
    short: "W",
    watts: 1,
    note: "The base SI unit of power.",
  },
  {
    key: "ehp",
    label: "Electrical horsepower",
    short: "ehp",
    watts: 746,
    note: "Defined as exactly 746 W; used on US electric motor nameplates.",
  },
  {
    key: "btuh",
    label: "BTU per hour (BTU/h)",
    short: "BTU/h",
    watts: WATTS_PER_BTU_PER_HOUR,
    note: "Heating and cooling equipment ratings.",
  },
  {
    key: "ftlbfs",
    label: "Foot-pounds per second (ft·lbf/s)",
    short: "ft·lbf/s",
    watts: WATTS_PER_FT_LBF_PER_S,
    note: "The mechanical definition horsepower is built from.",
  },
  {
    key: "kgfms",
    label: "Kilogram-force metres per second (kgf·m/s)",
    short: "kgf·m/s",
    watts: STANDARD_GRAVITY,
    note: "The metric definition PS is built from.",
  },
  {
    key: "bhpBoiler",
    label: "Boiler horsepower",
    short: "bhp (boiler)",
    watts: BOILER_HP_BTU_PER_HOUR * WATTS_PER_BTU_PER_HOUR,
    note: "33,475 BTU/h — a steam raising rating, unrelated to engine power.",
  },
];

export const UNIT_MAP = Object.fromEntries(UNITS.map((unit) => [unit.key, unit]));

/**
 * Typical drivetrain losses between the crankshaft and the tyres. These are
 * rules of thumb from chassis-dynamometer practice, not measured constants —
 * real losses vary with gearing, tyres, temperature and dyno type.
 */
export const DRIVETRAINS = {
  none: { key: "none", label: "No drivetrain loss (crank figure)", lossPct: 0 },
  fwdManual: { key: "fwdManual", label: "Front-wheel drive, manual", lossPct: 10 },
  fwdAuto: { key: "fwdAuto", label: "Front-wheel drive, automatic", lossPct: 13 },
  rwdManual: { key: "rwdManual", label: "Rear-wheel drive, manual", lossPct: 15 },
  rwdAuto: { key: "rwdAuto", label: "Rear-wheel drive, automatic", lossPct: 18 },
  awdManual: { key: "awdManual", label: "All-wheel drive, manual", lossPct: 22 },
  awdAuto: { key: "awdAuto", label: "All-wheel drive, automatic", lossPct: 25 },
};

/** Sanity ceiling — 1 TW is far beyond any engine or motor. */
export const MAX_WATTS = 1e12;

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Convert a power value into every supported unit.
 *
 * @param {object} input
 * @param {number|string} input.value    the power figure
 * @param {string} input.unit            key of UNIT_MAP
 * @param {string} [input.drivetrain]    key of DRIVETRAINS
 * @param {number|string} [input.weight] vehicle weight, for power-to-weight
 * @param {"kg"|"lb"} [input.weightUnit]
 * @returns {object} conversion result, or { error } for invalid input
 */
export function convertPower({
  value,
  unit = "hp",
  drivetrain = "none",
  weight = 0,
  weightUnit = "kg",
}) {
  const source = UNIT_MAP[unit];
  if (!source) return { error: "Choose one of the listed power units." };

  const drive = DRIVETRAINS[drivetrain];
  if (!drive) return { error: "Choose one of the listed drivetrain options." };

  const raw = toNumber(value);
  if (Number.isNaN(raw)) return { error: "Enter the power as a number." };
  if (raw < 0) return { error: "Power cannot be negative." };

  const watts = raw * source.watts;
  if (watts > MAX_WATTS) {
    return { error: "That is above 1 terawatt — check the value and the unit." };
  }

  const conversions = UNITS.map((target) => ({
    key: target.key,
    label: target.label,
    short: target.short,
    note: target.note,
    value: watts / target.watts,
    isSource: target.key === source.key,
  }));

  // Crank <-> wheel. The input is treated as the crank figure.
  const remaining = 1 - drive.lossPct / 100;
  const wheelWatts = watts * remaining;
  const lostWatts = watts - wheelWatts;

  let powerToWeight = null;
  const weightRaw = toNumber(weight);
  if (!Number.isNaN(weightRaw) && weightRaw > 0) {
    const kg = weightUnit === "lb" ? weightRaw * 0.45359237 : weightRaw;
    const tonnes = kg / 1000;
    powerToWeight = {
      kg: kg,
      hpPerTonne: watts / WATTS_PER_MECHANICAL_HP / tonnes,
      kwPerTonne: watts / 1000 / tonnes,
      psPerTonne: watts / WATTS_PER_METRIC_HP / tonnes,
      wattsPerKg: watts / kg,
    };
  }

  return {
    sourceLabel: source.label,
    sourceShort: source.short,
    watts,
    conversions,
    drivetrainLabel: drive.label,
    lossPct: drive.lossPct,
    crankHp: watts / WATTS_PER_MECHANICAL_HP,
    crankKw: watts / 1000,
    wheelHp: wheelWatts / WATTS_PER_MECHANICAL_HP,
    wheelKw: wheelWatts / 1000,
    wheelPs: wheelWatts / WATTS_PER_METRIC_HP,
    lostHp: lostWatts / WATTS_PER_MECHANICAL_HP,
    lostKw: lostWatts / 1000,
    powerToWeight,
  };
}
