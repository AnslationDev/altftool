/**
 * Hand-written, answer-first copy for the 13 AltF product suites.
 *
 * Every sentence here was written after reading the code the page actually
 * runs (ProductWorkspace.jsx, @altftool/core/product-utilities,
 * /api/domainops, /api/netcheck, /api/signals). Nothing is inferred from the
 * marketing copy in PRODUCT_SUITE_CATALOG, and nothing that could not be
 * verified in the source is claimed.
 *
 * Deliberate omissions — do not add these back:
 * - No ratings, review counts, user counts or install counts. None exist.
 * - No blanket "runs locally / files never leave your browser" line. It is
 *   false for DomainOps, NetCheck and the API console, and it is false for
 *   several of the tools the directory suites link out to. Each `runsOn`
 *   string states the real path for that one suite.
 *
 * `kind` decides what JSON-LD the page may emit:
 *   "app"       - the page renders a working tool, so SoftwareApplication
 *                 with a free Offer is a true statement.
 *   "directory" - the page is a list of links into other tools. It gets an
 *                 ItemList, not a SoftwareApplication.
 *   "gated"     - nothing ships. No application entity and no Offer.
 */

import { FLOW_ACTIONS } from "@altftool/core/product-utilities";

/** The read-only endpoints offered by the developer console. Shared with
 *  DevelopersWorkspace so the visible list and the console can never diverge. */
export const API_CONSOLE_ENDPOINTS = Object.freeze([
  { value: "/api/signals", label: "GET /api/signals", note: "The AltF Signals catalogue with dataAsOf, count and results." },
  { value: "/api/health", label: "GET /api/health", note: "Deployment health, used to confirm which build is live." },
  { value: "/api/signals?sort=volume", label: "GET /api/signals?sort=volume", note: "The same catalogue sorted by estimated search volume." },
]);

/** Country editions rendered by ImpactWorkspace. Shared so the page can state
 *  the edition count without a second, driftable copy of the number. */
export const IMPACT_EDITIONS = Object.freeze([
  {
    country: "India",
    name: "AltF Bharat",
    sources: [
      ["myScheme", "https://www.myscheme.gov.in/", "Government scheme discovery"],
      ["Startup India", "https://www.startupindia.gov.in/", "Startup recognition and support"],
    ],
  },
  {
    country: "United States",
    name: "AltF USA",
    sources: [["USAGov Benefit Finder", "https://www.usa.gov/benefit-finder", "Federal benefits and financial help"]],
  },
  {
    country: "United Kingdom",
    name: "AltF UK",
    sources: [["GOV.UK Benefits", "https://www.gov.uk/browse/benefits", "Benefits, eligibility and claims"]],
  },
  {
    country: "Canada",
    name: "AltF Canada",
    sources: [["Canada Benefits Finder", "https://www.canada.ca/en/services/benefits/finder.html", "Federal benefits and programs"]],
  },
  {
    country: "Australia",
    name: "AltF Australia",
    sources: [["Business grants finder", "https://business.gov.au/grants-and-programs", "Government grants and business support"]],
  },
]);

/** The checks AltF Security runs. Shared with SecurityWorkspace so the visible
 *  server-rendered list and the audit itself can never disagree, and so the
 *  count on the page is derived rather than typed. */
export const SECURITY_CHECKS = Object.freeze([
  { id: "lang", name: "Document language", guidance: "Add a valid lang attribute to the html element." },
  { id: "title", name: "Unique page title", guidance: "Add a concise title element." },
  { id: "viewport", name: "Viewport metadata", guidance: "Add responsive viewport metadata." },
  { id: "single-h1", name: "One primary heading", guidance: "Use exactly one descriptive H1." },
  { id: "heading-order", name: "Heading order", guidance: "Avoid skipping heading levels." },
  { id: "image-alt", name: "Image alternatives", guidance: "Give every image an alt attribute; decorative images use empty alt." },
  { id: "control-names", name: "Named controls", guidance: "Give links and buttons an accessible name." },
  { id: "form-labels", name: "Form labels", guidance: "Associate every field with a label." },
]);

