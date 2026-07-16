export function toMs(h, m, s, ms) {
  return h * 3600000 + m * 60000 + s * 1000 + ms;
}

export function parseTimecode(tc) {
  const m = tc.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/);
  if (!m) return null;
  return toMs(Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]));
}

export function formatMs(total) {
  const safe = Math.max(0, Math.round(total));
  const h = Math.floor(safe / 3600000);
  const m = Math.floor((safe % 3600000) / 60000);
  const s = Math.floor((safe % 60000) / 1000);
  const ms = safe % 1000;
  const p2 = (v) => String(v).padStart(2, "0");
  const p3 = (v) => String(v).padStart(3, "0");
  return `${p2(h)}:${p2(m)}:${p2(s)},${p3(ms)}`;
}

export function parseSrt(input) {
  const normalized = input.replace(/\r/g, "").trim();
  if (!normalized) return [];
  const blocks = normalized.split("\n\n");
  const cues = [];
  for (const block of blocks) {
    const lines = block.split("\n");
    if (lines.length < 2) continue;
    const idx = Number(lines[0].trim());
    const times = lines[1].split(" --> ");
    if (times.length !== 2) continue;
    const start = parseTimecode(times[0].trim());
    const end = parseTimecode(times[1].trim());
    if (start === null || end === null) continue;
    cues.push({
      index: Number.isFinite(idx) ? idx : cues.length + 1,
      start,
      end,
      text: lines.slice(2).join("\n"),
    });
  }
  return cues;
}

export function buildSrt(cues) {
  return cues
    .map(
      (c, i) =>
        `${i + 1}\n${formatMs(c.start)} --> ${formatMs(c.end)}\n${c.text}`.trim()
    )
    .join("\n\n");
}
