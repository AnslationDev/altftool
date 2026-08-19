const seo = {
  title: "Clothing Size Converter: US, UK, EU, Italy, Japan",
  metaDescription:
    "Convert a size or a bust/chest measurement between US, UK/India, EU, French, Italian and Japanese charts, with the cm each row actually represents.",
  steps: [
    "Pick the Size chart — Women's dresses and tops, or Men's jackets, suits and tops — and whether to Start from a size you already know or your body measurement.",
    "Give the size and the system it is in, or the bust or chest measurement in cm or inches, then set \"I am shopping in\" to US, UK / India / Australia, EU, France, Italy or Japan.",
    "Read the \"Ask for size\" figure with the bust or chest and waist on that row and every other system's equivalent, then press \"Copy result\".",
  ],
  intro:
    "This converter maps a clothing size between the US, UK, EU, French, Italian and Japanese systems, either from a size you already wear or from a bust or chest measurement in centimetres or inches. It works from body-measurement tables rather than arithmetic tricks, because sizes are nominal labels rather than units — the European standard EN 13402 exists precisely to put the body dimensions on the label. Across mainstream charts the pattern is stable: for women UK = EU − 28, US = EU − 32, France = EU + 2 and Italy = EU + 4; for men the EU jacket number is half the chest in centimetres and the UK or US number is the chest in inches.",
  useCases: [
    "Buying a dress in Italy when you only know your UK size.",
    "Ordering from a US site that lists sizes 0 to 16 when your label says EU 38.",
    "Using a tape measure in a shop where nothing is labelled in a system you recognise.",
  ],
  benefits: [
    ["Measurement-anchored", "Every row carries the bust, chest and waist it represents, so you can check against your own tape."],
    ["Both directions", "Start from a size you know or from a measurement when the label means nothing to you."],
    ["Honest about the limits", "Tells you when you sit between two rows instead of pretending sizing is exact."],
  ],
  faqs: [
    [
      "What is a US size 6 in EU sizing?",
      "EU 38, which is UK 10, French 40, Italian 42 and Japanese 9, fitting a bust of about 88 cm. The reliable shortcut in women's sizing is US = EU − 32 and UK = EU − 28.",
    ],
    [
      "What is my size in Europe if I wear a UK 12?",
      "EU 40 — French 42, Italian 44, US 8 — sitting at roughly a 92 cm bust and a 76 cm waist. Italian sizing runs four numbers above the German-style EU number, which is why an Italian 44 and an EU 40 are the same garment.",
    ],
    [
      "How do men's jacket sizes convert between the UK and Europe?",
      "Add 10 to the UK or US chest size in inches to get the European number: a 40 inch chest is a EU 50, a 42 is a EU 52. The European figure is simply the chest in centimetres divided by two, so EU 50 means a 100 cm chest.",
    ],
    [
      "Why does the same size fit differently in different shops?",
      "Vanity sizing. Charts describe body measurements, but brands attach labels to those measurements as they choose, and a single brand can drift one to two sizes over the years and across its own lines. Measure your bust or chest, compare with the shop's own size guide rather than a generic chart, and check whether returns are possible before buying abroad.",
    ],
  ],
};

export default seo;
