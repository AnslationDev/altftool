"use client";
export default function LoadingState() {
  return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 border-t-(--primary) mb-4"></div>
      <p className="text-(--foreground) text-sm sm:text-base">
        Reading the stars...
      </p>
    </div>
  );
}
