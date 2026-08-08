const seo = {
  title: "Profile Picture Background Changer: 22 Presets",
  metaDescription:
    "Cuts you out with an in-browser model and drops you on 22 backdrops — solid, gradient or blurred scene. Export PNG, JPG, WebP or a circle crop.",
  steps: [
    "Drop a portrait on the Upload your profile picture box or click to browse — PNG, JPG or WEBP up to 15MB — and the background is removed in the browser.",
    "Under Choose Background pick a colour, gradient or scene preset such as Office Blur, Studio or Beach, use Choose Color for a custom shade, or upload your own image as the backdrop.",
    "Open Download and save profile-picture.png, .jpg or .webp, take the Circle Crop (PNG), or use the platform sizes — LinkedIn (400×400), Twitter (400×400), Instagram (320×320), Facebook (180×180).",
  ],
  intro:
    "This tool cuts the subject out of a profile photo with an in-browser AI segmentation model, then composites them onto a solid colour, gradient, scene or your own uploaded image and centre-crops the result to a square. Twenty-two presets are built in — ten solid colours from white and light grey through teal, navy and charcoal, six gradients, and six blurred scenes including office, studio and beach. It is for anyone who needs a clean headshot for LinkedIn, a work directory or a conference bio and does not have a plain wall to stand against.",
  useCases: [
    "You have one decent photo of yourself but the kitchen is visible behind you, and the company directory wants a neutral background.",
    "Swapping a busy holiday snap onto a plain light-grey backdrop so your headshot matches the rest of the team page.",
    "Producing the same portrait on white for a CV, on the brand's teal for a conference speaker card, and circle-cropped for a chat avatar.",
  ],
  benefits: [
    ["Cut-out runs on your machine", "The segmentation model is loaded into the browser and the photo is never sent to a background-removal service."],
    ["Backgrounds you can actually use", "Presets are chosen for portraits — neutral greys, corporate blues and soft gradients — rather than novelty effects, and you can drop in your own image."],
    ["Exports at the sizes platforms want", "One-click exports at 400x400 for LinkedIn and Twitter, 320x320 for Instagram and 180x180 for Facebook, plus a transparent circle-crop PNG."],
  ],
  faqs: [
    [
      "How big a photo can I upload?",
      "Up to 15 MB, in any format the browser can decode — JPEG, PNG, WebP and HEIC on supported devices. Larger files are rejected before processing starts.",
    ],
    [
      "Which format should I download?",
      "PNG if the background is transparent or you want no compression artefacts around hair, JPG if you need the smallest file for an upload limit, and WebP for a middle ground. There is also a dedicated circle-crop PNG for platforms that mask avatars into a circle.",
    ],
    [
      "Why does the cut-out look rough around my hair or glasses?",
      "Segmentation struggles where the subject and background have similar brightness or where edges are fine and semi-transparent. Even, front-on lighting and a background that contrasts with your hair colour produce a noticeably cleaner mask than a backlit shot.",
    ],
    [
      "Is my face uploaded to a server?",
      "No. Both the background removal and the compositing onto the new background happen in your browser, using a canvas and a locally-run model, so the portrait stays on your device.",
    ],
  ],
};

export default seo;
