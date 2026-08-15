const seo = {
  title: "EXIF and GPS Remover: Re-encode Photos to Clean PNG",
  metaDescription:
    "Strip EXIF, GPS and camera tags by redrawing the photo through a canvas in your browser; the download is a clean PNG with dimensions reported.",
  steps: [
    "Choose your photo with the 'Local file(s)' picker — if several are selected, only the first file is processed and the rest are ignored.",
    "Press 'Run local workbench' to decode the image and redraw its pixels through a canvas, which carries no EXIF, GPS or camera metadata block.",
    "The cleaned image downloads as altftool-batch-metadata-scrubber.png, and the Verified result table lists width, height and original bytes.",
  ],
  intro:
    "The Batch Metadata Scrubber strips EXIF, GPS and camera metadata from a photo by decoding it and re-encoding the raw pixels through an HTML canvas, which carries no metadata block at all. It is for anyone about to post or send a photo who does not want the file to also reveal where it was taken, on what device, and when. The tool reports the decoded width, height and original byte size so you can confirm the picture itself came through unchanged.",
  useCases: [
    "You are listing furniture on a marketplace and the photos were taken at home — the GPS tags in those JPEGs would give away your address to anyone who downloads them.",
    "A colleague asks for a screenshot-quality product photo for a deck, and you want the camera serial number and editing-software fields gone before it circulates outside the company.",
    "You are uploading an image to a forum where the moderator has warned that phone photos leak location, and you want the file clean before it ever leaves your machine.",
  ],
  benefits: [
    ["Removal by re-encoding, not editing", "The pixels are redrawn into a fresh canvas, so there is no metadata block left to miss a field in."],
    ["Confirms the image survived", "The report shows decoded dimensions and the original file size next to the cleaned output."],
    ["Nothing is uploaded", "Decode, redraw and encode all happen in the tab; the download comes from memory, not a server round trip."],
  ],
  faqs: [
    [
      "What metadata does this actually remove?",
      "Everything outside the pixel data — EXIF, GPS coordinates, camera make and model, timestamps, orientation tags and editing-software fields. Canvas holds only RGBA pixel values, so re-encoding from it cannot carry any of those blocks forward.",
    ],
    [
      "What file do I get back?",
      "A PNG. The re-encode always outputs PNG, so a photo that arrived as a JPEG will come back larger in bytes but without a second round of lossy compression.",
    ],
    [
      "Does it process a whole folder at once?",
      "You can select multiple files, but each run scrubs the first selected image. Re-run per file rather than expecting a single zipped output.",
    ],
    [
      "Will stripping metadata change how the photo looks?",
      "The pixels are copied unchanged, so colour and detail are preserved. The one thing worth checking is rotation: a photo that depended on an EXIF orientation flag no longer has that flag afterwards, so confirm the result is upright before you send it and rotate the source first if it is not.",
    ],
  ],
};

export default seo;
