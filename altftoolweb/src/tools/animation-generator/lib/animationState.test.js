import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_ANIMATION_CONTROLS,
  buildAnimationShorthand,
  buildCustomKeyframes,
  buildLottieDocument,
  buildTransformStyle,
  resolveAnimation,
  updateAnimationControl,
  updateTransform,
} from "./animationState.js";

test("base, AI and custom keyframes resolve to the matching animation name", () => {
  const animations = {
    fadeIn: { keyframes: "@keyframes fadeIn {}" },
    bounce: { keyframes: "@keyframes bounce {}" },
  };

  assert.deepEqual(
    resolveAnimation({ animation: "bounce", animations, customKeyframes: null, aiKeyframes: "" }),
    { name: "bounce", keyframes: "@keyframes bounce {}" },
  );

  assert.deepEqual(
    resolveAnimation({
      animation: "fadeIn",
      animations,
      customKeyframes: null,
      aiKeyframes: "@keyframes aiAnimation {}",
    }),
    { name: "aiAnimation", keyframes: "@keyframes aiAnimation {}" },
  );

  assert.equal(
    resolveAnimation({
      animation: "fadeIn",
      animations,
      customKeyframes: [{ percent: 0, opacity: 0, transform: "" }],
      aiKeyframes: "@keyframes aiAnimation {}",
    }).name,
    "customAnimation",
  );
});

test("custom keyframes preserve the editor transform string", () => {
  const css = buildCustomKeyframes([
    { percent: 0, opacity: 0, transform: "translateY(40px)" },
    { percent: 100, opacity: 1, transform: "scale(1.2)" },
  ]);

  assert.match(css, /transform: translateY\(40px\);/);
  assert.match(css, /transform: scale\(1\.2\);/);
  assert.doesNotMatch(css, /undefined/);
});

test("timing updates preserve the complete animation contract", () => {
  const next = updateAnimationControl(DEFAULT_ANIMATION_CONTROLS, "delay", "0.4");

  assert.deepEqual(next, {
    ...DEFAULT_ANIMATION_CONTROLS,
    delay: "0.4",
  });
  assert.equal(
    buildAnimationShorthand("fadeIn", next),
    "fadeIn 1s ease 0.4s 1 normal forwards",
  );
});

test("transform updates use the same x/y keys consumed by the preview", () => {
  const moved = updateTransform({}, "x", "24");
  const rotated = updateTransform(moved, "rotate", "45");

  assert.equal(buildTransformStyle(rotated), "translate(24px, 0px) scale(1) rotate(45deg)");
  assert.doesNotMatch(buildTransformStyle(rotated), /undefined/);
});

test("Lottie export contains a visible layer and carries preview settings", () => {
  const document = buildLottieDocument({
    size: 320,
    animationName: "fadeIn",
    controls: { ...DEFAULT_ANIMATION_CONTROLS, duration: "2" },
    transform: { x: 12, y: -8, rotate: 30, scale: 1.25, opacity: 0.6 },
    color: "#14B8A6",
  });

  assert.equal(document.w, 320);
  assert.equal(document.op, 120);
  assert.equal(document.layers.length, 1);
  assert.equal(document.layers[0].ks.o.a, 1);
  assert.deepEqual(document.layers[0].ks.o.k[0].s, [0]);
  assert.deepEqual(document.layers[0].ks.o.k.at(-1).s, [60]);
  assert.deepEqual(document.layers[0].ks.p.k, [172, 152, 0]);
  assert.equal(document.layers[0].shapes.at(-1).ty, "fl");
});

test("Lottie export writes transform keyframes for built-in motion", () => {
  const document = buildLottieDocument({
    animationName: "bounce",
    controls: DEFAULT_ANIMATION_CONTROLS,
  });
  const position = document.layers[0].ks.p;

  assert.equal(position.a, 1);
  assert.deepEqual(position.k.map((keyframe) => keyframe.s[1]), [125, 95, 125]);
});

test("Lottie export maps AI and custom transforms to animated properties", () => {
  const aiDocument = buildLottieDocument({
    animationName: "aiAnimation",
    keyframesCss: "@keyframes aiAnimation { 0% { transform: scale(0.5) } 100% { transform: scale(1) } }",
  });
  assert.equal(aiDocument.layers[0].ks.s.a, 1);
  assert.deepEqual(aiDocument.layers[0].ks.s.k[0].s, [50, 50, 100]);
  assert.deepEqual(aiDocument.layers[0].ks.s.k.at(-1).s, [100, 100, 100]);

  const customDocument = buildLottieDocument({
    animationName: "customAnimation",
    customKeyframes: [
      { percent: 0, opacity: 0, transform: "translateX(-20px) rotate(0deg)" },
      { percent: 100, opacity: 1, transform: "translateX(10px) rotate(90deg)" },
    ],
  });
  assert.equal(customDocument.layers[0].ks.p.a, 1);
  assert.deepEqual(customDocument.layers[0].ks.p.k[0].s, [105, 125, 0]);
  assert.deepEqual(customDocument.layers[0].ks.p.k.at(-1).s, [135, 125, 0]);
  assert.deepEqual(customDocument.layers[0].ks.r.k.at(-1).s, [90]);
});

test("infinite Lottie exports are bounded to three loops", () => {
  const document = buildLottieDocument({
    animationName: "slideRight",
    controls: {
      ...DEFAULT_ANIMATION_CONTROLS,
      duration: "0.5",
      delay: "0.25",
      iterations: "infinite",
    },
  });

  assert.equal(document.op, 105);
  assert.equal(document.layers[0].op, 105);
  assert.ok(document.layers[0].ks.p.k.length >= 6);
});
