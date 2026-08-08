const seo = {
  title: "Screenshot Compare: Slider Wipe and Pixel Diff",
  metaDescription:
    "Compare two screenshots side by side, behind a draggable wipe, or as a pixel diff flagging every pixel whose R+G+B difference tops 30 — all in the page.",
  steps: [
    "Upload Image 1 (Original) and Image 2 (New) by dropping them on the two panels or clicking to browse; PNG, JPG, WEBP and BMP are accepted.",
    "Choose Slider, Side by Side or Diff Overlay, then press Compute Diff; inside Diff Overlay you can switch between Dim Overlay, Diff Only and Diff Slider.",
    "Read the Difference, Changed Pixels, Total Pixels and Dimensions tiles under the overlay, and press Swap to flip the two captures or Reset to clear them.",
  ],
  intro:
    "This tool puts two screenshots side by side, behind a draggable wipe slider, or under a pixel-difference overlay that flags every pixel whose red, green and blue differences add up to more than 30. It is built for design and QA review: you see the two states in the same frame, at the same scale, and get the changed-pixel count and change percentage alongside each file's name, dimensions and size. Three view modes cover the three questions people actually ask — what moved, what it looked like before, and how much of the frame is affected.",
  useCases: [
    "A developer says the padding matches the design and you disagree, so you drag the wipe slider across the mock and the build to see the offset in place",
    "You are reviewing a light-to-dark theme pass and want side-by-side view to check that both versions keep the same layout while the colours change",
    "You need to show a stakeholder exactly what changed in a release note, and the dim overlay makes the changed regions glow while everything unchanged fades back",
  ],
  benefits: [
    ["Three ways to look at the same pair", "Slider wipe, side by side and diff overlay, switchable without re-uploading, because each one answers a different review question."],
    ["Two overlay styles for the diff", "Dim Overlay keeps the changed pixels in full colour against a darkened frame; Diff Only paints changes solid red so small movements are impossible to miss."],
    ["Metadata for both files", "Each screenshot shows its filename, pixel dimensions and file size, which catches the classic mistake of comparing a 1x capture against a 2x one."],
  ],
  faqs: [
    [
      "What counts as a difference?",
      "A pixel is marked changed when the absolute differences in its red, green and blue values sum to more than 30. That tolerance ignores mild compression noise while still catching antialiasing shifts, colour tweaks and one-pixel movements.",
    ],
    [
      "Do the two screenshots need to be the same size?",
      "For a meaningful diff, yes. The comparison canvas is sized to the larger width and larger height of the pair, so a mismatched capture leaves unpainted area that reads as changed. Check the dimensions shown under each image and re-capture at the same viewport and device pixel ratio if they differ.",
    ],
    [
      "What is the difference between the slider and the diff overlay?",
      "The slider shows real pixels from both images with a wipe you drag, which is best for judging how something looks. The diff overlay shows a computed mask of what changed and by how much, which is best for proving something changed at all — including changes too small to notice by eye.",
    ],
    [
      "Are my screenshots uploaded anywhere?",
      "No. Files are read into an object URL and compared on a canvas inside the page, so nothing is transmitted — which matters because product screenshots routinely contain customer names, internal URLs and unreleased UI.",
    ],
  ],
};

export default seo;
