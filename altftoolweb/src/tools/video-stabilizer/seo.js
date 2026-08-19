const seo = {
  title: "Video Stabilizer: Fix Shaky Clips in Your Browser",
  metaDescription:
    "Smooth shaky clips with FFmpeg's deshake filter run as WebAssembly in your browser — light, medium or strong correction, MP4 output, no upload.",
  steps: [
    "Choose your clip under \"Source file\" (accepts any video type) and pick light, medium or strong under \"Stabilization\" — a 16, 24 or 32 pixel search radius.",
    "Press \"Process locally\" — the FFmpeg WebAssembly engine loads and runs the deshake filter with mirrored edges on your own machine.",
    "The stabilized clip downloads automatically as altftool-video-stabilizer.mp4, re-encoded to H.264 video with AAC audio.",
  ],
  intro:
    "The Video Stabilizer smooths shaky handheld footage by running FFmpeg's deshake filter in your browser, searching a motion window of 16, 24 or 32 pixels depending on whether you pick light, medium or strong correction. The result is re-encoded to H.264 video with AAC audio and downloads as an MP4, and because FFmpeg is compiled to WebAssembly and runs in the page, the clip is never uploaded. It suits creators fixing a walking shot, a phone clip or a handheld interview without opening an editor.",
  useCases: [
    "You filmed a walkthrough on your phone while moving and the footage is too jittery to publish, but the shot itself is unrepeatable.",
    "A handheld product close-up wobbles just enough to be distracting, and you want one pass of correction before dropping it into an edit.",
    "A clip contains something you would rather not upload to a cloud stabilizer, so you need the correction to happen entirely on your own machine.",
  ],
  benefits: [
    [
      "Three explicit correction strengths",
      "Light, medium and strong map to a 16, 24 or 32 pixel search radius, so you can dial back the correction when a strong pass starts warping the frame.",
    ],
    [
      "Edges mirrored instead of blanked",
      "The filter fills the borders exposed by shifting each frame with a mirrored edge, so stabilised footage does not gain black bars that wander around the frame.",
    ],
    [
      "The file never leaves your device",
      "FFmpeg runs as WebAssembly in the page, so the footage is decoded, filtered and re-encoded locally rather than being sent to a processing server.",
    ],
  ],
  faqs: [
    [
      "What does the light, medium and strong setting actually change?",
      "The pixel search radius the deshake filter uses when matching each frame to the previous one: 16 pixels for light, 24 for medium and 32 for strong. A larger radius catches bigger jolts but has more chance of locking onto the wrong match, so start light.",
    ],
    [
      "Will stabilising crop or zoom my video?",
      "The output keeps the source dimensions; the space revealed at the edges when a frame is shifted is filled with a mirrored copy of the nearby pixels rather than cropped away. On strong settings that mirroring can become visible along the borders.",
    ],
    [
      "What format do I get back?",
      "An MP4 with H.264 video and AAC audio, which plays on essentially every phone, browser and editor. The clip is re-encoded rather than copied, so expect a generational quality loss compared with the original.",
    ],
    [
      "Why is it slow on long clips?",
      "Every frame is decoded, analysed, shifted and re-encoded by your own CPU through WebAssembly, with no server doing the work. That is the trade for keeping the file private, so trim long footage to the section you need before stabilising it.",
    ],
  ],
};

export default seo;
