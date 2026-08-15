const seo = {
  title: "Dimensional Consistency Checker: Compare M L T",
  metaDescription:
    "Enter each side of an equation as base-dimension exponents like M1 L1 T-2 and get an exponent-by-exponent match table across all seven SI base dimensions.",
  steps: [
    "Type each side's exponents into 'Left-side dimension vector' and 'Right-side dimension vector' as tokens like M1 L1 T-2.",
    "Adjust 'Allowed base symbols' (default M,L,T,I,Θ,N,J) or load the 'Force = mass × acceleration' preset.",
    "Read the verdict — 'Dimension vectors match' or 'Dimensionally inconsistent' — with a per-dimension Match/Mismatch table.",
  ],
  intro:
    "This checker compares the two sides of an equation as base-dimension vectors — exponents of mass M, length L, time T, current I, temperature Θ, amount N and luminous intensity J — and reports a match or an exponent-by-exponent mismatch. You reduce each side to base dimensions yourself and enter them as tokens like \"M1 L1 T-2\"; the tool then lines the exponents up in a table and counts the disagreements. It is a bookkeeping check on dimensional homogeneity, not an algebra parser or a unit converter.",
  useCases: [
    "You derived an expression for drag or flow rate at 2 a.m. and want to confirm both sides come out as M1 L1 T-2 before you build anything on it",
    "A physics answer is out by a factor you cannot find, and you want to know whether the error is dimensional or purely numerical",
    "You are marking or reviewing derivations and want the specific base dimension that fails, rather than a bare \"wrong\"",
  ],
  benefits: [
    ["Names the failing dimension", "The table shows left and right exponents per base symbol, so a mismatch points at T or L directly instead of at the equation as a whole."],
    ["All seven SI base dimensions", "M, L, T, I, Θ, N and J are compared, so electrical, thermal and photometric expressions are covered, not just mechanics."],
    ["Honest about what it proves", "The result states outright that matching dimensions are necessary but not sufficient for a physically correct equation."],
  ],
  faqs: [
    [
      "What is dimensional consistency?",
      "An equation is dimensionally consistent when every term has the same exponents on each base dimension — Newton's second law works because both force and mass × acceleration reduce to M1 L1 T-2. If one side is L1 and the other L1 T-1, the equation is wrong no matter what the numbers say.",
    ],
    [
      "What are the seven base dimensions?",
      "Mass (M), length (L), time (T), electric current (I), thermodynamic temperature (Θ), amount of substance (N) and luminous intensity (J) — the dimensional counterparts of the seven SI base units kilogram, metre, second, ampere, kelvin, mole and candela. Every derived quantity is a product of powers of these.",
    ],
    [
      "How do I enter a dimension vector?",
      "As symbol-and-exponent pairs separated by spaces, with negative exponents written directly: energy is \"M1 L2 T-2\", pressure is \"M1 L-1 T-2\", and a dimensionless quantity is left blank or entered as zero exponents. Anything you omit is treated as exponent 0.",
    ],
    [
      "If both sides match, is my equation correct?",
      "Not necessarily. Dimensional analysis cannot see dimensionless factors, so an expression that should carry a ½, a 2π, or a drag coefficient passes the check while still being numerically wrong. It also cannot catch a sign error — treat a match as ruling out one whole class of mistakes, not as a proof.",
    ],
  ],
};

export default seo;
