// Verified paid-product corpus for /deals.
//
// READ THIS BEFORE EDITING.
//
// Two kinds of data live here and they must never be blurred together:
//
//   1. RESEARCHED fields — `price`, `freeTier`, `notReplaced`, `checkedOn`,
//      `confidence`, `sources`. Every figure was read off the vendor's own
//      pricing page on the date in `checkedOn`. Do not round a price, do not
//      convert a currency, and do not fill in a number that was not read. If a
//      vendor changes their plans, re-read the source and edit the string.
//
//   2. AUTHORED fields — `capability`, `freeTierShort`. These are ours. They
//      must describe the researched data accurately and add nothing to it.
//
// `price.status` is the honesty switch and it is set by hand, never inferred:
//
//   "usd"      — a USD figure was read on the vendor's own page. Publishable.
//   "regional" — the vendor geo-localises pricing and served a non-USD
//                storefront. The figure that was actually read is published in
//                the currency it was read in, with `caveat` explaining why it
//                is not a USD price. NEVER convert it.
//   "free"     — the product has no paid tier at all. This is a $0 product,
//                not a product whose price we failed to verify. These entries
//                exist because a comparison that only lists expensive
//                alternatives is an advert; sometimes the honest answer is
//                "the alternative is free too".
//
// Nine records are reused from src/app/alternatives/data/incumbents.js rather
// than re-researched — see INCUMBENT_PRODUCTS at the bottom.

import { INCUMBENTS } from "@/app/alternatives/data/incumbents";

