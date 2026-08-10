const seo = {
  title: "API Versioning: URL Path vs Header vs Media Type",
  metaDescription:
    "Ranks URL path, ?api-version, custom header and Accept media type versioning on six weighted criteria, with the client migration cost of each.",
  steps: [
    "Drag the 0-5 sliders under \"How much does each criterion matter?\" — HTTP cache friendliness, Client simplicity, Gateway routing & ops, REST / HTTP semantics, Explorability & debuggability and URL stability.",
    "The ranking recalculates as you move them: Best match for your weights names the winner, who it is used by, and its migration effort of Low, Medium or High.",
    "All four strategies are listed with a score percentage, a request example and a migration note, above the full ratings matrix; Copy ranking copies the ordered list.",
  ],
  intro:
    "This tool ranks the four mainstream API versioning strategies — URL path (/v2/), query parameter (?api-version=), custom header (Stripe-Version) and media type content negotiation (Accept: application/vnd.example.v2+json) — against six weighted criteria including HTTP cache friendliness, client simplicity and gateway routing. Each strategy carries a documented migration-cost note and a real-world anchor (Stripe, Azure, GitHub). API designers get a ranked, defensible choice instead of the eternal path-versus-header debate.",
  useCases: [
    "A team designing their first public API and deciding between /v1/ paths and an Azure-style api-version query parameter",
    "A platform with CDN-cached responses weighing header versioning against the Vary complexity it adds to shared caches",
    "An architect preparing a v2 rollout who needs the client migration cost of each strategy written down for the RFC",
  ],
  benefits: [
    ["All four strategies", "Path, query, header and media type compared on the same six 0-5 criteria, with a full matrix included."],
    ["Migration cost stated", "Each option lists what existing clients must change and how old versions keep working during cutover."],
    ["Grounded in real APIs", "Anchored to shipping designs: Stripe's date-pinned header, Azure's api-version parameter, GitHub's vendor media type."],
  ],
  faqs: [
    [
      "What is the most common way to version a REST API?",
      "URL path versioning — a /v1/ or /v2/ segment in the path — is the most widely used because every client, cache and gateway understands a different URL with zero extra configuration. Its cost is that URLs are unstable across majors: every client must rewrite its base URL when v2 arrives, and the version leaks into bookmarks and logs.",
    ],
    [
      "How does Stripe version its API?",
      "Stripe pins each account to the API version current at signup and lets requests override it with the Stripe-Version header, using dates (for example 2024-06-20) rather than v1/v2 numbers. This keeps URLs stable forever and makes upgrades opt-in per account, at the price of gateway and cache logic that must read a request header.",
    ],
    [
      "Why does header or media type versioning complicate caching?",
      "Because two versions of the same URL produce different bodies, a shared cache must be told the response varies by that header — via Vary: Accept or Vary on the custom header (RFC 9110) — or it may serve v1 content to a v2 caller. URL path and query strategies avoid this entirely since each version already has a distinct cache key.",
    ],
    [
      "Do I need to version my API at all?",
      "Only for breaking changes — additive changes (new fields, new endpoints) should ship unversioned, and clients must be told to ignore unknown fields. Many teams defer versioning entirely by evolving compatibly, then introduce a version marker the first time a genuinely breaking change is unavoidable; when you deprecate, announce dates with Deprecation and Sunset headers.",
    ],
  ],
};

export default seo;
