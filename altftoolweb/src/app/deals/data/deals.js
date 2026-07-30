// /deals — what the paid alternative costs, and what you give up for free.
//
// WHAT THIS FILE IS NOT. It used to carry a `rating` (4.8 and similar), a
// `gems` star histogram (5:182, 4:24, …), named `reviews` with quotes, and
// `originalPrice`/`savings` figures. None of that had a source: nobody rated
// these tools and there is no review store anywhere in this repo. Those fields
// are gone and must not come back in any form. If a review system is ever
// built, it renders from that system's data — never from a literal in here.
//
// Every price on these pages comes from src/app/deals/data/paidProducts.js,
// where each figure is transcribed from the vendor's own page on a recorded
// date. Nothing in this file may state or imply a price.
//
// The authored fields below (`job`, `answer`, `does`, `limits`, `faqs`) are
// ours. `limits` is not optional and must not be softened: a page that cannot
// say what our free tool gives up is an advert, not a comparison.

import { getPaidProduct } from "./paidProducts";

export const DEAL_CATEGORIES = [
  "Images & design",
  "PDF & documents",
  "Video",
  "Data & business",
  "Developer & text",
  "Meetings & AI",
];

export const DEALS = [
  {
    slug: "bg-remover",
    name: "Background Remover",
    job: "Removing the background from a photo",
    category: "Images & design",
    icon: "wand-2",
    paid: ["remove-bg", "photoshop"],
    answer:
      "AltFTool's Background Remover is free, needs no account, and hands back the full-resolution cutout. The two products people pay for to do this are remove.bg, whose free web output is a preview of up to 0.25 megapixels and charges a credit for the real file, and Adobe Photoshop at US$22.99/month on the single-app plan.",
    does: [
      "Cuts the subject out and gives you a transparent PNG at the size you uploaded",
      "Runs in the browser tab, so the photo is never uploaded to us",
      "No credits, no account, no per-image counter",
    ],
    limits: [
      "Hair, fur, fine fabric and motion blur are where remove.bg's model is clearly better than in-browser segmentation. This is not a close contest.",
      "No AI background replacement, no erase/restore brush and no bulk queue — a catalogue of thousands of product shots is not a job for this tool.",
      "No API, so nothing here can run inside a build or a store's image pipeline.",
    ],
    faqs: [
      {
        q: "Do I get the full-resolution image without paying?",
        a: "Yes. The cutout is produced on your own device at the resolution you supplied, so there is no preview tier and no credit to spend. remove.bg's free web output is capped at roughly 0.25 megapixels and the full-resolution download costs one credit.",
      },
    ],
  },
  {
    slug: "pdf-merger",
    name: "PDF Merger",
    job: "Merging several PDFs into one document",
    category: "PDF & documents",
    icon: "files",
    paid: ["adobe-acrobat-online", "smallpdf"],
    answer:
      "AltFTool's PDF Merger combines PDFs in your browser with no account and no daily counter. Adobe Acrobat Pro is US$19.99/month on the annual plan billed monthly, and its free online tools allow one premium transaction per rolling 30 days once you sign in. Smallpdf Pro was ₹979.00/month on the India storefront when we checked — their page is geo-localised, so that is not a USD figure.",
    does: [
      "Merges any number of PDFs in the order you arrange them",
      "Runs locally in the tab — contracts and invoices are never uploaded to us",
      "No page cap, no file counter, no sign-in",
    ],
    limits: [
      "No OCR and no PDF-to-Word conversion. If the output has to keep a real table structure, Adobe is still the benchmark and you should pay them.",
      "Adobe's ceilings are far above ours — 2 GB for compression, 1,500 pages for splitting. Ours is whatever your browser tab can hold.",
      "No e-signature workflow, no DPA and no ISO certificate, so this will not pass a procurement review that requires one.",
    ],
    faqs: [
      {
        q: "Is there a limit on how many PDFs I can merge?",
        a: "There is no counter, because there is no server queue to protect. The practical ceiling is your device's memory: a few dozen ordinary documents is fine, while a hundred large scans will go faster on a hosted service.",
      },
    ],
  },
  {
    slug: "image-editor",
    name: "Image Editor",
    job: "Everyday image edits (crop, rotate, brightness, saturation, format)",
    category: "Images & design",
    icon: "image",
    paid: ["photoshop", "canva-pro"],
    answer:
      "AltFTool's Image Editor does the everyday adjustments — crop, rotate, flip, brightness, contrast, saturation, format conversion — free and in the browser. Adobe Photoshop's cheapest route to the same edits is the single-app plan at US$22.99/month, or US$263.88/year prepaid. Canva Pro's price could not be verified in USD on 2026-07-28; Canva served an India storefront at ₹500/month.",
    does: [
      "Exposure, colour and geometry adjustments with a live preview",
      "Export to JPG, PNG or WebP at the original resolution",
      "Opens instantly — no 4 GB download and no creative-suite account",
    ],
    limits: [
      "No layers, masks or smart objects. Every edit is applied to one flat image and cannot be reopened and re-adjusted later — that is the whole point of Photoshop's non-destructive model.",
      "No generative fill or AI editing, and no CMYK/16-bit colour management for print.",
      "No Brand Kit and no template library, which is the reason a lot of teams keep paying Canva.",
    ],
    faqs: [
      {
        q: "Can I reopen an edit later and change it?",
        a: "No. This is a flat, single-pass editor: what you export is final. Adjustment layers that stay editable are a Photoshop feature and we do not have an equivalent.",
      },
    ],
  },
  {
    slug: "invoice-generator",
    name: "Invoice Generator",
    job: "Creating a professional itemized invoice",
    category: "Data & business",
    icon: "file-spreadsheet",
    paid: ["freshbooks", "zoho-invoice"],
    answer:
      "AltFTool's Invoice Generator builds a print-ready itemized invoice with tax and totals, free and without an account. FreshBooks starts at US$23.00/month on the Lite plan and has no free tier at all. Zoho Invoice, though, is genuinely free — so if you need saved clients and payment collection, switching to a paid tool is not the only option, and we would rather say so.",
    does: [
      "Itemized rows with quantity, rate, per-line or global tax, and discounts",
      "Automatic subtotal, tax and grand-total maths",
      "Print or save as PDF straight from the browser, with no branding line added",
    ],
    limits: [
      "It cannot take the payment. FreshBooks processes card, ACH, Apple Pay and Google Pay against the invoice; this produces a document and nothing more.",
      "No saved clients, no invoice history and no recurring invoices — it is stateless, so nothing carries over to next month.",
      "No automatic payment reminders, late fees, expense tracking or accountant access.",
    ],
    faqs: [
      {
        q: "If Zoho Invoice is free, why use this?",
        a: "Often you should use Zoho — it is free, it saves your clients and it collects payments. Its ceilings are 2 users, 3 projects and 500 invoices a year, and every invoice carries a 'Powered by Zoho Invoice' line. This tool suits the case where you want one clean invoice out the door now, without creating an account or putting a client's details into someone's CRM.",
      },
    ],
  },
  {
    slug: "video-trimmer",
    name: "Video Trimmer",
    job: "Trimming a video clip and exporting it without a watermark",
    category: "Video",
    icon: "video",
    paid: ["camtasia", "clipchamp-premium"],
    answer:
      "AltFTool's Video Trimmer cuts the start and end off a clip in your browser, watermark-free. Camtasia's free tier watermarks every export and so does its paid Starter tier, making Essentials the cheapest watermark-free option — ₹7,099.00/year on the India storefront we were served, with no USD figure readable on TechSmith's own site. Microsoft Clipchamp is the honest comparison here: its free tier already exports watermark-free up to 1080p, and the US$7.00 per user/month Premium tier buys 4K, not the trim.",
    does: [
      "Precise start and end handles plus numeric input for an exact cut",
      "Processes locally — footage is never uploaded and there is no render queue",
      "No watermark and no account wall between you and the exported file",
    ],
    limits: [
      "No timeline. Multi-track editing, transitions, keyframes, callouts and cursor-zoom are Camtasia's product, not ours.",
      "No screen or webcam capture. A browser tool cannot record the operating system at high framerate with system audio.",
      "Long or high-bitrate 4K files are bounded by your device's memory; a server-side encoder will not be.",
    ],
    faqs: [
      {
        q: "Do I have to pay anything to trim a video without a watermark?",
        a: "No — not here, and not on Clipchamp's free tier either, which exports watermark-free at up to 1080p. Camtasia is the one that puts watermark-free export behind a paid tier, and even its cheapest paid tier, Starter, still stamps every export.",
      },
    ],
  },
  {
    slug: "excel-to-chart",
    name: "Excel to Chart",
    job: "Turning a spreadsheet or CSV into a chart",
    category: "Data & business",
    icon: "bar-chart-3",
    paid: ["power-bi-pro", "tableau-creator"],
    answer:
      "AltFTool's Excel to Chart turns an XLSX or CSV file into an interactive chart in the browser, free. Microsoft Power BI Pro is US$14.00 per user/month paid yearly — and its free account can already build reports; Pro is what you buy to share them. Tableau Creator is US$75.00 per user/month billed annually, or US$900.00 per user/year.",
    does: [
      "Reads the columns out of an XLSX, XLS or CSV file and suggests a chart type",
      "Interactive charts with colour, label and layout controls",
      "The file is parsed on your device, so finance data is not uploaded to us",
    ],
    limits: [
      "No live data connections. This is file-based by design: to refresh a chart you re-drop an updated file.",
      "No publishing, no shared workspace, no subscriptions or alerts, and no row-level security — that is exactly what a Power BI Pro or Tableau seat is for.",
      "No data-prep pipeline. Joining and cleaning several sources repeatedly is Tableau Prep's job.",
    ],
    faqs: [
      {
        q: "Do I need Power BI Pro to make a chart from a CSV?",
        a: "No. Power BI's free account can create reports; the paid Pro tier is required to share them with colleagues. If your chart is going into a deck or a document rather than a governed workspace, a free tool covers it.",
      },
    ],
  },
  {
    slug: "flow-chart-maker",
    name: "Flow Chart Maker",
    job: "Drawing a flowchart or process diagram",
    category: "Data & business",
    icon: "workflow",
    paid: ["miro", "lucidchart"],
    answer:
      "AltFTool's Flow Chart Maker gives you a browser canvas for boxes-and-arrows diagrams with no document or shape cap. Miro's Starter plan is US$8/month per member billed yearly, and its free plan keeps only the 3 most recent boards editable. Lucidchart's Individual plan is US$9/month billed annually (US$108/year), with a free plan capped at 3 documents and 75 shapes each.",
    does: [
      "Standard flowchart shapes with clean connectors on a full-width canvas",
      "No cap on documents or on shapes per document",
      "Export an image and drop it into any doc, ticket or deck",
    ],
    limits: [
      "Single editor. There is no real-time co-editing, no visible cursors, no commenting and no revision history.",
      "No Visio import or export, and no data-linked shapes pulling live Jira, Salesforce or Confluence records onto the canvas.",
      "No cloud account, so a diagram lives in the tab until you export it.",
    ],
    faqs: [
      {
        q: "Can my team edit the same diagram at once?",
        a: "No. Multiplayer editing is the reason Miro and Lucidchart charge per seat, and we have no equivalent. Export and re-import is the handoff here.",
      },
    ],
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    job: "Compressing an image to a smaller file size",
    category: "Images & design",
    icon: "image",
    paid: ["tinypng", "kraken-io"],
    answer:
      "AltFTool's Image Compressor re-encodes images in the browser with no batch or file-size cap. TinyPNG's Web Pro is US$3.25/month billed annually, and its free web tool stops at 20 compressions per batch and 5 MB per image. Kraken.io starts at US$5/month (US$50/year) with a free web interface capped at 1 MB per image.",
    does: [
      "Compresses PNG, JPG and WebP with no per-batch or per-session counter",
      "No 5 MB or 1 MB per-file ceiling — the limit is your device's memory",
      "Images are re-encoded locally and never uploaded to us",
    ],
    limits: [
      "This is a browser re-encode, not Tinify's tuned palette quantizer. On flat-colour PNGs and logos, TinyPNG will usually produce a smaller file at the same perceived quality.",
      "No API, no WordPress or Photoshop plugin, no S3 delivery and no image CDN — nothing here fits into a build pipeline.",
      "No target-size mode: you set quality, not an output file size.",
    ],
    faqs: [
      {
        q: "Will this compress as well as TinyPNG?",
        a: "Usually close on photographs, and usually not on flat-colour PNGs, where TinyPNG's quantizer has a decade of tuning behind it. What you get instead is no 20-per-batch cap, no 5 MB ceiling and no copy of your image on someone's server.",
      },
    ],
  },
  {
    slug: "meeting-transcript-action-extractor",
    name: "Meeting Action Extractor",
    job: "Pulling action items and decisions out of a meeting transcript",
    category: "Meetings & AI",
    icon: "clipboard-list",
    paid: ["fireflies-pro", "otter-business"],
    answer:
      "AltFTool's Meeting Action Extractor takes a transcript you already have and structures it into action items, decisions and key points — free, with no bot in your call. Fireflies.ai Pro is US$18.00 per seat/month, or US$10.00 per seat/month billed annually. Otter.ai Business is US$30.00 per user/month, or US$19.99 per user/month billed annually. Read the limits below first: neither of those is really the same product.",
    does: [
      "Separates action items from decisions and from general discussion",
      "Works with a transcript from any source — Zoom, Meet, Teams or typed notes",
      "Nothing is retained after you close the tab",
    ],
    limits: [
      "It does not transcribe anything. You must already have the text. Otter and Fireflies are speech-to-text products first, and this tool cannot replace that half of the job.",
      "No notetaker bot. Neither joining a call from your calendar nor recording it without a human present is possible from a web page.",
      "No speaker identification, no CRM write-back to Salesforce or HubSpot, and no conversation-intelligence metrics like talk-time ratio or sentiment.",
    ],
    faqs: [
      {
        q: "Does this record or join my meetings?",
        a: "No. It never joins a call and never records audio. You bring text from any source and it structures it. If you need the recording and transcription itself, Fireflies' free plan includes unlimited transcription and Otter's free Basic plan includes 300 minutes a month.",
      },
    ],
  },
  {
    slug: "text-behind-image",
    name: "Text Behind Image",
    job: "Placing text behind the subject of a photo",
    category: "Images & design",
    icon: "image-plus",
    paid: ["photoshop", "canva-pro"],
    answer:
      "AltFTool's Text Behind Image separates the subject automatically so type sits behind it — free, in the browser. Doing it by hand means masking in Adobe Photoshop, which is US$22.99/month on the single-app plan. Canva Pro is the other common route; its price could not be verified in USD on 2026-07-28, when Canva served an India storefront at ₹500/month.",
    does: [
      "Detects the subject and layers editable text behind it automatically",
      "Font, size, weight, colour and position controls on the text layer",
      "Exports a finished composition without a watermark",
    ],
    limits: [
      "One effect, not a compositor. There are no layers to rearrange, no masks to refine by hand and no blend modes.",
      "Subject detection is weakest exactly where Photoshop's manual masking wins: busy group shots, fine hair and semi-transparent edges.",
      "A curated font set only — no custom font upload, and no Brand Kit enforcing your own typefaces.",
    ],
    faqs: [
      {
        q: "Do I need Photoshop skills for this effect?",
        a: "No. The masking step that normally requires Photoshop is done for you. What you lose is the ability to fix the mask by hand when detection gets an edge wrong.",
      },
    ],
  },
  {
    slug: "video-to-gif",
    name: "Video to GIF",
    job: "Converting a short video clip into a GIF",
    category: "Video",
    icon: "video",
    paid: ["freeconvert", "123apps"],
    answer:
      "AltFTool's Video to GIF converts MP4, WebM or OGG clips into optimized GIFs locally, with no daily conversion budget. FreeConvert's Basic plan is US$12.99/month and its free tier meters you at 20 conversion minutes per day. 123apps was ₹190/month or ₹1,824/year on the storefront we were served — an INR figure, not a USD one — with a free tier of 5 files per day.",
    does: [
      "Converts short clips to GIF with dimension and quality controls",
      "No daily file counter and no conversion-minute budget",
      "Conversion runs on your device, so nothing is uploaded and nothing is queued",
    ],
    limits: [
      "No GPU encoding and no multi-gigabyte ceiling. Long or high-bitrate video is a server's job, not a browser tab's.",
      "No target-size mode — FreeConvert lets you name an output size and hits it; here you adjust dimensions and quality yourself.",
      "No API and no batch queue, so this does not automate.",
    ],
    faqs: [
      {
        q: "How long can the clip be?",
        a: "GIF as a format grows quickly past about 30 seconds, so short clips work best regardless of the tool. Beyond that the constraint is your device's memory rather than a plan limit.",
      },
    ],
  },
  {
    slug: "meme-generator",
    name: "Meme Generator",
    job: "Adding captions to an image and exporting it without a watermark",
    category: "Images & design",
    icon: "image",
    paid: ["imgflip-pro", "canva-pro"],
    answer:
      "AltFTool's Meme Generator captions an image and exports it with no watermark, free. On Imgflip, watermark-free export is the paid feature: Pro Basic is US$5.95/month billed monthly, or US$4.95/month billed yearly, and removing the watermark from animated GIFs needs full Imgflip Pro at US$14.95/month. Canva Pro is the other common route and its USD price could not be verified on 2026-07-28.",
    does: [
      "Top and bottom caption text with crisp rendering that survives re-shares",
      "Export with no watermark and no ads on the output",
      "Nothing is uploaded, so the image stays on your device",
    ],
    limits: [
      "No hosted template library. Imgflip's million-plus searchable templates are a big part of what it sells; here you bring your own image.",
      "No AI meme generation and no background removal inside this tool.",
      "No hosted publishing — no permanent imgflip-style URL, no community feed, no API and no Slack app.",
    ],
    faqs: [
      {
        q: "Why do free meme tools add a watermark?",
        a: "Because watermark removal is the upsell. On Imgflip, the free tier stamps every meme and GIF, and Pro Basic at US$5.95/month is the cheapest tier that removes it from static memes. A tool that runs on your own device has nothing to meter, so there is no watermark to sell you.",
      },
    ],
  },
  {
    slug: "json-editor",
    name: "JSON Editor",
    job: "Validating, formatting and minifying JSON",
    category: "Developer & text",
    icon: "braces",
    paid: ["jsonformatter", "code-beautify"],
    answer:
      "There is no money to save here, and pretending otherwise would be dishonest: the two most popular JSON formatters, JSONFormatter and Code Beautify, both have no paid tier at all — each returns HTTP 404 on /pricing and is funded by ads. AltFTool's JSON Editor is free for the same reason. What differs is the limits: Code Beautify caps input at 1 MB with a 5-second processing timeout, and both offer a save-link feature their own policies warn you not to use for sensitive data.",
    does: [
      "Validation with line and column on the error, formatting and minifying",
      "Runs entirely client-side, so a payload with a token in it is safe to paste",
      "No 1 MB input cap and no processing timeout",
    ],
    limits: [
      "No shareable saved links. Handing a colleague a URL to a formatted payload is JSONFormatter's best feature and we have no equivalent.",
      "No account, no history, no favourites and no Chrome extension.",
      "Code Beautify's catalogue in one consistent editor is broader than our developer section, particularly on crypto and string utilities.",
    ],
    faqs: [
      {
        q: "Is a paid JSON editor worth it?",
        a: "For formatting and validating, the mainstream web tools are already free, so the question is really about limits and privacy rather than price. Check the input cap, whether the tool processes on a server, and what happens to anything you save.",
      },
    ],
  },
  {
    slug: "diff-checker",
    name: "Diff Checker",
    job: "Comparing two pieces of text side by side",
    category: "Developer & text",
    icon: "text",
    paid: ["beyond-compare", "araxis-merge"],
    answer:
      "AltFTool's Diff Checker compares two texts in the browser with per-line and per-word highlighting, free. The desktop tools people buy for this are one-time purchases, not subscriptions: Beyond Compare is US$35 per user for the Standard Edition (US$70 for Pro), and Araxis Merge is US$129 for Standard (US$269 for Professional). Neither has a free tier — only an evaluation period.",
    does: [
      "Word-level highlighting inside changed lines, side by side",
      "Paste text or drop a file; nothing is uploaded",
      "Handles code, prose, config files and contracts equally",
    ],
    limits: [
      "Two-way text only. No three-way merge against a common ancestor, which is the reason developers buy the Pro editions.",
      "No folder or drive comparison and no synchronization across thousands of files, and no FTP/SFTP or cloud endpoints.",
      "No source-control integration, and no diffing of PDFs, office documents, images or binaries.",
    ],
    faqs: [
      {
        q: "Is Beyond Compare a subscription?",
        a: "No. Scooter Software states the licence fee is a one-time purchase with no annual renewal fees. Araxis Merge is also perpetual, with optional support renewal at US$29/year for Standard.",
      },
    ],
  },
  {
    slug: "markdown-preview",
    name: "Markdown Preview",
    job: "Writing Markdown with a live rendered preview",
    category: "Developer & text",
    icon: "edit",
    paid: ["typora", "ia-writer"],
    answer:
      "AltFTool's Markdown Preview gives you a live split-pane editor in any browser, free. The two editors people buy are one-time purchases: Typora is US$14.99 for a licence covering up to 3 devices, and iA Writer is US$29.99 on Windows or US$49.99 on Mac, paid per platform. Neither has a free tier — Typora offers 15 days and iA Writer 7.",
    does: [
      "Live preview as you type, with GitHub-flavoured tables, task lists and fenced code",
      "Copy clean HTML out when you need it",
      "Works on any machine with a browser, with nothing to install",
    ],
    limits: [
      "No file management. It does not open or save .md files on disk, and there is no sidebar file tree for a folder of notes.",
      "No export to PDF, Word or LaTeX — Typora bundles pandoc for exactly that.",
      "No custom CSS themes, no iCloud/Dropbox sync across devices, and none of iA Writer's syntax style check.",
    ],
    faqs: [
      {
        q: "Is Typora a subscription?",
        a: "No. Typora is a one-time US$14.99 purchase covering up to three devices. iA Writer is also one-time, but priced per platform, so Mac and Windows are bought separately.",
      },
    ],
  },
  {
    slug: "color-palette-from-image",
    name: "Color Palette from Image",
    job: "Pulling a colour palette out of an image",
    category: "Images & design",
    icon: "palette",
    paid: ["adobe-color", "coolors-pro"],
    answer:
      "AltFTool's Color Palette from Image extracts an image's defining colours and gives you the hex codes, free. Be aware that the obvious alternative is also free: Adobe Color has no paid tier at all, and its colour wheel, contrast checker and palette extractor are open to anyone. Coolors does sell a Pro tier, but no USD figure was readable on 2026-07-28 — the site served an India storefront at ₹231/month billed yearly.",
    does: [
      "Extracts the colours that actually define an image, not just pixel averages",
      "One-click hex copy for each swatch",
      "The image is read on your device and never uploaded",
    ],
    limits: [
      "No saved palettes and no account. Coolors' free tier already stores 10 palettes; ours stores none.",
      "No Creative Cloud Libraries sync, so a palette will not appear in Photoshop, Illustrator or InDesign swatch panels the way Adobe Color's does.",
      "No harmony-rule generator, no AI palette generation and no Web/UI/Print export presets.",
    ],
    faqs: [
      {
        q: "Is Adobe Color free?",
        a: "Yes, entirely — there is no paid tier to compare against. Saving a palette into a library needs a free Adobe account, and that sync into Photoshop and Illustrator is a genuine reason to use Adobe Color over anything else.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Accessors
// ---------------------------------------------------------------------------

export function getDeals() {
  return DEALS.filter((deal) => deal?.slug);
}

export function getDeal(slug) {
  return getDeals().find((deal) => deal.slug === slug) || null;
}

/** Resolved paid-product records for a deal, in the order the deal lists them. */
export function getDealPaidProducts(deal) {
  return (deal?.paid || []).map((key) => getPaidProduct(key)).filter(Boolean);
}

/**
 * The single product a deal leads with — the first entry that actually has a
 * price to quote. A deal whose alternatives are all free (json-editor,
 * color-palette-from-image) falls back to the first product, and the page then
 * says plainly that there is nothing to save.
 */
export function getLeadPaidProduct(deal) {
  const products = getDealPaidProducts(deal);
  return products.find((product) => product.price?.status !== "free") || products[0] || null;
}

/** The newest `checkedOn` across a deal's products — what the page is dated by. */
export function getDealCheckedOn(deal) {
  const dates = getDealPaidProducts(deal)
    .map((product) => product.checkedOn)
    .filter(Boolean)
    .sort();
  return dates[dates.length - 1] || "";
}

/** Oldest and newest check dates across every product on the hub. */
export function getCheckedOnRange() {
  const dates = getDeals()
    .flatMap((deal) => getDealPaidProducts(deal).map((product) => product.checkedOn))
    .filter(Boolean)
    .sort();
  return { from: dates[0] || "", to: dates[dates.length - 1] || "" };
}

/**
 * Every (product, deal) pair, deduped by product, for the hub table.
 *
 * A product can appear on several deals — Photoshop is listed by three of them
 * — so each one is filed under the deal that names it first. Photoshop lands on
 * Image Editor rather than Background Remover, which is what a reader scanning
 * the table expects. Rows still come out in DEALS order.
 */
export function getComparisonRows() {
  const home = new Map();
  getDeals().forEach((deal) => {
    (deal.paid || []).forEach((key, index) => {
      const current = home.get(key);
      if (!current || index < current.index) home.set(key, { slug: deal.slug, index });
    });
  });

  const rows = [];
  getDeals().forEach((deal) => {
    getDealPaidProducts(deal).forEach((product) => {
      if (home.get(product.key)?.slug !== deal.slug) return;
      rows.push({ product, deal });
    });
  });
  return rows;
}

export function getDealsByCategory() {
  return DEAL_CATEGORIES.map((category) => ({
    category,
    deals: getDeals().filter((deal) => deal.category === category),
  })).filter((group) => group.deals.length);
}

export function getRelatedDeals(deal, limit = 3) {
  if (!deal) return [];
  const sameCategory = getDeals().filter(
    (item) => item.slug !== deal.slug && item.category === deal.category,
  );
  const others = getDeals().filter(
    (item) => item.slug !== deal.slug && item.category !== deal.category,
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export function getDealFaqs(deal) {
  return deal?.faqs || [];
}

export function getDealToolHref(deal) {
  return `/tools/all/${deal?.slug || ""}`;
}
