const seo = {
  title: "Instagram DP Maker: Circle Crop & Story Ring",
  metaDescription:
    "Crop any photo to Instagram's circle at 1080x1080, add the orange-to-purple ring plus 8 filters, and export a PNG — all in your browser.",
  steps: [
    "Drop your photo on the upload area or click to upload (JPG, PNG, WebP) — it is drawn into a circle on the 1080 x 1080 canvas.",
    "Frame it with the Zoom (50-250%), X Offset and Y Offset sliders, pick one of the eight Filters (Normal through Clarendon, Moon and Crema), adjust Brightness, Contrast and Saturation, and choose a Story Ring such as IG Classic.",
    "Press Download to save the finished picture as instagram-dp-enhanced.png; Reset restores the default settings.",
  ],
  intro:
    "Instagram DP Enhancer crops any photo to a circle on a 1080 x 1080 canvas, applies a filter and manual brightness, contrast and saturation adjustments, then rings it with a gradient border — including the orange-to-purple Instagram ring — and exports a PNG. You control zoom and horizontal and vertical position so your face lands inside the circle instead of being cut by an automatic centre crop. Everything is drawn on a canvas in your browser, so the photo is never uploaded.",
  useCases: [
    "Your profile photo looks fine in the gallery but Instagram's circular crop cuts off the top of your head — nudge the vertical offset and zoom until the framing works inside the circle before you upload.",
    "You want the story-ring look permanently baked into your DP, so the gradient border shows even when you have no active story.",
    "A group of admins or a small brand needs matching profile pictures: apply the same border and filter to each person's headshot for a consistent grid of avatars.",
  ],
  benefits: [
    ["Crops to the circle you will actually see", "The image is clipped to a circle inscribed in the 1080 px square, so what you frame in the preview is exactly what Instagram displays."],
    ["Filter presets and sliders stack", "The eight presets — Clarendon, Gingham, Moon, Lark, Reyes, Juno, Crema and Normal — are applied on top of your own brightness, contrast and saturation values rather than replacing them."],
    ["Borders keep the white gap", "Each gradient ring is drawn with a 15 px white inner gap, which is what makes the border read as a ring rather than a coloured outline."],
  ],
  faqs: [
    [
      "What size should an Instagram profile picture be?",
      "Upload at 1080 x 1080 pixels. Instagram displays the profile photo far smaller — around 320 px on the app and 110 px in some places — but supplying the larger square gives the app room to downscale cleanly instead of blowing up a small file.",
    ],
    [
      "Why does Instagram cut off part of my profile picture?",
      "Because the app crops your square image to a circle, so anything in the corners is lost. Roughly 21% of a square's area sits outside its inscribed circle, which is why chins, hats and shoulders disappear — this tool shows the circular crop while you position the photo.",
    ],
    [
      "Can I add the Instagram gradient ring to my DP?",
      "Yes. The IG Classic border draws the familiar orange-to-purple gradient (#f09433 through #bc1888) as a 30 px ring with a white gap inside it, so the ring is part of the image itself and stays visible whether or not you have posted a story.",
    ],
    [
      "Is my photo uploaded to a server?",
      "No. The image is read from your device, drawn to a canvas and exported as a PNG entirely in the browser — nothing leaves your machine, which matters for a face photo you have not published yet.",
    ],
  ],
};

export default seo;
