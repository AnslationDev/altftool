const seo = {
  title: "Amazon Image Spec: 1000 px Zoom, White Background",
  metaDescription:
    "Test width, height, format and frame fill against Amazon's 500 px minimum, 1000 px zoom line, pure white main image and 85% fill rules.",
  steps: [
    "Enter Width (px), Height (px) and File size (MB), then choose the File format: JPG, PNG, TIF, GIF, WebP or HEIC.",
    "Pick the Image slot and Colour mode, set Product fills this share of the frame (%), and tick the pure white background box.",
    "Read the Verdict with longest side, megapixels and whether zoom is enabled, then press Copy report.",
  ],
  intro:
    "This checker tests a product photo against Amazon's published image requirements before you upload it to Seller Central. It applies the real thresholds: at least 500 px on the longest side to be accepted, 1000 px to switch on the detail-page zoom, 1600 px as Amazon's recommendation, a 10000 px ceiling, a pure white RGB 255,255,255 background on the main image, and a product that fills at least 85% of the frame. Additional images are checked against the looser rules that apply to lifestyle and infographic slots.",
  useCases: [
    "Find out why a 900 px product shot never shows the zoom cursor on the detail page.",
    "Confirm a cropped main image meets the 85% frame-fill requirement before a bulk upload.",
    "Check whether a lifestyle photo with text is safe in an additional slot but not as the main image.",
    "Verify a supplier-supplied TIFF is within the accepted format list and under the upload size limit.",
  ],
  benefits: [
    ["Main vs additional", "Background, frame fill and overlay rules only apply to the main image, and the check reflects that."],
    ["Zoom threshold called out", "Separates the 500 px accept-or-reject line from the 1000 px zoom line, which is the one that moves conversion."],
    ["Plain reasons", "Each result says which rule was tested and what to change, not just pass or fail."],
  ],
  faqs: [
    [
      "What size should Amazon product images be?",
      "At least 1000 px on the longest side, because that is where Amazon enables the zoom viewer, and 1600 px or more is Amazon's own recommendation. Images below 500 px on the longest side are rejected, and the maximum is 10000 px.",
    ],
    [
      "Does the Amazon main image have to be on a white background?",
      "Yes. The main image must sit on a pure white background — RGB 255, 255, 255 — with no text, logos, watermarks, borders, inset images or props that are not part of what the buyer receives. Additional images may use lifestyle backgrounds, callouts and infographics.",
    ],
    [
      "How much of the frame does the product need to fill?",
      "At least 85%, including packaging, on the main image. Cropping tighter than that makes the product easier to recognise in a small search thumbnail, which is where most first impressions happen.",
    ],
    [
      "Which file formats does Amazon accept?",
      "JPEG (.jpg or .jpeg), TIFF (.tif), PNG (.png) and non-animated GIF (.gif), in sRGB or CMYK. JPEG is preferred and uploads most reliably. WebP and HEIC are not accepted, so convert before uploading.",
    ],
  ],
};

export default seo;
