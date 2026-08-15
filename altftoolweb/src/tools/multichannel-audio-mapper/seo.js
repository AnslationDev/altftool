const seo = {
  title: "Audio Channel Mapper — Swap Stereo or Fold to Mono",
  metaDescription:
    "Remap audio channels with FFmpeg WebAssembly in your browser: swap left/right or fold one channel to mono, from any audio or video file, out as WAV.",
  steps: [
    "Pick an audio or video file under 'Source file' — the input accepts audio/* and video/*, so an MP4 or MOV works without demuxing the audio first.",
    "Choose keep, swap-stereo, left-mono or right-mono from the 'Mapping' menu, then press 'Process locally' to run FFmpeg's pan filter in the browser tab.",
    "The remapped audio downloads as altftool-multichannel-audio-mapper.wav, with progress and the FFmpeg log shown in the 'Local processing report' panel.",
  ],
  intro:
    "Multichannel Audio Mapper rewrites the channel layout of an audio or video file using FFmpeg's pan filter, with four mappings: keep the layout unchanged, swap left and right, fold the left channel to mono, or fold the right channel to mono. It runs FFmpeg compiled to WebAssembly inside the page, takes any audio or video input, and writes out a WAV. It exists for the moment you discover an interview was recorded with the useful voice on one channel and hiss on the other.",
  useCases: [
    "A two-person interview was recorded with each mic on its own channel and you only need the guest, so you extract the right channel as mono.",
    "A field recorder's cables were reversed and the whole take plays with left and right inverted; swapping the channels fixes it without re-recording.",
    "A camera clip has a dead or noisy left channel, and you fold the good right channel to mono so the audio is usable in an edit.",
  ],
  benefits: [
    [
      "Real FFmpeg pan filtering, not a volume trick",
      "Mono folds are done with pan=mono|c0=c0 or c0=c1, which selects a source channel outright rather than muting one side and leaving a lopsided stereo file.",
    ],
    [
      "Takes video files, returns the audio",
      "You can feed an MP4 or MOV straight in instead of demuxing the audio first, and the remapped result comes back as a WAV.",
    ],
    [
      "The file never leaves the machine",
      "FFmpeg runs as WebAssembly in the browser tab, so an unreleased recording is processed locally rather than uploaded for conversion.",
    ],
  ],
  faqs: [
    [
      "What do the four mapping options do?",
      "Keep passes audio through unchanged (an anull filter), swap-stereo exchanges the two channels with pan=stereo|c0=c1|c1=c0, left-mono outputs only the original left channel as mono, and right-mono outputs only the original right channel as mono.",
    ],
    [
      "What format is the output?",
      "WAV, regardless of what you feed in. That keeps the remap lossless with no second round of lossy encoding, at the cost of a larger file; re-encode to AAC or MP3 afterwards if you need it small.",
    ],
    [
      "Can I remap 5.1 or other surround layouts?",
      "The four presets here cover stereo and mono operations on the first two channels. A 5.1 file will load, but the mono options take channel 0 or channel 1 only, so a bespoke surround remap needs a custom pan filter rather than these presets.",
    ],
    [
      "Does my audio get uploaded anywhere?",
      "No. Processing happens in the browser through FFmpeg's WebAssembly build, so the media stays on your device. The FFmpeg core itself, version 0.12.10, is fetched from a public CDN on first use, which means the first run needs a network connection and takes longer than later runs.",
    ],
  ],
};

export default seo;
