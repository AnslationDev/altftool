const seo = {
  intro:
    "The Empty State Copy Generator produces a heading, supporting line and button label for eleven interface states - first run, no search results, filtered to nothing, all clear, offline, server error, permission denied, not found, form validation, first load and load more - in four tones. Wording is generated from fixed templates with your own noun substituted, so the same inputs always give the same result and nothing is sent to a model. Every draft is then linted against practical limits: headings under 50 characters, body under 140, button labels of three words or fewer, no blame directed at the reader, and no apology standing in for the fix.",
  useCases: [
    "Fill in a design file's empty states quickly with wording that already fits the space instead of lorem ipsum.",
    "Rewrite a 500 error page that currently says only \"Something went wrong\" with no next step.",
    "Compare the same empty state in plain, friendly, formal and playful voices before picking a product tone.",
    "Check an existing screen's heading and button label against the length limits that keep them on one line on a phone.",
  ],
  benefits: [
    ["Deterministic, not generated", "Fixed templates mean the same state, tone and noun always produce identical copy - no model call, no variation between runs."],
    ["Correct plurals", "Applies the real English rules for -s, -es, consonant plus y, -f and -fe, plus a table of irregulars like person and status."],
    ["Lints as well as writes", "Scores the draft out of 100 against length, blame, apology and weak-button-label rules."],
  ],
  faqs: [
    [
      "What should an empty state say?",
      "Three things: what belongs in this space, why it is empty right now, and one action to fill it. An empty state that only says \"No items\" wastes the most valuable moment for teaching someone what a screen is for.",
    ],
    [
      "How long should an empty state heading be?",
      "Under about 50 characters. Past that it wraps to a second line on a 375 pixel phone screen and stops being scannable. Keep the supporting line under roughly 140 characters, which is two comfortable lines at the same width.",
    ],
    [
      "Should an error message apologise?",
      "No. Words like \"oops\", \"whoops\" and \"sorry\" spend the one line that should carry the explanation and the fix. State what happened, confirm whether anything was lost, and give a specific next step. Never phrase the message so it blames the reader.",
    ],
    [
      "What makes a good button label on an empty state?",
      "A verb plus the object, in three words or fewer: \"Create invoice\", \"Reset filters\", \"Request access\". Labels like \"OK\", \"Submit\" or \"Continue\" do not say what will happen, so the reader has to guess before clicking.",
    ],
  ],
};

export default seo;
