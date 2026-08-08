const seo = {
  title: "EXIF Viewer for JPEG: Every Tag, GPS Included",
  metaDescription:
    "Reads a JPEG's APP1 segment in your browser and lists every tag — camera, exposure, ISO, focal length and GPS — with unknown fields shown by hex ID.",
  intro:
    "The EXIF Data Viewer opens a JPEG's APP1 metadata segment in your browser and lists every tag it contains — camera make and model, capture and digitised dates, exposure time, F-number, ISO, focal length, orientation, and the GPS block when the photo carries one. It parses the raw bytes directly: it checks the JPEG start marker, finds the Exif header, reads whether the TIFF block is little-endian (II) or big-endian (MM), then walks each 12-byte directory entry and decodes ASCII, short, long and rational values. Tags it recognises get plain-English names; anything else is shown by its hex tag ID so nothing is hidden from you.",
  useCases: [
    "You are about to post a photo taken at home and want to check whether it still carries GPS latitude and longitude before it goes public.",
    "You bought a used camera body and want to confirm the sample shots really came from that make and model rather than a different one.",
    "You are settling an argument about how a shot was taken — pull up the F-number, shutter speed, ISO and focal length the camera recorded instead of guessing from the look of the image.",
  ],
  benefits: [
    ["Every tag, not a curated few", "Unrecognised fields are still listed with their hex tag ID and decoded value, so a viewer that names 21 tags does not silently drop the rest."],
    ["GPS is followed automatically", "When the file contains a GPS pointer at tag 0x8825, the tool jumps into that directory and lists latitude, longitude, altitude and their reference letters."],
    ["Shooting settings pulled to the top", "Camera make, model, original date, ISO, F-number and focal length are surfaced as cards above the full table so you do not have to scan for them."],
  ],
  faqs: [
    [
      "Which image formats does it read?",
      "JPEG only. The parser checks for the 0xFFD8 start-of-image marker first and stops with a clear message on anything else, so PNG, HEIC, WebP and RAW files will not open here — PNG in particular has no EXIF segment at all in most cases.",
    ],
    [
      "Why does my photo show no EXIF data?",
      "Most likely it was already stripped. Social platforms, messaging apps and many CDNs remove the APP1 segment on upload, and screenshots or exported/edited copies are often written without one — in that case the tool reports that no EXIF metadata was found.",
    ],
    [
      "Does this show where a photo was taken?",
      "Only if the camera or phone wrote GPS tags into the file. When present you get latitude, longitude and altitude along with their N/S and E/W reference tags; if the device had location services off for the camera, those tags simply do not exist in the file.",
    ],
    [
      "Is my photo uploaded anywhere?",
      "No. The file is read into an array buffer and parsed byte by byte in the tab you have open, and the preview thumbnail is a local blob URL — the image itself never leaves your device.",
    ],
  ],
};

export default seo;
