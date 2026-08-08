const seo = {
  title: "Headphone Break Timer with WHO-ITU Sound Dose",
  metaDescription:
    "Alternate listening and rest blocks — 60/5, 45/10, 30/5 or 90/15 — and see what share of the WHO-ITU daily allowance your session uses at that dB(A).",
  intro:
    "A listening break timer splits a long headphone session into repeating listen-and-rest blocks so your ears get regular quiet, and this one pairs that schedule with the sound-dose maths behind it. The default cycle follows the widely used 60/60 guidance — around an hour of continuous listening, then a rest — while the dose panel applies the WHO-ITU safe listening standard (Recommendation ITU-T H.870), which allows 80 dB(A) for 40 hours a week and halves the permitted time for every 3 dB you turn up. It is informational and does not replace a hearing test.",
  useCases: [
    "Editors and transcribers running six-hour headphone days who want scheduled quiet blocks",
    "Gamers on a long session checking whether the total listening time fits the daily allowance at 90 dB(A)",
    "Students revising with noise-cancelling headphones who lose track of how long they have had them on",
  ],
  benefits: [
    ["Plan and timer together", "Shows the whole session broken into blocks before you start, then counts down each one."],
    ["Dose, not just time", "Converts your planned listening minutes into a share of the WHO-ITU daily sound allowance at your level."],
    ["Rest is tracked separately", "Time in a break does not count towards listening, so the totals stay honest."],
  ],
  faqs: [
    [
      "How often should you take a break from headphones?",
      "A common rule of thumb is a rest after about 60 minutes of continuous listening, which is the 60/60 guidance also used for volume. There is no single official interval, but the more relevant limit is total daily dose: at 85 dB(A) the WHO-ITU allowance works out to roughly 108 minutes of listening a day.",
    ],
    [
      "How long should an ear rest break be?",
      "Five to ten minutes of genuine quiet is the usual suggestion, and longer after a loud block. What matters is that the break really is quiet — swapping headphones for a noisy commute or a loud room adds to the daily dose rather than resting from it.",
    ],
    [
      "Do listening breaks reverse hearing damage?",
      "No. Breaks reduce the total sound energy your ears take in and let temporary threshold shift — the muffled feeling after loud sound — recover, but they do not repair damaged hair cells. Noise-induced hearing loss is permanent, which is why limiting level and duration matters more than resting after the fact.",
    ],
    [
      "Is it the volume or the time that damages hearing?",
      "Both, combined as a dose. Sound energy doubles every 3 dB, so raising the volume 3 dB halves the time you can safely listen: 40 hours a week at 80 dB(A) becomes 20 hours at 83 dB(A) and about 24 minutes a week at 100 dB(A).",
    ],
  ],
};

export default seo;
