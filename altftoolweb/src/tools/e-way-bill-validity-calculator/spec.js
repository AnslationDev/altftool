// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
import { computeEwayBillValidity } from "./lib";

export const spec = {
  ...{
  "slug": "e-way-bill-validity-calculator",
  "title": "E-Way Bill Validity Calculator",
  "description": "Calculate an e-way bill's validity window from the distance and generation time.",
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
      // Delegate the actual Rule 138(10) math (midnight-of-day-after expiry,
      // the eight-hour extension window, and distance validation) to lib.js
      // instead of re-deriving it here, so this UI can never drift from the
      // documented, statute-accurate implementation.
      const cargoTypeId = values.cargo === "odc" ? "odc" : "normal";
      const validity = computeEwayBillValidity({
        distanceKm: values.distance,
        cargoTypeId,
        generatedOn: values.generated,
      });
      if (validity.error) return { error: validity.error };

      const timeValue = /^\d{2}:\d{2}$/.test(values.time) ? values.time : "00:00";
      const generatedAt = new Date(values.generated + "T" + timeValue + ":00");
      const days = validity.validityDays;

      return {
        result: days + " day" + (days === 1 ? "" : "s") + " estimated validity",
        caption: cargoTypeId === "odc" ? "ODC slab: 20 km/day" : "Regular slab: 200 km/day",
        rows: [
          ["Distance", validity.distanceKm + " km"],
          ["Slab", validity.kmPerDay + " km per day"],
          ["Generated", Number.isNaN(generatedAt.getTime()) ? "Invalid date/time" : generatedAt.toLocaleString()],
          ["Estimated end", validity.expiryDescription],
          ["Extension window", `Part B can be updated ${validity.extensionWindowHours}h either side of expiry: ${validity.extensionWindow}`],
        ],
      };
    },
};

export default spec;
