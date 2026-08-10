const seo = {
  title: "Turn Your Camera Into a 5x Low-Vision Magnifier",
  metaDescription:
    "Live camera magnifier for small print: zoom 1x to 5x in 0.1 steps, contrast up to 3x, invert and grayscale. Nothing is recorded or uploaded.",
  steps: [
    "Press Start camera and grant the browser camera permission; the tool requests the rear, environment-facing lens.",
    "Hold the device over the page and drag the Zoom slider between 1x and 5x, then the Contrast slider up to 3x.",
    "Switch on Invert colors or Grayscale to cut glare, and press Stop camera to end every track on the stream.",
  ],
  intro:
    "Low-Vision Camera Magnifier turns a phone or laptop camera into a live electronic magnifier: it opens the rear-facing camera and renders the stream with adjustable zoom from 1× to 5×, contrast from 0.7× to 3×, plus colour inversion and grayscale. It is the software equivalent of a handheld video magnifier for reading small print — a medicine label, a restaurant menu, a utility bill — without buying dedicated hardware. Nothing is recorded or uploaded; the video is filtered in the page and the stream stops the moment you press stop.",
  useCases: [
    "You are at a pharmacy counter trying to read a dosage printed at 6pt on a foil strip, and holding the phone above it at 4× with high contrast makes it legible.",
    "Reading white-on-glossy paper is painful in bright light, so you switch on invert to get light text on a dark field, which many people with light sensitivity find far easier.",
    "A relative with macular degeneration needs to check a bank statement now, and you want a magnifier on their existing tablet rather than waiting for a CCTV reader to arrive.",
  ],
  benefits: [
    [
      "Fine-grained zoom, not fixed steps",
      "Zoom moves in 0.1× increments between 1× and 5×, so you can settle exactly where the text is sharp instead of jumping past it.",
    ],
    [
      "Contrast boost separate from zoom",
      "Contrast is its own control up to 3×, which is what rescues faded receipts and low-ink print that simply making bigger does not fix.",
    ],
    [
      "Inversion and grayscale for glare",
      "Inverting to light-on-dark and stripping colour both cut glare and colour noise, the two adjustments low-vision readers reach for most often.",
    ],
  ],
  faqs: [
    [
      "How much can it magnify?",
      "Up to 5× on top of whatever optical framing your camera gives you, adjustable in 0.1× steps and starting at 1.5×. Moving the device closer to the page adds more effective magnification, since the digital zoom multiplies whatever the lens already sees.",
    ],
    [
      "Does it record or send anything from my camera?",
      "No. The camera stream is displayed and filtered locally in the page — there is no capture button, no upload and no storage. Pressing stop ends every track on the stream, which is what turns the camera indicator light off.",
    ],
    [
      "Which camera does it use, and can I switch to the front one?",
      "It requests the environment-facing (rear) camera, because that is the one you point at a page. On a device with only a front camera the browser falls back to that, but there is no in-page switch between lenses.",
    ],
    [
      "Is this a substitute for a prescribed low-vision aid?",
      "No — it is a general reading aid, not a medical device or a substitute for an assessment. If you are finding everyday print harder to read, see an optometrist or a low-vision specialist, who can also advise on dedicated magnifiers and system-level accessibility settings.",
    ],
  ],
};

export default seo;
