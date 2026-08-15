const seo = {
  title: "Variable Font Axis Tester: fvar Ranges and @font-face",
  metaDescription:
    "Open a .ttf or .otf and read its fvar table: every axis with its real min, default and max, every named instance, and the @font-face rule they imply.",
  steps: [
    "Press \"Choose font\" and pick a .ttf or .otf — WOFF and WOFF2 are zlib and Brotli containers a page script cannot unpack.",
    "Drag the per-axis sliders, or tap a named instance such as Condensed Bold to jump every slider to its coordinates; the sample renders in the uploaded font itself.",
    "Read the axes table — tag, name, min, default, max and the CSS property each drives — then press \"Copy CSS\" for the @font-face rule.",
  ],
  intro:
    "The Variable Font Axis Explorer opens a .ttf or .otf and reads its fvar table byte by byte — the OpenType table that declares what a variable font can actually do. It lists every axis with its four-character tag, its minimum, its default and its maximum in the font's own fixed-point coordinates, resolves the axis and instance labels out of the name table, and shows every named instance the foundry shipped with its exact coordinates. Registered axes are matched against the OpenType axis registry so you can see which CSS property drives each one: wght to font-weight, wdth to font-stretch, slnt to font-style: oblique, opsz to font-optical-sizing. Custom axes are named as such, because only font-variation-settings can move them. The sliders render the real uploaded font through the browser's FontFace API, and the exported @font-face rule carries the true ranges rather than a guess. The file is read in the page and never uploaded.",
  useCases: [
    "Find out whether a font you were sent really varies, or is a static instance someone renamed — a font with no fvar table is rejected with the list of tables it does contain.",
    "Write an @font-face rule with the correct font-weight and font-stretch ranges instead of guessing 100 900 and hoping.",
    "Check a custom axis a foundry mentioned in a PDF but did not document, including its range and whether it is flagged hidden.",
    "Confirm the named instances line up with the style menu you expect before shipping the font to a client's CMS.",
  ],
  benefits: [
    [
      "Reads the binary, not a database",
      "fvar, name, head and OS/2 are decoded from the bytes you supply, so the numbers are the font's own, down to the 16.16 fixed-point coordinates.",
    ],
    [
      "Says what is missing",
      "avar, gvar, CFF2, HVAR, MVAR and STAT are each checked. No gvar and no CFF2 means the axes are declared but the outlines may not move; no STAT means style menus will be a mess.",
    ],
    [
      "Correct slant conversion",
      "The CSS oblique angle runs opposite to the slnt axis, so the exported font-style range is sign-flipped for you rather than copied across wrong.",
    ],
  ],
  faqs: [
    [
      "Why will it not open my WOFF2 file?",
      "WOFF2 stores the font tables under Brotli compression with a transform applied to glyf and loca, and no browser API exposes a Brotli decoder to page scripts. WOFF uses zlib and is only slightly better placed. Both are delivery formats — the .ttf or .otf they were built from is the file to explore, and every type foundry ships it.",
    ],
    [
      "What is the difference between an axis range and a named instance?",
      "The axis range is continuous: wght 100 to 900 means every value in between is a real, renderable weight. A named instance is one coordinate set the foundry chose to give a name, such as Condensed Bold at wght 700, wdth 87.5. Instances are what appear in an application's style menu; the range is what CSS and font-variation-settings can reach.",
    ],
    [
      "Why does the font-weight range in the exported CSS matter?",
      "Because the range in @font-face is what the browser matches against. Declare font-weight: 400 in the rule and the browser treats the file as a single 400 weight; asking for 700 then triggers synthetic emboldening — a smeared fake bold — even though the real 700 is sitting inside the file. Declaring the true range lets the variation engine do the work.",
    ],
    [
      "Does an avar table change how I should read the numbers?",
      "It changes how the slider behaves, not what the range means. avar remaps the axis internally, so the midpoint of a wght 100-900 axis is not necessarily the average of the two extremes; the font may place its regular weight there instead. The tool flags an avar table when it finds one so you know the scale is non-linear.",
    ],
  ],
};

export default seo;
