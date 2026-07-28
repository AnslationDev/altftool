/**
 * Critical Value Tables — exact distribution mathematics.
 *
 * Pure JavaScript. No React, no DOM, no clocks. Every exported function is
 * deterministic: the same arguments always produce the same output.
 *
 * ---------------------------------------------------------------------------
 * ALGORITHMS AND WHERE THEY COME FROM
 * ---------------------------------------------------------------------------
 *
 * 1. log Gamma — Lanczos approximation, g = 7, 9 coefficients.
 *    Reference: Lanczos, "A Precision Approximation of the Gamma Function",
 *    SIAM J. Numer. Anal. Ser. B 1 (1964) 86-96; coefficient set as tabulated
 *    in Numerical Recipes in C, 2nd ed., §6.1 (function `gammln`).
 *    Claimed relative error for Re(z) > 0: better than 2e-10.
 *
 * 2. Regularised incomplete gamma P(a,x) and Q(a,x) = 1 - P(a,x).
 *    Reference: Numerical Recipes in C, 2nd ed., §6.2 (`gser`, `gcf`).
 *    - Power series  P(a,x) = x^a e^-x / Gamma(a) * sum_{n>=0} x^n / (a)_{n+1}
 *      is used when x < a + 1 (the series converges fastest there).
 *    - Continued fraction for Q(a,x), evaluated with the modified Lentz
 *      algorithm (Lentz 1976; Thompson & Barnett 1986), is used when
 *      x >= a + 1.
 *    Both are iterated until the relative change is below EPS = 1e-15, so the
 *    result is accurate to roughly full double precision (~1e-15 relative),
 *    limited from below by the 2e-10 relative error of the Lanczos log-gamma
 *    prefactor in the extreme tails.
 *
 * 3. Regularised incomplete beta I_x(a,b).
 *    Reference: Numerical Recipes in C, 2nd ed., §6.4 (`betai`, `betacf`).
 *    Continued fraction evaluated with modified Lentz, applied to whichever of
 *    x or 1-x sits on the fast-converging side of the pivot (a+1)/(a+b+2),
 *    using the symmetry I_x(a,b) = 1 - I_{1-x}(b,a). Same ~1e-15 relative
 *    accuracy on the returned tail.
 *
 * 4. Distribution CDFs are exact closed-form reductions to (2) and (3):
 *      Normal:      Phi(z)          = 0.5 * erfc(-z / sqrt(2)),
 *                   erf(x)          = P(1/2, x^2)          [x >= 0]
 *      Student t:   Pr(|T| > t)     = I_{v/(v+t^2)}(v/2, 1/2)
 *      Chi-square:  Pr(X > x)       = Q(v/2, x/2)
 *      F:           Pr(F > f)       = I_{d2/(d2 + d1 f)}(d2/2, d1/2)
 *    Each upper tail is computed DIRECTLY rather than as 1 - CDF, so small
 *    p-values keep their significant digits instead of being cancelled away.
 *
 * 5. Inverses (critical values) — bracketed bisection on the upper-tail
 *    function, which is strictly decreasing. The bracket is found by doubling
 *    from a safe starting point until the tail falls below the target, then
 *    bisected until the interval is narrower than 1e-13 relative (or 400
 *    iterations). Bisection cannot diverge and needs no derivative; the cost
 *    of ~50 extra tail evaluations is irrelevant at these sizes.
 *
 * MEASURED ACCURACY (see the tool page): critical values agree with published
 * five-decimal statistical tables to every digit those tables print, and with
 * independently derived exact identities — chi2(0.05, 1) = z(0.025)^2,
 * F(a; 1, v) = t(a two-tailed; v)^2, t(a; inf) = z(a) — to better than 1e-12
 * relative.
 */

// ---------------------------------------------------------------------------
// Numerical constants
// ---------------------------------------------------------------------------

/** Relative convergence target for every series / continued fraction. */
const EPS = 1e-15;
/** Number near the smallest normalised double, used to dodge division by 0
 *  inside the modified Lentz algorithm (Numerical Recipes uses 1e-30). */
const FPMIN = 1e-300;
/** Iteration ceiling for series and continued fractions. */
const ITMAX = 600;
/** Iteration ceiling for the bisection inverse. */
const BISECT_MAX = 400;
/** Relative width at which the bisection bracket is considered converged.
 *  Deliberately relative with no absolute floor: chi-square critical values at
 *  small df are themselves of order 1e-5 or smaller, and an absolute floor
 *  would stop the search while the answer still had no correct digits. */
