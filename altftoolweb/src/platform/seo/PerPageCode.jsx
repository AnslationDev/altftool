"use client";

// Injects admin-authored PER-PAGE custom code (head / body-start / body-end)
// on the client, keyed by the current path. Runs only when the site actually
// has per-page code (the layout passes `active`), so pages without it make no
// request. Scripts pasted as raw <script> tags are re-created so they execute
// (innerHTML-inserted scripts do not run on their own).

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function buildNodes(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const nodes = [];
  Array.from(tmp.childNodes).forEach((child) => {
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
      if (!html) return;
      for (const node of buildNodes(html)) {
        if (node.setAttribute) node.setAttribute("data-altft-page-code", "1");
        if (prepend && target.firstChild) target.insertBefore(node, target.firstChild);
        else target.appendChild(node);
        injected.push(node);
      }
    };

    fetch(`/api/seo/page-code?path=${encodeURIComponent(pathname)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        place(data.head, document.head, false);
        place(data.bodyStart, document.body, true);
        place(data.bodyEnd, document.body, false);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      injected.forEach((n) => n.remove && n.remove());
    };
  }, [active, pathname]);

  return null;
}
