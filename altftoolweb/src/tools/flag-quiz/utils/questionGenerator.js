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

const generators = {
  identify(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.flag), rand);
    if (!country) return null;
    const distractors = pickCountryDistractors(countries, country, 3, rand).map((c) => c.name);
    const { options, answer } = buildMultipleChoice(country.name, distractors);
    return {
      question: "Which country does this flag belong to?",
      showFlag: country.flag,
      showFlagSvg: country.flagSvg,
      options,
      answer,
      explanation: `This is the flag of ${country.name}${country.capital ? `, whose capital is ${country.capital}` : ""}.`,
      category: "identify",
      country: country.name,
    };
  },

  reverse(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.flag), rand);
    if (!country) return null;
    const distractors = pickCountryDistractors(countries, country, 3, rand);
    const flagOptions = shuffle([
      { name: country.name, flag: country.flag },
      ...distractors.map((c) => ({ name: c.name, flag: c.flag })),
    ]);
    return {
      question: `Which is the flag of ${country.name}?`,
      flagOptions,
      options: flagOptions.map((o) => o.name),
      answer: country.name,
      explanation: `The correct flag belongs to ${country.name}.`,
      category: "reverse",
      country: country.name,
    };
  },

  capital(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.flag && c.capital), rand);
    if (!country) return null;
    const distractors = countries
      .filter((c) => c.name !== country.name && c.capital)
      .map((c) => c.capital);
    const unique = [...new Set(distractors)].filter((d) => d !== country.capital);
    if (unique.length < 3) return null;
    const { options, answer } = buildMultipleChoice(country.capital, pickRandomN(unique, 3, rand));
    return {
      question: "What is the capital of the country this flag represents?",
      showFlag: country.flag,
      showFlagSvg: country.flagSvg,
      options,
      answer,
      explanation: `This is the flag of ${country.name}, whose capital is ${country.capital}.`,
      category: "capital",
      country: country.name,
    };
  },

  continent(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.flag && c.region), rand);
    if (!country) return null;
    const allContinents = [...new Set(countries.map((c) => c.region).filter(Boolean))];
    const distractors = allContinents.filter((c) => c !== country.region);
    if (distractors.length < 3) return null;
    const { options, answer } = buildMultipleChoice(country.region, pickRandomN(distractors, 3, rand));
    return {
      question: "Which continent does this flag's country belong to?",
      showFlag: country.flag,
      showFlagSvg: country.flagSvg,
      options,
      answer,
      explanation: `${country.name} is located in ${country.region}.`,
      category: "continent",
      country: country.name,
    };
  },

  currency(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.flag && c.currencies?.length), rand);
    if (!country) return null;
    const curr = country.currencies[0];
    const distractors = countries
      .filter((c) => c.name !== country.name && c.currencies?.length)
      .map((c) => c.currencies[0].name);
    const unique = [...new Set(distractors)].filter((d) => d !== curr.name);
    if (unique.length < 3) return null;
    const { options, answer } = buildMultipleChoice(curr.name, pickRandomN(unique, 3, rand));
    return {
      question: "What is the currency of the country this flag represents?",
      showFlag: country.flag,
      showFlagSvg: country.flagSvg,
      options,
      answer,
      explanation: `This is the flag of ${country.name}, which uses ${curr.name}${curr.symbol ? ` (${curr.symbol})` : ""}.`,
      category: "currency",
      country: country.name,
    };
  },

  language(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.flag && c.languages?.length), rand);
    if (!country) return null;
    const lang = country.languages[0];
    const distractors = countries
      .filter((c) => c.name !== country.name && c.languages?.length && !c.languages.includes(lang))
      .map((c) => c.languages[0]);
    const unique = [...new Set(distractors)].filter((d) => d && d !== lang);
    if (unique.length < 3) return null;
    const { options, answer } = buildMultipleChoice(lang, pickRandomN(unique, 3, rand));
    return {
      question: "Which language is primarily spoken in the country this flag represents?",
      showFlag: country.flag,
      showFlagSvg: country.flagSvg,
      options,
      answer,
      explanation: `This is the flag of ${country.name}, where ${lang} is spoken.`,
      category: "language",
      country: country.name,
    };
  },

  region(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.flag && c.subregion), rand);
    if (!country) return null;
    const distractors = countries
      .filter((c) => c.name !== country.name && c.subregion && c.subregion !== country.subregion)
      .map((c) => c.subregion);
    const unique = [...new Set(distractors)].filter((d) => d !== country.subregion);
    if (unique.length < 3) return null;
    const { options, answer } = buildMultipleChoice(country.subregion, pickRandomN(unique, 3, rand));
    return {
      question: "Which subregion does the country this flag represents belong to?",
      showFlag: country.flag,
      showFlagSvg: country.flagSvg,
      options,
      answer,
      explanation: `${country.name} is in the ${country.subregion} subregion of ${country.region}.`,
      category: "region",
      country: country.name,
    };
  },

  area(countries, rand) {
    const country = pickRandom(countries.filter((c) => c.flag && c.area > 0), rand);
    if (!country) return null;
    const ranges = [
      { label: "Small (under 50K km²)", max: 50_000 },
      { label: "Medium (50K - 500K km²)", max: 500_000 },
      { label: "Large (500K - 5M km²)", max: 5_000_000 },
      { label: "Very Large (over 5M km²)", max: Infinity },
    ];
    const correct = ranges.find((r) => country.area <= r.max);
    if (!correct) return null;
    const distractors = ranges.filter((r) => r.label !== correct.label);
    const { options, answer } = buildMultipleChoice(correct.label, pickRandomN(distractors.map((d) => d.label), 3, rand));
    return {
      question: "What is the approximate size of the country this flag represents?",
      showFlag: country.flag,
      showFlagSvg: country.flagSvg,
      options,
      answer,
      explanation: `${country.name} has an area of ${areaLabel(country.area)}.`,
      category: "area",
      country: country.name,
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

  if (pool.length < 10) pool = countries.filter((c) => c.flag);

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
