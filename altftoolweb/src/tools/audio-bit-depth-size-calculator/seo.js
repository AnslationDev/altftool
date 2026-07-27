const seo = {
  intro:
    "Audio Bit Depth Size Calculator returns the exact size of an uncompressed linear PCM recording from sample rate × bit depth × channels × duration, divided by eight bits per byte. Because PCM stores every sample frame in the same number of bits, the answer is exact rather than an estimate — unlike lossy or lossless codecs whose size depends on the material. It also reports the bitrate, size per minute and hour, and how long a recording can run before hitting the 4 GiB RIFF ceiling of a classic .wav.",
  useCases: [
    "Budgeting card space before a multitrack session: 24-bit/48 kHz across 12 channels runs about 5.8 GiB per hour.",
    "Checking whether a long live capture will break the 4 GiB WAV limit and needs RF64 or Wave64 instead.",
    "Comparing the storage cost of tracking at 96 kHz/24-bit against 48 kHz/24-bit before committing a project.",
    "Explaining to a client why a 3-minute stereo master is about 32 MB as a 16-bit WAV but under 3 MB as a 128 kbit/s MP3.",
  ],
  benefits: [
    ["Exact, not estimated", "Linear PCM has a fixed bits-per-frame, so the size is arithmetic rather than a guess."],
    ["Container-aware", "Adds the 44-byte canonical WAV header and flags when the 4 GiB RIFF limit is exceeded."],
    ["Card planning", "Converts free space in GB into usable recording time at your exact format."],
  ],
  faqs: [
    [
      "How do you calculate uncompressed audio file size?",
      "Multiply sample rate (Hz) by bit depth (bits) by channel count, then divide by 8 to get bytes per second, and multiply by the duration in seconds. CD audio is 44,100 × 16 × 2 ÷ 8 = 176,400 bytes per second, so one minute is 10,584,000 bytes (about 10.09 MiB).",
    ],
    [
      "What is the bitrate of CD-quality audio?",
      "1,411.2 kbit/s — that is 44,100 samples per second × 16 bits × 2 channels. A 24-bit/96 kHz stereo file is 4,608 kbit/s, roughly 3.3 times larger for the same running time.",
    ],
    [
      "Why can't a WAV file be larger than 4 GB?",
      "The RIFF container stores chunk sizes in unsigned 32-bit fields, capping a file at 4,294,967,295 bytes. At 24-bit/48 kHz stereo that is about 4 hours 8 minutes; longer captures need RF64/BW64 or Sony Wave64, which use 64-bit size fields.",
    ],
    [
      "Does 32-bit float take more space than 24-bit?",
      "Yes — one third more, because each sample occupies 32 bits instead of 24. The benefit is headroom rather than resolution: 32-bit float recordings can be pulled back from apparent clipping, which is why many field recorders now offer it despite the larger files.",
    ],
  ],
};

export default seo;
