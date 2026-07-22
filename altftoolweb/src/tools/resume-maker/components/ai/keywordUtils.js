export const extractKeywords = (text) => {
  if (!text) return [];

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // remove symbols
    .split(/\s+/)
    .filter((word) => word.length > 3); // ignore small words
};

// 🔥 compare JD vs Resume
export const matchKeywords = (jdText, resumeText) => {
  const jdKeywords = extractKeywords(jdText);
  const resumeKeywords = extractKeywords(resumeText);

  const matched = [];
  const missing = [];

  jdKeywords.forEach((word) => {
    if (resumeKeywords.includes(word)) {
      matched.push(word);
    } else {
      missing.push(word);
    }
  });

  // remove duplicates
  return {
    matched: [...new Set(matched)],
    missing: [...new Set(missing)],
  };
};