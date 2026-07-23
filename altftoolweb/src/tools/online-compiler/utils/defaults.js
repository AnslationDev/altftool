"use client";

export const STORAGE_KEYS = {
  current: "oc.current",
  projects: "oc.projects",
  settings: "oc.settings",
  theme: "oc.theme",
  layout: "oc.layout",
};

export const DEFAULT_SETTINGS = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  autoRun: true,
  autoSave: true,
  runDelay: 600,
  theme: "system", // system | dark | light
};

export const DEFAULT_CODE = {
  html: `<div class="card">
  <h1>Hello, world 👋</h1>
  <p>Edit the HTML, CSS, and JS to see live changes.</p>
  <button id="cta">Click me</button>
</div>`,
  css: `:root { color-scheme: light dark; }
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: ui-sans-serif, system-ui, sans-serif;
  background: linear-gradient(135deg, #14b8a6, #22d3ee);
  color: #0f172a;
}
.card {
  background: rgba(255,255,255,0.92);
  padding: 2rem 2.5rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 20px 45px rgba(0,0,0,0.2);
}
button {
  margin-top: 1rem;
  border: 0;
  padding: 0.6rem 1.2rem;
  border-radius: 0.6rem;
  background: #14b8a6;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}`,
  js: `const btn = document.getElementById("cta");
let n = 0;
btn.addEventListener("click", () => {
  n += 1;
  console.log("Clicked", n, "time(s)");
  btn.textContent = \`Clicked \${n} time\${n > 1 ? "s" : ""}\`;
});`,
};
