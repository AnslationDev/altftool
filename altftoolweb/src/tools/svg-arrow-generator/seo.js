const seo = {
  intro:
    "SVG Arrow Generator turns two points and a bow amount into a ready-to-paste annotation arrow drawn as a single quadratic Bezier curve (the SVG 'Q' path command) with a matching arrowhead. The head is rotated to the curve's tangent at the tip, so it always points along the path instead of along the straight line between the endpoints. Stroke and fill use currentColor, which means one file works on light and dark backgrounds without editing.",
  useCases: [
    "Point at a specific button in a product screenshot for release notes or a help-centre article.",
    "Add a curved connector between two boxes in a hand-built diagram without opening a vector editor.",
    "Generate a double-headed arrow to label a distance or a range in a technical drawing.",
    "Produce a lightweight inline arrow for a web page where loading an icon font would be overkill.",
  ],
  benefits: [
    ["Tangent-accurate heads", "The arrowhead follows the curve's derivative at the tip, so it never looks glued on at the wrong angle."],
    ["Theme-safe output", "currentColor lets one arrow inherit the surrounding text colour instead of shipping a baked-in hex value."],
    ["Editable by hand", "Output is a plain path plus one head element — easy to tweak in any text editor or paste into JSX."],
  ],
  faqs: [
    [
      "How do I make a curved arrow in SVG?",
      "Use a quadratic Bezier: M x1 y1 Q cx cy x2 y2, where the control point (cx, cy) sits off the straight line between the two ends. Because the curve passes halfway between the chord midpoint and the control point, offsetting the control point by twice your desired bow height gives exactly that bow.",
    ],
    [
      "Should I use a marker-end or a separate arrowhead shape?",
      "A separate polygon or path is more portable. SVG markers scale with stroke width and are stripped or mis-rendered by several editors, email clients and design tools, whereas an explicit head shape survives copy-paste anywhere.",
    ],
    [
      "Why does my arrowhead point the wrong way on a curve?",
      "Because it was aligned to the straight line between the endpoints rather than to the curve. The correct direction is the Bezier's derivative at the tip: for a quadratic that is 2 x (P2 - C), the vector from the control point to the end point.",
    ],
    [
      "How do I change the arrow's colour?",
      "Set a CSS color on any parent element — the markup uses currentColor for both stroke and fill, so the arrow inherits it. To pin a fixed colour instead, replace currentColor with your own value in the stroke and fill attributes.",
    ],
  ],
};

export default seo;
