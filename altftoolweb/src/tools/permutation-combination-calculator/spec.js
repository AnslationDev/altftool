// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "permutation-combination-calculator",
  "title": "Permutation Combination Calculator",
  "description": "Calculate permutations and combinations for given values.",
  "badge": "Math",
  "category": [
    "Math"
  ],
  "icon": "calculator",
  "iconColor": "text-blue-600",
  "fields": [
    {
      "key": "n",
      "label": "Total Items",
      "type": "number",
      "default": "10"
    },
    {
      "key": "r",
      "label": "Selected Items",
      "type": "number",
      "default": "3"
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "n": "10",
        "r": "3"
      }
    }
  ],
  "note": "This tool calculates permutations and combinations for given values."
},
  compute: (values, mode) => { let n = values.n, r = values.r; if (n < r || r < 0) return { result: 'Invalid input' }; let factorial = (x) => x ? x * factorial(x - 1) : 1; let permutation = factorial(n) / factorial(n - r); let combination = permutation / factorial(r); return { result: `Permutation: ${permutation}, Combination: ${combination}`, rows: [['Permutation', permutation], ['Combination', combination]] }; },
};

export default spec;
