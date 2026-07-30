const seo = {
  intro:
    "This simulator animates the cardiac cycle on a four-chamber heart — right and left atria and ventricles, separated by the septum, with the tricuspid and mitral valves opening during systole and closing during diastole — while computing cardiac output as heart rate multiplied by stroke volume. Move the heart rate slider from 40 to 180 BPM and stroke volume from 40 to 120 mL and the readout updates output in litres per minute alongside cycle time. It is for biology and physiology students who want to see how the two variables behind cardiac output interact, and how the pulmonary and systemic circuits differ.",
  useCases: [
    "A student learning double circulation and wanting to see why deoxygenated blood goes right-side-to-lungs and oxygenated blood goes left-side-to-body",
    "Working through a physiology problem set on cardiac output and checking what happens to litres per minute when rate rises but stroke volume falls",
    "A teacher demonstrating why the left ventricle wall is drawn thicker than the right, using a beating diagram instead of a static textbook figure",
  ],
  benefits: [
    ["Output is computed, not asserted", "Cardiac output is shown live as CO = HR x SV, so you can watch the number move as you drag either slider instead of memorising the formula."],
    ["Valves animate with the phase", "The tricuspid and mitral valves visibly open on systole and close on diastole, tying the cycle phase to a mechanical event rather than a label."],
    ["Both circuits colour-coded", "Blue right-side chambers carry deoxygenated blood toward the lungs and red left-side chambers carry oxygenated blood to the body, making the pulmonary and systemic split readable at a glance."],
  ],
  faqs: [
    [
      "How is cardiac output calculated?",
      "Cardiac output equals heart rate multiplied by stroke volume. At the default 72 BPM and 70 mL per beat that is 5,040 mL/min, displayed as 5.04 L/min — the familiar textbook figure of roughly 5 litres a minute at rest.",
    ],
    [
      "What is stroke volume, and what range does the simulator allow?",
      "Stroke volume is the volume of blood ejected by a ventricle in a single beat, adjustable here from 40 to 120 mL. Around 70 mL per beat is the commonly cited resting value for an adult; raising it while holding heart rate constant raises cardiac output proportionally.",
    ],
    [
      "What is the difference between systole and diastole?",
      "Systole is the contraction phase, when the ventricles squeeze and eject blood; diastole is the relaxation phase, when the chambers refill. The animation cycles between them at your chosen rate, and the cycle time readout shows how long one full beat lasts — 60 divided by BPM, so 0.83 seconds at 72 BPM.",
    ],
    [
      "Does the heart rate range here say anything about my own heart rate?",
      "No. The 40 to 180 BPM range exists to cover everything from a trained athlete at rest to hard exercise for teaching purposes; it is not a normal range or an assessment. This is an educational model only — if you have concerns about your own heart rate, rhythm or chest symptoms, see a doctor.",
    ],
  ],
};

export default seo;
