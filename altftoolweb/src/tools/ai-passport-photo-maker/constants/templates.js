export const PASSPORT_TEMPLATES = [
  { id: 'india-passport', name: 'India Passport', country: 'IN', type: 'passport', width: 354, height: 472, unit: 'px', aspectRatio: 354/472, headGuide: { minPercent: 50, maxPercent: 70, eyePosition: 55 }, background: 'white', resolution: 300, printLayout: { cols: 2, rows: 2, spacing: 5 }, label: '2" × 2"' },
  { id: 'india-visa', name: 'India Visa', country: 'IN', type: 'visa', width: 472, height: 472, unit: 'px', aspectRatio: 1, headGuide: { minPercent: 50, maxPercent: 70, eyePosition: 55 }, background: 'white', resolution: 300, printLayout: { cols: 2, rows: 2, spacing: 5 }, label: '2" × 2"' },
  { id: 'us-passport', name: 'US Passport', country: 'US', type: 'passport', width: 600, height: 600, unit: 'px', aspectRatio: 1, headGuide: { minPercent: 50, maxPercent: 65, eyePosition: 55 }, background: 'white', resolution: 300, printLayout: { cols: 2, rows: 2, spacing: 5 }, label: '2" × 2"' },
  { id: 'us-visa', name: 'US Visa', country: 'US', type: 'visa', width: 600, height: 600, unit: 'px', aspectRatio: 1, headGuide: { minPercent: 50, maxPercent: 65, eyePosition: 55 }, background: 'white', resolution: 300, printLayout: { cols: 2, rows: 2, spacing: 5 }, label: '2" × 2"' },
  { id: 'uk-passport', name: 'UK Passport', country: 'GB', type: 'passport', width: 413, height: 531, unit: 'px', aspectRatio: 413/531, headGuide: { minPercent: 55, maxPercent: 70, eyePosition: 55 }, background: 'white', resolution: 300, printLayout: { cols: 2, rows: 2, spacing: 5 }, label: '35mm × 45mm' },
  { id: 'uk-visa', name: 'UK Visa', country: 'GB', type: 'visa', width: 413, height: 531, unit: 'px', aspectRatio: 413/531, headGuide: { minPercent: 55, maxPercent: 70, eyePosition: 55 }, background: 'white', resolution: 300, printLayout: { cols: 2, rows: 2, spacing: 5 }, label: '35mm × 45mm' },
  { id: 'canada-passport', name: 'Canada Passport', country: 'CA', type: 'passport', width: 500, height: 600, unit: 'px', aspectRatio: 5/6, headGuide: { minPercent: 50, maxPercent: 65, eyePosition: 55 }, background: 'white', resolution: 300, printLayout: { cols: 2, rows: 2, spacing: 5 }, label: '50mm × 70mm' },
  { id: 'australia-passport', name: 'Australia Passport', country: 'AU', type: 'passport', width: 413, height: 531, unit: 'px', aspectRatio: 413/531, headGuide: { minPercent: 55, maxPercent: 70, eyePosition: 55 }, background: 'white', resolution: 300, printLayout: { cols: 2, rows: 2, spacing: 5 }, label: '35mm × 45mm' },
  { id: 'schengen-visa', name: 'Schengen Visa', country: 'EU', type: 'visa', width: 413, height: 531, unit: 'px', aspectRatio: 413/531, headGuide: { minPercent: 55, maxPercent: 70, eyePosition: 55 }, background: 'white', resolution: 300, printLayout: { cols: 2, rows: 2, spacing: 5 }, label: '35mm × 45mm' },
  { id: 'eu-passport', name: 'EU Passport', country: 'EU', type: 'passport', width: 413, height: 531, unit: 'px', aspectRatio: 413/531, headGuide: { minPercent: 55, maxPercent: 70, eyePosition: 55 }, background: 'white', resolution: 300, printLayout: { cols: 2, rows: 2, spacing: 5 }, label: '35mm × 45mm' },
  { id: 'uae-visa', name: 'UAE Visa', country: 'AE', type: 'visa', width: 413, height: 531, unit: 'px', aspectRatio: 413/531, headGuide: { minPercent: 50, maxPercent: 65, eyePosition: 55 }, background: 'white', resolution: 300, printLayout: { cols: 2, rows: 2, spacing: 5 }, label: '35mm × 45mm' },
  { id: 'singapore-passport', name: 'Singapore Passport', country: 'SG', type: 'passport', width: 413, height: 531, unit: 'px', aspectRatio: 413/531, headGuide: { minPercent: 55, maxPercent: 70, eyePosition: 55 }, background: 'white', resolution: 300, printLayout: { cols: 2, rows: 2, spacing: 5 }, label: '35mm × 45mm' },
  { id: 'japan-visa', name: 'Japan Visa', country: 'JP', type: 'visa', width: 472, height: 472, unit: 'px', aspectRatio: 1, headGuide: { minPercent: 50, maxPercent: 65, eyePosition: 55 }, background: 'white', resolution: 300, printLayout: { cols: 2, rows: 2, spacing: 5 }, label: '2" × 2"' },
  { id: 'custom', name: 'Custom Size', country: '--', type: 'custom', width: 413, height: 531, unit: 'px', aspectRatio: 413/531, headGuide: { minPercent: 50, maxPercent: 70, eyePosition: 55 }, background: 'white', resolution: 300, printLayout: { cols: 2, rows: 2, spacing: 5 }, label: 'Custom' },
];

export function getTemplateById(id) {
  return PASSPORT_TEMPLATES.find(t => t.id === id) || null;
}

export function getTemplatesByCountry(countryCode) {
  return PASSPORT_TEMPLATES.filter(t => t.country === countryCode);
}

export const PASSPORT_COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'EU', name: 'European Union' },
  { code: 'AE', name: 'UAE' },
  { code: 'SG', name: 'Singapore' },
  { code: 'JP', name: 'Japan' },
  { code: '--', name: 'Custom' },
];
