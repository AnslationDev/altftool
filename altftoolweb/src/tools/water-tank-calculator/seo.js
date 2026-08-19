const seo = {
  title: "Water Tank Calculator: 135 lpcd Sump & Overhead",
  metaDescription:
    "Size an overhead tank and sump from 135 lpcd (IS 1172), split 1/3 to 2/3, with a per-head breakdown, market sizes and pump filling time.",
  steps: [
    "Enter Adults, Children, Domestic help and Bathrooms / taps, plus garden area in sq m and cars if they apply.",
    "Pick Reserve days — 1, 2, 3, 5 or 7 — and adjust the child factor and wastage buffer (%).",
    "Read the daily requirement breakdown, total storage, overhead tank (1/3) and underground sump (2/3), then use the dimension helper and pump filling time.",
  ],
  intro:
    "The Water Tank Size Calculator works out a household's daily water requirement from the IS 1172:1993 / CPHEEO norm of 135 litres per capita per day, then converts it into storage — total capacity for your chosen reserve period, split one-third overhead tank and two-thirds underground sump. It is built for Indian homes being planned or retrofitted, and it shows every litre traced back to the head it came from: 5 lpcd drinking, 5 cooking, 55 bathing, 25 washing, 45 flushing. It also converts capacity to internal tank dimensions and tells you how long your pump will take to fill it.",
  useCases: [
    "You are building a house and the plumber has asked what sump size to cast — you enter the family, the bathrooms and the garden, pick a reserve of 2 days, and get a litre figure with the working shown.",
    "Your area is on alternate-day supply and you want to know whether the existing 1000 L overhead tank is enough, so you set reserve days to 3 and compare against your actual daily requirement.",
    "You have decided on a target capacity and need the internal measurements to hand to a mason: switch to litres to dimensions, set the depth you can dig, and read back length, width and height at your chosen proportion.",
  ],
  benefits: [
    ["Every litre is attributable", "The breakdown table names the norm behind each row — bathing at 55 lpcd, flushing at 45, garden at 5 L per sq m per day — so you can defend or adjust any assumption."],
    ["Sizes the tank you can actually buy", "It maps your overhead requirement to the standard market sizes (500, 750, 1000, 1500, 2000 and 5000 L) and tells you when two linked tanks are needed."],
    ["Design and verify in both directions", "Enter dimensions to get litres, or enter a target capacity and a workable depth to get the internal dimensions, with a 10% freeboard allowance you can toggle."],
  ],
  faqs: [
    [
      "How much water does one person use per day in India?",
      "135 litres per capita per day is the domestic standard in IS 1172:1993 and the CPHEEO manual for towns with piped supply and full sewerage. It splits into 5 L drinking, 5 L cooking, 55 L bathing, 25 L washing clothes and utensils, and 45 L flushing; where supply is limited, CPHEEO allows a lower 70–100 lpcd basis.",
    ],
    [
      "How should storage be split between the overhead tank and the sump?",
      "The calculator uses one-third overhead and two-thirds underground sump. The sump catches mains supply whenever it arrives, and the smaller overhead tank holds roughly a day's use and is refilled by the pump, which keeps the weight on the roof down.",
    ],
    [
      "What size tank do I need for a family of four?",
      "Work it from the daily requirement rather than a rule of thumb: four adults at 135 lpcd is 540 L a day before help, bathrooms, garden and the wastage buffer, so a 2-day reserve is over 1080 L of total storage and roughly a third of that overhead. Children are counted at a default 60% of the adult norm, which is a practical assumption rather than a BIS figure.",
    ],
    [
      "How do I convert tank dimensions to litres?",
      "One cubic metre is 1000 litres, so a rectangular tank is length × width × height in metres × 1000, and a cylindrical one is π × (diameter ÷ 2)² × height × 1000. Leave about 10% freeboard — the air gap at the top — so the usable capacity is around 90% of the brim-full volume, and measure internal faces because wall thickness sits outside these figures.",
    ],
  ],
};

export default seo;
