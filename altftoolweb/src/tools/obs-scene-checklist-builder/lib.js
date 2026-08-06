/**
 * Pre-live checklist builder for OBS-style streaming setups.
 *
 * Encoded facts:
 *  - Ingest bitrate ranges follow the platforms' own published live-encoding recommendations for
 *    H.264. Twitch caps recommended ingest at 6000 kbps and audio at 160 kbps; YouTube publishes
 *    a range per resolution and frame rate rather than a single figure.
 *  - Both platforms ask for a keyframe interval of 2 seconds, which is what lets the transcoder
 *    cut clean segments; leaving it on "auto" is the commonest cause of a stream that will not
 *    transcode.
 *  - Upload headroom: a stream needs meaningfully more upstream bandwidth than its own bitrate,
 *    because ACKs, chat, alerts and any other device on the line share the same pipe. The rule
 *    used here is 1.5x total bitrate, which is the widely published safety margin.
 *  - Audio peaks are checked against -6 dBFS, the standard headroom target for live speech, and
 *    a stream mix is normally aimed at roughly -16 LUFS integrated.
 *
 * Pure module: no DOM, no React, no clock.
 */

/** Safety margin applied to total bitrate when sizing the upload connection. */
export const UPLOAD_HEADROOM_MULTIPLIER = 1.5;
/** Both major platforms specify a 2-second keyframe interval for H.264 ingest. */
export const KEYFRAME_INTERVAL_SECONDS = 2;
/** Standard peak headroom target for live speech, in dBFS. */
export const PEAK_TARGET_DBFS = -6;
/** Typical loudness target for a streaming mix, in LUFS. */
export const LOUDNESS_TARGET_LUFS = -16;

export const RESOLUTIONS = {
  "1080p60": { label: "1080p / 60 fps", width: 1920, height: 1080, fps: 60 },
  "1080p30": { label: "1080p / 30 fps", width: 1920, height: 1080, fps: 30 },
  "720p60": { label: "720p / 60 fps", width: 1280, height: 720, fps: 60 },
  "720p30": { label: "720p / 30 fps", width: 1280, height: 720, fps: 30 },
  "480p30": { label: "480p / 30 fps", width: 854, height: 480, fps: 30 },
};

export const PLATFORMS = {
  twitch: {
    label: "Twitch",
    maxAudioKbps: 160,
    defaultAudioKbps: 160,
    // Twitch publishes a recommended ingest ceiling of 6000 kbps for non-transcoded sources.
    bitrates: {
      "1080p60": { min: 4500, max: 6000, recommended: 6000 },
      "1080p30": { min: 3500, max: 5000, recommended: 4500 },
      "720p60": { min: 3500, max: 5000, recommended: 4500 },
      "720p30": { min: 2500, max: 4000, recommended: 3000 },
      "480p30": { min: 1200, max: 2500, recommended: 1800 },
    },
    notes: [
      "Twitch caps recommended ingest at 6000 kbps — pushing past it does not improve quality and risks dropped frames.",
      "Transcoding (quality options for viewers) is not guaranteed for every channel, so pick a bitrate your audience can actually receive.",
    ],
  },
  youtube: {
    label: "YouTube Live",
    maxAudioKbps: 384,
    defaultAudioKbps: 128,
    bitrates: {
      "1080p60": { min: 4500, max: 9000, recommended: 6000 },
      "1080p30": { min: 3000, max: 6000, recommended: 4500 },
      "720p60": { min: 2250, max: 6000, recommended: 4000 },
      "720p30": { min: 1500, max: 4000, recommended: 3000 },
      "480p30": { min: 500, max: 2000, recommended: 1500 },
    },
    notes: [
      "YouTube publishes a bitrate range rather than a single number — the top of the range only helps on high-motion content.",
      "YouTube transcodes every stream, so viewers on slow connections still get a lower-quality option.",
    ],
  },
  other: {
    label: "Other / custom RTMP",
    maxAudioKbps: 320,
    defaultAudioKbps: 160,
    bitrates: {
      "1080p60": { min: 4500, max: 8000, recommended: 6000 },
      "1080p30": { min: 3000, max: 6000, recommended: 4500 },
      "720p60": { min: 2500, max: 6000, recommended: 4000 },
      "720p30": { min: 1500, max: 4000, recommended: 3000 },
      "480p30": { min: 800, max: 2500, recommended: 1500 },
    },
    notes: [
      "Check your destination's own ingest limits before you go live — custom RTMP endpoints vary widely.",
    ],
  },
};

