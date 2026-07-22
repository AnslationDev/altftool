const info = {
  "scientific-calculator": {
    intro: [
      "A scientific calculator evaluates full arithmetic expressions along with trigonometry, logarithms, exponents, roots, factorials and the constants pi and e. Instead of working one step at a time, you type an entire expression and it is evaluated using the correct order of operations.",
      "It is the everyday tool for algebra, geometry, physics and engineering problems where you need functions and grouping that a basic four-function calculator cannot handle.",
    ],
    howToUse: [
      "Choose Degrees or Radians — this only affects the trigonometric functions (sin, cos, tan).",
      "Tap digits, operators and functions to build an expression; function keys such as sin( or √( insert an opening bracket for you.",
      "Close any brackets you open, then press = to evaluate. A live preview of the answer appears beneath the expression as you type.",
      "Use AC to clear everything or DEL to delete the last character.",
    ],
    goodToKnow: [
      "Order of operations is applied automatically: brackets first, then exponents (^), then × and ÷, then + and −.",
      "Trigonometric functions read the angle mode: sin(30) is 0.5 in degrees but about −0.988 in radians.",
      "n! (factorial) is only defined for whole numbers 0 and above; ln is the natural log (base e) while log is base 10.",
      "π is about 3.14159 and e is about 2.71828; both can be used anywhere a number is expected.",
    ],
    faqs: [
      { q: "What is the difference between degrees and radians?", a: "They are two units for measuring angles. A full circle is 360 degrees or 2π radians. Set the mode to match how your problem states the angle, otherwise trig results will be wrong." },
      { q: "What does log mean here versus ln?", a: "log is the base-10 logarithm and ln is the natural logarithm (base e). So log(1000) = 3 and ln(e) = 1." },
      { q: "How do I calculate a percentage?", a: "The % key computes the remainder (modulo). For a percentage of a number just multiply, e.g. 0.2 * 150 for 20% of 150." },
      { q: "Why did I get an error?", a: "Errors come from undefined math such as dividing by zero, the square root of a negative number, or an unbalanced bracket. Check the expression and try again." },
    ],
  },

  "basic-calculator": {
    intro: [
      "A basic calculator performs the four core arithmetic operations — addition, subtraction, multiplication and division — plus percentage. It is designed for quick everyday sums where you do not need scientific functions.",
      "You build a short expression and press equals; the answer is calculated using standard operator precedence so multiplication and division are handled before addition and subtraction.",
    ],
    howToUse: [
      "Tap the digit and operator keys to enter a calculation such as 12 + 8 × 3.",
      "Press = to see the result; a live preview also appears while you type.",
      "Use DEL to remove the last entry or AC to clear and start over.",
    ],
    goodToKnow: [
      "Multiplication (×) and division (÷) are evaluated before addition (+) and subtraction (−).",
      "The % key returns the remainder after division (for example 17 % 5 = 2).",
      "Dividing by zero is undefined and shows an error rather than a number.",
    ],
    faqs: [
      { q: "Does it follow order of operations?", a: "Yes. 2 + 3 × 4 evaluates to 14, not 20, because multiplication is done first." },
      { q: "How do I take a percentage of a value?", a: "Multiply by the decimal form, for example 200 × 0.15 gives 15% of 200. For more advanced percentage work, use the dedicated percentage calculator." },
      { q: "Is there a decimal limit?", a: "Results are shown with everyday precision and long decimals are trimmed of tiny rounding noise so the display stays readable." },
    ],
  },

  "fraction-calculator": {
    intro: [
      "A fraction calculator adds, subtracts, multiplies or divides two fractions and reduces the answer to its lowest terms. It also shows the decimal equivalent and, where relevant, the result as a mixed number.",
      "It is useful for homework, cooking measurements, woodworking and any task where quantities are naturally expressed as fractions rather than decimals.",
    ],
    formula: {
      expression: "a/b + c/d = (a·d + c·b) / (b·d)   →   simplify by dividing by gcd",
      where: [
        ["a, c", "numerators (top numbers)"],
        ["b, d", "denominators (bottom numbers)"],
        ["gcd", "greatest common divisor of the result's numerator and denominator"],
      ],
      note: "Multiply: (a·c)/(b·d). Divide: (a·d)/(b·c) — the same as multiplying by the reciprocal of the second fraction.",
    },
    howToUse: [
      "Enter the numerator and denominator of the first fraction.",
      "Choose the operation: add, subtract, multiply or divide.",
      "Enter the second fraction, then read the simplified result, its decimal value and any mixed-number form.",
    ],
    goodToKnow: [
      "The result is always reduced using the greatest common divisor, so 2/4 is shown as 1/2.",
      "A denominator can never be zero — that would make the fraction undefined.",
      "Dividing by a fraction is the same as multiplying by its reciprocal (flip the second fraction).",
    ],
    faqs: [
      { q: "How do I add fractions with different denominators?", a: "Give them a common denominator by cross-multiplying: a/b + c/d = (a·d + c·b) / (b·d). The calculator does this for you and then simplifies." },
      { q: "What is a mixed number?", a: "A whole number combined with a proper fraction, such as 7/3 = 2 1/3. It is shown whenever the result is an improper fraction." },
      { q: "Can I use negative fractions?", a: "Yes. Enter a negative numerator (or denominator) and the sign is handled correctly; the answer keeps a positive denominator by convention." },
    ],
  },

  "exponent-calculator": {
    intro: [
      "An exponent calculator raises a base number to a power (the exponent), repeatedly multiplying the base by itself. It handles positive, negative and fractional exponents.",
      "Exponents appear everywhere from compound interest and scientific notation to areas, volumes and growth models, making this a core building block for algebra and science.",
    ],
    formula: {
      expression: "result = bⁿ = b × b × … × b   (n times)",
      where: [
        ["b", "the base"],
        ["n", "the exponent (power)"],
      ],
      note: "A negative exponent means a reciprocal: b⁻ⁿ = 1 / bⁿ. A fractional exponent means a root: b^(1/n) = ⁿ√b.",
    },
    howToUse: [
      "Enter the base value.",
      "Enter the exponent — it can be a whole number, a decimal or a negative number.",
      "Read the result instantly; the expression bⁿ is shown alongside the exact value.",
    ],
    goodToKnow: [
      "Any non-zero number to the power 0 equals 1.",
      "A negative base with a whole-number exponent is fine (e.g. (−2)³ = −8), but a negative base with a fractional exponent has no real value and shows an error.",
      "0 to a negative power is undefined because it implies dividing by zero.",
    ],
    faqs: [
      { q: "What does a fractional exponent mean?", a: "It represents a root. For example 8^(1/3) is the cube root of 8, which is 2, and 16^0.5 is the square root of 16, which is 4." },
      { q: "Why is (−8)^(1/3) an error here?", a: "Fractional powers of negative numbers have no real value in standard arithmetic, so the calculator reports an error. Use the root calculator's cube-root mode, which handles −8 correctly as −2." },
      { q: "How do exponents relate to scientific notation?", a: "Powers of 10 scale numbers: 10³ = 1000 and 10⁻² = 0.01, which is how very large or very small values are written compactly." },
    ],
  },

  "root-calculator": {
    intro: [
      "A root calculator finds the square root, cube root or any n-th root of a number. The n-th root answers the question: what value, multiplied by itself n times, gives this number?",
      "Roots are the inverse of exponents and are used constantly in geometry (side lengths from areas), statistics (standard deviation) and physics.",
    ],
    formula: {
      expression: "ⁿ√x = x^(1/n)",
      where: [
        ["x", "the number (the radicand)"],
        ["n", "the root index (2 for square root, 3 for cube root, …)"],
      ],
      note: "An even root of a negative number has no real value. An odd root of a negative number is real and negative, e.g. ∛(−27) = −3.",
    },
    howToUse: [
      "Choose Square root, Cube root, or Nth root.",
      "Enter the number you want the root of.",
      "For an n-th root, also enter the index n; the result and a verification (result ^ n) are shown.",
    ],
    goodToKnow: [
      "Squaring a root returns the original number, which is why the result is verified as valueⁿ ≈ x.",
      "The square root of a negative number is not a real number, so it shows an error.",
      "The cube root (and any odd root) of a negative number is valid and negative.",
    ],
    faqs: [
      { q: "Why can't I take the square root of a negative number?", a: "No real number multiplied by itself gives a negative result, so a real square root does not exist. Such values belong to complex numbers, which this tool does not cover." },
      { q: "Is the n-th root the same as a power?", a: "Yes — the n-th root of x equals x raised to the power 1/n. That identity is exactly how the result is computed." },
      { q: "Can n be a decimal?", a: "It can, and the result is still x^(1/n). Whole-number indices are the most common, but fractional indices are handled for positive numbers." },
    ],
  },

  "rounding-calculator": {
    intro: [
      "A rounding calculator rounds a number to a chosen precision — a set number of decimal places or the nearest 10, 100 or 1000 — and also shows the floor (rounded down) and ceiling (rounded up) values.",
      "Rounding keeps numbers readable and appropriate for their context, whether that is money to two decimals or a population figure to the nearest thousand.",
    ],
    formula: {
      expression: "rounded = round(x / s) × s   where s is the rounding step",
      where: [
        ["x", "the number being rounded"],
        ["s", "the step (0.01 for 2 decimals, 10 for nearest ten, …)"],
      ],
      note: "Round-half-up: a value exactly halfway is rounded to the larger neighbour. Floor always rounds toward −∞ and ceiling always rounds toward +∞.",
    },
    howToUse: [
      "Enter the number to round.",
      "Pick the precision — decimal places or nearest 10 / 100 / 1000.",
      "Read the main rounded value, plus the rounded-down and rounded-up alternatives.",
    ],
    goodToKnow: [
      "Rounding down (floor) and rounding up (ceil) bracket the true value; standard rounding picks whichever is nearer.",
      "Round-half-up sends a trailing 5 to the larger value (2.5 → 3).",
      "Rounding to the nearest 100 or 1000 is handy for estimates and headline figures.",
    ],
    faqs: [
      { q: "What is the difference between rounding, floor and ceiling?", a: "Rounding goes to the nearest value at the chosen precision. Floor always goes down to the lower step, and ceiling always goes up to the higher step, regardless of how close the number is." },
      { q: "How does half-way rounding work?", a: "This tool uses round-half-up, so exactly 2.5 becomes 3 and 2.45 rounded to one decimal becomes 2.5. Some fields prefer round-half-to-even (banker's rounding) for large data sets." },
      { q: "Can I round to the nearest 5 or 25?", a: "The presets cover decimals and powers of ten. For other steps, divide by the step, round, then multiply back — which is exactly the formula used here." },
    ],
  },

  "factor-calculator": {
    intro: [
      "A factor calculator lists every factor (divisor) of a whole number and gives its prime factorization — the unique set of prime numbers that multiply together to make it.",
      "Factors and prime factorization underpin simplifying fractions, finding common denominators, computing GCF and LCM, and much of number theory.",
    ],
    formula: {
      expression: "n = p₁^a₁ × p₂^a₂ × … × pₖ^aₖ",
      where: [
        ["n", "the number being factored"],
        ["p₁…pₖ", "distinct prime factors"],
        ["a₁…aₖ", "how many times each prime divides n"],
      ],
      note: "By the fundamental theorem of arithmetic, every whole number greater than 1 has exactly one prime factorization.",
    },
    howToUse: [
      "Enter a positive whole number (up to 10,000,000).",
      "Read the full list of factors and the total count.",
      "Check the prime factorization and copy the factor list if you need it elsewhere.",
    ],
    goodToKnow: [
      "Factors always include 1 and the number itself.",
      "A prime number has exactly two factors — 1 and itself — so its prime factorization is just the number.",
      "The number of factors can be found from the exponents in the prime factorization: (a₁+1)(a₂+1)…",
    ],
    faqs: [
      { q: "What is the difference between a factor and a prime factor?", a: "A factor is any whole number that divides evenly. A prime factor is a factor that is itself prime. For 12 the factors are 1, 2, 3, 4, 6, 12 while the prime factors are just 2 and 3." },
      { q: "How is this used to simplify fractions?", a: "Prime factorization reveals the common factors of the numerator and denominator, letting you cancel them to reduce the fraction to lowest terms." },
      { q: "Why is there an upper limit?", a: "Very large numbers require far more computation to factor. Capping the input keeps results instant in the browser." },
    ],
  },

  "percentage-calculator": {
    intro: [
      "A percentage calculator works out what one number is as a percentage of another, finds a percentage of a value, or measures the percentage increase or decrease between two numbers.",
      "Percentages express a part per hundred, making them the standard way to compare discounts, tax, tips, grades and growth.",
    ],
    formula: {
      expression: "part = (percent / 100) × whole    •    change % = ((new − old) / old) × 100",
      where: [
        ["percent", "the rate, expressed per hundred"],
        ["whole", "the base or original amount"],
        ["old, new", "the starting and ending values for a change"],
      ],
    },
    howToUse: [
      "Pick the type of question: percent of a number, X is what percent of Y, or percentage change.",
      "Enter the two known values.",
      "Read the answer, and use it directly for discounts, markups or growth figures.",
    ],
    goodToKnow: [
      "A percentage is just a fraction out of 100: 25% = 25/100 = 0.25.",
      "A percentage increase followed by the same percentage decrease does not return the original value.",
      "Percentage points and percent are different: going from 10% to 12% is a 2 percentage-point rise but a 20% relative increase.",
    ],
    faqs: [
      { q: "How do I find what percent one number is of another?", a: "Divide the part by the whole and multiply by 100. For example 30 out of 120 is (30 / 120) × 100 = 25%." },
      { q: "How do I add a percentage to a price?", a: "Multiply the price by (1 + rate/100). For a 15% markup on 200, that is 200 × 1.15 = 230." },
      { q: "What is percentage change?", a: "It measures growth or decline relative to the original value: ((new − old) / old) × 100. A negative result is a decrease." },
    ],
  },

  "average-calculator": {
    intro: [
      "An average calculator finds the central value of a set of numbers. The most common average is the arithmetic mean, but the median and mode describe the centre in different, useful ways.",
      "Averages summarise data with a single representative figure — grades, prices, times or measurements — so they can be compared at a glance.",
    ],
    formula: {
      expression: "mean = (x₁ + x₂ + … + xₙ) / n",
      where: [
        ["x₁…xₙ", "the individual values"],
        ["n", "how many values there are"],
      ],
      note: "Median is the middle value when the numbers are sorted; mode is the value that appears most often.",
    },
    howToUse: [
      "Enter your numbers separated by commas, spaces or new lines.",
      "Read the mean along with the count and sum.",
      "Compare the mean with the median if you suspect outliers are skewing the result.",
    ],
    goodToKnow: [
      "The mean is sensitive to outliers — one very large value pulls it up noticeably.",
      "The median is more robust for skewed data because it ignores how extreme the outliers are.",
      "A data set can have no mode, one mode, or several modes.",
    ],
    faqs: [
      { q: "What is the difference between mean, median and mode?", a: "The mean is the sum divided by the count, the median is the middle value when sorted, and the mode is the most frequent value. They can all differ for the same data." },
      { q: "When should I use the median instead of the mean?", a: "Use the median when the data is skewed or has outliers — for example house prices or incomes — because it better represents a typical value." },
      { q: "How is the mean calculated for many numbers?", a: "Add every value together to get the sum, then divide by how many values there are." },
    ],
  },

  "ratio-calculator": {
    intro: [
      "A ratio calculator simplifies a ratio to its lowest terms, scales it up or down, and solves for a missing value in an equivalent ratio (a proportion).",
      "Ratios compare quantities — mixing paint, scaling recipes, aspect ratios or map scales — and simplifying them makes the relationship easy to read.",
    ],
    formula: {
      expression: "a : b = (a / g) : (b / g)   where g = gcd(a, b)    •    proportion: a/b = c/d ⇒ d = c·b / a",
      where: [
        ["a, b", "the two parts of the ratio"],
        ["g", "greatest common divisor of a and b"],
        ["c, d", "the corresponding parts of an equivalent ratio"],
      ],
    },
    howToUse: [
      "Enter the two terms of your ratio, such as 16 and 9.",
      "Read the simplified form and its decimal/percentage equivalents.",
      "To scale, enter one term of the new ratio and solve for the matching value.",
    ],
    goodToKnow: [
      "Simplifying a ratio divides both terms by their greatest common divisor, so 20:50 becomes 2:5.",
      "Equivalent ratios represent the same proportion, like 1:2, 2:4 and 50:100.",
      "A ratio can be written as a fraction, a decimal or a percentage of the whole.",
    ],
    faqs: [
      { q: "How do I simplify a ratio?", a: "Divide both numbers by their greatest common divisor. For 18:24 the GCD is 6, giving 3:4." },
      { q: "How do I solve a proportion?", a: "Cross-multiply. If a/b = c/d and one value is unknown, rearrange to find it, e.g. d = c × b / a." },
      { q: "What is an aspect ratio?", a: "It is the ratio of width to height, such as 16:9 for widescreen video, describing shape independently of actual size." },
    ],
  },

  "quadratic-equation-calculator": {
    intro: [
      "A quadratic equation solver finds the roots (solutions) of ax² + bx + c = 0 using the quadratic formula, and reports the discriminant that tells you how many real roots exist.",
      "Quadratics model projectile paths, areas, optimisation and many physics and engineering relationships, so solving them quickly is a common need.",
    ],
    formula: {
      expression: "x = (−b ± √(b² − 4ac)) / (2a)",
      where: [
        ["a", "coefficient of x² (must not be 0)"],
        ["b", "coefficient of x"],
        ["c", "the constant term"],
      ],
      note: "The discriminant D = b² − 4ac: if D > 0 there are two real roots, if D = 0 one repeated root, and if D < 0 no real roots (the roots are complex).",
    },
    howToUse: [
      "Enter the coefficients a, b and c from your equation ax² + bx + c = 0.",
      "Read the discriminant to see how many real solutions to expect.",
      "Read the root(s); the vertex and axis of symmetry describe the parabola's shape.",
    ],
    goodToKnow: [
      "If a = 0 the equation is linear, not quadratic, and the quadratic formula does not apply.",
      "The discriminant's sign alone tells you whether the roots are real and distinct, real and equal, or complex.",
      "The two roots are symmetric about the vertex line x = −b / (2a).",
    ],
    faqs: [
      { q: "What is the discriminant?", a: "It is b² − 4ac, the expression under the square root. Its sign reveals whether there are two real roots, one repeated real root, or no real roots." },
      { q: "What happens when the discriminant is negative?", a: "There are no real solutions; the parabola does not cross the x-axis. The roots are a pair of complex conjugates." },
      { q: "Can I always use the quadratic formula?", a: "Yes, for any quadratic with a ≠ 0. Factoring or completing the square can be faster in simple cases, but the formula always works." },
    ],
  },

  "standard-deviation-calculator": {
    intro: [
      "A standard deviation calculator measures how spread out a set of numbers is around their mean. A small standard deviation means the values cluster tightly; a large one means they are widely dispersed.",
      "It is a cornerstone of statistics, used in finance (risk), quality control, science and grading to quantify variability, and it also reports the variance, mean and count.",
    ],
    formula: {
      expression: "population σ = √( Σ(xᵢ − μ)² / N )    •    sample s = √( Σ(xᵢ − x̄)² / (n − 1) )",
      where: [
        ["xᵢ", "each value in the data set"],
        ["μ, x̄", "the mean of the population or sample"],
        ["N, n", "the number of values"],
      ],
      note: "Use the population formula when your data is the entire group; use the sample formula (dividing by n − 1) when it is a sample drawn from a larger population.",
    },
    howToUse: [
      "Enter your numbers separated by commas, spaces or new lines.",
      "Choose whether the data is a full population or a sample.",
      "Read the standard deviation, along with the variance and mean.",
    ],
    goodToKnow: [
      "Variance is the square of the standard deviation, so it is in squared units.",
      "The sample formula divides by n − 1 (Bessel's correction) to give an unbiased estimate from a sample.",
      "About 68% of values in a normal distribution lie within one standard deviation of the mean.",
    ],
    faqs: [
      { q: "What is the difference between population and sample standard deviation?", a: "Population divides by N and is used when you have every member of the group. Sample divides by n − 1 and is used when your data is a subset that estimates a larger population." },
      { q: "How does standard deviation relate to variance?", a: "Standard deviation is the square root of the variance. Variance is easier to work with algebraically, but standard deviation is in the same units as the data, making it easier to interpret." },
      { q: "What does a standard deviation of 0 mean?", a: "Every value is identical to the mean — there is no spread at all in the data." },
    ],
  },
};

export default info;
