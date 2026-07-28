/**
 * Greek alphabet reference data and the two transformations that go with it:
 * transliteration into the Latin alphabet, and the Milesian (alphabetic)
 * numeral system in which each letter carries a value.
 *
 * Plain data and pure functions — no React, no DOM.
 */

/**
 * The 24 letters of the classical and modern Greek alphabet.
 *
 * `value` is the letter's Milesian numeral value. Three obsolete letters fill
 * the gaps in that system (digamma/stigma = 6, koppa = 90, sampi = 900); they
 * are listed separately in OBSOLETE_NUMERALS because they are not part of the
 * 24-letter alphabet.
 *
 * `classical` describes the reconstructed 5th-century BC Attic sound;
 * `modern` describes standard Modern Greek, which differs sharply for several
 * letters — beta is /v/, not /b/, and eta, iota and upsilon have all collapsed
 * onto the same /i/ sound.
 */
export const GREEK_LETTERS = [
  {
    id: "alpha", upper: "Α", lower: "α", name: "Alpha", greekName: "άλφα",
    translit: "a", value: 1,
    classical: "Short or long 'a' as in father.",
    modern: "'a' as in father.",
    usage: "Angles, angular acceleration, the alpha particle, and the significance level in hypothesis testing (commonly 0.05).",
  },
  {
    id: "beta", upper: "Β", lower: "β", name: "Beta", greekName: "βήτα",
    translit: "b", value: 2,
    classical: "'b' as in bat.",
    modern: "'v' as in van — the sound shifted in late antiquity.",
    usage: "Beta particles, regression coefficients, and the Type II error rate in statistics.",
  },
  {
    id: "gamma", upper: "Γ", lower: "γ", name: "Gamma", greekName: "γάμμα",
    translit: "g", value: 3,
    classical: "Hard 'g' as in go.",
    modern: "A soft throaty 'gh', or a 'y' sound before e and i.",
    usage: "Gamma rays, the gamma function Γ(n), the Lorentz factor, and the Euler-Mascheroni constant γ ≈ 0.5772.",
  },
  {
    id: "delta", upper: "Δ", lower: "δ", name: "Delta", greekName: "δέλτα",
    translit: "d", value: 4,
    classical: "'d' as in dog.",
    modern: "'th' as in this.",
    usage: "Δ means change or difference, Δ is the discriminant of a quadratic, and δ marks the Dirac and Kronecker deltas.",
  },
  {
    id: "epsilon", upper: "Ε", lower: "ε", name: "Epsilon", greekName: "έψιλον",
    translit: "e", value: 5,
    classical: "Short 'e' as in pet.",
    modern: "Short 'e' as in pet.",
    usage: "The arbitrarily small positive quantity in limit proofs, plus permittivity and mechanical strain.",
  },
  {
    id: "zeta", upper: "Ζ", lower: "ζ", name: "Zeta", greekName: "ζήτα",
    translit: "z", value: 7,
    classical: "'zd' or 'dz' — a cluster, not a single sound.",
    modern: "'z' as in zoo.",
    usage: "The Riemann zeta function ζ(s) and the damping ratio in oscillating systems.",
  },
  {
    id: "eta", upper: "Η", lower: "η", name: "Eta", greekName: "ήτα",
    translit: "e", value: 8,
    classical: "Long open 'e', like the vowel in air held longer.",
    modern: "'i' as in machine.",
    usage: "Efficiency of a machine or engine, and dynamic viscosity.",
  },
  {
    id: "theta", upper: "Θ", lower: "θ", name: "Theta", greekName: "θήτα",
    translit: "th", value: 9,
    classical: "An aspirated 't', as in top-hat said quickly.",
    modern: "'th' as in thin.",
    usage: "The default symbol for an angle, and Θ(n) for tight bounds in algorithm analysis.",
  },
  {
    id: "iota", upper: "Ι", lower: "ι", name: "Iota", greekName: "ιώτα",
    translit: "i", value: 10,
    classical: "'i' as in machine (long) or bit (short).",
    modern: "'i' as in machine.",
    usage: "Gives English the word iota for a tiny amount; used for index variables and unit vectors.",
  },
  {
    id: "kappa", upper: "Κ", lower: "κ", name: "Kappa", greekName: "κάππα",
    translit: "k", value: 20,
    classical: "'k' as in skin, without the puff of air.",
    modern: "'k' as in skin.",
    usage: "Curvature, thermal conductivity, the dielectric constant, and Cohen's kappa for rater agreement.",
  },
  {
    id: "lambda", upper: "Λ", lower: "λ", name: "Lambda", greekName: "λάμδα",
    translit: "l", value: 30,
    classical: "'l' as in let.",
    modern: "'l' as in let.",
    usage: "Wavelength, eigenvalues, the radioactive decay constant, Lagrange multipliers, and Λ for the cosmological constant.",
  },
  {
    id: "mu", upper: "Μ", lower: "μ", name: "Mu", greekName: "μι",
    translit: "m", value: 40,
    classical: "'m' as in map.",
    modern: "'m' as in map.",
    usage: "The SI prefix micro- (one millionth), the coefficient of friction, a population mean, and the muon.",
  },
  {
    id: "nu", upper: "Ν", lower: "ν", name: "Nu", greekName: "νι",
    translit: "n", value: 50,
    classical: "'n' as in net.",
    modern: "'n' as in net.",
    usage: "Frequency of a wave, the neutrino, kinematic viscosity, and degrees of freedom.",
  },
  {
    id: "xi", upper: "Ξ", lower: "ξ", name: "Xi", greekName: "ξι",
    translit: "x", value: 60,
    classical: "'ks' as in books.",
    modern: "'ks' as in books.",
    usage: "A generic random variable in probability, and the xi baryons in particle physics.",
  },
  {
    id: "omicron", upper: "Ο", lower: "ο", name: "Omicron", greekName: "όμικρον",
    translit: "o", value: 70,
    classical: "Short 'o' as in pot. The name means 'little o'.",
    modern: "Short 'o' as in pot.",
    usage: "Rarely used alone because it looks like the Latin o; little-o notation borrows its shape.",
  },
  {
    id: "pi", upper: "Π", lower: "π", name: "Pi", greekName: "πι",
    translit: "p", value: 80,
    classical: "'p' as in spin, without the puff of air.",
    modern: "'p' as in spin.",
    usage: "The circle constant 3.14159…, Π for a product over a series, and π(x) for the prime-counting function.",
  },
  {
    id: "rho", upper: "Ρ", lower: "ρ", name: "Rho", greekName: "ρο",
    translit: "r", value: 100,
    classical: "A trilled 'r'.",
    modern: "A tapped 'r'.",
    usage: "Density, electrical resistivity, and the population correlation coefficient.",
  },
  {
    id: "sigma", upper: "Σ", lower: "σ", finalLower: "ς", name: "Sigma", greekName: "σίγμα",
    translit: "s", value: 200,
    classical: "'s' as in sit.",
    modern: "'s' as in sit. Written ς at the end of a word.",
    usage: "Σ for summation, σ for standard deviation, mechanical stress, and the Stefan-Boltzmann constant.",
  },
  {
    id: "tau", upper: "Τ", lower: "τ", name: "Tau", greekName: "ταυ",
    translit: "t", value: 300,
    classical: "'t' as in stop, without the puff of air.",
    modern: "'t' as in stop.",
    usage: "Torque, the time constant of a decaying system, the tau lepton, and Kendall's tau.",
  },
  {
    id: "upsilon", upper: "Υ", lower: "υ", name: "Upsilon", greekName: "ύψιλον",
    translit: "y", value: 400,
    classical: "The rounded front vowel of French 'tu' or German 'ü'.",
    modern: "'i' as in machine.",
    usage: "Enters English as 'y' in words such as system and physics; names the upsilon meson.",
  },
  {
    id: "phi", upper: "Φ", lower: "φ", name: "Phi", greekName: "φι",
    translit: "ph", value: 500,
    classical: "An aspirated 'p', as in top-hat.",
    modern: "'f' as in fan.",
    usage: "The golden ratio φ ≈ 1.618, magnetic flux Φ, phase angle, work function, and the normal cumulative distribution Φ(z).",
  },
  {
    id: "chi", upper: "Χ", lower: "χ", name: "Chi", greekName: "χι",
    translit: "ch", value: 600,
    classical: "An aspirated 'k'.",
    modern: "The 'ch' of Scottish loch.",
    usage: "The chi-squared test statistic χ², electronegativity, and magnetic susceptibility.",
  },
  {
    id: "psi", upper: "Ψ", lower: "ψ", name: "Psi", greekName: "ψι",
    translit: "ps", value: 700,
    classical: "'ps' as in lapse.",
    modern: "'ps' as in lapse.",
    usage: "The quantum-mechanical wavefunction ψ, and the digamma function.",
  },
  {
    id: "omega", upper: "Ω", lower: "ω", name: "Omega", greekName: "ωμέγα",
    translit: "o", value: 800,
    classical: "Long open 'o'. The name means 'big o'.",
    modern: "'o' as in pot.",
    usage: "Ω is the ohm and the big-Omega lower bound; ω is angular velocity and angular frequency.",
  },
];

