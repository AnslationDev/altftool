const seo = {
  title: "Base64 to File: Decode and Save with the Right",
  metaDescription:
    "Decode a Base64 string or data: URL, identify the file from its magic number across 30+ signatures, and save it with the correct extension.",
  intro:
    "Base64 to File decodes a Base64 string or a data: URL back into the original bytes, identifies what the file actually is by reading its magic number, and saves it with the correct extension. It checks more than 30 signatures — PNG's 89 50 4E 47, JPEG's FF D8 FF, PDF's %PDF-, the ZIP local-file header PK\\x03\\x04 and others — so a payload with a wrong or missing MIME type is still saved correctly. It is for developers pulling attachments out of API responses, logs and database rows.",
  useCases: [
    "Recover an email attachment that survives only as a Base64 column in a database export",
    "Check whether an upload stored as Base64 is really a PDF, or an HTML error page that was encoded by mistake",
    "Turn a data: URL copied out of a browser devtools panel back into a file you can open locally",
  ],
  benefits: [
    ["Type from the bytes", "The extension comes from the file signature, not from the sender's Content-Type header."],
    ["Mismatch warnings", "If the data: URL claims application/pdf but the bytes are a PNG, the tool says so."],
    ["Entropy check", "A reading at or above 7.5 bits/byte tells you the payload is already compressed or encrypted."],
  ],
  faqs: [
    [
      "How do I convert Base64 back to a file?",
      "Paste the Base64 (with or without the `data:…;base64,` prefix) and press Save file. Every 4 Base64 characters become 3 bytes per RFC 4648, and the extension is chosen from the decoded file's magic number — so a PNG is saved as .png even if nothing in the string said so.",
    ],
    [
      "What file types can this identify?",
      "Over 30, including PNG, JPEG, GIF, WebP, BMP, TIFF, ICO, PDF, ZIP (and the .docx/.xlsx/.pptx/.odt/.epub files built on it), GZIP, BZIP2, 7z, RAR, TAR, MP3, WAV, FLAC, OGG, MP4, WebM, MIDI, WOFF/WOFF2/TTF/OTF fonts, SQLite databases, ELF and Windows executables. Anything unmatched but valid UTF-8 is treated as text; the rest is saved as .bin.",
    ],
    [
      "Why is my Base64 string longer than the file?",
      "Base64 encodes 3 bytes as 4 characters, a fixed 33.3% increase, plus up to 2 padding characters and any line breaks. A 1 MB file becomes about 1.37 MB of Base64, which is why it is a transport format rather than a storage format.",
    ],
    [
      "Is my data uploaded anywhere?",
      "No. Decoding, type detection and the download all run in your browser tab using client-side JavaScript; the payload is never sent to a server, which matters when the file is a signed document or a private key export.",
    ],
  ],
};

export default seo;
