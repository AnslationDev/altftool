const seo = {
  title: "SRT to TXT Converter: Plain Text Transcript",
  metaDescription:
    "Strip timecodes and [MUSIC] tags from an .srt file and re-flow it into paragraphs at each pause, with word count, reading time and speaking rate.",
  steps: [
    "Paste your captions into the 'SubRip (.srt) input' box or press 'Load .srt file', which accepts .srt and .txt; a sample caption file is loaded to begin with.",
    "Set 'New paragraph after a pause of (ms)' or press the Tight, Natural and Loose presets (1000, 2000 and 4000 ms), then tick the Clean-up options: remove [MUSIC] and ♪ captions, collapse repeated roll-up lines, keep >> speaker-change markers, prefix each paragraph with [hh:mm:ss].",
    "Read 'Words in the transcript' with Characters, Speaking rate and 'Reading time at 238 wpm', then press 'Copy text' or 'Download .txt', which saves under the 'Download file name' you set.",
  ],
  intro:
    "The SRT to Plain Transcript tool strips cue numbers, timecodes and caption markup from a SubRip file and re-flows the remaining words into paragraphs. It starts a new paragraph wherever the silence between two cues is longer than the gap you set — 2 seconds by default — so the breaks fall where the speaker actually paused, and it can drop non-speech captions such as [MUSIC] or ♪ and collapse the repeated lines that roll-up captioning produces. Word count, reading time and words-per-minute speaking rate are calculated from the file itself.",
  useCases: [
    "Turn a video's caption file into a blog post or show-notes draft without retyping any of it.",
    "Produce an accessible text alternative to publish alongside a video for WCAG 2.2 conformance.",
    "Get a searchable transcript of a webinar or lecture recording you only have captions for.",
    "Check how fast a presenter is speaking before re-recording — the tool reports words per minute from the cue timings.",
  ],
  benefits: [
    ["Paragraphs where the pauses are", "Breaks come from the actual cue timings, not from an arbitrary line count."],
    ["Caption noise removed", "Sound descriptions, styling tags and repeated roll-up lines are filtered out in one pass."],
    ["Numbers you can act on", "Word count, characters, speaking rate and reading time are all derived from your file."],
  ],
  faqs: [
    [
      "How do I convert an SRT file to plain text?",
      "Paste or load the .srt file, and the cue numbers plus every hh:mm:ss,mmm timing line are removed automatically, leaving only the spoken text. Adjust the paragraph gap if the result runs together or breaks too often, then copy the text or download it as .txt.",
    ],
    [
      "How long does it take to read a transcript?",
      "Divide the word count by about 238 words per minute, the mean adult silent-reading rate for English non-fiction found in Brysbaert's 2019 meta-analysis of 190 studies. A 3,000-word transcript therefore takes roughly 13 minutes to read, against maybe 20 minutes to watch, which is why transcripts are popular.",
    ],
    [
      "What is a normal speaking rate in a video?",
      "Conversational English runs about 120 to 160 words per minute, presentations and narration a little slower at 100 to 150, and fast podcast conversation can exceed 180. This tool divides the transcript's word count by the runtime between the first and last cue that actually contains dialogue — filtered-out cues like a music intro or outro are excluded — so you can compare a recording against that range.",
    ],
    [
      "Why does my transcript still have [Music] or speaker markers in it?",
      "Those come from the caption file and are only removed when the matching option is on. Non-speech captions are conventionally written inside square brackets or marked with ♪, and >> marks a change of speaker — turn the sound-cue filter on to drop the first and leave the speaker-marker option off to drop the second.",
    ],
  ],
};

export default seo;
