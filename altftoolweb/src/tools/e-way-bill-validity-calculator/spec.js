// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "e-way-bill-validity-calculator",
  "title": "E-Way Bill Validity Calculator",
  "description": "Distance aur generation time se validity window calculate kare.",
  "badge": "India-Specific Utilities",
  "category": [
    "Business",
    "India",
    "Calculator"
  ],
  "icon": "truck",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "distance",
      "label": "Approximate distance (km)",
      "type": "number",
      "default": 420,
      "min": 1
    },
    {
      "key": "generated",
      "label": "Generation date",
      "type": "date",
      "default": "2026-07-24"
    },
    {
      "key": "time",
      "label": "Generation time (24h HH:MM)",
      "type": "text",
      "default": "10:00"
    },
    {
      "key": "cargo",
      "label": "Movement type",
      "type": "select",
      "default": "regular",
      "choices": [
        {
          "value": "regular",
          "label": "Regular / non-ODC"
        },
        {
          "value": "odc",
          "label": "Over-dimensional cargo"
        }
      ]
    }
  ],
  "presets": [
    {
      "label": "420 km regular",
      "values": {
        "distance": 420,
        "generated": "2026-07-24",
        "time": "10:00",
        "cargo": "regular"
      }
    },
    {
      "label": "65 km ODC",
      "values": {
        "distance": 65,
        "generated": "2026-07-24",
        "time": "10:00",
        "cargo": "odc"
      }
    }
  ],
  "note": "Uses the common distance slabs as an estimate. Special cargo, multimodal movement, extensions, portal computation, and current GST rules can differ; confirm on the official e-way bill system."
},
  compute: (values) => {
      const distance = Math.max(1, Number(values.distance) || 1);
      const slab = values.cargo === "odc" ? 20 : 200;
      const days = Math.max(1, Math.ceil(distance / slab));
      const start = new Date(values.generated + "T" + (/^\d{2}:\d{2}$/.test(values.time) ? values.time : "00:00") + ":00");
      const end = new Date(start);
      if (!Number.isNaN(end.getTime())) end.setDate(end.getDate() + days);
      return { result: days + " day" + (days === 1 ? "" : "s") + " estimated validity", caption: values.cargo === "odc" ? "ODC slab: 20 km/day" : "Regular slab: 200 km/day", rows: [["Distance", distance + " km"], ["Slab", slab + " km per day"], ["Generated", Number.isNaN(start.getTime()) ? "Invalid date/time" : start.toLocaleString()], ["Estimated end", Number.isNaN(end.getTime()) ? "Invalid date/time" : end.toLocaleString()]] };
    },
};

export default spec;
