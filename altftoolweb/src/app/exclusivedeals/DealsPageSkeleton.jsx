// 🔹 HERO SKELETON
export function HeroSkeleton() {
  return (
    <div className="cursor-pointer section animate-pulse">
      
      {/* Slider Banner */}
      <div className="overflow-hidden">
        <div className="min-w-full px-1">
          <div className="relative w-full h-[180px] sm:h-[260px] md:h-[320px] lg:h-[420px] xl:h-[550px] rounded-xl sm:rounded-2xl bg-[var(--muted)]" />
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-[var(--muted)] opacity-60"
          />
        ))}
      </div>
    </div>
  );
}

// 🔹 OUTLET DEALS SECTION SKELETON
export function OutletDealsSkeleton() {
  return (
    <section className="section animate-pulse">
      
      {/* Heading */}
      <div className="lg:mb-12 mb-6">
        <div className="h-8 w-72 bg-[var(--muted)] rounded mb-3" />
        <div className="h-4 w-96 bg-[var(--muted)] rounded" />
      </div>

      {/* Mobile Scroll */}
      <div className="lg:hidden">
        <div className="flex gap-3 pt-6 px-2 overflow-x-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <OutletCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <OutletCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

function OutletCardSkeleton() {
  return (
    <div className="w-55 sm:w-62 md:w-72 mb-6 md:mb-10">
      
      <div className="relative w-full h-57 md:h-70 [@media(min-width:1650px)]:h-80">
        
        {/* Background shape */}
        <div className="absolute inset-0 bg-[var(--muted)] rounded-2xl" />

        <div className="relative z-10 h-full flex flex-col justify-between">
          
          {/* Top bar */}
          <div className="flex items-center h-14 md:h-18 bg-[var(--muted)] rounded-t-2xl px-3">
            
            {/* Brand image */}
            <div className="h-19 md:h-24 w-17 md:w-20 bg-gray-300 rounded" />

            {/* Discount */}
            <div className="ml-auto h-6 w-20 bg-gray-300 rounded" />
          </div>

          {/* Content */}
          <div className="px-4 py-4 flex-1 space-y-3">
            <div className="h-5 w-3/4 bg-[var(--muted)] rounded" />
            <div className="h-4 w-full bg-[var(--muted)] rounded" />
            <div className="h-4 w-5/6 bg-[var(--muted)] rounded" />
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between px-3 pb-3">
            
            {/* Logo */}
            <div className="w-29 sm:w-30 h-8 bg-[var(--muted)] rounded" />

            {/* Button */}
            <div className="w-10 h-10 md:w-14 md:h-14 bg-[var(--muted)] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔹 BROWSER CATEGORY SKELETON
export function BrowserCategorySkeleton() {
  return (
    <div className="section animate-pulse">
      
      {/* Heading */}
      <div className="mb-4">
        <div className="h-8 w-56 bg-[var(--muted)] rounded mb-2" />
        <div className="h-4 w-80 bg-[var(--muted)] rounded" />
      </div>

      {/* Categories */}
      <div className="flex gap-4 overflow-x-hidden lg:grid lg:grid-cols-6 lg:gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <CategoryItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function CategoryItemSkeleton() {
  return (
    <div className="flex justify-center items-center flex-col min-h-[140px] py-4">
      
      {/* Circle Image */}
      <div className="rounded-full bg-[var(--muted)] w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 lg:w-30 lg:h-30 xl:w-36 xl:h-36 2xl:w-40 2xl:h-40" />

      {/* Text */}
      <div className="mt-2 h-4 w-16 bg-[var(--muted)] rounded" />
    </div>
  );
}

// 🔹 TRENDING PRICE SKELETON
export function TrendingPriceSkeleton() {
  return (
    <div className="section animate-pulse">
      
      {/* Heading */}
      <div className="mb-8">
        <div className="h-8 w-72 bg-[var(--muted)] rounded mb-2" />
        <div className="h-4 w-80 bg-[var(--muted)] rounded" />
      </div>

      {/* Cards Row */}
      <div className="flex gap-6 overflow-x-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <TrendingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function TrendingCardSkeleton() {
  return (
    <div className="sm:w-60 w-44">
      
      {/* Image */}
      <div className="sm:h-60 h-40 bg-[var(--muted)] rounded-2xl sm:rounded-3xl" />

      {/* Text */}
      <div className="py-2 space-y-2 text-center">
        <div className="h-5 w-3/4 mx-auto bg-[var(--muted)] rounded" />
        <div className="h-4 w-5/6 mx-auto bg-[var(--muted)] rounded" />
      </div>
    </div>
  );
}

// 🔹 POPULAR SALES SKELETON
export function PopularSalesSkeleton() {
  return (
    <section className="section animate-pulse overflow-hidden">
      
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-96 bg-[var(--muted)] rounded mb-2" />
        <div className="h-4 w-72 bg-[var(--muted)] rounded" />
      </div>

      {/* Cards */}
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PopularCardSkeleton key={i} />
        ))}
      </div>

      {/* Dots (mobile feel) */}
      <div className="flex justify-center gap-2 mt-4 lg:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 w-2 bg-[var(--muted)] rounded-full"
          />
        ))}
      </div>
    </section>
  );
}

