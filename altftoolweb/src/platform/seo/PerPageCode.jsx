"use client";

// Injects admin-authored PER-PAGE custom code (head / body-start / body-end)
// AND per-page JSON-LD structured data (schema) on the client, keyed by the
// current path. Runs only when the site actually has per-page code or schema
// (the layout passes `active`), so pages without it make no request. Scripts
// pasted as raw <script> tags are re-created so they execute (innerHTML-inserted
// scripts do not run on their own).

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function buildNodes(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const nodes = [];
  Array.from(tmp.childNodes).forEach((child) => {
    // Skip stray top-level text nodes (e.g. a bare verification token pasted
    // beside a <meta> tag). These slots only carry element markup, so loose
    // text is always an accidental paste that would render as visible text.
    if (child.nodeType === 3) return;
    if (child.nodeType === 1 && child.tagName === "SCRIPT") {
      const s = document.createElement("script");
      for (const attr of child.attributes) s.setAttribute(attr.name, attr.value);
      s.text = child.textContent || "";
      nodes.push(s);
    } else {
      nodes.push(child);
    }
  });
  return nodes;
}

export default function PerPageCode({ active = false }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!active || !pathname) return;
    let cancelled = false;
    const injected = [];

    const place = (html, target, prepend) => {
      // Only inject real HTML/script markup. Bare text (e.g. a verification
      // token mis-pasted into the custom-code field) is never valid here and
      // would show as stray visible text, so treat it as inert.
      if (!html || typeof html !== "string" || !/<[^>]+>/.test(html)) return;
      for (const node of buildNodes(html)) {
        if (node.setAttribute) node.setAttribute("data-altft-page-code", "1");
        if (prepend && target.firstChild) target.insertBefore(node, target.firstChild);
        else target.appendChild(node);
        injected.push(node);
      }
    };

    const placeJsonLd = (items) => {
      if (!Array.isArray(items)) return;
      for (const item of items) {
        if (!item) continue;
        const serialized = typeof item === "string" ? item : JSON.stringify(item);
        if (!serialized || !serialized.trim()) continue;
        const s = document.createElement("script");
        s.type = "application/ld+json";
        s.setAttribute("data-altft-page-code", "1");
        s.text = serialized;
        document.head.appendChild(s);
        injected.push(s);
      }
    };

    fetch(`/api/seo/page-code?path=${encodeURIComponent(pathname)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        place(data.head, document.head, false);
        place(data.bodyStart, document.body, true);
        place(data.bodyEnd, document.body, false);
        placeJsonLd(data.jsonLd);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      injected.forEach((n) => n.remove && n.remove());
    };
  }, [active, pathname]);

  return null;
}
