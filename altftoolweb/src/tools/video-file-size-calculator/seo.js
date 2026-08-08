const seo = {
  title: "Video File Size Calculator: Bitrate x Duration",
  metaDescription:
    "Total kb/s x seconds ÷ 8 gives kilobytes, shown in MB and MiB. Derive a bitrate from resolution, fps and codec, or use ProRes fixed data rates.",
  steps: [
    "Under Duration and bitrate, enter Hours, Minutes and Seconds, then Video bitrate (kb/s) and Audio bitrate (kb/s), or tap one of the YouTube SDR recommendation chips.",
    "With no bitrate to hand, open 'Not sure what bitrate to use?' and derive one from Resolution, Frame rate (fps), Codec and Quality target.",
    "Estimated file size is reported as Size in megabytes (SI) and Size in mebibytes (binary), with Per minute of footage, Per hour of footage and a card-duration figure from Free space (GB).",
  ],
  intro:
    "This calculator returns the size of a video export from its data rate and duration, using the only formula that governs it: bits = (video bitrate + audio bitrate) × 1000 × seconds, divided by 8 for bytes. It also derives a bitrate when you do not have one, either from the pixel rate (width × height × fps × bits per pixel, adjusted for codec efficiency) or from the published fixed data rates of intra-frame codecs such as Apple ProRes. Results are given in both SI megabytes and binary mebibytes, plus per-minute and per-hour figures for storage planning.",
  useCases: [
    "Checking a one-hour 4K export will fit under a client's file transfer limit before starting the render",
    "Sizing card and drive capacity for a multi-day shoot recording ProRes 422",
    "Comparing what switching an export from H.264 to HEVC does to the delivered file size",
  ],
  benefits: [
    ["Both unit systems", "Shows SI megabytes and binary mebibytes side by side, so a 600 MB file is never mistaken for 600 MiB."],
    ["Bitrate help built in", "Derives a sensible bitrate from resolution, frame rate and codec when you do not already have one."],
    ["Plans storage, not just files", "Per-minute, per-hour and card-duration figures come from the same data rate."],
  ],
  faqs: [
    [
      "How do I calculate video file size from bitrate?",
      "Multiply the total bitrate in kilobits per second by the duration in seconds, then divide by 8 to get kilobytes. A 10 minute export at 8,000 kb/s video plus 384 kb/s audio comes to 8,384 × 600 ÷ 8 = 628,800 kilobytes, or about 629 MB.",
    ],
    [
      "What bitrate should I export 1080p at?",
      "YouTube's published recommendation for a 1080p SDR upload is 8 Mb/s at 30 fps and 12 Mb/s at 60 fps, with 384 kb/s for stereo AAC audio. As a general rule, around 0.10 bits per pixel per frame gives good H.264 quality, which works out at 6.2 Mb/s for 1080p30.",
    ],
    [
      "Does HEVC really halve the file size?",
      "Roughly, at equal visual quality. H.265/HEVC is generally cited at about half the bitrate of H.264, and AV1 about 30% below HEVC again. The saving depends heavily on the encoder, its preset and the content — flat, static footage benefits far more than fast, grainy footage.",
    ],
    [
      "Why is my exported file a different size than the estimate?",
      "Because most exports are not constant bitrate. Variable-bitrate and constant-quality modes such as CRF or CQ spend bits where the picture needs them, so a static interview lands well under the estimate while a fast-cut action sequence can approach or exceed it. Container overhead adds a small amount too, typically well under one percent.",
    ],
  ],
};

export default seo;
