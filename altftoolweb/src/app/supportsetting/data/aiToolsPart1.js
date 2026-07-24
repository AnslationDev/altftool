import { MessageSquare, Sparkles, Gem, Compass } from "lucide-react";

export const aiToolsPart1 = [
  {
    id: "ai-chatgpt",
    name: "ChatGPT",
    tagline: "The conversational AI that started the modern chatbot era, now a full assistant with voice, vision, and apps.",
    icon: MessageSquare,
    category: "chat-assistant",
    categoryLabel: "Chat Assistant",
    officialUrl: "https://chatgpt.com",
    downloadUrl: "https://chatgpt.com/download",
    downloadLabel: "Download App",
    docsUrl: "https://platform.openai.com/docs",
    pricing: {
      summary:
        "ChatGPT offers a free tier alongside several paid plans (Plus, Pro, Team, and Enterprise). Exact limits and current prices change over time — the official pricing page always has the latest numbers.",
      free: ["Core chat capabilities with usage limits", "Standard response speed", "Limited file uploads and image generation"],
      paid: ["Higher and more generous usage limits", "Priority access during high-traffic periods", "Advanced voice, larger context, and extra tools on higher tiers"],
      pricingUrl: "https://chatgpt.com",
    },
    overview: {
      whatIsIt:
        "ChatGPT is OpenAI's conversational AI assistant, built on the GPT family of large language models. It can answer questions, write and debug code, draft documents, analyze images and files, browse the web, and generate images through DALL-E integration. It's available as a website, desktop apps for Windows and Mac, and mobile apps for iOS and Android.",
      problems: [
        "Spending too long drafting emails, reports, or first-draft content from a blank page",
        "Needing a quick explanation, summary, or second opinion without searching multiple sites",
        "Getting stuck debugging code or learning a new programming concept without a mentor on hand",
        "Wanting a hands-free assistant for brainstorming or quick lookups while multitasking",
      ],
      mainFeatures: [
        "Custom GPTs — build and share specialized chatbots tuned to a specific task or knowledge base",
        "Advanced Voice Mode for natural, low-latency spoken conversations",
        "Custom Instructions to set persistent tone, background, and formatting preferences across chats",
        "Vision and file uploads to analyze images, PDFs, and spreadsheets directly in a conversation",
        "Code Interpreter (Data Analysis) for running Python, working with files, and generating charts",
        "Memory that recalls facts about you across sessions for more personalized responses",
      ],
    },
    setupGuide: {
      accountSteps: [
        "Go to chatgpt.com and click 'Sign up'",
        "Register with an email address, or continue with a Google, Microsoft, or Apple account",
        "Verify your email if prompted, then set your name and date of birth to complete the profile",
      ],
      installSteps: [
        "Visit chatgpt.com/download and choose the installer for your OS (Windows or macOS)",
        "Run the installer and follow the prompts; on Mac you can also enable the menu-bar quick launcher",
        "For mobile, install 'ChatGPT' from the Apple App Store or Google Play Store",
      ],
      loginSteps: [
        "Open the app or chatgpt.com and click 'Log in'",
        "Enter your email and password, or choose your linked Google/Microsoft/Apple sign-in",
        "Approve any two-factor prompt if you've enabled it, and you'll land in the chat interface",
      ],
      initialConfig: [
        "Choose a plan: Free, Plus, Pro, or Team, based on how much GPT-4/GPT-5-class usage and voice access you need",
        "Open Settings > Personalization > Custom Instructions to tell ChatGPT about your role and preferred response style",
        "Enable or disable 'Improve the model for everyone' under Data Controls depending on your privacy preference",
        "Turn on Advanced Voice Mode and grant microphone permissions if you plan to use spoken conversations",
      ],
    },
    usage: {
      howToUse:
        "Type a question, task, or instruction into the message box and ChatGPT responds in the same thread, keeping context so you can iterate with follow-ups. You can attach files or images, switch between models depending on your plan, or hand off a task to a custom GPT built for that specific job. Conversations are saved automatically so you can return to them later.",
      bestPrompts: [
        "Act as a senior code reviewer and go through this Python function line by line for bugs and style issues: [paste code]",
        "Summarize this 10-page report into 5 bullet points for a non-technical executive audience: [paste text]",
        "I'm negotiating a job offer with a base salary of $X — write me 3 talking points to ask for more equity",
        "Explain quantum entanglement to a curious 12-year-old using a simple analogy",
      ],
      tips: [
        "Set Custom Instructions once so you don't have to repeat context ('I'm a backend developer, keep answers concise') in every chat",
        "Use separate chats or Custom GPTs for unrelated topics to keep context clean and responses more focused",
        "Ask ChatGPT to 'ask clarifying questions before answering' on ambiguous or high-stakes tasks",
      ],
      commonUseCases: [
        "Drafting and editing emails, resumes, and cover letters",
        "Explaining and debugging code snippets across many languages",
        "Brainstorming names, taglines, or outlines for a project",
        "Analyzing an uploaded spreadsheet and generating quick charts or summaries",
      ],
    },
    troubleshooting: [
      {
        issue: "Can't log in / 'incorrect email or password' error",
        fix: "Use the 'Forgot password' link to reset it, confirm you're not accidentally trying a Google/Microsoft SSO account with a password login, and clear your browser cache if the error persists.",
      },
      {
        issue: "Desktop app won't install or open on Windows/Mac",
        fix: "Make sure your OS meets the minimum version requirements, re-download the installer from chatgpt.com/download in case the file was corrupted, and check that your antivirus isn't blocking the installer.",
      },
      {
        issue: "Responses feel slow, get cut off, or the app shows 'ChatGPT is at capacity'",
        fix: "This is usually server-side load; wait a minute and retry, refresh the page, or switch to a less busy model tier. Plus/Pro subscribers get priority access during high-traffic periods.",
      },
      {
        issue: "ChatGPT gives an outdated or factually wrong answer",
        fix: "Ask it to browse the web for current information (available on Plus/Free with browsing enabled), or provide the up-to-date source material directly in your prompt for it to work from.",
      },
    ],
    faqs: [
      {
        q: "Is ChatGPT free to use?",
        a: "Yes, there's a free tier with access to a capable model and limited usage. Plus ($20/mo), Pro, and Team plans add higher usage limits, faster responses, and access to the most advanced models and voice features.",
      },
      {
        q: "Does ChatGPT remember previous conversations?",
        a: "It keeps context within an ongoing chat automatically, and with Memory enabled it can also recall key facts about you across separate chats to personalize future responses.",
      },
      {
        q: "Can ChatGPT access the internet?",
        a: "Yes, when browsing is enabled it can search the web for current information and cite sources, rather than relying only on its training data.",
      },
      {
        q: "Is my data used to train the model?",
        a: "By default, conversations may be used to improve the model unless you opt out in Settings > Data Controls, or you're on a Team/Enterprise plan where training on your data is off by default.",
      },
    ],
    bestPractices: [
      "Be specific about the desired format (bullet points, table, word count) to get usable output on the first try",
      "Break large tasks into smaller sequential prompts rather than one giant request",
      "Verify facts, citations, and code output independently before using them in important work",
      "Use Custom GPTs for recurring specialized tasks instead of re-explaining context every time",
    ],
    helpfulTips: [
      "The keyboard shortcut Ctrl/Cmd+Shift+; regenerates the last response in the desktop app",
      "You can share a read-only link to any conversation for collaboration without giving account access",
    ],
  },
  {
    id: "ai-claude",
    name: "Claude",
    tagline: "Anthropic's AI assistant built for thoughtful, long-form work with class-leading writing and coding ability.",
    icon: Sparkles,
    category: "chat-assistant",
    categoryLabel: "Chat Assistant",
    officialUrl: "https://claude.ai",
    downloadUrl: "https://claude.com/download",
    downloadLabel: "Download App",
    docsUrl: "https://docs.claude.com",
    pricing: {
      summary:
        "Claude offers a free tier with daily usage limits, plus paid plans (Pro, Max, Team, and Enterprise) for higher usage and more capability. The official pricing page has current details.",
      free: ["Daily usage limits on chat", "Standard response speed", "Access to file and image uploads"],
      paid: ["Significantly higher usage limits", "Priority access during peak demand", "Extended context and project features on higher tiers"],
      pricingUrl: "https://www.anthropic.com/pricing",
    },
    overview: {
      whatIsIt:
        "Claude is Anthropic's family of AI models, accessible through claude.ai as a chat assistant with desktop and mobile apps. It's known for strong long-context understanding, careful reasoning, and high-quality writing and coding assistance. Claude can read large documents, work inside 'Projects' with persistent context, and produce interactive 'Artifacts' like code, documents, or diagrams alongside the conversation.",
      problems: [
        "Needing to analyze or summarize very long documents, contracts, or codebases in one pass",
        "Wanting consistent context across many chats for an ongoing project instead of restarting explanations each time",
        "Producing polished long-form writing that needs a coherent, human-sounding voice",
        "Reviewing, refactoring, or generating substantial pieces of code with an editable, previewable output",
      ],
      mainFeatures: [
        "Projects — group chats, files, and custom instructions around a specific goal with shared persistent context",
        "Artifacts — a side panel that renders and lets you iterate on generated code, documents, or diagrams live",
        "Very large context window, letting you paste in entire reports, books, or codebases for analysis",
        "Strong file support for PDFs, spreadsheets, and images uploaded directly into a conversation",
        "Claude Code integration for terminal- and IDE-based coding workflows",
        "Configurable style and tone presets (Concise, Explanatory, Formal, or custom styles)",
      ],
    },
    setupGuide: {
      accountSteps: [
        "Go to claude.ai and click 'Sign up'",
        "Enter your email to receive a one-time verification code, or continue with Google sign-in",
        "Enter the code, add your name, and accept the terms to finish creating your account",
      ],
      installSteps: [
        "Go to claude.com/download and pick the installer for Windows or macOS",
        "Run the installer; on Mac you can drag the app into Applications, on Windows follow the setup wizard",
        "For mobile, search 'Claude by Anthropic' in the Apple App Store or Google Play Store and install it",
      ],
      loginSteps: [
        "Open the app or claude.ai and select 'Log in'",
        "Enter your email and request a login code, or use Google sign-in if that's how you registered",
        "Enter the emailed code to complete login and land on the chat screen",
      ],
      initialConfig: [
        "Choose a plan: Free, Pro, Max, or Team depending on your usage volume and need for higher context limits",
        "Create your first Project if you have an ongoing piece of work, and upload relevant reference files to it",
        "Set a custom Style in Settings if you want responses in a particular tone by default",
        "Enable Claude in Chrome or connect Google Workspace/GitHub integrations if you want Claude to act on external tools",
      ],
    },
    usage: {
      howToUse:
        "Start a conversation by typing a request or pasting in a document, and Claude responds inline while longer code, writing, or diagrams open as an editable Artifact alongside the chat. For recurring work, create a Project so files, instructions, and chat history stay organized together instead of scattered across separate threads. You can keep refining an Artifact conversationally without losing the original.",
      bestPrompts: [
        "Read this 40-page contract and flag any clauses that create unusual liability for us: [paste text]",
        "Refactor this React component to use hooks instead of class syntax and explain each change: [paste code]",
        "Write a first draft of a product announcement blog post in a confident but not hype-y tone, about 500 words",
        "Compare these three vendor proposals and build a table scoring them on price, support, and scalability: [paste docs]",
      ],
      tips: [
        "Use Projects for anything ongoing (a book, a codebase, a client) so Claude keeps consistent context without re-uploading files",
        "When code or a document appears as an Artifact, ask for specific edits ('make this table sortable') rather than regenerating from scratch",
        "For very long inputs, paste the full document rather than summarizing it yourself — Claude's context window is built for that",
      ],
      commonUseCases: [
        "Reviewing and editing long contracts, research papers, or reports",
        "Writing and refactoring production code with the Artifacts preview",
        "Long-form content writing: blog posts, documentation, scripts",
        "Organizing an ongoing project (research, a course, a codebase) inside a single Project workspace",
      ],
    },
    troubleshooting: [
      {
        issue: "Login code email never arrives",
        fix: "Check spam/junk folders, confirm the email address was typed correctly, wait a minute for delivery lag, and use 'resend code' rather than requesting multiple codes in quick succession which can trigger rate limiting.",
      },
      {
        issue: "Desktop app fails to open or crashes on launch",
        fix: "Confirm your OS version meets the minimum requirement, reinstall using the latest installer from claude.com/download, and check for OS-level permission blocks on macOS Gatekeeper for newly downloaded apps.",
      },
      {
        issue: "Hitting usage limits or slow responses during peak hours",
        fix: "Free and Pro tiers have message caps that reset periodically; check the usage indicator in the app, space out requests, or upgrade to Pro/Max for higher limits and priority throughput.",
      },
      {
        issue: "Uploaded file isn't being read correctly",
        fix: "Confirm the file type is supported (PDF, common image formats, text-based docs), keep the file under the size limit, and try re-uploading — scanned image-only PDFs may need OCR before Claude can read the text.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Claude Free, Pro, and Max?",
        a: "Free gives limited daily messages with standard models; Pro adds much higher usage limits and access to more capable models; Max offers the highest usage caps and priority access for heavy daily users.",
      },
      {
        q: "What are Artifacts?",
        a: "Artifacts are a side panel where Claude renders substantial content — code, documents, diagrams, or simple web apps — so you can view, run, or edit it separately from the conversation flow.",
      },
      {
        q: "How is a Project different from a regular chat?",
        a: "A Project bundles multiple chats with shared uploaded files and custom instructions, so Claude retains context about that specific piece of work across sessions instead of starting fresh each time.",
      },
      {
        q: "Can Claude write and execute code?",
        a: "Claude can write, explain, and refactor code in most major languages, and can render/execute certain code (like JavaScript or React) directly inside an Artifact for quick previewing.",
      },
    ],
    bestPractices: [
      "Give Claude the full source material instead of a paraphrase — it handles large context very well",
      "Use Projects to keep long-running work organized rather than one long unstructured chat",
      "Ask for reasoning or a plan before a big piece of writing or code if you want more control over direction",
      "Set a custom Style once instead of repeating tone instructions in every prompt",
    ],
    helpfulTips: [
      "You can drag and drop multiple files at once into a chat for cross-document comparison",
      "Artifacts can be shared via a public link for others to view without a Claude account",
    ],
  },
  {
    id: "ai-gemini",
    name: "Google Gemini",
    tagline: "Google's multimodal AI, deeply woven into Search, Workspace, and Android for everyday productivity.",
    icon: Gem,
    category: "chat-assistant",
    categoryLabel: "Chat Assistant",
    officialUrl: "https://gemini.google.com",
    downloadUrl: null,
    downloadLabel: "Open Gemini",
    docsUrl: "https://ai.google.dev/docs",
    pricing: {
      summary:
        "Gemini is free to use with a Google account, with paid Google AI subscription tiers unlocking higher usage limits and more advanced models. Check the official page for current tiers and pricing.",
      free: ["Chat access with a Google account", "Standard model access with usage limits"],
      paid: ["Higher usage limits and access to more advanced models", "Deeper integration with other Google Workspace apps"],
      pricingUrl: "https://gemini.google.com",
    },
    overview: {
      whatIsIt:
        "Google Gemini is Google's AI assistant and model family, accessible at gemini.google.com, built into the Gemini app on Android/iOS, and embedded directly across Gmail, Docs, Sheets, and Search. It's natively multimodal, handling text, images, audio, and video in the same conversation, and it can pull in live information via Google Search grounding.",
      problems: [
        "Wanting an AI assistant that already understands your Gmail, Calendar, and Docs without manual exporting",
        "Needing to analyze images, screenshots, or video content alongside text in one query",
        "Wanting current, real-time information rather than answers frozen at a training cutoff",
        "Working across many Google apps and wanting AI help without switching tools",
      ],
      mainFeatures: [
        "Deep Google Workspace integration — summarize emails in Gmail, draft in Docs, analyze data in Sheets",
        "Native multimodality — understands images, PDFs, audio clips, and video within a single prompt",
        "Gems — custom personas/assistants you configure once for repeated tasks (similar to custom GPTs)",
        "Real-time grounding with Google Search for up-to-date answers with source links",
        "Deep Research mode that autonomously browses and compiles a cited report on a topic",
        "Tight Android integration, including replacing Google Assistant on supported devices",
      ],
    },
    setupGuide: {
      accountSteps: [
        "Go to gemini.google.com and sign in with an existing Google account, or create one at accounts.google.com first",
        "Accept the Gemini Apps terms and privacy notice when prompted on first visit",
        "Confirm your Google Workspace or personal account is the one you want Gemini activity tied to",
      ],
      installSteps: [
        "On Android, open the Google Play Store and install the 'Google' or 'Gemini' app, or update Google app to get Gemini built in",
        "On iPhone, install the 'Google Gemini' app from the Apple App Store",
        "On desktop, there's no separate installer — bookmark gemini.google.com or add it as a browser shortcut/PWA for quick access",
      ],
      loginSteps: [
        "Open gemini.google.com or the mobile app",
        "Tap 'Sign in' and choose the Google account you want to use",
        "Complete any 2-Step Verification prompt tied to your Google account to finish logging in",
      ],
      initialConfig: [
        "Choose whether to stay on the free Gemini experience or upgrade to Google AI Pro/Ultra for advanced models and higher limits",
        "Review 'Personalization' settings to let Gemini reference your Search history and Workspace content, or turn this off for privacy",
        "Set up a Gem for a recurring role you use often, like a writing coach or trip planner",
        "On Android, optionally set Gemini as your default assistant in phone settings",
      ],
    },
    usage: {
      howToUse:
        "Ask Gemini a question or give it a task directly in the chat, attach an image, PDF, or link a Google Drive file, and it responds with the option to export results straight into Docs, Sheets, or Gmail. Because it's integrated across Google's apps, you can also invoke Gemini from a side panel inside Gmail or Docs to act on the content you're already viewing.",
      bestPrompts: [
        "Summarize the unread emails in my inbox from the last 3 days and flag anything needing a reply today",
        "Here's a photo of a whiteboard from our meeting — turn it into a structured action-item list",
        "Do deep research on the current state of solid-state EV batteries and give me a cited summary",
        "Draft a reply to this email thread proposing three alternative meeting times next week: [paste thread]",
      ],
      tips: [
        "Use the Gemini side panel inside Gmail/Docs/Sheets instead of the standalone app when the task is about content already in that app",
        "Turn on Search grounding for anything time-sensitive so answers reflect current information rather than stale training data",
        "Create a Gem for repeated, narrow tasks (like 'resume reviewer') so you don't have to re-explain the setup each time",
      ],
      commonUseCases: [
        "Summarizing and drafting replies inside Gmail",
        "Analyzing photos, screenshots, or scanned documents",
        "Generating and debugging formulas or scripts inside Google Sheets",
        "Researching a topic with Deep Research and getting a sourced report",
      ],
    },
    troubleshooting: [
      {
        issue: "Can't sign in / 'this account can't access Gemini' message",
        fix: "Some Workspace accounts have Gemini disabled by an admin policy — check with your organization's IT admin, or try a personal Google account instead if this is a managed work/school account.",
      },
      {
        issue: "Gemini isn't showing up inside Gmail, Docs, or Sheets",
        fix: "Confirm your Workspace plan includes Gemini (it may require a separate add-on for business accounts), refresh the app, and check that the Gemini side panel icon hasn't been hidden in Workspace Labs settings.",
      },
      {
        issue: "Responses are slow or time out on longer requests",
        fix: "Very large file analyses or Deep Research tasks take longer by nature; keep the tab open and avoid refreshing mid-task, or split a huge document into smaller sections for faster turnaround.",
      },
      {
        issue: "Gemini gives an answer that ignores an attached file or image",
        fix: "Re-attach the file after confirming it fully uploaded (watch for the upload progress indicator), and make sure the file format is supported — some obscure file types aren't parsed correctly.",
      },
    ],
    faqs: [
      {
        q: "Is Google Gemini free?",
        a: "Yes, there's a free tier with core chat features. Google AI Pro and Ultra subscriptions unlock more advanced models, higher usage limits, and extra storage/perks bundled with Google One.",
      },
      {
        q: "What's the difference between Gemini and Google Assistant?",
        a: "Gemini is Google's newer, more capable conversational AI and is gradually replacing Google Assistant as the default voice/AI experience on Android devices.",
      },
      {
        q: "Can Gemini access my Gmail and Drive content?",
        a: "Yes, if you enable personalization/Workspace extensions, Gemini can reference your Gmail, Docs, and Drive content to give more relevant answers, and you can turn this off in settings if you prefer it not to.",
      },
      {
        q: "What is a 'Gem' in Gemini?",
        a: "A Gem is a custom, saved version of Gemini configured with specific instructions and context for a recurring task, similar in concept to a custom GPT.",
      },
    ],
    bestPractices: [
      "Use Gemini directly inside the Google app (Gmail, Docs) it relates to for the most relevant, context-aware answers",
      "Enable Search grounding for anything requiring current facts, prices, or news",
      "Review personalization/privacy settings so you understand what account data Gemini can see",
      "Use Deep Research for broad topics instead of manually opening dozens of search results",
    ],
    helpfulTips: [
      "You can pin Gemini as a persistent side panel in Gmail and Docs for quick access without leaving the page",
      "Voice input works well for quick queries on mobile — tap the microphone icon instead of typing",
    ],
  },
  {
    id: "ai-copilot",
    name: "Microsoft Copilot",
    tagline: "Microsoft's AI assistant woven into Windows, Edge, and Microsoft 365 for work that happens where you already are.",
    icon: Compass,
    category: "chat-assistant",
    categoryLabel: "Chat Assistant",
    officialUrl: "https://copilot.microsoft.com",
    downloadUrl: null,
    downloadLabel: "Open Copilot",
    docsUrl: "https://learn.microsoft.com/copilot",
    pricing: {
      summary:
        "Microsoft Copilot is free for basic chat with a Microsoft account, with a paid Copilot Pro (and Microsoft 365 Copilot for organizations) tier adding deeper integration and higher limits.",
      free: ["Chat access with a Microsoft account", "Basic web search grounding"],
      paid: ["Priority access and higher usage limits", "Deeper integration with Microsoft 365 apps on paid tiers"],
      pricingUrl: "https://copilot.microsoft.com",
    },
    overview: {
      whatIsIt:
        "Microsoft Copilot is Microsoft's AI assistant, available at copilot.microsoft.com, built into Windows via a taskbar shortcut, integrated into Edge, and embedded across Microsoft 365 apps like Word, Excel, Outlook, and Teams (as Microsoft 365 Copilot for licensed users). It combines conversational chat with the ability to act inside the documents and apps you're already using.",
      problems: [
        "Needing AI help without leaving Word, Excel, Outlook, or Teams for a separate chat tool",
        "Wanting quick answers or image generation directly from the Windows taskbar or Edge sidebar",
        "Drowning in meeting notes, long email threads, or messy spreadsheets that need summarizing",
        "Needing an assistant that respects enterprise data boundaries for work accounts",
      ],
      mainFeatures: [
        "Native Windows integration via a taskbar icon and keyboard shortcut for instant access",
        "Edge sidebar Copilot that can summarize the webpage or PDF you're currently viewing",
        "Microsoft 365 Copilot integration inside Word, Excel, PowerPoint, Outlook, and Teams for licensed business users",
        "Image generation (powered by DALL-E) directly from a chat prompt",
        "Copilot Notebooks for grounding answers in a set of uploaded files/sources you control",
        "Enterprise data protection commitments for organizational accounts using Microsoft 365 Copilot",
      ],
    },
    setupGuide: {
      accountSteps: [
        "Go to copilot.microsoft.com and sign in with an existing Microsoft account, or click 'Create one' to sign up",
        "For work use, ask your IT admin whether your organization has a Microsoft 365 Copilot license tied to your work account",
        "Complete any organizational sign-in policies (like conditional access or MFA enrollment) if using a work/school account",
      ],
      installSteps: [
        "On Windows 11, Copilot is built in — click the Copilot icon on the taskbar or press the Windows+C shortcut",
        "On Windows 10 or if missing, update Windows or install the 'Copilot' app from the Microsoft Store",
        "On mobile, install 'Microsoft Copilot' from the Apple App Store or Google Play Store; in Edge desktop, it's built into the sidebar",
      ],
      loginSteps: [
        "Open the Copilot app, sidebar, or copilot.microsoft.com",
        "Click 'Sign in' and enter your Microsoft account email and password",
        "Approve the Microsoft Authenticator or MFA prompt if your account has it enabled",
      ],
      initialConfig: [
        "Decide whether you're using personal Copilot (free/Copilot Pro) or a work account with Microsoft 365 Copilot licensing",
        "In Edge, enable the Copilot sidebar icon if it's hidden, and grant page-context permission so it can summarize the current tab",
        "Set response tone/format preferences in the Copilot app settings if using Copilot Pro",
        "Connect relevant Microsoft 365 apps (Outlook, Teams, SharePoint) if you have a business license, so Copilot can reference your work content",
      ],
    },
    usage: {
      howToUse:
        "Open Copilot from the Windows taskbar, Edge sidebar, or copilot.microsoft.com and type your request; with a Microsoft 365 Copilot license you can also invoke it directly inside Word, Excel, or Outlook to act on the open document. Use Copilot Notebooks when you want answers grounded strictly in a specific set of files you've uploaded rather than general web knowledge.",
      bestPrompts: [
        "Summarize this Word document into an executive summary with 3 key recommendations: [paste text]",
        "In this Excel sheet, write a formula to flag any row where expenses exceed budget by more than 10%",
        "Draft a Teams message to my team recapping today's meeting decisions in a friendly, concise tone",
        "Generate an image of a minimalist logo for a coffee brand called 'Northline Roasters'",
      ],
      tips: [
        "Use the Edge sidebar version when you want Copilot to reason about the exact page or PDF you're currently reading",
        "In Microsoft 365 apps, reference the open document explicitly ('summarize this presentation') to get grounded, not generic, answers",
        "Use Copilot Notebooks for research tasks where you want answers restricted to sources you've personally vetted",
      ],
      commonUseCases: [
        "Summarizing Word documents and drafting first-pass content",
        "Writing and explaining Excel formulas or analyzing spreadsheet data",
        "Recapping Teams meetings and drafting follow-up messages",
        "Summarizing web pages or long PDFs directly from the Edge sidebar",
      ],
    },
    troubleshooting: [
      {
        issue: "Can't sign in with a work/school account",
        fix: "Confirm your organization has enabled Copilot access for your account, check for conditional access policies blocking it, and contact your IT admin if the license hasn't been assigned yet.",
      },
      {
        issue: "Copilot icon missing from the Windows taskbar or Edge sidebar",
        fix: "Update Windows and Edge to the latest version, then re-enable Copilot from Windows Settings > Personalization > Taskbar, or from Edge Settings > Sidebar > App and notification settings.",
      },
      {
        issue: "Copilot in Word/Excel gives generic answers unrelated to my document",
        fix: "Make sure the document is saved to OneDrive/SharePoint (required for Microsoft 365 Copilot to read it), and explicitly reference the content you want it to use rather than assuming it's automatically in context.",
      },
      {
        issue: "Slow responses or Copilot times out during high-demand periods",
        fix: "This is typically temporary server load; wait and retry, close and reopen the sidebar/app, or check the Microsoft 365 status page if the issue is org-wide.",
      },
    ],
    faqs: [
      {
        q: "Is Microsoft Copilot free?",
        a: "The consumer version at copilot.microsoft.com is free with usage limits; Copilot Pro adds priority access and more features for individuals, while Microsoft 365 Copilot is a separate paid add-on licensed per user for businesses.",
      },
      {
        q: "What's the difference between Copilot and Microsoft 365 Copilot?",
        a: "Copilot is the general-purpose free/Pro assistant available to anyone; Microsoft 365 Copilot is the enterprise version embedded in Word, Excel, Outlook, and Teams that can read and act on your organization's licensed content.",
      },
      {
        q: "Does Copilot keep my business data private?",
        a: "For Microsoft 365 Copilot on a commercial license, Microsoft states your prompts and organizational data aren't used to train the underlying foundation models and stay within your tenant's compliance boundary.",
      },
      {
        q: "Can Copilot generate images?",
        a: "Yes, Copilot can generate images from a text description using DALL-E-based image generation directly within the chat.",
      },
    ],
    bestPractices: [
      "Use the in-app version (inside Word, Excel, Outlook) rather than the standalone chat when working on a specific document",
      "Save files to OneDrive/SharePoint first so Microsoft 365 Copilot can properly reference them",
      "Be explicit about the target app format you want ('write this as a Teams message', 'as an Excel formula')",
      "Check with IT about your organization's Copilot licensing before assuming enterprise features are available",
    ],
    helpfulTips: [
      "Press Windows+C on Windows 11 as a fast keyboard shortcut to open Copilot",
      "Use the Edge sidebar's 'Page' tab to have Copilot summarize or answer questions about the exact tab you're viewing",
    ],
  },
];
