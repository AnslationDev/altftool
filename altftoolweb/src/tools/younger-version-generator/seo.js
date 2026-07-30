const seo = {
  intro:
    "The Younger Version Generator takes a photo, finds the face with a 68-point landmark model running in your browser, and renders a nostalgic 'childhood self' polaroid by warming the exposure, softening the skin inside the detected face oval and adding rosy cheek tint. You pick one of three target stages — toddler (2-4), child (6-10) or teen (13-17) — and get back a framed image plus a playful profile with smooth-skin, cheek-roundness and eye-proportion figures. It is a photo filter and a novelty read, not a scientific reconstruction of how you actually looked.",
  useCases: [
    "Make a throwback-style polaroid of yourself for a birthday post when you have no scanned childhood photos to hand.",
    "Turn a group of friends' selfies into matching 'toddler edition' frames for a party slideshow or a group chat gag.",
    "Compare the toddler, child and teen presets on the same photo to see how much of the effect is skin softening versus warmth.",
  ],
  benefits: [
    [
      "Real landmark detection, not a blanket filter",
      "A TinyFaceDetector plus 68-point landmark pass finds the face, so the softening is masked to a face-shaped oval and the blush lands on the actual cheeks instead of the whole picture.",
    ],
    [
      "Three age presets with distinct baselines",
      "Toddler starts at 92% roundness and 98% skin smoothness, child at 82/92 and teen at 68/86, so each stage produces a visibly different read rather than one recycled result.",
    ],
    [
      "Polaroid output plus a copyable report",
      "Download the result as a PNG named for the stage you chose, or copy a plain-text report listing the three indicators and the childhood personality and activity lines.",
    ],
  ],
  faqs: [
    [
      "How does the younger version generator work?",
      "It detects your face with a lightweight in-browser landmark model, then edits the image on a canvas: exposure and warmth are lifted about 4%, an 8-pixel blur is blended into an oval over the detected face at up to 45% opacity, and a soft rose tint is drawn on each cheek at 12% alpha. The percentages shown alongside come from the age preset you selected, nudged slightly by your own landmark positions.",
    ],
    [
      "Is this a real prediction of what I looked like as a child?",
      "No. It is a stylised filter plus a randomised nostalgia profile, and it should be read as entertainment. Nothing in the tool has access to your actual childhood photos or any record of your appearance.",
    ],
    [
      "Are my photos uploaded anywhere?",
      "No. The image is read locally with FileReader and processed on a canvas in your browser; the face models load as static files and no picture leaves your device. Uploads are capped at 10 MB.",
    ],
    [
      "What happens if no face is detected in my photo?",
      "The tool falls back to a light global blur at 30% opacity and derives its seed from the file name and size instead of landmarks, so you still get a result — just without the face-shaped mask or the cheek blush. A clear, front-facing, well-lit photo gives the better output.",
    ],
  ],
};

export default seo;
