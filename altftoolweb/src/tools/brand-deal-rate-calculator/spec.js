// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "brand-deal-rate-calculator",
  "title": "Brand Deal Rate Calculator",
  "description": "Estimate a brand deal pricing range from your reach, CPM and deliverables.",
  "badge": "Creator & Gig-Business Tools",
  "category": [
    "Business",
    "Marketing"
  ],
  "icon": "badge-dollar-sign",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "reach",
      "label": "Expected qualified reach",
      "type": "number",
      "default": 50000,
      "min": 0
    },
    {
      "key": "cpm",
      "label": "Base CPM",
      "type": "number",
      "default": 20,
      "min": 0
    },
    {
      "key": "deliverables",
      "label": "Number of deliverables",
      "type": "number",
      "default": 2,
      "min": 1
    },
    {
      "key": "production",
      "label": "Production cost / time value",
      "type": "number",
      "default": 500,
      "min": 0
    },
    {
      "key": "usage",
      "label": "Paid usage uplift (%)",
      "type": "number",
      "default": 30,
      "min": 0
    },
    {
      "key": "exclusivity",
      "label": "Exclusivity uplift (%)",
      "type": "number",
      "default": 20,
      "min": 0
    },
    {
      "key": "agency",
      "label": "Agency / management fee (%)",
      "type": "number",
      "default": 10,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "50k reach campaign",
      "values": {
        "reach": 50000,
        "cpm": 20,
        "deliverables": 2,
        "production": 500,
        "usage": 30,
        "exclusivity": 20,
        "agency": 10
      }
    }
  ],
  "note": "Negotiation range, not a market quote or guarantee. Audience quality, rights, whitelisting, territory, duration, revisions, category conflict, taxes, and payment risk can materially change the rate."
},
  compute: (values) => {
      const reach = Math.max(0, Number(values.reach) || 0), cpm = Math.max(0, Number(values.cpm) || 0), deliverables = Math.max(1, Number(values.deliverables) || 1), production = Math.max(0, Number(values.production) || 0);
      const usage = Math.max(0, Number(values.usage) || 0), exclusivity = Math.max(0, Number(values.exclusivity) || 0), agency = Math.max(0, Number(values.agency) || 0);
      const media = reach / 1000 * cpm * deliverables, subtotal = media + production, rights = subtotal * (usage + exclusivity) / 100, beforeFee = subtotal + rights, fee = beforeFee * agency / 100, total = beforeFee + fee;
      return { result: total.toFixed(2) + " estimated quote", caption: (total * 0.85).toFixed(2) + "–" + (total * 1.25).toFixed(2) + " conversation range", rows: [["Media value", media.toFixed(2)], ["Production", production.toFixed(2)], ["Usage + exclusivity", rights.toFixed(2)], ["Management fee", fee.toFixed(2)], ["Deliverables", deliverables]] };
    },
};

export default spec;
