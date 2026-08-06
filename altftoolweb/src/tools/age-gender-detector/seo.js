const seo = {
  title: "AI Age & Gender Detector — Free Photo Analyzer",
  h1: "AI Age & Gender Detector",
  metaDescription:
    "Free AI age and gender detector — upload a photo or use your webcam for an instant estimate. Runs on-device in your browser; nothing is uploaded or stored.",
  intro:
    "The AI Age & Gender Detector estimates a person's age range and gender presentation from a single photo, using the face-api.js neural network running entirely in your browser via TensorFlow.js. Face detection and inference both happen on your own device, so the photo you analyze is never uploaded to a server.",
  useCases: [
    "Curious what age range and gender an AI reads from your selfie or profile photo",
    "Content creators previewing how an AI vision model classifies a portrait before posting it",
    "Developers and students exploring how browser-based face detection and age/gender inference perform on real photos",
  ],
  benefits: [
    [
      "Runs entirely on-device",
      "Face detection and age/gender inference happen in your browser via TensorFlow.js — your photo is never uploaded to a server or stored anywhere.",
    ],
    [
      "Instant results",
      "Detection typically finishes in under two seconds once a face is found, with no server round-trip to wait on.",
    ],
    [
      "Works with a photo upload or your webcam",
      "Upload an image or turn on your webcam directly; the detector locates every face in frame and estimates age and gender for each one.",
    ],
    [
      "No account, no limits",
      "Free to use as many times as you like, with no signup and no watermark on the result.",
    ],
  ],
  faqs: [
    [
      "How accurate is AI gender detection from a photo?",
      "It's an estimate, not a certainty. The face-api.js model behind this tool is trained on labeled face datasets and is typically within a few years for age and highly accurate for binary male/female presentation on a clear, front-facing photo — but lighting, angle, image quality, and expression can shift the result. Treat it as a fun estimate, not a verified fact.",
    ],
    [
      "Does the AI gender detector work on any photo?",
      "It needs at least one clearly visible face — front-facing or a slight angle works best, with reasonable lighting. Sunglasses, heavy shadows, extreme angles, or very low-resolution images reduce accuracy or can stop the detector from finding a face at all.",
    ],
    [
      "Can this tool tell if someone is transgender?",
      "No, and it isn't designed to. The AI reads visible facial features and estimates a binary male/female presentation — it has no way to determine anyone's gender identity, which is something only that person can define for themselves. Please don't use the result to make assumptions about anyone's gender identity.",
    ],
    [
      "Is my photo uploaded or stored anywhere?",
      "No. Face detection and the age/gender estimate both run locally in your browser using TensorFlow.js — the photo is processed on your device and is never sent to AltFTool's servers or saved.",
    ],
    [
      "Can it detect the age and gender of more than one person in a photo?",
      "Yes. The detector locates every face in the frame and returns a separate age and gender estimate for each one, so group photos work the same as a single portrait.",
    ],
    [
      "Is the Age & Gender Detector free to use?",
      "Yes — completely free, with no signup and no limit on how many photos you analyze.",
    ],
    [
      "Why did it estimate an age that looks wrong?",
      "Age estimation from a single photo is inherently approximate — the model is typically accurate within a few years, but lighting, makeup, facial hair, camera angle, and image resolution can all shift the guess. A clearer, well-lit, front-facing photo usually tightens the estimate.",
    ],
    [
      "Does the gender detector work on mobile and with a webcam?",
      "Yes. It runs in any modern mobile or desktop browser, and you can either upload a photo or use your device's camera directly — detection works the same way either way.",
    ],
  ],
};

export default seo;
