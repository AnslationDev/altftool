// Single source for the /soft-murmur FAQ. components/FAQSection.jsx renders
// this array and page.jsx feeds the same array to createFaqJsonLd, so the
// visible copy and the FAQPage markup cannot drift apart.
//
// Every answer is rendered unconditionally by FAQSection (the accordion only
// clips the panel with max-height, it does not unmount the text), so the copy
// below is present in the server HTML — which is what makes the schema legal.
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
    question: "Are these sounds free to use?",
    answer:
      "This tool is free to use for your personal relaxation, study, sleep, or focus sessions. We're currently reviewing the source and license status of each individual sound asset, so we can't yet guarantee that every sound is royalty-free, public domain, or Creative Commons licensed. A few sounds are also temporarily unavailable while we finish this review — unavailable sounds are clearly marked in the mixer.",
  },
];
