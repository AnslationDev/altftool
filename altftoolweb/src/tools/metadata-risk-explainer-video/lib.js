export const CHANNELS = Object.freeze([
  { id: "social", label: "Public social upload", stripsMetadata: true, reencodes: true, note: "Most platforms transcode video and drop common metadata, but visible/audio signals stay." },
  { id: "chat", label: "Work chat or shared drive", stripsMetadata: false, reencodes: false, note: "Original MP4/MOV files are often stored with container metadata intact." },
  { id: "email", label: "Email attachment", stripsMetadata: false, reencodes: false, note: "The recipient usually receives the original bytes and filename." },
  { id: "legal", label: "Legal / compliance evidence", stripsMetadata: false, reencodes: false, note: "Metadata can be useful evidence, but it may reveal unrelated personal context too." },
  { id: "messaging", label: "Messaging app compressed video", stripsMetadata: true, reencodes: true, note: "Compression removes many tags but does not hide what is visible or audible." },
]);

export const SIGNALS = Object.freeze([
  { id: "creation-time", group: "Container tags", label: "Creation time and timezone", carrier: "embedded", severity: "high", reveals: "MP4/MOV atoms can record the original capture time, local offset and editing timestamp.", fix: "Export a clean copy with metadata stripped or normalized." },
  { id: "gps", group: "Container tags", label: "GPS coordinates", carrier: "embedded", severity: "high", reveals: "Some phones and action cameras embed location in QuickTime metadata tracks.", fix: "Disable camera location tagging and strip metadata before sharing." },
  { id: "device-model", group: "Device fingerprint", label: "Camera make, model and encoder", carrier: "embedded", severity: "medium", reveals: "The file can name the phone/camera model, app, codec profile and encoder version.", fix: "Transcode through a privacy-safe export preset." },
  { id: "filename", group: "Filename", label: "Default filename", carrier: "filename", severity: "medium", reveals: "VID_20260728_142233.mp4 or DJI_0034.MP4 can reveal capture date, device family and sequence.", fix: "Rename the file before sending it." },
  { id: "audio-voices", group: "Visible and audible content", label: "Voices and background audio", carrier: "content", severity: "high", reveals: "Voices, announcements, TV audio and nearby conversations can identify people and places.", fix: "Mute, bleep or replace audio where privacy matters." },
  { id: "reflections", group: "Visible and audible content", label: "Reflections, screens and documents", carrier: "content", severity: "high", reveals: "Windows, mirrors, laptop screens, badges and mail can leak addresses, names and workplaces.", fix: "Crop, blur or re-shoot before sharing." },
  { id: "background-location", group: "Visible and audible content", label: "Background location clues", carrier: "content", severity: "medium", reveals: "Road signs, shopfronts, local language, uniforms or distinctive buildings can reveal location.", fix: "Blur identifiable background clues or publish a cropped clip." },
  { id: "edit-history", group: "Editing trail", label: "Editing app and export path", carrier: "embedded", severity: "medium", reveals: "Metadata can name the editor app, project pipeline, owner account or export preset.", fix: "Use a final-clean export profile and remove project comments." },
  { id: "thumbnail", group: "Container tags", label: "Embedded thumbnail or poster frame", carrier: "embedded", severity: "medium", reveals: "A poster frame may show a different moment than the visible first frame after trimming.", fix: "Regenerate thumbnails after trimming sensitive content." },
  { id: "subtitles", group: "Tracks", label: "Subtitle or chapter tracks", carrier: "embedded", severity: "medium", reveals: "Hidden text tracks can expose names, notes, transcripts or internal chapter labels.", fix: "Remove unused tracks from the final share file." },
]);

const WEIGHT = Object.freeze({ low: 1, medium: 3, high: 6 });
const BANDS = Object.freeze([
  { id: "none", label: "No surviving signals", min: 0, max: 0, advice: "No selected signal survives this channel, but still review visible frames." },
  { id: "low", label: "Low exposure", min: 1, max: 24, advice: "A clean export and quick visual review should be enough." },
  { id: "moderate", label: "Moderate exposure", min: 25, max: 49, advice: "Strip metadata and inspect audio/backgrounds before sharing." },
  { id: "high", label: "High exposure", min: 50, max: 74, advice: "Several identifying signals survive; re-export and redact." },
  { id: "severe", label: "Severe exposure", min: 75, max: 100, advice: "Do not share this video as-is." },
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
  if (signal.carrier === "filename") return !channel.reencodes;
  return !channel.stripsMetadata;
}

function bandFor(score) {
  return BANDS.find((band) => score >= band.min && score <= band.max) || BANDS[BANDS.length - 1];
}

export function assessVideoMetadataRisk({ selectedIds = [], channelId = "chat" } = {}) {
  const channel = CHANNELS.find((entry) => entry.id === channelId);
  if (!channel) return { error: "Choose a valid sharing channel." };
  if (!Array.isArray(selectedIds)) return { error: "Selected signals must be a list." };

  const selected = Array.from(new Set(selectedIds))
    .map((id) => SIGNALS.find((signal) => signal.id === id))
    .filter(Boolean);
  const maxWeight = SIGNALS.reduce((sum, signal) => sum + WEIGHT[signal.severity], 0);
  const surviving = selected.filter((signal) => survives(signal, channel));
  const removed = selected.filter((signal) => !survives(signal, channel));
  const survivingWeight = surviving.reduce((sum, signal) => sum + WEIGHT[signal.severity], 0);
  const score = maxWeight ? Math.round((survivingWeight / maxWeight) * 100) : 0;

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
