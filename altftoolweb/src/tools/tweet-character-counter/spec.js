// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "tweet-character-counter",
  "title": "Tweet Character Counter",
  "description": "Count characters against the 280 limit, with words and tweets needed.",
  "badge": "Social Media",
  "category": [
    "Social Media"
  ],
  "icon": "type",
  "iconColor": "text-sky-500",
  "fields": [
    {
      "key": "text",
      "label": "Your tweet",
      "type": "textarea",
      "default": ""
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const t = String(values.text);
      const words = (t.match(/\S+/g) || []).length;
      const left = 280 - t.length;
      return { result: t.length + " / 280", caption: left >= 0 ? left + " characters left" : Math.abs(left) + " over the limit", rows: [["Words", words], ["Lines", t ? t.split(/\n/).length : 0], ["Tweets needed", Math.max(1, Math.ceil(t.length / 280))]] };
    },
};

export default spec;
