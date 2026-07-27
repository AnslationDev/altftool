/**
 * Audio deliverables checklist and loudness maths.
 *
 * Published specifications used below:
 *  - ACX / Audible: MP3 192 kbps constant bitrate, 44.1 kHz; each file's RMS between
 *    -23 dB and -18 dB; peak no higher than -3 dB; noise floor no higher than -60 dB RMS;
 *    0.5-1 s of room tone at the head and 1-5 s at the tail; one file per chapter with a
 *    120-minute ceiling; opening and closing credits as their own files; retail cover art
 *    at least 2400 x 2400 px, square, RGB.
 *  - Podcast delivery (Apple Podcasts / Spotify guidance, following AES streaming
 *    recommendations): -16 LUFS integrated for stereo, -19 LUFS for mono, true peak
 *    no higher than -1 dBTP.
 *  - Spotify music: playback normalised to -14 LUFS; -1 dBTP recommended, -2 dBTP if the
 *    master is already louder than -14 LUFS, to leave headroom for lossy encoding.
 *  - YouTube and most video platforms normalise loud uploads toward about -14 LUFS.
 *  - EBU R128 (European broadcast): -23 LUFS integrated, ±0.5 LU, true peak ≤ -1 dBTP.
 *  - ATSC A/85 (US broadcast): -24 LKFS, ±2 LU, true peak ≤ -2 dBTP.
 *  - Archive master convention: 24-bit WAV, 48 kHz for anything paired with video,
 *    44.1 kHz for audio-only releases.
 */

/** Bytes per second of linear PCM: sampleRate x bytesPerSample x channels. */
export function pcmBytesPerSecond({ sampleRateHz, bitDepth, channels }) {
  return sampleRateHz * (bitDepth / 8) * channels;
}

/** Bytes per second of a constant-bitrate encoded file. */
export function encodedBytesPerSecond(kbps) {
  return (kbps * 1000) / 8;
}

const BYTES_PER_MB = 1024 * 1024;

/** Delivery destinations and the spec each one publishes. */
export const DESTINATIONS = [
  {
    id: "acx",
    label: "ACX / Audible audiobook",
    format: "MP3 192 kbps CBR, 44.1 kHz",
    kbps: 192,
    loudnessTarget: null,
    rmsRange: [-23, -18],
    peakMaxDb: -3,
    noiseFloorMaxDb: -60,
    notes:
      "RMS between -23 and -18 dB, peak no higher than -3 dB, noise floor at or below -60 dB RMS. One file per chapter, 120 minutes maximum per file.",
  },
  {
    id: "podcast",
    label: "Podcast RSS (Apple, Spotify)",
    format: "MP3 128 kbps stereo or 96 kbps mono, 44.1 kHz",
    kbps: 128,
    loudnessTarget: -16,
    toleranceLu: 1,
    truePeakMaxDbtp: -1,
    notes: "-16 LUFS integrated for stereo; use -19 LUFS if you deliver a mono file.",
  },
  {
    id: "streaming-music",
    label: "Streaming music (Spotify, Apple Music)",
    format: "WAV 24-bit 44.1 kHz master",
    bitDepth: 24,
    sampleRateHz: 44100,
    loudnessTarget: -14,
    toleranceLu: 1,
    truePeakMaxDbtp: -1,
    notes: "Playback is normalised to about -14 LUFS; leave -1 dBTP so lossy encoding does not clip.",
  },
  {
    id: "video-platform",
    label: "YouTube or video platform",
    format: "WAV 24-bit 48 kHz or AAC 256 kbps",
    bitDepth: 24,
    sampleRateHz: 48000,
    loudnessTarget: -14,
    toleranceLu: 1,
    truePeakMaxDbtp: -1,
    notes: "Loud uploads are normalised down toward -14 LUFS, so mastering louder gains nothing.",
  },
  {
    id: "ebu-r128",
    label: "European broadcast (EBU R128)",
    format: "WAV 24-bit 48 kHz",
    bitDepth: 24,
    sampleRateHz: 48000,
    loudnessTarget: -23,
    toleranceLu: 0.5,
    truePeakMaxDbtp: -1,
    notes: "-23 LUFS ±0.5 LU is a hard delivery requirement for most European broadcasters.",
  },
  {
    id: "atsc-a85",
    label: "US broadcast (ATSC A/85)",
    format: "WAV 24-bit 48 kHz",
    bitDepth: 24,
    sampleRateHz: 48000,
    loudnessTarget: -24,
    toleranceLu: 2,
    truePeakMaxDbtp: -2,
    notes: "-24 LKFS ±2 LU; the CALM Act makes compliance mandatory for US broadcast advertising.",
  },
  {
    id: "client-master",
    label: "Client archive master",
    format: "WAV 24-bit 48 kHz, unprocessed",
    bitDepth: 24,
    sampleRateHz: 48000,
    loudnessTarget: null,
    notes: "Deliver the flat master so the client can remaster later without going back to you.",
  },
];

