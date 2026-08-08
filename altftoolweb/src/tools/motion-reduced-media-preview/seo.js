const seo = {
  title: "Motion-Reduced Media Preview: No Autoplay, PNG Still",
  metaDescription:
    "Loads a GIF, MP4 or WebM up to 80 MB without autoplay, captures any frame as a PNG fallback, and checks the four WCAG 2.2.2 conditions. Nothing uploads.",
  steps: [
    "Press \"Choose a GIF, MP4, or WebM\" — the file is read locally up to the 80 MB limit, with no upload and no automatic playback.",
    "Drag Fallback frame time to the moment you want, press Capture still fallback, then Download PNG to save motion-reduced-fallback.png.",
    "Fill the Delivery checklist against the four WCAG 2.2.2 conditions and press Export local review report for motion-reduced-media-local-review-report.json.",
  ],
  intro:
    "Motion-Reduced Media Preview loads a GIF, MP4 or WebM without autoplaying it, lets you capture any frame as a still PNG fallback, and runs your intended delivery settings against the four conditions of WCAG 2.2.2 Pause, Stop, Hide: the motion starts automatically, lasts more than five seconds, runs in parallel with other content, and is not essential. Accessibility reviewers and content authors get a poster image plus a written list of findings and an exportable JSON review report. Files stay on the device: nothing is uploaded, and the report deliberately excludes the media and the file name.",
  useCases: [
    "A marketing team hands you a 12-second looping hero GIF and you need to decide whether it needs a pause control before it ships, plus a still frame to use as the poster image.",
    "You are writing an accessibility audit note for a background video and want a captured fallback frame and a record of which WCAG 2.2.2 conditions the current delivery actually meets.",
    "A product video autoplays in a carousel next to body copy and you need to check the frame at, say, 3.5 seconds still communicates the point when motion is suppressed for reduced-motion users.",
  ],
  benefits: [
    [
      "Nothing plays until you ask",
      "The media is decoded and inspected without autoplay, so you can evaluate a motion-heavy asset without being subjected to the motion first.",
    ],
    [
      "Frame capture and review in one pass",
      "Scrub to a timestamp, export that frame as a PNG poster, and get the delivery findings against the same asset rather than juggling two tools.",
    ],
    [
      "Findings are graded, not just flagged",
      "Each result is marked high, review or note, and the summary level is action-needed, review or no-obvious-risk, so genuine 2.2.2 failures are separated from best-practice cues.",
    ],
  ],
  faqs: [
    [
      "What file types and sizes can I load?",
      "GIF, MP4 and WebM up to 80 MB. The decoded canvas must stay within 8,192 pixels on either edge and 16.8 megapixels in total, and video duration must be above zero and no more than 60 minutes.",
    ],
    [
      "When does WCAG 2.2.2 Pause, Stop, Hide actually require a control?",
      "All four conditions must hold at once: the moving content starts automatically, it lasts more than five seconds, it is presented in parallel with other content, and it is not essential. If any one of those is false, the success criterion's requirement for a pause, stop or hide mechanism does not apply, though a control may still improve the experience.",
    ],
    [
      "Does this tell me my page passes WCAG?",
      "No. The exported report explicitly records that WCAG conformance was not established, no frame analysis was performed, and flash safety was not analysed. It reflects the delivery settings you described, not the live implementation, so verify the real page with keyboard and assistive technology and consult an accessibility specialist for a formal conformance claim.",
    ],
    [
      "Is my video uploaded anywhere?",
      "No. Decoding, frame capture and the review all run in the browser, and the JSON report records mediaIncluded: false and fileNameIncluded: false. Only media metadata such as kind, MIME type, byte size, dimensions and duration, plus your selected settings and the findings, appear in the export.",
    ],
  ],
};

export default seo;