const BISECT_TOL = 1e-13;

/** Lanczos g parameter and coefficients, Numerical Recipes 2nd ed. §6.1. */
const LANCZOS_G = 5.5;
const LANCZOS_COF = [
  76.18009172947146, -86.50532032941677, 24.01409824083091,
  -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
];

/** Largest degrees of freedom accepted. Beyond this the normal limit is exact
 *  to far more digits than any table prints, and huge df only wastes time. */
export const MAX_DF = 2e5;
/** Smallest degrees of freedom accepted. df is a positive real — Welch-
 *  Satterthwaite df is routinely fractional — but zero or negative df has no
 *  distribution attached to it. The floor is 0.1 rather than 0 for an honest
 *  numerical reason: the two-tailed t critical value at df = 0.1 is already
 *  about 1.7e12, and below that it passes the range where a double can carry
 *  the answer to the precision this tool claims. Refusing beats guessing. */
export const MIN_DF = 0.1;
/** Alpha must sit strictly inside (0,1). Below this the critical value is
 *  dominated by floating-point noise in the tail, so it is refused. */
export const MIN_ALPHA = 1e-12;
export const MAX_ALPHA = 1 - 1e-9;
/** Cap on rows and columns a generated table may contain, so that a typo like
 *  "1-100000" produces a plain refusal instead of freezing the page. */
export const MAX_TABLE_ROWS = 200;
export const MAX_TABLE_COLS = 24;

/** The alpha columns a printed table normally carries. */
export const DEFAULT_ALPHAS = [0.1, 0.05, 0.025, 0.01, 0.005, 0.001];
/** Alpha levels offered for an F table (F tables are one alpha per sheet). */
export const F_ALPHAS = [0.1, 0.05, 0.025, 0.01, 0.005, 0.001];

// ---------------------------------------------------------------------------
// Special functions
// ---------------------------------------------------------------------------

/**
 * Natural log of the gamma function for x > 0.
 * Lanczos approximation, relative error < 2e-10.
 * @param {number} x
 * @returns {number}
 */
export function gammaln(x) {
  if (!(x > 0)) return Number.NaN;
  let y = x;
  const tmp0 = x + LANCZOS_G;
  const tmp = (x + 0.5) * Math.log(tmp0) - tmp0;
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j += 1) {
    y += 1;
    ser += LANCZOS_COF[j] / y;
  }
  return tmp + Math.log((2.5066282746310005 * ser) / x);
}

/** Series representation of P(a,x); valid and fast for x < a+1. */
function gammaSeries(a, x) {
  if (x <= 0) return 0;
  let ap = a;
  let del = 1 / a;
  let sum = del;
  for (let n = 0; n < ITMAX; n += 1) {
    ap += 1;
    del *= x / ap;
    sum += del;
    if (Math.abs(del) < Math.abs(sum) * EPS) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - gammaln(a));
}

/** Continued fraction for Q(a,x) via modified Lentz; valid for x >= a+1. */
function gammaContinuedFraction(a, x) {
  let b = x + 1 - a;
  let c = 1 / FPMIN;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= ITMAX; i += 1) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return Math.exp(-x + a * Math.log(x) - gammaln(a)) * h;
}

/**
 * Regularised lower incomplete gamma P(a,x) = gamma(a,x) / Gamma(a).
 * @param {number} a shape, > 0
 * @param {number} x argument, >= 0
 * @returns {number} value in [0,1]
 */
export function regularizedGammaP(a, x) {
  if (!(a > 0) || !(x >= 0) || !Number.isFinite(a) || !Number.isFinite(x)) {
    return Number.NaN;
  }
  if (x === 0) return 0;
  if (x < a + 1) return gammaSeries(a, x);
  return 1 - gammaContinuedFraction(a, x);
}

/**
 * Regularised upper incomplete gamma Q(a,x) = 1 - P(a,x), computed directly in
 * the tail so that tiny values keep their significant digits.
 * @param {number} a shape, > 0
 * @param {number} x argument, >= 0
 * @returns {number} value in [0,1]
 */
