const seo = {
  title: "Figma Variable Naming Helper: Scheme, Tokens & Linter",
  metaDescription:
    "Set separator, case and tier rules for Figma variables, generate a starter token set, and lint pasted names for mixed casing and baked-in units.",
  steps: [
    "Define the scheme with the Prefix, Collection, Separator and Case fields plus the Include primitive/semantic tier checkbox — the rule is echoed back as plain sentences.",
    "Press Copy generated names to take the rendered starter token set into your Figma file or token pipeline.",
    "Paste current variables into Lint existing names to get the clean/errors/warnings count against your scheme; Reset scheme restores the defaults.",
  ],
  intro:
    "A variable naming scheme is the set of rules that decide how design tokens are split into segments, how those segments are joined, and how words inside a segment are cased. This helper turns those three decisions into a written rule, renders a full starter token set in that scheme, and lints names you already have against it — flagging stray separators, mixed casing, units baked into names and duplicates. Useful for design system owners aligning a Figma file with the token names their codebase expects.",
  useCases: [
    "Agree a house style before a token library grows past a few hundred variables and renaming becomes expensive.",
    "Check whether an inherited file follows one scheme or three, by pasting the existing style list into the linter.",
    "Translate a slash-grouped Figma structure into the dot notation a token pipeline or platform theme file expects.",
    "Spot names that encode a measurement, like a spacing token called 16px, before the value changes and the name lies.",
  ],
  benefits: [
    ["Rules written down", "The scheme is output as plain sentences you can paste into the file description or a README."],
    ["Primitive and semantic split", "Starter names cover both raw ramp steps and the role-based names components should reference."],
    ["Linter with suggestions", "Every flagged name comes with the corrected version under your chosen scheme."],
  ],
  faqs: [
    [
      "How should I name variables in Figma?",
      "Use a small number of ordered segments joined by a forward slash — for example color/background/canvas — because Figma renders each slash as a folder in the variables and styles panels. Keep the depth between two and five segments, and describe the role rather than the value so the name survives a palette change.",
    ],
    [
      "What is the difference between primitive and semantic tokens?",
      "A primitive names a raw value in a ramp, such as color/teal/500 or space/400. A semantic token names the job that value does, such as color/action/primary/rest. Components should reference semantic tokens so a rebrand only edits the layer in between.",
    ],
    [
      "Should the token name contain the value or the unit?",
      "No. A token called spacing/16px has to be renamed the moment the value changes to 12px, and every reference breaks with it. Name the step or the role — spacing/400 or spacing/inset-tight — and let the value live in the variable.",
    ],
    [
      "Does this tool connect to my Figma file?",
      "No. It runs entirely in your browser on names you paste in, so nothing leaves the page. Apply the suggested names manually or through your own plugin or token pipeline.",
    ],
  ],
};

export default seo;
