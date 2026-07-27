/**
 * Travel temperature conversion with feels-like figures and packing bands.
 *
 * Scale conversion (exact, by definition of the two scales):
 *     °C = (°F - 32) x 5/9
 *     °F = °C x 9/5 + 32
 *     K  = °C + 273.15
 *
 * FEELS LIKE, HOT: the US National Weather Service heat index. Below an index of
 * about 80°F the NWS uses Steadman's simple form; at or above it the Rothfusz
 * multiple-regression fit is used, with the NWS's two published adjustments for very
 * dry and very humid air. Both take temperature in °F and relative humidity in %.
 *
 * FEELS LIKE, COLD: the 2001 NWS / Environment Canada wind chill index, valid for
 * air temperature at or below 50°F with wind above 3 mph.
 *
 * All of it is pure arithmetic on the arguments — no clock, no location lookup.
 */

/** Absolute zero, the hard floor on any temperature. */
export const ABSOLUTE_ZERO_C = -273.15;
export const ABSOLUTE_ZERO_F = -459.67;

/** Weather sanity range; outside this the input is a typo, not a forecast. */
export const MIN_WEATHER_C = -95; // lowest reliably recorded surface air temperature is about -89°C
export const MAX_WEATHER_C = 60; // highest reliably recorded is about 57°C

/** Wind chill is only defined at or below this air temperature (NWS). */
export const WIND_CHILL_MAX_F = 50;
/** ...and above this wind speed (NWS). */
export const WIND_CHILL_MIN_MPH = 3;
/** Heat index switches to the Rothfusz regression at or above this index value. */
export const HEAT_INDEX_ROTHFUSZ_THRESHOLD_F = 80;

/**
 * Packing bands by daytime temperature in °C. Each entry is the UPPER edge of the
 * band. The edges follow the ordinary comfort steps people dress by: freezing at 0,
 * the point a coat becomes optional near 10, shirtsleeve comfort from about 18 to 24,
 * and the 30 and 38 marks where heat becomes a planning problem rather than a comfort one.
 */
export const PACKING_BANDS = [
  {
    maxC: -10,
    key: "extreme-cold",
    label: "Extreme cold",
    pack: "Insulated parka, thermal base layers, mittens over gloves, balaclava and boots rated below -20°C. Exposed skin is at risk within minutes in wind.",
  },
  {
    maxC: 0,
    key: "freezing",
    label: "Freezing",
    pack: "Down or padded jacket, hat, gloves, scarf and waterproof boots with grip. Expect ice underfoot in the morning.",
  },
  {
    maxC: 10,
    key: "cold",
    label: "Cold",
    pack: "Warm coat over a fleece or sweater, long trousers, closed shoes and a light hat for evenings.",
  },
  {
    maxC: 18,
    key: "cool",
    label: "Cool",
    pack: "Light jacket or sweater over a shirt, full-length trousers, and a packable rain layer.",
  },
  {
    maxC: 24,
    key: "mild",
    label: "Mild",
    pack: "Shirt or t-shirt with a thin layer for the evening. Comfortable walking weather all day.",
  },
  {
    maxC: 30,
    key: "warm",
    label: "Warm",
    pack: "Light breathable clothing, sunglasses, hat and sunscreen. Carry water on long walks.",
  },
  {
    maxC: 38,
    key: "hot",
    label: "Hot",
    pack: "Loose light-coloured cotton or linen, wide hat, high-SPF sunscreen and a refillable bottle. Plan indoor time between roughly 12:00 and 16:00.",
  },
  {
    maxC: Infinity,
    key: "very-hot",
    label: "Very hot",
    pack: "Cover up rather than strip down, keep electrolytes handy, and treat midday sightseeing as unsafe rather than uncomfortable.",
  },
];

/** Swing between day and night beyond which layering really matters, in °C. */
export const LAYERING_SWING_C = 10;

/** Exact, from the 1959 international yard: 1 mile = 1.609344 km. */
export const KM_PER_MILE = 1.609344;

/** Wind speed to mph, the unit the NWS wind chill formula expects. */
export function windToMph(value, unit = "mph") {
  const speed = Number(value);
  if (!Number.isFinite(speed)) return NaN;
  return unit === "kmh" ? speed / KM_PER_MILE : speed;
}

export function cToF(celsius) {
  return celsius * (9 / 5) + 32;
}

export function fToC(fahrenheit) {
  return (fahrenheit - 32) * (5 / 9);
}

/**
 * Convert one temperature.
 *
 * @param {object} input
 * @param {number} input.value
 * @param {"F"|"C"} input.from
 * @returns {{error:string}|{celsius:number,fahrenheit:number,kelvin:number}}
 */
export function convertTemperature({ value, from = "F" }) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return { error: "Enter the temperature as a number." };

  const celsius = from === "C" ? amount : fToC(amount);
  if (celsius < ABSOLUTE_ZERO_C) return { error: "Nothing is colder than absolute zero (-273.15°C / -459.67°F)." };
  if (celsius < MIN_WEATHER_C || celsius > MAX_WEATHER_C) {
    return { error: `That is outside the range weather occurs in (${MIN_WEATHER_C}°C to ${MAX_WEATHER_C}°C) — check the unit.` };
  }

  return { celsius, fahrenheit: cToF(celsius), kelvin: celsius - ABSOLUTE_ZERO_C };
}

/**
 * NWS heat index in °F.
 *
 * @param {number} tempF air temperature, °F
 * @param {number} rh relative humidity, %
 * @returns {{applicable:boolean,heatIndexF:number,reason?:string}}
 */
