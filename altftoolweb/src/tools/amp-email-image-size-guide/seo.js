const seo = {
  intro:
    "AMP Email Image Size Guide turns a placement in your email column into the three numbers you actually need: the CSS display size, the source pixel size to export for retina screens, and an estimated file weight per format. It also builds the matching amp-img tag — AMP for Email forbids plain img and requires width, height and a layout attribute — and tracks the 200 KB ceiling Gmail places on the AMP part of a message. Weight figures are planning estimates from typical bytes-per-pixel rates, not encoder output.",
  useCases: [
    "Size a full-width hero for a 600 px email column and export it correctly for 2x displays.",
    "Decide whether a product grid should ship as JPEG or WebP by comparing estimated weights side by side.",
    "Check that an AMP part with inline CSS and a base64 logo still fits inside 200 KB.",
    "Get the right layout attribute for a header logo that must not scale up beyond its natural size.",
  ],
  benefits: [
    ["Correct amp-img output", "Emits width, height and layout in the form AMP validates, including responsive's aspect-ratio behaviour."],
    ["Budget aware", "Tracks the 200 KB AMP part limit and the 75 KB amp-custom CSS cap as you change inputs."],
    ["Format comparison", "Shows the same image at AVIF, WebP, JPEG, PNG and GIF, with base64 overhead alongside."],
  ],
  faqs: [
    [
      "What is the size limit for an AMP email?",
      "The AMP HTML part must be under 200 KB in Gmail; larger messages fall back to the plain HTML part. Inline styles in <style amp-custom> are separately capped at 75 KB. Images referenced by HTTPS URL do not count towards the 200 KB, but base64 data URIs do.",
    ],
    [
      "What image size should I use in an AMP email?",
      "Design to a 600 px content column and export at twice the display width for retina screens — so a full-width hero is 1200 px wide. Going past 2x roughly doubles the pixel count again for a difference few readers can see on a phone.",
    ],
    [
      "Can I use img instead of amp-img in AMP for Email?",
      "No. AMP for Email replaces <img> with <amp-img>, which requires an explicit width, height and layout attribute. Use layout=\"responsive\" for images that fill the column, \"fixed\" for exact pixel boxes and \"intrinsic\" for logos that must not be enlarged.",
    ],
    [
      "Should email images be WebP or JPEG?",
      "JPEG remains the safe default because decoder support across mail clients is uneven. WebP is roughly 30% smaller at similar quality and AVIF smaller still, so serve them through a content-negotiating CDN and keep a JPEG for the fallback HTML part.",
    ],
  ],
};

export default seo;
