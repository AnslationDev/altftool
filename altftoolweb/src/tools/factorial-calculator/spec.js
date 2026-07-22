// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "factorial-calculator",
  "title": "Factorial Calculator",
  "description": "Calculate the factorial of a given number.",
  "badge": "Math",
  "category": [
    "Math"
  ],
  "icon": "calculator",
  "iconColor": "text-violet-600",
  "fields": [
    {
      "key": "number",
      "label": "Number",
      "type": "number",
      "default": "5"
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "number": "5"
      }
    }
  ],
  "note": "The factorial of a non-negative integer n is the product of all positive integers less than or equal to n."
},
  compute: (values, mode) => { let num = Number(values.number); if (num < 0) return { result: 'Factorial is not defined for negative numbers.' }; if (num === 0 || num === 1) return { result: '1' }; let factorial = 1; for(let i = 2; i <= num; i++) { factorial *= i; } return { result: String(factorial), caption: `Factorial of ${num}` }; },
};

export default spec;
