// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "lcm-and-gcd-calculator",
  "title": "LCM and GCD Calculator",
  "description": "Calculate the Least Common Multiple (LCM) and Greatest Common Divisor (GCD) of two numbers.",
  "badge": "Math",
  "category": [
    "Math"
  ],
  "icon": "calculator",
  "iconColor": "text-rose-600",
  "fields": [
    {
      "key": "num1",
      "label": "Number 1",
      "type": "number",
      "default": "24"
    },
    {
      "key": "num2",
      "label": "Number 2",
      "type": "number",
      "default": "36"
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "num1": "24",
        "num2": "36"
      }
    }
  ],
  "note": "This tool calculates both the Greatest Common Divisor (GCD) and the Least Common Multiple (LCM) of two numbers."
},
  compute: (values, mode) => { let a = values.num1, b = values.num2; if (a === 0 || b === 0) return { result: 'One or both numbers are zero.' }; let gcd = (x, y) => y ? gcd(y, x % y) : x; let lcm = (x, y) => (x * y) / gcd(x, y); return { result: `GCD: ${gcd(a, b)}, LCM: ${lcm(a, b)}`, rows: [['GCD', gcd(a, b)], ['LCM', lcm(a, b)]], caption: 'Results for the given numbers.' }; },
};

export default spec;
