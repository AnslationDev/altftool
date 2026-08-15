const seo = {
  title: "C2PA Content Credentials Checker for JPEG, PNG",
  metaDescription:
    "Inspect the C2PA JUMBF box tree in a JPEG, PNG, MP4 or .c2pa file locally. Counts manifests, claims and signatures — it does not verify them.",
  steps: [
    "Pick a file under \"Local media or manifest\" — JPEG, PNG, MP4, M4A, MOV, AVIF, HEIC, HEIF or .c2pa, maximum 24 MB.",
    "Press \"Inspect structure\" to walk the JUMBF box tree and match the C2PA UUIDs for manifest stores, assertion stores, claim boxes and claim-signature boxes.",
    "Read the per-box tallies, then use \"Export counts only\" to download c2pa-structure-counts.json, which omits the filename, media bytes and claim values.",
  ],
  intro:
    "This inspector reads a file's C2PA Content Credentials container structure locally — the JPEG APP11 JUMBF fragments, the PNG caBX chunk, the BMFF uuid box carrying UUID d8fec3d6-1b0e-483c-9297-5828877ec481, or a standalone .c2pa store — and reports what JUMBF boxes are actually present. It walks the box tree, matches the C2PA UUIDs for the manifest store, standard and update manifests, assertion store, claim and signature, and counts them. It deliberately stops at structure: no COSE signature is verified, no CBOR claim is decoded, no trust list is consulted, so it tells you what shape the credential data is in, never whether it is authentic.",
  useCases: [
    "An image arrives claiming Content Credentials and you want to know whether an embedded manifest store is actually there before spending time on a full validator",
    "Your export pipeline is supposed to be attaching credentials and you need to see whether the manifest survived a resize, a re-encode or a CDN pass",
    "You are debugging a C2PA writer and the box tree looks wrong — a claim without a signature box, a mislabelled JUMBF description, or an update manifest that is not the final top-level box",
  ],
  benefits: [
    [
      "Four embedding paths, one report",
      "JPEG APP11 fragment sequences, PNG caBX chunks, BMFF uuid boxes and bare .c2pa JUMBF stores are all parsed, including fragment ordering and orphan detection.",
    ],
    [
      "Named box counts, not a pass/fail badge",
      "You get separate tallies for standard manifests, legacy manifests, update manifests, assertion stores, claim boxes, signature boxes and compressed content boxes, plus the box depth reached.",
    ],
    [
      "Honest about what it did not do",
      "Every result carries explicit flags marking signature verification, asset binding, trust-list evaluation, signer identity, edit history and AI-use determination as not performed.",
    ],
  ],
  faqs: [
    [
      "Does this prove a photo is real or that it was not AI-generated?",
      "No. It reports container structure only, and a readable C2PA-shaped store establishes nothing about authenticity, integrity, signer identity, edit history or whether AI was involved. The result explicitly records cryptographicSignatureVerified, assetBindingVerified, trustListEvaluated and aiUseDetermined as false — use a full C2PA validator for those questions.",
    ],
    [
      "What does it mean if no credentials are found?",
      "Only that no embedded store was observed in the bytes it parsed. Credentials may never have been added, may have been stripped by an editor or upload pipeline, may live in an external or sidecar manifest that is not fetched here, or may use an embedding this inspector does not support. Absence is not evidence of tampering.",
    ],
    [
      "Which files can I inspect, and how large?",
      "JPEG, PNG, MP4, M4A, MOV, AVIF, HEIC, HEIF and .c2pa files, up to 24 MB, with the manifest store itself bounded at 8 MB. Parsing is capped at 4096 JUMBF boxes, 16 levels of nesting, 512 JPEG segments and 2048 PNG chunks so a malformed file cannot stall the page.",
    ],
    [
      "Does anything about my file leave the browser?",
      "No, and the exportable report is counts-only by design. It omits the filename, the media bytes, the raw manifest, any claim or assertion values, and arbitrary labels — it carries only file size, container format and structural tallies under the schema altftool.c2pa-structure-counts.v1.",
    ],
  ],
};

export default seo;
