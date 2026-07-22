// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "density-calculator",
  "title": "Density Calculator",
  "description": "Calculate the density of a substance given its mass and volume.",
  "badge": "Science",
  "category": [
    "Science"
  ],
  "icon": "density",
  "iconColor": "text-blue-600",
  "modes": [
    {
      "id": "basic",
      "label": "Basic"
    }
  ],
  "fields": [
    {
      "key": "mass",
      "label": "Mass",
      "type": "number",
      "default": "100",
      "suffix": "g"
    },
    {
      "key": "volume",
      "label": "Volume",
      "type": "number",
      "default": "50",
      "suffix": "ml"
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "mass": "100",
        "volume": "50"
      }
    }
  ],
  "note": "This tool calculates density using the formula: Density = Mass / Volume."
},
  compute: (values, mode) => { let mass = values.mass, volume = values.volume; if (volume === 0) return { result: 'Error: Volume cannot be zero.' }; let density = mass / volume; return { result: `Density: ${density.toFixed(2)} g/ml`, caption: 'Density is the mass per unit volume.', rows: [['Mass', `${mass} g`], ['Volume', `${volume} ml`]] }; },
};

export default spec;
