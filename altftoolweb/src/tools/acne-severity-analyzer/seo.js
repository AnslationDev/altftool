const seo = {
  title: "Acne Severity Analyzer: Spot Count & Coverage %",
  metaDescription:
    "Upload a front-facing photo and get a blemish spot count, coverage percentage and a Clear-to-Severe band. Runs locally on your device.",
  intro:
    "The Acne Severity Analyzer is a browser-based photo tool that locates your face with a TinyFaceDetector plus a 68-point landmark model, samples the central 60% of the face box, and counts pixels that are strongly red relative to the green and blue channels to estimate a blemish count, a coverage percentage and a severity band. It is built for anyone tracking a skincare routine who wants a repeatable number instead of a vague feeling that things look better or worse. Everything — model inference, pixel scoring and the red heatmap overlay — happens locally on your device, and the result is an informational screening signal, not a clinical diagnosis.",
  useCases: [
    "You started a new retinoid six weeks ago and want to compare a photo from week one with today's under identical lighting to see whether the spot count actually moved",
    "You are keeping a skincare journal and want a consistent number to log each Sunday rather than relying on memory",
    "You want to see the heatmap overlay so you can tell whether the redness is clustered on the cheeks or spread across the whole T-zone before you ask a dermatologist about it",
  ],
  benefits: [
    ["Analyses the skin, not the whole photo", "Facial landmarks isolate the central face region first, so hair, background and clothing red tones never inflate the count."],
    ["Shows you where the score came from", "A pixel-level heatmap tints every detected blemish pixel red, so you can sanity-check the score against what you actually see."],
    ["Repeatable banding", "The same fixed thresholds produce the same Clear / Mild / Moderate / Moderately Severe / Severe band every run, which makes week-to-week comparisons meaningful."],
  ],
  faqs: [
    [
      "How does the tool decide what counts as a blemish?",
      "It flags any pixel whose red channel is more than 18 levels above both green and blue, with red above 75 and Rec. 601 luminance above 40. Those flagged pixels are then divided by 15 to give an approximate spot count, and their share of the sampled region becomes the coverage percentage, capped at 10%.",
    ],
    [
      "What do the severity levels mean?",
      "They are fixed spot-count bands: more than 35 spots reads as Severe, more than 20 as Moderately Severe, more than 10 as Moderate, more than 2 as Mild, and 2 or fewer as Clear. The severity score shown alongside them is the spot count expressed as a share of 40, capped at 100%.",
    ],
    [
      "Can this diagnose my acne or replace a dermatologist?",
      "No. It is an informational colour-analysis screen, not a clinical grading scale, and it cannot distinguish an inflamed pimple from a birthmark, sunburn, rosacea or a red-toned filter. Painful, cystic, scarring or rapidly worsening acne should be assessed by a dermatologist or physician.",
    ],
    [
      "Why did it say no face detected, or give a very different score than last time?",
      "Detection needs a clear, well-lit, front-facing photo — the analyser stops if no face is found or if too few skin pixels fall inside the region. Because the test is purely colour-based, warm lighting, makeup, flash and camera white balance all shift the result, so shoot in the same light and at the same distance each time you want to compare.",
    ],
  ],
};

export default seo;
