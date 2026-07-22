const info = {
  "heat-index-calculator": {
    intro: [
      "The heat index, or apparent temperature, is how hot it actually feels to the human body when relative humidity is combined with the air temperature. On humid days, sweat evaporates more slowly, so your body sheds less heat and the air feels warmer than the thermometer reads.",
      "This calculator uses the U.S. National Weather Service (Rothfusz) regression to turn a temperature and humidity reading into a feels-like value and a heat-stress risk category, helping you judge when outdoor work, sport, or travel becomes dangerous.",
    ],
    formula: {
      expression:
        "HI = −42.379 + 2.04901523·T + 10.14333127·R − 0.22475541·T·R − 0.00683783·T² − 0.05481717·R² + 0.00122874·T²·R + 0.00085282·T·R² − 0.00000199·T²·R²",
      where: [
        ["HI", "Heat index (apparent temperature), in °F"],
        ["T", "Air temperature, in °F"],
        ["R", "Relative humidity, in %"],
      ],
      note: "The regression is defined for T ≥ 80 °F (27 °C) and works best at R ≥ 40%. The NWS applies small corrections when humidity is very low (< 13%) or very high (> 85%). Below 80 °F the heat index is undefined, so the feels-like value is taken as the air temperature.",
    },
    howToUse: [
      "Pick your temperature unit (°C or °F).",
      "Enter the current air temperature (ideally a shaded, dry-bulb reading).",
      "Enter the relative humidity as a percentage from 0 to 100.",
      "Read the feels-like temperature and its risk category; the result updates as you type.",
    ],
    goodToKnow: [
      "NWS risk bands (by heat index): Caution 80–90 °F (27–32 °C), Extreme caution 90–103 °F (32–39 °C), Danger 103–125 °F (39–52 °C), Extreme danger 125 °F+ (52 °C+).",
      "The formula assumes shade and light wind. Standing in full sun can add up to about 8 °C (15 °F) to the heat index.",
      "Higher humidity slows sweat evaporation, which is the body's main cooling mechanism, so the same temperature feels hotter as humidity rises.",
      "Heat index is a guideline, not a medical measure — hydration, exertion, age, and acclimatisation all change how heat affects an individual.",
    ],
    faqs: [
      {
        q: "What heat index is considered dangerous?",
        a: "The NWS flags 'Danger' from a heat index of 103 °F (39 °C) — where heat exhaustion is likely and heat stroke is possible — and 'Extreme danger' at 125 °F (52 °C) and above, where heat stroke is highly likely with continued exposure.",
      },
      {
        q: "Why does humidity make it feel hotter?",
        a: "Your body cools itself mainly by evaporating sweat. Humid air is already close to saturated, so sweat evaporates slowly and carries away less heat, leaving you feeling hotter than the air temperature alone suggests.",
      },
      {
        q: "Does the heat index include the effect of direct sunlight?",
        a: "No. The standard heat index assumes you are in the shade. Direct sun exposure can make it feel up to about 15 °F (8 °C) hotter than the calculated value.",
      },
      {
        q: "Why does the result just equal the air temperature on cooler days?",
        a: "The Rothfusz regression is only valid at roughly 80 °F (27 °C) and above. Below that, humidity has little warming effect, so the feels-like temperature is treated as the same as the actual air temperature.",
      },
      {
        q: "What is the difference between heat index and dew point?",
        a: "Dew point is the temperature at which air becomes saturated and is a direct measure of moisture in the air. Heat index combines that moisture (as relative humidity) with the air temperature to estimate how hot it feels to a person.",
      },
    ],
  },

  "wind-chill-calculator": {
    intro: [
      "Wind chill describes how cold it feels on exposed skin once wind is taken into account. Moving air strips away the thin layer of warmth your body builds up at the skin surface, speeding up heat loss so it feels far colder than the thermometer shows.",
      "This calculator uses the 2001 North American wind chill formula adopted by the U.S. National Weather Service and Environment Canada to convert temperature and wind speed into a feels-like value, along with an approximate frostbite-risk warning.",
    ],
    formula: {
      expression: "WC = 35.74 + 0.6215·T − 35.75·V^0.16 + 0.4275·T·V^0.16",
      where: [
        ["WC", "Wind chill (feels like), in °F"],
        ["T", "Air temperature, in °F"],
        ["V", "Wind speed, in mph"],
      ],
      note: "This is the current North American formula. It applies for air temperatures of 50 °F (10 °C) or below and wind speeds above 3 mph (4.8 km/h), using wind measured at the standard 10 m (33 ft) height. Outside that range the feels-like temperature is essentially the air temperature.",
    },
    howToUse: [
      "Choose your temperature unit (°C or °F) and wind speed unit (km/h or mph).",
      "Enter the current air temperature.",
      "Enter the sustained wind speed.",
      "Read the wind chill and frostbite-risk note; results update live as you type.",
    ],
    goodToKnow: [
      "Wind chill only affects living tissue and objects that generate heat — it cannot cool an object below the actual air temperature.",
      "Frostbite risk rises sharply as wind chill falls: exposed skin can freeze in about 30 minutes near −18 °F (−28 °C) and in as little as 5 minutes at extreme values.",
      "The formula is undefined above 50 °F (10 °C) or at winds of 3 mph or less, because wind has little cooling effect in those conditions.",
      "Wind chill assumes a clear, dry adult face; wet skin, poor circulation, and children lose heat faster, so treat the numbers as a guide.",
    ],
    faqs: [
      {
        q: "What exactly is wind chill?",
        a: "It is an index of how cold the air feels to exposed skin when wind is factored in. Wind continually removes the warm boundary layer next to your skin, increasing heat loss and making a given temperature feel colder.",
      },
      {
        q: "Can wind chill freeze something colder than the air temperature?",
        a: "No. Wind chill only speeds up how quickly an object cools toward the air temperature. A car, pipe, or puddle can never drop below the actual air temperature no matter how strong the wind.",
      },
      {
        q: "At what wind chill does frostbite happen?",
        a: "As a rough guide, frostbite on exposed skin becomes possible within about 30 minutes near a wind chill of −18 °F (−28 °C), within 10 minutes near −35 °F (−37 °C), and within 5 minutes at roughly −55 °F (−48 °C) or colder.",
      },
      {
        q: "Why doesn't the calculator give a wind chill above 50 °F?",
        a: "The 2001 formula was derived and validated only for cold conditions — temperatures at or below 50 °F (10 °C) with wind above 3 mph. Above that, wind has negligible cooling effect, so the feels-like value equals the air temperature.",
      },
      {
        q: "Does wind chill account for sunshine or humidity?",
        a: "No. It uses only air temperature and wind speed. Bright sunshine can make it feel a few degrees warmer, and it is a separate index from the heat index, which handles warm, humid conditions instead.",
      },
    ],
  },
};

export default info;