/** Project types offered. */
export const PROJECT_TYPES = [
  { id: "audiobook", label: "Audiobook" },
  { id: "podcast", label: "Podcast episode" },
  { id: "commercial", label: "Commercial or promo" },
  { id: "elearning", label: "e-Learning module" },
  { id: "music", label: "Music release" },
  { id: "game", label: "Game or app audio" },
];

/** Default archive master spec. */
export const MASTER_SPEC = { bitDepth: 24, sampleRateHz: 48000, channels: 2 };

function destinationById(id) {
  return DESTINATIONS.find((entry) => entry.id === id) || null;
}

/**
 * Gain change needed to hit a destination's loudness target, and whether the
 * resulting true peak still fits.
 *
 * @param {{measuredLufs:number, measuredTruePeak:number, destinationId:string}} input
 * @returns {object} { gainChangeLu, resultingTruePeak, peakOk, ... } or { error }
 */
export function loudnessCheck({ measuredLufs, measuredTruePeak, destinationId } = {}) {
  const destination = destinationById(destinationId);
  if (!destination) return { error: "Choose a delivery destination." };
  if (destination.loudnessTarget === null) {
    return {
      destination,
      noTarget: true,
      message: `${destination.label} has no integrated loudness target — deliver the flat master.`,
    };
  }

  const lufs = Number(measuredLufs);
  const peak = Number(measuredTruePeak);
  if (!Number.isFinite(lufs)) return { error: "Enter the measured integrated loudness in LUFS." };
  if (lufs > 0) return { error: "Integrated loudness is measured below 0 LUFS — enter a negative value." };
  if (lufs < -70) return { error: "Below -70 LUFS the measurement is effectively silence." };
  if (!Number.isFinite(peak)) return { error: "Enter the measured true peak in dBTP." };
  if (peak > 6) return { error: "A true peak above +6 dBTP is not a usable measurement." };
  if (peak < -80) return { error: "A true peak below -80 dBTP is effectively silence." };

  const gainChangeLu = destination.loudnessTarget - lufs;
  const resultingTruePeak = peak + gainChangeLu;
  const peakLimit = destination.truePeakMaxDbtp;
  const peakOk = peakLimit === undefined ? true : resultingTruePeak <= peakLimit;
  const tolerance = destination.toleranceLu || 0;

  return {
    destination,
    measuredLufs: lufs,
    measuredTruePeak: peak,
    targetLufs: destination.loudnessTarget,
    toleranceLu: tolerance,
    gainChangeLu,
    withinTolerance: Math.abs(gainChangeLu) <= tolerance,
    resultingTruePeak,
    peakLimit,
    peakOk,
    limiterHeadroomNeeded: peakOk ? 0 : resultingTruePeak - peakLimit,
  };
}

/** Estimated size in MB of one file of a given length. */
export function fileSizeMb({ minutes, kbps, bitDepth, sampleRateHz, channels = 2 }) {
  const mins = Number(minutes);
  if (!Number.isFinite(mins) || mins <= 0) return 0;
  const seconds = mins * 60;
  const bytesPerSecond = kbps
    ? encodedBytesPerSecond(kbps)
    : pcmBytesPerSecond({
        sampleRateHz: sampleRateHz || MASTER_SPEC.sampleRateHz,
        bitDepth: bitDepth || MASTER_SPEC.bitDepth,
        channels,
      });
  return (seconds * bytesPerSecond) / BYTES_PER_MB;
}

/**
 * Build the deliverables list.
 * @returns {object} { items, fileCount, totalMb } or { error }
 */
