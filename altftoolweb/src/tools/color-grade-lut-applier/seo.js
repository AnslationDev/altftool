const seo = {
  title: "Apply a .cube LUT to Video or Photos Online — FFmpeg WASM",
  metaDescription:
    "Bake a .cube LUT into video or images with FFmpeg's lut3d filter in your browser — pick tetrahedral, trilinear or nearest; nothing is uploaded.",
  steps: [
    "Choose the image or video to grade as the Source file and your .cube LUT as the Secondary file.",
    "Pick an Interpolation mode — tetrahedral, trilinear or nearest — and press \"Process locally\"; the FFmpeg WebAssembly engine loads and runs the lut3d filter in your browser.",
    "The graded result downloads automatically as altftool-color-grade-lut-applier.mp4, with H.264 video and the original audio stream copied untouched.",
  ],
  intro:
    "The Color-Grade LUT Applier bakes a 3D lookup table from a .cube file into an image or video using FFmpeg's lut3d filter, running as WebAssembly inside your browser so the footage is never uploaded. You choose the interpolation mode — tetrahedral, trilinear or nearest — and the graded result is encoded back out with H.264 video and the original audio stream copied untouched. It is for editors and photographers who want to apply a look they already own without opening an NLE.",
  useCases: [
    "A colourist sent you a .cube look and you want to see it on a clip before rebuilding the grade in your editing timeline.",
    "You shot flat or log footage and need a quick viewing copy with a conversion LUT applied so a client can review it.",
    "You bought a LUT pack and want to compare the same still through several .cube files to work out which one you actually like.",
  ],
  benefits: [
    ["Runs the real FFmpeg lut3d filter", "The same 3D LUT implementation used in professional command-line pipelines, not a browser approximation of one."],
    ["Interpolation is your choice", "Tetrahedral, trilinear and nearest are all exposed, so you can trade accuracy against speed rather than accept a fixed default."],
    ["Audio is copied, not re-encoded", "Only the video stream is touched, so the soundtrack comes through bit-for-bit and processing is faster."],
  ],
  faqs: [
    [
      "What file do I need to apply a LUT?",
      "Two: the image or video you want graded, and a .cube LUT file as the secondary input. Both stay on your machine — FFmpeg is compiled to WebAssembly and runs in the page, so nothing is uploaded to a server.",
    ],
    [
      "Which interpolation should I pick?",
      "Tetrahedral for the best accuracy, which is why it is offered first and is the usual choice for final output. Trilinear is faster with slightly softer transitions between lattice points, and nearest does no interpolation at all — fastest, but it can band on gradients.",
    ],
    [
      "What format does it export?",
      "An MP4 with H.264 video, encoded via libx264, with any existing audio track copied straight through. That plays anywhere and imports cleanly into every common editor.",
    ],
    [
      "Is applying a LUT the same as colour grading?",
      "No. A LUT remaps colours through a fixed table, so it applies one look uniformly; it cannot respond to a shot's exposure, white balance or specific regions. Correct exposure and balance first, then use the LUT as the creative layer on top.",
    ],
  ],
};

export default seo;
