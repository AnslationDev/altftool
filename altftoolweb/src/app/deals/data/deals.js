// AltF Deals — software deals data layer.
//
// Every deal maps to a real ALTFTool in-house tool (toolMetaMap slug) and is
// genuinely free — the "deal" framing compares against what the closest paid
// alternative typically charges per year. Reviews/ratings below are seed
// content for the launch; replace with live review data when a backend is
// wired (same approach as exclusivedeals db.json seed lists).

export const DEAL_CATEGORIES = [
  "Design & Image",
  "PDF & Documents",
  "Video & Media",
  "Developer Tools",
  "Business & Finance",
  "Productivity & AI",
];

const COMMON_FAQS = [
  {
    q: "Is this deal really 100% free?",
    a: "Yes. Every AltF Deal is an ALTFTool product, and our tools are free to use — no trial window, no watermark tax, no credit card. The strikethrough price shows what the closest paid alternative typically charges per year.",
  },
  {
    q: "Do I need an account to redeem it?",
    a: "No. Click “Get deal” and the tool opens instantly in your browser. Nothing to install, nothing to sign up for.",
  },
  {
    q: "What does “lifetime” mean here?",
    a: "The tool stays free for as long as ALTFTool runs it — which is the whole point of the platform. There is no plan that expires and no paid tier waiting behind it.",
  },
  {
    q: "Is my data uploaded anywhere?",
    a: "Most ALTFTool utilities process files directly in your browser. Check the tool page for specifics — tools that do call a server say so on their own page.",
  },
];

