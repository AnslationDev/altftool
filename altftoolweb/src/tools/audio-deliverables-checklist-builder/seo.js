const seo = {
  intro:
    "An audio deliverables checklist is the list of files a finished job actually has to ship — masters, per-platform encodes, stems, transcripts and artwork — each with the format, sample rate and loudness target its destination requires. This builder assembles that list from the destinations you pick and applies the published specs: ACX at 192 kbps MP3 with RMS between -23 and -18 dB, podcasts at -16 LUFS with true peak at -1 dBTP, EBU R128 broadcast at -23 LUFS ±0.5 LU, and streaming platforms normalising to about -14 LUFS. It also works out the gain change your mix needs to hit any of those targets.",
  useCases: [
    "Confirm what an audiobook client needs before upload: chapter files, opening and closing credits, a retail sample and 2400 px square artwork.",
    "Check whether a podcast mix measuring -12 LUFS needs turning down, and by how much, before publishing.",
    "Quote a commercial job that requires broadcast, social and cinema versions from one session.",
    "Estimate the total package size before starting an upload over a slow connection.",
  ],
  benefits: [
    ["Specs, not guesswork", "Each destination carries its published bitrate, sample rate, loudness target and peak ceiling."],
    ["Gain change calculated", "Enter measured LUFS and true peak and see the exact adjustment, plus whether limiting is then required."],
    ["Sized before you export", "File count and package size are estimated from bitrate and PCM maths so delivery is not a surprise."],
  ],
  faqs: [
    [
      "What loudness should a podcast be mastered to?",
      "-16 LUFS integrated for a stereo file, or -19 LUFS for mono, with true peak no higher than -1 dBTP. Apple Podcasts and Spotify both normalise toward that range, so mastering louder just gets turned back down while costing you dynamic range.",
    ],
    [
      "What are the ACX audio requirements?",
      "MP3 at 192 kbps constant bitrate and 44.1 kHz, each file measuring between -23 dB and -18 dB RMS with peaks no higher than -3 dB and a noise floor at or below -60 dB RMS. Each chapter is a separate file of no more than 120 minutes, with 0.5 to 1 second of room tone at the head and 1 to 5 seconds at the tail, plus separate opening and closing credits files.",
    ],
    [
      "What is the difference between LUFS and dBTP?",
      "LUFS measures perceived loudness averaged over the programme, while dBTP measures the highest inter-sample peak the waveform reaches. You set the LUFS to match the platform target and keep dBTP below the ceiling — usually -1 dBTP — so that lossy encoding does not introduce clipping.",
    ],
    [
      "Should I deliver stems as well as a mix?",
      "Deliver stems whenever the client may need to re-version, re-dub or re-time the piece later. Stems should be full length, start at the same timecode as the master, and be exported at the master's bit depth and sample rate, otherwise they will not line up when reassembled.",
    ],
  ],
};

export default seo;
