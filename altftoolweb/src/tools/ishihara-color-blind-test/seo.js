const seo = {
  title: "Ishihara Color Blind Test — Free 10-Plate Screening",
  h1: "Ishihara Color Blind Test",
  metaDescription:
    "Free Ishihara color blind test — 10 plates drawn fresh in your browser each run, 15 seconds per plate, plus protanopia and deuteranopia simulation.",
  intro:
    "The Ishihara Color Blind Test runs a 10-plate colour vision screening entirely in your browser. Each pseudoisochromatic plate is generated at load time on an HTML5 canvas: the target digit is drawn to an offscreen 400×400 buffer in bold Arial, then the alpha channel returned by getImageData decides whether each of up to 800 non-overlapping dots is painted from the foreground or the background palette — so the dot pattern is different on every single run. A simulation mode re-colours every dot through fixed 3×3 RGB matrices for protanopia, deuteranopia, tritanopia and achromatopsia. There are no network calls anywhere in the tool: generation, answer checking and scoring all happen on your own device.",
  useCases: [
    "Checking whether you can pick out the hidden numbers on standard red-green plates before booking a proper eye exam",
    "Designers and developers previewing how a colour palette or UI reads under protanopia, deuteranopia, tritanopia or total colour blindness",
    "Teachers and students demonstrating how pseudoisochromatic plates work — the pattern regenerates each run, so answers can't be memorised from the picture",
  ],
  benefits: [
    [
      "10 plates, 15 seconds each",
      "The run covers nine red-green confusion plates (12, 8, 29, 5, 3, 15, 74, 6, 45) plus a final blue-yellow tritan plate showing 5. A countdown gives you 15 seconds per plate and auto-advances when it lapses, so a full screening takes about three minutes.",
    ],
    [
      "Every run draws a new plate",
      "Dots are placed by random polar sampling inside the circle and rejected whenever they overlap an existing dot, so no two runs produce the same arrangement — you can retake the test without recognising the picture instead of the number.",
    ],
    [
      "Four colour vision simulations",
      "Switch the canvas between normal vision, protanopia, deuteranopia, tritanopia and achromatopsia at any time. Each mode applies a 3×3 matrix to every dot's hex value before painting; achromatopsia uses the Rec. 601 luma weights 0.299/0.587/0.114.",
    ],
    [
      "Nothing leaves your browser",
      "The tool makes no network requests and writes nothing to localStorage — plate generation, answer comparison and the score all run client-side, and your results disappear when you reload the page.",
    ],
  ],
  faqs: [
    [
      "How many plates are in this Ishihara color blind test?",
      "Ten. Nine are red-green plates with the target numbers 12, 8, 29, 5, 3, 15, 74, 6 and 45, and the tenth is a blue-yellow (tritan) plate showing 5. For each one you type the number you see, or type \"none\" if you don't see one.",
    ],
    [
      "Can an online Ishihara test diagnose color blindness?",
      "No. The tool displays a notice that it is not a medical diagnosis instrument, and its own result screen points out that computer screens vary in colour calibration, which changes what the plates look like. Screen brightness, ambient light and warm-tint modes such as night shift all shift the colours. A clinical assessment uses printed plates under controlled lighting and is carried out by an eye care professional.",
    ],
    [
      "What do the results mean?",
      "You get a percentage — your correct answers out of 10 — plus one of four labels the tool assigns: 100% shows \"Perfect Vision\", 80% or higher \"Strong Vision\", 50-79% \"Potential Deficiency\", and below 50% \"Significant Deficiency\". Underneath is a plate-by-plate review listing the correct number next to what you typed. These are the tool's own descriptive bands, not clinical categories.",
    ],
    [
      "What do I type if I can't see a number on the plate?",
      "Type \"none\" or press Skip. Your answer is compared case-insensitively against the plate's target value, so a skipped or blank answer is recorded as incorrect and the review shows it as \"Skipped\". If the 15-second timer runs out first, the plate is logged as \"timeout\" and the test moves on automatically.",
    ],
    [
      "Is the Ishihara color blind test free, and do I need an account?",
      "Yes, it's free, and there's no signup. The whole test runs client-side in JavaScript — there is no upload step, no API call and no stored session, so there's nothing to log in to.",
    ],
    [
      "How does the color blindness simulation mode work?",
      "It multiplies each dot's RGB value by a fixed 3×3 matrix before the canvas paints it. Protanopia, deuteranopia, tritanopia and achromatopsia each have their own matrix, and switching modes re-renders the plate instantly so you can compare the same dot pattern across all five views. It's a standard approximation of dichromatic vision, not a clinically validated model of how any individual sees.",
    ],
    [
      "Are these the real Ishihara plates?",
      "No — they're reproductions generated in code. The tool draws the digit onto a hidden canvas, reads the alpha channel to find which pixels fall inside the glyph, then colours the dots over those pixels from a foreground palette and the rest from a background palette. The green/salmon and blue palettes are chosen to mimic the red-green and blue-yellow confusion lines of published plates, but these are not scans of the licensed 38-plate Ishihara book.",
    ],
    [
      "Does the test work on a phone?",
      "Yes. The 400×400 canvas scales responsively to the screen width, and answers are typed into a standard text field. Because the plates depend on precise colour separation, turn off warm-tint display settings and use a moderate, steady brightness before starting.",
    ],
  ],
  steps: [
    "Press \"Begin Screening Test\" — the first plate is generated on the canvas straight away.",
    "Type the number you see (or \"none\") and press Submit. You have 15 seconds per plate, or press Skip to move on.",
    "After the tenth plate, read your percentage, status label and plate-by-plate review — retake it any time for a freshly generated set of patterns.",
  ],
};

export default seo;
