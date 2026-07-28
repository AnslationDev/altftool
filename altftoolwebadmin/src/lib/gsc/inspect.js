// altftoolwebadmin/src/lib/gsc/inspect.js
//
// Pure normalisation + issue detection for the URL Inspection API
// (searchconsole.googleapis.com/v1/urlInspection/index:inspect).
// Turns Google's nested result into a flat, UI-friendly shape and a clear list
// of indexing / canonical / coverage / crawl issues. No network, fully testable.

const PASS = "PASS";

function cap(value = "") {
  return String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * @param result  the API's `inspectionResult` object (or the full response).
 * @param inspectedUrl the URL that was inspected.
 */
export function normalizeInspection(result = {}, inspectedUrl = "") {
  const r = result?.inspectionResult || result || {};
  const idx = r.indexStatusResult || {};
  const mobile = r.mobileUsabilityResult || {};
  const rich = r.richResultsResult || {};
  const amp = r.ampResult || {};

  const userCanonical = idx.userCanonical || "";
  const googleCanonical = idx.googleCanonical || "";
  const canonicalMismatch =
    Boolean(userCanonical && googleCanonical && userCanonical !== googleCanonical);

  const coverage = idx.coverageState || "";
  const indexed = idx.verdict === PASS && /indexed/i.test(coverage) && !/not\s+indexed/i.test(coverage);

  const issues = [];

  if (idx.verdict && idx.verdict !== PASS) {
    issues.push({ type: "indexing", severity: "blocker", label: `Not indexed — ${idx.coverageState || cap(idx.verdict)}` });
  } else if (!indexed && idx.coverageState) {
    issues.push({ type: "indexing", severity: "warning", label: idx.coverageState });
  }

  if (canonicalMismatch) {
    issues.push({
      type: "canonical",
      severity: "warning",
      label: "Google picked a different canonical than you declared",
    });
  }

  if (/disallow/i.test(idx.robotsTxtState || "")) {
    issues.push({ type: "robots", severity: "blocker", label: "Blocked by robots.txt" });
  }
  if (/blocked|noindex/i.test(idx.indexingState || "")) {
    issues.push({ type: "noindex", severity: "blocker", label: `Indexing blocked — ${cap(idx.indexingState)}` });
  }
  if (idx.pageFetchState && idx.pageFetchState !== "SUCCESSFUL") {
    issues.push({ type: "fetch", severity: "warning", label: `Fetch problem — ${cap(idx.pageFetchState)}` });
  }
  if (mobile.verdict && mobile.verdict !== PASS && mobile.verdict !== "VERDICT_UNSPECIFIED") {
    issues.push({ type: "mobile", severity: "warning", label: "Mobile usability issues" });
  }

  return {
    url: inspectedUrl,
    verdict: idx.verdict || "VERDICT_UNSPECIFIED",
    indexed,
    coverageState: idx.coverageState || "Unknown",
    robotsTxtState: idx.robotsTxtState || "",
    indexingState: idx.indexingState || "",
    pageFetchState: idx.pageFetchState || "",
    lastCrawlTime: idx.lastCrawlTime || null,
    crawledAs: idx.crawledAs || "",
    canonical: { user: userCanonical, google: googleCanonical, mismatch: canonicalMismatch },
    sitemaps: idx.sitemap || [],
    referringUrls: idx.referringUrls || [],
    mobileVerdict: mobile.verdict || "",
    richResultsVerdict: rich.verdict || "",
    ampVerdict: amp.verdict || "",
    issues,
    healthy: issues.length === 0 && indexed,
  };
}

/** Deep link to the Search Console URL Inspection tool (manual "Request indexing"). */
export function inspectionUiUrl(siteUrl = "", inspectedUrl = "") {
  const resource = siteUrl.startsWith("sc-domain:")
    ? `sc-domain:${siteUrl.replace(/^sc-domain:/, "")}`
    : siteUrl;
  const params = new URLSearchParams({ resource_id: resource });
  if (inspectedUrl) params.set("inspect_url", inspectedUrl);
  return `https://search.google.com/search-console/inspect?${params.toString()}`;
}
