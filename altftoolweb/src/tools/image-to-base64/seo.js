const seo = {
  title: "Image to Base64 Converter — Free Data URL Encoder",
  h1: "Image to Base64 Converter",
  metaDescription:
    "Convert PNG, JPG, WebP, GIF or SVG into a Base64 data URL instantly. Free, no signup, and the image is read in your browser — never uploaded.",
  intro:
    "Image to Base64 turns a local image file into a complete data: URL — the `data:image/png;base64,…` string you can paste straight into an HTML `src`, a CSS `url()`, or a JSON field. It uses the browser's File API, calling `FileReader.readAsDataURL()` on the file you pick, which reads the raw bytes and encodes them with the standard Base64 alphabet (RFC 4648), every 3 bytes becoming 4 characters. There is no canvas redraw and no server round trip: the file never leaves your tab, and the preview you see is rendered from the generated string itself.",
  useCases: [
    "Inline a small icon or logo in a stylesheet as background-image: url(\"data:image/svg+xml;base64,…\") to remove one HTTP request.",
    "Drop a test image into a JSON body, a Postman request, or a unit-test fixture where an API expects a Base64 image field.",
    "Ship a self-contained HTML report or offline documentation page with its images embedded, so nothing breaks when the file is moved.",
  ],
  benefits: [
    [
      "A complete data URL, not a bare string",
      "The output already carries the data:image/…;base64, prefix built from the file's own MIME type, so it works in src=\"\" or CSS url() with nothing to prepend.",
    ],
    [
      "Byte-for-byte lossless",
      "readAsDataURL reads the original bytes with no canvas re-encode, so PNG transparency, GIF animation, SVG markup and the source format all survive intact.",
    ],
    [
      "The preview proves it decodes",
      "The image shown is rendered from the generated data URL itself — if it displays, the string is valid and pasteable.",
    ],
    [
      "Nothing is uploaded",
      "Reading, encoding, copying and downloading all happen in your browser. No account, no upload, and the page keeps working offline once loaded.",
    ],
  ],
  faqs: [
    [
      "How do I convert an image to Base64?",
      "Pick the image in the upload area and the full data URL appears immediately — no button to press. The tool passes your file to FileReader.readAsDataURL(), so encoding finishes in the same tick the file is read. From there, Copy puts the whole string on your clipboard and Download saves it as a plain-text file.",
    ],
    [
      "Is my image uploaded to a server?",
      "No. The file is read inside your browser tab with the File API and encoded there; the page makes no network request with your image. That is also why the converter still works if you lose connectivity after the page has loaded.",
    ],
    [
      "How much bigger does Base64 make an image?",
      "About 33% bigger — Base64 emits exactly 4 characters for every 3 bytes, so the encoded length is 4 × ceil(bytes / 3). A 30 KB PNG becomes roughly 40 KB of text, plus around 20-30 more characters for the data:image/png;base64, prefix. That overhead is why inlining is usually reserved for assets under about 10 KB.",
    ],
    [
      "What image formats does it accept?",
      "Anything your browser reports as an image — the file input uses accept=\"image/*\", which covers PNG, JPEG, WebP, GIF, SVG, AVIF, BMP and ICO. The MIME type is taken from the file itself and written into the data URL prefix; if the browser cannot determine one, the info panel shows \"Unknown\".",
    ],
    [
      "Does converting to Base64 reduce image quality?",
      "No. Base64 is an encoding, not a compression step, and this tool never redraws the image on a canvas — it encodes the original bytes. Decode the string and you get a file identical to the one you started with, including animation frames and alpha transparency.",
    ],
    [
      "How do I use the Base64 string in HTML or CSS?",
      "Paste the entire output, prefix included. In HTML that is <img src=\"data:image/png;base64,…\" alt=\"\">; in CSS it is background-image: url(\"data:image/png;base64,…\"). Because the tool emits a full data URL rather than a raw payload, you do not need to add the data: header yourself.",
    ],
    [
      "Is there a file size limit?",
      "The tool sets no limit — the practical ceiling is your browser's memory for a single file read. Bear in mind the string grows by a third, so a 5 MB photo produces roughly 6.8 MB of text, which is slow to scroll and rarely a sensible thing to inline. Use the Download button rather than the textarea for large results.",
    ],
    [
      "Can I convert one image at a time only?",
      "Yes, this converter handles a single image per run — choosing a new file replaces the previous output. Pick another file whenever you need the next string; nothing is queued or stored between runs.",
    ],
  ],
  steps: [
    "Click the upload area and choose an image — PNG, JPG, WebP, GIF, SVG or any file your browser recognises as an image.",
    "Read the output panel: the Base64 data URL appears in the text area, alongside a live preview rendered from that exact string and the file's name, size and MIME type.",
    "Press Copy to place the full data: URL on your clipboard, or Download to save it as <filename>-base64.txt.",
  ],
};

export default seo;
