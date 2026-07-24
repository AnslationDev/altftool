const LATITUDE_KEYS = [
  "latitude",
  "lat",
  "latitudeDegrees",
  "latitudeE7",
];
const LONGITUDE_KEYS = [
  "longitude",
  "lon",
  "lng",
  "long",
  "longitudeDegrees",
  "longitudeE7",
];
const TIMESTAMP_KEYS = [
  "timestamp",
  "timestampMs",
  "time",
  "datetime",
  "dateTime",
  "startTimestamp",
  "startTimestampMs",
  "startTime",
  "endTimestamp",
  "endTimestampMs",
  "endTime",
];

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toFiniteNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function validateCoordinate(latitude, longitude) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findHeaderIndex(headers, candidates) {
  const normalized = headers.map(normalizeHeader);
  return candidates
    .map(normalizeHeader)
    .map((candidate) => normalized.indexOf(candidate))
    .find((index) => index >= 0);
}

function detectDelimiter(text) {
  const firstRecord = String(text).split(/\r?\n/, 1)[0] ?? "";
  const candidates = [",", "\t", ";"];
  let best = ",";
  let bestCount = -1;

  candidates.forEach((candidate) => {
    let count = 0;
    let quoted = false;
    for (let index = 0; index < firstRecord.length; index += 1) {
      const character = firstRecord[index];
      if (character === '"') {
        if (quoted && firstRecord[index + 1] === '"') index += 1;
        else quoted = !quoted;
      } else if (!quoted && character === candidate) {
        count += 1;
      }
    }
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  });

  return best;
}

export function parseDelimited(text, delimiter = detectDelimiter(text)) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === delimiter) {
      row.push(cell);
      cell = "";
    } else if (character === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell.replace(/\r$/, ""));
  if (row.length > 1 || row[0] !== "" || rows.length === 0) rows.push(row);
  return rows;
}

