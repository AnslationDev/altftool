const seo = {
  intro:
    "The EXIF Timestamp & Geotag Editor records the date and coordinate changes you want made to a photo as a JSON sidecar file, saved alongside the original as filename.altftool-sidecar.json. It deliberately does not rewrite the image's own EXIF block: browsers cannot safely repack every maker-note and sub-directory structure a camera writes, so instead of corrupting the file it produces an explicit, machine-readable record of the intended edits. Each sidecar carries four fields — the source filename, the edits you typed, an ISO 8601 generation timestamp, and a warning that the original bytes are untouched.",
  useCases: [
    "You scanned a box of family photos and the capture dates are all today's date — write down the real dates per file as sidecars now, then apply them in one pass with ExifTool later instead of retyping them.",
    "You are handing a shoot to an archivist who needs the correct location for each frame, and you want the correction delivered as a separate reviewable file rather than as a silent change to the master image.",
    "Your camera's clock was on the wrong timezone for a whole trip and you need to document the offset per file before anyone touches the originals.",
  ],
  benefits: [
    ["Originals stay byte-identical", "Nothing is re-encoded or repacked, so checksums, maker notes and RAW-adjacent structures survive exactly as the camera wrote them."],
    ["An auditable record of the change", "The sidecar timestamps itself in ISO 8601 and names the source file, so the intended edit is reviewable and reversible rather than baked in."],
    ["Honest about what it does not do", "The output states in plain text that the image bytes were not modified, instead of implying an EXIF rewrite that did not happen."],
  ],
  faqs: [
    [
      "Does this actually change the EXIF data in my photo?",
      "No — it writes a separate JSON sidecar and leaves the original file untouched, which the sidecar itself states in its warning field. To apply the change to the image you need a dedicated EXIF writer such as ExifTool, using the sidecar as your instruction list.",
    ],
    [
      "What exactly is in the sidecar file?",
      "Four keys: source (the original filename), requestedEdits (the text you entered), generatedAt (an ISO 8601 timestamp of when it was produced), and warning. It downloads as your-photo.jpg.altftool-sidecar.json so it sorts next to the image.",
    ],
    [
      "Can I process a whole folder at once?",
      "One file per run — the tool reads the first file you provide and produces one sidecar for it. For a large batch, generate the sidecars you need individually or script the same JSON shape yourself, since the format is only four plain fields.",
    ],
    [
      "How should I write the timestamp and coordinates?",
      "Use unambiguous formats you can feed to a writer later: dates as YYYY:MM:DD HH:MM:SS, which is EXIF's own DateTimeOriginal format, and coordinates as signed decimal degrees such as 48.8584, 2.2945. The field is free text, so the tool stores whatever you type verbatim.",
    ],
  ],
};

export default seo;
