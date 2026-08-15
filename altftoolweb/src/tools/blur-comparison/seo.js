const seo = {
  title: "Image Blur Comparison Slider — Preview CSS blur() 1–100px",
  metaDescription:
    "Drag a split line to compare a photo against a 1–100px CSS Gaussian blur, then export the blurred version as a PNG at full native resolution.",
  intro:
    "Blur Comparison applies the CSS Gaussian blur filter to an image at a radius you choose from 1 to 100 pixels and splits the view down a draggable line, so the sharp original and the blurred version sit side by side in the same frame. It is for anyone who has to pick a blur strength by eye rather than by guessing a number — designers testing a background, or someone obscuring a detail in a screenshot. The chosen radius exports as a PNG rendered at the image's full native resolution.",
  useCases: [
    "You are building a frosted-glass header and need to know whether the CSS blur radius should be 8px or 20px before you type it into a stylesheet.",
    "You want to blur a car number plate or a name badge out of a photo before posting it, and you need to check the detail is genuinely unreadable rather than just softened.",
    "You are choosing a background image for a title slide and want to see how much blur it takes before the overlaid text becomes comfortably legible.",
  ],
  benefits: [
    [
      "Blurred and sharp in one frame",
      "The split slider puts the two states edge to edge on the same picture, which reads the difference far more accurately than toggling back and forth.",
    ],
    [
      "The radius is the CSS value",
      "The intensity you settle on is the same number you paste into a filter: blur() rule, with no conversion or guesswork.",
    ],
    [
      "Exports at native resolution",
      "The download re-renders the blur onto a canvas at the image's original pixel dimensions instead of saving the on-screen preview.",
    ],
  ],
  faqs: [
    [
      "What blur radius should I use to hide sensitive text?",
      "There is no single safe number — it depends on how large the text is in the image, so drag the slider until the characters are unrecoverable rather than trusting a preset. The Heavy preset here is 40px against a 1 to 100px range, and for anything genuinely sensitive a solid box or pixelation is safer than blur, because blur is a reversible mathematical operation in principle.",
    ],
    [
      "Does the blur value match CSS filter: blur()?",
      "Yes. The preview applies the standard CSS filter blur() with the pixel radius shown on the slider, so setting 12px here and writing filter: blur(12px) in your stylesheet produces the same Gaussian falloff. The presets map to 5px for Subtle, 15px for Medium and 40px for Heavy.",
    ],
    [
      "Will the downloaded image be the same size as the one I uploaded?",
      "Yes, the export draws to a canvas sized to the image's natural width and height, so a 4000 x 3000 photo comes back at 4000 x 3000 as a PNG. Only the blurred version is exported; the original is untouched on your device.",
    ],
    [
      "Can I compare more than two blur levels at once?",
      "Not simultaneously — the split view compares exactly one blur radius against the untouched original. To weigh two candidate radii against each other, export each one and compare the two files, or step the slider between them while watching the same region of the image.",
    ],
  ],
};

export default seo;
