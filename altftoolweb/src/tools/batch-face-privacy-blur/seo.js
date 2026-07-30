const seo = {
  intro:
    "Batch Face Privacy Blur uses the browser's built-in FaceDetector API to locate faces in a photo you own, paints an 18-pixel Gaussian blur over each detected bounding box on a canvas, and re-encodes the result as a PNG — which also drops the original EXIF block, including any GPS coordinates. It reports how many faces it blurred, so you can see whether detection found what you expected before you share the file. It is for anyone posting a photo where bystanders, children, or colleagues should not be identifiable.",
  useCases: [
    "You want to post a photo from a school event, a protest, or a busy street and need the bystanders' faces covered before it goes online.",
    "A screenshot or product photo for a support ticket has a person's face in the background and must be anonymised before it reaches a vendor.",
    "You are publishing an image and also want the camera's EXIF metadata — model, timestamp, GPS location — gone in the same step.",
  ],
  benefits: [
    [
      "Blur, not a black box",
      "Detected regions are re-drawn through a canvas blur filter, so the photo still reads naturally instead of being punched full of rectangles.",
    ],
    [
      "Metadata leaves with the faces",
      "Because the output is re-encoded to PNG from canvas pixels, the original EXIF block — including GPS coordinates — is not carried over.",
    ],
    [
      "It tells you when detection failed",
      "The result reports the face count, and says so explicitly when no face was found or when your browser has no FaceDetector, rather than handing back an untouched image that looks processed.",
    ],
  ],
  faqs: [
    [
      "Which browsers can actually detect faces?",
      "Only those that implement the experimental FaceDetector API — in practice Chromium-based browsers, and often only with the relevant flag enabled. If it is unavailable the image is still re-encoded and stripped of EXIF, but the report will say no faces were blurred, so check that line every time.",
    ],
    [
      "Is the blur reversible?",
      "No. The blur is applied to the pixels and then the image is re-encoded, so the original detail is not stored anywhere in the output file. Keep your own copy of the unblurred original if you need it.",
    ],
    [
      "Are my photos uploaded?",
      "No. Detection, blurring and encoding all run in your browser tab, and the blurred PNG is produced as a local download. The image never goes to a server.",
    ],
    [
      "Can I rely on it to catch every face?",
      "No — always check the output yourself. Automatic detection misses faces in profile, at small scale, in poor light, or partly hidden, and it does not touch other identifying details such as name badges, licence plates, tattoos, or reflections.",
    ],
  ],
};

export default seo;
