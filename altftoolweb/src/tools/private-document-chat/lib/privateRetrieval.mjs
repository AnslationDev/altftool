export const PRIVATE_CHAT_LIMITS = {
  documents: 8,
  fileBytes: 8 * 1024 * 1024,
  totalBytes: 20 * 1024 * 1024,
  documentCharacters: 250_000,
  totalCharacters: 500_000,
  sections: 100,
  chunks: 2_000,
  chunkCharacters: 1_200,
  overlapCharacters: 160,
  queryCharacters: 1_000,
  queryTerms: 40,
  results: 8,
  history: 20,
};

const SUPPORTED_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "csv",
  "json",
  "pdf",
  "docx",
]);

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "for",
  "from",
  "had",
  "has",
  "have",
  "how",
  "i",
  "if",
  "in",
  "is",
  "it",
  "me",
  "of",
  "on",
  "or",
  "please",
  "show",
  "tell",
  "that",
  "the",
  "this",
  "to",
  "was",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "will",
  "with",
  "would",
  "you",
  "your",
  "aur",
  "hai",
  "hain",
  "ka",
  "ke",
  "ki",
  "kya",
  "me",
  "mein",
  "se",
]);

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function extensionOf(value) {
  const name = String(value || "")
    .trim()
    .toLowerCase();
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1) : "";
}

export function validatePrivateDocumentSelection(filesInput) {
  const files = Array.from(filesInput || []);
  if (!files.length) {
    return { ok: false, error: "Choose at least one local document." };
  }
  if (files.length > PRIVATE_CHAT_LIMITS.documents) {
    return {
      ok: false,
      error: "Choose no more than 8 documents at a time.",
    };
  }
  let totalBytes = 0;
  for (const file of files) {
    const extension = extensionOf(file?.name);
    const bytes = finite(file?.size, -1);
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      return {
        ok: false,
        error: "Use TXT, Markdown, CSV, JSON, text-based PDF, or DOCX files.",
      };
    }
    if (bytes <= 0) {
      return { ok: false, error: "Every selected document must be non-empty." };
    }
    if (bytes > PRIVATE_CHAT_LIMITS.fileBytes) {
      return {
        ok: false,
        error: "Each document must be 8 MB or smaller.",
      };
    }
    totalBytes += bytes;
  }
  if (totalBytes > PRIVATE_CHAT_LIMITS.totalBytes) {
    return {
      ok: false,
      error: "The selected documents exceed the 20 MB total limit.",
    };
  }
  return { ok: true, files, totalBytes };
}

function normalizedText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("und")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim();
}

export function tokenizeForRetrieval(value, { keepStopWords = false } = {}) {
  const tokens = normalizedText(value).match(/[\p{L}\p{M}\p{N}]+/gu) || [];
  return tokens.filter(
    (token) =>
      token.length >= 2 &&
      (keepStopWords || !STOP_WORDS.has(token)) &&
      token.length <= 80,
  );
}

function termCounts(tokens) {
  const counts = new Map();
  tokens.forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
  return counts;
}

function boundedCut(text, start, idealEnd) {
  if (idealEnd >= text.length) return text.length;
  const minimum = start + Math.floor(PRIVATE_CHAT_LIMITS.chunkCharacters * 0.6);
  const candidates = [
    text.lastIndexOf("\n", idealEnd),
    text.lastIndexOf(". ", idealEnd),
    text.lastIndexOf("। ", idealEnd),
    text.lastIndexOf("? ", idealEnd),
    text.lastIndexOf("! ", idealEnd),
    text.lastIndexOf(" ", idealEnd),
  ].filter((position) => position >= minimum);
  return candidates.length ? Math.max(...candidates) + 1 : idealEnd;
}

