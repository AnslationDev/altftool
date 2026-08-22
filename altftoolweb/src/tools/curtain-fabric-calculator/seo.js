const seo = {
  title: "Curtain Fabric Calculator with Pattern Repeat",
  metaDescription:
    "Track width × fullness ÷ roll width gives whole widths; cut length rounds up to a full pattern repeat. Returns face fabric, lining, tape and hook count.",
  steps: [
    "Switch between \"Centimetres\" and \"Inches\", enter \"Track or pole width\" and \"Finished drop\", and choose \"A pair that meets in the middle\" or \"One single curtain\".",
    "Pick a \"Heading type\" — \"Pencil pleat tape\" at 2.5x, \"Eyelet\" at 2.0x or \"Tab top\" at 1.75x — then set \"Fabric roll width (cm)\" and \"Pattern repeat (cm, 0 if plain)\".",
    "Read \"Face fabric to buy\" in metres with the widths and cut length beneath it, then the \"Lining to buy\", \"Heading tape\" and \"Curtain hooks\" rows; \"Copy result\" saves the take-off.",
  ],
  intro:
    "This calculator works the way a curtain workroom does: it multiplies the track width plus returns and centre overlap by the heading's fullness ratio, divides by the usable width of the roll to get the number of whole widths (drops), then rounds the cut length up to a whole pattern repeat so the design matches across every seam. Fullness follows standard specifications — 2.5x for pencil and pinch pleat, 2.0x for eyelet and rod pocket, 1.75x for tab top. It returns face fabric, lining, heading tape and hook count so a single order covers the whole job.",
  useCases: [
    "Buying fabric for a pair of pencil-pleat curtains on a 200 cm track with a 220 cm drop",
    "Seeing how much extra a 32 cm pattern repeat adds across five widths before choosing a printed fabric",
    "Comparing 137 cm curtaining against a 280 cm wide sheer, where the wider roll may need half the widths",
  ],
  benefits: [
    ["Widths, not guesswork", "Rounds up to whole drops off the roll, which is how fabric is actually cut and priced."],
    ["Pattern repeat handled", "Rounds the cut length to a full repeat and shows exactly how many metres that costs you."],
    ["Trimmings included", "Lining metres, heading tape and hook count come out with the fabric figure."],
  ],
  faqs: [
    [
      "How much fabric do I need for curtains?",
      "Multiply the track width plus returns and overlap by the fullness ratio, divide by the usable roll width to get whole widths, then multiply that by the cut length. A 200 cm track with 2.5x pencil-pleat fullness and a 220 cm drop needs 5 widths of 137 cm fabric cut at 248 cm, which is about 12.4 m plain — or 12.8 m once a 32 cm pattern repeat is matched.",
    ],
    [
      "What fullness should curtains be?",
      "Pencil pleat and pinch pleat are normally specified at 2.5 times the track width, eyelet and rod pocket at 2.0, wave at about 2.2 and tab top at 1.75. Below the recommended figure the gathers look sparse and the curtain hangs flat rather than in folds, so fullness is worth protecting even if it means a plainer fabric.",
    ],
    [
      "Do I measure the window or the track for curtains?",
      "Always the track or pole, not the window, and measure it after it is fitted. Track is normally run 15 to 20 cm past the reveal on each side so the curtains stack off the glass, which means the fabric quantity follows the track length, not the opening.",
    ],
    [
      "How does a pattern repeat affect curtain fabric?",
      "Every cut length has to be rounded up to a whole repeat so the pattern lines up across the seams, and that rounding is paid for on every width. A 248 cm cut with a 32 cm repeat becomes 256 cm, which is 8 cm wasted per width — 40 cm across five widths, and considerably more on a large repeat of 60 cm or above.",
    ],
  ],
};

export default seo;
