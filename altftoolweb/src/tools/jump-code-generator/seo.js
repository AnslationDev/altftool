const seo = {
  title: "Jump Code Generator: Anchor, Scroll & React Ref",
  metaDescription:
    "Generate anchor, offset smooth-scroll, button, React Router and scrollIntoView jump code, with your sticky-header offset built into the maths.",
  steps: [
    "Pick a code type: HTML Anchor Jump, Smooth Scroll, Button Jump, React Router Navigation, Scroll-to-Section, Snippet Generator or Custom Jump Logic.",
    "Fill the fields that type needs, such as Section ID, Link Text and Offset (px), which starts at 80.",
    "Press Copy on the Generated Code Output, or Download to save it as html-anchor.html, react-router.jsx or snippet.js.",
  ],
  intro:
    "The Jump Code Generator writes ready-to-paste navigation code for seven patterns — plain HTML anchor, offset smooth scroll, button jump, React Router link, React scrollIntoView section, a reusable delegated snippet, and a custom animated jump — from a short form of IDs, labels and offsets. Every scroll variant computes its destination as getBoundingClientRect().top + window.scrollY minus your sticky-header offset in pixels, which is the part people usually get wrong. It is for front-end developers who want the correct version of an on-page jump rather than the first Stack Overflow answer.",
  useCases: [
    "Your page has a fixed 80px header and every anchor link lands with the heading hidden underneath it, so you need the offset arithmetic done properly.",
    "You are converting a static site's anchor menu to React and want the equivalent as a useRef plus scrollIntoView component or a React Router navigate call.",
    "You have a dozen in-page links and want one delegated function bound to a selector instead of a click handler copy-pasted twelve times.",
  ],
  benefits: [
    ["Header offset built into the maths", "The offset you enter is subtracted from the target's absolute page position, so the section heading clears a sticky nav instead of hiding behind it."],
    ["Seven patterns from one form", "Switch between HTML, vanilla JS, React Router and React ref approaches and the form shows only the fields that pattern actually needs."],
    ["Inputs sanitised before they ship", "Section IDs are lowercased and stripped of illegal characters and function names are coerced into valid JavaScript identifiers, with a warning telling you what changed."],
  ],
  faqs: [
    [
      "How do I stop an anchor link landing under my fixed header?",
      "Subtract the header height from the scroll target: top = element.getBoundingClientRect().top + window.scrollY - offset. Enter your header height in the offset field — 80 is the default here — and the generated smooth-scroll, button-jump and snippet code all apply it.",
    ],
    [
      "What is the difference between smooth and auto scroll behavior?",
      "smooth animates the scroll while auto jumps instantly, and both are values of the native window.scrollTo behavior option. Choose auto when you want the browser's instant default, and note that a visitor with prefers-reduced-motion set may have smooth downgraded to instant by the browser anyway.",
    ],
    [
      "Does the custom option use window.scrollTo behavior: smooth?",
      "No — the custom jump runs its own requestAnimationFrame loop with a cubic ease-out curve over a duration you set in milliseconds, defaulting to 600ms. Use it when you need a specific animation length or easing that the native smooth behavior does not let you control.",
    ],
    [
      "Can I generate one handler for all my in-page links?",
      "Yes, the snippet option emits a single exported function that queries a selector — [data-jump-target] by default — and binds one offset-aware click handler to every match. Call it once after render and new links matching the selector are covered by the same code.",
    ],
  ],
};

export default seo;
