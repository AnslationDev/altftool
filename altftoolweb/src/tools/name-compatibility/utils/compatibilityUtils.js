import { numerologyMeanings, compatibilityMessages } from "../constants/data";

function getLetterValue(letter) {
  const upper = letter.toUpperCase();
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const idx = alphabet.indexOf(upper);
  if (idx === -1) return 0;
  return (idx % 9) + 1;
}

function reduceToSingleDigit(num) {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = String(num).split("").reduce((sum, d) => sum + Number(d), 0);
  }
  return num;
}

function getNameNumber(name) {
  const cleaned = name.replace(/[^a-zA-Z]/g, "").toUpperCase();
  let total = 0;
  for (const ch of cleaned) {
    total += getLetterValue(ch);
  }
  return reduceToSingleDigit(total);
}

function getSoulUrge(name) {
  const vowels = "AEIOU";
  const cleaned = name.replace(/[^a-zA-Z]/g, "").toUpperCase();
  let total = 0;
  for (const ch of cleaned) {
    if (vowels.includes(ch)) {
      total += getLetterValue(ch);
    }
  }
  return reduceToSingleDigit(total);
}

function getPersonalityNumber(name) {
  const vowels = "AEIOU";
  const cleaned = name.replace(/[^a-zA-Z]/g, "").toUpperCase();
  let total = 0;
  for (const ch of cleaned) {
    if (!vowels.includes(ch)) {
      total += getLetterValue(ch);
    }
  }
  return reduceToSingleDigit(total);
}

function getDestinyNumber(name) {
  return getNameNumber(name);
}

function getZodiacFromName(name) {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];
  let total = 0;
  for (const ch of name.replace(/[^a-zA-Z]/g, "").toUpperCase()) {
    total += ch.charCodeAt(0);
  }
  return signs[total % 12];
}

function getElementFromNumber(num) {
  const elements = ["Fire", "Earth", "Air", "Water"];
  return elements[(num - 1) % 4];
}

function calculateLoveScore(name1, name2) {
  const n1 = getNameNumber(name1);
  const n2 = getNameNumber(name2);
  const s1 = getSoulUrge(name1);
  const s2 = getSoulUrge(name2);

  let score = 50;
  if (n1 === n2) score += 20;
  else if (Math.abs(n1 - n2) <= 2) score += 12;
  else if (Math.abs(n1 - n2) <= 4) score += 6;
  else score -= 5;

  if (s1 === s2) score += 15;
  else if (Math.abs(s1 - s2) <= 2) score += 8;
  else score += 2;

  const combined = (n1 + n2) % 9 || 9;
  score += combined > 5 ? 8 : 3;

  return Math.min(100, Math.max(10, score));
}

function calculateFriendshipScore(name1, name2) {
  const n1 = getNameNumber(name1);
  const n2 = getNameNumber(name2);
  const p1 = getPersonalityNumber(name1);
  const p2 = getPersonalityNumber(name2);

  let score = 45;
  if (Math.abs(n1 - n2) <= 3) score += 18;
  else score += 5;

  if (Math.abs(p1 - p2) <= 2) score += 15;
  else score += 5;

  if ((n1 + n2) % 2 === 0) score += 10;

  return Math.min(100, Math.max(10, score));
}

function calculateSoulmateScore(name1, name2) {
  const d1 = getDestinyNumber(name1);
  const d2 = getDestinyNumber(name2);
  const s1 = getSoulUrge(name1);
  const s2 = getSoulUrge(name2);

  let score = 40;
  if (d1 === d2) score += 25;
  else if (Math.abs(d1 - d2) <= 1) score += 15;
  else if (Math.abs(d1 - d2) <= 3) score += 8;

  if (s1 === s2) score += 20;
  else if (Math.abs(s1 - s2) <= 2) score += 10;

  const total = d1 + d2 + s1 + s2;
  const masterCheck = [11, 22, 33].includes(total);
  if (masterCheck) score += 10;

  return Math.min(100, Math.max(10, score));
}

function calculateBusinessScore(name1, name2) {
  const n1 = getNameNumber(name1);
  const n2 = getNameNumber(name2);
  const p1 = getPersonalityNumber(name1);
  const p2 = getPersonalityNumber(name2);

  let score = 40;
  const leadershipNums = [1, 4, 8];
  if (leadershipNums.includes(n1) && leadershipNums.includes(n2)) score += 15;
  else if (leadershipNums.includes(n1) || leadershipNums.includes(n2)) score += 10;

  if (Math.abs(p1 - p2) <= 3) score += 15;
  else score += 5;

  if (n1 + n2 > 10) score += 10;
  else score += 5;

  return Math.min(100, Math.max(10, score));
}

function getScoreLevel(score) {
  if (score >= 85) return "excellent";
  if (score >= 70) return "veryGood";
  if (score >= 55) return "good";
  if (score >= 40) return "average";
  return "challenging";
}

function getMessage(score) {
  const level = getScoreLevel(score);
  const msgs = compatibilityMessages[level];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

function getTraitLabel(score) {
  if (score >= 85) return "Cosmic Soulmates";
  if (score >= 70) return "Perfect Match";
  if (score >= 55) return "Great Connection";
  if (score >= 40) return "Interesting Dynamic";
  return "Complex Bond";
}

export function analyzeCompatibility(name1, name2) {
  const n1 = getNameNumber(name1);
  const n2 = getNameNumber(name2);
  const s1 = getSoulUrge(name1);
  const s2 = getSoulUrge(name2);
  const p1 = getPersonalityNumber(name1);
  const p2 = getPersonalityNumber(name2);
  const d1 = getDestinyNumber(name1);
  const d2 = getDestinyNumber(name2);

  const loveScore = calculateLoveScore(name1, name2);
  const friendshipScore = calculateFriendshipScore(name1, name2);
  const soulmateScore = calculateSoulmateScore(name1, name2);
  const businessScore = calculateBusinessScore(name1, name2);

  const avgScore = Math.round((loveScore + friendshipScore + soulmateScore + businessScore) / 4);

  return {
    name1: {
      name: name1,
      nameNumber: n1,
      soulUrge: s1,
      personality: p1,
      destiny: d1,
      zodiac: getZodiacFromName(name1),
      element: getElementFromNumber(n1),
      numerology: numerologyMeanings[n1] || numerologyMeanings[1],
    },
    name2: {
      name: name2,
      nameNumber: n2,
      soulUrge: s2,
      personality: p2,
      destiny: d2,
      zodiac: getZodiacFromName(name2),
      element: getElementFromNumber(n2),
      numerology: numerologyMeanings[n2] || numerologyMeanings[1],
    },
    scores: {
      love: loveScore,
      friendship: friendshipScore,
      soulmate: soulmateScore,
      business: businessScore,
      overall: avgScore,
    },
    overallTrait: getTraitLabel(avgScore),
    overallMessage: getMessage(avgScore),
  };
}

export function validateNames(name1, name2) {
  const errors = [];
  if (!name1 || !name1.trim()) errors.push("Please enter the first name.");
  if (!name2 || !name2.trim()) errors.push("Please enter the second name.");
  if (name1 && name1.trim().length < 2) errors.push("First name must be at least 2 characters.");
  if (name2 && name2.trim().length < 2) errors.push("Second name must be at least 2 characters.");
  return errors;
}
