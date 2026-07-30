const seo = {
  title: "Lissajous Curve Generator — Animated Patterns",
  h1: "Lissajous Curve Generator",
  metaDescription:
    "Plot Lissajous curves from two sine waves — X/Y frequencies 1-12, phase, rotation, decay and live animation. Free, runs in your browser, nothing uploaded.",
  intro:
    "The Lissajous Pattern Generator plots the classic two-sine-wave curve — x = Ax·sin(fx·t + φ), y = Ay·sin(fy·t) — as a live polyline on an HTML5 canvas, redrawn every frame through requestAnimationFrame. Ten sliders control X and Y frequency (1–12), phase, rotation, both amplitudes, trace sample count, animation speed, phase drift and an exponential decay envelope, while the stats panel reduces your two frequencies by their greatest common divisor to report the simplified ratio and lobe count. All of the maths and drawing happen locally on your device — there is no account, no upload, and no server call.",
  useCases: [
    "Demonstrating frequency ratio and phase difference in a physics or electronics lesson, the way an oscilloscope shows them in X-Y mode",
    "Previewing what a given frequency ratio such as 3:2, 5:4 or 7:6 will look like before setting up a signal generator and scope on the bench",
    "Designing generative line art — ribbons, flowers, knots and woven curves — by dialling in frequencies, rotation and decay",
  ],
  benefits: [
    [
      "Ten live parameters",
      "X frequency, Y frequency, phase, rotation, both amplitudes, trace samples, animation speed, phase drift and signal decay each redraw the curve on the next animation frame.",
    ],
    [
      "Ratio and lobe readout",
      "The stats panel divides your two frequencies by their greatest common divisor and shows the simplified ratio plus the horizontal and vertical lobe counts, so a 6:4 setting reads as 3:2.",
    ],
    [
      "Five presets plus randomize",
      "Start from Classic 3:2, Infinity Loop, Five Petal, Oscilloscope or Rotated Ribbon, or press Random to roll fresh frequencies, phase, amplitudes, rotation and decay.",
    ],
    [
      "Free, no signup, nothing uploaded",
      "The curve is computed and painted on a canvas element in your own browser — no account, no watermark, and no data leaves your device.",
    ],
  ],
  faqs: [
    [
      "What is a Lissajous curve?",
      "A Lissajous curve is the path traced when two perpendicular sine waves are plotted against each other — x follows one frequency, y follows another. This generator evaluates x = Ax·sin(fx·t + φ) and y = Ay·sin(fy·t) over one full 2π cycle, so the shape you see is set entirely by the frequency ratio and the phase difference between the two waves.",
    ],
    [
      "How does this Lissajous curve generator work?",
      "It samples the two sine equations at every point along t = 0 to 2π and joins them into a polyline drawn on an HTML5 canvas. The trace-samples slider sets how many points make up that line, from 300 up to 3,000, and a requestAnimationFrame loop repaints the canvas continuously so any slider change appears immediately.",
    ],
    [
      "How do I make a figure-eight or infinity Lissajous pattern?",
      "Set the X frequency to 1, the Y frequency to 2 and the phase to 0 — that's the Infinity Loop preset built into the tool. In general a 1:2 ratio gives the figure-eight, 3:2 gives the classic looped curve, and 5:4 gives the five-petal flower shape.",
    ],
    [
      "How many lobes will a Lissajous figure have?",
      "The number of horizontal lobes equals the Y frequency and the vertical lobes equal the X frequency, after both are divided by their greatest common divisor. The stats panel does that reduction for you: enter 6 and 4 and it reports a 3:2 ratio with 2 x 3 lobes.",
    ],
    [
      "Can I animate the Lissajous pattern?",
      "Yes. The canvas starts paused; press Animate and the phase advances at 24 degrees per second by default. The phase-drift slider goes from 0 to 120 deg/s and the animation-speed slider from 0.1x to 3x, and a tracer dot rides along the curve while it runs. Reset returns to the current preset and pauses again.",
    ],
    [
      "What does the signal decay slider do?",
      "It applies an exponential envelope, exp(-decay x progress x 4), that shrinks the curve's radius as the trace progresses, producing the fading spiral-in look of a damped oscilloscope trace. The range is 0 to 0.45; the built-in Oscilloscope preset uses 0.18.",
    ],
    [
      "Can I download the Lissajous pattern as an image?",
      "There's no built-in download button. Because the pattern is drawn on a standard HTML canvas element, most desktop browsers offer 'Save image as' in the right-click menu, and a screenshot works everywhere else.",
    ],
    [
      "Is this Lissajous generator free?",
      "Yes — free, with no signup, no account and no usage limit. The generator is pure client-side JavaScript, so it makes no network requests and sends nothing to a server.",
    ],
  ],
  steps: [
    "Pick a preset — Classic 3:2, Infinity Loop, Five Petal, Oscilloscope or Rotated Ribbon — or start from the default 3:2 curve.",
    "Drag the X frequency, Y frequency, phase, rotation, amplitude and decay sliders; the canvas redraws live and the stats panel updates the reduced ratio and lobe count.",
    "Press Animate to drift the phase and watch the curve morph, or press Reset to return to the preset's exact values.",
  ],
};

export default seo;
