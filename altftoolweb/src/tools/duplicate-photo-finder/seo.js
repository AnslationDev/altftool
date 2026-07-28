const seo = {
  title: "Duplicate Photo Finder Online — Free & In-Browser",
  h1: "Duplicate Photo Finder",
  metaDescription:
    "Spot duplicate and near-identical photos in your browser — a 64-bit difference hash groups matches at a 60-100% similarity threshold. Nothing uploads.",
  intro:
    "Duplicate Photo Finder compares pictures with a 64-bit difference hash (dHash). Each image is drawn onto a 9x8 canvas, converted to grayscale with the standard luma weights (0.299R + 0.587G + 0.114B), and every pixel is compared with its right-hand neighbour to produce 64 bits. Any two photos are scored by Hamming distance — similarity = (64 − differing bits) ÷ 64 × 100 — and everything at or above your threshold (60-100%, default 90%) is collected into a duplicate group. Decoding and hashing both run on a canvas element in your own browser, so the photos you add are never uploaded and no account is needed.",
  useCases: [
    "Find resized or re-compressed copies of the same shot in a folder of exports, and see which file is the largest one worth keeping.",
    "Audit an image library or asset folder for near-identical stock photos before it goes into a CMS or a client handover.",
    "Confirm two files really are the same picture using the before/after slider, side-by-side view or difference heatmap.",
  ],
  benefits: [
    [
      "A similarity threshold you control",
      "The 60-100% slider decides how close two hashes must be. At the default 90%, up to six of the 64 bits may differ — enough to catch a re-saved copy without pairing unrelated photos.",
    ],
    [
      "Matching that ignores resolution",
      "Every image is reduced to the same 9x8 grid before hashing, so a 4000 px original and an 800 px thumbnail of the same frame produce the same fingerprint.",
    ],
    [
      "Smart selection by quality",
      "One click marks everything except the highest-resolution copy in each group; another marks everything except the largest file, so you never lose the best version.",
    ],
    [
      "Nothing leaves your device",
      "Files you add are read through local object URLs and hashed on a canvas in JavaScript. There is no upload step, no sign-up and no stored history.",
    ],
  ],
  faqs: [
    [
      "How does a duplicate photo finder detect similar images?",
      "By fingerprinting the picture rather than the file. This tool builds a 64-bit difference hash: the image is scaled to a 9x8 grid, converted to grayscale, and each pixel is compared with the one to its right — brighter sets a 1, darker a 0. Two photos whose hashes differ by only a few bits look identical to the eye even when the files differ byte for byte.",
    ],
    [
      "Does this tool delete duplicate photos from my computer?",
      "No. \"Remove Marked\" only clears images from the on-screen list — a web page has no permission to delete files on your disk. Use it to decide which copies are redundant, then delete those files yourself in Finder, File Explorer or your photo app.",
    ],
    [
      "Are my photos uploaded to a server?",
      "No. Each file you add becomes a local object URL, is drawn onto a 9x8 canvas and hashed in JavaScript on your own device — no image data is sent anywhere and no login is required. The only exception is the four sample photos that load as a demo, which are fetched from Unsplash; press Reset Demo to clear them.",
    ],
    [
      "What similarity threshold should I use?",
      "Start at the default 90%. Similarity is (64 − differing bits) ÷ 64 × 100, so 90% allows up to six of the 64 hash bits to differ — enough to catch a resized or re-compressed copy but not two different scenes. Raise it toward 100% for near-exact matches only, or drop toward 60% to catch heavier edits at the cost of some false pairs.",
    ],
    [
      "Will it find duplicates if one photo is cropped or rotated?",
      "Usually not. A difference hash reads the whole frame, so cropping, rotating or flipping shifts every pixel comparison and produces a very different hash. It is built for resized, re-saved, re-compressed or lightly retouched versions of the same frame. Lowering the threshold helps with small crops, but not with rotation.",
    ],
    [
      "Which image formats can it scan?",
      "Anything your browser can decode in an image tag — JPEG, PNG, WebP, GIF and AVIF all work, and the file picker accepts image/* with multiple files at once. iPhone HEIC files only decode in Safari, so convert them to JPEG first if you are on Chrome, Edge or Firefox.",
    ],
    [
      "How much space would removing the duplicates save?",
      "The Space Analytics tab estimates it: inside each group the largest file is kept and the rest are counted as wasted space, charted in KB against the total size of everything you loaded, alongside a breakdown of file formats. It covers only the files in the current session — nothing is stored once you close the tab.",
    ],
    [
      "How many photos can it handle at once?",
      "There is no fixed limit, but the work grows quickly: each image is decoded and hashed one at a time, then compared pairwise, so n photos mean up to n(n−1)/2 comparisons. A few hundred images scan comfortably; several thousand will make both the scan and the grouping noticeably slow.",
    ],
  ],
  steps: [
    "Click Add Images and select the photos you want to check — you can pick many files at once, and the progress bar shows a hash being computed for each one.",
    "Set the similarity threshold (90% by default) and read the duplicate groups, each labelled with its average match percentage.",
    "Use Visual Compare to confirm a pair, apply Smart Selection to mark the lower-resolution or smaller copies, then delete those files yourself in your own photo folder.",
  ],
};

export default seo;
