const seo = {
  intro:
    "Bicycle frame size is set by your inseam, not your height, and this calculator applies the classic fit multipliers to prove it: road seat tube = inseam × 0.67 centre-to-top (0.65 centre-to-centre), mountain frame in inches = inseam in centimetres × 0.226, and hybrid = inseam × 0.63. It reports those alongside the height-band chart a bike shop quotes, plus the LeMond saddle height of inseam × 0.883 and the standover clearance each discipline needs. Two riders of the same height can need different frames, and seeing both methods side by side shows when that is happening to you.",
  useCases: [
    "Buying a road bike online where only seat tube centimetres are listed and no test ride is possible",
    "Checking whether a long-legged 175 cm rider should take the 56 cm frame rather than the 54 cm the height chart suggests",
    "Choosing between a 17 inch and 19 inch mountain frame when the two sizes overlap in the manufacturer's chart",
  ],
  benefits: [
    ["Inseam-first", "The measurement that actually determines standover and saddle height drives the answer."],
    ["Both methods shown", "Formula result and shop height chart appear together so disagreements are visible."],
    ["Saddle height included", "The LeMond figure gives you a starting seatpost setting on day one."],
  ],
  faqs: [
    [
      "What size bike frame do I need for my height?",
      "As a starting point, a 175-183 cm rider takes a 56-57 cm road frame, a 19-20 inch mountain frame or a 51-53 cm hybrid. Confirm with inseam: multiply your cycling inseam in centimetres by 0.67 for a road seat tube, so an 83 cm inseam gives about 55.6 cm.",
    ],
    [
      "How do I measure my cycling inseam?",
      "Stand barefoot with your back against a wall, feet about 15 cm apart, and pull a hardback book firmly up between your legs to mimic saddle pressure. Measure from the floor to the top edge of the book — for most adults this comes to 44-48% of standing height.",
    ],
    [
      "How much standover clearance should a bike have?",
      "About 2.5-5 cm between your inseam and the top tube for a road or hybrid bike, and 5-10 cm for a mountain bike because you dismount onto uneven ground. If the frame's standover height exceeds your inseam you cannot stand over it safely and the frame is too big.",
    ],
    [
      "What should my saddle height be?",
      "The LeMond method sets bottom-bracket centre to saddle top at inseam × 0.883 — an 83 cm inseam gives roughly 73.3 cm. Set that, ride it, then adjust in 2-3 mm steps: pain at the front of the knee usually means the saddle is too low, pain behind the knee or rocking hips means too high.",
    ],
  ],
};

export default seo;
