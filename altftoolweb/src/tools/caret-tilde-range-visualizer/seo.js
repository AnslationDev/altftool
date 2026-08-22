const seo = {
  title: "Caret vs Tilde: npm Ranges on a Number Line",
  metaDescription:
    "See what ^ and ~ really allow: the npm desugaring drawn as a number line of allowed and blocked versions, with the stricter 0.x caret rules.",
  steps: [
    "Pick the Operator (^ or ~) and type a 'Base version', or tap a preset — 1.2.3, 0.2.3, 0.0.3 or 2.0.0.",
    "Read the 'Allowed window' comparators and the 'Version number line', which marks each neighbouring version allowed or blocked with the base version highlighted.",
    "Check 'Lowest allowed version' (inclusive) and 'First blocked version' (the exclusive bound), then press 'Copy result' for the range, comparators and rule.",
  ],
  intro:
    "This visualizer draws the allowed update window of a caret (^) or tilde (~) semver range on a number line, marking each neighbouring version as allowed or blocked. It applies the node-semver desugaring npm uses: ^1.2.3 means >=1.2.3 <2.0.0, ~1.2.3 means >=1.2.3 <1.3.0, and the caret tightens on 0.x versions (^0.2.3 stops at 0.3.0, ^0.0.3 allows only itself). Developers reviewing dependency ranges see at a glance exactly where the window opens and where it slams shut.",
  useCases: [
    "Showing a code reviewer why ~1.2.3 blocks 1.3.0 while ^1.2.3 allows it, with both windows drawn side by side",
    "Checking how much update freedom ^0.2.3 really gives before trusting automatic installs of a 0.x dependency",
    "Teaching new developers the left-most-non-zero-digit rule of the caret using concrete allowed/blocked versions",
  ],
  benefits: [
    ["Visual number line", "Neighbouring versions are plotted in order and coloured allowed or blocked, with the base version highlighted."],
    ["Exact npm semantics", "Windows come from the node-semver caret and tilde rules, including the stricter 0.x and 0.0.x cases."],
    ["Boundary clarity", "Always shows the lowest allowed version (inclusive) and the first blocked version (the exclusive bound)."],
  ],
  faqs: [
    [
      "What versions does ^1.2.3 allow?",
      "Everything from 1.2.3 up to but not including 2.0.0 — so 1.2.4, 1.3.0 and 1.9.9 are allowed while 2.0.0 is blocked. The caret keeps the left-most non-zero digit (here the major) fixed and lets everything to its right float.",
    ],
    [
      "Why is ^0.2.3 so much stricter than ^1.2.3?",
      "Because on 0.x versions the left-most non-zero digit is the minor, so ^0.2.3 desugars to >=0.2.3 <0.3.0 — patch updates only. This matches SemVer's warning that 0.x APIs may break at any time, so npm refuses to auto-install 0.3.0. In the extreme case ^0.0.3 allows only 0.0.3 itself.",
    ],
    [
      "When should I use tilde instead of caret?",
      "Use ~ when you want only bug-fix (patch) updates: ~1.2.3 allows up to 1.2.x but blocks 1.3.0, whereas ^1.2.3 accepts every 1.x from 1.2.3 up. Teams often pick tilde for risk-sensitive production dependencies and caret (npm's default on install) for everything else.",
    ],
    [
      "Is the upper bound of a caret or tilde range inclusive?",
      "No — the upper bound is always exclusive. ^1.2.3 means strictly below 2.0.0, so 2.0.0 itself never matches; the same applies to 1.3.0 for ~1.2.3. Only the lower bound, the version you wrote, is inclusive.",
    ],
  ],
};

export default seo;
