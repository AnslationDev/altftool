const seo = {
  title: "CSS Animation Generator — 15 Presets, Live Preview",
  metaDescription:
    "15 CSS keyframe presets — fade, slide, bounce, shake — with duration, delay, easing, iterations, direction and fill mode. Copy or download the CSS.",
  intro:
    "The Animation Generator builds ready-to-paste CSS keyframe animations from 15 presets — fade, slide in four directions, rotate, bounce, scale up and down, pulse, shake, flip, swing and heartbeat — and lets you set every part of the animation shorthand: duration, delay, timing function, iteration count, direction and fill mode. It previews the result live on a sample element and outputs both the @keyframes block and the matching animation property, which you can copy or download as a .css file. It is for front-end developers and designers who want to see how ease-out at 0.6s actually feels before committing it to a stylesheet.",
  useCases: [
    "You are adding an entrance animation to a hero section and need to compare slideUp at 0.4s ease-out against scaleUp at 0.8s ease-in-out before choosing",
    "A loading badge needs to pulse forever and you want the correct animation shorthand with iteration-count set to infinite rather than guessing at the property order",
    "You are writing a component library and need the raw @keyframes for a shake used on invalid form input, without pulling in an animation dependency",
  ],
  benefits: [
    ["Every shorthand slot is exposed", "Duration, delay, easing, iterations, direction and fill mode are all editable, so you get the full property, not a name and a duration."],
    ["Replays on demand", "One-shot animations can be re-triggered without reloading, which is the only way to actually judge a 300 ms entrance."],
    ["Copy or download the real CSS", "The output is the @keyframes block plus the animation rule — plain CSS with no library, class-name convention or build step attached."],
  ],
  faqs: [
    [
      "What does animation-fill-mode do?",
      "It decides what styles apply outside the animation's running time. `forwards` keeps the final keyframe after the animation ends — which is what you want for a fade-in, otherwise the element snaps back to opacity 0. `backwards` applies the first keyframe during the delay, `both` does both, and `none` does neither.",
    ],
    [
      "What is the difference between ease-in and ease-out?",
      "`ease-in` starts slow and accelerates, so it suits elements leaving the screen; `ease-out` starts fast and decelerates, which is why it reads as more natural for elements entering. `ease` is the CSS default and is a gentler in-and-out curve; `linear` moves at constant speed and is mostly right for continuous rotation.",
    ],
    [
      "How do I make a CSS animation loop forever?",
      "Set the iteration count to `infinite` — in the shorthand that is the value between the delay and the direction, as in `animation: pulse 1s ease 0s infinite normal forwards`. Pair it with `alternate` direction if you want the animation to run backwards on every second cycle instead of jumping back to the start.",
    ],
    [
      "Should I animate transform or top/left?",
      "Transform, in almost every case. `transform` and `opacity` can be handled by the compositor without recalculating layout or repainting, so they stay smooth; animating `top`, `left`, `width` or `height` forces layout work on every frame. All the slide and scale presets here use translate and scale for exactly that reason.",
    ],
  ],
  steps: [
    "Pick a preset from the Select Animation dropdown — Fade In, Fade Out, Slide Up, Slide Down, Slide Right, Slide Left, Rotate, Bounce, Scale Up, Scale Down, Pulse, Shake, Flip, Swing or Heartbeat — or click one of the Fade In, Bounce, Pulse, Rotate and Shake shortcut badges, then set Duration (s), Delay (s), Easing (ease, linear, ease-in, ease-out, ease-in-out), Iterations (1, 2, 3, 5, 10 or infinite), Direction (normal, reverse, alternate, alternate-reverse) and Fill Mode (none, forwards, backwards, both).",
    "Watch it run on the Preview tab, where a status bar reports the Animation name, the Duration and a Status of Playing or Paused. Click Replay to re-trigger a one-shot animation from the start, or Pause to freeze it — the button then reads Play.",
    "Switch to the CSS Code tab for the Generated CSS: the `.animated-element` rule plus the matching @keyframes block. Copy puts it on the clipboard and briefly reads Copied!, and the Download CSS button saves it as <animation>-animation.css, for example fadeIn-animation.css.",
  ],
};

export default seo;
