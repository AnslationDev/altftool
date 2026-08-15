const seo = {
  title: "CSS Filter Generator with Live Before/After",
  metaDescription:
    "Tune blur, brightness, contrast, grayscale, hue-rotate and more on an image, compare with a draggable split, and copy only the CSS values you changed.",
  intro:
    "CSS Filter Effects builds a `filter` declaration from nine standard filter functions — blur, brightness, contrast, grayscale, hue-rotate, invert, opacity, saturate and sepia — and previews the result live on an image with a draggable before-and-after split. It is for front-end developers and designers tuning an image treatment who want the exact CSS rather than an exported bitmap. Only the values you actually change are written into the output, so the declaration stays as short as the effect requires.",
  useCases: [
    "You want product photos on a listing page desaturated until hover, and you need the grayscale value that looks right without over-flattening the image.",
    "A hero image is too bright behind white text, so you dial brightness and contrast down and drag the split slider to compare against the original at the same moment.",
    "You are building a duotone-ish treatment with sepia plus hue-rotate and need the two functions in the correct order in a single filter value.",
  ],
  benefits: [
    [
      "Split-screen before and after",
      "A draggable divider shows filtered and unfiltered halves of the same image side by side, which is the only reliable way to judge a subtle contrast or saturation change.",
    ],
    [
      "Emits only the functions you changed",
      "Values still at their neutral defaults are omitted, so you get `filter: grayscale(80%);` instead of a long chain of no-op functions, and `none` when nothing is applied.",
    ],
    [
      "Test on your own image",
      "Upload any image and it is read locally as a data URL for the preview, so you can tune the filter against the actual asset rather than a stock sample.",
    ],
  ],
  faqs: [
    [
      "Which CSS filter functions can I adjust?",
      "Nine: blur (0–20px), brightness (0–200%), contrast (0–200%), grayscale (0–100%), hue-rotate (0–360deg), invert (0–100%), opacity (0–100%), saturate (0–200%) and sepia (0–100%). All nine are standard CSS filter functions supported across current browsers.",
    ],
    [
      "Does the order of filter functions matter?",
      "Yes — filters are applied left to right, so `grayscale(100%) sepia(100%)` and `sepia(100%) grayscale(100%)` produce different images. The generator always writes them in a fixed order so the value you copy reproduces exactly what the preview showed.",
    ],
    [
      "Does this change my actual image file?",
      "No. It produces a CSS rule that the browser applies at render time; the underlying image file is untouched. That means the same asset can be reused with different filters, but also that anyone can view the original by disabling the style.",
    ],
    [
      "Is my uploaded image sent to a server?",
      "No. The file is read in the browser with FileReader and turned into a data URL used only for the on-page preview, so it never leaves your device.",
    ],
  ],
};

export default seo;
