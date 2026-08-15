const seo = {
  title: "OBS Stream Settings Calculator: Bitrate, Keyframe, VBV",
  metaDescription:
    "Set platform, resolution, fps and upload speed for a bitrate capped at 70% of upload and the Twitch 6,000 or YouTube 9,000 kbps ceiling. Exports JSON.",
  steps: [
    "Choose the platform — YouTube, Twitch, Kick, TikTok Live or Custom RTMP — plus resolution, FPS and your upload speed in Mbps.",
    "Set content type, encoder (NVENC, x264, AV1 or HEVC), latency mode, CBR or VBR, packet loss and CPU headroom percentages.",
    "Read the video bitrate, 2s keyframe, B-frames and VBV buffer, then press Copy Preset or Export JSON for stream-settings-profile.json.",
  ],
  intro:
    "The Stream Settings Calculator turns your resolution, frame rate, content type and upload speed into a complete OBS-ready encoder profile — video bitrate, audio bitrate, keyframe interval, B-frames, buffer size and encoder preset. It starts from a 4,500 kbps baseline for 720p30 and scales it by resolution (1.6× for 1080p, 3.8× for 4K), frame rate (1.45× for 60 fps), motion (1.35× for sports, 0.85× for a slide presentation), then caps the result at 70% of your upload speed and at the platform's own ceiling — 6,000 kbps on Twitch, 9,000 on YouTube. It is for streamers who keep dropping frames and want settings matched to their actual connection rather than a copied preset.",
  useCases: [
    "You keep dropping frames on Twitch and want to know whether the fix is lowering the bitrate, dropping to 30 fps, or stepping down from 1080p.",
    "You are moving a stream from Twitch to YouTube and need to know how much extra bitrate the higher ceiling actually lets you use at the same resolution.",
    "You have a 10 Mbps upload and want the highest settings that still leave enough headroom that a household Zoom call does not knock you offline.",
  ],
  benefits: [
    ["Content type changes the answer", "A fast-motion shooter and a static slide deck need very different bitrates at the same resolution — a 1.35× to 0.85× spread — so the recommendation reflects what you actually stream."],
    ["Upload speed is a hard constraint, not a note", "The bitrate is capped at 70% of your measured upload, then a stability rating and drop-risk score tell you how much room is left before the stream starts buffering."],
    ["Gives you a fallback profile too", "Alongside the main settings it suggests the step-down — lower resolution, halved frame rate, about 78% of the bitrate — so you have a plan ready when the connection degrades mid-stream."],
  ],
  faqs: [
    [
      "What bitrate should I stream at for 1080p 60fps?",
      "On Twitch the practical answer is 6,000 kbps, because that is the platform ceiling this calculator clamps to, and on YouTube you can go to 9,000. The unconstrained estimate for 1080p60 gaming is higher than either, which is why most 1080p60 Twitch streams look softer than the same content on YouTube.",
    ],
    [
      "How much upload speed do I need to stream?",
      "Enough that your bitrate uses no more than about 70% of it — that is the safety margin applied here, leaving room for retransmits and everything else on the network. For a 6,000 kbps stream that means roughly 8.6 Mbps of reliable upload, and headroom above 4,000 kbps is what earns an 'excellent' stability rating.",
    ],
    [
      "What keyframe interval should I use for streaming?",
      "2 seconds, for every major platform — YouTube, Twitch, Kick, Facebook and TikTok all expect it, and it must be fixed rather than auto. A variable or longer interval breaks the platform's ability to cut the stream into segments and is a common cause of transcoding failures.",
    ],
    [
      "Should I use CBR or VBR for live streaming?",
      "CBR for almost all live platforms, because they expect a constant rate and their ingest handles it far more predictably. VBR shaves roughly 6% off the average bitrate for the same perceived quality, but the peaks are what break a marginal connection — only use it if your platform explicitly recommends it.",
    ],
  ],
};

export default seo;
