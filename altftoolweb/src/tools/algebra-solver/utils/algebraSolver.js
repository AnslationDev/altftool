function roundNum(n, decimals = 6) {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function simplifyFraction(num, den) {
  if (den === 0) return { n: num, d: den };
  const sign = (num < 0) !== (den < 0) ? -1 : 1;
  const g = gcd(Math.abs(num), Math.abs(den));
  return { n: sign * (Math.abs(num) / g), d: Math.abs(den) / g };
}

function formatFraction(num, den) {
  const s = simplifyFraction(num, den);
  if (s.d === 1) return String(s.n);
  return `${s.n}/${s.d}`;
}

function parseLinear(equation) {
  const cleaned = equation.replace(/\s+/g, "").toLowerCase();
  const parts = cleaned.split("=");
  if (parts.length !== 2) return null;

  function parseSide(str) {
    let coeff = 0;
    let constant = 0;
    const tokens = str.replace(/-/g, "+-").split("+").filter(Boolean);
    for (const t of tokens) {
      if (t.includes("x")) {
        const c = t.replace("x", "");
        coeff += c === "" || c === "+" ? 1 : c === "-" ? -1 : parseFloat(c);
      } else {
        constant += parseFloat(t) || 0;
      }
    }
    return { coeff, constant };
  }

  const left = parseSide(parts[0]);
  const right = parseSide(parts[1]);
  return {
    a: left.coeff - right.coeff,
    b: right.constant - left.constant,
  };
}

function parseQuadratic(equation) {
  const cleaned = equation.replace(/\s+/g, "").toLowerCase().replace(/\*\*/g, "^");
  const parts = cleaned.split("=");
  const lhs = parts[0];
  let a = 0, b = 0, c = 0;

  const terms = lhs.replace(/-/g, "+-").split("+").filter(Boolean);
  for (const t of terms) {
    if (t.includes("x^2") || t.includes("x²")) {
      const coeff = t.replace(/x\^2|x²/, "");
      a += coeff === "" || coeff === "+" ? 1 : coeff === "-" ? -1 : parseFloat(coeff);
    } else if (t.includes("x")) {
      const coeff = t.replace("x", "");
      b += coeff === "" || coeff === "+" ? 1 : coeff === "-" ? -1 : parseFloat(coeff);
    } else {
      c += parseFloat(t) || 0;
    }
  }
  return { a, b, c };
}

function parseSystem(eqStr) {
  const lines = eqStr.split(",").map((s) => s.trim());
  if (lines.length !== 2) return null;

  function parseEq(str) {
    const cleaned = str.replace(/\s+/g, "").toLowerCase();
    const parts = cleaned.split("=");
    if (parts.length !== 2) return null;

    let xCoeff = 0, yCoeff = 0, constant = 0;
    const tokens = parts[0].replace(/-/g, "+-").split("+").filter(Boolean);
    for (const t of tokens) {
      if (t.includes("x")) {
        const c = t.replace("x", "");
        xCoeff += c === "" || c === "+" ? 1 : c === "-" ? -1 : parseFloat(c);
      } else if (t.includes("y")) {
        const c = t.replace("y", "");
        yCoeff += c === "" || c === "+" ? 1 : c === "-" ? -1 : parseFloat(c);
      }
    }
    constant = parseFloat(parts[1]) || 0;
    return { xCoeff, yCoeff, constant };
  }

  const eq1 = parseEq(lines[0]);
  const eq2 = parseEq(lines[1]);
  if (!eq1 || !eq2) return null;
  return { eq1, eq2 };
}

export function solveLinear(equation) {
  const parsed = parseLinear(equation);
  if (!parsed || parsed.a === 0) {
    if (parsed && parsed.b === 0) return { type: "infinite", steps: ["0 = 0 — infinitely many solutions."] };
    return { type: "none", steps: ["No solution exists for this equation."] };
  }
  const { a, b } = parsed;
  const x = b / a;
  const steps = [
    `Start with: ${equation}`,
    `Move constant to right: ${a}x = ${b}`,
    `Divide both sides by ${a}: x = ${b} / ${a}`,
    `Solution: x = ${roundNum(x)}`,
  ];
  const fracX = formatFraction(b, a);
  if (fracX !== String(roundNum(x))) {
    steps.push(`Exact value: x = ${fracX}`);
  }
  return { type: "unique", solutions: [{ var: "x", value: roundNum(x), exact: fracX }], steps };
}

export function solveQuadratic(equation) {
  const { a, b, c } = parseQuadratic(equation);
  if (a === 0) return solveLinear(`${b}x + ${c} = 0`);

  const discriminant = b * b - 4 * a * c;
  const steps = [
    `Start with: ${equation}`,
    `Identify: a = ${a}, b = ${b}, c = ${c}`,
    `Discriminant: Δ = b² - 4ac = ${b}² - 4(${a})(${c}) = ${discriminant}`,
  ];

  if (discriminant < 0) {
    steps.push(`Δ < 0 → No real solutions (two complex roots)`);
    const realPart = roundNum(-b / (2 * a));
    const imagPart = roundNum(Math.sqrt(-discriminant) / (2 * a));
    steps.push(`Complex roots: x = ${realPart} ± ${imagPart}i`);
    return { type: "complex", steps, solutions: [] };
  }

  if (discriminant === 0) {
    const x = roundNum(-b / (2 * a));
    steps.push(`Δ = 0 → One repeated real root`);
    steps.push(`x = -b / (2a) = ${-b} / ${2 * a} = ${x}`);
    return { type: "repeated", solutions: [{ var: "x", value: x }], steps };
  }

  const sqrtD = Math.sqrt(discriminant);
  const x1 = roundNum((-b + sqrtD) / (2 * a));
  const x2 = roundNum((-b - sqrtD) / (2 * a));
  steps.push(`Δ > 0 → Two distinct real roots`);
  steps.push(`√Δ = √${discriminant} = ${roundNum(sqrtD)}`);
  steps.push(`x₁ = (-b + √Δ) / 2a = (${-b} + ${roundNum(sqrtD)}) / ${2 * a} = ${x1}`);
  steps.push(`x₂ = (-b - √Δ) / 2a = (${-b} - ${roundNum(sqrtD)}) / ${2 * a} = ${x2}`);

  const exact1 = formatFraction(-b + sqrtD, 2 * a);
  const exact2 = formatFraction(-b - sqrtD, 2 * a);
  if (exact1 !== String(x1)) {
    steps.push(`Exact: x₁ = ${exact1}, x₂ = ${exact2}`);
  }

  return { type: "two", solutions: [{ var: "x₁", value: x1, exact: exact1 }, { var: "x₂", value: x2, exact: exact2 }], steps };
}

export function solveSystem(equation) {
  const parsed = parseSystem(equation);
  if (!parsed) return { type: "error", steps: ["Could not parse the system. Use format: 2x + y = 7, x - y = 2"] };

  const { eq1, eq2 } = parsed;
  const det = eq1.xCoeff * eq2.yCoeff - eq1.yCoeff * eq2.xCoeff;

  const steps = [
    `Equation 1: ${eq1.xCoeff}x + ${eq1.yCoeff}y = ${eq1.constant}`,
    `Equation 2: ${eq2.xCoeff}x + ${eq2.yCoeff}y = ${eq2.constant}`,
    `Determinant: D = (${eq1.xCoeff})(${eq2.yCoeff}) - (${eq1.yCoeff})(${eq2.xCoeff}) = ${det}`,
  ];

  if (det === 0) {
    steps.push(`D = 0 → System has no unique solution (parallel or coincident lines)`);
    return { type: "none", steps };
  }

  const Dx = eq1.constant * eq2.yCoeff - eq1.yCoeff * eq2.constant;
  const Dy = eq1.xCoeff * eq2.constant - eq1.constant * eq2.xCoeff;
  const x = roundNum(Dx / det);
  const y = roundNum(Dy / det);

  steps.push(`Dx = (${eq1.constant})(${eq2.yCoeff}) - (${eq1.yCoeff})(${eq2.constant}) = ${Dx}`);
  steps.push(`Dy = (${eq1.xCoeff})(${eq2.constant}) - (${eq1.constant})(${eq2.xCoeff}) = ${Dy}`);
  steps.push(`x = Dx / D = ${Dx} / ${det} = ${x}`);
  steps.push(`y = Dy / D = ${Dy} / ${det} = ${y}`);
  steps.push(`Verify: ${eq1.xCoeff}(${x}) + ${eq1.yCoeff}(${y}) = ${roundNum(eq1.xCoeff * x + eq1.yCoeff * y)} (should be ${eq1.constant})`);

  return {
    type: "unique",
    solutions: [
      { var: "x", value: x, exact: formatFraction(Dx, det) },
      { var: "y", value: y, exact: formatFraction(Dy, det) },
    ],
    steps,
  };
}

export function generateQuadraticPoints(a, b, c, xMin, xMax) {
  const points = [];
  const step = (xMax - xMin) / 100;
  for (let x = xMin; x <= xMax; x += step) {
    const y = a * x * x + b * x + c;
    points.push({ x: roundNum(x, 2), y: roundNum(y, 2) });
  }
  return points;
}