/**
 * Recommend encoder settings and check the upload connection has enough headroom.
 * Pure function.
 *
 * @returns {{error: string} | {videoKbps: number, audioKbps: number, totalKbps: number,
 *   requiredUploadMbps: number, headroomOk: boolean, headroomRatio: number, range: object,
 *   keyframeSeconds: number, warnings: string[]}}
 */
export function recommendStreamSettings(input = {}) {
  const platform = PLATFORMS[String(input.platform ?? "").trim()];
  if (!platform) return { error: "Pick the platform you are streaming to." };

  const resolutionKey = String(input.resolution ?? "").trim();
  const resolution = RESOLUTIONS[resolutionKey];
  if (!resolution) return { error: "Pick an output resolution and frame rate." };

  const range = platform.bitrates[resolutionKey];
  if (!range) return { error: "That resolution is not listed for this platform." };

  const audioKbps = Number(input.audioKbps ?? platform.defaultAudioKbps);
  if (!Number.isFinite(audioKbps) || audioKbps <= 0) {
    return { error: "Audio bitrate must be a positive number of kbps." };
  }
  if (audioKbps > platform.maxAudioKbps) {
    return { error: `${platform.label} accepts at most ${platform.maxAudioKbps} kbps of audio.` };
  }

  const requestedVideo = input.videoKbps === undefined || input.videoKbps === "" ? range.recommended : Number(input.videoKbps);
  if (!Number.isFinite(requestedVideo) || requestedVideo <= 0) {
    return { error: "Video bitrate must be a positive number of kbps." };
  }

  const uploadMbps = Number(input.uploadMbps);
  if (!Number.isFinite(uploadMbps) || uploadMbps <= 0) {
    return { error: "Enter your measured upload speed in Mbps — run a speed test if you are not sure." };
  }

  const totalKbps = Math.round(requestedVideo + audioKbps);
  const requiredUploadMbps = Math.round((totalKbps * UPLOAD_HEADROOM_MULTIPLIER) / 100) / 10;
  const headroomRatio = (uploadMbps * 1000) / totalKbps;
  const headroomOk = headroomRatio >= UPLOAD_HEADROOM_MULTIPLIER;

  const warnings = [];
  if (!headroomOk) {
    warnings.push(
      `Your upload is ${uploadMbps} Mbps but this stream needs about ${requiredUploadMbps} Mbps to hold a stable ${UPLOAD_HEADROOM_MULTIPLIER}x margin. Drop the bitrate or the resolution.`,
    );
  }
  if (requestedVideo > range.max) {
    warnings.push(
      `${requestedVideo} kbps is above the ${range.max} kbps top of the published range for ${resolution.label} on ${platform.label}.`,
    );
  }
  if (requestedVideo < range.min) {
    warnings.push(
      `${requestedVideo} kbps is below the ${range.min} kbps floor for ${resolution.label} — expect blocking on fast motion.`,
    );
  }
  platform.notes.forEach((note) => warnings.push(note));

  return {
    platformLabel: platform.label,
    resolutionLabel: resolution.label,
    videoKbps: Math.round(requestedVideo),
    audioKbps: Math.round(audioKbps),
    totalKbps,
    requiredUploadMbps,
    headroomOk,
    headroomRatio,
    range,
    keyframeSeconds: KEYFRAME_INTERVAL_SECONDS,
    warnings,
  };
}

/**
 * Build the pre-live checklist. Sections are always returned in the same order,
 * with optional items added only for the features the streamer actually uses.
 * Pure function.
 */
