const seo = {
  title: "Photo EXIF Metadata Risk: What Each Tag Reveals",
  metaDescription:
    "Tick the EXIF, GPS, IPTC and XMP fields a photo carries for a 0–100 exposure score, risky combinations and what to strip first. Nothing is uploaded.",
  steps: [
    "Choose the sharing context in 'Where is this photo going?' and optionally start from a preset — 'Straight off a phone', 'DSLR with owner details', 'Edited and exported' or 'Fully stripped'.",
    "Tick the checkboxes under 'Which fields does the file carry?' — each field shows a risk weight out of 10, its real tag such as GPSLatitude 0x0002, and an example value.",
    "Read the 'Exposure score' out of 100 with its band and advice, the 'Dangerous combinations' warnings, and the numbered 'What to do about it' removal plan; 'Copy result' copies the summary.",
  ],
  intro:
    "This explainer maps every common photo metadata field — the EXIF tags in IFD0, the separate GPS IFD, IPTC blocks and Adobe XMP — to the specific thing it tells a stranger who downloads your picture. Tick the fields a file carries and it scores the exposure, flags combinations such as GPS coordinates beside a to-the-second capture time, and lists what to remove first. Nothing is uploaded: it is a reference model built from the Exif specification (CIPA DC-008), not a file scanner.",
  useCases: [
    "Understand why a photo posted from home can point at your front door before you upload the next one.",
    "Check what a pseudonymous account gives away when the camera writes a body serial number into every frame.",
    "Explain to a team or a family member which fields matter, using the real tag names rather than vague warnings.",
    "Decide what to strip before sending photos to a marketplace buyer or a dating match.",
  ],
  benefits: [
    ["Field-by-field, with real tags", "Each entry names the actual Exif tag, such as GPSLatitude 0x0002 or BodySerialNumber 0xA431."],
    ["Scores combinations too", "Coordinates plus an exact timestamp are treated as worse than either field alone, because they are."],
    ["Context-aware", "The same metadata scores higher on an anonymous account than in your own backup, and the tool reflects that."],
  ],
  faqs: [
    [
      "What personal information is stored in a photo's EXIF data?",
      "Typically the capture date and time to the second, the UTC offset, the camera make, model and software version, exposure settings, and — if location services were on — latitude, longitude and altitude in a separate GPS IFD. Cameras can also store an owner name, a copyright string and a body serial number, and photo libraries may write tagged people's names into XMP.",
    ],
    [
      "Do social networks remove EXIF data when I upload a photo?",
      "Most large platforms strip most metadata from the copy they serve publicly, but this is a platform choice that changes without notice, it does not apply to files sent as attachments or through chat, and the original upload still reaches the platform's servers intact. Strip locally before uploading rather than relying on it.",
    ],
    [
      "Can metadata still identify me after I crop or blur part of a photo?",
      "Sometimes, yes. Some editors update the main image but leave the older embedded thumbnail in IFD1, so the pre-crop version travels with the file. Vendor MakerNote blocks can also survive light cleaning and may hold shutter counts, burst identifiers or face-detection data.",
    ],
    [
      "How do I stop my phone writing GPS coordinates into photos?",
      "Deny the camera app location permission, or set it to never for that app in your phone's privacy settings. That stops the GPS IFD being written in the first place, which is more reliable than remembering to strip coordinates from each file before you share it.",
    ],
  ],
};

export default seo;
