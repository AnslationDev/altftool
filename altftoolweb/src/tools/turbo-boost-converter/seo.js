const seo = {
  title: "Turbo Boost Converter: psi, bar, kPa to Pressure",
  metaDescription:
    "Convert boost between psi, bar, kPa, inHg and kg/cm², gauge and absolute, with the compressor pressure ratio, altitude effect and charge-air density.",
  steps: [
    "Type your Boost reading, pick a Unit (psi, bar, kPa, inHg, mmHg, atm or kg/cm²), then set \"Is that gauge or absolute?\" to \"Gauge — a boost gauge, zero at atmospheric\" or \"Absolute — a MAP sensor reading\".",
    "Choose \"Set ambient pressure by\" — \"Altitude (standard atmosphere)\" or \"A measured barometric pressure\" — then enter Intake air temperature, Compressor efficiency (%) and Intercooler effectiveness (%).",
    "Read the Pressure ratio headline, the Unit / Gauge / Absolute conversion table, and the \"Charge air temperature and density\" rows for Compressor outlet, After the intercooler and Charge density ratio; Copy result copies the lot.",
  ],
  intro:
    "This converter translates turbo or supercharger boost between psi, bar, kPa, inHg and kg/cm² in both gauge and absolute terms, using the relationship absolute = gauge + ambient. It then computes the pressure ratio a compressor map is plotted against, adjusts ambient pressure for altitude with the ISA troposphere model, and applies the adiabatic compression relation for air (γ = 1.4) plus intercooler effectiveness to show the charge-air temperature and density the engine actually receives. Aimed at anyone sizing a turbo, reading a compressor map, or reconciling a boost gauge against a MAP sensor.",
  useCases: [
    "Finding the pressure ratio for a compressor map from a target of 15 psi on the boost gauge",
    "Working out why the same wastegate setting gives a higher pressure ratio at 1,500 m than at sea level",
    "Comparing charge density with and without an intercooler before deciding whether one is worth fitting",
  ],
  benefits: [
    [
      "Gauge and absolute side by side",
      "Every unit is shown both ways, so a boost gauge reading and a MAP sensor reading stop contradicting each other.",
    ],
    [
      "Altitude-aware",
      "Ambient pressure drops about 17% by 1,500 m, which raises the pressure ratio for the same gauge boost.",
    ],
    [
      "Density, not just pressure",
      "Applies compressor heating and intercooler cooling to show the air mass gain, which is what actually tracks power.",
    ],
  ],
  faqs: [
    [
      "How do I convert psi of boost to bar?",
      "Divide psi by 14.5038 to get bar, or multiply bar by 14.5038 to get psi. So 15 psi of boost is 1.034 bar and 1 bar of boost is 14.50 psi. Both figures here are gauge pressure — add atmospheric, about 14.696 psi or 1.013 bar at sea level, to get absolute.",
    ],
    [
      "What is the pressure ratio for 15 psi of boost?",
      "About 2.02 at sea level. Pressure ratio is absolute manifold pressure divided by absolute ambient pressure, so (15 + 14.696) ÷ 14.696 = 2.021. Compressor maps are always plotted against this absolute ratio, never against gauge boost.",
    ],
    [
      "Does altitude change turbo boost?",
      "It changes the pressure ratio, not the gauge reading. Ambient pressure falls to about 12.26 psi at 1,500 m, so holding 15 psi on the gauge means a pressure ratio of 2.22 rather than 2.02 — the turbo works harder, spins faster and runs hotter for the same indicated boost, while the engine still receives less absolute pressure than it would at sea level.",
    ],
    [
      "How hot does compressed air get in a turbo?",
      "Roughly 120 °C at a 2.0 pressure ratio from 25 °C intake air with a 70% efficient compressor, using the adiabatic relation for air. A 75% effective intercooler brings that back to about 49 °C, which lifts the charge density ratio from 1.53 to 1.87 — the intercooler is worth around 22% more air mass at the same boost pressure.",
    ],
  ],
};

export default seo;
