const seo = {
  title: "Smart Home Power Budget: Standby and Running Cost",
  metaDescription:
    "Add hubs, bulbs, cameras and docks for daily, monthly and yearly kWh at your tariff — plus the always-on watts your house draws with nobody home.",
  steps: [
    "Set 'Electricity tariff (per kWh)' and pick your Currency from Indian rupee, US dollar, Euro, Pound sterling or Australian dollar.",
    "Tap chips under 'Add a device' — Wi-Fi router, Smart home hub / bridge, Smart LED bulb, Indoor security camera, Robot vacuum dock and more — then adjust How many, Active hours per day, Standby watts and Active watts on each row.",
    "Read Monthly electricity cost with Energy per day, Energy per year, Average continuous draw, 'Always-on standby load' in watts and standby's share of all consumption; Copy result copies the budget.",
  ],
  intro:
    "This budget totals what a connected home actually costs to run, calculating each device as qty x (active watts x active hours + standby watts x the remaining hours of the day), then rolling that up to kWh per day, month and year at your tariff. The number most people have never seen is the always-on figure: the sum of standby watts, which is what the house draws with nobody home. It is built for anyone who has added hubs, cameras, bulbs and speakers one at a time and wants to know what the pile of them adds to the bill.",
  useCases: [
    "Working out whether eight smart bulbs, two cameras and a mesh network justify their standby draw",
    "Comparing the annual cost of leaving a NAS on all day against powering it down overnight",
    "Finding the two or three devices responsible for most of a smart home's idle consumption",
  ],
  benefits: [
    ["Standby made visible", "Separates idle draw from active use so you can see the share you never chose to spend."],
    ["Ranked by impact", "Sorts devices by daily watt-hours, so the fix is obvious rather than guessed at."],
    ["Real device presets", "Starts from typical measured watts for routers, hubs, cameras, bulbs and docks."],
  ],
  faqs: [
    [
      "How much electricity does a smart home use?",
      "A typical setup of a router, mesh node, hub, two speakers, eight smart bulbs, two cameras and a smart TV lands around 0.6 to 1.2 kWh a day, of which roughly 15 to 30% is pure standby. The router, cameras and any always-on server usually dominate; individual bulbs and plugs are small.",
    ],
    [
      "How much power does a smart plug use on standby?",
      "About 0.5 W, so roughly 4.4 kWh a year each — small alone, but ten of them is a permanent 5 W load. A smart plug only saves energy if the thing it controls draws more in standby than the plug itself.",
    ],
    [
      "Do smart devices use power when not in use?",
      "Yes, continuously, because they keep a Wi-Fi or Zigbee radio alive to stay reachable. EU Ecodesign Regulation 1275/2008 caps ordinary standby at 0.5 W, but networked standby is permitted a higher allowance, which is why a camera or hub idles at 2-4 W rather than a fraction of a watt.",
    ],
    [
      "How do I reduce smart home standby power?",
      "Group entertainment and office devices onto one switchable strip, drop always-on cameras to motion-triggered recording, retire spare mesh nodes you added but do not need, and measure the biggest suspects with a plug-in energy meter before replacing anything. Leave safety devices such as alarms and doorbells powered.",
    ],
  ],
};

export default seo;
