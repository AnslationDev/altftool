const seo = {
  intro:
    "The Video to GIF Converter turns a trimmed section of an MP4, WebM or Ogg clip into an animated GIF by seeking the video frame by frame, drawing each frame to a canvas, and encoding it with a per-frame quantised palette of 256, 128, 64 or 32 colours. You control the in and out points, frame rate from 5 to 30 fps, output width from 100 to 1920 pixels, playback speed from 0.5x to 2x, and whether the result loops. Everything runs in your browser and the finished GIF's size in kilobytes is shown before you download it.",
  useCases: [
    "You want a 4-second reaction GIF from a longer video for a Slack or Discord post, small enough that it actually loads inline.",
    "A bug reproduction needs to go into a GitHub issue as a looping animation, so you trim to the failing interaction and export at 480 pixels wide.",
    "A product page needs a silent looping demo and you need it under a size budget, so you drop the palette to 64 colours and the frame rate to 8 fps and watch the reported KB fall.",
  ],
  benefits: [
    [
      "Every size lever is exposed",
      "Duration, width, frame rate and palette depth are all adjustable, and the output size in KB is reported after each compile so you can tune against a real number.",
    ],
    [
      "Per-frame palette quantisation",
      "Each frame gets its own colour palette rather than one shared table for the whole animation, which keeps gradients and skin tones from banding as badly at 128 or 64 colours.",
    ],
    [
      "Speed changes the timing, not the frames",
      "Choosing 2x rewrites the per-frame delay instead of dropping frames, so a sped-up GIF stays as smooth as the frame rate you asked for.",
    ],
  ],
  faqs: [
    [
      "What frame rate should I use for a GIF?",
      "10 fps is the default and is usually the right trade — motion reads as continuous and the file stays small. The slider goes from 5 to 30 fps, and since frame count is duration multiplied by frame rate, doubling the fps roughly doubles the file size.",
    ],
    [
      "How do I make the GIF file smaller?",
      "Cut the duration first, then the width, then the frame rate, then the palette. Dropping from 256 to 64 colours or from 480 to 320 pixels wide both make a large difference, and the tool reports the resulting size in KB after every compile so you can compare.",
    ],
    [
      "Can I make a GIF that plays once instead of looping?",
      "Yes. Turn the Loop switch off and the encoder writes a no-repeat flag instead of the infinite-loop value, so viewers see the animation play through a single time.",
    ],
    [
      "Is my video uploaded to convert it?",
      "No. The clip is loaded from a local object URL, frames are seeked and drawn onto a canvas in the page, and the GIF is encoded in JavaScript and handed to you as a blob. Nothing is sent to a server.",
    ],
  ],
};

export default seo;
