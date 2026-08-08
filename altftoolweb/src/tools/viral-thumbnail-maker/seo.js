const seo = {
  title: "AI YouTube Thumbnail Maker: 4 Concepts at 1280x720",
  metaDescription:
    "Turn a video topic into four AI thumbnail concepts from 8 style presets and 6 colour palettes, exported as 1280x720 JPEG — the size YouTube asks for.",
  steps: [
    "Describe the video in the 'What is your video about?' box, and optionally type a headline into 'Text on thumbnail'.",
    "Pick one of the eight Visual Style tiles (Gaming, Tech / Coding, Finance, Storytelling, Education, Fitness, Food, Travel) and one of the six Color Theme swatches, then press 'Generate AI Thumbnails'.",
    "Four seeded takes appear under 'Your AI Thumbnails' — press Download on one to save it as thumbnail_1.jpg at 1280x720, press Regenerate for a fresh set, or reopen the last 20 under Recent Thumbnails.",
  ],
  intro:
    "The Viral Thumbnail Maker generates four AI thumbnail concepts from your video topic by combining it with one of eight style presets, one of six colour palettes and your optional headline text into a single image prompt, then upscaling each result to YouTube's recommended 1280x720. You get four different seeds per run so you have real alternatives to compare rather than one take, and the last 20 images stay in your browser's local storage. It is a fast way for creators to get past the blank canvas, not a replacement for a designer on a channel that depends on its look.",
  useCases: [
    "You are uploading a gaming video tonight and need a thumbnail in the next ten minutes that is better than a paused frame from the footage.",
    "A tutorial channel wants to see how the same topic reads in the Tech versus Education style before committing to a visual direction for the series.",
    "You have a headline in mind and want four colour treatments of it side by side so you can pick the one that stands out at phone-feed size.",
  ],
  benefits: [
    [
      "Four seeded variations per run",
      "Each generation issues two parallel batches with independent random seeds, so you are choosing between four takes instead of regenerating one image until it lands.",
    ],
    [
      "Style and palette become prompt structure",
      "Picking Finance plus Red and Black writes specific composition and lighting language into the prompt for you, which is the part most people get wrong when prompting by hand.",
    ],
    [
      "Exports at the size YouTube asks for",
      "Every image is drawn onto a 1280x720 canvas with high-quality smoothing and saved as JPEG, so it uploads without being rescaled or rejected.",
    ],
  ],
  faqs: [
    [
      "What size should a YouTube thumbnail be?",
      "1280x720 pixels at 16:9, which is exactly what this tool exports. It saves as JPEG at high quality, comfortably inside YouTube's thumbnail file-size limit, and anything smaller than 1280 wide gets upscaled by YouTube and looks soft in the sidebar.",
    ],
    [
      "Does this run entirely in my browser?",
      "Not quite. The text prompt built from your topic, style, palette and headline is sent to a third-party image generation service, and the returned image is then upscaled and encoded locally. Your history of the last 20 thumbnails is stored only in your own browser.",
    ],
    [
      "Can I add my own text to the thumbnail?",
      "You can type a headline and it is written into the prompt as bold stylised thumbnail text, which the image model renders as part of the artwork. AI-rendered lettering can come out misspelled, so for anything you are publishing, set the text in a proper editor over the generated background.",
    ],
    [
      "How many styles and colour schemes are there?",
      "Eight styles — gaming, tech, finance, storytelling, education, fitness, food and travel — and six palettes including cyan and purple, red and black, yellow and dark, neon green, warm orange and pink gradient, giving 48 combinations before you change the topic or headline.",
    ],
  ],
};

export default seo;