/** Letters kept only for their numeral value in the Milesian system. */
export const OBSOLETE_NUMERALS = [
  { char: "ϛ", upper: "Ϛ", name: "Stigma (digamma)", value: 6 },
  { char: "ϟ", upper: "Ϟ", name: "Koppa", value: 90 },
  { char: "ϡ", upper: "Ϡ", name: "Sampi", value: 900 },
];

/** U+0374 GREEK NUMERAL SIGN marks a numeral; U+0375 marks thousands. */
export const NUMERAL_SIGN = "ʹ";
export const THOUSANDS_SIGN = "͵";

/** The Milesian system has no zero and runs out at 9,999 with a single thousands mark. */
export const MIN_NUMERAL = 1;
export const MAX_NUMERAL = 9999;

const UNITS = ["", "α", "β", "γ", "δ", "ε", "ϛ", "ζ", "η", "θ"];
const TENS = ["", "ι", "κ", "λ", "μ", "ν", "ξ", "ο", "π", "ϟ"];
const HUNDREDS = ["", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω", "ϡ"];

const NUMERAL_VALUES = (() => {
  const map = new Map();
  UNITS.forEach((char, index) => { if (char) map.set(char, index); });
  TENS.forEach((char, index) => { if (char) map.set(char, index * 10); });
  HUNDREDS.forEach((char, index) => { if (char) map.set(char, index * 100); });
  return map;
})();

/** Strip accents and breathings so transliteration and search work on bare letters. */
export function stripDiacritics(text) {
  if (typeof text !== "string") return "";
  return text.normalize("NFD").replace(/\p{M}+/gu, "");
}

/**
 * Convert a whole number to Greek alphabetic (Milesian) numerals.
 * Thousands are written with a leading ͵ before the unit letter, so
 * 1996 is ͵αϡϟϛ.
 */
export function toGreekNumeral(value, { withNumeralSign = false } = {}) {
  if (!Number.isInteger(value)) return { error: "Greek numerals only write whole numbers." };
  if (value < MIN_NUMERAL || value > MAX_NUMERAL) {
    return { error: `Greek numerals here cover ${MIN_NUMERAL} to ${MAX_NUMERAL} — there is no zero in the system.` };
  }

  const thousands = Math.floor(value / 1000);
  const remainder = value % 1000;
  const hundreds = Math.floor(remainder / 100);
  const tens = Math.floor((remainder % 100) / 10);
  const units = remainder % 10;

  const text =
    (thousands > 0 ? THOUSANDS_SIGN + UNITS[thousands] : "") +
    HUNDREDS[hundreds] +
    TENS[tens] +
    UNITS[units];

  return {
    value,
    numeral: withNumeralSign ? text + NUMERAL_SIGN : text,
    parts: { thousands, hundreds: hundreds * 100, tens: tens * 10, units },
  };
}

/** Read a Greek alphabetic numeral back into a number. */
export function fromGreekNumeral(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Enter a Greek numeral such as ρκγ." };
  }
  const cleaned = stripDiacritics(text)
    .replace(new RegExp(NUMERAL_SIGN, "g"), "")
    .toLowerCase()
    .trim();

  let total = 0;
  let index = 0;
  let matched = 0;
  while (index < cleaned.length) {
    const char = cleaned[index];
    if (char === THOUSANDS_SIGN) {
      const next = cleaned[index + 1];
      const unit = NUMERAL_VALUES.get(next);
      if (unit === undefined || unit > 9) {
        return { error: `The thousands mark must be followed by a unit letter, not "${next || "nothing"}".` };
      }
      total += unit * 1000;
      matched += 1;
      index += 2;
      continue;
    }
    if (char === " ") { index += 1; continue; }
    const digit = NUMERAL_VALUES.get(char);
    if (digit === undefined) {
      return { error: `"${char}" is not a Greek numeral letter.` };
    }
    total += digit;
    matched += 1;
    index += 1;
  }

  if (matched === 0) return { error: "No Greek numeral letters found." };
  return { value: total, letters: matched };
}

