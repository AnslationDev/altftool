const seo = {
  intro:
    "GIF file size is driven by four things: pixel count, palette depth, frame count and how much of each frame changes. This estimator combines the exact container overhead defined by the GIF89a specification — a 6-byte header, a 7-byte logical screen descriptor, a colour table of 3 × 2ⁿ bytes, a 19-byte Netscape looping block, plus 20 bytes and a sub-block prefix per frame — with a modelled figure for the LZW-compressed pixel data. It also works backwards, telling you how many frames or how many pixels wide the animation can be and still land inside a 1 MB, 5 MB or 15 MB upload limit.",
  useCases: [
    "Check whether a 30-frame screen recording at 640x360 will clear a 2 MB chat upload limit before exporting it.",
    "Decide between halving the frame count and halving the dimensions when a GIF comes out twice as large as it should be.",
    "See how much a 256-colour palette costs against a 64-colour one on a flat UI recording.",
    "Find the widest export that still fits a documentation page's size budget at a fixed frame count.",
  ],
  benefits: [
    ["Exact container maths", "Header, screen descriptor, colour table, per-frame blocks and sub-block prefixes are taken from the GIF89a spec, not guessed."],
    ["Solves the inverse", "Gives the frame count and the pixel width that fit a chosen budget, using a binary search that is exact to the pixel."],
    ["Honest about uncertainty", "LZW output depends on the picture, so the estimate is shown as a range of roughly ±40% rather than a single confident number."],
  ],
  faqs: [
    [
      "How do you estimate the size of a GIF?",
      "Multiply width × height × bits per pixel ÷ 8 to get the raw indexed bytes for one frame, apply a compression ratio for the kind of content, and repeat for each frame — but only for the part of the frame that changes, since encoders store just the changed rectangle after the first frame. Then add the fixed container and per-frame overhead.",
    ],
    [
      "How many colours can a GIF have?",
      "256 per palette, because each pixel is an index into a colour table of at most 2⁸ entries. The palette is always rounded up to a power of two, so a 100-colour image still uses 7 bits per pixel and a 128-entry table of 384 bytes.",
    ],
    [
      "What is the fastest way to make a GIF smaller?",
      "Cut the dimensions first — size scales with the pixel count, so halving both width and height removes about three quarters of the data. After that, reduce the frame rate, then cut the palette, then turn dithering off, which alone typically removes around a quarter of the compressed size because dithering adds noise that LZW cannot match.",
    ],
    [
      "Why is my GIF far larger than the estimate?",
      "Most often because the encoder is not doing frame differencing, so every frame is stored in full, or because the source is grainy video where LZW finds almost no repeated runs. Setting the motion profile to 'full frame changes' and the content to 'grainy video' will reproduce that worst case.",
    ],
  ],
};

export default seo;
