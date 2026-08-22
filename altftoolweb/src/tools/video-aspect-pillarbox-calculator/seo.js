const seo = {
  title: "Pillarbox & Letterbox Calculator with ffmpeg Pad",
  metaDescription:
    "Fit any ratio inside any frame: exact bar thickness per side, scaled size, even-pixel encoder dimensions and a copy-paste ffmpeg pad filter.",
  steps: [
    "Enter the source ratio into Ratio width and Ratio height, or press one of the preset chips such as 16:9 or 9:16.",
    "Set Frame width and Frame height in pixels — the 1920×1080, 1080×1920 and 3840×2160 chips fill both in — and the figures recalculate as you type.",
    "Read Bar thickness per side, Encoder-safe size (even pixels) and Pad offset (x, y), then take the -vf \"scale=…,pad=…\" string from the ffmpeg filter panel or press 'Copy result'.",
  ],
  intro:
    "Pillarbox Padding Calculator works out how thick the black bars are when content of one aspect ratio is fitted inside a frame of another without cropping. It applies the standard contain fit — if the content is wider than the frame it is limited by width and you get letterbox bars top and bottom, if it is narrower it is limited by height and you get pillarbox bars at the sides — then reports the scaled size, even-pixel encoder dimensions and the matching ffmpeg pad filter. Built for editors, motion designers and anyone re-framing a master for a different delivery spec.",
  useCases: [
    "Placing a 16:9 interview master into a 1080×1920 vertical Reel and needing the exact 656 px letterbox bar so titles clear it.",
    "Padding a 9:16 phone clip into a 1920×1080 timeline and reading off the 656 px pillarbox offset for the ffmpeg pad filter.",
    "Checking how much of a 1080p frame is wasted when a 4:3 archive clip is centred in it (25% of the area becomes bars).",
    "Getting even-numbered scale dimensions so an H.264 yuv420p encode does not fail on an odd width or height.",
  ],
  benefits: [
    ["Exact geometry", "Bar thickness, offsets and scaled dimensions come from the ratio maths, not eyeballed guides."],
    ["Encoder-safe output", "Dimensions are floored to even pixels so 4:2:0 codecs like H.264 and HEVC accept them."],
    ["Copy-paste ffmpeg", "The scale plus pad filter string is generated for the exact frame and offsets you entered."],
  ],
  faqs: [
    [
      "What is the difference between pillarbox and letterbox?",
      "Pillarbox puts bars on the left and right; letterbox puts them on the top and bottom. You get pillarbox when the content is narrower than the frame (for example 4:3 in a 16:9 frame) and letterbox when the content is wider (16:9 in a 9:16 vertical frame).",
    ],
    [
      "How do I calculate the black bar size for 16:9 video in a 9:16 frame?",
      "Scale the content to the frame width, then split the leftover height in two. For a 1080×1920 frame the 16:9 content becomes 1080×607.5, leaving 1920 − 607.5 = 1312.5 px of bar, or 656.25 px top and bottom — about 68% of the frame area.",
    ],
    [
      "Why does the calculator round dimensions to even numbers?",
      "Most delivery codecs use 4:2:0 chroma subsampling, which halves colour resolution horizontally and vertically, so encoded width and height must both be divisible by 2. Odd values make encoders like x264 error out or silently resize.",
    ],
    [
      "What ffmpeg command adds these bars?",
      "Use a scale then pad chain, for example -vf \"scale=1080:606:flags=lanczos,pad=1080:1920:0:656:color=black\". The scale values are the fitted content size, the pad values are the output frame followed by the x and y offset of the content inside it.",
    ],
  ],
};

export default seo;
