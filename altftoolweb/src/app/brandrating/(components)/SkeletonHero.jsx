export default function SkeletonHero() {
  return (
    <section className="section w-full ">
      
      {/* Banner Skeleton */}
      <div className="relative w-full  bg-(--muted-foreground)/20 h-[180px] sm:h-[260px] md:h-[320px] lg:h-[420px] xl:h-[550px] rounded-xl sm:rounded-2xl overflow-hidden">
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 animate-shimmer" />
      </div>

      {/* Dots Skeleton */}
      <div className="flex justify-center gap-4 mt-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-2 w-6 rounded-full animate-pulse "
          />
        ))}
      </div>
    </section>
  );
}