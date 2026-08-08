const seo = {
  title: "Screenshot Metadata Risk: What Survives Sharing",
  metaDescription:
    "Tick the filename, timestamps, status bar or crop leftovers in your screenshot and see which survive Slack, email, a bug tracker or a public post.",
  steps: [
    "Pick the destination under \"Where will you share it?\" — public social post, work chat, email attachment, support ticket or messaging app.",
    "Tick the signals your screenshot carries, such as Default screenshot filename, On-screen clock and battery percentage, or Recoverable data behind a crop.",
    "Read the Exposure score out of 100 and the \"Fix these before you share\" list, then press Copy result.",
  ],
  intro:
    "Screenshot Metadata Risk Explainer maps the identifying signals that travel with a screenshot — the default filename with its date and time, file system timestamps, PNG text chunks, on-screen status bar, visible file paths, and image data left behind an in-app crop — and scores how much of it survives the channel you share it on. Each signal is classified by where it lives (filename, embedded tag, trailing container bytes or the pixels themselves), because that determines whether a platform strips it or not. Written for anyone posting a bug report, a support screenshot or a social post who wants to know what they are handing over.",
  useCases: [
    "Check a bug-report screenshot before uploading it to a public issue tracker where the file keeps its original name and tags.",
    "Work out why a screenshot posted to X shows no EXIF but still dates itself through the visible status-bar clock.",
    "Decide whether a screenshot cropped inside a phone's markup editor needs to be re-exported before sharing.",
    "Brief a support team on which parts of a customer screenshot to redact with a solid block rather than a blur.",
  ],
  benefits: [
    [
      "Separates tags from pixels",
      "Shows which signals a platform can strip and which stay visible no matter what you upload to.",
    ],
    [
      "Channel-aware scoring",
      "The same screenshot scores differently on Slack, email and a public post because each handles files differently.",
    ],
    [
      "Concrete remediation",
      "Every surviving signal comes with the specific fix — crop, rename, re-export or cover with an opaque block.",
    ],
  ],
  faqs: [
    [
      "Do screenshots contain EXIF data with my location?",
      "Screenshots do not record GPS coordinates, because no camera or location sensor is involved. They can still carry tags such as pixel dimensions, display DPI and a Software field naming the capture tool or OS build, plus the filename and file system timestamps.",
    ],
    [
      "Can someone recover the part of a screenshot I cropped out?",
      "Sometimes yes. The aCropalypse flaw — CVE-2023-21036 in Google's Markup editor, and the same behaviour in the Windows 11 Snipping Tool — overwrote the start of the file but left the original trailing bytes, so the uncropped image could be rebuilt. Exporting the cropped image as a new file avoids it.",
    ],
    [
      "Is blurring enough to hide text in a screenshot?",
      "No. Blur and pixelation are reversible for short, predictable strings: an attacker renders candidate text in the same font, applies the same filter and matches the output. Cover sensitive text with a solid opaque rectangle and flatten the export instead.",
    ],
    [
      "Does posting to social media remove screenshot metadata?",
      "Major networks re-encode uploads and drop embedded tags and the original filename, but they never touch what is drawn in the picture — the clock, carrier name, notification previews, window titles and file paths all remain readable. Workplace chat, email and ticket systems usually keep the original file byte-for-byte, filename included.",
    ],
  ],
};

export default seo;
