const seo = {
  intro:
    "The Audio-Video Sync Meter analyses a local clap or flash recording with FFmpeg compiled to WebAssembly and produces a timestamped diagnostic log you use to measure lip-sync offset: silencedetect at -30 dB with a 0.05-second minimum marks the audio transient, and showinfo prints the presentation timestamp of every video frame. Subtract the frame time of the visible clap from the audio transition time and the difference, in milliseconds, is how far the audio leads or lags. It is aimed at videographers, streamers and AV installers who suspect a delay somewhere in their capture chain and want a number rather than a hunch.",
  useCases: [
    "Diagnosing a webcam-plus-USB-microphone setup that looks slightly off in recordings: clap once on camera, run the file through, and read how many milliseconds separate the audio transient from the frame where your hands meet.",
    "Checking whether a Bluetooth headset is adding latency to a screen recording before you blame the editing software.",
    "Documenting an installed AV system's offset for a handover report, using the exported log as evidence of the frame and audio timestamps measured.",
  ],
  benefits: [
    [
      "Frame-accurate timestamps, not a slider you nudge by eye",
      "showinfo prints the exact presentation timestamp of every decoded frame, so the reference point for the clap is the frame's own pts rather than wherever your playhead happened to land.",
    ],
    [
      "The transient is found by threshold, not by scrubbing",
      "silencedetect reports each crossing of the -30 dB noise floor lasting at least 0.05 seconds, which is short enough to catch a hand clap and long enough to ignore room noise.",
    ],
    [
      "You keep the raw log",
      "The full FFmpeg diagnostic output downloads as a text file, so the measurement can be re-checked, attached to a ticket, or compared against a second take.",
    ],
  ],
  faqs: [
    [
      "How much audio delay is actually noticeable?",
      "For broadcast, ITU-R BT.1359 treats audio leading video by more than about 45 ms or lagging by more than about 125 ms as beyond the range viewers accept — the ear tolerates sound arriving late far better than early, because that is what distance does in the real world. Offsets under roughly 20 ms are generally imperceptible.",
    ],
    [
      "How do I record a good sync test clip?",
      "Point the camera at your hands, keep them clearly in frame, and clap once sharply after a couple of seconds of quiet. A single loud transient against a quiet background is what the -30 dB threshold detects cleanly; a noisy room or a soft clap produces ambiguous silence transitions.",
    ],
    [
      "Does this correct the offset for me?",
      "No. It measures and reports timestamps only — it does not re-mux the file or shift the audio track. Once you know the offset in milliseconds you apply it in your editor or capture software, which is also where you would verify the fix.",
    ],
    [
      "Is my video uploaded anywhere?",
      "No. The file is written into the FFmpeg WebAssembly engine's in-memory filesystem in your browser and analysed there; only the text log is produced, and it downloads straight to your device.",
    ],
  ],
};

export default seo;
