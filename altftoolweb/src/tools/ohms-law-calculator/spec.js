// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "ohms-law-calculator",
  "title": "Ohm's Law Calculator",
  "description": "Enter any two of voltage, current and resistance to find the third — plus power.",
  "badge": "Science",
  "category": [
    "Science"
  ],
  "icon": "zap",
  "iconColor": "text-yellow-500",
  "fields": [
    {
      "key": "voltage",
      "label": "Voltage (V)",
      "type": "number",
      "default": "12",
      "required": false
    },
    {
      "key": "current",
      "label": "Current (A)",
      "type": "number",
      "default": "2",
      "required": false
    },
    {
      "key": "resistance",
      "label": "Resistance (Ω)",
      "type": "number",
      "default": "",
      "required": false
    }
  ],
  "note": "Leave one field blank and fill the other two."
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      let V = values.voltage === "" ? null : num(values.voltage);
      let I = values.current === "" ? null : num(values.current);
      let R = values.resistance === "" ? null : num(values.resistance);
      const known = [V, I, R].filter((x) => x !== null).length;
      if (known < 2) return { result: "—", caption: "Enter any two values" };
      if (V === null) V = I * R; else if (I === null) I = R ? V / R : 0; else if (R === null) R = I ? V / I : 0;
      const P = V * I;
      return { result: (R).toFixed(2) + " Ω", caption: `V=${V.toFixed(2)}  I=${I.toFixed(2)}  R=${R.toFixed(2)}`, rows: [["Voltage", V.toFixed(2) + " V"], ["Current", I.toFixed(2) + " A"], ["Resistance", R.toFixed(2) + " Ω"], ["Power", P.toFixed(2) + " W"]] };
    },
};

export default spec;
