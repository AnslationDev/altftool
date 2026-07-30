const seo = {
  title: "LinkedIn Photo Maker & #OpenToWork Frame",
  h1: "LinkedIn Profile Photo Generator",
  metaDescription:
    "Crop, zoom and frame a circular 400×400 LinkedIn profile photo, add an #OpenToWork, #Hiring or #Looking banner, and download a PNG. Free, runs in-browser.",
  intro:
    "The LinkedIn Profile Photo Generator turns a JPG, PNG or WebP into a framed 400 × 400 circular display picture using the HTML5 Canvas 2D API. Your file is read with URL.createObjectURL and drawn into a canvas that is clipped to a 200 px radius circle, cover-fitted by scaling the image by 400 ÷ its shorter side and then multiplying by your zoom setting. Brightness, contrast and saturation are applied through the canvas `ctx.filter` property rather than per-pixel loops, and the banner is stroked as a 70 px-wide arc across the lower-left of the circle. The export is a `canvas.toDataURL(\"image/png\")` download — there is no upload endpoint or API call anywhere in the code, so the photo never leaves your device.",
  useCases: [
    "Adding an #OpenToWork, #Hiring or #Looking banner to your display picture as a baked-in graphic, so it shows anywhere the photo appears",
    "Cropping a wider shot — a group photo, an event picture, a phone snap — down to a centred circular headshot at the right zoom and position",
    "Giving a whole team matching profile photos by applying the same border ring colour and background fill to every person's picture",
  ],
  benefits: [
    [
      "Nothing is uploaded",
      "The photo is read locally with URL.createObjectURL and drawn straight into a <canvas> element. There is no server round-trip, no account and no storage in the code — closing the tab discards everything.",
    ],
    [
      "The preview is the export",
      "LinkedIn displays profile photos as circles. The canvas clips to a 200 px radius circle before drawing, so the circular preview on screen is pixel-for-pixel what the downloaded PNG contains — no surprise crop after you upload it.",
    ],
    [
      "Non-destructive editing",
      "Every slider redraws the full canvas from the original image object, so zoom, brightness, contrast, saturation, border and banner changes never stack or compound quality loss. Reset Edits restores all defaults in one click.",
    ],
    [
      "Banner colours built in",
      "#OpenToWork renders in green (#22c55e), #Hiring in purple (#8b5cf6) and #Looking in blue (#3b82f6), each as a 70 px arc with bold white text — no manual overlay file or image editor needed.",
    ],
  ],
  faqs: [
    [
      "How do I add an #OpenToWork banner to my LinkedIn photo?",
      "Upload your photo, then choose \"#OpenToWork (Green)\" from the Overlay Banner dropdown. The tool strokes a 70 px-wide green (#22c55e) arc across the lower-left of the circle with bold white text and bakes it into the PNG you download. This is a graphic burned into the image itself, not LinkedIn's own Open To Work setting — you set that separately inside LinkedIn if you also want the official frame.",
    ],
    [
      "Is this LinkedIn profile photo generator free?",
      "Yes — it is free with no account, no sign-up and no watermark. The page loads a canvas editor in your browser; there is no paywall, credit system or export limit in the code.",
    ],
    [
      "Are my photos uploaded to a server?",
      "No. The file is turned into a local blob URL with URL.createObjectURL and drawn directly to a canvas element in your browser. There is no fetch, upload or third-party API call in this tool's source, so the image never leaves your device and nothing is stored.",
    ],
    [
      "Does this tool use AI to generate a professional headshot?",
      "No — it is a canvas editor, not a generative model. It crops, zooms, colour-adjusts and frames the photo you supply. It will not change your face, swap your clothing or replace the background behind you, so start with a well-lit photo of yourself.",
    ],
    [
      "What size and format does it export?",
      "Every export is a 400 × 400 pixel PNG named linkedin-profile-photo.png — the canvas size is fixed at 400 in the code. PNG is used so transparency is preserved when you leave the background set to Transparent.",
    ],
    [
      "How do I get a transparent background around the circle?",
      "Leave Background Fill on \"Transparent\", which is the default — the circular clip keeps the corners outside the circle fully transparent in the exported PNG. If you pick any solid option — White, LinkedIn Blue (#0a66c2), Professional Teal (#14b8a6), Dark Slate (#0f172a) or Muted Gray (#f3f4f6) — the fill covers the whole 400 × 400 square, corners included.",
    ],
    [
      "Can I add a coloured ring or border around my LinkedIn photo?",
      "Yes. Drag the Border Ring Thickness slider from 0 to 30 px and a colour picker appears, defaulting to LinkedIn blue (#0a66c2) but accepting any hex value. The ring is stroked at a radius of 200 minus half the border width, so it sits just inside the circle's edge and is never clipped off.",
    ],
    [
      "How do I zoom and reposition my face in the frame?",
      "Drag the image itself with a mouse or finger to pan it, and use the Zoom slider from 10% to 300%. The photo is cover-fitted first — scaled by 400 ÷ its shorter side — so 100% already fills the circle. Going above 100% upscales, so use a source image at least 400 px on its shorter side to avoid softness. Brightness, contrast and saturation can each be adjusted from 0% to 200%.",
    ],
  ],
  steps: [
    "Upload your photo — drag a JPG, PNG or WebP onto the circular drop zone or click it to pick a file. The image loads straight into the 400 × 400 canvas and is cover-fitted to fill the circle.",
    "Frame and style it — drag the image to pan, set Zoom between 10% and 300%, adjust Brightness, Contrast and Saturation (0–200% each), then choose a border ring thickness and colour, a background fill, and an optional #OpenToWork, #Hiring or #Looking banner.",
    "Click Download DP — the canvas is exported with toDataURL as linkedin-profile-photo.png at 400 × 400, ready to upload as your LinkedIn profile picture.",
  ],
};

export default seo;
