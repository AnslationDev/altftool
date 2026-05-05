"use client";
export function setupAudioAnalyzer(stream) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioCtx();

  const analyser = audioContext.createAnalyser();
  const microphone = audioContext.createMediaStreamSource(stream);

  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.75;

  microphone.connect(analyser);

  return { audioContext, analyser, microphone };
}
