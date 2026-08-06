import assert from "node:assert/strict";
import test from "node:test";

import {
  buildVoiceprintPitchShiftCommand,
  probeAudioSampleRate,
  voiceprintShiftMultiplier,
} from "./voiceprintPitchShift.js";

test("sample-rate probe reads ffprobe output and cleans its temporary file", async () => {
  const calls = [];
  const ffmpeg = {
    ffprobe: async (args) => calls.push(["probe", args]),
    readFile: async (name) => {
      calls.push(["read", name]);
      return new TextEncoder().encode("8000\n");
    },
    deleteFile: async (name) => calls.push(["delete", name]),
  };

  assert.equal(await probeAudioSampleRate(ffmpeg, "voice.wav"), 8000);
  assert.equal(calls[0][1].at(-3), "voice.wav");
  assert.deepEqual(calls.at(-1), ["delete", "voiceprint-anonymizer-probe.txt"]);
});

test("sample-rate probe fails closed instead of guessing 48 kHz", async () => {
  await assert.rejects(
    probeAudioSampleRate({}, "voice.wav"),
    /cannot read the source sample rate/,
  );

  const deleted = [];
  await assert.rejects(
    probeAudioSampleRate(
      {
        ffprobe: async () => {
          throw new Error("probe failed");
        },
        readFile: async () => "",
        deleteFile: async (name) => deleted.push(name),
      },
      "voice.wav",
    ),
    /Could not read this audio file's sample rate/,
  );
  assert.deepEqual(deleted, ["voiceprint-anonymizer-probe.txt"]);
});

test("pitch command uses the native rate and duration-restoring inverse tempo", () => {
  const up = voiceprintShiftMultiplier("subtle-up");
  const command = buildVoiceprintPitchShiftCommand({
    input: "voice.wav",
    output: "shifted.wav",
    choice: "subtle-up",
    sourceRate: 8000,
  });
  assert.equal(up, 1.08);
  assert.match(command[3], /^asetrate=8000\*1\.08,aresample=48000,atempo=/);
  assert.match(command[3], new RegExp(`atempo=${1 / up}`));
  assert.equal(command.at(-1), "shifted.wav");
});
