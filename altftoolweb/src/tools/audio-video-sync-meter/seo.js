const seo = {
  title: "Audio Video Sync Meter: Lip-Sync Offset in ms",
  steps: [
    "Enter the Frame rate (fps), the Frame of the flash / clap, the Audio spike time (seconds or HH:MM:SS.mmm), and whether the first frame is numbered 1 or 0.",
    "Press \"Add to average\" to fold in a second or third slate, since reading one flash is only accurate to about half a frame.",
    "Read the Audio offset in ms, the Offset in frames and the pass/fail row for ATSC IS-191, EBU R37 and ITU-R BT.1359-1, then press Copy report.",
  ],
  metaDescription:
    "Calculate signed audio lead or lag from a flash frame, frame rate, and audio spike time, then compare the offset with cited sync limits.",
  intro:
    "An audio-video sync meter converts a clap or camera-flash slate into a signed lip-sync error in milliseconds: offset = audio spike time − (flash frame − 1) ÷ frame rate, where a positive result means the sound arrives after the picture. It then grades that offset against the published limits — ATSC IS-191 allows 15 ms of audio lead and 45 ms of lag, EBU R37 allows 40 ms and 60 ms, and ITU-R BT.1359-1 puts the detectability threshold at 45 ms lead or 125 ms lag. It is for editors and streamers who can see something is off but need the number before they can fix it.",
  useCases: [
    "Measure the lip-sync error on a two-camera or external-recorder shoot before syncing a whole timeline by hand",
    "Prove a stream or capture card is inside broadcast tolerance by checking the offset against ATSC IS-191",
    "Work out the exact -itsoffset value for an ffmpeg batch that re-muxes a folder of clips with the same delay",
  ],
  benefits: [
    ["Two readings, one number", "The frame of the flash and the timestamp of the audio spike are all you need — no plugin, no upload."],
    ["Graded against real limits", "The verdict cites ATSC, EBU and ITU thresholds rather than a made-up 'good enough' figure."],
    ["Averages several slates", "Reading one flash is accurate to about half a frame; averaging two or three claps removes most of that error."],
  ],
  faqs: [
    [
      "How much audio delay is noticeable?",
      "ITU-R BT.1359-1 puts detectability at 45 ms when audio leads the picture and 125 ms when it lags, and the point where viewers actively object at 90 ms lead and 185 ms lag. Ears are far less forgiving of sound arriving early because that never happens in nature — distant sound always arrives after the sight of the event.",
    ],
    [
      "What is the broadcast standard for lip sync?",
      "ATSC IS-191 is the tightest in common use: at the point of emission, audio must not lead video by more than 15 ms and must not lag by more than 45 ms. EBU R37 covers programme production with 40 ms lead and 60 ms lag. At 25 fps, 45 ms is a little over one frame.",
    ],
    [
      "How do I fix an audio delay with ffmpeg?",
      "Feed the same file twice and offset one input's timestamps: ffmpeg -i input.mp4 -itsoffset -0.040 -i input.mp4 -map 0:v -map 1:a -c copy synced.mp4 pulls the audio 40 ms earlier while copying both streams untouched. The sign is inverted from the measurement: audio that is late needs a negative offset.",
    ],
    [
      "Why measure with a flash instead of a clap?",
      "A camera flash lands inside a single frame, so the picture side of the measurement is unambiguous, while a clap has a visible hand movement spread over several frames. Audio is the opposite — a clap gives a sharp transient in the waveform. Using a flash for the picture and its own click or a clapperboard for the sound gives the cleanest pair of readings.",
    ],
  ],
};

export default seo;
