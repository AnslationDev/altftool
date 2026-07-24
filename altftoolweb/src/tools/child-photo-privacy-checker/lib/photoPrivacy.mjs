export const MASK_MODES = ["solid", "pixelate", "blur"];

export const REVIEW_AREAS = [
  {
    id: "child-face",
    label: "Faces and reflections",
    shortLabel: "Face",
    help: "Review every visible face, mirror, window, and screen reflection manually.",
  },
  {
    id: "school-id",
    label: "School badges and name tags",
    shortLabel: "School / name",
    help: "Check uniforms, lanyards, certificates, bags, and labelled belongings.",
  },
  {
    id: "home-location",
    label: "House numbers and location clues",
    shortLabel: "Home / location",
    help: "Check doors, street signs, landmarks, delivery labels, and nearby buildings.",
  },
  {
    id: "document-screen",
    label: "Documents and screens",
    shortLabel: "Document / screen",
    help: "Check IDs, mail, forms, device screens, calendars, and noticeboards.",
  },
  {
    id: "vehicle-plate",
    label: "Vehicle plates and stickers",
    shortLabel: "Vehicle plate",
    help: "Check number plates, parking permits, registration stickers, and passes.",
  },
  {
    id: "background-detail",
    label: "Background and personal details",
    shortLabel: "Background",
    help: "Check medical items, family photos, keys, QR codes, barcodes, and valuables.",
  },
];

const EXIF_TAGS = new Map([
  [0x010f, { id: "camera-make", label: "Camera or phone maker" }],
  [0x0110, { id: "camera-model", label: "Camera or phone model" }],
  [0x0131, { id: "editing-software", label: "Editing software" }],
  [0x0132, { id: "capture-time", label: "Stored date or time" }],
  [0x8298, { id: "copyright", label: "Copyright or owner field" }],
  [0x8825, { id: "gps", label: "GPS metadata" }],
  [0x9003, { id: "capture-time", label: "Stored date or time" }],
  [0x9004, { id: "capture-time", label: "Stored date or time" }],
  [0x9286, { id: "comment", label: "Embedded user comment" }],
  [0xa420, { id: "unique-id", label: "Unique image identifier" }],
  [0xa430, { id: "owner", label: "Camera owner name" }],
  [0xa431, { id: "serial", label: "Camera serial number" }],
  [0xa434, { id: "lens", label: "Lens model" }],
]);

const TYPE_SIZES = {
  1: 1,
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  7: 1,
  9: 4,
  10: 8,
};

export function clamp(value, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return minimum;
  return Math.min(maximum, Math.max(minimum, parsed));
}

export function normaliseRegion(region) {
  const x = clamp(region.x, 0, 99);
  const y = clamp(region.y, 0, 99);
  const width = clamp(region.width, 1, 100 - x);
  const height = clamp(region.height, 1, 100 - y);

  return {
    ...region,
    x,
    y,
    width,
    height,
    mode: MASK_MODES.includes(region.mode) ? region.mode : "solid",
    reviewArea: REVIEW_AREAS.some((item) => item.id === region.reviewArea)
      ? region.reviewArea
      : "background-detail",
  };
}

export function rectangleFromPoints(start, end, minimumSize = 1) {
  const startX = clamp(start?.x, 0, 100);
  const startY = clamp(start?.y, 0, 100);
  const endX = clamp(end?.x, 0, 100);
  const endY = clamp(end?.y, 0, 100);
  const rectangle = {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
  };

  if (rectangle.width < minimumSize || rectangle.height < minimumSize) return null;
  return rectangle;
}

export function regionToPixels(region, imageWidth, imageHeight) {
  const width = Math.max(0, Number(imageWidth) || 0);
  const height = Math.max(0, Number(imageHeight) || 0);

  return {
    x: Math.round((region.x / 100) * width),
    y: Math.round((region.y / 100) * height),
    width: Math.round((region.width / 100) * width),
    height: Math.round((region.height / 100) * height),
  };
}

export function createDefaultRegion({ id, mode = "solid", reviewArea = "school-id" } = {}) {
  return normaliseRegion({
    id,
    x: 30,
    y: 35,
    width: 40,
    height: 20,
    mode,
    reviewArea,
  });
}

function hasBytes(view, offset, length) {
  return offset >= 0 && length >= 0 && offset + length <= view.byteLength;
}

function readAscii(view, offset, length) {
  if (!hasBytes(view, offset, length)) return "";
  let value = "";
  for (let index = 0; index < length; index += 1) {
    const byte = view.getUint8(offset + index);
    if (byte === 0) break;
    if (byte >= 32 && byte <= 126) value += String.fromCharCode(byte);
  }
  return value.trim();
}

function readTagValue(view, tiffOffset, entryOffset, littleEndian) {
  if (!hasBytes(view, entryOffset, 12)) return "";
  const type = view.getUint16(entryOffset + 2, littleEndian);
  const count = view.getUint32(entryOffset + 4, littleEndian);
  const size = TYPE_SIZES[type];
  if (!size || !count || count > 1_000_000) return "";
  const byteLength = size * count;
  const valueOffset =
    byteLength <= 4
      ? entryOffset + 8
      : tiffOffset + view.getUint32(entryOffset + 8, littleEndian);

  if (!hasBytes(view, valueOffset, byteLength)) return "";
  if (type === 2 || type === 7) return readAscii(view, valueOffset, Math.min(byteLength, 256));
  return "";
}

