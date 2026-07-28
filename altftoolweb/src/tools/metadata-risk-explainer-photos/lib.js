/**
 * Photo metadata (EXIF / GPS IFD / IPTC / XMP) privacy risk model.
 *
 * Tag numbers below are the real ones from the Exif specification (JEITA
 * CP-3451, now maintained as CIPA DC-008): EXIF tags live in IFD0 and the Exif
 * SubIFD, location tags live in a separate GPS IFD, and Adobe XMP / IPTC blocks
 * are stored as separate application segments in the same JPEG.
 *
 * `weight` is a relative privacy weight, 1 (harmless) to 10 (directly locates
 * or identifies a person). It is a judgement scale, not a measurement — the
 * ordering is what matters, and it is documented on every field.
 *
 * Pure module: no React, no DOM, no I/O, no clock reads.
 */

/** Field categories used for the breakdown. */
export const CATEGORIES = [
  { id: "location", label: "Where you were" },
  { id: "identity", label: "Who you are" },
  { id: "device", label: "Which device you own" },
  { id: "timing", label: "When you were there" },
  { id: "hidden", label: "What you thought you removed" },
];

export const EXIF_FIELDS = [
  {
    id: "gps-latlon",
    label: "GPS latitude and longitude",
    tag: "GPSLatitude 0x0002 / GPSLongitude 0x0004 (GPS IFD)",
    category: "location",
    weight: 10,
    example: "51 deg 30' 26.4\" N, 0 deg 7' 39.9\" W",
    reveals:
      "The exact spot the shutter fired, usually accurate to within a few metres. A photo taken indoors pins your home, your workplace or a friend's address.",
    default: true,
  },
  {
    id: "gps-altitude",
    label: "GPS altitude",
    tag: "GPSAltitude 0x0006",
    category: "location",
    weight: 2,
    example: "42.7 m above sea level",
    reveals:
      "Which floor of a building you were on. Combined with coordinates it narrows a flat inside an apartment block.",
    default: true,
  },
  {
    id: "gps-timestamp",
    label: "GPS date and time",
    tag: "GPSDateStamp 0x001D / GPSTimeStamp 0x0007",
    category: "timing",
    weight: 3,
    example: "2026:03:14 09:12:07 UTC",
    reveals:
      "A satellite-accurate UTC timestamp that survives even when the camera clock is wrong, so a claimed time cannot be edited away.",
    default: true,
  },
  {
    id: "datetime-original",
    label: "Original capture time",
    tag: "DateTimeOriginal 0x9003",
    category: "timing",
    weight: 5,
    example: "2026:03:14 09:12:05",
    reveals:
      "When the photo was actually taken, to the second. Across a set of photos it draws your daily routine — commute, gym, school run.",
    default: true,
  },
  {
    id: "offset-time",
    label: "UTC offset of the camera clock",
    tag: "OffsetTimeOriginal 0x9011",
    category: "timing",
    weight: 3,
    example: "+05:30",
    reveals:
      "Your time zone at the moment of capture, which narrows the country even when GPS is switched off.",
    default: true,
  },
  {
    id: "make",
    label: "Camera or phone manufacturer",
    tag: "Make 0x010F",
    category: "device",
    weight: 2,
    example: "Apple",
    reveals: "The brand of hardware you own — a small detail on its own, and a useful filter in bulk.",
    default: true,
  },
  {
    id: "model",
    label: "Camera or phone model",
    tag: "Model 0x0110",
    category: "device",
    weight: 3,
    example: "iPhone 15 Pro",
    reveals:
      "The exact model, which hints at your budget, tells a burglar what is in the house, and helps match your posts across accounts.",
    default: true,
  },
  {
    id: "lens-model",
    label: "Lens model",
    tag: "LensModel 0xA434",
    category: "device",
    weight: 2,
    example: "EF 24-70mm f/2.8L II USM",
    reveals: "The glass you own. On expensive lenses this is a theft-target signal in a public post.",
    default: false,
  },
  {
    id: "body-serial",
    label: "Camera body serial number",
    tag: "BodySerialNumber 0xA431",
    category: "identity",
    weight: 8,
    example: "032041000257",
    reveals:
      "A unique per-camera identifier. Anyone can search it across photo sites to link an anonymous account to your named portfolio, or to a warranty record.",
    default: false,
  },
  {
    id: "lens-serial",
    label: "Lens serial number",
    tag: "LensSerialNumber 0xA435",
    category: "identity",
    weight: 4,
    example: "0000c1f2a9",
    reveals: "A second unique identifier that keeps linking your photos together even if you change bodies.",
    default: false,
  },
  {
    id: "software",
    label: "Software and firmware",
    tag: "Software 0x0131",
    category: "device",
    weight: 3,
    example: "Adobe Photoshop 26.1 (Macintosh)",
    reveals:
      "The OS version or editor used. It tells an attacker which unpatched software you run, and it exposes that a picture was edited.",
    default: true,
  },
  {
    id: "artist",
    label: "Artist / owner name",
    tag: "Artist 0x013B, CameraOwnerName 0xA430",
    category: "identity",
    weight: 7,
    example: "Priya Nair",
    reveals:
      "Your legal name, written into every frame automatically because you set it once in the camera menu years ago.",
    default: false,
  },
  {
    id: "copyright",
    label: "Copyright string",
    tag: "Copyright 0x8298",
    category: "identity",
    weight: 5,
    example: "(c) 2026 Priya Nair - priya@example.com",
    reveals:
      "Often carries a name, an email address and sometimes a phone number, which is exactly what a scraper harvests.",
    default: false,
  },
  {
    id: "image-unique-id",
    label: "Image unique ID",
    tag: "ImageUniqueID 0xA420",
    category: "identity",
    weight: 4,
    example: "6F1D8A2B4C7E4F0E9A3B5C6D7E8F9A0B",
    reveals:
      "A per-image identifier that survives re-uploads and re-encodes, letting two copies of the same file be matched across platforms.",
    default: false,
  },
  {
    id: "user-comment",
    label: "User comment and description",
    tag: "UserComment 0x9286, ImageDescription 0x010E",
    category: "hidden",
    weight: 3,
    example: "Client shoot - do not publish",
    reveals: "Free text you or your software wrote, frequently containing notes never meant to be public.",
    default: false,
  },
  {
    id: "thumbnail",
    label: "Embedded thumbnail",
    tag: "JPEGInterchangeFormat 0x0201 (IFD1)",
    category: "hidden",
    weight: 6,
    example: "160 x 120 preview",
    reveals:
      "Some editors update the full image but leave the old thumbnail behind, so the pre-crop or pre-blur version of the picture ships with the file.",
    default: false,
  },
  {
    id: "xmp-regions",
    label: "XMP face regions with names",
    tag: "XMP-mwg-rs:RegionName",
    category: "identity",
    weight: 8,
    example: "Region: 'Anita' at 0.42, 0.31",
    reveals:
      "Names tagged in photo-library software are written into the file, so the picture identifies other people as well as you.",
    default: false,
  },
  {
    id: "iptc-byline",
    label: "IPTC by-line, credit and location",
    tag: "IPTC 2:80 By-line, 2:110 Credit, 2:92 Sub-location",
    category: "identity",
    weight: 6,
    example: "By-line: Priya Nair / Sub-location: Bandra West",
    reveals:
      "Newsroom-style fields carrying the photographer's name, employer and a written place name that stays readable even after GPS is stripped.",
    default: false,
  },
  {
    id: "maker-notes",
    label: "Maker notes",
    tag: "MakerNote 0x927C",
    category: "hidden",
    weight: 4,
    example: "ShutterCount 41,208; burst UUID; face-detect boxes",
    reveals:
      "A vendor-private blob that can hold shutter count, internal serial numbers, burst identifiers and face-detection data. Many strippers miss it.",
    default: false,
  },
  {
    id: "shot-settings",
    label: "Exposure settings",
    tag: "ExposureTime 0x829A, FNumber 0x829D, ISOSpeedRatings 0x8827",
    category: "device",
    weight: 1,
    example: "1/250 s, f/2.8, ISO 400",
    reveals:
      "Almost harmless on its own. Indoor-versus-daylight exposure can hint at whether a shot was taken inside a home.",
    default: true,
  },
];

