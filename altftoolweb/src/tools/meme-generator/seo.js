const seo = {
  title: "Meme Generator — Free Meme Maker, No Watermark",
  h1: "Meme Generator",
  metaDescription:
    "Free meme generator — pick a template or upload your own image, drag text and emoji anywhere, and export a 3x-resolution PNG with no watermark.",
  intro:
    "The Meme Generator is a layer-based meme editor: the base image and every text or emoji caption live as separately positioned elements you drag with a mouse or a finger, stored as percentage coordinates so they stay put at any canvas size. Pressing Export rasterizes that live preview with html2canvas at scale 3 and downloads it as a PNG — three times the on-screen preview resolution, with nothing stamped on it. Images you upload are read locally by your browser's FileReader and held in the page rather than sent anywhere; the four built-in templates (Drake, Expanding Brain, Distracted Boyfriend, Batman Slap) load from imgflip's image CDN.",
  useCases: [
    "Captioning a classic template — Drake, Expanding Brain, Distracted Boyfriend or Batman Slap — for a group chat or a social post",
    "Turning your own screenshot or photo into a meme with Impact-style text, exported at 1:1, 9:16 or 16:9 so nothing gets cropped by the platform",
    "Stacking several captions and emoji stickers exactly where you want them, saving the result as a draft to finish later",
  ],
  benefits: [
    [
      "Drag-anywhere text and emoji layers",
      "Each caption is its own layer you drag by mouse or touch, with font size from 10 to 250 px, five font families (Impact, Arial, Comic Sans, Georgia, Courier) and a full colour picker. Thirteen emoji stickers drop in as layers too.",
    ],
    [
      "3x-resolution PNG, no watermark",
      "Export renders the canvas through html2canvas at scale 3 and downloads a plain PNG — no watermark, no branding, no export limit.",
    ],
    [
      "Social aspect presets",
      "Switch the canvas between auto, 1:1 post, 9:16 story and 16:9 before you place text, so your captions sit correctly for the platform you're posting to.",
    ],
    [
      "Uploads stay on your device",
      "An uploaded image is read with FileReader and never sent to a server, and up to 10 drafts are saved in your own browser's localStorage.",
    ],
  ],
  faqs: [
    [
      "How do I make a meme with Impact font?",
      "Add a text layer — Impact is already the default font for new text. Set the size anywhere from 10 to 250 px, pick a fill colour, then drag the caption to the top, bottom or anywhere else on the image.",
    ],
    [
      "Does this meme generator add a watermark?",
      "No. Export writes a plain PNG of your canvas at three times the preview resolution, with nothing overlaid on it and no cap on how many memes you export.",
    ],
    [
      "Are my uploaded images sent to a server?",
      "No. An uploaded image is read locally by your browser's FileReader and stays in the page. The only network request the editor makes is fetching one of the four built-in templates from imgflip's CDN, and saved drafts go into your browser's localStorage, not to us.",
    ],
    [
      "What meme templates are included?",
      "Four built-ins: Drake, Expanding Brain, Distracted Boyfriend and Batman Slapping Robin. For anything else, upload your own image — any image format your browser can display works, including screenshots and photos.",
    ],
    [
      "Can I make memes on my phone?",
      "Yes. Layers respond to touch events as well as mouse, so you drag captions and emoji with your finger, and the editor collapses to a single column on small screens.",
    ],
    [
      "What does the Remove BG button actually do?",
      "It is a white-key, not an AI cutout. The tool reads the image pixel by pixel on a canvas and sets any pixel above 230 in all three RGB channels to fully transparent. That cleanly clears white and near-white backgrounds, but it will also punch holes in bright areas of a photo.",
    ],
    [
      "Can I undo a change?",
      "Yes — Undo steps back through the last 20 layer snapshots, covering text edits, added or deleted layers, and Clear. Dragging a layer is not snapshotted, so Undo will not reverse a move.",
    ],
    [
      "What size and file format is the exported meme?",
      "A PNG at three times the on-screen preview size, named memeStudio- followed by a timestamp. Choose a Studio Layout preset (1:1, 9:16 or 16:9) before exporting if you need a specific shape.",
    ],
  ],
  steps: [
    "Pick one of the four templates or upload your own image, then choose an aspect preset — Default, 1:1, 9:16 or 16:9.",
    "Add text or emoji layers, drag them into position, and set the font, size and colour; adjust brightness, contrast or blur if the image needs it.",
    "Press Export to download a 3x-resolution PNG, or Save Draft to keep the meme in your browser and come back to it.",
  ],
};

export default seo;