/** Products researched directly for this family on 2026-07-28. */
const RESEARCHED_PRODUCTS = {
  photoshop: {
    key: "photoshop",
    name: "Adobe Photoshop",
    homepage: "https://www.adobe.com/products/photoshop.html",
    capability:
      "Raster image editing: crop, resize, rotate, format conversion (JPG/PNG/WebP), background removal, and retouch/filter adjustments.",
    price: {
      status: "usd",
      headline: "US$22.99/month",
      detail: "single-app Photoshop plan, annual commitment billed monthly",
      annual: "US$263.88/year (annual prepaid option, stated in Adobe's own FAQ)",
      caveat: "",
    },
    freeTierShort: "None — a 7-day trial that auto-converts to a paid membership.",
    freeTier:
      "None — 7-day free trial only, which auto-converts to a paid membership. Adobe's FAQ states Photoshop cannot be bought outright and is available only via subscription; it redirects free users to the separate Adobe Express free plan.",
    notReplaced: [
      "Layered, non-destructive editing — adjustment layers, masks and smart objects that can be reopened and re-edited later.",
      "Generative Fill and generative AI editing, with 25 generative credits per month.",
      "Desktop-class colour management for print (CMYK, 16-bit) and 100GB of synced cloud storage.",
    ],
    checkedOn: "2026-07-28",
    confidence: "high",
    sources: [
      "https://www.adobe.com/products/photoshop/plans.html",
      "https://www.adobe.com/creativecloud/plans.html",
    ],
  },

  "canva-pro": {
    key: "canva-pro",
    name: "Canva Pro",
    homepage: "https://www.canva.com/",
    capability:
      "Background removal, image resize and export to set dimensions, and template-style graphic and social-image editing.",
    price: {
      status: "regional",
      headline: "₹500/month, or ₹4,000/year for one person",
      detail: "India storefront, yearly billing advertised as 'Save from 16%'",
      annual: "",
      caveat:
        "Not a USD price. Canva serves IP-localised pricing and overrode the /en_us/ locale path with the India storefront, so no USD figure was readable on 2026-07-28. Business was listed at ₹6,800/year per person.",
    },
    freeTierShort: "Canva Free is ₹0 and open to anyone, with no numeric caps advertised.",
    freeTier:
      "Canva Free is ₹0 and open to anyone. The pricing page advertises no numeric caps for the free plan; the stated differences are that Free gets a shared allowance across Standard and Premium AI only, while premium content, premium templates and higher AI allowances sit behind Pro.",
    notReplaced: [
      "Brand Kit — locking brand fonts, colours and logos so they apply consistently across every design and teammate.",
      "Magic Resize, which reformats one finished design into many platform sizes at once.",
      "A licensed multi-million-item template, stock photo and font library.",
    ],
    checkedOn: "2026-07-28",
    confidence: "low",
    sources: ["https://www.canva.com/pricing/", "https://www.canva.com/en_us/pricing/"],
  },

  "adobe-color": {
    key: "adobe-color",
    name: "Adobe Color",
    homepage: "https://color.adobe.com/",
    capability:
      "Colour-wheel harmony palette generation (complementary, analogous, triadic, monochromatic), palette extraction from an uploaded image, and WCAG contrast checking.",
    price: {
      status: "free",
      headline: "Free",
      detail: "no paid tier exists",
      annual: "",
      caveat:
        "This is a $0 product, not a product whose price we failed to verify. There is nothing to save by switching away from it.",
    },
    freeTierShort: "The whole product is free; saving a palette needs a free Adobe account.",
    freeTier:
      "Free, and there is no paid tier to quote. color.adobe.com now serves Adobe's Express-branded colour tools; the colour wheel, contrast checker, gradient/palette extractor and Explore feed are all offered under 'Get Started for Free'. Saving a palette to a library requires a free Adobe account.",
    notReplaced: [
      "Saving palettes into Creative Cloud Libraries so they sync directly into Photoshop, Illustrator and InDesign swatch panels.",
      "The community Explore feed of public, searchable user palettes and trend collections.",
    ],
    checkedOn: "2026-07-28",
    confidence: "high",
    sources: ["https://color.adobe.com/create/color-wheel"],
  },

  "coolors-pro": {
    key: "coolors-pro",
    name: "Coolors Pro",
    homepage: "https://coolors.co/",
    capability:
      "Generating colour palettes, checking palette contrast for accessibility, viewing shade and tint variations, and exporting palettes in developer formats.",
    price: {
      status: "regional",
      headline: "₹231/month billed yearly (₹2,772/year)",
      detail: "India storefront; ₹385/month on monthly billing",
      annual: "",
      caveat:
        "Not a USD price. Coolors prices through Paddle with a 31-currency selector that defaults to the visitor's region; no USD figure appears anywhere in the page source and the selector could not be switched on 2026-07-28.",
    },
    freeTierShort:
      "Real free tier: 5 colours per palette, 10 saved palettes, 1 project, ads shown.",
    freeTier:
      "Real, with hard caps stated on the pricing page: palettes of up to 5 colours, save up to 10 palettes, 1 project and 1 collection, save up to 5 individual colours, pick colours from an image, collages with limited options, basic public profile — and ads are shown.",
    notReplaced: [
      "Coolors AI palette generation with 3,000 credits per month.",
      "A persistent cloud account: unlimited saved palettes, projects and collections synced across devices.",
      "Advanced export presets targeted at Web/UI/Print/Motion, plus custom-logo PDF export.",
    ],
    checkedOn: "2026-07-28",
    confidence: "low",
    sources: ["https://coolors.co/pricing"],
  },

  camtasia: {
    key: "camtasia",
    name: "Camtasia",
    homepage: "https://www.techsmith.com/camtasia/",
    capability:
      "Trimming, cropping and exporting a screen recording or video file without a watermark.",
    price: {
      status: "regional",
      headline: "Essentials ₹7,099.00/year",
      detail:
        "India storefront; Starter ₹4,175.29/yr, Create ₹9,999.00/yr, Pro ₹29,999.00/yr, all billed yearly",
      annual: "",
      caveat:
        "Not a USD price. techsmith.com geolocated this session to India and served only INR; all four tiers rendered as 'Loading…' on /all-products/ and the education store also returned INR, so no USD figure was readable on the vendor's own site on 2026-07-28. Essentials is quoted rather than Starter because Starter still watermarks exports.",
    },
    freeTierShort:
      "Free Camtasia has every editing feature and no time limit, but watermarks every export.",
    freeTier:
      "Free Camtasia gives access to all editing features with no time limit, but every exported video carries a TechSmith watermark until you upgrade. The paid Starter tier is also watermarked, so Essentials is the cheapest tier that actually unlocks watermark-free export.",
    notReplaced: [
      "Multi-track timeline editing with keyframed animations, callouts, cursor-zoom effects and quizzing/SCORM export for e-learning.",
      "Native high-framerate screen and webcam capture with system audio, which a browser tool cannot record at the OS level.",
    ],
    checkedOn: "2026-07-28",
    confidence: "low",
    sources: [
      "https://www.techsmith.com/store/camtasia",
      "https://www.techsmith.com/camtasia/",
      "https://www.techsmith.com/all-products/",
      "https://www.techsmith.com/store/camtasia/education",
    ],
  },

  "clipchamp-premium": {
    key: "clipchamp-premium",
    name: "Microsoft Clipchamp Premium",
    homepage: "https://www.microsoft.com/en-us/microsoft-365/clipchamp",
    capability: "Exporting an edited video at 4K (UHD) rather than being capped at 1080p.",
    price: {
      status: "usd",
      headline: "US$7.00 per user/month",
      detail: "paid yearly, listed as 'Clipchamp Editor Premium' on microsoft.com",
      annual:
        "US$84.00 per user/year, derived from the advertised US$7.00 user/month paid-yearly rate — Microsoft advertises the monthly-equivalent figure, not an annual total",
      caveat:
        "The cheaper Clipchamp Editor Standard at US$3.00 user/month paid yearly does NOT unlock 4K; it caps at 1080p. For personal accounts the premium features come bundled with Microsoft 365 Personal at US$99.99/year or Family at US$129.99/year; a standalone personal Premium subscription exists but Microsoft displays no figure for it.",
    },
    freeTierShort:
      "Genuinely generous: unlimited watermark-free exports up to 1080p, plus trim, crop and recording.",
    freeTier:
      "Genuinely generous: unlimited watermark-free exports at up to 1080p HD, trim/crop/resize/rotate, screen, camera and voice recording, AI video and audio editing tools, and a free stock asset library. The 1080p ceiling and premium stock/brand-kit lockout are the only real constraints.",
    notReplaced: [
      "A full multi-track timeline editor with transitions, keyframes and a brand kit that enforces saved logos, colours and fonts across projects.",
      "Deep Microsoft 365 integration — saving to OneDrive/SharePoint and publishing to Microsoft Stream with per-viewer engagement analytics.",
    ],
    checkedOn: "2026-07-28",
    confidence: "medium",
    sources: [
      "https://www.microsoft.com/en-us/microsoft-365/clipchamp",
      "https://clipchamp.com/en/pricing/",
      "https://support.microsoft.com/en-us/topic/what-clipchamp-products-are-there-and-what-s-their-cost-e0e28eb8-cca3-445c-aefb-ed0dd0bbfa1f",
    ],
  },

  "otter-business": {
    key: "otter-business",
    name: "Otter.ai Business",
    homepage: "https://otter.ai/pricing",
    capability:
      "Unlimited speech-to-text transcription of meetings and uploaded audio/video files, plus team admin controls.",
    price: {
      status: "usd",
      headline: "US$30.00 per user/month",
      detail: "billed monthly (Business tier)",
      annual:
        "US$19.99 per user/month billed annually — US$239.88 per user/year, advertised as 33% savings",
      caveat:
        "The cheaper Pro tier (US$16.99/user/month monthly, US$8.33/user/month billed annually) does NOT unlock unlimited transcription: it caps at 1,200 in-app recording minutes and 10 file imports per month.",
    },
    freeTierShort: "Basic is free forever: 300 minutes/month, 30 minutes per conversation.",
    freeTier:
      "Basic is free forever: 300 transcription minutes per month, capped at 30 minutes per conversation, and only 3 file imports for the lifetime of the account.",
    notReplaced: [
      "Autonomous meeting attendance — the Otter bot joins Zoom, Google Meet and Teams calls on a schedule via calendar sync, records without a human present, and can sit in 3 concurrent meetings.",
      "Multi-speaker diarization with trained voice-print identification that names each speaker.",
      "Shared team workspaces with activity logs and usage analytics.",
    ],
    checkedOn: "2026-07-28",
    confidence: "high",
    sources: ["https://otter.ai/pricing", "https://otter.ai/pricing?currency=USD"],
  },

  "fireflies-pro": {
    key: "fireflies-pro",
    name: "Fireflies.ai Pro",
    homepage: "https://fireflies.ai/pricing/",
    capability:
      "Downloading transcripts, summaries and recordings, plus 8,000 minutes of stored transcription per seat.",
    price: {
      status: "usd",
      headline: "US$18.00 per seat/month",
      detail: "billed monthly (Pro tier)",
      annual:
        "US$10.00 per seat/month billed annually — US$120.00 per seat/year, which Fireflies advertises as the headline price",
      caveat: "",
    },
    freeTierShort:
      "Unusually generous: unlimited transcription and AI summaries, but no downloads.",
    freeTier:
      "Unusually generous and worth stating honestly: the Free plan includes unlimited transcription and unlimited AI meeting summaries in 100+ languages, plus the AskFred assistant and meeting search. The real limits are 400 minutes of stored recording per team, 20 AI credits, no video recording, no downloading of transcripts or recordings, and limited integrations.",
    notReplaced: [
      "A notetaker bot that auto-joins Zoom, Meet, Teams and Webex from calendar sync and captures the call without anyone hosting it.",
      "CRM write-back — pushing call summaries, action items and conversation-intelligence metrics (talk-time ratio, sentiment, monologue detection) into Salesforce, HubSpot and Slack automatically.",
    ],
    checkedOn: "2026-07-28",
    confidence: "high",
    sources: ["https://fireflies.ai/pricing", "https://fireflies.ai/pricing/"],
  },

  freshbooks: {
    key: "freshbooks",
    name: "FreshBooks",
    homepage: "https://www.freshbooks.com",
    capability:
      "Creating and sending a professional itemized invoice — branded template, line items, tax, totals — as a PDF or link.",
    price: {
      status: "usd",
      headline: "US$23.00/month",
      detail: "Lite plan, monthly billing",
      annual: "",
      caveat:
        "Displayed as US$2.30/mo under a '90% Off for 3 Months' promotion, with the page stating 'Was $23.00'. The Monthly/Yearly toggle advertises 'Extra 10% Off' for yearly but FreshBooks displays no explicit annual dollar figure, so none is published here.",
    },
    freeTierShort: "None — a 30-day free trial and a 30-day money-back guarantee.",
    freeTier:
      "None. FreshBooks has no free plan — only a 30-day free trial ('Try It Free') plus a 30-day money-back guarantee.",
    notReplaced: [
      "Actually collecting the money: card, ACH bank transfer, Apple Pay, Google Pay and Buy Now Pay Later payments taken against the invoice.",
      "Chasing unpaid invoices automatically with scheduled late-payment reminders and automatic late fees.",
      "The surrounding bookkeeping — expense tracking, receipt scanning, financial and tax-time reports, and direct access for your accountant.",
    ],
    checkedOn: "2026-07-28",
    confidence: "high",
    sources: ["https://www.freshbooks.com/pricing"],
  },

  "zoho-invoice": {
    key: "zoho-invoice",
    name: "Zoho Invoice",
    homepage: "https://www.zoho.com/us/invoice/",
    capability:
      "Creating and sending a professional itemized invoice — branded template, line items, tax, totals.",
    price: {
      status: "free",
      headline: "Free",
      detail: "US$0.00, no paid tier exists",
      annual: "",
      caveat:
        "Zoho's own US pricing page states Zoho Invoice 'has been made free to cater to the needs of small business owners, freelancers, and entrepreneurs.' Businesses that outgrow it are upsold to Zoho Billing, a separate paid product with its own pricing.",
    },
    freeTierShort:
      "Everything is free, capped at 2 users, 3 projects and 500 invoices a year, with Zoho branding.",
    freeTier:
      "The entire product is free — US$0.00. Limits: up to 2 users, maximum 3 projects, 500 invoices per year, and a 'Powered by Zoho Invoice' branding line on invoices. Customers are unlimited.",
    notReplaced: [
      "Client and project time tracking, payment-gateway collection, automated payment reminders and multi-currency invoicing.",
      "A persistent account that keeps your customer and invoice history across sessions.",
    ],
    checkedOn: "2026-07-28",
    confidence: "high",
    sources: [
      "https://www.zoho.com/us/invoice/pricing/",
      "https://www.zoho.com/invoice/pricing/",
    ],
  },

  "tableau-creator": {
    key: "tableau-creator",
    name: "Tableau Creator",
    homepage: "https://www.tableau.com/pricing",
    capability: "Building charts and dashboards from a spreadsheet or CSV file.",
    price: {
      status: "usd",
      headline: "US$75.00 per user/month",
      detail: "billed annually, Tableau Standard edition of Tableau Cloud",
      annual:
        "US$900.00 per user/year, shown directly by Tableau's selector as the 1-license subtotal",
      caveat:
        "Enterprise Creator is US$115.00 per user/month (US$1,380.00 per user/year); the entry figure quoted here is the Standard Creator. Tableau states the solution requires an annual contract.",
    },
    freeTierShort:
      "No free tier of the paid platform, but Tableau Desktop Free Edition and Tableau Public exist.",
    freeTier:
      "No free tier of the paid platform, but Tableau does offer 'Tableau Desktop Free Edition' — full local authoring against Excel, CSV and database files stored on your own machine, with no sharing, collaboration or governance. Tableau Public is also free. A free trial of Tableau Cloud is offered.",
    notReplaced: [
      "Governed, live connections to enterprise data sources with scheduled refresh, row-level security and permissions.",
      "Publishing dashboards to a shared Tableau Cloud/Server site where colleagues subscribe, comment and receive data-driven alerts.",
      "Tableau Prep Builder for repeatable multi-source data cleaning pipelines, plus Tableau Pulse/Tableau Agent for AI-generated metric insights.",
    ],
    checkedOn: "2026-07-28",
    confidence: "high",
    sources: [
      "https://www.tableau.com/product-and-pricing-selector",
      "https://www.tableau.com/pricing/cloud",
      "https://www.tableau.com/pricing",
    ],
  },

  "power-bi-pro": {
    key: "power-bi-pro",
    name: "Microsoft Power BI Pro",
    homepage: "https://www.microsoft.com/en-us/power-platform/products/power-bi/",
    capability: "Building charts and dashboards from a spreadsheet or CSV file.",
    price: {
      status: "usd",
      headline: "US$14.00 per user/month",
      detail: "paid yearly; Pro is the cheapest paid tier and the one that unlocks sharing",
      annual: "",
      caveat:
        "Microsoft advertises only the per-user/month figure and does not display an annual total, so no annual number is published here. Power BI Premium Per User is US$24.00 per user/month paid yearly.",
    },
    freeTierShort:
      "Free account with no card required — but you must upgrade to Pro to share a report.",
    freeTier:
      "Yes — a free Power BI account, no credit card required, which lets you 'Create rich, interactive reports that put visual analytics at your fingertips.' The catch is that you must upgrade to Pro to share reports with anyone. The free tier is also capped at 8 data refreshes/day versus 48/day on Premium Per User.",
    notReplaced: [
      "Sharing and collaboration: publishing reports to Power BI workspaces and apps, governed by Microsoft Entra identity, row-level security and tenant admin policy.",
      "Scheduled automatic data refresh from governed enterprise sources rather than a one-off file upload.",
      "Deep Excel and Microsoft 365 integration — Pro is bundled into Microsoft 365 E5 and Office 365 E5.",
    ],
    checkedOn: "2026-07-28",
    confidence: "high",
    sources: ["https://www.microsoft.com/en-us/power-platform/products/power-bi/pricing"],
  },

  lucidchart: {
    key: "lucidchart",
    name: "Lucidchart",
    homepage: "https://www.lucidchart.com/pages/",
    capability:
      "Building and editing an unlimited number of diagrams and flowcharts with no shape-count cap per document.",
    price: {
      status: "usd",
      headline: "US$9/month",
      detail: "Individual plan billed annually; US$15/month month-to-month",
      annual: "US$108/year (Individual)",
      caveat:
        "The price card itself prints only 'US$9 USD' with no billing period; the period was resolved from Lucid's own levelPrices API loaded by that same page (individual = 10800 cents/yr, individual-monthly = 1500 cents/mo).",
    },
    freeTierShort: "Free plan: 3 editable documents, 75 shapes per document, no card required.",
    freeTier:
      "Free plan: 3 editable Lucidchart documents, 75 shapes per document, 100 templates, basic Visual Activities, basic data linking, presentation mode, commenting. No credit card required.",
    notReplaced: [
      "Real-time multi-user co-editing on a hosted account with commenting and revision history (Team tier).",
      "Visio (.vsdx) import and export.",
      "Data-linked diagrams and Jira/Confluence/Microsoft 365/Salesforce integrations that pull live records onto the canvas.",
    ],
    checkedOn: "2026-07-28",
    confidence: "medium",
    sources: [
      "https://lucid.app/pricing/lucidchart",
      "https://users.lucid.app/visitors/95uauo/levelPrices?currency=USD",
    ],
  },

  miro: {
    key: "miro",
    name: "Miro",
    homepage: "https://miro.com/",
    capability:
      "An infinite collaborative whiteboard canvas with an unlimited number of editable boards.",
    price: {
      status: "usd",
      headline: "US$8/month per member",
      detail: "billed yearly (Starter plan) — page wording: '$8/month per member, billed yearly'",
      annual: "",
      caveat:
        "Miro does not print an annual total on the pricing page; the yearly toggle states 'Yearly (save 20%)'.",
    },
    freeTierShort: "Free plan: unlimited boards, but only the 3 most recent stay editable.",
    freeTier:
      "Free plan: US$0. You can create and share unlimited boards, but only the 3 most recent boards remain editable. Includes 7,000+ templates, Docs/Tables/Slides/Kanban formats, AI exploration and 250+ integrations.",
    notReplaced: [
      "Live multiplayer collaboration on a persistent cloud workspace — visible cursors, visitor editing, and facilitation tools (timer, voting, Engage activities).",
      "Two-way integrations that sync board items with Jira, Asana, Linear, ClickUp and Azure DevOps.",
      "SSO and centralized admin.",
    ],
    checkedOn: "2026-07-28",
    confidence: "high",
    sources: ["https://miro.com/pricing/"],
  },

  "beyond-compare": {
    key: "beyond-compare",
    name: "Beyond Compare",
    homepage: "https://www.scootersoftware.com/",
    capability: "Side-by-side text and file difference comparison with syntax highlighting.",
    price: {
      status: "usd",
      headline: "US$35 per user, one-time",
      detail: "perpetual licence, Beyond Compare 5 Standard Edition, 1–4 seats",
      annual:
        "None — one-time purchase. Vendor states: 'The license fee is a one time purchase. There are no annual renewal fees.'",
      caveat: "Pro Edition is US$70 per user.",
    },
    freeTierShort: "None — free evaluation only, then a licence must be purchased.",
    freeTier:
      "None. Free evaluation only — 'Beyond Compare may be evaluated for free, but a license must be purchased for continued use.'",
    notReplaced: [
      "Folder and drive comparison plus synchronization across thousands of files at once, including FTP/SFTP and cloud endpoints (Pro).",
      "True 3-way merge against a common ancestor and source-control (SCC) integration (Pro), which a stateless web diff cannot do.",
    ],
    checkedOn: "2026-07-28",
    confidence: "high",
    sources: [
      "https://www.scootersoftware.com/shop",
      "https://www.scootersoftware.com/v5help/standard_vs_pro.html",
    ],
  },

  "araxis-merge": {
    key: "araxis-merge",
    name: "Araxis Merge",
    homepage: "https://www.araxis.com/merge/",
    capability:
      "Two-way side-by-side comparison of text files and folders with a split-view diff.",
    price: {
      status: "usd",
      headline: "US$129 one-time",
      detail:
        "Standard Edition perpetual licence covering both Windows and macOS, first year of support and upgrades included",
      annual:
        "None required — perpetual licence. After year one, support/upgrade entitlement is optionally renewable at US$29/year (Standard) or US$49/year (Professional)",
      caveat: "Professional Edition is US$269.",
    },
    freeTierShort: "None — a 30-day free trial, then a licence must be purchased.",
    freeTier:
      "None — 30-day free trial only ('Try Free for 30 Days'), then a licence must be purchased.",
    notReplaced: [
      "Comparing text extracted from PDFs and office documents, plus binary and image comparison.",
      "Folder synchronization on the local filesystem.",
      "Three-way file and folder comparison and merging against a common ancestor with Git integration (Professional).",
    ],
    checkedOn: "2026-07-28",
    confidence: "high",
    sources: ["https://www.araxis.com/buy/index.en", "https://www.araxis.com/merge/index.en"],
  },

  typora: {
    key: "typora",
    name: "Typora",
    homepage: "https://typora.io/",
    capability: "Writing and previewing Markdown in a live WYSIWYG editor.",
    price: {
      status: "usd",
      headline: "US$14.99 one-time",
      detail: "without tax; one licence covers up to 3 devices",
      annual: "None — one-time purchase, not a subscription",
      caveat: "",
    },
    freeTierShort: "None — a 15-day free trial, then purchase is required.",
    freeTier: "None — 15-day free trial, then purchase required.",
    notReplaced: [
      "A native offline desktop app that opens and saves real .md files on disk with a sidebar file tree, so a whole folder of notes is managed in place.",
      "Export to PDF, Word, LaTeX, HTML and other formats via bundled pandoc integration.",
      "Custom CSS themes applied across every document.",
    ],
    checkedOn: "2026-07-28",
    confidence: "high",
    sources: ["https://typora.io/"],
  },

  "ia-writer": {
    key: "ia-writer",
    name: "iA Writer",
    homepage: "https://ia.net/writer/",
    capability: "Distraction-free Markdown writing with formatted preview and export.",
    price: {
      status: "usd",
      headline: "US$29.99 one-time (Windows)",
      detail: "the cheapest platform; Mac is US$49.99 and iPhone & iPad is US$49.99, each one-time",
      annual:
        "None on Mac, Windows, iPhone or iPad — one-time payment per platform. Android is sold as a subscription and no price is shown for it",
      caveat:
        "iA prices per region: the same page served to an India IP on 2026-07-28 showed Rs 3,300 (Mac) / Rs 2,640 (Windows) / Rs 3,300 (iPhone & iPad).",
    },
    freeTierShort: "None — a 7-day free trial with no card required, per platform.",
    freeTier:
      "None — 7-day free trial, no credit card required (Mac and Windows). Payment is per platform.",
    notReplaced: [
      "A native offline app with its own document library that syncs the same files across Mac, iPad and iPhone via iCloud or Dropbox.",
      "The syntax-highlighting style check that colour-codes adjectives, nouns and filler as you write.",
      "Export with custom templates to Word, PDF and HTML.",
    ],
    checkedOn: "2026-07-28",
    confidence: "medium",
    sources: ["https://ia.net/writer/pricing"],
  },

  "imgflip-pro": {
    key: "imgflip-pro",
    name: "Imgflip Pro",
    homepage: "https://imgflip.com/pro",
    capability: "Creating memes without the imgflip.com watermark, and without ads.",
    price: {
      status: "usd",
      headline: "US$5.95/month",
      detail:
        "Pro Basic billed monthly (US$4.95/month billed yearly, 'save 17%') — the cheapest tier that removes the watermark on memes",
      annual: "Pro Basic US$4.95/month billed yearly; the page shows no annual total",
      caveat:
        "Full Imgflip Pro — needed to remove the watermark on GIFs and animated memes — is US$14.95/month billed monthly or US$11.95/month billed yearly.",
    },
    freeTierShort:
      "Unlimited meme creation from 1M+ templates, but every export carries the imgflip watermark.",
    freeTier:
      "Free: access to 1M+ meme templates and unlimited meme creation, but every meme/GIF carries the imgflip.com watermark, ads are shown, no AI creation tools or background removal, and GIFs are capped (max 160 frames, 360x360, 12M total resolution, no sound, 24-second video segments).",
    notReplaced: [
      "A hosted, searchable library of over a million meme templates, plus AI meme/image generation and background removal running on their servers.",
      "Hosted publishing — permanent imgflip URLs, the public community feed, an API and a Slack app.",
    ],
    checkedOn: "2026-07-28",
    confidence: "high",
    sources: ["https://imgflip.com/pro", "https://imgflip.com/pro-basic"],
  },
};

