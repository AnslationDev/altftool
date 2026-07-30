const seo = {
  title: "Color Palette from Image — Hex Code Extractor",
  h1: "Color Palette from Image",
  metaDescription:
    "Upload a photo and pull its eight most dominant colors as copy-ready hex codes. It all runs on a canvas in your browser — the image is never uploaded.",
  intro:
    "Color Palette from Image reads the dominant colors out of a photo using the browser's own Canvas 2D API — there is no third-party color library and no server behind it. Your picture is drawn into a 96×96 offscreen canvas, then getImageData walks the pixel buffer sampling every fourth pixel (2,304 samples in total), and each red, green and blue channel is rounded to the nearest multiple of 32, which drops every sample into one of 729 color buckets. The eight buckets holding the most pixels become your palette, ordered by how much of the image they cover, and clicking a swatch copies its hex code. The file is loaded with URL.createObjectURL and decoded on your own device, so it is never uploaded anywhere.",
  useCases: [
    "Pull the working brand colors out of a logo or screenshot when nobody can find the original style guide.",
    "Turn a photograph into a starting set of hex codes for a website hero, slide deck, or social template.",
    "Sample the dominant tones from a reference shot or mood board and paste them straight into Figma or CSS.",
  ],
  benefits: [
    [
      "Ranked by coverage, not by taste",
      "Swatches are ordered by how many sampled pixels landed in each bucket, so the first swatch really is the color that covers most of the image.",
    ],
    [
      "Click a swatch, get the hex",
      "Each swatch copies its uppercase hex to the clipboard through the Clipboard API, with a textarea fallback for older browsers, and flashes a short confirmation.",
    ],
    [
      "The image never leaves the tab",
      "The file is read with URL.createObjectURL and decoded on a local canvas — no upload request, no account, no stored copy.",
    ],
    [
      "Same speed on any file size",
      "Analysis always runs on the same 9,216-pixel canvas, so a 40-megapixel photo costs the same 2,304-sample pass as a small screenshot.",
    ],
  ],
  faqs: [
    [
      "How do I get a color palette from an image?",
      "Upload the image — there is no button to press afterwards. The tool draws your picture onto a 96×96 canvas, samples every fourth pixel, groups those samples into color buckets by rounding each RGB channel to the nearest 32, and displays the eight buckets that hold the most pixels. Click any swatch to copy its hex code.",
    ],
    [
      "How many colors does it extract from a photo?",
      "Eight. The tool keeps the top eight buckets by pixel count and shows them as swatches. Before you upload anything, four placeholder swatches (#2563EB, #14B8A6, #F97316, #111827) sit in the panel so you can see the layout.",
    ],
    [
      "Why doesn't the hex code exactly match the color in my photo?",
      "Because the values are snapped to a grid. Each channel is rounded to the nearest multiple of 32, so every extracted component is 00, 20, 40, 60, 80, A0, C0, E0 or FF in hex. That is deliberate — it merges near-identical shades into one swatch instead of returning eight versions of the same blue — but it means each hex is a close neighbour of the source color rather than a pixel-perfect eyedropper reading. Use a dedicated color picker if you need the exact pixel value.",
    ],
    [
      "Are my images uploaded to a server?",
      "No. The file is turned into a local blob URL with URL.createObjectURL, decoded by an image element, and read back from a canvas in the same browser tab. No network request carries the image, nothing is stored, and closing the tab discards it.",
    ],
    [
      "Is this color palette generator free?",
      "Yes — free, with no sign-in and no per-day cap. The page loads without an account and the extraction runs on your own device, so there is nothing to meter or bill.",
    ],
    [
      "What image formats can I upload?",
      "PNG, JPG and WebP are what the upload panel lists, and the file input accepts any image type your browser can decode, which usually also covers GIF, BMP and AVIF. Transparency is handled properly: pixels with an alpha value below 128 are skipped, so a logo on a transparent background returns the logo's colors instead of a swatch of empty space.",
    ],
    [
      "Can I download the palette as a file, CSS, or ASE swatch?",
      "No — the only export is click-to-copy. Each swatch copies its own uppercase hex code to your clipboard, one at a time; there is no ASE, JSON, PNG or CSS download.",
    ],
    [
      "Why are all eight colors so similar to each other?",
      "Because ranking is purely by pixel count — nothing forces the swatches apart or generates complementary colors. An image dominated by sky, skin tone, or a single flat background will fill several slots with near-neighbours of the same hue. Cropping to the region you actually care about before uploading gives a far more varied palette.",
    ],
  ],
  steps: [
    "Click the upload panel and pick a PNG, JPG, or WebP image from your device.",
    "The palette panel fills with the eight most common colors as soon as the image finishes decoding.",
    "Click any swatch to copy its hex code, then paste it into your CSS, design file, or brand doc.",
  ],
};

export default seo;
