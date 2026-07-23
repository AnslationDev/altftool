// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "changelog-generator",
  "title": "Changelog Generator",
  "description": "Turn a list of changes into a clean, categorised Keep-a-Changelog entry.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "file-text",
  "iconColor": "text-slate-600",
  "fields": [
    {
      "key": "version",
      "label": "Version",
      "type": "text",
      "default": "1.2.0"
    },
    {
      "key": "changes",
      "label": "Changes (one per line, start with add/fix/change/remove)",
      "type": "textarea",
      "default": "add dark mode\nfix login crash\nchange button colors\nremove legacy API"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const buckets = { Added: [], Fixed: [], Changed: [], Removed: [] };
      for (const raw of String(values.changes).split("\n").map((l) => l.trim()).filter(Boolean)) {
        const l = raw.toLowerCase();
        const key = l.startsWith("fix") ? "Fixed" : l.startsWith("change") || l.startsWith("update") ? "Changed" : l.startsWith("remove") || l.startsWith("delete") ? "Removed" : "Added";
        buckets[key].push(raw.replace(/^(add|added|fix|fixed|change|changed|update|updated|remove|removed|delete)\s*/i, ""));
      }
      const today = new Date().toISOString().slice(0, 10);
      const list = [`## [${values.version}] - ${today}`];
      for (const [k, v] of Object.entries(buckets)) if (v.length) { list.push(`### ${k}`); v.forEach((x) => list.push(`- ${x}`)); }
      return { result: `Changelog for v${values.version}`, list };
    },
};

export default spec;
