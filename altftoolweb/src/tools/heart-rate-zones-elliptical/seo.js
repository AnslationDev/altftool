const seo = {
  title: "Elliptical Heart Rate Zones Scaled",
  metaDescription:
    "Five ACSM zones from age and resting pulse via Tanaka (208 - 0.7 x age) or Karvonen, each with a stride rate and a resistance level on your machine.",
  steps: [
    "Enter 'Age (years)' and 'Resting heart rate (bpm)', which start at 40 and 65, then 'Top resistance level on your console' — 20 unless your cross-trainer uses another scale.",
    "Choose the 'Maximum heart rate formula' from Tanaka (208 - 0.7 x age), Fox (220 - age) or Gulati (206 - 0.88 x age), and switch between the '% of maximum HR' and '% of heart rate reserve' buttons. Typing your live pulse into 'Reading on the console right now (optional)' highlights the matching band.",
    "The 'Steady cardio zone' gives the bpm range with the resistance numbers to hold at 50-65 strides per minute, and the table lists all five bands from 'Very light — warm-up' to 'Near maximal — sprint intervals' with heart rate, strides per minute and resistance. 'Copy result' takes the lot.",
  ],
  intro:
    "This calculator converts your age and resting pulse into the five ACSM intensity bands for cross-trainer work, using either percentage of maximum heart rate or the Karvonen heart rate reserve method with the Tanaka estimate of maximum heart rate (208 minus 0.7 times age). Because elliptical consoles number their resistance differently on every model, it scales each band to the top level on your own machine and pairs it with a stride-rate range. Enter the reading on the console and it will tell you which zone you are actually in.",
  useCases: [
    "Set a resistance level and stride rate for a 30-minute steady session instead of guessing at the console.",
    "Build an interval session by reading the vigorous band's resistance range straight off the table.",
    "Check whether the heart rate your gym machine is showing puts you in the moderate zone or only the light zone.",
    "Translate a coach's instruction of '70 percent heart rate reserve' into the number on the screen in front of you.",
  ],
  benefits: [
    [
      "Scaled to your machine",
      "Enter the highest level on your console and every zone comes back as an actual resistance number.",
    ],
    [
      "Stride rate included",
      "Each band lists strides per minute, so you can hold the zone when the heart rate sensor drops out.",
    ],
    [
      "Live zone check",
      "Type the reading on the console and the matching zone is highlighted in the table.",
    ],
  ],
  faqs: [
    [
      "What heart rate zone should I be in on the elliptical?",
      "For general fitness aim for the moderate zone, 64 to 76 percent of maximum heart rate, which is about 115 to 137 bpm for a 40-year-old with an estimated maximum of 180. Reserve the vigorous zone above 76 percent for shorter tempo blocks or intervals rather than a whole session.",
    ],
    [
      "Should I increase resistance or stride rate to raise my heart rate?",
      "Raise resistance first. Spinning faster at low resistance mostly increases momentum rather than work, and very high stride rates make it hard to keep control of the pedals. Pushing and pulling the moving handles also raises heart rate at the same leg effort because the arms add oxygen demand.",
    ],
    [
      "Why does the same elliptical resistance feel different at another gym?",
      "There is no industry standard for elliptical resistance numbers — level 10 on one manufacturer's 1-20 scale can be far harder than level 10 on another's 1-25 scale. That is why this tool asks for your machine's top level and expresses each zone as a share of it rather than a fixed number.",
    ],
    [
      "Are the hand-grip heart rate sensors on gym machines accurate?",
      "Not very. Grip sensors are prone to dropouts and can read tens of beats out, especially with sweaty or callused hands or when you are moving. A chest strap is the practical gold standard for zone training; optical wrist sensors sit somewhere in between and lag during rapid changes in effort.",
    ],
  ],
};

export default seo;
