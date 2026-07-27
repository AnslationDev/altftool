const seo = {
  intro:
    "This converter rasterises SVG markup into a PNG, JPEG or WebP bitmap by drawing it onto an HTML canvas at a scale factor you choose. It reads the intrinsic size from the width and height attributes, falls back to the viewBox and then to the CSS replaced-element default of 300×150, and refuses any output above the 16,777,216-pixel canvas limit that Safari on iOS enforces. Everything happens in the browser, so the artwork is never uploaded.",
  useCases: [
    "Turn a 240×120 logo SVG into a 4× PNG for a platform that will not accept vector uploads",
    "Export an icon at exactly 512×512 for an app store listing by setting the scale from the intrinsic size",
    "Flatten an SVG onto a white background for a JPEG where transparency would come out black",
  ],
  benefits: [
    ["Runs locally", "Canvas rasterising happens in your tab — no upload, no server, no queue."],
    ["Predictable dimensions", "The tool shows the intrinsic size, where it came from, and the exact output pixels before you export."],
    ["Scripts stripped", "Any <script> block or on* handler in the pasted markup is removed before the SVG is drawn."],
  ],
  faqs: [
    [
      "What resolution should I export at?",
      "Multiply the intrinsic size by the scale you need. A 240×120 SVG at 4× gives 960×480. For screen use, 2× covers most high-DPI displays; for print at 300 dpi, take the physical size in inches and multiply by 300 — a 3-inch-wide logo needs 900 pixels of width.",
    ],
    [
      "Why does my exported image come out blank or huge?",
      "Two common causes. If the SVG has no width and height attributes and no viewBox, browsers fall back to 300×150 px, so the export is small and may crop. And if the output exceeds 16,777,216 pixels — 4096×4096 — Safari on iOS will not allocate the canvas, so this tool blocks that size and asks you to lower the scale.",
    ],
    [
      "Why is my text rendering in the wrong font?",
      "Canvas rasterising uses fonts installed on the machine doing the rendering. A web font referenced by URL will not load into the image, and an external reference also taints the canvas so the export fails outright. Convert text to paths in your vector editor before pasting, and the shapes come out exactly as designed.",
    ],
    [
      "Should I choose PNG, JPEG or WebP?",
      "PNG if the artwork has transparency or flat colour and sharp edges, which is almost all logos and icons. JPEG only for photographic content, and note it has no alpha channel — this tool fills the background white or black instead. WebP gives smaller files than both at similar quality and is supported by every current browser.",
    ],
  ],
};

export default seo;
