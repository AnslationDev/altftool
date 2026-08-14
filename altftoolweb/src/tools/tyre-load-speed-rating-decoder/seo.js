const seo = {
  title: "Tyre Load Index and Speed Rating Decoder (ETRTO)",
  metaDescription:
    "Decode a sidewall code like 205/55 R16 91V into kg per tyre and km/h from the ETRTO tables, plus sidewall height, overall diameter and revs per kilometre.",
  steps: [
    "Type the code into \"Tyre code from the sidewall\", or tap an example chip such as 205/55 R16 91V or LT265/75R16 123/120Q.",
    "Set \"Tyres on the vehicle\" and, optionally, \"Gross vehicle weight (kg, optional)\" from the VIN plate so the fitted set is checked against it.",
    "Read \"Load per tyre\" in kg with the load index and speed symbol in km/h, plus section width, sidewall height and rim diameter, then press Copy result.",
  ],
  intro:
    "This decoder turns a sidewall code such as 205/55 R16 91V into the numbers behind it: the kilograms one tyre may carry, the speed the tyre is rated for in km/h and mph, and the geometry that follows from the size — sidewall height, overall diameter and revolutions per kilometre. Load index and speed symbol values come from the ETRTO tables reproduced in ECE Regulation 30, so 91 means 615 kg per tyre and V means 240 km/h. Enter your vehicle's gross weight and it also checks that the fitted set can legally carry it.",
  useCases: [
    "Checking that a replacement tyre's load index is not lower than the one specified on the vehicle placard.",
    "Working out how much a size change alters overall diameter, and therefore speedometer reading and gearing.",
    "Confirming a trailer or light-truck tyre carries enough kilograms per corner for the loaded gross weight.",
  ],
  benefits: [
    ["Full ETRTO tables", "Load indices 20-150 and every speed symbol from B to Y, including the open-ended ZR and bracketed (Y) markings."],
    ["Geometry, not just letters", "Sidewall height, overall diameter and revolutions per km fall out of the same code."],
    ["Load check against gross weight", "Enter the vehicle's GVW and see whether the fitted set has the capacity for it."],
  ],
  faqs: [
    [
      "What does 91V mean on a tyre?",
      "91 is the load index and V is the speed symbol: the tyre may carry 615 kg and is rated to 240 km/h. Four such tyres give 2,460 kg of total capacity. Both ratings apply only at the tyre's specified inflation pressure — an under-inflated tyre does not carry its rated load.",
    ],
    [
      "Can I fit a tyre with a lower load index than the original?",
      "No. The load index on the vehicle placard is the minimum, and fitting anything lower means the tyres cannot carry the vehicle at its gross weight — which typically voids insurance and fails inspection. A higher load index is acceptable, though it usually rides firmer because the casing is stiffer.",
    ],
    [
      "What does the speed rating actually limit?",
      "The maximum sustained speed the tyre is certified for at its rated load and correct pressure — H is 210 km/h, V is 240, W is 270 and Y is 300. ZR in the size, or a symbol in brackets like (Y), signals an open-ended rating above 240 and 300 km/h respectively. Ratings drop when the tyre is overloaded, under-inflated or damaged.",
    ],
    [
      "How do I calculate a tyre's overall diameter from its size?",
      "Sidewall height = section width x aspect ratio / 100, and overall diameter = rim diameter in inches x 25.4 + twice the sidewall height. A 205/55 R16 has a 112.75 mm sidewall and a 631.9 mm overall diameter, giving about 504 revolutions per kilometre before load deflection is allowed for. Keep a replacement size within roughly 3% of the original diameter or the speedometer reading drifts.",
    ],
  ],
};

export default seo;
