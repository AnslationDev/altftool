const seo = {
  title: "Base64 Audio Converter — Decode Base64 to MP3/WAV",
  h1: "Base64 Audio Converter",
  metaDescription:
    "Paste a Base64 string or data:audio URL to decode, play and download it as WAV, MP3, FLAC, OGG, M4A, AIFF or AMR. Runs in your browser — no upload.",
  intro:
    "The Base64 Audio Converter decodes a raw Base64 string or a `data:audio/…` URL back into the original audio file, plays it in the browser's built-in HTML5 audio player, and offers it back as a download. Decoding runs through a hand-written RFC 4648 lookup table rather than `atob()`, so the standard `+/` alphabet and the URL-safe `-_` variant are both accepted, and a truncated or mis-padded string is reported with the exact character position that broke it. The container is then identified from its magic bytes — RIFF/WAVE, ID3 or a bare MPEG frame sync, fLaC, OggS, FORM/AIFF, #!AMR, or an ftyp brand for M4A — and the WAV `fmt ` chunk, the first MPEG frame header or the FLAC STREAMINFO block is parsed to report sample rate, channels, bit depth, bitrate and duration. The file is rebuilt in the tab as a Blob, so nothing is ever uploaded.",
  useCases: [
    "Check that the Base64 blob returned by a text-to-speech or telephony API is really a WAV or MP3 and not an error page that got encoded",
    "Play a data:audio/mpeg URL copied out of a webhook log, JSON payload, CSS file or email source before shipping it",
    "Pull a voice note out of a database export or chat backup that stored it as a Base64 field and save it as a real .wav or .mp3",
  ],
  benefits: [
    [
      "Format read from the bytes, not the label",
      "The container is detected from the file signature, so a data URL that claims audio/wav while carrying MP3 bytes is flagged as a mismatch instead of silently trusted.",
    ],
    [
      "Real header parsing, not a guess",
      "WAV duration is data-chunk bytes ÷ byte rate, FLAC duration comes from the 36-bit total-samples field in STREAMINFO, and MP3 figures are read from the first valid frame header after any ID3v2 tag.",
    ],
    [
      "Errors that point at the problem",
      "A 4n+1 length, stray `=` padding, a percent-encoded data: URL or an out-of-alphabet character each produce a specific message — with the offending position — instead of a silent, empty player.",
    ],
    [
      "Nothing leaves the tab",
      "Decoding, format detection, playback and download all run in your browser. No upload, no account, no stored copy.",
    ],
  ],
  faqs: [
    [
      "How do I convert a Base64 string back to an audio file?",
      "Paste the string — with or without the `data:audio/wav;base64,` prefix — name the download, and press Download audio. The tool turns every 4 Base64 characters into 3 bytes per RFC 4648, matches the leading bytes against the WAV, MP3, FLAC, OGG, M4A, AIFF and AMR signatures, and saves the file with the matching extension.",
    ],
    [
      "Can this tool convert an audio file into Base64?",
      "No — it runs one direction only: Base64 in, audio out. There is no file picker on this page, just a text box. For the opposite direction, use the Audio to Base64 tool, which reads a local audio file and produces the data URL.",
    ],
    [
      "Why won't my Base64 audio play?",
      "Three causes account for almost all of it, and the tool names each one: the string is truncated (a Base64 length of 4n+1 characters cannot exist), the data: URL is percent-encoded rather than Base64, or the declared MIME type doesn't match the bytes — for example an MP3 labelled audio/wav. A fourth case is a valid Base64 string that simply isn't audio, which is reported as a missing audio signature.",
    ],
    [
      "Which audio formats does the Base64 converter recognise?",
      "Seven containers: WAV, MP3, FLAC, OGG, M4A, AIFF and AMR, all detected from their magic bytes rather than the MIME type. WAV, MP3 and FLAC also get a full header read-out (sample rate, channels, bit depth, bitrate, duration); OGG, M4A, AIFF and AMR play and download normally, but the duration row reads \"not stored in this container\".",
    ],
    [
      "How much bigger is audio once it's Base64-encoded?",
      "About 33.3% before line breaks — every 3 bytes become 4 characters. A 3 MB MP3 lands near 4 MB of Base64, which is why embedding long audio in JSON or HTML is usually a bad trade. The Base64 length row shows the exact overhead percentage for the string you pasted.",
    ],
    [
      "What's the longest Base64 string it will decode?",
      "12,000,000 characters, roughly 9 MB of decoded audio. Anything longer is rejected with a message that reports your string's actual length, because the decode runs on the page's main thread and a larger payload would cost seconds of frozen tab.",
    ],
    [
      "Is the duration shown always exact?",
      "For WAV and FLAC, yes — WAV duration is the data-chunk size divided by the byte rate, and FLAC stores a 36-bit total-sample count that is divided by the sample rate. For MP3 the figure assumes a constant bitrate (audio bytes × 8 ÷ bitrate), so a VBR file can be off by a few percent; the tool labels that result as an estimate.",
    ],
    [
      "Is my audio uploaded or stored anywhere?",
      "No. Base64 decoding, magic-byte detection, header parsing, playback and the download Blob all happen in your browser tab — the tool makes no network requests with your data. It's free, with no signup and no limit on how many strings you decode.",
    ],
  ],
  steps: [
    "Paste your Base64 string or `data:audio/…` URL into the box — whitespace and line breaks are stripped automatically, and URL-safe Base64 is accepted.",
    "Read the decoded panel: container and codec, MIME type, exact byte size, Base64 overhead, sample rate, channels, bit depth, bitrate and duration, plus any warnings about a mismatched MIME type.",
    "Press play to hear it, Download audio to save it with the detected extension, or Copy data URL to get a cleaned-up standard-Base64 data URL.",
  ],
};

export default seo;
