const seo = {
  title: "Virtual Glasses Try-On — Free Online Photo Tool",
  h1: "Virtual Glasses Try-On",
  metaDescription:
    "Try on 20 glasses styles — aviator, wayfarer, cat-eye, rimless — on your own photo. Face landmarks are detected in your browser; nothing is uploaded.",
  intro:
    "The Glasses Try-On tool places 20 frame styles onto a photo of your face using the face-api.js TinyFaceDetector (416px input, 0.4 score threshold) and its 68-point facial landmark model, both running on TensorFlow.js in your browser. From those landmarks it measures your eye centres and interpupillary distance — lens width is set to 0.95 × the eye distance — and estimates head pose (roll from the eye line, yaw from nose deviation, pitch from forehead-to-chin compression) so the frames rotate and foreshorten with your head instead of sitting flat on top of the image. The frames themselves are drawn as Canvas 2D vector paths on a separate layer, then feathered and composited with a soft contact shadow on the nose and cheeks. The detection models are static files served from this site, and your photo is only ever read into a local canvas — it is never uploaded to a server.",
  useCases: [
    "Compare frame shapes before ordering eyewear online — put aviator, wayfarer, cat-eye and round on the exact same photo and flip between them.",
    "See how a frame colour and lens tint combination reads on your face: black, silver, gold, brown, white or transparent frames with clear, black, transparent, blue, brown, green, grey or purple lens fills.",
    "Make profile pictures and social images with tinted or gradient lenses, then export at up to 4K and share straight from your phone.",
  ],
  benefits: [
    [
      "Your photo stays on your device",
      "Face detection and frame rendering both happen in the browser through TensorFlow.js and the Canvas 2D API. The model weights download from this site as static files; the image itself is read from a local object URL and never sent anywhere.",
    ],
    [
      "Frames scaled to your actual eye spacing",
      "Rather than pasting a fixed PNG, the renderer sizes every frame from the measured distance between your detected eye centres and bends it with estimated head roll, yaw and pitch, so the fit tracks your face geometry.",
    ],
    [
      "20 styles with full manual control",
      "Classic, retro, fashion, minimal, sports and sunglasses categories, six frame colours, eight lens tints, and six sliders for scale, frame width, lens height, bridge width, lens tint and rotation.",
    ],
    [
      "Before/after and 4K export",
      "A drag slider wipes between the original and the result. Downloads are upscaled toward a 3840px longest side and saved as PNG or JPEG at 0.95 quality, with Web Share support where the browser offers it.",
    ],
  ],
  faqs: [
    [
      "Can I try on glasses virtually with a photo?",
      "Yes — upload any front-facing photo and the tool detects your face, then draws the frame onto it. It works from a still image: drag and drop a file, paste from the clipboard, or press Camera to capture a frame from your webcam. It is not a live AR video overlay; you fit the glasses to one captured photo at a time.",
    ],
    [
      "Which glasses styles can I try on?",
      "There are 20: rectangle, square, round, oval, aviator, wayfarer, cat-eye, clubmaster, rimless, half-rim, sports, reading, luxury, fashion, gaming, blue light, sunglasses, oversized, retro and kids. They are grouped into Classic, Retro, Fashion, Minimal, Sports and Sunglasses filters, and Wayfarer is loaded by default.",
    ],
    [
      "Is my photo uploaded to a server?",
      "No. The face-api.js models are fetched once as static files from this site, and inference plus all canvas rendering run locally in your browser. Your image is never transmitted, and nothing is stored server-side.",
    ],
    [
      "Why does it say no face detected?",
      "The TinyFaceDetector needs a face it can score above 0.4 confidence at a 416px detection size, so a small, blurry, heavily shadowed, steeply angled or partially covered face will fail. Use a well-lit, roughly front-facing photo where the head fills a decent share of the frame, then retry.",
    ],
    [
      "Does it work on a group photo with several people?",
      "Yes. When more than one face is detected the tool shows a face picker over the photo so you can choose which person gets the glasses. Frames are then fitted to that single selected face.",
    ],
    [
      "What image formats and file sizes are accepted?",
      "JPG, PNG, WEBP and HEIC/HEIF files up to 20MB. Results download as PNG or as JPEG at 0.95 quality, upscaled toward a 3840px longest side (up to 4x) so the export stays sharp.",
    ],
    [
      "Can I adjust how the glasses sit on my face?",
      "Yes — six sliders control the fit: Scale 50–150, Frame Width 20–100, Height 20–100, Bridge 20–100, Lens Tint 0–100 and Rotation 160–200 (180 is level). Every change re-renders the preview immediately.",
    ],
    [
      "Is the glasses try-on free and does it need an account?",
      "It is free and requires no signup. Open the page, add a photo, and use every style, colour and export option without registering.",
    ],
  ],
  steps: [
    "Add your photo: drag and drop it, click to browse, paste from the clipboard, or press Camera to capture a shot with your webcam (JPG, PNG, WEBP or HEIC, up to 20MB). The face models load and detection runs automatically; if several faces are found, tap the one you want.",
    "Pick a category and style from the 20 frames, then choose a frame colour and lens tint. The preview re-renders on every click, with a before/after slider to wipe back to the original photo.",
    "Fine-tune scale, frame width, height, bridge, lens tint and rotation with the sliders, then hit Download PNG or Download JPG — or Share to send the result straight from your device.",
  ],
};

export default seo;
