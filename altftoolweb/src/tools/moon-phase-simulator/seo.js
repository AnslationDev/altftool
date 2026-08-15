const seo = {
  title: "Moon Phase Simulator: Orbit and Earth View",
  metaDescription:
    "Scrub the 29.53-day synodic month and watch the Sun-Earth-Moon diagram and the disc seen from Earth update together, with age, angle and % lit.",
  steps: [
    "Drag the 'Synodic Month Day' slider through the 29.5-day cycle, or use 'Phase Fast Jump' for New Moon (0d), 1st Quarter (7.4d), Full Moon (14.8d) or 3rd Quarter (22.1d).",
    "Press 'Auto Play' to run the cycle at the chosen 'Playback Speed', and 'Pause Cycle' to stop on a day.",
    "Compare the top-down Sun-Earth-Moon diagram with the disc as seen from Earth, reading the day, phase angle in degrees and percentage illuminated.",
  ],
  intro:
    "The Moon Phase Simulator lets you drag the Moon through the 29.53-day synodic month and watch two views update together: a top-down diagram of the Sun–Earth–Moon geometry, and the disc as it would look from Earth at that moment. Illumination is computed from the phase angle as (1 − cos θ) × 50 percent, so 0° reads as a new moon, 90° as a first quarter half-disc and 180° as full. It exists for the moment a student stops accepting that phases are 'the Earth's shadow' and needs to see that half the Moon is always lit and only our viewing angle changes.",
  useCases: [
    "A pupil insists moon phases are caused by Earth's shadow — you put the orbit view beside the Earth view and step through the month until the geometry makes the answer obvious.",
    "You are teaching why a first quarter moon is called a quarter when it looks half lit, and need the day count and illumination figure on screen at the same time.",
    "You want a looping animation of a full lunar cycle running on a classroom display while you talk over it.",
  ],
  benefits: [
    ["Two views of the same instant", "The orbital diagram and the Earth-facing disc are driven by one phase angle, so the cause and the appearance are never out of step."],
    ["Scrub the month by hand", "A slider moves through the cycle in 0.1-day steps, or four jump buttons drop you straight onto the new, first quarter, full and third quarter positions."],
    ["Numbers alongside the picture", "Moon age in days, phase angle in degrees and illuminated percentage are all shown, so the drawing can be checked against the arithmetic."],
  ],
  faqs: [
    [
      "How long is one full moon cycle?",
      "29.53 days, the synodic month — the time from one new moon to the next. That is longer than the 27.3-day orbital period because Earth has also moved along its own orbit, so the Moon needs extra time to return to the same alignment with the Sun.",
    ],
    [
      "How is the illuminated percentage worked out?",
      "From the phase angle θ, as (1 − cos θ) × 50. At 0° the value is 0 percent (new moon), at 90° it is 50 percent (first quarter), at 180° it is 100 percent (full moon) and at 270° it falls back to 50 percent for the third quarter.",
    ],
    [
      "Why is a half-lit moon called a quarter moon?",
      "Because it marks one quarter of the way through the cycle, not one quarter of the disc. The first quarter falls at about day 7.4 of the 29.53-day month and the third quarter at about day 22.1, and at both the disc appears 50 percent lit.",
    ],
    [
      "Does this show the moon phase for today's date?",
      "No. It is a geometric teaching model with a day slider covering an idealised 29.53-day cycle, so it demonstrates why phases happen rather than reporting the current sky. For today's actual phase, illumination and upcoming new and full moon dates, use a date-based moon phase calendar instead.",
    ],
  ],
};

export default seo;
