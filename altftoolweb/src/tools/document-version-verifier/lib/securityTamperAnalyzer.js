// Document Security & Tampering Analysis Module

export function analyzeSecurityAndTampering(docA, docB, hashesA, hashesB) {
  const flags = [];
  let tamperScore = 0; // 0 = Safe, 100 = High Risk

  // 1. Check exact hash match
  const hashesIdentical =
    hashesA.sha256 !== "N/A" &&
    hashesA.sha256 === hashesB.sha256;

  if (hashesIdentical) {
    return {
      hashesIdentical: true,
      tamperScore: 0,
      riskLevel: "None",
      flags: ["Hashes match perfectly (Byte-level identical)."],
      securityScore: 100,
      checks: {
        metadataTampered: false,
        authorMismatch: false,
        timestampAnomaly: false,
        missingPages: false,
        unexpectedObjects: false,
        hiddenText: false,
      },
    };
  }

  const metaA = docA.metadata || {};
  const metaB = docB.metadata || {};

  // 2. Metadata Tampering & Author Mismatch
  let metadataTampered = false;
  let authorMismatch = false;

  if (metaA.author && metaB.author && metaA.author !== metaB.author) {
    authorMismatch = true;
    tamperScore += 25;
    flags.push(`Author mismatch detected: '${metaA.author}' vs '${metaB.author}'`);
  }

  if (metaA.creator && metaB.creator && metaA.creator !== metaB.creator) {
    metadataTampered = true;
    tamperScore += 15;
    flags.push(`Creation software changed: '${metaA.creator}' → '${metaB.creator}'`);
  }

  // 3. Timestamp Anomaly Check (e.g. Created date later than Modified date)
  let timestampAnomaly = false;
  const createdDateA = metaA.createdDate ? new Date(metaA.createdDate) : null;
  const modifiedDateA = metaA.modifiedDate ? new Date(metaA.modifiedDate) : null;
  const createdDateB = metaB.createdDate ? new Date(metaB.createdDate) : null;
  const modifiedDateB = metaB.modifiedDate ? new Date(metaB.modifiedDate) : null;

  if (createdDateB && modifiedDateB && createdDateB > modifiedDateB) {
    timestampAnomaly = true;
    tamperScore += 30;
    flags.push("Suspicious timestamp anomaly: Document B creation date is AFTER modification date.");
  }

  if (createdDateA && createdDateB && createdDateB < createdDateA) {
    timestampAnomaly = true;
    tamperScore += 35;
    flags.push("Suspicious timestamp manipulation: Version B claims to be created BEFORE Version A.");
  }

  // 4. Missing pages / Sudden page drop
  let missingPages = false;
  if (metaA.pageCount && metaB.pageCount && metaB.pageCount < metaA.pageCount) {
    missingPages = true;
    tamperScore += 20;
    flags.push(`Page count reduced from ${metaA.pageCount} to ${metaB.pageCount}. Potential page removal.`);
  }

  // 5. Hidden text or zero-width character detection
  const hiddenText =
    /[\u200B-\u200D\uFEFF]/g.test(docA.text || "") ||
    /[\u200B-\u200D\uFEFF]/g.test(docB.text || "");
  if (hiddenText) {
    tamperScore += 25;
    flags.push("Zero-width hidden characters / steganographic markers detected in text layer.");
  }

  // 6. Unexpected embedded objects / Macros / Scripts
  const unexpectedObjects = Boolean(
    docB.metadata?.hasMacros ||
    docB.metadata?.hasEmbeddedScripts ||
    /script/i.test(docB.text || "") && !/script/i.test(docA.text || "")
  );

  if (unexpectedObjects) {
    tamperScore += 30;
    flags.push("Potential embedded scripts or unexpected dynamic macro objects detected in target document.");
  }

  const cappedTamperScore = Math.min(100, tamperScore);
  const securityScore = Math.max(0, 100 - cappedTamperScore);

  let riskLevel = "Low";
  if (cappedTamperScore >= 60) riskLevel = "Critical";
  else if (cappedTamperScore >= 35) riskLevel = "High";
  else if (cappedTamperScore >= 15) riskLevel = "Medium";

  return {
    hashesIdentical: false,
    tamperScore: cappedTamperScore,
    securityScore,
    riskLevel,
    flags,
    checks: {
      metadataTampered,
      authorMismatch,
      timestampAnomaly,
      missingPages,
      unexpectedObjects,
      hiddenText,
    },
  };
}
