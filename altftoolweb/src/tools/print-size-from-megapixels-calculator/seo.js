const seo = {
  title: "Print Size From Megapixels: Max Inches at Any PPI",
  metaDescription:
    "Divide pixel dimensions by your target PPI for the largest print in inches and cm, the megapixels a print size needs, and the PPI viewing distance allows.",
  steps: [
    "Enter 'Pixel width', 'Pixel height' and 'Target PPI', or tap a camera preset like '24 MP — 6000 × 4000' and a PPI chip from 360 down to 72.",
    "Read the print size headline in inches and centimetres, plus the 'Largest print at each quality level' table from 360 PPI maximum detail to 72 PPI banners.",
    "Fill 'Print width (inches)' and 'Print height (inches)' under 'Do I have enough pixels for this print?' to see the pixels and megapixels needed, then press 'Copy result'.",
  ],
  intro:
    "Print Size From Megapixels Calculator divides an image's pixel dimensions by a target pixels-per-inch figure to give the largest print it supports, in inches and centimetres, and works the calculation backwards to say how many megapixels a chosen print size needs. It also applies the one-arcminute visual acuity limit — required PPI ≈ 3438 ÷ viewing distance in inches — so you can judge whether 300 PPI is genuinely necessary or whether 150 will look identical from where the print will hang.",
  useCases: [
    "Checking that a 24 MP file (6000 × 4000) prints at 20 × 13.3 inches at the 300 PPI gallery standard.",
    "Working out that a 16 × 20 inch print at 300 PPI needs 4800 × 6000 pixels, or 28.8 megapixels.",
    "Deciding whether a phone photo is enough for a metre-wide canvas viewed from two metres away.",
    "Quoting a lab the exact PPI a file will land at when printed to a fixed paper size.",
  ],
  benefits: [
    ["Both directions", "Pixels to print size, and print size back to the megapixels required."],
    ["Viewing-distance aware", "Uses the arcminute acuity limit instead of assuming 300 PPI is always needed."],
    ["Inches and centimetres", "Every quality level shown in both units, so lab specs in either system work."],
  ],
  faqs: [
    [
      "How big can I print a 24-megapixel photo?",
      "A 24 MP file of 6000 × 4000 pixels prints 20 × 13.3 inches (50.8 × 33.9 cm) at 300 PPI, 25 × 16.7 inches at 240 PPI, and 40 × 26.7 inches at 150 PPI, which is fine for a poster viewed from a metre away.",
    ],
    [
      "How many megapixels do I need for a 16×20 inch print?",
      "At 300 PPI you need 4800 × 6000 pixels, which is 28.8 megapixels. At the more common lab default of 240 PPI it drops to 3840 × 4800, or 18.4 megapixels — and at 200 PPI, 12.8 megapixels is enough.",
    ],
    [
      "Is 300 DPI always necessary for printing?",
      "No. 300 PPI matches what 20/20 vision can resolve at about 11 inches, which is why it became the standard for books and handheld prints. A print viewed from three feet only needs about 95 PPI, so large wall pieces are routinely printed at 150 PPI or less.",
    ],
    [
      "What is the difference between PPI and DPI?",
      "PPI counts image pixels per inch of print and is what determines detail. DPI counts ink droplets the printer lays down, often 1440 or 2880 on a photo inkjet, and several droplets combine to render one pixel. Send files at the right PPI and let the driver handle DPI.",
    ],
  ],
};

export default seo;
