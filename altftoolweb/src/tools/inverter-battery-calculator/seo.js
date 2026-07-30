const seo = {
  intro:
    "The Inverter & Battery Backup Calculator sizes a home inverter and battery bank from a real appliance list, dividing total connected watts by a 0.8 power factor to get the VA rating and dividing watt-hours by (system voltage × inverter efficiency × depth of discharge) to get the required amp-hours. It is built for homeowners and electricians choosing between a 600, 900, 1100, 1500 or 2500 VA unit and a 100–220 Ah battery. You get the recommended standard size, the surge headroom needed when a motor starts, real backup hours and an estimated recharge time.",
  useCases: [
    "You have four LED bulbs, two ceiling fans, a TV and a router and want to know whether a 900 VA inverter with one 150 Ah tubular battery will actually carry four hours of cut.",
    "Your inverter keeps tripping when the 0.5 HP water pump starts, and you need to see the peak watts that surge adds on top of your running load before buying a bigger unit.",
    "You are deciding between two 150 Ah tubular batteries in parallel and one lithium bank, and want the backup hours and recharge time for each at your actual load.",
  ],
  benefits: [
    [
      "Surge, not just running watts",
      "Adds the worst starting spike in your list — a fridge compressor at about 4× running watts, a pump at about 3× — and flags when your chosen VA size would trip.",
    ],
    [
      "Rounds to sizes you can buy",
      "Snaps the computed VA and Ah up to real market sizes (600/900/1100/1500/2500 VA, 100/150/180/220 Ah) instead of leaving you with an unbuyable number.",
    ],
    [
      "Bank wiring and recharge time",
      "Works out series count for 12 V, 24 V and 48 V systems, how many parallel strings you need, and recharge hours at your charger current with a 20% charging-loss allowance.",
    ],
  ],
  faqs: [
    [
      "How do I convert watts to inverter VA?",
      "Divide total watts by the power factor — this calculator uses 0.8, the usual figure for a home inverter, so 800 W of load needs 1000 VA. Then pick the next standard size up and aim to run at roughly 80% of the rating so the unit stays cool and has headroom for motor starts.",
    ],
    [
      "How many hours will a 150 Ah battery run my load?",
      "Backup hours = (Ah × system volts × inverter efficiency × depth of discharge) ÷ load watts. A 150 Ah 12 V battery at 80% efficiency and 80% DoD gives about 1,150 usable Wh, which is roughly 5 hours on a 230 W load of fans, lights and a router — and under an hour on a 1,000 W electric iron.",
    ],
    [
      "Can a normal home inverter run an air conditioner or a geyser?",
      "No. A 1 ton non-inverter AC draws about 1,200 W running and roughly 3,600 W at startup, and a 15 L geyser pulls about 2,000 W continuously — a standard 12 V home inverter will trip or flatten the bank in minutes. Running an AC needs a high-capacity pure sine wave inverter on a 48 V or larger bank.",
    ],
    [
      "Should I choose a flat plate, tubular or lithium battery?",
      "Tubular is the default for frequent or long cuts: roughly 1,200–1,500 cycles and 4–6 years, with 70–80% usable depth of discharge. Flat plate is cheapest but lasts about 2–3 years at 50–60% DoD, while LiFePO4 gives 3,000–5,000 cycles and 80–90% usable capacity at several times the price and needs a compatible inverter and charger.",
    ],
  ],
};

export default seo;
