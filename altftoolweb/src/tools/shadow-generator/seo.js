const seo = {
  title: "CSS Shadow Generator — Free box-shadow Builder",
  h1: "CSS Shadow Generator with Live Preview",
  metaDescription:
    "Free CSS shadow generator: sliders for offset, blur, spread, opacity, color and inset, with a live preview and one-click copy of the box-shadow rule.",
  intro:
    "The Shadow Generator builds a CSS box-shadow declaration from six controls and applies it to a live 240px preview element as you drag each slider. The hex color you pick in the native color input is parsed by a regular expression into red, green and blue integers, then recombined with the opacity slider into an rgba() value, so the rule it prints — `inset Hpx Vpx Bpx Spx rgba(r, g, b, a)` — is exactly the string the browser is already rendering in the preview. It is plain client-side React state: the tool makes no network requests, so nothing you configure is uploaded or stored.",
  useCases: [
    "Dialing in card, modal and dropdown elevation for a design system, then pasting the exact rule into a stylesheet or a Tailwind arbitrary value",
    "Building soft inset shadows for pressed buttons, input fields and neumorphic panels by toggling the inset checkbox",
    "Testing how negative offsets and negative spread actually behave before committing a shadow to production CSS",
  ],
  benefits: [
    [
      "Exact rgba output, not a guess",
      "Your hex color is split into R, G and B integers and combined with the opacity slider into a single rgba() value, so the declaration you copy is character-for-character the one applied to the preview square.",
    ],
    [
      "Every box-shadow value on one screen",
      "Horizontal and vertical offset (-100px to 100px), blur radius (0 to 100px), spread radius (-50px to 50px), opacity (0 to 1 in 0.01 steps), shadow color and the inset toggle are all live controls — no syntax order to memorize.",
    ],
    [
      "Nothing leaves your browser",
      "The generator is client-side React with no API calls, no uploads and no account. There is no signup and nothing to install; close the tab and no state is kept anywhere.",
    ],
    [
      "Legacy prefixes shown alongside",
      "The output panel also renders -webkit-box-shadow and -moz-box-shadow copies of the same value for old stylesheets, while the Copy CSS button puts the standard box-shadow declaration on your clipboard.",
    ],
  ],
  faqs: [
    [
      "How do I generate a CSS box-shadow?",
      "Set four lengths and a color: horizontal offset, vertical offset, blur radius and spread radius, then the shadow color. Here each one is a slider — offsets run -100px to 100px, blur 0 to 100px, spread -50px to 50px and opacity 0 to 1 — and the finished rule, e.g. `box-shadow: 10px 10px 20px 0px rgba(0, 0, 0, 0.3);`, appears under the preview ready to copy.",
    ],
    [
      "What does spread radius do in a box-shadow?",
      "Spread grows or shrinks the shadow shape before the blur is applied. A positive spread makes the shadow extend past the element on every side; a negative spread pulls it back in, which is how you get a tight shadow tucked under a card with a large blur. This tool covers -50px to 50px.",
    ],
    [
      "What is an inset shadow in CSS?",
      "An inset shadow is drawn inside the element's padding box instead of outside it, so the surface looks recessed. Tick the Inset Shadow checkbox and the `inset` keyword is prepended to the rule; the preview updates on the same tick so you can see the shadow fall inward.",
    ],
    [
      "Is this shadow generator free and does it need an account?",
      "Yes, it is free and needs no signup. The whole generator runs as client-side React in your browser — no file is uploaded, no API is called, and nothing is installed.",
    ],
    [
      "Why is the shadow color rgba instead of the hex I picked?",
      "Because the opacity slider is folded into the color. The tool converts your hex into red, green and blue values and writes `rgba(r, g, b, opacity)`, which is the only way to express a partially transparent shadow inside a single box-shadow layer. Move opacity to 1 for a fully opaque shadow.",
    ],
    [
      "Can I make a layered or multi-shadow effect?",
      "Not in a single pass — this generator outputs one shadow layer at a time. To stack them, generate each shadow separately and join the values with commas in your stylesheet, for example `box-shadow: 0px 1px 2px 0px rgba(0,0,0,0.2), 0px 8px 24px 0px rgba(0,0,0,0.12);`.",
    ],
    [
      "Does this tool make text-shadow too?",
      "No, it outputs box-shadow only. text-shadow takes a different value list with no spread radius, so use AltFTool's separate Text Shadow Generator for headings, labels and button text.",
    ],
    [
      "Do I still need -webkit-box-shadow and -moz-box-shadow?",
      "Almost certainly not. Unprefixed `box-shadow` has been supported since IE9, Firefox 4, Chrome 10 and Safari 5.1, so the plain declaration is enough for any current browser. The prefixed lines are shown for legacy codebases, and the Copy CSS button copies the standard declaration on its own.",
    ],
  ],
  steps: [
    "Open the generator and drag the Horizontal Offset, Vertical Offset, Blur Radius and Spread Radius sliders — the 240px preview square redraws as you move each one.",
    "Click the Shadow Color swatch to pick a hex color, set Opacity between 0 and 1, and tick Inset Shadow if the shadow should fall inside the element.",
    "Press Copy CSS to put the finished `box-shadow: …;` declaration on your clipboard, then paste it into your stylesheet.",
  ],
};

export default seo;
