const seo = {
  title: "Hair Color Preview: Try 16 Shades on Your Photo",
  metaDescription:
    "Upload a photo and preview 16 hair colours — natural, blonde and fashion shades — with a before/after slider. Runs in your browser; download as PNG.",
  steps: [
    "Upload a clear front-facing photo — drag and drop or click to browse; the uploader accepts any image file your browser can read (accept=image/*).",
    "Open the Color Palette panel and click one of the 16 swatches, grouped under the Natural, Warm, Blonde, Fashion and Highlight families.",
    "Drag the before/after slider to compare with the original, then click 'Download' to save the preview as a PNG named after the shade, e.g. copper-red.png.",
  ],
  intro:
    "This tool recolours the hair in a photo you upload so you can see a shade on your own face before you commit to the dye. It works on the dark pixels in the upper part of the picture — anything whose BT.601 luminance falls below the threshold gets blended 70% toward the chosen shade — and offers 16 named colours grouped into Natural, Warm, Blonde, Fashion and Highlight families. A before-and-after slider lets you drag between the original and the preview, and the result downloads as a PNG.",
  useCases: [
    "You have a salon appointment booked and want to see copper red against your own skin tone before describing it to the colourist",
    "You are deciding between platinum and ash blonde and want the two previews side by side rather than judging from a swatch card",
    "You are curious about a fashion shade like lilac or ocean blue but do not want to bleach your hair to find out",
  ],
  benefits: [
    [
      "Drag-to-compare, not two windows",
      "The before-and-after slider wipes between the original photo and the recoloured one on the same frame.",
    ],
    [
      "Shades grouped by family",
      "Natural, Warm, Blonde, Fashion and Highlight sections collapse independently, so you can compare within one family at a time.",
    ],
    [
      "The photo never leaves the device",
      "Recolouring happens on a canvas in your own browser and the PNG is written locally, so no image is uploaded.",
    ],
  ],
  faqs: [
    [
      "How many hair colours can I try?",
      "16 named shades, split across five families: Natural (jet black through light brown), Warm (auburn, copper red, mahogany), Blonde (golden, platinum, ash), Fashion (rose gold, pastel pink, lilac, ocean blue) and Highlight (caramel, honey).",
    ],
    [
      "What kind of photo works best?",
      "A well-lit, front-facing head-and-shoulders shot with the hair in the top portion of the frame and a background lighter than the hair. The recolour targets dark pixels in the upper third of the image, so a dark background, a hat, or hair that sits low in the frame will give a poor result.",
    ],
    [
      "Will the preview match what the dye actually does?",
      "No — treat it as a look test, not a colour prediction. The preview blends the shade at 70% strength over your existing tone, whereas real dye results depend on your starting level, whether the hair is pre-lightened, and its porosity. Ask your colourist before booking anything drastic.",
    ],
    [
      "Can I save the result?",
      "Yes. Once a shade is applied, the download button writes the recoloured image as a PNG named after the shade, generated in the browser from the canvas.",
    ],
  ],
};

export default seo;
