const seo = {
  title: "Pigmentation Analyzer: Skin Tone Evenness Score",
  metaDescription:
    "Detects the face, samples the inner 60% in 10x10 blocks, and scores tone variation 0-100 across five bands with a per-block heatmap. Not a diagnosis.",
  steps: [
    "Drop a photo on the 'Upload a clear front-facing photo' panel or click it to browse; any image file works, and the tool asks for natural lighting with no makeup or filters.",
    "No button is needed — the face detection model and face landmark model load, the face is located from its 68 landmarks, and the inner face region is measured in 10x10 pixel blocks.",
    "Read the severity band (Even, Mild, Moderate, Significant or Severe) with Variation Score, Spots Detected, Confidence and Avg Luminance, and the Pigmentation Variation Map where red marks darker variation; Analyze Another clears the photo.",
  ],
  intro:
    "Pigmentation Analyzer measures how evenly a face photo's skin tone reads by detecting the face with a TinyFaceDetector and 68-point landmark model, sampling the central 60% of the face region in 10×10 pixel blocks, and reporting the standard deviation of block luminance as a variation score from 0 to 100. That score maps to five bands — Even up to 8, Mild to 18, Moderate to 30, Significant to 45 and Severe above it — alongside a count of darker reddish-brown patches and a heatmap that colours each block by how far it sits from the face's mean brightness. It is a photo-measurement aid for tracking evenness over time, not a diagnosis of any skin condition.",
  useCases: [
    "You started a vitamin C or niacinamide routine eight weeks ago and want a repeatable number, taken in the same light each time, instead of guessing from the mirror whether the dark patches have faded.",
    "Deciding which part of the face to concentrate on, using the heatmap to see whether the uneven areas cluster on the cheeks and temples rather than being spread evenly.",
    "Preparing for a dermatology or aesthetician appointment by bringing a dated series of the same photo angle, so the conversation starts from images rather than recollection.",
  ],
  benefits: [
    [
      "A block-level heatmap, not one summary number",
      "Every 10×10 block is coloured by its deviation from the face's mean luminance, with bands at 3, 8 and 15 points, so you can see where the unevenness actually is.",
    ],
    [
      "Landmark-anchored sampling",
      "The 68-point face landmarks define the region, and only the inner 60% is measured — so hair, background and the shadowed jaw edge do not skew the score.",
    ],
    [
      "A score you can repeat",
      "The variation figure is a plain statistic — the standard deviation of block brightness scaled against 40 — so the same face photographed in the same light gives a comparable number week to week.",
    ],
  ],
  faqs: [
    [
      "How is the pigmentation score calculated?",
      "The face region is split into 10×10 pixel blocks, each block's average luminance is computed as 0.299R + 0.587G + 0.114B, and the standard deviation of those block values across the face is scaled to a 0–100 variation score. A perfectly uniform tone scores near 0; the more the brightness scatters between blocks, the higher the number.",
    ],
    [
      "What counts as an even skin tone?",
      "A variation score of 8 or below is classified Even here, 9–18 Mild, 19–30 Moderate, 31–45 Significant and above 45 Severe. These are thresholds on an image statistic, not clinical grades — lighting alone can move a face a full band, so compare scores taken under the same conditions.",
    ],
    [
      "Can this diagnose melasma or hyperpigmentation?",
      "No. It measures brightness variation in a photograph and counts reddish-brown darker patches; it cannot tell melasma from post-inflammatory marks, sun damage, or anything requiring medical attention. Any spot that is changing shape, colour or size should be looked at by a dermatologist rather than a camera.",
    ],
    [
      "What kind of photo gives a reliable reading?",
      "A front-facing, in-focus photo in soft, even light with no makeup, no flash and no strong side lighting. Directional light casts shadows that the block analysis reads as tone variation, and a face that is not clearly visible will fail detection outright with a 'no face detected' message.",
    ],
  ],
};

export default seo;
