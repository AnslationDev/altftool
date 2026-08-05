import assert from "node:assert/strict";
import test from "node:test";

import {
  getHowToStepIssues,
  hasPublishableHowToSteps,
  inspectHowToStep,
} from "./howtoStepQuality.js";

const genericSteps = [
  "Adjust the options until the result looks right.",
  "Choose your options and copy the result.",
  "Adjust the options. Copy the result.",
  "Convert the input and download the result.",
  "Choose the appropriate option.",
  "Enter the required details and submit.",
  "Press Submit to continue.",
  'Click the "Generate" button.',
  "Review the generated result and save it.",
  "Upload the selected file and download the final version.",
];

test("rejects generic HowTo instructions despite quotes and capitalization", () => {
  for (const step of genericSteps) {
    assert.equal(inspectHowToStep(step).valid, false, step);
  }
});

test("accepts steps with verifiable tool-specific detail", () => {
  for (const step of [
    "Click Generate Code to create a TOTP.",
    "Export the checksum report as CSV.",
    "Upload a portrait image and crop the face.",
    "Set Auto Speed to 2 seconds and press Start Auto Call.",
  ]) {
    assert.equal(inspectHowToStep(step).valid, true, step);
  }
});

test("requires every step in a publishable HowTo set to pass", () => {
  assert.equal(
    hasPublishableHowToSteps([
      "Upload a portrait image and crop the face.",
      "Copy the result directly from the interface.",
    ]),
    false,
  );
  assert.equal(getHowToStepIssues([])[0].index, -1);
});
