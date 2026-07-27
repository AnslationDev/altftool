/**
 * Joining a base URL with path segments.
 *
 * There are two different operations that people call "joining a URL", and mixing
 * them up is the source of most broken API clients.
 *
 *  1. REFERENCE RESOLUTION, defined by RFC 3986 section 5 and implemented by the
 *     WHATWG URL parser (`new URL(reference, base)`), by fetch, and by every HTTP
 *     client that follows a redirect. Its rules are deliberately not intuitive:
 *
 *       - A reference that starts with "/" is a path-absolute reference. It REPLACES
 *         the whole base path. new URL("/v2/users", "https://api.example.com/v1/")
 *         gives https://api.example.com/v2/users — the /v1 prefix is gone.
 *       - A relative reference is merged against the base path with the last segment
 *         of the base removed, per section 5.3. So a base of ".../v1" (no trailing
 *         slash) resolves "users" to ".../users", while ".../v1/" resolves it to
 *         ".../v1/users". One character changes the answer.
 *       - The base query string is discarded unless the reference is empty.
 *       - Dot segments are removed by the algorithm in section 5.2.4.
 *
 *  2. PATH CONCATENATION, which is what people usually mean: keep the whole base,
 *     including its path prefix, and stick the segments on the end with exactly one
 *     slash between them. This is what path.posix.join or a "urljoin" helper does.
 *
 * This module computes both, and reports where they disagree and why.
 *
 * Other rules applied:
 *
 *  - RFC 3986 section 2.2 lists the reserved characters and section 2.3 the
 *    unreserved set (ALPHA / DIGIT / "-" / "." / "_" / "~"). Anything outside the
 *    unreserved set and the sub-delims permitted in a path segment should be
 *    percent-encoded before it goes into a path.
 *  - RFC 3986 section 3.5: a fragment is never sent to the server, and only one
 *    fragment can exist in a URL.
 *
 * Everything here is pure.
 */

/** Schemes this tool will build a URL for. */
export const SUPPORTED_SCHEMES = ["http:", "https:", "ws:", "wss:", "ftp:", "file:"];

/** How duplicate query keys from the base and the segments are combined. */
export const QUERY_MERGE_MODES = [
  { id: "override", label: "Later value wins" },
  { id: "append", label: "Keep both (repeat the key)" },
  { id: "baseWins", label: "Base value wins" },
];

/**
 * RFC 3986 section 5.2.4, "Remove Dot Segments", implemented literally.
 *
 * @param {string} path
 * @returns {string}
 */
export function removeDotSegments(path) {
  let input = String(path ?? "");
  let output = "";

  // The loop is bounded by the input shrinking on every branch.
  while (input.length > 0) {
    if (input.startsWith("../")) {
      input = input.slice(3);
    } else if (input.startsWith("./")) {
      input = input.slice(2);
    } else if (input.startsWith("/./")) {
      input = `/${input.slice(3)}`;
    } else if (input === "/.") {
      input = "/";
    } else if (input.startsWith("/../")) {
      input = `/${input.slice(4)}`;
      output = output.slice(0, Math.max(0, output.lastIndexOf("/")));
    } else if (input === "/..") {
      input = "/";
      output = output.slice(0, Math.max(0, output.lastIndexOf("/")));
    } else if (input === "." || input === "..") {
      input = "";
    } else {
      // Move the first segment — the leading "/" plus everything up to the next "/".
      const nextSlash = input.indexOf("/", input.startsWith("/") ? 1 : 0);
      const segment = nextSlash === -1 ? input : input.slice(0, nextSlash);
      output += segment;
      input = nextSlash === -1 ? "" : input.slice(nextSlash);
    }
  }

  return output;
}

/**
 * Split a raw string into its path, query and fragment parts.
 * @param {string} raw
 */
export function splitParts(raw) {
  const text = String(raw ?? "");
  const hashAt = text.indexOf("#");
  const withoutHash = hashAt === -1 ? text : text.slice(0, hashAt);
  const fragment = hashAt === -1 ? "" : text.slice(hashAt + 1);
  const queryAt = withoutHash.indexOf("?");
  return {
    path: queryAt === -1 ? withoutHash : withoutHash.slice(0, queryAt),
    query: queryAt === -1 ? "" : withoutHash.slice(queryAt + 1),
    fragment,
  };
}

