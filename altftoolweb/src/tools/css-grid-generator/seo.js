const seo = {
  title: "CSS Grid Generator with Per-Track fr, auto & px Sizing",
  metaDescription:
    "Set 1-8 columns and rows, click each track to cycle 1fr, 2fr, auto or fixed px, tune gaps 0-40px, then copy the CSS or download it with an HTML scaffold.",
  intro:
    "The CSS Grid Generator builds a grid-template-columns / grid-template-rows rule by letting you set the column and row count, then click each individual track to cycle its size through 1fr, 2fr, auto and a fixed pixel value. Row and column gaps are set separately, so the output uses the two-value gap shorthand (row then column). Copy the CSS on its own, or download a file that pairs it with a ready-made HTML scaffold of numbered grid items.",
  useCases: [
    "You need a three-column page shell where the sidebar stays at a fixed width and the two content columns share the rest — click the first track until it reads 120px and leave the others on 1fr.",
    "A designer handed you a mock with tighter vertical spacing than horizontal, and you want the gap shorthand written correctly rather than guessing which of the two values is the row gap.",
    "You are learning why fr units behave differently from percentages and want to flip one track between 1fr, 2fr and auto to watch the remaining space redistribute.",
  ],
  benefits: [
    ["Per-track sizing, not just a count", "Every column and row is individually clickable and cycles through 1fr, 2fr, auto and a fixed px size, so you can build asymmetric grids instead of only even ones."],
    ["Row and column gaps kept separate", "The two gaps have their own sliders and are emitted in the correct row-then-column order of the gap shorthand, a common place to get the values backwards."],
    ["Ships the HTML with the CSS", "The download pairs the grid rule with a matching container and one numbered .grid-item div per cell, so the layout renders the moment you paste it."],
  ],
  faqs: [
    [
      "How many columns and rows can I generate?",
      "Between 1 and 8 of each, giving a maximum of 64 cells. Any track beyond what you have sized defaults to 1fr, so a fresh grid starts out perfectly even.",
    ],
    [
      "What does the gap value mean when there are two numbers?",
      "In gap: 12px 20px the first value is the row gap (vertical space between rows) and the second is the column gap. Both sliders here run from 0 to 40px and are written in that order, so the shorthand matches what you see in the preview.",
    ],
    [
      "What is the difference between 1fr and auto for a track?",
      "1fr claims an equal share of the leftover free space, while auto sizes the track to its content and only grows if space remains after the fr tracks are satisfied. Use a fixed value like 120px when the track must not change size at all.",
    ],
    [
      "Does the generated CSS work without the HTML?",
      "Yes — the rule targets a .grid-container class, so applying that class to any element with children turns them into grid items. The bundled HTML is only a scaffold: it creates one numbered .grid-item div per cell so you can see the grid immediately.",
    ],
  ],
};

export default seo;
