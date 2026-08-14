const seo = {
  title: "Voiceprint Anonymizer: Pitch Shift, Same Duration",
  metaDescription:
    "Shift a voice by 1.08x or 1.18x up or down with the tempo restored and a 100 Hz-8.5 kHz band limit. FFmpeg runs in your browser and writes a WAV.",
  steps: [
    "Choose a recording with the \"Source file\" picker, which accepts any audio format; the clip is written to FFmpeg's in-memory filesystem in the page rather than uploaded.",
    "Set \"Voice shift\" to subtle-up, subtle-down, strong-up or strong-down — a 1.08x or 1.18x asetrate factor undone by the reciprocal atempo so the duration is unchanged — and press \"Process locally\".",
    "The FFmpeg WebAssembly engine loads on that press and the band-limited result (100 Hz highpass, 8.5 kHz lowpass) downloads as altftool-voiceprint-anonymizer.wav, with the Local processing report listing the file name, size, type and chosen profile.",
  ],
  intro:
    "The Voiceprint Anonymizer shifts the pitch of a recorded voice while keeping the original speaking speed, so the words stay clear but the obvious speaker cues change. It runs FFmpeg in your browser and offers four shifts — subtle up, subtle down, strong up and strong down — implemented as a resample-and-retime chain (a 1.08x or 1.18x factor applied via asetrate, undone with atempo) plus a 100 Hz–8.5 kHz band limit, and it writes a WAV. It changes how a voice sounds; it cannot guarantee anonymity against determined speaker-recognition systems.",
  useCases: [
    "You recorded a whistleblower or research interview and promised the participant their voice would not be recognisable in the published clip, so you apply a strong downward shift before editing.",
    "You are posting a voice note to a public forum and do not want the clip tied back to your other accounts by ear, so you nudge the pitch with the subtle setting and keep the delivery natural.",
    "You are making a training or demo video with real support-call audio and need the customer's voice altered before it goes to a wider internal audience.",
  ],
  benefits: [
    ["Pitch changes, pace does not", "The resample shift is cancelled with a matching tempo correction, so a two-minute clip stays two minutes and the speech rhythm survives intact."],
    ["Four calibrated strengths", "Subtle uses a 1.08x factor and strong uses 1.18x, in either direction, so you can pick the smallest change that does the job instead of a chipmunk effect."],
    ["Band-limited output", "A 100 Hz high-pass and 8.5 kHz low-pass trim the extremes where residual timbre cues and rumble live, without touching the speech range that carries the words."],
  ],
  faqs: [
    [
      "Does pitch shifting really anonymize a voice?",
      "No, not reliably. It removes the most obvious cue a human listener uses, but modern speaker-recognition systems key on formant structure, timing and articulation patterns that a uniform pitch shift leaves largely intact. Treat it as obfuscation, not protection, and add editing or re-voicing when the stakes are high.",
    ],
    [
      "How much does it change the pitch?",
      "The subtle settings apply a factor of 1.08 (about 1.3 semitones) and the strong settings 1.18 (about 2.9 semitones), up or down depending on which you pick. Larger shifts hide more but start to sound processed.",
    ],
    [
      "Will the recording get longer or shorter?",
      "No. The pitch is changed by resampling to 48 kHz at the shifted rate, then an atempo filter of exactly the reciprocal factor restores the original duration, so the output length matches the input.",
    ],
    [
      "Is the audio uploaded to a server?",
      "No — FFmpeg runs as WebAssembly inside the page and the processed WAV is handed straight back to you as a download. If you are anonymizing a voice for legal, journalistic or safeguarding reasons, get advice from someone qualified in that area rather than relying on a filter alone.",
    ],
  ],
};

export default seo;
