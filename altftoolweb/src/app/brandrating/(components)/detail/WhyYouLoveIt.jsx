"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft, ChevronRight, MapPin, Shield, Calendar, Truck, Layers, Ruler, Leaf, Wind, ShieldCheck, Snowflake, Shirt,
  MoveVertical, Scale, BadgeCheck, Tag, PackageCheck
} from "lucide-react";

const iconMap = {
  trial: Calendar,
  shipping: Truck,
  warranty: Shield,
  location: MapPin,
  firmness: Layers,
  sizes: Ruler,
  materials: Leaf,
  comfort: Wind,
  support: ShieldCheck,
  cooling: Snowflake,
  cover: Shirt,
  thickness: MoveVertical,
  weight: Scale,
  certifications: BadgeCheck,
  price: Tag,
  delivery: PackageCheck,
};

function getIcon(key) {
  const Icon = iconMap[key?.toLowerCase?.()] || Shield;
  return <Icon className="w-5 h-5 stroke-white" strokeWidth={2} />;
}

export default function WhyYoullLoveIt({ brand, category }) {
  const featuresData = Array.isArray(brand?.feature)
    ? brand.feature
    : Array.isArray(brand?.features)
      ? brand.features
      : [];

  const benefits = brand.benefits || [];

  const ITEMS_PER_SLIDE = 3;

  const featureSlides = [];
  for (let i = 0; i < featuresData.length; i += ITEMS_PER_SLIDE) {
    featureSlides.push(featuresData.slice(i, i + ITEMS_PER_SLIDE));
  }

  const benefitSlides = [];
  for (let i = 0; i < benefits.length; i += ITEMS_PER_SLIDE) {
    benefitSlides.push(benefits.slice(i, i + ITEMS_PER_SLIDE));
  }

  const slides = featureSlides.length > 0 ? featureSlides : benefitSlides;
  const isBenefits = featureSlides.length === 0;

  const images = brand.images || [];

  const [current, setCurrent] = useState(0);

  const total = images.length || 1;

  function prev() {
    setCurrent((c) => (c - 1 + total) % total);
  }

  function next() {
    setCurrent((c) => (c + 1) % total);
  }

  const currentImage = images[current] || images[0] || "/placeholder.jpg";

  return (
    <section className=" w-full section animate-slide-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-20 items-start">

        {/* LEFT — Text */}
        <div className="animate-slide-right">
          <h2 className="section-title mb-6 sm:mb-8 md:mb-10 lg:mb-15 mt-2 sm:mt-3 md:mt-4">
            Why You&apos;ll Love It
          </h2>

          <div className="flex flex-col gap-6 sm:gap-7 md:gap-8 lg:gap-9">
           {slides[current % slides.length]?.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 animate-slide-up"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-(--primary) flex items-center justify-center">
                  {item?.icon ? (
                    <span
                      className="text-white w-5 h-5 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: item.icon }}
                    />
                  ) : (
                    <Shield className="w-5 h-5 text-white" />
                  )}
                </div>

                <div>
                  <p className="text-sm sm:text-base md:text-lg font-bold text-(--foreground) mb-1">
                    {item?.heading}
                  </p>

                  <p className="text-sm sm:text-base text-(--muted-foreground)">
                    {item?.description}
                  </p>
                </div>
              </div>
            ))}
            {/* {brand?.specification?.some(spec => spec?.trim()) && (
              <div className="mt-6 sm:mt-8">
              

                <div className="flex flex-col gap-2">
                  {brand.specification.map((spec, i) => (
                    spec?.trim() && (
                      <p
                        key={i}
                        className="text-sm sm:text-base text-(--muted-foreground)"
                      >
                        • {spec}
                      </p>
                    )
                  ))}
                </div>
              </div>
            )} */}

            {isBenefits &&
              slides[current]?.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] sm:min-w-[44px] rounded-full bg-(--primary) flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-(--muted-foreground) leading-relaxed">
                      {item}
                    </p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* RIGHT — Image + Nav */}
        <div className="animate-slide-left" style={{ animationDelay: "160ms" }}>
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src={currentImage}
              alt={brand.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-opacity duration-500"
            />
          </div>


          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              onClick={prev}
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full border border-(--border) flex items-center justify-center hover:bg-[#2563EB] hover:border-[#2563EB] group transition"
            >
              <ChevronLeft className="w-5 h-5 text-(--muted-foreground) group-hover:text-white transition" />
            </button>
            <button
              onClick={next}
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-(--primary) border border-[#2563EB] flex items-center justify-center hover:bg-blue-700 transition"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
