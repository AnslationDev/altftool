export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function simplifyFraction(n, d) {
  if (d === 0) return { n: 0, d: 1 };
  if (n === 0) return { n: 0, d: 1 };
  const g = gcd(n, d);
  let sn = n / g;
  let sd = d / g;
  if (sd < 0) {
    sn = -sn;
    sd = -sd;
  }
  return { n: sn, d: sd };
}

export function toMixedNumber(n, d) {
  if (d === 0) return { whole: 0, n: 0, d: 1, isNegative: false };
  const isNegative = (n < 0) !== (d < 0);
  const absN = Math.abs(n);
  const absD = Math.abs(d);
  const whole = Math.floor(absN / absD);
  const remainder = absN % absD;
  return { whole: isNegative && whole > 0 ? -whole : whole, n: remainder, d: absD, isNegative };
}

export function toImproper(whole, n, d) {
  const sign = whole < 0 ? -1 : 1;
  return sign * (Math.abs(whole) * d + n);
}

export function fractionToDecimal(n, d) {
  if (d === 0) return 0;
  return n / d;
}

export function decimalToFraction(decimal, maxDenominator = 10000) {
  if (decimal === 0) return { n: 0, d: 1 };
  const isNegative = decimal < 0;
  const absDecimal = Math.abs(decimal);

  let bestN = 1;
  let bestD = 1;
  let bestError = Math.abs(absDecimal - 1);

  for (let d = 1; d <= maxDenominator; d++) {
    const n = Math.round(absDecimal * d);
    const error = Math.abs(absDecimal - n / d);
    if (error < bestError) {
      bestError = error;
      bestN = n;
      bestD = d;
    }
    if (bestError < 1e-10) break;
  }

  const result = simplifyFraction(bestN, bestD);
  return { n: isNegative ? -result.n : result.n, d: result.d };
}

export function fractionToPercent(n, d) {
  if (d === 0) return 0;
  return (n / d) * 100;
}

export function percentToFraction(percent) {
  const decimal = percent / 100;
  return decimalToFraction(decimal);
}

export function decimalToPercent(decimal) {
  return decimal * 100;
}

export function percentToDecimal(percent) {
  return percent / 100;
}

export function detectRepeatingDecimal(n, d) {
  if (d === 0) return { isRepeating: false, decimal: 0, repeatingPart: "", nonRepeatingPart: "" };

  const isNegative = (n < 0) !== (d < 0);
  const absN = Math.abs(n);
  const absD = Math.abs(d);

  const integerPart = Math.floor(absN / absD);
  let remainder = absN % absD;

  if (remainder === 0) {
    return {
      isRepeating: false,
      decimal: isNegative ? -integerPart : integerPart,
      repeatingPart: "",
      nonRepeatingPart: String(integerPart),
      display: String(integerPart),
    };
  }

  const remainders = new Map();
  const digits = [];
  let repeatingStart = -1;

  remainder *= 10;
  while (remainder !== 0) {
    if (remainders.has(remainder)) {
      repeatingStart = remainders.get(remainder);
      break;
    }
    remainders.set(remainder, digits.length);
    digits.push(Math.floor(remainder / absD));
    remainder = (remainder % absD) * 10;
  }

  const decimalDigits = digits.join("");
  let nonRepeating = "";
  let repeating = "";

  if (repeatingStart >= 0) {
    nonRepeating = decimalDigits.substring(0, repeatingStart);
    repeating = decimalDigits.substring(repeatingStart);
  } else {
    nonRepeating = decimalDigits;
    repeating = "";
  }

  const display = `${isNegative ? "-" : ""}${integerPart}.${nonRepeating}${repeating ? `(${repeating})` : ""}`;

  return {
    isRepeating: repeating.length > 0,
    decimal: fractionToDecimal(n, d),
    repeatingPart: repeating,
    nonRepeatingPart: nonRepeating,
    integerPart: isNegative ? -integerPart : integerPart,
    display,
  };
}

export function getStepByStep(fromType, toType, value) {
  const steps = [];

  if (fromType === "fraction" && toType === "decimal") {
    const { n, d } = value;
    steps.push(`Start with the fraction ${n}/${d}`);
    steps.push(`Divide the numerator (${n}) by the denominator (${d})`);
    const result = n / d;
    steps.push(`${n} ÷ ${d} = ${result}`);
    steps.push(`So ${n}/${d} = ${result}`);
  } else if (fromType === "decimal" && toType === "fraction") {
    steps.push(`Start with the decimal ${value}`);
    const { n, d } = decimalToFraction(value);
    steps.push(`Write as a fraction: ${value} = ${value.toString().replace(".", "")}/${Math.pow(10, value.toString().split(".")[1]?.length || 0)}`);
    const simplified = simplifyFraction(n, d);
    steps.push(`Simplify by dividing both by ${gcd(Math.round(value * 10000), 10000)}`);
    steps.push(`Result: ${simplified.n}/${simplified.d}`);
  } else if (fromType === "fraction" && toType === "percent") {
    const { n, d } = value;
    steps.push(`Start with the fraction ${n}/${d}`);
    steps.push(`Multiply by 100 to convert to percentage`);
    const pct = (n / d) * 100;
    steps.push(`${n}/${d} × 100 = ${pct}%`);
  } else if (fromType === "percent" && toType === "fraction") {
    steps.push(`Start with ${value}%`);
    steps.push(`Write as a fraction: ${value}/100`);
    const { n, d } = simplifyFraction(value * 100, 10000);
    const simplified = simplifyFraction(Math.round(value * 100) / 100 * 100, 10000);
    steps.push(`Simplify: ${simplified.n}/${simplified.d}`);
  } else if (fromType === "decimal" && toType === "percent") {
    steps.push(`Start with the decimal ${value}`);
    steps.push(`Multiply by 100 to convert to percentage`);
    steps.push(`${value} × 100 = ${value * 100}%`);
  } else if (fromType === "percent" && toType === "decimal") {
    steps.push(`Start with ${value}%`);
    steps.push(`Divide by 100 to convert to decimal`);
    steps.push(`${value} ÷ 100 = ${value / 100}`);
  } else if (fromType === "mixed" && toType === "improper") {
    const { whole, n, d } = value;
    steps.push(`Start with the mixed number ${whole} ${n}/${d}`);
    steps.push(`Multiply the whole number (${whole}) by the denominator (${d}): ${whole} × ${d} = ${whole * d}`);
    steps.push(`Add the numerator (${n}): ${whole * d} + ${n} = ${whole * d + n}`);
    steps.push(`Place over the original denominator: ${whole * d + n}/${d}`);
  } else if (fromType === "improper" && toType === "mixed") {
    const { n, d } = value;
    steps.push(`Start with the improper fraction ${n}/${d}`);
    const whole = Math.floor(n / d);
    const remainder = n % d;
    steps.push(`Divide: ${n} ÷ ${d} = ${whole} remainder ${remainder}`);
    steps.push(`Result: ${whole} ${remainder}/${d}`);
  }

  return steps;
}
