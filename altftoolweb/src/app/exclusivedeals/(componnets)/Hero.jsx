"use client";

import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";



const banners = [
  {
    id: 1,
    backgroundImage:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=80",
    title: "Fashion Collection",
    subtitle: "Discover the latest trends in style",
    cta: "Shop Fashion",
  },
  {
    id: 2,
    backgroundImage:
      "https://images.unsplash.com/photo-1603898037225-8d4f3c5c8d6b?auto=format&fit=crop&w=1920&q=80",
    title: "Apple Gadgets",
    subtitle: "Premium technology at your fingertips",
    cta: "Explore Apple",
  },
  {
    id: 3,
    backgroundImage:
      "https://images.unsplash.com/photo-1612444530582-fc66183b16f7?auto=format&fit=crop&w=1920&q=80",
    title: "Boat Audio",
    subtitle: "Immersive sound experience",
    cta: "Shop Audio",
  },
  {
    id: 4,
    backgroundImage:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1920&q=80",
    title: "Beauty & Skincare",
    subtitle: "Glow with confidence",
    cta: "Shop Beauty",
  },
  {
    id: 5,
    backgroundImage:
      "https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=1920&q=80",
    title: "Samsung Devices",
    subtitle: "Innovation that inspires",
    cta: "Shop Samsung",
  },
];

// Custom Arrow Button
const Arrow = ({ onClick, direction }) => (
  <button
    onClick={onClick}
    className={`absolute top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white transition ${
      direction === "left" ? "left-4" : "right-4"
    }`}
  >
    {direction === "left" ? <ChevronLeft /> : <ChevronRight />}
  </button>
);

export default function HeroCarousel() {
  const settings = {
    dots: false,
    infinite: true,
    speed: 700,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    arrows:false,
    slidesToScroll: 1,
    prevArrow: <Arrow direction="left" />,
    nextArrow: <Arrow direction="right" />,
    responsive: [
      {
        breakpoint: 768,
        settings: { arrows: false },
      },
    ],
  };

  return (
    <div className="w-full">
      <Slider {...settings}>
        {banners.map((item) => (
          <div key={item.id}>
            <div
              className="relative h-[70vh] min-h-[500px] bg-cover bg-center"
              style={{ backgroundImage: `url(${item.backgroundImage})` }}
            >
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/20" />

              {/* Content */}
              <div className="relative z-10 flex h-full items-center">
                <div className="px-6 md:px-16 max-w-2xl text-white space-y-4">
                  <span className="inline-block bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full">
                    New Arrival
                  </span>

                  <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                    {item.title}
                  </h1>

                  <p className="text-base md:text-lg text-gray-200">
                    {item.subtitle}
                  </p>

                  <div className="flex gap-4 pt-4">
                    <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition">
                      {item.cta}
                    </button>

                    <button className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}