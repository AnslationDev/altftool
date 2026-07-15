export const DEFAULT_ADJUSTMENTS = {
  brightness: 0, contrast: 0, saturation: 0, sharpness: 0,
  exposure: 0, shadows: 0, highlights: 0, temperature: 0, tint: 0,
  zoom: 1, rotation: 0, flipH: false, flipV: false,
};

export const DEFAULT_SETTINGS = {
  defaultBg: 'white', exportFormat: 'png', printLayout: '4x6',
  theme: 'system', gridVisible: true, autoCrop: true,
};

export const PRINT_SHEET_OPTIONS = [
  { id: '1', label: '1 Photo', cols: 1, rows: 1 },
  { id: '2', label: '2 Photos', cols: 2, rows: 1 },
  { id: '4', label: '4 Photos', cols: 2, rows: 2 },
  { id: '6', label: '6 Photos', cols: 3, rows: 2 },
  { id: '8', label: '8 Photos', cols: 4, rows: 2 },
];

export const PAPER_SIZES = [
  { id: 'a4', label: 'A4', width: 2480, height: 3508 },
  { id: 'letter', label: 'Letter', width: 2550, height: 3300 },
  { id: 'custom', label: 'Custom', width: 2480, height: 3508 },
];

export const EXPORT_QUALITIES = [
  { id: 'standard', label: 'Standard', dpi: 150, quality: 0.7 },
  { id: 'high', label: 'High', dpi: 300, quality: 0.85 },
  { id: 'print', label: 'Print Quality', dpi: 600, quality: 1.0 },
];

export const STORAGE_KEYS = {
  HISTORY: 'altft-passport-history',
  FAVORITES: 'altft-passport-favorites',
  SETTINGS: 'altft-passport-settings',
  RECENT_TEMPLATES: 'altft-passport-recent-templates',
};