export function buildDeliverables({
  projectType = "podcast",
  destinationIds = [],
  runtimeMinutes = 30,
  chapterCount = 1,
  altLengths = 0,
  includeMaster = true,
  includeStems = false,
  stemCount = 4,
  includeTranscript = false,
  includeCaptions = false,
  includeArtwork = false,
  channels = 2,
} = {}) {
  const minutes = Number(runtimeMinutes);
  if (!Number.isFinite(minutes)) return { error: "Enter the total runtime in minutes." };
  if (minutes <= 0) return { error: "Runtime must be greater than zero minutes." };
  if (minutes > 6000) return { error: "Runtime above 100 hours is beyond a single delivery." };

  const chapters = Math.trunc(Number(chapterCount));
  if (!Number.isFinite(chapters) || chapters < 1 || chapters > 500) {
    return { error: "Chapter or part count must be between 1 and 500." };
  }

  const alts = Math.trunc(Number(altLengths));
  if (!Number.isFinite(alts) || alts < 0 || alts > 20) {
    return { error: "Alternate cutdowns must be between 0 and 20." };
  }

  const stems = Math.trunc(Number(stemCount));
  if (includeStems && (!Number.isFinite(stems) || stems < 1 || stems > 64)) {
    return { error: "Stem count must be between 1 and 64." };
  }

  const chosen = destinationIds.map(destinationById).filter(Boolean);
  if (chosen.length === 0 && !includeMaster) {
    return { error: "Pick at least one destination, or keep the archive master ticked." };
  }

  const ch = Number(channels) === 1 ? 1 : 2;
  const items = [];

  if (includeMaster) {
    items.push({
      id: "master",
      name: "Archive master",
      count: 1,
      format: `WAV ${MASTER_SPEC.bitDepth}-bit ${MASTER_SPEC.sampleRateHz / 1000} kHz, ${ch === 1 ? "mono" : "stereo"}`,
      note: "Flat, unprocessed, full length. Keep it even when no client asks for it.",
      mb: fileSizeMb({
        minutes,
        bitDepth: MASTER_SPEC.bitDepth,
        sampleRateHz: MASTER_SPEC.sampleRateHz,
        channels: ch,
      }),
    });
  }

  for (const destination of chosen) {
    const perFileMinutes = destination.id === "acx" ? minutes / chapters : minutes;
    const count = destination.id === "acx" ? chapters : 1;
    items.push({
      id: `dest-${destination.id}`,
      name: `${destination.label} delivery`,
      count,
      format: destination.format,
      note:
        destination.loudnessTarget === null
          ? destination.notes
          : `Target ${destination.loudnessTarget} LUFS${destination.toleranceLu ? ` ±${destination.toleranceLu} LU` : ""}${destination.truePeakMaxDbtp !== undefined ? `, true peak ≤ ${destination.truePeakMaxDbtp} dBTP` : ""}. ${destination.notes}`,
      mb:
        count *
        fileSizeMb({
          minutes: perFileMinutes,
          kbps: destination.kbps,
          bitDepth: destination.bitDepth,
          sampleRateHz: destination.sampleRateHz,
          channels: ch,
        }),
    });
  }

  if (destinationIds.includes("acx")) {
    items.push({
      id: "acx-credits",
      name: "Opening and closing credits files",
      count: 2,
      format: "MP3 192 kbps CBR, 44.1 kHz",
      note: "ACX requires opening and closing credits as separate files, matching the book's spec.",
      mb: 2 * fileSizeMb({ minutes: 0.5, kbps: 192 }),
    });
    items.push({
      id: "acx-sample",
      name: "Retail audio sample",
      count: 1,
      format: "MP3 192 kbps CBR, 44.1 kHz, 1 to 5 minutes",
      note: "Pulled from the body of the book, not the credits.",
      mb: fileSizeMb({ minutes: 3, kbps: 192 }),
    });
  }

  if (projectType === "commercial" && alts > 0) {
    items.push({
      id: "alt-lengths",
      name: "Alternate cutdowns",
      count: alts,
      format: "Same spec as the primary destination",
      note: "Typically :60, :30, :15 and :06 versions, each conformed to the same loudness target.",
      mb: alts * fileSizeMb({ minutes: 0.5, kbps: 192 }),
    });
  }

  if (includeStems) {
    items.push({
      id: "stems",
      name: "Stems",
      count: stems,
      format: `WAV ${MASTER_SPEC.bitDepth}-bit ${MASTER_SPEC.sampleRateHz / 1000} kHz, full length, zero-start`,
      note: "Dialogue, music, effects and any VO bed as separate files, all starting at the same timecode.",
      mb:
        stems *
        fileSizeMb({
          minutes,
          bitDepth: MASTER_SPEC.bitDepth,
          sampleRateHz: MASTER_SPEC.sampleRateHz,
          channels: ch,
        }),
    });
  }

  if (includeTranscript) {
    items.push({
      id: "transcript",
      name: "Transcript",
      count: 1,
      format: "TXT or DOCX, speaker-labelled",
      note: "Also the accessibility record and the source for show notes and SEO.",
      mb: 0.1,
    });
  }

  if (includeCaptions) {
    items.push({
      id: "captions",
      name: "Caption file",
      count: 1,
      format: "SRT or WebVTT, timed to the delivered master",
      note: "Re-time captions after any edit; a caption file drifts as soon as the audio changes.",
      mb: 0.1,
    });
  }

  if (includeArtwork) {
    items.push({
      id: "artwork",
      name: "Cover artwork",
      count: 1,
      format: "Square JPG or PNG, RGB, at least 2400 × 2400 px",
      note: "2400 px square is the ACX and podcast-directory minimum; 3000 px is safer for future use.",
      mb: 3,
    });
  }

  const fileCount = items.reduce((sum, item) => sum + item.count, 0);
  const totalMb = items.reduce((sum, item) => sum + item.mb, 0);

  return { items, fileCount, totalMb, projectType, runtimeMinutes: minutes };
}

/** Plain-text export of the deliverables list. */
export function deliverablesToText({ items, clientName = "" } = {}) {
  if (!Array.isArray(items) || items.length === 0) return "No deliverables listed.";
  const lines = [clientName ? `Audio deliverables — ${clientName}` : "Audio deliverables", ""];
  for (const item of items) {
    lines.push(`[ ] ${item.name} × ${item.count}`);
    lines.push(`    Format: ${item.format}`);
    lines.push(`    ${item.note}`);
  }
  return lines.join("\n");
}
