const seo = {
  intro:
    "The Video Bitrate Calculator works out the raw and compressed bitrate of a clip from width x height x bit depth x frame rate, then divides by a codec compression ratio to estimate the delivered stream and the finished file size. Pick a resolution from 360p to 4K UHD, a frame rate from 23.976 to 60 fps, an 8-, 10- or 12-bit depth, a codec, and a duration, and you get raw Mbps, compressed Mbps, raw MB and compressed MB side by side. It is built for editors, streamers and anyone sizing storage or an upload before committing to an export.",
  useCases: [
    "You are about to shoot a 20-minute 4K interview and need to know whether the card in your bag holds the raw footage before you drive to the location.",
    "A client asks for a 1080p60 H.264 master under a hard 25 MB email limit and you need to see the file size the settings will actually produce.",
    "You are comparing AV1 against H.264 for a web hero video and want the size difference at the same resolution and frame rate before re-encoding the library.",
  ],
  benefits: [
    [
      "Shows raw and compressed side by side",
      "You see the uncompressed pixel throughput and the codec-reduced figure together, so the compression ratio you chose is visible rather than assumed.",
    ],
    [
      "Eight named codec profiles",
      "ProRes 4444, ProRes 422, DNxHR HQ, H.264, HEVC/H.265, VP9 and AV1 each carry their own ratio, so intermediates and delivery codecs are not lumped together.",
    ],
    [
      "Bitrate and storage in one pass",
      "Duration is part of the calculation, so the same screen answers both what your link must sustain and how many megabytes land on disk.",
    ],
  ],
  faqs: [
    [
      "How is video bitrate calculated?",
      "Multiply the pixel count by the bit depth to get bits per frame, then multiply by the frame rate to get bits per second. At 1080p (1920x1080), 8-bit, 30 fps that is 2,073,600 x 8 x 30 = about 497.66 Mbps raw, which is then divided by the codec's compression ratio.",
    ],
    [
      "What bitrate does 1080p 30fps H.264 need?",
      "This calculator returns roughly 14.2 Mbps, using its H.264 compression ratio of 35 against the 497.66 Mbps raw figure. Real encoders vary widely with motion and grain, so treat it as a starting target and check the encoder's own output.",
    ],
    [
      "How do I convert bitrate to file size?",
      "File size in megabytes is bitrate in bits per second multiplied by duration in seconds, divided by 8, then divided by 1024 twice. A 60-second clip at 14.2 Mbps works out to roughly 101 MB, which the calculator reports for you.",
    ],
    [
      "Why is the compressed figure only an estimate?",
      "Because it applies a fixed ratio per codec rather than encoding your footage. A static talking head compresses far harder than fast-moving, grainy or high-detail footage at the same settings, so the real bitrate a variable-rate encoder produces will move around this number.",
    ],
  ],
};

export default seo;
