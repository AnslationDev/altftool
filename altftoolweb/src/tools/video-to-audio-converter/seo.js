const seo = {
  title: "Extract Audio from Video to WAV or Opus, with a Timeline",
  metaDescription:
    "Pull audio from video in your browser, trim, split and reorder clips on a timeline, then export 16-bit WAV or Opus at 64-256 kbps. No upload.",
  steps: [
    "Drop video or audio files into the media pool (accepts video/* and audio/*, multiple files at once).",
    "Trim clip edges, Split at the playhead, reorder and set fade in, fade out and gain, then pick 'Export as' WAV, WEBM or OGG and click 'Render mix'.",
    "Click 'Download' to save the finished mix as splice-deck-mix.wav, .webm or .ogg.",
  ],
  intro:
    "The Video to Audio Converter pulls the audio track out of video files in your browser using the Web Audio API, then gives you a real timeline where each clip can be trimmed, split, reordered, faded and gain-adjusted before export. Finished audio downloads as 16-bit PCM WAV rendered at the source sample rate, or as Opus in a WebM or Ogg container at 64, 128, 192 or 256 kbps. It is for podcasters, editors and students who need the sound from a recording as a usable file, not just a raw dump.",
  useCases: [
    "You recorded a two-camera interview and need one clean audio file, so you drop both videos in, trim the dead air off each and reorder them into a single export.",
    "A lecture recording has a five-minute stretch worth keeping; you set the in and out points on the timeline and export just that section as WAV for transcription.",
    "You are assembling a podcast intro from three video clips and need a short crossfade feel, so you add a fade-in and fade-out to each and export at 192 kbps.",
  ],
  benefits: [
    [
      "A timeline, not a one-shot converter",
      "Every imported file becomes a clip you can trim by dragging its edges, split at the playhead, drag to reorder, and set fade-in, fade-out and gain on individually.",
    ],
    [
      "Falls back to live capture when decoding fails",
      "If a video's audio cannot be decoded directly, the tool plays it through an audio graph and records the stream at 256 kbps rather than just reporting an error.",
    ],
    [
      "Lossless WAV when you need it",
      "The WAV path renders the whole timeline through an OfflineAudioContext and writes uncompressed 16-bit PCM at the source sample rate, so nothing is re-compressed before you hand it to an editor or transcriber.",
    ],
  ],
  faqs: [
    [
      "What audio formats can I export?",
      "WAV as uncompressed 16-bit PCM at the source sample rate, or Opus in a WebM or Ogg container at 64, 128, 192 or 256 kbps. Pick WAV for editing and transcription; pick a compressed format for sharing or upload.",
    ],
    [
      "Are my video files uploaded?",
      "No. Files are read as array buffers and decoded by your browser's own Web Audio engine, the timeline is rendered locally, and the export is created as a blob and downloaded. Nothing is transmitted to a server at any stage.",
    ],
    [
      "Can I trim and join clips, or does it just extract the whole track?",
      "You can do both. Each source added to the timeline arrives as a full-length clip with adjustable in and out points, and can be split at the playhead, deleted, dragged into a new order, and given its own fade-in, fade-out and gain before everything renders as one file.",
    ],
    [
      "Which browsers does it need?",
      "One that provides MediaRecorder, AudioContext and OfflineAudioContext — recent Chrome and Edge are the safest choice, and the tool checks for all three on load and tells you if any are missing. Keyboard control uses Space to play or pause, Delete to remove a clip and the arrow keys to nudge the playhead.",
    ],
  ],
};

export default seo;