/**
 * Combinations that are worth more than the sum of their parts, because two
 * ordinary fields together answer a question neither answers alone.
 */
export const RISK_COMBOS = [
  {
    id: "where-and-when",
    requires: ["gps-latlon", "datetime-original"],
    bonus: 6,
    label: "Place plus exact time",
    detail:
      "Coordinates with a to-the-second timestamp place you somewhere specific at a specific minute. Repeat it across a few posts and the pattern is a schedule.",
  },
  {
    id: "camera-fingerprint",
    requires: ["body-serial", "model"],
    bonus: 4,
    label: "Camera fingerprint",
    detail:
      "A serial number plus a model turns every photo you have ever posted into one searchable set, including from accounts you kept separate.",
  },
  {
    id: "name-and-place",
    requires: ["artist", "gps-latlon"],
    bonus: 6,
    label: "Real name plus coordinates",
    detail:
      "A named owner field beside GPS coordinates is a direct link from your legal name to a physical address.",
  },
  {
    id: "uncropped-preview",
    requires: ["thumbnail", "software"],
    bonus: 3,
    label: "Edited image, original preview",
    detail:
      "An edited file that still carries its old embedded thumbnail can hand over exactly what you cropped or blurred out.",
  },
];

/**
 * Where the photo is going. The factor scales the raw score, because the same
 * metadata is far more dangerous on a pseudonymous account than in a private
 * family album.
 */
