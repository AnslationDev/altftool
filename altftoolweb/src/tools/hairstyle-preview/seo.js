const seo = {
  title: "Hairstyle Preview: Try On Cuts with Face Detection",
  metaDescription:
    "Face detection fits buzz cuts, fades, quiffs, wolf cuts and more on your photo in 15 colours - rendered in your browser, PNG/JPG export up to 3840 px.",
  steps: [
    "Add a JPG, PNG, WEBP or HEIC photo up to 20MB via 'Drop image here or click to browse', Paste, or Camera - face detection then runs on the photo automatically.",
    "Pick a cut from the Styles list, filtered by the All, Short, Medium, Long or Bald tabs; choose a Hair Color swatch and drag the Scale, Rotation, Thickness, Density and Length sliders - the preview re-renders on every change.",
    "Compare with the 'Before / After' slider, then press 'Download PNG' or 'Download JPG' to save hairstyle-preview.png or .jpg upscaled toward 3840 px, or 'Share' it.",
  ],
  intro:
    "This tool detects the face in a photo you upload, reads its landmarks and hairline, and draws one of 22 hairstyles onto the head so you can see the cut before you book it. Styles run from buzz cut, fade and crew cut through pompadour, quiff, undercut and curtains to long hair, wolf cut, mullet and man bun, plus a bald option, and each can be rendered in any of 15 colours. Sliders for scale, rotation, thickness, density, length, volume and shine let you fit the shape to your own head instead of accepting a fixed overlay.",
  useCases: [
    "You are thinking about going from long hair to a buzz cut and want to see the shape on your own head shape first",
    "You want to show a barber what you mean by a fade versus a French crop, with a picture rather than a description",
    "You are curious how you would look grey, silver or bald before deciding whether to stop dyeing",
  ],
  benefits: [
    [
      "Fitted to your detected face",
      "The style is placed from the detected hairline, eye line and jaw width rather than pasted at a fixed position.",
    ],
    [
      "Adjustable rather than fixed",
      "Ten sliders — including thickness, density, length, volume and shine — reshape the same style to sit correctly on your head.",
    ],
    [
      "High-resolution export",
      "Downloads are upscaled toward 3840 pixels on the long edge as PNG or JPEG, so the result survives being shared or printed.",
    ],
  ],
  faqs: [
    [
      "How many hairstyles can I try?",
      "22, grouped as short (buzz cut, fade, crew cut, French crop), medium (pompadour, quiff, undercut, side part, middle part, curtains, slick back, comb over, messy, spiky, curly, afro), long (long hair, wolf cut, mullet, man bun) and a bald option. Each can be recoloured from 15 shades including black, blonde, red, grey, silver and fashion colours.",
    ],
    [
      "What photo works best for face detection?",
      "A front-facing, evenly lit photo where the whole head including the area above the hairline is inside the frame. Detection reads eye, nose and jaw landmarks, so a strong side angle, sunglasses or a hat will make the fit drift.",
    ],
    [
      "It found the wrong person in a group photo — can I change it?",
      "Yes. When more than one face is detected a face selector appears and you pick which one to style; re-running detection on that index refits the hairstyle to the person you chose.",
    ],
    [
      "Is my photo uploaded to a server?",
      "No. Detection and rendering both run in the browser on a canvas, and the download is generated locally, so the image stays on your device.",
    ],
  ],
};

export default seo;