// Records reused from the /alternatives corpus rather than re-researched.
// `capability` and `freeTierShort` are authored here; every figure comes
// straight out of incumbents.js, which carries its own provenance rules.
//
// `priceStatus` is set by hand per entry because the source strings mix USD
// figures with geo-localised INR ones and an empty `paidPrice` means "no paid
// tier exists", never "unknown".
const INCUMBENT_PRODUCTS = {
  "remove-bg": {
    priceStatus: "regional",
    priceHeadline: "Lite ₹539.10/month (₹6,469.20 billed yearly)",
    priceDetail: "India storefront; pay-as-you-go from ₹200 for 3 credits",
    priceCaveat:
      "Not a USD price — remove.bg geo-localises its pricing page and these are the INR figures shown to an India IP. Pro is ₹2,385/month and Volume+ ₹5,355/month. Even paid plans are credit-capped: Lite is 40 credits per month, Pro 200.",
    capability: "Removing the background from a photo and downloading the cutout.",
    freeTierShort:
      "Website output is a 0.25-megapixel preview; the full-resolution file costs 1 credit.",
  },
  "adobe-acrobat-online": {
    priceStatus: "usd",
    priceHeadline: "US$19.99/month",
    priceDetail: "Acrobat Pro, annual plan billed monthly; Standard is US$14.99/month",
    priceCaveat: "Acrobat Express is US$9.99/month and Acrobat Studio US$24.99/month.",
    capability: "Merging, splitting, reordering and compressing PDF pages online.",
    freeTierShort:
      "One free transaction signed out; one premium transaction per rolling 30 days signed in.",
  },
  smallpdf: {
    priceStatus: "regional",
    priceHeadline: "Pro ₹979.00/month",
    priceDetail: "India storefront, monthly billing; yearly billing advertised at -30%",
    priceCaveat:
      "Not a USD price — the Smallpdf pricing page is geo-localised and rendered in INR when checked.",
    capability: "Merging, compressing and editing PDF pages online.",
    freeTierShort:
      "An unpublished daily download limit across nearly every tool; batch and OCR-to-Office are Pro-only.",
  },
  tinypng: {
    priceStatus: "usd",
    priceHeadline: "US$3.25/month",
    priceDetail: "Web Pro billed annually, per user; Web Ultra is US$12.42/month",
    priceCaveat: "",
    capability: "Compressing PNG, JPG and WebP images to a smaller file size.",
    freeTierShort: "20 compressions per batch, 5 MB per image, 3 format conversions per session.",
  },
  "kraken-io": {
    priceStatus: "usd",
    priceHeadline: "US$5/month (US$50/year)",
    priceDetail: "Micro plan; Basic US$9/mo, Advanced US$19/mo, Premium US$39/mo",
    priceCaveat:
      "Paid plans are monthly data quotas — 500 MB (Micro) to 60 GB (Enterprise) — with overage billed at US$5/GB down to US$1/GB.",
    capability: "Compressing images to a smaller file size.",
    freeTierShort: "1 MB per image, 20 files per batch; resizing and conversion are PRO-only.",
  },
  "123apps": {
    priceStatus: "regional",
    priceHeadline: "₹190/month, or ₹1,824/year",
    priceDetail: "India storefront; yearly billing advertised at -20%",
    priceCaveat:
      "Not a USD price — 123apps displayed these figures in INR to our region when checked.",
    capability: "Trimming and converting short video and audio files, including video to GIF.",
    freeTierShort: "5 files per day, 500 MB maximum per file, ads shown.",
  },
  freeconvert: {
    priceStatus: "usd",
    priceHeadline: "US$12.99/month",
    priceDetail: "Basic, monthly billing; Standard US$24.99/mo, Pro US$29.99/mo",
    priceCaveat: "Yearly billing is advertised as 'Get 2 months free'.",
    capability: "Converting a video clip into a GIF, and compressing video, image and PDF files.",
    freeTierShort: "20 conversion minutes per day, 5 minutes per file, 1 GB maximum file size.",
  },
  jsonformatter: {
    priceStatus: "free",
    priceHeadline: "Free",
    priceDetail: "no paid tier exists",
    priceCaveat:
      "jsonformatter.org/pricing returns HTTP 404 and no pricing link appears anywhere in the site navigation. The site is ad-supported.",
    capability: "Formatting, validating and converting JSON in the browser.",
    freeTierShort: "No paid tier at all; saved links expire in 1–24 hours unless you log in.",
  },
  "code-beautify": {
    priceStatus: "free",
    priceHeadline: "Free",
    priceDetail: "no paid tier exists",
    priceCaveat:
      "codebeautify.org/pricing returns HTTP 404 and the FAQ mentions no paid features. Monetisation is ads plus an optional donation link.",
    capability: "Formatting, validating and minifying JSON, XML, SQL and other code.",
    freeTierShort: "1 MB input cap (100 KB recommended), 5-second beautify and minify timeouts.",
  },
};

