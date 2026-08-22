const seo = {
  title: "Curtain Thermal Savings Estimator: kWh & Payback",
  metaDescription:
    "Splits window gain into solar (area x SHGC x irradiance) and conducted (area x U x delta T), applies the curtain attenuation, divides by the AC COP.",
  steps: [
    "Set Glass width, Glass height and Number of windows like this in Feet or Metres, then pick a Glazing option — Single clear 5 mm through Double glazed low-E — which supplies the SHGC and U-value used.",
    "Choose a Curtain type, from Sheer net curtain, light colour up to Reflective blackout with a pelmet, set Sun on the glass (W/sqm) using the West facing or Skylight chips, and enter Outdoor minus indoor temperature (°C).",
    "Fill Hours a day the curtains are drawn in sun, Cooling days a year, Air conditioner COP, Electricity tariff (INR per kWh) and What the curtains cost in total; Saved every year gives the rupee figure, with Heat kept out in watts, AC capacity freed up in tons and Payback on the curtains.",
  ],
  intro:
    "This estimator splits window heat into its two real components — solar gain A x SHGC x irradiance and conducted gain A x U x ΔT — then applies the curtain's interior attenuation coefficient to the first and a smaller U-value reduction to the second, exactly as ASHRAE Fundamentals treats interior shading. Dividing the heat removed by the air conditioner's coefficient of performance converts it into kilowatt-hours and rupees. Intended for anyone deciding whether blackout or thermal curtains are worth their price on a hot west-facing window.",
  useCases: [
    "Comparing a ₹9,000 set of blackout curtains against a sheer net on three west-facing windows before buying",
    "Estimating how many watts of afternoon heat gain a bedroom curtain removes from the AC's load",
    "Checking payback when the electricity tariff is ₹8 a unit and the cooling season runs 150 days",
  ],
  benefits: [
    ["Real glazing data", "Uses published SHGC and U-values for single clear, tinted, reflective, double and low-E glass."],
    ["Solar and conducted heat separated", "Shows why a curtain helps far more on a sunlit window than on a shaded one."],
    ["Converted at the AC's COP", "Reports electricity, not just heat, so the rupee figure is the one that appears on the bill."],
  ],
  faqs: [
    [
      "Do blackout curtains actually reduce cooling costs?",
      "Yes, on a sunlit window. A blackout lined curtain has an interior attenuation coefficient of about 0.35, so it stops roughly 65% of the solar heat that gets through the glass — around 435 W on 2 sqm of single clear glazing in strong afternoon sun, which is about 120 kWh of electricity across a 150-day season at a COP of 3.2.",
    ],
    [
      "Are curtains better than blinds for keeping heat out?",
      "They are similar, because both are interior shading and both work on the heat that has already passed through the glass. What matters more is colour and tightness of fit: a light or reflective backing and a pelmet that closes the gap at the top beat a heavier fabric hanging loose, since a warm-air convection loop behind an open-topped curtain carries heat straight into the room.",
    ],
    [
      "How much heat comes through a window?",
      "Single clear 5 mm glass has a solar heat gain coefficient of about 0.82 and a U-value near 5.8 W/sqm·K, so 2 sqm facing 400 W/sqm of sun with 8 °C between inside and outside admits roughly 750 W — comparable to a small room heater running continuously. Double glazing with a low-E coating cuts that to about 350 W before any curtain is fitted.",
    ],
    [
      "Is external shading better than curtains?",
      "External shading is significantly more effective, because it stops sunlight before it reaches the glass rather than after. A chajja, awning, external blind or a tree on the west side removes most of the solar gain at source, while an interior curtain can only re-radiate part of the heat back out through the window it is hanging behind.",
    ],
  ],
};

export default seo;
