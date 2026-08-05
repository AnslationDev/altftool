const seo = {
  intro:
    "Lucky Face Score is a for-fun generator that turns any photo into a made-up luck score out of 100, with a badge, a fortune line and a lucky number, day and colour. There is no face detection and no AI: the tool hashes the file's bytes with FNV-1a (32-bit) and expands that hash with an xorshift generator, which is why the same picture always produces the same reading and a different picture always produces a different one. The photo is read inside your browser and never uploaded.",
  useCases: [
    "Settle who buys the coffee by scoring everyone's profile picture with the same rule.",
    "Add a silly shareable result to a group chat without handing a face to a cloud service.",
    "Show a class how a hash turns identical input into identical output, every time.",
  ],
  benefits: [
    ["Always the same answer", "The score is a hash, not a random number, so re-running gives the identical reading."],
    ["Nothing uploaded", "The file is read with the browser's own file API; no image or result leaves the device."],
    ["Honest about itself", "It states plainly that the number measures the file's bytes, not you."],
  ],
  faqs: [
    [
      "Does this really analyse my face?",
      "No. Nothing in the tool looks at the image content — no face detection, no machine learning, no measurement of features. It reads the file's bytes and hashes them, so a photo of a wall scores exactly the same way a selfie does.",
    ],
    [
      "Why do I get the same score every time?",
      "Because the score is derived from an FNV-1a hash of the file rather than a random number. Identical bytes give an identical 32-bit hash and therefore an identical score, badge and fortune — re-crop or re-save the picture and every number changes.",
    ],
    [
      "Is my photo uploaded anywhere?",
      "No. The file is read in the page with the browser's File API and hashed locally; there is no server call, no storage and no analytics attached to the image.",
    ],
    [
      "What do the scores mean?",
      "Nothing. Scores run from 1 to 100 and fall into five badges — below 35 Needs a Four-Leaf Clover, 35–54 Beginner's Luck, 55–74 Lucky Star, 75–89 Fortune's Favourite and 90 or above Grand Luck Master. They are entertainment, not a prediction or an assessment of any kind.",
    ],
  ],
  steps: [
    "Pick a file with the Your photo picker. It takes any image file up to 20 MB — a larger one is refused with a message telling you to keep it under 20 MB, and a non-image with one naming JPEG, PNG, WebP or HEIC. The chosen photo previews on the page and is read in the browser, never uploaded.",
    "Nothing to press: the reading recomputes as soon as the file is read. The card fills in Luck score out of 100, a badge with its one-line note, the Charm, Timing, Fortune and Aura rows each scored out of 100, then Lucky number, Lucky day, Lucky colour and an Image fingerprint, with the fortune line quoted underneath.",
    "Click Copy result — it reads Copied! for a moment — to copy the whole reading as plain text headed Lucky Face Score (for entertainment only). Choose another photo reopens the picker for a different file, and Reset clears the photo and blanks every field back to a dash.",
  ],
};

export default seo;
