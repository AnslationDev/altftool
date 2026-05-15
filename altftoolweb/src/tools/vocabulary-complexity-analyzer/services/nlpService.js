
// second time 

// /* src/tools/vocabulary-complexity-analyzer/services/nlpService.js */

// ----------------------  HELPERS (Exported for Actions) ----------------------

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

export function simplifyTag(tags) {
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));

  // Datamuse 'adj' use karta hai, 'adjective' nahi
  if (tagSet.has('adjective')) return 'adj';
  if (tagSet.has('noun')) return 'n';
  if (tagSet.has('verb')) return 'v';
  if (tagSet.has('adverb')) return 'adv';

  return 'u';
}

export async function getPOSTag(sentence, targetWord) {
  const word = String(targetWord || '').toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 'u';

  const tokens = String(sentence || '').toLowerCase().match(/\b[a-z]+\b/g) || [];
  const index = tokens.indexOf(word);
  const previous = index > 0 ? tokens[index - 1] : '';

  if (word.endsWith('ly')) return 'adv';
  if (/(ing|ed|ize|ise|ify|ate)$/.test(word)) return 'v';
  if (/(ous|ful|able|ible|al|ive|ic|less|ary)$/.test(word)) return 'adj';
  if (/(tion|sion|ment|ness|ity|ship|ance|ence)$/.test(word)) return 'n';
  if (['a', 'an', 'the', 'this', 'that', 'very', 'more', 'most'].includes(previous)) return 'adj';
  if (['to', 'will', 'can', 'could', 'should', 'would', 'may', 'might'].includes(previous)) return 'v';

  return 'u';
}

export async function fetchSynonyms(word) {
  //const endpoint = `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&md=pf&max=10&topics=${encodeURIComponent(originalSentence)}`;
  const endpoint = `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&md=pf&max=10`;
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    return data.map(item => ({
      word: item.word,
      tags: item.tags || [],
      score: item.score,
      // Extracting frequency for better picking
      freq: parseFloat((item.tags?.find(t => t.startsWith('f:')) || 'f:0').split(':')[1])
    }));
  } catch (e) { return []; }
}

// ----------------------  THE PICKER (Must be Exported) ----------------------

export function filterAndPickBest(synonyms, posTag, originalWord) {

  if (!synonyms || synonyms.length === 0) return null;

  const origLower = originalWord.toLowerCase();

  // 1. Filtering Phase
  const candidates = synonyms.filter(s => {
    const word = s.word.toLowerCase();

    // Rule: Original word aur phrases ko hatao
    if (word === origLower || word.includes(' ')) return false;

    const hasMatchingTag = s.tags.includes(posTag);
    if (posTag !== 'u' && !hasMatchingTag) return false;

    if (s.score < 500 && s.score !== 0) return false;

    const freq = parseFloat((s.tags.find(t => t.startsWith('f:')) || 'f:0').split(':')[1]);
    if (freq < 0.1) return false;

    return true;
  });

  if (candidates.length === 0) {
    // Fallback: Agar strict filter se kuch na mile, toh sirf POS aur score dekho
    const fallback = synonyms.filter(s => s.tags.includes(posTag) && !s.word.includes(' '));
    return fallback.length > 0 ? fallback.sort((a, b) => b.score - a.score)[0].word : null;
  }

  // 2. Ranking Phase (The "Smart" Pick)
  return candidates.sort((a, b) => {
    const freqA = parseFloat((a.tags.find(t => t.startsWith('f:')) || 'f:0').split(':')[1]);
    const freqB = parseFloat((b.tags.find(t => t.startsWith('f:')) || 'f:0').split(':')[1]);

    /**
     * Logic: Hum score (meaning) ko 70% vajan denge aur frequency (simplicity) ko 30%
     * Taaki 'established' ke liye 'foreign' (high freq) na chuna jaye, 
     * balki 'recognized' ya 'proven' chuna jaye jiska score aur frequency dono balance ho.
     */
    const weightA = (a.score / 1000000) + (freqA * 1.5);
    const weightB = (b.score / 1000000) + (freqB * 1.5);

    return weightB - weightA;
  })[0].word;
}

// Alias for compatibility if your actions.js uses the old name
export const filterSynonymsByPOS = filterAndPickBest;

// ----------------------  MAIN LOGIC ----------------------

export async function analyzeParagraphVocabulary(text, maxWords = 15) {
  const words = text.match(/\b\w+\b/g) || [];
  const uniqueWords = [...new Set(words)];
  const complexWords = uniqueWords
    .filter(w => w.length > 7 || countSyllables(w) >= 3)
    .slice(0, maxWords);

  const wordMapping = {};

  const results = await Promise.all(complexWords.map(async (cw) => {
    const pos = await getPOSTag(text, cw);
    const syns = await fetchSynonyms(cw);
    const replacement = filterAndPickBest(syns, pos, cw);
    return { original: cw, replacement, alternatives: syns.slice(0, 4).map(s => s.word) };
  }));

  for (const res of results) {
    if (res.replacement || (res.alternatives && res.alternatives.length > 0)) {
      wordMapping[res.original] = {
        chosen: res.replacement,
        alternatives: res.alternatives
      };
    }
  }

  return { originalText: text, wordMapping };
}
