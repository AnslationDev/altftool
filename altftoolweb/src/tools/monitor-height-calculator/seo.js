const seo = {
  intro:
    "This calculator gives the exact height above the floor for the top, centre and bottom of your screen, and the number of centimetres to raise or lower it from where it sits now. It solves two published rules at once: ANSI/HFES 100 and the OSHA computer-workstation guidance put the top of the viewable screen at, or up to about 5 cm below, eye height, while the centre of the screen should fall roughly 15–20 degrees below horizontal eye level. Panel height is computed from the diagonal and aspect ratio, so a 27-inch 16:9 monitor and a 34-inch ultrawide are treated differently, and bifocal or progressive lens wearers get an extra 7.5 cm drop.",
  useCases: [
    "Work out how tall a monitor riser or how many books you need before buying an arm you may not need.",
    "Set up a dual-monitor or ultrawide desk where the tall panel will not sit at the same height as a standard one.",
    "Match a monitor arm's height to a sit-stand desk in both its seated and standing positions.",
    "Check whether a new progressive lens prescription means the screen should come down rather than the chair going up.",
  ],
  benefits: [
    [
      "Both rules, reconciled",
      "Shows where the top-edge rule and the 15–20 degree gaze rule disagree, which happens on tall and ultrawide panels.",
    ],
    [
      "Real panel geometry",
      "Height is derived from the diagonal and aspect ratio, so a 34-inch 21:9 panel is correctly 34 cm tall, not 42.",
    ],
    [
      "Tells you what to change",
      "Compares the target against your current setup and gives the adjustment in centimetres, up or down.",
    ],
  ],
  faqs: [
    [
      "How high should a monitor be?",
      "Put the top of the viewable screen at, or up to 5 cm below, your seated eye height. For a 175 cm person on a 45 cm seat that is about 120–124 cm above the floor, which usually means the screen's top edge is roughly level with your eyebrows when you sit up straight.",
    ],
    [
      "Should the monitor be at eye level or lower?",
      "Slightly lower. The top of the screen belongs at or just below eye height, which puts the centre about 15 to 20 degrees below horizontal — the angle the eyes settle at naturally. A screen with its centre at eye level makes you tip your head back and dries the eyes because you open the lids wider.",
    ],
    [
      "How far away should a monitor be?",
      "Between 50 cm and 100 cm, the comfortable band in ANSI/HFES 100. A practical starting point is roughly the screen's own diagonal in centimetres — about 69 cm for a 27-inch monitor — then adjust for text size rather than leaning in.",
    ],
    [
      "Where should the monitor be if I wear varifocals?",
      "Lower — this tool drops it a further 7.5 cm. Bifocal and progressive wearers read through the lower part of the lens, so a screen at the standard height forces the chin up and the head back, which is a common cause of neck ache. A dedicated single-vision computer prescription is worth discussing with your optometrist if you are at a screen all day.",
    ],
  ],
};

export default seo;
