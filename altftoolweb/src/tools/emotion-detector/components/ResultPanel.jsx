"use client";

import { useState } from "react";
import { Smile, Camera, Download, Share2, Copy, RefreshCw, AlertTriangle } from "lucide-react";

const EMOTION_METADATA = {
  happy: {
    emoji: "😊",
    label: "Happy",
    color: "bg-teal-500",
    text: "Positive, joyful, and radiant! Smiling releases endorphins and lowers stress. Keep sharing that bright energy!"
  },
  sad: {
    emoji: "😢",
    label: "Sad",
    color: "bg-blue-500",
    text: "Reflective, downcast, or quiet. It's completely okay to feel sad. Be gentle with yourself and take some time to recharge."
  },
  angry: {
    emoji: "😡",
    label: "Angry",
    color: "bg-red-500",
    text: "Frustrated, intense, or irritated. Take a deep, slow breath to reset your nervous system and release tension."
  },
  fearful: {
    emoji: "😨",
    label: "Fearful",
    color: "bg-purple-500",
    text: "Anxious, startled, or guarded. Focus on grounding yourself in your surroundings. You are safe and in control."
  },
  disgusted: {
    emoji: "🤢",
    label: "Disgusted",
    color: "bg-emerald-600",
    text: "Disapproving, averse, or repelled. Something did not meet your taste or expectations. A natural protective reaction!"
  },
  surprised: {
    emoji: "😲",
    label: "Surprised",
    color: "bg-amber-500",
    text: "Stunned, amazed, or startled! Wide eyes and raised brows indicate something unexpected just got your focus."
  },
  neutral: {
    emoji: "😐",
    label: "Neutral",
    color: "bg-slate-400",
    text: "Calm, balanced, and focused. You look steady, composed, and ready to take on tasks or enjoy quiet focus."
  }
};

