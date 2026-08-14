const seo = {
  title: "CSS Box Shadow Generator: Blur, Spread and Inset",
  intro:
    "This generator assembles a CSS box-shadow value in the exact order the spec requires — offset-x, offset-y, blur-radius, spread-radius, colour, with an optional leading inset keyword — from sliders rather than trial-and-error edits. Offsets run from −50 px to 50 px, blur from 0 to 100 px and spread from −50 px to 50 px, and it returns both the bare value and the complete `box-shadow: …;` declaration ready to paste. It is for anyone who can picture the shadow they want but keeps forgetting whether blur comes before spread.",
  useCases: [
    "You are building a card component and need a soft lift — small vertical offset, wide blur, no spread — and want to dial the blur in visually before committing a value.",
    "A design hands you an inner shadow on an input field and you need the inset keyword in the right position with a negative-free spread that does not clip.",
    "You want a hairline ring around a button using spread with zero blur, and need to see how spread behaves independently of blur radius.",
  ],
  benefits: [
    ["Correct property order every time", "Emits the four lengths in spec order with inset first, so you never ship a rule the browser silently drops."],
    ["Separates blur from spread", "Independent controls make the difference obvious: blur softens the edge, spread grows or shrinks the shadow's shape before blurring."],
    ["Copy-ready in two forms", "Returns both the raw value for use inside a longer shadow list and the full declaration for a single-shadow rule."],
  ],
  faqs: [
    [
      "What is the correct order of box-shadow values in CSS?",
      "offset-x, offset-y, blur-radius, spread-radius, then colour — with the optional inset keyword before them all. Only the two offsets are required; omitting blur and spread makes both 0, and omitting the colour makes the shadow use the element's currentColor.",
    ],
    [
      "What is the difference between blur and spread?",
      "Spread changes the size of the shadow shape before any blurring — a positive spread grows it in every direction, a negative one shrinks it — while blur softens the edge outward from that shape. A 0 px blur with a 4 px spread gives a hard 4 px ring; a 20 px blur with 0 spread gives a soft halo the same size as the element.",
    ],
    [
      "How do I make an inner shadow?",
      "Turn on inset, which prefixes the value with the inset keyword and draws the shadow inside the element's padding box instead of outside its border box. Inner shadows are common on inputs and pressed buttons, and the same offset, blur and spread values apply, just facing inward.",
    ],
    [
      "Can I apply more than one shadow to an element?",
      "Yes — box-shadow takes a comma-separated list, and the first shadow in the list paints on top of the ones after it. Generate each layer here, then join the raw values with commas, which is how layered elevation styles build a tight contact shadow plus a wide ambient one.",
    ],
  ],
};

export default seo;
