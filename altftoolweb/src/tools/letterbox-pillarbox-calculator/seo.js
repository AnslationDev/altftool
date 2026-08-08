const seo = {
  title: "Letterbox and Pillarbox Bar Size Calculator (px)",
  metaDescription:
    "Fit one aspect ratio inside another and get exact bar size in px and percent — 2.39:1 in a 1920x1080 frame is about 138 px top and bottom.",
  steps: [
    "Set 'Frame width (px)' and 'Frame height (px)', or tap a target frame preset such as '1920 x 1080 (HD 16:9)' or '1080 x 1920 (vertical 9:16)'.",
    "Enter 'Source aspect — width part' and 'Source aspect — height part', or tap a preset like '2.39:1 (anamorphic scope)' or '4:3 (SD / classic)'.",
    "Read 'Each bar' in px, the 'Rounded to even pixels (encoder safe)' picture size and 'Frame area filled by picture', then press 'Copy result'.",
  ],
  intro:
    "This calculator fits a picture of one aspect ratio inside a frame of another without cropping, then reports the black bar size in pixels and percent. When the source is wider than the frame the picture height becomes frame width divided by the source ratio and the leftover splits into two horizontal letterbox bars; when it is narrower the picture width becomes frame height times the source ratio and the bars are vertical pillarbox. Editors, motion designers and social media teams use it to place graphics and titles clear of the bars.",
  useCases: [
    "Placing 2.39:1 scope footage in a 1920x1080 timeline and needing the exact 138 px bar height for a title safe layout",
    "Dropping a 16:9 interview into a 1080x1920 vertical post and sizing the top and bottom design space around it",
    "Checking how much of a square 1080x1080 frame a 4:3 archive clip actually fills before an upload",
  ],
  benefits: [
    ["Exact pixel figures", "Bar size, picture size and percentages from one pair of ratios"],
    ["Encoder-safe rounding", "Also gives the picture size rounded down to even pixels for H.264 and H.265"],
    ["Visual check", "A scaled preview shows letterbox or pillarbox before you build the sequence"],
  ],
  faqs: [
    [
      "How tall are the black bars for 2.39:1 in a 1080p frame?",
      "About 138 pixels top and bottom. The picture occupies 1920 / 2.39 = 803 pixels of height, leaving 277 pixels to split between two bars, and the image fills roughly 74% of the frame area.",
    ],
    [
      "What is the difference between letterbox and pillarbox?",
      "Letterbox adds bars above and below because the source is wider than the frame, such as scope footage in a 16:9 timeline. Pillarbox adds bars at the left and right because the source is narrower, such as 4:3 or vertical video in a widescreen frame.",
    ],
    [
      "Should I round the bar size to a whole pixel?",
      "Yes — round the picture dimension down to an even number and let the bars absorb the remainder, because H.264 and H.265 with 4:2:0 chroma need even width and height. Stretching the picture to remove a one-pixel gap introduces visible distortion.",
    ],
    [
      "Can I avoid bars altogether?",
      "Only by cropping or by reframing: scaling the picture to cover the frame removes the bars but cuts off the edges, which is a crop calculation rather than a fit. Many social platforms expect a full-bleed frame, so shooting or reframing for the delivery ratio is usually better than baking bars in.",
    ],
  ],
};

export default seo;
