const seo = {
  intro:
    "This generator draws a distorted-text CAPTCHA onto a 640×180 canvas: it picks 4 to 10 characters using the browser's crypto.getRandomValues, then renders each one at its own jittered position, rotation and size over a layer of noise dots and bezier curves you control with sliders. You choose the character sets, the distortion level, the font style and the colour scheme, then copy the answer text, copy the image, or download it as a PNG. It is a design and prototyping tool — the page itself notes that a production CAPTCHA must be generated and validated on the server, since anything decided in the browser can be read by the client.",
  useCases: [
    "You are mocking up a signup flow and need a realistic CAPTCHA image for the design file rather than a grey placeholder box",
    "You are testing your own CAPTCHA-solving or OCR pipeline and want to generate sample images at three known distortion levels",
    "You are demonstrating to a stakeholder why heavy distortion hurts real users, by turning noise and jitter up and asking them to read it",
  ],
  benefits: [
    ["Distortion is decomposed into separate controls", "Rotation, position jitter and character-size variation come from the complexity setting, while noise dot density and curved-line count are independent sliders, so you can isolate which one is actually hurting legibility."],
    ["An ambiguity filter you can toggle", "Turning on \"exclude ambiguous\" strips the classic confusions — O/0, I/l/1, B/8, S/5, Z/2 — from the pool, which removes most \"I typed it right\" failures."],
    ["Both halves of the pair, ready to use", "Copy the plain answer string for your test fixture and the PNG for your mockup, and use the built-in verify box to check case-sensitive and case-insensitive matching behaviour."],
  ],
  faqs: [
    [
      "How many combinations does a 6-character CAPTCHA have?",
      "About 15.6 billion at the default settings. With uppercase, lowercase and digits enabled and the ambiguous-character filter on, the pool is roughly 50 distinct characters, and 50 to the power of 6 is 15,625,000,000. Dropping to 4 characters cuts that to about 6.25 million.",
    ],
    [
      "Can I use this CAPTCHA on a live site?",
      "Not as-is. Both the answer and the check run in the browser here, so anything a user can load, a script can read — a real deployment must generate the string server-side, store it against the session, and verify the submitted answer on the server. Use this to design and test the image, not to gate a form.",
    ],
    [
      "Which characters are treated as ambiguous?",
      "The filter removes O, 0, o, 1, I, l, B, 8, S, 5, Z and 2 from the pool. The base sets are already conservative — uppercase omits I and O, lowercase omits l and o, and digits start at 2 — so with the toggle on you get a pool that avoids nearly every lookalike pair.",
    ],
    [
      "Are image CAPTCHAs accessible?",
      "Not on their own. A text-in-image challenge is unreadable to screen-reader users and hard for many people with low vision or dyslexia, which is why WCAG requires an alternative in a different modality — an audio version, an email or SMS confirmation, or a non-visual check. Treat any visual CAPTCHA as one option among several, never the only route through a form.",
    ],
  ],
};

export default seo;
