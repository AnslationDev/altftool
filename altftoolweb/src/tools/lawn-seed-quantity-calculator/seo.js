const seo = {
  title: "Grass Seed Calculator: kg, Bags & Sowing Rate",
  metaDescription:
    "Convert your lawn area and grass species into kilograms of seed and whole bags, corrected for the purity and germination printed on the label.",
  steps: [
    "Enter the Lawn area and its unit, then pick the Grass species and whether you are sowing a new lawn or overseeding.",
    "Type the Purity and Germination percentages from the seed label, a Wastage allowance (%), the Bag size sold (kg) and the seed price per kg (INR).",
    "Read the grass seed needed in kg with bags to buy, estimated cost and the g/m² rate actually applied, then click Copy result.",
  ],
  intro:
    "Grass seed is sold by weight but sown by rate, and this calculator converts one into the other: it takes the published sowing rate for your species, adjusts it for whether you are starting a lawn or overseeding, corrects for the pure live seed figure on the bag (purity multiplied by germination), adds a wastage allowance and returns kilograms and bag count. Rates are the standard pounds-per-1000-square-feet ranges converted at 1 lb/1000 sq ft = 4.88 g/m².",
  useCases: [
    "You are seeding a 100 m² back garden with perennial ryegrass and need to know whether one 5 kg bag is enough.",
    "You are overseeding dormant Bermuda lawn before winter and want the reduced rate rather than the new-lawn rate.",
    "You found a cheap bag with 62% germination and want to see how much extra weight that low figure actually costs you.",
  ],
  benefits: [
    ["Species-specific rates", "Kentucky bluegrass at 15 g/m² and tall fescue at 35 g/m² are not interchangeable — the tool uses the published figure for each."],
    ["Pure live seed correction", "Applies the purity and germination printed on the label, so poor seed is compensated for instead of quietly under-sowing."],
    ["Bags and cost, not just grams", "Rounds up to whole bags at your bag size and shows the spend, which is what you actually take to the nursery."],
  ],
  faqs: [
    [
      "How much grass seed do I need per square metre?",
      "Between 2 and 35 g/m² depending on species: about 35 g/m² for perennial ryegrass and tall fescue, 22 g/m² for fine fescue, 15 g/m² for Kentucky bluegrass, and only 5–10 g/m² for Bermuda and zoysia because their seed is far smaller. Overseeding an existing lawn uses roughly half these rates.",
    ],
    [
      "What does pure live seed mean on a grass seed bag?",
      "Pure live seed is purity multiplied by germination — a bag that is 98% pure with 85% germination is 83% pure live seed, so 17% of the weight will never produce a plant. Comparing two bags on price per kilogram of pure live seed rather than per kilogram is the honest comparison.",
    ],
    [
      "Is it better to sow grass seed heavy or light?",
      "Sow at the recommended rate, not above it. Over-seeding crowds the seedlings so they compete for water and light, produces thin spindly grass and raises the risk of damping-off disease; under-seeding leaves gaps for weeds. Extra seed is only justified as a wastage allowance, typically 5–15%.",
    ],
    [
      "When should I sow grass seed in India?",
      "Warm-season grasses such as Bermuda, zoysia and centipede need soil above about 20°C, so February to April or just after the first monsoon rains work best. Cool-season ryegrass and fescue are usually sown October to November in northern India, and are often used to overseed a dormant Bermuda lawn for a green winter.",
    ],
  ],
};

export default seo;
