const seo = {
  title: "Photo to Sketch: Pencil Drawing in Your Browser",
  metaDescription:
    "Grayscale, invert, blur and colour-dodge a JPG, PNG or WEBP into pencil lines. Blur radius 1-20 px, contrast, intensity, colored pencil; PNG download.",
  steps: [
    "Drop an image on the Drop a photo to sketch panel or press Select Photo — JPG, PNG and WEBP are supported, up to 25 MB.",
    "Move the Sketch Controls sliders — Blur Radius from 1 to 20 px, Contrast from -60 to 80, Sketch Intensity from 0 to 100% — and switch on Colored Pencil to tint the lines with each pixel's own hue.",
    "Compare the sketch against the original in the preview, then press Download PNG to save altftool-sketch-<timestamp>.png, or New Photo to start again.",
  ],
  intro:
    "Photo to Sketch converts a photograph into a pencil drawing using the classic four-step dodge pipeline: the image is reduced to luminance grayscale (0.299R + 0.587G + 0.114B), that layer is inverted, the inversion is softened with a separable box blur, and the two are recombined with a colour-dodge blend so only the edges survive as graphite lines. Three sliders expose the parts that matter — blur radius 1–20 px for how soft the shading reads, contrast −60 to +80 for how hard the darks bite, and sketch intensity 0–100% for how far the result moves from the original photo. A colored-pencil toggle tints the finished lines with each pixel's original hue, and the output saves as PNG.",
  useCases: [
    "Turning a portrait into a pencil-style print for a birthday gift, dropping the intensity to about 70% so the face keeps some tonal shading instead of collapsing to pure outline.",
    "Making a line-art reference from a photo to trace or paint over, with blur radius pushed high so the drawing keeps only strong contours.",
    "Producing a sketched header image for a blog post or invitation where a literal photograph would look too busy, then comparing before and after on the same frame before downloading.",
  ],
  benefits: [
    [
      "The blur radius is a real control",
      "Radius is the parameter that decides whether you get tight hatching or broad soft shading, and it is exposed directly from 1 to 20 pixels rather than hidden behind a preset name.",
    ],
    [
      "Blend, don't just switch",
      "Sketch intensity mixes the dodged line layer back against the plain grayscale, so 0% is a straight black-and-white photo, 100% is full line art, and everything between is available.",
    ],
    [
      "Colored pencil from the original hues",
      "The colour mode multiplies each finished line value by that pixel's own RGB, giving a tinted coloured-pencil look drawn from the actual photo rather than a flat sepia wash.",
    ],
  ],
  faqs: [
    [
      "How does a photo become a pencil sketch?",
      "Grayscale the photo, invert it, blur the inverted copy, then colour-dodge the grayscale with that blur — the formula is result = base × 255 / (255 − blend). Areas where the original and its blurred inverse nearly cancel come out white, and only places with a sharp local change stay dark, which is exactly what a pencil line is.",
    ],
    [
      "Which settings give the most realistic result?",
      "Start with a blur radius around 6, contrast near +20 and intensity around 85% — the defaults — then raise blur for softer, broader shading and lower intensity if the face has gone too stark. High-contrast, well-lit photos with a clean background convert best; flat or noisy images produce speckled lines.",
    ],
    [
      "What image formats and sizes work?",
      "JPG, PNG and WEBP are accepted, and anything larger than 2000 pixels on its longest edge is scaled down to that before processing so the conversion stays responsive. The finished sketch downloads as a PNG at the processed dimensions.",
    ],
    [
      "Is my photo uploaded anywhere?",
      "No. The file is decoded into a canvas and every step — grayscale, blur, dodge, blend — runs on the pixel data in your own browser, so the photo never leaves the device and there is nothing to delete from a server afterwards.",
    ],
  ],
};

export default seo;
