import { EXIF_TAGS, GPS_TAGS, ORIENTATION_MAP } from "../constants/index";

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

function readAscii(view, start, length) {
  let output = "";
  for (let index = 0; index < length; index += 1) {
    const code = view.getUint8(start + index);
    if (code !== 0) output += String.fromCharCode(code);
  }
  return output.trim();
}

function readValue(view, tiffStart, entryOffset, littleEndian) {
  const type = view.getUint16(entryOffset + 2, littleEndian);
  const count = view.getUint32(entryOffset + 4, littleEndian);
  const byteLength = (TYPE_SIZES[type] || 1) * count;
  const valueOffset =
    byteLength <= 4
      ? entryOffset + 8
      : tiffStart + view.getUint32(entryOffset + 8, littleEndian);

  if (type === 2) {
    return readAscii(view, valueOffset, count);
  }

  if (type === 3) {
    const values = Array.from({ length: count }, (_, index) =>
      view.getUint16(valueOffset + index * 2, littleEndian)
    );
    return values.length === 1 ? values[0] : values.join(", ");
  }

  if (type === 4) {
    const values = Array.from({ length: count }, (_, index) =>
      view.getUint32(valueOffset + index * 4, littleEndian)
    );
    return values.length === 1 ? values[0] : values.join(", ");
  }

  if (type === 5) {
    const values = Array.from({ length: count }, (_, index) => {
      const numerator = view.getUint32(valueOffset + index * 8, littleEndian);
      const denominator =
        view.getUint32(valueOffset + index * 8 + 4, littleEndian) || 1;
      const decimal = numerator / denominator;
      return Number.isInteger(decimal)
        ? String(decimal)
        : decimal.toFixed(4);
    });
    return values.length === 1 ? values[0] : values.join(", ");
  }

  return `Type ${type}, ${count} value(s)`;
}

function readRawValue(view, tiffStart, entryOffset, littleEndian) {
  const type = view.getUint16(entryOffset + 2, littleEndian);
  const count = view.getUint32(entryOffset + 4, littleEndian);
  const byteLength = (TYPE_SIZES[type] || 1) * count;
  const valueOffset =
    byteLength <= 4
      ? entryOffset + 8
      : tiffStart + view.getUint32(entryOffset + 8, littleEndian);

  if (type === 5 && count >= 1) {
    const numerator = view.getUint32(valueOffset, littleEndian);
    const denominator =
      view.getUint32(valueOffset + 4, littleEndian) || 1;
    return numerator / denominator;
  }
  if (type === 3 && count === 1) {
    return view.getUint16(valueOffset, littleEndian);
  }
  if (type === 4 && count === 1) {
    return view.getUint32(valueOffset, littleEndian);
  }
  return null;
}

function parseIFD(view, tiffStart, offset, littleEndian, tagMap) {
  const rows = [];
  if (tiffStart + offset + 2 > view.byteLength) return rows;

  const entries = view.getUint16(tiffStart + offset, littleEndian);

  for (let index = 0; index < entries; index += 1) {
    const entryOffset = tiffStart + offset + 2 + index * 12;
    if (entryOffset + 12 > view.byteLength) break;

    const tag = view.getUint16(entryOffset, littleEndian);
    const name = tagMap.get(tag) || `Tag 0x${tag.toString(16).padStart(4, "0")}`;
    const value = readValue(view, tiffStart, entryOffset, littleEndian);
    rows.push({ tag, name, value: String(value) });

    if (tag === 0x8825) {
      const gpsOffset = readRawValue(
        view,
        tiffStart,
        entryOffset,
        littleEndian
      );
      if (gpsOffset !== null && Number.isFinite(gpsOffset)) {
        const gpsRows = parseIFD(
          view,
          tiffStart,
          gpsOffset,
          littleEndian,
          GPS_TAGS
        );
        rows.push(...gpsRows);
      }
    }
  }

  return rows;
}

function parseGPS(rows) {
  const result = { lat: null, lng: null, latRef: "", lngRef: "", altitude: null };

  for (const row of rows) {
    if (row.name === "GPS Latitude Ref") result.latRef = row.value;
    if (row.name === "GPS Longitude Ref") result.lngRef = row.value;
    if (row.name === "GPS Altitude") result.altitude = parseFloat(row.value) || null;
    if (row.name === "GPS Altitude Ref" && row.value === "1") {
      result.altitude = result.altitude !== null ? -result.altitude : null;
    }
  }

  const latRow = rows.find((r) => r.name === "GPS Latitude");
  const lngRow = rows.find((r) => r.name === "GPS Longitude");

  if (latRow) {
    const parts = latRow.value.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length >= 3) {
      const [deg, min, sec] = parts;
      result.lat = deg + min / 60 + sec / 3600;
      if (result.latRef === "S") result.lat = -result.lat;
      result.lat = Math.round(result.lat * 1000000) / 1000000;
    }
  }

  if (lngRow) {
    const parts = lngRow.value.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length >= 3) {
      const [deg, min, sec] = parts;
      result.lng = deg + min / 60 + sec / 3600;
      if (result.lngRef === "W") result.lng = -result.lng;
      result.lng = Math.round(result.lng * 1000000) / 1000000;
    }
  }

  return result;
}