function fromIncumbent(slug) {
  const entry = INCUMBENTS[slug];
  const overlay = INCUMBENT_PRODUCTS[slug];
  if (!entry || !overlay) return null;

  return {
    key: slug,
    name: entry.shortName || entry.name,
    homepage: entry.homepage,
    capability: overlay.capability,
    price: {
      status: overlay.priceStatus,
      headline: overlay.priceHeadline,
      detail: overlay.priceDetail || "",
      annual: "",
      caveat: overlay.priceCaveat || "",
    },
    freeTierShort: overlay.freeTierShort,
    freeTier: entry.freeTierLimits || [],
    notReplaced: entry.incumbentWins || [],
    checkedOn: entry.checkedOn,
    confidence: entry.confidence,
    sources: entry.sourcesChecked || [],
  };
}

let cache = null;

/** key -> normalized product record. Built once per process. */
export function getPaidProducts() {
  if (cache) return cache;
  cache = { ...RESEARCHED_PRODUCTS };
  Object.keys(INCUMBENT_PRODUCTS).forEach((slug) => {
    const record = fromIncumbent(slug);
    if (record) cache[slug] = record;
  });
  return cache;
}

export function getPaidProduct(key) {
  return getPaidProducts()[key] || null;
}

/** `freeTier` is a string on researched records and an array on reused ones. */
export function getFreeTierPoints(product) {
  const value = product?.freeTier;
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/** True when the product genuinely has no paid tier — a $0 product. */
export function isFreeProduct(product) {
  return product?.price?.status === "free";
}

/** True when a figure exists but was read in a geo-localised, non-USD storefront. */
export function isRegionalPrice(product) {
  return product?.price?.status === "regional";
}
