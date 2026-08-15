const seo = {
  title: "Join Photo & Signature to an Exact Pixel and KB",
  metaDescription:
    "Stack a passport photo above a signature at 350x525 or another exam size, and bisect JPEG quality until the file lands inside your KB window.",
  steps: [
    "Under \"1. Upload Passport Photo\" and \"2. Upload Signature\", choose a JPEG, PNG or WEBP image for each panel.",
    "Pick from \"Select Exam Preset\" — UPSC Combined (350x525), IBPS / Bank Exam (400x550), SSC Combined (300x500) or GATE Exam (480x640) — or set Width (px) and Height (px), then drag the Photo vs Sign Split slider.",
    "Press \"Download Joined Image\" to save the canvas as merged-document with its pixel dimensions and KB size in the filename, or switch the format to PDF (.pdf) first.",
  ],
  intro:
    "Join Photo & Signature stacks a passport photo above a signature on a single canvas at an exact pixel size, then binary-searches the JPEG quality until the result lands inside a target KB range — the two things exam portals reject uploads for. A ratio control decides how the height is split between the photo panel and the signature panel, a gap and background colour separate them, and each image can be scaled and is centred inside its own clipped panel. Built-in presets cover the common combined-upload sizes, and everything is drawn in your browser canvas, so the photo and signature are never uploaded.",
  useCases: [
    "The application portal wants one combined image of 350x525 pixels under a fixed KB cap and rejects every file you have tried so far",
    "Your scanned signature is far larger than the photo, and you need to shrink and centre it in the lower panel without opening an image editor",
    "You already have a correctly sized combined image but it is 180 KB against a 50 KB ceiling, and you need the file smaller without changing the dimensions",
  ],
  benefits: [
    ["Size target hit by search, not guesswork", "JPEG quality is bisected over up to eight passes between 0.05 and 0.98 to land inside your minimum and maximum KB, instead of leaving you to retry a slider."],
    ["Panels are clipped, so nothing bleeds", "The photo and signature each draw inside their own clipped region, so an oversized scan crops cleanly rather than overlapping the other half."],
    ["Both constraints at once", "Exact output pixel dimensions and the KB window are enforced together, which is what portals check and where most rejected uploads fail."],
  ],
  faqs: [
    [
      "What sizes do the presets use?",
      "UPSC and NDA/CDS use 350x525 with a 20–140 KB window, IBPS and bank exams 400x550 at 20–50 KB, SSC 300x500 at 10–50 KB, JEE Main and NEET 350x450 at 10–200 KB, GATE 480x640 at 10–150 KB, and CAT 150x200 at 20–80 KB. Portals revise these between cycles, so check the current official notification and use the custom option if it differs.",
    ],
    [
      "How does it get the file under the KB limit?",
      "By bisecting the JPEG quality factor. It starts at 0.85, and if that misses the window it runs up to eight halving steps between 0.05 and 0.98, keeping the highest quality whose encoded size still fits under your maximum. PNG is written losslessly instead, so PNG output ignores the size target.",
    ],
    [
      "How is the space split between photo and signature?",
      "By a ratio you set — 0.7 gives the photo 70% of the canvas height and the signature the rest, minus the gap. The presets pick their own default, from 0.67 for UPSC-style layouts up to 0.75 for JEE, NEET and GATE.",
    ],
    [
      "Are my photo and signature uploaded anywhere?",
      "No. Both files are read with the browser's FileReader and composited on a local canvas, and the download comes from that canvas. Nothing is transmitted, which matters because a signature image is a reusable identity artefact.",
    ],
  ],
};

export default seo;
