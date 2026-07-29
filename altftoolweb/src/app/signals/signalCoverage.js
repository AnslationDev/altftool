/**
 * Honest coverage map for the 12 AltF Signals research pages.
 *
 * A signal page describes demand for a category of product. That is only
 * useful - and only indexable without becoming a doorway page - if the page
 * states plainly whether AltFTool actually ships anything for that demand.
 * Three of the twelve do not, and those are marked `state: "none"` and served
 * with robots noindex (follow stays on, so the internal links still count).
 *
 * Every verdict below was checked against the repository, not against the
 * catalogue's aspirational `actions` list:
 *   - no plagiarism or originality checker exists under src/tools
 *   - no AI-text detector exists (the "detector" tools are image, face,
 *     language and hardware detectors)
 *   - no AI humanizer or style rewriter exists
 *   - logo-slogan-generator-tool returns slogan text from an API, not images
 *   - no headshot generator exists; the photo tools edit a photo you supply
 *
 * Do not upgrade a verdict without the tool existing first. Dressing up an
 * empty category is exactly what makes these pages worthless to a reader and
 * to an answer engine.
 */

export const COVERAGE_STATES = Object.freeze({
  shipped: "AltFTool ships this",
  partial: "Partly covered",
  none: "Not built",
});

const SIGNAL_COVERAGE = Object.freeze({
  "ai-content-detector": {
    state: "none",
    coverage:
      "AltFTool does not publish an AI content detector: nothing on the site scores text for machine authorship, and the tools linked below compare or count text rather than classify it.",
    faqs: [],
  },

  "plagiarism-checker": {
    state: "none",
    coverage:
      "AltFTool does not publish a plagiarism or originality checker. Nothing on the site compares your text against a corpus of published sources, and the linked word counter and citation generator do not attempt to.",
    faqs: [],
  },

  "ai-humanizer": {
    state: "none",
    coverage:
      "AltFTool does not publish an AI-writing humanizer. The linked text summariser shortens text and the text comparison tool shows differences; neither rewrites wording to change its style or its detectability.",
    faqs: [],
  },

  "ai-logo-generator": {
    state: "partial",
    coverage:
      "AltFTool does not generate logo images. The closest working tools are the Logo & Slogan Generator, which returns slogan and naming text from an API, and the Brand Kit Manager for colours and typography.",
    faqs: [
      {
        question: "Can AltFTool generate a logo image?",
        answer:
          "No. There is no image generation model on AltFTool. The Logo & Slogan Generator produces written slogan and naming ideas, and the Brand Kit Manager stores colours and type choices, but you still need a design tool to draw the mark.",
      },
      {
        question: "What is worth building in the AI logo category?",
        answer:
          "The research below lists the three jobs a stronger product would have to do - logo directions, a colour and type system, and social asset export - because a single generated image is rarely the thing a founder actually needs.",
      },
    ],
  },

  "edit-pdf-online": {
    state: "shipped",
    coverage:
      "AltFTool ships this: AltF PDF Studio at /altflovepdf covers merging, splitting, compressing, converting and protecting PDFs, and the PDF to Word converter handles the most-searched conversion on its own page.",
    faqs: [
      {
        question: "Where can I edit a PDF on AltFTool?",
        answer:
          "AltF PDF Studio at /altflovepdf is the PDF workspace: merge, split, compress, convert and protect are all handled there, and each individual job also has its own tool page.",
      },
      {
        question: "Why does PDF editing show stable rather than rising demand?",
        answer:
          "The category is mature. Search interest for editing a PDF does not spike the way an AI category does, which is why the research below treats consolidation - doing several PDF jobs in one place - as the opportunity rather than novelty.",
      },
    ],
  },

  "whois-domain-lookup": {
    state: "shipped",
    coverage:
      "AltFTool ships this: AltF DomainOps returns RDAP registration data together with DNS, SPF, DMARC and CAA findings in one readable report, and the Domain Checker covers quick single lookups.",
    faqs: [
      {
        question: "Does AltFTool have a WHOIS lookup?",
        answer:
          "Yes, using RDAP - the structured JSON protocol that replaced WHOIS. AltF DomainOps reports registration, expiration and last-changed events when the registry publishes them, alongside the domain's DNS and mail policy records.",
      },
      {
        question: "Why is competition for WHOIS lookups only medium?",
        answer:
          "The head term is dominated by registrars, but the intent behind it is usually diagnostic rather than transactional. The research below treats a single readable report - registration plus DNS plus mail policy - as the differentiator, not the raw record dump.",
      },
    ],
  },

  "dns-health-check": {
    state: "shipped",
    coverage:
      "AltFTool ships this: AltF DomainOps scores a domain's DNS, SPF, DMARC and CAA records with a plain-language finding for each check, and the DNS Propagation Checker shows how a record resolves across public resolvers.",
    faqs: [
      {
        question: "Which DNS checks does AltFTool actually run?",
        answer:
          "AltF DomainOps checks for an A or AAAA address record, at least two nameservers, MX records, an SPF policy, a DMARC policy, a CAA policy, RDAP registration data, and DKIM when you supply a selector. Raw records for every lookup are shown alongside the findings.",
      },
      {
        question: "Is a DNS health check the same as a propagation check?",
        answer:
          "No. A health check asks whether the right records exist and are well formed. A propagation check asks whether a change has reached resolvers around the world yet. AltFTool has a separate tool for each.",
      },
    ],
  },

  "ai-headshot-generator": {
    state: "partial",
    coverage:
      "AltFTool does not generate headshots from a prompt. The AI Passport Photo Maker and the Profile Picture Maker both work on a photo you already have - face detection, background removal and format-correct crops - rather than synthesising a new image.",
    faqs: [
      {
        question: "Can AltFTool create an AI headshot from scratch?",
        answer:
          "No. There is no generative image model on the site. The AI Passport Photo Maker detects the face in a photo you upload and produces compliant passport and visa crops, and the Profile Picture Maker styles an existing photo.",
      },
      {
        question: "What does the passport photo tool do that a headshot generator does not?",
        answer:
          "It targets a specification. Passport and visa photos have exact size, background and head-position rules, so the tool produces a print-ready sheet in the right format instead of an attractive but non-compliant portrait.",
      },
    ],
  },

  "meeting-summary-ai": {
    state: "shipped",
    coverage:
      "AltFTool ships a working version with one important limit: AltF Minutes extracts a summary, decisions, actions and open questions from a pasted transcript by keyword and punctuation matching rather than by an AI model, and it cannot transcribe audio.",
    faqs: [
      {
        question: "Does AltFTool summarise meetings with AI?",
        answer:
          "No. AltF Minutes is deterministic keyword extraction: it pulls sentences containing words such as agreed, decided, will or due, and lines ending in a question mark. Everything in the output is quoted from your transcript, and identical input always gives identical output.",
      },
      {
        question: "Can AltFTool transcribe a meeting recording?",
        answer:
          "No. There is no speech-to-text pipeline. Generate the transcript in your meeting platform, then paste the text into AltF Minutes or the Transcript Action Extractor.",
      },
    ],
  },

  "startup-idea-validator": {
    state: "shipped",
    coverage:
      "AltFTool ships this: AltF IdeaLab scores the evidence behind an idea out of 100 and returns a band, the risks worth investigating and four validation experiments - though it does not research competitors, size a market or forecast revenue.",
    faqs: [
      {
        question: "What does AltFTool's idea validator actually measure?",
        answer:
          "It scores the evidence you supply - problem detail, audience specificity, urgency, frequency, willingness to pay and reach - and normalises it to 0-100. A high score means you have articulated the opportunity well, not that the market has confirmed it.",
      },
      {
        question: "Why is search volume for this term marked as researching?",
        answer:
          "No published estimate is recorded for it in the AltF Signals snapshot. Rather than print a number that has no source, the page shows Researching and leans on the live relative-interest chart above instead.",
      },
    ],
  },

  "website-accessibility-audit": {
    state: "shipped",
    coverage:
      "AltFTool ships part of this: AltF Security runs a fixed set of automated structural checks over HTML you paste, and the Colour Contrast Checker covers contrast ratios. Neither crawls a live URL, and automated checks cannot produce a full WCAG conformance report.",
    faqs: [
      {
        question: "Can AltFTool audit my site's accessibility from a URL?",
        answer:
          "No. AltF Security takes pasted HTML, not a URL, and checks document structure - language attribute, title, viewport, a single H1, heading order, image alt text, accessible control names and form labels. Copy the rendered HTML from developer tools to use it.",
      },
      {
        question: "Is an automated audit enough for WCAG compliance?",
        answer:
          "No. Automated testing covers only a minority of WCAG success criteria. Meaningful alt text, logical focus order, understandable errors and keyboard operability all need a human reviewer, which is why the research below pairs the audit with a keyboard checklist.",
      },
    ],
  },

  "two-factor-authenticator": {
    state: "shipped",
    coverage:
      "AltFTool ships this: AltF Authenticator generates 6-digit TOTP codes from a Base32 secret using the RFC 6238 defaults, and holds the secret in the browser tab's memory only - it is never stored or transmitted, and it is lost when the tab closes.",
    faqs: [
      {
        question: "Does AltFTool store my 2FA secret?",
        answer:
          "No. The secret stays in the page's memory for as long as the tab is open. It is not written to localStorage or a cookie and no request carries it, which also means AltF Authenticator cannot replace a real authenticator app - there is nothing to come back to.",
      },
      {
        question: "Why is opportunity for a private 2FA tool rated lower than the AI categories?",
        answer:
          "Demand is steady rather than growing and the incumbents are free, so the ceiling is low. The research below treats transparency - a local generator that stores nothing and explains what it does - as the only realistic differentiator.",
      },
    ],
  },
});

export function getSignalCoverage(slug) {
  return SIGNAL_COVERAGE[slug] || null;
}

/**
 * A signal with nothing behind it is research, not a product page, and it
 * should not compete in the index for a commercial head term it cannot serve.
 */
export function isSignalIndexable(slug) {
  const coverage = getSignalCoverage(slug);
  return Boolean(coverage) && coverage.state !== "none";
}
