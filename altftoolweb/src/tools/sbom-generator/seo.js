const seo = {
  title: "CycloneDX 1.7 SBOM Generator for npm Lockfiles",
  metaDescription:
    "Turn a package.json or package-lock.json into a CycloneDX 1.7 bom.cdx.json in your browser, each component carrying a pkg:npm purl.",
  steps: [
    "Paste a package.json, package-lock.json or npm-shrinkwrap.json into the 'Manifest or lockfile' box, or press 'Choose JSON' to load the file — the cap is 2,000,000 characters.",
    "Leave 'Add timestamp and random serial number' unticked for byte-identical output, then press 'Generate incomplete SBOM'.",
    "Check the Components, Resolved, Unresolved and Direct edges counts, then press 'Download bom.cdx.json' to save the CycloneDX 1.7 JSON.",
  ],
  intro:
    "This tool turns a package.json, package-lock.json or npm-shrinkwrap.json into a CycloneDX 1.7 JSON SBOM in the browser, emitting one library component per package with a pkg:npm purl, its declared license and its resolved version. It is aimed at developers who need a machine-readable bill of materials for a customer questionnaire, a procurement checklist or a CI artifact without uploading their dependency tree to a service. Every BOM it produces is marked compositions.aggregate = \"incomplete\", because it reports only what the file you pasted actually states.",
  useCases: [
    "A customer's security review asks for a CycloneDX SBOM before they will sign, and you need a valid bom.cdx.json for one npm package today rather than a build-pipeline integration",
    "You want to diff two SBOMs across releases to see exactly which packages and versions changed, and need output with no timestamp or serial number so the diff shows only real changes",
    "You are checking a lockfile from a third-party vendor and want the component list, declared licenses and direct-versus-transitive split without running npm install on code you do not trust",
  ],
  benefits: [
    ["Byte-stable output by default", "The default omit policy leaves out serialNumber and metadata.timestamp entirely, so re-running on an unchanged lockfile produces an identical file that diffs cleanly."],
    ["It states what it does not know", "Unresolved versions, unknown relationships and parse warnings are counted in the summary and written into the BOM as properties instead of being silently dropped."],
    ["Declared ranges kept separate from installed versions", "A caret range like ^2.0.0 is recorded as an altftool:npm:declaredRange property, never promoted into the component's version field."],
  ],
  faqs: [
    [
      "What CycloneDX version does it output?",
      "CycloneDX 1.7 JSON, declared with specVersion 1.7 and the bom-1.7 $schema URL, downloaded as bom.cdx.json with the application/vnd.cyclonedx+json media type. Each component is typed as a library and carries a pkg:npm purl, with scoped packages encoded as pkg:npm/@scope/name@version.",
    ],
    [
      "Why does the BOM say the composition is incomplete?",
      "Because a manifest or lockfile alone cannot prove the full installed tree. The output always sets compositions.aggregate to \"incomplete\" and records only root-to-direct dependency edges that the selected JSON states unambiguously — nested edges are not reconstructed by inference.",
    ],
    [
      "How big a lockfile can it handle?",
      "Up to 2,000,000 bytes of file input or 2,000,000 pasted characters, with a ceiling of 12,000 components and a dependency depth of 40. If a limit is hit the inventory is truncated and the BOM records altftool:inventoryLimitApplied as true rather than pretending the list is complete.",
    ],
    [
      "Is the SBOM signed or vulnerability-scanned?",
      "No — it records signatureStatus as \"not signed or attested\" and performs no CVE lookup. It is an inventory document; if your process requires attestation or vulnerability data, feed this BOM into a signing step and a scanner that maintains its own advisory database.",
    ],
  ],
};

export default seo;
