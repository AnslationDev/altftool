const seo = {
  intro:
    "An audio file size calculator multiplies sample rate by bit depth by channel count to get the data rate, then multiplies that by duration to give the exact size of an uncompressed PCM file. It is aimed at engineers, podcasters and archivists sizing cards, drives and uploads, and it adds the 44-byte canonical WAV header so the number matches what actually lands on disk. The same duration is then priced in FLAC, MP3, AAC and Opus using the constant-bitrate rule bytes = kbps × 1000 ÷ 8 × seconds.",
  useCases: [
    "Checking whether a three-hour 96 kHz 24-bit multitrack session will fit on a 128 GB card",
    "Estimating monthly hosting cost by converting a weekly podcast's runtime into Opus and MP3 file sizes",
    "Explaining to a client why the 1411 kbps master is 30 times larger than the 128 kbps preview",
  ],
  benefits: [
    ["Exact, not approximate", "Uncompressed sizes are deterministic, so the byte count is the real one."],
    ["Codec comparison built in", "See the same recording at seven common delivery bitrates side by side."],
    ["Container limit warning", "Flags the 4 GB RIFF/WAVE ceiling before a long take truncates."],
  ],
  faqs: [
    [
      "How do I calculate audio file size?",
      "Multiply sample rate × bit depth × channels to get bits per second, divide by 8 for bytes per second, then multiply by the duration in seconds. CD audio is 44,100 × 16 × 2 = 1,411,200 bits per second, which is 176,400 bytes per second, or about 10.6 MB per minute.",
    ],
    [
      "How big is one minute of 48 kHz 24-bit stereo audio?",
      "About 17.3 MB per minute — 48,000 × 3 bytes × 2 channels = 288,000 bytes per second, which is 17.28 MB every 60 seconds. An hour of it comes to roughly 1.04 GB before any container overhead.",
    ],
    [
      "Why does my WAV file stop at 4 GB?",
      "The RIFF header stores the file size in an unsigned 32-bit field, so a standard WAV cannot exceed 4,294,967,295 bytes — around 6.75 hours of 48 kHz 24-bit stereo. Recorders get past it by switching to RF64, Wave64 (.w64) or CAF, or by splitting the take across files.",
    ],
    [
      "Can you calculate a FLAC file's size exactly?",
      "No. FLAC is lossless, so its size depends on the material — quiet, sparse recordings compress far more than dense, loud masters. Sixteen-bit stereo music typically lands between 50% and 70% of the PCM size, which is why the FLAC row here is an adjustable estimate rather than a fixed answer.",
    ],
  ],
};

export default seo;
