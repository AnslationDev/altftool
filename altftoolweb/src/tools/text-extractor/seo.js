const seo = {
  title: "Text Extractor — Free Image to Text OCR in Browser",
  h1: "Text Extractor",
  metaDescription:
    "Extract text from a JPG or PNG in your browser with Tesseract.js OCR — free, no signup, and the image is never uploaded. Includes a confidence score.",
  intro:
    "The Text Extractor reads printed text out of a JPG or PNG using Tesseract.js 4, the WebAssembly build of the Tesseract OCR engine, running inside your own browser tab. Your image is loaded from a local object URL and handed straight to the recognizer with the English (`eng`) language model — the file itself is never sent to a server, only the engine and its language data are fetched from a CDN the first time you run it. Recognition reports live progress and returns Tesseract's mean confidence score alongside the text, so you can tell at a glance whether the result needs proofreading. The output lands in an editable box with one-click copy.",
  useCases: [
    "Lift a serial number, error message, or Wi-Fi password out of a screenshot instead of retyping it by hand",
    "Turn a photo of a printed page, handout, or whiteboard into text you can quote, search, or paste into notes",
    "Recover copyable text from a screenshot, slide, or infographic where the text isn't selectable",
  ],
  benefits: [
    [
      "OCR runs on your device",
      "The image is read through a local object URL and recognized by the Tesseract.js WebAssembly engine in your browser tab — the file is never uploaded to AltFTool or stored anywhere.",
    ],
    [
      "A confidence score on every run",
      "Tesseract's mean confidence is shown as a percentage next to the result, so you know immediately when a low-quality scan needs a second look before you use the text.",
    ],
    [
      "Editable, copy-ready output",
      "Extracted text appears in an editable box you can fix up in place; the Copy Text button strips the confidence header and puts only the clean text on your clipboard.",
    ],
    [
      "Free, with no account",
      "No signup, no per-image limit, and no watermark — open the page, drop an image, get text.",
    ],
  ],
  faqs: [
    [
      "How do I extract text from an image?",
      "Drag a JPG or PNG onto the drop zone (or click Select Image), and recognition starts automatically. Tesseract.js scans the image in your browser, a progress bar counts to 100%, and the recognized text appears in the editable box on the right with a confidence percentage underneath. Clear, high-contrast, upright text gives the best result.",
    ],
    [
      "Is the Text Extractor free to use?",
      "Yes — completely free, with no signup, no upload limit, and no watermark on the extracted text. The OCR engine runs in your browser, so there is no per-image server cost to meter.",
    ],
    [
      "Are my images uploaded to a server?",
      "No. The image is turned into a local object URL for the preview and passed directly to the Tesseract.js engine running in your browser — it never leaves your device. The only network requests are for the OCR engine script and its English language data, which download from a CDN the first time you use the tool.",
    ],
    [
      "What file types can I extract text from?",
      "JPG and PNG images. The uploader rejects other types with an \"Upload JPG or PNG only\" message. PDFs, Word files, and pasted rich text aren't read directly — screenshot or export the page as a JPG or PNG first, then run that image through the extractor.",
    ],
    [
      "What does the confidence percentage mean?",
      "It's Tesseract's own mean confidence across everything it recognized, on a 0-100 scale. High scores usually mean crisp, well-lit printed type; a low score signals blur, skew, low resolution, or an unusual font, and the text should be proofread before you use it. It measures the engine's certainty, not verified correctness.",
    ],
    [
      "Can it read handwriting?",
      "Not reliably. Tesseract is trained on printed and typeset characters, so handwritten notes, cursive, and stylised script tend to come back garbled. Printed documents, screenshots, signage, and typed labels are what it handles well.",
    ],
    [
      "What languages does the Text Extractor support?",
      "English. The recognizer is called with the `eng` language model, so English and other text in the basic Latin alphabet work best. Heavily accented text and non-Latin scripts such as Devanagari, Chinese, Japanese, Arabic, or Cyrillic are not covered by that model and will not extract correctly.",
    ],
    [
      "Why is my extracted text wrong or garbled?",
      "Almost always image quality. OCR accuracy drops sharply on low-resolution captures, photos taken at an angle, low contrast between text and background, heavy JPEG compression, and decorative fonts. Re-shoot or re-crop so the text is straight, sharp, and fills more of the frame, then check whether the confidence score improves.",
    ],
  ],
  steps: [
    "Drag a JPG or PNG onto the drop zone, or click Select Image and choose a file.",
    "Tesseract.js loads on first use and recognizes the image in your browser while a progress bar tracks it to 100%.",
    "Review the text in the editable box, check the confidence score, then click Copy Text.",
  ],
};

export default seo;
