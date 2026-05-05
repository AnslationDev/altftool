import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { User, Calendar, Smile, Shapes, Star, Camera, Download, Share2, Copy } from "lucide-react";
import { formatAnalysisText } from "../services/exportAnalysis";

export default function ResultPanel({ analyzing, result, error, onReset }) {

  if (analyzing) return <LoadingSpinner />;

  if (error) return <ErrorMessage message={error} />;

  if (!result) return null;

  const faces = result?.faces || (Array.isArray(result) ? result : []);

  const handleDownload = () => {
    const text = formatAnalysisText(result);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "face-analysis.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const text = formatAnalysisText(result);
    await navigator.clipboard.writeText(text);
    alert("Analysis copied to clipboard");
  };

  const handleShare = async () => {
    const text = formatAnalysisText(result);

    if (navigator.share) {
      await navigator.share({
        title: "Face Analysis Result",
        text
      });
    } else {
      alert("Sharing not supported on this browser");
    }
  };

  return (
    <div className="flex flex-col justify-center space-y-6">

      <h3 className="subheading">Analysis Results</h3>

      {faces.filter(Boolean).map((face, index) => (

        <div key={index} className="space-y-5 border border-(--border) p-6 rounded-2xl">

          <h4 className="font-semibold text-lg">
            Face {index + 1}
          </h4>

          {/* Gender */}
          <div className="bg-(--card) rounded-2xl p-6 border border-(--border)">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-(--primary) rounded-xl flex items-center justify-center">
                <User className="text-white" size={22} />
              </div>

              <div>
                <p className="text-sm text-(--muted-foreground)">Gender</p>
                <p className="text-2xl font-bold capitalize">
                  {face.gender}
                </p>

                <p className="text-xs text-(--muted-foreground)">
                  Confidence: {(face.genderConfidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Age */}
          <div className="bg-(--card) rounded-2xl p-6 border border-(--border)">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-(--primary) rounded-xl flex items-center justify-center">
                <Calendar className="text-white" size={22} />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Estimated Age Range
                </p>
                <p className="text-2xl font-bold">
                  {face.ageRange.min} - {face.ageRange.max} years
                </p>
              </div>
            </div>
          </div>

          {/* Emotion */}
          <div className="bg-(--card) rounded-2xl p-6 border border-(--border)">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-(--primary) rounded-xl flex items-center justify-center">
                <Smile className="text-white" size={22} />
              </div>

              <div>
                <p className="text-sm text-(--muted-foreground)">Primary Emotion</p>
                <p className="text-2xl font-bold capitalize">
                  {face.dominantEmotion}
                </p>
              </div>
            </div>
          </div>

          {/* Face Shape */}
          <div className="bg-(--card) rounded-2xl p-6 border border-(--border)">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-(--primary) rounded-xl flex items-center justify-center">
                <Shapes className="text-white" size={22} />
              </div>

              <div>
                <p className="text-sm text-(--muted-foreground)">Face Shape</p>
                <p className="text-2xl font-bold capitalize">
                  {face.faceShape}
                </p>
              </div>
            </div>
          </div>

          {/* Celebrity Look-Alike */}
          {face.celebrityMatch && (
            <div className="bg-(--card) rounded-2xl p-6 border border-(--border)">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-(--primary) rounded-xl flex items-center justify-center">
                  <Star className="text-white" size={22} />
                </div>

                <div>
                  <p className="text-sm text-(--muted-foreground)">
                    Celebrity Look-Alike
                  </p>

                  <p className="text-2xl font-bold">
                    {face.celebrityMatch.name}
                  </p>

                  <p className="text-xs text-(--muted-foreground)">
                    {face.celebrityMatch.similarity}% similarity
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Face Quality Score */}
          {face.faceQuality && (
            <div className="bg-(--card) rounded-2xl p-6 border border-(--border)">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-(--primary) rounded-xl flex items-center justify-center">
                  <Camera className="text-white" size={22} />
                </div>

                <div>
                  <p className="text-sm text-(--muted-foreground)">
                    Face Quality Score
                  </p>

                  <p className="text-lg font-semibold">
                    Lighting: {face.faceQuality.lighting}
                  </p>

                  <p className="text-lg font-semibold">
                    Face Visibility: {face.faceQuality.visibility}
                  </p>

                  <p className="text-lg font-semibold">
                    Blur: {face.faceQuality.blur}
                  </p>

                  <p className="text-xl font-bold mt-1">
                    Score: {face.faceQuality.score}/100
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      ))}

      {result.similarity && (
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">
            Similarity: {result.similarity}%
          </p>

          <p className="text-sm text-(--muted-foreground)">
            {result.samePerson ? "Likely same person" : "Different people"}
          </p>
        </div>
      )}

      {/* Download / Share / Copy */}
      <div className="bg-(--card) rounded-2xl p-6 border border-(--border) space-y-4">
        <p className="font-semibold">📤 Download Analysis</p>

        <div className="flex gap-3 flex-wrap">

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-(--primary) text-white rounded-xl cursor-pointer"
          >
            <Download size={18} /> Download Result
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 border border-(--border) rounded-xl cursor-pointer"
          >
            <Share2 size={18} /> Share Result
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 border border-(--border) rounded-xl cursor-pointer"
          >
            <Copy size={18} /> Copy Analysis
          </button>

        </div>
      </div>

      <button
        onClick={onReset}
        className="mt-4 py-3 bg-(--primary) text-white rounded-xl font-semibold cursor-pointer"
      >
        Try Another Photo
      </button>

    </div>
  );
}