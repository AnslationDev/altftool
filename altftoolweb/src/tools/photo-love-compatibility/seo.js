const seo = {
  title: "Love Compatibility by Photo — Free Face Match Test",
  h1: "Love Compatibility by Photos",
  metaDescription:
    "Upload two photos for an instant compatibility score. 68-point face landmark detection runs in your browser — nothing is uploaded. Free, and just for fun.",
  intro:
    "Love Compatibility by Photos analyses two uploaded photos with face-api.js (@vladmandic/face-api) running on TensorFlow.js inside your browser: a TinyFaceDetector pass locates one face per image, then the 68-point facial landmark model and the expression model run on each. The tool adds up the x and y coordinates of every detected landmark across both faces into a single seed number, and maps that seed through fixed modular arithmetic to produce an overall score of 71–98% plus three sub-metrics. The face detection is genuine and everything stays on your device — but the resulting percentage is a deterministic novelty output, not a measurement or prediction of a relationship.",
  useCases: [
    "Getting a shareable, tongue-in-cheek match percentage for you and your partner from two selfies",
    "A light party or couples' game for anniversaries, Valentine's posts, or a group chat dare",
    "Seeing browser-based 68-point face landmark detection run on real photos without anything being uploaded",
  ],
  benefits: [
    [
      "Photos never leave your browser",
      "Each image is read locally with the FileReader API as a data URL and analysed by face-api.js models served from this site. There is no upload endpoint and no server call carrying your pictures.",
    ],
    [
      "Real face landmark detection",
      "TinyFaceDetector finds one face per photo, then the 68-point landmark model and the expression model from face-api.js run on it — the same on-device models used for serious face analysis tasks.",
    ],
    [
      "Same photos, same score",
      "The number is derived from the summed landmark coordinates, so re-running the identical pair always returns the identical result. Change either photo and the score changes with it.",
    ],
    [
      "Free, no signup, instant report",
      "No account, no watermark, no daily cap. Copy the result to your clipboard or download it as a plain-text report in one click.",
    ],
  ],
  faqs: [
    [
      "Can a photo really tell love compatibility?",
      "No. Nothing in a photograph predicts how a relationship will go, and this tool makes no such claim. What it actually does is detect one face in each image, extract 68 facial landmark points, and convert those coordinates into a novelty score between 71% and 98%. Treat it as a game, not an assessment.",
    ],
    [
      "How is the photo love compatibility score calculated?",
      "It sums the x and y coordinates of every detected landmark across both photos into one seed, then computes the overall score as (seed mod 28) + 71 — a 71% to 98% range. The three sub-scores use the same seed multiplied by 4, 11 and 5 for chemistry index, expression and mood alignment, and structural harmony, each mapped into a 79–99% band.",
    ],
    [
      "Are my photos uploaded or stored anywhere?",
      "No. Both images are read locally through the browser's FileReader API, and the face detection models are downloaded from this site into your browser to run there. The photos are never transmitted to a server, and nothing persists once you reset the tool or close the tab.",
    ],
    [
      "Why do we always get the same percentage?",
      "Because the calculation is deterministic. It depends on the exact landmark coordinates the detector finds, so the same two photos always produce the same number. Use a different photo of the same person — a different angle, crop or lighting — and the landmarks shift, giving a different score.",
    ],
    [
      "What happens if no face is detected in a photo?",
      "It still returns a result using a fallback: a bit-shift hash of the two file names combined with the two file sizes. So an image with no detectable face won't throw an error, but the score then reflects file metadata rather than facial landmarks. A front-facing, well-lit portrait with one clearly visible face gives the intended behaviour.",
    ],
    [
      "What photo size and formats does it accept?",
      "Up to 10 MB per photo. The picker accepts any image type your browser can decode — JPG, PNG, WebP, GIF and HEIC where supported. A file above 10 MB is rejected with a size error before any analysis runs.",
    ],
    [
      "Is the love compatibility photo test free?",
      "Yes — free and unlimited, with no signup and no watermark. You can run it as many times as you like, then copy the report or download it as a .txt file.",
    ],
    [
      "Can I use a group photo or test more than two people?",
      "No. The tool takes exactly two images and calls detectSingleFace on each, so only one face per photo is measured — in a group shot it picks the single strongest detection, which may not be the person you meant. Upload one clear solo portrait per person instead.",
    ],
  ],
  steps: [
    "Optionally type both names, then select the first partner's photo — any image format your browser can read, up to 10 MB.",
    "Add the second partner's photo the same way; both previews appear side by side.",
    "Press Analyze Photos Compatibility. The face models load once, then you get an overall percentage plus chemistry, expression and structural sub-scores you can copy or download as a text report.",
  ],
};

export default seo;
