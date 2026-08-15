const seo = {
  title: "Corporate Trust Palette Generator: WCAG-Checked",
  metaDescription:
    "10-step blue brand scale, tinted neutrals and status colours with WCAG contrast checked for light and dark - output as CSS variables, Tailwind and JSON.",
  intro:
    "The Corporate Trust Palette Generator builds a blue-led brand palette in the shape a design system actually needs — a 10-step primary scale numbered 50 to 900, a brand-tinted neutral scale, and success, warning, danger and info statuses — then uses the WCAG 2.1 contrast formula to say which step is legal for text and which for UI in light mode and in dark mode. You pick a blue family (azure, navy, indigo or teal blue), a saturation from 30 to 90, and how much brand hue bleeds into the greys, and it returns hex values plus ready-made CSS custom properties, a Tailwind @theme block and JSON. It is aimed at designers and front-end engineers who need an institutional palette that survives an accessibility review.",
  useCases: [
    "You are branding a banking or insurance product and need a navy scale where you can point at the exact step that is safe for body copy on white and the exact step that works on the dark surface.",
    "Your team is setting up design tokens and wants the palette delivered as CSS variables and a Tailwind @theme block rather than a screenshot of swatches to be transcribed by hand.",
    "An audit flagged your status colours, and you need success, warning, danger and info scales whose text steps are checked against a 4.5:1 target before the fix ships.",
  ],
  benefits: [
    [
      "Contrast answers, not just swatches",
      "Every scale is scanned from the pale end for the lightest step that still clears the target, so you get a named step and its measured ratio instead of eyeballing colours.",
    ],
    [
      "Light and dark resolved separately",
      "Text and UI steps are computed against the white light-mode surface and the deep neutral dark-mode surface independently, so a palette that only works in one mode is caught immediately.",
    ],
    [
      "Deterministic from a seed",
      "The brand hue is derived from a hash of your seed text and chosen family, so the same seed always regenerates the identical palette and you can share it as a word rather than a file.",
    ],
  ],
  faqs: [
    [
      "What contrast ratio does the palette have to hit?",
      "The AA target is 4.5:1 for normal body text and 3:1 for large text and UI components; switching to the AAA target raises body text to 7:1. These come from WCAG 2.1 success criteria 1.4.3, 1.4.11 and 1.4.6, and each generated colour is reported with its measured ratio so you can see the margin.",
    ],
    [
      "Why are all the palettes blue?",
      "Because the generator is built for institutional branding, where blue reads as stable and impartial. You choose among four blue families with fixed hue windows — azure at 204-214 degrees, navy at 218-228, indigo at 230-244 and teal blue at 188-198 — and the exact hue inside that window comes from your seed.",
    ],
    [
      "Can I export the palette into my codebase?",
      "Yes. Every generated palette comes with a :root block of CSS custom properties including a [data-theme=\"dark\"] override, a Tailwind @theme block, and a JSON object containing all 10 steps of the primary, neutral and status scales.",
    ],
    [
      "What does the neutral tint slider actually change?",
      "It sets how much of the brand hue is mixed into the grey scale, on a 0 to 20 range. At 0 the neutrals are pure grey; a few points of tint makes greys feel intentionally part of the brand, and the tool flags a tint of 0 as a missed opportunity.",
    ],
  ],
};

export default seo;
