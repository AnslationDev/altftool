const seo = {
  title: "Roof Pitch Calculator: Rise in 12, Degrees",
  metaDescription:
    "Convert roof pitch between rise-in-12, degrees, percent and 1-in-n, with slope factor, hip factor, rafter lengths and a minimum-pitch check.",
  steps: [
    "Under 'How is your pitch written?' choose Rise in 12, Degrees, Percent, 'Ratio 1 : n' or 'Measured rise & run', then enter the value — in rise-in-12 mode the 2 in 12 to 12 in 12 chips fill it for you.",
    "Optionally add 'Full span wall to wall (ft)' and 'Horizontal overhang at the eaves (ft)'; the conversion recomputes as you type, with no calculate button.",
    "Read the Pitch angle headline and the table of Rise per 12 of run, Grade as a percentage, Ratio 1 : n, Slope factor, Hip and valley factor and 'Rafter to cut in total', check 'Coverings this pitch can take' for Suitable or Too shallow, then press 'Copy result'.",
  ],
  intro:
    "Roof pitch is a single quantity — the tangent of the slope, rise divided by run — written four different ways, and this calculator converts between all of them: rise per 12 of run, degrees (atan of rise/run), percentage grade and 1-in-n ratio. It also returns the slope factor sqrt(1 + (rise/run)²) that turns plan area into roof area, the hip and valley factor sqrt(2 + (rise/run)²), and the rafter lengths for a given span. Useful when a drawing gives degrees, the roofer talks in twelfths and the sheet datasheet quotes a minimum in percent.",
  useCases: [
    "Turning a 26.57-degree figure on an architect's section into the 6-in-12 the carpenter wants",
    "Checking whether a shallow 3-in-12 roof is steep enough for the tile the client picked",
    "Getting the rafter cut length for a 30 ft span, including the extra for a 1.5 ft eaves overhang",
  ],
  benefits: [
    ["Five notations, one answer", "Enter degrees, percent, ratio, rise-in-12 or a tape measurement and get the rest instantly."],
    ["Slope and hip factors", "The two multipliers a take-off actually needs, given to four decimals."],
    ["Covering check built in", "Flags the materials whose minimum pitch your slope fails to reach."],
  ],
  faqs: [
    [
      "What is a 6/12 roof pitch in degrees?",
      "26.57 degrees, because the angle is the arctangent of 6 divided by 12, which is arctan(0.5). It is also a 50% grade, a 1-in-2 ratio, and it makes the roof surface 11.8% larger than the plan area it covers.",
    ],
    [
      "How do you convert roof pitch to degrees?",
      "Divide the rise by the run and take the arctangent: angle = atan(rise / run). For a pitch written as X-in-12 that is atan(X / 12), so 4-in-12 is 18.43 degrees, 9-in-12 is 36.87 degrees and 12-in-12 is exactly 45 degrees.",
    ],
    [
      "What is the minimum roof pitch for tiles?",
      "Concrete interlocking tiles are generally laid at 4-in-12 (about 18.4 degrees) or steeper, and clay pantiles including Mangalore tiles want roughly 5-in-12 (about 22.5 degrees) upward. Below the manufacturer's stated minimum the tile relies on the underlay rather than the lap, which is where wind-driven monsoon rain gets in.",
    ],
    [
      "What is the difference between roof pitch and slope?",
      "In everyday use they are the same thing, but in traditional carpentry 'pitch' sometimes means rise divided by the FULL span rather than by the half-span run — so a roof of rise 6 over a 24 ft span is a 1/4 pitch and a 6-in-12 slope. This calculator uses rise over run throughout, which is what modern drawings and datasheets mean.",
    ],
  ],
};

export default seo;
