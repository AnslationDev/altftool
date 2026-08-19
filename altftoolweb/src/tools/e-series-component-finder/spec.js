// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "e-series-component-finder",
  "title": "E-Series Component Finder",
  "description": "Find the nearest standard E-series resistor or capacitor value.",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Electronics",
    "Calculator"
  ],
  "icon": "resistor",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "target",
      "label": "Target value (Ω, F, or H)",
      "type": "number",
      "default": 4720,
      "min": 1e-9
    },
    {
      "key": "series",
      "label": "Preferred-number series",
      "type": "select",
      "default": "24",
      "choices": [
        {
          "value": "6",
          "label": "E6"
        },
        {
          "value": "12",
          "label": "E12"
        },
        {
          "value": "24",
          "label": "E24"
        },
        {
          "value": "48",
          "label": "E48"
        },
        {
          "value": "96",
          "label": "E96"
        }
      ]
    }
  ],
  "presets": [
    {
      "label": "4.72 kΩ in E24",
      "values": {
        "target": 4720,
        "series": "24"
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values) => {
      const target = Number(values.target), count = Number(values.series);
      if (!(target > 0 && count > 0)) return { result: "—", caption: "Target and series must be positive" };
      // Exact IEC 60063 per-decade mantissas (published preferred-number tables), not a
      // geometric-progression approximation — E6/E12/E24 stored as mantissa*10, E48/E96 as mantissa*100.
      const IEC_60063_BASES = {
        6: [10, 15, 22, 33, 47, 68],
        12: [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82],
        24: [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91],
        48: [100, 105, 110, 115, 121, 127, 133, 140, 147, 154, 162, 169, 178, 187, 196, 205, 215, 226, 237, 249, 261, 274, 287, 301, 316, 332, 348, 365, 383, 402, 422, 442, 464, 487, 511, 536, 562, 590, 619, 649, 681, 715, 750, 787, 825, 866, 909, 953],
        96: [100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130, 133, 137, 140, 143, 147, 150, 154, 158, 162, 165, 169, 174, 178, 182, 187, 191, 196, 200, 205, 210, 215, 221, 226, 232, 237, 243, 249, 255, 261, 267, 274, 280, 287, 294, 301, 309, 316, 324, 332, 340, 348, 357, 365, 374, 383, 392, 402, 412, 422, 432, 442, 453, 464, 475, 487, 499, 511, 523, 536, 549, 562, 576, 590, 604, 619, 634, 649, 665, 681, 698, 715, 732, 750, 768, 787, 806, 825, 845, 866, 887, 909, 931, 953, 976],
      };
      const rawBases = IEC_60063_BASES[count];
      if (!rawBases) return { result: "—", caption: "Unsupported series" };
      const divisor = count <= 24 ? 10 : 100;
      const bases = rawBases.map((n) => n / divisor);
      const decade = Math.floor(Math.log10(target)), candidates = [];
      // Base mantissas are already the exact standard values, so no toPrecision rounding is needed
      // to snap to the series — only a high-precision clamp to remove binary floating-point noise.
      for (let d = decade - 1; d <= decade + 1; d += 1) for (let i = 0; i < bases.length; i += 1) candidates.push(Number((bases[i] * Math.pow(10, d)).toPrecision(12)));
      const unique = [...new Set(candidates)].sort((a, b) => Math.abs(a - target) - Math.abs(b - target)).slice(0, 6);
      const closest = unique[0];
      // Use Infinity/null (not Number.MAX_SAFE_INTEGER) as the "no candidate" sentinel: for very
      // large targets a real candidate can exceed MAX_SAFE_INTEGER, which would otherwise make
      // Math.min silently return the meaningless sentinel instead of the true nearest-above value.
      const aboveCandidates = unique.filter((value) => value >= target);
      const nearestAbove = aboveCandidates.length ? Math.min(...aboveCandidates) : null;
      return { result: closest.toLocaleString(undefined, { maximumSignificantDigits: count <= 24 ? 2 : 3 }) + " nearest E" + count + " value", caption: (((closest - target) / target) * 100).toFixed(4) + "% error", rows: [["Target", target], ["Nearest below", Math.max(...unique.filter((value) => value <= target), 0)], ["Nearest above", nearestAbove === null ? "—" : nearestAbove]], table: { headers: ["Candidate", "Error %"], rows: unique.map((value) => [value, (((value - target) / target) * 100).toFixed(5)]) } };
    },
};

export default spec;
