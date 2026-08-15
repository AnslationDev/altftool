const seo = {
  title: "Glassmorphism CSS Generator With Live Blur",
  metaDescription:
    "Tune backdrop blur to 40px, radius and rgba opacities over a dark blob scene, then copy the six-line .glass-card rule or download the CSS file.",
  steps: [
    "Under Glass Card Customization, drag Backdrop Blur (0-40px), Border Radius (0-50px), Background Opacity, Border Opacity and Shadow Density, and set Card Color and Border Color with the two pickers — or start from the Frosty White, Deep Charcoal, Neon Cyan or Ultra Clean preset.",
    "Watch Live Preview, where the card sits over blurred pink, cyan and orange blobs on a near-black stage, and keep adjusting until the text stays readable.",
    "Generated CSS Code shows the six declarations — background rgba, border-radius, box-shadow 0 4px 30px, backdrop-filter, -webkit-backdrop-filter and a 1px border; Copy takes the rule body and Download saves glassmorphism-card.css wrapped in a .glass-card selector.",
  ],
  intro:
    "The Glassmorphism CSS Generator builds a frosted-glass card rule — background rgba, border-radius, box-shadow, backdrop-filter: blur() and a 1px translucent border — from five sliders and two colour pickers, and shows the result live over a dark scene with coloured blobs behind it. Backdrop blur runs from 0 to 40px, corner radius from 0 to 50px, and background, border and shadow opacity are each set as a percentage that is converted into the rgba alpha channel. It is for designers and front-end developers who want to tune the frosted look by eye and leave with the exact CSS rather than guessing alpha values in devtools.",
  useCases: [
    "You are building a login card that floats over a photographic hero and need to find the blur and background opacity where the text behind stays suggested but the form text stays readable.",
    "You want a dark-UI variant of an existing glass panel, so you start from the Deep Charcoal preset and dial the background alpha until the card separates from the page without looking solid.",
    "You are handing a component to a developer and want a copy-pasteable .glass-card rule with the vendor-prefixed backdrop-filter already included, instead of a screenshot.",
  ],
  benefits: [
    [
      "Previews over a real busy background",
      "The live card sits above blurred gradient blobs on a near-black stage, which is where a glass effect actually succeeds or fails — a flat swatch hides the problem.",
    ],
    [
      "Opacity in percent, output in rgba",
      "You move a 0-100% slider and the tool converts your hex colour into the matching rgba() value, so you never hand-calculate an alpha or mismatch the border and background tints.",
    ],
    [
      "Four starting points, not a blank slider",
      "Frosty White, Deep Charcoal, Neon Cyan and Ultra Clean presets set blur, colours and opacities together, so you begin from a coherent look and adjust from there.",
    ],
  ],
  faqs: [
    [
      "What CSS does it output?",
      "Six declarations: background as an rgba value, border-radius in px, box-shadow set to 0 4px 30px with your chosen black alpha, backdrop-filter: blur() with the -webkit- prefixed twin, and border: 1px solid with the border rgba. The download wraps them in a .glass-card selector and saves glassmorphism-card.css.",
    ],
    [
      "How much blur should a glass card use?",
      "Most glassmorphic UI lands between roughly 8px and 20px of backdrop blur; the slider covers 0 to 40px so you can push further for a heavy frosted panel. Higher blur lets you drop background opacity while keeping foreground text legible, which is usually the trade-off you are tuning.",
    ],
    [
      "Does backdrop-filter work in every browser?",
      "It is supported across current Chrome, Edge, Safari and Firefox, and the generated rule also emits -webkit-backdrop-filter for older WebKit builds. Where it is unsupported the card falls back to a plain translucent background, so pick a background opacity that still reads acceptably on its own.",
    ],
    [
      "Why does my glass card look muddy or unreadable?",
      "Usually because background opacity is too high or the content behind it is high-contrast. Try lowering background opacity toward 10-20%, raising the blur, and keeping the border alpha near 25-30% — the border is what gives the panel its edge once the fill is nearly transparent.",
    ],
  ],
};

export default seo;
