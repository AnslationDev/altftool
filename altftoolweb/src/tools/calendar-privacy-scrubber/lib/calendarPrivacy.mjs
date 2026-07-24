const DEFAULT_OPTIONS = Object.freeze({
  summary: "generalize",
  attendees: "generalize",
  organizer: "generalize",
  location: "generalize",
  description: "remove",
  removeConferenceUrls: true,
  removeAlarms: true,
  uid: "replace",
  shiftDays: 0,
});

const ALLOWED_MODES = new Set(["keep", "generalize", "remove"]);
const SHIFTABLE_PROPERTIES = new Set([
  "DTSTART",
  "DTEND",
  "RECURRENCE-ID",
  "RDATE",
  "EXDATE",
]);
const DESCRIPTION_PROPERTIES = new Set([
  "DESCRIPTION",
  "COMMENT",
  "X-ALT-DESC",
]);
const CONFERENCE_PROPERTY_NAMES = new Set([
  "CONFERENCE",
  "X-GOOGLE-CONFERENCE",
  "X-GOOGLE-HANGOUT",
  "X-MICROSOFT-SKYPETEAMSMEETINGURL",
  "X-MICROSOFT-ONLINEMEETINGCONFLINK",
  "X-MICROSOFT-ONLINEMEETINGEXTERNALLINK",
]);
const CONFERENCE_HOST_PATTERN =
  /(?:meet\.google\.com|(?:[\w-]+\.)?zoom\.us|teams\.microsoft\.com|(?:[\w-]+\.)?webex\.com|whereby\.com|meet\.jit\.si|gotomeet\.me|(?:[\w-]+\.)?gotomeeting\.com|bluejeans\.com)/i;
const URL_PATTERN = /https?:\/\/[^\s<>"']+/giu;

function splitOutsideQuotes(value, delimiter) {
  const parts = [];
  let current = "";
  let quoted = false;

  for (const character of value) {
    if (character === '"') quoted = !quoted;
    if (character === delimiter && !quoted) {
      parts.push(current);
      current = "";
    } else {
      current += character;
    }
  }

  parts.push(current);
  return parts;
}

function findValueDelimiter(line) {
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === '"') quoted = !quoted;
    if (line[index] === ":" && !quoted) return index;
  }
  return -1;
}

