const seo = {
  title: "SRT to VTT Converter with Timing Offset - No Upload",
  metaDescription:
    "Converts SubRip to WebVTT in your browser: adds the WEBVTT header, swaps comma timestamps for full stops, shifts cue timing in ms and downloads a .vtt.",
  steps: [
    "Paste SubRip text into the \"SubRip (.srt) input\" box or click \"Load .srt file\" (accepts .srt and .txt).",
    "Set the \"Timing offset (milliseconds)\" and tick the conversion options: keep cue numbers as identifiers, convert {\\anN} alignment tags, remove <font> tags.",
    "Click \"Download .vtt\" to save the converted file (your chosen name plus .vtt), or \"Copy VTT\" - parsing runs locally and nothing is uploaded.",
  ],
  intro:
    "The SRT to VTT Converter rewrites a SubRip subtitle file as a W3C WebVTT file that the HTML5 <track> element will accept. It adds the mandatory WEBVTT header, changes the millisecond separator from a comma to a full stop, escapes stray ampersands and angle brackets in the cue text, drops legacy SubRip X1/Y1 coordinates, and can translate SubStation {\\anN} alignment overrides into WebVTT line and align cue settings. Conversion happens entirely in your browser, so the subtitle file is never uploaded.",
  useCases: [
    "Publish captions on a self-hosted HTML5 video where <track kind=\"captions\"> only reads WebVTT, not SubRip.",
    "Prepare caption files for an HLS or DASH stream, where WebVTT is the required sideloaded subtitle format.",
    "Shift every cue by a fixed number of milliseconds when the captions run ahead of or behind the audio.",
    "Clean an SRT exported from an old desktop editor that still carries <font color> tags and X1/X2 coordinates.",
  ],
  benefits: [
    ["Spec-correct output", "Emits the WEBVTT header, full-stop timestamps and escaped cue text exactly as the W3C spec requires."],
    ["Nothing is uploaded", "Parsing and conversion run in JavaScript on your device, so client footage stays private."],
    ["Fixes drift as it converts", "A millisecond offset is applied to every cue in one pass, with negative values clamped at zero."],
  ],
  faqs: [
    [
      "What is the difference between SRT and VTT?",
      "The main difference is the timestamp separator and the header: SubRip writes 00:00:01,000 with a comma and has no header, while WebVTT writes 00:00:01.000 with a full stop and must begin with the line WEBVTT. WebVTT also supports cue settings for position and alignment, CSS styling through ::cue, and cue identifiers, none of which SubRip has.",
    ],
    [
      "Why won't my SRT file play in an HTML5 video?",
      "Browsers only accept WebVTT in the <track> element — SubRip is not a supported track format in any major browser. Convert the file to .vtt, serve it with the text/vtt MIME type, and make sure it is on the same origin or sent with permissive CORS headers.",
    ],
    [
      "Does converting SRT to VTT lose any formatting?",
      "Bold, italic and underline tags carry across unchanged because WebVTT supports <b>, <i> and <u>. What is lost is <font color> styling and SubRip's X1/X2/Y1/Y2 coordinates, since WebVTT handles colour through CSS ::cue rules and position through line, position and align cue settings instead.",
    ],
    [
      "How do I fix subtitles that are out of sync?",
      "Enter the drift in milliseconds in the timing offset field — a positive number delays every cue, a negative number pulls it earlier. Measure the gap on one clearly spoken line first; if the drift grows over the runtime rather than staying constant, the frame rate is mismatched and a flat offset will not fix it.",
    ],
  ],
};

export default seo;
