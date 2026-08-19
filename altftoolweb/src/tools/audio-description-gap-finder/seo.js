const seo = {
  title: "Audio Description Gap Finder: Quiet Timing Gaps",
  metaDescription:
    "Decodes audio or video in your browser, measures RMS loudness, subtracts SRT/WebVTT cues, and ranks quiet gaps with in/out points and mean dBFS.",
  steps: [
    "Click Choose media to load a local audio or video file — maximum 30 MB, 10 minutes, 2 channels and 96 kHz — then paste SRT or WebVTT cues into the dialogue timing box, or use Open cues or Load sample.",
    "Under 3. Planning settings adjust RMS window (ms), Quiet threshold (dBFS), Minimum gap (seconds), Bridge brief audio (ms), Dialogue padding (ms) and Media-edge guard (ms), then press Find timing candidates.",
    "Read the ranked Candidate timing gaps, each with its in and out times, duration, mean RMS in dBFS and planning score, then press Download counts/timing only to save audio-description-gap-counts-timing-only.json.",
  ],
  intro:
    "The Audio-Description Gap Finder decodes a local audio or video file, measures RMS loudness in 250 ms windows, and lists every stretch quieter than -42 dBFS that survives after your caption cues are subtracted — the timing candidates where an audio description could be spoken. It is for describers, accessibility leads and post-production editors who need a starting list of gaps instead of scrubbing a timeline by ear. Paste SRT or WebVTT cues (or plain start,end seconds), and each surviving gap comes back with in and out points, mean dBFS, and a planning score that rewards length and quiet while penalising gaps that butt against dialogue or the media edges.",
  useCases: [
    "Planning a describe pass on a 6-minute training video: load the file, paste the existing WebVTT captions, and get the ranked list of silences longer than 1.2 seconds where narration will not collide with speech.",
    "Sanity-checking a client's claim that 'there is plenty of room to describe' before quoting the job, by counting how many candidate gaps actually clear your minimum length.",
    "Handing a describer a timing sheet: export the counts-and-timing JSON so the writer gets in/out points and durations without having to open the media themselves.",
  ],
  benefits: [
    [
      "Caption cues are subtracted, not just displayed",
      "Dialogue intervals are padded by 150 ms on each side, merged, and cut out of every quiet stretch, so a gap that only looks free because a cue ends mid-window is split rather than reported whole.",
    ],
    [
      "Every candidate is ranked and flagged",
      "The planning score adds up to 120 points for length and quietness, then subtracts 12 for sitting within the media-edge guard, 8 for being trimmed by dialogue and 5 for hugging a cue, so the risky gaps sort to the bottom.",
    ],
    [
      "Tunable thresholds instead of one fixed definition of quiet",
      "The RMS window (50-2,000 ms), quiet threshold (-90 to -6 dBFS), minimum gap (250-60,000 ms) and bridge allowance are all adjustable, so a music-bed documentary and a bare interview can each be screened sensibly.",
    ],
  ],
  faqs: [
    [
      "How long does an audio-description gap need to be?",
      "This tool defaults to 1,200 ms and lets you set anything from 250 ms to 60 seconds. In practice a usable description phrase needs a couple of seconds, so most describers raise the minimum rather than lower it — very short gaps rank low anyway because length contributes up to 120 points of the score at 4 points per second.",
    ],
    [
      "What caption formats can I paste in?",
      "SRT and WebVTT timing lines using the `-->` arrow are recognised, as is a plain manual format of two comma, semicolon or tab separated second values per line. Timestamps parse as HH:MM:SS,mmm, MM:SS.mmm or bare seconds, and the parser reports malformed, out-of-range and overlapping cue counts so you can tell whether your file was read correctly.",
    ],
    [
      "What size and length of file can it handle?",
      "Up to 30 MB and 10 minutes, with 1 or 2 channels at a sample rate between 8 kHz and 96 kHz, and a hard ceiling of 24 million sample values. Caption input is capped at 500,000 characters or 5,000 cue timings, and the results list returns the top 200 candidates.",
    ],
    [
      "Does this make my video WCAG compliant?",
      "No. It only finds timing candidates for a human to review — it does not judge whether a gap is semantically appropriate, does not write description text, and is not an accessibility conformance check. WCAG 2.1 success criteria 1.2.3 and 1.2.5 concern the description itself, so the written and recorded output still needs review by a describer.",
    ],
  ],
};

export default seo;
