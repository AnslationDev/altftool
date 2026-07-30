const seo = {
  intro:
    "This marker is a plain-text timeline sheet for a short vertical video: you write one line per moment in the form timestamp | label | note — 00:02.500 | Beat | Visual change — next to a 9:16 preview frame that draws the top safe-zone boundary and the bottom band where captions and player controls sit. You can drop in a reference frame or clip to look at while you write, then export the whole sheet as a dated text report. It is for creators and editors planning where the hook lands and what has to stay clear of the interface, before they open an editor.",
  useCases: [
    "You are reviewing a rough cut with a client and need a numbered list of exact timestamps where the hook, each beat and each claim on screen occurs.",
    "Your text keeps getting hidden behind the caption bar, so you drop a frame into the 9:16 preview and mark which elements sit inside the obstruction band.",
    "You are handing a clip to an editor and want a single file listing every cut point and the reason for it, rather than a thread of voice notes.",
  ],
  benefits: [
    [
      "The safe-zone frame is always in view",
      "A 9:16 preview with a marked top boundary and a bottom caption and controls band sits beside your notes as you write them.",
    ],
    [
      "Millisecond timestamps, not vague cues",
      "The sheet uses mm:ss.mmm, so 00:02.500 means a specific frame instead of 'around two seconds in'.",
    ],
    [
      "Exports a dated handoff file",
      "The report carries an ISO 8601 generation timestamp with your notes, so two versions of the same clip never get confused.",
    ],
  ],
  faqs: [
    [
      "What format should the timestamps be in?",
      "Minutes, seconds and milliseconds: 00:02.500. Each line takes three parts separated by the pipe character — timestamp, label, note — and the starter sheet uses the labels Hook, Beat and Review, which you can rename to whatever your team uses.",
    ],
    [
      "Does it analyse my video or detect cuts automatically?",
      "No. Nothing is scanned or auto-detected — this is a structured notepad plus a safe-zone preview, and every timestamp is one you decide and type. The optional image or video you attach is shown as a reference only.",
    ],
    [
      "What do I get when I export?",
      "A plain .txt file containing the tool name, an ISO 8601 timestamp of when it was generated, your full sheet, and a closing reminder to check the timings and safe-zone assumptions against a real platform preview. It downloads as altftool-short-video-hook-marker.txt.",
    ],
    [
      "Are the safe zones exact for TikTok, Reels and Shorts?",
      "No — the frame is a generic 9:16 guide, not a per-platform overlay, and each app places its caption, handle and button furniture differently and changes it over time. Use it to plan, then confirm in each platform's own upload preview before publishing.",
    ],
  ],
};

export default seo;
