import { Code2 } from "lucide-react";

// Rounds out the AI Tools catalog with VS Code's AI extension ecosystem —
// GitHub Copilot's native VS Code integration plus the broader landscape
// of AI extensions (Continue, Codeium, and others) available through the
// Extensions marketplace. Kept general rather than pinned to one specific
// extension, since VS Code intentionally supports many.
export const aiToolsPart3 = [
  {
    id: "ai-vscode-extensions",
    name: "VS Code AI Extensions",
    tagline: "Bring AI code completion, chat, and agents directly into Visual Studio Code through its extension ecosystem.",
    icon: Code2,
    category: "coding",
    categoryLabel: "Coding",
    officialUrl: "https://code.visualstudio.com",
    downloadUrl: "https://code.visualstudio.com/download",
    downloadLabel: "Download VS Code",
    docsUrl: "https://code.visualstudio.com/docs",
    pricing: {
      summary:
        "VS Code itself is free and open-source. AI extensions installed into it (GitHub Copilot and others) have their own separate pricing, ranging from free tiers to paid subscriptions — check each extension's own listing.",
      free: ["VS Code editor itself, entirely free", "Many AI extensions offer a free or trial tier"],
      paid: ["Most AI coding extensions have paid tiers for higher usage or premium models"],
      pricingUrl: "https://marketplace.visualstudio.com/vscode",
    },
    overview: {
      whatIsIt:
        "Visual Studio Code supports AI-assisted coding through its Extensions marketplace — most notably GitHub Copilot's native integration, alongside third-party AI extensions like Continue and Codeium. These add inline code completion, an in-editor chat panel, and increasingly, agent-style multi-file editing, without leaving the editor.",
      problems: [
        "Switching between the editor and a separate AI chat window to get coding help",
        "Writing repetitive boilerplate code by hand",
        "Getting unstuck on an error without searching outside the editor",
      ],
      mainFeatures: [
        "Inline code completions as you type",
        "An in-editor chat panel that can see your open files for context",
        "Agent-style features in newer extensions that can edit multiple files for a task",
        "Support for many languages and frameworks, not just one ecosystem",
      ],
    },
    setupGuide: {
      installSteps: [
        "Install VS Code from the official download page if you don't already have it.",
        "Open the Extensions panel (the four-squares icon in the sidebar, or Ctrl/Cmd+Shift+X).",
        "Search for the AI extension you want (e.g. GitHub Copilot) and click Install.",
      ],
      loginSteps: ["Most AI extensions require signing in with an account (e.g. a GitHub account for Copilot) after installing, via a prompt in the bottom-right corner."],
    },
    usage: {
      howToUse:
        "Once installed and signed in, inline suggestions typically appear automatically as you type — accept them with Tab. Open the extension's chat panel from the sidebar to ask questions about your code or request changes.",
      commonUseCases: ["Generating boilerplate and repetitive code", "Explaining unfamiliar code", "Getting unstuck on error messages", "Writing and updating unit tests"],
    },
    bestPractices: [
      "Only enable one primary AI completion extension at a time — running several together can cause conflicting suggestions.",
      "Review AI-suggested code before accepting it, especially for logic-critical or security-sensitive code.",
      "Keep VS Code and your extensions updated — AI extensions ship improvements frequently.",
    ],
    troubleshooting: [
      { issue: "Suggestions stopped appearing", fix: "Check the extension's status icon in the bottom status bar — it often shows if you've been signed out or hit a usage limit." },
      { issue: "Extension feels slow", fix: "Disable other heavy extensions temporarily to rule out a conflict, and confirm your internet connection is stable since most AI extensions call a cloud service." },
    ],
    helpfulTips: ["The Extensions marketplace shows install counts and ratings — a good first filter when comparing multiple AI extensions that do similar things."],
    faqs: [
      { q: "Do I need to pick just one AI extension?", a: "Technically you can install several, but running multiple inline-completion extensions at once often causes conflicting suggestions — most people settle on one primary tool." },
      { q: "Is VS Code itself an AI tool?", a: "No — VS Code is a free, general-purpose code editor. The AI capabilities come from extensions installed into it." },
    ],
  },
];
