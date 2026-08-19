/**
 * FAQ copy rendered by components/FAQSection.jsx on /soft-murmur.
 *
 * It lives in data rather than inside the component so the server page can emit
 * FAQPage JSON-LD from the exact strings the browser renders — structured data
 * and visible text can never drift apart.
 *
 * `schema: false` keeps an answer on the page but out of the structured data.
 * Use it for any claim this repository cannot verify from its own code: schema
 * is read by answer engines as an assertion of fact, so an unverifiable claim
 * must not be published there.
 */
export const softMurmurFaqs = [
  {
    question: "What is the Ambient Sound Mixer?",
    answer:
      "It is a web-based productivity and relaxation tool that allows you to play and mix multiple background sounds—like rain, waves, crackling fireplace, and white noise—at different volume levels to create your personalized audio environment.",
  },
  {
    question: "What is Flow Mode?",
    answer:
      "Flow Mode is a natural variation feature that subtly adjusts the volumes of your active sounds up and down over time. This mimics real-world sound behaviors (like wind gusting or rain intensifying) to prevent your brain from tuning out a static loop.",
  },
  {
    question: "How do I share a custom mix?",
    answer:
      "Simply configure your sounds, click the 'Share' button, and copy the generated link. When someone opens that link, the application will automatically load your exact sound layers and volume balances.",
  },
  {
    question: "Does the sleep timer support fading?",
    answer:
      "Yes! When you enable 'Smooth Fade Out' in the sleep timer settings, the audio will gradually fade down to absolute silence over the last 15 seconds of the countdown, preventing a sudden stop from waking you up.",
  },
  {
    // Kept visible but excluded from JSON-LD: the licence status of every audio
    // file cannot be verified from this repository, and several tracks are
    // fetched from third-party URLs. Asserting a licence in structured data
    // would be publishing a claim we cannot stand behind.
    schema: false,
    question: "Are these sounds free to use?",
    answer:
      "Yes, all ambient sounds provided in this tool are royalty-free, public domain, or creative commons licensed, optimized for your personal relaxation, study, sleep, or focus sessions.",
  },
];

/** Only the entries cleared for structured data. */
export const softMurmurSchemaFaqs = softMurmurFaqs.filter(
  (faq) => faq.schema !== false,
);
