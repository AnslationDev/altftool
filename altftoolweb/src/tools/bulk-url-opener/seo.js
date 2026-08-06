const seo = {
  title: "Bulk URL Opener — Open Many Links at Once",
  h1: "Bulk URL Opener",
  metaDescription:
    "Paste a list of URLs and open every one in its own new tab with a single click. Free, no signup, no extension to install.",
  intro:
    "The Bulk URL Opener takes a list of links — one per line — and opens each one in its own new browser tab with a single click. No browser extension or account is required; just paste your list and click Open Valid URLs.",
  useCases: [
    "Opening a batch of research links, product pages, or articles saved for later, all at once",
    "Checking a list of URLs (redirects, campaign pages, broken links) without opening them one by one",
    "Opening every link from a spreadsheet or CRM export in seconds",
  ],
  benefits: [
    [
      "One click, every tab",
      "Paste your list and every URL opens in its own tab immediately — no clicking links one at a time.",
    ],
    [
      "Popup-blocker aware",
      "If your browser blocks the tabs, the tool tells you and explains how to allow popups for this site, so you're not left wondering why nothing opened.",
    ],
    [
      "No extension needed",
      "Works entirely on the page — nothing to install, no browser permissions beyond the one-time popup allowance.",
    ],
    [
      "Free, unlimited use",
      "No signup and no cap on how many times you use it.",
    ],
  ],
  faqs: [
    [
      "How do I open multiple URLs at once?",
      "Paste your links into the box, one per line, and click Open Valid URLs — each link that parses opens in its own new tab immediately, and any line the tool cannot read is listed under Invalid URLs instead.",
    ],
    [
      "Why did only some of my tabs open?",
      "Browsers block automated pop-ups by default, so opening many tabs at once can trigger the popup blocker. The tool detects this and shows a warning — allow popups for this site in your browser settings and try again.",
    ],
    [
      "Is there a limit to how many URLs I can open at once?",
      "There's no hard limit set by the tool, but browsers themselves may throttle or block very large batches of simultaneous tabs — allowing popups for the site helps the most.",
    ],
    [
      "Do I need to install a browser extension for this?",
      "No. The bulk URL opener works entirely on the page using your browser's own new-tab function — no extension or account needed.",
    ],
    [
      "Is this free to use?",
      "Yes, completely free with no signup.",
    ],
  ],
  steps: [
    "Paste your list into the box marked \"Paste multiple URLs here (one per line)…\", one URL per line. Any line missing http:// or https:// has https:// added for you before it opens.",
    "Click \"Open Valid URLs\". Every link that parses opens in its own new tab straight away, and a green \"Opened N tabs successfully\" line confirms how many went through.",
    "Anything the tool could not parse is listed under an \"Invalid URLs\" heading, and if your browser stopped the tabs a yellow popup-blocker warning appears — allow popups for this site and click \"Open Valid URLs\" again.",
  ],
};

export default seo;
