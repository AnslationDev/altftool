// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "random-decision-maker",
  "title": "Random Decision Maker",
  "description": "Ask a yes/no question.",
  "badge": "Fun",
  "category": [
    "Fun"
  ],
  "icon": "shuffle",
  "iconColor": "text-fuchsia-600",
  "fields": [
    {
      "key": "q",
      "label": "Question",
      "type": "text",
      "default": "",
      "required": false
    }
  ],
  "regenerate": true
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—"; const a = ["Yes, definitely", "It is certain", "Most likely", "Outlook good", "Reply hazy, try again", "Ask again later", "Don't count on it", "My reply is no", "Very doubtful"]; return { result: "🎱 " + a[Math.floor(Math.random() * a.length)], caption: values.q ? '"' + values.q + '"' : "Shake for an answer" }; },
};

export default spec;