/** The release gates AltF Vault must clear. Shared with VaultWorkspace. */
export const VAULT_GATES = Object.freeze([
  "Published threat model and abuse review",
  "Independent cryptography and extension audit",
  "Tested recovery model without server-readable secrets",
  "Security incident and disclosure process",
  "Telemetry verified to exclude secret material",
]);

const SUITE_CONTENT = Object.freeze({
  "idea-lab": {
    kind: "app",
    appCategory: "BusinessApplication",
    answer:
      "AltF IdeaLab scores a startup idea you describe - the problem, your first audience, urgency, willingness to pay, how often the problem occurs and how many people it reaches - and returns an evidence score out of 100, a named band, a list of risks to investigate and four validation experiments to run next. It does not search the market, look up competitors or forecast revenue: the score reflects only the evidence you type into the form.",
    runsOn:
      "Your browser. The scoring function is plain deterministic JavaScript and makes no network request, so the idea you describe is never sent to AltFTool.",
    runsOnShort: "In your browser, no network request",
    needs: "A problem description and a first audience, plus four dropdown answers.",
    limits: [
      "No competitor lookup, market sizing, funding data or traffic estimates.",
      "No AI model. The same inputs always return the same score, band, risks and experiments.",
      "The score measures how much evidence you supplied, not whether the idea will succeed.",
      "Nothing is saved. Reloading the page clears the input and the result.",
    ],
    faqs: [
      {
        question: "How is the AltF IdeaLab score calculated?",
        answer:
          "Six weighted components are summed and normalised to a 0-100 scale: how much detail the problem statement carries, how specific the audience is, urgency, problem frequency, willingness to pay and addressable reach. 75 and above reads as Strong signal, 55-74 Promising, 35-54 Needs evidence, and below 35 Early hypothesis.",
      },
      {
        question: "Does AltF IdeaLab use AI to evaluate the idea?",
        answer:
          "No. It is a deterministic scoring function, so identical inputs always produce an identical score, band, risk list and experiment list. There is no language model, no external lookup and no randomness.",
      },
      {
        question: "Is the idea I type stored or sent anywhere?",
        answer:
          "No. The evaluation runs inside the browser tab, issues no network request and keeps no copy. Closing or reloading the page discards both the input and the result.",
      },
    ],
  },

  domainops: {
    kind: "app",
    appCategory: "DeveloperApplication",
    answer:
      "AltF DomainOps reads a domain's public DNS and registration records and returns a readiness score out of 100 with a plain-language finding for each check: address records, nameserver redundancy, mail routing, SPF, DMARC, CAA, RDAP registration data and, if you supply a selector, DKIM. It queries Google Public DNS over HTTPS and the RDAP.org bootstrap service and never connects to the website itself, so it reports nothing about page content, uptime, TLS certificates or performance.",
    runsOn:
      "AltFTool's server queries Google Public DNS over HTTPS and RDAP.org on your behalf. The hostname you type is sent to those providers; no request reaches the inspected site.",
    runsOnShort: "AltFTool server, via public DNS-over-HTTPS and RDAP",
    needs: "A domain name. A DKIM selector is optional and only needed for the DKIM check.",
    limits: [
      "It never contacts the domain itself, so it cannot see the website, its uptime or its TLS certificate.",
      "DKIM is only checked when you supply a selector - selectors cannot be discovered from DNS.",
      "The readiness score weights the published records; it is not a security assessment or a deliverability guarantee.",
      "This suite is in public beta and the check set can change.",
    ],
    faqs: [
      {
        question: "Where does AltF DomainOps get its data?",
        answer:
          "Two public sources, both named in the response: Google Public DNS over HTTPS for the record lookups, and the RDAP.org bootstrap service for registration data. Raw records for every lookup are shown on the page so you can check the finding against the source.",
      },
      {
        question: "Is AltF DomainOps a WHOIS lookup?",
        answer:
          "It uses RDAP, the structured JSON successor to WHOIS, and reports registration, expiration and last-changed events when the registry publishes them. Some registries return no RDAP data, in which case the registration check fails rather than guessing.",
      },
      {
        question: "Does inspecting a domain notify its owner?",
        answer:
          "No request is sent to the domain's own servers, so nothing appears in that site's logs. The lookups go to Google Public DNS and RDAP.org, which see the hostname being queried.",
      },
    ],
  },

  minutes: {
    kind: "app",
    appCategory: "BusinessApplication",
    answer:
      "AltF Minutes turns a pasted meeting transcript into four lists - a summary, decisions, action items and open questions - and exports them as Markdown. It works by keyword and punctuation matching rather than by an AI model: it pulls sentences containing words such as agreed, decided, will, due or follow up, and lines that end in a question mark, so it can only surface wording the transcript already contains.",
    runsOn:
      "Your browser. The extractor is a pure function with no network call, so the transcript you paste is not uploaded to AltFTool.",
    runsOnShort: "In your browser, no network request",
    needs: "A pasted transcript or rough notes of at least 20 characters.",
    limits: [
      "No speech-to-text. It reads text, not audio or video files.",
      "No paraphrasing or AI summary - every line in the output is quoted from your transcript.",
      "The summary is the first four sentences, and each of the other lists caps at 12 items.",
      "It cannot infer an owner or a deadline that the transcript never states.",
    ],
    faqs: [
      {
        question: "How does AltF Minutes decide what counts as a decision or an action?",
        answer:
          "Decisions are sentences containing decided, agreed, approved, confirmed, we will, we'll or final decision. Actions are sentences containing action, todo, will, need to, follow up, owner, due, or a weekday. Open questions are lines ending in a question mark or containing open question, need to clarify or unknown.",
      },
      {
        question: "Can AltF Minutes transcribe a recording?",
        answer:
          "No. It has no audio pipeline. Produce a transcript with your meeting platform's own transcription, then paste the text in.",
      },
      {
        question: "Does the transcript leave my browser?",
        answer:
          "No. The extraction and the Markdown export both run in the page, and the download is generated from an in-memory blob. Nothing is sent to AltFTool.",
      },
    ],
  },

  security: {
    kind: "app",
    appCategory: "SecurityApplication",
    answer:
      "AltF Security runs a fixed set of automated document checks over HTML you paste - language attribute, page title, viewport metadata, a single H1, heading order, image alt text, accessible link and button names, and form labels - and shows the specific fix for each failure. It parses the markup with the browser's own HTML parser and is not a penetration test, a vulnerability scanner or a complete WCAG audit.",
    runsOn:
      "Your browser. The markup is parsed with the built-in DOMParser and the pasted HTML is not uploaded.",
    runsOnShort: "In your browser, parsed with DOMParser",
    needs: "Rendered HTML source pasted into the field. A URL is not accepted.",
    limits: [
      "It cannot fetch a page for you - paste the rendered HTML yourself.",
      "It checks the markup only: no JavaScript execution, no colour contrast, no keyboard testing, no screen-reader behaviour.",
      "Passing every check is not a claim of WCAG conformance. Most success criteria need a human reviewer.",
      "It performs no security scanning of any kind despite the suite name - use the linked password and privacy utilities for that.",
    ],
    faqs: [
      {
        question: "What does the AltF Security audit actually check?",
        answer:
          "Document language, a non-empty title, viewport metadata, exactly one H1, heading levels that do not skip, an alt attribute on every image, an accessible name on every link and button, and a label association for every visible form field. Each failing check returns the remediation to apply.",
      },
      {
        question: "Can I give AltF Security a URL instead of HTML?",
        answer:
          "No. The audit takes pasted markup only. Copy the rendered HTML from your browser's developer tools or view-source, then paste it into the field.",
      },
      {
        question: "Is passing this audit the same as being WCAG compliant?",
        answer:
          "No. These are automated structural checks. Automated testing can only cover a minority of WCAG success criteria, and the rest - meaningful alt text, logical focus order, understandable error messages - require manual review.",
      },
    ],
  },

  authenticator: {
    kind: "app",
    appCategory: "SecurityApplication",
    answer:
      "AltF Authenticator generates 6-digit TOTP verification codes from a Base32 secret using HMAC-SHA-1 over a 30-second time step - the default construction described in RFC 6238 and the same one used by Google Authenticator and Authy. The secret stays in the browser tab's memory: it is never written to storage, never sent to a server and is lost when you close the tab, so this is a verification utility rather than a replacement for an authenticator app.",
    runsOn:
      "Your browser, using the Web Crypto API. The secret is held in component memory only - not in localStorage, not in a cookie and not in any request.",
    runsOnShort: "In your browser, using Web Crypto",
    needs: "The Base32 shared secret from the service you are enrolling with.",
    limits: [
      "No accounts, no sync and no persistence. The secret disappears when the tab closes.",
      "It cannot scan a QR code - paste the Base32 secret the service shows behind the code.",
      "Only the RFC 6238 defaults are supported: 6 digits, a 30-second period and SHA-1.",
      "The backup codes it generates are random strings for your own use; they are not registered with any service.",
    ],
    faqs: [
      {
        question: "Which TOTP algorithm does AltF Authenticator use?",
        answer:
          "HMAC-SHA-1 over an 8-byte counter derived from Unix time divided by a 30-second period, truncated to 6 digits. Those are the RFC 6238 defaults, so codes match Google Authenticator, Authy, 1Password and any other standard TOTP client using the same secret.",
      },
      {
        question: "Is my 2FA secret stored anywhere?",
        answer:
          "No. It lives in the page's React state for as long as the tab is open. It is not written to localStorage or a cookie, and no request carrying it is ever made. Reloading the page clears it and you must paste it again.",
      },
      {
        question: "Should this replace my authenticator app?",
        answer:
          "No. Because nothing is stored, this is a temporary utility for checking or recovering a code, not a place to keep the only copy of an account credential. Keep your secrets in a dedicated authenticator app or a password manager.",
      },
    ],
  },

  netcheck: {
    kind: "app",
    appCategory: "UtilitiesApplication",
    answer:
      "AltF NetCheck measures latency, jitter, download throughput and upload throughput between your browser and the AltFTool server using four ping requests, one 350 KB download and one 96 KB upload - under 500 KB of traffic for a complete run. Because the payloads are deliberately small and the path ends at a single server, the result describes that connection at that moment and is not a measurement of your ISP's maximum line rate.",
    runsOn:
      "Your browser times requests to AltFTool's own /api/netcheck endpoint. No third-party speed-test network is involved and no browsing history or file content is read.",
    runsOnShort: "Timed requests to AltFTool's own endpoint",
    needs: "Nothing. Press the button.",
    limits: [
      "It will under-report fast connections: the transfers are too small and too short to saturate a high-speed link.",
      "It tests one server path, not the multi-server pool a full speed test uses.",
      "It reports no IP address, ISP name, DNS resolver or route.",
      "Results vary between runs with load on your network and on the server.",
    ],
    faqs: [
      {
        question: "Why is AltF NetCheck's download speed lower than other speed tests?",
        answer:
          "It is a bounded test by design. A single 350 KB download over one connection cannot fill a fast link, so the figure reflects a small, realistic request rather than a peak throughput number. It is most useful for comparing runs and for spotting latency and jitter problems.",
      },
      {
        question: "How much data does one AltF NetCheck run use?",
        answer:
          "Less than 500 KB in total: four small ping responses, one 350,000-byte download and one 96,000-byte upload of locally generated random bytes.",
      },
      {
        question: "What do latency and jitter mean here?",
        answer:
          "Latency is the average round-trip time across the four ping requests. Jitter is the variation between them. High jitter with acceptable latency is the usual signature of a connection that struggles with calls and video even though a speed test looks fine.",
      },
    ],
  },

  career: {
    kind: "directory",
    answer:
      "AltF Career is a directory page rather than a tool: it lists the AltFTool utilities for resumes, cover letters, interview questions, skill demand research and take-home salary, and links straight into each one. No work happens on this page, so privacy and data handling depend entirely on the individual tool you open - each one states its own on its page.",
    runsOn: "Nothing runs on this page. It links out to individual tools, each with its own processing model.",
    runsOnShort: "Nothing - this page links out to individual tools",
    needs: "Nothing. Choose the outcome you want and open that tool.",
    limits: [
      "There is no combined career profile, no saved progress and no account.",
      "Nothing on this page processes a resume - the linked tools do that.",
      "Some linked tools send your text to an API; check the privacy label on the tool you open.",
    ],
    faqs: [
      {
        question: "Is AltF Career itself a resume builder?",
        answer:
          "No. It is a routing page. The resume work happens in the linked Resume Maker; this page only helps you pick which utility matches the task you are on.",
      },
      {
        question: "Do the AltF Career tools keep my resume data?",
        answer:
          "That depends on the individual tool, which is why the answer is not given here. Open the tool you need and read its own privacy label - some run entirely in the browser and some call an API.",
      },
    ],
  },

  creator: {
    kind: "directory",
    answer:
      "AltF Creator is a directory page that routes you to the AltFTool utilities for screen recording, subtitle timing, video compression, thumbnail download and YouTube video analysis. It runs nothing itself; each linked tool declares its own processing model, and some of them upload media to a server rather than working in the browser.",
    runsOn: "Nothing runs on this page. The linked media tools each disclose local or remote processing before use.",
    runsOnShort: "Nothing - this page links out to individual tools",
    needs: "Nothing. Pick the stage of the workflow you are on.",
    limits: [
      "There is no combined editor, project file or render queue.",
      "Media processing happens inside the individual tools, not here.",
      "Not every linked tool is browser-only - check each tool's disclosure before uploading media you cannot share.",
    ],
    faqs: [
      {
        question: "Does AltF Creator edit video on this page?",
        answer:
          "No. It is a routing page listing the recording, subtitle, compression, thumbnail and analysis tools. Editing happens inside whichever tool you open.",
      },
      {
        question: "Do the AltF Creator tools upload my video?",
        answer:
          "Some do and some do not, which is why no blanket claim is made here. Each linked media tool states whether it processes in the browser or sends the file to a server, and it says so before you start.",
      },
    ],
  },

  flow: {
    kind: "app",
    appCategory: "UtilitiesApplication",
    answer:
      "AltF Flow chains text transformations into an ordered pipeline you can reorder, re-run and save as a named recipe - trimming whitespace, changing case, sorting lines, removing duplicate lines, formatting JSON, extracting URLs and prepending a timestamp. Every step executes in the browser and recipes are kept in this browser's localStorage, so they are not tied to an account and do not follow you to another device.",
    runsOn:
      "Your browser. The transformations are synchronous string operations with no network call, and saved recipes live in this browser's localStorage.",
    runsOnShort: "In your browser, recipes in localStorage",
    needs: "Text pasted into the input, and at least one action in the pipeline.",
    limits: [
      "Text only. It does not read files, spreadsheets or binary input.",
      "Recipes are stored per browser and capped at the 12 most recently saved - clearing site data deletes them.",
      "There is no scheduling, no triggers and no API. You press Run.",
      "This suite is in public beta and the action list can change.",
    ],
    faqs: [
      {
        question: "Are AltF Flow recipes synced to my account?",
        answer:
          "No. Recipes are written to this browser's localStorage under a single key. They are not uploaded, not tied to a sign-in and not available in another browser or on another device. Clearing site data removes them.",
      },
      {
        question: "Can AltF Flow run on a schedule or from an API?",
        answer:
          "No. It is a manual pipeline: you compose the ordered actions and press Run. There is no trigger, webhook, cron or programmatic entry point.",
      },
      {
        question: "What happens if a step fails?",
        answer:
          "The run stops and the error is shown - Format JSON on input that is not valid JSON is the common case. Earlier steps are not undone in the input box, and the output box keeps its previous value until a run succeeds.",
      },
    ],
  },

  impact: {
    kind: "directory",
    answer:
      "AltF Impact is a curated directory of official government portals for benefits, grants, skills and startup support, organised into country editions for India, the United States, the United Kingdom, Canada and Australia. It does not check eligibility, submit applications or collect any identity information - every entry hands you to the government source, which remains the only authority on current rules and decisions.",
    runsOn: "Nothing is processed here. Selecting a country reveals official external links; the destination authority handles everything else.",
    runsOnShort: "Nothing - curated links to official government sources",
    needs: "Nothing. Choose a country edition.",
    limits: [
      "No eligibility check, benefit calculator or application form.",
      "No identity, income or household information is requested or stored.",
      "It is not affiliated with any government and does not speak for one.",
      "Programmes change. The destination portal is always more current than this list.",
    ],
    faqs: [
      {
        question: "Can AltF Impact tell me whether I qualify for a benefit?",
        answer:
          "No. It deliberately performs no eligibility assessment and asks for no personal details. It points you at the official finder or portal for your country, which is the only place an eligibility answer is authoritative.",
      },
      {
        question: "Is AltF Impact an official government service?",
        answer:
          "No. It is an independent directory of links to official sources such as myScheme, USAGov, GOV.UK, Canada.ca and business.gov.au. AltFTool has no affiliation with those agencies.",
      },
      {
        question: "This suite is marked public beta - what does that mean here?",
        answer:
          "The country editions and the source list are still being expanded and reviewed, so coverage is uneven between countries and entries may be added or replaced.",
      },
    ],
  },

  campus: {
    kind: "directory",
    answer:
      "AltF Campus is a directory page for student work that routes you to the AltFTool utilities for citations, attendance percentage, final grade calculation, quiz building and PDF summarising. The page itself processes nothing; each linked tool carries its own privacy label, and some of them send your text to an API rather than working in the browser.",
    runsOn: "Nothing runs on this page. Each linked tool states its own processing and privacy model.",
    runsOnShort: "Nothing - this page links out to individual tools",
    needs: "Nothing. Pick the task you need.",
    limits: [
      "No student account, no saved coursework and no gradebook.",
      "It does not check work for plagiarism or AI authorship - AltFTool publishes no such tool.",
      "Citation and summarising accuracy is the linked tool's, and output should be checked before submission.",
    ],
    faqs: [
      {
        question: "Does AltF Campus check my work for plagiarism?",
        answer:
          "No. AltFTool does not publish a plagiarism checker or an AI-writing detector, and this page does not imply one. It links to citation, attendance, grade, quiz and PDF utilities only.",
      },
      {
        question: "Is my coursework saved between visits?",
        answer:
          "Not by this page - it stores nothing. Whether an individual tool keeps anything in your browser is stated on that tool's own page.",
      },
    ],
  },

  developers: {
    kind: "app",
    appCategory: "DeveloperApplication",
    answer:
      "AltF API & Widgets is a read-only console for AltFTool's public HTTP endpoints: you send a GET request to /api/signals, /api/signals?sort=volume or /api/health, read the raw JSON response on the page, and copy a matching cURL or fetch snippet. There are no write endpoints, no API keys and no authentication - these are public read routes, and they are rate limited per client.",
    runsOn:
      "Your browser calls AltFTool's own public API routes directly. Responses are rendered as-is, with no proxy and no stored request history.",
    runsOnShort: "Browser requests to AltFTool's public read API",
    needs: "Nothing. Choose an endpoint and send.",
    limits: [
      "GET only. Nothing here creates, updates or deletes data.",
      "No API key, token or account, and therefore no per-key quota - limits are applied per client.",
      "The console offers a fixed endpoint list; it is not a general-purpose HTTP client. Use the linked API Tester for arbitrary requests.",
      "There is no SDK, no webhook and no versioned contract - response shapes can change.",
    ],
    faqs: [
      {
        question: "Do I need an API key to use the AltFTool public API?",
        answer:
          "No. The endpoints exposed here are unauthenticated public reads. Because there is no key, there is no per-key quota either; requests are rate limited per client, and /api/signals allows 60 requests per minute.",
      },
      {
        question: "What does GET /api/signals return?",
        answer:
          "A JSON object with dataAsOf, a count and a results array of the AltF Signals catalogue entries. It accepts q, category, momentum and sort query parameters, where sort is one of opportunity, volume or name.",
      },
      {
        question: "Can I write data through the AltFTool API?",
        answer:
          "No. The documented surface is read-only. There are no POST, PUT or DELETE endpoints in this console and no mechanism to authenticate a write.",
      },
    ],
  },

  vault: {
    kind: "gated",
    answer:
      "AltF Vault is not available and stores nothing. AltFTool has deliberately not shipped a password manager: there is no account storage, no sync, no import and no browser extension, and this page exists to publish the release gates the vault must clear before any of that is enabled. Use the linked password generator, strength checker and text encryptor in the meantime.",
    runsOn: "Nothing. There is no vault, no storage backend and no client to install.",
    runsOnShort: "Nothing is running - the product is not released",
    needs: "Nothing, because there is nothing to use yet.",
    limits: [
      "No password storage, sync, sharing or import is active.",
      "There is no browser extension, mobile app or desktop client.",
      "No waitlist, beta programme or early access exists.",
      "No release date has been set - the gates below are the condition, not a schedule.",
    ],
    faqs: [
      {
        question: "Can I store passwords in AltF Vault today?",
        answer:
          "No. Nothing is stored. Account storage, sync, import and extension access are all switched off, and this page is a release gate rather than a hidden beta.",
      },
      {
        question: "Why has AltFTool not shipped a password manager?",
        answer:
          "Because a password manager has to earn trust before it holds anything. The published conditions are a threat model and abuse review, an independent cryptography and extension audit, a tested recovery model with no server-readable secrets, a security incident and disclosure process, and telemetry verified to exclude secret material.",
      },
      {
        question: "What should I use instead?",
        answer:
          "The password utilities linked from this page cover generation, strength checking and text encryption. For actual credential storage, use an established password manager that has already published an independent audit.",
      },
    ],
  },
});

