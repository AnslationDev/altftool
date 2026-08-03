// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "dimensional-consistency-checker",
  "title": "Dimensional Consistency Checker",
  "description": "Compare the base-dimension exponents on each side of an equation to flag mismatched, dimensionally invalid terms.",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Education & Science",
    "Developer"
  ],
  "icon": "brackets",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "left",
      "label": "Left-side dimension vector",
      "type": "text",
      "default": "M1 L1 T-2"
    },
    {
      "key": "right",
      "label": "Right-side dimension vector",
      "type": "text",
      "default": "M1 L1 T-2"
    },
    {
      "key": "symbols",
      "label": "Allowed base symbols",
      "type": "text",
      "default": "M,L,T,I,Θ,N,J"
    }
  ],
  "presets": [
    {
      "label": "Force = mass × acceleration",
      "values": {
        "left": "M1 L1 T-2",
        "right": "M1 L1 T-2",
        "symbols": "M,L,T,I,Θ,N,J"
      }
    },
    {
      "label": "Mismatch",
      "values": {
        "left": "L1",
        "right": "L1 T-1",
        "symbols": "M,L,T,I,Θ,N,J"
      }
    }
  ],
  "note": "Compares entered base-dimension exponents; it does not parse an algebraic equation or verify numerical unit conversions. Enter each side after reducing it to base dimensions."
},
  compute: (values) => {
      const allowed = String(values.symbols || "").split(/[\s,;]+/).map((item) => item.trim()).filter(Boolean);
      const parse = (text) => {
        const map = new Map(allowed.map((symbol) => [symbol, 0]));
        const tokens = String(text || "").match(/([A-Za-zΘ]+)\s*\^?\s*(-?\d+(?:\.\d+)?)/g) || [];
        for (const token of tokens) { const match = token.match(/([A-Za-zΘ]+)\s*\^?\s*(-?\d+(?:\.\d+)?)/); if (match) map.set(match[1], Number(match[2])); }
        return map;
      };
      const left = parse(values.left), right = parse(values.right), symbols = [...new Set([...allowed, ...left.keys(), ...right.keys()])];
      const rows = symbols.map((symbol) => [symbol, left.get(symbol) || 0, right.get(symbol) || 0, (left.get(symbol) || 0) === (right.get(symbol) || 0) ? "Match" : "Mismatch"]);
      const mismatches = rows.filter((row) => row[3] === "Mismatch");
      return { result: mismatches.length ? "Dimensionally inconsistent" : "Dimension vectors match", caption: mismatches.length + " exponent mismatch(es)", table: { headers: ["Base dimension", "Left exponent", "Right exponent", "Status"], rows }, list: ["A matching dimension is necessary but not sufficient for a physically correct equation."] };
    },
};

export default spec;
