const seo = {
  title: "Multi-Touch Tester: See Every Contact and Pointer ID",
  metaDescription:
    "Press several fingers on the test surface: each contact draws a dot labelled with its Pointer Events ID, so dropped touches show up.",
  steps: [
    "Press \"Start with permission\" to open the touch test surface inside the \"Live local readings\" panel.",
    "Press several fingers, a stylus or a mouse onto the surface at once — each contact draws a dot labelled with its pointer ID, and the surface disables browser touch actions so scrolling and pinch-zoom cannot steal them.",
    "Drag the contacts around and watch for a dot that vanishes or reappears under a new ID, then press \"Stop sensor\" to end the test.",
  ],
  intro:
    "Multi-Touch Tester draws a labelled dot for every simultaneous contact your screen reports, using the browser's Pointer Events API so each finger keeps its own pointer ID from touchdown to release. Press several fingers on the test surface at once and you can see how many contacts the digitizer tracks together, whether any of them drop out mid-drag, and whether a dot lands where you actually touched. It is meant for anyone checking a touchscreen, a stylus, or a trackpad after a repair, a drop, or a suspect screen protector.",
  useCases: [
    "You have just had a phone screen replaced and want to confirm the new digitizer still registers all ten fingers rather than dropping the fifth or sixth contact.",
    "Pinch-to-zoom has become unreliable in a game and you need to see whether one of the two contact points is disappearing while you drag.",
    "A tablet has a suspect band across the middle of the screen and you want to slide a finger through it and watch whether the dot jumps, sticks or vanishes.",
  ],
  benefits: [
    [
      "Every contact is identified, not just counted",
      "Each dot is labelled with its pointer ID, so a contact that is silently released and re-acquired shows up as a new number instead of looking continuous.",
    ],
    [
      "Gestures cannot hijack the test",
      "The test surface disables browser touch actions and captures each pointer, so scrolling and pinch-zoom do not steal the contacts you are trying to measure.",
    ],
    [
      "Works for pens and trackpads too",
      "Because it listens to pointer events rather than touch events alone, a stylus or a mouse produces the same tracked dot as a finger.",
    ],
  ],
  faqs: [
    [
      "How many fingers can I test at once?",
      "As many as your hardware and browser report; the tool draws one dot per active pointer with no fixed cap. Most modern phones track 5 to 10 simultaneous contacts, and many older or budget panels stop at 2, so the count you see is a property of the device rather than a limit here.",
    ],
    [
      "Why does a dot disappear while my finger is still down?",
      "That is a dropped contact, and it usually means the digitizer lost the touch. Common causes are a damaged panel, a thick or misapplied screen protector, moisture or grease on the glass, or exceeding the panel's maximum simultaneous-touch count. Clean and dry the screen and retest before concluding the hardware is faulty.",
    ],
    [
      "Does this prove my touchscreen is broken?",
      "No. It shows what the browser is told about contacts, and browser, OS-level palm rejection and page conditions all sit between the glass and the result. Use it to reproduce and describe a symptom, then have the device checked by a technician before paying for a screen replacement.",
    ],
    [
      "Can I test a stylus or a laptop trackpad?",
      "Yes. Any input that generates pointer events appears, including pen and mouse, each with its own ID. Note that a trackpad usually reports a single pointer no matter how many fingers are on it, because multi-finger trackpad gestures are handled by the operating system rather than passed through as separate contacts.",
    ],
  ],
};

export default seo;
