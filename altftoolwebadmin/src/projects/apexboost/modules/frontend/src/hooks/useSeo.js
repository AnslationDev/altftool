import { useEffect } from "react";

/**
 * Lightweight SEO helper (React 19 friendly, no extra deps).
 * Sets document title + meta description/og tags on mount/route change.
 */
export function useSeo({ title, description, image }) {
  useEffect(() => {
    if (title) document.title = title;

    const upsertMeta = (selector, attr, content) => {
      if (!content) return;
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        const [, key, val] = selector.match(/\[(.+?)="(.+?)"\]/) || [];
        if (key && val) el.setAttribute(key, val);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    upsertMeta('meta[name="description"]', null, description);
    upsertMeta('meta[property="og:description"]', null, description);
    upsertMeta('meta[property="og:title"]', null, title);
    upsertMeta('meta[property="og:image"]', null, image);
  }, [title, description, image]);
}
