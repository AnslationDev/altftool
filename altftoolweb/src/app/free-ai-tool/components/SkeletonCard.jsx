export default function SkeletonCard() {
  return (
    <div className="fat-card rounded-3xl p-3" aria-hidden="true">
      <div className="fat-shimmer h-40 rounded-2xl sm:h-44" />
      <div className="px-2.5 pb-2 pt-4">
        <div className="fat-shimmer h-5 w-2/5 rounded-full" />
        <div className="fat-shimmer mt-3 h-3 w-full rounded-full" />
        <div className="fat-shimmer mt-2 h-3 w-full rounded-full" />
        <div className="fat-shimmer mt-2 h-3 w-2/3 rounded-full" />
        <div className="mt-5 flex justify-end">
          <div className="fat-shimmer h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}
