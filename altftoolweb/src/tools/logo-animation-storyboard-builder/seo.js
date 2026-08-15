const seo = {
  title: "Logo Sting Storyboard: Frame-Accurate Beat",
  metaDescription:
    "Split a logo sting into weighted beats and get whole-frame in and out points, SMPTE timecodes and a cubic-bezier easing curve for each one.",
  steps: [
    "Enter Total sting length (ms) and pick a Frame rate, then name each beat and give it a Relative weight.",
    "Set an Easing per beat — decelerate, accelerate or standard — and use Add a beat for another step.",
    "Read the In and Out timecodes, the frame count per beat and any warning for beats under 100ms, then press Copy shot list.",
  ],
  intro:
    "The Logo Animation Storyboard Builder converts a total sting length and a set of weighted beats into whole-frame in and out points, SMPTE timecodes and a CSS cubic-bezier easing curve for each step. Frames are allocated by rounding the running cumulative total rather than each beat separately, so the parts always add up to the timeline exactly with no dropped or doubled frame. It also checks each beat against the motion band that reads as movement rather than a cut - roughly 100ms at the low end and 500ms for a single element - and flags stings long enough to need a pause control under WCAG 2.1 SC 2.2.2.",
  useCases: [
    "Plan a 3 second, 30fps brand sting as build, form, wordmark and settle before touching After Effects.",
    "Re-time an existing storyboard from 30fps to 24fps and get the new whole-frame boundaries without drift.",
    "Hand an animator a shot list with exact in and out timecodes instead of a vague description of the reveal.",
    "Check that no beat has been squeezed under 100 milliseconds, where the motion stops reading as motion.",
  ],
  benefits: [
    ["Frames always add up", "Cumulative rounding guarantees the beats sum to the timeline exactly, whatever the weights."],
    ["Real easing values", "Every beat carries a cubic-bezier you can paste straight into CSS or a keyframe editor."],
    ["Timing sanity checks", "Warns about beats that round to zero frames, land under 100ms, or push the sting past the 5 second pausable threshold."],
  ],
  faqs: [
    [
      "How long should a logo animation be?",
      "Most brand stings sit between 2 and 5 seconds. Past 5 seconds, WCAG 2.1 SC 2.2.2 asks for a way to pause, stop or hide auto-playing motion shown alongside other content, which is a practical reason to keep a web sting short.",
    ],
    [
      "How short can a single animation beat be?",
      "About 100 milliseconds. Below that the eye reads the change as an instant cut instead of a movement, which is why Material Design's shortest motion durations start there. Simple transitions typically land near 200ms and medium ones near 300ms.",
    ],
    [
      "What easing curve should a logo reveal use?",
      "Use decelerate, cubic-bezier(0, 0, 0.2, 1), for something entering the frame; accelerate, cubic-bezier(0.4, 0, 1, 1), for something leaving; and the standard curve, cubic-bezier(0.4, 0, 0.2, 1), for movement within the frame. Linear is only right for continuous motion such as a rotation.",
    ],
    [
      "How do I convert milliseconds to frames?",
      "Multiply the duration in seconds by the frame rate and round to a whole frame: 500ms at 30fps is 15 frames. Rounding each beat independently makes the parts drift away from the total, so this tool rounds the running cumulative boundary instead, which keeps the sum exact.",
    ],
  ],
};

export default seo;