export function unfoldContentLines(input) {
  const physicalLines = String(input ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const lines = [];

  for (const physicalLine of physicalLines) {
    if (/^[ \t]/.test(physicalLine) && lines.length > 0) {
      lines[lines.length - 1] += physicalLine.slice(1);
    } else {
      lines.push(physicalLine);
    }
  }

  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export function parseContentLine(line) {
  const raw = String(line ?? "");
  const delimiterIndex = findValueDelimiter(raw);
  if (delimiterIndex < 1) return null;

  const head = raw.slice(0, delimiterIndex);
  const value = raw.slice(delimiterIndex + 1);
  const [rawPropertyName, ...rawParameters] = splitOutsideQuotes(head, ";");
  const nameWithGroup = rawPropertyName.trim();
  const name = nameWithGroup.split(".").at(-1)?.toUpperCase() || "";
  const parameters = rawParameters.map((parameter) => {
    const equalsIndex = parameter.indexOf("=");
    if (equalsIndex < 0) {
      return { name: parameter.toUpperCase(), value: "" };
    }
    return {
      name: parameter.slice(0, equalsIndex).toUpperCase(),
      value: parameter.slice(equalsIndex + 1),
    };
  });

  return {
    raw,
    rawPropertyName: nameWithGroup,
    name,
    parameters,
    value,
  };
}

function serializeProperty(property, value = property.value) {
  const parameters = property.parameters
    .map((parameter) =>
      parameter.value ? `${parameter.name}=${parameter.value}` : parameter.name,
    )
    .join(";");
  return `${property.rawPropertyName}${parameters ? `;${parameters}` : ""}:${value}`;
}

function replaceParameter(property, name, value) {
  const normalizedName = name.toUpperCase();
  return {
    ...property,
    parameters: [
      ...property.parameters.filter(
        (parameter) => parameter.name !== normalizedName,
      ),
      { name: normalizedName, value },
    ],
  };
}

function removeIdentityParameters(property) {
  const sensitiveNames = new Set([
    "CN",
    "EMAIL",
    "DIR",
    "SENT-BY",
    "DELEGATED-TO",
    "DELEGATED-FROM",
    "MEMBER",
  ]);
  return {
    ...property,
    parameters: property.parameters.filter(
      (parameter) => !sensitiveNames.has(parameter.name),
    ),
  };
}

export function decodeIcsText(value) {
  return String(value ?? "")
    .replace(/\\[nN]/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

export function encodeIcsText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\r\n?|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function getParameter(property, name) {
  const parameter = property?.parameters.find(
    (candidate) => candidate.name === name.toUpperCase(),
  );
  return parameter?.value?.replace(/^"|"$/g, "") || "";
}

function createEventPreview(index) {
  return {
    index,
    summary: "Untitled event",
    start: "",
    end: "",
    duration: "",
    timezone: "",
    attendeeCount: 0,
    hasOrganizer: false,
    hasLocation: false,
    hasDescription: false,
    conferenceCount: 0,
    alarmCount: 0,
    recurring: false,
  };
}

export function parseCalendar(input) {
  const lines = unfoldContentLines(input);
  const errors = [];
  const warnings = [];
  const events = [];
  const componentStack = [];
  let currentEvent = null;

  if (lines.length === 0) {
    return {
      ok: false,
      lines,
      events,
      errors: ["Paste or choose an ICS calendar first."],
      warnings,
    };
  }

  for (let index = 0; index < lines.length; index += 1) {
    const property = parseContentLine(lines[index]);
    if (!property) {
      if (lines[index].trim()) {
        warnings.push(`Line ${index + 1} could not be read and was left unchanged.`);
      }
      continue;
    }

    const componentName = property.value.trim().toUpperCase();
    if (property.name === "BEGIN") {
      componentStack.push(componentName);
      if (componentName === "VEVENT") {
        if (currentEvent) {
          errors.push(`A VEVENT starts before the previous event ends (line ${index + 1}).`);
        }
        currentEvent = createEventPreview(events.length + 1);
      } else if (componentName === "VALARM" && currentEvent) {
        currentEvent.alarmCount += 1;
      }
      continue;
    }

    if (property.name === "END") {
      const openComponent = componentStack.pop();
      if (openComponent !== componentName) {
        errors.push(
          `Component mismatch near line ${index + 1}: expected END:${openComponent || "unknown"}, found END:${componentName}.`,
        );
      }
      if (componentName === "VEVENT" && currentEvent) {
        events.push(currentEvent);
        currentEvent = null;
      }
      continue;
    }

    if (!currentEvent || componentStack.at(-1) === "VALARM") continue;

    if (property.name === "SUMMARY") {
      currentEvent.summary = decodeIcsText(property.value) || "Untitled event";
    } else if (property.name === "DTSTART") {
      currentEvent.start = property.value;
      currentEvent.timezone = getParameter(property, "TZID");
    } else if (property.name === "DTEND") {
      currentEvent.end = property.value;
      currentEvent.timezone ||= getParameter(property, "TZID");
    } else if (property.name === "DURATION") {
      currentEvent.duration = property.value;
    } else if (property.name === "ATTENDEE") {
      currentEvent.attendeeCount += 1;
    } else if (property.name === "ORGANIZER") {
      currentEvent.hasOrganizer = true;
    } else if (property.name === "LOCATION") {
      currentEvent.hasLocation = Boolean(decodeIcsText(property.value));
    } else if (DESCRIPTION_PROPERTIES.has(property.name)) {
      currentEvent.hasDescription = true;
    } else if (
      property.name === "RRULE" ||
      property.name === "RDATE" ||
      property.name === "RECURRENCE-ID"
    ) {
      currentEvent.recurring = true;
    }

    if (isConferenceProperty(property)) currentEvent.conferenceCount += 1;
  }

  if (!lines.some((line) => /^BEGIN:VCALENDAR$/i.test(line.trim()))) {
    errors.push("BEGIN:VCALENDAR is missing.");
  }
  if (!lines.some((line) => /^END:VCALENDAR$/i.test(line.trim()))) {
    errors.push("END:VCALENDAR is missing.");
  }
  if (componentStack.length > 0) {
    errors.push(`Unclosed component: ${componentStack.at(-1)}.`);
  }
  if (currentEvent) errors.push("The final VEVENT is not closed.");
  if (events.length === 0 && errors.length === 0) {
    warnings.push("No VEVENT entries were found. The calendar can still be exported.");
  }

  return {
    ok: errors.length === 0,
    lines,
    events,
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
  };
}

function padNumber(value, width = 2) {
  return String(value).padStart(width, "0");
}

function isValidDateParts(year, month, day, hour = 0, minute = 0, second = 0) {
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute &&
    date.getUTCSeconds() === second
  );
}

function shiftSingleDateValue(value, days) {
  const dateMatch = /^(\d{4})(\d{2})(\d{2})$/.exec(value);
  const dateTimeMatch =
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/.exec(value);
  const match = dateTimeMatch || dateMatch;
  if (!match) return { value, shifted: false, unsupported: true };

  const [, yearRaw, monthRaw, dayRaw] = match;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const hour = dateTimeMatch ? Number(dateTimeMatch[4]) : 0;
  const minute = dateTimeMatch ? Number(dateTimeMatch[5]) : 0;
  const second = dateTimeMatch ? Number(dateTimeMatch[6]) : 0;

  if (!isValidDateParts(year, month, day, hour, minute, second)) {
    return { value, shifted: false, unsupported: true };
  }

  const shifted = new Date(
    Date.UTC(year, month - 1, day + days, hour, minute, second),
  );
  const shiftedDate = `${padNumber(shifted.getUTCFullYear(), 4)}${padNumber(
    shifted.getUTCMonth() + 1,
  )}${padNumber(shifted.getUTCDate())}`;

  if (!dateTimeMatch) {
    return { value: shiftedDate, shifted: true, unsupported: false };
  }

  return {
    value: `${shiftedDate}T${padNumber(shifted.getUTCHours())}${padNumber(
      shifted.getUTCMinutes(),
    )}${padNumber(shifted.getUTCSeconds())}${dateTimeMatch[7]}`,
    shifted: true,
    unsupported: false,
  };
}

export function shiftIcsDateValue(value, days) {
  const normalizedDays = Number.isFinite(Number(days))
    ? Math.trunc(Number(days))
    : 0;
  if (!normalizedDays) {
    return { value: String(value ?? ""), shifted: 0, unsupported: 0 };
  }

  let shifted = 0;
  let unsupported = 0;
  const transformed = String(value ?? "")
    .split(",")
    .map((entry) =>
      entry
        .split("/")
        .map((part) => {
          if (/^[+-]?P/i.test(part)) return part;
          const result = shiftSingleDateValue(part, normalizedDays);
          if (result.shifted) shifted += 1;
          if (result.unsupported) unsupported += 1;
          return result.value;
        })
        .join("/"),
    )
    .join(",");

  return { value: transformed, shifted, unsupported };
}

function containsConferenceUrl(value) {
  const decoded = decodeIcsText(value);
  return [...decoded.matchAll(URL_PATTERN)].some((match) =>
    CONFERENCE_HOST_PATTERN.test(match[0]),
  );
}

function stripConferenceUrls(value) {
  const decoded = decodeIcsText(value);
  const stripped = decoded.replace(URL_PATTERN, (url) =>
    CONFERENCE_HOST_PATTERN.test(url) ? "[conference link removed]" : url,
  );
  return encodeIcsText(stripped);
}

function isConferenceProperty(property) {
  if (CONFERENCE_PROPERTY_NAMES.has(property.name)) return true;
  if (
    property.name.startsWith("X-") &&
    /(?:CONFERENCE|HANGOUT|MEETING.*URL|ONLINE.*MEETING)/i.test(property.name)
  ) {
    return true;
  }
  return property.name === "URL" && containsConferenceUrl(property.value);
}

function normalizeOptions(options) {
  const merged = { ...DEFAULT_OPTIONS, ...(options || {}) };
  for (const key of [
    "summary",
    "attendees",
    "organizer",
    "location",
    "description",
  ]) {
    if (!ALLOWED_MODES.has(merged[key])) merged[key] = DEFAULT_OPTIONS[key];
  }
  if (!["keep", "replace", "remove"].includes(merged.uid)) {
    merged.uid = DEFAULT_OPTIONS.uid;
  }
  merged.shiftDays = Math.max(
    -3650,
    Math.min(3650, Math.trunc(Number(merged.shiftDays) || 0)),
  );
  merged.removeConferenceUrls = Boolean(merged.removeConferenceUrls);
  merged.removeAlarms = Boolean(merged.removeAlarms);
  return merged;
}

function redactIdentity(property, label, address) {
  let redacted = removeIdentityParameters(property);
  redacted = replaceParameter(redacted, "CN", `"${label}"`);
  return serializeProperty(redacted, `mailto:${address}`);
}

function applyTextMode(property, mode, replacement) {
  if (mode === "remove") return null;
  if (mode === "generalize") {
    return serializeProperty(property, encodeIcsText(replacement));
  }
  return property.raw;
}

function foldContentLine(line, byteLimit = 75) {
  const encoder = new TextEncoder();
  const segments = [];
  let segment = "";
  let segmentLimit = byteLimit;

  for (const character of String(line)) {
    const candidate = `${segment}${character}`;
    if (segment && encoder.encode(candidate).length > segmentLimit) {
      segments.push(segment);
      segment = character;
      segmentLimit = byteLimit - 1;
    } else {
      segment = candidate;
    }
  }
  segments.push(segment);
  return segments.join("\r\n ");
}

function serializeCalendar(lines) {
  return `${lines.map((line) => foldContentLine(line)).join("\r\n")}\r\n`;
}

function findBlockedShiftEvents(lines, days) {
  const blockedEvents = new Set();
  let eventIndex = 0;
  let insideEvent = false;

  for (const line of lines) {
    const property = parseContentLine(line);
    if (!property) continue;
    const componentName = property.value.trim().toUpperCase();

    if (property.name === "BEGIN" && componentName === "VEVENT") {
      eventIndex += 1;
      insideEvent = true;
      continue;
    }
    if (property.name === "END" && componentName === "VEVENT") {
      insideEvent = false;
      continue;
    }
    if (!insideEvent || !SHIFTABLE_PROPERTIES.has(property.name)) continue;

    const shifted = shiftIcsDateValue(property.value, days);
    if (shifted.unsupported > 0) blockedEvents.add(eventIndex);
  }

  return blockedEvents;
}

export function scrubCalendar(input, requestedOptions = {}) {
  const parsed = parseCalendar(input);
  const options = normalizeOptions(requestedOptions);
  if (!parsed.ok) {
    return {
      ok: false,
      output: "",
      sourceEvents: parsed.events,
      events: [],
      options,
      errors: parsed.errors,
      warnings: parsed.warnings,
      stats: null,
    };
  }

  const outputLines = [];
  const stats = {
    events: parsed.events.length,
    titlesProcessed: 0,
    attendeesProcessed: 0,
    organizersProcessed: 0,
    locationsProcessed: 0,
    descriptionsProcessed: 0,
    conferenceLinksRemoved: 0,
    alarmsRemoved: 0,
    uidsProcessed: 0,
    shiftedDateValues: 0,
    unsupportedDateValues: 0,
  };
  let eventIndex = 0;
  let attendeeIndex = 0;
  let insideEvent = false;
  let skippedAlarmDepth = 0;
  const blockedShiftEvents = options.shiftDays
    ? findBlockedShiftEvents(parsed.lines, options.shiftDays)
    : new Set();

  for (const line of parsed.lines) {
    const property = parseContentLine(line);
    if (!property) {
      if (!skippedAlarmDepth) outputLines.push(line);
      continue;
    }

    const componentName = property.value.trim().toUpperCase();
    if (skippedAlarmDepth > 0) {
      if (property.name === "BEGIN") skippedAlarmDepth += 1;
      if (property.name === "END") skippedAlarmDepth -= 1;
      continue;
    }

    if (
      insideEvent &&
      options.removeAlarms &&
      property.name === "BEGIN" &&
      componentName === "VALARM"
    ) {
      skippedAlarmDepth = 1;
      stats.alarmsRemoved += 1;
      continue;
    }

    if (property.name === "BEGIN" && componentName === "VEVENT") {
      eventIndex += 1;
      attendeeIndex = 0;
      insideEvent = true;
      outputLines.push(line);
      continue;
    }
    if (property.name === "END" && componentName === "VEVENT") {
      insideEvent = false;
      outputLines.push(line);
      continue;
    }
    if (!insideEvent) {
      outputLines.push(line);
      continue;
    }

    if (property.name === "SUMMARY" && options.summary !== "keep") {
      stats.titlesProcessed += 1;
      const transformed = applyTextMode(
        property,
        options.summary,
        `Private event ${eventIndex}`,
      );
      if (transformed) outputLines.push(transformed);
      continue;
    }

    if (property.name === "ATTENDEE" && options.attendees !== "keep") {
      stats.attendeesProcessed += 1;
      attendeeIndex += 1;
      if (options.attendees === "generalize") {
        outputLines.push(
          redactIdentity(
            property,
            `Attendee ${attendeeIndex}`,
            `attendee-${eventIndex}-${attendeeIndex}@redacted.invalid`,
          ),
        );
      }
      continue;
    }

    if (property.name === "ORGANIZER" && options.organizer !== "keep") {
      stats.organizersProcessed += 1;
      if (options.organizer === "generalize") {
        outputLines.push(
          redactIdentity(
            property,
            "Organizer",
            `organizer-${eventIndex}@redacted.invalid`,
          ),
        );
      }
      continue;
    }

    if (property.name === "LOCATION" && options.location !== "keep") {
      stats.locationsProcessed += 1;
      const transformed = applyTextMode(
        property,
        options.location,
        "Private location",
      );
      if (transformed) outputLines.push(transformed);
      continue;
    }

    if (
      DESCRIPTION_PROPERTIES.has(property.name) &&
      options.description !== "keep"
    ) {
      stats.descriptionsProcessed += 1;
      const transformed = applyTextMode(
        property,
        options.description,
        "Private event details",
      );
      if (transformed) outputLines.push(transformed);
      continue;
    }

    if (options.removeConferenceUrls && isConferenceProperty(property)) {
      stats.conferenceLinksRemoved += 1;
      continue;
    }

    if (
      options.removeConferenceUrls &&
      (property.name === "LOCATION" ||
        DESCRIPTION_PROPERTIES.has(property.name)) &&
      containsConferenceUrl(property.value)
    ) {
      stats.conferenceLinksRemoved += 1;
      outputLines.push(serializeProperty(property, stripConferenceUrls(property.value)));
      continue;
    }

    if (property.name === "UID" && options.uid !== "keep") {
      stats.uidsProcessed += 1;
      if (options.uid === "replace") {
        outputLines.push(
          serializeProperty(property, `event-${eventIndex}@redacted.invalid`),
        );
      }
      continue;
    }

    if (options.shiftDays && SHIFTABLE_PROPERTIES.has(property.name)) {
      if (blockedShiftEvents.has(eventIndex)) {
        stats.unsupportedDateValues += 1;
        outputLines.push(line);
        continue;
      }
      const shifted = shiftIcsDateValue(property.value, options.shiftDays);
      stats.shiftedDateValues += shifted.shifted;
      stats.unsupportedDateValues += shifted.unsupported;
      outputLines.push(serializeProperty(property, shifted.value));
      continue;
    }

    outputLines.push(line);
  }

  const output = serializeCalendar(outputLines);
  const scrubbed = parseCalendar(output);
  const warnings = [...parsed.warnings];
  if (parsed.events.some((event) => event.recurring)) {
    warnings.push(
      "Recurring rules were preserved but not expanded. Review the series, exceptions and future instances in a calendar app before sharing.",
    );
  }
  if (
    parsed.events.some((event) => event.timezone) ||
    parsed.lines.some((line) => /^BEGIN:VTIMEZONE$/i.test(line.trim()))
  ) {
    warnings.push(
      "TZID references and VTIMEZONE definitions were preserved. Date shifting changes calendar dates, not timezone definitions or daylight-saving rules.",
    );
  }
  if (stats.unsupportedDateValues > 0) {
    warnings.push(
      `${stats.unsupportedDateValues} event date field(s) could not be shifted as a safe group and were left unchanged.`,
    );
  }
  warnings.push(
    "Review the exported file before sharing. Calendar-level metadata, attachments and unknown vendor-specific properties are preserved.",
  );

  return {
    ok: scrubbed.ok,
    output,
    sourceEvents: parsed.events,
    events: scrubbed.events,
    options,
    errors: scrubbed.errors,
    warnings: [...new Set(warnings)],
    stats,
  };
}

export { DEFAULT_OPTIONS };
