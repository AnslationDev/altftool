"use client";

export function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export function formatUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "") + u.pathname.slice(0, 30);
  } catch {
    return url.slice(0, 40);
  }
}

export function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function getDomainCategory(domain) {
  const categories = {
    "AI": ["chatgpt", "openai", "claude", "bard", "copilot", "huggingface", "perplexity", "midjourney", "anthropic", "replicate", "stability"],
    "Development": ["github", "gitlab", "bitbucket", "stackoverflow", "npmjs", "vercel", "netlify", "heroku", "docker", "kubernetes", "mdn", "w3schools", "docs", "dev.to", "medium", "codepen", "codesandbox", "replit", "jira", "linear", "notion", "figma"],
    "Education": ["coursera", "udemy", "edx", "khanacademy", "wikipedia", "udacity", "pluralsight", "skillshare", "duolingo"],
    "Shopping": ["amazon", "ebay", "walmart", "target", "etsy", "shopify", "bestbuy", "costco", "alibaba", "aliexpress", "flipkart", "zalando"],
    "Social Media": ["facebook", "twitter", "x.com", "instagram", "linkedin", "reddit", "tiktok", "snapchat", "pinterest", "discord", "telegram", "whatsapp", "threads", "bluesky", "mastodon"],
    "Entertainment": ["youtube", "netflix", "hulu", "disney", "spotify", "twitch", "vimeo", "primevideo", "hbomax", "peacock", "paramount"],
    "Finance": ["bank", "paypal", "stripe", "venmo", "wise", "revolut", "robinhood", "coinbase", "binance", "investing", "bloomberg", "yahoo.finance"],
    "News": ["cnn", "bbc", "nytimes", "wsj", "washingtonpost", "theguardian", "reuters", "apnews", "npr", "aljazeera", "foxnews", "msnbc"],
    "Productivity": ["gmail", "outlook", "calendar", "drive", "dropbox", "evernote", "trello", "asana", "todoist", "slack", "teams", "zoom", "meet", "docs.google", "sheets.google", "slides.google"],
    "Design": ["dribbble", "behance", "unsplash", "pexels", "canva", "adobe", "sketch", "framer", "ui8", "envato"],
    "Gaming": ["steam", "epicgames", "xbox", "playstation", "nintendo", "roblox", "minecraft", "rockstargames", "ea.com", "ubisoft"],
    "Research": ["scholar.google", "pubmed", "ieee", "acm", "springer", "sciencedirect", "arxiv", "researchgate", "semanticscholar"],
    "Travel": ["airbnb", "booking", "expedia", "hotels", "kayak", "skyscanner", "tripadvisor", "uber", "lyft", "maps.google"],
  };

  const lower = domain.toLowerCase();
  for (const [category, domains] of Object.entries(categories)) {
    if (domains.some((d) => lower.includes(d))) return category;
  }
  return "Other";
}

export function isHttp(url) {
  return url.startsWith("https://");
}

export function normalizeUrl(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    u.search = "";
    return u.href.replace(/\/$/, "").toLowerCase();
  } catch {
    return url.toLowerCase().trim();
  }
}

export function isLikelyBroken(url) {
  try {
    new URL(url);
    return false;
  } catch {
    return true;
  }
}

export function estimateMemory(urls) {
  return urls.length * 50 + urls.filter((u) => {
    try { return new URL(u).hostname.includes("youtube") || new URL(u).hostname.includes("netflix"); } catch { return false; }
  }).length * 150;
}

export function exportToCsv(tabs, filename = "session-analysis.csv") {
  const headers = ["URL", "Domain", "Category", "Title"];
  const rows = tabs.map((tab) => [tab.url, tab.domain, tab.category, tab.title || ""].map((v) => `"${v.replace(/"/g, '""')}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export function exportToJson(tabs, filename = "session-analysis.json") {
  const data = JSON.stringify(tabs, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export function exportToTxt(tabs, filename = "session-analysis.txt") {
  const text = tabs.map((t) => `${t.url}  [${t.category}]`).join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