export function chunkSectionText(textInput) {
  const text = String(textInput || "")
    .replace(/\r\n?/gu, "\n")
    .trim();
  if (!text) return [];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const idealEnd = Math.min(
      text.length,
      start + PRIVATE_CHAT_LIMITS.chunkCharacters,
    );
    const end = boundedCut(text, start, idealEnd);
    const excerpt = text.slice(start, end).trim();
    if (excerpt) chunks.push({ start, end, text: excerpt });
    if (end >= text.length) break;
    const next = Math.max(
      start + 1,
      end - PRIVATE_CHAT_LIMITS.overlapCharacters,
    );
    const whitespace = text.indexOf(" ", next);
    start =
      whitespace >= 0 && whitespace < end
        ? whitespace + 1
        : Math.min(end, next);
  }
  return chunks;
}

export function buildPrivateDocumentIndex(documentsInput) {
  const documents = Array.from(documentsInput || []);
  if (!documents.length || documents.length > PRIVATE_CHAT_LIMITS.documents) {
    throw new Error("The extracted document count is outside safety limits.");
  }
  let totalCharacters = 0;
  const chunks = [];
  const documentSummaries = [];

  documents.forEach((document, documentIndex) => {
    const sections = Array.from(document.sections || []);
    if (!sections.length || sections.length > PRIVATE_CHAT_LIMITS.sections) {
      throw new Error(
        "A document has no usable sections or too many sections.",
      );
    }
    const documentCharacters = sections.reduce(
      (total, section) => total + String(section.text || "").length,
      0,
    );
    if (
      documentCharacters <= 0 ||
      documentCharacters > PRIVATE_CHAT_LIMITS.documentCharacters
    ) {
      throw new Error("A document exceeds the 250,000-character index limit.");
    }
    totalCharacters += documentCharacters;
    if (totalCharacters > PRIVATE_CHAT_LIMITS.totalCharacters) {
      throw new Error(
        "Extracted text exceeds the 500,000-character total limit.",
      );
    }

    const documentId = `document-${documentIndex + 1}`;
    const chunkStart = chunks.length;
    sections.forEach((section, sectionIndex) => {
      const sectionLabel =
        String(section.label || "")
          .trim()
          .slice(0, 100) || `Section ${sectionIndex + 1}`;
      chunkSectionText(section.text).forEach((part) => {
        if (chunks.length >= PRIVATE_CHAT_LIMITS.chunks) {
          throw new Error("The local index exceeds the 2,000-chunk limit.");
        }
        const tokens = tokenizeForRetrieval(part.text, {
          keepStopWords: true,
        });
        chunks.push({
          id: `chunk-${chunks.length + 1}`,
          documentId,
          documentLabel:
            String(document.label || "").slice(0, 140) ||
            `Document ${documentIndex + 1}`,
          sectionLabel,
          text: part.text,
          normalized: normalizedText(part.text),
          termCounts: termCounts(tokens),
          tokenCount: Math.max(1, tokens.length),
        });
      });
    });
    documentSummaries.push({
      id: documentId,
      label:
        String(document.label || "").slice(0, 140) ||
        `Document ${documentIndex + 1}`,
      format: String(document.format || "text").slice(0, 40),
      characters: documentCharacters,
      sections: sections.length,
      chunks: chunks.length - chunkStart,
      warnings: Array.from(document.warnings || []).map((value) =>
        String(value).slice(0, 300),
      ),
    });
  });

  const documentFrequency = new Map();
  chunks.forEach((chunk) => {
    new Set(chunk.termCounts.keys()).forEach((term) => {
      documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
    });
  });
  const averageChunkTokens =
    chunks.reduce((total, chunk) => total + chunk.tokenCount, 0) /
    Math.max(1, chunks.length);

  return {
    documents: documentSummaries,
    chunks,
    documentFrequency,
    averageChunkTokens,
    totalCharacters,
  };
}

