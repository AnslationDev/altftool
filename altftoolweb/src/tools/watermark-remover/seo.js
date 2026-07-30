const seo = {
  intro:
    "Watermark Remover erases a marked region from an image by inpainting it: every selected pixel is rebuilt from the nearest unselected pixel found along each search direction, weighted by 1/r² so closer surrounding detail dominates the fill. You mark the watermark with a brush or rectangle (or run auto-detect), pick a removal strength, and export the repaired image as PNG, JPG, WebP, TIFF or AVIF. It is meant for images you own or are licensed to edit — your own stock purchases, drafts you exported with a preview mark, or scans with a stamp over the content.",
  useCases: [
    "You bought a stock photo and the licensed download still shows the preview mark in one corner, so you box that corner and fill it before dropping the image into a layout",
    "An old family scan has a photo-lab date stamp burned into the sky, and you brush over the digits so the flat gradient behind them is reconstructed instead of cloned by hand",
    "A product shot exported from an internal design tool carries a repeated 'DRAFT' tile, and you run auto-detect to flag the high-contrast overlay pixels before reviewing what it selected",
  ],
  benefits: [
    [
      "Five fill strengths, not one",
      "Fast averages a 7×7 neighbourhood, while balanced, high-quality and ultra search 20, 40 and 60 pixels outward and professional samples all eight directions instead of four.",
    ],
    [
      "Feathered masks avoid hard seams",
      "The selection is blurred by a feather radius (3 px by default) and re-thresholded, so the repaired patch blends into surrounding texture rather than leaving a rectangle.",
    ],
    [
      "Undo history and a before/after view",
      "Each removal, enhancement and reset is pushed onto a history stack, so you can step back and retry a different mode on the same source without reloading the file.",
    ],
  ],
  faqs: [
    [
      "Is it legal to remove a watermark from an image?",
      "Only when you hold the rights to the image or have the owner's permission — removing a watermark to reuse someone else's photo is copyright infringement in most jurisdictions, and in the US it can also violate the DMCA's prohibition on stripping copyright management information. This is general information, not legal advice; check with a lawyer for your specific situation.",
    ],
    [
      "How does the auto-detect option decide what is a watermark?",
      "It samples eight reference points around the image border, then flags any interior pixel whose closest match to those references is more than 15 units away in RGB Euclidean distance and that has at least four neighbours differing by more than 30. That heuristic finds high-contrast overlays on flat backgrounds well, but it will also catch genuine detail in busy photos, so review the result before exporting.",
    ],
    [
      "What file size and formats can I load?",
      "Up to 50 MB per image, in JPEG, PNG, WebP, BMP, TIFF or AVIF; anything wider or taller than 4096 pixels is scaled down to that limit before editing. Export is PNG, JPG, WebP, TIFF or AVIF, with quality defaulting to 92 for the lossy formats.",
    ],
    [
      "Why does the filled area look blurry over a detailed background?",
      "Because the fill interpolates surrounding colours rather than synthesising new texture, so it reconstructs smooth areas — sky, walls, gradients, bokeh — cleanly but softens over fine detail like grass, hair or type. Shrink the selection to the mark itself, try the professional mode for eight-direction sampling, then apply the sharpen enhancement to the result.",
    ],
  ],
};

export default seo;
