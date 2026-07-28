const seo = {
  intro:
    "The Video Render Time Estimator predicts how long an export will run by counting the work involved — width x height x frame rate x timeline seconds gives the pixels the machine must process — and dividing it by a throughput figure for your machine class, then scaling by codec, effects and source-format cost. The baseline is calibrated so a mid-range desktop with a modern GPU exports a plain 1080p30 H.264 timeline at about three times real time, which is where most editing benchmarks sit. It is for editors and producers who need to know whether a delivery will make a deadline before committing to the render.",
  useCases: [
    "Check whether a 45-minute 4K timeline with a heavy grade will finish overnight or spill into the morning.",
    "Compare a hardware H.264 export against a CPU-encoded H.265 master before choosing a delivery codec.",
    "Justify a workstation upgrade by seeing what the same export costs in hours on each machine class.",
    "Decide whether to cut on proxies by comparing RAW debayer cost against intra-frame source media.",
  ],
  benefits: [
    [
      "Pixel-based model",
      "Work scales with resolution, frame rate and length rather than a single vague speed multiplier.",
    ],
    [
      "Separates the costs",
      "Codec, effects load and source decode are shown as individual multipliers so you can see what to change.",
    ],
    [
      "Machine comparison",
      "One table shows the same timeline on a laptop, a mid-range desktop and a workstation.",
    ],
  ],
  faqs: [
    [
      "How long does it take to export a 10-minute 4K video?",
      "On a mid-range desktop with a modern GPU, a 10-minute 3840x2160 30 fps timeline with light grading and long-GOP source exports in roughly 24 minutes using a hardware H.264 encoder. The same timeline is about four times slower on an integrated-graphics laptop and about half the time on a current high-end GPU.",
    ],
    [
      "Why is CPU encoding so much slower than GPU encoding?",
      "Hardware encoders such as NVENC, Intel Quick Sync and the Apple Media Engine are fixed-function silicon that only does one job, so they run roughly six to twelve times faster than the same codec on general-purpose CPU cores. CPU encoders like x264 and x265 spend that time on wider motion search and better rate control, which buys a few percent of quality at the same bitrate.",
    ],
    [
      "Does adding effects really slow down a render that much?",
      "Yes. Cuts-only timelines cost roughly the transcode alone, a light grade with titles adds about 40%, and stabilisation, noise reduction or motion graphics can quadruple the time because those effects re-process every pixel of every frame before the encoder sees it. Pre-rendering the heaviest sections usually costs less overall than re-exporting the sequence twice.",
    ],
    [
      "Should I export in one pass or two?",
      "Use one pass with constant quality (CRF) or constant bitrate for almost everything — it is roughly half the render time. Two-pass encoding only helps when you must hit an exact file size or a broadcast bitrate spec, because the first pass exists purely to gather statistics for the second.",
    ],
  ],
};

export default seo;
