const seo = {
  title: "Coding Assistant System Prompt Builder",
  metaDescription:
    "Assemble a system prompt from your stack, style guide, test policy and hard rules - ordered role, context, rules, output - with a live token estimate.",
  steps: [
    "Fill the Stack fields - Primary language (required), Framework, Package manager, Test framework, Style guide - and set Answer length, Test policy and Code output format under Behaviour.",
    "Tick Review checklist and Hard rules options such as 'Never invent APIs or packages', and set the Token budget for the system prompt.",
    "Read the assembled prompt under 'Your system prompt' with its estimated token range and 'Gaps worth closing' warnings, then click Copy prompt.",
  ],
  intro:
    "This builder assembles a production-grade system prompt for a coding assistant from your stack, style guide, test policy, review checklist and refusal rules, ordered role → context → rules → output format. It also estimates the prompt's token cost using the roughly-4-characters-per-token rule of thumb, because a system prompt is paid on every single request. It is for developers and teams standardising how an AI assistant behaves inside their codebase.",
  useCases: [
    "A team lead writing one shared system prompt so every developer's AI assistant follows the same style guide, test policy and package manager",
    "A developer configuring an assistant for a strict TypeScript monorepo that must never suggest npm commands in a pnpm workspace",
    "A platform engineer adding hard refusal rules — no invented APIs, no secrets, no destructive commands — before rolling an assistant out internally",
  ],
  benefits: [
    ["Proven section order", "Identity first, then stack and context, then hard rules and output format — constraints come after the background needed to apply them."],
    ["Token cost visible", "A live 4-chars-per-token estimate warns when the prompt exceeds your budget, since every request pays for it."],
    ["Gap warnings", "Flags missing pieces — no test framework named, no refusal rules, no style guide — before you ship the prompt."],
  ],
  faqs: [
    [
      "What should a coding assistant system prompt include?",
      "Five things: the assistant's role and seniority, the exact stack (language, framework, package manager, test framework), project context, hard rules it must never break, and the output format for code. The most common omissions are naming the package manager — without it assistants mix npm and pnpm commands — and stating whether answers should be diffs, snippets or full files.",
    ],
    [
      "How long should a system prompt be?",
      "As short as it can be while still constraining behaviour — many effective coding-assistant prompts land between 200 and 900 tokens. The system prompt is prepended to every request, so a 2,000-token prompt costs 2,000 input tokens per message. This tool estimates size using roughly 4 characters per token for prose and warns when you cross your budget.",
    ],
    [
      "Why does the order of sections in a system prompt matter?",
      "Models apply rules better when they already have the context those rules refer to, so the reliable layout is identity first, then stack and project context, then hard rules, then output format. Burying a critical refusal rule in the middle of stack details makes it easier for the model to drop under pressure from a long conversation.",
    ],
    [
      "How do I stop an AI coding assistant from inventing APIs or packages?",
      "State it as an explicit refusal rule: never reference a library, flag or API you are not sure exists, and say what you would check instead. This builder ships that rule as a one-click option alongside others like never printing secrets and never suggesting destructive commands without confirmation. No prompt eliminates hallucination entirely, so keep code review in the loop.",
    ],
  ],
};

export default seo;
