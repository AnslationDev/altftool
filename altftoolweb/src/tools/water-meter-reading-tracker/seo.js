const seo = {
  title: "Water Meter Reading Tracker: Litres Per Day & Leaks",
  metaDescription:
    "Turns dated meter readings into litres per day and per person, flags a period over 30% above your median, and costs it at your tariff.",
  steps: [
    "Choose the Meter unit, then set People in the household, Tariff (₹ per unit), Fixed monthly charge (₹) and Benchmark (litres per person per day).",
    "Under \"Readings, oldest first\" enter each Reading date and Meter value; Add a reading extends the log past the two the tool requires.",
    "Read Average litres per day, Litres per person per day, Change against your median and Projected monthly bill, then press Copy result for the full log.",
  ],
  intro:
    "This tracker turns a list of dated water meter readings into the numbers that matter: litres used per day, litres per person per day, cost per period, and whether the latest period has jumped far enough above your own median to suggest a leak. Consumption is the difference between two readings divided by the days between them, with one kilolitre — the unit on most domestic dials — equal to one cubic metre or 1,000 litres. Per-person use is compared against the 135 litres per capita per day that India's CPHEEO manual uses to size piped supply with sewerage.",
  useCases: [
    "Keep a monthly meter log for a flat or housing society and see consumption per person rather than a single opaque bill figure.",
    "Catch a leaking cistern or underground line early by watching whether the household's floor consumption creeps up.",
    "Check a water bill against your own readings before disputing it with the utility.",
  ],
  benefits: [
    ["Per-person, not just per-bill", "Divides by household size so a growing family and a leak look different."],
    ["Leak signal from your own data", "Flags a period more than 30% above the household's median instead of an arbitrary limit."],
    ["Any billing unit", "Works with meters that read in kilolitres or straight litres, at your tariff."],
  ],
  faqs: [
    [
      "How do I read a domestic water meter?",
      "Read the black digits from left to right — those are whole kilolitres, each equal to 1,000 litres or one cubic metre. The red digits or dials after them are fractions of a kilolitre, useful for leak testing but usually not billed. Note the reading with the date; consumption is always the difference between two readings.",
    ],
    [
      "How do I check for a water leak using the meter?",
      "Close every tap and appliance in the house, note the meter reading including the red fraction dials, then wait an hour without using any water and read it again. Any movement means water is escaping somewhere between the meter and your fixtures. A tap dripping about once a second wastes roughly 15 litres a day, and a continuously seeping toilet cistern can waste 200 litres or more.",
    ],
    [
      "How many litres of water does a person use per day?",
      "India's CPHEEO Manual on Water Supply and Treatment uses 135 litres per capita per day as the design figure for towns with piped supply and sewerage, and 70 lpcd where there is piped supply without sewerage. Actual household use varies widely with garden watering, washing machines and the number of bathrooms — the useful comparison is against your own past months.",
    ],
    [
      "Why is my water bill higher than last month with the same usage?",
      "Check the days in the billing period first: a 34-day cycle against a 28-day one is over 20% more water at identical daily use, which is why comparing litres per day matters more than comparing totals. After that, look for a tariff slab crossing, a revised fixed charge, or an estimated rather than actual reading on one of the bills.",
    ],
  ],
};

export default seo;
