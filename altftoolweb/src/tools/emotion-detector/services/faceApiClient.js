let faceApiPromise;

export function getFaceApi() {
  if (!faceApiPromise) {
    faceApiPromise = import("@vladmandic/face-api");
  }

  return faceApiPromise;
}
