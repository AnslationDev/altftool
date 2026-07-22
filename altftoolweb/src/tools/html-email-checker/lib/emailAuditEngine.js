// Deterministic, rule-based email HTML auditor. Every issue below is
// produced by a fixed check against the actual markup (string search or
// DOMParser query) — nothing here is random or placeholder data. Add new
// checks by pushing another entry onto RULES; each rule is independent and
// self-contained so a future backend-powered check (e.g. a real spam-filter
// API) can plug in the same Issue shape without touching the UI.

const CATEGORY_WEIGHTS = {
  structure: 0.2,
  css: 0.15,
  accessibility: 0.2,
  performance: 0.15,
  compatibility: 0.2,
  responsive: 0.1,
};

const SEVERITY_PENALTY = { error: 18, warning: 9, info: 3 };
const CLIENT_PENALTY = 14;

const CLIENTS = ["gmail", "outlook", "appleMail", "yahoo"];
const CLIENT_LABELS = { gmail: "Gmail", outlook: "Outlook", appleMail: "Apple Mail", yahoo: "Yahoo Mail" };

// Well-documented, widely cited email-client CSS support gaps (see caniemail.com
// for the same facts). Outlook desktop renders with the Word engine, which is
// why it lags so far behind on modern CSS.
const CSS_SUPPORT_MATRIX = [
  {
    id: "flexbox",
    label: "Flexbox (display:flex)",
    test: (css) => /display\s*:\s*flex/i.test(css),
    unsupported: ["outlook", "yahoo"],
  },
  {
    id: "grid",
    label: "CSS Grid (display:grid)",
    test: (css) => /display\s*:\s*grid/i.test(css),
    unsupported: ["outlook", "gmail", "yahoo", "appleMail"],
  },
  {
    id: "position",
    label: "position:fixed / position:absolute",
    test: (css) => /position\s*:\s*(fixed|absolute)/i.test(css),
    unsupported: ["outlook", "gmail"],
  },
  {
    id: "animations",
    label: "CSS animations (@keyframes / animation)",
    test: (css) => /@keyframes|animation\s*:/i.test(css),
    unsupported: ["outlook", "gmail", "yahoo"],
  },
  {
    id: "css-variables",
    label: "CSS variables (var(--x))",
    test: (css) => /var\(\s*--/i.test(css),
    unsupported: ["outlook", "yahoo"],
  },
  {
    id: "media-queries",
    label: "Media queries (@media)",
    test: (css) => /@media/i.test(css),
    unsupported: ["outlook"],
  },
  {
    id: "transform",
    label: "CSS transforms",
    test: (css) => /transform\s*:/i.test(css),
    unsupported: ["outlook", "gmail"],
  },
  {
    id: "gradient",
    label: "Gradient backgrounds",
    test: (css) => /(linear|radial)-gradient\(/i.test(css),
    unsupported: ["outlook"],
  },
];

function bytesOf(str) {
  return new Blob([str]).size;
}

function collectCss(doc, html) {
  const styleBlocks = Array.from(doc.querySelectorAll("style")).map((s) => s.textContent || "");
  const inlineStyles = Array.from(doc.querySelectorAll("[style]")).map((el) => el.getAttribute("style") || "");
  return [...styleBlocks, ...inlineStyles].join("\n") + "\n" + html;
}

function makeIssue(rule, overrides = {}) {
  return {
    id: `${rule.id}-${overrides.suffix ?? "0"}`,
    ruleId: rule.id,
    category: rule.category,
    severity: overrides.severity ?? rule.severity,
    title: overrides.title ?? rule.title,
    explanation: overrides.explanation ?? rule.explanation,
    why: rule.why,
    fix: rule.fix,
    example: rule.example,
    clients: overrides.clients ?? rule.clients ?? [],
  };
}

// Each rule's `run(ctx)` returns an array of issues (often 0 or 1, sometimes
// one per offending element). `ctx` is built once per audit in buildContext().
const RULES = [
  {
    id: "missing-doctype",
    category: "structure",
    severity: "warning",
    title: "Missing DOCTYPE declaration",
    explanation: "No <!DOCTYPE html> declaration was found at the top of the document.",
    why: "Without a doctype, Outlook's Word rendering engine and some webmail clients can fall back to quirks mode, causing inconsistent spacing and table sizing.",
    fix: "Add a doctype as the very first line of the document.",
    example: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
    run: (ctx) => (!ctx.rawLower.includes("<!doctype") ? [makeIssue(RULES_BY_ID.get("missing-doctype"))] : []),
  },
  {
    id: "missing-html-tag",
    category: "structure",
    severity: "error",
    title: "Missing <html> tag",
    explanation: "No <html> tag was found in the source.",
    why: "Every email should be wrapped in a proper <html> root element so clients that respect standard parsing (Apple Mail, Yahoo) apply the lang/xmlns attributes correctly.",
    fix: "Wrap the document in <html lang=\"en\">...</html>.",
    example: '<html lang="en" xmlns="http://www.w3.org/1999/xhtml">',
    run: (ctx) => (!/<html[\s>]/i.test(ctx.raw) ? [makeIssue(RULES_BY_ID.get("missing-html-tag"))] : []),
  },
  {
    id: "missing-head-tag",
    category: "structure",
    severity: "warning",
    title: "Missing <head> tag",
    explanation: "No <head> section was found.",
    why: "The <head> is where the preheader meta, <style> blocks and viewport/color-scheme meta tags live — omitting it forces everything into the body.",
    fix: "Add a <head> section containing at minimum a <meta charset> and <title>.",
    example: '<head>\n  <meta charset="utf-8" />\n  <title>Email subject</title>\n</head>',
    run: (ctx) => (!/<head[\s>]/i.test(ctx.raw) ? [makeIssue(RULES_BY_ID.get("missing-head-tag"))] : []),
  },
  {
    id: "missing-body-tag",
    category: "structure",
    severity: "error",
    title: "Missing <body> tag",
    explanation: "No <body> tag was found.",
    why: "Some clients strip or mis-render content that isn't inside a <body> element.",
    fix: "Wrap all visible content in a <body> element.",
    example: '<body style="margin:0;padding:0;">...</body>',
    run: (ctx) => (!/<body[\s>]/i.test(ctx.raw) ? [makeIssue(RULES_BY_ID.get("missing-body-tag"))] : []),
  },
  {
    id: "duplicate-ids",
    category: "structure",
    severity: "warning",
    title: "Duplicate id attributes",
    explanation: "The same id attribute is used on more than one element.",
    why: "Duplicate ids are invalid HTML and can break anchor links, dark-mode CSS targeting and any JS-driven webmail client features tied to ids.",
    fix: "Make every id unique, or switch to class names for styling hooks.",
    run: (ctx) => {
      const seen = new Map();
      ctx.doc.querySelectorAll("[id]").forEach((el) => {
        const id = el.getAttribute("id");
        seen.set(id, (seen.get(id) || 0) + 1);
      });
      const dupes = [...seen.entries()].filter(([, count]) => count > 1);
      if (!dupes.length) return [];
      return [
        makeIssue(RULES_BY_ID.get("duplicate-ids"), {
          explanation: `Duplicate id(s) found: ${dupes.map(([id, count]) => `"${id}" (×${count})`).join(", ")}.`,
        }),
      ];
    },
  },
  {
    id: "empty-elements",
    category: "structure",
    severity: "info",
    title: "Empty elements with no content",
    explanation: "Elements with no text, no children and no attributes were found.",
    why: "Truly empty elements are usually leftovers from editing and add dead weight to the HTML for no visual benefit.",
    fix: "Remove empty elements, or add the content/attributes they were meant to hold.",
    run: (ctx) => {
      const empty = Array.from(ctx.doc.querySelectorAll("div, span, p, td")).filter(
        (el) => !el.textContent.trim() && el.children.length === 0 && el.attributes.length === 0,
      );
      if (!empty.length) return [];
      return [
        makeIssue(RULES_BY_ID.get("empty-elements"), {
          explanation: `${empty.length} empty element(s) with no content or attributes found (e.g. <${empty[0].tagName.toLowerCase()}></${empty[0].tagName.toLowerCase()}>).`,
        }),
      ];
    },
  },
  {
    id: "invalid-nesting",
    category: "structure",
    severity: "error",
    title: "Table rows/cells outside a <table>",
    explanation: "A <tr> or <td> was found without a <table> ancestor.",
    why: "Browsers and email clients auto-correct this differently — Outlook in particular can render orphaned rows/cells as unstyled plain text.",
    fix: "Make sure every <tr> is inside a <table>/<tbody> and every <td>/<th> is inside a <tr>.",
    run: (ctx) => {
      const orphanRows = Array.from(ctx.doc.querySelectorAll("tr")).filter((tr) => !tr.closest("table"));
      const orphanCells = Array.from(ctx.doc.querySelectorAll("td, th")).filter((td) => !td.closest("tr"));
      if (!orphanRows.length && !orphanCells.length) return [];
      return [
        makeIssue(RULES_BY_ID.get("invalid-nesting"), {
          explanation: `${orphanRows.length} <tr> and ${orphanCells.length} <td>/<th> found without a proper table/row ancestor.`,
        }),
      ];
    },
  },
  {
    id: "deprecated-tags",
    category: "structure",
    severity: "info",
    title: "Deprecated HTML tags",
    explanation: "Deprecated tags were found.",
    why: "<font> and <center> are deprecated in HTML5 but still commonly used intentionally in email for Outlook compatibility, so this is informational rather than an error. <marquee> and <blink> have no email-client benefit and should simply be removed.",
    fix: "Prefer inline CSS equivalents where every target client supports them; keep <font>/<center> only as an intentional Outlook fallback.",
    run: (ctx) => {
      const found = ["font", "center", "marquee", "blink", "strike", "acronym", "applet"].filter((tag) =>
        ctx.doc.querySelector(tag),
      );
      if (!found.length) return [];
      const hasBadOnes = found.some((t) => ["marquee", "blink", "acronym", "applet"].includes(t));
      return [
        makeIssue(RULES_BY_ID.get("deprecated-tags"), {
          severity: hasBadOnes ? "warning" : "info",
          explanation: `Deprecated tag(s) found: ${found.map((t) => `<${t}>`).join(", ")}.`,
        }),
      ];
    },
  },
  {
    id: "deprecated-css",
    category: "css",
    severity: "warning",
    title: "Deprecated or IE-only CSS",
    explanation: "CSS using old IE-only features (filter/expression/zoom) was found.",
    why: "These properties never worked outside old Internet Explorer and are pure dead weight in modern email HTML.",
    fix: "Remove filter:progid(...), CSS expression() and zoom declarations entirely.",
    run: (ctx) => {
      const hit = /filter\s*:\s*progid|expression\s*\(|zoom\s*:/i.test(ctx.css);
      return hit ? [makeIssue(RULES_BY_ID.get("deprecated-css"))] : [];
    },
  },
  {
    id: "external-stylesheet",
    category: "css",
    severity: "error",
    title: "External stylesheet linked",
    explanation: "A <link rel=\"stylesheet\"> or @import was found.",
    why: "Most email clients (Gmail, Outlook.com, Yahoo) strip <link> tags and @import entirely for security — the linked CSS simply never loads.",
    fix: "Move all rules into a <style> block in <head> or, more reliably, inline the CSS onto each element.",
    run: (ctx) => {
      const hasLink = ctx.doc.querySelectorAll('link[rel="stylesheet"]').length > 0;
      const hasImport = /@import/i.test(ctx.css);
      return hasLink || hasImport ? [makeIssue(RULES_BY_ID.get("external-stylesheet"))] : [];
    },
  },
  {
    id: "low-inline-coverage",
    category: "css",
    severity: "warning",
    title: "Low inline CSS coverage",
    explanation: "Most content elements have no inline style attribute.",
    why: "Inline CSS is the single most reliably-supported styling method across every major email client, including Outlook. Relying on <style> blocks alone risks Outlook, Gmail app (older Android) and some corporate filters dropping your styling.",
    fix: "Inline critical styles (color, font, padding, background) directly onto td/p/a/span elements, keeping <style> only for @media responsive overrides.",
    run: (ctx) => {
      const targets = ctx.doc.querySelectorAll("td, p, a, span, h1, h2, h3, div");
      if (targets.length === 0) return [];
      const styled = Array.from(targets).filter((el) => el.hasAttribute("style")).length;
      const coverage = Math.round((styled / targets.length) * 100);
      return coverage < 40
        ? [makeIssue(RULES_BY_ID.get("low-inline-coverage"), { explanation: `Only ${coverage}% of content elements have inline styles.` })]
        : [];
    },
  },
  {
    id: "unsupported-css-features",
    category: "compatibility",
    severity: "error",
    title: "CSS feature unsupported by one or more major clients",
    explanation: "",
    why: "Layout built on unsupported CSS collapses silently in the affected client instead of erroring, so it's easy to miss without testing.",
    fix: "Rebuild the affected layout using nested HTML tables and inline CSS, which every client renders consistently.",
    run: (ctx) => {
      const hits = CSS_SUPPORT_MATRIX.filter((feature) => feature.test(ctx.css));
      return hits.map((feature, i) =>
        makeIssue(RULES_BY_ID.get("unsupported-css-features"), {
          suffix: feature.id,
          title: `${feature.label} — unsupported in ${feature.unsupported.map((c) => CLIENT_LABELS[c]).join(", ")}`,
          explanation: `Detected "${feature.label}" in the CSS, which ${feature.unsupported.map((c) => CLIENT_LABELS[c]).join(", ")} does not render.`,
          clients: feature.unsupported,
        }),
      );
    },
  },
  {
    id: "no-role-presentation",
    category: "structure",
    severity: "info",
    title: "Layout tables missing role=\"presentation\"",
    explanation: "Table(s) used for layout have no role=\"presentation\".",
    why: "Screen readers announce a plain <table> as tabular data (e.g. \"table, 3 columns, 2 rows\"), which is confusing noise when the table is only used for visual layout.",
    fix: 'Add role="presentation" to every table used purely for layout (not real tabular data).',
    example: '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">',
    run: (ctx) => {
      const tables = Array.from(ctx.doc.querySelectorAll("table"));
      const missing = tables.filter((t) => !t.hasAttribute("role") && !t.querySelector("th"));
      return tables.length && missing.length
        ? [makeIssue(RULES_BY_ID.get("no-role-presentation"), { explanation: `${missing.length} of ${tables.length} table(s) look like layout tables but have no role="presentation".` })]
        : [];
    },
  },
  {
    id: "fixed-width-table",
    category: "responsive",
    severity: "warning",
    title: "Fixed pixel-width main table",
    explanation: "A table wider than 100% of a small screen and defined only in pixels was found.",
    why: "A rigid pixel width forces horizontal scrolling or off-screen content on narrow phone inboxes instead of shrinking to fit.",
    fix: 'Set the outer table to width="600" but also style="max-width:600px;width:100%;" so it scales down on small screens.',
    run: (ctx) => {
      const tables = Array.from(ctx.doc.querySelectorAll("table[width]"));
      const rigid = tables.filter((t) => {
        const style = t.getAttribute("style") || "";
        return !/max-width/i.test(style) && !/width\s*:\s*100%/i.test(style);
      });
      return rigid.length
        ? [makeIssue(RULES_BY_ID.get("fixed-width-table"), { explanation: `${rigid.length} table(s) set a fixed width with no max-width:100% fallback for smaller screens.` })]
        : [];
    },
  },
  {
    id: "no-viewport-meta",
    category: "responsive",
    severity: "info",
    title: "No viewport meta tag",
    explanation: "No <meta name=\"viewport\"> tag was found.",
    why: "A viewport meta tag helps mobile mail clients render the email at the correct scale instead of zoomed out to fit a desktop-width layout.",
    fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0" /> to <head>.',
    run: (ctx) => (!ctx.doc.querySelector('meta[name="viewport"]') ? [makeIssue(RULES_BY_ID.get("no-viewport-meta"))] : []),
  },
  {
    id: "no-media-query",
    category: "responsive",
    severity: "info",
    title: "No responsive media queries",
    explanation: "No @media rules were found in any <style> block.",
    why: "Without a mobile breakpoint, multi-column layouts stay cramped side-by-side on narrow screens instead of stacking.",
    fix: "Add an @media (max-width:600px) block that stacks columns and enlarges tap targets and font sizes.",
    example: "@media (max-width:600px){ .stack{display:block!important;width:100%!important;} }",
    run: (ctx) => (!/@media/i.test(ctx.css) ? [makeIssue(RULES_BY_ID.get("no-media-query"))] : []),
  },
  {
    id: "no-dark-mode-meta",
    category: "responsive",
    severity: "info",
    title: "No dark-mode meta tags",
    explanation: "No color-scheme or supported-color-schemes meta tags were found.",
    why: "Without these hints, some dark-mode-aware clients (Apple Mail, Outlook.com) may auto-invert colors, turning a white logo transparent or making a light-background email hard to read.",
    fix: 'Add <meta name="color-scheme" content="light dark" /> and <meta name="supported-color-schemes" content="light dark" /> to <head>.',
    run: (ctx) =>
      !ctx.doc.querySelector('meta[name="color-scheme"]') && !ctx.doc.querySelector('meta[name="supported-color-schemes"]')
        ? [makeIssue(RULES_BY_ID.get("no-dark-mode-meta"))]
        : [],
  },
  {
    id: "gmail-clipping-risk",
    category: "performance",
    severity: "error",
    title: "Gmail clipping risk (HTML too large)",
    explanation: "",
    why: 'Gmail clips any message body over roughly 102KB and inserts a "[Message clipped]" link, hiding the rest of the email (and breaking any tracking pixel or footer placed after the cut).',
    fix: "Remove unused CSS/markup, move large blocks of repeated inline styles into a shared <style> class, or split content across multiple emails.",
    run: (ctx) => {
      const kb = Math.round(ctx.bytes / 1024);
      if (ctx.bytes > 102 * 1024) {
        return [makeIssue(RULES_BY_ID.get("gmail-clipping-risk"), { explanation: `HTML is ${kb}KB — over Gmail's ~102KB clipping threshold.` })];
      }
      if (ctx.bytes > 80 * 1024) {
        return [makeIssue(RULES_BY_ID.get("gmail-clipping-risk"), { severity: "warning", explanation: `HTML is ${kb}KB — approaching Gmail's ~102KB clipping threshold.` })];
      }
      return [];
    },
  },
  {
    id: "image-missing-alt",
    category: "accessibility",
    severity: "warning",
    title: "Images missing alt text",
    explanation: "",
    why: "Screen readers announce nothing for an image with no alt, and many inboxes block images by default — alt text is often the only content a first-time viewer sees.",
    fix: 'Add descriptive alt text to every meaningful image, or alt="" for purely decorative spacer images.',
    run: (ctx) => {
      const missing = Array.from(ctx.doc.querySelectorAll("img")).filter((img) => !img.hasAttribute("alt"));
      return missing.length
        ? [makeIssue(RULES_BY_ID.get("image-missing-alt"), { explanation: `${missing.length} image(s) have no alt attribute at all.` })]
        : [];
    },
  },
  {
    id: "image-missing-dimensions",
    category: "performance",
    severity: "info",
    title: "Images missing width/height",
    explanation: "",
    why: "Without explicit dimensions, images cause layout jump as they load and some clients render them at native (sometimes huge) size.",
    fix: "Add explicit width and height attributes to every <img>.",
    run: (ctx) => {
      const missing = Array.from(ctx.doc.querySelectorAll("img")).filter((img) => !img.hasAttribute("width") || !img.hasAttribute("height"));
      return missing.length
        ? [makeIssue(RULES_BY_ID.get("image-missing-dimensions"), { explanation: `${missing.length} image(s) are missing a width and/or height attribute.` })]
        : [];
    },
  },
  {
    id: "image-not-https",
    category: "performance",
    severity: "error",
    title: "Images not served over HTTPS",
    explanation: "",
    why: "Most clients block or show a warning for mixed-content (http://) images, and some strip them entirely.",
    fix: "Serve every image over https://.",
    run: (ctx) => {
      const insecure = Array.from(ctx.doc.querySelectorAll("img[src]")).filter((img) => /^http:\/\//i.test(img.getAttribute("src") || ""));
      return insecure.length
        ? [makeIssue(RULES_BY_ID.get("image-not-https"), { explanation: `${insecure.length} image(s) use an insecure http:// src.` })]
        : [];
    },
  },
  {
    id: "base64-images",
    category: "performance",
    severity: "warning",
    title: "Base64-embedded images",
    explanation: "",
    why: "Base64-encoded images inflate the HTML size (each one adds ~33% overhead versus a linked file) and push the email toward Gmail's clipping limit; Outlook also often fails to render base64 images at all.",
    fix: "Host images externally and reference them with a normal https:// src instead of embedding as base64.",
    run: (ctx) => {
      const b64 = Array.from(ctx.doc.querySelectorAll('img[src^="data:"]'));
      return b64.length ? [makeIssue(RULES_BY_ID.get("base64-images"), { explanation: `${b64.length} image(s) are embedded as base64 data URIs.` })] : [];
    },
  },
  {
    id: "link-not-https",
    category: "accessibility",
    severity: "warning",
    title: "Links not using HTTPS",
    explanation: "",
    why: "Insecure http:// links can trigger security warnings in some clients and hurt sender trust/spam scoring.",
    fix: "Use https:// for every link.",
    run: (ctx) => {
      const insecure = Array.from(ctx.doc.querySelectorAll("a[href]")).filter((a) => /^http:\/\//i.test(a.getAttribute("href") || ""));
      return insecure.length ? [makeIssue(RULES_BY_ID.get("link-not-https"), { explanation: `${insecure.length} link(s) use insecure http://.` })] : [];
    },
  },
  {
    id: "empty-links",
    category: "accessibility",
    severity: "warning",
    title: "Empty or placeholder links",
    explanation: "",
    why: 'An href="#" or empty href goes nowhere and a link with no visible text is unreadable to screen-reader users.',
    fix: "Set a real destination URL on every link and make sure every link has visible or aria-label text.",
    run: (ctx) => {
      const links = Array.from(ctx.doc.querySelectorAll("a"));
      const broken = links.filter((a) => {
        const href = (a.getAttribute("href") || "").trim();
        return !href || href === "#";
      });
      const noText = links.filter((a) => !a.textContent.trim() && !a.querySelector("img") && !a.getAttribute("aria-label"));
      const total = broken.length + noText.length;
      return total
        ? [makeIssue(RULES_BY_ID.get("empty-links"), { explanation: `${broken.length} link(s) have an empty/"#" href and ${noText.length} link(s) have no visible text.` })]
        : [];
    },
  },
  {
    id: "duplicate-links",
    category: "compatibility",
    severity: "info",
    title: "Many duplicate link destinations",
    explanation: "",
    why: "Repeating the same URL many times isn't wrong, but a large number of links overall is one of the strongest spam-filter signals.",
    fix: "Consolidate repeated links where possible and keep total link count reasonable for the content length.",
    run: (ctx) => {
      const hrefs = Array.from(ctx.doc.querySelectorAll("a[href]")).map((a) => a.getAttribute("href"));
      const counts = new Map();
      hrefs.forEach((h) => counts.set(h, (counts.get(h) || 0) + 1));
      const dupes = [...counts.entries()].filter(([, c]) => c >= 4);
      return dupes.length
        ? [makeIssue(RULES_BY_ID.get("duplicate-links"), { explanation: `${dupes.length} URL(s) are linked 4+ times each.` })]
        : [];
    },
  },
  {
    id: "excessive-links",
    category: "compatibility",
    severity: "warning",
    title: "Excessive number of links",
    explanation: "",
    why: "A very high link-to-content ratio is a classic spam-filter trigger and overwhelms the reader.",
    fix: "Trim down to the links that matter — usually one primary CTA plus a few secondary ones.",
    run: (ctx) => {
      const count = ctx.doc.querySelectorAll("a[href]").length;
      return count > 20 ? [makeIssue(RULES_BY_ID.get("excessive-links"), { explanation: `${count} links found in this email.` })] : [];
    },
  },
  {
    id: "hidden-text",
    category: "compatibility",
    severity: "error",
    title: "Hidden text detected",
    explanation: "",
    why: "font-size:0, display:none combined with real text, or text color matching its own background are all classic spam-filter red flags (historically used to hide keyword stuffing from readers while showing it to filters) — and a real preheader is the one legitimate exception, which this check already ignores by looking for hidden text with substantial length outside the very top of body.",
    fix: "Remove hidden text blocks unless they are a deliberately short, intentional preheader — legitimate hidden preheaders should stay under ~150 characters.",
    run: (ctx) => {
      const candidates = Array.from(ctx.doc.querySelectorAll("[style]")).filter((el) => {
        const style = (el.getAttribute("style") || "").toLowerCase();
        return /font-size\s*:\s*0|display\s*:\s*none|visibility\s*:\s*hidden/.test(style) && el.textContent.trim().length > 150;
      });
      return candidates.length
        ? [makeIssue(RULES_BY_ID.get("hidden-text"), { explanation: `${candidates.length} element(s) hide more than 150 characters of text (font-size:0/display:none), beyond what a normal preheader needs.` })]
        : [];
    },
  },
  {
    id: "image-only-email",
    category: "compatibility",
    severity: "warning",
    title: "Image-heavy, text-light email",
    explanation: "",
    why: "Emails that are mostly one big image with little real text are a strong spam-filter signal and completely fail for recipients who have images blocked by default.",
    fix: "Add substantive real text content — most spam filters look for a healthy image-to-text ratio.",
    run: (ctx) => {
      const imgCount = ctx.doc.querySelectorAll("img").length;
      const textLength = ctx.doc.body ? ctx.doc.body.textContent.replace(/\s+/g, " ").trim().length : 0;
      return imgCount >= 3 && textLength < 60
        ? [makeIssue(RULES_BY_ID.get("image-only-email"), { explanation: `${imgCount} images but only ${textLength} characters of real text.` })]
        : [];
    },
  },
  {
    id: "no-preheader",
    category: "structure",
    severity: "info",
    title: "No preheader text detected",
    explanation: "No hidden preheader snippet was found near the top of the body.",
    why: "Without a preheader, inbox lists fall back to showing the first line of HTML (often \"View this email in your browser\") as the preview snippet, wasting valuable inbox real estate.",
    fix: "Add a short hidden snippet right after <body> summarizing the email, padded with &zwnj;&nbsp; so it doesn't repeat visible body text.",
    example: '<div style="display:none;max-height:0;overflow:hidden;">Your preview text here&zwnj;&nbsp;</div>',
    run: (ctx) => {
      if (!ctx.doc.body) return [];
      const firstChildren = Array.from(ctx.doc.body.querySelectorAll("*")).slice(0, 8);
      const hasPreheader = firstChildren.some((el) => {
        const style = (el.getAttribute("style") || "").toLowerCase();
        const text = el.textContent.trim();
        return /display\s*:\s*none|max-height\s*:\s*0|font-size\s*:\s*0|opacity\s*:\s*0/.test(style) && text.length > 5 && text.length < 150;
      });
      return hasPreheader ? [] : [makeIssue(RULES_BY_ID.get("no-preheader"))];
    },
  },
  {
    id: "heading-hierarchy",
    category: "accessibility",
    severity: "info",
    title: "Heading levels skip a level",
    explanation: "",
    why: "Screen-reader users navigate by heading level; jumping from an <h1> straight to an <h3> makes the document structure confusing.",
    fix: "Use headings in order (h1 → h2 → h3) without skipping levels.",
    run: (ctx) => {
      const levels = Array.from(ctx.doc.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) => Number(h.tagName[1]));
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i - 1] > 1) {
          return [makeIssue(RULES_BY_ID.get("heading-hierarchy"), { explanation: `Heading level jumps from h${levels[i - 1]} to h${levels[i]}.` })];
        }
      }
      return [];
    },
  },
  {
    id: "missing-lang",
    category: "accessibility",
    severity: "info",
    title: "Missing lang attribute on <html>",
    explanation: "The <html> tag has no lang attribute.",
    why: "Screen readers use lang to choose the correct pronunciation and voice.",
    fix: 'Add lang="en" (or the appropriate language code) to the <html> tag.',
    run: (ctx) => {
      const htmlEl = ctx.doc.querySelector("html");
      return htmlEl && !htmlEl.getAttribute("lang") ? [makeIssue(RULES_BY_ID.get("missing-lang"))] : [];
    },
  },
  {
    id: "tiny-font-size",
    category: "accessibility",
    severity: "warning",
    title: "Font size below 10px",
    explanation: "",
    why: "Text under 10px is difficult to read, especially on mobile, and fails common accessibility guidelines.",
    fix: "Use at least 12px (14px+ for body copy) — legal/fine-print text should not go below 10px.",
    run: (ctx) => {
      const tiny = /font-size\s*:\s*[0-9](px)?[^0-9]/i.test(ctx.css) || /font-size\s*:\s*[1-9]px/i.test(ctx.css);
      return tiny ? [makeIssue(RULES_BY_ID.get("tiny-font-size"))] : [];
    },
  },
  {
    id: "web-font-no-fallback",
    category: "css",
    severity: "info",
    title: "Custom font with no web-safe fallback",
    explanation: "",
    why: "Most email clients don't load custom @font-face fonts at all, so the fallback stack is what most recipients actually see.",
    fix: "Always end a font-family stack with a web-safe font, e.g. \"Poppins\", Arial, sans-serif.",
    run: (ctx) => {
      const families = [...ctx.css.matchAll(/font-family\s*:\s*([^;"'}]+)/gi)].map((m) => m[1]);
      const risky = families.some((f) => !/(arial|helvetica|verdana|georgia|times|courier|sans-serif|serif|monospace|tahoma)/i.test(f));
      return risky ? [makeIssue(RULES_BY_ID.get("web-font-no-fallback"))] : [];
    },
  },
  {
    id: "button-tag-used",
    category: "compatibility",
    severity: "warning",
    title: "<button> tag used for a CTA",
    explanation: "A native <button> element was found.",
    why: "Outlook and several other clients don't reliably render <button>, and it can't carry a real href on its own.",
    fix: 'Use the "bulletproof button" pattern instead: a table cell with a background color, wrapping an <a> with padding.',
    example: '<table role="presentation"><tr><td style="background:#2563eb;border-radius:6px;"><a href="https://example.com" style="display:inline-block;padding:12px 24px;color:#fff;text-decoration:none;font-weight:bold;">Shop Now</a></td></tr></table>',
    run: (ctx) => (ctx.doc.querySelector("button") ? [makeIssue(RULES_BY_ID.get("button-tag-used"))] : []),
  },
  {
    id: "small-tap-target",
    category: "accessibility",
    severity: "info",
    title: "CTA link with little padding",
    explanation: "",
    why: "Recommended minimum touch target size is about 44×44px — a link styled only as underlined text is hard to tap accurately on a phone.",
    fix: "Give button-style links generous padding (e.g. padding:12px 24px) so the tappable area is comfortably large.",
    run: (ctx) => {
      const buttonLike = Array.from(ctx.doc.querySelectorAll("a[style]")).filter((a) => /background(-color)?\s*:/i.test(a.getAttribute("style") || ""));
      const cramped = buttonLike.filter((a) => !/padding/i.test(a.getAttribute("style") || ""));
      return cramped.length
        ? [makeIssue(RULES_BY_ID.get("small-tap-target"), { explanation: `${cramped.length} button-style link(s) have a background color but no padding.` })]
        : [];
    },
  },
];

const RULES_BY_ID = new Map(RULES.map((r) => [r.id, r]));

function buildContext(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return {
    raw: html,
    rawLower: html.toLowerCase(),
    doc,
    css: collectCss(doc, html),
    bytes: bytesOf(html),
  };
}

function scoreCategory(issues, category) {
  const penalty = issues.filter((i) => i.category === category).reduce((sum, i) => sum + SEVERITY_PENALTY[i.severity], 0);
  return Math.max(0, Math.round(100 - penalty));
}

function scoreClient(issues, client) {
  const penalty = issues.filter((i) => i.clients.includes(client)).length * CLIENT_PENALTY;
  return Math.max(0, Math.round(100 - penalty));
}

function gradeFromScore(score) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  return "D";
}

const CHECKLIST_ITEMS = [
  { id: "missing-doctype", label: "DOCTYPE declared" },
  { id: "missing-html-tag", label: "<html> tag present" },
  { id: "missing-head-tag", label: "<head> section present" },
  { id: "missing-body-tag", label: "<body> tag present" },
  { id: "external-stylesheet", label: "No external stylesheets" },
  { id: "low-inline-coverage", label: "Critical styles are inlined" },
  { id: "unsupported-css-features", label: "No Flexbox/Grid/animations in CSS" },
  { id: "no-preheader", label: "Preheader text present" },
  { id: "no-viewport-meta", label: "Viewport meta tag present" },
  { id: "no-dark-mode-meta", label: "Dark-mode meta tags present" },
  { id: "gmail-clipping-risk", label: "Under Gmail's clipping size limit" },
  { id: "duplicate-ids", label: "No duplicate ids" },
  { id: "image-missing-alt", label: "All images have alt text" },
  { id: "link-not-https", label: "All links use HTTPS" },
  { id: "missing-lang", label: "lang attribute set on <html>" },
];

export function auditEmailHtml(html) {
  const trimmed = (html || "").trim();
  if (!trimmed) {
    return buildEmptyAudit();
  }

  const ctx = buildContext(trimmed);
  const issues = RULES.flatMap((rule) => {
    try {
      return rule.run(ctx);
    } catch {
      return [];
    }
  });

  const categoryScores = {
    structure: scoreCategory(issues, "structure"),
    css: scoreCategory(issues, "css"),
    accessibility: scoreCategory(issues, "accessibility"),
    performance: scoreCategory(issues, "performance"),
    compatibility: scoreCategory(issues, "compatibility"),
    responsive: scoreCategory(issues, "responsive"),
  };

  const overallScore = Math.max(
    0,
    Math.min(100, Math.round(Object.entries(categoryScores).reduce((sum, [key, val]) => sum + val * CATEGORY_WEIGHTS[key], 0))),
  );

  const clientScores = Object.fromEntries(CLIENTS.map((c) => [c, scoreClient(issues, c)]));
  const clientUnsupportedFeatures = Object.fromEntries(
    CLIENTS.map((c) => [c, issues.filter((i) => i.clients.includes(c)).map((i) => i.title)]),
  );

  const affectedRuleIds = new Set(issues.map((i) => i.ruleId));
  const checklist = CHECKLIST_ITEMS.map((item) => ({ ...item, passed: !affectedRuleIds.has(item.id) }));

  const stats = {
    sizeBytes: ctx.bytes,
    sizeKb: Math.round((ctx.bytes / 1024) * 10) / 10,
    imageCount: ctx.doc.querySelectorAll("img").length,
    linkCount: ctx.doc.querySelectorAll("a[href]").length,
    tableCount: ctx.doc.querySelectorAll("table").length,
    wordCount: ctx.doc.body ? ctx.doc.body.textContent.trim().split(/\s+/).filter(Boolean).length : 0,
  };

  return {
    html: trimmed,
    issues: issues.sort((a, b) => SEVERITY_PENALTY[b.severity] - SEVERITY_PENALTY[a.severity]),
    categoryScores,
    overallScore,
    grade: gradeFromScore(overallScore),
    clientScores,
    clientUnsupportedFeatures,
    checklist,
    stats,
  };
}

function buildEmptyAudit() {
  return {
    html: "",
    issues: [],
    categoryScores: { structure: 0, css: 0, accessibility: 0, performance: 0, compatibility: 0, responsive: 0 },
    overallScore: 0,
    grade: "D",
    clientScores: Object.fromEntries(CLIENTS.map((c) => [c, 0])),
    clientUnsupportedFeatures: Object.fromEntries(CLIENTS.map((c) => [c, []])),
    checklist: CHECKLIST_ITEMS.map((item) => ({ ...item, passed: false })),
    stats: { sizeBytes: 0, sizeKb: 0, imageCount: 0, linkCount: 0, tableCount: 0, wordCount: 0 },
  };
}

export { CATEGORY_WEIGHTS, CLIENTS, CLIENT_LABELS };

// Strips regular HTML comments while preserving Outlook conditional comments
// (<!--[if mso]>...<![endif]-->), which are load-bearing fallback markup.
export function minifyEmailHtml(html) {
  return html
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, (match) => (match.includes("<![endif]") ? match : ""))
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export const SAMPLE_EMAIL_HTML = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>20% Off This Week</title>
  <style>
    @media (max-width:600px) {
      .stack { display:block !important; width:100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;">
  <div style="display:none;max-height:0;overflow:hidden;">Your 20% off code is inside&zwnj;&nbsp;</div>
  <table role="presentation" width="600" style="max-width:600px;width:100%;" cellpadding="0" cellspacing="0" border="0" align="center">
    <tr>
      <td style="padding:24px;font-family:Arial,Helvetica,sans-serif;">
        <h1 style="font-size:22px;color:#111827;">Hi {FirstName},</h1>
        <p style="font-size:16px;color:#374151;line-height:1.5;">Enjoy 20% off your next order this week only.</p>
        <img src="https://www.anslation.com/assets/images/logo/anslation-logo.svg" width="552" height="220" alt="20% off banner" style="display:block;width:100%;height:auto;" />
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <br>
          <tr>
            <td style="background:#2563eb;border-radius:6px;">
              <a href="https://example.com/shop" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:bold;">Shop Now</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
