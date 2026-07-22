// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "margin-calculator",
  "title": "Profit Margin Calculator",
  "description": "Calculate your profit margin with ease.",
  "badge": "Finance",
  "category": [
    "Finance"
  ],
  "icon": "calculator",
  "iconColor": "text-teal-600",
  "fields": [
    {
      "key": "costprice",
      "label": "Cost Price",
      "type": "number",
      "default": "100"
    },
    {
      "key": "sellingprice",
      "label": "Selling Price",
      "type": "number",
      "default": "200"
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "costPrice": "100",
        "sellingPrice": "200"
      }
    }
  ],
  "note": "This tool calculates the profit margin based on cost price and selling price."
},
  compute: (values) => { let cost = values.costPrice, sell = values.sellingPrice; if (cost === 0 || isNaN(cost) || isNaN(sell)) return { result: 'Invalid input', caption: 'Please enter valid numbers for both cost price and selling price.' }; let profitMargin = ((sell - cost) / cost) * 100; return { result: `${profitMargin.toFixed(2)}%`, caption: 'Profit Margin', rows: [['Cost Price', `$${cost}`], ['Selling Price', `$${sell}`]] }; },
};

export default spec;
