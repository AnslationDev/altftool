/**
 * AltF Detour originals — route metadata.
 *
 * Server-safe: copy and SEO only, no component references. `ToyHost` holds the
 * dynamic imports so each toy ships as its own chunk rather than all eight
 * loading on whichever one the visitor asked for.
 *
 * `slug` here matches the tail of the catalog entry's `url` in
 * `data/altf-originals.js`, and a unit test asserts the two stay in step —
 * otherwise the random button can serve a 404 on our own domain.
 */

export const TOYS = Object.freeze([
  {
    slug: "perfect-circle",
    name: "Perfect Circle",
    title: "Perfect Circle — draw a circle, get scored on how round it is",
    description:
      "Draw a circle freehand in one stroke and get scored on how close to perfect it was. Free, instant, no sign-up. Nobody beats 97% on a trackpad.",
    keywords: [
      "perfect circle game",
      "draw a perfect circle",
      "circle drawing test",
      "how round is your circle",
    ],
    tagline: "One stroke. No undo. Find out how round you really are.",
    how: [
      "Press and hold anywhere on the canvas, then draw a circle in a single unbroken stroke.",
      "Release when you get back to where you started.",
      "The dashed line shows the perfect circle your stroke was measured against.",
    ],
    about:
      "The score is the variation in your stroke's distance from its own centre, so it does not matter how big you draw — a small careful circle beats a large sloppy one. A stroke has to sweep most of the way round to count, which is why a short arc does not score 99%.",
    fullWidth: false,
  },
  {
    slug: "bubble-wrap",
    name: "Infinite Bubble Wrap",
    title: "Infinite Bubble Wrap — virtual bubble wrap that never runs out",
    description:
      "Pop virtual bubble wrap online for free. Click or drag across a row, and the sheet refills itself so it never runs out. Sound optional.",
    keywords: [
      "virtual bubble wrap",
      "bubble wrap popping game",
      "online bubble wrap",
      "stress relief website",
    ],
    tagline: "Pop one, pop a row, never run out.",
    how: [
      "Click a bubble to pop it, or press and drag to pop a whole run at once.",
      "Popped bubbles refill after a few seconds, so the sheet never empties.",
      "Turn sound on for the pop — it is off by default.",
    ],
    about:
      "Dragging pops a run rather than a single bubble, which is the half of real bubble wrap most virtual versions leave out. The pop is generated in the browser rather than played from a file, so the page loads with no audio to download.",
    fullWidth: false,
  },
  {
    slug: "do-nothing",
    name: "Do Nothing",
    title: "Do Nothing — a timer that counts how long you stay perfectly still",
    description:
      "A timer that counts how long you manage to do nothing at all. Move the mouse, press a key or scroll and it starts again from zero.",
    keywords: [
      "do nothing for 2 minutes",
      "do nothing timer",
      "stillness timer",
      "calming website",
    ],
    tagline: "Move anything and it starts again.",
    how: [
      "Leave the page alone. The timer counts up on its own.",
      "Any mouse movement, key press, scroll or tap resets it to zero.",
      "Small trackpad drift is forgiven; a deliberate movement is not.",
    ],
    about:
      "Harder than it sounds, which is the point. Most people last under twenty seconds on the first try, and the difficulty is almost entirely the reflex to check something rather than any real need to move.",
    fullWidth: false,
  },
  {
    slug: "red-button",
    name: "The Button You Should Not Press",
    title: "Do Not Press This Button — a big red button and one clear instruction",
    description:
      "A large red button, a clear instruction not to press it, and an increasingly personal reaction to the fact that you keep pressing it.",
    keywords: [
      "do not press the button",
      "big red button website",
      "useless website",
      "funny website",
    ],
    tagline: "There is nothing behind it. Press it anyway.",
    how: [
      "Do not press the button.",
      "Press the button.",
      "Keep going for longer than is reasonable.",
    ],
    about:
      "There is no prize, no easter egg and no ending. The writing runs considerably longer than most versions of this joke before it gives up, which is the only real feature.",
    fullWidth: false,
  },
  {
    slug: "useless-switch",
    name: "The Useless Switch",
    title: "The Useless Switch — flick it on, it turns itself back off",
    description:
      "Flick the switch on and a hand reaches out of the box to turn it off again. That is the entire website, and it is somehow enough.",
    keywords: [
      "useless machine",
      "most useless machine",
      "useless switch",
      "pointless website",
    ],
    tagline: "Turn it on. It will disagree.",
    how: [
      "Flick the switch to on.",
      "Wait.",
      "The box will handle the rest.",
    ],
    about:
      "A web version of the Most Useless Machine, a desk toy attributed to Marvin Minsky by way of Claude Shannon. The delay before the hand appears is randomised, because a fixed pause reads as an animation rather than as a machine having an opinion.",
    fullWidth: false,
  },
  {
    slug: "scroll-to-the-moon",
    name: "Scroll to the Moon",
    title: "Scroll to the Moon — turn your scrolling into real distance",
    description:
      "Converts how far you scroll into real distance and tells you what you have just passed — a giraffe, the Eiffel Tower, the Kármán line.",
    keywords: [
      "how far have I scrolled",
      "scroll distance",
      "scroll to the moon",
      "interactive scale website",
    ],
    tagline: "One pixel, one metre. The Moon is 384,400 km away. Good luck.",
    how: [
      "Scroll. That is the whole interaction.",
      "Scrolling back up still counts — distance is cumulative, not position.",
      "Each landmark you pass is announced as you reach it.",
    ],
    about:
      "The scale is one pixel to one metre, which puts the summit of Everest inside a stubborn minute and the edge of space inside a stubborn afternoon. Reaching the Moon is technically possible and strongly discouraged.",
    fullWidth: true,
  },
  {
    slug: "emergency-compliment",
    name: "Emergency Compliment",
    title: "Emergency Compliment — one sincere compliment, on demand",
    description:
      "One specific, sincere compliment per click, written by people rather than generated. For days that have not gone especially well.",
    keywords: [
      "emergency compliment",
      "compliment generator",
      "wholesome website",
      "cheer me up website",
    ],
    tagline: "For days that have not gone especially well.",
    how: [
      "Read the compliment.",
      "Press the button for another one.",
      "Repeat until it lands.",
    ],
    about:
      "Every line here was written rather than generated, and each is deliberately specific — general praise bounces off, while something precise tends to land. Nothing is tracked and nothing is stored.",
    fullWidth: false,
  },
  {
    slug: "the-void",
    name: "The Void",
    title: "The Void — type anything and watch it drift away",
    description:
      "Type anything at all and watch it drift upward and dissolve. Nothing is stored, nothing is sent, and nothing can be recovered.",
    keywords: [
      "type into the void",
      "scream into the void",
      "calming typing website",
      "vent anonymously",
    ],
    tagline: "Say it, watch it go, close the tab.",
    how: [
      "Type a word and press space or enter.",
      "The word drifts up and dissolves.",
      "Nothing leaves your browser at any point.",
    ],
    about:
      "Words are released whole rather than character by character, because releasing each letter turns a sentence into confetti and loses the thing that makes this work — watching a complete thought leave. There is no network request and no storage of any kind.",
    fullWidth: false,
  },
]);

export const TOY_SLUGS = Object.freeze(TOYS.map((toy) => toy.slug));

export function getToy(slug) {
  return TOYS.find((toy) => toy.slug === slug) ?? null;
}
