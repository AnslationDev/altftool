// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "quadratic-equation-solver",
  "title": "Quadratic Equation Solver",
  "description": "Solve quadratic equations of the form ax^2 + bx + c = 0.",
  "badge": "Math",
  "category": [
    "Math"
  ],
  "icon": "calculator",
  "iconColor": "text-teal-600",
  "fields": [
    {
      "key": "a",
      "label": "Coefficient A",
      "type": "number",
      "default": "1"
    },
    {
      "key": "b",
      "label": "Coefficient B",
      "type": "number",
      "default": "-3"
    },
    {
      "key": "c",
      "label": "Coefficient C",
      "type": "number",
      "default": "2"
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "a": "1",
        "b": "-3",
        "c": "2"
      }
    }
  ],
  "note": "This tool solves quadratic equations using the quadratic formula."
},
  compute: (values, mode) => { const { a, b, c } = values; if (a === 0) return { result: 'Error: Coefficient A cannot be zero.' }; const discriminant = b * b - 4 * a * c; if (discriminant < 0) return { result: 'No real solutions.', rows: [['Discriminant', discriminant]] }; const sqrtDiscriminant = Math.sqrt(discriminant); const x1 = (-b + sqrtDiscriminant) / (2 * a); const x2 = (-b - sqrtDiscriminant) / (2 * a); return { result: `x₁ = ${x1}, x₂ = ${x2}`, rows: [['Discriminant', discriminant], ['x₁', x1], ['x₂', x2]] }; },
};

export default spec;
