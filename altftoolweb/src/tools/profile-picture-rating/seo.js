const seo = {
  title: "Profile Picture Rating: Brightness, Contrast",
  metaDescription:
    "Measures brightness, edge contrast and background colour variety from your photo's pixels in the browser, with a checklist for the platform you pick.",
  steps: [
    "Drop a photo onto \"Drag & Drop your picture here\" or use Browse Files, then set \"Select Target Platform Context\" to Professional / LinkedIn / Job Search, Social Media, Technical Profile / GitHub / Dev or Casual Profile / Dating.",
    "Press Rating Scan: the picture is drawn into a hidden canvas in your browser at 150x150 and scored on average brightness using the BT.601 weights (0.299 red, 0.587 green, 0.114 blue), on edge contrast and on background colour variety.",
    "The PFP Rating Report shows an Overall Score on a scale of 100 with a bar and a written note per category, then \"What Is Working Well\" and \"Actionable Improvements\" lists; Reset clears the photo and the report.",
  ],
  intro:
    "This tool measures the technical qualities of a profile photo — average brightness, edge contrast and background colour variety — and scores them against what a headshot usually needs, then pairs the numbers with a checklist for the platform you picked. It samples the image down to 150x150 and computes perceptual brightness with the BT.601 luma weights (0.299 red, 0.587 green, 0.114 blue), treating a mid-tone average near 120 of 255 as well exposed. It is for anyone deciding whether the photo they are about to use is too dark, too flat or too busy behind them.",
  useCases: [
    "You have three candidate photos for a LinkedIn update and want an objective read on which one is actually well lit rather than which one you like.",
    "A photo looks fine full size but disappears as a small circular avatar, and you need to know whether it is the contrast or the busy background costing you.",
    "Checking a self-shot portrait before a conference bio deadline, when there is no time to reshoot but there is time to brighten and recrop.",
  ],
  benefits: [
    ["Numbers instead of opinions", "Brightness, contrast and background variety are measured off the actual pixels, so 'too dark' becomes a figure you can act on."],
    ["Advice matched to the platform", "Four goals — professional, social, technical and casual — change the checklist, because a GitHub avatar and a dating photo are judged on different things."],
    ["Tells you which lever to pull", "The feedback names the specific fix: add front-facing light below 80 average brightness, diffuse the source above 180, blur a background with high colour variety."],
  ],
  faqs: [
    [
      "How does it decide my photo is too dark or too bright?",
      "By average perceptual brightness on a 0-255 scale. Below about 80 it flags underexposure and suggests front-facing light; above about 180 it flags blown highlights and suggests diffusing the source. The lighting score peaks around 120 and falls off the further your average sits from it.",
    ],
    [
      "Does it detect my face or read my expression?",
      "No. It analyses image statistics — brightness, edge energy and colour spread — not facial landmarks, and there is no face detection or emotion model behind it. The framing and expression notes are checklists for the goal you chose, so treat them as prompts to look at your photo rather than measurements of it.",
    ],
    [
      "Is my photo uploaded anywhere?",
      "No. The image is read into a hidden HTML canvas in your browser and analysed there, so the file never leaves the tab and nothing is stored after you reset.",
    ],
    [
      "Why did my score cap out below 100?",
      "The overall score is the average of the lighting, contrast and composition scores and is deliberately capped at 92, because pixel statistics cannot confirm the things that make a headshot genuinely good — eye contact, expression and whether it looks like you. Use it to rule photos out, not to certify one.",
    ],
  ],
};

export default seo;
