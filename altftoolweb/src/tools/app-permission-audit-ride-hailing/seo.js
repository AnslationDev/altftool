const seo = {
  intro:
    "The Ride Hailing App Permission Audit separates the safety features you chose from the data collection you did not. Sixteen permissions are weighted by sensitivity, with precise location scored as genuinely core and the harder cases — background location, microphone for in-trip audio recording, contacts for emergency contacts and trip sharing — scored as optional, worth keeping only if you actually use them. Call logs, calendar and Bluetooth scanning have no ride-hailing use at all and score as full exposure.",
  useCases: [
    "Decide whether to keep 'Allow all the time' location on after enabling live trip sharing.",
    "Set up emergency contacts without handing the app your entire address book.",
    "Review what a cab app kept after a document-verification step asked for camera and photos.",
    "Explain to a first-time rider which safety toggles are worth the data they cost.",
  ],
  benefits: [
    [
      "Safety features judged on their merits",
      "Audio recording and trip sharing are scored as optional, not condemned — the point is to choose them deliberately.",
    ],
    [
      "Knows what masked calling removes",
      "Platforms route driver calls through a masked number, so CALL_PHONE and call log access earn no credit.",
    ],
    [
      "Verdict caps stop a good score hiding a bad grant",
      "One unnecessary permission holds the headline verdict at 'Low exposure' however clean the rest looks.",
    ],
  ],
  faqs: [
    [
      "Does a cab app need location all the time?",
      "Not for booking or for an ongoing trip — those run in the foreground with a live notification, which 'While using the app' covers. Background location only matters if you want trips tracked with the phone locked and the app closed, so it is a deliberate trade, not a requirement.",
    ],
    [
      "Is in-trip audio recording worth enabling?",
      "It is a real safety feature: the recording is encrypted and only opened if you file a report. The cost is a standing microphone grant, so set the permission to 'Ask every time' or turn the feature on per ride rather than leaving it always on.",
    ],
    [
      "Why does the app want my contacts for emergency contacts?",
      "So you can pick names from a list — but that means granting the whole address book to store two or three numbers. Deny it and type those numbers manually in the safety settings; the feature works the same way afterwards.",
    ],
    [
      "Should a ride hailing app have my call log?",
      "No. Driver calls are routed through a masked number by the platform, so the app never needs your call history. READ_CALL_LOG is a Google Play restricted permission and reveals who you speak to and when, which has nothing to do with booking a ride.",
    ],
  ],
};

export default seo;
