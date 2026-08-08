const seo = {
  title: "Voice Memo Review Time and Backlog Calculator",
  metaDescription:
    "Totals your voice memos into listening time at your playback speed, real review time, transcription hours and the days needed to clear the queue.",
  steps: [
    "List each memo under Recordings to review — the Duration field accepts M:SS, H:MM:SS or plain minutes — using Add recording for extra rows.",
    "Under How you review, set Playback speed, Review factor (1 = pure playback), Transcription ratio, Review minutes available per day and Recording bitrate (kbps).",
    "Read Real review time above rows for Review sessions needed, Days to clear with new audio arriving and Estimated storage, then press Copy result.",
  ],
  intro:
    "The Audio Note Duration Budgeter totals a list of voice memos and converts that raw duration into the time it will really take to deal with them: listening time is the total divided by your playback speed, review time multiplies that by a factor covering pausing, rewinding and writing notes, and transcription time is the raw audio multiplied by your typing ratio. It then converts the result into review sessions, days at your daily capacity, and days to clear the queue while new recordings keep arriving. Useful for anyone whose voice-memo folder has quietly become a second inbox.",
  useCases: [
    "Deciding whether a 65-minute pile of memos fits into today or needs to be spread across three sessions.",
    "Working out whether 30 minutes a day of review is enough when you record 10 minutes of new audio daily.",
    "Estimating how long manual transcription of a 45-minute client call will actually take before quoting for it.",
    "Checking how much disk or cloud storage a month of 128 kbps recordings will occupy.",
  ],
  benefits: [
    ["Review time, not playback time", "Counts the pausing and note-writing that make a 45-minute recording cost far more than 45 minutes."],
    ["Queue maths included", "Compares your daily review capacity against your daily recording habit and says whether the backlog can ever clear."],
    ["Flexible duration entry", "M:SS, H:MM:SS or plain minutes all parse, so you can copy figures straight out of your recorder app."],
  ],
  faqs: [
    [
      "How long does it take to review an hour of recorded audio?",
      "Longer than an hour of playback in almost every case. At 1.5x speed an hour of audio is 40 minutes of listening, but once you add pausing, rewinding and writing things down — a review factor of about 1.5 — it is closer to an hour of real work. Measure one session honestly and use your own factor.",
    ],
    [
      "How long does it take to transcribe audio manually?",
      "Roughly 4 minutes of typing per minute of clear, single-speaker audio is the usual planning figure, so a 45-minute call is about 3 hours. Poor audio quality, crosstalk or several speakers pushes it to 6:1 or worse, which is why timestamped, speaker-separated recordings pay for themselves.",
    ],
    [
      "Does listening at 2x speed actually halve the time?",
      "It halves the playback duration, but not the total work: you still stop to write things down, and at higher speeds you rewind more often, which is exactly what the review factor is for. Playback speed reduces listening time, while the review factor is applied on top of it.",
    ],
    [
      "How much storage does an hour of voice recording use?",
      "Multiply the bitrate by the duration and divide by 8: an hour at 128 kbps is about 57.6 MB, while the same hour at 64 kbps is about 28.8 MB. Speech is intelligible at far lower bitrates than music, so dropping to 64 kbps for voice memos halves storage with little practical loss.",
    ],
  ],
};

export default seo;