export const SHARING_CONTEXTS = [
  {
    id: "anonymous",
    label: "Pseudonymous or anonymous account",
    factor: 1.15,
    note: "Any identity field defeats the pseudonym entirely, which is the whole point of the account.",
  },
  {
    id: "marketplace",
    label: "Marketplace or classifieds listing",
    factor: 1.1,
    note: "Buyers are strangers, and an item photographed at home carries the home's coordinates.",
  },
  {
    id: "dating",
    label: "Dating profile",
    factor: 1.1,
    note: "Matches you have not met can read location and timing straight from an uploaded picture.",
  },
  {
    id: "public-social",
    label: "Public social post or website",
    factor: 1,
    note: "Indexable, scrapeable and archived — assume the file is kept forever by someone.",
  },
  {
    id: "private-group",
    label: "Private group or direct message",
    factor: 0.7,
    note: "A smaller audience, but the file can still be forwarded with all its metadata intact.",
  },
  {
    id: "personal-archive",
    label: "Your own backup or archive",
    factor: 0.4,
    note: "Metadata is useful here — the risk is a future breach or a shared cloud link, not the file itself.",
  },
];

export const RISK_BANDS = [
  { min: 70, id: "severe", label: "Severe", advice: "Strip metadata before this file leaves your device." },
  { min: 45, id: "high", label: "High", advice: "Remove at least the location and identity fields." },
  { min: 20, id: "moderate", label: "Moderate", advice: "Worth cleaning, especially the timing fields." },
  { min: 1, id: "low", label: "Low", advice: "Little exposure left, but check the hidden fields." },
  { min: 0, id: "none", label: "None", advice: "Nothing selected — a fully stripped file looks like this." },
];

/** Maximum obtainable raw points: every field plus every combo bonus. */
export const MAX_RAW_POINTS =
  EXIF_FIELDS.reduce((sum, field) => sum + field.weight, 0) +
  RISK_COMBOS.reduce((sum, combo) => sum + combo.bonus, 0);

export function getField(fieldId) {
  return EXIF_FIELDS.find((field) => field.id === fieldId) || null;
}

export function getContext(contextId) {
  return SHARING_CONTEXTS.find((context) => context.id === contextId) || null;
}

/** The fields a stock phone photo usually carries straight out of the camera. */
export function defaultPresentFieldIds() {
  return EXIF_FIELDS.filter((field) => field.default).map((field) => field.id);
}

function bandFor(score) {
  return RISK_BANDS.find((band) => score >= band.min) || RISK_BANDS[RISK_BANDS.length - 1];
}

