/**
 * Torque conversion and the torque-wrench extension correction.
 *
 * Everything is anchored to the newton metre:
 *
 *   1 lbf-ft  = 4.4482216152605 N x 0.3048 m = 1.3558179483314004 N-m exactly
 *               (pound-force and international foot are both exact definitions)
 *   1 lbf-in  = 1 lbf-ft / 12                = 0.11298482902761670 N-m
 *   1 kgf-m   = 9.80665 N x 1 m              = 9.80665 N-m exactly
 *               (kilogram-force uses standard gravity g0 = 9.80665 m/s2)
 *   1 kgf-cm  = 0.0980665 N-m
 *
 * Extension correction: when an adapter, crowfoot or extension bar moves the
 * socket further from the wrench handle IN LINE with the handle, the wrench
 * applies more torque at the fastener than it reads. Taking moments about the
 * fastener with a hand force F at distance (L + E):
 *
 *   T_fastener = F x (L + E)      and      T_reading = F x L
 *
 * so the setting to dial in for a target fastener torque is
 *
 *   T_setting = T_target x L / (L + E)
 *
 * L is the wrench's own effective length (pivot to the centre of the handle
 * grip). An extension at 90 degrees to the handle does not change the moment
 * arm, so no correction is needed for a plain vertical extension bar.
 */

/** 1 lbf-ft in N-m, from the exact definitions of lbf and the foot. */
export const NM_PER_LBF_FT = 1.3558179483314004;

/** 1 lbf-in = one twelfth of a lbf-ft. */
export const NM_PER_LBF_IN = NM_PER_LBF_FT / 12;

/** 1 kgf-m: kilogram-force uses standard gravity 9.80665 m/s2. */
export const NM_PER_KGF_M = 9.80665;

export const UNITS = [
  { id: "nm", label: "Newton metres (N-m)", short: "N-m", nm: 1, dp: 2 },
  { id: "lbfft", label: "Foot-pounds (lbf-ft)", short: "lbf-ft", nm: NM_PER_LBF_FT, dp: 2 },
  { id: "lbfin", label: "Inch-pounds (lbf-in)", short: "lbf-in", nm: NM_PER_LBF_IN, dp: 1 },
  { id: "kgfm", label: "Kilogram-force metres (kgf-m)", short: "kgf-m", nm: NM_PER_KGF_M, dp: 3 },
  { id: "kgfcm", label: "Kilogram-force centimetres (kgf-cm)", short: "kgf-cm", nm: NM_PER_KGF_M / 100, dp: 1 },
  { id: "ozfin", label: "Ounce-inches (ozf-in)", short: "ozf-in", nm: NM_PER_LBF_IN / 16, dp: 0 },
  { id: "dnm", label: "Decinewton metres (dN-m)", short: "dN-m", nm: 0.1, dp: 1 },
];

/** Sanity ceiling — far above any hand or workshop torque wrench. */
export const MAX_NM = 1e7;

export function unitById(id) {
  return UNITS.find((u) => u.id === id) ?? null;
}

/**
 * Wrench setting that produces a target torque at the fastener when an
 * in-line extension of length E is fitted to a wrench of effective length L.
 * Returns null if the geometry is impossible.
 */
export function extensionSetting({ targetNm, wrenchLengthMm, extensionMm }) {
  const target = Number(targetNm);
  const lever = Number(wrenchLengthMm);
  const ext = Number(extensionMm);
  if (!Number.isFinite(target) || !(lever > 0) || !Number.isFinite(ext)) return null;
  if (lever + ext <= 0) return null;
  return (target * lever) / (lever + ext);
}

/**
 * @param {object} input
 * @param {number} input.value            Torque figure entered.
 * @param {string} input.fromUnit         Unit id of that figure.
 * @param {number} [input.wrenchLengthMm] Effective wrench length, mm.
 * @param {number} [input.extensionMm]    In-line extension length, mm (0 = none).
 * @returns {object} { nm, byUnit, extension } or { error }.
 */
export function convertTorque({
  value,
  fromUnit = "nm",
  wrenchLengthMm = 450,
  extensionMm = 0,
}) {
  const qty = Number(value);
  const unit = unitById(fromUnit);
  const lever = Number(wrenchLengthMm);
  const ext = Number(extensionMm);

  if (!unit) return { error: "Choose a unit to convert from." };
  if (!Number.isFinite(qty)) return { error: "Enter a valid torque figure." };
  if (qty < 0) return { error: "Torque cannot be negative — enter the magnitude." };
  if (!Number.isFinite(lever) || !Number.isFinite(ext)) {
    return { error: "Enter valid lengths in millimetres." };
  }
  if (lever <= 0 || lever > 3000) {
    return { error: "Wrench length should be between 1 mm and 3000 mm." };
  }
  if (ext < 0 || ext > 1000) {
    return { error: "Extension length should be between 0 mm and 1000 mm." };
  }

  const nm = qty * unit.nm;
  if (nm > MAX_NM) return { error: "That torque is beyond the range this converter handles." };

  const byUnit = {};
  for (const u of UNITS) byUnit[u.id] = nm / u.nm;

  const settingNm = extensionSetting({ targetNm: nm, wrenchLengthMm: lever, extensionMm: ext });
  const extension =
    settingNm === null
      ? null
      : {
          settingNm,
          settingLbfFt: settingNm / NM_PER_LBF_FT,
          reductionNm: nm - settingNm,
          reductionPct: nm > 0 ? ((nm - settingNm) / nm) * 100 : 0,
          applies: ext > 0,
        };

  return { nm, byUnit, extension, fromUnit: unit, wrenchLengthMm: lever, extensionMm: ext };
}
