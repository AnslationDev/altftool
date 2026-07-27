/**
 * Job-description analyser — deterministic, offline, no model calls.
 *
 * Four independent passes over the pasted job description:
 *
 * 1. Skill extraction — dictionary match against a curated technology /
 *    business skill library. Each skill carries its own alias list so
 *    "JS", "ReactJS" and "Node" resolve to their canonical name.
 *
 * 2. Seniority detection — title keywords plus the highest "N years"
 *    figure written in the text.
 *
 * 3. Readability — Flesch Reading Ease and Flesch–Kincaid Grade Level,
 *    the two formulas published by Rudolf Flesch (1948) and refined for
 *    the US Navy by Kincaid et al. (1975). Both are computed from the
 *    same word / sentence / syllable counts.
 *
 * 4. Gendered wording — the masculine- and feminine-coded word stems from
 *    Gaucher, Friesen & Kay (2011), "Evidence That Gendered Wording in Job
 *    Advertisements Exists and Sustains Gender Inequality", JPSP 101(1).
 *
 * The match score compares the JD's skills against a candidate's own list,
 * weighting each JD skill by how often the JD repeats it.
 *
 * Pure module: no React, no DOM, no network, no clock reads.
 */

/* ------------------------------------------------------------------ *
 * Skill library
 * ------------------------------------------------------------------ */

