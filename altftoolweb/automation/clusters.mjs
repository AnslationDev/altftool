// ============================================================================
// clusters.mjs — Tier 1 of the cascade: deterministic parameterized generators.
// ~1,500 tool names collapse to a few dozen PATTERNS. Each cluster matches a
// family of names and builds a correct, rich ToolSpec with ZERO AI.
//
// cluster.match(name, cats) -> params | null
// cluster.build(entry, params) -> { raw, verify }   (verify = invariants/vectors)
// ============================================================================
import { titleCase } from "./lib/authoring.mjs";

const has = (n, ...ws) => ws.some((w) => n.includes(w));

// ---------------------------------------------------------------------------
// UNIT CONVERTER dimension tables (base unit factor). Embedded per-tool.
// ---------------------------------------------------------------------------
const UNITS = {
  length: { base: "m", u: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254, nmi: 1852 } },
  weight: { base: "kg", u: { kg: 1, g: 0.001, mg: 1e-6, lb: 0.453592, oz: 0.0283495, t: 1000, st: 6.35029 } },
  speed: { base: "m/s", u: { "m/s": 1, "km/h": 0.277778, mph: 0.44704, knot: 0.514444, "ft/s": 0.3048 } },
  area: { base: "m²", u: { "m²": 1, "km²": 1e6, "cm²": 1e-4, ha: 10000, acre: 4046.86, "ft²": 0.092903, "mi²": 2.59e6 } },
  volume: { base: "L", u: { L: 1, mL: 0.001, "m³": 1000, gal: 3.78541, qt: 0.946353, cup: 0.24, "fl oz": 0.0295735 } },
  data: { base: "MB", u: { B: 1e-6, KB: 0.001, MB: 1, GB: 1000, TB: 1e6, Kb: 0.000125, Mb: 0.125, Gb: 125 } },
  time: { base: "s", u: { s: 1, min: 60, h: 3600, day: 86400, week: 604800, ms: 0.001, year: 31557600 } },
};

