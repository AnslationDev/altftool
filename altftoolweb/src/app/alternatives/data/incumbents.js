// Incumbent comparison corpus for /alternatives.
//
// Two kinds of data live here and they must not be blurred together:
//
//   1. RESEARCHED fields (`paidPrice`, `freeTierLimits`, `incumbentWins`,
//      `uploadsFiles`, `sourcesChecked`, `confidence`) are transcribed from the
//      vendor's own pages on the date in `checkedOn`. Do not paraphrase them
//      into something punchier, do not add a claim a source does not support,
//      and do not "round" a price. If a vendor changes their pricing page, the
//      fix is to re-read the source and edit the string — not to guess.
//
//   2. AUTHORED fields (`valueProp`, `summary`, `comparison`, `altftoolLimits`,
//      `migrationSteps`, `primaryTool`, `tools`, `faqs`) are ours. They must
//      stay in the register master.md asks for: a helpful engineer explaining a
//      tradeoff, not marketing. Every incumbent here is a good product that
//      many of our readers pay for and should keep paying for.
//
// Every slug in `primaryTool`, `tools` and `migrationSteps[].to` was verified
// against src/platform/registry/toolMetaMap.js AND toolRuntimeMap.js. A slug in
// the meta map but missing from the runtime map cannot be embedded, so it must
// not be used as `primaryTool`.

/** Constant across the family: what AltFTool is, stated once. */
export const ALTFTOOL_POSITION = {
  processing: "In your browser. Files are never uploaded to us.",
  account: "No — every tool opens and runs without signing in.",
  paid: "None. There is no paid tier and no per-file metering.",
  ads: "Yes — ads are what keep the tools free.",
  apps: "No. Web only — no desktop or mobile app.",
  api: "No public API. Tools are interactive pages, not endpoints.",
};

