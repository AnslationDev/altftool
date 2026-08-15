const seo = {
  title: "Image Collage Maker – 1200x1200 PNG Grid Collages",
  metaDescription:
    "Drop photos into a grid, 2x2, row or column layout on a 1200x1200 canvas, set 0-50 px spacing, and download a full-quality PNG — all in your browser.",
  steps: [
    "Click \"Select Photos\" (or \"Add Photos\") or drag image files onto the workspace — the picker accepts any image/* type and thumbnails appear in the Images list.",
    "Pick a Layout Style (grid, 2x2, horizontal or vertical) and drag the \"Image Spacing\" slider between 0 and 50 px; the 1200x1200 canvas preview redraws instantly.",
    "Click \"Download Collage\" to save the canvas as a full-quality PNG named collage-<timestamp>.png, or \"Clear Canvas\" to start over.",
  ],
  intro:
    "Image Collage Maker arranges the photos you drop in on a fixed 1200 x 1200 pixel canvas using one of four layouts — auto grid, 2x2, single row or single column — and exports the result as a full-quality PNG. Each photo is centre-cropped to fill its cell rather than squashed, so aspect ratios stay correct whatever mix of portrait and landscape shots you add. The gutter between cells is a slider from 0 to 50 pixels, and the preview redraws as you move it.",
  useCases: [
    "You want to post one image instead of nine after a weekend trip, so you drop the photos in, pick the auto grid and export a square PNG ready for a social post.",
    "A shop owner needs a 2x2 product tile for a listing thumbnail and wants four shots cropped to identical cells with even white gutters between them.",
    "You are making a before-and-after strip for a project write-up and use the horizontal layout so both images sit side by side at the same height.",
  ],
  benefits: [
    [
      "Fills cells without distorting photos",
      "Each image is scaled to cover its cell and centre-cropped, so a portrait shot next to a landscape one never comes out stretched.",
    ],
    [
      "Auto grid figures out the shape for you",
      "Grid mode takes the square root of your photo count to pick columns, so five photos or twelve photos both land in a sensible arrangement.",
    ],
    [
      "Gutter width is a live slider",
      "Anywhere from 0 px for an edge-to-edge mosaic to 50 px for a framed look, with the canvas redrawing as you drag.",
    ],
  ],
  faqs: [
    [
      "What size is the exported collage?",
      "1200 x 1200 pixels, saved as a PNG at full quality. That square size suits most social feeds and prints acceptably at small sizes, and cell dimensions are derived from it after the spacing gutters are subtracted.",
    ],
    [
      "How many photos can I put in one collage?",
      "There is no fixed cap on uploads, but the chosen layout decides how many are drawn: 2x2 shows the first four, horizontal and vertical show all of them in a single row or column, and auto grid uses a roughly square arrangement based on how many you added. Anything beyond the layout's cell count is left out of the render.",
    ],
    [
      "Will my photos be uploaded anywhere?",
      "No. Files are read with the browser's FileReader and drawn to a canvas in the page, and the download comes from that canvas, so the images never leave your device.",
    ],
    [
      "Why is part of my photo cut off?",
      "Because each cell is filled by scaling the image to cover it and cropping the overflow from the centre — the alternative would be letterboxing or distortion. Cropping is most noticeable when a tall portrait photo lands in a wide cell, so try the vertical layout or a different photo order if an important edge is being lost.",
    ],
  ],
};

export default seo;
