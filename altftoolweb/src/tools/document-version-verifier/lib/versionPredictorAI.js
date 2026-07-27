// Browser-based Heuristic AI Engine for Document Version Lineage & Reasoning

export function predictVersionRelationship(docA, docB, diffResult, securityResult, semanticResult) {
  const metaA = docA.metadata || {};
  const metaB = docB.metadata || {};
  const textA = docA.text || "";
  const textB = docB.text || "";

  const reasons = [];
  let scoreAIsOriginal = 50;
  let scoreBIsLatest = 50;

  // 1. Identical Check
  if (textA === textB) {
    return {
      status: "Identical Copies",
      newerDoc: "Equal",
      originalDoc: "Document A",
      modifiedDoc: "None",
      confidence: 100,
      reasoning: [
        "Both documents contain exact character-for-character matching text.",
        "No modifications, structural shifts, or metadata drift detected.",
      ],
      aiInsights: [
        "Documents are identical duplicates under current parser inspection.",
        "Zero word or line changes observed across versions.",
      ],
    };
  }

  // 2. Timestamp analysis
  const dateA = metaA.modifiedDate ? new Date(metaA.modifiedDate).getTime() : 0;
  const dateB = metaB.modifiedDate ? new Date(metaB.modifiedDate).getTime() : 0;

  if (dateA && dateB) {
    if (dateB > dateA) {
      scoreBIsLatest += 25;
      scoreAIsOriginal += 25;
      reasons.push(`Document B timestamp (${metaB.modifiedDate}) is more recent than Document A (${metaA.modifiedDate}).`);
    } else if (dateA > dateB) {
      scoreBIsLatest -= 25;
      scoreAIsOriginal -= 25;
      reasons.push(`Document A timestamp (${metaA.modifiedDate}) is more recent than Document B (${metaB.modifiedDate}).`);
    }
  }

  // 3. Word & Page Growth analysis
  const wordCountA = textA.split(/\s+/).filter(Boolean).length;
  const wordCountB = textB.split(/\s+/).filter(Boolean).length;
  const wordDiff = wordCountB - wordCountA;

  if (wordDiff > 0) {
    scoreBIsLatest += 15;
    scoreAIsOriginal += 15;
    reasons.push(`Document B contains ${wordDiff} additional words, indicating expansion/revision.`);
  } else if (wordDiff < 0) {
    reasons.push(`Document B contains ${Math.abs(wordDiff)} fewer words than Document A.`);
  }

  // 4. Structural Headings & Page Expansion
  if (metaB.pageCount && metaA.pageCount) {
    if (metaB.pageCount > metaA.pageCount) {
      scoreBIsLatest += 10;
      reasons.push(`Document B has expanded page count (${metaB.pageCount} pages vs ${metaA.pageCount} pages).`);
    }
  }

  // 5. Version Name Heuristics (e.g. v1, v2, _final, _draft)
  const nameA = (docA.name || "").toLowerCase();
  const nameB = (docB.name || "").toLowerCase();

  if (nameB.includes("v2") || nameB.includes("final") || nameB.includes("revised") || nameB.includes("updated")) {
    scoreBIsLatest += 20;
    reasons.push(`Filename '${docB.name}' contains revision markers (v2/final/updated).`);
  }
  if (nameA.includes("v1") || nameA.includes("draft") || nameA.includes("original") || nameA.includes("initial")) {
    scoreAIsOriginal += 20;
    reasons.push(`Filename '${docA.name}' indicates original draft status (v1/draft/initial).`);
  }

  // 6. Calculate Confidence %
  const bLatest = scoreBIsLatest >= scoreAIsOriginal;
  const rawConfidence = bLatest
    ? Math.min(99, Math.max(70, scoreBIsLatest))
    : Math.min(99, Math.max(70, 100 - scoreBIsLatest));
  const confidence = Math.round(rawConfidence);

  const newerDoc = bLatest ? docB.name || "Document B" : docA.name || "Document A";
  const originalDoc = bLatest ? docA.name || "Document A" : docB.name || "Document B";
  const modifiedDoc = bLatest ? docB.name || "Document B" : docA.name || "Document A";

  // AI Insights Generation
  const aiInsights = [];
  aiInsights.push(`${newerDoc} appears to be the latest version (${confidence}% confidence).`);
  if (diffResult?.summary) {
    const { additions, removals, changes } = diffResult.summary;
    aiInsights.push(`Detected ${additions || 0} additions, ${removals || 0} removals, and ${changes || 0} modifications.`);
  }
  if (semanticResult?.overallSimilarity) {
    aiInsights.push(`Overall semantic similarity is ${semanticResult.overallSimilarity}%.`);
  }
  if (securityResult?.riskLevel && securityResult.riskLevel !== "None") {
    aiInsights.push(`Security risk flag: ${securityResult.riskLevel} tampering risk score (${securityResult.tamperScore}/100).`);
  }
  if (metaA.creator || metaB.creator) {
    aiInsights.push(`Metadata indicates software creation via ${metaB.creator || metaA.creator || "standard tools"}.`);
  }

  return {
    status: bLatest ? "Revision / Updated Copy" : "Previous / Superseded Copy",
    newerDoc,
    originalDoc,
    modifiedDoc,
    confidence,
    reasoning: reasons.length ? reasons : ["Analyzed line deltas and timestamp ordering heuristics."],
    aiInsights,
  };
}
