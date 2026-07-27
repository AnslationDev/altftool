const seo = {
  intro:
    "The Base64 Audio Converter decodes a Base64 string or a data:audio/… URL back into the original audio file, identifies the container from its magic bytes, and plays it in the page. It reads the RIFF/WAVE fmt chunk, the MPEG frame header and the FLAC STREAMINFO block to report sample rate, channels, bit depth and duration. It is for developers debugging audio embedded in JSON, HTML or an API response, where the payload has to be checked without saving it anywhere.",
  useCases: [
    "Confirm that an audio blob returned by a text-to-speech API is really a WAV and not an HTML error page that got Base64-encoded",
    "Play back a data:audio/mpeg URL pasted out of a CSS file, email source or webhook log before shipping it",
    "Recover a voice note that only exists as a Base64 field in a database export, and save it as a .wav or .mp3",
  ],
  benefits: [
    ["Format read from the bytes", "The container is detected from the file signature, not from the MIME type the sender claimed."],
    ["Real header parsing", "WAV duration comes from data-chunk bytes ÷ byte rate; FLAC duration comes from the total-samples field."],
    ["Never leaves the tab", "Decoding, playback and download all run in your browser — no upload, no server copy."],
  ],
  faqs: [
    [
      "How do I convert a Base64 string back to an audio file?",
      "Paste the string (with or without the `data:audio/wav;base64,` prefix) and press Download. The tool decodes 4 Base64 characters into every 3 bytes per RFC 4648, checks the first bytes for a WAV, MP3, FLAC, OGG, M4A, AIFF or AMR signature, and saves the result with the matching extension.",
    ],
    [
      "How much bigger is audio once it is Base64-encoded?",
      "Exactly 33.3% bigger before line breaks: every 3 bytes become 4 characters. A 3 MB MP3 becomes roughly 4 MB of Base64, which is why embedding long audio in JSON or HTML is usually a bad trade.",
    ],
    [
      "Why does my Base64 audio not play?",
      "The three usual causes are a truncated string (a Base64 length of 4n+1 characters is impossible and is reported as an error), a data: URL that is percent-encoded instead of Base64, or a MIME type that does not match the bytes — for example an MP3 labelled audio/wav. This tool flags all three.",
    ],
    [
      "Is the duration shown always exact?",
      "For WAV and FLAC, yes: WAV duration is the data-chunk size divided by the byte rate, and FLAC stores a 36-bit total-sample count. For MP3 the figure assumes a constant bitrate (audio bytes × 8 ÷ bitrate), so a variable-bitrate file can be off by a few percent; the tool labels that estimate.",
    ],
  ],
};

export default seo;