const clusters = [
  // ------------------------------------------------------------ text: case
  {
    id: "text-case",
    match: (n) => {
      const m = n.match(/(camel|snake|kebab|pascal|constant|title|sentence|upper|lower)\s*case/);
      if (m) return { target: m[1] };
      if (/case converter|change case/.test(n)) return { target: "camel" };
      return null;
    },
    build: (e, p) => ({
      raw: {
        title: e.name, category: e.category?.length ? e.category : ["Developer"], icon: "case-sensitive", iconColor: "text-blue-600",
        description: `Convert any text to ${p.target} case — plus other common cases.`,
        fields: [{ key: "text", label: "Text", type: "textarea", default: "hello world example" }],
        compute: (values) => {
          const parts = String(values.text).trim().split(/[^a-zA-Z0-9]+/).filter(Boolean);
          if (!parts.length) return { result: "—", caption: "Enter some text" };
          const camel = parts.map((w, i) => i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()).join("");
          const pascal = camel[0].toUpperCase() + camel.slice(1);
          const map = { camel, pascal, snake: parts.map((w) => w.toLowerCase()).join("_"), kebab: parts.map((w) => w.toLowerCase()).join("-"), constant: parts.map((w) => w.toUpperCase()).join("_"), title: parts.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" "), sentence: (parts.join(" ").toLowerCase()).replace(/^./, (c) => c.toUpperCase()), upper: parts.join(" ").toUpperCase(), lower: parts.join(" ").toLowerCase() };
          const primary = "__TARGET__";
          return { result: map[primary], rows: Object.entries(map).filter(([k]) => k !== primary).map(([k, v]) => [k + "Case", v]) };
        },
        presets: [{ label: "Sample", values: { text: "The Quick Brown Fox" } }],
      },
      verify: { invariants: [] },
      _sub: { __TARGET__: p.target },
    }),
  },

  // ------------------------------------------------------------ text: transforms
  {
    id: "text-transform",
    match: (n) => {
      if (/(text|string|word).*(reverse|reverser)|reverse (text|string|words)|mirror text|backwards text/.test(n)) return { op: "reverse" };
      if (/\bslug\b|slugify|text to slug|url slug/.test(n)) return { op: "slug" };
      if (/remove (extra|multiple|double) space|whitespace (remover|cleaner)|trim (text|whitespace|lines)/.test(n)) return { op: "spaces" };
      if (/(remove|delete).*(duplicate|dupe).*line|dedup(licate)? line/.test(n)) return { op: "dedup" };
      if (/sort (text )?lines?|line sorter/.test(n)) return { op: "sort" };
      if (/remove line ?break|line ?break remover|join lines/.test(n)) return { op: "joinlines" };
      if (/text repeat|repeat text|string repeat/.test(n)) return { op: "repeat" };
      return null;
    },
    build: (e, p) => {
      const ops = {
        reverse: { desc: "Reverse your text character by character.", fn: (values) => ({ result: String(values.text).split("").reverse().join("") || "—" }) },
        slug: { desc: "Turn a title into a clean URL slug.", fn: (values) => ({ result: String(values.text).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-") || "—" }), inv: ["idempotent"] },
        spaces: { desc: "Collapse repeated spaces and trim each line.", fn: (values) => ({ result: String(values.text).split("\n").map((l) => l.replace(/\s+/g, " ").trim()).join("\n") }), inv: ["idempotent"] },
        dedup: { desc: "Remove duplicate lines, keeping the first of each.", fn: (values) => { const seen = new Set(); const out = []; for (const l of String(values.text).split("\n")) if (!seen.has(l)) { seen.add(l); out.push(l); } return { result: out.join("\n"), rows: [["Lines kept", out.length]] }; }, inv: ["idempotent"] },
        sort: { desc: "Sort lines alphabetically.", fn: (values) => ({ result: String(values.text).split("\n").filter((l) => l.length).sort((a, b) => a.localeCompare(b)).join("\n") }), inv: ["idempotent"] },
        joinlines: { desc: "Join multi-line text into one line.", fn: (values) => { const lines = String(values.text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean); return { result: lines.join(" "), rows: [["Lines joined", lines.length]] }; } },
        repeat: { desc: "Repeat your text N times.", fn: (values) => { const n = Math.max(0, Math.min(1000, num(values.times) || 0)); return { result: values.text ? Array(n).fill(values.text).join("\n") : "" }; } },
      };
      const o = ops[p.op];
      const fields = [{ key: "text", label: "Text", type: "textarea", default: "hello world" }];
      if (p.op === "repeat") fields.push({ key: "times", label: "Times", type: "number", default: "5" });
      return { raw: { title: e.name, category: e.category?.length ? e.category : ["Text"], icon: "type", iconColor: "text-violet-600", description: o.desc, fields, compute: o.fn, presets: [{ label: "Sample", values: { text: "Hello World", times: "3" } }] }, verify: { invariants: o.inv || [] } };
    },
  },

  // ------------------------------------------------------------ text: counters
  {
    id: "text-count",
    match: (n) => (/character count|word count|line count|text count|letter count|word counter|character counter|letter counter|reading time/.test(n) ? {} : null),
    build: (e) => ({
      raw: {
        title: e.name, category: e.category?.length ? e.category : ["Text"], icon: "hash", iconColor: "text-cyan-600",
        description: "Count characters, words, lines and sentences, with reading time.",
        fields: [{ key: "text", label: "Text", type: "textarea", default: "" }],
        compute: (values) => { const t = String(values.text); const words = (t.match(/\S+/g) || []).length; return { result: t.length + " characters", rows: [["Words", words], ["Characters (no spaces)", t.replace(/\s/g, "").length], ["Lines", t ? t.split(/\n/).length : 0], ["Sentences", (t.match(/[.!?]+/g) || []).length], ["Reading time", Math.max(1, Math.round(words / 200)) + " min"]] }; },
        presets: [{ label: "Sample", values: { text: "The quick brown fox jumps over the lazy dog." } }],
      }, verify: { invariants: [] },
    }),
  },

  // ------------------------------------------------------------ number base
  {
    id: "number-base",
    match: (n) => (/(binary|hex|hexadecimal|octal|decimal).*(convert|converter)|number base|base convert|radix/.test(n) ? {} : null),
    build: (e) => ({
      raw: {
        title: e.name, category: e.category?.length ? e.category : ["Developer"], icon: "binary", iconColor: "text-slate-600",
        description: "Convert a number between binary, octal, decimal and hexadecimal.",
        fields: [{ key: "value", label: "Value", type: "text", default: "255" }, { key: "from", label: "From base", type: "select", default: "10", choices: [{ value: "2", label: "Binary" }, { value: "8", label: "Octal" }, { value: "10", label: "Decimal" }, { value: "16", label: "Hex" }] }],
        compute: (values) => { const dec = parseInt(String(values.value).trim(), Number(values.from)); if (isNaN(dec)) return { result: "—", caption: "Invalid number for that base" }; return { result: dec + " (decimal)", rows: [["Binary", dec.toString(2)], ["Octal", dec.toString(8)], ["Hex", dec.toString(16).toUpperCase()]] }; },
        presets: [{ label: "255", values: { value: "255", from: "10" } }, { label: "0xFF", values: { value: "FF", from: "16" } }],
      }, verify: { invariants: [] },
    }),
  },

  // ------------------------------------------------------------ hash (webcrypto)
  {
    id: "hash",
    match: (n) => { const m = n.match(/\b(sha-?256|sha-?1|sha-?384|sha-?512|crc32)\b/); if (m) return { algo: m[1].replace("-", "") }; if (/hash generator|checksum/.test(n)) return { algo: "sha256" }; return null; },
    build: (e, p) => {
      const isCrc = p.algo === "crc32";
      const raw = {
        title: e.name, category: e.category?.length ? e.category : ["Developer"], icon: "shield", iconColor: "text-slate-700",
        description: isCrc ? "Compute the CRC32 checksum of text as hex." : `Generate a ${p.algo.toUpperCase()} hash of any text, in your browser.`,
        fields: [{ key: "text", label: "Text", type: "textarea", default: "hello world" }],
        compute: isCrc
          ? (values) => { const t = String(values.text); let c; const T = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; T[n] = c >>> 0; } let crc = 0xffffffff; for (let i = 0; i < t.length; i++) crc = T[(crc ^ t.charCodeAt(i)) & 0xff] ^ (crc >>> 8); crc = (crc ^ 0xffffffff) >>> 0; return { result: "0x" + crc.toString(16).padStart(8, "0"), rows: [["Decimal", crc.toString()]] }; }
          : (values) => { const A = "__ALGO__"; return crypto.subtle.digest(A, new TextEncoder().encode(String(values.text))).then((b) => ({ result: [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join(""), rows: [["Algorithm", A], ["Length", String(values.text).length + " chars"]] })); },
        presets: [{ label: "hello world", values: { text: "hello world" } }],
      };
      const algoName = { sha1: "SHA-1", sha256: "SHA-256", sha384: "SHA-384", sha512: "SHA-512" }[p.algo] || "SHA-256";
      return { raw, verify: { invariants: [] }, _sub: isCrc ? {} : { __ALGO__: algoName } };
    },
  },

  // ------------------------------------------------------------ date between
  {
    id: "date-between",
    match: (n) => { if (/business day|working day/.test(n)) return { mode: "business" }; if (/days between|date difference|days difference|weeks between/.test(n)) return { mode: "diff" }; return null; },
    build: (e, p) => ({
      raw: {
        title: e.name, category: e.category?.length ? e.category : ["Calculator"], icon: "calendar-range", iconColor: "text-indigo-600",
        description: p.mode === "business" ? "Count working days (Mon–Fri) between two dates." : "Count the days, weeks and months between two dates.",
        fields: [{ key: "start", label: "Start date", type: "date", default: "" }, { key: "end", label: "End date", type: "date", default: "" }],
        compute: p.mode === "business"
          ? (values) => { const a = new Date(values.start), b = new Date(values.end); if (isNaN(a) || isNaN(b) || b < a) return { result: "—", caption: "Pick a valid range" }; let c = 0; const d = new Date(a); while (d <= b) { const g = d.getDay(); if (g !== 0 && g !== 6) c++; d.setDate(d.getDate() + 1); } const total = Math.round((b - a) / 86400000) + 1; return { result: c + " business days", rows: [["Total days", total], ["Weekends", total - c]] }; }
          : (values) => { const a = new Date(values.start), b = new Date(values.end); if (isNaN(a) || isNaN(b)) return { result: "—", caption: "Pick both dates" }; const days = Math.abs(Math.round((b - a) / 86400000)); return { result: days.toLocaleString() + " days", rows: [["Weeks", (days / 7).toFixed(1)], ["Months", (days / 30.44).toFixed(1)], ["Years", (days / 365.25).toFixed(2)]] }; },
      }, verify: { invariants: [] },
    }),
  },

  // ------------------------------------------------------------ unit converter
  {
    id: "unit-convert",
    match: (n) => {
      for (const dim of Object.keys(UNITS)) if (n.includes(dim + " convert") || n.includes(dim + " converter")) return { dim };
      if (/length converter|distance converter/.test(n)) return { dim: "length" };
      if (/weight converter|mass converter/.test(n)) return { dim: "weight" };
      if (/speed converter/.test(n)) return { dim: "speed" };
      if (/area converter/.test(n)) return { dim: "area" };
      if (/volume converter/.test(n)) return { dim: "volume" };
      if (/data.*(size|storage) converter|byte converter|file size converter/.test(n)) return { dim: "data" };
      if (/time converter/.test(n)) return { dim: "time" };
      return null;
    },
    build: (e, p) => {
      const table = UNITS[p.dim];
      const choices = Object.keys(table.u).map((u) => ({ value: u, label: u }));
      const keys = Object.keys(table.u);
      return {
        raw: {
          title: e.name, category: e.category?.length ? e.category : ["Converter"], icon: "arrow-left-right", iconColor: "text-teal-600",
          description: `Convert ${p.dim} between ${keys.slice(0, 4).join(", ")} and more.`,
          fields: [{ key: "value", label: "Value", type: "number", default: "1" }, { key: "from", label: "From", type: "select", default: keys[0], choices }, { key: "to", label: "To", type: "select", default: keys[1], choices }],
          compute: (values) => { const U = __TABLE__; const base = num(values.value) * U[values.from]; const out = base / U[values.to]; return { result: out.toLocaleString(undefined, { maximumFractionDigits: 6 }) + " " + values.to, rows: Object.keys(U).filter((k) => k !== values.to).slice(0, 5).map((k) => [k, (base / U[k]).toLocaleString(undefined, { maximumFractionDigits: 4 })]) }; },
          presets: [{ label: "1 " + keys[0], values: { value: "1", from: keys[0], to: keys[1] } }],
        },
        verify: { invariants: [] },
        _sub: { __TABLE__: JSON.stringify(table.u) },
      };
    },
  },

  // ------------------------------------------------------------ percentage
  {
    id: "percentage",
    match: (n) => { if (/percent(age)? change|percent change/.test(n)) return { mode: "change" }; if (/percentage calculator|percent calculator|percentage of/.test(n)) return { mode: "of" }; return null; },
    build: (e, p) => ({
      raw: p.mode === "change" ? {
        title: e.name, category: e.category?.length ? e.category : ["Calculator"], icon: "percent", iconColor: "text-violet-600",
        description: "Percentage increase or decrease between two numbers.",
        fields: [{ key: "from", label: "Original", type: "number", default: "80" }, { key: "to", label: "New", type: "number", default: "100" }],
        compute: (values) => { const a = num(values.from), b = num(values.to); if (a === 0) return { result: "—", caption: "Original can't be zero" }; const ch = ((b - a) / Math.abs(a)) * 100; return { result: (ch >= 0 ? "+" : "") + ch.toFixed(2) + "%", caption: ch >= 0 ? "increase" : "decrease", rows: [["Difference", b - a]] }; },
      } : {
        title: e.name, category: e.category?.length ? e.category : ["Calculator"], icon: "percent", iconColor: "text-violet-600",
        description: "Common percentage calculations.",
        fields: [{ key: "percent", label: "Percent (%)", type: "number", default: "15" }, { key: "value", label: "Of value", type: "number", default: "200" }],
        compute: (values) => { const r = (num(values.percent) / 100) * num(values.value); return { result: r.toLocaleString(), caption: `${values.percent}% of ${values.value}`, rows: [["Value + %", (num(values.value) + r).toLocaleString()], ["Value − %", (num(values.value) - r).toLocaleString()]] }; },
      }, verify: { invariants: [] },
    }),
  },

  // ------------------------------------------------------------ interest
  {
    id: "interest",
    match: (n) => { if (/compound interest/.test(n)) return { mode: "compound" }; if (/simple interest/.test(n)) return { mode: "simple" }; if (/\bcagr\b/.test(n)) return { mode: "cagr" }; return null; },
    build: (e, p) => {
      const defs = {
        simple: { d: "Simple interest and maturity amount.", f: [["p", "Principal", "10000"], ["r", "Rate (%/yr)", "8"], ["t", "Years", "5"]], fn: (values) => { const si = (num(values.p) * num(values.r) * num(values.t)) / 100; return { result: money(si) + " interest", rows: [["Maturity", money(num(values.p) + si)]] }; } },
        compound: { d: "Compound interest and future value.", f: [["p", "Principal", "10000"], ["r", "Rate (%/yr)", "8"], ["t", "Years", "5"], ["n", "Compounds/yr", "12"]], fn: (values) => { const A = num(values.p) * Math.pow(1 + num(values.r) / 100 / num(values.n), num(values.n) * num(values.t)); return { result: money(A) + " total", rows: [["Interest earned", money(A - num(values.p))], ["Principal", money(num(values.p))]] }; } },
        cagr: { d: "Compound annual growth rate.", f: [["initial", "Initial value", "10000"], ["final", "Final value", "25000"], ["years", "Years", "5"]], fn: (values) => { const p = num(values.initial), fv = num(values.final), y = num(values.years); if (p <= 0 || y <= 0) return { result: "—", caption: "Enter positive values" }; return { result: ((Math.pow(fv / p, 1 / y) - 1) * 100).toFixed(2) + "% / yr", rows: [["Total growth", ((fv / p - 1) * 100).toFixed(2) + "%"], ["Multiple", (fv / p).toFixed(2) + "×"]] }; } },
      };
      const cfg = defs[p.mode];
      return { raw: { title: e.name, category: e.category?.length ? e.category : ["Finance"], icon: "trending-up", iconColor: "text-lime-600", description: cfg.d, fields: cfg.f.map(([key, label, d]) => ({ key, label, type: "number", default: d })), compute: cfg.fn }, verify: { invariants: [] } };
    },
  },

  // ------------------------------------------------------------ loan / EMI
  {
    id: "loan",
    match: (n) => (/loan|emi|mortgage|amortiz/.test(n) ? {} : null),
    build: (e) => ({
      raw: {
        title: e.name, category: e.category?.length ? e.category : ["Finance"], icon: "landmark", iconColor: "text-blue-600",
        description: "Monthly payment, total interest and total cost of a loan.",
        fields: [{ key: "amount", label: "Loan amount", type: "number", default: "200000" }, { key: "rate", label: "Interest rate (%/yr)", type: "number", default: "7" }, { key: "years", label: "Term (years)", type: "number", default: "20" }],
        compute: (values) => { const P = num(values.amount), r = num(values.rate) / 100 / 12, n = num(values.years) * 12; if (P <= 0 || n <= 0) return { result: "—", caption: "Enter amount and term" }; const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1); return { result: money(emi) + " / month", rows: [["Total interest", money(emi * n - P)], ["Total payable", money(emi * n)]] }; },
        presets: [{ label: "200k @7% / 20y", values: { amount: "200000", rate: "7", years: "20" } }],
      }, verify: { invariants: [] },
    }),
  },

  // ------------------------------------------------------------ margin / markup / tax / tip
  {
    id: "margin",
    match: (n) => { if (/margin/.test(n)) return { mode: "margin" }; if (/markup/.test(n)) return { mode: "markup" }; if (/\bvat\b|sales tax|gst/.test(n)) return { mode: "tax" }; if (/tip calculator|gratuity/.test(n)) return { mode: "tip" }; if (/discount (calculator|price|amount)|percentage off|sale price/.test(n)) return { mode: "discount" }; return null; },
    build: (e, p) => {
      const defs = {
        margin: { d: "Profit margin and markup from cost and price.", f: [["cost", "Cost", "60"], ["price", "Price", "100"]], fn: (values) => { const c = num(values.cost), pr = num(values.price); if (pr <= 0) return { result: "—", caption: "Enter a price" }; return { result: (((pr - c) / pr) * 100).toFixed(2) + "% margin", rows: [["Profit", money(pr - c)], ["Markup", c > 0 ? (((pr - c) / c) * 100).toFixed(2) + "%" : "—"]] }; } },
        markup: { d: "Selling price from cost and markup.", f: [["cost", "Cost", "60"], ["markup", "Markup (%)", "40"]], fn: (values) => { const pr = num(values.cost) * (1 + num(values.markup) / 100); return { result: money(pr), caption: "selling price", rows: [["Profit", money(pr - num(values.cost))]] }; } },
        tax: { d: "Add or remove tax at any rate.", f: [["amount", "Amount", "1000"], ["rate", "Tax rate (%)", "18"]], fn: (values) => { const tax = (num(values.amount) * num(values.rate)) / 100; return { result: money(num(values.amount) + tax) + " gross", rows: [["Tax", money(tax)], ["Net", money(num(values.amount))]] }; } },
        tip: { d: "Tip amount, total and per-person split.", f: [["bill", "Bill", "1850"], ["tip", "Tip (%)", "10"], ["people", "People", "3"]], fn: (values) => { const t = (num(values.bill) * num(values.tip)) / 100; const total = num(values.bill) + t; const people = Math.max(1, num(values.people)); return { result: money(total / people) + " each", rows: [["Tip", money(t)], ["Total", money(total)]] }; } },
        discount: { d: "Discounted price and savings.", f: [["price", "Price", "100"], ["discount", "Discount (%)", "25"]], fn: (values) => { const save = (num(values.price) * num(values.discount)) / 100; return { result: money(num(values.price) - save), caption: "final price", rows: [["You save", money(save)]] }; } },
      };
      const cfg = defs[p.mode];
      return { raw: { title: e.name, category: e.category?.length ? e.category : ["Finance"], icon: "badge-percent", iconColor: "text-green-600", description: cfg.d, fields: cfg.f.map(([key, label, d]) => ({ key, label, type: "number", default: d })), compute: cfg.fn }, verify: { invariants: [] } };
    },
  },

  // ------------------------------------------------------------ health
  {
    id: "health",
    match: (n) => { if (/\bbmi\b/.test(n)) return { mode: "bmi" }; if (/\bbmr\b|basal metabolic/.test(n)) return { mode: "bmr" }; if (/ideal weight/.test(n)) return { mode: "ideal" }; return null; },
    build: (e, p) => {
      const defs = {
        bmi: { d: "Body Mass Index and category.", f: [["weight", "Weight (kg)", "70"], ["height", "Height (cm)", "175"]], fn: (values) => { const h = num(values.height) / 100; if (h <= 0) return { result: "—", caption: "Enter height" }; const bmi = num(values.weight) / (h * h); const cat = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese"; return { result: bmi.toFixed(1) + " BMI", caption: cat, rows: [["Healthy range", (18.5 * h * h).toFixed(1) + "–" + (24.9 * h * h).toFixed(1) + " kg"]] }; } },
        bmr: { d: "Basal metabolic rate (Mifflin-St Jeor) + daily needs.", f: [["weight", "Weight (kg)", "70"], ["height", "Height (cm)", "175"], ["age", "Age", "30"]], sex: true, fn: (values) => { const bmr = 10 * num(values.weight) + 6.25 * num(values.height) - 5 * num(values.age) + (values.sex === "female" ? -161 : 5); return { result: Math.round(bmr) + " kcal/day", caption: "at rest", rows: [["Sedentary", Math.round(bmr * 1.2)], ["Active", Math.round(bmr * 1.55)]] }; } },
        ideal: { d: "Ideal body weight (Devine formula).", f: [["height", "Height (cm)", "175"]], sex: true, fn: (values) => { const inches = num(values.height) / 2.54; const over = Math.max(0, inches - 60); const w = (values.sex === "female" ? 45.5 : 50) + 2.3 * over; return { result: w.toFixed(1) + " kg", caption: "ideal body weight", rows: [["Range ±10%", (w * 0.9).toFixed(1) + "–" + (w * 1.1).toFixed(1) + " kg"]] }; } },
      };
      const cfg = defs[p.mode];
      const fields = cfg.f.map(([key, label, d]) => ({ key, label, type: "number", default: d }));
      if (cfg.sex) fields.unshift({ key: "sex", label: "Sex", type: "select", default: "male", choices: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }] });
      return { raw: { title: e.name, category: e.category?.length ? e.category : ["Health"], icon: "heart-pulse", iconColor: "text-rose-600", description: cfg.d, fields, compute: cfg.fn }, verify: { invariants: [] } };
    },
  },

  // ------------------------------------------------------------ math
  {
    id: "math",
    match: (n) => { if (/factorial/.test(n)) return { mode: "factorial" }; if (/lcm|gcd|hcf|greatest common|least common/.test(n)) return { mode: "lcmgcd" }; if (/prime/.test(n)) return { mode: "prime" }; if (/quadratic/.test(n)) return { mode: "quadratic" }; if (/permutation|combination|\bncr\b|\bnpr\b/.test(n)) return { mode: "permcomb" }; return null; },
    build: (e, p) => {
      const defs = {
        factorial: { d: "Exact factorial n! using big integers.", f: [["n", "n (0–2000)", "20"]], fn: (values) => { const n = Math.floor(num(values.n)); if (n < 0 || n > 2000) return { result: "—", caption: "0–2000" }; let f = 1n; for (let i = 2n; i <= BigInt(n); i++) f *= i; const s = f.toString(); return { result: n + "! = " + (s.length > 30 ? s.slice(0, 30) + "…" : s), caption: s.length + " digits", rows: [["Full", s]] }; } },
        lcmgcd: { d: "GCD and LCM of two numbers.", f: [["a", "First", "12"], ["b", "Second", "18"]], fn: (values) => { let a = Math.abs(Math.floor(num(values.a))), b = Math.abs(Math.floor(num(values.b))); if (!a || !b) return { result: "—", caption: "Enter two numbers" }; const g = (x, y) => { while (y) { [x, y] = [y, x % y]; } return x; }; const G = g(a, b); return { result: "GCD " + G + " · LCM " + (a / G) * b, rows: [["GCD", G], ["LCM", (a / G) * b]] }; } },
        prime: { d: "Check if a number is prime.", f: [["n", "Number", "97"]], fn: (values) => { const n = Math.floor(num(values.n)); if (n < 2) return { result: "—", caption: "Enter ≥ 2" }; for (let i = 2; i * i <= n; i++) if (n % i === 0) return { result: "Not prime", caption: n + " = " + i + " × " + n / i }; return { result: "Prime ✓" }; } },
        quadratic: { d: "Solve ax² + bx + c = 0.", f: [["a", "a", "1"], ["b", "b", "-3"], ["c", "c", "2"]], fn: (values) => { const a = num(values.a), b = num(values.b), c = num(values.c); if (a === 0) return { result: "—", caption: "a ≠ 0" }; const d = b * b - 4 * a * c; if (d < 0) { const s = Math.sqrt(-d); return { result: `x = ${(-b / (2 * a)).toFixed(2)} ± ${(s / (2 * a)).toFixed(2)}i`, rows: [["Discriminant", d]] }; } const s = Math.sqrt(d); return { result: `x₁=${((-b + s) / (2 * a)).toFixed(3)}, x₂=${((-b - s) / (2 * a)).toFixed(3)}`, rows: [["Discriminant", d.toFixed(2)]] }; } },
        permcomb: { d: "Permutations nPr and combinations nCr.", f: [["n", "n", "6"], ["r", "r", "3"]], fn: (values) => { const n = Math.floor(num(values.n)), r = Math.floor(num(values.r)); if (r < 0 || r > n) return { result: "—", caption: "0 ≤ r ≤ n" }; const f = (x) => { let a = 1; for (let i = 2; i <= x; i++) a *= i; return a; }; const nPr = f(n) / f(n - r); return { result: (nPr / f(r)).toLocaleString() + " combinations", rows: [["nPr", nPr.toLocaleString()], ["nCr", (nPr / f(r)).toLocaleString()]] }; } },
      };
      const cfg = defs[p.mode];
      return { raw: { title: e.name, category: e.category?.length ? e.category : ["Math"], icon: "sigma", iconColor: "text-indigo-600", description: cfg.d, fields: cfg.f.map(([key, label, d]) => ({ key, label, type: "number", default: d })), compute: cfg.fn }, verify: { invariants: [] } };
    },
  },

  // ------------------------------------------------------------ random / games
  {
    id: "random",
    match: (n) => { if (/coin flip|coin toss|flip a coin/.test(n)) return { mode: "coin" }; if (/dice|die roll|roll a dice/.test(n)) return { mode: "dice" }; if (/magic 8|8 ?ball|yes.?no|decision maker|decision picker/.test(n)) return { mode: "eight" }; if (/random number/.test(n)) return { mode: "number" }; if (/uuid|guid/.test(n)) return { mode: "uuid" }; return null; },
    build: (e, p) => {
      const defs = {
        coin: { d: "Flip a virtual coin.", regen: true, f: [], fn: (_values, _mode, random) => ({ result: random() < 0.5 ? "🪙 Heads" : "🪙 Tails" }) },
        dice: { d: "Roll dice.", regen: true, f: [{ key: "sides", label: "Sides", type: "number", default: "6", min: 2, max: 1000, step: 1 }, { key: "count", label: "How many", type: "number", default: "2", min: 1, max: 10, step: 1 }], fn: (values, _mode, random) => { const c = Number(values.count); const s = Number(values.sides); if (!Number.isInteger(c) || c < 1 || c > 10) return { result: "", error: "How many must be a whole number from 1 to 10." }; if (!Number.isInteger(s) || s < 2 || s > 1000) return { result: "", error: "Sides must be a whole number from 2 to 1000." }; const r = Array.from({ length: c }, () => 1 + Math.floor(random() * s)); return { result: r.join(" + ") + " = " + r.reduce((a, b) => a + b, 0) }; } },
        eight: { d: "Ask a yes/no question.", regen: true, f: [{ key: "q", label: "Question", type: "text", default: "", required: false }], fn: (values, _mode, random) => { const a = ["Yes, definitely", "It is certain", "Most likely", "Outlook good", "Reply hazy, try again", "Ask again later", "Don't count on it", "My reply is no", "Very doubtful"]; return { result: "🎱 " + a[Math.floor(random() * a.length)], caption: values.q ? '"' + values.q + '"' : "Shake for an answer" }; } },
        number: { d: "Generate a random number in a range.", regen: true, f: [["min", "Min", "1"], ["max", "Max", "100"]], fn: (values, _mode, random) => { const lo = num(values.min), hi = num(values.max); return { result: String(lo + Math.floor(random() * (hi - lo + 1))) }; } },
        uuid: { d: "Generate random UUIDs (v4).", regen: true, f: [], fn: () => ({ list: Array.from({ length: 5 }, () => crypto.randomUUID()) }) },
      };
      const cfg = defs[p.mode];
      const fields = cfg.f.map((f) => Array.isArray(f) ? { key: f[0], label: f[1], type: "number", default: f[2] } : f);
      return { raw: { title: e.name, category: e.category?.length ? e.category : ["Fun"], icon: "shuffle", iconColor: "text-fuchsia-600", description: cfg.d, regenerate: cfg.regen, fields, compute: cfg.fn }, verify: { invariants: [] } };
    },
  },

  // ------------------------------------------------------------ css generators
  {
    id: "css",
    match: (n) => { if (/box.?shadow/.test(n)) return { mode: "box" }; if (/text.?shadow/.test(n)) return { mode: "text" }; if (/border.?radius/.test(n)) return { mode: "radius" }; return null; },
    build: (e, p) => {
      const defs = {
        box: { d: "Build a CSS box-shadow.", f: [["x", "X offset", 4, -50, 50], ["y", "Y offset", 6, -50, 50], ["blur", "Blur", 12, 0, 100], ["spread", "Spread", 0, -50, 50]], prop: "box-shadow", fn: (values) => { const css = `${num(values.x)}px ${num(values.y)}px ${num(values.blur)}px ${num(values.spread)}px rgba(0,0,0,0.25)`; return { result: css, rows: [["Full rule", "box-shadow: " + css + ";"]] }; } },
        text: { d: "Build a CSS text-shadow.", f: [["x", "X offset", 2, -20, 20], ["y", "Y offset", 2, -20, 20], ["blur", "Blur", 4, 0, 40]], prop: "text-shadow", fn: (values) => { const css = `${num(values.x)}px ${num(values.y)}px ${num(values.blur)}px rgba(0,0,0,0.5)`; return { result: css, rows: [["Full rule", "text-shadow: " + css + ";"]] }; } },
        radius: { d: "Build a CSS border-radius.", f: [["tl", "Top-left", 12, 0, 100], ["tr", "Top-right", 12, 0, 100], ["br", "Bottom-right", 12, 0, 100], ["bl", "Bottom-left", 12, 0, 100]], prop: "border-radius", fn: (values) => { const css = `${num(values.tl)}px ${num(values.tr)}px ${num(values.br)}px ${num(values.bl)}px`; return { result: css, rows: [["Full rule", "border-radius: " + css + ";"]] }; } },
      };
      const cfg = defs[p.mode];
      return { raw: { title: e.name, category: e.category?.length ? e.category : ["Design"], icon: "square", iconColor: "text-indigo-500", description: cfg.d, fields: cfg.f.map(([key, label, d, mn, mx]) => ({ key, label, type: "range", default: d, min: mn, max: mx, step: 1 })), compute: cfg.fn }, verify: { invariants: [] } };
    },
  },
  // ------------------------------------------------------------ fancy unicode text
  {
    id: "fancy-text",
    match: (n) => {
      // Must be explicitly about styling TEXT (word-anchored) so it never grabs
      // "de[script]ion", "tran[script]", etc.
      if (!/\b(text|font|letter|letters|typeface)\b/.test(n)) return null;
      let style = null;
      if (/\bupside[- ]?down\b|\bflipped?\b/.test(n)) style = "flip";
      else if (/\bmonospace\b/.test(n)) style = "mono";
      else if (/\b(fullwidth|wide|vaporwave|aesthetic)\b/.test(n)) style = "wide";
      else if (/\bstrikethrough\b/.test(n)) style = "strike";
      else if (/\bunderline\b/.test(n)) style = "under";
      else if (/\bitalic\b/.test(n)) style = "italic";
      else if (/\b(cursive|script)\b/.test(n)) style = "script";
      else if (/\bbold\b/.test(n)) style = "bold";
      else return null;
      return { style };
    },
    build: (e, p) => ({
      raw: {
        title: e.name, category: e.category?.length ? e.category : ["Fun"], icon: "type", iconColor: "text-pink-600",
        description: "Turn your text into stylish Unicode letters for bios, posts and usernames.",
        fields: [{ key: "text", label: "Text", type: "textarea", default: "Hello World" }],
        presets: [{ label: "Sample", values: { text: "Hello World" } }],
        compute: (values) => {
          const style = "__STYLE__";
          const t = String(values.text || "");
          const off = (ch, base, Base, dbase) => { const c = ch.charCodeAt(0); if (ch >= "a" && ch <= "z") return String.fromCodePoint(base + (c - 97)); if (ch >= "A" && ch <= "Z") return String.fromCodePoint(Base + (c - 65)); if (dbase && ch >= "0" && ch <= "9") return String.fromCodePoint(dbase + (c - 48)); return ch; };
          const flip = { a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ", i: "ᴉ", j: "ɾ", k: "ʞ", l: "l", m: "ɯ", n: "u", o: "o", p: "d", q: "b", r: "ɹ", s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z" };
          const scriptEx = { B: "ℬ", E: "ℰ", F: "ℱ", H: "ℋ", I: "ℐ", L: "ℒ", M: "ℳ", R: "ℛ", e: "ℯ", g: "ℊ", o: "ℴ" };
          let out = "";
          for (const ch of t) {
            if (style === "flip") out += flip[ch.toLowerCase()] || ch;
            else if (style === "mono") out += off(ch, 0x1d68a, 0x1d670, 0x1d7f6);
            else if (style === "wide") { const c = ch.charCodeAt(0); out += ch > " " && ch <= "~" ? String.fromCodePoint(0xff00 + (c - 32)) : ch; }
            else if (style === "bold") out += off(ch, 0x1d41a, 0x1d400, 0x1d7ce);
            else if (style === "italic") out += ch === "h" ? "ℎ" : off(ch, 0x1d44e, 0x1d434, 0);
            else if (style === "script") out += scriptEx[ch] || off(ch, 0x1d4b6, 0x1d49c, 0);
            else if (style === "strike") out += ch + "̶";
            else if (style === "under") out += ch + "̲";
            else out += ch;
          }
          if (style === "flip") out = out.split("").reverse().join("");
          return { result: out || "—" };
        },
      },
      verify: { invariants: [] }, _sub: { __STYLE__: p.style },
    }),
  },

  // ------------------------------------------------------------ Basic authentication header
  {
    id: "basic-auth",
    match: (n) => (/\bbasic auth(?:entication)? header generator\b/.test(n) ? {} : null),
    build: (e) => ({
      raw: {
        title: e.name,
        category: e.category?.length ? e.category : ["Developer"],
        icon: "code",
        iconColor: "text-emerald-600",
        description: "Generate an HTTP Basic Authorization header from UTF-8 credentials.",
        fields: [
          { key: "username", label: "Username", type: "text", default: "admin" },
          { key: "password", label: "Password", type: "password", default: "password123", sensitive: true, autoComplete: "off", required: false },
          { key: "realm", label: "Realm", type: "text", default: "Restricted Area", required: false },
        ],
        presets: [{ label: "Example", values: { username: "user", password: "pass", realm: "Example Realm" } }],
        note: "Encodes username:password as UTF-8 in the format 'Basic <base64 credentials>'. Treat the output as a credential.",
        exportResultOnly: true,
        compute: (values) => {
          const username = String(values.username ?? "");
          const password = String(values.password ?? "");
          const realm = String(values.realm ?? "");
          if (username.includes(":")) return { result: "", error: "Username cannot contain a colon." };
          const bytes = new TextEncoder().encode(`${username}:${password}`);
          let binary = "";
          for (const byte of bytes) binary += String.fromCharCode(byte);
          const authHeader = `Basic ${btoa(binary)}`;
          return { result: authHeader, rows: [["Username", username], ["Password", "********"], ["Realm", realm], ["Authorization Header", authHeader]] };
        },
      },
      verify: { invariants: [] },
    }),
  },

  // ------------------------------------------------------------ base58 encode/decode
  {
    id: "base58",
    match: (n) => (/base-?58/.test(n) ? {} : null),
    build: (e) => ({
      raw: {
        title: e.name, category: e.category?.length ? e.category : ["Developer"], icon: "binary", iconColor: "text-amber-600",
        description: "Encode text to Base58 (Bitcoin alphabet) or decode it back.",
        fields: [{ key: "input", label: "Input", type: "textarea", default: "Hello" }, { key: "mode", label: "Mode", type: "select", default: "encode", choices: [{ value: "encode", label: "Encode to Base58" }, { value: "decode", label: "Decode from Base58" }] }],
        presets: [{ label: "Encode Hello", values: { input: "Hello", mode: "encode" } }],
        note: "Uses the Base58 (Bitcoin) alphabet. Runs in your browser.",
        compute: (values) => {
          const A = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
          const input = values.input || "";
          if (!input) return { result: "", caption: "Enter some text" };
          if (values.mode === "decode") {
            let acc = 0n;
            for (const c of input) {
              const i = A.indexOf(c);
              if (i < 0) return { result: "", error: `Invalid Base58 character: ${c}` };
              acc = acc * 58n + BigInt(i);
            }
            const bytes = [];
            while (acc > 0n) { bytes.unshift(Number(acc % 256n)); acc /= 256n; }
            for (const c of input) { if (c === "1") bytes.unshift(0); else break; }
            try {
              const out = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes));
              return { result: out, caption: "Decoded from Base58", rows: [["Output bytes", bytes.length]] };
            } catch {
              return { result: "", error: "Decoded bytes are not valid UTF-8 text" };
            }
          }
          const bytes = new TextEncoder().encode(input);
          let acc = 0n; for (const byte of bytes) acc = acc * 256n + BigInt(byte);
          let out = ""; while (acc > 0n) { out = A[Number(acc % 58n)] + out; acc /= 58n; }
          for (let i = 0; i < bytes.length && bytes[i] === 0; i++) out = "1" + out;
          return { result: out || "1", caption: "Encoded to Base58", rows: [["Input bytes", bytes.length], ["Output chars", out.length]] };
        },
      },
      verify: { invariants: [] },
    }),
  },

  // ------------------------------------------------------------ name / idea generators
  {
    id: "name-gen",
    match: (n) => (/(domain name|business name|startup name|username|user name|fantasy (character|name)|company name|brand name|product name|app name|project name|team name) (idea|ideas|generator|maker)?/.test(n) ? { kind: n } : null),
    build: (e, p) => {
      const fantasy = /fantasy|character/.test(p.kind);
      return {
        raw: {
          title: e.name, category: e.category?.length ? e.category : ["Fun"], icon: "shuffle", iconColor: "text-violet-600",
          description: "Generate fresh " + (fantasy ? "fantasy character names" : "name ideas") + " from a keyword.",
          regenerate: true,
          fields: [{ key: "keyword", label: fantasy ? "Theme (optional)" : "Keyword", type: "text", default: fantasy ? "" : "cloud", required: false }],
          compute: (values, _mode, random) => {
            const isFantasy = __FANTASY__;
            const k = String(values.keyword || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
            const A = ["Nova", "Lumen", "Vertex", "Quartz", "Harbor", "Ember", "Cascade", "Cobalt", "Nimbus", "Zephyr", "Onyx", "Delta", "Pixel", "Echo", "Aster", "Flux", "Vela", "Rune"];
            const B = ["ly", "ify", "hub", "labs", "kit", "flow", "wave", "forge", "spark", "loop", "base", "grid", "works", "craft"];
            const fant = ["Aeloria", "Thornwood", "Kaelith", "Silvarn", "Draven", "Elowen", "Fenrith", "Mirelle", "Zorander", "Ysolde", "Varkon", "Lythia"];
            const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
            const out = new Set(); let g = 0;
            while (out.size < 6 && g++ < 60) {
              if (isFantasy) out.add(fant[Math.floor(random() * fant.length)] + " " + fant[Math.floor(random() * fant.length)]);
              else { const a = A[Math.floor(random() * A.length)]; const b = B[Math.floor(random() * B.length)]; out.add(k ? cap(k) + b : a + b); }
            }
            return { list: [...out] };
          },
        },
        verify: { invariants: [] }, _sub: { __FANTASY__: fantasy },
      };
    },
  },

  // ------------------------------------------------------------ dev format tools
  {
    id: "dev-format",
    match: (n) => {
      if (/iso ?8601|iso date/.test(n)) return { kind: "iso" };
      if (/duration (calc|convert|format)|seconds to|time duration/.test(n)) return { kind: "duration" };
      if (/mime ?type/.test(n)) return { kind: "mime" };
      if (/ipv6 (expand|expander)/.test(n)) return { kind: "ipv6" };
      return null;
    },
    build: (e, p) => {
      const defs = {
        iso: { d: "Convert a date/time to ISO-8601 and other formats.", fields: [{ key: "input", label: "Date/time", type: "text", default: "2026-07-20 15:30" }], fn: (values) => { const dt = new Date(values.input); if (isNaN(dt)) return { result: "—", caption: "Enter a valid date/time" }; return { result: dt.toISOString(), rows: [["Unix (s)", Math.floor(dt.getTime() / 1000)], ["UTC", dt.toUTCString()], ["Local", dt.toString().replace(/ GMT.*/, "")]] }; } },
        duration: { d: "Turn a number of seconds into a human-readable duration.", fields: [{ key: "seconds", label: "Seconds", type: "number", default: "90061" }], fn: (values) => { let s = Math.max(0, Math.floor(num(values.seconds))); const d = Math.floor(s / 86400); s %= 86400; const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60); s %= 60; return { result: [d && d + "d", h && h + "h", m && m + "m", (s || (!d && !h && !m)) && s + "s"].filter(Boolean).join(" "), rows: [["Days", d], ["Hours", h], ["Minutes", m], ["Seconds", s]] }; } },
        mime: { d: "Find the MIME type for a file extension.", fields: [{ key: "ext", label: "Extension or filename", type: "text", default: ".pdf" }], fn: (values) => { const map = { pdf: "application/pdf", json: "application/json", html: "text/html", css: "text/css", js: "text/javascript", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", webp: "image/webp", mp4: "video/mp4", mp3: "audio/mpeg", wav: "audio/wav", zip: "application/zip", csv: "text/csv", txt: "text/plain", xml: "application/xml", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", woff2: "font/woff2" }; const ext = String(values.ext).toLowerCase().replace(/.*\./, "").replace(/[^a-z0-9]/g, ""); return { result: map[ext] || "application/octet-stream", caption: "." + ext }; } },
        ipv6: { d: "Expand a shortened IPv6 address to its full form.", fields: [{ key: "addr", label: "IPv6 address", type: "text", default: "2001:db8::1" }], fn: (values) => { const a = String(values.addr).trim(); if (!a.includes(":")) return { result: "—", caption: "Enter an IPv6 address" }; const parts = a.split("::"); let head = parts[0] ? parts[0].split(":") : []; let tail = parts[1] !== undefined ? (parts[1] ? parts[1].split(":") : []) : []; const miss = 8 - head.length - tail.length; const full = [...head, ...Array(Math.max(0, miss)).fill("0"), ...tail].map((h) => (h || "0").padStart(4, "0")); return { result: full.join(":"), caption: "expanded" }; } },
      };
      const cfg = defs[p.kind];
      return { raw: { title: e.name, category: e.category?.length ? e.category : ["Developer"], icon: "code", iconColor: "text-cyan-600", description: cfg.d, fields: cfg.fields, compute: cfg.fn }, verify: { invariants: [] } };
    },
  },

  // ------------------------------------------------------------ more CSS generators
  {
    id: "css-extra",
    match: (n) => {
      if (/css triangle/.test(n)) return { kind: "triangle" };
      if (/css clamp|clamp generator/.test(n)) return { kind: "clamp" };
      if (/media query|media-query/.test(n)) return { kind: "media" };
      return null;
    },
    build: (e, p) => {
      const defs = {
        triangle: { d: "Generate a CSS triangle using the border trick.", fields: [{ key: "size", label: "Size (px)", type: "range", default: 40, min: 4, max: 200, step: 2 }, { key: "direction", label: "Direction", type: "select", default: "up", choices: ["up", "down", "left", "right"].map((v) => ({ value: v, label: v })) }, { key: "color", label: "Color", type: "text", default: "#4f46e5" }], fn: (values) => { const s = num(values.size), c = values.color, T = "transparent"; const m = { up: `border-left:${s}px solid ${T};border-right:${s}px solid ${T};border-bottom:${s}px solid ${c};`, down: `border-left:${s}px solid ${T};border-right:${s}px solid ${T};border-top:${s}px solid ${c};`, left: `border-top:${s}px solid ${T};border-bottom:${s}px solid ${T};border-right:${s}px solid ${c};`, right: `border-top:${s}px solid ${T};border-bottom:${s}px solid ${T};border-left:${s}px solid ${c};` }; return { result: "width:0;height:0;" + m[values.direction], rows: [["Direction", values.direction]] }; } },
        clamp: { d: "Build a responsive CSS clamp() value.", fields: [{ key: "min", label: "Min (px)", type: "number", default: "16" }, { key: "max", label: "Max (px)", type: "number", default: "48" }, { key: "vw", label: "Preferred (vw)", type: "number", default: "4" }], fn: (values) => { return { result: `clamp(${num(values.min)}px, ${num(values.vw)}vw, ${num(values.max)}px)`, caption: "responsive size", rows: [["Min", num(values.min) + "px"], ["Max", num(values.max) + "px"]] }; } },
        media: { d: "Generate a CSS media query for a breakpoint.", fields: [{ key: "min", label: "Min width (px, 0 = none)", type: "number", default: "768" }, { key: "max", label: "Max width (px, 0 = none)", type: "number", default: "0" }], fn: (values) => { const parts = []; if (num(values.min) > 0) parts.push(`(min-width: ${num(values.min)}px)`); if (num(values.max) > 0) parts.push(`(max-width: ${num(values.max)}px)`); const q = parts.join(" and ") || "all"; return { result: `@media ${q} { /* … */ }`, rows: [["Query", q]] }; } },
      };
      const cfg = defs[p.kind];
      return { raw: { title: e.name, category: e.category?.length ? e.category : ["Design"], icon: "square", iconColor: "text-indigo-500", description: cfg.d, fields: cfg.fields, compute: cfg.fn }, verify: { invariants: [] } };
    },
  },
];

