export const DOCS_LAST_REVIEWED = "July 24, 2026";

export const DOCS_SECTIONS = Object.freeze([
  {
    id: "overview",
    label: "Platform overview",
    description:
      "What AltFTool is, who it serves, and how the platform is organized.",
  },
  {
    id: "start",
    label: "Start here",
    description:
      "Choose the shortest route to a tool, product, workflow, or guide.",
  },
  {
    id: "products",
    label: "Products",
    description: "Focused AltF workspaces for repeatable jobs and decisions.",
  },
  {
    id: "tools",
    label: "Tools & processing",
    description:
      "How the browser tool library is categorized and how data is handled.",
  },
  {
    id: "automation",
    label: "Automation & apps",
    description:
      "Workflow templates, prompts, extensions, apps, and desktop software.",
  },
  {
    id: "business",
    label: "Business & discovery",
    description:
      "Specialist services, shopping research, learning, news, and labs.",
  },
  {
    id: "accounts",
    label: "Accounts & preferences",
    description:
      "Optional accounts, saved preferences, themes, and device behavior.",
  },
  {
    id: "privacy",
    label: "Privacy, safety & ads",
    description:
      "Local processing, remote services, analytics, advertising, and limitations.",
  },
  {
    id: "accessibility",
    label: "Accessibility",
    description:
      "Keyboard support, themes, responsive layouts, focus, and reduced motion.",
  },
  {
    id: "support",
    label: "Support & reliability",
    description:
      "Status, requests, troubleshooting, policies, and contact routes.",
  },
  {
    id: "faq",
    label: "Frequently asked questions",
    description: "Clear answers to common questions about using AltFTool.",
  },
]);

export const DOCS_QUICK_LINKS = Object.freeze([
  {
    title: "Find a browser tool",
    description:
      "Search converters, calculators, file tools, developer utilities, and more.",
    href: "/tools/all",
    icon: "tools",
  },
  {
    title: "Open a product workspace",
    description:
      "Use a focused workspace for ideas, security, careers, creators, and operations.",
    href: "/products",
    icon: "products",
  },
  {
    title: "Browse automations",
    description:
      "Explore workflow templates, nodes, prompts, extensions, and software.",
    href: "/n8n",
    icon: "automation",
  },
  {
    title: "Explore business services",
    description:
      "Navigate housing, finance, travel, legal, pet, and care destinations.",
    href: "/bops",
    icon: "business",
  },
  {
    title: "Learn something practical",
    description:
      "Read guides, academy material, news, facts, and location resources.",
    href: "/academy",
    icon: "learn",
  },
  {
    title: "Browse every public route",
    description:
      "Use the searchable site map when you already know what you need.",
    href: "/site-map",
    icon: "directory",
  },
]);

export const DOCS_AUTOMATION_LINKS = Object.freeze([
  {
    title: "Automation library",
    description:
      "Browse n8n workflow templates by category, node, and use case.",
    href: "/n8n",
  },
  {
    title: "AltF Flow",
    description:
      "Build ordered browser-based transformations and reusable recipes.",
    href: "/products/flow",
  },
  {
    title: "Prompt Studio",
    description:
      "Create and refine structured prompts for visual and AI workflows.",
    href: "/imgprompt",
  },
  {
    title: "Extensions",
    description:
      "Discover browser extensions that support focused everyday work.",
    href: "/extensions",
  },
  {
    title: "Apps",
    description: "Browse AltFTool mobile application destinations.",
    href: "/apps",
  },
  {
    title: "Desktop software",
    description: "Find desktop-oriented utilities and software resources.",
    href: "/desktop",
  },
]);

export const DOCS_BUSINESS_LINKS = Object.freeze([
  {
    title: "Business Ops",
    description:
      "The organized starting point for specialist service journeys.",
    href: "/bops",
  },
  {
    title: "Deals & shopping",
    description:
      "Compare offers, buying guides, stores, ratings, and ranked recommendations.",
    href: "/buysmart",
  },
  {
    title: "Learn & discover",
    description:
      "Practical guides, academy resources, news, facts, and locations.",
    href: "/academy",
  },
  {
    title: "Labs & experiences",
    description:
      "Creative, exploratory, playful, and focus-oriented browser experiences.",
    href: "/labs",
  },
]);

export const DOCS_PRIVACY_POINTS = Object.freeze([
  {
    title: "Local-first where practical",
    description:
      "Many text, file, calculation, and security utilities run in the browser. Product pages describe local processing when it applies.",
  },
  {
    title: "Remote processing is disclosed",
    description:
      "Features that need live data, AI, storage, search, DNS, media, or another provider may send the minimum required input to a remote service.",
  },
  {
    title: "Production measurement",
    description:
      "The public site may use analytics, performance measurement, consent controls, and Google advertising in production. Policy pages explain the applicable terms.",
  },
  {
    title: "No professional-advice substitute",
    description:
      "Calculators, comparisons, health information, legal directories, finance content, and AI output are informational starting points, not professional advice.",
  },
]);

export const DOCS_FAQS = Object.freeze([
  {
    question: "What is AltFTool?",
    answer:
      "AltFTool is an organized public platform for browser tools, focused product workspaces, automation templates, business-service discovery, shopping research, practical guides, and interactive experiences.",
  },
  {
    question: "Do I need an account to use AltFTool?",
    answer:
      "Most public browsing and many browser tools can be used without an account. Features that save personal state, synchronize data, or require protected access may ask you to sign in.",
  },
  {
    question: "Are all AltFTool tools free?",
    answer:
      "Many utilities and public destinations are free to open. A feature may rely on a third-party service, paid provider, affiliate merchant, or usage limit; the relevant page should identify that dependency or destination.",
  },
  {
    question: "Does my file or text leave the browser?",
    answer:
      "It depends on the feature. Local-first tools keep supported processing in the browser. Tools that require AI, live data, storage, conversion infrastructure, or external APIs may send the required input to a remote service. Check the tool or product privacy note before using sensitive data.",
  },
  {
    question: "Why can a live-data feature be unavailable?",
    answer:
      "Some features depend on Firebase, public APIs, search providers, media services, or other third parties. Network conditions, quotas, provider incidents, configuration, and regional availability can affect them.",
  },
  {
    question: "How do I report a broken tool or request a feature?",
    answer:
      "Use AltFTool Support for a problem, Request a Tool for a new utility, or the public Status page to review platform health before reporting an outage.",
  },
  {
    question: "Can I use AltFTool on mobile?",
    answer:
      "The public platform is designed for modern mobile and desktop browsers. Complex editors and file workflows may be easier on a larger screen even when the route remains responsive.",
  },
  {
    question: "How do light, dark, and system themes work?",
    answer:
      "System mode follows your operating-system preference. Light and dark selections override it on the current browser until you choose another mode.",
  },
]);

export const DOCS_REQUIRED_SECTION_IDS = Object.freeze([
  "overview",
  "start",
  "products",
  "tools",
  "automation",
  "business",
  "accounts",
  "privacy",
  "accessibility",
  "support",
  "faq",
]);
