// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "age-in-days-calculator",
  "title": "Age in Days Calculator",
  "description": "See exactly how old you are in days, weeks, months and hours from your birth date.",
  "badge": "Calculator",
  "category": [
    "Calculator"
  ],
  "icon": "calendar",
  "iconColor": "text-rose-600",
  "fields": [
    {
      "key": "birth_date",
      "label": "Date of birth",
      "type": "date",
      "default": ""
    }
  ],
  "presets": [
    {
      "label": "Y2K baby",
      "values": {
        "birth_date": "2000-01-01"
      }
    }
  ],
  "note": "Calculated against today's date, in your local time zone."
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const b = new Date(values.birth_date);
      if (isNaN(b)) return { result: "—", caption: "Pick your date of birth" };
      const now = new Date();
      const days = Math.floor((now - b) / 86400000);
      if (days < 0) return { result: "—", caption: "That date is in the future" };
      let y = now.getFullYear() - b.getFullYear();
      let m = now.getMonth() - b.getMonth();
      if (now.getDate() < b.getDate()) m--;
      if (m < 0) { y--; m += 12; }
      return {
        result: days.toLocaleString() + " days old",
        caption: `${y} years, ${m} months`,
        rows: [["Weeks", Math.floor(days / 7).toLocaleString()], ["Months", (y * 12 + m).toLocaleString()], ["Hours", (days * 24).toLocaleString()], ["Next birthday in", (() => { const n = new Date(now.getFullYear(), b.getMonth(), b.getDate()); if (n < now) n.setFullYear(now.getFullYear() + 1); return Math.ceil((n - now) / 86400000) + " days"; })()]],
      };
    },
};

export default spec;
