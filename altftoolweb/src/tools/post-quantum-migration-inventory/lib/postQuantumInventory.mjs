export const PQ_INVENTORY_LIMITS = Object.freeze({
  maxCharacters: 250_000,
  maxLines: 12_000,
  maxObservations: 1_000,
});

export const PQ_INVENTORY_LIMITATIONS = Object.freeze([
  "This is a lexical inventory of pasted text. It does not parse keys or certificates cryptographically, connect to systems, validate implementations, negotiate TLS, or verify that an observed algorithm is active.",
  "A name match can be documentation, test data, a disabled suite, a dependency symbol, or a false positive; aliases, OIDs, generated code, binaries, and runtime-only use can be missed.",
  "The output is not a compliance determination, security verdict, migration deadline, quantum-readiness claim, or recommendation to replace algorithms without protocol and risk-owner review.",
]);

const FAMILY_DEFINITIONS = [
  {
    id: "rsa",
    label: "RSA / integer factorization",
    kind: "classical-public-key",
    pattern:
      /(?:^|[^A-Z0-9])RSA(?:ENCRYPTION)?(?:$|[^A-Z0-9])|WITHRSAENCRYPTION|1\.2\.840\.113549\.1\.1(?:\.|$)/i,
  },
  {
    id: "elliptic-curve",
    label: "Elliptic-curve cryptography",
    kind: "classical-public-key",
    pattern:
      /(?:^|[^A-Z0-9])(?:ECC|ECDSA|ECDHE?|ED25519|ED448|X25519|X448|PRIME256V1|SECP(?:256R1|256K1|384R1|521R1)|EC PUBLIC KEY)(?:$|[^A-Z0-9])/i,
  },
  {
    id: "dsa",
    label: "Finite-field DSA",
    kind: "classical-public-key",
    pattern:
      /(?:^|[^A-Z0-9_-])DSA(?:$|[^A-Z0-9_-])|1\.2\.840\.10040\.4\.1(?:\.|$)/i,
  },
  {
    id: "diffie-hellman",
    label: "Finite-field Diffie-Hellman",
    kind: "classical-public-key",
    pattern:
      /(?:^|[^A-Z0-9_-])(?:DH|DHE|DIFFIE[- ]HELLMAN)(?:$|[^A-Z0-9_-])|1\.2\.840\.113549\.1\.3\.1(?:\.|$)/i,
  },
  {
    id: "tls",
    label: "TLS protocol or cipher-suite context",
    kind: "protocol-context",
    pattern: /\bTLS(?:V?1[._][0-3]|_[A-Z0-9_]+|[- ]?1\.[0-3])?\b/i,
  },
  {
    id: "ml-kem",
    label: "ML-KEM / CRYSTALS-Kyber reference",
    kind: "post-quantum-reference",
    pattern: /\b(?:ML[-_ ]?KEM|CRYSTALS[-_ ]?KYBER|KYBER(?:512|768|1024)?)\b/i,
  },
  {
    id: "ml-dsa",
    label: "ML-DSA / CRYSTALS-Dilithium reference",
    kind: "post-quantum-reference",
    pattern: /\b(?:ML[-_ ]?DSA|CRYSTALS[-_ ]?DILITHIUM|DILITHIUM(?:2|3|5)?)\b/i,
  },
  {
    id: "slh-dsa",
    label: "SLH-DSA / SPHINCS+ reference",
    kind: "post-quantum-reference",
    pattern: /\b(?:SLH[-_ ]?DSA|SPHINCS\+?|SPHINCSPLUS)\b/i,
  },
  {
    id: "fn-dsa-falcon",
    label: "FN-DSA / FALCON reference",
    kind: "post-quantum-reference",
    pattern: /\b(?:FN[-_ ]?DSA|FALCON(?:512|1024)?)\b/i,
  },
  {
    id: "hqc",
    label: "HQC reference",
    kind: "post-quantum-reference",
    pattern: /\bHQC(?:[-_ ]?(?:128|192|256))?\b/i,
  },
];

const BASE_QUESTIONS = [
  {
    id: "owner-and-purpose",
    question:
      "Who owns each cryptographic use, and what purpose does it serve: key establishment, signature, certificate identity, code signing, storage, or another function?",
  },
  {
    id: "data-lifetime",
    question:
      "How long must the protected data remain confidential or the signature remain verifiable, and what threat model and business impact apply?",
  },
  {
    id: "runtime-evidence",
    question:
      "Which references are active at runtime, which are fallbacks or tests, and what deployment evidence can confirm that distinction?",
  },
  {
    id: "dependencies-and-interfaces",
    question:
      "Which protocols, libraries, hardware, certificates, partners, and managed services constrain algorithm changes or interoperability testing?",
  },
  {
    id: "crypto-agility",
    question:
      "Can algorithms, parameters, certificates, and key formats be replaced through a tested, reversible, and observable change process?",
  },
];

function countsByKind(observations) {
  return observations.reduce(
    (accumulator, observation) => {
      accumulator[observation.kind] += 1;
      return accumulator;
    },
    {
      "classical-public-key": 0,
      "protocol-context": 0,
      "post-quantum-reference": 0,
    },
  );
}

