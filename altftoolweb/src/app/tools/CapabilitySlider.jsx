"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const CATEGORIES = [
  {
    title: "Electronics",
    image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FTools%2F1773734626813-tfszsapcb3.png?alt=media&token=c98419bc-72ff-4169-9792-3ca4a7753d5a",
    coupons: 319,
    offers: 379,
  },
  {
    title: "Electronics",
    image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FTools%2F1773733429614-2nyrbspfieu.png?alt=media&token=148fd380-e719-4236-bd2f-f684dd77cd46",
    coupons: 319,
    offers: 379,
  },
  
  {
    title: "Travel",
    image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FTools%2F1773734769498-1vepcsoho07.png?alt=media&token=14bb317a-be1a-4dfe-a232-ed9aac0a38d5",
    coupons: 319,
    offers: 379,
  },
  {
    title: "Travel",
    image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FTools%2F1773734850533-jwc6wsma5sf.png?alt=media&token=6bb99f8b-0d24-4917-abb5-1aab7ec780a8",
    coupons: 319,
    offers: 379,
  },
  {
    title: "Travel",
    image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FTools%2F1773735001186-rhmmxd3lodc.png?alt=media&token=6f1ce31d-7efd-4d4e-a4bc-9335dca7e4bd",
    coupons: 319,
    offers: 379,
  },
  {
    title: "Travel",
    image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FTools%2F1773738498630-pgmth36pdxn.png?alt=media&token=1824098b-d0ab-4e9b-899f-a77c83e3ff17",
    coupons: 319,
    offers: 379,
  },
];

export default function CategorySlider() {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let raf;
    const speed = 0.5;

    const loop = () => {
      if (!paused) {
        el.scrollLeft += speed;

        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }

      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const list = [...CATEGORIES, ...CATEGORIES];

  return (
    <div
      className="relative mt-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* left fade */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-white to-transparent" />

      {/* right fade */}
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-white to-transparent" />

      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto no-scrollbar py-4"
      >
        {list.map((item, i) => (
          <div
            key={item.title + i}
            className="
              shrink-0
              w-[360px]
              rounded-2xl
              bg-white
              shadow-md
              overflow-hidden
              transition
              hover:-translate-y-1
              hover:shadow-xl
            "
          >
            {/* Image area */}
            <div className="relative h-[200px] w-full">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                priority={i < 2}
                quality={75}
                sizes="(max-width: 768px) 85vw, 360px"
              />
            </div>

            {/* Bottom content */}
            {/* <div className="px-4 py-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {item.title}
              </h3>

              <div className="mt-2 flex items-center justify-center gap-4 text-sm text-gray-600">
                <span>{item.coupons} Coupons</span>
                <span className="h-4 w-px bg-gray-300" />
                <span>{item.offers} Offers</span>
              </div>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
}
