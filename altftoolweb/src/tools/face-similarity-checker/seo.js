const seo = {
  title: "Face Similarity Checker — Compare Two Photos",
  h1: "Face Similarity Checker",
  metaDescription:
    "Load two face photos, drag the overlay slider, and get an approximate similarity reading. Everything runs in your browser — nothing is uploaded.",
  intro:
    "The Face Similarity Checker loads two face photos with the browser's FileReader API, paints each one onto an HTML5 canvas with an alignment box and landmark overlay, and lets you wipe one over the other using a CSS clip-path slider. The match percentage it reports is a deterministic on-device estimate calculated from the two loaded images — it is not produced by a trained face-recognition model and is not derived from measured facial landmarks, so treat it as a rough headline and read the side-by-side overlay yourself. No image ever leaves your device: the tool contains no upload endpoint and makes no server request anywhere in its code.",
  useCases: [
    "Slide between a before and after portrait — new haircut, new glasses, or photos taken years apart — to see exactly what changed around the eyes, jaw, and hairline.",
    "Check that two profile pictures of the same person read as visually consistent before using them across a website, resume, or set of social accounts.",
    "Line up a casual look-alike comparison — family resemblance, sibling photos, or a celebrity double — without sending anyone's face to a third-party service.",
  ],
  benefits: [
    [
      "Photos never leave your device",
      "Both images are read with FileReader into a local data URL and drawn straight to a canvas element. There is no upload call, no API request, and no storage — refresh or close the tab and both photos are gone.",
    ],
    [
      "Drag-to-compare overlay",
      "A clip-path slider wipes photo B across photo A inside one frame, so you can align eyes, nose, and jawline directly instead of squinting at two separate thumbnails.",
    ],
    [
      "Nothing to install or sign up for",
      "The tool renders as a client-side React component in the page. No account, no email address, no browser extension, and no processing queue to wait in.",
    ],
    [
      "Save the comparison locally",
      "Copy puts the result line on your clipboard, and PDF Report opens your browser's own print dialog so you can save or print what is on screen. Both actions stay on your machine.",
    ],
  ],
  faqs: [
    [
      "Is this face similarity checker free?",
      "Yes — free, with no account, no email, and no usage cap. The whole comparison is JavaScript running in the page you are already on, so there is nothing to install and no credits to buy.",
    ],
    [
      "Are my photos uploaded anywhere?",
      "No. Each file is read with the browser's FileReader API into a local data URL and rendered onto a canvas element on your own device. The tool's source contains no fetch call, no upload endpoint, and no storage layer.",
    ],
    [
      "How accurate is the face similarity percentage?",
      "Treat it as a rough indicator, not a biometric match score. The number is computed on-device from the two loaded images rather than by a trained face-recognition model, and it is not based on measured landmark distances — the side-by-side canvases and the overlay slider are the parts to actually judge by.",
    ],
    [
      "Can I use this to verify someone's identity?",
      "No. The tool shows a biometric disclaimer stating that it estimates visual similarity only, does not identify people, and does not verify identity. Do not use it for identity checks, access control, hiring, or any decision about a real person.",
    ],
    [
      "What image formats can I compare?",
      "Anything your browser can decode. The file inputs accept image/* and rendering goes through the standard Image element, so JPG, PNG, WebP, GIF, and AVIF all load. Each photo is scaled to fit a 400x400 canvas, so square, front-facing crops line up best.",
    ],
    [
      "Why does the same pair of photos always give the same number?",
      "Because the calculation is deterministic — the same two images always produce the same result. Pressing Swap Images does not change it either, since the formula is symmetric between photo A and photo B.",
    ],
    [
      "What do the four toggles actually do?",
      "Show Facial Landmarks and Show Face Boxes draw the cyan markers and teal alignment box over each photo at standard face proportions — they are a positioning guide, not detected features. Auto Compare re-runs the comparison as soon as the second photo loads. High Accuracy Mode is not currently wired to any visible effect — toggling it does not change the reported percentage, the overlays, or anything else on screen.",
    ],
    [
      "Does it work on a phone?",
      "Yes. The layout stacks to a single column on small screens, the overlay slider responds to touch as well as mouse movement, and the file pickers open your phone's camera roll like any other image upload field.",
    ],
  ],
  steps: [
    "Click Upload Photo A and Upload Photo B and choose the two face images you want to compare — they load from your device straight into the canvas, with no upload step.",
    "With Auto Compare on, the similarity summary and quality panel appear a moment after the second photo finishes loading. Use Swap Images to flip A and B, or Clear Canvas to start over.",
    "Drag the Before / After slider to wipe one face across the other, then use Copy for the result line or PDF Report to save the on-screen comparison through your browser's print dialog.",
  ],
};

export default seo;