export function retrievePrivateExcerpts(index, queryInput, limitInput = 5) {
  if (!index?.chunks?.length) {
    return {
      ok: false,
      error: "Build a local document index first.",
      results: [],
    };
  }
  const query = String(queryInput || "").trim();
  if (!query)
    return {
      ok: false,
      error: "Enter a question or search phrase.",
      results: [],
    };
  if (query.length > PRIVATE_CHAT_LIMITS.queryCharacters) {
    return {
      ok: false,
      error: "The question exceeds the 1,000-character limit.",
      results: [],
    };
  }
  let terms = tokenizeForRetrieval(query);
  if (!terms.length) {
    terms = tokenizeForRetrieval(query, { keepStopWords: true });
  }
  const uniqueTerms = [...new Set(terms)].slice(
    0,
    PRIVATE_CHAT_LIMITS.queryTerms,
  );
  if (!uniqueTerms.length) {
    return {
      ok: false,
      error: "Use at least one searchable letter or number term.",
      results: [],
    };
  }

  const chunkCount = index.chunks.length;
  const averageLength = Math.max(1, index.averageChunkTokens);
  const phrase = normalizedText(query);
  const scored = [];
  for (const chunk of index.chunks) {
    let score = 0;
    let matchedTerms = 0;
    for (const term of uniqueTerms) {
      const frequency = chunk.termCounts.get(term) || 0;
      if (!frequency) continue;
      matchedTerms += 1;
      const df = index.documentFrequency.get(term) || 0;
      const inverseDocumentFrequency =
        Math.log(1 + (chunkCount - df + 0.5) / (df + 0.5)) + 0.1;
      const denominator =
        frequency +
        1.2 * (1 - 0.75 + 0.75 * (chunk.tokenCount / averageLength));
      score +=
        inverseDocumentFrequency * ((frequency * (1.2 + 1)) / denominator);
    }
    if (!matchedTerms) continue;
    const coverage = matchedTerms / uniqueTerms.length;
    score += coverage * 2;
    if (phrase.length >= 4 && chunk.normalized.includes(phrase)) score += 3;
    scored.push({
      chunk,
      score: Number(score.toFixed(4)),
      matchedTerms,
      queryTermCount: uniqueTerms.length,
    });
  }

  const limit = Math.min(
    PRIVATE_CHAT_LIMITS.results,
    Math.max(1, Math.floor(finite(limitInput, 5))),
  );
  const results = scored
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.matchedTerms - left.matchedTerms ||
        left.chunk.id.localeCompare(right.chunk.id),
    )
    .slice(0, limit)
    .map(({ chunk, score, matchedTerms, queryTermCount }, rank) => ({
      rank: rank + 1,
      chunkId: chunk.id,
      documentId: chunk.documentId,
      documentLabel: chunk.documentLabel,
      sectionLabel: chunk.sectionLabel,
      excerpt: chunk.text,
      relevanceSignal: score,
      matchedTerms,
      queryTermCount,
    }));

  return {
    ok: true,
    queryTerms: uniqueTerms.length,
    results,
    message: results.length
      ? `Found ${results.length} matching source excerpt${results.length === 1 ? "" : "s"}.`
      : "No grounded excerpt matched this question. Try specific terms from the documents.",
    scope:
      "Deterministic retrieval only; no generated answer, inference, summarization, or truth verification.",
  };
}

export function buildPrivateChatCountsReport(
  { index, history } = {},
  createdAt = new Date().toISOString(),
) {
  if (!index) return null;
  const entries = Array.from(history || []);
  return {
    schema: "altftool.private-document-retrieval-session.v1",
    createdAt,
    createdAtMeaning: "Time this local counts-only summary was generated.",
    index: {
      documents: index.documents.length,
      chunks: index.chunks.length,
      characters: index.totalCharacters,
      formats: Object.fromEntries(
        [...new Set(index.documents.map(({ format }) => format))].map(
          (format) => [
            format,
            index.documents.filter((document) => document.format === format)
              .length,
          ],
        ),
      ),
    },
    session: {
      searches: entries.length,
      searchesWithResults: entries.filter(
        (entry) => entry.response?.results?.length,
      ).length,
      returnedExcerpts: entries.reduce(
        (total, entry) => total + (entry.response?.results?.length || 0),
        0,
      ),
    },
    scope: {
      documentNamesIncluded: false,
      documentTextIncluded: false,
      questionsIncluded: false,
      excerptsIncluded: false,
      cloudModelUsed: false,
      generatedAnswersIncluded: false,
    },
  };
}
