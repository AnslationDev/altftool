/**
 * Image reference parsing and digest pinning, per the OCI distribution spec
 * and github.com/distribution/reference:
 *
 *   reference := name [":" tag] ["@" algorithm ":" hex]
 *
 * A digest reference (name@sha256:<64 hex>) is IMMUTABLE — the registry
 * returns exactly that manifest forever — while tags (including "latest")
 * are mutable pointers. The runtime ignores the tag when a digest is
 * present, so `name:tag@digest` keeps the tag purely as a human label.
 *
 * Pure functions only. No network calls: the digest itself comes from the
 * user (docker buildx imagetools inspect / crane digest / docker images
 * --digests output).
 */

/** sha256 is the canonical OCI digest algorithm: 64 lowercase hex chars. */
export const SHA256_DIGEST_REGEX = /^sha256:[a-f0-9]{64}$/;

/** Loose digest shape for detecting any algorithm (sha512 etc.) in scans. */
const ANY_DIGEST_REGEX = /@[a-z0-9]+:[a-fA-F0-9]{32,}/;

/** Tag grammar per distribution/reference. */
const TAG_REGEX = /^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$/;

/**
 * Parse an image reference string into its parts.
 * Registry detection follows Docker's rule: the first path component is a
 * registry host only if it contains ".", ":" or equals "localhost".
 *
 * @returns {{registry, repository, tag, digest, implicitLatest}|{error}}
 */
export function parseImageReference(reference) {
  if (typeof reference !== "string" || reference.trim() === "") {
    return { error: "Enter an image reference." };
  }
  let rest = reference.trim();
  if (/\s/.test(rest)) return { error: "An image reference cannot contain spaces." };

  let digest = null;
  const atIndex = rest.indexOf("@");
  if (atIndex !== -1) {
    digest = rest.slice(atIndex + 1);
    rest = rest.slice(0, atIndex);
  }

  // The tag separator is the LAST ":" after the final "/", so registry ports
  // (localhost:5000/app) are not mistaken for tags.
  let tag = null;
  const lastSlash = rest.lastIndexOf("/");
  const lastColon = rest.lastIndexOf(":");
  if (lastColon > lastSlash) {
    tag = rest.slice(lastColon + 1);
    rest = rest.slice(0, lastColon);
  }

  let registry = "";
  let repository = rest;
  const firstSlash = rest.indexOf("/");
  if (firstSlash !== -1) {
    const first = rest.slice(0, firstSlash);
    if (first.includes(".") || first.includes(":") || first === "localhost") {
      registry = first;
      repository = rest.slice(firstSlash + 1);
    }
  }

  if (repository === "") return { error: "The reference has no repository name." };
  if (tag !== null && !TAG_REGEX.test(tag)) {
    return { error: `"${tag}" is not a valid tag (letters, digits, '_', '.', '-', max 128 chars).` };
  }
  if (digest !== null && !SHA256_DIGEST_REGEX.test(digest)) {
    return {
      error: `"${digest}" is not a valid digest — expected sha256: followed by exactly 64 lowercase hex characters.`,
    };
  }

  return {
    registry,
    repository,
    tag,
    digest,
    implicitLatest: tag === null && digest === null,
  };
}

/**
 * Pin a reference to a digest.
 *
 * @param {object} input
 * @param {string} input.reference  e.g. "nginx:1.27" or "ghcr.io/acme/api:v2".
 * @param {string} input.digest     e.g. "sha256:abc...". A leading "@" is tolerated.
 * @returns {{pinned, pinnedWithTag, parts}|{error}}
 *   pinned:        name@sha256:...            (canonical, tag dropped)
 *   pinnedWithTag: name:tag@sha256:...        (tag kept as a comment-like label)
 */
