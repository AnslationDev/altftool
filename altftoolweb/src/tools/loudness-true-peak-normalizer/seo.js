const seo = {
  title: "LUFS Loudness Normalizer: -14, -16 or -23",
  metaDescription:
    "Run FFmpeg loudnorm on audio or video in your browser to hit -14, -16 or -23 LUFS with a -1.5 dBTP ceiling, and download a WAV.",
  steps: [
    "Pick an audio or video file under Source file — the picker accepts audio/* and video/* input.",
    "Set Target to -14 LUFS, -16 LUFS or -23 LUFS and press Process locally; FFmpeg WebAssembly runs loudnorm=I=target:TP=-1.5:LRA=11 on the file in memory.",
    "The normalised audio downloads as altftool-loudness-true-peak-normalizer.wav, with the FFmpeg log shown in the Local processing report.",
  ],
  intro:
    "Loudness & True-Peak Normalizer runs the EBU R128 loudness normalisation pass (FFmpeg's loudnorm filter) over an audio or video file, retargeting integrated loudness to -14, -16 or -23 LUFS while holding true peak at -1.5 dBTP and loudness range at 11 LU. Unlike peak normalisation, which just scales the waveform until the loudest sample hits 0 dBFS, this measures perceived loudness across the whole programme, so two files normalised to the same LUFS target actually sound equally loud. Podcasters, video editors and musicians get a WAV that meets the platform spec instead of guessing at a fader move.",
  useCases: [
    "You mixed a podcast episode by ear and it plays noticeably quieter than the show you edited last week, so you normalise both to -16 LUFS and the difference disappears.",
    "A broadcaster or festival has asked for deliverables at -23 LUFS with true peak headroom, and you need a compliant file rather than an explanation of why your mix is fine.",
    "Your track sounds crunchy after upload even though the master never clipped — you re-render at -1.5 dBTP so the lossy encoder has room for inter-sample peaks.",
  ],
  benefits: [
    [
      "Loudness, not peak",
      "Integrated LUFS measurement matches how loudness is perceived over time, so a quiet track with one loud transient is not left quiet the way peak normalisation leaves it.",
    ],
    [
      "True-peak headroom built in",
      "Every target is rendered with a -1.5 dBTP ceiling, which is the margin that keeps reconstructed inter-sample peaks from clipping after MP3 or AAC encoding.",
    ],
    [
      "Video files accepted too",
      "You can point it at a video file and get the normalised audio out, without demuxing the track by hand first.",
    ],
  ],
  faqs: [
    [
      "What LUFS should I normalise a podcast to?",
      "-16 LUFS integrated for stereo is the widely used podcast target and matches Apple Podcasts' recommendation; mono spoken word is usually delivered around -19 LUFS. Pick -16 LUFS here and keep the true peak at or below -1 dBTP.",
    ],
    [
      "What is the difference between LUFS and dBFS?",
      "dBFS measures sample amplitude at a single instant, while LUFS measures perceived loudness averaged over the programme using the R128 frequency weighting. That is why two files can both peak at 0 dBFS and still differ by 8 LU in how loud they sound.",
    ],
    [
      "Why is the true peak set to -1.5 dBTP instead of 0?",
      "Because lossy encoders reconstruct a waveform that can overshoot the original samples. EBU R128 permits a maximum of -1 dBTP, and -1.5 dBTP gives an extra half decibel of margin so MP3, AAC and Opus versions do not clip on playback.",
    ],
    [
      "Which target should I use for music streaming?",
      "-14 LUFS is the usual streaming reference — Spotify normalises playback to about -14 LUFS by default. Mastering much louder than that gains you nothing on those platforms, because the service simply turns your track back down.",
    ],
  ],
};

export default seo;
