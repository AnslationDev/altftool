"use client";

export default function ProgressBar({
  current,
  total,
}) {
  const progress = (current / total) * 100;

  return (
    <div className="w-[320px] sm:w-[420px] md:w-[520px] lg:w-[620px]">
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="font-semibold ">
          Question {String(current).padStart(2, "0")} of{" "}
          {total}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-[#E8EEFF] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#1E63FF] transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <span className="text-[#1E63FF] font-bold text-sm">
          {Math.floor(progress)}%
        </span>
      </div>
    </div>
  );
}