function familyCounts(observations) {
  return observations.reduce((accumulator, observation) => {
    accumulator[observation.family] =
      (accumulator[observation.family] || 0) + 1;
    return accumulator;
  }, {});
}

function buildQuestions(counts, observedFamilyCounts) {
  const families = new Set(Object.keys(observedFamilyCounts));
  const questions = [...BASE_QUESTIONS];
  if (families.has("rsa")) {
    questions.push({
      id: "rsa-surfaces",
      question:
        "For each RSA reference, is it used for encryption, key transport, signatures, certificates, or compatibility—and where are key sizes and lifecycle controlled?",
    });
  }
  if (
    families.has("elliptic-curve") ||
    families.has("diffie-hellman") ||
    families.has("dsa")
  ) {
    questions.push({
      id: "discrete-log-surfaces",
      question:
        "For elliptic-curve, DSA, or Diffie-Hellman references, which key agreement, signature, certificate, and protocol surfaces depend on them?",
    });
  }
  if (counts["protocol-context"] > 0) {
    questions.push({
      id: "tls-negotiation",
      question:
        "Which TLS versions, groups, signature schemes, certificate chains, peers, and fallback paths are actually negotiated in representative environments?",
    });
  }
  if (counts["post-quantum-reference"] > 0) {
    questions.push({
      id: "pqc-implementation-evidence",
      question:
        "Do post-quantum names refer to final standards, drafts, experiments, hybrids, or deployed implementations, and what validation and interoperability evidence exists?",
    });
  }
  return questions;
}

function assess(counts, observationCount) {
  if (observationCount === 0) {
    return {
      level: "empty",
      label: "No configured algorithm reference observed",
      description:
        "The limited text patterns found no inventory item. That does not show the system has no cryptography or is post-quantum ready.",
    };
  }
  if (counts["classical-public-key"] > 0) {
    return {
      level: "review",
      label: "Migration-inventory candidates observed",
      description:
        "Classical public-key references were found in the pasted text. Confirm their runtime purpose, ownership, data lifetime, dependencies, and replacement constraints.",
    };
  }
  return {
    level: "context",
    label: "Cryptographic context references observed",
    description:
      "Protocol or post-quantum names were found, but text presence alone cannot establish deployment, correct use, validation, or readiness.",
  };
}

export function inventoryPostQuantumReferences(input) {
  if (typeof input !== "string") {
    throw new TypeError("Inventory input must be text.");
  }
  if (input.length > PQ_INVENTORY_LIMITS.maxCharacters) {
    throw new RangeError(
      `Input exceeds the ${PQ_INVENTORY_LIMITS.maxCharacters.toLocaleString("en-US")}-character local limit.`,
    );
  }
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  if (lines.length > PQ_INVENTORY_LIMITS.maxLines) {
    throw new RangeError(
      `Input exceeds the ${PQ_INVENTORY_LIMITS.maxLines.toLocaleString("en-US")}-line local limit.`,
    );
  }

  const observations = [];
  const counts = {
    "classical-public-key": 0,
    "protocol-context": 0,
    "post-quantum-reference": 0,
  };
  const observedFamilyCounts = {};
  let observationCount = 0;
  let truncated = false;
  lines.forEach((line, index) => {
    FAMILY_DEFINITIONS.forEach((family) => {
      if (!family.pattern.test(line)) return;
      observationCount += 1;
      counts[family.kind] += 1;
      observedFamilyCounts[family.id] =
        (observedFamilyCounts[family.id] || 0) + 1;
      if (observations.length >= PQ_INVENTORY_LIMITS.maxObservations) {
        truncated = true;
        return;
      }
      observations.push({
        family: family.id,
        label: family.label,
        kind: family.kind,
        line: index + 1,
        evidence: "[matched reference hidden]",
      });
    });
  });

  const familyMetadata = Object.fromEntries(
    FAMILY_DEFINITIONS.filter((family) => observedFamilyCounts[family.id]).map(
      (family) => [
        family.id,
        { label: family.label, kind: family.kind },
      ],
    ),
  );
  return {
    observations,
    counts,
    familyCounts: observedFamilyCounts,
    familyMetadata,
    questions: buildQuestions(counts, observedFamilyCounts),
    stats: {
      charactersInspected: input.length,
      linesInspected: lines.length,
      observations: observationCount,
      displayedObservations: observations.length,
      uniqueFamilies: Object.keys(observedFamilyCounts).length,
    },
    assessment: assess(counts, observationCount),
    truncated,
    limitations: [...PQ_INVENTORY_LIMITATIONS],
  };
}

export function buildPostQuantumInventoryReport(result) {
  return {
    tool: "Post-Quantum Migration Inventory",
    scope: "Counts-only local lexical inventory",
    assessment: result.assessment.level,
    counts: { ...result.counts },
    familyCounts: { ...result.familyCounts },
    stats: { ...result.stats },
    migrationQuestionIds: result.questions.map((question) => question.id),
    truncated: Boolean(result.truncated),
    limitations: [...PQ_INVENTORY_LIMITATIONS],
  };
}
