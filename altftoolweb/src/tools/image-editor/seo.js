const seo = {
  title: "Online Image Editor: Brightness, Grayscale, Rotate & Flip",
  metaDescription:
    "Adjust brightness and saturation to 200%, invert, grayscale, rotate 90° and flip, then save a JPEG at the photo's original pixel size — nothing uploaded.",
  steps: [
    "Drop an image here or click to browse files — the Choose Image button also opens the picker — and the photo loads locally through an object URL.",
    "Pick a filter chip — Brightness, Saturation, Inversion, Grayscale — and drag its slider (0-200% for the first two, 0-100% for the rest), or use the Rotate & Flip buttons: Left, Right, H-Flip, V-Flip.",
    "Press Save Image to bake the filters into a JPEG named edited-image.jpg at the image's natural width and height; Reset returns every control to its neutral value.",
  ],
  intro:
    "Image Editor applies four CSS filter adjustments — brightness and saturation from 0 to 200 percent, inversion and grayscale from 0 to 100 percent — plus 90-degree rotation and horizontal or vertical flipping, then bakes them into a downloadable JPEG at the photo's original pixel dimensions. The preview updates live as you drag a slider, and a single reset returns every control to its neutral value. It is for quick corrections where opening a full editor would be overkill.",
  useCases: [
    "A phone photo came out dark for a listing, so you push brightness above 100 percent and drop the saturation slightly until it looks natural, then save.",
    "You need a grayscale version of a logo for a one-colour print and want the same file at full resolution rather than a screenshot.",
    "A scan came in sideways and mirrored, so you rotate it 90 degrees and flip it horizontally before sending it on.",
  ],
  benefits: [
    [
      "Exports at the original resolution",
      "The save step draws to a canvas sized to the image's natural width and height, so a 4000 px photo comes back 4000 px, not preview-sized.",
    ],
    [
      "Filters and transforms in one pass",
      "Brightness, saturation, inversion and grayscale are composed with rotation and flips and applied together when you export.",
    ],
    [
      "Instant preview, one-click reset",
      "Adjustments render live through CSS filters, and reset returns brightness and saturation to 100 percent with everything else at zero.",
    ],
  ],
  faqs: [
    [
      "What adjustments can I make?",
      "Brightness (0-200%), saturation (0-200%), inversion (0-100%), grayscale (0-100%), rotation in 90-degree steps either direction, and horizontal or vertical flip. 100% is the neutral setting for brightness and saturation; 0% is neutral for inversion and grayscale.",
    ],
    [
      "What format does the edited image download as?",
      "A JPEG named edited-image.jpg, rendered at the source image's native pixel dimensions. JPEG has no transparency, so a PNG with a transparent background will come back with that area filled rather than clear.",
    ],
    [
      "Are my photos uploaded to a server?",
      "No. The file is loaded through a local object URL, previewed with CSS filters and re-drawn into a canvas in the page, so nothing is transmitted anywhere.",
    ],
    [
      "Why does the saved image look slightly different from the preview?",
      "The preview uses CSS filters on the displayed element while the export applies the same filter string to a canvas at full resolution, and rotation is applied about the canvas centre without resizing the canvas. That means a 90-degree rotation on a non-square photo can crop the long edge, so check the downloaded file when rotation is involved.",
    ],
  ],
};

export default seo;
