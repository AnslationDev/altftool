
'use server';

// Server Actions – Next.js App Router
import {
  getPOSTag,
  fetchSynonyms,
  filterAndPickBest,
  analyzeParagraphVocabulary
} from './services/nlpService.js';

/**
 * Server Action: Single word synonym lookup.
 */
export async function getSmartSynonyms(formData) {
  try {
    const sentence = String(formData.get('sentence') ?? '').trim();
    const rawTargetWord = String(formData.get('targetWord') ?? '').trim();

    if (!sentence || !rawTargetWord) return [];

    const targetWord = rawTargetWord.toLowerCase();

    // 1. Context ke hisaab se POS tag nikaalein
    const posTag = await getPOSTag(sentence, targetWord);

    // 2. Raw synonyms fetch karein (Datamuse ML logic)
    const rawSynonyms = await fetchSynonyms(targetWord);

    // 3. Filter karein aur array return karein
    // Kyunki nlpService ka filterAndPickBest ek single best word deta hai,
    // hum yahan filter karke top 5 results bhej rahe hain client UI ko.
    const filtered = rawSynonyms
      .filter(s => {
        const isDifferent = s.word.toLowerCase() !== targetWord;
        const isNotPhrase = !s.word.includes(' ');
        const posMatch = posTag === 'u' || s.tags.includes(posTag);
        return isDifferent && isNotPhrase && posMatch;
      })
      .sort((a, b) => b.score - a.score) // High relevance score pehle
      .slice(0, 5) // Sirf top 5 suggestions
      .map(s => s.word);

    return filtered;
  } catch (err) {
    console.error('getSmartSynonyms error:', err);
    return [];
  }
}

/**
 * Server Action: Full Paragraph Analysis and Simplification.
 */
export async function analyzeAndSimplifyText(formData) {
  try {
    const paragraph = String(formData.get('paragraph') ?? '').trim();
    if (!paragraph) return { simplifiedText: '', wordMapping: {} };

    // simplifyParagraph function nlpService mein parallel processing use karta hai
    const result = await analyzeParagraphVocabulary(paragraph);
    return result;
  } catch (err) {
    console.error('analyzeAndSimplifyText error:', err);
    return {
      simplifiedText: 'An error occurred while processing the text.',
      wordMapping: {}
    };
  }
}