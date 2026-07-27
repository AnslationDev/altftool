const seo = {
  intro:
    "The Letter Spacing Tuner calculates the letter-spacing value a given font size, weight and case should use, expressed in em, pixels and the 1/1000 em unit design apps expect. It applies the optical tracking curve tracking = A + B·e^(C·size) — the exponential fit that makes small text open up and display text tighten — then adds documented corrections for heavy weights, all-caps settings and light-on-dark text. Designers and front-end developers get a defensible starting value plus a live preview instead of guessing at round numbers.",
  useCases: [
    "Setting a display headline at 64px where the browser default spacing looks visibly loose and gappy",
    "Deciding how much to open an ALL CAPS navigation label or button so the letters stop colliding",
    "Building a type scale in a design system and needing one letter-spacing token per size step",
  ],
  benefits: [
    ["Size-aware by default", "Tracking follows an exponential curve against font size rather than one fixed value."],
    ["Speaks both toolchains", "Every result is shown in CSS em, rendered pixels and Photoshop's 1/1000 em tracking unit."],
    ["Shows its working", "The base curve and each correction are listed separately so you can justify the number."],
  ],
  faqs: [
    [
      "What letter-spacing should I use for large headings?",
      "Large headings usually need negative tracking, converging on about -0.022em once the size passes roughly 40px. The optical curve reaches that floor because letterforms at display size already look far apart, so tightening restores the word shape.",
    ],
    [
      "How much extra letter-spacing does uppercase text need?",
      "Around +0.06em, or 60/1000 em, is the standard editorial allowance for all-caps text. Capitals have no ascenders or descenders to interlock, so without extra tracking the letters read as a solid block; small caps need about half that.",
    ],
    [
      "Should I use em or px for letter-spacing?",
      "Use em. Letter-spacing in em scales with the font size automatically, so a single value survives responsive size changes, whereas a px value that looks right at 48px will be far too wide at 16px.",
    ],
    [
      "Why does light text on a dark background need more letter-spacing?",
      "Light glyphs on a dark ground bloom optically — an effect called halation — which visually thins the gaps between letters. Opening reversed text by roughly 0.005em restores the rhythm of the same setting printed dark-on-light.",
    ],
  ],
};

export default seo;
