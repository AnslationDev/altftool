const seo = {
  title: "Measure an Object from a Photo Using a Bank Card",
  metaDescription:
    "Calibrate on an ISO/IEC 7810 bank card, A4 sheet or coin, then click the two ends: mm per pixel gives a length with the error range your marks allow.",
  steps: [
    "Under \"1 · Calibrate\" pick the reference that is in the photo — Bank / ID card long edge at 85.6 mm, A4 sheet, CD or DVD disc at 120 mm, US quarter at 24.26 mm, or \"Something else — I will type the size\" — and set the mark placement slip in pixels.",
    "Load the photo into the image/* file field, choose whether you are marking the Reference edge, the Object length / width or the Object height, and tap each length's two ends; the pixel distance is written straight into the field above.",
    "Read the estimated length with the interval your ±px marks allow, plus the mm-per-pixel scale, height, diagonal, area and the same length in every unit, then press Copy result.",
  ],
  intro:
    "A photograph records angles, not sizes — which is why a phone picture of a scratch on a wall tells you nothing about how long the scratch is. Put an object of published dimensions in the same shot and the picture gains a scale: millimetres per pixel is simply the reference object's real size divided by the number of image pixels it spans, and every other length in that plane follows. This tool does that arithmetic against a list of standards-defined references — the ISO/IEC 7810 ID-1 bank card at 85.60 × 53.98 mm, ISO 216 A4 at 210 × 297 mm, a 120 mm compact disc, a 24.26 mm US quarter — or any size you type yourself. It then does the part most photo-measuring tools skip: it propagates the error. Tell it how many pixels your marks might be off by and it reports the widest and narrowest lengths consistent with that slip, so a reading of 19.7 cm arrives as a range rather than as false precision. Two optional corrections are available when the geometry is not ideal — a pinhole depth ratio for when the object sits further from the lens than the reference, and a cosine foreshortening factor for a tilted surface. The photo is read by your own browser and never uploaded.",
  useCases: [
    "Work out the size of a crack, stain or damaged part from a photo you already took, using the bank card you had in your pocket at the time.",
    "Check whether a second-hand item listed online will fit a shelf, by measuring it against the A4 sheet the seller left in the frame.",
    "Estimate a plant, wound, print or component size for a record where fetching a tape measure is not practical.",
  ],
  benefits: [
    [
      "Published reference sizes",
      "Every built-in reference names the standard it comes from — ISO/IEC 7810, ISO 216, ANSI A, the US Mint — so the number can be checked rather than taken on faith.",
    ],
    [
      "An interval, not a false decimal",
      "Mark-placement slip is propagated through the division, giving the smallest and largest lengths your clicks actually permit.",
    ],
    [
      "The geometry is stated, not hidden",
      "Depth and tilt corrections are optional, visible and reversible, and the tool says plainly that lens distortion is not modelled.",
    ],
  ],
  faqs: [
    [
      "How accurate is measuring from a photo?",
      "Accuracy is dominated by how large the reference is in the frame. If the reference spans 400 pixels and your marks are within 2 pixels of the true ends, the scale is good to about 1%. If the reference spans only 60 pixels, the same 2-pixel slip is over 3% before you have measured anything, and errors in the reference are multiplied by however many times larger the object is.",
    ],
    [
      "What can I use as a reference object?",
      "Anything with a published size that lies flat in the same plane as what you are measuring. A bank, PAN or driving-licence card is ideal because ISO/IEC 7810 fixes it at 85.60 × 53.98 mm worldwide. An A4 or US Letter sheet, a CD, an AA battery, a coin or a 12-inch ruler all work too, and you can type a size you measured yourself.",
    ],
    [
      "Why does the object have to be in the same plane as the reference?",
      "Because a camera makes things smaller in proportion to their distance. A reference lying on the table and an object standing 30 cm nearer the lens do not share a scale. If you know both distances you can enter them and the pinhole ratio corrects for it; otherwise put the reference right beside the object, on the same surface, and shoot square to it.",
    ],
    [
      "Does this use the phone's LiDAR, focus distance or EXIF data?",
      "No. It reads nothing from the file except the pixels you click on, makes no network request, and does not open the camera. It is pure ratio arithmetic on the marks you place, which is also why it works on a photo somebody else took years ago.",
    ],
  ],
};

export default seo;
