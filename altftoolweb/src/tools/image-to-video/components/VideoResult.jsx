"use client";

export default function VideoResult({ videoUrl }) {
  if (!videoUrl) return null;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-(--border) bg-(--background)">
      <video
        src={videoUrl} controls autoPlay loop
        className="w-full max-h-[60vh] object-contain bg-black"
      />
      <div className="p-3">
        <a
          href={videoUrl}
          download="video.webm"
          className="block w-full py-2.5 rounded-xl bg-(--primary) text-(--primary-foreground) text-sm font-semibold text-center hover:opacity-90 transition"
        >
          ⬇ Download .webm
        </a>
      </div>
    </div>
  );
}