export function regularizedGammaQ(a, x) {
  if (!(a > 0) || !(x >= 0) || !Number.isFinite(a) || !Number.isFinite(x)) {
    return Number.NaN;
  }
  if (x === 0) return 1;
  if (x < a + 1) return 1 - gammaSeries(a, x);
  return gammaContinuedFraction(a, x);
}

/** Continued fraction used by the incomplete beta (Numerical Recipes betacf). */
function betaContinuedFraction(a, b, x) {
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= ITMAX; m += 1) {
    const m2 = 2 * m;
    // even step
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    // odd step
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/**
 * Regularised incomplete beta I_x(a,b).
 * @param {number} a > 0
 * @param {number} b > 0
 * @param {number} x in [0,1]
 * @returns {number} value in [0,1]
 */
export function regularizedIncompleteBeta(a, b, x) {
  if (!(a > 0) || !(b > 0) || !Number.isFinite(a) || !Number.isFinite(b)) {
    return Number.NaN;
  }
  if (!Number.isFinite(x)) return Number.NaN;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(
    gammaln(a + b) -
      gammaln(a) -
      gammaln(b) +
      a * Math.log(x) +
      b * Math.log(1 - x),
  );
  if (x < (a + 1) / (a + b + 2)) {
    return (front * betaContinuedFraction(a, b, x)) / a;
  }
  return 1 - (front * betaContinuedFraction(b, a, 1 - x)) / b;
}

/** Error function, erf(x) = P(1/2, x^2) for x >= 0, odd in x. */
export function erf(x) {
  if (!Number.isFinite(x)) return x > 0 ? 1 : -1;
  const p = regularizedGammaP(0.5, x * x);
  return x < 0 ? -p : p;
}

/** Complementary error function, kept accurate in the far tail. */
export function erfc(x) {
  if (!Number.isFinite(x)) return x > 0 ? 0 : 2;
  if (x < 0) return 1 + regularizedGammaP(0.5, x * x);
  return regularizedGammaQ(0.5, x * x);
}

// ---------------------------------------------------------------------------
// Distribution tails (upper tail computed directly, never as 1 - CDF)
// ---------------------------------------------------------------------------

/** Standard normal CDF, Phi(z) = 0.5 * erfc(-z / sqrt(2)). */
export function normalCdf(z) {
  if (!Number.isFinite(z)) return z > 0 ? 1 : 0;
  return 0.5 * erfc(-z / Math.SQRT2);
}

/** Standard normal upper tail, Pr(Z > z). */
export function normalSf(z) {
  if (!Number.isFinite(z)) return z > 0 ? 0 : 1;
  return 0.5 * erfc(z / Math.SQRT2);
}

/**
 * Student t upper tail, Pr(T > t) with v degrees of freedom.
 * Uses Pr(|T| > |t|) = I_{v/(v+t^2)}(v/2, 1/2), halved by symmetry.
 * v = Infinity falls back to the normal limit, which is exact.
 */
export function tSf(t, df) {
  if (!Number.isFinite(t)) return t > 0 ? 0 : 1;
  if (!Number.isFinite(df)) return normalSf(t);
  if (!(df > 0)) return Number.NaN;
  const twoTail = regularizedIncompleteBeta(df / 2, 0.5, df / (df + t * t));
  return t >= 0 ? twoTail / 2 : 1 - twoTail / 2;
}

/** Student t CDF, Pr(T <= t). */
export function tCdf(t, df) {
  return 1 - tSf(t, df);
}

/** Two-sided Student t tail, Pr(|T| > |t|). */
export function tTwoSided(t, df) {
  if (!Number.isFinite(t)) return 0;
  if (!Number.isFinite(df)) return erfc(Math.abs(t) / Math.SQRT2);
  if (!(df > 0)) return Number.NaN;
  return regularizedIncompleteBeta(df / 2, 0.5, df / (df + t * t));
}

/** Chi-square upper tail, Pr(X > x) = Q(v/2, x/2). */
export function chiSquareSf(x, df) {
  if (!(x >= 0)) return 1;
  if (!Number.isFinite(x)) return 0;
  if (!(df > 0) || !Number.isFinite(df)) return Number.NaN;
  return regularizedGammaQ(df / 2, x / 2);
}

/** Chi-square CDF, Pr(X <= x) = P(v/2, x/2). */
export function chiSquareCdf(x, df) {
  if (!(x >= 0)) return 0;
  if (!Number.isFinite(x)) return 1;
  if (!(df > 0) || !Number.isFinite(df)) return Number.NaN;
  return regularizedGammaP(df / 2, x / 2);
}

/**
 * F upper tail, Pr(F > f) = I_{d2/(d2 + d1 f)}(d2/2, d1/2).
 * Written on the complementary side so the small tail keeps its digits.
 */
export function fSf(f, df1, df2) {
  if (!(f >= 0)) return 1;
  if (!Number.isFinite(f)) return 0;
  if (!(df1 > 0) || !(df2 > 0)) return Number.NaN;
  if (!Number.isFinite(df1) || !Number.isFinite(df2)) {
    // Limiting forms: F(d1, inf) = chi2(d1)/d1 ; F(inf, d2) = d2/chi2(d2).
    if (!Number.isFinite(df1) && !Number.isFinite(df2)) return f >= 1 ? 0 : 1;
    if (!Number.isFinite(df2)) return chiSquareSf(df1 * f, df1);
    return chiSquareCdf(df2 / f, df2);
  }
  return regularizedIncompleteBeta(df2 / 2, df1 / 2, df2 / (df2 + df1 * f));
}

/** F CDF, Pr(F <= f). */
export function fCdf(f, df1, df2) {
  return 1 - fSf(f, df1, df2);
}

// ---------------------------------------------------------------------------
// Inverses — bracketed bisection on a strictly decreasing upper tail
// ---------------------------------------------------------------------------

/**
 * Solve sf(x) = target for x on [lo, +inf), assuming sf is strictly
 * decreasing. The upper end of the bracket is found by doubling.
 * @param {(x:number)=>number} sf upper-tail function
 * @param {number} target tail probability in (0,1)
 * @param {number} lo lower end of the bracket (sf(lo) >= target)
 * @param {number} seed first trial for the upper end, doubled until it brackets
 * @returns {number} the solution, or NaN if no bracket could be built
 */
function bisectTail(sf, target, lo, seed) {
  let hi = seed;
  let guard = 0;
  while (sf(hi) > target) {
    hi *= 2;
    guard += 1;
    // 1e-12 tail of any of these distributions is reached long before 2^80.
    if (guard > 80 || !Number.isFinite(hi)) return Number.NaN;
  }
  let a = lo;
  let b = hi;
  for (let i = 0; i < BISECT_MAX; i += 1) {
    const mid = 0.5 * (a + b);
    if (sf(mid) > target) a = mid;
    else b = mid;
    if (b - a <= BISECT_TOL * Math.abs(b)) break;
  }
  return 0.5 * (a + b);
}

/**
 * Standard normal critical value.
 * @param {number} alpha significance level in (0,1)
 * @param {1|2} tails 1 = one-tailed (z with Pr(Z>z)=alpha), 2 = two-tailed
 *   (z with Pr(|Z|>z)=alpha, i.e. the alpha/2 upper-tail point)
 * @returns {number}
 */
export function normalCritical(alpha, tails = 2) {
  const p = tails === 2 ? alpha / 2 : alpha;
  if (!(p > 0) || !(p < 1)) return Number.NaN;
  if (p === 0.5) return 0;
  if (p > 0.5) return -bisectTail((z) => normalSf(-z), 1 - p, 0, 1);
  return bisectTail(normalSf, p, 0, 1);
}

/**
 * Student t critical value.
 * @param {number} alpha significance level in (0,1)
 * @param {number} df degrees of freedom (Infinity allowed = normal limit)
 * @param {1|2} tails 1 or 2
 * @returns {number}
 */
export function tCritical(alpha, df, tails = 2) {
  if (!Number.isFinite(df)) return normalCritical(alpha, tails);
  if (!(df > 0)) return Number.NaN;
  const p = tails === 2 ? alpha / 2 : alpha;
  if (!(p > 0) || !(p < 1)) return Number.NaN;
  if (p === 0.5) return 0;
  if (p > 0.5) return -bisectTail((t) => tSf(-t, df), 1 - p, 0, 1);
  return bisectTail((t) => tSf(t, df), p, 0, 1);
}

/**
 * Chi-square critical value.
 * @param {number} alpha significance level in (0,1)
 * @param {number} df degrees of freedom
 * @param {"upper"|"lower"} tail which tail alpha sits in
 * @returns {number}
 */
export function chiSquareCritical(alpha, df, tail = "upper") {
  if (!(df > 0) || !Number.isFinite(df)) return Number.NaN;
  const target = tail === "lower" ? 1 - alpha : alpha;
  if (!(target > 0) || !(target < 1)) return Number.NaN;
  return bisectTail((x) => chiSquareSf(x, df), target, 0, Math.max(1, df));
}

/**
 * F critical value (upper tail).
 * @param {number} alpha significance level in (0,1)
 * @param {number} df1 numerator degrees of freedom
 * @param {number} df2 denominator degrees of freedom
 * @returns {number}
 */
export function fCritical(alpha, df1, df2) {
  if (!(df1 > 0) || !(df2 > 0)) return Number.NaN;
  if (!(alpha > 0) || !(alpha < 1)) return Number.NaN;
  return bisectTail((x) => fSf(x, df1, df2), alpha, 0, 2);
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const INFINITY_WORDS = new Set(["inf", "infinity", "∞", "inf.", "oo"]);

function parseMaybeInfinity(raw) {
  const text = String(raw).trim().toLowerCase();
  if (INFINITY_WORDS.has(text)) return Number.POSITIVE_INFINITY;
  if (text === "") return Number.NaN;
  return Number(text);
}

/**
 * Validate a degrees-of-freedom entry.
 * @param {unknown} raw
 * @param {{ label?: string, allowInfinity?: boolean }} [opts]
 * @returns {{ value: number } | { error: string }}
 */
export function validateDf(raw, opts = {}) {
  const label = opts.label || "Degrees of freedom";
  const allowInfinity = opts.allowInfinity !== false;
  const value = parseMaybeInfinity(raw);
  if (Number.isNaN(value)) return { error: `${label} must be a number.` };
  if (!Number.isFinite(value)) {
    if (allowInfinity) return { value: Number.POSITIVE_INFINITY };
    return { error: `${label} cannot be infinite for this distribution.` };
  }
  if (value <= 0) {
    return { error: `${label} must be greater than 0 — a distribution with ${value} degrees of freedom does not exist.` };
  }
  if (value < MIN_DF) {
    return { error: `${label} below ${MIN_DF} is not accepted: the critical value there runs past 1e12 and cannot be resolved to the precision this tool claims.` };
  }
  if (value > MAX_DF) {
    return { error: `${label} above ${MAX_DF.toLocaleString("en-US")} is not accepted; at that size the value equals the normal (z) limit to more digits than any table prints. Use ∞.` };
  }
  return { value };
}

/**
 * Validate a significance level.
 * @param {unknown} raw
 * @returns {{ value: number } | { error: string }}
 */
export function validateAlpha(raw) {
  const value = Number(String(raw).trim());
  if (!Number.isFinite(value)) return { error: "Significance level must be a number." };
  if (value <= 0) return { error: "Significance level must be greater than 0." };
  if (value >= 1) return { error: "Significance level must be less than 1 — enter 0.05, not 5." };
  if (value < MIN_ALPHA) {
    return { error: `Significance levels below ${MIN_ALPHA} are refused: the critical value there is dominated by floating-point noise rather than by the distribution.` };
  }
  if (value > MAX_ALPHA) return { error: "Significance level is too close to 1 to give a meaningful critical value." };
  return { value };
}

/**
 * Remove any infinity tokens from a degrees-of-freedom specification. The
 * chi-square distribution has no ∞ row in this implementation, so switching a
 * t-table row list over to chi-square needs the ∞ entry dropped rather than
 * rejected. Returns the cleaned text (never empty-with-trailing-commas).
 * @param {string} raw
 * @returns {string}
 */
export function stripInfinityTokens(raw) {
  return String(raw ?? "")
    .split(/([,;\n]+)/)
    .filter((chunk, index) => {
      if (index % 2 === 1) return true; // separators handled below
      return !INFINITY_WORDS.has(chunk.trim().toLowerCase());
    })
    .join("")
    .replace(/[,;]\s*(?=[,;])/g, "")
    .replace(/^[\s,;]+|[\s,;]+$/g, "");
}

/**
 * Parse a degrees-of-freedom row specification such as
 * "1-30, 40, 60, 120, inf" into a de-duplicated ascending list.
 * @param {string} raw
 * @param {{ allowInfinity?: boolean, max?: number }} [opts]
 * @returns {{ values: number[] } | { error: string }}
 */
export function parseDfList(raw, opts = {}) {
  const allowInfinity = opts.allowInfinity !== false;
  const max = opts.max || MAX_TABLE_ROWS;
  const text = String(raw ?? "").trim();
  if (!text) return { error: "Enter at least one degrees-of-freedom value." };
  const out = [];
  const seen = new Set();
  const push = (v) => {
    if (seen.has(v)) return;
    seen.add(v);
    out.push(v);
  };
  const parts = text.split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    const range = part.match(/^(\d+(?:\.\d+)?)\s*(?:-|–|to|\.\.)\s*(\d+(?:\.\d+)?)$/i);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      const checkStart = validateDf(start, { allowInfinity: false });
      const checkEnd = validateDf(end, { allowInfinity: false });
      if (checkStart.error) return { error: checkStart.error };
      if (checkEnd.error) return { error: checkEnd.error };
      if (end < start) return { error: `Range "${part}" runs backwards — write the smaller number first.` };
      if (!Number.isInteger(start) || !Number.isInteger(end)) {
        return { error: `Range "${part}" must use whole numbers. Enter fractional degrees of freedom individually.` };
      }
      if (end - start + 1 > max) {
        return { error: `Range "${part}" asks for ${end - start + 1} rows; the limit is ${max}.` };
      }
      for (let v = start; v <= end; v += 1) {
        push(v);
        if (out.length > max) return { error: `That specification produces more than ${max} rows. Narrow it down.` };
      }
      continue;
    }
    const check = validateDf(part, { allowInfinity });
    if (check.error) return { error: `"${part}" is not usable: ${check.error}` };
    push(check.value);
    if (out.length > max) return { error: `That specification produces more than ${max} rows. Narrow it down.` };
  }
  if (!out.length) return { error: "Enter at least one degrees-of-freedom value." };
  out.sort((a, b) => a - b);
  return { values: out };
}