export function pinReference({ reference, digest }) {
  const parts = parseImageReference(reference);
  if (parts.error) return parts;

  const cleanDigest = typeof digest === "string" ? digest.trim().replace(/^@/, "").toLowerCase() : "";
  if (cleanDigest === "") {
    return { error: "Paste the image digest (get it with: docker buildx imagetools inspect <image>)." };
  }
  if (!SHA256_DIGEST_REGEX.test(cleanDigest)) {
    return {
      error:
        "That digest is malformed — it must be sha256: followed by exactly 64 hex characters (0-9, a-f).",
    };
  }
  if (parts.digest && parts.digest !== cleanDigest) {
    return {
      error: "The reference already contains a DIFFERENT digest — remove it or paste the matching one.",
    };
  }

  const name = `${parts.registry ? `${parts.registry}/` : ""}${parts.repository}`;
  const tagPart = parts.tag ?? "latest";
  return {
    pinned: `${name}@${cleanDigest}`,
    pinnedWithTag: `${name}:${tagPart}@${cleanDigest}`,
    parts,
  };
}

/** Line patterns that carry image references in common manifests. */
const LINE_PATTERNS = [
  // Dockerfile: FROM [--platform=x] <ref> [AS name]
  { kind: "Dockerfile FROM", regex: /^\s*FROM\s+(?:--platform=\S+\s+)?(\S+)/i, skip: /^(scratch)$/i },
  // Compose / Kubernetes: image: <ref>
  { kind: "image:", regex: /^\s*[-\s]*image:\s*["']?([^\s"'#]+)/, skip: null },
];

/**
 * Scan Dockerfile / compose / Kubernetes YAML text for image references and
 * classify each as pinned (digest), mutable tag, or implicit latest.
 *
 * @returns {{findings: [{line, kind, reference, status}], counts}|{error}}
 */
export function scanManifest(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Paste a Dockerfile, docker-compose.yml or Kubernetes manifest to scan." };
  }

  const findings = [];
  const lines = text.split("\n");
  lines.forEach((lineText, index) => {
    for (const { kind, regex, skip } of LINE_PATTERNS) {
      const match = lineText.match(regex);
      if (!match) continue;
      const ref = match[1];
      if (skip && skip.test(ref)) continue;
      // Skip Dockerfile references to earlier build stages (FROM builder).
      if (kind === "Dockerfile FROM" && /^\s*FROM\s+\S+\s+AS\s+(\S+)/i.test(lineText)) {
        // still a real image unless the ref names a previous stage; handled below
      }

      let status;
      if (ANY_DIGEST_REGEX.test(ref)) {
        status = SHA256_DIGEST_REGEX.test(ref.slice(ref.indexOf("@") + 1)) ? "pinned" : "pinned-other-algorithm";
      } else if (ref.includes(":") && ref.lastIndexOf(":") > ref.lastIndexOf("/")) {
        status = /:latest$/.test(ref) ? "latest" : "mutable-tag";
      } else {
        status = "implicit-latest";
      }
      findings.push({ line: index + 1, kind, reference: ref, status });
      break;
    }
  });

  // Dockerfile multi-stage: drop FROM refs that name an earlier stage alias.
  const stageNames = new Set();
  lines.forEach((lineText) => {
    const m = lineText.match(/^\s*FROM\s+(?:--platform=\S+\s+)?\S+\s+AS\s+(\S+)/i);
    if (m) stageNames.add(m[1].toLowerCase());
  });
  const filtered = findings.filter(
    (f) => !(f.kind === "Dockerfile FROM" && stageNames.has(f.reference.toLowerCase())),
  );

  if (filtered.length === 0) {
    return { error: "No image references found — the scanner looks for Dockerfile FROM lines and image: keys." };
  }

  const counts = { pinned: 0, mutable: 0, latest: 0 };
  for (const f of filtered) {
    if (f.status === "pinned" || f.status === "pinned-other-algorithm") counts.pinned += 1;
    else if (f.status === "mutable-tag") counts.mutable += 1;
    else counts.latest += 1; // "latest" and "implicit-latest"
  }

  return { findings: filtered, counts, total: filtered.length };
}
