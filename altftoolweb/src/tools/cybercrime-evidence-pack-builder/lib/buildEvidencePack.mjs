const MAX_TEXT_LENGTH = 100_000;
const MAX_TIMELINE_ROWS = 250;
const MAX_EVIDENCE_ITEMS = 100;

export { MAX_TEXT_LENGTH, MAX_TIMELINE_ROWS, MAX_EVIDENCE_ITEMS };

function boundedText(value, maximum = MAX_TEXT_LENGTH) {
  return String(value || "").trim().slice(0, maximum);
}

function parseTimelineLine(line, index) {
  const separator = line.includes("\t") ? "\t" : "|";
  const parts = line.split(separator).map((item) => item.trim());
  if (parts.length < 2) {
    return {
      ok: false,
      error: `Timeline line ${index + 1} needs a date/time and event separated by a tab or |.`,
    };
  }
  const occurredAt = boundedText(parts.shift(), 100);
  const reference = boundedText(parts.length > 1 ? parts.pop() : "", 500);
  const event = boundedText(parts.join(separator), 2_000);
  if (!occurredAt || !event) {
    return {
      ok: false,
      error: `Timeline line ${index + 1} is missing a date/time or event.`,
    };
  }
  return {
    ok: true,
    entry: {
      sequence: index + 1,
      occurredAt,
      event,
      reference,
    },
  };
}

export function parseTimeline(source) {
  const allLines = String(source || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const rowTruncated = allLines.length > MAX_TIMELINE_ROWS;

  // Keep only whole lines within the character budget, instead of slicing
  // the raw text to MAX_TEXT_LENGTH characters up front. A raw-text slice
  // can land mid-line, which both corrupts whatever event straddles the cut
  // (a truncated `event` field, a `reference` field sheared clean off) and
  // hides that anything was cut at all, since only line count fed the
  // `truncated` flag below.
  let charBudget = MAX_TEXT_LENGTH;
  let charTruncated = false;
  const lines = [];
  for (const line of allLines) {
    if (lines.length >= MAX_TIMELINE_ROWS) break;
    const cost = line.length + 1; // +1 for the newline separating it from the next line
    if (cost > charBudget) {
      charTruncated = true;
      break;
    }
    lines.push(line);
    charBudget -= cost;
  }

  const entries = [];
  const errors = [];
  lines.forEach((line, index) => {
    const parsed = parseTimelineLine(line, index);
    if (parsed.ok) entries.push(parsed.entry);
    else errors.push(parsed.error);
  });
  return {
    entries,
    errors,
    truncated: rowTruncated || charTruncated,
  };
}

function normalizeEvidenceItem(item, index) {
  const sha256 = String(item?.sha256 || "").trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(sha256)) {
    return {
      ok: false,
      error: `Evidence item ${index + 1} does not have a valid SHA-256 digest.`,
    };
  }
  const size = Number(item?.size);
  if (!Number.isSafeInteger(size) || size < 0) {
    return {
      ok: false,
      error: `Evidence item ${index + 1} has an invalid file size.`,
    };
  }
  return {
    ok: true,
    item: {
      sequence: index + 1,
      filename: boundedText(item.filename, 500),
      mediaType: boundedText(item.mediaType || "application/octet-stream", 200),
      sizeBytes: size,
      lastModified:
        Number.isFinite(Number(item.lastModified)) && Number(item.lastModified) > 0
          ? new Date(Number(item.lastModified)).toISOString()
          : null,
      sha256,
      note: boundedText(item.note, 1_000),
    },
  };
}

export function normalizeEvidence(items = []) {
  const source = Array.isArray(items) ? items.slice(0, MAX_EVIDENCE_ITEMS) : [];
  const evidence = [];
  const errors = [];
  source.forEach((item, index) => {
    const normalized = normalizeEvidenceItem(item, index);
    if (normalized.ok) evidence.push(normalized.item);
    else errors.push(normalized.error);
  });
  return {
    evidence,
    errors,
    truncated: Array.isArray(items) && items.length > MAX_EVIDENCE_ITEMS,
  };
}

export function buildEvidencePack({
  incidentTitle,
  incidentReference,
  narrative,
  timelineSource,
  evidenceItems,
  createdAt = new Date().toISOString(),
} = {}) {
  const title = boundedText(incidentTitle, 500);
  if (!title) {
    return { ok: false, errors: ["Add a short incident title."] };
  }
  const timeline = parseTimeline(timelineSource);
  const normalizedEvidence = normalizeEvidence(evidenceItems);
  const errors = [...timeline.errors, ...normalizedEvidence.errors];
  if (!timeline.entries.length && !normalizedEvidence.evidence.length) {
    errors.push("Add at least one timeline event or hashed evidence file.");
  }
  if (errors.length) {
    return { ok: false, errors };
  }

  const pack = {
    schema: "altftool.cybercrime-evidence-pack.v1",
    createdAt: new Date(createdAt).toISOString(),
    handlingNotice:
      "Contains user-entered incident information. Store and share it only with intended recipients.",
    limitations: [
      "A file hash helps detect later changes; it does not prove who created the file, when an event occurred, or whether content is authentic.",
      "This organizer does not submit a report, contact authorities, recover funds, or provide legal advice.",
      "Original files are not embedded. Preserve originals separately and avoid editing them.",
    ],
    incident: {
      title,
      reference: boundedText(incidentReference, 500),
      narrative: boundedText(narrative),
    },
    timeline: timeline.entries,
    evidence: normalizedEvidence.evidence,
    processing: {
      localOnly: true,
      filesEmbedded: false,
      timelineTruncated: timeline.truncated,
      evidenceTruncated: normalizedEvidence.truncated,
    },
  };

  return {
    ok: true,
    pack,
    counts: {
      timelineEvents: pack.timeline.length,
      evidenceFiles: pack.evidence.length,
      totalEvidenceBytes: pack.evidence.reduce(
        (sum, item) => sum + item.sizeBytes,
        0,
      ),
      notesPresent: pack.evidence.filter((item) => item.note).length,
    },
  };
}

export function buildCountsOnlySummary(result) {
  if (!result?.ok) return null;
  return {
    schema: "altftool.cybercrime-evidence-summary.v1",
    createdAt: new Date().toISOString(),
    counts: { ...result.counts },
    scope: {
      localOnly: true,
      filesEmbedded: false,
      includesIncidentText: false,
      includesFilenames: false,
      includesDigests: false,
    },
  };
}
