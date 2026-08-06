// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "royalty-split-waterfall-calculator",
  "title": "Royalty Split Waterfall Calculator",
  "description": "Reconcile fees, recoupment and collaborator splits down to the exact cent.",
  "badge": "Creator & Gig-Business Tools",
  "category": [
    "Finance",
    "Business"
  ],
  "icon": "git-branch",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "gross",
      "label": "Gross receipts",
      "type": "number",
      "default": 100000,
      "min": 0
    },
    {
      "key": "platform",
      "label": "Platform / distributor fee (%)",
      "type": "number",
      "default": 15,
      "min": 0
    },
    {
      "key": "recoupment",
      "label": "Recoupable balance",
      "type": "number",
      "default": 10000,
      "min": 0
    },
    {
      "key": "splits",
      "label": "Collaborator splits",
      "type": "textarea",
      "default": "Creator A | 60\nCreator B | 25\nProducer | 15",
      "hint": "Payee | percent of post-fee, post-recoupment pool"
    }
  ],
  "presets": [
    {
      "label": "60/25/15 split",
      "values": {
        "gross": 100000,
        "platform": 15,
        "recoupment": 10000,
        "splits": "Creator A | 60\nCreator B | 25\nProducer | 15"
      }
    }
  ],
  "note": "Arithmetic reconciliation only. The governing contract may apply fees, reserves, taxes, recoupment, cross-collateralization, rounding, and splits in a different order."
},
  compute: (values) => {
      const gross = Math.max(0, Number(values.gross) || 0), platformFee = gross * Math.max(0, Number(values.platform) || 0) / 100, afterFee = gross - platformFee, recouped = Math.min(afterFee, Math.max(0, Number(values.recoupment) || 0)), pool = afterFee - recouped;
      const splits = String(values.splits || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [name, percent] = line.split("|").map((cell) => cell.trim()); return [name || "Payee", Math.max(0, Number(percent) || 0)]; });
      const totalPercent = splits.reduce((sum, row) => sum + row[1], 0), cents = Math.round(pool * 100);
      let allocated = 0;
      const rows = splits.map((row, index) => { const amountCents = index === splits.length - 1 ? cents - allocated : Math.round(cents * row[1] / Math.max(1, totalPercent)); allocated += amountCents; return [row[0], row[1] + "%", (amountCents / 100).toFixed(2)]; });
      return { result: pool.toFixed(2) + " distributable pool", caption: totalPercent + "% entered splits normalized for allocation", rows: [["Gross", gross.toFixed(2)], ["Platform fee", platformFee.toFixed(2)], ["Recouped", recouped.toFixed(2)], ["Allocated cents", allocated]], table: { headers: ["Payee", "Entered split", "Allocated"], rows } };
    },
};

export default spec;