export function buildPreLiveChecklist(options = {}) {
  const {
    hasGuests = false,
    hasGameplay = false,
    hasMusic = false,
    hasAlerts = false,
    hasChatOverlay = false,
    recordsLocally = false,
    hasSecondScreen = false,
    hasCaptureCard = false,
    platformLabel = "your platform",
    keyframeSeconds = KEYFRAME_INTERVAL_SECONDS,
    videoKbps = 0,
  } = options;

  const scenes = [
    "Starting Soon, Live, Be Right Back and Ending scenes all exist and switch cleanly.",
    "Every scene has been previewed once in Studio Mode so nothing is missing a source.",
    "Scene transitions are set and the transition duration is the same everywhere.",
    "Hotkeys for scene switching are bound and tested with the app in the background.",
  ];
  if (hasSecondScreen) scenes.push("Display Capture points at the right monitor, and notifications are muted on it.");
  if (hasGameplay) scenes.push("Game Capture is set to the correct window and falls back to Display Capture if the game restarts.");

  const audio = [
    `Mic peaks around ${PEAK_TARGET_DBFS} dBFS on your loudest sentence, not into the red.`,
    `Desktop audio and mic are balanced — aim the overall mix near ${LOUDNESS_TARGET_LUFS} LUFS.`,
    "Noise suppression and a gate are on the mic, and you have listened back to a 30-second test recording.",
    "Audio monitoring is set to Monitor Off for anything the stream also hears, so nothing echoes.",
    "Every audio source is assigned to the right track if you record multi-track.",
  ];
  if (hasGuests) {
    audio.push("Guest audio arrives on its own source with its own fader, and their mic is not doubled by desktop audio.");
    audio.push("Monitoring for the guest call is set so they hear you but the stream does not hear itself.");
  }
  if (hasMusic) {
    audio.push("Music is on a separate track so it can be dropped from the VOD if a claim lands.");
    audio.push("You have confirmed the music is licensed for live streaming — a personal subscription is not a stream licence.");
  }

  const video = [
    "Camera is in focus, exposure is locked, and white balance is not drifting between scenes.",
    "Framing checked at 1080p and at a phone-sized preview — most viewers are on a small screen.",
    "Overlays and webcam frames sit inside the safe area and do not cover the platform's own UI.",
  ];
  if (hasCaptureCard) video.push("Capture card input is confirmed at the right resolution and frame rate, with no HDR mismatch.");

  const encoder = [
    `Output bitrate set${videoKbps ? ` to ${videoKbps} kbps` : ""} and the encoder preset matches your GPU or CPU headroom.`,
    `Keyframe interval set to ${keyframeSeconds} seconds, not left on auto.`,
    "Base and output resolutions are set deliberately; the downscale filter is Lanczos or Bicubic.",
    "Ran a 5-minute private test stream and checked the OBS stats dock for dropped frames.",
  ];

  const platformItems = [
    `Stream key for ${platformLabel} is current and has not been rotated since your last stream.`,
    "Title, category and tags are set before you go live, not after.",
    "Latency mode chosen deliberately — low latency for chat interaction, normal for stability.",
  ];
  if (hasAlerts) {
    platformItems.push("Fired a test alert for follow, sub and donation and confirmed the sound level.");
    platformItems.push("Alert browser source has 'Shutdown source when not visible' unticked so it does not miss events.");
  }
  if (hasChatOverlay) {
    platformItems.push("Chat overlay is readable over the busiest scene, and moderation is staffed or automated.");
  }
  if (recordsLocally) {
    platformItems.push("Local recording path has free disk space and the recording format is one that survives a crash.");
  }

  const room = [
    "Phone on silent, desktop notifications off, and any auto-updater that could steal focus disabled.",
    "Nothing personal is visible on screen: browser tabs, bookmarks, desktop files, notification previews.",
    "Water within reach and the door situation handled — you are about to be unavailable for hours.",
    "Backup plan agreed: what you switch to if the capture card, the internet or the guest call drops.",
  ];

  return [
    { id: "scenes", title: "Scenes and layout", items: scenes },
    { id: "audio", title: "Audio", items: audio },
    { id: "video", title: "Video and sources", items: video },
    { id: "encoder", title: "Encoder and output", items: encoder },
    { id: "platform", title: "Platform, alerts and recording", items: platformItems },
    { id: "room", title: "Room and privacy", items: room },
  ];
}

/** Count of every item across all sections. Pure. */
export function countChecklistItems(sections) {
  if (!Array.isArray(sections)) return 0;
  return sections.reduce((total, section) => total + (Array.isArray(section.items) ? section.items.length : 0), 0);
}