/** Canonical skills with their aliases. `group` drives the UI grouping. */
export const SKILL_LIBRARY = [
  // Languages
  { name: "JavaScript", group: "Language", aliases: ["javascript", "js", "es6", "ecmascript"] },
  { name: "TypeScript", group: "Language", aliases: ["typescript", "ts"] },
  { name: "Python", group: "Language", aliases: ["python", "py3"] },
  { name: "Java", group: "Language", aliases: ["java"] },
  { name: "Kotlin", group: "Language", aliases: ["kotlin"] },
  { name: "Swift", group: "Language", aliases: ["swift", "swiftui"] },
  { name: "Go", group: "Language", aliases: ["golang", "go lang"] },
  { name: "Rust", group: "Language", aliases: ["rust"] },
  { name: "C++", group: "Language", aliases: ["c++", "cpp"] },
  { name: "C#", group: "Language", aliases: ["c#", "csharp", "c sharp"] },
  { name: "PHP", group: "Language", aliases: ["php", "laravel"] },
  { name: "Ruby", group: "Language", aliases: ["ruby", "rails", "ruby on rails"] },
  { name: "SQL", group: "Language", aliases: ["sql", "pl/sql", "t-sql"] },
  { name: "R", group: "Language", aliases: ["rstudio"] },
  { name: "Scala", group: "Language", aliases: ["scala"] },

  // Frontend
  { name: "React", group: "Frontend", aliases: ["react", "reactjs", "react.js"] },
  { name: "Next.js", group: "Frontend", aliases: ["next.js", "nextjs"] },
  { name: "Angular", group: "Frontend", aliases: ["angular", "angularjs"] },
  { name: "Vue", group: "Frontend", aliases: ["vue", "vuejs", "vue.js", "nuxt"] },
  { name: "HTML", group: "Frontend", aliases: ["html", "html5"] },
  { name: "CSS", group: "Frontend", aliases: ["css", "css3", "sass", "scss", "tailwind"] },
  { name: "Redux", group: "Frontend", aliases: ["redux", "zustand", "mobx"] },
  { name: "React Native", group: "Frontend", aliases: ["react native", "flutter"] },
  { name: "Accessibility", group: "Frontend", aliases: ["accessibility", "a11y", "wcag"] },

  // Backend & data
  { name: "Node.js", group: "Backend", aliases: ["node", "node.js", "nodejs", "express"] },
  { name: "REST APIs", group: "Backend", aliases: ["rest", "rest api", "restful", "api design"] },
  { name: "GraphQL", group: "Backend", aliases: ["graphql", "apollo"] },
  { name: "Microservices", group: "Backend", aliases: ["microservice", "microservices"] },
  { name: "Django", group: "Backend", aliases: ["django", "flask", "fastapi"] },
  { name: "Spring Boot", group: "Backend", aliases: ["spring", "spring boot"] },
  { name: ".NET", group: "Backend", aliases: [".net", "dotnet", "asp.net"] },
  { name: "PostgreSQL", group: "Data", aliases: ["postgres", "postgresql"] },
  { name: "MySQL", group: "Data", aliases: ["mysql", "mariadb"] },
  { name: "MongoDB", group: "Data", aliases: ["mongo", "mongodb"] },
  { name: "Redis", group: "Data", aliases: ["redis", "memcached"] },
  { name: "Elasticsearch", group: "Data", aliases: ["elasticsearch", "opensearch"] },
  { name: "Kafka", group: "Data", aliases: ["kafka", "rabbitmq", "pub/sub"] },
  { name: "Spark", group: "Data", aliases: ["spark", "pyspark", "hadoop"] },
  { name: "Airflow", group: "Data", aliases: ["airflow", "dbt", "etl"] },
  { name: "Data Warehousing", group: "Data", aliases: ["snowflake", "redshift", "bigquery"] },

  // Cloud & platform
  { name: "AWS", group: "Cloud", aliases: ["aws", "amazon web services", "ec2", "lambda", "s3"] },
  { name: "Azure", group: "Cloud", aliases: ["azure"] },
  { name: "Google Cloud", group: "Cloud", aliases: ["gcp", "google cloud"] },
  { name: "Docker", group: "Cloud", aliases: ["docker", "containers", "containerisation"] },
  { name: "Kubernetes", group: "Cloud", aliases: ["kubernetes", "k8s", "eks", "helm"] },
  { name: "Terraform", group: "Cloud", aliases: ["terraform", "pulumi", "infrastructure as code"] },
  { name: "CI/CD", group: "Cloud", aliases: ["ci/cd", "cicd", "jenkins", "github actions", "gitlab ci"] },
  { name: "Linux", group: "Cloud", aliases: ["linux", "unix", "bash", "shell scripting"] },
  { name: "Observability", group: "Cloud", aliases: ["datadog", "prometheus", "grafana", "observability"] },

  // AI / ML
  { name: "Machine Learning", group: "AI & ML", aliases: ["machine learning", "ml", "deep learning"] },
  { name: "PyTorch", group: "AI & ML", aliases: ["pytorch", "tensorflow", "keras"] },
  { name: "NLP", group: "AI & ML", aliases: ["nlp", "natural language processing"] },
  { name: "LLMs", group: "AI & ML", aliases: ["llm", "llms", "generative ai", "genai", "prompt engineering", "rag"] },
  { name: "Computer Vision", group: "AI & ML", aliases: ["computer vision", "opencv"] },

  // Practice & process
  { name: "Git", group: "Practice", aliases: ["git", "github", "gitlab", "bitbucket", "version control"] },
  { name: "Agile / Scrum", group: "Practice", aliases: ["agile", "scrum", "kanban", "sprint"] },
  { name: "Testing", group: "Practice", aliases: ["testing", "unit test", "unit testing", "jest", "cypress", "playwright", "tdd", "automation testing", "qa"] },
  { name: "System Design", group: "Practice", aliases: ["system design", "architecture", "scalability"] },
  { name: "Security", group: "Practice", aliases: ["security", "owasp", "penetration testing", "appsec"] },

  // Business & analytics
  { name: "Excel", group: "Business", aliases: ["excel", "advanced excel", "spreadsheets"] },
  { name: "Power BI", group: "Business", aliases: ["power bi", "powerbi", "tableau", "looker"] },
  { name: "Product Management", group: "Business", aliases: ["product management", "roadmap", "prd", "product owner"] },
  { name: "Stakeholder Management", group: "Business", aliases: ["stakeholder", "cross-functional", "cross functional"] },
  { name: "SEO", group: "Business", aliases: ["seo", "search engine optimisation", "search engine optimization"] },
  { name: "Salesforce", group: "Business", aliases: ["salesforce", "crm", "hubspot"] },
  { name: "Communication", group: "Business", aliases: ["communication skills", "written communication", "verbal communication"] },
];

/* ------------------------------------------------------------------ *
 * Gendered wording — Gaucher, Friesen & Kay (2011) word stems
 * ------------------------------------------------------------------ */

