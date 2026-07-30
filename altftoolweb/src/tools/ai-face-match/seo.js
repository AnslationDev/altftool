const seo = {
  intro:
    "AI Face Match compares two photographs by running face-api.js in your browser — a tiny face detector, a 68-point landmark model and a face-recognition network that turns each face into a 128-number descriptor — then measures the Euclidean distance between those two descriptors and maps it to a similarity percentage. A distance of 0 reads as a perfect match and a distance of 1.4 as no resemblance, with the score clamped between 12% and 99%. It is built for look-alike and family-resemblance curiosity, not identity verification, and the images never leave the page.",
  useCases: [
    "You and a friend keep getting mistaken for siblings and want a number on how close your facial geometry actually is",
    "You are putting together a family album and want to see whether a childhood photo and a recent one land in the same-person band",
    "You found a celebrity look-alike claim online and want to check the two published photos yourself rather than take the caption's word for it",
  ],
  benefits: [
    [
      "Real descriptor distance, not a filter",
      "The headline percentage comes from the Euclidean distance between two 128-dimension face embeddings, the same metric face recognition libraries use for matching.",
    ],
    [
      "Models run locally from the page",
      "The detector, landmark and recognition networks are fetched as static model files and executed in the tab, so neither photo is uploaded anywhere.",
    ],
    [
      "Bands you can act on",
      "Scores are grouped at 90%+ (same person or identical twins), 75–89% (look-alikes), 50–74% (family resemblance) and below 50% (distinct faces).",
    ],
  ],
  faqs: [
    [
      "How is the face similarity percentage calculated?",
      "By Euclidean distance between two 128-value face descriptors, converted with the formula (1 − distance ÷ 1.4) × 100 and clamped to the 12–99% range. Identical images give a near-zero distance and score at the top of the scale; unrelated faces typically produce distances near or above 1.0.",
    ],
    [
      "What image size and format can I upload?",
      "Any format your browser can display, up to 10 MB per photo. Use a front-facing, well-lit image with the whole face visible — heavy shadow, extreme angles, sunglasses or masks can stop the detector finding a face at all.",
    ],
    [
      "What happens if no face is detected in one of the photos?",
      "The tool falls back to a deterministic signature derived from the two file names and sizes, which produces a placeholder score in the 54–85% range rather than a real facial comparison. If the result looks arbitrary, re-upload with clearer, forward-facing photos so the recognition network can actually run.",
    ],
    [
      "Can I use this to verify someone's identity?",
      "No. It is an entertainment and curiosity tool: lighting, age, pose, camera lens and photo compression all move the distance score, and a single embedding comparison is not evidence of who someone is. Never use the result for access control, background checks, or any decision that affects a real person.",
    ],
  ],
};

export default seo;
