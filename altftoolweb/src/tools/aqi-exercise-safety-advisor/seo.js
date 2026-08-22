const seo = {
  title: "AQI Exercise Safety: Safe to Run Outside Today?",
  metaDescription:
    "Turns a US EPA or India CPCB AQI into PM2.5, the micrograms your session would inhale, and the EPA activity verdict for your risk group.",
  steps: [
    "Enter the AQI reading right now, choose the US EPA or India CPCB scale, and set your planned session and session length in minutes.",
    "Tick any risk group that applies — Asthma or COPD, Heart disease, Child or teenager, Aged 65 or over, Pregnant.",
    "Read the estimated PM2.5 in µg/m³, the verdict, the PM2.5 you would breathe in and the length that matches a clean-air dose.",
  ],
  intro:
    "The AQI Exercise Safety Advisor turns an air quality index reading into an outdoor training decision. It inverts the official AQI formula to recover the underlying PM2.5 concentration — using the US EPA breakpoints revised in 2024 or the India CPCB National AQI sub-index — then multiplies that by the EPA Exposure Factors Handbook inhalation rate for your session intensity to estimate the micrograms of fine particulate you would actually breathe in. The verdict follows the EPA Air Quality Guide for Particle Pollution, which is written around prolonged or heavy exertion.",
  useCases: [
    "Decide whether a 10 km run is still sensible when the Delhi AQI reads 320 on the CPCB scale.",
    "Compare a 45-minute easy walk with a 45-minute interval session on the same smoky afternoon.",
    "Work out the session length that keeps your inhaled particulate at the level of a clean-air day.",
    "Check the guidance that applies specifically to a child, an older adult or someone with asthma before a club session.",
  ],
  benefits: [
    ["Both scales handled", "US EPA and India CPCB breakpoints, so the number in your app is read correctly."],
    ["Dose, not just a colour", "Shows the micrograms of PM2.5 a session draws in, because breathing rate rises up to twelvefold with effort."],
    ["Official activity advice", "Verdicts follow the EPA particle pollution activity guidance for sensitive groups and the general public."],
  ],
  faqs: [
    [
      "At what AQI should I stop exercising outside?",
      "On the US EPA scale, sensitive groups are advised to reduce prolonged or heavy exertion from AQI 101 and to move activities indoors from 151; everyone is advised to avoid outdoor physical activity at 301 and above. On the India CPCB scale the equivalent turning points are Moderate (101–200) for sensitive people and Very Poor (301–400) for everyone.",
    ],
    [
      "Why does exercise make polluted air worse for you?",
      "Because inhaled dose is concentration multiplied by breathing rate multiplied by time. EPA short-term inhalation rates for adults run from about 0.0042 m³/min at rest to 0.049 m³/min at high intensity — roughly twelvefold — and hard breathing also shifts air from the nose, which filters particles, to the mouth, which does not.",
    ],
    [
      "What PM2.5 level does an AQI number correspond to?",
      "Under the 2024 US EPA breakpoints, AQI 50 is 9.0 µg/m³, AQI 100 is 35.4, AQI 150 is 55.4, AQI 200 is 125.4 and AQI 300 is 225.4 as a 24-hour average. India's CPCB scale is different: AQI 100 is 60 µg/m³ and AQI 200 is 90, so the same PM2.5 reading gives a lower Indian AQI than a US one.",
    ],
    [
      "Does wearing an N95 make it safe to run in polluted air?",
      "A well-fitted N95 or FFP2 filters at least 95% of fine particles, but it increases breathing resistance and its seal breaks down with heavy sweating and jaw movement, so it is a poor fit for hard training. Moving the session indoors, shifting it away from traffic, or training earlier when concentrations are usually lower generally does more than a mask.",
    ],
  ],
};

export default seo;