function formatExposureTime(value) {
  const num = parseFloat(value);
  if (!num || !Number.isFinite(num)) return String(value);
  if (num >= 1) return `${num}s`;
  const denominator = Math.round(1 / num);
  return `1/${denominator}`;
}

function formatFNumber(value) {
  const num = parseFloat(value);
  if (!num || !Number.isFinite(num)) return String(value);
  return `f/${num}`;
}

function formatFocalLength(value) {
  const num = parseFloat(value);
  if (!num || !Number.isFinite(num)) return String(value);
  return `${Math.round(num)}mm`;
}

function classifyMetadata(rows, fileInfo) {
  const cameraKeywords = [
    "Camera Make",
    "Camera Model",
    "Lens Make",
    "Lens Model",
    "Orientation",
    "Artist",
    "Image Width",
    "Image Height",
    "Pixel X Dimension",
    "Pixel Y Dimension",
  ];

  const exposureKeywords = [
    "Exposure Time",
    "F-Number",
    "ISO Speed",
    "Focal Length",
    "Flash",
    "EXIF Version",
    "Color Space",
  ];

  const gpsKeywords = [
    "GPS Latitude Ref",
    "GPS Latitude",
    "GPS Longitude Ref",
    "GPS Longitude",
    "GPS Altitude Ref",
    "GPS Altitude",
    "GPS Time Stamp",
    "GPS Date Stamp",
    "GPS Directory",
  ];

  const dateKeywords = ["Modified Date", "Original Date", "Digitized Date"];
  const softwareKeywords = ["Software", "Copyright"];

  const classified = {
    camera: [],
    exposure: [],
    gps: [],
    dates: [],
    software: [],
    other: [],
  };

  for (const row of rows) {
    if (cameraKeywords.includes(row.name)) {
      classified.camera.push(row);
    } else if (exposureKeywords.includes(row.name)) {
      classified.exposure.push(row);
    } else if (gpsKeywords.includes(row.name)) {
      classified.gps.push(row);
    } else if (dateKeywords.includes(row.name)) {
      classified.dates.push(row);
    } else if (softwareKeywords.includes(row.name)) {
      classified.software.push(row);
    } else {
      classified.other.push(row);
    }
  }

  if (fileInfo) {
    classified.camera.unshift(
      { tag: -1, name: "File Name", value: fileInfo.name },
      { tag: -2, name: "File Size", value: formatBytes(fileInfo.size) },
      { tag: -3, name: "File Type", value: fileInfo.type }
    );
  }

  return classified;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / 1024 ** index).toFixed(index ? 2 : 0)} ${units[index]}`;
}

export class MetadataParser {
  static parseExif(buffer) {
    const empty = {
      fileInfo: {},
      camera: [],
      exposure: [],
      gps: [],
      dates: [],
      software: [],
      raw: [],
    };

    try {
      const view = new DataView(buffer);
      if (view.byteLength < 2) return empty;
      if (view.getUint16(0) !== 0xffd8) return empty;

      let offset = 2;
      while (offset < view.byteLength - 1) {
        if (view.getUint8(offset) !== 0xff) break;
        const marker = view.getUint8(offset + 1);

        if (marker === 0xda || marker === 0xd9) break;

        if (marker === 0xe1) {
          const length = view.getUint16(offset + 2);
          if (offset + 4 + 6 > view.byteLength) break;
          const exifHeader = readAscii(view, offset + 4, 6);

          if (exifHeader === "Exif") {
            const tiffStart = offset + 10;
            if (tiffStart + 8 > view.byteLength) break;

            const endian = readAscii(view, tiffStart, 2);
            const littleEndian = endian === "II";
            const firstIfd = view.getUint32(tiffStart + 4, littleEndian);

            const raw = parseIFD(
              view,
              tiffStart,
              firstIfd,
              littleEndian,
              EXIF_TAGS
            );

            const gpsRows = [];
            const otherRows = [];

            for (const row of raw) {
              if (
                row.name.startsWith("GPS") ||
                row.name === "GPS Directory"
              ) {
                gpsRows.push(row);
              } else {
                otherRows.push(row);
              }
            }

            const classified = classifyMetadata(otherRows, null);

            classified.raw = raw;

            return {
              fileInfo: {},
              camera: classified.camera,
              exposure: classified.exposure,
              gps: gpsRows,
              dates: classified.dates,
              software: classified.software,
              raw,
            };
          }

          offset += 2 + length;
          continue;
        }

        if (offset + 3 >= view.byteLength) break;
        const length = view.getUint16(offset + 2);
        if (length < 2) break;
        offset += 2 + length;
      }

      return empty;
    } catch {
      return empty;
    }
  }

  static formatExposureTime(value) {
    return formatExposureTime(value);
  }

  static formatFNumber(value) {
    return formatFNumber(value);
  }

  static formatFocalLength(value) {
    return formatFocalLength(value);
  }

  static parseGPS(rows) {
    return parseGPS(rows);
  }

  static classifyMetadata(rows, fileInfo) {
    return classifyMetadata(rows, fileInfo);
  }

  static formatBytes(bytes) {
    return formatBytes(bytes);
  }
}

export default MetadataParser;
