const seo = {
  title: "What Your Screen Tells Every Site You Visit",
  metaDescription:
    "See the screen size, available area, pixel ratio and colour depth any page reads without a prompt, each marked stable or session-only, common or rare.",
  steps: [
    "Leave “Readings to analyse” on This browser (live), or choose a Compare profile to see how an ordinary machine reports itself.",
    "Resize the window or open developer tools, then press Re-read to take the readings again.",
    "Study “Every reading, and what it leaks” for each signal, its stability and its crowd rarity, plus the FNV-1a combination id.",
  ],
  intro:
    "Screen and Display Fingerprint Viewer shows the display readings every website can take without a permission prompt: screen width and height in CSS pixels, available area, device pixel ratio, colour depth and current viewport. Each reading is labelled stable or session-only and marked as common or distinctive against widely reported values, and the stable set is hashed with FNV-1a into a short id so you can watch the same combination reproduce on every reload. It is for anyone who wants to see what browser fingerprinting actually collects before deciding whether to change anything.",
  useCases: [
    "Check whether your monitor size and scaling put you in a common bucket or make you stand out.",
    "See how much a resized window or open developer tools changes the readings a site receives.",
    "Confirm that a privacy browser or resist-fingerprinting setting is rounding the values it reports.",
    "Demonstrate to a class or a team what a site learns from window.screen before any script is loaded.",
  ],
  benefits: [
    [
      "Separates stable from session signals",
      "Screen size and pixel ratio survive reloads; viewport size does not, which is why trackers weight them differently.",
    ],
    [
      "Reproducible id",
      "The short id uses FNV-1a, which matches its published test vectors, so the same display always produces the same value.",
    ],
    [
      "Explains each reading",
      "Every row says what the number means, from reserved taskbar height to the physical pixel grid behind CSS pixels.",
    ],
  ],
  faqs: [
    [
      "Can a website see my screen resolution without permission?",
      "Yes. window.screen and window.devicePixelRatio are readable by any script on any page, with no prompt and no consent step, which is why display readings appear in almost every fingerprinting script.",
    ],
    [
      "Why does my browser report a colour depth of 24 when my monitor is 10-bit?",
      "24 is what nearly every browser returns, and the CSSOM View specification allows it: Firefox's resist-fingerprinting mode and Safari report 24 unconditionally. Because it is near-universal it adds almost nothing to a fingerprint.",
    ],
    [
      "Does changing my window size stop fingerprinting?",
      "It changes only the session-level readings. The stable ones — screen size, available area and pixel ratio — stay the same across resizes and reloads, so resizing alone does not break a display fingerprint.",
    ],
    [
      "Why is my device pixel ratio not a whole number?",
      "A ratio like 1.25 or 1.5 usually means OS display scaling or browser zoom rather than the hardware itself; phones commonly report 2, 2.625 or 3. Values away from the standard set are more distinctive because fewer machines report them.",
    ],
  ],
};

export default seo;
