export const DEFAULT_ANIMATION_CONTROLS = Object.freeze({
  duration: "1",
  delay: "0",
  easing: "ease",
  iterations: "1",
  direction: "normal",
  fill: "forwards",
});

export const DEFAULT_TRANSFORM = Object.freeze({
  x: 0,
  y: 0,
  rotate: 0,
  scale: 1,
  opacity: 1,
});

export function updateAnimationControl(current, key, value) {
  return {
    ...DEFAULT_ANIMATION_CONTROLS,
    ...current,
    [key]: value,
  };
}

export function updateTransform(current, key, rawValue) {
  const parsed = Number(rawValue);
  return {
    ...DEFAULT_TRANSFORM,
    ...current,
    [key]: Number.isFinite(parsed) ? parsed : DEFAULT_TRANSFORM[key],
  };
}

export function buildTransformStyle(transform) {
  const value = { ...DEFAULT_TRANSFORM, ...transform };
  return `translate(${value.x}px, ${value.y}px) scale(${value.scale}) rotate(${value.rotate}deg)`;
}

export function buildAnimationShorthand(name, controls) {
  const value = { ...DEFAULT_ANIMATION_CONTROLS, ...controls };
  return `${name} ${value.duration}s ${value.easing} ${value.delay}s ${value.iterations} ${value.direction} ${value.fill}`;
}

export function buildCustomKeyframes(frames) {
  const stops = (frames || [])
    .map((frame) => {
      const transform = String(frame.transform || "").trim();
      return `  ${frame.percent}% {\n    opacity: ${frame.opacity};${
        transform ? `\n    transform: ${transform};` : ""
      }\n  }`;
    })
    .join("\n");

  return `@keyframes customAnimation {\n${stops}\n}`;
}

export function resolveAnimation({ animation, animations, customKeyframes, aiKeyframes }) {
  if (Array.isArray(customKeyframes) && customKeyframes.length > 0) {
    return {
      name: "customAnimation",
      keyframes: buildCustomKeyframes(customKeyframes),
    };
  }

  if (String(aiKeyframes || "").trim()) {
    return { name: "aiAnimation", keyframes: aiKeyframes };
  }

  return {
    name: animation,
    keyframes: animations[animation]?.keyframes || "",
  };
}

function hexToLottieColor(hex) {
  const match = /^#([0-9a-f]{6})$/i.exec(String(hex || ""));
  if (!match) return [0.078, 0.722, 0.651, 1];
  const value = Number.parseInt(match[1], 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
    1,
  ];
}

const LOTTIE_FRAME_RATE = 60;
export const LOTTIE_INFINITE_PREVIEW_ITERATIONS = 3;
const NEUTRAL_MOTION_FRAME = Object.freeze({
  progress: 0,
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
});

