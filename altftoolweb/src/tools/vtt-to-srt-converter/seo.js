const seo = {
  title: "VTT to SRT Converter: Clean SubRip from WebVTT Captions",
  metaDescription:
    "Convert WebVTT to SubRip in your browser: strips NOTE/STYLE/REGION blocks, decodes entities, renumbers cues, applies a ms offset and saves a .srt file.",
  steps: [
    "Paste WebVTT text or click Load .vtt file, then set a Timing offset in milliseconds if the captions drift (negative values pull them earlier).",
    "Toggle the Conversion options: turn <v Name> voice spans into 'Name:' prefixes, keep <b>, <i> and <u> tags, or re-express cue positioning as {\\anN} overrides.",
    "Check the cue count and the SubRip output preview, then click Copy SRT or Download .srt to save the renumbered file.",
  ],
  intro:
    "The VTT to SRT Converter rewrites a W3C WebVTT caption file as a SubRip (.srt) file that video editors, DVD authoring tools and desktop players accept. It removes the WEBVTT header and any NOTE, STYLE or REGION blocks, changes the millisecond separator from a full stop to a comma, decodes escaped entities such as &amp; and &lt;, unwraps WebVTT-only markup like <c> class spans and karaoke timestamp tags, and renumbers every cue from 1. It runs entirely in your browser.",
  useCases: [
    "Import captions downloaded from a streaming platform into Premiere Pro, DaVinci Resolve or Final Cut, which read SubRip more reliably than WebVTT.",
    "Convert auto-generated WebVTT captions to SRT before uploading them to a platform whose caption uploader only accepts .srt.",
    "Flatten <v Speaker> voice spans into plain \"Speaker:\" prefixes so a transcript reads correctly outside a WebVTT renderer.",
    "Correct a fixed sync offset while converting, instead of re-timing every cue by hand.",
  ],
  benefits: [
    ["Handles the whole spec", "NOTE, STYLE and REGION blocks, cue identifiers and cue settings are all recognised and removed cleanly."],
    ["Readable speaker names", "Voice spans become plain-text speaker prefixes instead of vanishing with the tag."],
    ["Private by design", "Conversion runs in JavaScript on your device; the caption file is never sent anywhere."],
  ],
  faqs: [
    [
      "Can I convert VTT to SRT without losing anything?",
      "Timings and text convert exactly; what cannot survive is WebVTT-only information. Cue settings (line, position, size, align), region definitions, CSS ::cue styling and class spans have no SubRip equivalent, though this converter can re-express basic alignment as a {\\anN} override that VLC and MPC-HC understand.",
    ],
    [
      "Why does my SRT show characters like &amp; instead of &?",
      "WebVTT stores cue text as escaped markup, so an ampersand is written &amp; and a less-than sign is written &lt;. SubRip is plain text, so those references have to be decoded on conversion — this tool decodes &amp;, &lt;, &gt;, &nbsp;, &lrm; and &rlm; automatically.",
    ],
    [
      "Does SRT support italics and bold?",
      "Most SubRip renderers, including VLC, MPV and MPC-HC, honour <i>, <b> and <u> tags even though they are not part of any formal SubRip specification. Keep the styling option on for those players, and turn it off if your target software shows the tags as literal text.",
    ],
    [
      "What encoding should I save an SRT file in?",
      "Save it as UTF-8 without a byte-order mark. SubRip has no way to declare its own encoding, so a player configured for a legacy code page such as Windows-1252 may render accented or non-Latin characters incorrectly; most modern players default to UTF-8.",
    ],
  ],
};

export default seo;
