const seo = {
  title: "Density Calculator: g/cm3, kg/m3, Sinks or Floats",
  metaDescription:
    "Divide mass in grams by volume in cm3 or mL for density to three decimals, the kg/m3 equivalent, and whether the sample sinks or floats.",
  intro:
    "The Density Calculator divides mass by volume (ρ = m / V) to return density in g/cm³, converts the same figure to kg/m³, and tells you whether the material sinks or floats in water. Enter mass in grams and volume in cubic centimetres (millilitres) and you get the density to three decimal places plus the SI equivalent. It is built for students working physics and chemistry problems, makers checking a material sample, and anyone who has a weight and a displaced-water volume and needs the number in between.",
  useCases: [
    "You weighed a metal offcut at 89 g and measured 10 mL of water displacement — the calculator returns 8.900 g/cm³, close enough to copper to identify the scrap before you sell it.",
    "A lab report asks for density in SI units, so you enter the grams and millilitres you actually measured and read the kg/m³ row instead of doing the ×1000 conversion by hand.",
    "You are checking whether a resin blend or a 3D-print material will sit on top of water before you pour it, and want a quick sinks-or-floats answer from the sample you already weighed.",
  ],
  benefits: [
    ["Two units from one entry", "Reports g/cm³ and kg/m³ together, so lab work and SI-format answers come from the same measurement."],
    ["Buoyancy check built in", "Compares the result against water at 1 g/cm³ and states outright whether the sample sinks or floats."],
    ["Guards the zero-volume case", "A volume of zero returns a clear message instead of an infinite or NaN result you might copy into a report."],
  ],
  faqs: [
    [
      "How do I calculate density from mass and volume?",
      "Divide mass by volume: density = mass ÷ volume. With mass in grams and volume in cubic centimetres the answer comes out in g/cm³ — 100 g in 50 cm³ is 2.000 g/cm³.",
    ],
    [
      "Is 1 mL the same as 1 cm³?",
      "Yes, one millilitre equals exactly one cubic centimetre, so you can enter a water-displacement reading in mL directly into the volume field. That equivalence is why the field is labelled cm³ / mL.",
    ],
    [
      "How do I convert g/cm³ to kg/m³?",
      "Multiply by 1000 — 1 g/cm³ is 1000 kg/m³. The calculator shows that conversion on its own row so you do not have to shift the decimal yourself.",
    ],
    [
      "Will my material float in water?",
      "It floats if its density is below about 1 g/cm³ and sinks above it, since fresh water is roughly 1 g/cm³ (1000 kg/m³) at room temperature. The comparison assumes a solid object in fresh water and ignores trapped air, hollow shapes and salinity, all of which change real-world buoyancy.",
    ],
  ],
};

export default seo;
