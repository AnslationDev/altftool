const seo = {
  intro:
    "This is a single-switch scanning communicator: a highlight moves down a list of phrases one at a time on a timer, and pressing Space, Enter or the large on-screen button speaks whichever phrase is highlighted through the browser's speech synthesis. Scan speed is adjustable from 600 ms to 4000 ms per item, and the phrase list is fully editable — one phrase per line — so it can be set up for one person's actual vocabulary in a couple of minutes. It suits anyone who can operate a single reliable switch or key press but cannot point accurately at a grid.",
  useCases: [
    "A family member is in hospital after surgery, cannot speak clearly and is too tired to point — a short list of \"I need water\", \"I am uncomfortable\", \"Please call my contact\" scanning at a slow rate gives them a voice from the bed",
    "A speech-language therapist wants to try scanning with a client before committing to a dedicated AAC device, and needs to find the scan interval where the client actually hits the right item",
    "Someone's usual communication device is charging, being repaired or left at home, and any tablet or laptop with a keyboard needs to stand in for the afternoon",
  ],
  benefits: [
    ["One input, nothing else needed", "Space and Enter both act as the switch, so a keyboard, an adapted switch mapped to a key, or the oversized on-screen button all work without configuration."],
    ["Scan speed you can tune to the person", "The interval slider runs 600–4000 ms in 100 ms steps, which covers both fast, practised users and someone who needs several seconds to react."],
    ["Phrase list is yours, not a fixed vocabulary", "Type any phrases, one per line, and the scan order follows them exactly — names, medication, food preferences, whatever that person actually needs to say."],
  ],
  faqs: [
    [
      "What is switch scanning?",
      "It is an access method where the device moves a highlight through the options on a timer and the user acts at the right moment, rather than selecting directly. This tool uses linear scanning — the highlight steps through the phrases one by one and wraps back to the top — which is the simplest form and the easiest to learn.",
    ],
    [
      "How fast should the scan interval be?",
      "Start slow and speed up. Around 2000–3000 ms per item is a reasonable starting point for someone new to scanning; experienced users often work comfortably at under 1000 ms. The slider covers 600 ms to 4000 ms, and the right value is the fastest setting at which the person still hits their intended phrase consistently.",
    ],
    [
      "Will it work with my physical switch?",
      "Yes, if the switch or its interface sends a Space or Enter key press — most switch interfaces are configurable to do exactly that. There is no separate driver or pairing step here; anything that reaches the browser as one of those two keys triggers the selection.",
    ],
    [
      "Can this replace a proper AAC device?",
      "No — treat it as a stopgap or a practice aid. A prescribed AAC system offers vocabulary that grows with the user, alternative scan patterns such as row-column, message storage, mounting and dedicated hardware switches. Anyone who needs communication support day to day should be assessed by a speech-language pathologist or AT specialist.",
    ],
  ],
};

export default seo;
