// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "magic-8-ball",
  "title": "Magic 8 Ball",
  "description": "Ask a yes/no question and let the Magic 8 Ball decide.",
  "badge": "Fun",
  "category": [
    "Fun"
  ],
  "icon": "circle-help",
  "iconColor": "text-slate-800",
  "fields": [
    {
      "key": "question",
      "label": "Your question",
      "type": "text",
      "default": "",
      "required": false
    }
  ],
  "regenerate": true
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const a = ["It is certain", "Without a doubt", "Yes — definitely", "Most likely", "Outlook good", "Signs point to yes", "Reply hazy, try again", "Ask again later", "Cannot predict now", "Don't count on it", "My reply is no", "Very doubtful", "Outlook not so good"];
      return { result: "🎱 " + a[Math.floor(Math.random() * a.length)], caption: values.question ? `"${values.question}"` : "Ask a yes/no question, then shake" };
    },
};

export default spec;
