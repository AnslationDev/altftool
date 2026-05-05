"use client";

export default function ProgressBar({ current, total }) {
  const progress = (current / total) * 100;
  return (
    <div className="w-full bg-(--card) rounded-full h-3 mb-8">
      <div
        className="bg-(--primary) h-3 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
      <p className="text-sm text-(--muted-foreground) mt-2 mb-8 text-center">
        Question {current} of {total}
      </p>
    </div>
  );
}