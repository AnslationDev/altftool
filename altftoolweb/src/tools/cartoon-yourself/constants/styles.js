export const cartoonStyles = [
  {
    id: "classic",
    name: "Classic Cartoon",
    description: "Traditional cartoon style with bold lines and vibrant colors",
    filter: "contrast(140%) saturate(140%) brightness(110%)",
    icon: "Paintbrush",
  },
  {
    id: "anime",
    name: "Anime",
    description: "Japanese animation style with smooth lines and vivid colors",
    filter: "saturate(170%) contrast(120%) brightness(110%)",
    icon: "Sparkles",
  },
  {
    id: "comic",
    name: "Comic Book",
    description: "Bold comic book style with high contrast and dramatic shadows",
    filter: "contrast(160%) saturate(120%) brightness(105%)",
    icon: "BookOpen",
  },
  {
    id: "sketch",
    name: "Sketch",
    description: "Pencil sketch effect with grayscale and high contrast",
    filter: "grayscale(100%) contrast(160%) brightness(110%)",
    icon: "PenTool",
  },
  {
    id: "pencil",
    name: "Pencil Art",
    description: "Detailed pencil drawing effect with subtle shading",
    filter: "grayscale(80%) contrast(130%) brightness(110%)",
    icon: "Pencil",
  },
  {
    id: "watercolor",
    name: "Watercolor",
    description: "Soft watercolor painting effect with gentle colors",
    filter: "saturate(80%) brightness(110%) contrast(90%)",
    icon: "Palette",
  },
  {
    id: "pixar",
    name: "Pixar Inspired",
    description: "3D animated movie style with smooth textures and warm tones",
    filter: "saturate(130%) contrast(110%) brightness(110%)",
    icon: "Film",
  },
  {
    id: "3d",
    name: "3D Cartoon",
    description: "Three-dimensional cartoon effect with depth and shading",
    filter: "contrast(130%) brightness(105%) saturate(120%)",
    icon: "Box",
  },
  {
    id: "minimal",
    name: "Minimal Cartoon",
    description: "Clean minimal style with simplified colors and shapes",
    filter: "saturate(90%) brightness(110%) contrast(105%)",
    icon: "Minus",
  },
  {
    id: "pop",
    name: "Pop Art",
    description: "Andy Warhol inspired pop art with bold colors and patterns",
    filter: "saturate(200%) contrast(150%) brightness(110%)",
    icon: "Stars",
  },
  {
    id: "flat",
    name: "Flat Illustration",
    description: "Modern flat design style with solid colors and clean lines",
    filter: "saturate(110%) contrast(105%) brightness(110%)",
    icon: "Layers",
  },
];

export const adjustmentDefaults = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sharpness: 0,
  smoothness: 0,
};

export const exportFormats = [
  { id: "png", label: "PNG", mime: "image/png", extension: "png" },
  { id: "jpeg", label: "JPEG", mime: "image/jpeg", extension: "jpg" },
  { id: "webp", label: "WEBP", mime: "image/webp", extension: "webp" },
];

export const supportedFormats = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

export const maxFileSize = 10 * 1024 * 1024;
