const seo = {
  intro:
    "This tool covers parts of a screenshot with solid black rectangles, a box blur or averaged pixelation, then flattens the result into a new PNG or JPEG so the hidden pixels no longer exist in the exported file. You draw, drag and resize regions over the image at its native resolution, set an effect strength from 4 to 40, and export — nothing is uploaded, which is the point when the thing you are hiding is an account number or a customer's name. Solid masks overwrite the area outright; blur and pixelate transform the original pixels and are weaker guarantees.",
  useCases: [
    "You are attaching a screenshot of a billing page to a support ticket and need the card details and account ID gone before it enters someone else's inbox",
    "You are writing a tutorial from your own dashboard and want colleague names, avatars and internal URLs covered without redoing the screenshots with dummy data",
    "You are posting a bug report publicly and need to hide an API key visible in a devtools panel while leaving the surrounding error message readable",
  ],
  benefits: [
    ["Redaction is baked into the export", "The image is redrawn on a canvas at full resolution and re-encoded, so there is no overlay layer for anyone to remove or read underneath."],
    ["Effect strength you can tune per region", "Pixelation averages blocks of your chosen size from 4 to 40 pixels and blur uses roughly half that as its radius, set separately for each rectangle."],
    ["It offers to find the busy areas", "An optional local pass scores a 12-by-10 grid for horizontal contrast edges and proposes up to six text-like regions — as suggestions to inspect, never as a substitute for looking."],
  ],
  faqs: [
    [
      "Is blur or pixelation safe for hiding a password or account number?",
      "No — use the solid mask for anything that must never be recovered. Blur and pixelation are reversible-in-principle transforms of the original pixels, and short strings in a known font have been recovered from weak pixelation, whereas a solid rectangle writes black over the area and destroys the data outright.",
    ],
    [
      "Does the exported file still contain the original hidden pixels?",
      "No. The export redraws the image onto a canvas with your regions applied and encodes a fresh PNG or JPEG (JPEG at quality 0.92), so the covered pixels are not present anywhere in the output. As a side effect, camera and capture metadata from the original file does not carry into the new file either.",
    ],
    [
      "How large an image can it handle?",
      "Up to 25 MB and 16 million pixels — roughly a 5000 x 3200 capture. Larger files are rejected rather than silently downscaled, because resizing a redaction target is exactly the kind of surprise you do not want in a privacy tool.",
    ],
    [
      "Should I trust the suggested regions?",
      "Treat them as a starting point only. The suggestion pass looks for high-contrast horizontal edges, which text usually produces, but it does not read anything and will miss low-contrast text, faces, logos and handwriting. Always zoom into the downloaded file and confirm every secret is covered before you share it.",
    ],
  ],
};

export default seo;
