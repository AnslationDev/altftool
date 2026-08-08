const seo = {
  title: "Tailwind Color Generator: 50-950 Scale in OKLCH",
  metaDescription:
    "One base colour becomes eleven Tailwind shades stepped in OKLCH, each with WCAG contrast, as v4 @theme, CSS vars, v3 config or JSON.",
  steps: [
    "Paste a hex into Base colour or use the swatch picker, then set Colour name in the CSS.",
    "Answer 'Which step is your colour?' to anchor your brand shade, and pick an Output format: Tailwind v4 @theme (oklch), @theme (hex), CSS custom properties, tailwind.config.js (v3) or JSON.",
    "The ramp lists all eleven shades from 50 to 950 and 'Contrast against white and black' gives each one its ratio; Copy result copies the generated code.",
  ],
  intro:
    "A Tailwind color generator turns one brand colour into the eleven shades Tailwind expects — 50, 100, 200 through 900 and 950 — ready to paste into a v4 @theme block or a v3 tailwind.config.js. This one works in OKLCH, the perceptual colour space Björn Ottosson published in 2020 and the one Tailwind v4's own palette is written in, so each step really does look a fixed amount lighter than the last instead of merely being a fixed number apart. Every shade is also scored for WCAG 2.1 contrast against white and black, so you know which ones can carry text.",
  useCases: [
    "Turn a brand hex from a style guide into a complete Tailwind scale, with the brand colour itself anchored at whichever step it belongs to.",
    "Find out which shades of your primary colour can legally carry white text — the table shows the exact contrast ratio and whether it clears 4.5:1.",
    "Generate a matching neutral or accent ramp that sits beside Tailwind v4's built-in oklch palette without looking out of place.",
  ],
  benefits: [
    ["Perceptual, not arithmetic", "Lightness steps are taken in OKLCH, so a yellow ramp and a blue ramp look equally spaced instead of the yellow washing out early."],
    ["Contrast built in", "Each shade shows its ratio against white and black and whether it passes WCAG AA at 4.5:1 or AAA at 7:1."],
    ["Four output formats", "Tailwind v4 @theme in oklch or hex, plain CSS custom properties, a v3 config object, or JSON."],
  ],
  faqs: [
    [
      "What shades does a Tailwind color scale have?",
      "Eleven: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 and 950. 50 is the lightest tint, 500 is the mid-tone that usually matches the brand colour, and 950 is the near-black used for dark surfaces. The 950 step was added in Tailwind v3.3; before that the scale stopped at 900.",
    ],
    [
      "Why generate colours in OKLCH instead of HSL?",
      "Because HSL lightness is not perceptual. hsl(60 100% 50%) is yellow and hsl(240 100% 50%) is blue, and both claim 50% lightness, yet the yellow looks far brighter. Stepping HSL lightness therefore produces ramps where some hues go pale far too early. OKLab, and its cylindrical form OKLCH, was designed so that equal L differences look equal, which is why Tailwind v4 ships its default palette in oklch().",
    ],
    [
      "Which shade should carry white text?",
      "Usually 600 and darker, but check the number rather than the step. WCAG 2.1 requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for text at 18.66px bold or 24px and above. Every shade in the table shows its measured ratio against both white and black, and a shade sitting just under 4.5:1 is fine for a heading and not for body copy.",
    ],
    [
      "Why did some shades come out less saturated than I asked for?",
      "Because sRGB cannot display them. A very saturated hue at a very light or very dark lightness falls outside the sRGB gamut, so chroma is reduced by binary search until the colour just fits, keeping hue and lightness exactly. The result is the most saturated version of that shade your screen can actually show, and the tool reports how many steps needed it.",
    ],
  ],
};

export default seo;
