const seo = {
  intro:
    "The Age Progression Generator takes a photo you upload, finds the face with a 68-point landmark model, and draws an older version of it on canvas — desaturating the image, multiplying a fine procedural crease texture over the face region, and adding structural lines at the landmarks themselves: three forehead furrows above the brows, crow's feet at the outer eye corners, and nasolabial folds running from the nostrils to the mouth corners. A slider sets the target age anywhere from 50 to 90, and alongside the image you get simple index readouts for grey hair, skin elasticity and life experience derived from that number. It is a novelty visualisation for fun and curiosity, not a forensic or medical prediction, and the photo never leaves your browser.",
  useCases: [
    "You want a light-hearted 'us in forty years' picture for an anniversary card or a birthday slideshow",
    "You are curious how the classic ageing cues — forehead lines, crow's feet, nasolabial folds — actually sit on your own face rather than a stock example",
    "You are running a family quiz or a school project on ageing and want a quick before-and-after image you can download as a PNG",
  ],
  benefits: [
    ["Lines follow your face, not a template", "Creases are drawn at detected landmark coordinates — brow points, outer eye corners, nostrils and mouth corners — so they sit where your own features are."],
    ["The target age actually changes the render", "Desaturation and the index readouts both scale with the slider, so age 55 and age 85 produce visibly different results from the same photo."],
    ["Download and text report in one pass", "Export the aged image as a PNG and copy a plain-text summary of the projection numbers without re-running anything."],
  ],
  faqs: [
    [
      "What age range can I simulate?",
      "50 to 90 years, set with the slider. The grey-hair index scales as (target age minus 30) multiplied by 1.8 and therefore saturates at 100% from about age 86 upward, while the elasticity index falls by 1.1 points per year past 20 and bottoms out at 10%.",
    ],
    [
      "Is this an accurate prediction of how I will look?",
      "No. It applies generic ageing cues — desaturation, a crease texture and landmark-anchored lines — at a strength driven only by the age you pick. It does not model your genetics, sun exposure, weight change, hairline or bone structure over time, so treat the output as entertainment rather than a forecast.",
    ],
    [
      "What are the grey hair, elasticity and wisdom percentages based on?",
      "Purely on the target age you selected — each one is a fixed arithmetic formula applied to that number, not a measurement taken from your photo. They exist to make the slider's effect legible, and the accompanying hobby and wellness lines are drawn from a short fixed list. None of it is health information; talk to a clinician about anything to do with your actual skin or health.",
    ],
    [
      "What happens if no face is detected in my photo?",
      "The tool still produces an image, but it falls back to generic forehead arcs across the centre of the picture instead of landmark-anchored creases, and the result looks noticeably cruder. A clear, well-lit, front-facing photo under the 10 MB upload limit gives the detector the best chance.",
    ],
  ],
};

export default seo;
