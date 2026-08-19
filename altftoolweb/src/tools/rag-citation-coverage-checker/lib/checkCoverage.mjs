const MAX_INPUT_CHARACTERS = 1_000_000;
const MAX_SOURCES = 5_000;
const MAX_CLAIMS = 5_000;

function normalizeId(value) {
  return String(value || "")
    .trim()
    .replace(/^\[|\]$/g, "")
    .toLowerCase();
}

function safeSource(id, text, title = "") {
  const cleanId = String(id || "").trim().slice(0, 160);
  if (!cleanId) return null;
  return {
    id: cleanId,
    normalizedId: normalizeId(cleanId),
    title: String(title || "").trim().slice(0, 300),
    text: String(text || "").trim().slice(0, 100_000),
  };
}

function sourcesFromJson(value) {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (typeof item === "string") return safeSource(index + 1, item);
        return safeSource(
          item?.id ?? item?.source_id ?? item?.sourceId ?? index + 1,
          item?.text ?? item?.content ?? item?.passage ?? "",
          item?.title ?? item?.name ?? "",
        );
      })
      .filter(Boolean);
  }
  if (value && typeof value === "object") {
    if (Array.isArray(value.sources)) return sourcesFromJson(value.sources);
    return Object.entries(value)
      .map(([id, item]) =>
        typeof item === "string"
          ? safeSource(id, item)
          : safeSource(id, item?.text ?? item?.content ?? item?.passage ?? "", item?.title),
      )
      .filter(Boolean);
  }
  return [];
}

function sourcesFromText(text) {
  const sources = [];
  let hitLimit = false;
  for (const line of text.split(/\r?\n/)) {
    const clean = line.trim();
    if (!clean) continue;
    const match = clean.match(
      /^(?:source\s+)?\[?([A-Za-z0-9][A-Za-z0-9_.:/-]{0,159})\]?\s*(?:\||\t|:\s+|—|-{2,})\s*(.*)$/iu,
    );
    if (match) sources.push(safeSource(match[1], match[2]));
    else sources.push(safeSource(sources.length + 1, clean));
    if (sources.length >= MAX_SOURCES) {
      hitLimit = true;
      break;
    }
  }
  return { sources: sources.filter(Boolean), hitLimit };
}