/** Look up one letter's numeral value by its lowercase form. */
export function letterValue(lower) {
  const letter = GREEK_LETTERS.find((item) => item.lower === lower || item.finalLower === lower);
  return letter ? letter.value : null;
}

const TRANSLIT_MAP = (() => {
  const map = new Map();
  for (const letter of GREEK_LETTERS) {
    map.set(letter.lower, letter.translit);
    if (letter.finalLower) map.set(letter.finalLower, letter.translit);
    map.set(
      letter.upper,
      letter.translit.length > 1
        ? letter.translit[0].toUpperCase() + letter.translit.slice(1)
        : letter.translit.toUpperCase(),
    );
  }
  return map;
})();

/**
 * Transliterate Greek into the Latin alphabet.
 *
 * Follows the classical convention, including two context rules:
 *   - the nasal gamma: before γ, κ, ξ or χ a gamma is written n, so άγγελος
 *     becomes angelos;
 *   - upsilon in a diphthong: after α, ε, η or ο it is written u rather than y,
 *     so Οδυσσεύς becomes Odysseus and ουρανός becomes ouranos.
 */
const DIPHTHONG_FIRST = new Set(["α", "ε", "η", "ο"]);

export function transliterate(text) {
  if (typeof text !== "string") return "";
  const bare = stripDiacritics(text);
  let output = "";
  for (let index = 0; index < bare.length; index += 1) {
    const char = bare[index];
    const lower = char.toLowerCase();
    if (lower === "γ") {
      const next = (bare[index + 1] || "").toLowerCase();
      if (next === "γ" || next === "κ" || next === "ξ" || next === "χ") {
        output += char === "Γ" ? "N" : "n";
        continue;
      }
    }
    if (lower === "υ" && index > 0 && DIPHTHONG_FIRST.has(bare[index - 1].toLowerCase())) {
      output += char === "Υ" ? "U" : "u";
      continue;
    }
    output += TRANSLIT_MAP.has(char) ? TRANSLIT_MAP.get(char) : char;
  }
  return output;
}

/** Case- and accent-insensitive search across name, letter, sound and usage. */
export function searchLetters(query) {
  const needle = stripDiacritics(String(query || "")).trim().toLowerCase();
  if (needle === "") return GREEK_LETTERS;
  return GREEK_LETTERS.filter((letter) => {
    const haystack = [
      letter.name,
      letter.greekName,
      letter.translit,
      letter.upper,
      letter.lower,
      letter.finalLower || "",
      letter.usage,
      letter.classical,
      letter.modern,
      String(letter.value),
    ]
      .join(" ")
      .toLowerCase();
    return stripDiacritics(haystack).includes(needle);
  });
}
