const seo = {
  title: "YouTube Self-Exposure Query Builder: site:, inurl:",
  metaDescription:
    "Turn your name, handle, channel ID or email into ready-to-run site:, inurl: and quoted queries, grouped by exposure area. Built in your browser only.",
  steps: [
    "Fill in only what is already public: Real name, YouTube handle, Channel ID, Email you have used publicly, City or area, Employer or School or college.",
    "Leave any field blank to skip that query group, or press Clear every field to start from nothing.",
    "Copy an individual query, or Copy plan for the whole set, and use Open in Google / Open in Bing — anything tagged Over 32 words needs trimming first.",
  ],
  intro:
    "This query builder converts identifiers you already own — your name, YouTube handle, channel ID, email, city, employer — into ready-to-run search-engine queries using real operators such as site:, inurl: and quoted exact-match phrases, so you can see what a stranger finds when they look you up. It groups the queries by exposure area (channel pages, videos about you, comments, location hints, contact details, handle reuse elsewhere) and flags any query that crosses Google's roughly 32-word cutoff. Everything is generated locally in your browser; no identifier is transmitted or stored.",
  useCases: [
    "Check whether an old vlog description still names your street, your school or the company you worked at five years ago.",
    "Find every site outside YouTube that reuses the same handle, which is how a pseudonymous channel gets linked to a real name.",
    "Audit a business email you left in your About tab before scrapers add it to another spam list.",
    "Prepare an evidence list before filing a YouTube privacy complaint about a video that shows your home or car.",
  ],
  benefits: [
    ["Real operator syntax", "Queries use site:, inurl:, OR and quoted phrases exactly as Google and Bing parse them."],
    ["Grouped by exposure type", "Channel, video, comment, location, contact and cross-platform findings stay separate instead of one long list."],
    ["Nothing leaves the browser", "Query strings are assembled with plain JavaScript — no lookup service ever sees your name or email."],
  ],
  faqs: [
    [
      "Are YouTube comments searchable on Google?",
      "Mostly no. Google indexes very few YouTube comments because they load after the initial page render, so the reliable route is YouTube's own search plus opening a suspect video, clicking through to load all comments, and using your browser's find-in-page. Treat any Google hit on a comment as a bonus, not as coverage.",
    ],
    [
      "How do I find every video that mentions my name?",
      'Search site:youtube.com/watch "Your Name" on Google to limit results to watch pages rather than your own channel tabs, then repeat the same phrase in YouTube search because YouTube surfaces recent uploads Google has not crawled yet. Add your city or employer as a second quoted phrase to catch videos that identify you indirectly.',
    ],
    [
      "Why does searching my handle without the site: filter matter?",
      'Handle reuse is the fastest way to link accounts. Running "yourhandle" -site:youtube.com shows forums, marketplaces, code repositories and old blogs using the same string, and a single match there can attach a legal name to a pseudonymous channel.',
    ],
    [
      "Can I get a video removed if it exposes my address?",
      "YouTube's privacy complaint process accepts reports about content that reveals personally identifiable information such as a home address, phone number or image of your house, and the uploader is normally given 48 hours to act before review. This tool only helps you gather the URLs; for threats, stalking or harassment contact local law enforcement, and consult a lawyer for anything involving defamation or legal remedies.",
    ],
  ],
};

export default seo;
