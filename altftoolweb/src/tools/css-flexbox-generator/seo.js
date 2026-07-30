const seo = {
  intro:
    "The CSS Flexbox Generator is a visual editor that builds a working flex layout from the six container properties — flex-direction, flex-wrap, justify-content, align-items, align-content and gap — and emits the matching CSS. You add up to 10 flex items, tune flex-grow, flex-shrink, flex-basis, align-self and order on any one of them, and watch the preview rearrange as you change each value. When the layout looks right you copy the rule set or download it as flexbox-layout.css.",
  useCases: [
    "You want a navbar where the logo sits left and the links sit right, and you need to see whether justify-content: space-between or margin-left: auto on the last item gives the result you want before writing it into your stylesheet.",
    "A card row collapses badly on narrow screens and you need to compare flex-wrap: wrap against nowrap with a smaller flex-basis, side by side, to find which one stops the overflow.",
    "You are teaching yourself the difference between align-items and align-content and need a live multi-line container where flipping one dropdown at a time shows exactly which axis each property controls.",
  ],
  benefits: [
    ["Container and item axes in one place", "Six container properties and five per-item properties are editable together, so you can see how flex-grow interacts with justify-content instead of guessing."],
    ["Only the rules you changed", "An item rule is written out only when its grow, shrink, basis, align-self or order differs from the default, so the output has no dead declarations to strip."],
    ["Preview matches the exported CSS", "The on-screen boxes are laid out by the same property values that get written into the file, so what you approve visually is what you paste."],
  ],
  faqs: [
    [
      "What is the difference between align-items and align-content?",
      "align-items positions items along the cross axis within a single line, while align-content distributes the lines themselves and only has a visible effect when the container has more than one line. That means align-content does nothing unless flex-wrap is set to wrap or wrap-reverse and the items actually overflow onto a second row.",
    ],
    [
      "What does flex-basis: auto actually do?",
      "flex-basis: auto tells the item to start from its own width or height (or its content size if no dimension is set) before any growing or shrinking is applied. Set an explicit value like 200px or 0 when you want every item to start from the same baseline, which is what makes flex-grow split space evenly.",
    ],
    [
      "How many flex items can I preview at once?",
      "You can add up to 10 items to the container, and remove any of them down to a minimum of one. That is enough to reproduce most real layouts — nav bars, card grids, toolbars — while keeping the preview readable.",
    ],
    [
      "Can I set the gap in something other than pixels?",
      "The gap control here is a pixel slider running from 0 to 40px, so the generated rule is always gap: Npx. If you need rem, em or a percentage, copy the CSS and swap the unit by hand; the gap property accepts any length value in browsers.",
    ],
  ],
};

export default seo;