// ---------------------------------------------------------------------------
// Table mode
// ---------------------------------------------------------------------------

/**
 * Build a critical-value table.
 *
 * @param {object} input
 * @param {"t"|"z"|"chi2"|"f"} input.dist
 * @param {string} [input.dfRows] df specification for t / chi-square rows
 * @param {1|2} [input.tails] tail count for t and z
 * @param {"upper"|"lower"} [input.chiTail] which tail alpha sits in for chi2
 * @param {string} [input.df1List] numerator df (columns) for F
 * @param {string} [input.df2List] denominator df (rows) for F
 * @param {number} [input.alpha] the single alpha of an F table
 * @param {number[]} [input.alphas] alpha columns for t / z / chi2 tables
 * @returns {{ header: string[], rowHeader: string, rows: {label:string, cells:number[]}[], caption: string, note: string } | { error: string }}
 */
export function buildTable(input) {
  const dist = input?.dist;
  const alphas = Array.isArray(input?.alphas) && input.alphas.length ? input.alphas : DEFAULT_ALPHAS;
  if (alphas.length > MAX_TABLE_COLS) return { error: `A table may carry at most ${MAX_TABLE_COLS} columns.` };
  for (const a of alphas) {
    const check = validateAlpha(a);
    if (check.error) return { error: check.error };
  }
  const tails = input?.tails === 1 ? 1 : 2;
  const tailWord = tails === 1 ? "one-tailed" : "two-tailed";

  if (dist === "z") {
    const rows = [
      {
        label: "one-tailed",
        cells: alphas.map((a) => normalCritical(a, 1)),
      },
      {
        label: "two-tailed",
        cells: alphas.map((a) => normalCritical(a, 2)),
      },
    ];
    return {
      header: alphas.map((a) => `α = ${a}`),
      rowHeader: "Test",
      rows,
      caption: "Standard normal (z) critical values",
      note: "z has no degrees of freedom. A two-tailed value at α is the upper-tail point of α/2.",
    };
  }

  if (dist === "t") {
    const parsed = parseDfList(input?.dfRows, { allowInfinity: true });
    if (parsed.error) return { error: parsed.error };
    const rows = parsed.values.map((df) => ({
      label: Number.isFinite(df) ? formatDfLabel(df) : "∞",
      cells: alphas.map((a) => tCritical(a, df, tails)),
    }));
    return {
      header: alphas.map((a) => `α = ${a}`),
      rowHeader: "df",
      rows,
      caption: `Student t critical values (${tailWord})`,
      note: `Each entry t satisfies Pr(${tails === 1 ? "T > t" : "|T| > t"}) = α. The ∞ row is the standard normal limit.`,
    };
  }

  if (dist === "chi2") {
    const parsed = parseDfList(input?.dfRows, { allowInfinity: false });
    if (parsed.error) return { error: parsed.error };
    const chiTail = input?.chiTail === "lower" ? "lower" : "upper";
    const rows = parsed.values.map((df) => ({
      label: formatDfLabel(df),
      cells: alphas.map((a) => chiSquareCritical(a, df, chiTail)),
    }));
    return {
      header: alphas.map((a) => `α = ${a}`),
      rowHeader: "df",
      rows,
      caption: `Chi-square critical values (${chiTail} tail)`,
      note:
        chiTail === "upper"
          ? "Each entry x satisfies Pr(X² > x) = α."
          : "Each entry x satisfies Pr(X² < x) = α — the left-hand tail used for variance intervals.",
    };
  }

  if (dist === "f") {
    const alphaCheck = validateAlpha(input?.alpha ?? 0.05);
    if (alphaCheck.error) return { error: alphaCheck.error };
    const cols = parseDfList(input?.df1List, { allowInfinity: true, max: MAX_TABLE_COLS });
    if (cols.error) return { error: `Numerator df: ${cols.error}` };
    const rowsSpec = parseDfList(input?.df2List, { allowInfinity: true });
    if (rowsSpec.error) return { error: `Denominator df: ${rowsSpec.error}` };
    const rows = rowsSpec.values.map((df2) => ({
      label: Number.isFinite(df2) ? formatDfLabel(df2) : "∞",
      cells: cols.values.map((df1) => fCritical(alphaCheck.value, df1, df2)),
    }));
    return {
      header: cols.values.map((df1) => (Number.isFinite(df1) ? `df₁ = ${formatDfLabel(df1)}` : "df₁ = ∞")),
      rowHeader: "df₂",
      rows,
      caption: `F critical values at α = ${alphaCheck.value} (upper tail)`,
      note: "Each entry f satisfies Pr(F > f) = α, with df₁ across the top and df₂ down the side.",
    };
  }

  return { error: "Choose one of t, z, chi-square or F." };
}