function parseTiff(view, tiffOffset, markers) {
  if (!hasBytes(view, tiffOffset, 8)) return;
  const byteOrder = readAscii(view, tiffOffset, 2);
  const littleEndian = byteOrder === "II";
  if (!littleEndian && byteOrder !== "MM") return;
  if (view.getUint16(tiffOffset + 2, littleEndian) !== 42) return;

  const visited = new Set();
  const parseIfd = (relativeOffset, depth = 0) => {
    if (depth > 3 || !Number.isFinite(relativeOffset) || visited.has(relativeOffset)) return;
    visited.add(relativeOffset);
    const directoryOffset = tiffOffset + relativeOffset;
    if (!hasBytes(view, directoryOffset, 2)) return;
    const count = Math.min(view.getUint16(directoryOffset, littleEndian), 256);

    for (let index = 0; index < count; index += 1) {
      const entryOffset = directoryOffset + 2 + index * 12;
      if (!hasBytes(view, entryOffset, 12)) break;
      const tag = view.getUint16(entryOffset, littleEndian);
      const marker = EXIF_TAGS.get(tag);
      if (marker) {
        markers.push({
          ...marker,
          value: readTagValue(view, tiffOffset, entryOffset, littleEndian),
        });
      }

      if (tag === 0x8769 || tag === 0x8825) {
        const nestedOffset = view.getUint32(entryOffset + 8, littleEndian);
        parseIfd(nestedOffset, depth + 1);
      }
    }
  };

  const firstIfd = view.getUint32(tiffOffset + 4, littleEndian);
  parseIfd(firstIfd);
}

function inspectJpeg(view, markers) {
  let offset = 2;
  while (hasBytes(view, offset, 4)) {
    if (view.getUint8(offset) !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = view.getUint8(offset + 1);
    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0x00 || marker === 0xff) {
      offset += 1;
      continue;
    }

    const segmentLength = view.getUint16(offset + 2, false);
    if (segmentLength < 2 || !hasBytes(view, offset + 2, segmentLength)) break;
    const payloadOffset = offset + 4;
    if (marker === 0xe1 && readAscii(view, payloadOffset, 4) === "Exif") {
      markers.push({ id: "exif", label: "EXIF metadata", value: "" });
      parseTiff(view, payloadOffset + 6, markers);
    }
    offset += segmentLength + 2;
  }
}

function inspectPng(view, markers) {
  let offset = 8;
  while (hasBytes(view, offset, 12)) {
    const length = view.getUint32(offset, false);
    const type = readAscii(view, offset + 4, 4);
    const dataOffset = offset + 8;
    if (!hasBytes(view, dataOffset, length + 4)) break;

    if (type === "eXIf") {
      markers.push({ id: "exif", label: "EXIF metadata", value: "" });
      parseTiff(view, dataOffset, markers);
    } else if (type === "tEXt" || type === "iTXt") {
      const text = readAscii(view, dataOffset, Math.min(length, 1024));
      const lower = text.toLowerCase();
      if (lower.includes("gps") || lower.includes("location")) {
        markers.push({ id: "gps", label: "Location-related text metadata", value: "" });
      } else if (text) {
        markers.push({ id: "text", label: "Embedded text metadata", value: "" });
      }
    }
    offset += length + 12;
  }
}

function inspectWebp(view, markers) {
  let offset = 12;
  while (hasBytes(view, offset, 8)) {
    const type = readAscii(view, offset, 4);
    const length = view.getUint32(offset + 4, true);
    const dataOffset = offset + 8;
    if (!hasBytes(view, dataOffset, length)) break;
    if (type === "EXIF") {
      markers.push({ id: "exif", label: "EXIF metadata", value: "" });
      const tiffOffset = readAscii(view, dataOffset, 4) === "Exif" ? dataOffset + 6 : dataOffset;
      parseTiff(view, tiffOffset, markers);
    } else if (type === "XMP ") {
      markers.push({ id: "xmp", label: "XMP metadata", value: "" });
    }
    offset += 8 + length + (length % 2);
  }
}

function dedupeMarkers(markers) {
  const byId = new Map();
  markers.forEach((marker) => {
    const current = byId.get(marker.id);
    if (!current || (!current.value && marker.value)) byId.set(marker.id, marker);
  });
  return [...byId.values()];
}

export function inspectImageMetadata(arrayBuffer) {
  if (!(arrayBuffer instanceof ArrayBuffer)) {
    return { format: "unknown", markers: [], exifFound: false, gpsFound: false };
  }

  const view = new DataView(arrayBuffer);
  const markers = [];
  let format = "unknown";

  if (
    view.byteLength >= 2 &&
    view.getUint8(0) === 0xff &&
    view.getUint8(1) === 0xd8
  ) {
    format = "jpeg";
    inspectJpeg(view, markers);
  } else if (
    view.byteLength >= 8 &&
    view.getUint32(0, false) === 0x89504e47 &&
    view.getUint32(4, false) === 0x0d0a1a0a
  ) {
    format = "png";
    inspectPng(view, markers);
  } else if (
    view.byteLength >= 12 &&
    readAscii(view, 0, 4) === "RIFF" &&
    readAscii(view, 8, 4) === "WEBP"
  ) {
    format = "webp";
    inspectWebp(view, markers);
  }

  const uniqueMarkers = dedupeMarkers(markers);
  return {
    format,
    markers: uniqueMarkers,
    exifFound: uniqueMarkers.some((marker) => marker.id === "exif"),
    gpsFound: uniqueMarkers.some((marker) => marker.id === "gps"),
  };
}

export function formatFileSize(bytes = 0) {
  const safeBytes = Math.max(0, Number(bytes) || 0);
  if (safeBytes < 1024) return `${Math.round(safeBytes)} B`;
  if (safeBytes < 1024 ** 2) return `${(safeBytes / 1024).toFixed(1)} KB`;
  return `${(safeBytes / 1024 ** 2).toFixed(1)} MB`;
}
