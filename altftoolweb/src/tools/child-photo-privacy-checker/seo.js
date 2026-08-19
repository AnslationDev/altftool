const seo = {
  title: "Child Photo Privacy Checker: Faces & EXIF",
  metaDescription:
    "Six-point checklist, drag masks burnt into the pixels, and an EXIF and GPS readout for JPEG, PNG and WebP. Export re-encodes with no metadata.",
  steps: [
    "Press Choose a photo for a JPEG, PNG or WebP up to 40 MB, then read the metadata card for GPS, camera serial and stored date.",
    "Drag rectangles over badges, plates or house numbers, or press Add centre mask, and pick Solid cover, Pixelate or Blur.",
    "Tick all six areas of the Manual privacy checklist, press Create flattened copy, then Download copy as PNG or JPEG.",
  ],
  intro:
    "This tool walks you through a six-point manual review of a photo you own — faces and reflections, school badges and name tags, house numbers and location clues, documents and screens, vehicle plates, and background details — then lets you drag rectangles over anything you want hidden and burn them in as a solid block, pixelation or blur. It also parses the file's own metadata, reporting EXIF blocks, GPS tags, camera make and model, serial number, capture time and embedded comments in JPEG, PNG and WebP. The exported copy is redrawn through a canvas, so the masks are permanent pixels and the original metadata is not carried over.",
  useCases: [
    "You want to post a first-day-of-school photo but the uniform badge and the lanyard name tag would tell a stranger which school and which child",
    "A holiday snap you are about to share has the rental's house number and a hire-car plate in frame, and you want both gone before it goes online",
    "You are sending a photo to an insurer or a school group chat and want to confirm it is not carrying GPS coordinates from the phone that took it",
  ],
  benefits: [
    ["Masks are destructive by design", "Regions are drawn into the pixels before export, so unlike a slide-deck black box there is no layer underneath to peel back."],
    ["Tells you what metadata was actually there", "It reads the real EXIF directories rather than assuming, naming GPS, camera serial, owner, lens, software and stored date if present."],
    ["Prompts for the clues people forget", "The checklist covers reflections in windows and screens, delivery labels, calendars, QR codes and keys, which are the details missed after the face is covered."],
  ],
  faqs: [
    [
      "Does this automatically detect faces in the photo?",
      "No. There is no face detection or AI recognition here; you review the image yourself against a six-area checklist and draw the masks. That is deliberate, since the photo is never analysed by a model or sent anywhere.",
    ],
    [
      "Does exporting remove the GPS location from my photo?",
      "Yes. The image is redrawn onto a canvas and re-encoded as a new PNG or JPEG, which produces a file with no EXIF block, so GPS coordinates, camera serial number and capture time do not survive the export.",
    ],
    [
      "Which image formats can I check?",
      "JPEG, PNG and WebP for inspection, with metadata read from JPEG APP1 segments, PNG eXIf/tEXt/iTXt chunks and WebP EXIF and XMP chunks. Export is to PNG for lossless output or JPEG with an adjustable quality setting.",
    ],
    [
      "Is blur or pixelation safe enough to hide a face or a number plate?",
      "A solid block is the safest choice, because heavy blurring and coarse pixelation can sometimes be partially reversed on small, high-contrast items like plate characters or digits. Use pixelate or blur when you want the photo to look natural, and solid when the detail genuinely must not be recoverable.",
    ],
  ],
};

export default seo;
