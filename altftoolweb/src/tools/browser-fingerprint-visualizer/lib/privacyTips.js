export const PRIVACY_TIPS = [
  //─ Browser ─
  {
    id: "brave-browser",
    category: "Browser",
    title: "Switch to Brave Browser",
    description: "Brave has built-in fingerprint randomization. It adds random noise to canvas, WebGL, and audio outputs so trackers can't identify you.",
    impact: "High", minScore: 0, icon: "🦁",
  },
  {
    id: "firefox-resist",
    category: "Browser",
    title: "Enable Firefox Resist Fingerprinting",
    description: "Firefox has privacy.resistFingerprinting in about:config. This spoofs screen size, timezone, and canvas data.",
    impact: "High", minScore: 0, icon: "🦊",
  },
  {
    id: "tor-browser",
    category: "Browser",
    title: "Use Tor Browser",
    description: "Tor Browser makes all users look identical by standardizing screen size, fonts, and blocking canvas/WebGL. Maximum anonymity.",
    impact: "Very High", minScore: 0, icon: "🧅",
  },

  // Extensions 
  {
    id: "ublock-origin",
    category: "Extension",
    title: "Install uBlock Origin",
    description: "Blocks third-party tracker scripts before they can run fingerprinting code. One of the most effective privacy tools available.",
    impact: "High", minScore: 0, icon: "🛡️",
  },
  {
    id: "canvasblocker",
    category: "Extension",
    title: "Use CanvasBlocker Extension",
    description: "Randomizes or blocks canvas fingerprint output. Makes your canvas hash different every session so trackers can't link sessions.",
    impact: "High", minScore: 0, icon: "🎨",
  },
  {
    id: "chameleon",
    category: "Extension",
    title: "Use Chameleon Extension",
    description: "Spoofs user agent, timezone, screen size, and language headers. Makes your browser appear different to every website.",
    impact: "Medium", minScore: 0, icon: "🦎",
  },

  // Browser Settings 
  {
    id: "disable-webgl",
    category: "Browser Settings",
    title: "Disable WebGL",
    description: "In Firefox: set webgl.disabled = true in about:config. Removes your GPU fingerprint entirely from tracking.",
    impact: "Medium", minScore: 0, icon: "🖥️",
  },
  {
    id: "private-window",
    category: "Browser Settings",
    title: "Use Private / Incognito Mode",
    description: "Prevents cookies and localStorage from persisting. Doesn't stop fingerprinting but breaks cookie-based tracking.",
    impact: "Low", minScore: 0, icon: "🕶️",
  },
  {
    id: "timezone-spoof",
    category: "Browser Settings",
    title: "Spoof Your Timezone",
    description: "Extensions like Chameleon can fake your timezone. This breaks geo-tracking that doesn't rely on your IP address.",
    impact: "Low", minScore: 0, icon: "🕐",
  },

  // ─ Network 
  {
    id: "vpn",
    category: "Network",
    title: "Use a VPN",
    description: "Hides your IP address and masks your real timezone and location. Combined with browser privacy, significantly reduces tracking.",
    impact: "Medium", minScore: 0, icon: "🔒",
  },
  {
    id: "dns-over-https",
    category: "Network",
    title: "Enable DNS over HTTPS",
    description: "Encrypts your DNS queries so your ISP and network observers can't see which websites you visit.",
    impact: "Medium", minScore: 0, icon: "🌐",
  },

  // ─ Fonts ─
  {
    id: "standard-fonts",
    category: "Fonts",
    title: "Remove Custom Fonts",
    description: "Installed fonts are a high-entropy signal. Using only system default fonts reduces font-based fingerprinting significantly.",
    impact: "Medium", minScore: 0, icon: "🔤",
  },
  {
    id: "limit-font-access",
    category: "Fonts",
    title: "Block Font Enumeration",
    description: "Some browsers and extensions can block websites from probing your installed fonts via canvas width measurement.",
    impact: "Medium", minScore: 0, icon: "🚫",
  },
];


export const CATEGORY_META = {
  "Browser": {
    icon: "🌍",
    color: "blue",
    description: "Switch or configure your browser for better privacy",
  },
  "Extension": {
    icon: "🧩",
    color: "purple",
    description: "Browser extensions that block fingerprinting scripts",
  },
  "Browser Settings": {
    icon: "⚙️",
    color: "orange",
    description: "Built-in settings to harden your current browser",
  },
  "Network": {
    icon: "📡",
    color: "cyan",
    description: "Network-level tools to hide your identity and location",
  },
  "Fonts": {
    icon: "🔤",
    color: "green",
    description: "Reduce entropy from your installed font collection",
  },
};

export function getTipsForScore(score) {
  return PRIVACY_TIPS
    .filter((tip) => tip.minScore <= score)
    .sort((a, b) => {
      const order = { "Very High": 0, High: 1, Medium: 2, Low: 3 };
      return order[a.impact] - order[b.impact];
    });
}

export function getTipsByCategory(tips) {
  return tips.reduce((acc, tip) => {
    if (!acc[tip.category]) acc[tip.category] = [];
    acc[tip.category].push(tip);
    return acc;
  }, {});
}