const seo = {
  title: "MP3 Cutter & Audio Trimmer — Free Online, No Upload",
  h1: "MP3 Cutter / Audio Trimmer",
  metaDescription:
    "Cut MP3, WAV, M4A, OGG and FLAC audio in your browser with a waveform, fades and loudness normalize. FFmpeg runs locally — your file is never uploaded.",
  intro:
    "The MP3 Cutter / Audio Trimmer extracts a clip from an audio file using FFmpeg compiled to WebAssembly (@ffmpeg/core 0.12.10), running inside the page instead of on a server. Your file is written into FFmpeg's in-memory filesystem and cut with `-ss <start> -t <length>`, then either stream-copied with `-c copy` or re-encoded through libmp3lame, AAC, libvorbis or 16-bit PCM. The waveform above the timeline is built separately by the Web Audio API, which decodes the file with decodeAudioData and reduces it to 160 peak-amplitude buckets. The audio itself is never uploaded — the only network request is the one-time fetch of the FFmpeg WebAssembly core from unpkg on your first cut.",
  useCases: [
    "Cutting a 30-second ringtone or alarm out of a full song and exporting it as MP3 at 320 kbps",
    "Trimming dead air off the start and end of a podcast episode or voice note, with a short fade in and fade out on the edges",
    "Pulling a quotable clip out of an interview or lecture recording for social media, with loudness normalize on so it plays at a consistent level",
  ],
  benefits: [
    [
      "Your audio never leaves the device",
      "FFmpeg runs as WebAssembly inside the page, so the file goes from your disk into browser memory and the clip comes back as a download. Only the FFmpeg core files are fetched from unpkg, once, on your first cut.",
    ],
    [
      "Fast Cut skips re-encoding entirely",
      "Keep the original format with no filters and the clip is stream-copied with -c copy — no generation loss and a near-instant export. Changing format or adding a fade, gain or normalize switches to a re-encode automatically.",
    ],
    [
      "Real audio filters, not just a cut",
      "Fade in and fade out up to 10 seconds each in 0.1 s steps, volume gain from -12 to +12 dB, and EBU R128 loudness normalize at I=-16 LUFS, true peak -1.5 dBTP, LRA 11.",
    ],
    [
      "Hundredth-of-a-second selection",
      "Start and end are set with 0.01 s sliders, exact numeric inputs, or Set Start / Set End at the current playhead, then handed to FFmpeg as HH:MM:SS.mmm timestamps.",
    ],
  ],
  faqs: [
    [
      "How do I cut an MP3 without losing quality?",
      "Choose Fast Cut, keep the output format as Original, and leave fades, volume gain and normalize off. That path runs FFmpeg with -c copy, which copies the already-encoded audio frames straight through instead of decoding and re-encoding them, so the clip is identical to that section of the source. The moment you change format or add a filter the tool must re-encode — for MP3 that means libmp3lame at the bitrate you pick, up to 320 kbps.",
    ],
    [
      "Is this MP3 cutter free, and does it upload my file?",
      "It is free, needs no account, and your audio is never uploaded. Cutting happens through FFmpeg compiled to WebAssembly in your own browser tab. The one thing fetched over the network is the FFmpeg engine itself (@ffmpeg/core 0.12.10 from unpkg), downloaded on your first cut, so you need to be online for that initial load.",
    ],
    [
      "What audio formats can I cut and export?",
      "Input: MP3, WAV, M4A, AAC, OGG and FLAC. Export: MP3 (libmp3lame), WAV (16-bit PCM), M4A (AAC), OGG (Vorbis at quality 5), or Original to keep the source container. MP3 and M4A exports offer 96, 128, 192, 256 or 320 kbps with 192 as the default; WAV is uncompressed, so no bitrate applies.",
    ],
    [
      "How precise can the cut be?",
      "To one hundredth of a second. Both the range sliders and the numeric second inputs step in 0.01 s, values are kept to three decimals, and the times are passed to FFmpeg as HH:MM:SS.mmm. The shortest clip the tool will export is 0.05 seconds. You can also play the file and press Set Start or Set End to snap a boundary to the current playhead.",
    ],
    [
      "Why is my Fast Cut slightly off from where I set it?",
      "Because stream copy can only cut on existing frame boundaries. Fast Cut passes -c copy, so FFmpeg keeps whole encoded frames and snaps your start point to the nearest one — an MP3 frame is about 26 ms at 44.1 kHz, so the cut can land a few tens of milliseconds away. Switch to Processed Cut when the boundary has to be exactly where you put it; it decodes and re-encodes, which is slower but not tied to frame edges.",
    ],
    [
      "How do I make a ringtone from a song?",
      "Load the song, set the range to the hook you want (around 30 seconds), add a 1-2 second fade in and fade out so it does not start abruptly, and export as MP3 or M4A. Android accepts the MP3 directly in its Ringtones folder. For iPhone, export M4A and rename the file extension to .m4r before adding it through Finder or iTunes.",
    ],
    [
      "What does loudness normalize actually do?",
      "It re-levels the clip to a consistent perceived loudness with FFmpeg's loudnorm filter, set here to I=-16 LUFS, true peak -1.5 dBTP and loudness range 11 — the EBU R128 target commonly used for podcasts and web audio. Turn it on when a recording is too quiet or when you are assembling clips from different sources; leave it off if you want the source dynamics untouched.",
    ],
    [
      "Is there a file size or length limit?",
      "The tool sets no fixed limit — the ceiling is your device's memory, because the whole file is held in browser memory and copied into FFmpeg's virtual filesystem. Long, high-bitrate files and WAV sources are the ones most likely to strain a phone or a low-RAM laptop. If a large file fails, use Fast Cut or export a shorter range.",
    ],
  ],
  steps: [
    "Drag in or select an MP3, WAV, M4A, AAC, OGG or FLAC file — the duration and 160-bar waveform appear once the browser has decoded it.",
    "Set the clip with the start and end sliders, the exact second inputs, or the Set Start / Set End buttons, then press Play Selection to check the range.",
    "Pick Fast Cut or Processed Cut, choose the output format and bitrate, add fades, gain or normalize if you need them, then press Cut Audio and download the clip.",
  ],
};

export default seo;
