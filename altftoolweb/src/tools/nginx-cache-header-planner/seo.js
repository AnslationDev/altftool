const seo = {
  title: "Nginx Cache-Control Header Planner per Asset Type",
  metaDescription:
    "Set a caching policy per asset class — HTML revalidated, hashed bundles immutable for a year — and copy nginx location blocks with no duplicate headers.",
  steps: [
    "Enable the asset classes you serve — HTML pages, Hashed CSS / JS bundles, Images, Fonts, Audio / video — and edit each one's File extensions.",
    "Pick a Cacheability (public, private, no-cache or no-store), set Max age with its unit, and toggle the immutable and must-revalidate flags.",
    "Click Copy snippet for ready nginx location blocks that use expires or add_header — never both — so no duplicate Cache-Control is emitted.",
  ],
  intro:
    "This planner turns a per-asset-type caching policy into ready nginx location blocks that set Cache-Control and expires correctly, using the response directives defined in RFC 9111 plus the immutable extension from RFC 8246. It ships the widely used default strategy — HTML always revalidated, hash-named CSS/JS and fonts cached for one year as immutable, images for 30 days — and knows that nginx's expires directive already emits a Cache-Control: max-age header, so it never generates duplicate headers.",
  useCases: [
    "A developer deploying a Vite or webpack build with hashed filenames who wants max-age=31536000, immutable on bundles but no-cache on index.html",
    "An ops engineer replacing an ancient copy-pasted expires block with policies they can actually explain per asset type",
    "Debugging a stale-deploy problem by checking what Cache-Control value each file extension should be sending",
  ],
  benefits: [
    ["No duplicate Cache-Control", "Plain max-age policies use expires alone; richer policies use add_header — never both on one location."],
    ["RFC-correct directives", "public, private, no-cache, no-store, must-revalidate and immutable are combined per RFC 9111/8246 semantics."],
    ["Editable per class", "Extensions, durations and flags are editable for each asset class, with a 10-year sanity cap on max-age."],
  ],
  faqs: [
    [
      "What Cache-Control should I use for hashed CSS and JS files?",
      "Cache-Control: public, max-age=31536000, immutable — one year plus the immutable directive from RFC 8246, which tells browsers to skip revalidation entirely. This is safe only because the filename hash changes whenever the content does, so a new deploy naturally busts the cache.",
    ],
    [
      "Should HTML pages be cached in nginx?",
      "HTML should normally be sent with Cache-Control: no-cache, which lets browsers store the page but forces a revalidation on every use. Long-caching HTML is the classic cause of users seeing an old page that references deleted hashed assets after a deploy.",
    ],
    [
      "What is the difference between no-cache and no-store?",
      "no-cache allows a response to be stored but requires it to be revalidated with the server before every reuse, while no-store forbids storing the response at all. Use no-store only for genuinely sensitive responses, because it eliminates even conditional-request savings.",
    ],
    [
      "Does the nginx expires directive set Cache-Control?",
      "Yes — expires emits both an Expires header and a Cache-Control: max-age=N header calculated from the same duration. That is why combining expires with your own add_header Cache-Control line produces two Cache-Control headers; this planner uses one mechanism or the other, never both.",
    ],
  ],
};

export default seo;
