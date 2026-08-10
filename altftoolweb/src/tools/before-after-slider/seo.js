const seo = {
  title: "Before and After Image Slider – Drag to Compare",
  metaDescription:
    "Overlay two images and drag a wipe divider between them — by mouse, touch or arrow keys. Keeps the before image's aspect ratio; one-click Swap Images.",
  intro:
    "The Before/After Slider overlays two images in one frame and reveals them with a wipe divider you drag left or right, starting centred at 50 percent. The container locks itself to the before image's natural aspect ratio so neither picture is stretched, and the divider can be moved by mouse, by touch, or with the arrow keys on the range control beneath it. It is for showing an edit, a repair or a renovation where a side-by-side pair loses the point and the change needs to land in a single frame.",
  useCases: [
    "A retouched portrait needs approval and the client should be able to drag across the face themselves rather than flick between two tabs.",
    "You restored a scanned family photo and want to show the damage disappearing in the exact same frame position, at the original aspect ratio.",
    "You loaded the two shots in the wrong order and the reveal reads backwards, so you press Swap Images instead of re-uploading both.",
  ],
  benefits: [
    ["Aspect ratio taken from the source", "The frame adopts the before image's own width-to-height ratio, so nothing is squashed to fit a fixed box."],
    ["Draggable and keyboard-operable", "The same position is driven by pointer drag, touch drag and a labelled 0-100 range input, so it works without a mouse."],
    ["Swap without re-uploading", "One button exchanges the before and after images and recentres the divider at 50 percent."],
  ],
  faqs: [
    [
      "How do I move the divider?",
      "Drag it with the mouse, swipe with a finger on touch screens, or focus the range slider below the image and use the arrow keys. Its position runs from 0 to 100 percent of the frame width and starts at 50.",
    ],
    [
      "Do the two images need identical dimensions?",
      "They should share the same aspect ratio and framing for the wipe to line up. The frame sizes itself from the before image's natural dimensions, and the output summary lists both images' pixel width and height so a mismatch is easy to spot before you present it.",
    ],
    [
      "What image formats can I use?",
      "Anything the browser can display — JPEG, PNG, WebP, GIF and AVIF among them. Each file is read into an object URL locally, so large images load without any upload wait.",
    ],
    [
      "Can I save or embed the comparison?",
      "This tool is for viewing and presenting live rather than exporting; there is no download step. If you need a single saved image with both halves labelled, use a comparator that renders the pair to a PNG instead.",
    ],
  ],
};

export default seo;
