const seo = {
  title: "Lecture Recording Checklist: Audio, Light",
  metaDescription:
    "Pre-flight check for audio, framing, screen capture and power, weighted 3/2/1 by severity. It holds the shoot while any critical item is still open.",
  steps: [
    "Work down the Audio, Framing and lighting, Screen capture, and Power, storage and continuity sections, ticking each item you have confirmed.",
    "Clear the critical items first — test peaks between −12 and −6 dBFS, recording at 48 kHz, capture at 1920×1080 — because any unticked one holds the shoot.",
    "Read 'Recording readiness' as a percentage with 'Critical items cleared' and the weighted score in points, then press 'Copy summary'.",
  ],
  intro:
    "This lecture recording checklist scores your pre-flight setup across audio, framing and lighting, screen capture, and power and storage, weighting each item by severity (3 points critical, 2 important, 1 optional). It is aimed at lecturers, course creators and trainers who record themselves without a crew, and it holds the shoot while any critical item is still open — faults such as clipped audio above 0 dBFS or a scaled screen capture that no amount of editing can repair. Targets follow standard practice: dialogue peaking between −12 and −6 dBFS, 48 kHz sampling, and capture at the delivery resolution.",
  useCases: [
    "Running a two-minute setup pass before every weekly lecture recording so takes stay consistent across a semester",
    "Handing a shared checklist to a teaching assistant who is recording sessions in your absence",
    "Diagnosing why last week's recording sounded thin or the code on screen was unreadable",
  ],
  benefits: [
    ["Severity weighting", "Critical faults outweigh cosmetic ones three to one, so you fix in the right order."],
    ["Hard blockers", "The list refuses to read 'ready' while an unfixable-in-post item is open."],
    ["Copyable status", "One click gives you a per-section summary to paste into a production log."],
  ],
  faqs: [
    [
      "What audio level should I record a lecture at?",
      "Aim for dialogue peaks between −12 and −6 dBFS, with nothing touching 0 dBFS. That leaves 6 to 12 dB of headroom for a sudden laugh or cough, and anything that hits 0 dBFS in a digital recorder is clipped permanently — it cannot be recovered later.",
    ],
    [
      "What sample rate should I use for lecture video?",
      "48 kHz, which is the sample rate the video world runs at; 44.1 kHz is the CD rate and forces a resample when your editor conforms the timeline. Use 24-bit depth if your recorder offers it, because the extra headroom makes a quiet take safe to lift in post.",
    ],
    [
      "How big should text be in a recorded screen capture?",
      "At least 24 px at 1080p for body text and code, and capture at the full delivery resolution rather than a scaled window. Students watching on a phone see roughly a quarter of the linear size, so the default editor font that looks fine on your desk is usually unreadable on playback.",
    ],
    [
      "Where should the light and camera go for a talking-head lecture?",
      "Put the lens at eye level with your eyes on the upper-third line, and the key light about 45 degrees to one side and slightly above, brighter than whatever is behind you. Avoid a window directly at your back — the camera exposes for the window and renders you as a silhouette.",
    ],
  ],
};

export default seo;
