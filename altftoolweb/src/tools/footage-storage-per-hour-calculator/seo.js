const seo = {
  title: "Video Storage Per Hour: ProRes, DNxHR & H.265",
  metaDescription:
    "Turn a codec's bitrate into GB per hour — ProRes and DNxHR scale with resolution and frame rate — plus card runtime and how many cards a shoot needs.",
  steps: [
    "Choose the 'Codec / recording format' — ProRes, DNxHR, XAVC S, H.264/H.265 presets or 'Custom bitrate (Mbps)' — then set 'Frame width (px)', 'Frame height (px)' and 'Frame rate (fps)', or tap a resolution preset.",
    "Enter 'Hours recorded', 'Card / drive size (GB)' and the audio channels, bit depth (16/24-bit or 32-bit float) and sample rate (44.1 to 192 kHz).",
    "Read 'Storage per hour' in GB (with the GiB figure the OS shows), 'Runtime on one card' in minutes and 'Cards needed', then press 'Copy result'.",
  ],
  intro:
    "This calculator converts a codec's data rate into storage: gigabytes per hour equals the combined video and audio bitrate in megabits per second multiplied by 3,600, divided by 8, then divided by 1,000. Intraframe codecs such as ProRes and DNxHR are scaled by pixels per second, so changing resolution or frame rate updates the figure the way the camera actually behaves. Shooters, DITs and producers use it to size cards, shuttle drives and archive budgets before a shoot rather than after.",
  useCases: [
    "Working out how many 256 GB CFexpress cards a two-camera 4K ProRes 422 HQ day needs before a rental order goes in",
    "Sizing a shuttle SSD and an LTO archive for a documentary that will record 40 hours of DNxHR SQ",
    "Comparing the card cost of shooting UHD 50p ProRes against a 100 Mbps H.265 camera mode for the same runtime",
  ],
  benefits: [
    ["Scales with the format", "ProRes and DNxHR rates recompute from pixels per second, not a fixed table row"],
    ["Counts the audio too", "Uncompressed PCM tracks are added at channels x bit depth x sample rate"],
    ["Decimal and binary", "Shows both the GB on the card label and the GiB your operating system reports"],
  ],
  faqs: [
    [
      "How much storage does one hour of 4K ProRes 422 HQ use?",
      "About 330 GB per hour at UHD 3840x2160 25p, because ProRes 422 HQ runs roughly 734 Mbps at that pixel rate. The same codec at 1920x1080 29.97p is 220 Mbps, which works out to 99 GB per hour.",
    ],
    [
      "Why does my card hold less than the printed capacity?",
      "Manufacturers count 1 GB as 1,000,000,000 bytes while operating systems display gibibytes of 1,073,741,824 bytes, a gap of about 7%. A 256 GB card therefore shows around 238 GiB, and formatting overhead takes a little more.",
    ],
    [
      "Does frame rate change the file size?",
      "For intraframe codecs, yes and almost linearly: doubling from 25 to 50 fps roughly doubles the data rate because twice as many complete frames are encoded each second. Fixed-bitrate camera modes such as a 100 Mbps XAVC S setting hold the same rate and lose quality instead.",
    ],
    [
      "How much headroom should I add to the estimate?",
      "Add about 20% for long-GOP H.264 and H.265 formats, whose bitrate rises with motion and detail, and keep at least 10-15% free space on any card or SSD so writes stay fast. Intraframe codecs are near constant, so the calculated figure is close to final.",
    ],
  ],
};

export default seo;
