// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "bolt-torque-preload-calculator",
  "title": "Bolt Torque & Preload Calculator",
  "description": "Estimate clamp load and preload from bolt diameter, applied torque, and nut factor (K).",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "nut",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "diameter",
      "label": "Nominal diameter (mm)",
      "type": "number",
      "default": 10,
      "min": 0.0001
    },
    {
      "key": "torque",
      "label": "Applied torque (N·m)",
      "type": "number",
      "default": 45,
      "min": 0
    },
    {
      "key": "k_factor",
      "label": "Nut factor K",
      "type": "number",
      "default": 0.2,
      "min": 0.01
    },
    {
      "key": "proof_load",
      "label": "Proof load target (kN)",
      "type": "number",
      "default": 40,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "M10 · 45 N·m",
      "values": {
        "diameter": 10,
        "torque": 45,
        "k_factor": 0.2,
        "proof_load": 40
      }
    }
  ],
  "note": "Simplified T=K·F·d estimate. Real preload varies greatly with threads, lubrication, coatings, reuse, tightening method, embedment, joint stiffness, and temperature; use approved fastener procedures."
},
  compute: (values) => {
      const diameter = Number(values.diameter) / 1000, torque = Math.max(0, Number(values.torque) || 0), K = Number(values.k_factor), proof = Math.max(0, Number(values.proof_load) || 0) * 1000;
      if (!(diameter > 0 && K > 0)) return { result: "—", caption: "Diameter and K factor must be positive" };
      const preload = torque / (K * diameter), targetTorque = K * proof * diameter;
      return { result: (preload / 1000).toFixed(4) + " kN estimated preload", rows: [["Applied torque", torque.toFixed(3) + " N·m"], ["Nut factor K", K], ["Entered proof target", (proof / 1000).toFixed(3) + " kN"], ["Torque for entered target", targetTorque.toFixed(3) + " N·m"], ["Estimated % of entered target", proof ? (preload / proof * 100).toFixed(2) + "%" : "—"]] };
    },
};

export default spec;