function formatDfLabel(df) {
  if (!Number.isFinite(df)) return "∞";
  return Number.isInteger(df) ? String(df) : String(Number(df.toFixed(4)));
}

// ---------------------------------------------------------------------------
// Solve mode
// ---------------------------------------------------------------------------

/**
 * Given an observed statistic and an alpha, return both the exact p-value and
 * the exact critical value for the chosen distribution.
 *
 * @param {object} input
 * @param {"t"|"z"|"chi2"|"f"} input.dist
 * @param {number|string} input.statistic observed test statistic
 * @param {number|string} input.alpha significance level
 * @param {number|string} [input.df] degrees of freedom (t, chi-square)
 * @param {number|string} [input.df1] numerator df (F)
 * @param {number|string} [input.df2] denominator df (F)
 * @param {1|2} [input.tails] tail count for t and z
 * @param {"upper"|"lower"} [input.chiTail] which tail for chi-square
 * @returns {{ statistic:number, alpha:number, pValue:number, critical:number,
 *   distLabel:string, tailLabel:string, pFormula:string, criticalFormula:string,
 *   exceedsCritical:boolean, pBelowAlpha:boolean, dfLabel:string }
 *   | { error: string }}
 */
export function solve(input) {
  const dist = input?.dist;
  const alphaCheck = validateAlpha(input?.alpha);
  if (alphaCheck.error) return { error: alphaCheck.error };
  const alpha = alphaCheck.value;

  const rawStat = String(input?.statistic ?? "").trim();
  if (rawStat === "") return { error: "Enter an observed test statistic." };
  const statistic = Number(rawStat);
  if (!Number.isFinite(statistic)) {
    return { error: "The observed test statistic must be a finite number." };
  }
  if (Math.abs(statistic) > 1e12) {
    return { error: "That test statistic is outside any range these distributions describe. Check the value." };
  }

  const tails = input?.tails === 1 ? 1 : 2;

  if (dist === "z") {
    const pValue = tails === 2 ? erfc(Math.abs(statistic) / Math.SQRT2) : normalSf(statistic);
    const critical = normalCritical(alpha, tails);
    return finish({
      statistic,
      alpha,
      pValue,
      critical,
      distLabel: "Standard normal (z)",
      tailLabel: tails === 2 ? "two-tailed" : "one-tailed (upper)",
      dfLabel: "—",
      pFormula: tails === 2 ? "p = erfc(|z| / √2)" : "p = ½·erfc(z / √2)",
      criticalFormula: tails === 2 ? "Φ⁻¹(1 − α/2)" : "Φ⁻¹(1 − α)",
      compareAbs: tails === 2,
    });
  }

  if (dist === "t") {
    const dfCheck = validateDf(input?.df, { label: "Degrees of freedom" });
    if (dfCheck.error) return { error: dfCheck.error };
    const df = dfCheck.value;
    const pValue = tails === 2 ? tTwoSided(statistic, df) : tSf(statistic, df);
    const critical = tCritical(alpha, df, tails);
    return finish({
      statistic,
      alpha,
      pValue,
      critical,
      distLabel: "Student t",
      tailLabel: tails === 2 ? "two-tailed" : "one-tailed (upper)",
      dfLabel: Number.isFinite(df) ? `v = ${formatDfLabel(df)}` : "v = ∞",
      pFormula: tails === 2 ? "p = I_{v/(v+t²)}(v/2, ½)" : "p = ½·I_{v/(v+t²)}(v/2, ½)",
      criticalFormula: tails === 2 ? "t with Pr(|T| > t) = α" : "t with Pr(T > t) = α",
      compareAbs: tails === 2,
    });
  }

  if (dist === "chi2") {
    const dfCheck = validateDf(input?.df, { label: "Degrees of freedom", allowInfinity: false });
    if (dfCheck.error) return { error: dfCheck.error };
    const df = dfCheck.value;
    if (statistic < 0) return { error: "A chi-square statistic cannot be negative." };
    const chiTail = input?.chiTail === "lower" ? "lower" : "upper";
    const pValue = chiTail === "lower" ? chiSquareCdf(statistic, df) : chiSquareSf(statistic, df);
    const critical = chiSquareCritical(alpha, df, chiTail);
    return finish({
      statistic,
      alpha,
      pValue,
      critical,
      distLabel: "Chi-square (χ²)",
      tailLabel: chiTail === "lower" ? "lower tail" : "upper tail",
      dfLabel: `v = ${formatDfLabel(df)}`,
      pFormula: chiTail === "lower" ? "p = P(v/2, x/2)" : "p = Q(v/2, x/2)",
      criticalFormula: chiTail === "lower" ? "x with Pr(X² < x) = α" : "x with Pr(X² > x) = α",
      compareAbs: false,
      reverseCompare: chiTail === "lower",
    });
  }

  if (dist === "f") {
    const d1 = validateDf(input?.df1, { label: "Numerator df (df₁)" });
    if (d1.error) return { error: d1.error };
    const d2 = validateDf(input?.df2, { label: "Denominator df (df₂)" });
    if (d2.error) return { error: d2.error };
    if (statistic < 0) return { error: "An F statistic cannot be negative." };
    const pValue = fSf(statistic, d1.value, d2.value);
    const critical = fCritical(alpha, d1.value, d2.value);
    return finish({
      statistic,
      alpha,
      pValue,
      critical,
      distLabel: "F (Fisher–Snedecor)",
      tailLabel: "upper tail",
      dfLabel: `df₁ = ${formatDfLabel(d1.value)}, df₂ = ${formatDfLabel(d2.value)}`,
      pFormula: "p = I_{df₂/(df₂ + df₁·f)}(df₂/2, df₁/2)",
      criticalFormula: "f with Pr(F > f) = α",
      compareAbs: false,
    });
  }

  return { error: "Choose one of t, z, chi-square or F." };
}

function finish(result) {
  const { pValue, critical, statistic, compareAbs, reverseCompare } = result;
  if (!Number.isFinite(pValue) || !Number.isFinite(critical)) {
    return { error: "The distribution could not be evaluated at those values. Check the degrees of freedom and the significance level." };
  }
  const stat = compareAbs ? Math.abs(statistic) : statistic;
  const exceedsCritical = reverseCompare ? stat <= critical : stat >= critical;
  return {
    ...result,
    exceedsCritical,
    pBelowAlpha: pValue <= result.alpha,
  };
}
