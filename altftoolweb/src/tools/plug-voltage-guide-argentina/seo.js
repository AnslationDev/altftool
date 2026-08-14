const seo = {
  title: "Argentina Plug Adapter & Voltage Checker (220 V, Type I)",
  metaDescription:
    "Argentina runs 220 V 50 Hz on IRAM 2073 type I sockets. Enter your plug and label voltage to see if you need an adapter, a converter, or nothing.",
  steps: [
    "Choose the \"Plug on your device\" from the type list, or tap a preset such as \"Laptop charger\" or \"US hair dryer\".",
    "Enter the \"Label minimum voltage (V)\" and \"Label maximum voltage (V)\" printed on the device, its \"Label frequency\" (50/60 Hz) and \"Rated power (W)\".",
    "Read the \"Verdict for Argentina\" — adapter, converter, polarity and 10 A socket-fit rows — then click \"Copy result\".",
  ],
  intro:
    "This guide decides whether your device needs a plug adapter, a voltage converter, or nothing at all in Argentina. Argentina supplies 220 V at 50 Hz, and its earthed socket is IRAM 2073 — the flat angled-pin type I shape, physically identical to the Australian plug but wired with line and neutral on the opposite pins. Enter your plug type and the voltage range printed on the label to get the verdict, the current the device will draw and whether it fits a 10 A wall socket.",
  useCases: [
    "Check before flying to Buenos Aires whether a US or UK charger needs more than an adapter.",
    "Understand why an Australian appliance physically fits an Argentine socket but has reversed polarity.",
    "See whether a 2,400 W appliance exceeds the 10 A wall socket and needs the 20 A outlet instead.",
  ],
  benefits: [
    ["Handles the polarity trap", "Flags the Australia, New Zealand and China type I plugs that fit but are wired the other way."],
    ["Adapter versus converter", "Compares the label voltage range against 220 V instead of leaving it to guesswork."],
    ["Socket rating check", "Converts wattage to amps and tests it against the 10 A and 20 A Argentine outlets."],
  ],
  faqs: [
    [
      "What plug adapter do I need for Argentina?",
      "A type I adapter, the flat angled-pin IRAM 2073 shape. Argentina's official socket types are I and C, so a two-pin round Europlug also fits directly in the many combination outlets. US type A and B, UK type G and continental Schuko type F plugs all need an adapter.",
    ],
    [
      "What voltage does Argentina use?",
      "220 V at 50 Hz. Devices labelled 100-240V 50/60Hz — nearly all laptop, phone and camera chargers — work on it with just a plug adapter. A single-voltage 110 V or 120 V appliance needs a step-down transformer, not an adapter.",
    ],
    [
      "Can I use an Australian plug in Argentina?",
      "It fits, but the polarity is reversed. Argentina's IRAM 2073 socket uses the same flat angled-pin geometry as Australia's AS/NZS 3112, yet the pin that carries line in Australia carries neutral in Argentina. Double-insulated equipment such as a laptop charger is unaffected; anything with a single-pole switch or an accessible heating element is safer on a locally bought lead.",
    ],
    [
      "How many watts can an Argentine wall socket take?",
      "About 2,200 W on the standard 10 A outlet, since 10 A at 220 V is 2,200 W. Air conditioners, ovens and electric water heaters use the 20 A version of the same pattern, which allows roughly 4,400 W. Add up everything on one socket before plugging in a heater or kettle.",
    ],
  ],
};

export default seo;
