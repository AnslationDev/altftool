const seo = {
  title: "Smile Detector: 68-Point Landmark Smile Score",
  metaDescription:
    "Upload a photo to get a smile score from the model's happy probability, plus mouth curve, teeth, eye squint, cheek raise and symmetry — all in-browser.",
  steps: [
    "Drop a JPG, PNG, WEBP or HEIC photo up to 20MB on the uploader, or use the Paste or Camera option.",
    "The face model places its 68 landmarks and returns an expression label with a confidence figure and the Overall Score, Happiness and Natural Smile gauges.",
    "Read the Mouth Curve, Teeth Visibility, Eye Squint, Cheek Raise, Lip Symmetry and Face Symmetry bars, then press Download Report for smile-report.txt.",
  ],
  intro:
    "The Smile Detector runs a face-detection model with 68-point landmarks and a seven-emotion expression classifier on a photo you supply, then turns the results into a smile score, an expression label and a breakdown of mouth curve, teeth visibility, eye squint, cheek raise, lip symmetry and face symmetry. The smile score is simply the model's happy probability expressed as a percentage, and the headline overall score is a weighted blend that gives 30% to that smile score, 20% to a natural-smile figure, 15% to mouth curve, 10% each to teeth visibility, eye squint and lip symmetry, and 5% to face symmetry. It is a light, for-fun read on a portrait, not a clinical or diagnostic assessment.",
  useCases: [
    "You have three headshot options for a profile picture and want a consistent number to compare which one actually reads as a warm smile rather than a polite one.",
    "You are picking the cover frame for a team photo and want to check whether the expressions read as happy or land closer to neutral before it goes on the About page.",
    "You are curious whether a smile in an old photo is a genuine one or a camera smile, and want the eye-squint and mouth-curve numbers behind that impression.",
  ],
  benefits: [
    ["A breakdown, not one number", "Six landmark-derived measures are reported alongside the score, so you can see whether a low result came from the mouth, the eyes or asymmetry."],
    ["Model confidence shown separately", "The confidence figure is the strongest of the seven emotion probabilities, so you can tell a certain neutral from an uncertain guess."],
    ["Photos stay in the browser", "The detection models load into the page and run on your device, so the image is analysed without being uploaded anywhere."],
  ],
  faqs: [
    [
      "How is the smile score calculated?",
      "The smile score is the model's happy probability multiplied by 100, so a happy probability of 0.72 gives a smile score of 72. The separate overall score blends that with mouth curve, teeth visibility, eye squint, lip symmetry and face symmetry using fixed weights, with the smile score itself carrying the largest share at 30%.",
    ],
    [
      "What do the expression labels mean?",
      "They are thresholds on the happy probability: above 0.85 is a Big Smile, above 0.65 is Smiling, and above 0.5 is a Slight Smile. Below 0.5 the label falls through to Sad, Surprised, Angry or Neutral depending on which of those probabilities clears 0.4.",
    ],
    [
      "Can it really tell a fake smile from a real one?",
      "Not reliably — treat the fake-smile figure as entertainment. It is derived from where the happy probability sits between 0.5 and 0.7, plus an eye-aperture ratio used as a rough stand-in for the eye crinkling associated with a genuine smile, and neither is a validated measure of sincerity.",
    ],
    [
      "Why did it fail to detect a face in my photo?",
      "Usually because the face is too small, too dark, turned away or partly covered — the landmark model needs a reasonably front-facing, well-lit face to place its 68 points. Use a photo where the face fills a decent part of the frame and both eyes are visible, and re-run it.",
    ],
  ],
};

export default seo;
