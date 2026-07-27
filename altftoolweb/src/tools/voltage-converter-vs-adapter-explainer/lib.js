/**
 * Voltage converter versus plug adapter.
 *
 * The two devices do completely different jobs and are routinely confused:
 *
 *   - A PLUG ADAPTER only changes the shape of the pins. It passes the mains
 *     through untouched. It is needed when the socket shape differs, and it is
 *     never enough on its own if the voltage differs.
 *   - A VOLTAGE CONVERTER or TRANSFORMER changes the voltage. It is needed when
 *     the appliance cannot accept the destination voltage.
 *
 * Neither changes the frequency. A 50 Hz supply stays 50 Hz through both.
 *
 * The rule that settles it is printed on the appliance: the input voltage
 * range. "INPUT: 100-240V ~ 50/60Hz" is a dual-voltage switch-mode supply and
 * needs nothing but a shape adapter anywhere in the world. "INPUT: 120V 60Hz"
 * is single voltage and will be destroyed on a 230 V supply.
 *
 * Two kinds of converter exist and they are not interchangeable:
 *
 *   - A solid-state "travel converter" chops the waveform with a triac or
 *     diode, delivering a rough half-wave whose RMS is roughly half the input.
 *     It suits a pure resistive heating element only, and its rating is
 *     normally a short-duty one (commonly a quarter of an hour or so).
 *   - A wound TRANSFORMER delivers a genuine sine wave and is the only safe
 *     option for electronics, motors and anything left running.
 *
 * Sizing uses the standard headroom rule of thumb: resistive loads need about
 * a quarter more capacity than nameplate, switch-mode electronics about half
 * again to cover inrush and poor power factor, and motors or compressors
 * around three times nameplate because locked-rotor starting current is several
 * times running current.
 */

/** Headroom multipliers applied to nameplate watts to size a converter. */
export const RESISTIVE_HEADROOM = 1.25;
export const ELECTRONIC_HEADROOM = 1.5;
export const MOTOR_HEADROOM = 3;

export const DEVICE_CLASSES = [
  {
    id: "electronic",
    label: "Electronics (laptop, camera, router, TV, medical device)",
    headroom: ELECTRONIC_HEADROOM,
    chopperSafe: false,
    note: "Switch-mode and linear supplies need a clean sine wave. A chopping travel converter can damage them.",
  },
  {
    id: "resistive",
    label: "Pure heating element (kettle, iron, hair dryer on hot, travel heater)",
    headroom: RESISTIVE_HEADROOM,
    chopperSafe: true,
    note: "A bare element does not care about waveform shape, only RMS voltage, so a chopping converter works for short runs.",
  },
  {
    id: "motor",
    label: "Motor or compressor (fan, blender, shaver, mini fridge, hair dryer with a fan)",
    headroom: MOTOR_HEADROOM,
    chopperSafe: false,
    note: "Starting current is several times running current, and motor speed follows the supply frequency.",
  },
];

/** Nominal mains around the world, for the destination picker. */
export const COMMON_MAINS = [
  { id: "eu230", label: "Europe, India, most of Africa and Asia", voltageV: 230, frequencyHz: 50 },
  { id: "uk230", label: "United Kingdom and Ireland", voltageV: 230, frequencyHz: 50 },
  { id: "ar220", label: "Argentina, Chile, Vietnam", voltageV: 220, frequencyHz: 50 },
  { id: "br127", label: "Brazil (much of the country)", voltageV: 127, frequencyHz: 60 },
  { id: "us120", label: "United States, Canada, Mexico", voltageV: 120, frequencyHz: 60 },
  { id: "jp100", label: "Japan", voltageV: 100, frequencyHz: 50 },
  { id: "kr220", label: "South Korea, Philippines (220 V areas)", voltageV: 220, frequencyHz: 60 },
  { id: "au230", label: "Australia and New Zealand", voltageV: 230, frequencyHz: 50 },
];

/** A single-voltage load beyond this is impractical to carry a transformer for. */
export const CARRY_LIMIT_W = 500;

const MAX_REASONABLE_WATTS = 20000;
const MAX_REASONABLE_VOLTS = 1000;

export function findDeviceClass(id) {
  return DEVICE_CLASSES.find((c) => c.id === id) || null;
}

/**
 * @returns {{error:string}|object}
 */
