const seo = {
  intro:
    "The CSS Triangle Generator writes the classic border-trick rule that turns a zero-sized box into a solid triangle: width:0; height:0; with two adjacent borders set to transparent and the third given your colour. Pick a direction (up, down, left or right), a size between 4 and 200 pixels and a colour, and you get the exact declaration block to paste into a class or a ::before pseudo-element. The chosen size sets each border width, so a size of 40 produces a triangle 40px tall on an 80px base.",
  useCases: [
    "You are building a tooltip or popover and need the little pointer arrow underneath it, drawn in the same colour as the bubble without adding an SVG or image request.",
    "A dropdown menu needs a caret next to the label and you want it as a ::before element so it inherits hover and focus states instead of being a separate icon file.",
    "You are recreating a breadcrumb or ribbon shape from a design mock and need the arrow to change direction and colour without editing an asset.",
  ],
  benefits: [
    ["Correct border pairing every time", "The two transparent borders and the coloured one are matched to the direction you pick, which is the step people most often get backwards when writing the trick by hand."],
    ["Size maps to real geometry", "One slider drives all three border widths, so you always know the result: the triangle is size px deep and twice that across its base."],
    ["Paste-ready declaration block", "Output includes width:0;height:0; with the borders, so the rule works on an empty div or a pseudo-element with no extra setup."],
  ],
  faqs: [
    [
      "How does the CSS border triangle trick actually work?",
      "When an element has zero width and height, its four borders meet at a single point and each renders as a wedge cut on the diagonal. Make three of those wedges transparent and colour the fourth, and the visible remainder is a triangle pointing away from the coloured side.",
    ],
    [
      "Why does my triangle point the opposite way to the border I set?",
      "Because the wedge you colour sits on the opposite side from the tip. An upward-pointing triangle is drawn with border-bottom coloured and the left and right borders transparent, which is exactly the pairing the generator applies for each direction.",
    ],
    [
      "How big is the triangle for a given size value?",
      "The size sets every border width, so a value of N gives a triangle N pixels from base to tip and 2N pixels wide across the base. The slider accepts 4px to 200px in steps of 2.",
    ],
    [
      "Should I use a CSS triangle or clip-path instead?",
      "The border trick is the safest choice for simple arrows because it works in every browser and needs no extra element sizing. Reach for clip-path when you need a non-isosceles shape, an angled or scalene triangle, or a border and gradient on the shape itself, which the border trick cannot do.",
    ],
  ],
};

export default seo;
