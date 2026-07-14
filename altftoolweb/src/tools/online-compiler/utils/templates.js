// Starter templates. Each provides html / css / js strings.
export const TEMPLATES = [
  {
    name: "Blank",
    html: `<div id="app">\n  <h1>Blank</h1>\n</div>`,
    css: `body { font-family: system-ui, sans-serif; margin: 2rem; }`,
    js: `// start coding`,
  },
  {
    name: "Landing Page",
    html: `<header class="nav">
  <div class="logo">Acme</div>
  <nav><a href="#">Features</a><a href="#">Pricing</a><a href="#">About</a></nav>
</header>
<section class="hero">
  <h1>Build faster with Acme</h1>
  <p>The platform that helps you ship in minutes.</p>
  <button class="cta">Get started</button>
</section>`,
    css: `:root { color-scheme: light dark; }
* { box-sizing: border-box; }
body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; }
.nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; }
.logo { font-weight: 800; color: #14b8a6; }
.nav nav a { margin-left: 1.2rem; color: inherit; text-decoration: none; }
.hero { text-align: center; padding: 6rem 1rem; background: linear-gradient(135deg,#14b8a6,#22d3ee); color: #042f2e; }
.hero h1 { font-size: 3rem; margin: 0 0 1rem; }
.cta { margin-top: 1.5rem; border: 0; padding: .8rem 1.6rem; border-radius: .6rem; background:#042f2e; color:#fff; font-weight:700; cursor:pointer; }`,
    js: `document.querySelector(".cta").addEventListener("click", () => {
  console.log("Get started clicked");
});`,
  },
  {
    name: "Portfolio",
    html: `<main class="wrap">
  <h1>Jane Doe</h1>
  <p class="role">Frontend Engineer</p>
  <ul class="links">
    <li><a href="#">GitHub</a></li>
    <li><a href="#">Dribbble</a></li>
    <li><a href="#">Blog</a></li>
  </ul>
</main>`,
    css: `body { margin:0; font-family: ui-sans-serif, system-ui, sans-serif; background:#0f172a; color:#e2e8f0; display:grid; place-items:center; min-height:100vh; }
.wrap { text-align:center; }
h1 { font-size:2.6rem; margin:0; }
.role { color:#22d3ee; }
.links { list-style:none; padding:0; display:flex; gap:1rem; justify-content:center; margin-top:1.5rem; }
.links a { color:#14b8a6; text-decoration:none; }`,
    js: `console.log("Portfolio loaded");`,
  },
  {
    name: "Pricing Page",
    html: `<section class="pricing">
  <div class="plan"><h3>Starter</h3><p class="price">$0</p><button>Choose</button></div>
  <div class="plan featured"><h3>Pro</h3><p class="price">$12</p><button>Choose</button></div>
  <div class="plan"><h3>Team</h3><p class="price">$40</p><button>Choose</button></div>
</section>`,
    css: `body { margin:0; font-family: system-ui, sans-serif; background:#f8fafc; }
.pricing { display:flex; gap:1rem; justify-content:center; padding:4rem 1rem; flex-wrap:wrap; }
.plan { background:#fff; border:1px solid #e2e8f0; border-radius:1rem; padding:2rem; width:200px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,.05); }
.plan.featured { border-color:#14b8a6; transform:translateY(-8px); }
.price { font-size:2rem; font-weight:800; color:#14b8a6; }
button { border:0; background:#14b8a6; color:#fff; padding:.6rem 1.4rem; border-radius:.6rem; cursor:pointer; }`,
    js: `document.querySelectorAll("button").forEach(b => b.addEventListener("click", () => console.log("Plan:", b.closest(".plan").querySelector("h3").textContent)));`,
  },
  {
    name: "Hero Section",
    html: `<section class="hero">
  <h1>Design that delights</h1>
  <p>Craft beautiful interfaces with confidence.</p>
  <button>Explore</button>
</section>`,
    css: `.hero { height:100vh; display:grid; place-content:center; text-align:center; background:radial-gradient(circle at 30% 20%, #14b8a6, #0f172a); color:#fff; font-family:system-ui,sans-serif; }
button { margin-top:1rem; border:0; padding:.7rem 1.5rem; border-radius:999px; background:#22d3ee; color:#042f2e; font-weight:700; cursor:pointer; }`,
    js: ``,
  },
  {
    name: "Login Form",
    html: `<form class="login" onsubmit="return false;">
  <h2>Welcome back</h2>
  <input type="email" placeholder="Email" required />
  <input type="password" placeholder="Password" required />
  <button type="submit">Sign in</button>
</form>`,
    css: `body { margin:0; min-height:100vh; display:grid; place-items:center; background:#0f172a; font-family:system-ui,sans-serif; }
.login { background:#1e293b; padding:2rem; border-radius:1rem; display:grid; gap:1rem; width:280px; color:#e2e8f0; }
.login input { padding:.7rem; border-radius:.5rem; border:1px solid #334155; background:#0f172a; color:#e2e8f0; }
.login button { border:0; background:#14b8a6; color:#042f2e; padding:.7rem; border-radius:.5rem; font-weight:700; cursor:pointer; }`,
    js: `document.querySelector(".login").addEventListener("submit", e => {
  e.preventDefault();
  console.log("Login submitted");
});`,
  },
  {
    name: "Signup Form",
    html: `<form class="signup" onsubmit="return false;">
  <h2>Create account</h2>
  <input type="text" placeholder="Name" required />
  <input type="email" placeholder="Email" required />
  <input type="password" placeholder="Password" required />
  <button type="submit">Sign up</button>
</form>`,
    css: `body { margin:0; min-height:100vh; display:grid; place-items:center; background:linear-gradient(135deg,#22d3ee,#14b8a6); font-family:system-ui,sans-serif; }
.signup { background:#fff; padding:2rem; border-radius:1rem; display:grid; gap:1rem; width:300px; box-shadow:0 20px 50px rgba(0,0,0,.15); }
.signup input { padding:.7rem; border-radius:.5rem; border:1px solid #cbd5e1; }
.signup button { border:0; background:#14b8a6; color:#fff; padding:.7rem; border-radius:.5rem; font-weight:700; cursor:pointer; }`,
    js: `document.querySelector(".signup").addEventListener("submit", e => {
  e.preventDefault();
  console.log("Signup submitted");
});`,
  },
  {
    name: "Dashboard",
    html: `<div class="dash">
  <aside><h3>Menu</h3><a>Home</a><a>Reports</a><a>Settings</a></aside>
  <main>
    <div class="cards"><div class="kpi">Users<br><b>1,204</b></div><div class="kpi">Revenue<br><b>$9.8k</b></div><div class="kpi">Uptime<br><b>99.9%</b></div></div>
  </main>
</div>`,
    css: `body { margin:0; font-family:system-ui,sans-serif; background:#f1f5f9; }
.dash { display:grid; grid-template-columns:200px 1fr; min-height:100vh; }
aside { background:#0f172a; color:#e2e8f0; padding:1.5rem; display:grid; gap:.6rem; }
aside a { color:#94a3b8; text-decoration:none; }
main { padding:2rem; }
.cards { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
.kpi { background:#fff; border-radius:1rem; padding:1.5rem; box-shadow:0 10px 30px rgba(0,0,0,.05); }`,
    js: `console.log("Dashboard ready");`,
  },
  {
    name: "Navbar",
    html: `<nav class="bar">
  <span class="brand">Brand</span>
  <div class="links"><a>Home</a><a>Docs</a><a>Pricing</a></div>
  <button>Sign in</button>
</nav>
<section style="padding:3rem"><h1>Content here</h1></section>`,
    css: `body { margin:0; font-family:system-ui,sans-serif; }
.bar { display:flex; align-items:center; justify-content:space-between; padding:1rem 2rem; background:#fff; border-bottom:1px solid #e2e8f0; position:sticky; top:0; }
.brand { font-weight:800; color:#14b8a6; }
.links a { margin:0 1rem; color:#334155; text-decoration:none; }
.bar button { border:0; background:#14b8a6; color:#fff; padding:.5rem 1.2rem; border-radius:.6rem; cursor:pointer; }`,
    js: ``,
  },
  {
    name: "Card Layout",
    html: `<div class="grid">
  <article class="card"><h3>Card one</h3><p>Short description text.</p></article>
  <article class="card"><h3>Card two</h3><p>Short description text.</p></article>
  <article class="card"><h3>Card three</h3><p>Short description text.</p></article>
</div>`,
    css: `body { margin:0; font-family:system-ui,sans-serif; background:#f8fafc; padding:2rem; }
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; }
.card { background:#fff; border:1px solid #e2e8f0; border-radius:1rem; padding:1.5rem; box-shadow:0 8px 24px rgba(0,0,0,.05); }`,
    js: `document.querySelectorAll(".card").forEach(c => c.addEventListener("click", () => console.log("Opened", c.querySelector("h3").textContent)));`,
  },
  {
    name: "Modal",
    html: `<button id="open">Open modal</button>
<div id="overlay" class="overlay hidden">
  <div class="modal"><h3>Hello 👋</h3><p>This is a modal dialog.</p><button id="close">Close</button></div>
</div>`,
    css: `body { margin:0; font-family:system-ui,sans-serif; display:grid; place-items:center; min-height:100vh; }
button { border:0; background:#14b8a6; color:#fff; padding:.6rem 1.2rem; border-radius:.6rem; cursor:pointer; }
.overlay { position:fixed; inset:0; background:rgba(15,23,42,.6); display:grid; place-items:center; }
.modal { background:#fff; padding:2rem; border-radius:1rem; width:300px; text-align:center; }
.hidden { display:none; }`,
    js: `const overlay = document.getElementById("overlay");
document.getElementById("open").onclick = () => overlay.classList.remove("hidden");
document.getElementById("close").onclick = () => overlay.classList.add("hidden");`,
  },
  {
    name: "Responsive Grid",
    html: `<div class="grid">
  <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div>
</div>`,
    css: `body { margin:0; font-family:system-ui,sans-serif; padding:2rem; }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:1rem; }
.grid div { background:linear-gradient(135deg,#14b8a6,#22d3ee); color:#fff; border-radius:.8rem; display:grid; place-items:center; height:120px; font-weight:700; }`,
    js: ``,
  },
  {
    name: "Animation Demo",
    html: `<div class="box"></div>
<button id="go">Animate</button>`,
    css: `body { margin:0; font-family:system-ui,sans-serif; display:grid; place-items:center; min-height:100vh; gap:1rem; background:#0f172a; }
.box { width:80px; height:80px; border-radius:1rem; background:#22d3ee; }
.go { animation: spin 1.2s ease; }
@keyframes spin { to { transform: rotate(360deg) scale(1.4); } }
button { border:0; background:#14b8a6; color:#fff; padding:.6rem 1.2rem; border-radius:.6rem; cursor:pointer; }`,
    js: `document.getElementById("go").addEventListener("click", () => {
  const b = document.querySelector(".box");
  b.classList.remove("go"); void b.offsetWidth; b.classList.add("go");
  console.log("Animating");
});`,
  },
];

export function templateByName(name) {
  return TEMPLATES.find((t) => t.name === name) || null;
}
