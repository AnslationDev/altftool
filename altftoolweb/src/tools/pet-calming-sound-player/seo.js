const seo = {
  title: "Pet Calming Sound Player – Firework Masking Planner",
  metaDescription:
    "Play a species-shaped noise loop in your browser and see the dB(A) actually reaching your pet — masking maths capped at the WHO 70 dB(A) guideline.",
  steps: [
    "Choose the Animal and Sound preset, then enter 'Speaker level at 1 m (dB A)', the pet's distance, the room level and 'Firework peaks heard indoors (dB A)'.",
    "Press 'Play loop' — the noise is synthesised with the Web Audio API and band-limited to the range shown as 'Filter band applied'.",
    "Read 'Level reaching your pet', the masking verdict and 'Suggested speaker level at 1 m' capped at 70 dB(A), then press 'Copy plan'.",
  ],
  intro:
    "This tool generates a low-stimulation noise loop for an anxious animal and calculates how loud that loop has to be to stop firework peaks standing out. It combines the room's own sound level with the playback level using decibel addition (10·log10 of summed energy), applies the inverse-square law to work out what actually reaches the pet, and caps the answer at the WHO 70 dB(A) all-day guideline. It is aimed at owners who want the sound loud enough to work and quiet enough to leave running for hours.",
  useCases: [
    "Setting up a back room for a dog on Bonfire Night and checking whether 60 dB(A) of brown noise is enough against neighbourhood fireworks",
    "Choosing a darker, lower-passed loop for a cat that reacts badly to hissy white-noise apps",
    "Working out how far from the speaker a crate can sit before the masking stops doing anything",
  ],
  benefits: [
    ["Level you can defend", "Shows the actual dB(A) reaching the animal, not an abstract 0-100 volume slider."],
    ["Safety ceiling built in", "Suggestions are capped at 70 dB(A) and flagged against the 85 dB(A) exposure limit."],
    ["Species-shaped sound", "Filter corners follow published hearing ranges for dogs, cats and small pets."],
  ],
  faqs: [
    [
      "What sound is best for a dog scared of fireworks?",
      "Steady, low-frequency broadband noise — brown noise rolled off below roughly 800 Hz — because it sits in the same band as the firework thud and has no onsets of its own. Dogs hear from about 67 Hz to 45 kHz and are most sensitive near 4 kHz, so bright hissy noise is more arousing than helpful. Slow classical music at 50-60 bpm is the other option supported by kennel research.",
    ],
    [
      "How loud should calming noise be for a pet?",
      "Keep it at or below 70 dB(A) at the animal's position, which is the WHO 24-hour guideline below which no hearing damage is expected. That is roughly the level of a normal conversation held a metre away. Above 85 dB(A) you are into the NIOSH 8-hour exposure limit and the noise itself becomes the problem.",
    ],
    [
      "Can white noise actually mask fireworks?",
      "It can reduce how much peaks stand out, but it cannot remove them. If a bang reaches 82 dB(A) indoors and your background is 55 dB(A), the peak still pokes 27 dB above the room, which is plainly startling. Masking works best when the gap is 10 dB or less, which usually means moving the animal to an interior room rather than turning the speaker up.",
    ],
    [
      "Does the loop play from my browser without an app or download?",
      "Yes. The noise is synthesised in the page with the Web Audio API, so nothing is downloaded and nothing is uploaded. Browsers require a tap or click before audio can start, so press play once on the page; leaving the tab in the background may still suspend audio on some mobile browsers.",
    ],
  ],
};

export default seo;
