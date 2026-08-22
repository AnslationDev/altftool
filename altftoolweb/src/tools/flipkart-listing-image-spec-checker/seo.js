const seo = {
  title: "Flipkart Listing Image Spec Checker",
  metaDescription:
    "Check a catalogue image before upload: 500 px minimum side, 1500 px recommended for zoom, a near-square crop, 80-90% frame fill and a white background.",
  steps: [
    "Enter the image Width and Height in pixels plus Product fill % and Margin %, and tick White background if the backdrop is clean white.",
    "Adjust Product fill % and Margin % until the listed issues clear — the 500px minimum side, 1500px zoom recommendation and square-crop rule re-run on every keystroke.",
    "Read the verdict, 'Looks catalogue-ready' or 'Needs edits' with each failing rule named, then press Copy to take the issue list.",
  ],
  intro:
    "This checker tests a Flipkart catalogue image against the seller image guidelines before you upload it. It applies the size rules — at least 500 x 500 px, 1500 x 1500 px or larger recommended so zoom stays sharp, and a 5000 px ceiling — along with the primary-image rules: JPEG format, a plain white background, the product occupying roughly 85% of the frame, and no watermarks, borders, collages or promotional text. It also converts your frame fill into the margin left on each side, which is the number QC teams actually look at.",
  useCases: [
    "Check a supplier's product shot before a bulk catalogue upload so it is not rejected at QC.",
    "Work out whether a 1000 px image is large enough for a usable zoom view on the product page.",
    "Confirm a lifestyle photo belongs in a secondary slot rather than as the primary catalogue image.",
    "Diagnose a listing rejected for margins by seeing how much white space your crop actually leaves.",
  ],
  benefits: [
    ["Primary vs secondary", "Background, fill and watermark rules only apply to the primary image, and the check reflects that."],
    ["Margin translated", "Turns an 85% frame fill into the roughly 7.5% margin per side it implies, so you know how tight to crop."],
    ["Named rule per result", "Every pass, warning or failure names the guideline it came from instead of a bare score."],
  ],
  faqs: [
    [
      "What is the minimum image size for a Flipkart listing?",
      "500 x 500 pixels. Flipkart recommends 1500 x 1500 px or larger, because the zoom viewer on the product page magnifies the file you upload and anything smaller looks soft when a buyer inspects the product.",
    ],
    [
      "Does a Flipkart primary image need a white background?",
      "Yes. The primary catalogue image must be on a plain white background with the product centred and no props, borders or collages. Secondary images may show the product in use, in context or from other angles.",
    ],
    [
      "Can I put my brand logo or a discount badge on a Flipkart image?",
      "No. Watermarks, brand logos, price badges, borders and promotional text are not permitted on catalogue images and are a common reason for QC rejection. Brand identity belongs on the packaging shown in the photo, not overlaid on it.",
    ],
    [
      "How much of the frame should the product cover?",
      "Around 85%, which leaves roughly 7.5% margin on each side of a centred product. Cropping tighter than that risks clipping the product in the listing thumbnail; leaving more white space makes the item look small in search results.",
    ],
  ],
};

export default seo;
