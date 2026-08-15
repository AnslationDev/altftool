const seo = {
  title: "Developer Prompt Pack: 10 Fill-in-the-Blank",
  metaDescription:
    "Templates for ranked-hypothesis debugging, senior diff review, security passes, test design, READMEs, ADRs and incremental refactor plans.",
  steps: [
    "Narrow the list with Search prompts or the Category select, then pick a prompt such as \"Review this diff like a senior engineer\".",
    "Fill in the blanks for that prompt's variables, or press Use example values to populate them all at once.",
    "Press Copy prompt to take the assembled text — any field left blank stays visible as a {{placeholder}} in what you copied.",
  ],
  intro:
    "The Developer Prompt Pack is a library of 10 fill-in-the-blank AI prompts for everyday engineering work: debugging by ranked hypotheses, stack-trace explanation, senior-level diff review, security passes, test design, flaky-test reproduction, READMEs, architecture decision records, incremental refactor plans and API design review. Each prompt encodes the working method — enumerate causes before guessing, list test cases before writing them, record rejected options in an ADR — so the model's answer arrives in a form you can act on. Fill the blanks in your browser and copy the finished prompt into any assistant.",
  useCases: [
    "Turning 'checkout 500s for 2 percent of requests' into five ranked hypotheses, each with the exact log filter or query that confirms or eliminates it.",
    "Getting a diff reviewed in three severity tiers — blocking, should-fix, nits — with a concrete failing scenario attached to every blocking comment.",
    "Converting a test that fails one run in eight on CI into a deterministic local reproduction, with the flake classified before any fix is proposed.",
  ],
  benefits: [
    ["Method encoded, not vibes", "Prompts force hypothesis ranking, case tables before test code, and severity tiers in reviews — the habits that separate senior output from plausible prose."],
    ["Anti-hallucination rules", "READMEs may only use commands you supplied, security passes must list what was checked and found clean, and ambiguity comes back as questions, not silent guesses."],
    ["Runs locally", "Prompt assembly happens in the browser; no account, no API key and nothing you paste leaves the page."],
  ],
  faqs: [
    [
      "How do I get an AI to actually help with debugging?",
      "Give it the exact symptom, the stack, what changed around onset, and what you have already ruled out — then ask for ranked hypotheses with a cheap test for each rather than a single answer. The debugging prompt here also asks for the one test that splits the hypothesis space roughly in half, which is the fastest first move.",
    ],
    [
      "Is AI code review a replacement for human review?",
      "No — it is a strong first pass. It reliably catches missing error handling, boundary mistakes and untested paths, but it does not know your system's history or intent. The review prompt mitigates this by requiring the PR's stated intent and your house rules as input, and by separating blocking defects from taste so a human reviewer's time goes where it matters.",
    ],
    [
      "Why do my AI-generated tests miss real bugs?",
      "Because generation usually starts from the implementation, so the tests confirm what the code does rather than what it should do. The test prompt makes the model list cases as a table first — boundaries from the types, the stated invariant as a property, and error contracts — and flags the three cases most likely to catch a regression before a line of test code is written.",
    ],
    [
      "Is it safe to paste company code into an AI chatbot?",
      "That depends on your employer's policy and the assistant's data-handling terms, not on the tool — check both before pasting proprietary code, and strip secrets, keys and customer data regardless. This pack itself runs entirely in your browser: filling the template sends nothing anywhere until you paste the result into the assistant you choose.",
    ],
  ],
};

export default seo;
