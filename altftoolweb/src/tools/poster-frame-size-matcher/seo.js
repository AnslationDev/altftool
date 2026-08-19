const seo = {
  title: "Poster Frame Size Matcher: Crop, Border, DPI",
  metaDescription:
    "Ranks A5-A0, 4x6 to 24x36 inch and 10x15 to 70x100 cm frames by how far each is off your ratio, with printed size, mount border and crop percentage.",
  steps: [
    "Enter Artwork width and Artwork height and set Measured in to Pixels, Millimetres, Centimetres or Inches; with Pixels chosen, Print resolution (DPI) converts them into a physical size.",
    "Set Minimum mount border (mm) for the border you want left on every edge, and switch between Fit whole artwork and Fill and crop to see the preview both ways.",
    "Best matching stock frame names the closest opening, with Printed size inside the frame, Mount border left over, Crop needed to fill the frame, Resolution at printed size and Pixels needed for 300 DPI beneath it, and the table Every stock size, closest shape first ranks the rest.",
  ],
  intro:
    "Poster Frame Size Matcher compares the aspect ratio of your artwork against off-the-shelf frame openings and reports which stock size fits with the least cropping. It covers the ISO 216 A-series (A5 to A0, all 1 : √2), common imperial openings from 4×6 to 24×36 inches, and metric sizes from 10×15 cm to 70×100 cm, showing the printed size, the leftover mount border and the percentage of image you would lose to fill each frame. Useful before you order a print, because the cheapest framing is always a ready-made frame your image already fits.",
  useCases: [
    "Check whether a 3:2 camera file can go into an A4 frame without slicing the top and bottom off the subject.",
    "Work out the mount border you get when a 30×40 cm print is centred in a 40×50 cm frame.",
    "Decide between cropping a square Instagram export to 4×6 or reprinting it at a size that matches a square frame.",
    "Confirm a 3000 × 2000 pixel file still hits 300 DPI at the frame size you plan to print.",
  ],
  benefits: [
    ["Ratio first, size second", "Sorts by shape mismatch, so the frames that need no cropping surface at the top."],
    ["Mount border built in", "Set a minimum mount width and the printed size adjusts to leave that border on every edge."],
    ["Resolution check", "Shows the DPI you actually get at the printed size and the pixels needed for a clean 300 DPI print."],
  ],
  faqs: [
    [
      "What frame size fits a 3:2 photo?",
      "Standard 3:2 openings are 4×6, 8×12, 12×18, 20×30 and 24×36 inches, plus 10×15 and 20×30 cm in metric. A-series frames are not 3:2 — A4 is 1 : 1.414 — so a 3:2 photo in an A4 frame needs about 6% cropped off the long side or a mount to make up the difference.",
    ],
    [
      "Why does my photo not fit an A4 frame?",
      "Because the ISO 216 A-series uses a 1 : √2 ratio (roughly 1 : 1.414), while most cameras shoot 3:2 (1 : 1.5) and phones often shoot 4:3. The shapes are close but not equal, which is why an A4 print of a camera file always leaves a thin strip of white or loses a strip of image.",
    ],
    [
      "How many pixels do I need for a poster-sized print?",
      "At 300 DPI you need about 118 pixels per centimetre, so a 50×70 cm print wants roughly 5900 × 8270 pixels. Large posters viewed from a distance are commonly printed at 150 DPI, which halves that requirement — the tool shows the resolution you would actually achieve at the chosen frame size.",
    ],
    [
      "Should I crop my image or add a mount?",
      "Add a mount when the subject reaches the edge of the frame or the crop would exceed roughly 10% of the image; crop when the composition has spare margin. A mount also keeps the print off the glass, which is why conservation framers use one regardless of ratio.",
    ],
  ],
};

export default seo;
