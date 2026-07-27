const seo = {
  intro:
    "The Regex Prompt Builder turns lists of must-match and must-not-match example strings into a regex-generation prompt that pins the target flavour — JavaScript, PCRE2, Python re, RE2/Go or POSIX ERE — and demands a verified test table for every example. It validates your examples first, rejecting any string that appears in both lists (no pattern can match and not match the same input), and writes each flavour's documented limitations, like RE2's lack of lookaround and backreferences, into the prompt.",
  useCases: [
    "A developer pastes three valid and three invalid vehicle-number formats and gets a prompt whose answer must include a row-by-row match table, not just a pattern.",
    "A Go engineer targets the RE2 flavour and the prompt forbids lookahead and backreferences outright, so the returned pattern actually compiles in regexp.MustCompile.",
    "A data engineer cleaning log lines lists edge cases that previously broke their pattern as must-not-match examples, turning past failures into permanent test cases.",
  ],
  benefits: [
    [
      "Examples become tests",
      "Every string you list becomes a row the model must verify the regex against before answering, which is the single biggest accuracy lever for AI-written regex.",
    ],
    [
      "Flavour-correct patterns",
      "The prompt states the target engine's real limitations — fixed-width lookbehind in Python, no \\d in POSIX ERE, no lookaround in RE2 — so the pattern runs where you need it.",
    ],
    [
      "Conflict detection before you ask",
      "If the same string appears in both lists, the tool blocks the prompt and names the conflicting string instead of letting you request the impossible.",
    ],
  ],
  faqs: [
    [
      "How do I get AI to write a correct regex?",
      "Give it concrete examples, not just a description: strings the pattern must match, strings it must not, the exact flavour, and a requirement to verify the pattern against every example in a test table before answering. This tool assembles precisely that prompt — descriptions alone routinely produce patterns that fail on real input.",
    ],
    [
      "What is the difference between regex flavours like PCRE, RE2 and POSIX?",
      "They support different features: PCRE2 has lookaround, backreferences and atomic groups; RE2 (used by Go's regexp) guarantees linear-time matching and therefore supports neither lookaround nor backreferences; POSIX ERE lacks shorthand classes like \\d and lazy quantifiers; JavaScript added lookbehind only in ES2018. A pattern written for one flavour can fail or behave differently in another, which is why the generated prompt names the flavour and its rules.",
    ],
    [
      "What is catastrophic backtracking in regex?",
      "It is exponential runtime caused by nested unbounded quantifiers such as (a+)+ applied to a non-matching input, and it can hang an application — the classic regex denial-of-service. The generated prompt explicitly forbids such constructions and RE2-flavour patterns are immune by design.",
    ],
    [
      "How many examples should I give for a regex?",
      "At least three must-match examples covering your format's variations, and two or three must-not-match examples that are near misses — strings a sloppy pattern would wrongly accept. Near-miss negatives constrain the pattern far more than obviously wrong strings; this tool accepts up to 50 of each.",
    ],
  ],
};

export default seo;