/**
 * Returns hand-written content for a suite, or null when a suite has been
 * added to PRODUCT_SUITE_CATALOG without copy being written for it. The page
 * renders its answer block, facts table, limits and FAQ only when this is
 * non-null - a new suite gets no content rather than generated filler.
 */
export function getSuiteContent(slug) {
  return SUITE_CONTENT[slug] || null;
}

/** Extra visible detail rendered under the facts table, per suite. Each entry
 *  is real, checkable data already used by the running workspace. */
export function getSuiteCoverage(slug) {
  if (slug === "security") {
    return {
      heading: "Which checks does AltF Security run?",
      intro: "Every paste is measured against the same list, and each failure returns the fix shown here.",
      items: SECURITY_CHECKS.map((check) => `${check.name} - ${check.guidance}`),
    };
  }
  if (slug === "impact") {
    return {
      heading: "Which country editions does AltF Impact cover?",
      intro: "Each edition links only to official government portals for that country.",
      items: IMPACT_EDITIONS.map(
        (edition) => `${edition.name} (${edition.country}) - ${edition.sources.map(([name]) => name).join(", ")}`,
      ),
    };
  }
  if (slug === "vault") {
    return {
      heading: "What must AltF Vault clear before release?",
      intro: "All of these are outstanding. Until every one is met, no password storage is enabled.",
      items: [...VAULT_GATES],
    };
  }
  if (slug === "flow") {
    return {
      heading: "Which actions can an AltF Flow pipeline use?",
      intro: "Add any of these in any order; the pipeline runs them top to bottom.",
      items: FLOW_ACTIONS.map((action) => action.label),
    };
  }
  if (slug === "developers") {
    return {
      heading: "Which endpoints does the AltF API console expose?",
      intro: "All of them are unauthenticated GET requests.",
      items: API_CONSOLE_ENDPOINTS.map((endpoint) => `${endpoint.label} - ${endpoint.note}`),
    };
  }
  return null;
}