function PopularCardSkeleton() {
  return (
    <div className="px-2 shrink-0 w-full max-w-[420px]">
      <div className="h-48 md:h-56 rounded-2xl bg-[var(--muted)]" />
    </div>
  );
}

// 🔹 TOP STORE SKELETON
export function TopStoreSkeleton() {
  return (
    <div className="section animate-pulse">
      
      {/* Header */}
      <div className="flex justify-between mb-4">
        <div>
          <div className="h-8 w-40 bg-[var(--muted)] rounded mb-2" />
          <div className="h-4 w-60 bg-[var(--muted)] rounded" />
        </div>

        {/* View all button */}
        <div className="hidden lg:block h-6 w-32 bg-[var(--muted)] rounded mt-4" />
      </div>

      {/* Cards */}
      <div className="lg:grid lg:grid-cols-4 xl:grid-cols-5 lg:gap-10 flex gap-4 overflow-x-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <TopStoreCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function TopStoreCardSkeleton() {
  return (
    <div className="flex-shrink-0 sm:w-60 w-40 lg:w-auto">
      
      <div className="relative rounded-2xl sm:rounded-4xl h-25 sm:h-36 border-[1.5px] border-(--border) bg-[var(--muted)] overflow-hidden">
        
        {/* Fake discount ribbon */}
        <div className="absolute -top-1 -left-1 w-20 h-20 bg-[var(--muted)] opacity-50" />

        {/* Logo placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-20 sm:h-12 sm:w-24 bg-gray-300 rounded" />
        </div>
      </div>

    </div>
  );
}

// 🔹 HOW IT WORKS SKELETON
export function HowItWorksSkeleton() {
  return (
    <>
      {/* Desktop */}
      <div className="section hidden sm:block animate-pulse">
        <div className="w-full lg:h-[290px] h-full rounded-[4px] lg:rounded-[20px] md:rounded-md bg-[var(--muted)]" />
      </div>

      {/* Mobile */}
      <div className="section block sm:hidden animate-pulse">
        <div className="w-full h-[180px] rounded-[4px] bg-[var(--muted)]" />
      </div>
    </>
  );
}

// 🔹 SMART DEALS SKELETON
export function SmartDealsSkeleton() {
  return (
    <section className="section animate-pulse">
      
      {/* Title */}
      <div className="h-8 w-80 bg-[var(--muted)] rounded mb-6" />

      <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
        
        {/* LEFT CONTENT */}
        <div className="space-y-6 w-full lg:w-1/2">
          
          {/* Subtitle */}
          <div className="h-4 w-full bg-[var(--muted)] rounded" />
          <div className="h-4 w-5/6 bg-[var(--muted)] rounded" />

          {/* Items */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              
              {/* Icon */}
              <div className="w-8 h-8 bg-[var(--muted)] rounded" />

              {/* Text */}
              <div className="space-y-2 w-full">
                <div className="h-4 w-40 bg-[var(--muted)] rounded" />
                <div className="h-3 w-full bg-[var(--muted)] rounded" />
                <div className="h-3 w-5/6 bg-[var(--muted)] rounded" />
              </div>
            </div>
          ))}

        </div>

        {/* RIGHT IMAGE */}
        <div className="flex-1 flex justify-end">
          <div className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-full bg-[var(--muted)]" />
        </div>

      </div>
    </section>
  );
}

