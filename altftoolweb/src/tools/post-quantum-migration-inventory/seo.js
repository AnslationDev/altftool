const seo = {
  title: "Post-Quantum Migration Inventory: RSA to ML-KEM Scan",
  metaDescription:
    "Scan pasted code, config or certificate metadata for RSA, EC, DSA, DH, TLS and ML-KEM or ML-DSA names. Reports counts and line numbers, not the text.",
  steps: [
    "Paste code, configuration, logs or certificate metadata into 'Paste text to inventory' — capped at 250,000 characters — or press 'Load sample' to try it.",
    "Every line is matched by name against ten families: RSA, elliptic curve, DSA, Diffie-Hellman, TLS protocol context, and the NIST names ML-KEM, ML-DSA, SLH-DSA, FN-DSA and HQC.",
    "Read 'Observed families' and the 'Migration discovery questions' list, then press 'Counts-only JSON' to download post-quantum-migration-counts-only.json, which omits lines and source snippets.",
  ],
  intro:
    "The Post-Quantum Migration Inventory scans pasted code, configuration, or certificate metadata line by line for references to ten algorithm families — RSA, elliptic curve, DSA, Diffie-Hellman, TLS protocol context, and the NIST post-quantum names ML-KEM, ML-DSA, SLH-DSA, FN-DSA and HQC — and reports counts plus line numbers only, never the matched text itself. It is built for engineers and risk owners starting a quantum-readiness discovery pass, who need a first list of where classical public-key cryptography appears before anyone can plan a replacement. Each run also returns a set of migration questions (ownership and purpose, data lifetime, runtime evidence, dependencies, crypto-agility) that expand when RSA, discrete-log, TLS, or post-quantum references are actually found.",
  useCases: [
    "You have been handed a service's Terraform, nginx and Java config and asked which files touch RSA or ECDSA at all, so you can scope a quantum-readiness discovery ticket instead of guessing.",
    "A certificate inventory export lists signature and public-key algorithm fields, and you want a per-line count of rsaEncryption versus ECDSA entries to size how many chains need reissuing.",
    "A team claims it already ships ML-KEM, and you want to check whether the pasted config only names Kyber in a disabled experimental block before repeating that claim to an auditor.",
  ],
  benefits: [
    [
      "Counts, not copies",
      "Every match is stored as a family, kind and line number with the evidence string replaced by a placeholder, so a shared report never leaks the config it came from.",
    ],
    [
      "Classical and post-quantum in one pass",
      "Legacy RSA/EC/DSA/DH names and the FIPS 203/204/205 algorithm names are matched by the same run, so you see old and new references side by side.",
    ],
    [
      "Turns findings into next questions",
      "The result set grows conditional questions — RSA key-size and lifecycle, discrete-log surfaces, TLS negotiation, post-quantum implementation evidence — based on which families the scan actually hit.",
    ],
  ],
  faqs: [
    [
      "Does this prove my system is quantum-safe?",
      "No — it is a lexical inventory of text you paste, and the tool states this explicitly in its own limitations. It does not parse keys or certificates cryptographically, connect to any system, negotiate TLS, or confirm an algorithm is active at runtime, so a clean result never means a system has no cryptography.",
    ],
    [
      "How much can I paste at once?",
      "Up to 250,000 characters and 12,000 lines per run, with at most 1,000 individual observations shown; beyond that the total count keeps rising but the displayed list is marked truncated. Larger estates are best scanned file by file or directory by directory.",
    ],
    [
      "Which post-quantum algorithms does it recognise?",
      "Five families: ML-KEM (CRYSTALS-Kyber, including Kyber-512/768/1024), ML-DSA (CRYSTALS-Dilithium 2/3/5), SLH-DSA (SPHINCS+), FN-DSA (Falcon-512/1024) and HQC at its 128/192/256 parameter sets. These map to the NIST FIPS 203, 204 and 205 standards plus the later HQC selection.",
    ],
    [
      "Why does it flag a line that is only a comment or a test fixture?",
      "Because matching is by name, not by execution: documentation, test data, disabled cipher suites and dependency symbols all look identical to a live setting in plain text. Treat every hit as a candidate to confirm, and expect misses too — aliases, OIDs, generated code and binaries can slip past. Deployment decisions still need protocol and risk-owner review.",
    ],
  ],
};

export default seo;