/**
 * Score the exposure of a photo.
 * @param {{presentIds?: string[], contextId?: string}} input
 * @returns {{error:string}|object}
 */
export function assessPhotoMetadata({ presentIds = [], contextId = "public-social" } = {}) {
  if (!Array.isArray(presentIds)) {
    return { error: "Present fields must be given as a list of field ids." };
  }
  const context = getContext(contextId);
  if (!context) {
    return { error: "Choose where the photo is being shared — that decides how much the metadata matters." };
  }

  const known = presentIds.map(getField).filter(Boolean);
  if (presentIds.length > 0 && known.length === 0) {
    return { error: "None of those field ids match a known EXIF, GPS, IPTC or XMP field." };
  }

  const presentSet = new Set(known.map((field) => field.id));
  const fieldPoints = known.reduce((sum, field) => sum + field.weight, 0);

  const combos = RISK_COMBOS.filter((combo) => combo.requires.every((id) => presentSet.has(id)));
  const comboPoints = combos.reduce((sum, combo) => sum + combo.bonus, 0);

  const raw = fieldPoints + comboPoints;
  // MAX_RAW_POINTS is a module constant well above zero, but guard anyway.
  const base = MAX_RAW_POINTS > 0 ? (raw / MAX_RAW_POINTS) * 100 : 0;
  const score = Math.max(0, Math.min(100, Math.round(base * context.factor)));

  const byCategory = CATEGORIES.map((category) => {
    const fields = known.filter((field) => field.category === category.id);
    return {
      ...category,
      count: fields.length,
      points: fields.reduce((sum, field) => sum + field.weight, 0),
      fields,
    };
  }).filter((entry) => entry.count > 0);

  const topRisks = [...known].sort((a, b) => b.weight - a.weight).slice(0, 5);

  return {
    score,
    band: bandFor(score),
    context,
    rawPoints: raw,
    maxPoints: MAX_RAW_POINTS,
    fieldCount: known.length,
    totalFields: EXIF_FIELDS.length,
    combos,
    byCategory,
    topRisks,
    fields: known,
  };
}

/**
 * What to do about it, ordered by what actually removes the most risk.
 * Returned as data so the UI does no reasoning of its own.
 */
export function removalPlan(assessment) {
  if (!assessment || assessment.error) return [];
  const ids = new Set(assessment.fields.map((field) => field.id));
  const plan = [];

  if (ids.has("gps-latlon") || ids.has("gps-altitude") || ids.has("gps-timestamp")) {
    plan.push({
      id: "location-off",
      title: "Turn location off for the camera app",
      detail:
        "Removing coordinates after the fact only works if you remember every time. Denying the camera location access means the GPS IFD is never written.",
    });
  }
  if (ids.has("artist") || ids.has("copyright") || ids.has("iptc-byline")) {
    plan.push({
      id: "clear-owner",
      title: "Clear the owner and copyright fields in the camera menu",
      detail:
        "These are written from a setting you filled in once. Blank them there and new photos stop carrying your name.",
    });
  }
  if (ids.has("xmp-regions")) {
    plan.push({
      id: "no-face-export",
      title: "Export without face tags",
      detail:
        "Photo libraries write tagged names into XMP on export. Use an export preset that excludes keywords and person regions.",
    });
  }
  if (ids.has("thumbnail") || ids.has("maker-notes")) {
    plan.push({
      id: "full-strip",
      title: "Use a full strip, not a quick one",
      detail:
        "Embedded thumbnails and vendor maker notes survive many one-click cleaners. Re-encode the image, or strip all metadata blocks explicitly.",
    });
  }
  if (ids.has("body-serial") || ids.has("lens-serial") || ids.has("image-unique-id")) {
    plan.push({
      id: "break-fingerprint",
      title: "Break the per-device fingerprint",
      detail:
        "Serial numbers and unique IDs link separate accounts together. Strip them on anything posted from a pseudonymous identity.",
    });
  }
  plan.push({
    id: "screenshot-check",
    title: "Verify after stripping, do not assume",
    detail:
      "Re-open the cleaned file in a metadata viewer before sending it. Some platforms strip on upload, some re-add their own, and some do neither.",
  });

  return plan;
}
