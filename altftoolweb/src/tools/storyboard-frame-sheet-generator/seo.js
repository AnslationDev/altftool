const seo = {
  intro:
    "Storyboard Frame Sheet Generator lays out a printable board where every frame is drawn at your actual shooting ratio — 16:9, 1.85:1, 2.39:1 anamorphic scope, 4:3 Academy or 9:16 vertical — rather than a generic rectangle. It sizes the frames from the paper, margin, gutter and grid you choose, adds a notes area beside or beneath each frame, and tells you whether the rows fit the printable height, how many sheets the whole board needs and how many blank cells are left on the last one.",
  useCases: [
    "Print 2.39:1 frames for a scope short so the boards match what the lens will actually see.",
    "Check whether four rows of 16:9 frames plus notes still fit on A4 before sending it to the printer.",
    "Make vertical 9:16 boards for a social campaign instead of cropping a widescreen template.",
    "Work out how many sheets a 60-shot sequence needs at three frames a page.",
  ],
  benefits: [
    ["True shooting ratio", "Frame height comes from the ratio, so a sketch that fills the box fills the finished frame."],
    ["Fit checked before printing", "Reports the height the grid needs against the printable area, and how many rows would actually fit."],
    ["Printer-margin aware", "Flags margins inside the 6.35 mm edge most desktop printers cannot image."],
  ],
  faqs: [
    [
      "What aspect ratio should storyboard frames be?",
      "Match the ratio you are shooting. 16:9 (1.78:1) for most video and streaming work, 1.85:1 for flat theatrical, 2.39:1 for anamorphic scope, 4:3 for Academy or classic television, and 9:16 for vertical short-form. Boarding a scope film on 16:9 boxes wastes the composition work, because the real frame is far wider than what you drew.",
    ],
    [
      "How many storyboard frames fit on an A4 page?",
      "With 12 mm margins, an 18 mm header, an 8 mm gutter and a notes strip under each 16:9 frame, a 2 × 3 grid fits comfortably on A4 — six frames of about 89 × 50 mm each. Dropping the notes area or using landscape orientation lets you fit more, and the tool reports the maximum rows that still fit whatever you choose.",
    ],
    [
      "Why should I print storyboards at 100% scale?",
      "Because a printer driver set to shrink-to-fit rescales the page, which changes the margin and can distort the frame proportions you carefully set. Choose actual size or 100% in the print dialog so the frames come out at the millimetre dimensions shown here.",
    ],
    [
      "What should go in the notes area next to each frame?",
      "The information a frame cannot show: shot size and lens, camera movement, the dialogue or action beat, sound cues and the intended duration. Keeping it in a fixed column means the crew can scan down the page for one kind of information instead of reading every panel.",
    ],
  ],
};

export default seo;
