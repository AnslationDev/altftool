const seo = {
  intro:
    "This tool compares two screenshots pixel by pixel and marks every changed pixel in red, using a per-pixel threshold of |ΔR| + |ΔG| + |ΔB| greater than 30 across the three colour channels. It reports the total pixel count, how many changed, how many did not, and the change as a percentage to two decimal places, then lets you download the annotated diff as a PNG. It is built for anyone who needs to prove a visual regression happened rather than argue about whether the page 'looks different'.",
  useCases: [
    "A deploy went out and a tester says a page 'shifted' — you diff the before and after captures and get a figure like 0.42% changed, with the exact area highlighted in red",
    "You upgraded a UI library and want to know which screens actually moved, so you can review the three that changed instead of eyeballing forty",
    "You are filing a bug and need an attachment that shows precisely which pixels differ, rather than two screenshots the reader has to flick between",
  ],
  benefits: [
    ["A number, not an impression", "Changed pixels, unchanged pixels and a percentage to two decimals go into a copyable report you can paste into a ticket."],
    ["Changes drawn over the original", "Unchanged pixels keep the before image, so the red mask sits in context and you can see what component moved, not just where."],
    ["Tolerant of trivial noise", "The threshold of 30 summed across R, G and B ignores single-value compression wobble while still catching a one-pixel border or a shifted baseline."],
  ],
  faqs: [
    [
      "How sensitive is the comparison?",
      "A pixel counts as changed when the absolute differences of its red, green and blue values add up to more than 30. That means a change of about 10 per channel, or a single channel shifting by 31, is flagged — enough to catch antialiasing changes on text while ignoring the tiniest JPEG artefacts.",
    ],
    [
      "What if my two screenshots are different sizes?",
      "Both are drawn onto a canvas sized to the larger width and larger height of the pair, which stretches the smaller image to fit. That makes the comparison unreliable for mismatched captures, so take both screenshots at the same viewport size and device pixel ratio for a meaningful result.",
    ],
    [
      "Why does a tiny visual change report a large percentage?",
      "Usually because something moved rather than changed appearance. A one-pixel shift in a body of text redraws every glyph, so the diff legitimately reports thousands of changed pixels — read the red mask's shape, not just the percentage, to tell a reflow from a recolour.",
    ],
    [
      "Does it compare transparency?",
      "No — only the red, green and blue channels are differenced; the alpha channel is ignored. Two images that differ only in transparency over identical colour values will report 0.00% change, so flatten PNGs onto a known background before comparing if opacity matters.",
    ],
  ],
};

export default seo;
