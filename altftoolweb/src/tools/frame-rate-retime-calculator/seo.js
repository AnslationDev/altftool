const seo = {
  intro:
    "Conforming footage means reinterpreting every recorded frame as one timeline frame, and this calculator gives the exact result: speed = timeline fps ÷ source fps, and the clip lasts source fps ÷ timeline fps times as long. Sixty-frame footage on a 24 fps timeline therefore plays at 40% speed and runs 2.5 times longer, with the frame count unchanged. The tool also covers the other direction — set a target speed and it works out how many frames the timeline needs versus how many were actually recorded, which is what determines whether you get clean slow motion or blended frames.",
  useCases: [
    "Check that 120 fps footage conformed to a 24 fps timeline gives exactly 20% speed before committing an edit.",
    "Work out the new runtime of a 30-second 60 fps clip once it is slowed to a 24 fps sequence.",
    "Decide whether a 50% retime on 60 fps material will need optical-flow interpolation or can be done cleanly.",
    "See how much a 24 fps master shifts when it is pulled down to 23.976 for an NTSC delivery.",
  ],
  benefits: [
    ["Conform and retime kept apart", "The two operations produce different frame counts, and the tool shows exactly how many frames get created or discarded."],
    ["Interpolation warning", "Flags when fewer than 24 unique frames a second reach the screen, the point where motion starts to look stepped."],
    ["Audio pitch figure", "Gives the shift in semitones from 12 × log₂(speed), so you know whether the sound can travel with the picture."],
  ],
  faqs: [
    [
      "What speed is 60fps footage on a 24fps timeline?",
      "40%. The speed is the timeline rate divided by the source rate, so 24 ÷ 60 = 0.4. The clip also lasts 60 ÷ 24 = 2.5 times as long, and every recorded frame is still shown, which is why this is clean slow motion rather than interpolated slow motion.",
    ],
    [
      "What frame rate should I shoot at for smooth slow motion?",
      "Divide the timeline rate by the slow-motion factor you want. For 25% speed on a 24 fps timeline you need 24 ÷ 0.25 = 96 fps, so you would shoot 100 or 120. Shooting at less than that forces the software to duplicate or blend frames.",
    ],
    [
      "Why is 23.976 fps used instead of 24?",
      "It is 24 × 1000/1001, a 0.1% slowdown introduced when colour was added to NTSC broadcast and still used for delivery to that ecosystem. Mixing 24 and 23.976 material in one sequence produces that same 0.1% speed difference, which is around 3.6 seconds of drift per hour.",
    ],
    [
      "Does slowing footage down change the audio pitch?",
      "Only if the audio is retimed with the picture. Playing a recording at a speed factor f shifts its pitch by 12 × log₂(f) semitones, so 40% speed drops the pitch by about 15.9 semitones — well over an octave. In practice editors keep the audio at its native rate or use a time-stretch that preserves pitch.",
    ],
  ],
};

export default seo;