export function parseSources(source) {
  const raw = String(source || "");
  const bounded = raw.slice(0, MAX_INPUT_CHARACTERS);
  const trimmed = bounded.trim();
  if (!trimmed) {
    return { ok: true, format: "empty", sources: [], truncated: raw.length > bounded.length };
  }

  let sources;
  let format = "text";
  let hitLimit = false;
  if (/^[{[]/.test(trimmed)) {
    try {
      sources = sourcesFromJson(JSON.parse(trimmed));
      format = "json";
    } catch {
      return {
        ok: false,
        error: "The retrieval set looks like JSON, but it could not be parsed.",
        sources: [],
      };
    }
  } else {
    const textResult = sourcesFromText(trimmed);
    sources = textResult.sources;
    hitLimit = textResult.hitLimit;
  }

  const deduped = [];
  const seen = new Set();
  let dedupHitLimit = false;
  for (let i = 0; i < sources.length; i += 1) {
    const item = sources[i];
    if (seen.has(item.normalizedId)) continue;
    seen.add(item.normalizedId);
    deduped.push(item);
    if (deduped.length >= MAX_SOURCES) {
      dedupHitLimit = i < sources.length - 1;
      break;
    }
  }

  return {
    ok: true,
    format,
    sources: deduped,
    truncated:
      raw.length > bounded.length ||
      hitLimit ||
      sources.length > MAX_SOURCES ||
      dedupHitLimit,
  };
}

function splitClaims(answer) {
  const claims = String(answer || "")
    .slice(0, MAX_INPUT_CHARACTERS)
    .split(/\r?\n/)
    .flatMap((line) => {
      const isHeading = /^\s*#{1,6}\s+/.test(line);
      const clean = line
        .replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "")
        .replace(/^\s*#{1,6}\s+/, "")
        .trim();
      if (!clean || isHeading) return [];
      return clean.split(/(?<=[.!?])\s+(?=[A-Z0-9"'([{])/u);
    })
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .filter((sentence) => {
      const withoutCitations = sentence
        .replace(/\[[^\]]+\]/g, "")
        .replace(/\((?:sources?|refs?|citations?)\s*:[^)]+\)/giu, "")
        .trim();
      const words = withoutCitations.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || [];
      return (
        words.length >= 4 &&
        !withoutCitations.endsWith("?") &&
        !/^(?:sources?|references?|citations?)\s*:/iu.test(withoutCitations)
      );
    });

  return { claims: claims.slice(0, MAX_CLAIMS), hitLimit: claims.length > MAX_CLAIMS };
}

function splitReferenceList(value) {
  return String(value || "")
    .split(/\s*(?:,|;|\band\b)\s*/iu)
    .map((item) => item.replace(/^(?:source|ref|citation)\s+/iu, "").trim())
    .filter((item) => /^[A-Za-z0-9][A-Za-z0-9_.:/-]{0,159}$/u.test(item));
}

export function extractCitationIds(sentence) {
  const ids = [];
  const bracketPattern = /\[([^\]\r\n]{1,320})\]/gu;
  const labelledPattern = /\((?:sources?|refs?|citations?)\s*:\s*([^)]+)\)/giu;
  let match;

  while ((match = bracketPattern.exec(sentence))) {
    ids.push(...splitReferenceList(match[1]));
  }
  while ((match = labelledPattern.exec(sentence))) {
    ids.push(...splitReferenceList(match[1]));
  }

  return [...new Set(ids.map((id) => String(id).trim()))];
}

export function checkCitationCoverage(answerSource, retrievalSource) {
  const rawAnswer = String(answerSource || "");
  if (!rawAnswer.trim()) {
    return { ok: false, error: "Add an answer to check.", claims: [] };
  }

  const parsedSources = parseSources(retrievalSource);
  if (!parsedSources.ok) return { ...parsedSources, claims: [] };

  const sourceIds = new Set(parsedSources.sources.map((source) => source.normalizedId));
  const { claims: claimSentences, hitLimit: claimsHitLimit } = splitClaims(rawAnswer);
  const claims = claimSentences.map((text, index) => {
    const citationIds = extractCitationIds(text);
    const recognizedIds = citationIds.filter((id) => sourceIds.has(normalizeId(id)));
    const unknownIds = citationIds.filter((id) => !sourceIds.has(normalizeId(id)));
    const status = recognizedIds.length
      ? unknownIds.length
        ? "mixed"
        : "linked"
      : citationIds.length
        ? "unknown"
        : "missing";
    return {
      index: index + 1,
      text,
      citationIds,
      recognizedIds,
      unknownIds,
      status,
    };
  });

  const linkedClaims = claims.filter((claim) =>
    ["linked", "mixed"].includes(claim.status),
  ).length;
  const coveragePercent = claims.length
    ? Math.round((linkedClaims / claims.length) * 1000) / 10
    : 0;

  return {
    ok: true,
    claims,
    claimCount: claims.length,
    linkedClaims,
    missingClaims: claims.filter((claim) => claim.status === "missing").length,
    unknownOnlyClaims: claims.filter((claim) => claim.status === "unknown").length,
    mixedClaims: claims.filter((claim) => claim.status === "mixed").length,
    coveragePercent,
    sourceCount: parsedSources.sources.length,
    sourceFormat: parsedSources.format,
    truncated:
      parsedSources.truncated ||
      rawAnswer.length > MAX_INPUT_CHARACTERS ||
      claimsHitLimit,
  };
}

export function buildCoverageReport(result) {
  if (!result?.ok) return null;
  return {
    generatedAt: new Date().toISOString(),
    sourceCount: result.sourceCount,
    claimCount: result.claimCount,
    linkedClaims: result.linkedClaims,
    missingClaims: result.missingClaims,
    unknownOnlyClaims: result.unknownOnlyClaims,
    mixedClaims: result.mixedClaims,
    coveragePercent: result.coveragePercent,
    claimStatuses: result.claims.map((claim) => ({
      claim: claim.index,
      status: claim.status,
      citationCount: claim.citationIds.length,
      recognizedCitationCount: claim.recognizedIds.length,
      unknownCitationCount: claim.unknownIds.length,
    })),
    truncated: result.truncated,
    note:
      "Citation linkage is structural only. It does not verify that a source supports a claim, that a claim is true, or that the retrieval set is complete.",
  };
}
