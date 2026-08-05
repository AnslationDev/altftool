// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "blog-post-ideas",
  "title": "Blog Post Idea Generator",
  "description": "Generate fresh blog post angles for any topic.",
  "badge": "Content Creation",
  "category": [
    "Content Creation"
  ],
  "icon": "lightbulb",
  "iconColor": "text-amber-500",
  "fields": [
    {
      "key": "topic",
      "label": "Topic / niche",
      "type": "text",
      "default": "home fitness"
    }
  ],
  "regenerate": true
},
  compute: (values, _mode, random) => {
      // Fall back to "your topic" for both a missing AND a whitespace-only
      // value — trimming before the fallback check (not after) so a lone
      // space in the field can't collapse the placeholder to "".
      const trimmed = typeof values.topic === "string" ? values.topic.trim() : "";
      const t = trimmed || "your topic";
      const year = new Date().getFullYear();
      const templates = [`The ultimate beginner's guide to ${t}`, `10 common ${t} mistakes (and how to fix them)`, `${t} on a budget: what really works`, `A day in the life of a ${t} enthusiast`, `${t} myths everyone still believes`, `How I improved my ${t} in 30 days`, `The best ${t} tools of ${year}`, `${t} vs. the alternatives: an honest comparison`];
      // Fisher-Yates: `.sort(() => random() - 0.5)` is a well-known
      // biased shuffle (browsers' sort implementations reuse comparisons in
      // ways that skew the result), which made some templates surface far
      // more often than others across repeated regenerates.
      const shuffled = [...templates];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return { list: shuffled.slice(0, 5) };
    },
};

export default spec;
