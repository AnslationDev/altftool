let faceApiPromise;

function supportsWebGl() {
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

async function initializeTensorflowBackend(faceapi) {
  const { tf } = faceapi;
  const candidates = supportsWebGl() ? ["webgl", "cpu"] : ["cpu"];

  for (const backend of candidates) {
    if (!tf.findBackend(backend)) continue;

    try {
      const selected = await tf.setBackend(backend);
      if (selected) {
        await tf.ready();
        return;
      }
    } catch {
      // Try the next registered browser backend.
    }
  }

  throw new Error("No supported TensorFlow browser backend is available.");
}

export function getFaceApi() {
  if (!faceApiPromise) {
    faceApiPromise = import("@vladmandic/face-api").then(async (faceapi) => {
      await initializeTensorflowBackend(faceapi);
      return faceapi;
    });
  }

  return faceApiPromise;
}
