const seo = {
  title: "Upscale Image in Browser: Lanczos 3, Bicubic, 8x",
  metaDescription:
    "Enlarge a picture up to 8x with Lanczos 3, bicubic, bilinear or nearest-neighbour resampling, in the browser — nothing is uploaded. 40 megapixel cap.",
  steps: [
    "Choose a file under 'Image to enlarge' (the picker accepts any image/* file), then set Scale factor to 1.5x, 2x, 3x, 4x, 6x or 8x.",
    "Pick a Resampling method — Lanczos 3, Bicubic (Catmull-Rom), Bilinear or Nearest neighbour — drag Sharpening up to 1.5, choose PNG (lossless), JPEG (smaller) or WebP as the Output format, and press 'Upscale image'.",
    "Output size fills in with Output megapixels, Output file size, Method used and Scale applied beside an Original / Upscaled preview; 'Download upscaled image' saves it as name-1600x1200.png, and outputs over 40 megapixels are refused with a message.",
  ],
  intro:
    "Upscale Image enlarges a picture in your browser by resampling it with a real reconstruction filter — Lanczos 3, bicubic Catmull-Rom, bilinear or nearest neighbour — rather than letting the browser stretch it. Each output pixel is a normalised weighted average of the source pixels around the matching position, with alpha handled in premultiplied form so transparent areas cannot bleed colour into opaque ones. It is for anyone who needs a larger version of a logo, screenshot or photo without sending the file to a server.",
  useCases: [
    "Enlarge a 400 px product photo to 1600 px for a print-ready listing using Lanczos 3.",
    "Scale pixel art 8x with nearest neighbour so the blocks stay perfectly square.",
    "Blow up a screenshot 2x for a slide deck and add a little sharpening to keep the text crisp.",
  ],
  benefits: [
    ["Four real filters", "Lanczos 3, bicubic Catmull-Rom, bilinear and nearest neighbour, each with its own trade-off."],
    ["Transparency safe", "Colour is convolved premultiplied by alpha, so PNG edges do not pick up dark fringes."],
    ["Nothing is uploaded", "Decoding, resampling and encoding all run in the browser tab on your own machine."],
  ],
  faqs: [
    [
      "Which upscaling method should I choose?",
      "Lanczos 3 for photographs, because its 3-tap sinc window keeps the most fine detail; bicubic Catmull-Rom for a softer, ring-free result; and nearest neighbour for pixel art and screenshots of text, where you want the blocks to stay hard-edged.",
    ],
    [
      "Does upscaling add detail that was not in the original?",
      "No. Resampling redistributes the information already present, so a 400 px photo enlarged to 1600 px has the same real detail spread over 16 times as many pixels. Only a trained AI model invents new detail, and that is not what this tool does.",
    ],
    [
      "What is the difference between bicubic and Lanczos?",
      "Bicubic uses a cubic polynomial over a 4-pixel window (radius 2); Lanczos 3 uses a windowed sinc over a 6-pixel window (radius 3). Lanczos preserves more high-frequency detail but can show a faint halo, called ringing, next to very hard edges.",
    ],
    [
      "How large an image can I upscale?",
      "Up to 40 megapixels of output, which is roughly 8000 × 5000 pixels. Beyond that a single RGBA buffer exceeds about 160 MB and most browser tabs run out of memory, so the tool stops and tells you to pick a smaller scale.",
    ],
  ],
};

export default seo;
