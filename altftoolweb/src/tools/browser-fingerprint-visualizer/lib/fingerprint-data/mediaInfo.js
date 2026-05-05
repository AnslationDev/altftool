

export async function getMediaInfo() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return {
        hasCamera: false,
        hasMicrophone: false,
        hasSpeakers: false,
        cameraCount: 0,
        microphoneCount: 0,
        speakerCount: 0,
        rawValue: "media-not-supported",
      };
    }

  
    const devices = await navigator.mediaDevices.enumerateDevices();

    // Separate by device kind
    const videoInputs = devices.filter((d) => d.kind === "videoinput");   // cameras
    const audioInputs = devices.filter((d) => d.kind === "audioinput");   // microphones
    const audioOutputs = devices.filter((d) => d.kind === "audiooutput"); // speakers

    const rawValue = [
      videoInputs.length,
      audioInputs.length,
      audioOutputs.length,
    ].join("|");

    return {
      hasCamera: videoInputs.length > 0,
      hasMicrophone: audioInputs.length > 0,
      hasSpeakers: audioOutputs.length > 0,
      cameraCount: videoInputs.length,
      microphoneCount: audioInputs.length,
      speakerCount: audioOutputs.length,
      rawValue,
    };
  } catch (error) {
    return {
      hasCamera: false,
      hasMicrophone: false,
      hasSpeakers: false,
      cameraCount: 0,
      microphoneCount: 0,
      speakerCount: 0,
      rawValue: "media-blocked",
    };
  }
}