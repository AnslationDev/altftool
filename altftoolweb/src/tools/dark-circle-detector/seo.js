const seo = {
  title: "Dark Circle Detector: Under-Eye Score 0-100",
  metaDescription:
    "Upload a front-facing selfie: facial landmarks find the under-eye skin, then darkness and blue tint score 0-100 across five bands, in your browser.",
  steps: [
    "Drop a selfie onto Upload a clear front-facing photo, or click to browse for an image file.",
    "Wait while face detection reads the facial landmarks — at least 48 points are needed — and samples the skin under each eye.",
    "Read the Severity Score out of 100 with its band, plus Darkness Level, Bluishness Index and the Under-Eye Analysis Overlay marking the pixels counted.",
  ],
  intro:
    "The Dark Circle Detector finds your eyes in a selfie with a 68-point facial landmark model, samples the skin in a half-disc under each eye, and scores it on two measurements: how dark those pixels are relative to normal skin luminance, and how blue they are compared with their own red and green channels. The result is a 0–100 score placed into one of five bands from Minimal to Severe, plus a highlighted overlay showing exactly which pixels triggered it. It is for anyone tracking whether a sleep change, a concealer or an eye cream is doing anything measurable, rather than judging it in a bathroom mirror.",
  useCases: [
    "You started a new eye cream four weeks ago and want a like-for-like comparison shot in the same light rather than a guess",
    "You cannot tell whether your under-eyes read as blue or brown, which is the difference between a peach-toned corrector and a plain concealer",
    "You are photographing yourself for a passport or a profile picture and want to see which pixels the camera is exaggerating before you retake it",
  ],
  benefits: [
    ["Separates darkness from blue tint", "The score combines a luminance-based darkness measure with a bluishness figure derived from the blue channel minus the red-green average."],
    ["Shows you the pixels, not just a number", "An overlay tints every sampled pixel that crossed the bluish or darkness threshold, so you can see whether the reading came from shadow or skin."],
    ["Photos never leave your device", "Face detection and pixel analysis both run in the browser tab; nothing is uploaded, so a selfie stays on your machine."],
  ],
  faqs: [
    [
      "How is the dark circle score calculated?",
      "Every pixel in a half-disc under each eye is measured for darkness (100 minus 0.4 times its luminance) and bluishness (blue channel minus the average of red and green). The two averages are combined and capped at 100, then banded: 0–10 Minimal, 11–25 Mild, 26–40 Moderate, 41–55 Significant, and above 55 Severe.",
    ],
    [
      "Why does it say no face detected?",
      "The detector needs a clear, front-facing photo with even lighting and at least 48 usable landmark points. Glasses, heavy side lighting, an extreme angle, motion blur or a very small face in the frame will all cause it to fail — retake the shot facing a window with your eyes open and unobstructed.",
    ],
    [
      "Can it tell me the cause of my dark circles?",
      "No. It measures the colour and brightness of the skin it can see, which cannot separate pigmentation from vascular blue tint, thin skin, hollowing that casts a shadow, or simply the lighting in the room. Persistent or one-sided darkening, or a sudden change, is worth showing to a dermatologist rather than diagnosing from a photo.",
    ],
    [
      "Will my results change between photos of the same face?",
      "Yes, and mostly because of light. The score reads actual pixel values, so a warmer bulb, a different camera, makeup or a downward tilt of the head that deepens the shadow can each move it by several points. For tracking, take every photo in the same spot, at the same time of day, with the same device and no filters.",
    ],
  ],
};

export default seo;
