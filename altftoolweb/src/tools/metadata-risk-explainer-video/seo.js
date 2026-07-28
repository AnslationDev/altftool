const seo = {
  intro:
    "The Video Metadata Risk Explainer shows what an MP4 or QuickTime video can reveal before you share it: capture time, GPS tags, device model, filename, editing app, embedded thumbnails, subtitles, voices, reflections and background location clues. The score changes by sharing channel because social apps often transcode video while email, shared drives and evidence uploads may keep the original file.",
  useCases: [
    "Check a phone, dashcam, drone or action-camera clip before posting it publicly.",
    "Prepare a safer video attachment for work chat, email, legal intake or support tickets.",
    "Explain why transcoding removes some metadata but cannot hide voices, screens or reflections.",
    "Create a redaction checklist before publishing a screen recording or real-world clip.",
  ],
  benefits: [
    ["Channel-aware scoring", "See what survives social upload, messaging compression, email, work chat or evidence sharing."],
    ["Metadata plus visible content", "The tool covers both hidden tags and things that survive every export because they are in the frames or audio."],
    ["Copyable cleanup plan", "Export the top remaining risks and fixes as a short privacy checklist."],
  ],
  faqs: [
    [
      "Does transcoding remove all video metadata?",
      "It removes many container tags, but it does not remove what is visible in frames or audible in the soundtrack. It may also preserve subtitles, chapters or thumbnails depending on the pipeline.",
    ],
    [
      "Can video files contain GPS location?",
      "Yes. Phones, drones, dashcams and action cameras can write GPS coordinates or route telemetry into MP4, MOV or sidecar files. Strip location metadata before sharing when privacy matters.",
    ],
    [
      "Is this a file scanner?",
      "No. It is a local reference model: you tick the signals you believe are present and the tool explains what could survive each sharing channel.",
    ],
  ],
};

export default seo;
