const seo = {
  title: "Desk, Chair & Monitor Height Calculator for Home Office",
  metaDescription:
    "Enter your standing height and get seat, seated desk, standing desk and monitor heights from anthropometric ratios, plus footrest size for fixed desks.",
  steps: [
    "Enter \"Your standing height (cm)\" (120-220), \"Indoor heel height (cm)\" and your \"Monitor diagonal (inches, 16:9)\".",
    "Tick \"My desk height cannot be adjusted\" and give the \"Actual desk height (cm)\" if your desk is fixed — the tool then works out the chair height and any footrest needed.",
    "Read the Seated desk height with its chair seat height, the standing desk height and the Monitor position table (screen centre, top and bottom edge above the floor), then press \"Copy result\".",
  ],
  intro:
    "This home office desk setup calculator derives every workstation height from one measurement — your standing height — using the anthropometric ratios workstation designers rely on: seat height at about 0.26 of stature, seated elbow height 0.145 above the seat, and standing elbow height at 0.63 of stature. It then places the monitor so the top edge is no higher than eye level and the centre sits 15° below your horizontal line of sight, and tells you whether a fixed desk needs a footrest.",
  useCases: [
    "Setting up a new home desk and chair without guessing where the seat should stop",
    "Working out how big a footrest a shorter person needs at a standard 75 cm desk",
    "Finding the right standing-desk height before programming the memory presets",
  ],
  benefits: [
    ["One measurement in, five heights out", "Seat, seated desk, standing desk, eye level and monitor centre all derived consistently."],
    ["Fixed desks handled", "Calculates the chair height and footrest needed when the desk cannot move."],
    ["Monitor rules applied together", "Uses whichever of the top-at-eye-level and 15°-gaze rules is stricter."],
  ],
  faqs: [
    [
      "What is the correct desk height for my height?",
      "About 73 cm for someone 175 cm tall, 63 cm at 150 cm, and 84 cm at 200 cm. The rule is seat height (roughly 0.26 × your height plus a heel allowance) plus seated elbow height (roughly 0.145 × your height), because your forearms should be horizontal when typing.",
    ],
    [
      "How high should a standing desk be?",
      "At your standing elbow height, which is close to 0.63 × your standing height — about 110 cm for a 175 cm person and 94 cm for a 150 cm person. Most sit-stand desks cover roughly 70–120 cm, so check the low end if you are under about 160 cm.",
    ],
    [
      "How high should my monitor be?",
      "Put the top of the screen at or just below eye level and the centre roughly 15° below your horizontal line of sight. For a 175 cm person on a correctly set chair, seated eye height is about 127 cm, which puts a 24-inch screen's centre near 110 cm and its top near 125 cm.",
    ],
    [
      "Do I need a footrest?",
      "You need one whenever the desk forces your chair higher than your knee-crease height. At a fixed 75 cm desk a 150 cm person has to sit at about 53 cm, roughly 12 cm above their natural seat height, so a footrest of that depth keeps their feet supported. Dangling feet shift load onto the thighs and lower back.",
    ],
  ],
};

export default seo;
