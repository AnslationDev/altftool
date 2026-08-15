const seo = {
  title: "Quadratic Equation Solver with Discriminant",
  metaDescription:
    "Enter a, b and c to get roots from x = (-b ± √(b² - 4ac)) / 2a — real to three decimals or a complex pair — plus discriminant and vertex.",
  intro:
    "This Quadratic Equation Solver takes the coefficients a, b and c of ax² + bx + c = 0 and returns the roots from the quadratic formula x = (-b ± √(b² - 4ac)) / 2a, along with the discriminant, the nature of the roots, and the vertex at (-b/2a, f(-b/2a)). Students and anyone checking algebra homework get real roots to three decimals when the discriminant is positive, a double root when it is exactly zero, and a ± bi complex pair when it is negative. Enter a = 0 and it tells you the equation is not quadratic rather than dividing by zero.",
  useCases: [
    "You have worked x² - 3x + 2 = 0 by factoring and want to confirm the roots really are 1 and 2 before handing in the sheet.",
    "A projectile problem gives you a height equation and you need the vertex to find the peak, so you read the (-b/2a, f) pair straight off the result instead of completing the square.",
    "Your discriminant came out negative and you want the complex roots written properly as a real part plus an imaginary part rather than being told \"no solution\".",
  ],
  benefits: [
    ["Complex roots are solved, not refused", "When b² - 4ac is negative the answer is returned as -b/2a ± (√|D|)/2a i, instead of stopping at \"no real solution\"."],
    ["Discriminant and vertex come with the roots", "Each run reports b² - 4ac, whether that means two real, one real or two complex roots, and the turning point of the parabola."],
    ["Degenerate input is caught", "If a is zero the equation is linear, and the solver says so instead of returning infinity or NaN from the 2a denominator."],
  ],
  faqs: [
    [
      "What is the quadratic formula this uses?",
      "x = (-b ± √(b² - 4ac)) / 2a, applied directly to the a, b and c you enter. Real roots are shown to three decimal places and complex roots to two.",
    ],
    [
      "What does the discriminant tell me?",
      "The discriminant is b² - 4ac and its sign decides the root type: positive gives two distinct real roots, exactly zero gives one repeated real root at -b/2a, and negative gives a conjugate pair of complex roots. The solver prints the value and labels which case you are in.",
    ],
    [
      "How do I find the vertex of the parabola?",
      "The vertex x-coordinate is -b/2a and the y-coordinate is that value substituted back into ax² + bx + c. The tool computes both and shows them as a coordinate pair rounded to two decimals.",
    ],
    [
      "Why does it say the equation is not quadratic?",
      "Because you entered a = 0, which removes the x² term and leaves the linear equation bx + c = 0. The quadratic formula divides by 2a, so it is undefined there; solve it as x = -c/b instead.",
    ],
  ],
};

export default seo;
