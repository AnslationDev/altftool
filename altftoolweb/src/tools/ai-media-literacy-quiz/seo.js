const seo = {
  intro:
    "The AI Media Literacy Quiz scores how well you can judge whether an image, video, voice clip or claim was produced or distorted by AI, using scenario questions drawn from how verification actually works — C2PA content credentials, reverse image search, out-of-band confirmation and primary-source checking. Every answer is explained, so a wrong choice teaches the underlying rule rather than just deducting a point. It is built for teachers, journalists, moderators and anyone briefing a team on synthetic media.",
  useCases: [
    "Open a classroom media-literacy lesson with a shared question set everyone answers on their phones.",
    "Test a newsroom or moderation team before rolling out a verification checklist.",
    "Check your own habits after realising you judge images by 'does it look real' rather than by provenance.",
    "Give new staff a five-minute primer before they handle inbound user-submitted photos and videos.",
  ],
  benefits: [
    ["Explanations, not just marks", "Each question ends with the reasoning and the real-world failure mode behind it."],
    ["Repeatable question sets", "A set number fixes the question order, so a class or team can all take the identical round."],
    ["Topic breakdown", "Scores split across provenance, detector limits, verification workflow, AI claims and fraud so you know what to study."],
  ],
  faqs: [
    [
      "Can AI detectors reliably tell if an image or essay was AI-generated?",
      "No. Detector outputs are probability estimates that shift with compression, cropping and screenshotting, and text detectors in particular have documented false positives that fall hardest on non-native English writers — OpenAI withdrew its own text classifier for low accuracy. Treat any detector score as one weak signal that needs corroboration, never as proof.",
    ],
    [
      "What are C2PA Content Credentials and do they prove a photo is real?",
      "C2PA attaches a cryptographically signed manifest recording the capture device, generator and edit history of a file. When present and valid it is strong evidence, but absence proves nothing: the metadata is easily stripped and most social platforms remove it during upload.",
    ],
    [
      "How do I verify a suspicious photo of a news event?",
      "Start with a reverse image search to see whether the picture appeared earlier in another context — recycled real photos with false captions are far more common than deepfakes. Then look for the original file from a named photographer and independent images of the same scene, which together beat any visual artefact check.",
    ],
    [
      "How can I protect my family or company from voice and video deepfakes?",
      "Verify out of band. Hang up and call back on a number you already hold, agree a family code word in advance, and require dual authorisation plus a separate channel for payment requests at work — in a widely reported 2024 Hong Kong case a finance employee transferred roughly US$25 million after a video call in which all the other participants were synthetic.",
    ],
  ],
};

export default seo;
