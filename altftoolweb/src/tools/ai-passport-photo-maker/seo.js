const seo = {
  intro:
    "This passport photo maker crops any photo to an official ID size — 51 × 51 mm for US and Indian passports, 35 × 45 mm for Schengen, UK and Indian forms — and shows the published chin-to-crown head band you have to fit inside it. It converts millimetres to pixels at 300, 400 or 600 dpi using the exact 25.4 mm inch, then lays out a print sheet on 4×6, 5×7, A6 or A4 paper. Everything runs in your browser, so the photo is never uploaded.",
  useCases: [
    "Turn a phone selfie into a 51 × 51 mm, 602 × 602 px file for an online Indian passport application.",
    "Lay out six 35 × 45 mm Schengen visa photos on a single 4 × 6 inch sheet for a corner photo lab.",
    "Check before paying for prints whether a 900 × 1200 px photo is sharp enough for a 300 dpi ID print.",
  ],
  benefits: [
    ["Published sizes, not guesses", "Every size and head band is quoted from the issuing authority, and the source is shown next to it."],
    ["Print-sheet maths done for you", "It works out how many copies fit on your paper, in which orientation, and how much paper is wasted."],
    ["Nothing leaves your device", "Cropping and export happen on a canvas in the browser — no upload, no account, no stored photo."],
  ],
  faqs: [
    [
      "What size is an Indian passport photo?",
      "51 × 51 mm — 2 × 2 inches — on a plain white background, which is 602 × 602 pixels at 300 dpi. The head measured from chin to crown should be 25 to 35 mm, so roughly half to two-thirds of the frame height.",
    ],
    [
      "What resolution does a passport photo need?",
      // Sync note: these are minimum SOURCE sizes before cropping, from checkResolution()'s
      // Math.ceil(mm -> px at 300 dpi) in lib.js — a touch larger than the 602 x 602 px final
      // exported file size quoted above, which comes from computeGeometry()'s Math.round.
      "300 dpi is the print standard, so before cropping, your original photo should be at least 414 × 532 pixels for a 35 × 45 mm photo, and at least 603 × 603 pixels for a 51 × 51 mm photo — both slightly bigger than the final exported file (602 × 602 px for the 51 × 51 mm size), since the crop rounds off a couple of pixels. Because cropping throws pixels away, start from an original of 1000 pixels or more on the short edge.",
    ],
    [
      "How many passport photos fit on a 4 × 6 inch sheet?",
      "Four 51 × 51 mm photos fit edge to edge on a 102 × 152 mm sheet, or eight 35 × 45 mm photos with the sheet turned landscape. Adding a 2 mm gap and a 4 mm margin — the safer setting for home printers that cannot print to the edge — drops that to two and six respectively; the tool recalculates as you change either number.",
    ],
    [
      "Is the background required to be white?",
      "It depends on the country. The United States, India, Canada, China, Australia and Japan all ask for plain white or off-white; the UK and the Schengen countries accept a light grey or cream background instead. The tool shows the required background next to whichever standard you pick.",
    ],
  ],
};

export default seo;