/** Characters that are legal unencoded inside a path segment, per RFC 3986. */
const SAFE_SEGMENT = /^[A-Za-z0-9\-._~!$&'()*+,;=:@%]*$/;

/**
 * Merge query strings in document order.
 *
 * @param {string[]} queries raw query strings, base first
 * @param {"override"|"append"|"baseWins"} mode
 * @returns {{ query:string, duplicates:string[] }}
 */
export function mergeQueries(queries, mode = "override") {
  const seen = new Map();
  const order = [];
  const duplicates = [];
  const appended = [];

  queries
    .filter((raw) => String(raw ?? "").length > 0)
    .forEach((raw) => {
      String(raw)
        .split("&")
        .filter((pair) => pair.length > 0)
        .forEach((pair) => {
          const eq = pair.indexOf("=");
          const key = eq === -1 ? pair : pair.slice(0, eq);
          const value = eq === -1 ? null : pair.slice(eq + 1);

          if (mode === "append") {
            appended.push(pair);
            if (seen.has(key)) duplicates.push(key);
            seen.set(key, value);
            return;
          }

          if (seen.has(key)) {
            duplicates.push(key);
            if (mode === "override") seen.set(key, value);
            return;
          }
          seen.set(key, value);
          order.push(key);
        });
    });

  const query =
    mode === "append"
      ? appended.join("&")
      : order.map((key) => (seen.get(key) === null ? key : `${key}=${seen.get(key)}`)).join("&");

  return { query, duplicates: [...new Set(duplicates)] };
}

/**
 * Join a base URL with a list of path segments.
 *
 * @param {{ base:string, segments:string[], keepTrailingSlash?:boolean,
 *           encodeSegments?:boolean, queryMode?:string }} input
 * @returns {object} result, or { error }
 */
export function joinUrl({
  base,
  segments = [],
  keepTrailingSlash = false,
  encodeSegments = false,
  queryMode = "override",
} = {}) {
  const rawBase = String(base ?? "").trim();
  if (!rawBase) return { error: "Enter a base URL, for example https://api.example.com/v1/." };

  let parsedBase;
  try {
    parsedBase = new URL(rawBase);
  } catch {
    return {
      error:
        "That base is not an absolute URL. It needs a scheme and a host, such as https://api.example.com/v1/.",
    };
  }
  if (!SUPPORTED_SCHEMES.includes(parsedBase.protocol)) {
    return { error: `The scheme "${parsedBase.protocol}" is not one this joiner handles.` };
  }

  const parts = segments
    .map((segment) => String(segment ?? "").trim())
    .filter((segment) => segment.length > 0);

  const notes = [];
  const warnings = [];

  // ---- Safe concatenation: the base path is always preserved. ----
  const basePieces = splitParts(parsedBase.pathname + parsedBase.search + parsedBase.hash);
  const queries = [basePieces.query];
  let fragment = basePieces.fragment;
  const pathPieces = [basePieces.path];

  parts.forEach((segment, index) => {
    const piece = splitParts(segment);
    if (piece.query) queries.push(piece.query);
    if (piece.fragment) {
      if (fragment && piece.fragment !== fragment) {
        warnings.push(
          `Segment ${index + 1} carries a second fragment. A URL can only have one, so "#${piece.fragment}" replaces "#${fragment}".`,
        );
      }
      fragment = piece.fragment;
    }
    if (piece.path.startsWith("/")) {
      notes.push(
        `Segment ${index + 1} starts with "/". Concatenation keeps the base path anyway; RFC 3986 reference resolution would throw the base path away.`,
      );
    }
    let cleaned = piece.path.replace(/^\/+/, "");
    if (encodeSegments) {
      cleaned = cleaned
        .split("/")
        .map((part) => encodeURIComponent(decodeURIComponent(part)))
        .join("/");
    } else if (!SAFE_SEGMENT.test(cleaned.replace(/\//g, ""))) {
      warnings.push(
        `Segment ${index + 1} contains characters that are not legal unencoded in a path. Turn on percent-encoding or encode it yourself.`,
      );
    }
    if (cleaned) pathPieces.push(cleaned);
  });

  const wantsTrailing =
    keepTrailingSlash ||
    (parts.length === 0 ? basePieces.path.endsWith("/") : parts[parts.length - 1].endsWith("/"));

  let joinedPath = pathPieces
    .join("/")
    .replace(/\/{2,}/g, "/");
  joinedPath = removeDotSegments(joinedPath.startsWith("/") ? joinedPath : `/${joinedPath}`);
  if (joinedPath === "") joinedPath = "/";
  if (wantsTrailing && !joinedPath.endsWith("/")) joinedPath += "/";
  if (!wantsTrailing && joinedPath.length > 1 && joinedPath.endsWith("/")) {
    joinedPath = joinedPath.slice(0, -1);
  }

  const merged = mergeQueries(queries, queryMode);
  if (merged.duplicates.length > 0) {
    notes.push(
      `Query key${merged.duplicates.length === 1 ? "" : "s"} ${merged.duplicates
        .map((key) => `"${key}"`)
        .join(", ")} appeared more than once — resolved by "${
        QUERY_MERGE_MODES.find((entry) => entry.id === queryMode)?.label ?? queryMode
      }".`,
    );
  }

  // `origin` is the string "null" for opaque origins such as file:, so rebuild it.
  const origin =
    parsedBase.origin && parsedBase.origin !== "null"
      ? parsedBase.origin
      : `${parsedBase.protocol}//${parsedBase.host}`;

  const joined =
    `${origin}${joinedPath}` +
    (merged.query ? `?${merged.query}` : "") +
    (fragment ? `#${fragment}` : "");

  // ---- Reference resolution: what fetch and the WHATWG URL parser would do. ----
  // The segments are first flattened into one relative reference. A segment that
  // begins with "/" restarts the reference, which is exactly the behaviour that
  // makes it discard the base path.
  const reference = parts.reduce((accumulator, segment) => {
    if (!accumulator) return segment;
    if (segment.startsWith("/")) return segment;
    return accumulator.endsWith("/") ? `${accumulator}${segment}` : `${accumulator}/${segment}`;
  }, "");

  let resolved = null;
  let resolutionError = "";
  try {
    // With nothing to resolve, the answer is simply the normalised base. Passing an
    // empty reference would follow RFC 3986 section 5.3 and drop the base fragment,
    // which is not what "no segments" means here.
    resolved = parts.length === 0 ? new URL(rawBase).toString() : new URL(reference, rawBase).toString();
  } catch {
    resolutionError = "One of the segments is not a valid URL reference.";
  }

  const differs = Boolean(resolved) && resolved !== joined;

  const reasons = [];
  if (differs) {
    if (parts.some((segment) => segment.startsWith("/"))) {
      reasons.push(
        "A segment begins with \"/\", which makes it a path-absolute reference. RFC 3986 section 5.2.2 replaces the entire base path with it.",
      );
    }
    if (!basePieces.path.endsWith("/") && parts.length > 0 && !parts[0].startsWith("/")) {
      reasons.push(
        "The base path has no trailing slash. RFC 3986 section 5.3 drops everything after the last \"/\" of the base before merging, so the last base segment is lost.",
      );
    }
    if (basePieces.query && parts.length > 0) {
      reasons.push(
        "The base carries a query string. Reference resolution discards it unless the reference is empty; concatenation keeps and merges it.",
      );
    }
    if (basePieces.fragment && parts.length > 0) {
      reasons.push(
        "The base carries a fragment. RFC 3986 section 5.3 takes the fragment from the reference, so the base fragment is dropped on resolution.",
      );
    }
    if (reasons.length === 0) {
      reasons.push(
        "Dot segments, a duplicate slash or a trailing-slash difference changed the result. Compare the two paths character by character.",
      );
    }
  }

  return {
    base: rawBase,
    origin,
    reference,
    basePath: basePieces.path,
    segments: parts,
    joined,
    joinedPath,
    query: merged.query,
    fragment,
    resolved,
    resolutionError,
    differs,
    reasons,
    notes,
    warnings,
  };
}

export default joinUrl;
