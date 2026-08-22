const seo = {
  title: "Unit Circle Explorer: (cos θ, sin θ), Exact Surds",
  metaDescription:
    "Enter an angle in degrees or radians and see the point (cos θ, sin θ), reference angle and all six ratios, with exact surds at the 16 special angles.",
  steps: [
    "Type the Angle and set 'Angle unit' to Degrees or Radians, or tap one of the special-angle buttons from 0° to 330°.",
    "Drag the 'Drag around the circle (0° to 360°)' slider to sweep the terminal point and watch the radius, sin and cos lines follow.",
    "Read the point (cos θ, sin θ) with quadrant, coterminal angle, reference angle and all six ratios, marked undefined where the divisor is zero; press Copy result.",
  ],
  intro:
    "The Unit Circle Explorer shows where any angle lands on the circle of radius 1 centred at the origin, giving the exact point (cos θ, sin θ) along with its quadrant, reference angle and all six trigonometric ratios. It works from the definition of the unit circle itself — x = cos θ and y = sin θ, with tan θ = y/x — and prints the standard surd values at the sixteen special angles that are multiples of 30° and 45°. It is built for trigonometry and precalculus students who need to see why the signs flip from quadrant to quadrant.",
  useCases: [
    "Check the exact value of sin 210° before writing it into a homework solution.",
    "See why tan 90° is undefined by watching the x-coordinate reach zero.",
    "Convert 750° to its coterminal angle of 30° and confirm both give the same ratios.",
  ],
  benefits: [
    ["Exact surds at special angles", "Shows √3/2 and √2/2 forms at every multiple of 30° and 45°, not just decimals."],
    ["Undefined is never faked", "Where cos θ or sin θ is zero, the tool prints 'undefined' instead of a huge number."],
    ["Reference angle spelled out", "Gives the acute angle to the x-axis so you can reuse first-quadrant values in any quadrant."],
  ],
  faqs: [
    [
      "What are the coordinates of a point on the unit circle?",
      "They are (cos θ, sin θ). At 30° the point is (√3/2, 1/2), which is about (0.8660, 0.5000), because the circle has radius 1 and the x and y legs of the reference triangle are exactly the cosine and sine.",
    ],
    [
      "Why is tan 90° undefined?",
      "Because tan θ = sin θ / cos θ and cos 90° = 0, so the division has no value. The same happens at 270°; cotangent and cosecant are undefined instead at 0° and 180°, where sin θ = 0.",
    ],
    [
      "What is a reference angle and how do I find it?",
      "A reference angle is the acute angle between the terminal side and the x-axis, always between 0° and 90°. Subtract from 180° in quadrant II, subtract 180° in quadrant III, and subtract from 360° in quadrant IV — so 210° has a reference angle of 30°.",
    ],
    [
      "Which trig functions are positive in each quadrant?",
      "All six are positive in quadrant I, only sine and cosecant in quadrant II, only tangent and cotangent in quadrant III, and only cosine and secant in quadrant IV — the 'All Students Take Calculus' mnemonic.",
    ],
  ],
};

export default seo;
