const seo = {
  intro:
    "The Regex Replace Preview Tool shows the exact result of a regular-expression find and replace before you apply it to real data, expanding $1–$99, $&, $`, $', $<name> and $$ references per the ECMA-262 GetSubstitution algorithm that JavaScript's String.replace implements. Alongside the full output it lists every match with its position and what it becomes — the per-occurrence detail a one-shot replace never shows. Everything runs locally in the browser; no text leaves the page.",
  useCases: [
    "A developer rewriting 2026-07-26 style dates to 26/07/2026 across a file using named groups before running the same regex in an editor",
    "A data analyst previewing a capture-group reshuffle like $2, $1 on a sample of CSV lines before applying it to the full dataset",
    "An engineer debugging why $10 in a replacement string inserts group 1 followed by a literal 0 instead of group 10",
  ],
  benefits: [
    ["Per-match breakdown", "Every occurrence is listed with its index, matched text and expanded replacement (the first 100 rows — the full output above always reflects every match) — not just the final output."],
    ["Real JS semantics", "Replacement references expand exactly as ECMA-262 specifies, including literal fallback for out-of-range groups."],
    ["Guards against runaway patterns", "Text is capped at 100,000 characters and matches at 5,000, and common catastrophic-backtracking shapes like (a+)+ or (a|a)+ are detected and refused before they run, instead of freezing the tab."],
  ],
  faqs: [
    [
      "How do I use capture groups in a regex replacement?",
      "Wrap the part you want to keep in parentheses in the pattern, then reference it as $1, $2 and so on in the replacement — for example, find (\\w+) (\\w+) and replace with $2 $1 to swap two words. Named groups work too: (?<year>\\d{4}) in the pattern becomes $<year> in the replacement.",
    ],
    [
      "What does $& mean in a regex replacement string?",
      "$& inserts the entire matched text, letting you wrap or decorate matches without capture groups — replacing \\d+ with [$&] turns 42 into [42]. Its siblings $` and $' insert everything before and after the match respectively, and $$ produces a literal dollar sign.",
    ],
    [
      "Why does $10 in my replacement not use capture group 10?",
      "JavaScript tries the two-digit reference first: $10 means group 10 only if the pattern actually has 10 or more capture groups; otherwise it falls back to group 1 followed by a literal 0, and if even group 1 does not exist the whole token stays literal. This tool shows the expansion per match, which makes that behaviour visible immediately.",
    ],
    [
      "Do these replacement references work in sed, Python or other tools?",
      "Not identically — the $1 syntax previewed here is JavaScript (also used by VS Code's search-and-replace), while sed and Perl use \\1, and Python's re.sub uses \\1 or \\g<name>. The matching logic usually transfers, so preview the transformation here and translate only the replacement token syntax for your target tool.",
    ],
  ],
};

export default seo;