/** Masculine-coded stems. Matched as prefixes, as in the original coding scheme. */
export const MASCULINE_CODED_STEMS = [
  "aggress", "ambitio", "assert", "athlet", "autonom", "boast", "challeng",
  "compet", "confident", "courag", "decid", "decision", "decisive", "determin",
  "dominan", "domina", "driven", "fearless", "fight", "force", "greedy", "headstrong",
  "hierarch", "hostil", "independen", "individual", "intellect", "lead", "logic",
  "masculine", "ninja", "objective", "opinion", "outspoken", "persist", "principle",
  "reckless", "rockstar", "self-confiden", "self-relian", "self-sufficien", "stubborn",
  "superior", "unreasonab",
];

/** Feminine-coded stems from the same paper. Included for balance, not as a defect. */
export const FEMININE_CODED_STEMS = [
  "affectionate", "collab", "commit", "communal", "compassion", "connect", "considerate",
  "cooperat", "depend", "emotiona", "empath", "feel", "flatterable", "gentle", "honest",
  "interpersonal", "interdependen", "kind", "kinship", "loyal", "modesty", "nurtur",
  "pleasant", "polite", "quiet", "respon", "sensitiv", "submissive", "support",
  "sympath", "tender", "together", "trust", "understand", "warm", "whin", "yield",
];

/** Neutral swaps for the most commonly flagged masculine-coded words. */
export const NEUTRAL_SWAPS = {
  ninja: "specialist",
  rockstar: "expert",
  aggressive: "proactive",
  aggressively: "proactively",
  dominant: "leading",
  fearless: "confident",
  competitive: "motivated",
  ambitious: "goal-focused",
  "self-reliant": "works independently",
  headstrong: "decisive",
  stubborn: "persistent",
  guru: "expert",
};

/* ------------------------------------------------------------------ *
 * Seniority
 * ------------------------------------------------------------------ */

/** Seniority bands with the title words that signal them and the years band
 * normally attached to that band in Indian and global tech hiring ladders. */
export const SENIORITY_LEVELS = [
  { level: "Intern", keywords: ["intern", "internship", "trainee", "apprentice"], years: [0, 1] },
  { level: "Entry", keywords: ["fresher", "entry level", "entry-level", "graduate", "junior", "associate", "jr."], years: [0, 2] },
  { level: "Mid", keywords: ["mid level", "mid-level", "engineer ii", "software engineer 2", "specialist"], years: [2, 5] },
  { level: "Senior", keywords: ["senior", "sr.", "sr ", "engineer iii"], years: [5, 8] },
  { level: "Lead", keywords: ["lead", "staff", "team lead", "tech lead", "manager", "em "], years: [8, 12] },
  { level: "Principal", keywords: ["principal", "architect", "director", "head of", "vp ", "vice president", "distinguished"], years: [12, 25] },
];

/* ------------------------------------------------------------------ *
 * Structure checks
 * ------------------------------------------------------------------ */

/** Sections a complete job post is expected to contain. */
export const EXPECTED_SECTIONS = [
  { key: "role", label: "Role summary", patterns: ["about the role", "role overview", "job summary", "about this position", "overview"] },
  { key: "responsibilities", label: "Responsibilities", patterns: ["responsibilit", "what you will do", "what you'll do", "key duties", "your role"] },
  { key: "requirements", label: "Requirements", patterns: ["requirement", "qualification", "what we look for", "must have", "you should have", "skills required"] },
  { key: "experience", label: "Experience level", patterns: ["years of experience", "years experience", "yrs of experience", "experience:"] },
  { key: "location", label: "Location / work mode", patterns: ["remote", "hybrid", "on-site", "onsite", "location", "work from"] },
  { key: "compensation", label: "Compensation", patterns: ["salary", "ctc", "compensation", "pay range", "lpa", "package"] },
  { key: "benefits", label: "Benefits", patterns: ["benefit", "perks", "insurance", "paid leave", "pto", "wellness"] },
  { key: "company", label: "About the company", patterns: ["about us", "about the company", "who we are", "our mission"] },
  { key: "process", label: "Hiring process", patterns: ["hiring process", "interview process", "how to apply", "apply now", "next steps"] },
  { key: "equal", label: "Equal-opportunity statement", patterns: ["equal opportunity", "equal-opportunity", "diversity", "regardless of"] },
];

/* ------------------------------------------------------------------ *
 * Quality-score weights (sum = 100)
 * ------------------------------------------------------------------ */

/** How the 0-100 JD quality score is split. Chosen so structure — the thing a
 * candidate actually needs — carries the most weight. */
