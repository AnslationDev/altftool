const seo = {
  title: "Will Your Logo Read at 16px? Favicon Legibility",
  metaDescription:
    "Scales your thinnest stroke and cap height to 16, 32, 48 and 180px, grades each, and downscales the real file in-browser to measure detail loss.",
  steps: [
    "Enter Artwork width (px), Artwork height (px), Thinnest stroke or gap (px) and Smallest cap height (px, 0 if no text).",
    "Optionally open the logo — PNG, JPEG, WebP or SVG — to rasterise real downscaled previews in your browser; the file is never uploaded.",
    "Read Smallest size that still reads plus the Stroke, Text, Detail kept and Verdict columns for 16, 32, 48 and 180px, then press Copy result.",
  ],
  intro:
    "The Logo Favicon Legibility Checker converts your artwork's thinnest stroke and shortest letterform into the number of device pixels they occupy once the mark is contained inside a 16, 32, 48 or 180 pixel square, and grades each size against the point where a line stops being drawable and a letter stops being distinguishable. Load the actual file and it also rasterises real downscaled previews and measures how much edge detail survived compared with a 256 pixel reference render. Everything happens in the browser, so the logo is never uploaded.",
  useCases: [
    "Find out whether a hairline outline in a 512px logo still exists at the 16px browser-tab size before you generate the .ico.",
    "Decide whether the wordmark has to become a monogram for the favicon by checking the cap height at 16 and 32 pixels.",
    "Work out the minimum stroke weight to redraw at so a simplified small-size variant reads cleanly.",
    "Compare two logo revisions side by side at true favicon size and magnified, to see which one holds its shape.",
  ],
  benefits: [
    ["Derived, not guessed", "Scales your real measurements by size divided by the artwork's long edge instead of quoting a rule of thumb."],
    ["Measures actual pixels", "Downscales the uploaded file and compares edge energy with a 256 pixel reference to quantify detail loss."],
    ["Tells you the fix", "Reports the stroke weight and cap height the artwork needs for a clean render at the smallest size tested."],
  ],
  faqs: [
    [
      "What sizes does a favicon actually need?",
      "16, 32, 48 and 180 pixels cover the common cases: 16 for a browser tab at 1x, 32 for a tab on a 2x display and for Windows shortcuts, 48 for the Windows site icon inside a multi-resolution .ico, and 180 for the apple-touch-icon iOS uses on the home screen.",
    ],
    [
      "How thick does a logo stroke need to be to survive a 16px favicon?",
      "At least one device pixel to exist and about 1.5 to look solid. On a 512 pixel artwork scaled to 16 pixels the scale factor is 1/32, so a stroke needs roughly 48 pixels in the source file to land at 1.5 pixels in the favicon.",
    ],
    [
      "Can a favicon contain text?",
      "Rarely. Letterforms lose the features that tell them apart below about 7 pixels of cap height, and a 16 pixel favicon only gives you 16 pixels of total height. In practice that means a single-letter monogram or a symbol, with the wordmark reserved for the 180 pixel touch icon.",
    ],
    [
      "Why does my logo look blurry rather than just smaller?",
      "Downscaling averages neighbouring pixels, so adjacent thin shapes merge and edge contrast collapses. This tool quantifies that by comparing edge energy at each size with a 256 pixel reference render; keeping under about a third of the original edge detail is the point at which a mark reads as a smudge.",
    ],
  ],
};

export default seo;
