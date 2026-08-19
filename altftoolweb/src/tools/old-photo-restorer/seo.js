const seo = {
  title: "Old Photo Restorer – Fix Faded & Sepia Scans",
  metaDescription:
    "Restore faded scans in the browser: contrast lift, luminance-based sepia removal and 3×3 sharpening, with a drag-to-compare slider. Up to 15 MB, PNG out.",
  steps: [
    "Press Select Vintage Photo or drag a scan onto the upload panel — JPG, PNG and WebP up to 15 MB.",
    "Tick Enhance Fine Details and/or Remove Sepia Tone, then press Restore Image to run the contrast, de-sepia and sharpening pass.",
    "Drag the Before/After split slider to inspect the change, then Download the result as restored-photo.png or use Copy Image.",
  ],
  intro:
    "The Old Photo Restorer runs a scanned or photographed print through a three-step canvas pipeline — contrast and brightness lift, optional sepia removal by luminance conversion, and a 3×3 sharpening convolution — and shows the result against the original in a drag-to-compare slider. It is meant for anyone digitising family albums who wants faded, flat or yellowed prints to read clearly again without learning a photo editor. Images up to 15 MB are processed in the page and downloaded back as PNG.",
  useCases: [
    "You have just scanned a shoebox of 1970s prints and they all came out flat and low-contrast; you want a single pass that restores punch before you upload the album to share with relatives.",
    "A black-and-white portrait has gone yellow-brown with age and you want the aging cast stripped back to neutral grey so it prints properly.",
    "A phone snapshot of an old framed photo looks soft and mushy, and you want edge detail brought back so faces and text in the picture are legible.",
  ],
  benefits: [
    ["Side-by-side split slider", "Drag the divider across the image to judge exactly how much the restoration changed, instead of guessing from a thumbnail."],
    ["Sepia removal by proper luminance weighting", "The de-sepia option converts using 0.299R + 0.587G + 0.114B rather than averaging channels, so tonal relationships survive the conversion."],
    ["Detail sharpening on top of the tone fix", "An unsharp-style 3×3 kernel recovers edge definition that scanning softens, applied after the contrast lift so it does not amplify a colour cast."],
  ],
  faqs: [
    [
      "How do I fix a faded old photo?",
      "Raise contrast and brightness first, then sharpen — that order matters, because sharpening a flat image just amplifies noise. This tool applies a 1.25× contrast multiplier with a +10 brightness offset when detail enhancement is on, then runs the sharpening pass.",
    ],
    [
      "How do I remove the yellow sepia tint from a scan?",
      "Convert the image to greyscale using luminance weights, which discards the colour cast while keeping the correct brightness for each tone. Turn on the sepia-removal toggle and every pixel is mapped to 0.299R + 0.587G + 0.114B.",
    ],
    [
      "What size photo can I upload?",
      "Up to 15 MB per image. The sharpening step is skipped automatically on pictures larger than about 4 megapixels (4,000,000 pixels) so the browser tab does not freeze during the convolution pass; tone and sepia correction still apply at any size.",
    ],
    [
      "Can it repair scratches and tears?",
      "No — this is a tonal and sharpness restoration, not inpainting, so physical damage such as scratches, creases and missing corners stays in the image. For torn or heavily damaged originals you will still need a clone or heal tool in a full editor after running this pass.",
    ],
  ],
};

export default seo;
