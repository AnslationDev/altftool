const seo = {
  title: "Deepfake Checklist: 15 Red Flags, 6 Verify Steps",
  metaDescription:
    "Score a video, voice note or call against 15 weighted red flags and 6 verification steps; any money or OTP ask stays high until you call back.",
  steps: [
    "Under \"1. Red flags you can observe\", tick only what is genuinely present across the Request and pressure, Media artifacts and Provenance groups — \"Asks for money, a wire transfer, gift cards or crypto\" carries a severity weight of 5, warped hands or mismatched lighting only 2.",
    "Under \"2. Verification steps already completed\", tick a check only if you ran it and it passed; the two marked decisive are the callback on a number you already had and the pre-agreed code word, and all six together remove at most 60% of the assessed risk.",
    "Read \"Residual risk after verification\" as a percentage with its band — Low concern, Elevated concern, High concern or Critical — plus the group severity table and the \"Still to run\" list; \"Copy result\" copies the verdict and the outstanding checks.",
  ],
  intro:
    "The Deepfake Awareness Checklist scores a suspicious video, voice note or call against 15 weighted red flags and 6 verification steps, then reports the risk that remains after the checks you have actually completed. It follows the guidance that matters in practice rather than pixel forensics: the FBI IC3 advice to call the person back on a number you already hold, the FTC finding that the request for money or gift cards is the reliable tell in voice-cloning scams, and CISA/NSA's position that provenance and out-of-band confirmation beat automated detectors on re-shared, recompressed media. It is built for anyone facing an urgent ask that appears to come from a family member, a manager or a bank.",
  useCases: [
    "An accounts-payable clerk who gets a video call from the 'CFO' authorising a same-day wire transfer to a new supplier account",
    "A parent receiving a WhatsApp voice note from an unknown number that sounds like their child asking for bail or emergency money",
    "A community moderator deciding whether a viral clip of a politician is worth removing before any outlet has reported it",
  ],
  benefits: [
    [
      "Severity-weighted, not a tally",
      "A request for money or an OTP carries a weight of 5, while warped hands or lighting carry 2 — so weak artifacts cannot inflate the verdict.",
    ],
    [
      "The hard rule overrides the score",
      "Any money, credential or access request that has not been confirmed out of band is floored at high concern, however clean the media looks.",
    ],
    [
      "Tells you what is still missing",
      "Ticked steps cut at most 60% of the assessed risk and the outstanding ones are listed by name, so you finish the checks instead of guessing.",
    ],
  ],
  faqs: [
    [
      "How can you tell if a video call is a deepfake?",
      "Verify the person, not the video: end the call and ring back on a number you already have, or ask a question only they could answer. On a live call, asking them to turn fully side-on or pass a hand across their face still breaks many real-time face swaps, but treat that as a hint rather than proof — the callback is the check that actually settles it.",
    ],
    [
      "What are the most reliable signs of a deepfake voice message?",
      "The request is the strongest sign, not the audio. Voice-cloning scams almost always ask for money, gift cards, crypto or a one-time passcode, insist you act within minutes, and come from a number the real person has never used. Audio tells such as flat intonation, absent breathing and clipped word endings support that read but are unreliable on their own, because a few seconds of public audio is now enough to produce a convincing clone.",
    ],
    [
      "Do deepfake detector apps work?",
      "Not reliably enough to act on. CISA and NSA's joint guidance on deepfake threats to organisations notes that automated detectors degrade badly once media has been compressed, cropped and re-shared, which describes almost everything you will be sent. Provenance signals such as C2PA Content Credentials on the original file and out-of-band confirmation of the person are the controls that hold up.",
    ],
    [
      "What should I do if I think I have been targeted by a deepfake scam?",
      "Stop the transaction first: send nothing, share no code, and call back on a number you already hold. If money has already moved, contact your bank immediately to request a recall, then report it — in the US to the FBI's IC3 at ic3.gov and the FTC at reportfraud.ftc.gov, and in India to the cybercrime helpline 1930 or cybercrime.gov.in. Keep the original file and the sender details; screenshots alone lose the metadata investigators want.",
    ],
  ],
};

export default seo;
