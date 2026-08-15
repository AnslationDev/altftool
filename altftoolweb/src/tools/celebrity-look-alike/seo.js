const seo = {
  title: "Celebrity Look-Alike: 68-Point Face Landmark Match",
  intro:
    "This celebrity look-alike quiz runs a face detector and a 68-point facial landmark model on your photo in the browser, then turns those landmark coordinates into a deterministic result — one of ten well-known faces, with an overall percentage plus separate jawline, eyes and cheekbones-and-mouth scores. Because the result is derived from your landmark positions, the same photo always returns the same celebrity, while a different angle or crop can change it. It is a novelty for entertainment, not a biometric identity match, and the photo never leaves your device.",
  useCases: [
    "A group of friends passing a phone around, each uploading a selfie to see who gets which celebrity and comparing the jawline and eye scores.",
    "You want a light caption idea for a profile photo and a match percentage gives you something to post alongside it.",
    "Testing how much the result depends on the shot: upload a straight-on photo and a three-quarter one and watch the landmark-driven answer move.",
  ],
  benefits: [
    [
      "The photo stays on your device",
      "Detection and landmark models load into the browser and run there, so no image is uploaded to a server for analysis.",
    ],
    [
      "Repeatable, not random",
      "The answer comes from the detected landmark geometry rather than a coin flip, so re-running the same image gives the same celebrity instead of a new one each press.",
    ],
    [
      "Breaks the score into features",
      "Alongside the overall percentage you get separate jawline, eye and cheekbone/mouth figures, plus the trait description for the matched face.",
    ],
  ],
  faqs: [
    [
      "Is this a real facial recognition match against celebrity photos?",
      "No. It detects your face and maps 68 landmark points, then uses that geometry to select from a fixed list of ten celebrities — it does not compare your face against a database of celebrity images. Treat the result as entertainment.",
    ],
    [
      "Is my photo uploaded anywhere?",
      "No. The detector and landmark models are loaded into your browser and the image is read locally as a data URL, so the picture is never sent to a server and nothing is stored after you reset.",
    ],
    [
      "Why did I get a different celebrity from a different photo?",
      "The result is driven by the positions of the 68 detected landmarks, so head angle, crop, distance and lighting shift those coordinates and can change the match. Upload the same file again and you will get the same answer every time.",
    ],
    [
      "What kind of photo works best, and is there a size limit?",
      "A clear, well-lit, front-facing photo of one person works best, and the upload limit is 10 MB. If no face is detected the tool still returns a result, derived from the file details instead of landmarks.",
    ],
  ],
};

export default seo;
