const seo = {
  title: "Spirograph Generator — Free Online Pattern Maker",
  h1: "Free Online Spirograph Generator",
  metaDescription:
    "Free spirograph generator: tune hypotrochoid and epitrochoid curves, animate the draw, and export 640×640 PNG, JPG, SVG or WebM in your browser.",
  intro:
    "The Spirograph Generator plots hypotrochoid and epitrochoid curves on a 640×640 HTML5 canvas using the classic roulette equations — x = (R−r)·cos θ + d·cos(((R−r)/r)·θ) for a wheel rolling inside the circle, with (R+r) substituted throughout for one rolling outside — and joins each sample with a canvas lineTo. It sweeps θ through 40 full revolutions at your chosen Drawing Step (0.02 radians by default), so a smaller step means more points and a smoother line. A third Harmonic mode replaces the (R±r)/r frequency with a plain Inner Loop multiplier, producing Lissajous-style wave patterns instead of petals. Everything renders locally: the source makes no network requests, and exports are built as canvas data URLs or blobs, so nothing you draw is ever uploaded.",
  useCases: [
    "A maker exporting the pattern as SVG so the vector path can drive a pen plotter, laser cutter or vinyl cutter at any size.",
    "A maths teacher demonstrating how changing the (R−r)/r ratio turns a hypotrochoid from a clean five-petal flower into dense lace.",
    "A designer recording a six-second WebM of the curve drawing itself for a title card, loop or social post.",
  ],
  benefits: [
    [
      "Three curve modes, not one",
      "Hypotrochoid (wheel inside), Epitrochoid (wheel outside) and Harmonic, which drops the rolling-radius frequency for a free Inner Loop multiplier.",
    ],
    [
      "Real vector output",
      "SVG export writes an actual <path> of M/L commands at two-decimal precision in a 640×640 viewBox, so prints and cutting files stay sharp at any scale.",
    ],
    [
      "Twenty presets as starting points",
      "Classic Flower, Complex Mandala, Galaxy Swirl and 17 more each set mode, both radii, pen distance, step, line width, loop count and colour in one click.",
    ],
    [
      "Nothing leaves your device",
      "The tool is a client-side React component with no fetch calls anywhere in its source — no account, no upload, no watermark on exports.",
    ],
  ],
  faqs: [
    [
      "What is the formula for a spirograph pattern?",
      "A spirograph traces a hypotrochoid: x = (R−r)·cos θ + d·cos(((R−r)/r)·θ) and y = (R−r)·sin θ − d·sin(((R−r)/r)·θ), where R is the fixed outer radius, r the rolling inner radius and d the pen's distance from the inner wheel's centre. Swap (R−r) for (R+r) and you get the epitrochoid, the version where the wheel rolls around the outside. This tool evaluates exactly those equations, with separate Outer Loop and Inner Loop multipliers on θ in each term.",
    ],
    [
      "What is the difference between a hypotrochoid and an epitrochoid?",
      "A hypotrochoid is traced by a pen on a small circle rolling inside a larger one; an epitrochoid rolls around the outside. In practice, inside patterns read as flowers, rosettes and mandalas, while outside patterns read as stars, sunbursts and pinwheels. Switch between them with the Pattern Type tabs — every other parameter carries over, so you can compare the same settings both ways.",
    ],
    [
      "Can I download a spirograph as an SVG file?",
      "Yes. Pick SVG in the export dropdown and you get a true vector file — one <path> element per line, with a 640×640 viewBox and your background as a filled rect — which scales to any print or cutting size without softening. PNG and JPG are also available but are fixed at the 640×640 canvas size, with JPG encoded at 0.95 quality.",
    ],
    [
      "Is this spirograph generator free to use?",
      "Yes — free, with no signup, no account and no watermark. The whole tool runs as client-side JavaScript on an HTML canvas; there are no API or fetch calls in its source, and exports are generated in the browser and saved straight to your downloads folder.",
    ],
    [
      "Why does my spirograph pattern not close into a clean shape?",
      "Because a spirograph only closes when the radius ratio reduces to a simple fraction. The generator always plots 40 full revolutions of θ, so if (R−r)/r works out to something like 3/7 the path retraces itself and closes early; if the ratio is close to irrational, each pass lands slightly off the previous one and the figure fills in as dense lace. Nudge the Inner Radius up or down by one or two units to snap it back to a closed figure.",
    ],
    [
      "How do I make the spirograph lines smoother?",
      "Lower the Drawing Step. It is the θ increment between plotted points — 0.02 radians by default, editable in 0.001 increments — so halving it roughly doubles the number of line segments and smooths every curve. Raising it gives a faster, deliberately angular sketch. Line Width sets stroke thickness separately, in 0.1 px steps.",
    ],
    [
      "Can I export the spirograph animation as a video?",
      "Yes. Choose Video (WebM), and the tool captures the live canvas at 30 fps via canvas.captureStream and records roughly six seconds with MediaRecorder using the VP9 codec, then downloads a .webm file. This needs a browser that supports video/webm;codecs=vp9 in MediaRecorder — Chrome, Edge and Firefox do; Safari's support is limited. For a still image, use PNG, JPG or SVG instead.",
    ],
    [
      "How do I make a multi-colored spirograph?",
      "Turn on Multi-line Pattern and set a Line Count. The tool draws that many copies of the curve, each phase-shifted by 2π divided by the count, and paints the later half of them in your Secondary Colour. Stroke colour, secondary colour and background are all full colour pickers, backed by 10 quick-pick swatches.",
    ],
  ],
  steps: [
    "Choose a Pattern Type — Hypotrochoid, Epitrochoid or Harmonic — or open Style Presets and load one of the 20 ready-made designs, which sets every parameter at once.",
    "Tune Outer Radius, Inner Radius, Pen Distance, Outer Loop, Inner Loop, Drawing Step and Line Width, then set your stroke colour, background and optional multi-line effect.",
    "Hit Play to watch the curve draw, zoom between 40% and 300% with the +/− buttons or a two-finger pinch, then pick PNG, JPG, SVG or Video (WebM) and press Export.",
  ],
};

export default seo;
