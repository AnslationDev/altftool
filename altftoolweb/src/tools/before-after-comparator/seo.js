const seo = {
  title: "Before/After Image Comparator: Slider & Fade",
  metaDescription:
    "Compare two images with a draggable split slider, side-by-side grid or 0–100 fade, then export a labelled before/after PNG. Nothing is uploaded.",
  intro:
    "The Before vs After Comparator puts two images against each other in three viewing modes — a draggable split slider, a side-by-side grid, and a fade overlay with a 0-100 opacity control — and exports the pair as a single labelled PNG. It also reports each image's pixel resolution and flags whether the two match, which is the usual reason a comparison looks misaligned. It is for anyone showing an edit, a repair or a restoration and needing the difference to be obvious at a glance.",
  useCases: [
    "You retouched a client photo and want the split slider so they can drag across the frame and see exactly which areas changed.",
    "You are checking whether an upscaler actually added detail or just smoothed it, and the fade overlay lets you cross-dissolve between the two at any opacity to catch what moved.",
    "You need one image to attach to a report or post, so you export the labelled before/after PNG rather than sending two separate files and hoping they stay in order.",
  ],
  benefits: [
    ["Three ways to look at the same pair", "Slider, side-by-side and fade each reveal different kinds of change — edges, framing, and subtle tonal shifts respectively."],
    ["Catches resolution mismatches", "The analysis panel compares both images' pixel dimensions and warns when they differ, which is what makes an overlay drift."],
    ["Exports a self-labelling image", "The PNG comes out double-width with Before and After burned into the corners, so it stays readable wherever it is reposted."],
  ],
  faqs: [
    [
      "What are the three comparison modes?",
      "Slider draws one image over the other with a draggable vertical split; side-by-side shows both in a two-column grid; and fade stacks them with an opacity slider from 0 to 100 so you can cross-dissolve between them.",
    ],
    [
      "Do both images need to be the same size?",
      "Not to view them, but yes for a clean overlay. The analysis panel reports each image's width and height and marks the pair as a match or different, because the slider and fade modes only line up when the two frames share the same dimensions and crop.",
    ],
    [
      "What does the exported file look like?",
      "A single PNG at twice the width of the larger source image, with the before image on the left, the after image on the right, and small Before and After captions drawn into the bottom corners of each half.",
    ],
    [
      "Are my images uploaded anywhere?",
      "No. Both images are read into the page, drawn to a canvas for the export, and downloaded from memory. Nothing is transmitted, so unreleased client work stays on your machine.",
    ],
  ],
};

export default seo;
