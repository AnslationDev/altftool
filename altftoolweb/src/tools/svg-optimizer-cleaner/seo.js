const seo = {
  title: "SVG Cleaner: Strip Scripts, Metadata & Cruft",
  metaDescription:
    "Parse an SVG as XML in your browser and strip scripts, event handlers, foreignObject, CSS, editor namespaces and remote refs before downloading.",
  steps: [
    "Select your file with the \"Local file(s)\" picker — one SVG is processed per run, and if you select several only the first is used.",
    "Press \"Run local workbench\"; the file is parsed as SVG XML in the page, files with DOCTYPE or ENTITY declarations are refused, and script, style, foreignObject, animate, embed and metadata elements plus unsafe attributes and non-fragment references are removed.",
    "The cleaned copy downloads as altftool-clean.svg and the \"Verified result\" table reports Original characters, Cleaned characters, \"Active elements removed\" and \"Unsafe attributes removed\".",
  ],
  intro:
    "This local cleaner parses an SVG as XML, rejects malformed files and entity declarations, then removes scripts, CSS, foreignObject content, animation elements, event handlers, editor metadata and every non-fragment URL before downloading a re-serialised copy. SVG is executable markup rather than a passive picture, so the conservative policy intentionally removes features that could change attributes later or load remote content. Treat the result as defence in depth: keep untrusted uploads isolated and serve them as downloads instead of relying on any browser cleaner as your only security boundary.",
  useCases: [
    "You downloaded an icon from a stock site and want the embedded scripting and tracking markup gone before you inline it into a page where it would run with your site's privileges",
    "Illustrator or Inkscape exports are bloating your repo with editor-only namespaced attributes and layer metadata, and you want a version that renders identically without them",
    "You are accepting user-uploaded SVG avatars or logos and want to see what a file actually contains — event handlers, foreignObject blocks, embedded metadata — before deciding whether it is safe to serve",
  ],
  benefits: [
    ["Uses a conservative active-content policy", "Scripts, CSS, animation, foreignObject blocks, event handlers and non-fragment references are removed instead of trying to preserve executable SVG features."],
    ["Strips editor namespaces specifically", "Inkscape and Sodipodi attributes — including the xmlns:inkscape/xmlns:sodipodi namespace declarations on the root <svg> — are targeted by namespace prefix, so drawing-app leftovers go while genuine SVG attributes are untouched."],
    ["Shows the before and after size", "The result reports the original character count, the cleaned count and the difference, so you can see exactly how much was editor cruft."],
  ],
  faqs: [
    [
      "Is an SVG file actually a security risk?",
      "Yes, especially when it is inlined into a page or opened directly. SVG can contain scripts, event attributes, CSS, animation and remote references. This tool removes those common active surfaces, but an isolated origin and attachment-style delivery are still the safer boundary for untrusted uploads.",
    ],
    [
      "Does this shrink my file the way SVGO does?",
      "Not in the same way. It removes scripts, metadata, foreignObject content and editor attributes, but it does not re-round path coordinates, merge paths, collapse groups or minify numeric precision the way a dedicated optimiser like SVGO does — expect the savings to come from removed markup, not from geometry compression.",
    ],
    [
      "Will the cleaned image still look the same?",
      "Simple paths and shapes should remain, but CSS, animation, remote images, external links, foreignObject content and scripts are deliberately removed. Any graphic that relied on those features can look different, so compare the cleaned download with the original before use.",
    ],
    [
      "Can I clean several files at once?",
      "One file is processed per run, and the cleaned copy downloads automatically. For a batch, run each file through in turn and check the reported script count is zero for every one.",
    ],
  ],
};

export default seo;
