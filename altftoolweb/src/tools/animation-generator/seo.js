const seo = {
  title: "CSS Animation Generator — Free @keyframes Builder",
  h1: "CSS Animation Generator",
  metaDescription:
    "Free CSS animation generator: tune duration, easing, iteration and transforms, preview live, and read the @keyframes code. Runs entirely in your browser.",
  intro:
    "The Animation Generator builds standard CSS @keyframes animations and applies them to a live preview element in the same page. The timing values you pick are assembled into a CSS animation shorthand, and the keyframe block is injected through an inline style tag, so the sparkle in the playground moves using the exact CSS you would ship — not a simulation of it. You control duration, delay, easing (ease, linear, ease-in, ease-out, ease-in-out), iteration count, direction and fill-mode, plus translateX/Y, rotate, scale and opacity on the object itself. Every rule is generated as a string in your own tab: there is no account, no upload, and no server call anywhere in the tool.",
  useCases: [
    "Prototyping a hero fade-in or slide-in, then lifting the @keyframes block straight into your stylesheet",
    "Comparing easing curves and durations against each other visually before committing a value to production CSS",
    "Recording a short WebM clip of a motion idea to drop into a design review or a pull request",
  ],
  benefits: [
    [
      "Real CSS, not a mock preview",
      "The generated @keyframes block is injected into the page and drives the preview element directly, so what you see is what the browser does with that CSS. There is no separate rendering engine to diverge from your production stylesheet.",
    ],
    [
      "Editable keyframe stops, not just presets",
      "Beyond Fade In, Slide Right and Bounce, the keyframe editor exposes three stops at 0%, 50% and 100%. Each takes a percentage, an opacity value and a free-text transform such as scale(1.2) or translateY(40px), and the CSS regenerates as you type.",
    ],
    [
      "Nothing leaves your browser",
      "The tool makes no network requests. Keyframes, colours and the WebM export are all produced client-side with the Canvas and MediaRecorder APIs, so no design work is uploaded and no sign-up is required.",
    ],
    [
      "A performance sanity check built in",
      "A heuristic scorecard flags the usual motion problems — infinite iteration, sub-half-second durations, scale above 2, movement past 200px — and tells you whether the transform values you chose are GPU-accelerated.",
    ],
  ],
  faqs: [
    [
      "How do I create a CSS animation without writing code?",
      "Pick a base animation, adjust the sliders, and copy the CSS it produces. Start from Fade In (opacity 0 to 1), Slide Right (translateX(-100px) to 0 with a fade) or Bounce (translateY 0 to -30px at the 50% mark), set duration and easing, then take the generated @keyframes block from the code preview under the keyframe editor.",
    ],
    [
      "What CSS properties can this animation generator control?",
      "Duration and delay in seconds, easing (ease, linear, ease-in, ease-out, ease-in-out), iteration count (1 or infinite), direction (normal or alternate) and fill-mode (forwards, backwards, both or none). Separately, the transform controls set translateX, translateY, rotate in degrees, scale and opacity from 0 to 1 on the preview object.",
    ],
    [
      "Is the AI Animation Generator actually AI?",
      "No — it is keyword matching, not a model. Typing anything containing \"fade\", \"zoom\" or \"rotate\" returns the matching keyframe template (opacity 0 to 1, scale 0.5 to 1, or rotate 0 to 360deg); any other text returns a default fade-up that combines opacity 0 to 1 with translateY(40px) to 0. Nothing is sent to an external service.",
    ],
    [
      "How do I copy the generated CSS?",
      "The @keyframes block renders in a live code preview directly beneath the keyframe editor — select it there and copy. Then add the shorthand yourself using the values you chose in the controls, for example: animation: customAnimation 1s ease-in-out 0s infinite alternate forwards;",
    ],
    [
      "Can I export the animation as a video file?",
      "Yes, as WebM rather than MP4. Export Video captures the preview element with html2canvas into a canvas at the pixel size you set (250 x 250 by default), records that canvas stream at 30 fps through the MediaRecorder API for 2 seconds, and downloads animation.webm. Convert it afterwards if your target needs MP4.",
    ],
    [
      "What does the performance score mean?",
      "It is a rule-of-thumb checklist, not a measurement of your real page. The score starts at 100 and deducts 20 for infinite iteration, 10 for a duration under 0.5s, 10 for scale above 2, 10 for movement beyond 200px and 10 for the bounce preset. Above 80 it reads \"Mobile & Desktop\", above 60 \"Desktop Preferred\", and below that \"Avoid heavy usage\".",
    ],
    [
      "Can I make the animation run on hover or click instead of on page load?",
      "Yes — the trigger selector offers Auto Play, On Hover and On Click, and the preview honours all three. In your own code you would reproduce hover and click by attaching the same animation property under a :hover rule or a class your JavaScript toggles.",
    ],
    [
      "Is this animation generator free, and do I need an account?",
      "It is free with no sign-up and no upload step. The whole tool is a client-side React component: keyframes are assembled as strings in your browser, colours come from native colour inputs, and the video export uses the browser's own Canvas and MediaRecorder APIs.",
    ],
  ],
  steps: [
    "Choose Fade In, Slide Right or Bounce in the top dropdown, then set duration and easing. The synchronized Animation Controls panel adds delay, one or infinite iterations, normal or alternate direction, and forwards, backwards, both or none fill mode; Replay restarts the result and the adjacent button pauses or resumes it.",
    "Refine the preview with Translate X, Translate Y, Rotate, Scale and Opacity, choose Auto Play, On Hover or On Click, and pick a solid colour or a 45-degree two-colour gradient. Editing any 0%, 50% or 100% keyframe activates the customAnimation preview and preserves the optional transform text, such as scale(1.2).",
    "Select and copy the @keyframes block shown under Generated CSS, then add an animation shorthand with the timing values you chose. Export Video records about two seconds at the pixel size you enter and downloads animation.webm, while Export Lottie downloads animation.json.",
  ],
};

export default seo;