export const DEALS = [
  {
    slug: "bg-remover",
    name: "Background Remover",
    tagline: "Remove image backgrounds in one click — no signup, no watermark, no credits to buy",
    category: "Design & Image",
    icon: "wand-2",
    iconColor: "text-indigo-600",
    alternativeTo: ["remove.bg Pro", "Photoshop"],
    worksWith: ["PNG", "JPG", "WebP"],
    bestFor: ["Sellers", "Creators", "Marketers"],
    originalPrice: 108,
    priceNote: "vs remove.bg Pro at ~$9/mo",
    rating: 4.8,
    gems: { 5: 182, 4: 24, 3: 6, 2: 2, 1: 2 },
    topRank: 1,
    shelves: ["top9", "staff", "favorites"],
    staffQuote: {
      text: "Product photos. Profile pics. Thumbnails. One click, background gone.",
      author: "Nikhil",
      role: "Founder",
    },
    tldr: [
      "Drop any photo and get a clean, transparent-background cutout in seconds",
      "Unlimited images — no credit packs, no monthly caps, no watermarks",
      "Everything runs in your browser, so photos never sit on someone else's server",
    ],
    overview: [
      {
        heading: "Cut out anything, instantly",
        points: [
          "AI edge detection handles hair, fur, and tricky product edges without manual masking",
          "Export transparent PNGs ready for stores, decks, and thumbnails",
          "Batch through a whole product shoot without hitting a paywall",
        ],
      },
      {
        heading: "Built for people who ship daily",
        points: [
          "No account, no queue — open the tool and drop your image",
          "Works on the machine you're on: desktop, tablet, or phone browser",
          "Pair it with ALTFTool's Image Editor and Compressor for a full free pipeline",
        ],
      },
    ],
    reviews: [
      { author: "Priya S.", role: "Etsy seller", rating: 5, date: "Jul 2026", title: "Cancelled my credits subscription", text: "I was paying per-image on remove.bg for my product photos. This does the same job for my listings and I've processed hundreds of images. Genuinely can't tell the difference in output." },
      { author: "Marcus T.", role: "YouTube creator", rating: 5, date: "Jun 2026", title: "Thumbnail workflow sorted", text: "Cutout in this, text in Text Behind Image, compress, upload. My whole thumbnail stack is now free." },
      { author: "Ananya R.", role: "Social media manager", rating: 4, date: "Jun 2026", title: "Great for 95% of images", text: "Very fine hair on busy backgrounds sometimes needs a second pass, but for product and portrait shots it's spot on." },
    ],
    faqs: [
      { q: "Is there a resolution limit?", a: "You can process full-resolution photos; extremely large files are simply a bit slower since the work happens on your device." },
    ],
    aiSummary: "Reviewers consistently compare Background Remover to paid credit-based services and highlight that output quality holds up for product photos, portraits, and thumbnails. The most-praised points are unlimited free usage and in-browser processing; the only recurring nitpick is that very fine hair on busy backgrounds can need a second pass.",
  },
  {
    slug: "pdf-merger",
    name: "PDF Merger",
    tagline: "Merge unlimited PDFs into one clean document — the Acrobat task without the Acrobat bill",
    category: "PDF & Documents",
    icon: "files",
    iconColor: "text-red-600",
    alternativeTo: ["Adobe Acrobat Pro", "Smallpdf Pro"],
    worksWith: ["PDF"],
    bestFor: ["Students", "Freelancers", "Small businesses"],
    originalPrice: 240,
    priceNote: "vs Adobe Acrobat Pro at ~$19.99/mo",
    rating: 4.7,
    gems: { 5: 148, 4: 31, 3: 9, 2: 3, 1: 2 },
    topRank: 2,
    shelves: ["top9", "staff"],
    staffQuote: {
      text: "Invoices, contracts, scans — merged before Acrobat would have finished loading.",
      author: "Betul",
      role: "Engineering",
    },
    tldr: [
      "Combine any number of PDFs into a single file, in the order you drag them",
      "Files are merged in your browser — contracts and invoices never leave your machine",
      "Part of ALTFTool's full free PDF suite: split, watermark, and annotate too",
    ],
    overview: [
      {
        heading: "The most-needed PDF job, minus the subscription",
        points: [
          "Drag, reorder, merge, download — the whole flow takes under a minute",
          "No page limits and no '2 free tasks per day' meter",
          "Clean output with pages exactly as you arranged them",
        ],
      },
      {
        heading: "Private by design",
        points: [
          "Merging happens locally in the browser, which most paid web tools can't claim",
          "Nothing is stored — close the tab and the files are gone",
          "Works offline once the page is loaded",
        ],
      },
    ],
    reviews: [
      { author: "Rahul D.", role: "CA firm owner", rating: 5, date: "Jul 2026", title: "Daily driver for client documents", text: "We merge dozens of scanned documents a day. Being local-only was the deciding factor — client financials shouldn't sit on a random server." },
      { author: "Jessica M.", role: "Grad student", rating: 5, date: "May 2026", title: "Thesis appendix saved", text: "Merged 40+ PDFs of scanned references with zero fuss. The reorder UI is nicer than the paid tool my university licenses." },
      { author: "Tom W.", role: "Freelancer", rating: 4, date: "Jun 2026", title: "Does one thing perfectly", text: "Would love bookmark preservation for very complex PDFs, but for contracts and invoices it's flawless." },
    ],
    faqs: [
      { q: "Is there a file size limit?", a: "No hard limit — very large PDFs just take a little longer since your own device does the work." },
    ],
    aiSummary: "Users love that PDF Merger removes the single most common reason to pay for Acrobat. Local, in-browser processing is the standout theme in reviews — especially from finance and legal users handling sensitive files. A minority of reviewers ask for advanced features like bookmark preservation.",
  },
  {
    slug: "image-editor",
    name: "Image Editor",
    tagline: "Brightness, saturation, rotate, flip, grayscale — quick edits without opening Photoshop",
    category: "Design & Image",
    icon: "image",
    iconColor: "text-blue-600",
    alternativeTo: ["Photoshop", "Canva Pro"],
    worksWith: ["PNG", "JPG", "WebP"],
    bestFor: ["Creators", "Marketers", "Everyone"],
    originalPrice: 264,
    priceNote: "vs Photoshop at ~$22/mo",
    rating: 4.6,
    gems: { 5: 96, 4: 28, 3: 10, 2: 4, 1: 2 },
    topRank: 3,
    shelves: ["top9", "favorites"],
    tldr: [
      "All the everyday adjustments — brightness, contrast, saturation, rotation, flips",
      "Full-canvas editing workspace right in the browser tab",
      "Zero learning curve: if you've used a phone photo editor, you already know it",
    ],
    overview: [
      {
        heading: "The edits you actually make",
        points: [
          "90% of real-world image edits are exposure tweaks and crops — this nails exactly that",
          "Live preview on every slider, undo anything",
          "Export in web-ready formats at original quality",
        ],
      },
      {
        heading: "No install, no subscription, no upsell",
        points: [
          "Opens instantly — no 4GB download or creative-suite account",
          "Free forever as part of the ALTFTool platform",
          "Chain with Background Remover and Image Compressor for a complete pipeline",
        ],
      },
    ],
    reviews: [
      { author: "Divya K.", role: "Blogger", rating: 5, date: "Jun 2026", title: "My featured images take 2 minutes now", text: "Crop, brighten, export. I stopped opening heavyweight editors for blog images completely." },
      { author: "Sam P.", role: "Marketplace seller", rating: 4, date: "May 2026", title: "Perfect for listing photos", text: "Handles exposure fixes across a batch of product shots fast. Layers would be nice but that's not what this is for." },
    ],
    faqs: [
      { q: "Does it support layers?", a: "No — it's deliberately a fast single-image editor. For composition work, try Text Behind Image or the Flow Chart Maker canvas." },
    ],
    aiSummary: "Reviewers describe Image Editor as the fast lane for everyday edits — exposure, crops, flips — with praise for instant load and zero learning curve. Power users note it isn't a layers-based compositor, which matches its intent.",
  },
  {
    slug: "invoice-generator",
    name: "Invoice Generator",
    tagline: "Create clean, print-ready invoices with tax, discounts, and totals — free forever",
    category: "Business & Finance",
    icon: "file-spreadsheet",
    iconColor: "text-sky-600",
    alternativeTo: ["FreshBooks", "Zoho Invoice"],
    worksWith: ["PDF", "Print"],
    bestFor: ["Freelancers", "Solopreneurs", "Small businesses"],
    originalPrice: 228,
    priceNote: "vs FreshBooks at ~$19/mo",
    rating: 4.8,
    gems: { 5: 121, 4: 15, 3: 5, 2: 1, 1: 1 },
    topRank: 4,
    shelves: ["top9", "staff"],
    staffQuote: {
      text: "Line items, tax, totals, print. Freelancer invoicing shouldn't cost a subscription.",
      author: "Ilona",
      role: "Operations",
    },
    tldr: [
      "Professional invoices with line items, tax rates, discounts, and automatic totals",
      "Print-ready output you can save as PDF and send immediately",
      "No account, no invoice limits, no 'powered by' branding on the free tier — because there is no paid tier",
    ],
    overview: [
      {
        heading: "Everything an invoice needs, nothing it doesn't",
        points: [
          "Itemized rows with quantity × rate, per-line or global tax, and discounts",
          "Automatic subtotal, tax, and grand-total math — no spreadsheet formulas",
          "Clean layout that looks professional to clients on first open",
        ],
      },
      {
        heading: "Built for the send-it-today workflow",
        points: [
          "Fill, print or save as PDF, and email it — under five minutes end to end",
          "Nothing stored on our side; your billing data stays with you",
          "Use it alongside Excel to Chart for simple revenue tracking",
        ],
      },
    ],
    reviews: [
      { author: "Kunal V.", role: "Design freelancer", rating: 5, date: "Jul 2026", title: "Replaced my invoicing app", text: "I send 6-8 invoices a month. A subscription never made sense for that volume, and this output looks just as professional." },
      { author: "Maria G.", role: "Consultant", rating: 5, date: "Jun 2026", title: "Clients noticed the upgrade", text: "Cleaner than the Word template I'd been abusing for years. The tax handling alone saved me embarrassing math errors." },
    ],
    faqs: [
      { q: "Can I save clients and recurring invoices?", a: "It's a fast stateless generator today — recurring profiles are on the roadmap as part of the ALTFTool dashboard." },
    ],
    aiSummary: "Low-volume invoicers — freelancers and consultants — call this the obvious replacement for subscription invoicing apps. Reviews highlight professional output and correct tax math. The most-requested addition is saved client profiles.",
  },
  {
    slug: "video-trimmer",
    name: "Video Trimmer",
    tagline: "Trim clips right in the browser with precise start/end controls — no export queue, no watermark",
    category: "Video & Media",
    icon: "video",
    iconColor: "text-red-600",
    alternativeTo: ["Camtasia", "Clipchamp Premium"],
    worksWith: ["MP4", "WebM", "OGG"],
    bestFor: ["Creators", "Teachers", "Marketers"],
    originalPrice: 180,
    priceNote: "vs Camtasia at ~$179.88/yr",
    rating: 4.5,
    gems: { 5: 74, 4: 22, 3: 9, 2: 4, 1: 3 },
    topRank: 5,
    shelves: ["top9", "favorites"],
    tldr: [
      "Frame-accurate start and end trimming without a timeline learning curve",
      "Processes locally — no upload wait, no render queue, no watermark",
      "Perfect for shorts, lecture clips, and demo videos",
    ],
    overview: [
      {
        heading: "The 30-second trim job, done in 30 seconds",
        points: [
          "Most 'video editing' is cutting the dead air off both ends — this is exactly that tool",
          "Precise handles plus numeric start/end input for exact cuts",
          "Instant preview of the trimmed range before export",
        ],
      },
      {
        heading: "Local-first, creator-friendly",
        points: [
          "Your footage never uploads anywhere — trims happen on your machine",
          "No account walls between you and your exported clip",
          "Chain with Video to GIF for instant shareable snippets",
        ],
      },
    ],
    reviews: [
      { author: "Aditya N.", role: "Course creator", rating: 5, date: "Jun 2026", title: "Lecture clips in seconds", text: "I trim 20+ recordings a week for my course platform. This replaced a desktop app I only used for trimming." },
      { author: "Chloe B.", role: "TikTok creator", rating: 4, date: "May 2026", title: "Fast and watermark-free", text: "Does the one thing I need before upload. Very long 4K files can get heavy in the browser, but everyday clips fly." },
    ],
    faqs: [
      { q: "Can it handle long videos?", a: "Yes, though very long high-resolution files depend on your device's memory since processing is local." },
    ],
    aiSummary: "Creators praise Video Trimmer for making the most common edit — cutting clip boundaries — instant and watermark-free. Local processing wins privacy points; the noted limit is browser memory on very large 4K files.",
  },
  {
    slug: "excel-to-chart",
    name: "Excel to Chart",
    tagline: "Turn XLSX and CSV files into beautiful interactive charts — no BI tool, no license",
    category: "Business & Finance",
    icon: "bar-chart-3",
    iconColor: "text-teal-600",
    alternativeTo: ["Tableau", "Power BI Pro"],
    worksWith: ["XLSX", "XLS", "CSV"],
    bestFor: ["Analysts", "Founders", "Students"],
    originalPrice: 180,
    priceNote: "vs Power BI Pro at ~$15/mo",
    rating: 4.6,
    gems: { 5: 68, 4: 19, 3: 7, 2: 2, 1: 2 },
    topRank: 6,
    shelves: ["top9", "favorites"],
    tldr: [
      "Drop a spreadsheet, get presentation-ready interactive charts",
      "Multiple chart styles with customization — colors, labels, layout",
      "Export for decks and reports without a BI seat license",
    ],
    overview: [
      {
        heading: "From rows to insight in one drop",
        points: [
          "Auto-detects your columns and suggests sensible chart types",
          "Interactive hover states make review meetings actually engaging",
          "Style controls to match your deck without fighting a BI theme editor",
        ],
      },
      {
        heading: "For the 'I just need a chart' moment",
        points: [
          "No workspace setup, no data-source connectors, no admin approval",
          "Your spreadsheet renders locally — finance data stays private",
          "Pairs with Invoice Generator for a lightweight founder finance stack",
        ],
      },
    ],
    reviews: [
      { author: "Neha J.", role: "Startup founder", rating: 5, date: "Jul 2026", title: "Investor update charts sorted", text: "Monthly metrics from CSV to clean charts in two minutes. I dropped my BI subscription for this exact use case." },
      { author: "Daniel K.", role: "Ops analyst", rating: 4, date: "Jun 2026", title: "Great for quick shares", text: "Not a dashboard platform and doesn't pretend to be. For one-off chart requests it's faster than opening the real BI tool." },
    ],
    faqs: [
      { q: "Does it support live data connections?", a: "No — it's file-based by design. Re-drop an updated file to refresh your charts." },
    ],
    aiSummary: "Reviewers position Excel to Chart between spreadsheets and full BI platforms: ideal for one-off, presentation-ready charts from files. Founders and analysts cite speed and zero setup; it deliberately skips live data connections.",
  },
  {
    slug: "flow-chart-maker",
    name: "Flow Chart Maker",
    tagline: "Sketch flowcharts and share them with your team — diagramming without the per-editor pricing",
    category: "Productivity & AI",
    icon: "workflow",
    iconColor: "text-gray-500",
    alternativeTo: ["Lucidchart", "Miro"],
    worksWith: ["PNG export", "Browser canvas"],
    bestFor: ["Product teams", "Developers", "Students"],
    originalPrice: 108,
    priceNote: "vs Lucidchart at ~$9/mo per editor",
    rating: 4.4,
    gems: { 5: 52, 4: 20, 3: 8, 2: 4, 1: 2 },
    topRank: 7,
    shelves: ["top9", "rising"],
    tldr: [
      "Drag-and-connect shapes for flows, processes, and system sketches",
      "Full-width canvas workspace in the browser",
      "Export and share without per-seat licensing",
    ],
    overview: [
      {
        heading: "Think in boxes and arrows",
        points: [
          "Standard flowchart shapes with clean connectors",
          "Fast keyboard-friendly editing for quick idea capture",
          "Uncluttered canvas that stays out of your way",
        ],
      },
      {
        heading: "Free where others charge per editor",
        points: [
          "Diagram tools charge per seat — sketching an idea shouldn't need procurement",
          "Export as an image and drop it in any doc, ticket, or deck",
          "No document limits on a free tier — there is no tier",
        ],
      },
    ],
    reviews: [
      { author: "Vikram S.", role: "Engineering manager", rating: 4, date: "Jun 2026", title: "Design-doc diagrams, minus the license debate", text: "For architecture sketches in design docs this covers us. Real-time multiplayer is the only thing I miss from the paid tools." },
      { author: "Emily R.", role: "CS student", rating: 5, date: "May 2026", title: "Assignment flowcharts done", text: "My whole class uses trial accounts that keep expiring. This just works every time." },
    ],
    faqs: [
      { q: "Can multiple people edit at once?", a: "Not yet — it's single-editor today. Export/import makes handoffs easy in the meantime." },
    ],
    aiSummary: "Users adopt Flow Chart Maker for design docs, assignments, and process sketches where per-seat diagram pricing is hard to justify. The recurring wish-list item is real-time collaboration; solo diagramming reviews are consistently positive.",
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    tagline: "Shrink image file sizes instantly without visible quality loss — unlimited and free",
    category: "Design & Image",
    icon: "image",
    iconColor: "text-indigo-700",
    alternativeTo: ["TinyPNG Pro", "Kraken.io"],
    worksWith: ["PNG", "JPG", "WebP"],
    bestFor: ["Web developers", "Bloggers", "SEO teams"],
    originalPrice: 39,
    priceNote: "vs TinyPNG Pro at ~$39/yr",
    rating: 4.7,
    gems: { 5: 88, 4: 18, 3: 5, 2: 2, 1: 1 },
    topRank: 8,
    shelves: ["top9", "favorites"],
    tldr: [
      "Compress images to a fraction of their size with smart quality retention",
      "No 20-image batch caps or monthly quotas",
      "Faster pages, better Core Web Vitals, happier users",
    ],
    overview: [
      {
        heading: "Page speed is a feature",
        points: [
          "Oversized images are the #1 cause of slow pages — fix them in seconds",
          "Visually lossless output at dramatically smaller sizes",
          "Compress a whole folder of assets before deploy, free",
        ],
      },
      {
        heading: "No quota anxiety",
        points: [
          "Paid compressors meter you by image count — this never does",
          "Local processing means originals stay on your machine",
          "Part of the same free pipeline as Background Remover and Image Editor",
        ],
      },
    ],
    reviews: [
      { author: "Arjun M.", role: "Frontend developer", rating: 5, date: "Jul 2026", title: "Pre-deploy ritual", text: "Every asset goes through this before it ships. LCP improved measurably the week we standardized on it." },
      { author: "Sophie L.", role: "Food blogger", rating: 5, date: "Jun 2026", title: "My photos finally load fast", text: "Recipe posts have 15+ photos each. Compressing them used to eat my monthly quota on day one; now it's a non-issue." },
    ],
    faqs: [
      { q: "How much smaller do files get?", a: "Typically 60-80% smaller for photos, depending on source quality and format — with no visible difference at normal viewing sizes." },
    ],
    aiSummary: "Developers and bloggers treat Image Compressor as a standard pre-publish step. Reviews emphasize unlimited usage versus quota-metered paid tools, with measurable page-speed wins reported. No significant complaints recur.",
  },
  {
    slug: "meeting-transcript-action-extractor",
    name: "Meeting Action Extractor",
    tagline: "Paste a meeting transcript, get action items, decisions, and key points — automatically",
    category: "Productivity & AI",
    icon: "clipboard-list",
    iconColor: "text-violet-600",
    alternativeTo: ["Otter.ai Business", "Fireflies Pro"],
    worksWith: ["Any transcript text"],
    bestFor: ["Managers", "Founders", "Project leads"],
    originalPrice: 240,
    priceNote: "vs Otter.ai Business at ~$20/mo",
    rating: 4.5,
    gems: { 5: 41, 4: 13, 3: 5, 2: 2, 1: 1 },
    topRank: 9,
    shelves: ["top9", "justLaunched"],
    tldr: [
      "Turns raw meeting transcripts into structured action items and decisions",
      "Works with transcripts from any source — Zoom, Meet, Teams, or manual notes",
      "No bot joins your call and no per-seat AI subscription",
    ],
    overview: [
      {
        heading: "Meetings end. Follow-ups shouldn't be archaeology.",
        points: [
          "Extracts who-does-what action items from messy conversation text",
          "Separates decisions from discussion so outcomes are unambiguous",
          "Key-points summary for people who skipped the meeting",
        ],
      },
      {
        heading: "Bring your own transcript",
        points: [
          "Meeting AI tools charge per seat and want a bot in your call — this just takes the text",
          "Paste, extract, copy into your task tracker",
          "Nothing retained after you close the tab",
        ],
      },
    ],
    reviews: [
      { author: "Karan P.", role: "Product manager", rating: 5, date: "Jul 2026", title: "Standup notes to Jira in minutes", text: "I paste the auto-transcript from our calls and get a clean action list. The per-seat AI meeting tools were a hard sell for exactly this output." },
      { author: "Lena H.", role: "Agency owner", rating: 4, date: "Jun 2026", title: "Client call follow-ups nailed", text: "Decisions vs discussion separation is the killer feature. Occasionally over-extracts on very casual calls." },
    ],
    faqs: [
      { q: "Does it record my meetings?", a: "No — it never joins or records calls. You bring a transcript from any source and it structures the text." },
    ],
    aiSummary: "Early adopters use Action Extractor as the missing follow-up step after calls, feeding transcripts from Zoom or Meet. Reviewers value that no bot joins calls and no per-seat fee applies; a few note over-extraction on informal conversations.",
  },
  {
    slug: "text-behind-image",
    name: "Text Behind Image",
    tagline: "Create viral poster-style visuals with text layered behind your subject",
    category: "Design & Image",
    icon: "image-plus",
    iconColor: "text-cyan-600",
    alternativeTo: ["Canva Pro", "Photoshop"],
    worksWith: ["PNG", "JPG"],
    bestFor: ["Creators", "Social media managers", "Designers"],
    originalPrice: 120,
    priceNote: "vs Canva Pro at ~$120/yr",
    rating: 4.6,
    gems: { 5: 47, 4: 12, 3: 4, 2: 1, 1: 1 },
    shelves: ["justLaunched", "rising"],
    tldr: [
      "The 'text behind subject' effect that usually needs Photoshop masking — automated",
      "Large editable text layers with full font and color control",
      "Export poster-ready compositions in minutes",
    ],
    overview: [
      {
        heading: "The effect everyone asks how to make",
        points: [
          "AI separates your subject so text slides naturally behind it",
          "No manual masking, no layer juggling, no tutorials needed",
          "Perfect for thumbnails, posters, and social graphics",
        ],
      },
      {
        heading: "Design-tool results without design-tool pricing",
        points: [
          "This one effect is why many people keep a Canva Pro subscription",
          "Full typography control — size, weight, color, position",
          "Combine with Background Remover for complete creative control",
        ],
      },
    ],
    reviews: [
      { author: "Ritika A.", role: "Instagram creator", rating: 5, date: "Jul 2026", title: "My reels covers look pro now", text: "This exact effect got me to try the tool and it delivered. Posted results, got DMs asking what app I use." },
      { author: "Jake F.", role: "Podcast producer", rating: 4, date: "Jul 2026", title: "Episode art in minutes", text: "Great subject detection on portraits. Busy group shots need some tweaking, but solo shots are one-and-done." },
    ],
    faqs: [
      { q: "Can I use my own fonts?", a: "A curated font set ships today; custom font upload is on the roadmap." },
    ],
    aiSummary: "Reviews center on one thing: the text-behind-subject effect working automatically where it previously required Photoshop skills. Creators report strong results on portraits; complex group shots may need manual adjustment.",
  },
  {
    slug: "video-to-gif",
    name: "Video to GIF",
    tagline: "Convert MP4, WebM, or OGG clips into optimized GIFs — directly in your browser",
    category: "Video & Media",
    icon: "video",
    iconColor: "text-teal-500",
    alternativeTo: ["Giphy Capture", "EZGif Premium"],
    worksWith: ["MP4", "WebM", "OGG"],
    bestFor: ["Creators", "Support teams", "Developers"],
    originalPrice: 60,
    priceNote: "vs paid GIF converters at ~$5/mo",
    rating: 4.5,
    gems: { 5: 38, 4: 14, 3: 5, 2: 2, 1: 1 },
    shelves: ["justLaunched", "rising"],
    tldr: [
      "Highly-optimized GIFs from any short clip — sized for docs, PRs, and chats",
      "Local conversion with no upload wait or file-size upsell",
      "Control dimensions and quality for the perfect size/sharpness balance",
    ],
    overview: [
      {
        heading: "GIFs that don't weigh 40MB",
        points: [
          "Smart optimization keeps GIFs shareable in Slack, GitHub, and docs",
          "Trim-and-convert in one pass with Video Trimmer",
          "No watermarks stamped on your output",
        ],
      },
      {
        heading: "Made for show-don't-tell moments",
        points: [
          "Bug reproductions, feature demos, UI walkthroughs — a GIF beats a paragraph",
          "Everything processes on your machine",
          "No account, no queue, no daily conversion cap",
        ],
      },
    ],
    reviews: [
      { author: "Dev T.", role: "Software engineer", rating: 5, date: "Jul 2026", title: "PR demos leveled up", text: "Every PR gets a GIF walkthrough now. Reviewers actually understand the change before reading code." },
      { author: "Hannah C.", role: "Support lead", rating: 4, date: "Jun 2026", title: "Help-doc GIFs made easy", text: "Our knowledge base went from static screenshots to GIF walkthroughs in a week." },
    ],
    faqs: [
      { q: "What's the maximum clip length?", a: "GIFs work best under ~30 seconds; longer clips convert but grow quickly in size — the optimizer will warn you." },
    ],
    aiSummary: "Engineers and support teams use Video to GIF for demos in PRs and help docs. Local processing and no watermarks are the cited advantages; reviewers note the format's inherent size growth on long clips.",
  },
  {
    slug: "meme-generator",
    name: "Meme Generator",
    tagline: "Create shareable memes in seconds — templates, captions, done",
    category: "Design & Image",
    icon: "image",
    iconColor: "text-blue-500",
    alternativeTo: ["Imgflip Pro", "Canva Pro"],
    worksWith: ["PNG", "JPG"],
    bestFor: ["Creators", "Community managers", "Everyone"],
    originalPrice: 48,
    priceNote: "vs Imgflip Pro at ~$3.95/mo",
    rating: 4.4,
    gems: { 5: 44, 4: 16, 3: 8, 2: 3, 1: 2 },
    shelves: ["endingSoon"],
    tldr: [
      "Classic top/bottom text meme creation with clean output",
      "No watermark on exports — unlike the free tiers of paid meme tools",
      "Fast enough to reply to the group chat while the joke is still fresh",
    ],
    overview: [
      {
        heading: "Speed is the whole game",
        points: [
          "Upload or pick an image, caption it, export — under a minute",
          "Crisp text rendering that survives re-shares",
          "No watermark ever",
        ],
      },
    ],
    reviews: [
      { author: "Rohan B.", role: "Community manager", rating: 5, date: "Jun 2026", title: "Engagement content on tap", text: "Our community memes outperform our 'real' posts 3:1. This is now an official marketing tool, which is hilarious." },
      { author: "Katie D.", role: "Student", rating: 4, date: "May 2026", title: "Does the job", text: "Watermark-free free meme tool. That's the review." },
    ],
    faqs: [
      { q: "Are meme templates included?", a: "You can upload any image; a starter template gallery is being expanded." },
    ],
    aiSummary: "Short, happy reviews: fast captioning and watermark-free export are the reasons users pick this over freemium meme tools. Community managers report real engagement wins.",
  },
  {
    slug: "json-editor",
    name: "JSON Editor",
    tagline: "Validate, format, minify, and convert JSON — the dev utility that's always one tab away",
    category: "Developer Tools",
    icon: "braces",
    iconColor: "text-emerald-600",
    alternativeTo: ["JSONBuddy", "Paid IDE plugins"],
    worksWith: ["JSON", "Clipboard"],
    bestFor: ["Developers", "QA engineers", "Data analysts"],
    originalPrice: 49,
    priceNote: "vs desktop JSON editors at ~$49",
    rating: 4.7,
    gems: { 5: 71, 4: 15, 3: 4, 2: 1, 1: 1 },
    shelves: ["endingSoon", "rising"],
    tldr: [
      "Instant validation with precise error locations",
      "Format, minify, and convert JSON snippets in one workspace",
      "Side-by-side editor layout built for real payloads",
    ],
    overview: [
      {
        heading: "For the hundred JSON moments a day",
        points: [
          "Paste an API response, see it formatted and validated instantly",
          "Minify for payloads, prettify for humans",
          "Clear error messages with line/column — no more staring at a missing comma",
        ],
      },
    ],
    reviews: [
      { author: "Wei L.", role: "Backend developer", rating: 5, date: "Jul 2026", title: "Pinned tab status", text: "It's open all day next to my terminal. Faster than piping through jq for quick checks." },
      { author: "Nadia F.", role: "QA engineer", rating: 5, date: "Jun 2026", title: "API testing companion", text: "Formatting API responses during test sessions used to be friction; now it's a paste away." },
    ],
    faqs: [
      { q: "Does my JSON leave the browser?", a: "No — validation and formatting run entirely client-side, safe for payloads with sensitive fields." },
    ],
    aiSummary: "Developers describe JSON Editor as a permanently pinned tab. Client-side processing makes it safe for real payloads; validation precision and speed drive the high rating.",
  },
  {
    slug: "diff-checker",
    name: "Diff Checker",
    tagline: "Compare two texts or files and see every difference highlighted instantly",
    category: "Developer Tools",
    icon: "text",
    iconColor: "text-blue-500",
    alternativeTo: ["Beyond Compare", "Araxis Merge"],
    worksWith: ["Text", "Code", "Files"],
    bestFor: ["Developers", "Writers", "Legal teams"],
    originalPrice: 70,
    priceNote: "vs Beyond Compare at ~$70",
    rating: 4.6,
    gems: { 5: 58, 4: 17, 3: 6, 2: 2, 1: 1 },
    shelves: ["endingSoon"],
    tldr: [
      "Side-by-side comparison with per-line and per-word highlighting",
      "Paste text or drop files — instant results",
      "Nothing uploads; sensitive contracts and code stay local",
    ],
    overview: [
      {
        heading: "Spot every change, miss nothing",
        points: [
          "Word-level highlighting inside changed lines",
          "Handles code, prose, config files, and contracts equally well",
          "Clean visual layout that makes review meetings faster",
        ],
      },
    ],
    reviews: [
      { author: "Oliver S.", role: "Tech lead", rating: 5, date: "Jun 2026", title: "Config drift, spotted", text: "Comparing environment configs across deployments caught a drift bug that had been haunting us for a sprint." },
      { author: "Amara O.", role: "Contract manager", rating: 4, date: "May 2026", title: "Redline sanity checker", text: "I verify counterparty edits against our last version. Local-only processing is why legal signed off on using it." },
    ],
    faqs: [
      { q: "Is there a file size limit?", a: "Large files work; extremely large ones are limited by browser memory since everything runs locally." },
    ],
    aiSummary: "Used across dev and legal workflows for verifying changes. Local-only processing repeatedly appears as the trust factor; word-level highlighting is the most-praised feature.",
  },
  {
    slug: "markdown-preview",
    name: "Markdown Preview",
    tagline: "Write Markdown on the left, see rendered output live on the right",
    category: "Developer Tools",
    icon: "edit",
    iconColor: "text-blue-500",
    alternativeTo: ["Typora", "iA Writer"],
    worksWith: ["Markdown", "HTML"],
    bestFor: ["Developers", "Writers", "Documentation teams"],
    originalPrice: 15,
    priceNote: "vs Typora at ~$14.99",
    rating: 4.5,
    gems: { 5: 39, 4: 13, 3: 5, 2: 2, 1: 1 },
    shelves: ["endingSoon"],
    tldr: [
      "Live split-pane preview as you type",
      "Perfect for READMEs, docs, and blog drafts",
      "No install — works on any machine with a browser",
    ],
    overview: [
      {
        heading: "See what you ship",
        points: [
          "Catch broken tables and heading levels before you commit",
          "Familiar two-pane layout with synced scrolling",
          "Copy clean HTML out when you need it",
        ],
      },
    ],
    reviews: [
      { author: "Felix W.", role: "Open source maintainer", rating: 5, date: "Jun 2026", title: "README QA station", text: "Every README edit gets previewed here first. Zero broken-markdown commits since." },
    ],
    faqs: [
      { q: "Does it support GitHub-flavored Markdown?", a: "Yes — tables, task lists, and fenced code blocks render as expected." },
    ],
    aiSummary: "A simple tool with consistent reviews: reliable GFM rendering and instant preview make it the pre-commit check for documentation writers.",
  },
  {
    slug: "color-palette-from-image",
    name: "Color Palette from Image",
    tagline: "Extract a practical, usable color palette from any image in one drop",
    category: "Design & Image",
    icon: "palette",
    iconColor: "text-teal-600",
    alternativeTo: ["Adobe Color", "Coolors Pro"],
    worksWith: ["PNG", "JPG", "WebP"],
    bestFor: ["Designers", "Brand teams", "Developers"],
    originalPrice: 36,
    priceNote: "vs Coolors Pro at ~$3/mo",
    rating: 4.6,
    gems: { 5: 33, 4: 9, 3: 3, 2: 1, 1: 1 },
    shelves: ["justLaunched", "rising"],
    tldr: [
      "Upload an image, get its dominant colors as a ready-to-use palette",
      "Copy hex codes straight into your design tool or CSS",
      "Great for brand boards, theme building, and moodboards",
    ],
    overview: [
      {
        heading: "Steal like a colorist",
        points: [
          "Pulls the colors that actually define an image, not just pixel averages",
          "One-click hex copy for each swatch",
          "Build a site theme from a single inspiration photo",
        ],
      },
    ],
    reviews: [
      { author: "Isha M.", role: "Brand designer", rating: 5, date: "Jul 2026", title: "Moodboard to palette in seconds", text: "Client sends inspiration photos; I send back a palette the same hour. Looks like magic, costs nothing." },
    ],
    faqs: [
      { q: "How many colors does it extract?", a: "A practical palette of the image's defining colors — enough for a brand board without noise." },
    ],
    aiSummary: "Designers use this to convert inspiration images into working palettes instantly. One-click hex copying is the detail reviewers mention most.",
  },
];

