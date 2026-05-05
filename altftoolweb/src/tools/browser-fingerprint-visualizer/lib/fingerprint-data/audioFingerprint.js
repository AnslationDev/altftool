

export async function getAudioFingerprint() {
  try {
    
    const AudioContext =
      window.OfflineAudioContext || window.webkitOfflineAudioContext;

    if (!AudioContext) {
      return { hash: "not-supported", rawValue: "audio-not-supported" };
    }

    const context = new AudioContext(1, 5000, 44100);

    // Create oscillator — generates a sine wave signal
    const oscillator = context.createOscillator();
    oscillator.type = "triangle"; 
    oscillator.frequency.value = 10000; 

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;

    // Connect: oscillator → compressor → output
    oscillator.connect(compressor);
    compressor.connect(context.destination);

    // Start oscillator and render
    oscillator.start(0);

    const renderedBuffer = await context.startRendering();

    // Extract float values from the audio buffer
    const audioData = renderedBuffer.getChannelData(0);

    // Sum a slice of float values — unique per device
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += Math.abs(audioData[i]);
    }

    // Convert sum to a string for hashing
    const rawValue = sum.toString();

    return {
      rawValue,
      sampleRate: context.sampleRate,
      channelCount: renderedBuffer.numberOfChannels,
    };
  } catch (error) {
    return {
      rawValue: "audio-blocked",
      sampleRate: null,
      channelCount: null,
    };
  }
}