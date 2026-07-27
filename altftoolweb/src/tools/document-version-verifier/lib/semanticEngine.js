// Local browser-based semantic similarity and sentence equivalence engine

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function getWordFrequency(tokens) {
  const freq = new Map();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }
  return freq;
}

export function calculateCosineSimilarity(textA, textB) {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  if (!tokensA.length && !tokensB.length) return 1.0;
  if (!tokensA.length || !tokensB.length) return 0.0;

  const freqA = getWordFrequency(tokensA);
  const freqB = getWordFrequency(tokensB);

  const allWords = new Set([...freqA.keys(), ...freqB.keys()]);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const word of allWords) {
    const valA = freqA.get(word) || 0;
    const valB = freqB.get(word) || 0;
    dotProduct += valA * valB;
    magA += valA * valA;
    magB += valB * valB;
  }

  if (!magA || !magB) return 0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function calculateJaccardSimilarity(textA, textB) {
  const setA = new Set(tokenize(textA));
  const setB = new Set(tokenize(textB));
  if (!setA.size && !setB.size) return 1.0;
  if (!setA.size || !setB.size) return 0.0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function splitIntoSentences(text) {
  return String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function analyzeSentenceEquivalence(textA, textB) {
  const sA = splitIntoSentences(textA);
  const sB = splitIntoSentences(textB);

  const matches = [];
  const unmatchedA = [...sA];
  const unmatchedB = [...sB];

  for (let i = 0; i < sA.length; i++) {
    const sentA = sA[i];
    let bestMatch = null;
    let bestSim = 0;
    let bestIdx = -1;

    for (let j = 0; j < sB.length; j++) {
      const sentB = sB[j];
      const sim = calculateCosineSimilarity(sentA, sentB);
      if (sim > bestSim) {
        bestSim = sim;
        bestMatch = sentB;
        bestIdx = j;
      }
    }

    if (bestSim >= 0.65) {
      matches.push({
        original: sentA,
        comparison: bestMatch,
        similarity: Math.round(bestSim * 100),
        status: bestSim >= 0.98 ? "Identical" : "Equivalent Meaning",
      });
    }
  }

  return {
    matchedSentences: matches,
    sentenceCountA: sA.length,
    sentenceCountB: sB.length,
  };
}

export function calculateOverallSimilarityMetrics(textA, textB) {
  const cosine = calculateCosineSimilarity(textA, textB);
  const jaccard = calculateJaccardSimilarity(textA, textB);
  const sentenceAnalysis = analyzeSentenceEquivalence(textA, textB);

  const overall = Math.round((cosine * 0.6 + jaccard * 0.4) * 100);

  return {
    cosineScore: Math.round(cosine * 100),
    jaccardScore: Math.round(jaccard * 100),
    overallSimilarity: overall,
    sentenceEquivalences: sentenceAnalysis.matchedSentences,
  };
}
