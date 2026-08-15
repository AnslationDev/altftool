const seo = {
  title: "OBS Pre-Live Checklist + Bitrate and Upload",
  metaDescription:
    "Build a pre-live OBS checklist for scenes, audio, alerts and privacy, with the platform's bitrate range, 2-second keyframes and 1.5x upload headroom.",
  steps: [
    "Choose the Platform and Output resolution, then enter your Measured upload speed (Mbps) and Audio bitrate (kbps).",
    "Tick what applies under What is in this stream? - gameplay capture, a second monitor, a capture card, guests, music, alerts, chat overlay or local recording.",
    "Read Total ingest bitrate against the platform's range, the upload needed at a 1.5x margin and the 2-second keyframe interval, then work the checklist sections.",
  ],
  intro:
    "This builder produces a pre-live checklist for an OBS-style setup — scenes, audio, sources, encoder, alerts and privacy — and sizes the stream at the same time. It applies each platform's published H.264 live-encoding range for your resolution and frame rate, adds the audio bitrate, and checks your measured upload against a 1.5x headroom margin so a stream does not start dropping frames ten minutes in. Sections adapt to what you actually run: guests, gameplay capture, music, alerts, chat overlay and local recording each add their own items.",
  useCases: [
    "Confirm a 1080p60 stream fits on your connection before you announce a go-live time.",
    "Run the same 30-point check every stream so the recurring mistakes stop recurring.",
    "Add the guest-audio and monitoring items only on the days you actually have a co-host.",
    "Hand a repeatable pre-flight list to whoever runs the stream when you are not there.",
  ],
  benefits: [
    ["Real bitrate ranges", "Uses each platform's published ranges instead of one number copied from a forum."],
    ["Headroom, not just bitrate", "Checks upload against a 1.5x margin, which is what stops mid-stream frame drops."],
    ["Only the items you need", "Guests, music, alerts and capture cards add their own checks and nothing else."],
  ],
  faqs: [
    [
      "What bitrate should I stream at?",
      "For 1080p60, Twitch recommends up to 6000 kbps and YouTube publishes a 4500-9000 kbps range; for 720p30 both sit around 3000 kbps. Pick a number your upload can hold continuously rather than the highest you can briefly reach, because a stream that saturates the line drops frames.",
    ],
    [
      "How much upload speed do I need to stream?",
      "About 1.5 times your total bitrate. A 6000 kbps video stream plus 160 kbps audio is 6160 kbps, so plan for roughly 9.2 Mbps of stable upload — and remember everything else in the house shares that pipe.",
    ],
    [
      "What keyframe interval should OBS use?",
      "Two seconds. Both Twitch and YouTube specify a 2-second keyframe interval for H.264 ingest, and leaving it on 'auto' is one of the commonest reasons a stream fails to transcode into lower-quality options for viewers.",
    ],
    [
      "Why does my stream drop frames even though my internet is fast?",
      "Dropped frames in the OBS stats dock almost always mean network congestion rather than raw speed: another device saturating the upload, Wi-Fi interference, or a bitrate set too close to your actual ceiling. Test on a wired connection at a lower bitrate first, then raise it until the drops start.",
    ],
  ],
};

export default seo;
