"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import User from "../../(assets)/users.png";

export default function HeroSection({ title }) {
  return (
    <section className="section w-full flex flex-col bg-(--search-buysmart) py-12 sm:py-16 md:py-20 lg:py-24 items-center animate-slide-up">
      <div className="w-full max-w-7xl px-4 flex items-center justify-center grid grid-cols-3 items-center">
        <div className=" left-4">
          <Link
            href="/brandrating"
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-(--primary) flex items-center justify-center transition group-hover:bg-blue-50">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-(--primary)" />
            </div>
          </Link>
        </div>
        <Image
          src={User}
          alt="users"
          priority
          className="h-16 w-auto object-contain scale-135 md:scale-100"
        />

      </div>

      <div className="max-w-7xl mx-auto px-4 text-center w-full pt-8 sm:pt-10 md:pt-12 lg:pt-16">



        <h1 className="section-title animate-slide-right" style={{ animationDelay: "120ms" }}>
          Find Your{" "}
          <span className="text-(--primary)">
            Perfect {title}
          </span>{" "}
          In Minutes
        </h1>

        <p className="section-subtitle max-w-4xl mx-auto animate-slide-right" style={{ animationDelay: "200ms" }}>
          Quality sleep is a necessity, not a luxury. The right mattress supports comfort,
          reduces aches, and helps you wake up refreshed. To find your perfect night&apos;s sleep,
          see our top mattress picks below.
        </p>

        <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-5 animate-slide-up" style={{ animationDelay: "280ms" }}>
          <button
            onClick={() => {
              const section = document.getElementById("reviews");
              section?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-gray-300 text-(--muted-foreground) text-base font-medium hover:border-(--primary) hover:text-(--primary) transition">
            See Reviews
          </button>

          <button
            onClick={() => {
              const section = document.getElementById("top-rated");
              section?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-(--primary) text-white text-base font-semibold hover:bg-blue-700 transition">
            Explore Now
          </button>
        </div>

      </div>
    </section>
  );
}