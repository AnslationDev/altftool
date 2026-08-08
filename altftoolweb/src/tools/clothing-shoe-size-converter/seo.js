const seo = {
  title: "Clothing & Shoe Size Converter: US, UK, EU, IN, cm",
  metaDescription:
    "Convert a size between US, UK, EU, Indian and cm, or get a recommendation from a chest, waist or foot-length measurement and a fit preference.",
  steps: [
    "Choose a Main Category of Clothing or Footwear, a Demographic of Men, Women or Kids, and for clothing a Garment Type.",
    "In Instant Converter pick the From System and type Your Size (e.g. 10, M, 42) to see the Equivalent Sizes in every other system; Pin to History or Add to My Vault keeps the row.",
    "Or open Measurement Lab, enter Chest and Waist under Anatomic Inputs or a Foot Length (CM), pick a Preferred Fit Silhouette — SLIM, REGULAR, LOOSE or OVERSIZED — and read the size in Recommended Matrix.",
  ],
  intro:
    "Clothing & Shoe Size Converter maps a size between the US, UK, EU, Indian and centimetre systems using a reference table, and separately recommends a size from a measurement you take yourself — chest or waist in inches for clothing, foot length in centimetres for shoes. It is for anyone ordering from an overseas store where a UK 8 and a US 9 are the same shoe. Conversion is a lookup rather than a calculation because the scales are incompatible by design: EU sizes step 2/3 cm at a time (the Paris point) while US and UK sizes step 1/3 inch (a barleycorn).",
  useCases: [
    "Order trainers from a US site when you normally buy UK sizes — a UK 8.5 is a US 9, EU 42.5, and fits a 27 cm foot",
    "Measure a child's foot before a school-shoe order instead of guessing from last year's size",
    "Pick between S and M on a European shirt by chest measurement and intended fit rather than by the letter on the label",
  ],
  benefits: [
    ["Five systems in one row", "US, UK, EU, Indian and centimetre values sit on the same line, so nothing has to be converted twice."],
    ["Measurement-first recommendation", "Enter a foot length or chest measurement and the tool returns the size that fits, rather than asking what size you usually take."],
    ["Fit preference built in", "Slim, Regular, Loose and Oversized shift the match by −2, 0, +2 and +4 inches on the body measurement, so the same chest can land on different sizes deliberately."],
  ],
  faqs: [
    [
      "What is my US shoe size if I wear a UK 8?",
      "A men's UK 8 is a US 8.5, EU 42 and a foot length of about 26.5 cm. UK sizes run roughly half a size below US men's sizes throughout the range, which is why a straight number swap is wrong.",
    ],
    [
      "How do I measure my foot for the right shoe size?",
      "Stand on paper with your heel against a wall, mark the tip of your longest toe, and measure heel to mark in centimetres — late in the day, when feet are at their largest, and with the socks you will wear. Measure both feet and use the longer one. The tool then picks the first size whose length is at or above your measurement, so you round up rather than down; 26.2 cm gives a men's US 8.5, not an 8.",
    ],
    [
      "Why is there no formula to convert shoe sizes?",
      "Because the scales use different units and different zero points. The EU scale counts Paris points of 2/3 cm; the US and UK scales count barleycorns of 1/3 inch (8.47 mm) from different starting lengths, and US men's and women's sizes are offset from each other again. Any single formula drifts by a full size across the range, so a reference table is the accurate approach.",
    ],
    [
      "Should I size up for an oversized fit?",
      "Usually yes, and this tool does it arithmetically: the Oversized setting adds 4 inches to your chest or waist before matching, Loose adds 2, and Slim subtracts 2. A 35-inch chest matches a men's S at a regular fit and an M at oversized, without you having to guess.",
    ],
  ],
};

export default seo;
