const seo = {
  intro:
    "The Algebra Solver works out three kinds of equation and shows every line of the working: single-variable linear equations by isolating x, quadratics with the discriminant Δ = b² − 4ac and the quadratic formula, and two-equation systems in x and y by Cramer's rule. It reports the numeric answer alongside the exact fraction whenever the two differ, so 3x = 5 comes back as both 1.666667 and 5/3. It is aimed at students checking homework, where the steps matter more than the final number.",
  useCases: [
    "You solved 2x + 5 = 13 by hand, got a different answer to the textbook, and want to see which line you dropped a sign on",
    "You need to know whether x² + 2x + 5 = 0 has real roots before you try to sketch it, and the discriminant answers that in one step",
    "You are stuck on a simultaneous-equations question like 2x + y = 7, x − y = 2 and want the determinant worked out rather than a bare (3, 1)",
  ],
  benefits: [
    ["Every step is written out", "Coefficients identified, discriminant computed, roots substituted — not just the final value."],
    ["Exact fractions, not just decimals", "Answers are reduced with a GCD, so you get 5/3 rather than a rounded 1.666667."],
    ["Names the case, not just the number", "Distinguishes a unique solution, a repeated root, two real roots, complex roots, no solution and infinitely many."],
  ],
  faqs: [
    [
      "What does the discriminant tell you about a quadratic?",
      "The sign of Δ = b² − 4ac decides the roots: Δ > 0 gives two distinct real roots, Δ = 0 gives one repeated real root at x = −b/2a, and Δ < 0 gives no real roots, only a complex conjugate pair. For x² + 2x + 5 = 0, Δ = 4 − 20 = −16, so the roots are complex.",
    ],
    [
      "How does the solver handle systems of two equations?",
      "By Cramer's rule. It computes the determinant D = a₁b₂ − b₁a₂, then Dx and Dy, and gives x = Dx/D and y = Dy/D. If D = 0 there is no unique solution, because the two lines are either parallel or the same line.",
    ],
    [
      "What format should I type the equation in?",
      "Plain text with x as the variable: 2x + 5 = 13 for linear, x^2 - 5x + 6 = 0 for quadratic (x² and x**2 both work), and two comma-separated equations like 2x + y = 7, x - y = 2 for a system. Spaces are ignored, and quadratics are read from the left-hand side with the right side taken as 0.",
    ],
    [
      "Can a linear equation have no solution?",
      "Yes. When every x term cancels out, the equation is no longer about x. If what remains is a false statement such as 5 = 3 there is no solution; if it reduces to 0 = 0 the equation is true for every x, which is infinitely many solutions. The solver labels both cases explicitly rather than returning an error.",
    ],
  ],
};

export default seo;
