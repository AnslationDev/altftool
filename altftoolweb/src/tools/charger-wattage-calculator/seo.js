const seo = {
  intro:
    "Charging power is simply volts times amps, and the speed you actually get is the lowest of three ceilings: what the charger is rated for, what the cable can carry, and what the device will accept. This calculator multiplies your charger's V x A label, clips that figure to your cable's current rating and the device's own power limit, applies a conversion-loss factor (86% by default) and then estimates how long it will take to move the battery from its current percentage to your target. It also names the USB Power Delivery profile the voltage corresponds to and flags heat risk when you sit near the device ceiling.",
  useCases: [
    "You bought a 65W USB-C charger for a laptop but only have an old 2A cable in your bag, and want to know how much power actually reaches the machine",
    "You are deciding between a 20W and a 45W brick for a 5,000 mAh phone and want the real difference in minutes from 20% to 90%, not just the wattage on the box",
    "Your charger runs hot in a warm room and you want to see whether you are pushing the device close to its accepted limit or sitting comfortably below it",
  ],
  benefits: [
    ["Shows every bottleneck separately", "Rated, cable-limited, device-accepted and usable wattage are broken out so you can see which link is holding you back."],
    ["Charge time accounts for tapering", "Time above 80% is penalised, because lithium cells slow down in constant-voltage mode instead of charging linearly."],
    ["Names the USB-C PD profile", "Reads the voltage as 5V standard, 9V/12V fast charge, 15V, 20V PD or Extended Power Range so you can match it to your device's supported profiles."],
  ],
  faqs: [
    [
      "How do I calculate the wattage of a charger?",
      "Multiply the output voltage by the output current: a charger labelled 9V x 2A is 18W, and 20V x 3.25A is 65W. If the label lists several profiles, the charger's headline wattage is the highest V x A pair it advertises, but only one profile runs at a time.",
    ],
    [
      "Does the cable limit how fast my device charges?",
      "Yes. A standard USB-C cable is rated for 3A, and only cables with an e-marker chip carry 5A, so a 100W (20V x 5A) charger paired with a 3A cable delivers at most 60W. That is why the calculator caps current at the cable rating before working out usable power.",
    ],
    [
      "Why does the estimated time not match watt-hours divided by watts?",
      "Because two real-world effects are applied on top. Conversion loss means only about 86% of the wall-side wattage becomes stored energy, and charging past 80% enters a tapering phase where current is throttled, so the last stretch of a charge takes disproportionately longer than the first.",
    ],
    [
      "Is a higher-wattage charger unsafe for a small device?",
      "No, under USB Power Delivery the device negotiates the voltage and current it wants, so a 65W charger will supply only the 5W a pair of earbuds asks for. The practical concern is heat rather than over-supply: sustained charging near the device's own accepted limit, especially above roughly 32C ambient, is what ages a battery faster.",
    ],
  ],
};

export default seo;
