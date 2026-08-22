const seo = {
  title: "Browser Tab Analyzer: Duplicates & Domains",
  metaDescription:
    "Paste a tab list, CSV or JSON export: duplicate URLs matched past ?utm_ and #anchors, 14 domain categories, and health, focus and clutter scores.",
  intro:
    "Browser Session Analyzer takes a list of open tab URLs — pasted, or exported as JSON or CSV from a session manager — and reports how many are duplicates, which domains dominate, what the tabs are actually for, and roughly how much memory they cost. It is for people who habitually run 80 tabs and want a defensible list of what to close. Duplicates are matched on the normalised URL (lower-cased, with the hash, query string and trailing slash stripped), so twenty copies of the same article arriving via different UTM links collapse into one.",
  useCases: [
    "Export a 120-tab window from a session manager, find the 30 duplicate URLs, and close them before the machine starts swapping",
    "Audit a week of research tabs to see how much of the session is genuinely Development and Research versus Social Media and Entertainment",
    "Spot the tabs still on plain http, or with malformed URLs left behind by a crashed extension, before you save the session as a bookmark folder",
  ],
  benefits: [
    ["Duplicate detection that ignores tracking parameters", "URLs are normalised before comparison, so ?utm_source= and #anchor copies of one page are counted as one."],
    ["Domain categories out of the box", "Around 150 well-known domains are pre-classified into 14 groups — AI, Development, Research, Social Media, Entertainment and more — with no setup."],
    ["Runs entirely in your browser", "The URL list is parsed in the page; nothing is uploaded, which matters because a tab list is a detailed record of what you have been reading."],
  ],
  faqs: [
    [
      "How is the tab health score calculated?",
      "It starts at 100 and subtracts 5 points per duplicate URL and 10 per malformed URL, then 0.5 per tab above 50 and a further 0.3 per tab above 100, clamped to 0-100. So 60 clean tabs score 95, and 120 clean tabs score 59. The 50-tab knee is where Chrome typically begins discarding background tabs on an 8 GB machine.",
    ],
    [
      "What does the focus score mean?",
      "It is ((productive − 0.5 × distracting) / total) × 50 + 50. An all-productive session scores 100, an even split scores 50 and an all-distracting session scores 25. Productive means Development, Productivity, Education and Research; distracting means Entertainment, Social Media, Shopping and Gaming. Uncategorised domains land in Other and pull the score toward 50.",
    ],
    [
      "How accurate is the estimated memory figure?",
      "It is a planning estimate, not a measurement: 50 MB per tab plus 150 MB extra for a tab on YouTube or Netflix. Chrome's own task manager puts a typical content-heavy tab in the 40-60 MB band once renderer, compositor and page heap are counted. For a real per-tab number use Shift+Esc in Chrome or about:performance in Firefox.",
    ],
    [
      "What formats can I paste in?",
      "Three, auto-detected. A plain list of URLs one per line; a CSV column of URLs; or JSON in any of the common shapes — a bare array of strings, an array of objects with a url field, or an object with a tabs, urls or bookmarks key. Nested bookmark trees are walked recursively, so a Chrome bookmarks export works as-is.",
    ],
  ],
};

export default seo;
