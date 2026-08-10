const seo = {
  title: "Cloud Status Board: GitHub, Cloudflare, OpenAI",
  metaDescription:
    "Reads the Statuspage /api/v2/status.json feed each provider publishes, in parallel, showing every severity indicator and the time it was read.",
  steps: [
    "Open the board — it covers three providers, GitHub, Cloudflare and OpenAI, so there is nothing to type in.",
    "Press Get current result to query each provider's Statuspage /api/v2/status.json feed concurrently, with a 9 second timeout on each one.",
    "Read the Current result panel: the Updated timestamp under Current provider status, then a row per provider with its status description, Statuspage severity indicator and feed URL.",
  ],
  intro:
    "The Cloud Status Board queries the official status APIs of GitHub, Cloudflare and OpenAI on demand and shows each one's current status description and severity indicator side by side, so you can tell in a single view whether an outage is theirs or yours. It reads the Statuspage v2 status.json endpoint each provider publishes, which is the same feed that drives their own status pages. Every reading is timestamped and the providers are queried in parallel, so one unreachable service does not blank the board.",
  useCases: [
    "Your deploy pipeline has stalled and you need to know within seconds whether GitHub is degraded before you start bisecting your own workflow file.",
    "Requests to your app are failing at the edge and you want to check Cloudflare's own indicator rather than trusting a third-party outage-report site fed by user complaints.",
    "An AI feature in your product starts timing out and you need to establish, before opening an incident, whether OpenAI is reporting degraded performance.",
  ],
  benefits: [
    [
      "Straight from the provider",
      "Status comes from each vendor's own Statuspage API, not from crowd-sourced 'is it down' reports that lag and produce false alarms.",
    ],
    [
      "One failure does not hide the rest",
      "The three providers are fetched concurrently and settled independently, so a provider whose API is unreachable is marked Unavailable while the others still report.",
    ],
    [
      "Severity, not just up or down",
      "Each row carries the provider's own indicator alongside the text description, which separates a minor degradation from a major outage.",
    ],
  ],
  faqs: [
    [
      "Which services does the board cover?",
      "Three: GitHub, Cloudflare and OpenAI. Each is read from its published Statuspage endpoint — githubstatus.com, cloudflarestatus.com and status.openai.com — using the /api/v2/status.json path.",
    ],
    [
      "What do the status indicators mean?",
      "They are Statuspage's standard severity levels: none means all systems operational, minor means a partial or degraded service, major means a significant outage, and critical is the most severe. The text description next to it is the wording the provider itself is showing.",
    ],
    [
      "Does it refresh automatically?",
      "No — readings are fetched when you ask for one, with a 9 second timeout per provider, and the result shows the time it was taken. During a live incident, request a fresh reading rather than trusting a board you loaded ten minutes ago.",
    ],
    [
      "It says operational but my service is still broken. Why?",
      "A green status only means the provider has not yet posted an incident. Vendors often lag real degradation by several minutes, and regional or account-specific problems frequently never appear on a global status page at all — check the provider's incident history and your own error logs as well.",
    ],
  ],
};

export default seo;
