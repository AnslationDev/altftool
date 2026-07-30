const seo = {
  intro:
    "This builds a CSS text-shadow declaration from three sliders — horizontal offset, vertical offset and blur radius — and prints the finished rule ready to paste into a stylesheet. Offsets run from -20px to 20px and blur from 0px to 40px, and the shadow colour is fixed at rgba(0, 0, 0, 0.5), a half-transparent black that sits under most type without going muddy. It is for anyone who knows roughly the shadow they want but not the four-value shorthand order.",
  useCases: [
    "You are putting white headline text over a photo and it is getting lost, so you need a soft drop shadow just strong enough to separate it from the background",
    "You are recreating a retro or gaming look with a hard offset shadow and need a zero-blur value with a distinct x and y",
    "You have a shadow you like in a design mock and want the exact CSS shorthand rather than eyeballing pixel values in devtools",
  ],
  benefits: [
    ["Correct shorthand every time", "It emits the values in CSS order — x-offset, y-offset, blur, colour — so you never ship a rule with the offsets swapped."],
    ["Sensible ranges, not a blank box", "Offsets are bounded at plus or minus 20px and blur at 40px, which keeps you inside the range where text shadows still read as type rather than smudge."],
    ["Keeps your last few attempts", "The recent-results list holds the previous rules you generated, so you can step back to a version you liked without redialling the sliders."],
  ],
  faqs: [
    [
      "What do the numbers in a text-shadow mean?",
      "In order they are horizontal offset, vertical offset, blur radius and colour: text-shadow: 2px 2px 4px rgba(0,0,0,0.5) moves the shadow 2px right and 2px down and softens it over 4px. Negative offsets push the shadow left and up, and a blur of 0 gives a hard-edged copy of the text.",
    ],
    [
      "Can I change the shadow colour?",
      "Not from the sliders — the generated rule always uses rgba(0, 0, 0, 0.5). Once you have pasted it into your stylesheet you can replace that colour with any valid CSS colour, keeping the three pixel values as they are.",
    ],
    [
      "How do I make text readable over a busy photo?",
      "Start with a small offset and a larger blur — something like 0px 2px 6px — so the shadow reads as a halo rather than a second copy of the letters. If it still fails, a semi-transparent scrim behind the text will do more for contrast than any shadow, and WCAG contrast is measured against the background colour, not the shadow.",
    ],
    [
      "Can I stack more than one shadow?",
      "CSS allows it: separate multiple shadow definitions with commas in a single text-shadow property and they render back to front, first one on top. Generate each layer here one at a time, then join the values with commas in your stylesheet.",
    ],
  ],
};

export default seo;
