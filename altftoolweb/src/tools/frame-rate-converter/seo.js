const seo = {
  title: "Frame Rate Converter: 23.976 to 120 fps in Browser",
  metaDescription:
    "Convert a video to 23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60 or 120 fps with FFmpeg.wasm - H.264 MP4 at CRF 18, nothing uploaded.",
  steps: [
    "Press Select Video or drop a file on the upload area; the page reports its Frame Rate, Duration and Resolution.",
    "Choose a Target Frame Rate from the ten options between 23.976 and 120 fps, then press Convert to N fps.",
    "Download converted_<fps>fps.mp4, re-encoded with libx264 at CRF 18 in yuv420p.",
  ],
  intro:
    "Frame Rate Converter re-encodes a video to a different frame rate in the browser using FFmpeg compiled to WebAssembly, applying the `fps` filter and writing an H.264 MP4 at CRF 18. Ten standard targets are offered — 23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60 and 120 fps — and the source rate is measured first by timing ten decoded frames, so you can see what you are converting from. It suits editors and creators who need a clip to match a timeline's rate without opening an NLE or uploading footage anywhere.",
  useCases: [
    "Dropping a 60 fps phone clip to 24 fps so it cuts into a film-rate timeline without the editor conforming it for you",
    "Converting a 30 fps screen recording to 25 fps for a PAL-region broadcast or a European client's delivery spec",
    "Checking what a 120 fps capture actually looks like at 30 fps before committing to a slow-motion edit",
  ],
  benefits: [
    ["Broadcast rates included, not just round numbers", "The NTSC pull-down rates 23.976, 29.97 and 59.94 are selectable alongside 24, 25, 30, 48, 50, 60 and 120."],
    ["It tells you the source rate first", "Frame timing is sampled over ten decoded frames via requestVideoFrameCallback, so you are not guessing what the file already is."],
    ["Near-visually-lossless re-encode", "Output is H.264 at CRF 18 with yuv420p pixel format, a setting chosen for quality rather than the smallest file."],
  ],
  faqs: [
    [
      "What frame rates can I convert to?",
      "Ten: 23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60 and 120 fps. The list covers cinema (24), PAL (25 and 50), NTSC (23.976, 29.97, 59.94) and high-frame-rate capture.",
    ],
    [
      "Does converting to a higher frame rate make motion smoother?",
      "No. The `fps` filter duplicates existing frames to reach a higher rate and drops frames to reach a lower one — it does not synthesise new in-between frames, so going from 30 to 60 fps adds file size without adding motion detail.",
    ],
    [
      "Will the quality drop?",
      "The video is re-encoded, so it is not a lossless copy, but it is encoded with libx264 at CRF 18 — a setting generally treated as visually lossless for most footage. Converting the same file repeatedly will still compound generation loss.",
    ],
    [
      "Is my video uploaded anywhere?",
      "No. FFmpeg runs as WebAssembly inside the page, so the file is read from disk into browser memory and the converted MP4 is produced locally. Large files are limited by your device's RAM rather than by an upload cap.",
    ],
  ],
};

export default seo;
