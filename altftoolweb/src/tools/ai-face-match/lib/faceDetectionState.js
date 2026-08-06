export function getFaceDetectionError(firstDetection, secondDetection) {
  if (firstDetection && secondDetection) return "";

  if (!firstDetection && !secondDetection) {
    return "No face was detected in either photo. Use clear, front-facing photos with good lighting and try again.";
  }

  const missingPhoto = firstDetection ? "Photo 2" : "Photo 1";
  return `No face was detected in ${missingPhoto}. Replace it with a clear, front-facing photo and try again.`;
}