export const SCORE_WEIGHTS = {
  structure: 40, // share of EXPECTED_SECTIONS present
  length: 20, // word count inside the readable band
  readability: 20, // Flesch Reading Ease inside the plain-English band
  neutrality: 20, // penalty per masculine-coded hit
};

/** LinkedIn and Indeed both report best applicant response for posts of roughly
 * 300-800 words; shorter reads as thin, longer as unreadable. */
export const IDEAL_WORD_RANGE = [300, 800];
/** Hard floor: below this there is not enough text to analyse. */
export const MIN_WORDS = 25;
/** Flesch Reading Ease band treated as plain business English (50 = fairly
 * difficult upper bound for standard prose; 70 = plain English lower bound). */
export const IDEAL_READING_EASE = [50, 70];
/** Each masculine-coded hit costs this many of the 20 neutrality points. */
export const NEUTRALITY_PENALTY_PER_HIT = 4;

/** Reported bounds for Flesch Reading Ease. The formula is unbounded, but its
 * theoretical maximum is 121.22 (one one-syllable word per sentence); a single
 * unpunctuated wall of text can otherwise drive it to five negative digits,
 * which is arithmetically true and practically meaningless. Anything at or
 * below the floor is simply "very difficult". */
export const READING_EASE_BOUNDS = [-100, 121.22];

/** Reported bounds for Flesch–Kincaid Grade Level, in US school grades. 0 is
 * "below first grade" and 30 is past any real readership; the raw formula is
 * unbounded in both directions. */
export const GRADE_LEVEL_BOUNDS = [0, 30];

/** Weight multiplier applied to a JD skill repeated more than once, capped so a
 * single buzzword repeated ten times cannot dominate the match score. */
export const REPEAT_WEIGHT_STEP = 0.5;
export const MAX_SKILL_WEIGHT = 2;

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Boundary that treats +, # and _ as part of a token (so "C++" and "node_modules"
 * behave) and lets "." and "-" close one, so "Docker." and "React-based" still
 * match. A leading "." is excluded too, otherwise the "js" alias would fire on
 * the tail of "Next.js" and "Node.js".
 */
function aliasRegExp(alias) {
  return new RegExp(
    `(?<![a-zA-Z0-9+#_.])${escapeRegExp(alias)}(?![a-zA-Z0-9+#_])`,
    "gi",
  );
}

function aliasSpans(haystack, alias) {
  const re = aliasRegExp(alias);
  const spans = [];
  let match = re.exec(haystack);
  while (match) {
    spans.push([match.index, match.index + match[0].length]);
    if (re.lastIndex === match.index) re.lastIndex += 1;
    match = re.exec(haystack);
  }
  return spans;
}

/**
 * Mentions of one skill, counting each stretch of text once even when several
 * aliases overlap it ("Node" and "Node.js" over the same "Node.js" is one hit).
 */
function countSkillMentions(haystack, aliases) {
  const spans = [];
  for (const alias of aliases) spans.push(...aliasSpans(haystack, alias));
  // Longest span first at each start position so the widest alias wins.
  spans.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  let count = 0;
  let coveredTo = -1;
  for (const [start, end] of spans) {
    if (start >= coveredTo) {
      count += 1;
      coveredTo = end;
    }
  }
  return count;
}

/** Heuristic English syllable count: vowel groups, minus a silent trailing "e". */
export function countSyllables(word) {
  const clean = String(word).toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return 0;
  if (clean.length <= 3) return 1;
  const trimmed = clean
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return groups ? groups.length : 1;
}

/**
 * Word / sentence / syllable counts plus both Flesch scores.
 *
 * Flesch Reading Ease = 206.835 − 1.015·(words/sentences) − 84.6·(syllables/words)
 * Flesch–Kincaid Grade = 0.39·(words/sentences) + 11.8·(syllables/words) − 15.59
 *
 * @param {string} text
 * @returns {{ words:number, sentences:number, syllables:number,
 *             readingEase:number, gradeLevel:number, band:string } | { error:string }}
 */
