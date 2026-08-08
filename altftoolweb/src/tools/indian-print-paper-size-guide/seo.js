const seo = {
  title: "Paper Size Chart: A4, Legal, Foolscap, SRA3, Demy",
  metaDescription:
    "A4, Legal, Foolscap/F4, SRA3 and Crown, Demy, Royal in mm, cm, inches, points and pixels at your DPI, plus how many pieces fit on a press sheet.",
  steps: [
    "Pick a Paper size — A4, Legal (8.5 x 14 in), F4 / Folio (210 x 330 mm), SRA3, Crown or Demy — and set \"Resolution for pixel figures (DPI)\".",
    "For imposition choose the Press sheet and Finished piece, then set \"Gripper / edge margin (mm)\" and \"Knife gap between pieces (mm)\".",
    "Read Centimetres, Inches, Points (PDF / PostScript), Pixels at your DPI and CSS pixels at 96 PPI, plus \"Pieces per sheet (ups)\" and the Grid, then press \"Copy result\".",
  ],
  intro:
    "This reference converts any standard print sheet size between millimetres, centimetres, inches, PostScript points and pixels at a chosen DPI, and tells you how many finished pieces fit on a press sheet. It covers ISO 216 A and B series, ISO 269 C envelopes, ISO 217 RA and SRA raw sheets, North American Letter and Legal, the foolscap and folio sizes Indian offices and printer drivers still list as FS or F4, and British trade names such as Crown, Demy, Royal and Imperial that Indian paper markets sell by. Useful for designers setting up artboards, print buyers checking a quote, and anyone deciding which sheet wastes the least paper.",
  useCases: [
    "Setting a Photoshop canvas for A4 at 300 DPI and needing the exact 2480 x 3508 pixel figure.",
    "Deciding between SRA3 and 13 x 19 in for a short digital run of A5 flyers by comparing ups per sheet and waste.",
    "Working out what a printer means when a quote says Demy or Double Crown rather than a metric size.",
    "Checking that a PDF page box of 595.28 x 841.89 points really is A4 before sending files to press.",
  ],
  benefits: [
    [
      "Every unit at once",
      "Millimetres, centimetres, inches, points, print pixels and CSS pixels from one selection.",
    ],
    [
      "Indian trade names included",
      "Foolscap, FS, F4, Crown, Demy, Royal and Imperial sit alongside the ISO and North American sizes.",
    ],
    [
      "Ups and waste per sheet",
      "Tries both piece orientations, applies a gripper margin and knife gap, and reports the trim waste.",
    ],
  ],
  faqs: [
    [
      "What is A4 size in pixels at 300 DPI?",
      "A4 is 210 x 297 mm, which is 8.268 x 11.693 inches, so at 300 DPI it is 2480 x 3508 pixels. At 96 CSS pixels per inch the same page is 794 x 1123 pixels, and in PDF points it is 595.28 x 841.89 pt.",
    ],
    [
      "What is the difference between legal and foolscap size in India?",
      "Legal is 8.5 x 14 in (215.9 x 355.6 mm). Foolscap is a family: the traditional British foolscap folio is 8 x 13 in (203.2 x 330.2 mm), most Asian printer drivers list F4 or Folio at 210 x 330 mm, and the FS setting is often 8.5 x 13 in (215.9 x 330.2 mm). Because the three differ by up to 25 mm, always confirm which one a form or press expects.",
    ],
    [
      "Why do Indian printers quote sizes like Demy, Royal and Double Crown?",
      "They are British trade paper sizes that survived in the Indian paper market: Crown is 15 x 20 in, Demy 17.5 x 22.5 in, Royal 20 x 25 in, Imperial 22 x 30 in and Double Crown 20 x 30 in. Mills cut them with a tolerance, so measure a delivered sheet before planning a tight imposition.",
    ],
    [
      "What is the difference between A3, RA3 and SRA3?",
      "A3 is the finished trimmed size at 297 x 420 mm. RA3 (305 x 430 mm) and SRA3 (320 x 450 mm) are ISO 217 raw formats, oversized so the press has room for bleed, colour bars and the gripper edge before the sheet is trimmed down. SRA3 is the standard sheet on most digital presses and holds two A4 pages.",
    ],
  ],
};

export default seo;
