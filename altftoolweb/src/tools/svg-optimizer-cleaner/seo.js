const seo = {
  intro:
    "This tool strips the unsafe and editor-only parts out of an SVG file: it parses the markup with the browser's own XML parser, deletes every <script>, <metadata> and <foreignObject> node, removes all on* event-handler attributes, every Inkscape or Sodipodi editor attribute (including the xmlns:inkscape/xmlns:sodipodi namespace declarations on the root element), and any javascript: link hidden in an href or xlink:href, then hands back a re-serialised file. It exists because an SVG is executable markup, not just a picture — pasting a downloaded icon straight into a page can carry JavaScript with it. The report shows the original and cleaned character counts and confirms how many script elements remain, which should be zero.",
  useCases: [
    "You downloaded an icon from a stock site and want the embedded scripting and tracking markup gone before you inline it into a page where it would run with your site's privileges",
    "Illustrator or Inkscape exports are bloating your repo with editor-only namespaced attributes and layer metadata, and you want a version that renders identically without them",
    "You are accepting user-uploaded SVG avatars or logos and want to see what a file actually contains — event handlers, foreignObject blocks, embedded metadata — before deciding whether it is safe to serve",
  ],
  benefits: [
    ["Removes the executable surface, not just whitespace", "Script nodes, foreignObject blocks and every attribute starting with \"on\" are deleted, which is what makes a hostile SVG dangerous when inlined."],
    ["Strips editor namespaces specifically", "Inkscape and Sodipodi attributes — including the xmlns:inkscape/xmlns:sodipodi namespace declarations on the root <svg> — are targeted by namespace prefix, so drawing-app leftovers go while genuine SVG attributes are untouched."],
    ["Shows the before and after size", "The result reports the original character count, the cleaned count and the difference, so you can see exactly how much was editor cruft."],
  ],
  faqs: [
    [
      "Is an SVG file actually a security risk?",
      "Yes, when it is inlined into a page or opened directly. SVG is XML that can carry <script> elements, on-event attributes such as onload, <foreignObject> blocks containing arbitrary HTML, and javascript: links hidden in an href or xlink:href — all of which execute in your page's origin. This cleaner removes all four.",
    ],
    [
      "Does this shrink my file the way SVGO does?",
      "Not in the same way. It removes scripts, metadata, foreignObject content and editor attributes, but it does not re-round path coordinates, merge paths, collapse groups or minify numeric precision the way a dedicated optimiser like SVGO does — expect the savings to come from removed markup, not from geometry compression.",
    ],
    [
      "Will the cleaned image still look the same?",
      "In almost every case yes, because only non-visual nodes and editor bookkeeping are removed. The exception is an SVG that relied on <foreignObject> to render HTML content inside the graphic, or on scripting to draw or animate — those parts will be missing, so compare the cleaned file against the original before shipping it.",
    ],
    [
      "Can I clean several files at once?",
      "One file is processed per run, and the cleaned copy downloads automatically. For a batch, run each file through in turn and check the reported script count is zero for every one.",
    ],
  ],
};

export default seo;