export function heatIndexF(tempF, rh) {
  if (!Number.isFinite(tempF) || !Number.isFinite(rh)) return { applicable: false, heatIndexF: NaN, reason: "Needs a temperature and a humidity." };
  const humidity = Math.min(100, Math.max(0, rh));

  // Steadman's simple form, used by the NWS when the resulting index is below 80°F.
  const simple = 0.5 * (tempF + 61 + (tempF - 68) * 1.2 + humidity * 0.094);
  const simpleAveraged = (simple + tempF) / 2;
  if (simpleAveraged < HEAT_INDEX_ROTHFUSZ_THRESHOLD_F) {
    return { applicable: false, heatIndexF: simpleAveraged, reason: "Below about 27°C the heat index is essentially the air temperature." };
  }

  // Rothfusz multiple-regression fit (NWS Technical Attachment SR 90-23).
  let hi =
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * humidity -
    0.22475541 * tempF * humidity -
    0.00683783 * tempF * tempF -
    0.05481717 * humidity * humidity +
    0.00122874 * tempF * tempF * humidity +
    0.00085282 * tempF * humidity * humidity -
    0.00000199 * tempF * tempF * humidity * humidity;

  // NWS adjustment for very dry air.
  if (humidity < 13 && tempF >= 80 && tempF <= 112) {
    hi -= ((13 - humidity) / 4) * Math.sqrt((17 - Math.abs(tempF - 95)) / 17);
  }
  // NWS adjustment for very humid air at the lower end of the range.
  if (humidity > 85 && tempF >= 80 && tempF <= 87) {
    hi += ((humidity - 85) / 10) * ((87 - tempF) / 5);
  }

  return { applicable: true, heatIndexF: hi };
}

/**
 * 2001 NWS / Environment Canada wind chill in °F.
 *
 * @param {number} tempF air temperature, °F
 * @param {number} windMph wind speed, mph
 */
export function windChillF(tempF, windMph) {
  if (!Number.isFinite(tempF) || !Number.isFinite(windMph)) return { applicable: false, windChillF: NaN, reason: "Needs a temperature and a wind speed." };
  if (tempF > WIND_CHILL_MAX_F || windMph <= WIND_CHILL_MIN_MPH) {
    return {
      applicable: false,
      windChillF: tempF,
      reason: `Wind chill is only defined at or below ${WIND_CHILL_MAX_F}°F (10°C) with wind above ${WIND_CHILL_MIN_MPH} mph.`,
    };
  }
  const v = Math.pow(windMph, 0.16);
  return { applicable: true, windChillF: 35.74 + 0.6215 * tempF - 35.75 * v + 0.4275 * tempF * v };
}

/** The packing band whose upper edge first covers this Celsius temperature. */
export function packingBandFor(celsius) {
  if (!Number.isFinite(celsius)) return null;
  return PACKING_BANDS.find((band) => celsius <= band.maxC) ?? PACKING_BANDS[PACKING_BANDS.length - 1];
}

/**
 * A whole day: convert the high and the low, add feels-like figures and packing advice.
 *
 * @param {object} input
 * @param {number} input.high  forecast daytime high
 * @param {number} input.low   forecast overnight low
 * @param {"F"|"C"} input.unit unit both were entered in
 * @param {number} input.humidity relative humidity %, for the heat index
 * @param {number} input.windMph wind speed in mph, for the wind chill
 * @returns {{error:string}|object}
 */
export function dailyPackingPlan({ high, low, unit = "F", humidity = 50, windSpeed = 10, windUnit = "mph" }) {
  const highConverted = convertTemperature({ value: high, from: unit });
  if (highConverted.error) return { error: `Daytime high: ${highConverted.error}` };
  const lowConverted = convertTemperature({ value: low, from: unit });
  if (lowConverted.error) return { error: `Overnight low: ${lowConverted.error}` };
  if (lowConverted.celsius > highConverted.celsius) {
    return { error: "The overnight low cannot be warmer than the daytime high." };
  }

  const rh = Number(humidity);
  if (!Number.isFinite(rh) || rh < 0 || rh > 100) return { error: "Relative humidity must be between 0% and 100%." };
  if (!Number.isFinite(Number(windSpeed)) || Number(windSpeed) < 0) {
    return { error: "Enter the wind speed as a number of zero or more." };
  }
  const wind = windToMph(windSpeed, windUnit);

  const heat = heatIndexF(highConverted.fahrenheit, rh);
  const chill = windChillF(lowConverted.fahrenheit, wind);

  const swingC = highConverted.celsius - lowConverted.celsius;
  const dayBand = packingBandFor(highConverted.celsius);
  const nightBand = packingBandFor(lowConverted.celsius);

  return {
    high: highConverted,
    low: lowConverted,
    windMph: wind,
    swingC,
    swingF: swingC * (9 / 5),
    dayBand,
    nightBand,
    needsLayers: swingC >= LAYERING_SWING_C || dayBand.key !== nightBand.key,
    heatIndex: heat.applicable
      ? { applicable: true, fahrenheit: heat.heatIndexF, celsius: fToC(heat.heatIndexF) }
      : { applicable: false, reason: heat.reason },
    windChill: chill.applicable
      ? { applicable: true, fahrenheit: chill.windChillF, celsius: fToC(chill.windChillF) }
      : { applicable: false, reason: chill.reason },
  };
}