function clampNumber(value, minimum, maximum, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

function motionFrame(progress, values = {}) {
  return {
    ...NEUTRAL_MOTION_FRAME,
    ...values,
    progress: clampNumber(progress, 0, 1, 0),
  };
}

function parseTransform(transform) {
  const source = String(transform || "");
  const parsed = { x: 0, y: 0, scale: 1, rotate: 0 };
  const number = "(-?(?:\\d+(?:\\.\\d+)?|\\.\\d+))";
  const translate = new RegExp(`translate\\(\\s*${number}px(?:\\s*,\\s*${number}px)?\\s*\\)`, "i").exec(source);
  const translateX = new RegExp(`translateX\\(\\s*${number}px\\s*\\)`, "i").exec(source);
  const translateY = new RegExp(`translateY\\(\\s*${number}px\\s*\\)`, "i").exec(source);
  const scale = new RegExp(`scale\\(\\s*${number}\\s*\\)`, "i").exec(source);
  const rotate = new RegExp(`rotate\\(\\s*${number}deg\\s*\\)`, "i").exec(source);

  if (translate) {
    parsed.x = Number(translate[1]);
    parsed.y = translate[2] === undefined ? 0 : Number(translate[2]);
  }
  if (translateX) parsed.x = Number(translateX[1]);
  if (translateY) parsed.y = Number(translateY[1]);
  if (scale) parsed.scale = Number(scale[1]);
  if (rotate) parsed.rotate = Number(rotate[1]);

  return parsed;
}

function normalizeCustomMotionFrames(customKeyframes) {
  const frames = (customKeyframes || [])
    .map((frame) => {
      const parsedTransform = parseTransform(frame.transform);
      return motionFrame(clampNumber(frame.percent, 0, 100, 0) / 100, {
        opacity: clampNumber(frame.opacity, 0, 1, 1),
        ...parsedTransform,
      });
    })
    .sort((left, right) => left.progress - right.progress)
    .filter((frame, index, framesList) => {
      const next = framesList[index + 1];
      return !next || next.progress !== frame.progress;
    });

  if (frames.length === 0) return null;
  if (frames[0].progress > 0) frames.unshift(motionFrame(0));
  if (frames.at(-1).progress < 1) frames.push(motionFrame(1));
  return frames;
}

function resolveMotionFrames({ animationName, keyframesCss, customKeyframes }) {
  if (animationName === "customAnimation") {
    const customFrames = normalizeCustomMotionFrames(customKeyframes);
    if (customFrames) return customFrames;
  }

  if (animationName === "fadeIn") {
    return [motionFrame(0, { opacity: 0 }), motionFrame(1)];
  }
  if (animationName === "slideRight") {
    return [motionFrame(0, { opacity: 0, x: -100 }), motionFrame(1)];
  }
  if (animationName === "bounce") {
    return [motionFrame(0), motionFrame(0.5, { y: -30 }), motionFrame(1)];
  }

  const css = String(keyframesCss || "");
  if (/scale\(\s*0?\.5\s*\)/i.test(css)) {
    return [motionFrame(0, { scale: 0.5 }), motionFrame(1)];
  }
  if (/rotate\(\s*360deg\s*\)/i.test(css)) {
    return [motionFrame(0), motionFrame(1, { rotate: 360 })];
  }
  if (/translateY\(\s*40px\s*\)/i.test(css)) {
    return [motionFrame(0, { opacity: 0, y: 40 }), motionFrame(1)];
  }
  if (/opacity\s*:\s*0(?:\D|$)/i.test(css) && /opacity\s*:\s*1(?:\D|$)/i.test(css)) {
    return [motionFrame(0, { opacity: 0 }), motionFrame(1)];
  }

  return [motionFrame(0), motionFrame(1)];
}

function motionFramesForDirection(frames, reverse) {
  if (!reverse) return frames;
  return frames
    .map((frame) => ({ ...frame, progress: 1 - frame.progress }))
    .reverse();
}

function sameMotionFrame(left, right) {
  return ["opacity", "x", "y", "scale", "rotate"].every((key) => left[key] === right[key]);
}

function buildMotionTimeline(frames, durationFrames, delayFrames, iterations, direction) {
  const timeline = [];
  const append = (time, frame) => {
    const current = { time, ...frame };
    const previous = timeline.at(-1);
    if (previous && previous.time === time && sameMotionFrame(previous, current)) return;
    if (previous && previous.time === time) previous.time = Math.max(0, time - 0.001);
    timeline.push(current);
  };

  if (delayFrames > 0) {
    append(0, frames[0]);
    append(delayFrames, frames[0]);
  }

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const reverse = direction === "alternate" && iteration % 2 === 1;
    const iterationFrames = motionFramesForDirection(frames, reverse);
    const start = delayFrames + iteration * durationFrames;
    iterationFrames.forEach((frame) => append(start + frame.progress * durationFrames, frame));
  }

  return timeline;
}

function lottieEasing(easing, dimensions) {
  const curves = {
    ease: [0.25, 0.1, 0.25, 1],
    "ease-in": [0.42, 0, 1, 1],
    "ease-out": [0, 0, 0.58, 1],
    "ease-in-out": [0.42, 0, 0.58, 1],
    linear: [0, 0, 1, 1],
  };
  const [outX, outY, inX, inY] = curves[easing] || curves.ease;
  return {
    o: { x: Array(dimensions).fill(outX), y: Array(dimensions).fill(outY) },
    i: { x: Array(dimensions).fill(inX), y: Array(dimensions).fill(inY) },
  };
}