function encodeDelimitedCell(value, delimiter) {
  const text = String(value ?? "");
  if (
    text.includes(delimiter) ||
    text.includes('"') ||
    text.includes("\n") ||
    text.includes("\r")
  ) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function serializeDelimited(headers, rows, delimiter = ",") {
  return [headers, ...rows]
    .map((row) =>
      row.map((cell) => encodeDelimitedCell(cell, delimiter)).join(delimiter),
    )
    .join("\n");
}

function findTimestamp(value, basePath, depth = 0) {
  if (!isObject(value) || depth > 3) return null;

  for (const key of TIMESTAMP_KEYS) {
    if (Object.hasOwn(value, key) && value[key] !== null && value[key] !== "") {
      return { path: [...basePath, key], value: value[key] };
    }
  }

  const priorityKeys = [
    "duration",
    "visit",
    "placeVisit",
    "activitySegment",
    "properties",
  ];
  const entries = Object.entries(value).sort(([left], [right]) => {
    const leftIndex = priorityKeys.indexOf(left);
    const rightIndex = priorityKeys.indexOf(right);
    return (
      (leftIndex < 0 ? priorityKeys.length : leftIndex) -
      (rightIndex < 0 ? priorityKeys.length : rightIndex)
    );
  });

  for (const [key, nested] of entries) {
    if (!isObject(nested)) continue;
    const found = findTimestamp(nested, [...basePath, key], depth + 1);
    if (found) return found;
  }

  return null;
}

function recordPathFor(path) {
  let lastArrayIndex = -1;
  path.forEach((segment, index) => {
    if (typeof segment === "number") lastArrayIndex = index;
  });
  return lastArrayIndex >= 0 ? path.slice(0, lastArrayIndex + 1) : path;
}

function createPoint({
  latitude,
  longitude,
  latPath,
  lonPath,
  latEncoding,
  lonEncoding,
  latRaw,
  lonRaw,
  timestamp,
  recordPath,
}) {
  if (!validateCoordinate(latitude, longitude)) return null;
  return {
    latitude,
    longitude,
    latPath,
    lonPath,
    latEncoding,
    lonEncoding,
    latRawType: typeof latRaw,
    lonRawType: typeof lonRaw,
    timestamp: timestamp?.value ?? null,
    timestampPath: timestamp?.path ?? null,
    timestampRawType: typeof timestamp?.value,
    recordPath,
    recordKey: JSON.stringify(recordPath),
  };
}

function detectObjectPoint(value, path, timestamp) {
  if (!isObject(value)) return null;

  if (
    value.type === "Point" &&
    Array.isArray(value.coordinates) &&
    value.coordinates.length >= 2
  ) {
    const longitude = toFiniteNumber(value.coordinates[0]);
    const latitude = toFiniteNumber(value.coordinates[1]);
    return createPoint({
      latitude,
      longitude,
      latPath: [...path, "coordinates", 1],
      lonPath: [...path, "coordinates", 0],
      latEncoding: "number",
      lonEncoding: "number",
      latRaw: value.coordinates[1],
      lonRaw: value.coordinates[0],
      timestamp,
      recordPath: recordPathFor(path),
    });
  }

  const latitudeKey = LATITUDE_KEYS.find((key) => Object.hasOwn(value, key));
  const longitudeKey = LONGITUDE_KEYS.find((key) => Object.hasOwn(value, key));
  if (!latitudeKey || !longitudeKey) return null;

  const latRaw = value[latitudeKey];
  const lonRaw = value[longitudeKey];
  const latEncoding = latitudeKey.toLowerCase().endsWith("e7")
    ? "e7"
    : "number";
  const lonEncoding = longitudeKey.toLowerCase().endsWith("e7")
    ? "e7"
    : "number";
  const latitudeValue = toFiniteNumber(latRaw);
  const longitudeValue = toFiniteNumber(lonRaw);

  return createPoint({
    latitude:
      latitudeValue === null
        ? null
        : latEncoding === "e7"
          ? latitudeValue / 1e7
          : latitudeValue,
    longitude:
      longitudeValue === null
        ? null
        : lonEncoding === "e7"
          ? longitudeValue / 1e7
          : longitudeValue,
    latPath: [...path, latitudeKey],
    lonPath: [...path, longitudeKey],
    latEncoding,
    lonEncoding,
    latRaw,
    lonRaw,
    timestamp,
    recordPath: recordPathFor(path),
  });
}

function discoverJsonPoints(source) {
  const points = [];

  function visit(value, path = [], inheritedTimestamp = null) {
    if (Array.isArray(value)) {
      value.forEach((item, index) =>
        visit(item, [...path, index], inheritedTimestamp),
      );
      return;
    }
    if (!isObject(value)) return;

    const timestamp = findTimestamp(value, path) ?? inheritedTimestamp;
    const point = detectObjectPoint(value, path, timestamp);
    if (point) points.push({ ...point, id: `point-${points.length + 1}` });

    Object.entries(value).forEach(([key, nested]) => {
      if (nested && typeof nested === "object") {
        visit(nested, [...path, key], timestamp);
      }
    });
  }

  visit(source);
  return points;
}

function parseCsv(text) {
  const delimiter = detectDelimiter(text);
  const table = parseDelimited(text, delimiter);
  if (table.length < 2) {
    throw new Error("The CSV needs a header row and at least one data row.");
  }

  const headers = table[0].map((header) => header.trim());
  const latitudeIndex = findHeaderIndex(headers, LATITUDE_KEYS);
  const longitudeIndex = findHeaderIndex(headers, LONGITUDE_KEYS);
  if (latitudeIndex === undefined || longitudeIndex === undefined) {
    throw new Error(
      "No latitude/longitude columns were found. Use headings such as latitude + longitude or lat + lng.",
    );
  }
  const timestampIndex = findHeaderIndex(headers, TIMESTAMP_KEYS);
  const latitudeEncoding = normalizeHeader(headers[latitudeIndex]).endsWith("e7")
    ? "e7"
    : "number";
  const longitudeEncoding = normalizeHeader(
    headers[longitudeIndex],
  ).endsWith("e7")
    ? "e7"
    : "number";
  const rows = table
    .slice(1)
    .filter((row) => row.some((cell) => String(cell).trim() !== ""))
    .map((row) => headers.map((_, index) => row[index] ?? ""));
  const points = [];
  let invalidRows = 0;

  rows.forEach((row, rowIndex) => {
    const latRaw = row[latitudeIndex];
    const lonRaw = row[longitudeIndex];
    const latitudeValue = toFiniteNumber(latRaw);
    const longitudeValue = toFiniteNumber(lonRaw);
    const latitude =
      latitudeValue === null
        ? null
        : latitudeEncoding === "e7"
          ? latitudeValue / 1e7
          : latitudeValue;
    const longitude =
      longitudeValue === null
        ? null
        : longitudeEncoding === "e7"
          ? longitudeValue / 1e7
          : longitudeValue;
    if (!validateCoordinate(latitude, longitude)) {
      invalidRows += 1;
      return;
    }
    points.push({
      id: `point-${points.length + 1}`,
      latitude,
      longitude,
      latPath: [rowIndex, latitudeIndex],
      lonPath: [rowIndex, longitudeIndex],
      latEncoding: latitudeEncoding,
      lonEncoding: longitudeEncoding,
      latRawType: typeof latRaw,
      lonRawType: typeof lonRaw,
      timestamp:
        timestampIndex === undefined ? null : row[timestampIndex] || null,
      timestampPath:
        timestampIndex === undefined ? null : [rowIndex, timestampIndex],
      timestampRawType:
        timestampIndex === undefined ? "undefined" : typeof row[timestampIndex],
      recordPath: [rowIndex],
      recordKey: JSON.stringify([rowIndex]),
    });
  });

  if (!points.length) {
    throw new Error("The CSV did not contain any valid coordinate rows.");
  }

  return {
    format: "csv",
    source: { headers, rows, delimiter },
    points,
    warnings: invalidRows
      ? [`${invalidRows} row${invalidRows === 1 ? "" : "s"} had invalid coordinates and will be preserved unchanged.`]
      : [],
  };
}

export function parseLocationHistory(text, hint = "auto") {
  const cleanText = String(text ?? "").replace(/^\uFEFF/, "").trim();
  if (!cleanText) throw new Error("Choose a file or paste location-history data.");

  const shouldParseCsv =
    hint === "csv" ||
    (hint === "auto" && !cleanText.startsWith("{") && !cleanText.startsWith("["));
  if (shouldParseCsv) return parseCsv(cleanText);

  let source;
  try {
    source = JSON.parse(cleanText);
  } catch (error) {
    throw new Error(`The JSON could not be parsed: ${error.message}`);
  }

  const points = discoverJsonPoints(source);
  if (!points.length) {
    throw new Error(
      "No supported coordinates were found. This tool recognizes GeoJSON Points, latitude/longitude, lat/lng, and Google latitudeE7/longitudeE7 pairs.",
    );
  }

  const format =
    isObject(source) &&
    ["Feature", "FeatureCollection"].includes(source.type)
      ? "geojson"
      : "json";
  return { format, source, points, warnings: [] };
}

export function haversineDistanceMeters(
  latitudeA,
  longitudeA,
  latitudeB,
  longitudeB,
) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusMeters = 6_371_008.8;
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const startLatitude = toRadians(latitudeA);
  const endLatitude = toRadians(latitudeB);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  return (
    2 *
    earthRadiusMeters *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function cloneSource(source) {
  return JSON.parse(JSON.stringify(source));
}

function getAtPath(root, path) {
  return path.reduce(
    (current, segment) => (current == null ? undefined : current[segment]),
    root,
  );
}

function setAtPath(root, path, value) {
  if (!path.length) return value;
  const parent = getAtPath(root, path.slice(0, -1));
  if (parent != null) parent[path.at(-1)] = value;
  return root;
}

function encodeCoordinate(latitudeOrLongitude, encoding, rawType) {
  const value =
    encoding === "e7"
      ? Math.round(latitudeOrLongitude * 1e7)
      : latitudeOrLongitude;
  return rawType === "string" ? String(value) : value;
}

function coarsenTimestamp(value, bucketMinutes, rawType) {
  if (!value || !bucketMinutes) return value;
  const bucketMilliseconds = bucketMinutes * 60 * 1000;
  let milliseconds;
  let unit = "iso";

  if (typeof value === "number" || /^\d+(?:\.\d+)?$/.test(String(value))) {
    const numeric = Number(value);
    unit = numeric < 100_000_000_000 ? "seconds" : "milliseconds";
    milliseconds = unit === "seconds" ? numeric * 1000 : numeric;
  } else {
    milliseconds = Date.parse(String(value));
  }

  if (!Number.isFinite(milliseconds)) return value;
  const rounded = Math.floor(milliseconds / bucketMilliseconds) * bucketMilliseconds;
  if (unit === "iso") return new Date(rounded).toISOString();
  const numericResult = unit === "seconds" ? Math.floor(rounded / 1000) : rounded;
  return rawType === "string" ? String(numericResult) : numericResult;
}

function compareRemovalPaths(left, right) {
  if (left.length !== right.length) return right.length - left.length;
  const leftParent = JSON.stringify(left.slice(0, -1));
  const rightParent = JSON.stringify(right.slice(0, -1));
  if (leftParent !== rightParent) return leftParent.localeCompare(rightParent);
  const leftLast = left.at(-1);
  const rightLast = right.at(-1);
  if (typeof leftLast === "number" && typeof rightLast === "number") {
    return rightLast - leftLast;
  }
  return String(rightLast).localeCompare(String(leftLast));
}

function removeAtPath(root, path) {
  if (!path.length) return null;
  const parent = getAtPath(root, path.slice(0, -1));
  if (parent == null) return root;
  const last = path.at(-1);
  if (Array.isArray(parent) && typeof last === "number") parent.splice(last, 1);
  else delete parent[last];
  return root;
}

function roundedCoordinate(value, decimals) {
  if (decimals === null || decimals === undefined || decimals === "") {
    return value;
  }
  const precision = 10 ** Number(decimals);
  return Math.round((value + Number.EPSILON) * precision) / precision;
}

function normalizeZones(zones) {
  return (Array.isArray(zones) ? zones : [])
    .map((zone, index) => ({
      id: zone.id ?? `zone-${index + 1}`,
      label: String(zone.label || `Privacy zone ${index + 1}`),
      latitude: toFiniteNumber(zone.latitude),
      longitude: toFiniteNumber(zone.longitude),
      radiusMeters: toFiniteNumber(zone.radiusMeters),
    }))
    .filter((zone) =>
      validateCoordinate(zone.latitude, zone.longitude) &&
      zone.radiusMeters > 0,
    );
}

export function sanitizeLocationHistory(
  parsed,
  {
    zones = [],
    removeInsideZones = true,
    coordinateDecimals = null,
    timestampBucketMinutes = null,
  } = {},
) {
  if (!parsed?.source || !Array.isArray(parsed.points)) {
    throw new Error("Analyze valid location history before sanitizing it.");
  }

  const validZones = normalizeZones(zones);
  const zoneHits = new Map(validZones.map((zone) => [zone.id, 0]));
  const recordsToRemove = new Set();

  parsed.points.forEach((point) => {
    const matched = validZones.filter((zone) => {
      const inside =
        haversineDistanceMeters(
          point.latitude,
          point.longitude,
          zone.latitude,
          zone.longitude,
        ) <= zone.radiusMeters;
      if (inside) zoneHits.set(zone.id, (zoneHits.get(zone.id) ?? 0) + 1);
      return inside;
    });
    if (removeInsideZones && matched.length) {
      recordsToRemove.add(point.recordKey);
    }
  });

  let source = cloneSource(parsed.source);
  let coordinatesCoarsened = 0;
  let timestampsCoarsened = 0;

  parsed.points.forEach((point) => {
    if (recordsToRemove.has(point.recordKey)) return;
    const latitude = roundedCoordinate(point.latitude, coordinateDecimals);
    const longitude = roundedCoordinate(point.longitude, coordinateDecimals);
    if (latitude !== point.latitude || longitude !== point.longitude) {
      coordinatesCoarsened += 1;
    }
    const sourceRoot = parsed.format === "csv" ? source.rows : source;
    setAtPath(
      sourceRoot,
      point.latPath,
      encodeCoordinate(latitude, point.latEncoding, point.latRawType),
    );
    setAtPath(
      sourceRoot,
      point.lonPath,
      encodeCoordinate(longitude, point.lonEncoding, point.lonRawType),
    );

    if (point.timestampPath && timestampBucketMinutes) {
      const originalTimestamp = getAtPath(sourceRoot, point.timestampPath);
      const sanitizedTimestamp = coarsenTimestamp(
        originalTimestamp,
        Number(timestampBucketMinutes),
        point.timestampRawType,
      );
      if (sanitizedTimestamp !== originalTimestamp) timestampsCoarsened += 1;
      setAtPath(sourceRoot, point.timestampPath, sanitizedTimestamp);
    }
  });

  const removalPaths = parsed.points
    .filter((point) => recordsToRemove.has(point.recordKey))
    .map((point) => point.recordPath)
    .filter(
      (path, index, allPaths) =>
        allPaths.findIndex(
          (candidate) => JSON.stringify(candidate) === JSON.stringify(path),
        ) === index,
    )
    .sort(compareRemovalPaths);

  if (parsed.format === "csv") {
    const rowIndexes = new Set(removalPaths.map((path) => path[0]));
    source.rows = source.rows.filter((_, index) => !rowIndexes.has(index));
  } else {
    removalPaths.forEach((path) => {
      source = removeAtPath(source, path);
    });
  }

  const removedPoints = parsed.points.filter((point) =>
    recordsToRemove.has(point.recordKey),
  ).length;
  const zoneSummary = validZones.map((zone) => ({
    ...zone,
    matchedPoints: zoneHits.get(zone.id) ?? 0,
  }));

  return {
    format: parsed.format,
    source,
    totalPoints: parsed.points.length,
    removedPoints,
    removedRecords: recordsToRemove.size,
    retainedPoints: parsed.points.length - removedPoints,
    coordinatesCoarsened,
    timestampsCoarsened,
    zoneSummary,
  };
}

export function serializeLocationHistory(result) {
  if (!result || !Object.hasOwn(result, "source")) {
    throw new Error("There is no sanitized result to export.");
  }
  if (result.format === "csv") {
    return serializeDelimited(
      result.source.headers,
      result.source.rows,
      result.source.delimiter,
    );
  }
  return JSON.stringify(result.source, null, 2);
}

export function buildLocationExportName(filename, format) {
  const cleanName = String(filename || "location-history")
    .replace(/\.(?:geo)?json$|\.csv$/i, "")
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  const extension = format === "csv" ? "csv" : format === "geojson" ? "geojson" : "json";
  return `${cleanName || "location-history"}.sanitized.${extension}`;
}

export function parsePrivacyZones(text) {
  const cleanText = String(text ?? "").trim();
  if (!cleanText) return [];
  let records;

  if (cleanText.startsWith("[") || cleanText.startsWith("{")) {
    const parsed = JSON.parse(cleanText);
    records = Array.isArray(parsed) ? parsed : parsed.zones;
    if (!Array.isArray(records)) {
      throw new Error("Zone JSON must be an array or an object with a zones array.");
    }
  } else {
    records = parseDelimited(cleanText, ",")
      .filter((row) => row.some((cell) => String(cell).trim()))
      .map(([label, latitude, longitude, radiusMeters]) => ({
        label,
        latitude,
        longitude,
        radiusMeters,
      }));
  }

  const zones = records.map((record, index) => ({
    id: `imported-zone-${index + 1}`,
    label: String(record.label || record.name || `Privacy zone ${index + 1}`),
    latitude: toFiniteNumber(record.latitude ?? record.lat),
    longitude: toFiniteNumber(
      record.longitude ?? record.lng ?? record.lon,
    ),
    radiusMeters: toFiniteNumber(
      record.radiusMeters ?? record.radius ?? record.radiusM,
    ),
  }));
  if (
    zones.some(
      (zone) =>
        !validateCoordinate(zone.latitude, zone.longitude) ||
        !(zone.radiusMeters > 0),
    )
  ) {
    throw new Error(
      "Each zone needs a valid latitude, longitude and positive radius in metres.",
    );
  }
  return zones;
}
