export default function SkeletonCard() {
  return (
    <div className="tdp-neo-card flex h-full flex-col overflow-hidden bg-[#ffffff] p-2.5">
      <div className="tdp-shimmer aspect-square w-full rounded-[14px] border-2 border-[#171717]" />
      <div className="flex flex-1 flex-col gap-2 px-1 pb-1 pt-3.5">
        <div className="tdp-shimmer h-5 w-1/2 rounded" />
        <div className="tdp-shimmer h-4 w-3/4 rounded" />
        <div className="tdp-shimmer h-3.5 w-1/3 rounded" />
        <div className="tdp-shimmer h-3 w-2/5 rounded" />
        <div className="tdp-shimmer mt-auto h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}
