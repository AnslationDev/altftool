"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

import "swiper/css";
import "swiper/css/navigation";

export default function BlogCarousel({ blogs }) {
  return (
    <Swiper
      modules={[Autoplay]}
    
      autoplay={{ delay: 3500, disableOnInteraction: false }}
      loop
      className="rounded-xl overflow-hidden shadow-lg"
    >
      {blogs.map((blog) => (
        <SwiperSlide key={blog.slug}>
          <Link href={`/blogs/${blog.slug}`}>
            <div className="relative h-[220px] sm:h-[280px] md:h-[300px] lg:h-[380px] xl:h-[460px] w-full cursor-pointer group">
              <Image
                src={blog.image}
                alt={blog.heading}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover group-hover:scale-105 transition duration-300"
                priority
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6 flex flex-col justify-end">
                <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full w-fit mb-2">
                  {blog.category}
                </span>

                <h2 className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-snug">
                  {blog.heading}
                </h2>

                <p className="text-white/80 text-sm sm:text-sm mt-1 sm:mt-2 line-clamp-2">
                  {blog.excerpt}
                </p>
              </div>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
