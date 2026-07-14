// Pure helpers for bookmark data: validation, domain/favicon derivation,
// and parsing of browser (Netscape) bookmark HTML exports.

export function isValidUrl(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function getFavicon(url) {
  const domain = getDomain(url);
  if (!domain) return "";
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

export function formatDate(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

// Parse a Netscape bookmark HTML file (the format exported by Chrome/Firefox).
// Returns an array of { title, url, folder }.
export function parseNetscapeHtml(html) {
  const result = [];
  const folderStack = ["Imported"];
  const tokenRegex =
    /<DL>|<H3[^>]*>([^<]*)<\/H3>|<\/DL>|<A\s+([^>]*?)>([^<]*)<\/A>/gi;

  let m;
  while ((m = tokenRegex.exec(html)) !== null) {
    const token = m[0];
    if (token.toUpperCase().startsWith("<DL>")) {
      // opening group, ignored (folder name is pushed by the preceding <H3>)
    } else if (m[1] !== undefined) {
      folderStack.push(m[1].trim());
    } else if (token.toUpperCase().startsWith("</DL>")) {
      if (folderStack.length > 1) folderStack.pop();
    } else if (m[2] !== undefined) {
      const attr = m[2];
      const text = m[3];
      const hrefMatch = /HREF="([^"]+)"/i.exec(attr);
      if (hrefMatch && isValidUrl(hrefMatch[1])) {
        const folder = folderStack[folderStack.length - 1];
        result.push({
          title: (text || "").trim() || getDomain(hrefMatch[1]),
          url: hrefMatch[1].trim(),
          folder,
        });
      }
    }
  }
  return result;
}

// Detect whether raw text is a Netscape bookmark file vs JSON.
export function looksLikeBookmarkHtml(text) {
  return (
    /NETSCAPE-BOOKMARK-FILE-1/i.test(text) ||
    (/<DL>/i.test(text) && /<A\s/i.test(text))
  );
}
