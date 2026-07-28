const seo = {
  title: "Free Privacy Policy Generator — GDPR & CCPA Ready",
  h1: "Privacy Policy Generator",
  metaDescription:
    "Free privacy policy generator for sites, apps and SaaS. One form builds the policy in your browser — GDPR/CCPA sections optional, .txt download.",
  intro:
    "The Privacy Policy Generator turns one form into a complete, Markdown-formatted privacy policy using a deterministic client-side template engine — no AI model and no server call. The business type you type is substring-matched against seven built-in content profiles (e-commerce, SaaS, mobile app, blog, AI tool, startup, website), and each profile supplies its own purpose-of-processing, retention and data-sharing wording instead of one generic paragraph. The document rebuilds 300 ms after your last keystroke, entirely in the page's JavaScript, so the business details, contact email and vendor names you enter are never uploaded — the form is kept only in your browser's localStorage. It produces a drafting starting point, not legal advice; have a qualified lawyer review it before publishing.",
  useCases: [
    "Founders launching a website, SaaS product or mobile app who need a privacy policy page before going live or submitting to the App Store or Google Play",
    "Bloggers and side-project owners who added Google Analytics, AdSense or a newsletter and now need a policy that names those services",
    "Developers drafting a first-pass policy to hand to a lawyer, with the data types, cookies and third-party processors already itemised",
  ],
  benefits: [
    [
      "Built in your browser, not on a server",
      "The tool makes no network requests. The policy is assembled by JavaScript on the page from what you type, and the form state is written only to your browser's localStorage — your company name, contact email and vendor list never leave your device.",
    ],
    [
      "Wording that matches your business type",
      "Enter e-commerce, SaaS, mobile app, blog, AI tool, startup or website and the generator swaps in that profile's data-use purpose, retention period, typical sharing partners and an opening clause written for that model — a mobile app gets device permissions wording, a blog gets public-comment wording.",
    ],
    [
      "Optional GDPR and CCPA sections",
      "Two toggles append a GDPR rights section (access, rectification, erasure, restriction, portability, objection, withdrawal of consent, with a 30-day response commitment) and a CCPA section (know, delete, opt out, non-discrimination, with a 45-day response commitment).",
    ],
    [
      "Free, no signup, no tool branding",
      "Use it as often as you like with no account or email gate. The output carries no AltFTool credit line — the footer names only your own company and copyright year.",
    ],
  ],
  faqs: [
    [
      "Is this privacy policy generator really free?",
      "Yes — it's free with no signup, no account and no usage limit. Everything runs in your browser, so there's no API cost behind it, and the generated policy contains no tool branding or backlink, just a footer naming your company and copyright year.",
    ],
    [
      "What information do I need to generate a privacy policy?",
      "Six fields plus at least one data type. You need the website or app name, website URL, company or owner name, contact email, country and business type, then at least one item ticked under Data Collected (Name, Email, Phone, Payment Info, Usage Data, Device Info, IP Address, Location). If you switch cookies on, you must also pick at least one of the four cookie types — Essential, Analytics, Marketing or Preferences — before the policy appears.",
    ],
    [
      "Is the generated privacy policy GDPR and CCPA compliant?",
      "It gives you GDPR and CCPA sections, but a generated template is not compliance on its own. Toggling GDPR on adds the seven data-subject rights and a 30-day response commitment; toggling CCPA on adds the four California rights and a 45-day response commitment. Whether your actual data practices match what the document says is a legal question — have a qualified lawyer review it before you publish.",
    ],
    [
      "Does the tool send my business details anywhere?",
      "No. There are no fetch or API calls anywhere in the tool's source; the policy text is built by a JavaScript function running in the page. Your entries are saved to your browser's localStorage under the key privacy_policy_generator_form so the form survives a refresh, and clearing your browser's site data for altftool.com removes it.",
    ],
    [
      "Can I download the privacy policy as a PDF or HTML file?",
      "Not directly — the two export options are Copy to clipboard and Download, which saves a .txt file containing the policy in Markdown. Because it's Markdown, you can paste it straight into most CMS editors, or run it through any Markdown-to-HTML or Markdown-to-PDF converter if you need those formats.",
    ],
    [
      "Which business types does it support?",
      "Seven profiles: e-commerce, SaaS, mobile app, blog, AI tool, startup and website. The field is free text and matched by substring, so \"B2B SaaS platform\" resolves to the SaaS profile and \"news blog\" to the blog profile. If nothing matches, the generator falls back to the e-commerce wording, so it's worth typing one of the seven keywords.",
    ],
    [
      "Can the policy name the specific services I use, like Stripe or Google Analytics?",
      "Yes. You can tick five analytics tools (Google Analytics, Mixpanel, Hotjar, Meta Pixel, Custom Analytics), four monetisation methods (Google AdSense, Facebook Ads, Affiliate Marketing, Sponsored Content) and six third-party services (Stripe, PayPal, Firebase, AWS, Cloudflare, OpenAI API). Each selection is listed by name in its own section of the policy; leaving analytics empty produces wording that says you use no third-party analytics.",
    ],
    [
      "How long is the generated policy?",
      "Typically 11 to 13 numbered sections, plus extra sections for advertising and third-party sharing when you select those. The output panel shows a live section count, word count and an estimated reading time calculated at 220 words per minute, alongside a readiness score scored across 10 checklist items.",
    ],
  ],
  steps: [
    "Enter your website or app name, website URL, company or owner name, contact email, country, and business type — use one of the seven recognised keywords (e-commerce, SaaS, mobile app, blog, AI tool, startup, website) to get wording tailored to your model.",
    "Tick the personal data you collect, switch cookies on and choose your cookie types, then select any analytics tools, ad networks and third-party processors you use. Toggle the GDPR and CCPA sections if you serve EU/UK or California users.",
    "The policy rebuilds 300 ms after your last edit — read it through, correct anything that doesn't reflect your real practices, then Copy it or Download it as a .txt Markdown file and have a lawyer review it before publishing.",
  ],
};

export default seo;
