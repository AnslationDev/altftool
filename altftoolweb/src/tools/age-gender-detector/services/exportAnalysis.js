export function formatAnalysisText(result) {
  const faces = result?.faces || (Array.isArray(result) ? result : []);

  let text = "Face Analysis Result\n\n";

  faces.forEach((face, i) => {
    text += `Face ${i + 1}\n`;
    text += `Gender: ${face.gender} (${(face.genderConfidence * 100).toFixed(1)}%)\n`;
    text += `Age Range: ${face.ageRange.min}-${face.ageRange.max}\n`;
    text += `Emotion: ${face.dominantEmotion}\n`;
    text += `Face Shape: ${face.faceShape}\n`;

    if (face.faceQuality) {
      text += `Lighting: ${face.faceQuality.lighting}\n`;
      text += `Visibility: ${face.faceQuality.visibility}\n`;
      text += `Blur: ${face.faceQuality.blur}\n`;
      text += `Quality Score: ${face.faceQuality.score}/100\n`;
    }

    if (face.celebrityMatch) {
      text += `Celebrity Match: ${face.celebrityMatch.name} (${face.celebrityMatch.similarity}%)\n`;
    }

    text += "\n";
  });

  return text;
}