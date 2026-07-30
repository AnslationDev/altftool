const seo = {
  intro:
    "Tool-Call Argument Policy Linter checks a log of AI agent tool calls against a JSON policy with seven rule types — allowedTools, deniedTools, allowedPathPrefixes, allowedDomains, allowedRecipients, numericLimits and confirmation — and reports each call as a pass, a warning or a violation without executing anything. It is for engineers reviewing what an agent actually tried to do, from an OpenAI-style function-call trace or a JSONL transcript. Findings are labelled by rule, from tool-denied and path-not-allowed through to confirmation-required, and can be exported as a counts-only report that carries no tool names, paths, domains or recipients.",
  useCases: [
    "Reviewing an agent transcript after an incident to find the exact call that wrote outside /workspace/project, with the argument path of the offending value shown next to the finding.",
    "Testing a draft guardrail policy before you enforce it: run last week's real tool calls through it and see how many would have been blocked, rather than discovering the false positives in production.",
    "Proving to a security reviewer that no call sent mail outside your domain — the recipient allowlist accepts an @trusted.example entry that matches by domain suffix as well as full-address and wildcard rules.",
  ],
  benefits: [
    [
      "Understands the call shapes agents actually emit",
      "It reads a JSON array, an object with a calls/toolCalls/tool_calls/actions/entries array, a single object, or JSONL, and unpacks OpenAI-style function.arguments even when they arrive as a JSON-encoded string.",
    ],
    [
      "Paths are canonicalised, not string-matched",
      "Backslashes, drive letters, . and .. segments are resolved before the prefix comparison, so docs/../etc/passwd does not slip past an allowedPathPrefixes rule.",
    ],
    [
      "Tells you where its coverage stopped",
      "Unparseable arguments, unreadable domains and numeric fields it could not evaluate are raised as explicit warnings, and hitting the traversal depth or entry limit produces a coverage-limit finding rather than a silent pass.",
    ],
  ],
  faqs: [
    [
      "What does the linter actually check?",
      "Twelve rule outcomes across seven policy keys: tool allow and deny lists with * wildcards, filesystem path prefixes, domain allowlists supporting *.example.com suffixes, recipient allowlists, per-field numeric maximums compared on absolute value, and required confirmation flags. Argument keys are matched by normalised name, so filePath, file_path and \"file path\" are all treated as a path field.",
    ],
    [
      "How large a log can it handle?",
      "Up to 500 calls per run, traversing arguments to a depth of 10 and 5,000 entries per call. Anything beyond those bounds is reported — extra calls trigger a truncation warning and deep structures produce a coverage-limit finding — so partial coverage is never mistaken for a clean result.",
    ],
    [
      "What counts as a valid confirmation flag?",
      "A key listed in confirmation.acceptedFlags — defaulting to \"confirmed\" — set to an affirmative value: boolean true, the number 1, or the strings approved, confirmed, true or yes. Anything else, including false or a missing flag, raises a confirmation-required violation on tools listed in requiredForTools.",
    ],
    [
      "Does a clean lint mean the agent is safe?",
      "No. This is deterministic static analysis of a text log: it does not execute tools, prove runtime enforcement, resolve symlinks or environment variables, follow redirects or inspect DNS, or convert currencies and units on numeric limits. It also only sees the tool names and argument keys it recognises, so treat it as one check alongside real runtime enforcement.",
    ],
  ],
};

export default seo;
