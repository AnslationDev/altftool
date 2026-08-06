const PROBE_OUTPUT = "voiceprint-anonymizer-probe.txt";

export function voiceprintShiftMultiplier(choice) {
  const factor = String(choice).includes("strong") ? 1.18 : 1.08;
  return String(choice).includes("down") ? 1 / factor : factor;
}

/**
 * Read the decoded audio stream's native sample rate. A guessed rate can
 * reverse the requested pitch shift and badly alter duration, so this helper
 * deliberately rejects when probing is unavailable or inconclusive.
 */
export async function probeAudioSampleRate(ffmpeg, input, probeOutput = PROBE_OUTPUT) {
  if (!ffmpeg?.ffprobe) {
    throw new Error(
      "This browser's media engine cannot read the source sample rate, so the voice shift was not run.",
    );
  }

  try {
    await ffmpeg.ffprobe([
      "-v",
      "error",
      "-select_streams",
      "a:0",
      "-show_entries",
      "stream=sample_rate",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      input,
      "-o",
      probeOutput,
    ]);
    const bytes = await ffmpeg.readFile(probeOutput);
    const text = typeof bytes === "string" ? bytes : new TextDecoder().decode(bytes);
    const parsed = Number.parseInt(text.trim().split(/\s+/)[0], 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error("No valid audio sample rate was reported.");
    }
    return parsed;
  } catch {
    throw new Error(
      "Could not read this audio file's sample rate, so the voice shift was not run.",
    );
  } finally {
    try {
      await ffmpeg.deleteFile?.(probeOutput);
    } catch {
      // A failed cleanup must not hide the useful probe error above.
    }
  }
}

export function buildVoiceprintPitchShiftCommand({ input, output, choice, sourceRate }) {
  const rate = Number(sourceRate);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("A valid source sample rate is required for the voice shift.");
  }
  const multiplier = voiceprintShiftMultiplier(choice);
  return [
    "-i",
    input,
    "-af",
    `asetrate=${rate}*${multiplier},aresample=48000,atempo=${1 / multiplier},highpass=f=100,lowpass=f=8500`,
    output,
  ];
}