// 🔹 DEAL GUIDES SKELETON
export function DealGuidesSkeleton() {
  return (
    <div className="section animate-pulse">
      
      {/* Header */}
      <div className="flex justify-between">
        <div className="mb-4">
          <div className="h-8 w-72 bg-[var(--muted)] rounded mb-2" />
          <div className="h-4 w-64 bg-[var(--muted)] rounded" />
        </div>

        <div className="hidden sm:block h-6 w-32 bg-[var(--muted)] rounded mt-2" />
      </div>

      {/* Cards */}
      <div className="flex gap-6 overflow-x-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <DealGuideCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function DealGuideCardSkeleton() {
  return (
    <div className="w-[250px] sm:w-[280px] md:w-[320px] lg:w-[360px] xl:w-[400px] flex-shrink-0">
      
      {/* Image */}
      <div className="h-44 sm:h-56 md:h-64 lg:h-80 bg-[var(--muted)] rounded" />

      {/* Content */}
      <div className="py-2 space-y-2">
        <div className="h-5 w-3/4 bg-[var(--muted)] rounded" />
        <div className="h-4 w-full bg-[var(--muted)] rounded" />
        <div className="h-4 w-5/6 bg-[var(--muted)] rounded" />

        {/* Button */}
        <div className="h-4 w-28 bg-[var(--muted)] rounded mt-2" />
      </div>
    </div>
  );
}

// 🔹 FEEDBACK SKELETON
export function FeedbackSkeleton() {
  return (
    <section className="section animate-pulse">

      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-[var(--muted)] rounded mb-2" />
        <div className="h-4 w-72 bg-[var(--muted)] rounded" />
      </div>

      {/* Scroll container SAME as real */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth">
        
        <div className="flex">

          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="pr-4 sm:pr-6 mt-7"
              style={{ minWidth: "33.33%" }} // desktop match
            >
              <FeedbackCardSkeleton />
            </div>
          ))}

        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-2 w-6 bg-[var(--muted)] rounded-full" />
        ))}
      </div>

    </section>
  );
}

function FeedbackCardSkeleton() {
  return (
    <div className="relative rounded-2xl p-6 sm:p-7 lg:p-8 border border-(--border) bg-(--background)">

      {/* Avatar */}
      <div className="absolute -top-7 left-6 w-14 h-14 rounded-full bg-[var(--muted)]" />

      <div className="mt-6" />

      {/* Message */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-[var(--muted)] rounded" />
        <div className="h-4 w-5/6 bg-[var(--muted)] rounded" />
      </div>

      {/* Divider */}
      <div className="h-px my-5 bg-(--border)" />

      {/* Bottom */}
      <div className="flex items-center justify-between">

        <div className="space-y-2">
          <div className="h-4 w-24 bg-[var(--muted)] rounded" />
          <div className="h-3 w-20 bg-[var(--muted)] rounded" />
        </div>

        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-4 h-4 bg-[var(--muted)] rounded" />
          ))}
        </div>

      </div>
    </div>
  );
}

// 🔹 FAQ SKELETON
export function FAQSkeleton() {
  return (
    <section className="section mb-8 animate-pulse">
      
      {/* Heading */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-[var(--muted)] rounded mb-2" />
        <div className="h-4 w-72 bg-[var(--muted)] rounded" />
      </div>

      {/* FAQ Items */}
      <div className="section-content space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <FaqItemSkeleton key={i} />
        ))}
      </div>

    </section>
  );
}

function FaqItemSkeleton() {
  return (
    <div className="border border-(--border) rounded-2xl px-4 sm:px-5 md:px-6 py-4">
      
      <div className="flex justify-between items-center gap-4">
        
        {/* Question */}
        <div className="h-4 w-4/5 bg-[var(--muted)] rounded" />

        {/* + icon placeholder */}
        <div className="h-5 w-5 bg-[var(--muted)] rounded" />

      </div>

    </div>
  );
}