const seo = {
  intro:
    "The File Metadata Explorer reads a file's actual header bytes and reports what they say: the magic number that identifies the true format, image width and height from the PNG IHDR or JPEG SOFn header, EXIF camera tags, MPEG audio frame values, PDF version and page count, plus a CRC-32 checksum and Shannon entropy. It is built for anyone who needs to verify a file rather than trust its name — an extension can say .jpg while the bytes say PNG. Parsing runs entirely in the browser through the File API, so nothing is uploaded.",
  useCases: [
    "Confirm a downloaded 'invoice.pdf' really starts with %PDF and is not a renamed ZIP or executable.",
    "Check whether a photo you are about to publish still carries EXIF GPS coordinates and camera serial data.",
    "Read the exact pixel dimensions, colour type and bit depth of a PNG before sending it to a printer.",
  ],
  benefits: [
    ["Format from bytes, not names", "Identifies files by magic number and flags any mismatch with the extension."],
    ["Real specification fields", "Parses IHDR, SOFn, RIFF fmt, MPEG frame and ftyp/mvhd headers as the specs define them."],
    ["Nothing leaves the device", "Bytes are read locally with the File API — no upload, no server, no logging."],
  ],
  steps: [
    "The page opens on a built-in sample-swatch.png so you can see the layout. Drag your own file onto the Choose a file to inspect zone, or use the file picker inside it; no file type is filtered out, and anything over the stated limit is refused with That file is larger than the 256.0 MiB this reader handles.",
    "The bytes are read in the tab and the report redraws at once, with no button to press: Exact size in bytes, Detected format, True MIME type (from bytes), Type the browser reported, First 16 bytes (hex), CRC-32 checksum, Entropy in bits per byte, Last modified, Pixel dimensions, Aspect ratio, Megapixels and Bytes per pixel. When the name disagrees with the signature, a red Extension mismatch line names the extension and the format the bytes actually are.",
    "Format-specific header fields, EXIF camera data and Text statistics (Characters, Words, Lines, Line endings, Reading time) appear underneath for files that carry them. Copy metadata puts that whole report on the clipboard as plain text and the button reads Copied! for a moment, and Reset returns the page to the sample-swatch.png sample.",
  ],
  faqs: [
    [
      "How do I check a file's real type without opening it?",
      "Read its magic number — the first few bytes. A PNG always starts 89 50 4E 47 0D 0A 1A 0A, a JPEG starts FF D8 FF, a PDF starts %PDF, and a ZIP (including .docx and .xlsx) starts PK 03 04. This tool shows those first 16 bytes in hex and names the format they identify.",
    ],
    [
      "Does this tool upload my file anywhere?",
      "No. The file is read with the browser's File API into memory in the current tab and parsed there; no network request is made and nothing is stored. You can confirm it by opening the browser network panel while inspecting a file.",
    ],
    [
      "What EXIF data can a photo contain?",
      "Camera make and model, capture timestamp, orientation, exposure time, aperture, ISO, focal length, editing software, and — if location was enabled — GPS latitude and longitude to about six decimal places. The tool lists whichever of these tags the file actually holds.",
    ],
    [
      "What does the entropy figure mean?",
      "It is Shannon entropy in bits per byte, from 0 to 8. Plain text usually sits around 4-5, already-compressed data such as JPEG, ZIP or MP4 sits above 7.5, and a value very close to 8 suggests compressed or encrypted content that will not shrink further.",
    ],
  ],
};

export default seo;
