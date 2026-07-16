export const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/tiff",
  "image/bmp",
];

export const FILE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".tiff",
  ".tif",
  ".bmp",
];

export const EXIF_TAGS = new Map([
  [0x010f, "Camera Make"],
  [0x0110, "Camera Model"],
  [0x0112, "Orientation"],
  [0x0131, "Software"],
  [0x0132, "Modified Date"],
  [0x829a, "Exposure Time"],
  [0x829d, "F-Number"],
  [0x8827, "ISO Speed"],
  [0x9003, "Original Date"],
  [0x9004, "Digitized Date"],
  [0x9209, "Flash"],
  [0x920a, "Focal Length"],
  [0xa002, "Image Width"],
  [0xa003, "Image Height"],
  [0x8825, "GPS Directory"],
  [0xa434, "Lens Model"],
  [0xa433, "Lens Make"],
  [0x013b, "Artist"],
  [0x8298, "Copyright"],
  [0xa005, "EXIF Version"],
  [0xa001, "Color Space"],
  [0xa002, "Pixel X Dimension"],
  [0xa003, "Pixel Y Dimension"],
]);

export const GPS_TAGS = new Map([
  [0x0001, "GPS Latitude Ref"],
  [0x0002, "GPS Latitude"],
  [0x0003, "GPS Longitude Ref"],
  [0x0004, "GPS Longitude"],
  [0x0005, "GPS Altitude Ref"],
  [0x0006, "GPS Altitude"],
  [0x0007, "GPS Time Stamp"],
  [0x001d, "GPS Date Stamp"],
]);

export const METADATA_SECTIONS = [
  "File Info",
  "Camera",
  "Exposure",
  "GPS",
  "Dates",
  "Software",
];

export const ORIENTATION_MAP = {
  1: "Normal",
  2: "Flipped Horizontal",
  3: "Rotated 180\u00B0",
  4: "Flipped Vertical",
  5: "Transposed",
  6: "Rotated 90\u00B0 CW",
  7: "Transverse",
  8: "Rotated 90\u00B0 CCW",
};
