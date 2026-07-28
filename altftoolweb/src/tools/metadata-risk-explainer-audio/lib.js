export const CHANNELS = Object.freeze([
  { id: "social", label: "Public social audio/video post", stripsMetadata: true, renamesFile: true, note: "Most platforms reprocess media, but voices and background sounds remain." },
  { id: "chat", label: "Work chat or shared drive", stripsMetadata: false, renamesFile: false, note: "Original audio files are often retained with tags and filenames intact." },
  { id: "email", label: "Email attachment", stripsMetadata: false, renamesFile: false, note: "Attachments usually preserve the original bytes, tags and filename." },
  { id: "podcast", label: "Podcast / public download", stripsMetadata: false, renamesFile: false, note: "Metadata is intentionally distributed to subscribers and indexers." },
  { id: "messaging", label: "Messaging voice note", stripsMetadata: true, renamesFile: true, note: "Apps often recompress voice notes, but speech and ambient sound still identify context." },
]);

export const SIGNALS = Object.freeze([
  { id: "artist-title", group: "Tags", label: "Artist, title and album tags", carrier: "embedded", severity: "medium", reveals: "ID3, iTunes or Vorbis tags can expose a real name, project title, client name or internal meeting label.", fix: "Clear descriptive tags before sharing raw audio." },
  { id: "creation-time", group: "Tags", label: "Creation and modification time", carrier: "embedded", severity: "medium", reveals: "Recorder apps and DAWs can write exact timestamps that reveal when the file was captured or exported.", fix: "Export a clean copy with normalized metadata." },
  { id: "device-app", group: "Device fingerprint", label: "Recorder app, DAW or device model", carrier: "embedded", severity: "medium", reveals: "Encoder strings can identify Voice Memos, WhatsApp, a DAW, a phone model or a field recorder.", fix: "Transcode through a neutral export preset." },
  { id: "gps-location", group: "Location", label: "Location title or GPS tag", carrier: "embedded", severity: "high", reveals: "Some recorders, voice-note tools and library managers store place names or coordinates.", fix: "Disable location tagging and remove metadata." },
  { id: "filename", group: "Filename", label: "Default filename", carrier: "filename", severity: "medium", reveals: "A name such as Meeting_Nikhil_2026-07-28.m4a reveals people, purpose and date even if tags are stripped.", fix: "Rename the file to a neutral label." },
  { id: "voices", group: "Audio content", label: "Speaker voices", carrier: "content", severity: "high", reveals: "Voice identity, accent, names spoken aloud and call-and-response patterns survive every metadata cleaner.", fix: "Mute, bleep, distort or re-record where consent is unclear." },
  { id: "ambient", group: "Audio content", label: "Ambient location sounds", carrier: "content", severity: "medium", reveals: "Station announcements, traffic, office chatter, temple bells or school bells can identify place and routine.", fix: "Apply noise reduction or trim the sensitive section." },
  { id: "transcript", group: "Companion data", label: "Transcript or chapter sidecar", carrier: "embedded", severity: "medium", reveals: "Lyrics, transcripts, chapter names and cue sheets may contain names or internal notes.", fix: "Remove unused tracks and sidecar files." },
  { id: "cover-art", group: "Companion data", label: "Embedded cover art", carrier: "embedded", severity: "low", reveals: "Cover images can include faces, logos, screenshots or location clues not heard in the audio.", fix: "Delete embedded artwork before distribution." },
]);

const WEIGHT = Object.freeze({ low: 1, medium: 3, high: 6 });
const BANDS = Object.freeze([
  { id: "none", label: "No surviving signals", min: 0, max: 0, advice: "No selected metadata survives this channel, but still review the audio itself." },
  { id: "low", label: "Low exposure", min: 1, max: 24, advice: "A quick tag clean and filename check should be enough." },
  { id: "moderate", label: "Moderate exposure", min: 25, max: 49, advice: "Strip tags, rename the file and review the waveform/audio content." },
  { id: "high", label: "High exposure", min: 50, max: 74, advice: "Identifying audio or tags survive; redact before sharing." },
  { id: "severe", label: "Severe exposure", min: 75, max: 100, advice: "Do not share this recording as-is." },
]);

export function groupedSignals() {
  return SIGNALS.reduce((groups, signal) => {
    let group = groups.find((entry) => entry.name === signal.group);
    if (!group) {
      group = { name: signal.group, items: [] };
      groups.push(group);
    }
    group.items.push(signal);
    return groups;
  }, []);
}

function survives(signal, channel) {
  if (signal.carrier === "content") return true;
  if (signal.carrier === "filename") return !channel.renamesFile;
  return !channel.stripsMetadata;
}

function bandFor(score) {
  return BANDS.find((band) => score >= band.min && score <= band.max) || BANDS[BANDS.length - 1];
}

export function assessAudioMetadataRisk({ selectedIds = [], channelId = "chat" } = {}) {
  const channel = CHANNELS.find((entry) => entry.id === channelId);
  if (!channel) return { error: "Choose a valid sharing channel." };
  if (!Array.isArray(selectedIds)) return { error: "Selected signals must be a list." };

  const selected = Array.from(new Set(selectedIds))
    .map((id) => SIGNALS.find((signal) => signal.id === id))
    .filter(Boolean);
  const maxWeight = SIGNALS.reduce((sum, signal) => sum + WEIGHT[signal.severity], 0);
  const surviving = selected.filter((signal) => survives(signal, channel));
  const removed = selected.filter((signal) => !survives(signal, channel));
  const score = maxWeight
    ? Math.round((surviving.reduce((sum, signal) => sum + WEIGHT[signal.severity], 0) / maxWeight) * 100)
    : 0;

  return {
    score,
    band: bandFor(score),
    channel,
    selectedCount: selected.length,
    surviving,
    removed,
    actions: surviving
      .slice()
      .sort((a, b) => WEIGHT[b.severity] - WEIGHT[a.severity])
      .map((signal) => ({ label: signal.label, severity: signal.severity, fix: signal.fix })),
  };
}