// ---------------------------------------------------------------------------
// Accessors (mirror the getTop9Items.js getter pattern)
// ---------------------------------------------------------------------------

export function getDeals() {
  return DEALS.filter((deal) => deal?.slug);
}

export function getDeal(slug) {
  return getDeals().find((deal) => deal.slug === slug) || null;
}

export function getDealsByShelf(shelf) {
  return getDeals().filter((deal) => deal.shelves?.includes(shelf));
}

export function getTopNine() {
  return getDeals()
    .filter((deal) => Number.isInteger(deal.topRank))
    .sort((a, b) => a.topRank - b.topRank)
    .slice(0, 9);
}

export function getStaffPicks() {
  return getDeals().filter((deal) => deal.staffQuote);
}

export function getRelatedDeals(deal, limit = 4) {
  if (!deal) return [];
  const sameCategory = getDeals().filter(
    (item) => item.slug !== deal.slug && item.category === deal.category
  );
  const others = getDeals().filter(
    (item) => item.slug !== deal.slug && item.category !== deal.category
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export function getDealReviewCount(deal) {
  return Object.values(deal?.gems || {}).reduce((sum, n) => sum + (n || 0), 0);
}

export function getDealFaqs(deal) {
  return [...(deal?.faqs || []), ...COMMON_FAQS];
}

export function getDealToolHref(deal) {
  return `/tools/all/${deal?.slug || ""}`;
}

export function getDealSavings(deal) {
  const price = Number(deal?.originalPrice) || 0;
  return price > 0 ? price : 0;
}

export function getTotalSavings() {
  return getDeals().reduce((sum, deal) => sum + getDealSavings(deal), 0);
}

export function getDealCategoryCounts() {
  const counts = new Map([["all", getDeals().length]]);
  getDeals().forEach((deal) => {
    counts.set(deal.category, (counts.get(deal.category) || 0) + 1);
  });
  return counts;
}
