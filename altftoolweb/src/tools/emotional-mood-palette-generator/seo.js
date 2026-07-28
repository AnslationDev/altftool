const seo = {
  title: "Mood Color Palette Generator — Free Emotion to Hex",
  h1: "Mood Color Palette Generator",
  metaDescription:
    "Generate an 8-color palette from any mood — 20 emotions, 9 styles from Soft Pastel to Cyberpunk. Export CSS, Tailwind or JSON. Free, in-browser.",
  intro:
    "The Emotional Mood → Palette Generator maps a mood onto a hue window in HSL and builds an eight-color system out of it. Each of the 20 moods carries its own range — Calm sits at 180–220°, Angry at 0–15°, Luxury at 260–280° — while the aesthetic style you pick (Vibrant, Neon, Cyberpunk, Soft Pastel and five others) sets the saturation and lightness bands the colors are drawn from. From the primary hue the engine derives an analogous secondary at +30° and 80% of its saturation, a complementary accent at +180°, near-neutral background and text roles held at 5–15% saturation, and three decorative colors jittered ±30°, then converts every HSL triplet to hex and RGB. It is all plain JavaScript running in your browser: no account, no upload, no API call.",
  useCases: [
    "Turn a brief like \"cozy evening by the fireplace\" into a working eight-color set with primary, accent, background and text already assigned.",
    "Lock the two colors a client already approved and reroll the remaining six until the rest of the system fits.",
    "Copy a finished palette straight into a project as CSS custom properties or a Tailwind theme.extend.colors block.",
  ],
  benefits: [
    [
      "Roles, not loose swatches",
      "The eight colors arrive labelled Primary, Secondary, Accent, Background, Text and Decor 1–3. Background and text are pinned at 5–15% saturation so they stay usable as neutrals rather than competing with the palette.",
    ],
    [
      "Color theory is built into the math",
      "Secondary is the primary hue rotated +30° at 80% of its saturation; accent is the +180° complement at 80–100% saturation. Those relationships hold no matter which mood or style you choose.",
    ],
    [
      "Lock and reroll",
      "Lock any swatch before regenerating and it is carried through untouched while the unlocked colors are redrawn — so you can keep what works and keep hunting for the rest.",
    ],
    [
      "Three export formats",
      "CSS custom properties, a Tailwind config block, and a downloadable palette-schema.json listing the mood, the style, and the hex, RGB and HSL values of every color.",
    ],
  ],
  faqs: [
    [
      "What color represents a mood like calm or anger?",
      "Calm maps to 180–220° on the HSL hue wheel — the cyan-to-blue band — at 30–50% saturation, and anger to 0–15° (red) at 70–100%. Every one of the 20 moods carries its own hue, saturation and lightness window, so the palette lands in the right family before the aesthetic style narrows the vividness.",
    ],
    [
      "How do I generate a color palette from a feeling or a sentence?",
      "Type it into the \"Describe the Feeling\" box and press Search. The text is matched against the 20 mood names first, then against a keyword list — \"stressed\" and \"ocean\" resolve to Calm, \"fire\" to Energetic, \"rain\" to Sad, \"moon\" to Dreamy, \"rich\" to Luxury. It is a keyword matcher rather than an AI model, and it falls back to Happy when nothing matches.",
    ],
    [
      "How many moods and styles does it have?",
      "20 moods and 9 aesthetic styles. Ten moods appear as buttons — Happy, Calm, Sad, Romantic, Energetic, Focused, Dreamy, Lonely, Creative and Angry — and the other ten (Relaxed, Nostalgic, Luxury, Nature, Futuristic, Cozy, Dark, Peaceful, Confident, Emotional) are reached by typing the name into the search box. The styles are Soft Pastel, Vibrant, Dark Mode, Minimal, Cinematic, Neon, Earthy, Retro and Cyberpunk.",
    ],
    [
      "Can I export the palette to CSS or Tailwind?",
      "Yes. Copy CSS custom properties running from --color-primary to --color-decor-3, copy a Tailwind module.exports block for theme.extend.colors, or download palette-schema.json with the mood, style and each color's hex, RGB and HSL values. The JSON file is assembled in the browser as a Blob, so nothing is sent to a server.",
    ],
    [
      "Why does the palette change every time I press Generate?",
      "Each color is drawn at random from inside the mood's hue range and the style's saturation and lightness bands, so no two runs match even on identical settings. Lock the swatches you want to keep and only the unlocked ones get redrawn.",
    ],
    [
      "Is this mood palette generator free?",
      "Yes — free, with no signup. The mood mapping, the HSL-to-hex conversion and the export files are all JavaScript executing in your own browser; there is no backend request, so nothing you type or generate leaves your device.",
    ],
    [
      "Does it produce a dark mode palette?",
      "Yes. Choose the Dark Mode style and the background and text roles invert: background drops to 5–15% lightness while text rises to 85–95%, instead of the usual 90–98% background against 5–15% text. Dark Mode also holds the remaining colors at 10–30% saturation and 10–25% lightness.",
    ],
    [
      "What is the difference between the mood and the aesthetic style?",
      "The mood chooses the hue — which slice of the color wheel the palette comes from. The style chooses saturation and lightness — how vivid and how light those hues are. Creative (280–320°) in Neon at 90–100% saturation and the same mood in Earthy at 30–50% give you the same hue family at completely different intensities.",
    ],
  ],
  steps: [
    "Pick a mood from the buttons, or type a phrase like \"cozy evening by the fireplace\" into the Describe the Feeling box and press Search.",
    "Choose an aesthetic style — Vibrant, Neon, Soft Pastel, Dark Mode, Cyberpunk and four more — then press Generate Palette.",
    "Hover any swatch to copy its hex or lock it, then open the Export tab for CSS variables, a Tailwind config block, or the JSON download.",
  ],
};

export default seo;