// Substitute __PLACEHOLDER__ tokens (e.g. target case, unit table) into the
// serialized compute source — keeps the source self-contained and correct.
function applySubs(rawSpec, subs) {
  if (!subs) return rawSpec;
  let src = String(rawSpec.compute);
  for (const [token, val] of Object.entries(subs)) {
    // string-literal tokens like "__TARGET__" -> "camel" ; bare __TABLE__ -> {...}
    src = src.split('"' + token + '"').join(JSON.stringify(val));
    src = src.split(token).join(val);
  }
  return { ...rawSpec, compute: src };
}

export function matchCluster(entry) {
  const n = `${entry.name || entry.slug || ""} ${(Array.isArray(entry.category) ? entry.category.join(" ") : entry.category) || ""}`.toLowerCase();
  for (const c of clusters) {
    const params = c.match(n);
    if (params) return { cluster: c, params };
  }
  return null;
}

// Returns { raw, verify } or null. `raw.compute` may be a function OR a string
// (already-substituted). buildAndValidate handles both.
export function buildCluster(entry) {
  const hit = matchCluster(entry);
  if (!hit) return null;
  const out = hit.cluster.build(entry, hit.params);
  const raw = out._sub ? applySubs(out.raw, out._sub) : out.raw;
  return { raw, verify: out.verify || { invariants: [] }, clusterId: hit.cluster.id };
}

export const clusterIds = clusters.map((c) => c.id);
export { titleCase };
