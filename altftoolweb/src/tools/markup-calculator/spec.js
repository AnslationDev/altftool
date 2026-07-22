// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "markup-calculator",
  "title": "Markup Calculator",
  "description": "Calculate the total price including markup.",
  "badge": "Finance",
  "category": [
    "Finance"
  ],
  "icon": "calculator",
  "iconColor": "text-teal-600",
  "fields": [
    {
      "key": "amount",
      "label": "Original Price",
      "type": "number",
      "default": "1000",
      "suffix": "$"
    },
    {
      "key": "markup",
      "label": "Markup Percentage",
      "type": "number",
      "default": "20"
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "amount": "1000",
        "markup": "20"
      }
    }
  ],
  "note": "This tool calculates the total price including a specified markup percentage."
},
  compute: (values, mode) => { let result = values.amount * (1 + values.markup / 100); return { result: '$' + result.toFixed(2), caption: 'Total Price', rows: [['Original Price', '$' + values.amount], ['Markup Percentage', values.markup + '%'], ['Total Price', '$' + result.toFixed(2)]] }; },
};

export default spec;
