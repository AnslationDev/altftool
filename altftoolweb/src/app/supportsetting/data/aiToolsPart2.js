import { Search, WandSparkles, SquareTerminal, GitBranch } from "lucide-react";

export const aiToolsPart2 = [
  {
    id: "ai-perplexity",
    name: "Perplexity AI",
    tagline: "An answer engine that searches the live web and cites its sources.",
    icon: Search,
    category: "research",
    categoryLabel: "Research",
    officialUrl: "https://www.perplexity.ai",
    downloadUrl: "https://www.perplexity.ai/download",
    downloadLabel: "Download App",
    overview: {
      whatIsIt:
        "Perplexity AI is a conversational search engine that answers questions in natural language by reading current web pages and summarizing them with inline citations. Instead of returning a list of links like a traditional search engine, it synthesizes a direct answer and shows exactly which sources it drew from. It's available as a website, mobile apps, a desktop app, and browser extensions.",
      problems: [
        "Sifting through pages of search results and clicking multiple links to piece together one answer",
        "Not knowing whether an AI chatbot's answer is up to date or fabricated, since it can't show sources",
        "Needing quick, well-organized research on a topic without manually cross-referencing articles",
        "Comparing products, papers, or facts that require pulling data from several different sites",
      ],
      mainFeatures: [
        "Real-time web search with numbered inline citations for every claim",
        "Pro Search / Deep Research modes that run multi-step research and produce longer, sourced reports",
        "Focus modes to scope answers to Academic, Writing, YouTube, Reddit, or specific domains",
        "Threads that keep follow-up questions in context, plus shareable answer pages and Collections for organizing research",
        "File and image upload for asking questions about documents, screenshots, or PDFs",
        "Perplexity Assistant and browser integration for answering questions and taking actions from other apps",
      ],
    },
    setupGuide: {
      accountSteps: [
        "Go to perplexity.ai and click 'Sign Up' in the top right corner.",
        "Continue with a Google account, Apple ID, or an email address (a verification code is emailed if using email).",
        "Choose a username when prompted; a free account is created immediately with limited Pro searches per day.",
        "Optionally upgrade to Perplexity Pro from Settings > Account for unlimited Pro Search and access to more AI models.",
      ],
      installSteps: [
        "Visit perplexity.ai/download to get the native app for Windows or macOS, or find 'Perplexity' in the iOS App Store / Google Play for mobile.",
        "Install the Perplexity browser extension (Chrome, and Comet, Perplexity's own browser) to search from the address bar and summarize any page you're viewing.",
        "On desktop or mobile, sign in once installed and pin the app or set it as a keyboard shortcut/default search engine for quick access.",
      ],
      loginSteps: [
        "Open the app, website, or extension and click 'Log in'.",
        "Select the same method used at signup (Google, Apple, or email) — email logins send a one-time code instead of a password.",
        "Once verified, the session stays signed in on that device until you manually log out from Settings.",
      ],
      initialConfig: [
        "Set a default AI model (e.g., a faster model for quick facts vs. a more powerful one for complex reasoning) under Settings > AI Model, if on Pro.",
        "Pick a default Focus mode if you mostly search one type of content, like Academic papers or Writing assistance.",
        "Turn on 'Personalize your results' if you want answers tailored using your search history.",
        "Enable the browser extension's keyboard shortcut so you can highlight text on any page and ask Perplexity about it directly.",
      ],
    },
    usage: {
      howToUse:
        "Type a question into the search bar the way you'd ask a knowledgeable colleague, rather than typing keywords. Perplexity searches the web, reads the top sources, and writes a synthesized answer with numbered citations you can click to verify. Use follow-up questions in the same thread to refine or dig deeper — it remembers the conversation context.",
      bestPrompts: [
        "What are the most credible criticisms of [a specific economic theory], and who made them?",
        "Compare the battery life, camera, and price of the latest two flagship phones from [Brand A] and [Brand B] using recent reviews.",
        "Summarize what happened in [industry] this week and list the primary sources.",
        "Using Academic focus, find peer-reviewed studies from the last 3 years on [topic] and summarize their conclusions.",
      ],
      tips: [
        "Always check the numbered citations for anything you'll rely on professionally — click through instead of trusting the summary blindly.",
        "Use Focus modes (Academic, Reddit, YouTube) to steer where it pulls sources from when the default web search is too broad.",
        "For multi-step research questions, use Pro Search or Deep Research instead of a single query — it will ask clarifying questions and dig deeper.",
      ],
      commonUseCases: [
        "Fact-checking a claim or statistic before including it in a report",
        "Researching and comparing products before a purchase",
        "Getting a quick, cited literature summary for academic or professional research",
        "Catching up on breaking news or a fast-moving topic with sources attached",
      ],
    },
    troubleshooting: [
      {
        issue: "Can't log in / verification code from email never arrives.",
        fix: "Check spam/junk folders and confirm the email wasn't mistyped; wait a few minutes since delivery can lag, then use 'Resend code'. If it still fails, try logging in with Google or Apple instead, or reset via a different browser with cookies enabled.",
      },
      {
        issue: "Browser extension or desktop app won't install or shows a blocked/unsupported message.",
        fix: "Confirm your OS and browser meet the minimum version listed on perplexity.ai/download, then reinstall from the official page rather than a third-party store. On managed work computers, an admin-level restriction may be blocking the installer — check with IT.",
      },
      {
        issue: "Answers feel slow, cut off, or the app hangs on 'Searching...'.",
        fix: "Refresh the page or restart the app; this is often a temporary load issue on Perplexity's servers. Switching to a lighter/faster model in Settings, or splitting a very broad question into smaller ones, usually resolves repeated timeouts.",
      },
      {
        issue: "Citations don't match the claim or a source link is dead.",
        fix: "Ask Perplexity to 're-check that claim with sources' in the same thread, or rephrase the question narrower. If a linked page has moved, search the site directly or use the Wayback Machine to find the original content.",
      },
    ],
    faqs: [
      {
        q: "Is Perplexity AI free to use?",
        a: "Yes, there's a free tier with a daily limit on Pro searches; Perplexity Pro is a paid subscription that adds unlimited Pro Search, access to more underlying AI models, and file upload limits.",
      },
      {
        q: "How is Perplexity different from ChatGPT or Google?",
        a: "Unlike a standard chatbot, Perplexity always runs a live web search before answering and shows exactly which sources it used with inline citations, closer to search-plus-summarization than a self-contained chatbot.",
      },
      {
        q: "Can I trust Perplexity's answers without checking anything?",
        a: "No — treat it like a fast research assistant, not a final source. Always click through to the cited pages for anything important, since summarization can still misrepresent nuance.",
      },
      {
        q: "Does Perplexity work on mobile?",
        a: "Yes, official apps are available for iOS and Android with the same search, Focus modes, and thread history as the website.",
      },
    ],
    bestPractices: [
      "Ask specific, well-scoped questions rather than vague ones to get tighter, more useful citations.",
      "Use Focus modes to match the type of source you actually want (academic papers vs. forum opinions vs. video content).",
      "Verify any number, date, or quote against the linked source before using it in real work.",
      "Keep related questions in the same thread so follow-ups have full context instead of starting over.",
    ],
    helpfulTips: [
      "Use Collections to group threads by project so past research is easy to find again.",
      "The browser extension can summarize the exact page you're on — handy for long articles or PDFs.",
    ],
  },
  {
    id: "ai-midjourney",
    name: "Midjourney",
    tagline: "Generates original images from text prompts with a distinctive, art-directed style.",
    icon: WandSparkles,
    category: "image-generation",
    categoryLabel: "Image Generation",
    officialUrl: "https://www.midjourney.com",
    downloadUrl: null,
    downloadLabel: "Visit Website",
    overview: {
      whatIsIt:
        "Midjourney is an AI image generation tool that turns text prompts into original artwork, illustrations, and photorealistic images. It has no traditional installable app — it runs through its web app (alpha.midjourney.com) and, historically, through Discord bot commands inside the Midjourney Discord server. It's especially known for a strong, painterly default aesthetic that many designers and artists favor over more literal image models.",
      problems: [
        "Needing custom visuals (concept art, mockups, illustrations) without hiring an illustrator or photographer for every idea",
        "Wanting fast visual exploration of a concept before committing design or production budget",
        "Producing stylistically consistent images across a project (same character, mood, or art style)",
        "Generating reference imagery for storyboards, moodboards, or marketing concepts under tight deadlines",
      ],
      mainFeatures: [
        "Text-to-image generation with a distinct, high-quality default artistic style",
        "Parameter flags like --ar (aspect ratio), --v (model version), --stylize, and --chaos to control output precisely",
        "Image prompting and image weight (using a reference image alongside text) plus Style Reference (--sref) for consistent looks",
        "Vary, Upscale, Pan, Zoom Out, and Remix tools to refine a generated image instead of starting over",
        "Web-based image editor for inpainting/outpainting and retexturing parts of an image",
        "Community and personal galleries where every generation (on standard plans) is visible and searchable for prompt ideas",
      ],
    },
    setupGuide: {
      accountSteps: [
        "Go to midjourney.com and click 'Sign Up' or 'Join the Beta'.",
        "Create an account with an email address (or Google/Discord login) and verify via the confirmation email.",
        "Choose and pay for a subscription plan (Basic, Standard, Pro, or Mega) — Midjourney no longer offers a free trial, so a paid plan is required to generate images.",
      ],
      installSteps: [
        "There is no desktop or mobile app to install — Midjourney runs entirely at alpha.midjourney.com in a web browser.",
        "Optionally join the official Midjourney Discord server (link on the website) if you prefer generating images with /imagine slash commands in chat channels or DMs with the bot.",
        "Bookmark alpha.midjourney.com and, if desired, add it to your phone's home screen for quick browser-based access on mobile.",
      ],
      loginSteps: [
        "Go to alpha.midjourney.com and click 'Sign In'.",
        "Enter your email/password or continue with the linked Google/Discord account.",
        "If using Discord, sign in to Discord as usual and navigate to the Midjourney server or your bot DM to run commands there.",
      ],
      initialConfig: [
        "Set a default aspect ratio and model version in your web app profile settings so you don't have to type --ar and --v on every prompt.",
        "Review the Community Feed for prompt examples in the style you want before writing your own.",
        "If privacy matters, note that Basic/Standard plans generate publicly by default — Pro and Mega plans include Stealth Mode for private generations.",
        "Create folders in the web app to organize generations by project.",
      ],
    },
    usage: {
      howToUse:
        "Type a descriptive prompt — subject, style, lighting, composition — into the Imagine bar on the web app (or after /imagine in Discord) and Midjourney returns a grid of image variations within about a minute. From there you pick a result to Vary (subtle or strong), Upscale for higher resolution, or Remix by editing the prompt and regenerating from that image as a starting point.",
      bestPrompts: [
        "A weathered lighthouse on a rocky cliff at golden hour, cinematic lighting, dramatic clouds, hyperrealistic --ar 16:9 --v 6",
        "Minimalist logo for a coffee roastery, single line art, black and white, vector style --ar 1:1 --stylize 250",
        "Isometric cutaway illustration of a treehouse village, warm color palette, storybook art style --ar 3:2",
        "Portrait of an elderly fisherman, weathered skin, soft window light, photographic, 85mm lens look --ar 2:3 --v 6 --stylize 100",
      ],
      tips: [
        "Front-load the most important subject and style words early in the prompt — earlier terms carry more weight.",
        "Use --sref with a reference image URL to keep a consistent visual style across multiple separate prompts.",
        "Generate a batch, pick the strongest result, then use Vary (Subtle) to iterate instead of rewriting the whole prompt from scratch.",
      ],
      commonUseCases: [
        "Concept art and mood boards for games, film, or product design",
        "Marketing and social media visuals when stock photography doesn't fit the brand",
        "Rapid visual prototyping of characters, environments, or logo directions",
        "Illustration for blog posts, book covers, or presentation decks",
      ],
    },
    troubleshooting: [
      {
        issue: "Can't sign in / account says subscription required to generate.",
        fix: "Confirm an active paid plan under Manage Subscription — free trials are no longer offered, so an expired card or lapsed subscription will block generation. Update billing details, then refresh the web app.",
      },
      {
        issue: "Discord bot doesn't respond to /imagine commands.",
        fix: "Make sure the Midjourney bot is actually present in the server/channel you're using and that you have an active subscription linked to that Discord account. Try DMing the Midjourney Bot directly, or switch to the web app at alpha.midjourney.com, which doesn't depend on Discord at all.",
      },
      {
        issue: "Generated images look nothing like the prompt, or quality is inconsistent.",
        fix: "Simplify the prompt to its core subject and style first, then add modifiers one at a time to see what's shifting the result. Check that --v is set to the latest model version, and consider lowering --chaos if outputs are too random.",
      },
      {
        issue: "Web app is slow or stuck generating ('Waiting to start').",
        fix: "This usually means the queue is busy at peak hours; higher-tier plans (Pro/Mega) get priority (Fast/Turbo) GPU time. Try again in a few minutes, or switch from Relax mode to Fast mode if your plan includes it.",
      },
    ],
    faqs: [
      {
        q: "Do I need Discord to use Midjourney?",
        a: "No. Midjourney originally only worked through Discord, but it now has its own web app at alpha.midjourney.com where you can prompt, edit, and manage images without touching Discord.",
      },
      {
        q: "Is there a free version of Midjourney?",
        a: "Not currently — Midjourney requires a paid monthly or annual subscription (Basic, Standard, Pro, or Mega) to generate images; there is no ongoing free tier.",
      },
      {
        q: "Who owns the images Midjourney generates?",
        a: "Paying subscribers generally own the images they create, subject to Midjourney's Terms of Service; company-size subscribers above a revenue threshold are required to be on Pro or Mega plans. Always review the current Terms of Service for specifics.",
      },
      {
        q: "What does --v actually control?",
        a: "It selects which underlying Midjourney model version generates the image; newer versions typically improve realism, prompt accuracy, and detail, while older versions can still be used for their distinct look.",
      },
    ],
    bestPractices: [
      "Write prompts as a clear sentence describing subject, setting, style, and lighting rather than a pile of disconnected keywords.",
      "Use parameters (--ar, --v, --stylize, --chaos) deliberately instead of copy-pasting them from someone else's prompt without understanding what they do.",
      "Iterate with Vary and Remix on a promising result instead of regenerating from scratch every time.",
      "Turn on Stealth Mode (Pro/Mega) for client or unreleased work you don't want appearing in the public feed.",
    ],
    helpfulTips: [
      "Browse the Community Feed and save prompts you like — reverse-engineering good prompts is one of the fastest ways to learn the style vocabulary.",
      "Keep a personal prompt library of phrases/styles that consistently work well for your projects.",
    ],
  },
  {
    id: "ai-cursor",
    name: "Cursor AI",
    tagline: "An AI-native code editor built on VS Code with deep, whole-codebase AI assistance.",
    icon: SquareTerminal,
    category: "coding",
    categoryLabel: "Coding",
    officialUrl: "https://www.cursor.com",
    downloadUrl: "https://www.cursor.com/download",
    downloadLabel: "Download for Your OS",
    overview: {
      whatIsIt:
        "Cursor is a standalone code editor forked from VS Code that has AI assistance built into its core rather than bolted on as an extension. It can read and reason across an entire codebase, make multi-file edits, and run an autonomous 'Agent' that plans and executes coding tasks. Because it's a full editor (not just a plugin), it keeps your existing VS Code keybindings, themes, and most extensions while adding AI-native features on top.",
      problems: [
        "Losing time writing repetitive or boilerplate code by hand",
        "Needing to understand or navigate an unfamiliar or large codebase quickly",
        "Wanting an AI that can make coordinated changes across multiple files, not just answer questions in a side chat",
        "Debugging errors or refactoring code without manually tracing every affected file",
      ],
      mainFeatures: [
        "Tab: predictive multi-line autocomplete that suggests entire edits, not just the next token, based on your recent changes",
        "Agent mode: an autonomous AI that plans, edits multiple files, runs terminal commands, and iterates until a task is done",
        "Cmd/Ctrl+K inline editing to rewrite or generate code directly in place with a natural-language instruction",
        "Chat with full codebase context ('@' references to files, folders, docs, or the web) for asking questions grounded in your actual project",
        "Support for multiple frontier models (e.g., different Claude, GPT, and Gemini models) selectable per task",
        "Built-in support for rules files (.cursor/rules) to steer AI behavior consistently across a project",
      ],
    },
    setupGuide: {
      accountSteps: [
        "Go to cursor.com and click 'Download', which also prompts account creation.",
        "Sign up using a Google, GitHub, or email account when the app first opens and asks you to log in.",
        "A free Hobby plan is created automatically; upgrade to Pro or Business from Settings > Billing for higher usage limits and access to more models.",
      ],
      installSteps: [
        "Download the installer for your OS (Windows, macOS, or Linux) from cursor.com/download.",
        "Run the installer; on first launch, Cursor offers to import your VS Code settings, extensions, and keybindings automatically.",
        "Sign in when prompted, then open a project folder (File > Open Folder) to start working, just as you would in VS Code.",
      ],
      loginSteps: [
        "Open Cursor and click your account icon in the bottom-left, or wait for the sign-in prompt on first launch.",
        "Choose Continue with Google, GitHub, or email, and complete authentication in the browser tab that opens.",
        "Cursor redirects back to the app automatically once authentication succeeds and stays signed in across sessions.",
      ],
      initialConfig: [
        "Choose a default AI model in Settings > Models based on your plan and task type (faster models for quick edits, stronger models for complex Agent tasks).",
        "Add a .cursor/rules file (or rules for AI in Settings) describing your project's conventions so suggestions match your codebase's style.",
        "Enable/disable Privacy Mode in Settings if you don't want code snippets used to improve models.",
        "Set up keyboard shortcuts for Tab, Cmd/Ctrl+K, and Agent chat if migrating from a different editor's muscle memory.",
      ],
    },
    usage: {
      howToUse:
        "Use Tab as you type for accepted-with-a-keypress autocomplete, Cmd/Ctrl+K to rewrite a selected block inline with an instruction, and the Chat/Agent panel for larger tasks that span multiple files. For anything beyond a single-line fix, describe the goal in plain language and let Agent mode plan the changes, edit files, and run commands, reviewing the diff before accepting.",
      bestPrompts: [
        "Refactor this component to use React Query instead of useEffect for data fetching, and update all call sites that import it.",
        "// Add input validation to this function: email must be valid format, password must be 8+ chars with one number",
        "Find and fix the bug causing the cart total to double-count discounts across checkout.js and cart-utils.js.",
        "Write unit tests for the UserService class covering the edge cases where the API returns a 404 or times out.",
      ],
      tips: [
        "Reference specific files/symbols with '@' in chat so the AI grounds its answer in your actual code instead of guessing.",
        "Review Agent's proposed diff carefully before accepting, especially for changes touching authentication, payments, or data migrations.",
        "Keep a project rules file up to date — it dramatically improves suggestion quality on larger, opinionated codebases.",
      ],
      commonUseCases: [
        "Rapidly scaffolding new features or components that follow existing project patterns",
        "Onboarding onto an unfamiliar codebase by asking the chat questions about how systems connect",
        "Multi-file refactors, like renaming an API or migrating a library, handled end-to-end by Agent mode",
        "Writing and updating test coverage alongside new code changes",
      ],
    },
    troubleshooting: [
      {
        issue: "Can't sign in / stuck on 'Authenticating...' screen.",
        fix: "Close and reopen the browser tab used for login, and check that Cursor isn't blocked by a corporate firewall or VPN intercepting the auth redirect. If it persists, sign out from Settings, restart Cursor, and try logging in again, or use a different login method (e.g., email instead of SSO).",
      },
      {
        issue: "Installer won't run or extensions/settings fail to import from VS Code.",
        fix: "Make sure you're using the latest installer from cursor.com/download rather than an old cached file, and that your OS meets the minimum version requirements. If import fails, open Cursor's Command Palette and run 'Import VS Code Settings' manually after installation completes.",
      },
      {
        issue: "Tab suggestions or Agent responses are slow, or requests time out.",
        fix: "Check your usage limits under Settings > Usage — Hobby plan limits can throttle response speed once exceeded. Switching to a lighter/faster model for routine edits, and reserving the most capable model for complex Agent tasks, usually resolves lag.",
      },
      {
        issue: "AI edits break the build or make unwanted changes across files.",
        fix: "Use the built-in diff review before accepting any Agent change, and revert via Cursor's checkpoint/undo history if a change was already applied. Narrow the prompt scope (name exact files/functions) next time so Agent doesn't touch unrelated code.",
      },
    ],
    faqs: [
      {
        q: "Do I lose my VS Code extensions if I switch to Cursor?",
        a: "Most VS Code extensions still work in Cursor since it's a VS Code fork, and the first-run setup can import your existing extensions and keybindings automatically.",
      },
      {
        q: "Is Cursor free to use?",
        a: "There's a free Hobby tier with limited AI usage; Pro and Business plans add higher usage limits, priority access, and more model choices for a monthly fee.",
      },
      {
        q: "What's the difference between Tab, Cmd+K, and Agent?",
        a: "Tab is inline autocomplete as you type, Cmd/Ctrl+K rewrites a selected piece of code from an instruction, and Agent is an autonomous mode that plans and executes larger multi-file tasks, including running terminal commands.",
      },
      {
        q: "Does Cursor send my code to train AI models?",
        a: "By default Cursor may use code to improve its product depending on plan and settings; Privacy Mode can be enabled to prevent code from being stored or used for training. Check current settings, as policies can change.",
      },
    ],
    bestPractices: [
      "Keep prompts scoped to specific files or functions rather than 'fix my app' to get precise, reviewable results.",
      "Always read the diff before accepting Agent changes, especially in security- or payment-sensitive code.",
      "Maintain a .cursor/rules file describing coding conventions, architecture, and libraries used in the project.",
      "Commit working code frequently so you can easily roll back an AI-generated change that goes wrong.",
    ],
    helpfulTips: [
      "Use '@Docs' in chat to pull in official documentation for a library instead of relying on the model's memory alone.",
      "Switch models per task — a fast model for quick completions, a stronger reasoning model for tricky refactors or debugging.",
    ],
  },
  {
    id: "ai-github-copilot",
    name: "GitHub Copilot",
    tagline: "An AI pair programmer built into your IDE for code completion, chat, and automated tasks.",
    icon: GitBranch,
    category: "coding",
    categoryLabel: "Coding",
    officialUrl: "https://github.com/features/copilot",
    downloadUrl: "https://github.com/copilot",
    downloadLabel: "Get Started",
    overview: {
      whatIsIt:
        "GitHub Copilot is an AI coding assistant that integrates directly into editors like VS Code, Visual Studio, JetBrains IDEs, and Neovim, as well as into GitHub.com itself. It suggests inline code completions as you type, powers a chat interface for asking questions about your code, and can take on larger autonomous tasks through Copilot Workspace and coding agent features. It's built and maintained by GitHub (Microsoft) in partnership with multiple AI model providers.",
      problems: [
        "Writing repetitive boilerplate, tests, or common patterns by hand",
        "Getting stuck on an unfamiliar API or language feature without leaving the editor to search docs",
        "Needing an explanation of unfamiliar or legacy code before safely modifying it",
        "Wanting help drafting pull request descriptions, commit messages, or code reviews without manual writing",
      ],
      mainFeatures: [
        "Inline code completions that suggest single lines or whole functions as you type",
        "Copilot Chat in the IDE and on GitHub.com for asking questions, generating code, and getting explanations with codebase context",
        "Slash commands like /fix, /tests, and /explain for common tasks directly in chat",
        "Copilot coding agent, which can be assigned a GitHub issue and open a pull request with a working solution",
        "Multi-model support (choice between different underlying models depending on plan) for chat and agent tasks",
        "Copilot code review and PR summary generation to speed up the review process",
      ],
    },
    setupGuide: {
      accountSteps: [
        "Create or sign in to a GitHub account at github.com if you don't already have one.",
        "Go to github.com/copilot (or Settings > Copilot on GitHub) and start the free trial or subscribe to Copilot Individual, Business, or Enterprise.",
        "Verify billing/plan selection; organization admins enable Copilot Business/Enterprise for members from the org's settings instead of individual signup.",
      ],
      installSteps: [
        "Open your IDE (VS Code, Visual Studio, JetBrains, or Neovim) and install the 'GitHub Copilot' and 'GitHub Copilot Chat' extensions from that IDE's marketplace.",
        "Restart the IDE if prompted so the extension activates fully.",
        "Confirm the Copilot icon appears in the status bar or sidebar, indicating the extension installed correctly.",
      ],
      loginSteps: [
        "Click the Copilot icon in the IDE status bar and choose 'Sign in to GitHub'.",
        "Complete authentication in the browser tab that opens, authorizing the IDE's GitHub Copilot extension.",
        "Return to the IDE — it will show 'Copilot: Ready' or similar once the sign-in completes and your subscription is verified.",
      ],
      initialConfig: [
        "Choose a default chat model in the IDE's Copilot settings if multiple models are available on your plan.",
        "Enable/disable specific languages or file types for suggestions under Copilot settings if certain suggestions are unwanted (e.g., in config files).",
        "Turn on Copilot code review or PR summaries in repository settings if you want automatic review comments on pull requests.",
        "Review the organization's content exclusion settings (Business/Enterprise) to keep certain files or repos out of Copilot's context.",
      ],
    },
    usage: {
      howToUse:
        "Start typing or write a comment describing what you want, and Copilot suggests completions inline that you accept with Tab or dismiss with Esc. For bigger tasks, open Copilot Chat, ask a question or use a slash command like /fix or /tests, and reference files with '#' to give it more context; assign well-scoped issues to the coding agent for it to open a draft pull request.",
      bestPrompts: [
        "// Function to paginate an array of objects into chunks of a given size",
        "/tests generate unit tests for the calculateDiscount function covering negative and zero inputs",
        "/fix explain why this async function isn't awaiting the database call and correct it",
        "Explain what this regular expression does and suggest a more readable alternative: #selectedCode",
      ],
      tips: [
        "Write a clear comment or function signature before the code you want — Copilot's suggestions improve a lot with explicit intent.",
        "Use Copilot Chat's '#file' and '#selection' references so answers are grounded in the actual code you're looking at, not guesses.",
        "Treat every suggestion as a draft — review and test generated code, especially for logic-heavy or security-sensitive sections.",
      ],
      commonUseCases: [
        "Speeding up writing boilerplate, CRUD endpoints, or repetitive test cases",
        "Getting quick explanations of unfamiliar code before making changes",
        "Drafting commit messages and pull request descriptions automatically",
        "Assigning small, well-defined GitHub issues to the coding agent to get a first-draft PR",
      ],
    },
    troubleshooting: [
      {
        issue: "Copilot shows 'Not signed in' or repeatedly asks to log in.",
        fix: "Sign out and back in via the Copilot status bar menu, making sure you authorize the IDE extension in the browser popup rather than closing it. If it persists, check that your GitHub account still has an active Copilot subscription/seat assigned.",
      },
      {
        issue: "Extension installed but no suggestions appear in the editor.",
        fix: "Confirm the Copilot extension is enabled for the specific file's language in IDE settings, and that the status bar icon shows it's active (not disabled or rate-limited). Restarting the IDE and checking for extension updates resolves most stuck states.",
      },
      {
        issue: "Suggestions or chat responses are slow or time out frequently.",
        fix: "This is often temporary service load; check GitHub's status page for reported incidents. Also verify your organization hasn't hit a usage cap (Business/Enterprise plans can have policy limits) that's throttling responses.",
      },
      {
        issue: "Copilot suggests code that doesn't match project conventions or is subtly wrong.",
        fix: "Give more context via comments, open related files in the same workspace so Copilot can reference them, and always test generated code before committing. For chat, reference specific files with '#' so answers use real project context instead of generic patterns.",
      },
    ],
    faqs: [
      {
        q: "Is GitHub Copilot free?",
        a: "There's a limited free tier for individual accounts with monthly completion and chat limits; full access requires Copilot Individual, Business, or Enterprise, which are paid plans (students and verified open-source maintainers may qualify for free access).",
      },
      {
        q: "Which IDEs support GitHub Copilot?",
        a: "Officially supported editors include VS Code, Visual Studio, JetBrains IDEs (IntelliJ, PyCharm, etc.), Neovim, and Xcode, plus Copilot Chat directly on GitHub.com and in the CLI.",
      },
      {
        q: "Does Copilot use my private code to train its models?",
        a: "By default, GitHub states that Copilot Individual doesn't use your code to train its underlying models for other users, and Business/Enterprise plans add additional data-handling controls — review GitHub's current Copilot Trust Center for specifics.",
      },
      {
        q: "What is Copilot's coding agent?",
        a: "It's a feature that can be assigned a GitHub issue directly, after which it works in the background to write code and open a pull request with a proposed solution for a human to review.",
      },
    ],
    bestPractices: [
      "Write descriptive comments and function names before code so suggestions match your actual intent.",
      "Review every suggestion before accepting, particularly around authentication, permissions, or financial calculations.",
      "Use repository-level custom instructions (copilot-instructions.md) to keep suggestions consistent with your team's conventions.",
      "Reserve the coding agent for small, clearly scoped issues rather than open-ended or architecturally complex ones.",
    ],
    helpfulTips: [
      "Use '/help' in Copilot Chat to see the current list of available slash commands for your IDE.",
      "Pair Copilot's suggestions with your existing linter and test suite — accept fast, but verify with the same rigor as human-written code.",
    ],
  },
];
