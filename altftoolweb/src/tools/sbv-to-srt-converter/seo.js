const seo = {
  title: "SBV to SRT Converter for YouTube Caption Downloads",
  metaDescription:
    "Convert a YouTube SBV caption file to numbered SubRip cues with zero-padded hh:mm:ss,mmm times, an optional millisecond offset — all in your browser.",
  steps: [
    "Click \"Load .sbv file\" (accepts .sbv or .txt) or paste your captions into the SBV input box.",
    "Set a \"Timing offset (milliseconds)\" to shift every cue, and choose whether to keep \">>\" speaker-change markers or merge each cue onto a single line.",
    "Check the cues-converted and overlapping-cues counts, then click \"Copy SRT\" or \"Download .srt\" to save the file.",
  ],
  intro:
    "The SBV to SRT Converter rewrites a YouTube SBV caption export as a SubRip (.srt) file. SBV has no cue numbers, writes times as H:MM:SS.mmm separated by a comma, and marks a change of speaker with a leading \">>\"; SubRip numbers every cue from 1, zero-pads the hour to two digits, uses a comma for milliseconds and separates the two times with \" --> \". This tool applies all of those changes in one pass, can shift the whole file by a millisecond offset, and runs entirely in your browser.",
  useCases: [
    "Move captions off YouTube into Premiere Pro, Resolve or Vimeo, none of which import SBV.",
    "Convert an auto-generated YouTube caption track to SRT so you can correct the wording in a normal subtitle editor.",
    "Strip the \">>\" speaker-change markers when the captions are headed for a platform that shows them as literal text.",
    "Fix a constant sync offset on a re-uploaded cut while converting, rather than re-timing every cue.",
  ],
  benefits: [
    ["Handles the real format", "Parses single-digit hours, comma-separated times and short millisecond fields the way SBV actually writes them."],
    ["Flags auto-caption problems", "Counts overlapping cues, which YouTube's automatic captions produce and many desktop players render badly."],
    ["Stays on your device", "Parsing and conversion are JavaScript running locally; the caption file is never uploaded."],
  ],
  faqs: [
    [
      "What is an SBV file?",
      "SBV is the SubViewer-derived caption format YouTube Studio offers as a download alongside SRT and VTT. Each cue is a timing line in the form 0:00:01.000,0:00:04.000 followed by one or more text lines and a blank line — there is no header and no cue numbering.",
    ],
    [
      "How do I open an SBV file?",
      "Any plain-text editor opens it, since SBV is unformatted UTF-8 text. Video editors and most players do not read it, which is why converting to SubRip or WebVTT is usually the first step after downloading captions from YouTube.",
    ],
    [
      "What does >> mean in YouTube captions?",
      "A double angle bracket marks a change of speaker, and >>> traditionally marks a change of topic or story — a convention carried over from broadcast closed captioning. SubRip has no formal equivalent, so you can either keep the markers as plain text or strip them here.",
    ],
    [
      "Why do my converted captions overlap?",
      "YouTube's automatic captions often start the next cue before the previous one ends, so words scroll rather than switch. SubRip players usually show only one cue at a time, so overlaps can make lines flicker or disappear — this tool counts them so you know to tidy the timings in a subtitle editor.",
    ],
  ],
};

export default seo;