function lottieProperty(timeline, readValue, easing) {
  const values = timeline.map(readValue);
  const serialize = (value) => (Array.isArray(value) ? value : [value]);
  const first = JSON.stringify(values[0]);
  if (values.every((value) => JSON.stringify(value) === first)) {
    return { a: 0, k: values[0] };
  }

  return {
    a: 1,
    k: timeline.map((point, index) => {
      const current = serialize(values[index]);
      const keyframe = { t: point.time, s: current };
      if (index < timeline.length - 1) {
        keyframe.e = serialize(values[index + 1]);
        Object.assign(keyframe, lottieEasing(easing, current.length));
      }
      return keyframe;
    }),
  };
}

/** Build a valid, visible, bounded Lottie animation for the current preview state. */
export function buildLottieDocument({
  size = 250,
  animationName = "Generated Animation",
  controls = DEFAULT_ANIMATION_CONTROLS,
  transform = DEFAULT_TRANSFORM,
  color = "#14B8A6",
  keyframesCss = "",
  customKeyframes = null,
} = {}) {
  const safeSize = Math.min(2000, Math.max(32, Math.round(Number(size) || 250)));
  const seconds = clampNumber(controls.duration, 0.1, 60, 1);
  const delaySeconds = clampNumber(controls.delay, 0, 60, 0);
  const durationFrames = Math.max(1, Math.round(seconds * LOTTIE_FRAME_RATE));
  const delayFrames = Math.round(delaySeconds * LOTTIE_FRAME_RATE);
  const parsedIterations = Number.parseInt(controls.iterations, 10);
  const iterations = controls.iterations === "infinite"
    ? LOTTIE_INFINITE_PREVIEW_ITERATIONS
    : Math.min(10, Math.max(1, Number.isFinite(parsedIterations) ? parsedIterations : 1));
  const totalFrames = delayFrames + durationFrames * iterations;
  const value = { ...DEFAULT_TRANSFORM, ...transform };
  const baseX = Number.isFinite(Number(value.x)) ? Number(value.x) : 0;
  const baseY = Number.isFinite(Number(value.y)) ? Number(value.y) : 0;
  const baseRotate = Number.isFinite(Number(value.rotate)) ? Number(value.rotate) : 0;
  const baseScale = Number.isFinite(Number(value.scale)) ? Number(value.scale) : 1;
  const baseOpacity = clampNumber(value.opacity, 0, 1, 1);
  const motionFrames = resolveMotionFrames({ animationName, keyframesCss, customKeyframes });
  const timeline = buildMotionTimeline(
    motionFrames,
    durationFrames,
    delayFrames,
    iterations,
    controls.direction,
  );

  return {
    v: "5.7.4",
    fr: LOTTIE_FRAME_RATE,
    ip: 0,
    op: totalFrames,
    w: safeSize,
    h: safeSize,
    nm: String(animationName || "Generated Animation"),
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: `${String(animationName || "Animation")} preview`,
        sr: 1,
        ks: {
          o: lottieProperty(timeline, (frame) => baseOpacity * frame.opacity * 100, controls.easing),
          r: lottieProperty(timeline, (frame) => baseRotate + frame.rotate, controls.easing),
          p: lottieProperty(
            timeline,
            (frame) => [safeSize / 2 + baseX + frame.x, safeSize / 2 + baseY + frame.y, 0],
            controls.easing,
          ),
          a: { a: 0, k: [0, 0, 0] },
          s: lottieProperty(
            timeline,
            (frame) => [baseScale * frame.scale * 100, baseScale * frame.scale * 100, 100],
            controls.easing,
          ),
        },
        ao: 0,
        shapes: [
          {
            ty: "rc",
            d: 1,
            s: { a: 0, k: [safeSize * 0.4, safeSize * 0.4] },
            p: { a: 0, k: [0, 0] },
            r: { a: 0, k: safeSize * 0.04 },
            nm: "Preview shape",
          },
          {
            ty: "fl",
            c: { a: 0, k: hexToLottieColor(color) },
            o: { a: 0, k: 100 },
            r: 1,
            nm: "Preview fill",
          },
        ],
        ip: 0,
        op: totalFrames,
        st: 0,
        bm: 0,
      },
    ],
  };
}
