const seo = {
  title: "Posture Reminder: Desk Timer + 25 Movement Breaks",
  metaDescription:
    "Set a 5–180 minute interval or a 45/15 sit-stand cycle; each nudge loads a named stretch with reps, and completions log an adherence percentage.",
  steps: [
    "Choose \"Movement breaks\" or \"Sit-stand cycle\", then set the interval — 30, 45 or 60 min presets, or a custom value anywhere from 5 to 180 minutes.",
    "Press \"Start reminders\" (or \"Start the cycle\") and keep working; the tab title carries the countdown until the break is due.",
    "When the break arrives, follow the named exercise with its reps and hold time, then press \"Done\" — or \"Swap\" for a different one, or \"Skip\" — to log it against the day's adherence.",
  ],
  intro:
    "The Posture & Movement Reminder runs a desk timer that interrupts you on a set interval and hands you a specific movement break — one of 25 guided exercises covering neck, upper back, wrists, hips, legs and breathing — instead of a generic 'stand up' nudge. It also runs a sit-stand cycle with adjustable sitting and standing blocks, defaulting to 45 minutes sitting followed by 15 minutes standing. It is for anyone at a desk all day who keeps meaning to move and needs the prompt, the exercise, and a record of whether they actually did it.",
  useCases: [
    "You have a new standing desk and no idea when to raise it, so you run the 45/15 cycle and let the timer tell you to switch instead of standing until your feet hurt.",
    "Your neck aches by 3pm and you want a named stretch to do at the chair — chin tucks, levator scapulae, upper trap release — rather than searching for one every time the ache shows up.",
    "You just changed chairs and want to walk the six-point setup check once: feet flat, knees near 90 degrees, lumbar supported, elbows near 90 degrees, screen top at eye level, shoulders down.",
  ],
  benefits: [
    [
      "The break comes with instructions",
      "Each prompt loads a timed exercise with rep counts and hold times — chin tucks 8 reps holding 5 seconds, doorway chest stretch 30 seconds a side — so the break starts immediately instead of stalling on what to do.",
    ],
    [
      "It counts completions, not just prompts",
      "Prompted versus completed breaks, movement seconds and standing seconds are logged per day, giving an adherence percentage and a day streak at the 70% threshold.",
    ],
    [
      "Notifications that stay out of the way",
      "Browser notifications fire only while the tab is hidden; when you are looking at the page, a chime and the tab title carry the prompt instead.",
    ],
  ],
  faqs: [
    [
      "How often should I get up from my desk?",
      "The tool offers 30, 45 and 60 minute presets and accepts anything from 5 to 180 minutes, with 30 minutes a common starting point for breaking up sitting. Public health guidance is generally about breaking up long sitting bouts rather than hitting one exact number, so pick the interval you will actually honour.",
    ],
    [
      "What is a good sit-stand ratio?",
      "The default here is 45 minutes sitting to 15 minutes standing, with 30/30 and 50/10 as one-click alternatives; sitting can be set from 10 to 120 minutes and standing from 5 to 60. Standing all day is not the goal — alternating positions is, and the cycle is what the timer enforces.",
    ],
    [
      "Does it keep my streak if I close the tab?",
      "Yes. Preferences and daily stats are saved in your browser's local storage, keeping the most recent 60 days, so the adherence ring and streak survive a reload. It never syncs anywhere, so a different browser or device starts fresh.",
    ],
    [
      "Will these stretches fix my back or neck pain?",
      "No — these are general desk mobility and posture prompts, not treatment. If pain is persistent, sharp, radiating into an arm or leg, or follows an injury, see a physiotherapist or doctor; the on-screen cues also say to stop short of any pinch rather than pushing into a stretch.",
    ],
  ],
};

export default seo;