export function readability(text) {
  const source = String(text ?? "");
  const wordList = source.match(/[A-Za-z][A-Za-z'’-]*/g) || [];
  if (wordList.length === 0) return { error: "There are no words to measure." };

  const sentenceHits = source.match(/[.!?]+(?=\s|$)/g) || [];
  // Bullet lists often have no terminal punctuation; every line still reads as
  // one sentence, so fall back to line count when punctuation is missing.
  const lineCount = source.split(/\n+/).filter((line) => line.trim().length > 0).length;
  const sentences = Math.max(1, sentenceHits.length, Math.min(lineCount, wordList.length));

  const syllables = wordList.reduce((total, word) => total + countSyllables(word), 0);
  const wordsPerSentence = wordList.length / sentences;
  const syllablesPerWord = syllables / wordList.length;

  const rawEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const readingEase = Math.min(
    READING_EASE_BOUNDS[1],
    Math.max(READING_EASE_BOUNDS[0], rawEase),
  );
  const rawGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  const gradeLevel = Math.min(
    GRADE_LEVEL_BOUNDS[1],
    Math.max(GRADE_LEVEL_BOUNDS[0], rawGrade),
  );

  return {
    words: wordList.length,
    sentences,
    syllables,
    wordsPerSentence,
    readingEase,
    gradeLevel,
    band: readingEaseBand(readingEase),
  };
}

/** Flesch's own descriptive bands. */
export function readingEaseBand(score) {
  if (score >= 90) return "Very easy";
  if (score >= 70) return "Easy";
  if (score >= 60) return "Plain English";
  if (score >= 50) return "Fairly difficult";
  if (score >= 30) return "Difficult";
  return "Very difficult";
}

/**
 * Every SKILL_LIBRARY entry the text mentions, with mention counts.
 *
 * @param {string} text
 * @returns {Array<{ name:string, group:string, mentions:number }>}
 */
export function extractSkills(text) {
  const source = String(text ?? "");
  if (!source.trim()) return [];
  const found = [];
  for (const skill of SKILL_LIBRARY) {
    const mentions = countSkillMentions(source, skill.aliases);
    if (mentions > 0) found.push({ name: skill.name, group: skill.group, mentions });
  }
  return found.sort((a, b) => b.mentions - a.mentions || a.name.localeCompare(b.name));
}

/**
 * Highest years-of-experience figure written in the text, plus the seniority
 * band implied by title keywords. Years win over keywords when they disagree.
 *
 * @param {string} text
 * @returns {{ level:string, years:number|null, source:string }}
 */
export function detectSeniority(text) {
  const source = String(text ?? "").toLowerCase();
  const yearMatches = source.match(/(\d{1,2})\s*(?:\+|plus)?\s*(?:-|–|to)?\s*(\d{1,2})?\s*\+?\s*(?:years?|yrs?)/g) || [];
  let years = null;
  for (const hit of yearMatches) {
    const numbers = (hit.match(/\d{1,2}/g) || []).map(Number);
    for (const value of numbers) {
      if (value <= 40 && (years === null || value > years)) years = value;
    }
  }

  let keywordLevel = null;
  for (const band of SENIORITY_LEVELS) {
    if (band.keywords.some((keyword) => source.includes(keyword))) keywordLevel = band.level;
  }

  if (years !== null) {
    const byYears = SENIORITY_LEVELS.find(
      (band) => years >= band.years[0] && years < band.years[1],
    );
    const level = byYears ? byYears.level : "Principal";
    return { level, years, source: keywordLevel ? "years + title" : "years" };
  }
  return { level: keywordLevel || "Unspecified", years: null, source: keywordLevel ? "title" : "none" };
}

/**
 * Gendered-wording hits, by coding direction.
 *
 * @param {string} text
 * @returns {{ masculine:Array<{word:string,count:number,swap:string|null}>,
 *             feminine:Array<{word:string,count:number}> }}
 */
export function findGenderedWording(text) {
  const words = String(text ?? "").toLowerCase().match(/[a-z][a-z'’-]*/g) || [];
  const tally = (stems) => {
    const hits = new Map();
    for (const word of words) {
      const stem = stems.find((candidate) => word.startsWith(candidate));
      if (!stem) continue;
      hits.set(word, (hits.get(word) || 0) + 1);
    }
    return [...hits.entries()]
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
  };

  return {
    masculine: tally(MASCULINE_CODED_STEMS).map((hit) => ({
      ...hit,
      swap: NEUTRAL_SWAPS[hit.word] || null,
    })),
    feminine: tally(FEMININE_CODED_STEMS),
  };
}

/** Which EXPECTED_SECTIONS the text does and does not cover. */
export function checkSections(text) {
  const source = String(text ?? "").toLowerCase();
  const present = [];
  const missing = [];
  for (const section of EXPECTED_SECTIONS) {
    const hit = section.patterns.some((pattern) => source.includes(pattern));
    (hit ? present : missing).push(section.label);
  }
  return { present, missing };
}

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/**
 * Full analysis of a job description.
 *
 * @param {{ jdText: string }} input
 * @returns {object} analysis, or { error: string }
 */
export function analyzeJobDescription({ jdText } = {}) {
  const text = typeof jdText === "string" ? jdText.trim() : "";
  if (!text) return { error: "Paste a job description first — there is nothing to analyse." };

  const reading = readability(text);
  if (reading.error) return { error: reading.error };
  if (reading.words < MIN_WORDS) {
    return {
      error: `That is only ${reading.words} word${reading.words === 1 ? "" : "s"}. Paste at least ${MIN_WORDS} words of the job description.`,
    };
  }

  const skills = extractSkills(text);
  const seniority = detectSeniority(text);
  const gendered = findGenderedWording(text);
  const sections = checkSections(text);

  const structureScore =
    (sections.present.length / EXPECTED_SECTIONS.length) * SCORE_WEIGHTS.structure;

  const [minWords, maxWords] = IDEAL_WORD_RANGE;
  let lengthScore;
  if (reading.words >= minWords && reading.words <= maxWords) {
    lengthScore = SCORE_WEIGHTS.length;
  } else if (reading.words < minWords) {
    lengthScore = (reading.words / minWords) * SCORE_WEIGHTS.length;
  } else {
    // Linear decay: at twice the upper bound the length score reaches zero.
    lengthScore = clamp(2 - reading.words / maxWords, 0, 1) * SCORE_WEIGHTS.length;
  }

  const [easeLow, easeHigh] = IDEAL_READING_EASE;
  let readabilityScore;
  if (reading.readingEase >= easeLow && reading.readingEase <= easeHigh) {
    readabilityScore = SCORE_WEIGHTS.readability;
  } else {
    const distance =
      reading.readingEase < easeLow ? easeLow - reading.readingEase : reading.readingEase - easeHigh;
    // 30 Flesch points away from the band = zero readability credit.
    readabilityScore = clamp(1 - distance / 30, 0, 1) * SCORE_WEIGHTS.readability;
  }

  const masculineHits = gendered.masculine.reduce((total, hit) => total + hit.count, 0);
  const neutralityScore = clamp(
    SCORE_WEIGHTS.neutrality - masculineHits * NEUTRALITY_PENALTY_PER_HIT,
    0,
    SCORE_WEIGHTS.neutrality,
  );

  const score = clamp(
    Math.round(structureScore + lengthScore + readabilityScore + neutralityScore),
    0,
    100,
  );

  return {
    score,
    grade: score >= 85 ? "Strong" : score >= 70 ? "Good" : score >= 50 ? "Needs work" : "Weak",
    breakdown: {
      structure: structureScore,
      length: lengthScore,
      readability: readabilityScore,
      neutrality: neutralityScore,
    },
    reading,
    skills,
    skillGroups: groupSkills(skills),
    seniority,
    gendered,
    masculineHits,
    sections,
    suggestions: buildSuggestions({ reading, sections, gendered, skills, seniority }),
  };
}

function groupSkills(skills) {
  const map = new Map();
  for (const skill of skills) {
    if (!map.has(skill.group)) map.set(skill.group, []);
    map.get(skill.group).push(skill);
  }
  return [...map.entries()].map(([group, items]) => ({ group, items }));
}

/**
 * Concrete, deterministic rewrite instructions derived from the analysis.
 *
 * @returns {Array<{ id:string, severity:"high"|"medium"|"low", text:string }>}
 */
export function buildSuggestions({ reading, sections, gendered, skills, seniority }) {
  const out = [];
  const [minWords, maxWords] = IDEAL_WORD_RANGE;

  for (const label of sections.missing) {
    out.push({
      id: `section-${label}`,
      severity: label === "Compensation" || label === "Responsibilities" ? "high" : "medium",
      text: `Add a "${label}" section — the post does not cover it anywhere.`,
    });
  }

  if (reading.words < minWords) {
    out.push({
      id: "too-short",
      severity: "high",
      text: `At ${reading.words} words the post is thinner than the ${minWords}-${maxWords} word range that reads as complete. Expand the day-to-day duties.`,
    });
  } else if (reading.words > maxWords) {
    out.push({
      id: "too-long",
      severity: "medium",
      text: `At ${reading.words} words the post runs past ${maxWords}. Cut boilerplate about the company and keep the role detail.`,
    });
  }

  if (reading.readingEase < IDEAL_READING_EASE[0]) {
    out.push({
      id: "hard-to-read",
      severity: "medium",
      text: `Reading ease is ${reading.readingEase.toFixed(1)} (grade ${reading.gradeLevel.toFixed(1)}). Split sentences averaging ${reading.wordsPerSentence.toFixed(1)} words and swap jargon for plain verbs.`,
    });
  }

  for (const hit of gendered.masculine.slice(0, 6)) {
    out.push({
      id: `gendered-${hit.word}`,
      severity: "medium",
      text: hit.swap
        ? `Replace "${hit.word}" (${hit.count}x) with "${hit.swap}" — masculine-coded wording measurably reduces applications from women.`
        : `"${hit.word}" (${hit.count}x) is masculine-coded in the Gaucher et al. word list. Rephrase it around the actual task.`,
    });
  }

  if (skills.length === 0) {
    out.push({
      id: "no-skills",
      severity: "high",
      text: "No recognisable tools, languages or platforms are named. List the specific stack the person will use.",
    });
  } else if (skills.length > 15) {
    out.push({
      id: "too-many-skills",
      severity: "low",
      text: `${skills.length} distinct skills are named. Mark the 5 that are genuinely mandatory and move the rest to "nice to have".`,
    });
  }

  if (seniority.years === null) {
    out.push({
      id: "no-years",
      severity: "high",
      text: "No years-of-experience figure appears. State a range, e.g. \"3-5 years\", so the post filters itself.",
    });
  }

  const order = { high: 0, medium: 1, low: 2 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}

/**
 * Match a candidate's skill list against the JD's extracted skills.
 *
 * Each JD skill is weighted 1 + REPEAT_WEIGHT_STEP per extra mention, capped at
 * MAX_SKILL_WEIGHT, so a repeatedly stressed skill counts for more than a
 * passing mention. Match % = matched weight / total weight.
 *
 * @param {{ jdText:string, candidateSkills:string }} input candidateSkills is a
 *        comma / newline separated list.
 * @returns {object} match report, or { error: string }
 */
export function scoreMatch({ jdText, candidateSkills } = {}) {
  const jd = typeof jdText === "string" ? jdText.trim() : "";
  if (!jd) return { error: "Paste a job description first." };

  const jdSkills = extractSkills(jd);
  if (jdSkills.length === 0) {
    return { error: "No recognisable skills found in the job description, so there is nothing to match against." };
  }

  const candidateText = String(candidateSkills ?? "").trim();
  if (!candidateText) {
    return { error: "Add your own skills — one per line or comma separated." };
  }

  const candidateSet = new Set(
    extractSkills(candidateText.replace(/[,;]/g, "\n")).map((skill) => skill.name),
  );

  let totalWeight = 0;
  let matchedWeight = 0;
  const matched = [];
  const missing = [];

  for (const skill of jdSkills) {
    const weight = Math.min(
      MAX_SKILL_WEIGHT,
      1 + (skill.mentions - 1) * REPEAT_WEIGHT_STEP,
    );
    totalWeight += weight;
    if (candidateSet.has(skill.name)) {
      matchedWeight += weight;
      matched.push({ ...skill, weight });
    } else {
      missing.push({ ...skill, weight });
    }
  }

  if (totalWeight <= 0) {
    return { error: "The job description does not weight any skill, so a match cannot be scored." };
  }

  const percent = (matchedWeight / totalWeight) * 100;
  return {
    percent,
    matched,
    missing,
    matchedCount: matched.length,
    jdSkillCount: jdSkills.length,
    extraSkills: [...candidateSet].filter(
      (name) => !jdSkills.some((skill) => skill.name === name),
    ),
    verdict:
      percent >= 80
        ? "Strong fit — apply."
        : percent >= 60
          ? "Reasonable fit — lead with the matched skills."
          : percent >= 40
            ? "Partial fit — close the top gaps before applying."
            : "Weak fit on the named stack.",
  };
}
