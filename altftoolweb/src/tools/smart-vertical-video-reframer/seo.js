const seo = {
  intro:
    "The Smart Vertical Video Reframer crops landscape footage to a 9:16 vertical frame using an anchor you choose — left, centre or right — then scales the result to 1080x1920 and re-encodes it as H.264 video with AAC audio in an MP4. It is for editors and creators who need a Reels, Shorts or TikTok cut of a wide clip without opening a full NLE. The crop keeps the full original height and takes a window of height x 9/16 across the width, so nothing is stretched or letterboxed.",
  useCases: [
    "You shot a 16:9 interview with the speaker sitting on the left third of the frame and need a vertical cut that keeps them in shot, so you pick the left anchor rather than a centre crop that would clip them.",
    "You have a 4K landscape product clip and want a 1080x1920 version to upload as a Short without re-exporting from your editing timeline.",
    "You are checking whether a wide shot survives a vertical crop at all, and want to run left, centre and right versions quickly before deciding to reshoot.",
  ],
  benefits: [
    ["Exact 1080x1920 output", "The crop and the scale are both explicit, so the file you get matches the vertical spec the platforms expect instead of an approximate aspect."],
    ["Anchor you control", "Left pins the crop to x=0, right pins it to the far edge, centre splits the difference — you decide where the subject is rather than trusting a guess."],
    ["Your file stays on your machine", "The encode runs through a WebAssembly build of FFmpeg inside the browser tab, so the video is never uploaded to a server."],
  ],
  faqs: [
    [
      "Does it actually detect the subject automatically?",
      "No. Despite the name it applies a fixed left, centre or right crop and does not track faces or motion, so you should check the output before publishing. Pick the anchor that matches where your subject sits in the wide frame.",
    ],
    [
      "What resolution and format do I get back?",
      "A 1080x1920 MP4 with H.264 video and AAC audio, which is the standard vertical spec for Reels, Shorts and TikTok. The crop window is the full source height by height x 9/16 in width, then scaled to 1080x1920.",
    ],
    [
      "Will the crop cut off part of my shot?",
      "Yes, horizontally — that is unavoidable. A 1920x1080 source keeps a 608-pixel-wide slice of its 1920-pixel width, so roughly two thirds of the frame width is discarded; the full height is always kept.",
    ],
    [
      "Why is a long clip slow to process?",
      "Because the video is decoded and re-encoded with libx264 inside your browser using WebAssembly, which runs slower than a native encoder and uses your device's memory for the whole job. Trim long recordings down before reframing, and keep the tab in the foreground while the progress bar moves.",
    ],
  ],
};

export default seo;
