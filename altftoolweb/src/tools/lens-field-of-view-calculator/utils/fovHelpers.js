// Lens Field of View Calculator Helpers and Presets

export const SENSOR_CATEGORIES = {
  CAMERAS: "Still / Cinema Cameras",
  DRONES: "Drones & Action Cams",
  CCTV: "CCTV & Industrial Sensors",
  CUSTOM: "Custom Configuration"
};

export const SENSOR_PRESETS = [
  // Still / Cinema Cameras
  {
    id: "full-frame",
    name: "35mm Full Frame",
    width: 36.0,
    height: 24.0,
    category: SENSOR_CATEGORIES.CAMERAS,
    description: "Standard mirrorless/DSLR reference (crop factor 1.0x)"
  },
  {
    id: "aps-c",
    name: "APS-C (Sony/Nikon/Fuji)",
    width: 23.6,
    height: 15.7,
    category: SENSOR_CATEGORIES.CAMERAS,
    description: "Standard crop sensor (crop factor 1.5x)"
  },
  {
    id: "aps-c-canon",
    name: "APS-C (Canon)",
    width: 22.3,
    height: 14.9,
    category: SENSOR_CATEGORIES.CAMERAS,
    description: "Canon proprietary crop sensor (crop factor 1.6x)"
  },
  {
    id: "micro-four-thirds",
    name: "Micro Four Thirds (M43)",
    width: 17.3,
    height: 13.0,
    category: SENSOR_CATEGORIES.CAMERAS,
    description: "Standard mirrorless smaller format (crop factor 2.0x)"
  },
  {
    id: "medium-format",
    name: "Medium Format (Fujifilm GFX)",
    width: 44.0,
    height: 33.0,
    category: SENSOR_CATEGORIES.CAMERAS,
    description: "High-end large format sensor (crop factor 0.79x)"
  },
  {
    id: "super-35",
    name: "Super 35 (Cinema)",
    width: 24.89,
    height: 18.66,
    category: SENSOR_CATEGORIES.CAMERAS,
    description: "Classic cinema production format (crop factor 1.39x)"
  },

  // Drones
  {
    id: "dji-mavic-3",
    name: "DJI Mavic 3 Main (4/3\")",
    width: 17.3,
    height: 13.0,
    category: SENSOR_CATEGORIES.DRONES,
    description: "Mavic 3 Hasselblad camera sensor"
  },
  {
    id: "dji-mini-4-pro",
    name: "DJI Mini 4 Pro (1/1.3\")",
    width: 9.6,
    height: 7.2,
    category: SENSOR_CATEGORIES.DRONES,
    description: "Ultra-light drone camera sensor"
  },
  {
    id: "gopro-hero-12",
    name: "GoPro Hero 12 (1/1.9\")",
    width: 6.4,
    height: 5.6,
    category: SENSOR_CATEGORIES.DRONES,
    description: "Action camera square-ish format"
  },

  // CCTV
  {
    id: "cctv-1",
    name: "CCTV 1\" Format",
    width: 12.8,
    height: 9.6,
    category: SENSOR_CATEGORIES.CCTV,
    description: "Large format industrial sensor"
  },
  {
    id: "cctv-2-3",
    name: "CCTV 2/3\" Format",
    width: 8.8,
    height: 6.6,
    category: SENSOR_CATEGORIES.CCTV,
    description: "Standard industrial C-mount sensor"
  },
  {
    id: "cctv-1-1-8",
    name: "CCTV 1/1.8\" Format",
    width: 7.2,
    height: 5.4,
    category: SENSOR_CATEGORIES.CCTV,
    description: "High sensitivity security sensor"
  },
  {
    id: "cctv-1-2",
    name: "CCTV 1/2\" Format",
    width: 6.4,
    height: 4.8,
    category: SENSOR_CATEGORIES.CCTV,
    description: "Medium format security camera sensor"
  },
  {
    id: "cctv-1-3",
    name: "CCTV 1/3\" Format",
    width: 4.8,
    height: 3.6,
    category: SENSOR_CATEGORIES.CCTV,
    description: "Common legacy security camera sensor"
  }
];

export const FOCAL_PRESETS = [
  { value: 12, label: "12mm (Ultra Wide)" },
  { value: 16, label: "16mm (Super Wide)" },
  { value: 24, label: "24mm (Wide)" },
  { value: 35, label: "35mm (Standard Wide)" },
  { value: 50, label: "50mm (Standard/Normal)" },
  { value: 85, label: "85mm (Portrait)" },
  { value: 105, label: "105mm (Macro/Tele)" },
  { value: 135, label: "135mm (Medium Tele)" },
  { value: 200, label: "200mm (Telephoto)" },
  { value: 400, label: "400mm (Super Tele)" }
];

export const APERTURE_PRESETS = [
  { value: 1.2, label: "f/1.2" },
  { value: 1.4, label: "f/1.4" },
  { value: 1.8, label: "f/1.8" },
  { value: 2.0, label: "f/2.0" },
  { value: 2.8, label: "f/2.8" },
  { value: 4.0, label: "f/4.0" },
  { value: 5.6, label: "f/5.6" },
  { value: 8.0, label: "f/8.0" },
  { value: 11.0, label: "f/11.0" },
  { value: 16.0, label: "f/16.0" }
];

// Reference Diagonal is 35mm Full Frame: Math.sqrt(36^2 + 24^2) ≈ 43.266615
const REF_DIAGONAL = 43.266615;

export const calcDiagonal = (width, height) => {
  return Math.sqrt(width * width + height * height);
};

export const calcCropFactor = (width, height) => {
  const diag = calcDiagonal(width, height);
  if (diag === 0) return 0;
  return REF_DIAGONAL / diag;
};

export const calcFov = (sensorDimension, focalLength) => {
  if (focalLength <= 0 || sensorDimension <= 0) return 0;
  // Formula: FOV = 2 * atan(dimension / (2 * focalLength))
  const rad = 2 * Math.atan(sensorDimension / (2 * focalLength));
  return rad * (180 / Math.PI); // Convert to degrees
};

export const calcCoverage = (fovDegrees, distance) => {
  if (distance <= 0) return 0;
  const fovRad = fovDegrees * (Math.PI / 180);
  return 2 * distance * Math.tan(fovRad / 2);
};

export const getLensType = (equivFocalLength) => {
  if (equivFocalLength < 16) return { name: "Fisheye / Extreme Wide", color: "bg-red-500/10 text-red-400 border-red-500/20" };
  if (equivFocalLength < 24) return { name: "Ultra Wide Angle", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
  if (equivFocalLength < 35) return { name: "Wide Angle", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
  if (equivFocalLength < 60) return { name: "Standard / Normal", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
  if (equivFocalLength < 100) return { name: "Portrait / Medium Tele", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
  if (equivFocalLength < 300) return { name: "Telephoto", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" };
  return { name: "Super Telephoto", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
};

// Simulated backgrounds for viewfinder
export const SCENE_OBJECTS = [
  { id: "mountain", label: "Mountain Landscape", color: "#3B82F6" },
  { id: "portrait", label: "Portrait Subject", color: "#F43F5E" },
  { id: "cityscape", label: "City Skylines", color: "#10B981" }
];