export const INCUMBENTS = {
  "ilovepdf": {
    slug: "ilovepdf",
    name: "iLovePDF",
    homepage: "https://www.ilovepdf.com",
    category: "pdf",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "medium",
    paidPrice:
      "₹3,400/year (displayed as ₹283/month billed annually); ₹500/month on monthly billing — NOTE: prices rendered in INR because the pricing page is geo-localized; the USD price was NOT verified today",
    freeTierLimits: [
      "Merge PDF on the free Basic plan is capped at 25 files per task (Premium and Business allow 500)",
      "Split PDF and OCR PDF are capped at 1 file per task on the free plan",
      "Compress PDF is capped at 2 files per task on the free plan",
      "Every Office conversion (Word/PowerPoint/Excel to PDF, and PDF to Word/PowerPoint/Excel) is capped at 1 file per task on free",
      "Free per-task file size: 100 MB for Merge PDF and Split PDF, 200 MB for Compress PDF",
      "Free per-task file size for Office conversions is 15 MB, versus 4 GB on paid plans",
      "Desktop and Mobile apps are marked unavailable on the free Basic plan",
      "An ad-free experience is listed as a Premium-only feature, so the free tier is ad-supported",
      "Uploaded files are processed on iLovePDF servers and deleted within two hours",
    ],
    incumbentWins: [
      "A genuinely broad and well-polished PDF suite backed by real desktop and mobile apps plus a documented developer REST API, so the same job can be scripted, run offline on paid plans, or done on a phone.",
      "Workflows let a signed-in user chain several tools into one repeatable multi-step job — real automation that a stateless browser tool does not offer.",
      "Server-side OCR and PDF/A conversion comfortably handle very large scanned archives that would exhaust a browser tab, with 4 GB per-task file sizes on paid plans.",
      "Even the free tier is unusually generous on merging: 25 files at up to 100 MB each, with no account required.",
    ],
    sourcesChecked: [
      "https://www.ilovepdf.com/pricing",
      "https://www.ilovepdf.com/help/privacy",
      "https://www.ilovepdf.com/help/faq",
    ],
    valueProp:
      "The same everyday PDF jobs — merge, split, compress, convert — running inside your own browser tab, with no upload, no task counter and no account.",
    summary:
      "iLovePDF is a hosted service: your file travels to their servers, gets processed there, and is deleted within two hours. That is a reasonable design, and it is why they can OCR a 4 GB scanned archive. AltFTool made the opposite trade. Our PDF tools are JavaScript and WebAssembly that your browser downloads and runs locally, so the document never leaves your machine — and there is nothing to meter, because we are not paying for the compute. The cost of that trade is real, and it is listed further down this page.",
    comparison: {
      processing: "Uploaded to iLovePDF servers, deleted within two hours.",
      account: "Not required for the free tier.",
      freeCeiling:
        "25 files per merge, 1 file per split/OCR, 2 per compress; 100–200 MB per task, 15 MB for Office conversions.",
      paid: "Premium from ₹283/month billed annually (₹3,400/year).",
      ads: "Yes — an ad-free experience is a Premium feature.",
      apps: "Yes — desktop and mobile apps, on paid plans.",
      api: "Yes — a documented REST API, plus chained Workflows.",
    },
    altftoolLimits: [
      "No OCR. If your PDF is a scan and you need selectable text out of it, iLovePDF is the right tool and we are not.",
      "No Workflows. Every AltFTool run is a single stateless task — nothing is saved, nothing is chained, nothing is scheduled.",
      "Very large files depend on your device. A 500 MB PDF that a server chews through happily can exhaust a browser tab, especially on a phone.",
    ],
    primaryTool: "pdf-merger",
    tools: [
      "pdf-merger",
      "pdf-split-tool",
      "pdf-compressor",
      "pdf-page-reorder-tool",
      "pdf-to-image-converter",
      "img-to-pdf",
      "pdf-watermark",
      "pdf-set-password",
    ],
    migrationSteps: [
      { from: "Merge PDF", to: "pdf-merger" },
      { from: "Split PDF", to: "pdf-split-tool" },
      { from: "Compress PDF", to: "pdf-compressor" },
      { from: "Organize PDF (reorder pages)", to: "pdf-page-reorder-tool" },
      { from: "PDF to JPG", to: "pdf-to-image-converter" },
      { from: "JPG to PDF", to: "img-to-pdf" },
      { from: "Add watermark", to: "pdf-watermark" },
      { from: "Protect PDF", to: "pdf-set-password" },
    ],
    faqs: [
      {
        question: "Does AltFTool have the same 25-file merge limit as iLovePDF?",
        answer:
          "No, because there is no server queue to protect. The practical ceiling is your browser's memory: merging a few dozen ordinary documents is fine, while a hundred large scans will be slower here than on iLovePDF's servers.",
      },
      {
        question: "Can AltFTool convert a PDF to Word?",
        answer:
          "No. Faithful PDF-to-Office conversion needs layout reconstruction that we do not run client-side. iLovePDF allows one such conversion per task on the free plan at up to 15 MB, and that is genuinely the better route.",
      },
      {
        question: "Is anything uploaded when I use the AltFTool PDF tools?",
        answer:
          "No. The tool code is downloaded to your browser and the document is read with the File API. Nothing about the file's contents is transmitted to us — which also means we cannot recover a file you close by accident.",
      },
    ],
  },

  "smallpdf": {
    slug: "smallpdf",
    name: "Smallpdf",
    homepage: "https://smallpdf.com",
    category: "pdf",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "medium",
    paidPrice:
      "Pro ₹979.00/month on monthly billing, with yearly billing advertised at -30% — NOTE: the pricing page is geo-localized and rendered in INR; the USD price was NOT verified today",
    freeTierLimits: [
      'The free plan carries a "Daily download limit" on compress, all PDF/Office/image conversions, OCR, merge, split, rotate, delete pages, extract pages, annotate, read, number pages, crop, redact, watermark, sign, protect, unlock and flatten — Smallpdf does not publish the actual daily number on its pricing page',
      "Edit Text, Strong Compression, Batch Compress, Batch Convert, and OCR into Word/Excel/PowerPoint are Pro-only and unavailable on Free",
      'AI tools (Chat with PDF, AI PDF Summarizer, Translate PDF, AI Question Generator) are marked "Limited" on Free',
      "AI-tool document word limit is 25–35k on Free versus 100k on Pro; the AI-tool file size limit is 50 MB on every plan",
      "The bundled Sign.com free account is limited to 2 documents a month",
      'Cloud storage is "Limited" on Free versus Unlimited on paid plans',
      "Mobile app access and the mobile Scan tool carry a daily task limit on Free",
      "Files are uploaded and processed on servers (Smallpdf names Hetzner, in the EU, as the provider that processes user-uploaded files)",
      'By Smallpdf\'s own privacy notice, documents processed with the service are by default "accessible to anyone with a unique sharable URL" unless the user disables that',
    ],
    incumbentWins: [
      "ISO/IEC 27001 certified and GDPR, CCPA and nFADP compliant, with a published Data Processing Agreement — the kind of audited paper trail a company legally needs before it can approve a document vendor.",
      "The subscription bundles full Sign.com Premium, giving genuine e-signature workflow: signature requests, templates, signer IDs, activity timeline and a Certificate of Completion. That is a legal instrument a client-side tool cannot produce.",
      "A mature server-side pipeline delivers strong compression and OCR quality on difficult scanned documents, backed by native mobile apps, a Windows app and a document scanner.",
      "Operating since 2013 at large scale with responsive human support and a well-earned reputation for a clean, forgiving interface.",
    ],
    sourcesChecked: ["https://smallpdf.com/pricing", "https://smallpdf.com/privacy"],
    valueProp:
      "PDF compression, merging and page editing with no daily download limit to run into, because the work happens on your machine rather than in a queue we have to pay for.",
    summary:
      "The friction most people hit on Smallpdf's free plan is the unpublished daily download limit — you find out you have used it up at the moment you needed one more file. AltFTool has no counter because there is no server doing the work. The flip side is equally real: Smallpdf is ISO/IEC 27001 certified with a signed DPA and a bundled Sign.com account, and if your employer's procurement team needs an audited vendor, a free browser tool is not an answer to that question.",
    comparison: {
      processing: "Uploaded and processed on servers (Hetzner, EU).",
      account: "Not required to start, but the free plan is metered.",
      freeCeiling:
        "An unpublished daily download limit across nearly every tool; Edit Text, batch and OCR-to-Office are Pro-only.",
      paid: "Pro ₹979.00/month monthly, ~30% off on yearly billing.",
      ads: "No advertising; the free tier is limited by usage instead.",
      apps: "Yes — mobile apps, a Windows app and a document scanner.",
      api: "Yes — a developer API, plus bundled Sign.com workflows.",
    },
    altftoolLimits: [
      "No e-signature workflow. We cannot issue a signature request, a signer ID or a Certificate of Completion — Smallpdf's bundled Sign.com can, and that is a legal artefact, not a nice-to-have.",
      "No compliance paperwork. There is no DPA to sign, no ISO certificate, and no SOC report, so we will fail a procurement review that requires one.",
      "No OCR and no text editing inside an existing PDF. Annotation and page surgery, yes; rewriting a paragraph in place, no.",
    ],
    primaryTool: "pdf-compressor",
    tools: [
      "pdf-compressor",
      "pdf-merger",
      "pdf-split-tool",
      "pdf-annotation",
      "pdf-page-reorder-tool",
      "pdf-password-remover",
      "pdf-set-password",
      "img-to-pdf",
    ],
    migrationSteps: [
      { from: "Compress PDF", to: "pdf-compressor" },
      { from: "Merge PDF", to: "pdf-merger" },
      { from: "Split PDF", to: "pdf-split-tool" },
      { from: "Annotate / mark up a PDF", to: "pdf-annotation" },
      { from: "Delete or reorder pages", to: "pdf-page-reorder-tool" },
      { from: "Unlock PDF", to: "pdf-password-remover" },
      { from: "Protect PDF", to: "pdf-set-password" },
    ],
    faqs: [
      {
        question: "What replaces Smallpdf's Strong Compression?",
        answer:
          "Nothing exactly. Our compressor re-encodes images and strips redundant objects in the browser, which handles most oversized documents, but Smallpdf's Pro-only strong mode will win on heavy scanned files.",
      },
      {
        question: "Does AltFTool create a shareable link to my document?",
        answer:
          "No, and that is deliberate. Smallpdf's privacy notice says processed documents are by default reachable by anyone holding the unique URL unless you turn that off. We have no URL to hand out because we never receive the file.",
      },
      {
        question: "Can I sign a contract with AltFTool?",
        answer:
          "You can draw or place a signature image on a page with the annotation tool, but that is a picture, not an audited e-signature. For anything a counterparty may dispute, use Sign.com through Smallpdf or a comparable provider.",
      },
    ],
  },

  "adobe-acrobat-online": {
    slug: "adobe-acrobat-online",
    name: "Adobe Acrobat online tools",
    // Used in headings and prose, where the full product name reads badly
    // ("What Adobe Acrobat online tools does better").
    shortName: "Adobe Acrobat",
    homepage: "https://www.adobe.com/acrobat/online.html",
    category: "pdf",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "high",
    paidPrice:
      "Acrobat Express US$9.99/mo, Acrobat Standard US$14.99/mo, Acrobat Pro US$19.99/mo, Acrobat Studio US$24.99/mo (annual plans, billed monthly)",
    freeTierLimits: [
      "Without signing in with an Adobe ID, most tools let you complete one free transaction and download the resulting file one time",
      "A few tools cannot be tried at all without signing in",
      "Signed in with a free Adobe ID, premium tools allow one free transaction every 30 days on a rolling basis — using PDF to Word on day 1 means Compress PDF is unavailable on day 15",
      "Fill, sign, share and comment on PDFs are free when signed in with an Adobe ID",
      "A password added with the free Protect PDF tool cannot be removed without a paid subscription or a 7-day Acrobat Pro trial",
      "File size caps: 100 MB for most tools, 200 MB for PDF to Word and PDF to PPT, and up to 2 GB for Compress PDF",
      "Delete, Rotate, Reorder, Extract, Insert and Crop pages support a maximum of 1,500 pages; each inserted file is limited to 500 pages",
      "Split PDF handles up to 1 GB and 1,500 pages, producing at most 19 files",
      "Merge PDFs allows up to 100 files and 1,500 total pages, with each file up to 500 pages",
      "Acrobat online services upload files to Adobe cloud storage; if you do not sign in, Adobe deletes the file from its servers within a short period",
    ],
    incumbentWins: [
      "Adobe invented the PDF format, and its conversion fidelity — particularly PDF to Word and PDF to Excel on complex multi-column layouts, tables and scanned pages — remains the benchmark everyone else is measured against.",
      "It handles genuinely enormous documents: 2 GB for compression, 1 GB and 1,500 pages for splitting, 200 MB for PDF to Word. Browser-based processing cannot realistically match that ceiling.",
      "Tight continuity with the Acrobat desktop app, Adobe cloud storage and Acrobat Sign means a document can move from browser to desktop to a legally binding, audit-trailed signature flow without leaving the ecosystem.",
      "Enterprise-grade security posture with AES-256 encryption, TLS 1.2, private-by-default file labelling and a mature published compliance program — often the deciding factor for regulated industries.",
    ],
    sourcesChecked: [
      "https://www.adobe.com/acrobat/online.html",
      "https://www.adobe.com/acrobat/pricing.html",
      "https://helpx.adobe.com/document-cloud/faq/try-acrobat-online-services.html",
    ],
    valueProp:
      "For the routine page-level jobs — split, merge, reorder, compress — a free browser tool with no Adobe ID and no rolling 30-day transaction clock.",
    summary:
      "Adobe's free online tools are a sampler for the subscription: one transaction, then a 30-day wait before the next premium tool unlocks. That is a fair trade for what Acrobat can do, and for conversion fidelity on a messy multi-column layout Adobe is still the benchmark. But a lot of PDF work is not conversion. Pulling pages 4 through 9 out of a report, or dropping a 40 MB deck to something emailable, is mechanical, and mechanical work runs perfectly well in a browser tab without an account or a clock.",
    comparison: {
      processing: "Uploaded to Adobe cloud storage; deleted quickly if signed out.",
      account: "Adobe ID needed for most tools; a few cannot be tried at all without one.",
      freeCeiling:
        "One free transaction signed out; one premium transaction per rolling 30 days signed in.",
      paid: "Express US$9.99/mo, Standard US$14.99, Pro US$19.99, Studio US$24.99.",
      ads: "No ads; the free tier is limited by transactions instead.",
      apps: "Yes — the Acrobat desktop and mobile apps, plus cloud storage.",
      api: "Yes — Adobe PDF Services API and Acrobat Sign.",
    },
    altftoolLimits: [
      "Nothing here approaches Acrobat's PDF-to-Word or PDF-to-Excel fidelity. If the output has to keep a real table structure, pay Adobe.",
      "Adobe's ceilings are far above ours: 2 GB for compression and 1,500 pages for splitting. Our ceiling is whatever your browser tab can hold.",
      "No Acrobat Sign equivalent, no cloud storage, no version history — close the tab and the working state is gone.",
    ],
    primaryTool: "pdf-split-tool",
    tools: [
      "pdf-split-tool",
      "pdf-merger",
      "pdf-page-reorder-tool",
      "pdf-compressor",
      "pdf-watermark",
      "pdf-annotation",
      "pdf-to-image-converter",
      "pdf-set-password",
    ],
    migrationSteps: [
      { from: "Split a PDF", to: "pdf-split-tool" },
      { from: "Merge PDFs", to: "pdf-merger" },
      { from: "Delete, rotate or reorder pages", to: "pdf-page-reorder-tool" },
      { from: "Compress a PDF", to: "pdf-compressor" },
      { from: "Add a watermark", to: "pdf-watermark" },
      { from: "Comment on a PDF", to: "pdf-annotation" },
      { from: "Convert PDF to JPG", to: "pdf-to-image-converter" },
    ],
    faqs: [
      {
        question: "Adobe's free Protect PDF locked my file. Can AltFTool remove the password?",
        answer:
          "Only if you know the password — our remover decrypts with the correct credential and writes an unprotected copy. It is not a cracking tool. Adobe's own help notes the password cannot be removed on their side without a subscription or a Pro trial.",
      },
      {
        question: "Why is there no 'one transaction per 30 days' limit here?",
        answer:
          "That limit exists because Adobe pays for the server that does the work. Our tools run on your CPU, so repeated use costs us nothing beyond serving the page.",
      },
      {
        question: "Is AltFTool a replacement for an Acrobat Pro subscription?",
        answer:
          "For page-level editing, no subscription is needed. For conversion fidelity, redaction that survives forensic inspection, PDF/A archiving or audit-trailed signatures, it is not — Acrobat Pro is doing things we do not attempt.",
      },
    ],
  },

  "sejda": {
    slug: "sejda",
    name: "Sejda",
    homepage: "https://www.sejda.com",
    category: "pdf",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "high",
    paidPrice:
      "Web Week Pass US$5 for 7 days (one-time); Web Monthly US$7.50/month; Desktop+Web Annual US$63/year",
    freeTierLimits: [
      "3 tasks per hour on the free tier",
      "Free users are limited to a single file per task, so no batch processing",
      'Merge PDF states verbatim: "Free service for documents up to 50 pages or 50 MB and 3 tasks per hour"',
      "Page and size caps vary by tool — Compress PDF advertises free service for documents up to 200 pages or 100 MB, while Merge caps at 50 pages or 50 MB",
      "Free tier requires no signup",
      "Paid plans lift the free caps to unlimited documents with no page or hourly limits, uploads up to 500 MB per file, OCR up to 100 pages, and up to 21 minutes of processing time per task",
      "Sejda Web uploads documents and processes them on Sejda servers; files are automatically deleted after 2 hours",
    ],
    incumbentWins: [
      "Sejda Desktop performs the same jobs entirely on your own computer with no upload, and Sejda says so plainly on every tool page rather than burying it — an unusually honest privacy option from a company whose web product does upload.",
      "The feature depth is remarkable for a small team: split by text, by bookmarks or by size, Bates numbering, deskew, N-up, flatten form fields, edit metadata, auto-generated tables of contents and filename footers. These are niche needs most competitors simply do not cover.",
      "The in-browser PDF text editor is genuinely capable, editing existing document text rather than just stamping annotations on top.",
      "No signup is required even on the free tier, and the US$5 one-week pass is a fair, honest way to pay for a single heavy job without being pushed into a subscription.",
    ],
    sourcesChecked: [
      "https://www.sejda.com/pricing",
      "https://www.sejda.com/upgrade",
      "https://www.sejda.com/merge-pdf",
      "https://www.sejda.com/compress-pdf",
    ],
    valueProp:
      "The common PDF operations without Sejda's three-tasks-per-hour ceiling or its 50-page free cap on merging — but with a much narrower feature set than Sejda offers.",
    summary:
      "Sejda is the most honest company in this category: every tool page states the free cap up front, Sejda Desktop does the work locally with no upload, and a US$5 week pass exists so you are not pushed into a subscription for one heavy job. The only place we clearly differ is the free web tier — three tasks per hour and 50 pages per merge is a real wall when you are working through a stack of documents. Sejda's feature depth, though, is not something we match, and the list below is not padding.",
    comparison: {
      processing: "Sejda Web uploads to their servers, deleted after 2 hours. Sejda Desktop is fully local.",
      account: "No signup required on the free tier.",
      freeCeiling:
        "3 tasks per hour, one file per task; 50 pages / 50 MB on Merge, 200 pages / 100 MB on Compress.",
      paid: "US$5 week pass, US$7.50/month, or US$63/year with Desktop.",
      ads: "No ads; the free tier is limited by the hourly task cap.",
      apps: "Yes — Sejda Desktop, which processes locally.",
      api: "Yes — an API, plus a command-line console for batch work.",
    },
    altftoolLimits: [
      "No PDF text editing. Sejda edits words inside an existing document; we can annotate on top of a page but not rewrite its text.",
      "None of Sejda's specialist features: Bates numbering, split by text or bookmarks, deskew, N-up, flattening form fields, auto tables of contents.",
      "No OCR, and no 21-minute server processing budget — a job that would take a server twenty minutes is not a job for a browser tab.",
    ],
    primaryTool: "pdf-page-reorder-tool",
    tools: [
      "pdf-page-reorder-tool",
      "pdf-merger",
      "pdf-split-tool",
      "pdf-compressor",
      "pdf-watermark",
      "pdf-annotation",
      "pdf-password-remover",
      "img-to-pdf",
    ],
    migrationSteps: [
      { from: "Organize / reorder pages", to: "pdf-page-reorder-tool" },
      { from: "Merge PDF", to: "pdf-merger" },
      { from: "Split PDF", to: "pdf-split-tool" },
      { from: "Compress PDF", to: "pdf-compressor" },
      { from: "Watermark", to: "pdf-watermark" },
      { from: "Annotate PDF", to: "pdf-annotation" },
      { from: "Unlock PDF", to: "pdf-password-remover" },
    ],
    faqs: [
      {
        question: "If Sejda Desktop is already local, why use AltFTool?",
        answer:
          "You may not need to. Sejda Desktop is a genuinely good local option. AltFTool suits the case where you do not want to install anything — the tools open in a tab and there is no download step.",
      },
      {
        question: "Does AltFTool limit tasks per hour?",
        answer:
          "No. Sejda's three-per-hour cap exists to ration server capacity; we do not run the job, your browser does, so nothing needs rationing.",
      },
      {
        question: "Can AltFTool split a PDF by bookmarks or by text?",
        answer:
          "No — our splitter works on page ranges. Split-by-text and split-by-bookmarks are Sejda features with no equivalent here.",
      },
    ],
  },

  "pdf24": {
    slug: "pdf24",
    name: "PDF24 Tools",
    shortName: "PDF24",
    homepage: "https://tools.pdf24.org/en/",
    category: "pdf",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "high",
    paidPrice: "",
    freeTierLimits: [
      'All online tools are free with no metering — the FAQ states the tools are available "to all users, including companies, free of charge and without restriction"',
      'No artificial file-size or file-count cap: "There are no artificial limits at PDF24"',
      'Funded by advertising: the service is "financed by means of discreet advertising on the websites"',
      'Uploaded files are "automatically deleted from the processing server within one hour after processing", and can also be removed manually immediately',
      "Files are processed on PDF24's own servers (EU data centres), with encrypted transfer — not in the browser",
    ],
    incumbentWins: [
      "Genuinely unmetered: no daily task cap, no watermark and no paid tier at all, which is rare among hosted PDF suites.",
      "PDF24 Creator is a free Windows desktop app that runs the same toolset fully offline, so files never leave the user's PC — a real answer for people who cannot upload documents.",
      "Server-side processing comfortably handles very large or scanned PDFs (OCR, heavy compression) that can exhaust a browser tab's memory.",
      "EU-hosted processing with encrypted transfer and automatic deletion inside an hour is a clear, specific privacy commitment rather than a vague promise.",
    ],
    sourcesChecked: ["https://tools.pdf24.org/en/", "https://tools.pdf24.org/en/faq"],
    valueProp:
      "The same unmetered, ad-funded deal PDF24 offers — with the one difference that the document is processed in your browser instead of being uploaded to a server in the EU.",
    summary:
      "PDF24 is the closest thing to a peer in this list: free, unmetered, no watermark, no paid tier, funded by ads, with a clear one-hour deletion policy and EU hosting. The honest difference is architectural, not commercial. PDF24 uploads and processes server-side, which is why OCR and heavy compression work well there; AltFTool processes locally, which is why nothing is uploaded but also why big scanned files depend on your hardware. If uploading is not a problem for your document, PDF24 is a completely reasonable choice.",
    comparison: {
      processing: "Uploaded to PDF24 servers in the EU; deleted within one hour.",
      account: "Not required.",
      freeCeiling: 'Unmetered — "There are no artificial limits at PDF24".',
      paid: "None — there is no paid tier.",
      ads: "Yes — the service is funded by advertising.",
      apps: "Yes — PDF24 Creator, a free Windows app that works offline.",
      api: "Yes — a documented PDF24 API.",
    },
    altftoolLimits: [
      "No OCR. PDF24 runs it server-side and does it well; we do not offer it at all.",
      "No desktop app. PDF24 Creator gives Windows users the whole toolset offline, and there is no AltFTool equivalent.",
      "Heavy compression on large scanned documents is where a server wins. On a big file, PDF24 will likely finish faster and squeeze harder.",
    ],
    primaryTool: "pdf-merger",
    tools: [
      "pdf-merger",
      "pdf-compressor",
      "pdf-split-tool",
      "img-to-pdf",
      "pdf-to-image-converter",
      "pdf-set-password",
      "pdf-password-remover",
      "pdf-watermark",
    ],
    migrationSteps: [
      { from: "Merge PDF", to: "pdf-merger" },
      { from: "Compress PDF", to: "pdf-compressor" },
      { from: "Split PDF", to: "pdf-split-tool" },
      { from: "Images to PDF", to: "img-to-pdf" },
      { from: "PDF to images", to: "pdf-to-image-converter" },
      { from: "Protect PDF", to: "pdf-set-password" },
      { from: "Unlock PDF", to: "pdf-password-remover" },
    ],
    faqs: [
      {
        question: "Both are free and ad-funded. What actually differs?",
        answer:
          "Where the file goes. PDF24 uploads it to an EU server and deletes it within an hour; AltFTool never receives it. If your objection to online tools is the upload itself, that is the whole difference.",
      },
      {
        question: "Which is faster on a 200 MB scanned PDF?",
        answer:
          "Almost certainly PDF24. Server CPUs do not care how old your laptop is. Our compressor is limited by the memory a browser tab is allowed to allocate.",
      },
      {
        question: "Does AltFTool have anything like PDF24 Creator?",
        answer:
          "No. There is no installable AltFTool desktop application. If you need a fully offline toolset on Windows, PDF24 Creator is the better answer.",
      },
    ],
  },

  "tinywow": {
    slug: "tinywow",
    name: "TinyWow",
    homepage: "https://tinywow.com/",
    category: "pdf",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "medium",
    paidPrice:
      "₹1,499 per month, or ₹1,249.92 per month billed yearly (prices displayed in INR to our region on tinywow.com/pricing)",
    freeTierLimits: [
      '"250+ Free Tools" available without payment, described as "And growing every month"',
      'Free users see advertisements — "No advertisements" is listed as a Premium-only benefit',
      'Free users must solve CAPTCHAs — "Skip all CAPTCHAs" is a Premium-only benefit',
      'Free users are on the standard queue — "Priority processing for faster results" is Premium-only',
      'Files are uploaded to TinyWow\'s servers: "Whenever you upload a file to our servers for processing, we delete the file 1-hour after the processing of that file is complete"',
      '"New files created from the originally uploaded file also are subject to the same 1-hour deletion time"',
    ],
    incumbentWins: [
      "Unusually broad single-site toolbox — 250+ tools spanning PDF, image, video and AI writing tasks, so most jobs land on one domain.",
      "Server-side processing means heavy video encoding and OCR complete regardless of how weak the visitor's laptop or phone is.",
      "A straightforward paid tier exists for people who genuinely dislike ads and CAPTCHAs, with priority processing — an upgrade path ad-only sites cannot offer.",
      "Retention policy is written plainly and specifically: every uploaded and generated file is deleted an hour after processing, uploads go over HTTPS, and they state they do not sell user data or uploaded documents.",
    ],
    sourcesChecked: [
      "https://tinywow.com/pricing",
      "https://tinywow.com/about",
      "https://tinywow.com/privacy",
      "https://tinywow.com/terms",
      "https://tinywow.com/faq",
    ],
    valueProp:
      "A comparable spread of file, image and PDF utilities, with no CAPTCHA between you and the result because there is no upload queue to protect.",
    summary:
      "TinyWow and AltFTool are both broad, ad-funded toolboxes, so the comparison comes down to mechanics. On TinyWow the free path runs through a shared processing queue, which is why free users solve CAPTCHAs and wait behind Premium traffic — Premium buys queue priority, not extra features. AltFTool has no queue: the tool code loads into your tab and runs there. The cost is that anything genuinely compute-heavy, particularly video encoding, is bounded by your device rather than by their servers.",
    comparison: {
      processing: "Uploaded to TinyWow servers; deleted one hour after processing.",
      account: "Not required for the free tier.",
      freeCeiling: "No published file cap, but free use means CAPTCHAs, ads and standard queue priority.",
      paid: "₹1,499/month, or ₹1,249.92/month billed yearly.",
      ads: "Yes — removing ads is a Premium benefit.",
      apps: "No installable desktop app advertised.",
      api: "Not advertised as a developer product.",
    },
    altftoolLimits: [
      "No AI writing tools. TinyWow's generative features need a model on a server; we have nothing equivalent bundled into these utilities.",
      "No OCR, and video work is limited. Long or high-bitrate video encoding belongs on a server, not in a tab.",
      "No priority anything. There is no paid tier here, so there is also no upgrade path if you want ads gone.",
    ],
    primaryTool: "image-compressor",
    tools: [
      "image-compressor",
      "pdf-merger",
      "pdf-compressor",
      "image-resizer",
      "bg-remover",
      "webp-to-png-jpg",
      "video-to-gif",
      "text-summarizer",
    ],
    migrationSteps: [
      { from: "Compress Image", to: "image-compressor" },
      { from: "Merge PDF", to: "pdf-merger" },
      { from: "Compress PDF", to: "pdf-compressor" },
      { from: "Resize Image", to: "image-resizer" },
      { from: "Remove Background", to: "bg-remover" },
      { from: "WEBP to PNG / JPG", to: "webp-to-png-jpg" },
      { from: "Video to GIF", to: "video-to-gif" },
    ],
    faqs: [
      {
        question: "Why does TinyWow show a CAPTCHA and AltFTool does not?",
        answer:
          "A CAPTCHA protects a shared upload queue from automated abuse. We have no queue — nothing is uploaded, so there is nothing to protect and no reason to interrupt you.",
      },
      {
        question: "Are AltFTool's tools ad-free?",
        answer:
          "No. Ads fund the site here as they do on TinyWow's free tier. The difference is that there is no paid plan to remove them.",
      },
      {
        question: "Can AltFTool handle a large video file?",
        answer:
          "Short clips, usually. Long or high-bitrate video is genuinely better handled server-side, and TinyWow's Premium queue priority exists for exactly that reason.",
      },
    ],
  },

  "123apps": {
    slug: "123apps",
    name: "123apps",
    homepage: "https://123apps.com/",
    category: "converter",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "high",
    paidPrice:
      "₹190 per month, or ₹1,824 once a year (-20%) (prices displayed in INR to our region on 123apps.com/pricing)",
    freeTierLimits: [
      'Free plan — "Files per day: 5"',
      'Free plan — "Maximum file size: 500 MB" (Premium raises this to "4 GB")',
      'Free plan — "Ads: Yes" (Premium: "Ads: No")',
      'All tools are available on both plans — "Tools included: 51" on free and premium alike',
      'Uploaded data is held server-side and "deleted automatically no later than twelve (12) hours from the moment you complete your use of our Services"',
    ],
    incumbentWins: [
      "Real video and audio editing depth — trim, merge, stabilise, change speed and pitch, screen and voice recording — which pure PDF/image toolboxes simply do not cover.",
      "Handles genuinely large media files (500 MB free, 4 GB on Premium) server-side, well past what a browser tab can hold in memory.",
      "51 tools share one clean, consistent interface across video, audio, PDF and file conversion, so the learning curve carries between tools.",
      "The free/paid split is published as a plain feature table with exact numbers, which makes it easy for a user to know in advance whether they will hit a wall.",
    ],
    sourcesChecked: [
      "https://123apps.com/",
      "https://123apps.com/pricing",
      "https://123apps.com/legal",
    ],
    valueProp:
      "Trimming, converting and compressing short media without the five-files-per-day free cap — as long as the file is small enough for your browser to hold.",
    summary:
      "123apps publishes its limits as a plain table, which makes the decision easy: five files a day and 500 MB per file on free, 4 GB on Premium. If you are trimming one podcast episode a week, the free tier is fine. If you are working through a folder, you hit the daily counter. AltFTool has no counter, but it also has no server, and a 500 MB video is exactly the case where their architecture wins and ours does not.",
    comparison: {
      processing: "Uploaded and processed server-side; deleted within twelve hours.",
      account: "Not required for the free tier.",
      freeCeiling: "5 files per day, 500 MB maximum per file (Premium: 4 GB).",
      paid: "₹190/month, or ₹1,824 per year (-20%).",
      ads: "Yes on free; Premium removes them.",
      apps: "Web-based, with browser extensions.",
      api: "Not offered as a developer product.",
    },
    altftoolLimits: [
      "No screen or voice recorder, no audio stabilisation, no pitch shifting — 123apps' editing depth is not something we match.",
      "Big media is their advantage. 500 MB free and 4 GB paid are server numbers; a browser tab will struggle long before that.",
      "No project state. 123apps keeps your working file for up to twelve hours; we keep nothing, so an interrupted edit restarts.",
    ],
    primaryTool: "video-trimmer",
    tools: [
      "video-trimmer",
      "video-compressor",
      "video-to-audio-converter",
      "mp3-cutter-audio-trimmer",
      "video-to-gif",
      "image-to-video",
      "pdf-merger",
      "image-compressor",
    ],
    migrationSteps: [
      { from: "Video Cutter", to: "video-trimmer" },
      { from: "Video Compressor", to: "video-compressor" },
      { from: "Video Converter (to audio)", to: "video-to-audio-converter" },
      { from: "Audio Cutter", to: "mp3-cutter-audio-trimmer" },
      { from: "Video to GIF", to: "video-to-gif" },
      { from: "PDF Merge", to: "pdf-merger" },
    ],
    faqs: [
      {
        question: "Is there a files-per-day limit on AltFTool?",
        answer:
          "No. 123apps counts files because each one occupies their servers for a while. Our tools run on your machine, so the only limit is how much your browser can hold at once.",
      },
      {
        question: "Can AltFTool trim a 2 GB video?",
        answer:
          "Realistically, no. That is squarely 123apps Premium territory. Our media tools are built for short clips, and a file that size will exhaust the tab.",
      },
      {
        question: "Does AltFTool record my screen or microphone?",
        answer:
          "No. 123apps has a screen recorder and a voice recorder; there is no equivalent in this toolset.",
      },
    ],
  },

  "tinypng": {
    slug: "tinypng",
    name: "TinyPNG (Tinify)",
    shortName: "TinyPNG",
    homepage: "https://tinypng.com/",
    category: "image",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "high",
    paidPrice:
      "Web Pro $3.25/month billed annually; Web Ultra $12.42/month billed annually (USD, per user, per year)",
    freeTierLimits: [
      'Free web tool: max 20 compressions per batch ("Max 20 compressions" on the Web Free plan)',
      "Free web tool: 5 MB maximum per image (paid Web Pro raises this to 75 MB, Web Ultra to 150 MB)",
      "Free web tool: max 3 format conversions per session (unlimited only on Web Ultra)",
      'Free web tool shows ads; "Ad free" is listed only under the paid Web Pro and Web Ultra plans',
      "Developer API: first 500 compressions each month are free, then $0.009 per compression for 501-10,000/month and $0.002 each above 10,000/month",
      'Files are uploaded to Tinify servers: "Images uploaded to the Service are temporarily stored, optimized and deleted within 48 hours." (Terms of Service)',
    ],
    incumbentWins: [
      "The compression engine is genuinely excellent — a decade of tuning on lossy palette quantization for PNG plus modern WebP/AVIF encoding usually beats a generic encoder preset at the same perceived quality.",
      "It is a real pipeline product, not just a web page: a documented API with 500 free compressions a month, official WordPress and Photoshop plugins, and an Image CDN, so compression can be automated inside a build or CMS instead of done by hand.",
      "Because compression runs on their servers, a 150 MB image or a large batch processes at full speed on any device — a low-powered laptop or phone never becomes the bottleneck.",
    ],
    sourcesChecked: [
      "https://tinypng.com/",
      "https://tinify.com/pricing/web",
      "https://tinify.com/pricing/api",
      "https://tinify.com/terms",
    ],
    valueProp:
      "Image compression that runs in your browser, so there is no 20-per-batch cap, no 5 MB ceiling and no 48-hour copy of your image sitting on someone's server.",
    summary:
      "TinyPNG's compressor is very good, and its 5 MB free ceiling exists because they pay for every byte you send them. AltFTool re-encodes in the browser with the codecs your browser already ships, which removes the batch and size caps but also removes the thing TinyPNG is famous for: a decade of tuning on palette quantization. On a flat-colour PNG or a logo, TinyPNG will usually produce a smaller file at the same perceived quality. On a photo you just need under a size budget, the difference is often not worth the upload.",
    comparison: {
      processing: "Uploaded to Tinify servers; stored, optimised and deleted within 48 hours.",
      account: "Not required for the free web tool.",
      freeCeiling: "20 compressions per batch, 5 MB per image, 3 format conversions per session.",
      paid: "Web Pro $3.25/month and Web Ultra $12.42/month, billed annually.",
      ads: "Yes on the free web tool; ad-free is a paid feature.",
      apps: "Plugins for WordPress and Photoshop rather than a standalone app.",
      api: "Yes — 500 free compressions/month, then $0.009 each.",
    },
    altftoolLimits: [
      "Our compression is a browser re-encode, not Tinify's tuned quantizer. On PNGs with flat colour, expect them to win on size at equal quality.",
      "No API, no WordPress plugin, no Photoshop plugin and no image CDN — nothing here fits into a build pipeline.",
      "Very large images are bounded by browser memory. TinyPNG's paid tiers take 75–150 MB files without blinking.",
    ],
    primaryTool: "image-compressor",
    tools: [
      "image-compressor",
      "image-resizer",
      "webp-to-png-jpg",
      "image-cropper",
      "heic-to-jpg",
      "image-quality-checker",
      "image-metadata-viewer",
      "svg-to-image",
    ],
    migrationSteps: [
      { from: "Compress PNG / JPEG / WebP", to: "image-compressor" },
      { from: "Resize while compressing", to: "image-resizer" },
      { from: "Convert to PNG or JPG", to: "webp-to-png-jpg" },
      { from: "Crop before export", to: "image-cropper" },
      { from: "Convert iPhone HEIC photos", to: "heic-to-jpg" },
      { from: "Check output quality", to: "image-quality-checker" },
    ],
    faqs: [
      {
        question: "Does AltFTool compress as well as TinyPNG?",
        answer:
          "Usually close on photographs, usually not on flat-colour PNGs and logos, where Tinify's palette quantizer is genuinely better. If a few kilobytes matter on an icon set, use TinyPNG.",
      },
      {
        question: "Is there a batch limit?",
        answer:
          "No fixed one. TinyPNG caps free batches at 20 images because each is uploaded and processed on their side; here the constraint is how many your browser can hold in memory at once.",
      },
      {
        question: "Can I automate AltFTool compression in a build?",
        answer:
          "No. There is no API. TinyPNG's developer plan — 500 free compressions a month, then $0.009 each — is built for exactly that and is the right tool for a pipeline.",
      },
    ],
  },

  "remove-bg": {
    slug: "remove-bg",
    name: "remove.bg",
    homepage: "https://www.remove.bg/",
    category: "image",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "medium",
    paidPrice:
      "Pay-as-you-go 3 credits ₹200; Lite ₹539.10/month (₹6,469.20 billed yearly); Pro ₹2,385/month (₹28,620 billed yearly); Volume+ ₹5,355/month (₹64,260 billed yearly). Prices are geo-localised — these are the INR figures shown to an India IP on 2026-07-25; USD figures not verified.",
    freeTierLimits: [
      'Free use on the website returns preview images only: "Preview is an image of up to 0.25 megapixels (e.g., 625 x 400)."',
      'Full-resolution output costs credits: "Removing the background from 1 image requires 1 credit if you want to download it in high resolution."',
      'A free account includes "one bonus credit (to test high-resolution download)" — the pricing page lists it as "1 trial credit"',
      'Free API/app usage: "50 free previews via API and apps each month"; previews cost ¼ credit via the apps and API',
      'Even paid plans are credit-capped: Lite is "Use up to 40 credits per month" and Pro is "Use up to 200 credits per month"',
      'Images are uploaded to their servers: "We upload them securely, process them as you would expect, provide you with the results for download, then delete them shortly after." The privacy policy also states uploads may be used to "train our algorithms, models and AI products"',
    ],
    incumbentWins: [
      "The cutout model is state of the art on the genuinely hard cases — hair, fur, motion blur and semi-transparent edges — and nothing that runs purely in a browser matches it today.",
      "It goes well beyond a single cutout: AI background replacement, an erase/restore brush, bulk editing, and integrations for Photoshop, Figma and Zapier make it a real production workflow for e-commerce and studio photography.",
      "Serious API infrastructure for businesses: output up to 50 megapixels, documented throughput of up to 500 images per minute, and enterprise plans with support — the kind of thing you can build a product on.",
    ],
    sourcesChecked: [
      "https://www.remove.bg/pricing",
      "https://www.remove.bg/api",
      "https://www.remove.bg/privacy",
      "https://www.remove.bg/help/a/what-are-image-credits",
      "https://www.remove.bg/help/a/what-is-the-difference-between-the-free-plan-subscription-and-pay-as-you-go",
    ],
    valueProp:
      "Background removal that runs in your browser and gives you the full-resolution file without spending a credit — on subjects with clean edges.",
    summary:
      "This is the one comparison where the incumbent is straightforwardly better at the core task. remove.bg's model handles hair, fur and motion blur in a way no in-browser segmentation matches today, and their privacy policy notes uploads may be used to train their models. What the free tier will not do is give you a full-resolution result: previews are capped at 0.25 megapixels, and the real file costs a credit. AltFTool's remover works locally and hands back the full-size image, and on a product shot against a plain backdrop that is often all you needed.",
    comparison: {
      processing:
        "Uploaded to their servers; deleted shortly after, and uploads may be used to train their models.",
      account: "Not required for previews; a free account grants 1 trial credit.",
      freeCeiling: "Website output is a preview of up to 0.25 MP; full resolution costs 1 credit per image.",
      paid: "Pay-as-you-go from ₹200 for 3 credits; Lite ₹539.10/month; Pro ₹2,385/month.",
      ads: "No ads; the free tier is limited by resolution and credits.",
      apps: "Yes — desktop app plus Photoshop, Figma and Zapier integrations.",
      api: "Yes — up to 50 MP output and ~500 images/minute throughput.",
    },
    altftoolLimits: [
      "Hair, fur, fine fabric and motion blur are where our cutout falls apart and theirs does not. This is not a close contest.",
      "No AI background replacement, no erase/restore brush, no bulk queue, no Photoshop or Figma integration.",
      "No API and no throughput guarantees, so an e-commerce catalogue of thousands of shots is not a job for this tool.",
    ],
    primaryTool: "bg-remover",
    tools: [
      "bg-remover",
      "image-cropper",
      "image-resizer",
      "image-compressor",
      "ai-passport-photo-maker",
      "image-editor",
      "meme-generator",
      "photo-to-sketch",
    ],
    migrationSteps: [
      { from: "Remove background from an image", to: "bg-remover" },
      { from: "Crop the cutout to a fixed frame", to: "image-cropper" },
      { from: "Resize for a marketplace listing", to: "image-resizer" },
      { from: "Compress the finished image", to: "image-compressor" },
      { from: "Passport / ID photo with a plain background", to: "ai-passport-photo-maker" },
    ],
    faqs: [
      {
        question: "Do I get a full-resolution image from AltFTool?",
        answer:
          "Yes. There is no preview tier and no credit to spend — the tool returns the cutout at the resolution you supplied, because the processing happened on your device.",
      },
      {
        question: "When should I pay for remove.bg instead?",
        answer:
          "Whenever edge quality decides the result: hair, fur, feathered fabric, motion blur, or a catalogue of shots that must all look consistent. Their model is meaningfully ahead on those.",
      },
      {
        question: "Is my photo used to train a model?",
        answer:
          "Not here — the image never reaches us. remove.bg's own privacy policy states uploads may be used to train their algorithms and AI products, which is worth knowing before uploading client work.",
      },
    ],
  },

  "iloveimg": {
    slug: "iloveimg",
    name: "iLoveIMG",
    homepage: "https://www.iloveimg.com/",
    category: "image",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "medium",
    paidPrice:
      "Premium ₹500/month on monthly billing, or ₹200/month billed annually (₹2,400/year). Prices are geo-localised — these are the INR figures shown to an India IP on 2026-07-25; USD/EUR figures not verified.",
    freeTierLimits: [
      "Free (Basic) batch limits, per task: 30 files for Compress, Resize, Convert to JPG, Convert from JPG, Rotate and Watermark; 10 files for Blur face; 3 files for Remove background; 1 file for Crop, Image Editor, Meme generator and Upscale (Premium raises most of these to 120)",
      "Free file-size limit per task: 200 MB for most tools, 90 MB for Crop, 50 MB for the Image Editor, 6 MB for Upscale (Premium raises most tools to 4 GB)",
      'Free plan is listed as "Limited tools" in the plan comparison; "All tools included" is Premium/Business only',
      'Free plan is ad-supported; "Ad-free service" is a Premium/Business row in the comparison table',
      "AI Credits are Premium-only: the free plan gets none, Premium includes 2,000 AI Credits per month",
      "Regional file processing: 7 regions on Premium, 11 on Business — not offered on the free plan",
      'Files are uploaded to their servers: "ILOVEPDF will delete the files of your Content within TWO (2) HOURS of being processed"',
    ],
    incumbentWins: [
      "A broad, genuinely well-designed suite — compress, resize, crop, convert, watermark, meme generator, blur face, upscale, remove background — all with one consistent, polished UI and mobile apps through the iLovePDF family.",
      "Real compliance answers for business buyers: ISO 27001 certification, a documented two-hour deletion window, SSO on the Business plan, and a choice of processing region (7 regions on Premium, 11 on Business).",
      "Server-side processing handles jobs a browser tab realistically cannot — 200 MB per task even on the free plan, 4 GB on Premium — plus a documented API for automating image workflows.",
    ],
    sourcesChecked: [
      "https://www.iloveimg.com/pricing",
      "https://www.iloveimg.com/help/privacy",
      "https://www.iloveimg.com/help/faq",
    ],
    valueProp:
      "Resize, crop, convert and compress images locally, without iLoveIMG's per-task file counts — one file at a time for Crop and the Editor is the cap that usually bites.",
    summary:
      "iLoveIMG's free batch caps are generous on the common tools (30 files for compress and resize) and strict on the rest — Crop, the Image Editor, the Meme generator and Upscale are one file per task. AltFTool has no per-task counter because each run happens in your tab. What we cannot offer is the other half of their pitch: ISO 27001, SSO, a two-hour documented deletion window and a choice of processing region are things a business buyer needs on paper, and a client-side tool has no paperwork to give.",
    comparison: {
      processing: "Uploaded to iLovePDF-family servers; deleted within two hours.",
      account: "Not required for the free tier.",
      freeCeiling:
        "30 files per task on compress/resize/convert, 3 on background removal, 1 on crop, editor, meme and upscale.",
      paid: "Premium ₹500/month monthly, or ₹200/month billed annually.",
      ads: "Yes — ad-free is a Premium/Business feature.",
      apps: "Yes — mobile apps through the iLovePDF family.",
      api: "Yes — a documented image API, with SSO on Business.",
    },
    altftoolLimits: [
      "No AI upscaling. iLoveIMG's upscaler runs on their hardware and there is no client-side equivalent worth recommending.",
      "No compliance story: no ISO 27001 certificate, no SSO, no regional processing choice, no DPA.",
      "Their free per-task size ceiling is 200 MB because a server is doing the work. Ours is whatever your browser can allocate.",
    ],
    primaryTool: "image-resizer",
    tools: [
      "image-resizer",
      "image-compressor",
      "image-cropper",
      "image-flip-rotate-tool",
      "webp-to-png-jpg",
      "meme-generator",
      "bg-remover",
      "watermark-remover",
    ],
    migrationSteps: [
      { from: "Resize IMAGE", to: "image-resizer" },
      { from: "Compress IMAGE", to: "image-compressor" },
      { from: "Crop IMAGE", to: "image-cropper" },
      { from: "Rotate IMAGE", to: "image-flip-rotate-tool" },
      { from: "Convert to JPG", to: "webp-to-png-jpg" },
      { from: "Meme generator", to: "meme-generator" },
      { from: "Remove background", to: "bg-remover" },
    ],
    faqs: [
      {
        question: "iLoveIMG lets me crop only one image at a time on free. Does AltFTool?",
        answer:
          "Our cropper is also one image at a time, but not because of a plan tier — it is an interactive tool. The difference is that there is no daily or per-task counter attached to it.",
      },
      {
        question: "Can AltFTool upscale a low-resolution image?",
        answer:
          "No. Useful upscaling needs a model running on real hardware. iLoveIMG's Premium upscaler (6 MB per task on free) is the appropriate tool.",
      },
      {
        question: "Does AltFTool blur faces in a photo?",
        answer:
          "Not automatically. iLoveIMG has a dedicated Blur face tool that detects faces for you; here you would crop or edit manually, which is slower.",
      },
    ],
  },

  "squoosh": {
    slug: "squoosh",
    name: "Squoosh",
    homepage: "https://squoosh.app/",
    category: "image",
    uploadsFiles: false,
    checkedOn: "2026-07-25",
    confidence: "high",
    paidPrice: "",
    freeTierLimits: [
      "Completely free with no account, no ads and no advertised usage cap anywhere on squoosh.app",
      "Single-image workflow: the file picker is not multi-select (input has multiple=false), so there is no batch or bulk queue in the web app",
      "Scope is compression, format conversion, resize and rotate only — no PDF, no background removal, no wider tool suite",
      'Files stay local: "Images never leave your device since Squoosh does all the work locally" (squoosh.app) and "Squoosh does not send your image to a server. All image compression processes locally." (project README)',
      "The project README discloses that Squoosh uses Google Analytics to collect basic visitor data plus the before and after image size values",
    ],
    incumbentWins: [
      "It is fully client-side and free, exactly like AltFTool — the same privacy posture, not a weaker one. Anyone recommending local-only image compression is on solid ground recommending Squoosh.",
      "Best-in-class encoder control: MozJPEG, OxiPNG, WebP, WebP v2, AVIF, JPEG XL and QOI codecs compiled to WebAssembly, with granular quality, effort, quantization and dithering settings that most one-click compressors hide entirely.",
      "The live side-by-side comparison slider with an instant file-size readout is the clearest way to actually judge a quality/size tradeoff, and the app is open source (Apache-2.0), installable as an offline PWA, and auditable or self-hostable.",
    ],
    sourcesChecked: [
      "https://squoosh.app/",
      "https://github.com/GoogleChromeLabs/squoosh",
      "https://raw.githubusercontent.com/GoogleChromeLabs/squoosh/dev/README.md",
      "https://api.github.com/repos/GoogleChromeLabs/squoosh/contents/codecs",
    ],
    valueProp:
      "Local image compression like Squoosh, plus the rest of the pipeline — crop, resize, format conversion, metadata inspection — on the same site.",
    summary:
      "Squoosh is not a service we are undercutting; it has the same privacy posture we do, and its encoder controls are better than ours. MozJPEG, OxiPNG, AVIF and JPEG XL with quality, effort and dithering exposed, plus a comparison slider that shows you exactly what you are trading — that is a better tool for tuning one image than anything here. Where AltFTool helps is the surrounding work: Squoosh is one image at a time and covers compression, conversion, resize and rotate only, so anything before or after that step happens elsewhere.",
    comparison: {
      processing: "In your browser — images never leave your device (same as AltFTool).",
      account: "Not required.",
      freeCeiling: "No usage cap; one image at a time, and the scope is compress/convert/resize/rotate.",
      paid: "None — free and open source (Apache-2.0).",
      ads: "No ads; the README discloses Google Analytics on visits and size values.",
      apps: "Installable as an offline PWA, and self-hostable.",
      api: "No API, but the codecs are open source and reusable.",
    },
    altftoolLimits: [
      "Squoosh exposes codec internals we do not: MozJPEG, OxiPNG, WebP v2, AVIF and JPEG XL with quality, effort, quantization and dithering settings.",
      "No side-by-side comparison slider with a live size readout — the clearest way to judge a quality tradeoff, and Squoosh's best feature.",
      "Squoosh is open source and self-hostable; our tools are not, so you cannot audit or run them yourself.",
    ],
    primaryTool: "image-compressor",
    tools: [
      "image-compressor",
      "image-resizer",
      "webp-to-png-jpg",
      "heic-to-jpg",
      "image-quality-checker",
      "image-resolution-compare",
      "image-cropper",
      "svg-to-image",
    ],
    migrationSteps: [
      { from: "Compress an image", to: "image-compressor" },
      { from: "Resize on export", to: "image-resizer" },
      { from: "Change format (WebP → PNG/JPG)", to: "webp-to-png-jpg" },
      { from: "Convert HEIC from an iPhone", to: "heic-to-jpg" },
      { from: "Compare two versions", to: "image-resolution-compare" },
      { from: "Crop before encoding", to: "image-cropper" },
    ],
    faqs: [
      {
        question: "Is Squoosh better than AltFTool for compression?",
        answer:
          "For tuning a single image carefully, yes. Its codec controls and comparison slider are more precise than ours, and it is open source. We are the better fit when compression is one step in a longer job.",
      },
      {
        question: "Do both really keep images on my device?",
        answer:
          "Yes. Squoosh states it plainly, and our image tools work the same way. This is a rare case where two tools make the same privacy claim and both are accurate.",
      },
      {
        question: "Can either of them batch-process a folder?",
        answer:
          "Squoosh's web app cannot — its file picker takes one image. Ours accepts multiple files on some tools, but a browser tab is still the ceiling; a build-time CLI is better for a whole folder.",
      },
    ],
  },

  "canva": {
    slug: "canva",
    name: "Canva",
    homepage: "https://www.canva.com/",
    category: "design",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "medium",
    paidPrice:
      "Canva Pro ₹4,000/year for one person; Canva Business ₹6,800/year per person (prices shown on canva.com today are regional — the site served INR from this location on both /pricing/ and /en_us/pricing/, so do not publish a USD figure without re-checking from a US IP)",
    freeTierLimits: [
      "Free plan includes 5 GB of cloud storage (Pro 100 GB, Business 500 GB, Enterprise 1 TB)",
      "Free AI allowance is capped at up to 200 Standard AI uses or 20 Premium AI uses; Pro gets 10x and Business 20x the Free allowance",
      "Free includes 1 Brand Kit limited to 3 colours (Pro 5 Brand Kits, Business 100, Enterprise 1000)",
      "Background remover, Magic Resize/custom resize and translate are listed as Pro-only 'premium tools'",
      "Free library is 1.6M+ templates and 4.7M+ photos/videos/graphics/audio; paid plans unlock 3.6M+ templates and 141M+ premium assets",
      "Premium elements show criss-cross watermarks in a Free user's design until purchased, and each purchase licenses that element for one design only — reusing it in another design requires buying it again",
      "Custom short links are unavailable on Free (up to 5 on Pro, 100 on Business)",
      "Extra AI beyond plan allowance requires the paid AI Pass add-on on Pro/Business",
    ],
    incumbentWins: [
      "The asset and template library is genuinely unmatched: 1.6M+ templates and 4.7M+ photos, videos, graphics and audio even on the free plan, all with clear commercial licensing — no client-side tool can offer stock content at all.",
      "It is a real collaboration platform: shared cloud storage, team roles and approvals, brand kits, comments and cross-device sync, so a team can work on the same design and pick it up on phone or desktop.",
      "It covers the whole workflow end to end — design, AI generation, social scheduling, print ordering, presentations, video — rather than one conversion or edit at a time, which is why it works as a company's design system of record.",
      "Designs are saved and versioned in your account, so nothing is lost when you close the tab — a real advantage over stateless browser tools.",
    ],
    sourcesChecked: [
      "https://www.canva.com/pricing/",
      "https://www.canva.com/en_us/pricing/",
      "https://www.canva.com/help/premium-elements/",
    ],
    valueProp:
      "For the small mechanical jobs people open Canva for — resize an image, remove a background, build a quick graphic — free tools with no account and no watermarked premium elements.",
    summary:
      "Canva is not really a comparison; it is a design platform with a stock library, brand kits, team approvals and saved, versioned documents. Nothing here replaces that. What this page is about is the narrower case: you opened Canva to resize a banner, strip a background or lay out a two-image collage, and hit a Pro-only tool or a watermarked element. Those specific jobs run fine in a browser tab. If you are actually designing — with templates, assets and a team — keep Canva.",
    comparison: {
      processing: "Uploaded to Canva's cloud, where designs are stored and versioned.",
      account: "Yes — an account is required to design and save.",
      freeCeiling:
        "5 GB storage, 200 Standard / 20 Premium AI uses, 1 Brand Kit with 3 colours; background remover and Magic Resize are Pro-only.",
      paid: "Canva Pro ₹4,000/year for one person; Business ₹6,800/year per person.",
      ads: "No ads; premium elements are watermarked until purchased.",
      apps: "Yes — web, desktop and mobile with cross-device sync.",
      api: "Yes — a developer platform and app ecosystem.",
    },
    altftoolLimits: [
      "No stock library. Canva's 1.6M+ free templates and 4.7M+ assets with commercial licensing have no equivalent here, and that is the main reason people use it.",
      "No saving, no versioning, no collaboration. Close the tab and the work is gone; Canva keeps every design in your account.",
      "No brand kits, no approval workflows, no social scheduling, no print ordering.",
    ],
    primaryTool: "meme-generator",
    tools: [
      "meme-generator",
      "image-collage-maker",
      "image-resizer",
      "bg-remover",
      "icon-maker",
      "gradient-generator",
      "color-palette-from-image",
      "text-behind-image",
    ],
    migrationSteps: [
      { from: "Resize a design for another platform", to: "image-resizer" },
      { from: "Background Remover (Pro-only in Canva)", to: "bg-remover" },
      { from: "Photo grid / collage layout", to: "image-collage-maker" },
      { from: "Quick meme or caption graphic", to: "meme-generator" },
      { from: "Pull a palette out of a photo", to: "color-palette-from-image" },
      { from: "Text-behind-subject effect", to: "text-behind-image" },
    ],
    faqs: [
      {
        question: "Can AltFTool replace Canva?",
        answer:
          "No, and it is not trying to. Canva is a design platform with a stock library and team features. These are single-purpose utilities for the mechanical steps around a design.",
      },
      {
        question: "Canva's background remover is Pro-only. Is there a free option?",
        answer:
          "Yes — our background remover runs in your browser at no cost and returns the full-resolution file. On difficult edges like hair it will not match a paid model, but for a product shot it usually does the job.",
      },
      {
        question: "Will my work be saved?",
        answer:
          "No. Nothing is stored on our side, so there is no autosave and no version history. Download the result before you close the tab.",
      },
    ],
  },

  "photopea": {
    slug: "photopea",
    name: "Photopea",
    homepage: "https://www.photopea.com/",
    category: "image",
    uploadsFiles: false,
    checkedOn: "2026-07-25",
    confidence: "medium",
    paidPrice:
      'School/organisation ad-free licence: "prices start at $450 per year for the whole school" (photopea.com/schools). The individual Premium price could not be confirmed on Photopea\'s own site today — it is only shown inside the in-app Account window — so no per-user figure should be published.',
    freeTierLimits: [
      'The editor is free with no account required, no export cap and no watermark — Photopea\'s own site says users "enjoy all the premium features without spending a dime"',
      'The free version is ad-supported; a Premium account\'s stated benefit is removing ads ("lets you use Photopea without advertisement and may have other benefits")',
      "Premium is sold as prepaid time (e.g. buying 90 days of Premium reverts to a free account after 90 days)",
      'AI features are the one server-side, metered part: Photopea states Premium accounts can use them "hundreds of times per month", and heavier use requires connecting your own paid Dezgo API key',
      "Schools that want the editor embedded ad-free must buy a domain-whitelist licence rather than use it free",
    ],
    incumbentWins: [
      "It is a real Photoshop-class editor — layers, masks, smart objects, adjustment layers, blend modes — and it opens PSD, AI, XD, Sketch, XCF and 40+ other formats with high fidelity. Single-purpose browser tools do not attempt this depth.",
      'Like AltFTool, it is fully local: "Files, which you open in Photopea, are never sent anywhere, they never leave your device." We should say so plainly instead of claiming a privacy edge we do not have here.',
      "Its free tier is unusually honest — full feature set, no watermark, no save cap, no signup — funded by ads, with a paid option for schools that want it ad-free.",
      "It offers a documented embedding/scripting API, so other sites and school platforms can run the whole editor inside their own product.",
    ],
    sourcesChecked: [
      "https://www.photopea.com/",
      "https://www.photopea.com/privacy.html",
      "https://www.photopea.com/schools/",
      "https://www.photopea.com/api/accounts",
      "https://www.photopea.com/tuts/get-unlimited-ai-inside-photopea/",
      "https://www.photopea.com/tuts/premium-account-does-not-work/",
    ],
    valueProp:
      "Single-purpose image tools for jobs that do not need a layered editor — crop to a size, strip a background, convert a format, get out.",
    summary:
      "Photopea is a Photoshop-class editor that runs locally in your browser and opens PSD, AI, XD, Sketch and XCF files. It is free, unwatermarked, needs no account, and it makes exactly the same privacy claim we do — files never leave your device. There is no privacy argument to make here, and no feature argument either: if you need layers, masks or blend modes, Photopea wins outright. The case for AltFTool is narrower. A lot of image work is one operation, and opening a full editor to crop a screenshot is more machinery than the task needs.",
    comparison: {
      processing: "In your browser — files never leave your device (same as AltFTool).",
      account: "Not required.",
      freeCeiling: "Full feature set free: no export cap, no watermark; AI features are the metered part.",
      paid: "Ad-free Premium sold as prepaid time; school licences from $450/year.",
      ads: "Yes — the free editor is ad-supported.",
      apps: "Web-based; also embeddable in other sites.",
      api: "Yes — a documented embedding and scripting API.",
    },
    altftoolLimits: [
      "No layers, masks, smart objects, adjustment layers or blend modes. Nothing here is an image editor in Photopea's sense.",
      "No PSD, AI, XD, Sketch or XCF support. If you need to open a designer's working file, Photopea is the only free option that does it well.",
      "No scripting or embedding API — Photopea can be dropped inside another product; our tools cannot.",
    ],
    primaryTool: "image-editor",
    tools: [
      "image-editor",
      "image-cropper",
      "image-flip-rotate-tool",
      "bg-remover",
      "image-compressor",
      "text-behind-image",
      "color-picker",
      "image-resizer",
    ],
    migrationSteps: [
      { from: "Quick crop or straighten", to: "image-cropper" },
      { from: "Rotate or flip a photo", to: "image-flip-rotate-tool" },
      { from: "Erase a background", to: "bg-remover" },
      { from: "Export smaller for the web", to: "image-compressor" },
      { from: "Pick a colour off an image", to: "color-picker" },
      { from: "Resize to exact pixels", to: "image-resizer" },
    ],
    faqs: [
      {
        question: "Is AltFTool more private than Photopea?",
        answer:
          "No. Photopea states that files opened in it never leave your device, and that is accurate. Both tools process locally, so privacy is not the deciding factor between them.",
      },
      {
        question: "Can AltFTool open a PSD file?",
        answer:
          "No. Photopea reads PSD, AI, XD, Sketch, XCF and dozens of other formats with good fidelity. That is genuinely its own category.",
      },
      {
        question: "Then why use AltFTool for images at all?",
        answer:
          "Speed of intent. If the job is 'make this 800 px wide' or 'get this under 200 KB', a single-purpose page is fewer decisions than a full editor. For anything with layers, use Photopea.",
      },
    ],
  },

  "pixlr": {
    slug: "pixlr",
    name: "Pixlr",
    homepage: "https://pixlr.com/",
    category: "image",
    uploadsFiles: false,
    checkedOn: "2026-07-25",
    confidence: "medium",
    paidPrice:
      "Plus $2.49/month ($1.99/month billed yearly); Premium $9.99/month ($7.99/month yearly); Ultra from $24.99/month ($19.99/month yearly); Ultra MAX $49.99/month ($39.99/month yearly)",
    freeTierLimits: [
      'pixlr.com/pricing lists no free tier at all — the cheapest plan shown is Plus at $2.49/month, and "Ad-Free" plus "Unlimited saves" are sold as Plus features, so free use is ad-supported and save-capped',
      'New users get 20 AI credits, described by Pixlr as "generating 20 images using 20 credits"; a 7-day free trial adds 250 credits (Pixlr\'s own blog says that produces "over 60 free images")',
      'AI credits expire — every paid tier states "Credits valid for 1 month": 80/month on Plus, 1,000/month on Premium, up to 10,000/month on Ultra',
      "Concurrent AI generations are throttled by plan: 1 on Plus, 4 on Premium, 8 on Ultra",
      "Private mode for AI generations is Premium and above; extended high-res exports and priority AI queue are Ultra-only",
      "Access to all image, video and audio AI models starts at Premium ($9.99/month)",
    ],
    incumbentWins: [
      "Its generative AI genuinely cannot be replicated client-side: text-to-image, generative edits, video and audio models all need serious server compute, and Pixlr packages them behind a simple interface.",
      "It ships everywhere — web, iOS, Android and desktop — with cloud project sync, so an edit started on a phone continues on a laptop.",
      "There is a real ladder of depth: Pixlr Express for a quick crop or touch-up, the full Editor for layers and masks, plus a large library of fonts, templates, elements and animations.",
      'Its own privacy policy takes a local-first position for editing — photos are "stored locally within the web browser" and "We do not upload nor store any photographs" — which is a fair claim, so we should not imply Pixlr is careless with files.',
    ],
    sourcesChecked: [
      "https://pixlr.com/pricing/",
      "https://pixlr.com/privacy-policy/",
      "https://pixlr.com/image-generator/",
      "https://pixlr.com/blog/how-to-get-free-images-with-ai-image-generation/",
      "https://pixlr.com/blog/no-more-save-limits-embrace-pixlrs-plus-premium-plans/",
      "https://pixlr.com/",
    ],
    valueProp:
      "Everyday image edits with no save cap and no credit meter — for the jobs that do not involve a generative model.",
    summary:
      "Pixlr's paid ladder is built around two things: unlimited saves and AI credits. The AI half is not something a browser tool can copy — text-to-image and generative fill need server GPUs, and no amount of client-side JavaScript changes that. The saves half is different. Pixlr sells unlimited saves as a Plus feature because it hosts your projects; AltFTool never holds a project, so there is nothing to cap. Worth noting: Pixlr's privacy policy says editing happens locally and photos are not uploaded, so this is not a privacy comparison either.",
    comparison: {
      processing:
        'Editing is local — Pixlr states photos are "stored locally within the web browser" and not uploaded. AI generation runs on their servers.',
      account: "Required for saving; AI credits are tied to the account.",
      freeCeiling: "Ad-supported and save-capped; 20 AI credits for new users, 250 more on a 7-day trial.",
      paid: "Plus $2.49/mo, Premium $9.99/mo, Ultra from $24.99/mo, Ultra MAX $49.99/mo.",
      ads: 'Yes on free — "Ad-Free" is a Plus feature.',
      apps: "Yes — web, iOS, Android and desktop with cloud project sync.",
      api: "Not offered as a general developer API.",
    },
    altftoolLimits: [
      "No generative AI at all: no text-to-image, no generative fill, no AI video or audio models. This is Pixlr's core paid value and we do not compete with it.",
      "No layers-and-masks editor comparable to Pixlr E, and no library of fonts, templates, elements or animations.",
      "No mobile app and no cloud sync — an edit started on a phone does not continue on a laptop.",
    ],
    primaryTool: "image-editor",
    tools: [
      "image-editor",
      "image-cropper",
      "image-resizer",
      "bg-remover",
      "photo-to-sketch",
      "meme-generator",
      "image-collage-maker",
      "color-palette-from-image",
    ],
    migrationSteps: [
      { from: "Pixlr Express quick edit", to: "image-editor" },
      { from: "Crop to a preset size", to: "image-cropper" },
      { from: "Resize for a platform", to: "image-resizer" },
      { from: "Remove background", to: "bg-remover" },
      { from: "Sketch / stylised effect", to: "photo-to-sketch" },
      { from: "Collage layout", to: "image-collage-maker" },
    ],
    faqs: [
      {
        question: "Does AltFTool generate images with AI?",
        answer:
          "No. Generative models need server GPUs and a credit system to pay for them. Pixlr's AI credits — 80/month on Plus up to 10,000 on Ultra — are buying real compute.",
      },
      {
        question: "Is there a save limit here?",
        answer:
          "No, because there are no saved projects. Every result is downloaded directly to your device. Pixlr caps free saves because it stores your work for you.",
      },
      {
        question: "Is Pixlr uploading my photos?",
        answer:
          "For editing, their privacy policy says no — photos are held locally in the browser. AI generation is the part that runs on their servers. We mention this because it would be easy to imply otherwise, and it would be wrong.",
      },
    ],
  },

  "kraken-io": {
    slug: "kraken-io",
    name: "Kraken.io",
    homepage: "https://kraken.io/",
    category: "image",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "high",
    paidPrice:
      "Micro $5/month ($50/year), Basic $9/month ($90/year), Advanced $19/month ($190/year), Premium $39/month ($390/year), Enterprise $79/month ($790/year) — yearly billing includes 2 months free",
    freeTierLimits: [
      "Free account comes with a 100 MB testing quota, no credit card required",
      "The free Web Interface caps each image at 1 MB; the PRO interface raises this to 32 MB",
      "The free Web Interface allows up to 20 files per batch",
      "Image resizing and image conversion are PRO-only — the free interface optimises only",
      'Optimised images are available for download for 12 hours on the free Web Interface; Kraken\'s API docs state optimised images stay on their servers "for one hour only". PRO users keep files in Kraken.io Cloud Storage',
      "Paid plans are monthly data quotas — 500 MB (Micro) to 60 GB (Enterprise) — with overage billed at $5/GB down to $1/GB depending on plan",
    ],
    incumbentWins: [
      "The compression engine is the product, and it is a strong one: lossless and intelligent lossy modes tuned per format across JPG, PNG, WebP (incl. animated), GIF, SVG, AVIF, HEIC and PDF, with a detailed savings report.",
      "It is built for automation, not one-off use: a full REST API, WordPress plugin, Magento extension, and direct delivery of optimised files to S3, Azure, Cloud Files or SoftLayer. A browser-only tool cannot optimise an entire site's image pipeline on a schedule.",
      "Server-side processing means very large batches and heavy formats do not depend on the user's device or browser memory, and results are consistent regardless of the machine used.",
      "Kraken.io Cloud Storage keeps optimised assets retrievable for paid users, which suits agencies re-downloading assets long after the job ran.",
    ],
    sourcesChecked: [
      "https://kraken.io/plans",
      "https://kraken.io/web-interface",
      "https://kraken.io/docs",
      "https://kraken.io/",
      "https://kraken.io/privacy",
    ],
    valueProp:
      "Free image compression with no 1 MB per-file ceiling and no monthly data quota — plus resizing and format conversion, which Kraken keeps behind PRO.",
    summary:
      "Kraken.io is an infrastructure product wearing a web interface. The free tier — 1 MB per image, 20 per batch, 100 MB of testing quota — exists to demo the API, not to be a daily tool, and resizing and conversion are deliberately PRO-only. If your goal is to optimise a site's images on a schedule, through S3 delivery or a WordPress plugin, that is what Kraken is for and this page will not change your mind. If your goal is to get one folder of images down in size today, a browser tool has no quota to run out of.",
    comparison: {
      processing:
        "Uploaded to Kraken servers; free results downloadable for 12 hours, API output kept one hour.",
      account: "Free account required, with a 100 MB testing quota.",
      freeCeiling: "1 MB per image, 20 files per batch; resizing and conversion are PRO-only.",
      paid: "Micro $5/mo up to Enterprise $79/mo, priced by monthly data quota.",
      ads: "No ads; the free tier is limited by quota instead.",
      apps: "Plugins for WordPress and Magento rather than a desktop app.",
      api: "Yes — a full REST API with S3, Azure and Cloud Files delivery.",
    },
    altftoolLimits: [
      "No API, no WordPress or Magento plugin, no S3 delivery — nothing here can run on a schedule against a site's asset pipeline.",
      "Kraken's per-format tuning across animated GIF, SVG, AVIF and HEIC goes deeper than a browser re-encode does.",
      "No cloud storage of results. Kraken keeps optimised assets retrievable for paid users; we hand you the file and forget it.",
    ],
    primaryTool: "image-compressor",
    tools: [
      "image-compressor",
      "image-resizer",
      "webp-to-png-jpg",
      "heic-to-jpg",
      "svg-to-image",
      "image-quality-checker",
      "image-metadata-viewer",
      "pdf-compressor",
    ],
    migrationSteps: [
      { from: "Optimise JPG / PNG / WebP", to: "image-compressor" },
      { from: "Resize (PRO-only on Kraken)", to: "image-resizer" },
      { from: "Convert format (PRO-only on Kraken)", to: "webp-to-png-jpg" },
      { from: "HEIC input", to: "heic-to-jpg" },
      { from: "Rasterise an SVG", to: "svg-to-image" },
      { from: "Compress a PDF", to: "pdf-compressor" },
    ],
    faqs: [
      {
        question: "Kraken's free web interface caps images at 1 MB. Does AltFTool?",
        answer:
          "No fixed cap. The practical limit is browser memory, which comfortably handles typical photographs — well past 1 MB. Kraken's cap protects a paid data quota; we have no quota.",
      },
      {
        question: "Can I resize and convert for free?",
        answer:
          "Yes. Both are PRO features on Kraken's web interface; here they are separate free tools that run locally.",
      },
      {
        question: "Should I still use Kraken?",
        answer:
          "If image optimisation is part of a deployment or CMS pipeline, yes. Their REST API, plugins and S3 delivery solve a problem a page in a browser cannot solve at all.",
      },
    ],
  },

  "cloudconvert": {
    slug: "cloudconvert",
    name: "CloudConvert",
    homepage: "https://cloudconvert.com",
    category: "converter",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "high",
    paidPrice:
      "Package US$18 one-time for 1,000 credits (US$0.018/credit); Subscription US$10/month for 1,000 credits/month (US$0.01/credit)",
    freeTierLimits: [
      "Free plan gives 10 conversion credits per day, with a daily reset (cloudconvert.com/pricing, checked 2026-07-25)",
      "Free plan caps file size at 1 GB and processing time at 5 minutes per conversion",
      "Free plan allows 5 concurrent tasks and runs at 'Low' processing priority; paid tiers are 'High'",
      "Credits are consumed per conversion: 1 base credit for a general conversion, 2 for Office-to-PDF, 4 for PDF-to-Office, plus 1 more credit for every extra minute of conversion time",
      "A free account is required; the pricing page states 'Start free with 10 conversions per day. No credit card required.'",
      "Free plan excludes dedicated capacity, custom fonts, SLA, DPA, SSO/SAML and team billing",
    ],
    incumbentWins: [
      "Genuinely broad and deep format coverage - the site states it handles 212 formats across 11 categories, including CAD, ebook, archive and font types that no in-browser toolbox can decode.",
      "Real conversion controls and a first-class API: per-conversion codec, bitrate, resolution and quality settings, plus a documented jobs API (import / convert / export tasks) that plugs into your own storage and application logic.",
      "Serious operational engineering for large or sensitive jobs: unlimited file size and processing time on paid plans, each conversion runs in a separate isolated container, you choose the geographic processing region, and files are 'kept only for processing and deleted immediately afterwards' with SSL in transit, a DPA, 99.9% SLA and SSO available.",
    ],
    sourcesChecked: [
      "https://cloudconvert.com/pricing",
      "https://cloudconvert.com/security",
      "https://cloudconvert.com/",
    ],
    valueProp:
      "The handful of conversions people actually run daily — image formats, images to PDF, PDF to images — without an account or a ten-credit-a-day budget.",
    summary:
      "CloudConvert covers 212 formats, including CAD, ebook, archive and font types that a browser has no decoder for. That breadth is the product and it is not something we approach. What a browser can do is the short head of the distribution: HEIC to JPG, WebP to PNG, images to PDF, PDF to images, CSV to JSON. Those are the conversions that burn CloudConvert's ten free credits a day, and they need no server at all. For anything outside that list, their credits are cheap and the isolated-container architecture is well engineered.",
    comparison: {
      processing:
        "Uploaded and converted in an isolated container; files kept only for processing, then deleted.",
      account: "Yes — a free account is required.",
      freeCeiling: "10 credits per day, 1 GB per file, 5 minutes per conversion, low priority.",
      paid: "US$18 one-time for 1,000 credits, or US$10/month for 1,000 credits/month.",
      ads: "No ads; the free tier is limited by credits.",
      apps: "Web-based, with integrations rather than a desktop app.",
      api: "Yes — a documented jobs API with import/convert/export tasks and SSO.",
    },
    altftoolLimits: [
      "212 formats versus a couple of dozen. No CAD, no ebook formats, no archives, no fonts — a browser cannot decode them.",
      "No conversion controls. CloudConvert lets you set codec, bitrate, resolution and quality per job; our converters use sensible defaults.",
      "No API, no SLA, no DPA, no regional processing choice, no isolated containers — none of the operational guarantees a business conversion pipeline needs.",
    ],
    primaryTool: "webp-to-png-jpg",
    tools: [
      "webp-to-png-jpg",
      "heic-to-jpg",
      "img-to-pdf",
      "pdf-to-image-converter",
      "video-to-audio-converter",
      "video-to-gif",
      "csv-to-json",
      "json-to-excel-csv",
    ],
    migrationSteps: [
      { from: "WEBP to PNG / JPG", to: "webp-to-png-jpg" },
      { from: "HEIC to JPG", to: "heic-to-jpg" },
      { from: "JPG / PNG to PDF", to: "img-to-pdf" },
      { from: "PDF to JPG", to: "pdf-to-image-converter" },
      { from: "MP4 to MP3", to: "video-to-audio-converter" },
      { from: "CSV to JSON", to: "csv-to-json" },
    ],
    faqs: [
      {
        question: "Does AltFTool convert as many formats as CloudConvert?",
        answer:
          "Nowhere near. They list 212 formats across 11 categories. We cover the common image, document and data conversions a browser can decode natively, which is a much shorter list.",
      },
      {
        question: "Do I need an account?",
        answer:
          "No. CloudConvert requires a free account for its 10 daily credits; our converters open and run without signing in.",
      },
      {
        question: "What about a 1 GB video conversion?",
        answer:
          "Use CloudConvert. Their free plan already accepts 1 GB files with a 5-minute processing budget, and paid plans remove both limits. A browser tab is the wrong place for that job.",
      },
    ],
  },

  "convertio": {
    slug: "convertio",
    name: "Convertio",
    homepage: "https://convertio.co",
    category: "converter",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "medium",
    paidPrice:
      "Lite US$11.99/month billed monthly (US$6.99/month billed yearly); Basic US$22.99/month; Pro US$44.99/month; Custom from US$54/month",
    freeTierLimits: [
      "Convertio's help centre states the free tier allows up to 1 GB per file, 10 conversion credits per 24 hours, and 10 concurrently launched conversions (support.convertio.co, checked 2026-07-25)",
      "Convertio's own Terms of Use still describes a stricter free tier - 'maximum of 100 MB single file size, a maximum of 2 concurrent conversions, a maximum of 10 conversion minutes within a 24-hour period' - so the two vendor pages disagree",
      "Free OCR (text recognition) is limited to a maximum of 10 recognised pages per the Terms of Use",
      "Free API use is capped at 25 file conversions within a 24-hour period per the Terms of Use",
      "Ad-free pages are listed as a paid-plan feature, so free users see ads",
      "Uploaded input files are deleted instantly after conversion; output files are deleted after 24 hours (or immediately if you click 'X')",
    ],
    incumbentWins: [
      "Exceptionally wide catalogue - Convertio advertises 'more than 25600 different conversions between more than 300 different file formats', covering long-tail formats a client-side tool simply has no decoder for.",
      "Files are processed and stored in the European Union, input files are wiped instantly after conversion, and the retention rules are written plainly in the privacy policy - a reasonable answer for people who must use a server converter but care about jurisdiction.",
      "Paid tiers scale well past what a browser can hold in memory: up to 10 GB files with unlimited concurrent conversions on Pro, 20 GB on Custom, plus server-side OCR for scanned documents.",
    ],
    sourcesChecked: [
      "https://convertio.co/pricing/",
      "https://convertio.co/terms/",
      "https://convertio.co/privacy/",
      "https://support.convertio.co/hc/en-us/articles/360004386774-Free-tier-limit-for-file-conversions",
      "https://convertio.co/",
    ],
    valueProp:
      "Common image and document conversions with no 24-hour credit window — and no ambiguity about which free-tier limits actually apply.",
    summary:
      "Convertio's free limits are worth reading carefully, because their own pages disagree: the help centre says 1 GB per file and 10 credits per 24 hours, while the Terms of Use still describe 100 MB and 10 conversion minutes. Either way there is a daily window, and OCR is capped at ten pages. AltFTool has no window because there is no conversion server. The tradeoff is coverage: Convertio advertises more than 25,600 conversions across 300+ formats, and most of those are formats a browser has no decoder for.",
    comparison: {
      processing:
        "Uploaded and processed in the EU; input files wiped instantly, output deleted after 24 hours.",
      account: "Not required for the free tier.",
      freeCeiling:
        "10 credits per 24 hours; the help centre says 1 GB per file while the Terms say 100 MB. OCR capped at 10 pages.",
      paid: "Lite US$11.99/mo (US$6.99 yearly), Basic US$22.99, Pro US$44.99, Custom from US$54.",
      ads: "Yes on free — ad-free pages are a paid feature.",
      apps: "Web-based, with browser extensions.",
      api: "Yes — free API use capped at 25 conversions per 24 hours.",
    },
    altftoolLimits: [
      "300+ formats and 25,600 conversion pairs is not a number we approach. Long-tail formats need server-side decoders.",
      "No OCR at all — Convertio gives ten free recognised pages and much more on paid plans.",
      "No EU-processing guarantee to point a compliance officer at, because there is no processing on our side to guarantee.",
    ],
    primaryTool: "heic-to-jpg",
    tools: [
      "heic-to-jpg",
      "webp-to-png-jpg",
      "img-to-pdf",
      "pdf-to-image-converter",
      "video-to-audio-converter",
      "video-to-gif",
      "csv-to-json",
      "base64-to-file",
    ],
    migrationSteps: [
      { from: "HEIC to JPG", to: "heic-to-jpg" },
      { from: "WEBP to PNG", to: "webp-to-png-jpg" },
      { from: "JPG to PDF", to: "img-to-pdf" },
      { from: "PDF to JPG", to: "pdf-to-image-converter" },
      { from: "MP4 to MP3", to: "video-to-audio-converter" },
      { from: "MP4 to GIF", to: "video-to-gif" },
    ],
    faqs: [
      {
        question: "Which Convertio free limit is correct?",
        answer:
          "Their pages disagree, so plan for the stricter one. The help centre lists 1 GB per file and 10 credits per 24 hours; the Terms of Use still say 100 MB and 10 conversion minutes per 24 hours.",
      },
      {
        question: "Does AltFTool have a daily conversion limit?",
        answer:
          "No. Conversions run in your browser, so there is no credit window to reset and no queue you are waiting in.",
      },
      {
        question: "Can AltFTool OCR a scanned document?",
        answer:
          "No. Convertio's free tier gives you ten recognised pages, which for a single scanned letter is usually enough, and paid plans go much further.",
      },
    ],
  },

  "zamzar": {
    slug: "zamzar",
    name: "Zamzar",
    homepage: "https://www.zamzar.com",
    category: "converter",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "high",
    paidPrice: "Basic US$12/month, Pro US$19/month, Business US$39/month",
    freeTierLimits: [
      "Free service allows converting up to 2 files and compressing up to 2 files in any 24-hour period (zamzar.com/faq, checked 2026-07-25)",
      "Free uploads are limited to 50 MB per file; 'If you upload two or more files together, then the total file size must be less than 50MB'",
      "No account is needed for the free service: 'If you are using our free service, then there's no need to log in.'",
      "Converted files are held for only 24 hours before removal, and the original file 'is deleted from our servers as soon as it is converted'",
      "Paid file-size ceilings are 200 MB (Basic), 400 MB (Pro) and 2 GB (Business); desktop conversions per day are capped at 50 / 100 / 500 respectively",
    ],
    incumbentWins: [
      "One of the largest format catalogues anywhere - the homepage claims 1100+ formats, including CAD, 3D, archive and ebook conversions that are impractical or impossible to run in a browser.",
      "Straightforward for non-technical users: no login for the free service, results delivered to a file inbox, 5-100 GB of online storage on paid plans, and a documented conversion API - plus a long track record and stable, well-indexed conversion pages.",
      "Clear, conservative retention: the original file is deleted as soon as it is converted and the converted copy is held only 24 hours, which is stated plainly in their FAQ rather than buried.",
    ],
    sourcesChecked: [
      "https://www.zamzar.com/faq/",
      "https://secure.zamzar.com/signup/",
      "https://www.zamzar.com/",
    ],
    valueProp:
      "Everyday file conversions without Zamzar's two-files-per-24-hours free ceiling — limited to the formats a browser can decode on its own.",
    summary:
      "Two files per 24 hours is the tightest free tier in this list, and it is deliberate: Zamzar's catalogue runs past 1,100 formats, and running CAD, 3D and ebook conversions costs them real compute per file. If you need one of those formats, nothing here helps and you should pay them. If you are converting a phone photo to JPG or a set of images into a PDF, those run in your browser instantly and repeatedly, which is what the free-tier counter was standing in the way of.",
    comparison: {
      processing:
        "Uploaded; the original is deleted as soon as it is converted, the output held 24 hours.",
      account: "Not needed for the free service.",
      freeCeiling: "2 conversions and 2 compressions per 24 hours, 50 MB total per upload.",
      paid: "Basic US$12/mo, Pro US$19/mo, Business US$39/mo.",
      ads: "No ads; the free tier is limited by the daily file count.",
      apps: "Yes — desktop conversions, capped at 50–500 per day by plan.",
      api: "Yes — a documented conversion API.",
    },
    altftoolLimits: [
      "1,100+ formats versus our short list. CAD, 3D, archive and ebook conversions are not possible client-side.",
      "No file inbox and no cloud storage. Zamzar's paid plans keep 5–100 GB of results; we hand you a download and keep nothing.",
      "No email delivery for long jobs — if the tab closes mid-conversion, the work is lost.",
    ],
    primaryTool: "img-to-pdf",
    tools: [
      "img-to-pdf",
      "pdf-to-image-converter",
      "webp-to-png-jpg",
      "heic-to-jpg",
      "video-to-audio-converter",
      "csv-to-json",
      "html-to-markdown-converter",
      "excel-to-html-converter",
    ],
    migrationSteps: [
      { from: "Images to PDF", to: "img-to-pdf" },
      { from: "PDF to JPG", to: "pdf-to-image-converter" },
      { from: "WEBP to PNG", to: "webp-to-png-jpg" },
      { from: "HEIC to JPG", to: "heic-to-jpg" },
      { from: "MP4 to MP3", to: "video-to-audio-converter" },
      { from: "CSV to JSON", to: "csv-to-json" },
    ],
    faqs: [
      {
        question: "Is there a two-files-a-day limit on AltFTool?",
        answer:
          "No. Zamzar's limit rations server capacity across 1,100+ formats. Our converters run in your browser, so repeat use costs nothing and is not counted.",
      },
      {
        question: "Can AltFTool convert a DWG or an EPUB?",
        answer:
          "No. Those need decoders that only exist server-side. Zamzar's catalogue is the reason their free tier is small, and it is the reason to use them for those formats.",
      },
      {
        question: "Where does my converted file go?",
        answer:
          "Straight to your downloads folder. There is no inbox and no stored copy — Zamzar keeps output for 24 hours, we keep it for zero seconds.",
      },
    ],
  },

  "freeconvert": {
    slug: "freeconvert",
    name: "FreeConvert",
    homepage: "https://www.freeconvert.com",
    category: "converter",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "high",
    paidPrice:
      "Basic US$12.99/month, Standard US$24.99/month, Pro US$29.99/month (monthly billing; yearly billing advertised as 'Get 2 months free'), Scale on-demand",
    freeTierLimits: [
      "Free users get 20 conversion minutes per day, shared across web and API use (freeconvert.com/pricing FAQ, checked 2026-07-25)",
      "Free usage is capped at 5 conversion minutes per file",
      "Free file size ceiling is 1 GB - tool pages state 'Max file size 1GB. Upgrade for more'",
      "No account is required to use the free minutes on the website; a free account is needed to use them via the API",
      "Free pages carry ads - 'No Ads' is listed only under 'In All Paid Plans'",
      "'100 conversions at a time' and 'Merge 100 files at a time' are paid-plan features",
      "Uploaded files are stored with AWS in Ireland and 'automatically and permanently deleted after 8 hours', with an option to delete manually sooner",
    ],
    incumbentWins: [
      "Real server-side media muscle: GPU/CPU video encoding on the Pro plan and file sizes up to 20 GB on Scale, which is far beyond what an in-browser encoder can handle for long or high-bitrate video.",
      "A deep, well-built media toolset - video/audio/GIF/PDF compressors with target-size options, trim and crop, GIF maker - backed by a documented REST API with per-format endpoints (HEIC to JPG, PDF to Word, website screenshot, and so on) for automation.",
      "Transparent, verifiable data handling: 256-bit SSL, files held on AWS in Ireland, automatic permanent deletion after 8 hours plus manual delete, and conversion minutes are automatically refunded for failed tasks with no contracts or setup fees.",
    ],
    sourcesChecked: [
      "https://www.freeconvert.com/pricing",
      "https://www.freeconvert.com/privacy",
      "https://www.freeconvert.com/video-converter",
    ],
    valueProp:
      "Short-clip video and audio work plus image and PDF compression, with no 20-minutes-a-day conversion budget to spend.",
    summary:
      "FreeConvert meters by time, not files: 20 conversion minutes a day and 5 minutes per file. That is a sensible way to price server encoding, and it is exactly what makes them the right choice for long video — GPU encoding on Pro and files up to 20 GB on Scale are things no browser will do. For a 30-second clip, a GIF, or a batch of images and PDFs, the meter is pure friction, and those jobs run locally without one.",
    comparison: {
      processing: "Uploaded to AWS in Ireland; permanently deleted after 8 hours, or manually sooner.",
      account: "Not required on the website; needed for API use.",
      freeCeiling: "20 conversion minutes per day, 5 minutes per file, 1 GB maximum file size.",
      paid: "Basic US$12.99/mo, Standard US$24.99/mo, Pro US$29.99/mo, Scale on-demand.",
      ads: "Yes on free — 'No Ads' is a paid-plan feature.",
      apps: "Web-based, no desktop app.",
      api: "Yes — a REST API with per-format endpoints.",
    },
    altftoolLimits: [
      "No GPU encoding and no 20 GB ceiling. Long or high-bitrate video is FreeConvert's job, not ours.",
      "No target-size compression — FreeConvert lets you name an output size and hits it; our compressors work from quality settings.",
      "No API, no batch of 100 conversions at a time, and no automatic refund when a job fails, because there is no job queue.",
    ],
    primaryTool: "video-compressor",
    tools: [
      "video-compressor",
      "video-trimmer",
      "video-to-gif",
      "mp3-cutter-audio-trimmer",
      "video-to-audio-converter",
      "image-compressor",
      "pdf-compressor",
      "webp-to-png-jpg",
    ],
    migrationSteps: [
      { from: "Video Compressor", to: "video-compressor" },
      { from: "Video Trimmer / Cutter", to: "video-trimmer" },
      { from: "Video to GIF", to: "video-to-gif" },
      { from: "Audio Cutter", to: "mp3-cutter-audio-trimmer" },
      { from: "Image Compressor", to: "image-compressor" },
      { from: "PDF Compressor", to: "pdf-compressor" },
    ],
    faqs: [
      {
        question: "How long a video can AltFTool handle?",
        answer:
          "Short clips. Encoding in a browser tab is bounded by memory and single-threaded performance, so a few seconds to a couple of minutes is realistic. FreeConvert's 5-minute-per-file free budget already exceeds that comfortably.",
      },
      {
        question: "Is there a daily minute budget here?",
        answer:
          "No. FreeConvert meters minutes because it pays for encoder time; the work here happens on your CPU, so nothing is metered.",
      },
      {
        question: "Can I compress a video to an exact target size?",
        answer:
          "Not precisely. FreeConvert's target-size mode does two-pass encoding server-side. Our compressor works from quality settings, so you may need a second attempt.",
      },
    ],
  },

  "jsonformatter": {
    slug: "jsonformatter",
    name: "JSONFormatter",
    homepage: "https://jsonformatter.org/",
    category: "developer",
    uploadsFiles: false,
    checkedOn: "2026-07-25",
    confidence: "medium",
    paidPrice: "",
    freeTierLimits: [
      "No paid tier exists — the whole site is free and ad-supported; https://jsonformatter.org/pricing returns HTTP 404 and no pricing link appears anywhere in the site navigation",
      "Saved-link expiry without an account is limited to 3 options: 1 hour, 8 hours, or 24 hours",
      "Longer expiry — 7 days, 15 days, 30 days, and 'Never' — is gated behind login: each option is labelled '(Login Required)'",
      "Anything you save while logged out is public: 'If JSON data is saved without login, it will become public. To make json data private please login and save the links.'",
      "Their privacy policy carries an all-caps warning about the save feature: 'DO NOT SAVE SENSITIVE DATA USING THE SAVE FUNCTIONALITY.'",
      "Traffic is tracked by Google Analytics and Clicky Web Analytics, and Google 'may use the data it collects to contextualize and personalize the ads'",
    ],
    incumbentWins: [
      "Formatting and validation genuinely run on your machine — their FAQ states 'Your JSON Data gets validated in the browser itself', so pasting a payload into the formatter does not ship it to their server. That is the same privacy posture AltFTool claims, and they earned it first.",
      "Shareable saved links are a real feature AltFTool has no equivalent for: you can save formatted JSON and send a colleague a URL, with expiry you choose (up to 'Never' with an account) and private visibility when logged in.",
      "One page does a lot without making you navigate between separate tools — format, validate, tree view, image preview on hover for image URLs, selectable 2/3/4-space indentation, and direct conversion to XML, CSV, and YAML.",
    ],
    sourcesChecked: [
      "https://jsonformatter.org/",
      "https://jsonformatter.org/policy",
      "https://jsonformatter.org/pricing",
    ],
    valueProp:
      "Format, validate and diff JSON in the browser — with no save feature, which means no accidental public link holding your payload.",
    summary:
      "JSONFormatter validates in the browser, exactly as we do, so there is no privacy edge to claim over them and we will not invent one. The difference is the save feature. Theirs is genuinely useful — a shareable URL for a formatted payload — but their own privacy policy warns in capitals not to save sensitive data, and anything saved while logged out is public. AltFTool has no save button at all. That is a missing feature, and for a payload with a token in it, a missing feature is the safer default.",
    comparison: {
      processing: "In the browser — their FAQ states JSON is validated client-side (same as AltFTool).",
      account: "Not required to format; needed for private or long-lived saved links.",
      freeCeiling: "No paid tier at all; saved links expire in 1–24 hours unless you log in.",
      paid: "None — /pricing returns 404 and no plan is offered.",
      ads: "Yes — ad-supported, with Google Analytics and Clicky tracking.",
      apps: "Web-based, no desktop app.",
      api: "Not offered.",
    },
    altftoolLimits: [
      "No shareable saved links. You cannot hand a colleague a URL to a formatted payload — that is JSONFormatter's best feature and we have no equivalent.",
      "No single page that does everything. Format, diff, tree view and conversions are separate tools here, which is more navigation.",
      "No hover image preview for image URLs inside a payload.",
    ],
    primaryTool: "json-formatter",
    tools: [
      "json-formatter",
      "json-editor",
      "json-compare",
      "json-to-yaml-converter",
      "json-parser",
      "csv-to-json",
      "json-to-typescript",
      "json-to-excel-csv",
    ],
    migrationSteps: [
      { from: "JSON Formatter / Validator", to: "json-formatter" },
      { from: "JSON Editor (tree view)", to: "json-editor" },
      { from: "JSON Diff", to: "json-compare" },
      { from: "JSON to YAML", to: "json-to-yaml-converter" },
      { from: "JSON to CSV", to: "json-to-excel-csv" },
      { from: "CSV to JSON", to: "csv-to-json" },
    ],
    faqs: [
      {
        question: "Is one of these more private than the other?",
        answer:
          "Not for formatting. JSONFormatter validates client-side and says so, and so do we. The difference is that they offer a save feature which uploads the payload, and we do not offer one at all.",
      },
      {
        question: "Can I share a formatted payload from AltFTool?",
        answer:
          "No. There is no save-and-share link. If you need that, JSONFormatter's saved links are the feature to use — just heed their own warning about sensitive data, and log in so the link is not public.",
      },
      {
        question: "Does AltFTool generate TypeScript types from JSON?",
        answer:
          "Yes, that is a separate tool in the list below. JSONFormatter converts to XML, CSV and YAML; type generation is one place our toolset goes further.",
      },
    ],
  },

  "code-beautify": {
    slug: "code-beautify",
    name: "Code Beautify",
    homepage: "https://codebeautify.org/",
    category: "developer",
    uploadsFiles: true,
    checkedOn: "2026-07-25",
    confidence: "high",
    paidPrice: "",
    freeTierLimits: [
      "No paid tier and no subscription — https://codebeautify.org/pricing returns HTTP 404, the FAQ mentions no paid features, and monetisation is ads plus an optional 'Buy us a Coffee' donation link",
      "Hard input size cap stated in their own FAQ: '1 MB. For better performance data size should be upto 100KB.'",
      "Processing timeouts stated in their FAQ: 'Beautify time: 5 seconds, minify time: 5 seconds'",
      "Links saved with the 'Save Online' button while logged out are publicly accessible; private, link-only saves require an account",
      "Their privacy policy confirms the file path leaves your machine: 'In case of URL loading and File upload, data traverse between server and client, but we do not not store any data.'",
      "Privacy policy advises against putting real data through the save feature: 'Do not save password, keys, real production data and confidential information.'",
      "Third-party data flows disclosed: Google Analytics (Google 'may use the data it collects to contextualize and personalize the ads of its own advertising network') and CloudFlare technical data collection",
    ],
    incumbentWins: [
      "For typed or pasted input their privacy policy is unusually direct and favourable: '99% of our tools are doing processing on browser using Java Script.' Only the explicit file-upload and load-from-URL paths touch their server, and they state they do not store that data.",
      "The breadth in one consistent interface is genuinely hard to beat — JSON, XML, CSS, SQL, JavaScript and HTML formatters, plus base64, hex, hashing and crypto, colour conversion, string utilities, image converters and random generators, all with the same editor conventions.",
      "It fits into a real workflow rather than being a one-off paste box: Save Online links, Recent/Archived/Favourites, optional accounts for private saves, and an official Chrome extension.",
      "No login wall on the tools themselves — accounts are strictly optional, and every tool is reachable and usable on first visit.",
    ],
    sourcesChecked: [
      "https://codebeautify.org/",
      "https://codebeautify.org/policy",
      "https://codebeautify.org/faq",
      "https://codebeautify.org/aboutus",
      "https://codebeautify.org/pricing",
    ],
    valueProp:
      "The same family of formatters and encoders, without Code Beautify's 1 MB input cap and 5-second processing timeout.",
    summary:
      "Code Beautify is a close analogue: free, ad-funded, no login wall, and by their own policy 99% of tools process in the browser. The limits that bite are mechanical rather than commercial — 1 MB of input, with a recommendation to stay under 100 KB, and a five-second beautify timeout. Their file-upload and load-from-URL paths do send data to a server, which is worth knowing, though they state nothing is stored. Ours process in the tab throughout, and a large file is bounded by memory rather than by a fixed cap.",
    comparison: {
      processing:
        "Mostly in the browser (their policy says 99% of tools); file upload and load-from-URL do reach their server.",
      account: "Optional — only needed for private saved links.",
      freeCeiling: "1 MB input cap (100 KB recommended), 5-second beautify and minify timeouts.",
      paid: "None — /pricing returns 404; funded by ads and donations.",
      ads: "Yes — ads plus a 'Buy us a Coffee' link.",
      apps: "An official Chrome extension.",
      api: "Not offered.",
    },
    altftoolLimits: [
      "No Save Online, no Recent/Archived/Favourites history, and no Chrome extension.",
      "Code Beautify's catalogue in one consistent editor is broader than our developer section, particularly on crypto and string utilities.",
      "No account layer at all, so nothing you do here can be revisited later on another machine.",
    ],
    primaryTool: "js-beautifier",
    tools: [
      "js-beautifier",
      "css-beautifier",
      "sql-formatter",
      "json-formatter",
      "xml-editor",
      "yaml-formatter",
      "diff-checker",
      "md5-hash-generator",
    ],
    migrationSteps: [
      { from: "JS Beautifier", to: "js-beautifier" },
      { from: "CSS Beautifier", to: "css-beautifier" },
      { from: "SQL Formatter", to: "sql-formatter" },
      { from: "JSON Viewer / Formatter", to: "json-formatter" },
      { from: "XML Viewer", to: "xml-editor" },
      { from: "YAML Formatter", to: "yaml-formatter" },
      { from: "Diff Checker", to: "diff-checker" },
    ],
    faqs: [
      {
        question: "Does AltFTool cap input at 1 MB?",
        answer:
          "No fixed cap. Code Beautify states 1 MB with 100 KB recommended and a five-second timeout; here the limit is what your browser can hold and how long you are willing to wait.",
      },
      {
        question: "Is Code Beautify sending my code to a server?",
        answer:
          "For pasted input, their policy says no — 99% of tools process in the browser. The exceptions are the file-upload and load-from-URL paths, which do transit their server, though they state nothing is stored.",
      },
      {
        question: "Can I save a snippet for later?",
        answer:
          "Not here. Code Beautify's Save Online, Recent and Favourites are real features with no AltFTool equivalent — though their own policy warns against saving production data or keys.",
      },
    ],
  },

  "calculator-net": {
    slug: "calculator-net",
    name: "Calculator.net",
    homepage: "https://www.calculator.net/",
    category: "calculator",
    uploadsFiles: false,
    checkedOn: "2026-07-25",
    confidence: "high",
    paidPrice: "",
    freeTierLimits: [
      "Completely free with no registration required and no paid tier of any kind — the site states its focus is to provide 'fast, comprehensive, convenient, free online calculators in a plethora of areas'",
      "Catalogue is narrow by design: roughly 195 calculators listed across their own sitemap — 71 financial, 57 other, 42 math, 25 fitness & health",
      "Only 4 top-level sections exist: financial, fitness & health, math, and others",
      "No programmatic access — their About page states plainly: 'Sorry, we do not have an API available.'",
      "Accounts are optional and do only one thing: save calculations and settings. Registered users get 'a button ... to delete your entire registration information, saved calculations, and settings after signing in.'",
      "Calculators only — the site handles no files, images, PDFs or conversions of documents",
    ],
    incumbentWins: [
      "Every calculator ships with a substantial explanatory article — formulas, worked examples and context — so a user leaves understanding the method, not just holding a number. This is the main reason these pages rank and keep ranking.",
      "Real domain review behind the numbers: their About page says the calculators were reviewed by financial advisors from major firms and by local medical doctors, alongside in-house developers.",
      "Depth in personal finance specifically is exceptional — 71 finance calculators, the largest section on the site, covering mortgage, loan, interest, investment, retirement and tax scenarios in one consistent format.",
      "Remarkable stability and longevity — running since 2007 under Maple Tech. International LLC, with the same fast, predictable pages, which is why so many people have it bookmarked.",
    ],
    sourcesChecked: [
      "https://www.calculator.net/",
      "https://www.calculator.net/about-us.html",
      "https://www.calculator.net/sitemap.html",
    ],
    valueProp:
      "The same free, no-signup calculators, plus regional coverage Calculator.net does not attempt — Indian tax, board exam and EMI scenarios among them.",
    summary:
      "Calculator.net has been doing this since 2007, and its explanatory articles — formulas, worked examples, review by financial advisors and doctors — are the reason those pages rank and stay ranked. There is no free-tier complaint to make: the whole site is free with no account. Where AltFTool differs is coverage and locale. Their catalogue is about 195 calculators across four sections, weighted heavily toward US personal finance. Ours is much larger and includes region-specific cases theirs does not model at all.",
    comparison: {
      processing: "In the browser — calculators only, no files handled (same as AltFTool).",
      account: "Optional; only used to save calculations and settings.",
      freeCeiling: "None — everything is free with no registration.",
      paid: "None — there is no paid tier.",
      ads: "Yes — ad-supported.",
      apps: "Web-based, no desktop or mobile app.",
      api: "No — their About page states plainly there is no API.",
    },
    altftoolLimits: [
      "Their explanatory articles are better than ours. A Calculator.net page usually teaches the formula properly; many of ours do not go that deep yet.",
      "Their US personal-finance depth — 71 finance calculators reviewed by advisors — is a genuine editorial advantage.",
      "Nineteen years of stability is its own feature. Bookmarked URLs there have simply kept working.",
    ],
    primaryTool: "mortgage-calculator",
    tools: [
      "mortgage-calculator",
      "loan-emi-calculator",
      "bmi-calculator",
      "percentage-calculator",
      "days-between-dates-calculator",
      "age-calculator",
      "basic-calculator",
      "unit-converter",
    ],
    migrationSteps: [
      { from: "Mortgage Calculator", to: "mortgage-calculator" },
      { from: "Loan Calculator", to: "loan-emi-calculator" },
      { from: "BMI Calculator", to: "bmi-calculator" },
      { from: "Percentage Calculator", to: "percentage-calculator" },
      { from: "Date Calculator", to: "days-between-dates-calculator" },
      { from: "Age Calculator", to: "age-calculator" },
      { from: "Conversion Calculator", to: "unit-converter" },
    ],
    faqs: [
      {
        question: "Is Calculator.net limited in any way?",
        answer:
          "Not commercially — it is entirely free with no signup. The limits are scope: roughly 195 calculators across four sections, no API, and no file handling of any kind.",
      },
      {
        question: "Why would I use AltFTool instead?",
        answer:
          "Coverage. If your calculation is region-specific — Indian income tax slabs, CGPA-to-percentage, GST, board exam percentages — Calculator.net does not model it and we do.",
      },
      {
        question: "Do the answers differ?",
        answer:
          "They should not. Standard finance and health formulas are standard. Where results diverge, it is normally a difference in assumptions — compounding frequency, rounding, or which regional rule applies.",
      },
    ],
  },

  "omni-calculator": {
    slug: "omni-calculator",
    name: "Omni Calculator",
    homepage: "https://www.omnicalculator.com/",
    category: "calculator",
    uploadsFiles: false,
    checkedOn: "2026-07-25",
    confidence: "high",
    paidPrice: "",
    freeTierLimits: [
      "No premium tier, no subscription and no paywall — the homepage advertises '3899 free calculators' and their About page says being 'free of charge' was a foundational decision",
      "Embedding is free today but explicitly not guaranteed: 'Omni Calculator reserves the right to introduce charges for embedding or using calculators in the future.'",
      "Advertising cookies are placed by their advertising partners and are used to build a profile of your interests and show you relevant adverts on other sites",
      "Analytics cookie retention runs long: the storage period 'depending on the country and the purpose of the cookie, may be up to 24 months'",
      "Calculators only — no file handling, no PDF/image/document tools, no developer utilities",
      "Coverage is uneven across their 14 categories: Math 683, Finance 610 and Physics 542 are deep, but Ecology has 34 and Food has 70",
    ],
    incumbentWins: [
      "Their editorial process is published and genuinely rigorous: build and test the algorithm, write the article with equations and sources, have it 'Reviewed by ... another person specialized in the topic' for fact-checking, then professional proofreading — and the author and reviewer are named under each calculator's title.",
      "Unmatched long-tail coverage — 3,899 calculators spanning topics most sites ignore entirely, including ecology, food, sports, construction, biology and chemistry, so obscure queries actually get a purpose-built tool.",
      "A clear, unambiguous privacy commitment on calculator inputs: 'We neither store nor sell the data you enter into our calculators.'",
      "Content is maintained rather than left to rot — they run 'regular audits for the content that may change with time, especially in health and finance', and the visible 'Last updated' date reflects changes including 'modifications in calculation algorithms'.",
    ],
    sourcesChecked: [
      "https://www.omnicalculator.com/",
      "https://www.omnicalculator.com/about-us",
      "https://www.omnicalculator.com/privacy-policy",
      "https://www.omnicalculator.com/editorial-policies",
      "https://www.omnicalculator.com/discover",
    ],
    valueProp:
      "Free calculators alongside the file, image and developer tools Omni does not cover — so one site handles the whole task rather than the arithmetic alone.",
    summary:
      "Omni Calculator is the strongest editorial operation in this list: 3,899 calculators, each with a named author and a named subject-matter reviewer, plus regular audits of health and finance content. On calculator quality and coverage they are ahead of us and we are not going to pretend otherwise. The reason to have AltFTool bookmarked as well is that a calculation is rarely the whole job. Omni is calculators only — no files, no images, no PDFs, no developer utilities — so the step before and after happens somewhere else.",
    comparison: {
      processing: "In the browser; they state inputs are neither stored nor sold (same posture as AltFTool).",
      account: "Not required.",
      freeCeiling: "None — 3,899 calculators, all free, no paywall.",
      paid: "None, though they reserve the right to charge for embedding in future.",
      ads: "Yes — advertising partners set profiling cookies; analytics retention up to 24 months.",
      apps: "Web-based, no desktop app.",
      api: "Not offered; embedding is available instead.",
    },
    altftoolLimits: [
      "Their editorial process — named author, named subject-matter reviewer, professional proofreading, scheduled audits — is more rigorous than ours.",
      "3,899 calculators with deep long-tail coverage in physics, chemistry, biology and construction. We do not match that breadth in the sciences.",
      "Omni publishes a 'Last updated' date that reflects algorithm changes; our calculator pages do not surface that yet.",
    ],
    primaryTool: "percentage-calculator",
    tools: [
      "percentage-calculator",
      "bmi-calculator",
      "unit-converter",
      "age-calculator",
      "days-between-dates-calculator",
      "currency-converter",
      "percentage-change-calculator",
      "basic-calculator",
    ],
    migrationSteps: [
      { from: "Percentage Calculator", to: "percentage-calculator" },
      { from: "BMI Calculator", to: "bmi-calculator" },
      { from: "Unit conversion calculators", to: "unit-converter" },
      { from: "Age Calculator", to: "age-calculator" },
      { from: "Days Between Dates", to: "days-between-dates-calculator" },
      { from: "Percentage Change", to: "percentage-change-calculator" },
    ],
    faqs: [
      {
        question: "Does Omni Calculator cost anything?",
        answer:
          "No. It is entirely free with no paywall. They do note they reserve the right to charge for embedding calculators in future, which matters if you are planning to embed one on your own site.",
      },
      {
        question: "Which has more calculators?",
        answer:
          "Omni, in the sciences — 3,899 across 14 categories, with real depth in physics, chemistry and construction. Our advantage is regional finance and education calculators, plus everything that is not a calculator at all.",
      },
      {
        question: "Are my inputs private on either site?",
        answer:
          "Omni states they neither store nor sell what you enter, and our calculators run entirely in your browser. Both sites do carry advertising, and Omni's policy notes advertising partners set profiling cookies.",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Import-time contract check.
//
// Mirrors the curated-content gating in src/app/tools/all/[slug]/page.jsx: a
// page in this family only exists if it has real, hand-checked content behind
// it. Failing loudly at import time is the point — a half-filled entry must
// break the build, not quietly render a thin page that Google will classify as
// doorway content.
// ---------------------------------------------------------------------------
const REQUIRED_LIST_FIELDS = [
  "freeTierLimits",
  "incumbentWins",
  "tools",
  "migrationSteps",
  "altftoolLimits",
];
const REQUIRED_STRING_FIELDS = ["name", "homepage", "category", "primaryTool", "valueProp", "summary"];

for (const [key, entry] of Object.entries(INCUMBENTS)) {
  if (!entry || typeof entry !== "object") {
    throw new Error(`[alternatives] INCUMBENTS["${key}"] is not an object.`);
  }
  if (entry.slug !== key) {
    throw new Error(`[alternatives] INCUMBENTS["${key}"].slug is "${entry.slug}" — keys and slugs must match.`);
  }
  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof entry[field] !== "string" || !entry[field].trim()) {
      throw new Error(`[alternatives] INCUMBENTS["${key}"] is missing required field "${field}".`);
    }
  }
  for (const field of REQUIRED_LIST_FIELDS) {
    if (!Array.isArray(entry[field]) || entry[field].length === 0) {
      throw new Error(`[alternatives] INCUMBENTS["${key}"].${field} must be a non-empty array.`);
    }
  }
  if (entry.tools.length < 3 || entry.tools.length > 8) {
    throw new Error(
      `[alternatives] INCUMBENTS["${key}"].tools has ${entry.tools.length} slugs — expected 3 to 8.`,
    );
  }
  if (!entry.tools.includes(entry.primaryTool)) {
    throw new Error(
      `[alternatives] INCUMBENTS["${key}"].primaryTool "${entry.primaryTool}" must also appear in .tools.`,
    );
  }
  for (const step of entry.migrationSteps) {
    if (!step?.from || !step?.to) {
      throw new Error(`[alternatives] INCUMBENTS["${key}"].migrationSteps needs { from, to } on every step.`);
    }
  }
  // FAQ markup is only emitted when real questions exist (see page.jsx), so a
  // malformed pair must never slip through as an empty Question node.
  for (const faq of entry.faqs || []) {
    if (!faq?.question || !faq?.answer) {
      throw new Error(`[alternatives] INCUMBENTS["${key}"].faqs needs { question, answer } on every entry.`);
    }
  }
}

export const INCUMBENT_SLUGS = Object.keys(INCUMBENTS);

/** Grouping for the index hub. Order is deliberate: biggest families first. */
export const INCUMBENT_CATEGORIES = [
  { slug: "pdf", label: "PDF tools" },
  { slug: "image", label: "Image tools" },
  { slug: "converter", label: "File converters" },
  { slug: "developer", label: "Developer utilities" },
  { slug: "calculator", label: "Calculators" },
  { slug: "design", label: "Design" },
];

export function getIncumbent(slug) {
  return INCUMBENTS[slug] || null;
}

export function getIncumbentsByCategory(category) {
  return INCUMBENT_SLUGS.map((slug) => INCUMBENTS[slug]).filter(
    (entry) => entry.category === category,
  );
}
