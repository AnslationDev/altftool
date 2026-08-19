// NOTE: seo.js is loaded in isolation at build time and must not import from ./utils.
// The weight percentages quoted below (pixel 20%, edge 20%, histogram 15%, complexity 20%,
// symmetry 10%, aspect/brightness/contrast 5% each) are literal copies of the weights in
// utils/imageAnalysis.js's computeAllSimilarity() overall-score formula — keep them in sync
// if that formula's weights ever change.
const seo = {
  title: "Logo Similarity Checker: 0-100 Score on 8 Signals",
  metaDescription:
    "Compare two logos on pixel, Sobel edge, histogram, symmetry and four more signals for a 0-100 score plus a k-means palette match, in your browser.",
  intro:
    "Logo Similarity Checker scores how closely two logo images resemble each other by comparing them on eight weighted visual signals — pixel-level RGB distance, Sobel edge structure, a 256-bin grayscale histogram, horizontal symmetry, aspect ratio, brightness, contrast and edge complexity — and rolls them into a single 0-100 similarity score. Both images are downscaled to 256px on a canvas and analysed in the page, so nothing about an unreleased mark leaves the device. Designers, founders and brand reviewers get a per-dimension breakdown (shape, colour, layout, symmetry) plus a k-means palette match instead of a gut-feel yes or no.",
  useCases: [
    "You have shortlisted a new logo and want to check it against an existing competitor mark before sending it to a trademark attorney for a formal clearance search.",
    "A client says your redesign 'looks too different' from the old logo — you compare the two files and show that shape and palette scores stayed high while only the layout dimension moved.",
    "You are reviewing a freelancer's submission and suspect it was traced from a stock mark, so you drop both files in and look at the Sobel edge-similarity number rather than eyeballing outlines.",
  ],
  benefits: [
    [
      "Eight signals, not one",
      "Pixel, edge, histogram, symmetry, aspect, brightness, contrast and complexity are weighted separately so a colour swap does not hide identical geometry.",
    ],
    [
      "Palette match, not just an average colour",
      "K-means pulls the five dominant colours from each logo and pairs them by RGB distance, showing which specific swatches collide.",
    ],
    [
      "Banded verdicts you can act on",
      "Scores land in High, Moderate, Low or Very Low bands so a review has a shared vocabulary instead of arguing over decimal points.",
    ],
  ],
  faqs: [
    [
      "What similarity score means two logos are too close?",
      "A score of 80 or above is flagged High, 60-79 Moderate, 40-59 Low and anything under 40 Very Low. High means the two marks share pixel layout, edge structure and tonal distribution closely enough that a human reviewer would likely see a resemblance — treat it as a prompt to investigate, not a conclusion.",
    ],
    [
      "How is the overall similarity score calculated?",
      "It is a weighted blend: pixel similarity 20%, Sobel edge similarity 20%, grayscale histogram intersection 15%, complexity 20%, symmetry 10%, and 5% each for aspect ratio, brightness and contrast. Each component is computed on both images after they are resized so the longest side is 256 pixels.",
    ],
    [
      "Can this tell me whether a logo infringes a trademark?",
      "No — this is a visual analysis tool, not a legal determination. Trademark infringement also turns on the goods and services involved, registration classes, market confusion and prior rights, so use the score as a screening signal and consult a qualified trademark attorney before acting.",
    ],
    [
      "Does it work with transparent PNGs and different image sizes?",
      "Yes. Alpha is read directly, and pixels with alpha below 128 are excluded from the dominant-colour clustering so a transparent background does not register as a brand colour. Files of different dimensions are each rescaled to a 256px bounding box, and the size difference itself is captured by the aspect-ratio component.",
    ],
  ],
};

export default seo;
