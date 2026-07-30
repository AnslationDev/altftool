const seo = {
  intro:
    "The Passport & MRZ Masker paints solid opaque rectangles over the sensitive parts of a passport or ID scan and re-encodes the picture so the covered pixels are permanently gone from the exported file. One-click presets place a box over the machine-readable zone across the bottom 22% of the page, over the passport number in the upper right, or over the photo, and any box can be dragged, resized to the pixel or added freehand. The image is loaded and flattened in the browser and exported as a PNG or a JPEG at quality 0.92, named <file>-masked.",
  useCases: [
    "A landlord, airline or hotel asked for a passport copy and you want to cover the MRZ and passport number before emailing it, so the document proves identity without handing over the full machine-readable data.",
    "You are posting a visa-application screenshot in a forum or support ticket and need the face and document number covered in a way that cannot be undone by the person who downloads it.",
    "An HR or compliance team is archiving right-to-work scans and needs a redacted copy for the shared drive, with the exact pixel coordinates of each box recorded while the original stays untouched.",
  ],
  benefits: [
    [
      "Redaction that is actually destructive",
      "The boxes are filled onto the pixel data and the file is re-encoded from the canvas, so unlike a black shape laid over a PDF or slide, there is no layer underneath to peel back.",
    ],
    [
      "Presets aimed at passport layout",
      "The MRZ, passport-number and face presets are positioned by proportion of the page, so they land close to the right area on any resolution of scan and only need nudging.",
    ],
    [
      "Pixel-precise adjustment and undo",
      "Boxes can be typed in as exact x, y, width and height, nudged 10 pixels at a time with the arrow keys, resized with Alt plus arrows, and rolled back through 30 steps of history.",
    ],
  ],
  faqs: [
    [
      "What is the MRZ on a passport?",
      "The machine-readable zone is the block of monospaced text with chevrons across the bottom of the photo page — two lines of 44 characters on a standard passport — encoding your name, document number, nationality, date of birth, sex, expiry and check digits. It is the single most valuable strip to cover, because a border scanner can read the whole identity record from it.",
    ],
    [
      "Can the redaction be reversed?",
      "No. The rectangles are drawn into the image itself and the result is re-encoded to a new PNG or JPEG, so the original pixels under each box are not present in the exported file. Your source file on disk is never modified.",
    ],
    [
      "What size images can it handle?",
      "Up to 25 MB per file and 20 million pixels — roughly a 5000 x 4000 scan — which covers phone photos and flatbed scans of a passport page. PNG, JPEG and WebP inputs are accepted.",
    ],
    [
      "Does exporting remove the photo's metadata?",
      "Yes, as a side effect. Because the picture is redrawn onto a canvas and encoded fresh, EXIF fields such as GPS coordinates, camera model and timestamp from the original are not carried into the exported file.",
    ],
  ],
};

export default seo;
