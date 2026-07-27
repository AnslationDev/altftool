const seo = {
  intro:
    "This dashboard reports everything a web page can learn about your browser without asking permission: the browser and engine parsed from the user-agent string, the operating system, viewport and screen geometry, the privacy signals you send, and which of 23 web APIs are actually available. Detection matches the most specific user-agent token first — Edge before Chrome, Chrome before Safari — because every Chromium browser carries the earlier names in its UA. Everything runs locally; nothing is transmitted or stored.",
  useCases: [
    "Confirm what a tester's browser actually reports when a bug only reproduces on their machine",
    "Check whether a target device supports WebGL 2, WebGPU, SharedArrayBuffer or the Async Clipboard API before designing around them",
    "See which identifying attributes your browser volunteers, and how much a privacy extension or setting actually changes that",
  ],
  benefits: [
    ["Correct browser detection", "Edge, Opera, Samsung Internet and Vivaldi are identified rather than collapsed into Chrome."],
    ["Feature detection, not guesses", "Every API row is a live probe of the actual object, so it reflects this browser, not a compatibility table."],
    ["Nothing leaves the page", "All values are read in the browser and discarded on navigation — no network request is made."],
  ],
  faqs: [
    [
      "Why does Chrome's user-agent string mention Safari?",
      "For historical compatibility. Chrome's UA contains \"AppleWebKit\", \"KHTML, like Gecko\" and \"Safari\" so that servers written for older engines would serve it the modern site. Edge adds \"Edg/\" on top of the full Chrome string. That is why detection must match the most specific token first, and why feature detection beats UA sniffing in production.",
    ],
    [
      "What is Global Privacy Control and does it do anything?",
      "GPC is a header and a JavaScript flag saying you opt out of the sale or sharing of your personal data. Unlike Do Not Track it has legal force in some jurisdictions — California's Attorney General and Colorado's privacy rules both treat it as a valid opt-out request — which is why it is weighted far more heavily here than DNT.",
    ],
    [
      "Can I stop sites from reading this information?",
      "You can reduce it, not eliminate it. Firefox's resist-fingerprinting mode and Safari's protections round or omit screen size, deviceMemory and hardwareConcurrency; Chromium exposes all three. The single largest change is blocking third-party cookies, which is worth 25 of the 100 points in the score here.",
    ],
    [
      "Is the viewport the same as the screen size?",
      "No. The screen is the physical display in CSS pixels; the viewport is the part of the page you can see, which is smaller by the browser chrome and any open panels. Responsive breakpoints react to the viewport, which is why the breakpoint shown here follows the viewport width — 640, 768, 1024, 1280 and 1536 pixels in Tailwind's default scale.",
    ],
  ],
};

export default seo;
