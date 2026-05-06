"use client";
import React, { useState } from "react";
import ManagedImage from "@/components/ui/ManagedImage";


const slides = [
  {
    title: "Tech & Apps",
    subtitle: "Explore trending apps & cool tech!",
    image: "https://images.pexels.com/photos/6078128/pexels-photo-6078128.jpeg",
    link: "#",
  },
  {
    title: "App on Hand",
    subtitle: "Powerful tools in your pocket",
    image: "https://images.pexels.com/photos/5082578/pexels-photo-5082578.jpeg",
    link: "#",
  },
  {
    title: "Workspace Tech",
    subtitle: "Design, edit, create—all here",
    image: "https://images.pexels.com/photos/5077043/pexels-photo-5077043.jpeg",
    link: "#",
  },
  {
    title: "Vibrant Tech",
    subtitle: "Modern tech vibes",
    image: "https://images.pexels.com/photos/6078129/pexels-photo-6078129.jpeg",
    link: "#",
  },
  {
    title: "Social Media",
    subtitle: "Connect with the world!",
    image: "https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg",
    link: "#",
  },
  {
    title: "App Focus",
    subtitle: "Explore powerful features",
    image: "https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg",
    link: "#",
  },
  {
    title: "Mobile Lifestyle",
    subtitle: "Your favourite tools & fun",
    image: "https://images.pexels.com/photos/2740957/pexels-photo-2740957.jpeg",
    link: "#",
  },
  {
    title: "Tech Shot",
    subtitle: "Sleek modern devices",
    image: "https://images.pexels.com/photos/6078129/pexels-photo-6078129.jpeg",
    link: "#",
  },
  {
    title: "Desk Tech",
    subtitle: "Work & play combined",
    image: "https://images.pexels.com/photos/5077042/pexels-photo-5077042.jpeg",
    link: "#",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const goToSlide = (index) => setCurrent(index);

  return (
    <section className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] rounded-lg overflow-hidden  animate-slide-up">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute  top-0 left-0 w-full h-full transition-opacity duration-500 ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
        >
          {/* Image fills the box */}
          <ManagedImage
            src={slide.image}
            alt={slide.title}
            className="w-full h-full "
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start p-6 sm:p-16">
            <h1 className="section-title text-white ">
              {slide.title}
            </h1>
            <p className="subheading text-white">
              {slide.subtitle}
            </p>
            <a
              href={slide.link}
              className="mt-4 inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium subheading transition"
            >
              Explore Now
            </a>
          </div>
        </div>
      ))}

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 text-white text-3xl font-bold p-2 rounded-full hover:bg-black/70 transition z-20"
      >
        &#10094;
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 text-white text-3xl font-bold p-2 rounded-full hover:bg-black/70 transition z-20"
      >
        &#10095;
      </button>

      {/* Pagination dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition ${index === current ? "bg-white" : "bg-gray-400"
              }`}
          ></button>
        ))}
      </div>
    </section>
  );
}
