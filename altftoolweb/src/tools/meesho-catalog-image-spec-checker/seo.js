const seo = {
  title: "Meesho Catalog Image Checker: Size, Ratio",
  metaDescription:
    "Test a Meesho catalogue photo against the 500 x 500 px minimum, 1:1 or 3:4 framing and watermark rules, and see how much a square thumbnail crops.",
  steps: [
    "Enter the image's Width, Height and File MB, type its Format (JPEG or PNG are accepted), and tick Clean background or Has watermark/text to declare those checks.",
    "Read the verdict — Ready for catalogue, Review warnings or Fails QC — with each rule (Minimum size, Aspect ratio, Watermark, logo & price text, Contact details) listed separately.",
    "Press Copy report to copy every check with its PASS/WARN/FAIL status, or Reset to return to the 1000 x 1000 px JPG defaults.",
  ],
  intro:
    "This checker tests a Meesho catalogue photo against the image requirements applied across common supplier categories: a 500 x 500 px minimum with 1000 x 1000 px or larger recommended, square 1:1 framing (with 3:4 portrait accepted in several apparel categories), JPEG or PNG, a clean background, and no watermark, price badge, contact detail or collage. It also works out how much of a non-square photo the square catalogue thumbnail would crop away, which is the most common surprise after upload.",
  useCases: [
    "Check a phone-shot product photo before adding it to a new Meesho catalogue.",
    "See how much of a 1200 x 1800 portrait photo the square thumbnail will cut off.",
    "Confirm a supplier-supplied image has no price badge or WhatsApp number before bulk upload.",
    "Diagnose a catalogue rejection by working through the rules one at a time.",
  ],
  benefits: [
    ["Crop preview in numbers", "Turns your aspect ratio into the exact percentage a square thumbnail discards."],
    ["Rejection reasons named", "Watermarks, contact details, collages and blur are checked separately so you know which one blocked the listing."],
    ["Fail vs improve", "Hard rejections are separated from things that merely make the listing weaker."],
  ],
  faqs: [
    [
      "What size should a Meesho catalogue image be?",
      "At least 500 x 500 pixels, with 1000 x 1000 pixels or larger recommended so the product stays sharp when a buyer zooms. Square framing is the standard because catalogue thumbnails are square; several apparel categories also accept a 3:4 portrait crop.",
    ],
    [
      "Can I add my brand name or price to a Meesho image?",
      "No. Watermarks, brand logos, price tags, discount badges, phone numbers, WhatsApp handles and website addresses on the image are all grounds for rejection. Keep the image to the product itself and put the price in the listing fields.",
    ],
    [
      "Why was my Meesho catalogue image rejected?",
      "The usual reasons are a photo under 500 px, a collage or multi-product frame, a cluttered background, visible watermarks or contact details, and blurred or badly lit photography. Each of those is checked separately here so you can fix the specific one.",
    ],
    [
      "Does a portrait photo get cropped on Meesho?",
      "In square placements, yes. A 1200 x 1600 portrait loses about 25% of its height in a 1:1 thumbnail, and a 1200 x 1800 image loses about 33%. Keep the product centred with even space above and below so the crop stays safe.",
    ],
  ],
};

export default seo;
