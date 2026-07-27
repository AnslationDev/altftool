const seo = {
  intro:
    "GSM stands for grams per square metre, so the weight of any sheet is exactly its area in square metres multiplied by its GSM — an A4 sheet is 0.0624 sq m, which at 80 GSM comes to 4.99 g. This calculator applies that definition to give sheet weight, 500-sheet ream weight, the paper weight of a full print run, caliper and stack height, and the parcel weight a courier will bill including volumetric weight. It also converts US pound basis weights (Bond, Text, Cover, Index, Bristol and Tag) to GSM using each grade's own basis sheet size.",
  useCases: [
    "Checking that a 500-sheet ream of A4 80 GSM copier paper should weigh about 2.5 kg before accepting a delivery.",
    "Estimating the shipping weight of 5,000 printed A4 flyers at 130 GSM before booking a courier.",
    "Translating a US spec sheet that says 100 lb Cover into the 270 GSM your Indian printer quotes in.",
    "Working out how tall a 2,000-sheet stack of 300 GSM card will be so it fits the shelf or the carton.",
  ],
  benefits: [
    [
      "Exact by definition",
      "Sheet and ream weights come straight from the GSM definition, with no rounded conversion factor in the way.",
    ],
    [
      "Six US grades covered",
      "Bond, Text, Cover, Index, Bristol and Tag each use their own basis sheet size, so the pound figures are right.",
    ],
    [
      "Shipping-ready output",
      "Adds packaging weight, stack height and volumetric weight so you can compare against a courier rate card.",
    ],
  ],
  faqs: [
    [
      "How do you calculate paper weight from GSM?",
      "Multiply the sheet area in square metres by the GSM. An A4 sheet is 0.210 m x 0.297 m = 0.0624 sq m, so at 80 GSM it weighs 4.99 g and a 500-sheet ream weighs about 2.49 kg. The relationship is exact because GSM is defined as grams per square metre.",
    ],
    [
      "What is 20 lb bond in GSM?",
      "20 lb Bond is about 75 GSM. US basis weight is the weight of 500 sheets at the grade's basis size, and Bond uses a 17 x 22 in basis sheet, which works out to roughly 3.76 GSM per pound. On the same logic 80 lb Text is about 118 GSM and 100 lb Cover is about 270 GSM.",
    ],
    [
      "Does higher GSM always mean thicker paper?",
      "No. Thickness is GSM multiplied by bulk, and bulk varies by stock: coated art paper is compressed to a bulk near 0.8, uncoated offset sits near 1.25 and textured board can exceed 1.45. A 150 GSM uncoated sheet can therefore be thicker than a 170 GSM gloss sheet even though it weighs less.",
    ],
    [
      "How much does a ream of A4 paper weigh?",
      "A 500-sheet ream of A4 at 80 GSM weighs about 2.49 kg of paper, plus roughly 100-150 g of wrapper and packaging. At 70 GSM the same ream is about 2.18 kg and at 100 GSM about 3.12 kg. Weigh a sample before booking freight, since moisture content shifts the figure by a couple of percent.",
    ],
  ],
};

export default seo;
