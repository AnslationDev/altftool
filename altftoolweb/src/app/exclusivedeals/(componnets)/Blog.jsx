"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import data from "../(data)/db.json";

const Blog = () => {
  const blogs = data.blog.slice(0, 8);

  const [index, setIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);

  // Responsive card count
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 640) setVisibleCards(1);
      else if (width < 1024) setVisibleCards(2);
      else if (width < 1280) setVisibleCards(3);
      else setVisibleCards(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const next = () => {
    if (index + visibleCards < blogs.length) {
      setIndex(index + 1);
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <section className="md:my-20 my-12 ">

      {/* Header */}
      <div className="flex justify-between mx-3 items-center mb-10">
        <h1 className="md:text-3xl text-2xl font-bold">BLOG</h1>

        {/* Arrows */}
        <div className="flex gap-3">
          <button
            onClick={prev}
            disabled={index === 0}
            className="w-10 h-10 flex items-center justify-center rounded-full border 
                       hover:bg-black hover:text-white transition disabled:opacity-40"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={next}
            disabled={index + visibleCards >= blogs.length}
            className="w-10 h-10 flex items-center justify-center rounded-full border 
                       hover:bg-black hover:text-white transition disabled:opacity-40"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${index * (100 / visibleCards)}%)`,
          }}
        >
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="px-3 cursor-pointer "
              style={{ minWidth: `${100 / visibleCards}%` }}
            >
              <div className="bg-white rounded-2xl border border-gray-200   transition overflow-hidden h-full">

                {/* Image */}
                <div className="relative h-56">
                  <Image
                    src={blog.image}
                    alt={blog.heading}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/80 text-white text-xs px-3 py-1 rounded">
                    {blog.tag || "MED"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="text-lg text-(--muted-foreground) font-semibold line-clamp-2 mb-3">
                    {blog.heading}
                  </h2>

                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <div className="w-6 h-6 relative rounded-full overflow-hidden">
                      <Image
                        src={blog.authorImg || "/images/avatar.png"}
                        alt={blog.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span>{blog.author}</span>
                    <span>•</span>
                    <span>{blog.date}</span>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {blog.description}
                  </p>

                  <Link
                    href={`/exclusivedeals/e-blogs/${blog.category}/${blog.slug}`}
                    className="font-semibold hover:underline"
                  >
                    Read Now
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
