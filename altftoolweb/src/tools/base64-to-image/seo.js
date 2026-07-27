const seo = {
  intro:
    "Base64 to Image decodes a Base64 string — raw, or wrapped in a `data:image/...;base64,` URL from RFC 2397 — back into the original picture and shows you what it actually is. It identifies the format from the file's own magic number (the 8-byte PNG signature, JPEG's FFD8FF start-of-image, GIF89a, the RIFF/WEBP pair) rather than trusting the MIME type in the string, then reads the pixel dimensions straight out of the header. It is for developers debugging an API payload, an email template, or a CSS data URI that will not render.",
  useCases: [
    "Check what a `data:image/png;base64,...` blob in an API response really contains before wiring it into the UI",
    "Recover an inline logo out of an HTML email or a CSS background-image rule and save it as a proper file",
    "Confirm the dimensions and byte size of an avatar a client uploaded as Base64, without opening an image editor",
  ],
  benefits: [
    ["Format read from the bytes", "Ten signatures checked — PNG, JPEG, GIF, WebP, BMP, ICO, AVIF, HEIC, TIFF and SVG — so a mislabelled MIME type is caught."],
    ["Real pixel dimensions", "Width and height are parsed from the PNG IHDR chunk, the JPEG SOF marker or the GIF screen descriptor, not guessed."],
    ["Nothing leaves the browser", "Decoding happens locally with `atob`; the image is never uploaded to a server."],
  ],
  faqs: [
    [
      "How do I convert a Base64 string back to an image?",
      "Paste the string here and the decoded picture appears immediately — no upload, no sign-in. Everything after the comma in `data:image/png;base64,iVBORw0KGgo...` is the payload; you can paste the whole data URL or just that payload, and the tool strips the prefix for you.",
    ],
    [
      "How much bigger is a Base64 image than the original file?",
      "Exactly 33% bigger before padding: Base64 turns every 3 bytes into 4 characters, so 100 KB of image becomes about 133 KB of text, plus up to 2 padding characters and the ~22-character data-URL prefix. That is why inlining is worth it only for small assets — roughly under 4 KB is the usual rule of thumb for CSS.",
    ],
    [
      "Why does my Base64 fail to decode?",
      "Almost always one of three things: the `data:image/png;base64,` prefix was left in a field expecting raw payload, the string was truncated in transit, or it is URL-safe Base64 (RFC 4648 §5, using `-` and `_`) pasted into a decoder expecting the standard `+` and `/` alphabet. This tool handles all three, and reports the offending character when something else is wrong.",
    ],
    [
      "Can this tool tell a PNG from a JPEG if the MIME type is wrong?",
      "Yes. It compares the decoded bytes against each format's file signature — PNG always starts 89 50 4E 47 0D 0A 1A 0A, JPEG starts FF D8 FF, GIF starts with the ASCII text GIF87a or GIF89a — and flags a mismatch when the data URL's declared type disagrees with what the bytes say.",
    ],
  ],
};

export default seo;
