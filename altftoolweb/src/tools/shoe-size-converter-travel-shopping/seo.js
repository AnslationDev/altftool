const seo = {
  title: "Shoe Size Converter: UK, US, EU, India & Japan",
  metaDescription:
    "Convert UK, Indian, US men's, US women's, EU and Japanese shoe sizes via foot length, with exact and rounded sizes plus a ladder of nearby sizes.",
  steps: [
    "Pick the system you know under 'I know my size in' — UK / India, US men's, US women's, EU (Paris point), Japan / Mondopoint (cm) or Foot length (cm) — and type your Size, or your Measurement in Centimetres or Inches.",
    "Choose the country you are buying in under 'I am shopping in'; every conversion recomputes from foot length as you type, with no submit button.",
    "Read the big 'Ask for' size, the full table of exact and rounded sizes for all six systems, and the 'Sizes around yours' ladder, then press Copy result for a text summary.",
  ],
  intro:
    "This converter translates a shoe size between UK, Indian, US men's, US women's, EU and Japanese sizing by working back to foot length, the one quantity all the systems are built on. UK and Indian sizes use the barleycorn scale of 1/3 inch per size (UK = 3 × foot inches − 23), US men's run one size above UK and US women's two and a half above, EU uses the Paris point of 2/3 cm over a last 1.5 cm longer than the foot, and Japanese sizing is the foot length in centimetres itself.",
  useCases: [
    "Buying trainers in a US store when your shoes are labelled UK 8.",
    "Ordering Italian leather shoes in EU sizes with only a foot measurement to go on.",
    "Checking whether a Japanese size marked 26 will fit before you try it on.",
  ],
  benefits: [
    ["Foot length is the anchor", "Every conversion routes through a measurable length instead of chaining approximations."],
    ["Shows the exact and rounded size", "You can see when your foot falls between two available sizes rather than on one."],
    ["Ladder of nearby sizes", "The half sizes either side are listed so you know what else to ask for."],
  ],
  faqs: [
    [
      "What is a UK 8 in EU sizes?",
      "EU 42, which is US men's 9, US women's 10.5 and a foot length of about 26.2 cm. The exact Paris-point figure is 41.6, so a EU 41 may also fit depending on the last.",
    ],
    [
      "Are Indian shoe sizes the same as UK sizes?",
      "Yes — Indian adult footwear follows UK sizing, so an Indian 8 and a UK 8 are the same size. That also means Indian sizes sit one number below US men's sizes and 2.5 below US women's.",
    ],
    [
      "How do I measure my foot for shoe size?",
      "Stand on a sheet of paper with your heel against a wall, mark the tip of your longest toe, and measure the distance in centimetres — that is your Mondopoint or Japanese size directly. Measure at the end of the day when feet are at their largest, wear the socks you intend to use, and size to the longer foot.",
    ],
    [
      "Why do EU sizes not have half sizes?",
      "Because the EU step is a Paris point of 6.67 mm while a UK half size is only 4.23 mm, so the European scale is already coarser and manufacturers stay with whole numbers. A foot that sits neatly on a UK half size therefore often lands between two EU numbers, which is why trying both is worthwhile.",
    ],
  ],
};

export default seo;
