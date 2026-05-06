"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import data from "../(data)/db.json";
import { FeedbackSkeleton } from "../DealsPageSkeleton";
import ManagedImage from "@/components/ui/ManagedImage";

const Feedback = () => {

  const [loading, setLoading] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => setLoading(false), 800);
  return () => clearTimeout(timer);
}, []);

  const feedback = data.feedback;
  const [index, setIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
const [scrollRef, setScrollRef] = useState(null);

const handleScroll = () => {
  if (!scrollRef) return;

  const scrollLeft = scrollRef.scrollLeft;
  const cardWidth = scrollRef.clientWidth / visibleCards;

  const newIndex = Math.round(scrollLeft / cardWidth);
  setIndex(newIndex);
};

useEffect(() => {
  if (!scrollRef) return;

  const interval = setInterval(() => {
    const cardWidth = scrollRef.clientWidth / visibleCards;

    let nextIndex = index + 1;

    if (nextIndex + visibleCards > feedback.length) {
      nextIndex = 0;
    }

    scrollRef.scrollTo({
      left: nextIndex * cardWidth,
      behavior: "smooth",
    });
  }, 3000);

  return () => clearInterval(interval);
}, [index, visibleCards, feedback.length, scrollRef]);

  // Responsive cards count
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 640)
        setVisibleCards(1); // Mobile
      else if (width < 1024)
        setVisibleCards(2); // Tablet
      else setVisibleCards(3); // Desktop
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const next = () => {
    if (index + visibleCards < feedback.length) {
      setIndex(index + 1);
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  if (loading) return <FeedbackSkeleton />;

  return (
    <section className="section animate-slide-up">
      {/* Header */}
      {/* <div className="flex flex-col  sm:flex-row sm:items-center sm:justify-between "> */}
      <div className="mb-8">
        <h2 className="section-title">Loved by Smart Shoppers </h2>
        <p className="section-subtitle !mx-0 text-left">
          See how users are saving with us
        </p>
      </div>

      {/* Carousel */}
<div
  ref={setScrollRef}
  onScroll={handleScroll}
  className="overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory animate-slide-left"
>
        <div
          className="flex transition-transform duration-500 ease-in-out"
          // style={{
          //   transform: `translateX(-${index * (100 / visibleCards)}%)`,
          // }}
        >
          {feedback.map((item) => (
            <div
              key={item.id}
              className="pr-4 sm:pr-6 mt-7"
              style={{ minWidth: `${100 / visibleCards}%` }}
            >
              <div
                className="rounded-2xl p-6 sm:p-7 lg:p-8
                  border border-(--border) shadow-sm hover:shadow-lg transition h-full flex flex-col relative"
              >
                {/* Avatar - half outside card */}
                <div className="absolute -top-7 left-6">
                  <ManagedImage
                    src={item.avatar}
                    alt={item.name}
                    className="w-15 h-15 rounded-full object-cover border-3 border-(--border)"
                  />
                </div>
                <div className="mt-6" /> {/* spacer for avatar */}
                {/* Message */}
                <p className="text-(--muted-foreground) text-sm sm:text-base leading-relaxed  sm:line-clamp-2">
                  {item.message}
                </p>
                {/* Bottom: Name + Stars */}
                <div className="bg-(--border) h-[1px] w-full my-5"></div>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <h4 className=" text-base xl:text-base md:text-xs font-semibold text-(--muted-foreground)">
                      {item.name}
                    </h4>
                    <p className="text-xs text-(--muted-foreground)">
                      @{item.name.toLowerCase().replace(" ", "")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 sm:w-3 sm:h-3 xl:w-5 xl:h-5 ${
                          i < item.rating
                            ? "fill-(--primary) text-(--primary)"
                            : "text-(--muted-foreground)"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

            {/* Dots */}
<div className="flex justify-center sm:gap-3 gap-2  mt-6 animate-slide-up">
  {Array.from({ length: feedback.length - visibleCards + 1 }).map((_, i) => (
    <div
      key={i}
      onClick={() => {
        if (!scrollRef) return;
        const cardWidth = scrollRef.clientWidth / visibleCards;
        scrollRef.scrollTo({
          left: i * cardWidth,
          behavior: "smooth",
        });
      }}
      className={`h-2 rounded-full cursor-pointer transition-all duration-300
        ${index === i ? "bg-(--primary) w-8 opacity-100" : "bg-[#1e3a8a] w-2 opacity-40"}`}
    />
  ))}
</div>

    </section>
  );
};

export default Feedback;
