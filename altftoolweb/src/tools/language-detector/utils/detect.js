// Heuristic, client-side language detection.
// Combines (1) Unicode script detection and (2) per-language distinctive
// character/bigram frequency profiles. No network calls — runs locally.

// Script ranges (as [start, end] code points).
const SCRIPTS = [
  { name: "Latin", ranges: [[0x0041, 0x005a], [0x0061, 0x007a], [0x00c0, 0x024f], [0x1e00, 0x1eff]] },
  { name: "Cyrillic", ranges: [[0x0400, 0x04ff], [0x0500, 0x052f]] },
  { name: "Greek", ranges: [[0x0370, 0x03ff]] },
  { name: "Arabic", ranges: [[0x0600, 0x06ff], [0x0750, 0x077f]] },
  { name: "Hebrew", ranges: [[0x05d0, 0x05ea]] },
  { name: "Devanagari", ranges: [[0x0900, 0x097f]] },
  { name: "Hiragana", ranges: [[0x3040, 0x309f]] },
  { name: "Katakana", ranges: [[0x30a0, 0x30ff]] },
  { name: "Hangul", ranges: [[0xac00, 0xd7a3], [0x1100, 0x11ff]] },
  { name: "Thai", ranges: [[0x0e00, 0x0e7f]] },
  { name: "Bengali", ranges: [[0x0980, 0x09ff]] },
  { name: "Gujarati", ranges: [[0x0a80, 0x0aff]] },
  { name: "Gurmukhi", ranges: [[0x0a00, 0x0a7f]] },
  { name: "Tamil", ranges: [[0x0b80, 0x0bff]] },
  { name: "Telugu", ranges: [[0x0c00, 0x0c7f]] },
  { name: "Kannada", ranges: [[0x0c80, 0x0cff]] },
  { name: "Malayalam", ranges: [[0x0d00, 0x0d7f]] },
  { name: "Odia", ranges: [[0x0b00, 0x0b7f]] },
  { name: "Chinese", ranges: [[0x4e00, 0x9fff], [0x3400, 0x4dbf]] },
];

function inRanges(cp, ranges) {
  return ranges.some(([s, e]) => cp >= s && cp <= e);
}

export function detectScripts(text) {
  const counts = {};
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    for (const script of SCRIPTS) {
      if (inRanges(cp, script.ranges)) {
        counts[script.name] = (counts[script.name] || 0) + 1;
        break;
      }
    }
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { counts, total };
}

// Distinctive letter sets (lowercase ASCII) that help separate Latin-script languages.
const PROFILES = [
  { lang: "English", chars: "etaoinsrhld", weight: 1.0 },
  { lang: "Spanish", chars: "ñáéíóúü", extra: "eaosrnidl", weight: 1.15 },
  { lang: "French", chars: "àâçéèêëîïôùûüÿñ", extra: "esaitnrul", weight: 1.15 },
  { lang: "German", chars: "äöüß", extra: "enirstdah", weight: 1.15 },
  { lang: "Italian", chars: "àèéìòóù", extra: "eaionlrts", weight: 1.1 },
  { lang: "Portuguese", chars: "ãõáéíóúâêôç", extra: "aeosrnidt", weight: 1.15 },
  { lang: "Turkish", chars: "çğışöü", extra: "aeinrldk", weight: 1.2 },
  { lang: "Polish", chars: "ąćęłńóśźż", extra: "aeioznsrwt", weight: 1.2 },
  { lang: "Dutch", chars: "ij", extra: "enartios", weight: 1.0 },
  { lang: "Swedish", chars: "åäö", extra: "eantrslid", weight: 1.15 },
  { lang: "Vietnamese", chars: "ăâđêôơưàèìòùấ", extra: "eaintrlu", weight: 1.25 },
  { lang: "Romanian", chars: "ăâîșț", extra: "eaoristcn", weight: 1.2 },
  { lang: "Indonesian", chars: "eaionu", extra: "eaionrmbk", weight: 0.95 },
  { lang: "Tagalog", chars: "ng", extra: "aeionmgsk", weight: 0.9 },
];

// Non-Latin language labels keyed by dominant script.
const SCRIPT_LANG = {
  Cyrillic: "Russian",
  Greek: "Greek",
  Arabic: "Arabic",
  Hebrew: "Hebrew",
  Devanagari: "Hindi",
  Hiragana: "Japanese",
  Katakana: "Japanese",
  Hangul: "Korean",
  Thai: "Thai",
  Bengali: "Bengali",
  Gujarati: "Gujarati",
  Gurmukhi: "Punjabi",
  Tamil: "Tamil",
  Telugu: "Telugu",
  Kannada: "Kannada",
  Malayalam: "Malayalam",
  Odia: "Odia",
  Chinese: "Chinese",
};

export function detectLanguage(text) {
  const clean = (text || "").trim();
  if (!clean) return { candidates: [], scripts: [], stats: null };

  const { counts, total } = detectScripts(clean);
  const scriptList = Object.entries(counts)
    .map(([name, count]) => ({ name, count, ratio: total ? count / total : 0 }))
    .sort((a, b) => b.count - a.count);

  const lower = clean.toLowerCase();
  // Profiles include Latin Extended letters such as ğ, ł, ă, ș, ț, ơ, ư and
  // đ. A hand-written Latin-1 range silently dropped those characters from
  // the denominator; Unicode script properties cover the full Latin script.
  const letters = lower.replace(/[^\p{Script=Latin}]/gu, "");
  const letterCount = letters.length || 1;

  // Score Latin-script languages by distinctive characters + common letters.
  const latinScores = PROFILES.map((p) => {
    let score = 0;
    for (const ch of p.chars) {
      const occ = lower.split(ch).length - 1;
      score += occ * 2;
    }
    if (p.extra) {
      for (const ch of p.extra) {
        const occ = lower.split(ch).length - 1;
        score += (occ / letterCount) * 10;
      }
    }
    return { lang: p.lang, score: score * p.weight };
  });

  const candidates = [];

  // Non-Latin scripts get a high base score proportional to their share.
  scriptList.forEach((s) => {
    if (s.name !== "Latin") {
      const lang = SCRIPT_LANG[s.name];
      if (lang) {
        candidates.push({ lang, confidence: Math.min(99, 60 + s.ratio * 39), script: s.name });
      }
    }
  });

  // Latin-based candidates.
  const maxLatin = Math.max(0, ...latinScores.map((l) => l.score));
  if (maxLatin > 0) {
    latinScores.forEach((l) => {
      const confidence = Math.round((l.score / maxLatin) * 92);
      if (confidence > 8) {
        candidates.push({ lang: l.lang, confidence, script: "Latin" });
      }
    });
  }

  candidates.sort((a, b) => b.confidence - a.confidence);

  // Build character statistics.
  const statMap = {};
  for (const ch of clean) {
    if (/\S/.test(ch)) statMap[ch] = (statMap[ch] || 0) + 1;
  }
  const uniqueChars = Object.keys(statMap).length;
  const words = clean.split(/\s+/).filter(Boolean).length;

  return {
    candidates: candidates.slice(0, 5),
    scripts: scriptList,
    stats: {
      length: clean.length,
      words,
      uniqueChars,
      letters: clean.match(/\p{L}/gu)?.length ?? 0,
    },
  };
}
