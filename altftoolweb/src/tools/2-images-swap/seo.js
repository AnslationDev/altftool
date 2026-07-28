const seo = {
  title: "Swap Two Images Online — Free Side-by-Side Tool",
  h1: "2 Images Swap — Swap Two Images Side by Side",
  metaDescription:
    "Upload two images and swap their left/right positions instantly. Side-by-side preview, PNG/JPG/GIF/WebP/BMP up to 20MB, free and fully in-browser.",
  intro:
    "2 Images Swap loads both files as blob URLs through URL.createObjectURL and swaps which one renders on the left and which on the right by toggling a single React state flag — the pixels themselves are never re-encoded. Each slot's dimensions come from reading naturalWidth and naturalHeight off an in-memory Image element, and the download buttons point straight back at the original blob, so the file you save is a byte-for-byte copy of what you loaded, renamed to swapped-left-… or swapped-right-…. There are no network requests anywhere in the tool: neither image is uploaded, stored, or sent to an API.",
  useCases: [
    "Flipping a before/after or A/B design pair to see how the comparison reads with the versions reversed.",
    "Checking the order of a two-image layout — a carousel pair, thumbnail set, or slide — before committing to it.",
    "Renaming a pair of files to their intended left/right slot order so a designer or CMS receives them in sequence.",
  ],
  benefits: [
    [
      "Pixels stay untouched",
      "Swapping is a state toggle, not a re-render. Nothing is drawn to a canvas or re-compressed, so there is no quality loss, no format change, and no metadata stripped from either file.",
    ],
    [
      "Nothing leaves your device",
      "Both files are read locally with URL.createObjectURL and displayed from a blob: URL. The tool makes no network calls, and object URLs are revoked when you replace, remove, or reset an image.",
    ],
    [
      "Full details before you swap",
      "Each slot reports filename, format, file size (1024-based, two decimals) and exact pixel dimensions, so you can confirm you loaded the right pair and spot a mismatch in resolution.",
    ],
    [
      "Free, no account, no watermark",
      "The page is a client-side React component with no login step, no paid tier, and no cap on how many pairs you swap or download.",
    ],
  ],
  faqs: [
    [
      "Does this tool swap faces in two photos?",
      "No — it swaps the positions of two images, not their contents. It exchanges which picture appears in the left panel and which appears in the right. There is no face detection, AI model, or image generation involved anywhere in the code.",
    ],
    [
      "How do I swap two images online?",
      "Load one image into slot A and another into slot B, then click Swap Images. The two preview panels exchange places immediately and the badge changes from Original to Swapped; click Restore Original to flip them back. The button stays disabled until both slots are filled.",
    ],
    [
      "What image formats and file sizes are supported?",
      "PNG, JPEG/JPG, GIF, WebP and BMP, up to 20MB (20,971,520 bytes) per image. Any other type is rejected with \"Unsupported format\", and an oversized file returns \"File too large. Maximum size is 20MB.\"",
    ],
    [
      "Are my images uploaded to a server?",
      "No. Each file is read locally with URL.createObjectURL and rendered from a blob: URL inside your own browser — the tool issues no fetch, upload, or API request at all. Nothing is stored or logged, and closing the tab discards everything.",
    ],
    [
      "Does swapping reduce image quality?",
      "No. The swap only changes which slot each image renders in, so the file is never decoded and re-encoded. The download link points at the original blob, meaning the saved file is identical to the one you uploaded, just renamed to swapped-left-<filename> or swapped-right-<filename>.",
    ],
    [
      "Can I export both images as one side-by-side picture?",
      "No — Download Left and Download Right save two separate files, each the image currently sitting in that position. The tool does not merge, stitch, or composite the pair into a single collage image.",
    ],
    [
      "Can I drag and drop images instead of browsing for them?",
      "Yes. Drop a file onto either upload zone, or click the zone to open the file picker. The zones are keyboard-accessible with Enter or Space, and each filled slot gets a Replace image link plus an X button to clear it.",
    ],
    [
      "Is 2 Images Swap free to use?",
      "Yes, and it requires no sign-up. There is no authentication, no usage counter, and no watermark applied to anything you download — the whole tool runs as a client-side page.",
    ],
  ],
  steps: [
    "Drag and drop or click to load an image into slot A, then a second image into slot B (PNG, JPG, GIF, WebP or BMP, max 20MB each). Each slot shows the filename, format, size and pixel dimensions once loaded.",
    "Click Swap Images. The left and right preview panels exchange instantly and the status badge switches to Swapped; click Restore Original to undo the flip.",
    "Use Download Left or Download Right to save either image in its new position as swapped-left-<filename> or swapped-right-<filename>, or press Reset to clear both slots and start over.",
  ],
};

export default seo;
