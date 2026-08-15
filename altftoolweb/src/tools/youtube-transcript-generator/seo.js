const seo = {
  title: "YouTube Transcript Generator: SRT, VTT, json3",
  metaDescription:
    "Paste YouTube's Show transcript panel or drop a .srt, .vtt or .json3 file to get timestamped paragraphs, word count, speaking rate — all in your browser.",
  steps: [
    "Paste the \"Show transcript\" panel into \"Caption text\", or use \"Or upload a caption file\" to load a .srt, .vtt or .json3 file, and optionally paste the video URL — it is used only to name the download.",
    "Set \"New paragraph after a pause of (seconds)\" anywhere from 0.5 to 10, and tick \"Remove [Music] style sound labels\", \"De-duplicate rolling auto-captions\" and \"Keep a timestamp on each paragraph\".",
    "Read the Transcript words figure with Detected format, Caption span, Speaking rate, Characters, Reading time at 238 wpm and Video ID, then \"Copy transcript\" or \"Download\", which saves <videoId>-transcript.txt.",
  ],
  intro:
    "The YouTube Transcript Generator converts YouTube caption data into a clean, readable transcript: paste the text from a video's \"Show transcript\" panel, or drop in a downloaded .srt, .vtt or .json3 caption file, and it rebuilds the words into paragraphs with timestamps. It parses all four caption formats, strips [Music] style sound labels and the repeated lines that YouTube's rolling auto-captions produce, then reports word count, caption duration, speaking rate and reading time at 238 words per minute. It is built for creators writing show notes, students turning lectures into study notes, and marketers repurposing video into blog posts — all in the browser, with nothing uploaded to a server.",
  useCases: [
    "A creator pasting the transcript panel from their own 20-minute video to draft show notes and chapter descriptions",
    "A student converting a downloaded lecture .vtt caption file into paragraphed notes with timestamps to jump back to a topic",
    "A content marketer checking a video's speaking rate in words per minute before rewriting the script tighter",
  ],
  benefits: [
    ["Four caption formats", "Reads SubRip .srt, WebVTT .vtt, YouTube json3 and plain transcript-panel text without any setup."],
    ["No repeated lines", "Rolling auto-caption cues that repeat the previous line are de-duplicated, so the word count is honest."],
    ["Runs in your browser", "Caption text is parsed on your device and never uploaded, so private or unlisted video captions stay with you."],
  ],
  faqs: [
    [
      "How do I get the transcript text out of a YouTube video?",
      "Open the video, click the three-dot menu under it (or the \"...more\" area in the description) and choose \"Show transcript\". The panel opens beside the video; select all of it, copy, and paste it here. This tool cannot fetch captions from a URL by itself, because YouTube does not allow a web page in your browser to read another site's caption data.",
    ],
    [
      "Why is the word count lower than the number of words I can see in the captions?",
      "YouTube's automatic captions roll: each new cue repeats the line before it so the text stays on screen. This tool removes that repeated prefix, so a cue reading \"hello there\" followed by \"hello there friends\" counts four words, not five. Switch the de-duplicate option off if you want the raw cue text preserved exactly.",
    ],
    [
      "How is the reading time calculated?",
      "Word count divided by 238 words per minute, the mean silent reading rate for English non-fiction from Brysbaert's 2019 meta-analysis of reading-speed studies. Speaking rate is a separate figure: transcript words divided by the caption span in minutes, which for most presenters lands between 120 and 160 words per minute.",
    ],
    [
      "What decides where one paragraph ends and the next begins?",
      "A gap in speech of 2 seconds or more between caption cues starts a new paragraph, and a paragraph is also closed once it reaches 90 words. You can move the gap anywhere from 0.5 to 10 seconds — a smaller gap gives short, dialogue-like paragraphs, a larger gap gives long prose blocks.",
    ],
  ],
};

export default seo;