export default function ResultPanel({ analyzing, result, error, onReset }) {
  const [selectedFaceIdx, setSelectedFaceIdx] = useState(0);

  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]">
        <div className="alt-ui-spinner alt-ui-spinner--lg mb-6 border-t-primary" />
        <h4 className="font-semibold text-lg text-foreground animate-pulse">Running AI Face Analytics...</h4>
        <p className="text-sm text-muted-foreground mt-2">Extracting facial landmarks and expression matrices.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-red-200 bg-red-50/50 rounded-2xl h-full min-h-[300px]">
        <AlertTriangle className="text-red-500 mb-4" size={44} />
        <h4 className="font-semibold text-lg text-red-800">Analysis Failed</h4>
        <p className="text-sm text-red-600 mt-2 max-w-xs">{error}</p>
        <button
          onClick={onReset}
          className="mt-6 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium cursor-pointer transition shadow-sm active:scale-95 duration-100"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!result || result.length === 0) return null;

  const faces = result;
  const currentFace = faces[selectedFaceIdx] || faces[0];

  const formatAnalysisText = () => {
    let report = `=== ALTFTool AI Emotion Detector Report ===\n`;
    report += `Date: ${new Date().toLocaleString()}\n`;
    report += `Detected Faces: ${faces.length}\n\n`;

    faces.forEach((face, idx) => {
      report += `Face ${idx + 1}:\n`;
      report += `  Dominant Emotion: ${face.dominantEmotion} (${Math.round(face.dominantConfidence * 100)}%)\n`;
      report += `  Image Quality: Score ${face.faceQuality?.score || 100}/100 (Lighting: ${face.faceQuality?.lighting || "Unknown"})\n`;
      report += `  Detailed Emotions:\n`;
      Object.entries(face.emotions).forEach(([emo, val]) => {
        report += `    - ${emo}: ${Math.round(val * 100)}%\n`;
      });
      report += `\n`;
    });
    return report;
  };

  const handleDownload = () => {
    const text = formatAnalysisText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emotion-analysis-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      const text = formatAnalysisText();
      await navigator.clipboard.writeText(text);
      alert("Analysis report copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleShare = async () => {
    const text = formatAnalysisText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Emotion Detection Results",
          text
        });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      handleCopy();
    }
  };

  const currentMeta = EMOTION_METADATA[currentFace.dominantEmotion] || EMOTION_METADATA.neutral;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="subheading font-bold text-xl text-foreground">Analysis Report</h3>
        {faces.length > 1 && (
          <div className="flex items-center gap-1.5 bg-[var(--anslation-ds-soft)] p-1 rounded-xl border border-border">
            {faces.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFaceIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  selectedFaceIdx === idx
                    ? "bg-primary text-white shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Face {idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dominant Emotion Card */}
      <div className="bg-[var(--anslation-ds-soft)] rounded-2xl p-6 border border-border relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
        <div className="text-6xl sm:text-7xl p-4 bg-card rounded-2xl border border-border shadow-sm flex items-center justify-center min-w-[100px] h-[100px]">
          {currentMeta.emoji}
        </div>
        <div className="text-center sm:text-left space-y-2">
          <span className="text-xs font-bold px-2.5 py-1 bg-primary/15 text-primary rounded-full uppercase tracking-wider">
            Dominant Mood
          </span>
          <h4 className="text-2xl font-black text-foreground capitalize">
            {currentFace.dominantEmotion}{" "}
            <span className="text-lg font-medium text-muted-foreground">
              ({Math.round(currentFace.dominantConfidence * 100)}%)
            </span>
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentMeta.text}
          </p>
        </div>
      </div>

      {/* Emotion Bars */}
      <div className="space-y-4">
        <h5 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
          <Smile size={16} className="text-primary" /> Emotion Matrix
        </h5>
        <div className="bg-card rounded-2xl p-5 border border-border space-y-4 shadow-sm">
          {Object.entries(currentFace.emotions)
            .sort((a, b) => b[1] - a[1])
            .map(([emo, val]) => {
              const meta = EMOTION_METADATA[emo] || EMOTION_METADATA.neutral;
              const pct = Math.round(val * 100);
              return (
                <div key={emo} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span className="capitalize flex items-center gap-1.5">
                      <span className="text-sm">{meta.emoji}</span> {meta.label}
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden border border-border/30">
                    <div
                      className={`h-full ${meta.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Image Quality Checks */}
      {currentFace.faceQuality && (
        <div className="space-y-4">
          <h5 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
            <Camera size={16} className="text-primary" /> Technical Integrity
          </h5>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card p-4 rounded-xl border border-border text-center">
              <span className="text-xs text-muted-foreground font-semibold block mb-1">Lighting</span>
              <span className="font-bold text-sm text-foreground">{currentFace.faceQuality.lighting}</span>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border text-center">
              <span className="text-xs text-muted-foreground font-semibold block mb-1">Blur Check</span>
              <span className="font-bold text-sm text-foreground">{currentFace.faceQuality.blur}</span>
            </div>
            <div className="col-span-2 bg-card p-4 rounded-xl border border-border flex justify-between items-center">
              <div>
                <span className="text-xs text-muted-foreground font-semibold block">Overall Scan Integrity</span>
                <span className="text-xs text-muted-foreground">Score based on contrast & visibility</span>
              </div>
              <span className="text-2xl font-black text-primary">
                {currentFace.faceQuality.score}/100
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 shadow"
        >
          <Download size={18} /> Download
        </button>

        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-border hover:bg-[var(--anslation-ds-soft)] text-foreground font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100"
        >
          <Share2 size={18} /> Share
        </button>

        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-border hover:bg-[var(--anslation-ds-soft)] text-foreground font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100"
        >
          <Copy size={18} /> Copy
        </button>
      </div>

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 mt-2"
      >
        <RefreshCw size={18} /> Reset & Detect Another Face
      </button>
    </div>
  );
}
