const seo = {
  intro:
    "The Monitor PPI Calculator works out a display's pixel density from its native resolution and diagonal size using PPI = √(width² + height²) ÷ diagonal inches, then converts that into pixel pitch, retina distance and pixels per degree at your actual viewing distance. It is for anyone comparing two monitors on a spec sheet who needs to know which one will render text more sharply at the distance they really sit. Eight presets cover common panels from a 24-inch 1080p screen to a 49-inch super ultrawide, and the result is graded against a target density for desk work, design, gaming or close laptop use.",
  useCases: [
    "You are choosing between a 27-inch 1440p and a 27-inch 4K monitor and want the density gap in numbers — 108.8 PPI against 163.2 PPI on the same panel size.",
    "Text on your new screen looks soft and you want to know whether the panel is genuinely low-density or you are simply sitting too close for its retina distance.",
    "You are speccing monitors for a design team and need a pixel-pitch figure in millimetres to put in the purchase note alongside the resolution.",
  ],
  benefits: [
    ["The formula is shown, not hidden", "The result panel prints the actual substitution — √(w² + h²) ÷ diagonal — so you can check the arithmetic or repeat it for a screen that is not listed."],
    ["Density judged against your task", "Targets differ by use: about 110 PPI for desk work at 24 inches, 135 for design and code at 22, 95 for gaming at 30, and 160 for a laptop held at 18."],
    ["Angular sharpness, not just density", "Pixels per degree accounts for how far away you sit, which is what actually decides whether individual pixels are visible."],
  ],
  faqs: [
    [
      "How do you calculate PPI from screen size and resolution?",
      "Take the pixel diagonal with Pythagoras and divide by the physical diagonal in inches: PPI = √(width² + height²) ÷ diagonal. A 2560 × 1440 panel measuring 27 inches gives √(2560² + 1440²) = 2937 pixels across the diagonal, so 2937 ÷ 27 ≈ 108.8 PPI.",
    ],
    [
      "What is a good PPI for a monitor?",
      "Roughly 110 PPI is comfortable at a normal 24-inch desk distance, and around 135 PPI is the target if you stare at code or design work all day. Below about 90 PPI text starts to look soft up close; above 200 PPI you will usually need display scaling to keep text readable.",
    ],
    [
      "What does the retina distance figure mean?",
      "It is the distance at which individual pixels stop being resolvable by 20/20 vision, calculated as 3438 ÷ PPI inches — 3438 being the number of arcminutes in a radian, since one arcminute is the standard limit of acuity. A 108.8 PPI monitor reaches that point at about 31.6 inches, so sitting closer than that means you can still make out pixels.",
    ],
    [
      "What is pixel pitch and how does it relate to PPI?",
      "Pixel pitch is the centre-to-centre distance between adjacent pixels, calculated here as 25.4 ÷ PPI millimetres because there are 25.4 mm in an inch. At 108.8 PPI the pitch is about 0.233 mm; a smaller pitch always means a sharper image at the same viewing distance.",
    ],
  ],
};

export default seo;
