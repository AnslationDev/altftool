import { getBorderLookup } from "../services/countriesApi";

function pickRandom(arr, rand = Math.random) {
  return arr[Math.floor(rand() * arr.length)];
}

function shuffle(arr, rand = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandomN(arr, n, rand = Math.random) {
  return shuffle(arr, rand).slice(0, n);
}

function areaLabel(area) {
  if (area >= 1_000_000) return `${(area / 1_000_000).toFixed(1)}M km²`;
  if (area >= 1_000) return `${(area / 1_000).toFixed(0)}K km²`;
  return `${area} km²`;
}

function pickCountryDistractors(countries, correct, count = 3) {
  const sameRegion = countries.filter((c) => c.name !== correct.name && c.region === correct.region);
  const others = countries.filter((c) => c.name !== correct.name && c.region !== correct.region);
  const pool = sameRegion.length >= count ? sameRegion : [...sameRegion, ...others];
  return pickRandomN(pool, count);
}

function buildMultipleChoice(correctAnswer, distractors) {
  const options = shuffle([correctAnswer, ...distractors]);
  return { options, answer: correctAnswer };
}

function resolveBorderNames(borderCodes, lookup) {
  return borderCodes.map((code) => lookup[code] || code).filter((name) => name && name.length > 0);
}

const generators = {
  capital(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.capital), rand);
    if (!country) return null;
    const distractors = pickCountryDistractors(countries, country, 3).map((c) => c.name);
    const { options, answer } = buildMultipleChoice(country.name, distractors);
    return {
      question: `Which country has ${country.capital} as its capital?`,
      options,
      answer,
      explanation: `${country.capital} is the capital of ${country.name}.`,
      category: "capital",
      flag: country.flag,
    };
  },

  capitalReverse(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.capital), rand);
    if (!country) return null;
    const distractors = countries
      .filter((c) => c.name !== country.name && c.capital)
      .map((c) => c.capital);
    const uniqueDistractors = [...new Set(distractors)].filter((d) => d !== country.capital);
    const { options, answer } = buildMultipleChoice(country.capital, pickRandomN(uniqueDistractors, 3, rand));
    return {
      question: `What is the capital of ${country.name}?`,
      options,
      answer,
      explanation: `The capital of ${country.name} is ${country.capital}.`,
      category: "capital",
      flag: country.flag,
    };
  },

  region(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.subregion), rand);
    if (!country) return null;
    const allRegions = [...new Set(countries.map((c) => c.subregion).filter(Boolean))];
    const distractors = allRegions.filter((r) => r !== country.subregion);
    if (distractors.length < 3) return null;
    const { options, answer } = buildMultipleChoice(country.subregion, pickRandomN(distractors, 3, rand));
    return {
      question: `Which subregion does ${country.name} belong to?`,
      options,
      answer,
      explanation: `${country.name} is in the ${country.subregion} subregion of ${country.region}.`,
      category: "region",
      flag: country.flag,
    };
  },

  continent(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.region), rand);
    if (!country) return null;
    const allContinents = [...new Set(countries.map((c) => c.region).filter(Boolean))];
    const distractors = allContinents.filter((r) => r !== country.region);
    if (distractors.length < 2) return null;
    const { options, answer } = buildMultipleChoice(country.region, pickRandomN(distractors, 3, rand));
    return {
      question: `Which continent does ${country.name} belong to?`,
      options,
      answer,
      explanation: `${country.name} is located in ${country.region}.`,
      category: "continent",
      flag: country.flag,
    };
  },

  currency(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.currencies?.length), rand);
    if (!country) return null;
    const curr = country.currencies[0];
    const distractors = countries
      .filter((c) => c.name !== country.name && c.currencies?.length)
      .map((c) => c.currencies[0].name);
    const unique = [...new Set(distractors)].filter((d) => d !== curr.name);
    if (unique.length < 3) return null;
    const { options, answer } = buildMultipleChoice(country.name, pickRandomN(unique, 3, rand));
    return {
      question: `Which country uses ${curr.name}${curr.symbol ? ` (${curr.symbol})` : ""} as its currency?`,
      options,
      answer,
      explanation: `${curr.name} is the currency of ${country.name}.`,
      category: "currency",
      flag: country.flag,
    };
  },

  language(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.languages?.length), rand);
    if (!country) return null;
    const lang = country.languages[0];
    const distractors = countries
      .filter((c) => c.name !== country.name && c.languages?.length && !c.languages.includes(lang))
      .map((c) => c.name);
    if (distractors.length < 3) return null;
    const { options, answer } = buildMultipleChoice(country.name, pickRandomN(distractors, 3, rand));
    return {
      question: `Which country primarily speaks ${lang}?`,
      options,
      answer,
      explanation: `${lang} is spoken in ${country.name}.`,
      category: "language",
      flag: country.flag,
    };
  },

  borders(countries, rand) {
    const lookup = getBorderLookup(countries);
    const country = pickRandom(countries.filter((c) => c.borders?.length >= 2), rand);
    if (!country) return null;
    const borderNames = resolveBorderNames(country.borders, lookup);
    if (borderNames.length < 1) return null;
    const correct = pickRandom(borderNames, rand);
    const distractors = countries
      .filter((c) => c.name !== country.name && !borderNames.includes(c.name))
      .map((c) => c.name);
    if (distractors.length < 3) return null;
    const { options, answer } = buildMultipleChoice(correct, pickRandomN(distractors, 3, rand));
    return {
      question: `Which country borders ${country.name}?`,
      options,
      answer,
      explanation: `${correct} is one of the countries bordering ${country.name}.`,
      category: "borders",
      flag: country.flag,
    };
  },

  area(countries, rand) {
    const pair = pickRandomN(countries.filter((c) => c.area > 0), 2, rand);
    if (pair.length < 2) return null;
    const [larger, smaller] = pair.sort((x, y) => y.area - x.area);
    return {
      question: `Which country has a larger area: ${larger.name} or ${smaller.name}?`,
      options: [larger.name, smaller.name],
      answer: larger.name,
      explanation: `${larger.name} covers ${areaLabel(larger.area)}, while ${smaller.name} covers ${areaLabel(smaller.area)}.`,
      category: "area",
      flag: larger.flag,
    };
  },

  tld(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.tld?.length && c.tld[0]), rand);
    if (!country) return null;
    const tld = country.tld[0];
    const distractors = countries
      .filter((c) => c.name !== country.name && c.tld?.length && c.tld[0] && c.tld[0] !== tld)
      .map((c) => c.tld[0]);
    const unique = [...new Set(distractors)].filter((d) => d !== tld);
    if (unique.length < 3) return null;
    const { options, answer } = buildMultipleChoice(country.name, pickRandomN(unique, 3, rand));
    return {
      question: `Which country uses the ${tld} top-level domain?`,
      options,
      answer,
      explanation: `${country.name} uses the ${tld} domain extension.`,
      category: "tld",
      flag: country.flag,
    };
  },

  callingCode(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.callingCode), rand);
    if (!country) return null;
    const code = country.callingCode;
    const distractors = countries
      .filter((c) => c.name !== country.name && c.callingCode && c.callingCode !== code)
      .map((c) => c.name);
    if (distractors.length < 3) return null;
    const { options, answer } = buildMultipleChoice(country.name, pickRandomN(distractors, 3, rand));
    return {
      question: `Which country has the calling code ${code}?`,
      options,
      answer,
      explanation: `${country.name} has the calling code ${code}.`,
      category: "callingCode",
      flag: country.flag,
    };
  },

  flag(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.flag), rand);
    if (!country) return null;
    const distractors = pickCountryDistractors(countries, country, 3).map((c) => c.name);
    const { options, answer } = buildMultipleChoice(country.name, distractors);
    return {
      question: "Which country does this flag belong to?",
      showFlag: country.flag,
      options,
      answer,
      explanation: `This is the flag of ${country.name}.`,
      category: "flag",
      flag: country.flag,
    };
  },
};

const TYPE_KEYS = Object.keys(generators);

export function generateQuestion(countries, type = "random", rand = Math.random) {
  if (type === "random") {
    type = pickRandom(TYPE_KEYS, rand);
  }
  const gen = generators[type];
  if (!gen) return null;
  let question = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    question = gen(countries, rand);
    if (question) break;
  }
  return question;
}

export function generateQuiz(countries, { type = "random", count = 10, difficulty = "mixed" } = {}) {
  let pool = [...countries];

  if (difficulty === "easy") {
    pool = countries.filter((c) => c.area > 100_000 || c.region === "Europe" || c.region === "Americas");
  } else if (difficulty === "medium") {
    pool = countries.filter((c) => c.area > 10_000);
  }

  if (pool.length < 10) pool = countries;

  const questions = [];
  const usedQuestions = new Set();

  for (let i = 0; i < count; i++) {
    let question = null;
    for (let attempt = 0; attempt < 20; attempt++) {
      question = generateQuestion(pool, type);
      if (question && !usedQuestions.has(question.question + question.answer)) {
        usedQuestions.add(question.question + question.answer);
        break;
      }
    }
    if (question) questions.push(question);
  }

  return questions;
}
