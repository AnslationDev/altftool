const seo = {
  title: "ICC Profiles Explained - sRGB vs Adobe RGB Gamut Size",
  metaDescription:
    "Compare sRGB, Adobe RGB, Display P3, Rec. 2020 and ProPhoto gamut areas, see what a wrong profile tag does to each primary, and when to assign vs convert.",
  steps: [
    "Pick a Working space — sRGB, Rec. 709, Adobe RGB (1998), Display P3, Rec. 2020 or ProPhoto RGB — and an Editing bit depth of 8, 16 or 32-bit per channel.",
    "In 'What a wrong tag does', set 'The file was really authored in' and 'The app or browser assumed' to list each primary's authored versus displayed xy chromaticity.",
    "Read the chromaticity-area ratio against sRGB and the banding-risk advice for your bit depth, then press Copy summary to keep the numbers.",
  ],
  intro:
    "An ICC profile is the label that says what a file's RGB numbers actually mean, and this explainer makes that concrete. It computes each working space's gamut as the area of the triangle its primaries span in CIE 1931 xy — sRGB covers 0.1121, Adobe RGB 0.1512 and ProPhoto RGB 0.2770 — then shows exactly where each primary lands when a file is read under the wrong profile, and spells out the difference between assigning and converting.",
  useCases: [
    "Work out why an exported photo looks dull in a browser but correct in the editor.",
    "Decide whether a project needs Adobe RGB or whether sRGB is enough.",
    "Check whether 8-bit editing is safe in the working space you have chosen.",
    "Pick a rendering intent before converting a saturated image for print.",
  ],
  benefits: [
    ["Gamut size you can compare", "Areas are computed from the published primaries, not quoted from memory."],
    ["Mis-tagging made visible", "Each primary's authored and displayed chromaticity is listed side by side."],
    ["Assign versus convert, settled", "One states what changes the numbers and what changes the appearance."],
  ],
  faqs: [
    [
      "What is the difference between assigning and converting a profile?",
      "Assigning leaves every pixel value untouched and changes only the label that says what those numbers mean, so the appearance changes. Converting recalculates the pixel values so the colour looks the same in the new space, so the numbers change and the appearance does not.",
    ],
    [
      "Why does my photo look washed out in the browser?",
      "Usually the file is Adobe RGB or Display P3 but is untagged, so the browser falls back to sRGB. Adobe RGB's green primary sits at x 0.21, y 0.71 against sRGB's 0.30, 0.60, so greens and cyans collapse toward neutral while red and blue, which share the same primaries, look unchanged.",
    ],
    [
      "Should I use sRGB or Adobe RGB?",
      "Use sRGB for anything delivered to the web or a general audience, because untagged files are assumed to be sRGB anyway. Adobe RGB is worth it when the file is going to CMYK print, where its extra cyan-green coverage survives the conversion — and it should be edited at 16-bit.",
    ],
    [
      "Do I need 16-bit for wide gamut editing?",
      "Yes once the space is meaningfully larger than sRGB. ProPhoto RGB covers about 2.5 times the chromaticity area of sRGB, so 8-bit spreads the same 256 codes per channel over that wider range and gradients band visibly.",
    ],
  ],
};

export default seo;
