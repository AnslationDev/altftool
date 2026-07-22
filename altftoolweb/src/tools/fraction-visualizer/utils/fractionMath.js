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
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

export function toMixedNumber(n, d) {
  if (d === 0) return { whole: 0, n: 0, d: 1 };
  const whole = Math.floor(Math.abs(n) / d);
  const remainder = Math.abs(n) % d;
  const sign = n < 0 ? -1 : 1;
  return {
    whole: sign * whole,
    n: remainder,
    d,
    isNegative: (n < 0) !== (d < 0),
  };
}

export function toImproper(whole, n, d) {
  return (Math.abs(whole) * d + n) * (whole < 0 || n < 0 ? -1 : 1);
}

export function toDecimal(n, d) {
  if (d === 0) return 0;
  return Math.round((n / d) * 10000) / 10000;
}

export function toPercentage(n, d) {
  if (d === 0) return 0;
  return Math.round((n / d) * 10000) / 100;
}

export function addFractions(n1, d1, n2, d2) {
  const rn = n1 * d2 + n2 * d1;
  const rd = d1 * d2;
  return simplifyFraction(rn, rd);
}

export function subtractFractions(n1, d1, n2, d2) {
  const rn = n1 * d2 - n2 * d1;
  const rd = d1 * d2;
  return simplifyFraction(rn, rd);
}

export function multiplyFractions(n1, d1, n2, d2) {
  return simplifyFraction(n1 * n2, d1 * d2);
}

export function divideFractions(n1, d1, n2, d2) {
  if (n2 === 0) return { n: 0, d: 1 };
  return simplifyFraction(n1 * d2, d1 * n2);
}

export function findEquivalentFractions(n, d, count = 5) {
  const results = [];
  for (let i = 2; i <= count + 1; i++) {
    results.push({ n: n * i, d: d * i });
  }
  return results;
}

export function compareFractions(n1, d1, n2, d2) {
  const v1 = n1 / d1;
  const v2 = n2 / d2;
  if (Math.abs(v1 - v2) < 0.0001) return 0;
  return v1 > v2 ? 1 : -1;
}

export function generateFractionQuestion(type) {
  function randFrac(minD = 2, maxD = 12) {
    const d = Math.floor(Math.random() * (maxD - minD + 1)) + minD;
    const n = Math.floor(Math.random() * (d - 1)) + 1;
    return { n, d };
  }

  const f1 = randFrac();
  const f2 = randFrac();

  switch (type) {
    case "addition": {
      const result = addFractions(f1.n, f1.d, f2.n, f2.d);
      return { f1, f2, operation: "+", result };
    }
    case "subtraction": {
      const result = subtractFractions(f1.n, f1.d, f2.n, f2.d);
      return { f1, f2, operation: "−", result };
    }
    case "multiplication": {
      const result = multiplyFractions(f1.n, f1.d, f2.n, f2.d);
      return { f1, f2, operation: "×", result };
    }
    case "division": {
      const result = divideFractions(f1.n, f1.d, f2.n, f2.d);
      return { f1, f2, operation: "÷", result };
    }
    default: {
      const result = addFractions(f1.n, f1.d, f2.n, f2.d);
      return { f1, f2, operation: "+", result };
    }
  }
}
