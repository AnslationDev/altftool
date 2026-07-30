const seo = {
  intro:
    "This builder assembles twelve search-engine queries from your Instagram username — validated against the platform's own rule of up to 30 characters using letters, numbers, full stops and underscores — plus an optional name, city and hashtag. The queries use documented operators (site:, quoted phrases, OR, minus) to surface your indexed profile and posts, articles that embed them, reposts on Pinterest, Reddit, Tumblr and X, and other networks where the same handle appears. It builds strings for you to run; it never searches, scrapes or stores anything.",
  useCases: [
    "Finding which of your posts and reels are indexed by search engines rather than only visible in the app.",
    "Tracking down articles and blogs that embedded your photos, which keep working even after you delete the original.",
    "Checking whether the same username links your Instagram account to a professional or anonymous account elsewhere.",
    "Auditing a business profile whose bio publishes an email or phone number that lead-generation sites may have copied.",
  ],
  benefits: [
    ["Username validated first", "Bad handles are caught before they produce empty results, including the no-leading-dot and no-double-dot rules."],
    ["Looks beyond Instagram", "Separate queries target embeds, reposts and cross-platform handle reuse, which is where deleted content survives."],
    ["Nothing leaves the browser", "Queries are assembled locally and opened only when you choose to run one."],
  ],
  faqs: [
    [
      "Can people find my Instagram posts on Google?",
      "Public profiles and individual posts are indexed, appearing under instagram.com/yourhandle and instagram.com/p/ addresses, and reels under /reel/. Switching the account to private stops new content being indexed and eventually removes old entries, but anything already embedded or reposted elsewhere stays where it is.",
    ],
    [
      "How do I find where my Instagram photos have been reposted?",
      "Search your handle in quotes with site: filters for the networks that repost most — Pinterest, Reddit, Tumblr and X — and search \"instagram.com/p/\" together with your name to catch posts embedded in articles. Reverse image search on a specific photo complements this for copies that carry no handle at all.",
    ],
    [
      "What are the rules for an Instagram username?",
      "Up to 30 characters made of letters, numbers, full stops and underscores, and it cannot start or end with a full stop or contain two in a row. Because the same handle is often reused across services, an unusual username is one of the easiest ways for a stranger to connect your accounts.",
    ],
    [
      "Does making my account private remove me from search results?",
      "It stops search engines indexing new posts and, over time, drops existing entries as they are re-crawled — but it does not touch third-party copies. Pages that embedded a post, screenshots, and reposts on other platforms all survive, and removing those needs a request to the site hosting them.",
    ],
  ],
};

export default seo;
