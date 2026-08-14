const seo = {
  title: "AAC Phrase Board — Tap Tiles to Speak Phrases Aloud",
  metaDescription:
    "Tap a tile to speak it with your browser's own voice. Starts with 8 core phrases — Yes, No, I need help — and takes typed custom phrases up to 24 tiles.",
  steps: [
    "Type into the \"Add a private phrase\" field and press Add phrase — the board starts with 8 phrases like \"I need help\" and holds up to 24 tiles.",
    "Tap any large tile to have the browser's built-in speech synthesis speak that phrase aloud.",
    "The last phrase is echoed on screen as \"Spoken: ...\" in a live region for screen readers; nothing you add is saved after reload.",
  ],
  intro:
    "An augmentative and alternative communication board that speaks a phrase aloud when you tap its tile, using the browser's own SpeechSynthesis voice. It opens with eight everyday phrases — Yes, No, Please wait, I need help, I need water, I am uncomfortable, Please call my contact, Thank you — and you can type your own to fill the board out to 24 tiles. Tiles are large touch targets, the spoken phrase is echoed in a live region for screen readers, and nothing you type is uploaded or saved to a server.",
  useCases: [
    "Someone recovering from surgery cannot speak comfortably for a few days and needs a fast way to say I need water or I am uncomfortable from a bedside tablet",
    "A carer sets up a handful of phrases specific to one appointment — a clinic name, a medication, a contact's name — so the person can lead the conversation themselves",
    "A speech-language session needs a quick, no-install board to try phrase-based communication before committing to a dedicated AAC app or device",
  ],
  benefits: [
    ["Ready to use with no setup", "Eight core phrases are already on the board, so it is usable the second the page loads rather than after a configuration step."],
    ["Custom phrases stay in the page", "Anything you add lives only in this browser session — no account, no sync, no record of what was said."],
    ["Spoken output is also announced", "The last phrase is echoed in an aria-live region, so a screen reader user or a listener who missed the audio still gets it."],
  ],
  faqs: [
    [
      "How many phrases can I put on the board?",
      "Up to 24 tiles in total, including the eight it starts with. Duplicates are ignored, so adding a phrase already on the board does nothing. The cap keeps every tile large enough to hit reliably with an imprecise touch.",
    ],
    [
      "Do my custom phrases save for next time?",
      "No. Phrases you add exist only for the current page session and disappear on reload — a deliberate privacy choice, since AAC phrases are often personal or medical. If you need a fixed board every day, a dedicated AAC app with saved profiles is the better fit.",
    ],
    [
      "Why is there no sound when I tap a tile?",
      "The board uses the browser's built-in speech synthesis, so it needs a device voice installed and the volume up. Some mobile browsers also require a user gesture before any audio plays, and a few restrict speech output entirely — if nothing is heard, try a different browser or check the system text-to-speech settings.",
    ],
    [
      "Can this replace a prescribed AAC device?",
      "No. This is an informational aid, not a medical device, and it does not offer symbol sets, grid navigation, switch access or word prediction the way a prescribed system does. Use it as a stopgap or a trial, and work with a speech-language pathologist for an assessed long-term solution.",
    ],
  ],
};

export default seo;