export function decideConverterOrAdapter({
  destinationVoltageV = 230,
  destinationFrequencyHz = 50,
  deviceMinVoltageV = 100,
  deviceMaxVoltageV = 240,
  deviceFrequency = "both",
  deviceWatts = 65,
  deviceClass = "electronic",
  plugShapeDiffers = true,
}) {
  const cls = findDeviceClass(deviceClass);
  if (!cls) return { error: "Pick what kind of appliance this is." };

  const nums = [destinationVoltageV, destinationFrequencyHz, deviceMinVoltageV, deviceMaxVoltageV, deviceWatts];
  if (nums.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a number in every field — copy the figures from the appliance label." };
  }
  if (!["both", "50", "60"].includes(String(deviceFrequency))) {
    return { error: "Choose the frequency printed on the label: 50 Hz, 60 Hz or both." };
  }
  if (destinationVoltageV <= 0 || destinationVoltageV > MAX_REASONABLE_VOLTS) {
    return { error: "Destination voltage should be between 1 V and 1,000 V." };
  }
  if (destinationFrequencyHz !== 50 && destinationFrequencyHz !== 60) {
    return { error: "Mains frequency is either 50 Hz or 60 Hz." };
  }
  if (deviceMinVoltageV <= 0 || deviceMaxVoltageV <= 0) {
    return { error: "Appliance voltage must be greater than zero — copy the range from the label." };
  }
  if (deviceMaxVoltageV < deviceMinVoltageV) {
    return { error: "The maximum voltage cannot be lower than the minimum voltage." };
  }
  if (deviceMaxVoltageV > MAX_REASONABLE_VOLTS) {
    return { error: "Appliance voltage looks too high — mains labels sit between about 100 V and 250 V." };
  }
  if (deviceWatts <= 0) return { error: "Enter the appliance wattage — it must be greater than zero." };
  if (deviceWatts > MAX_REASONABLE_WATTS) {
    return { error: "That wattage is beyond anything a wall socket can supply." };
  }

  const dualVoltage = deviceMaxVoltageV - deviceMinVoltageV >= 100;
  const voltageOk = deviceMinVoltageV <= destinationVoltageV && deviceMaxVoltageV >= destinationVoltageV;
  const converterNeeded = !voltageOk;
  const converterDirection = converterNeeded
    ? deviceMaxVoltageV < destinationVoltageV
      ? "step-down"
      : "step-up"
    : null;

  const requiredVA = converterNeeded ? deviceWatts * cls.headroom : 0;
  const converterType = !converterNeeded
    ? "none"
    : cls.chopperSafe
      ? "chopper-or-transformer"
      : "transformer-only";

  const deviceNominalV = converterNeeded
    ? converterDirection === "step-down"
      ? deviceMaxVoltageV
      : deviceMinVoltageV
    : destinationVoltageV;

  /** Wall-side current: the converter passes power through, so it is watts / mains volts. */
  const currentWallA = deviceWatts / destinationVoltageV;
  /** Appliance-side current on its own rated voltage. */
  const currentDeviceA = deviceWatts / deviceNominalV;

  const devFreq = String(deviceFrequency);
  const frequencyOk = devFreq === "both" || Number(devFreq) === destinationFrequencyHz;
  const speedRatio = frequencyOk || devFreq === "both" ? 1 : destinationFrequencyHz / Number(devFreq);
  const speedChangePercent = (speedRatio - 1) * 100;

  const actions = [];
  if (plugShapeDiffers) actions.push("Pack a plug adapter for the destination socket shape.");
  else actions.push("The socket shape matches, so no plug adapter is needed.");

  if (!converterNeeded) {
    actions.push(
      dualVoltage
        ? `The label spans ${deviceMinVoltageV}-${deviceMaxVoltageV} V, so it is dual voltage and needs no converter.`
        : `The label already covers ${destinationVoltageV} V, so no converter is needed.`,
    );
  } else {
    actions.push(
      `Single voltage: you need a ${converterDirection} unit rated at least ${Math.ceil(requiredVA)} VA (${Math.round(deviceWatts)} W nameplate times ${cls.headroom}).`,
    );
    if (converterType === "transformer-only") {
      actions.push(
        "It must be a wound transformer, not a cheap chopping travel converter — that kind delivers a hacked waveform and will damage electronics and motors.",
      );
    } else {
      actions.push(
        "A chopping travel converter is acceptable for a bare heating element, but only for the short duty it is rated for. A transformer is the safer choice if it runs for long.",
      );
    }
    if (deviceWatts > CARRY_LIMIT_W) {
      actions.push(
        `At ${Math.round(deviceWatts)} W the transformer would be heavy and expensive; buying a local-voltage version of the appliance is usually the cheaper answer.`,
      );
    }
  }

  if (!frequencyOk) {
    actions.push(
      cls.id === "motor"
        ? `Frequency also differs: a synchronous motor rated ${devFreq} Hz runs at ${(speedRatio * 100).toFixed(0)}% speed on ${destinationFrequencyHz} Hz. No converter fixes this — transformers change volts, not hertz.`
        : `Frequency also differs (${devFreq} Hz label on a ${destinationFrequencyHz} Hz supply). Heating elements and switch-mode supplies usually cope; mains-timed clocks will drift.`,
    );
  }

  let verdict;
  if (converterNeeded && converterType === "transformer-only") verdict = "Transformer required";
  else if (converterNeeded) verdict = "Converter required";
  else if (plugShapeDiffers) verdict = "Adapter only";
  else verdict = "Plug straight in";

  return {
    deviceClass: cls,
    dualVoltage,
    voltageOk,
    converterNeeded,
    converterDirection,
    converterType,
    requiredVA,
    headroomFactor: cls.headroom,
    currentWallA,
    currentDeviceA,
    deviceNominalV,
    frequencyOk,
    speedRatio,
    speedChangePercent,
    adapterNeeded: Boolean(plugShapeDiffers),
    verdict,
    actions,
  };
}
