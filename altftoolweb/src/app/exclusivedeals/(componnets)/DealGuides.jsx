"use client";
import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { subscribeAll } from "../service/firebasesmartsection";
import { DealGuidesSkeleton } from "../DealsPageSkeleton";

function DealGuides() {
  const [smart, setSmart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAll((data) => {
      setSmart(data);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <DealGuidesSkeleton />;

  return (
    <div className="section animate-slide-up">
      <div className="flex justify-between">
        <div className="mb-4">
          <h2 className="section-title">Saving Tips & Deal Guides</h2>
          <p className="section-subtitle !mx-0 text-left">
            Learn how to save more on every purchase
          </p>
        </div>
        <div className="flex  justify-center text-(--primary) mt-1 font-semibold cursor-pointer animate-slide-left">
          <span className="sm:inline-flex hidden hover:underline">
            More Articles{" "}
          </span>
          <span className="inline-block px-2 text-(--primary) ">
            <ArrowRight size={25} />
          </span>
        </div>
      </div>
      <div className="flex overflow-x-auto no-scrollbar gap-6">
        {smart.map((item, i) => (
          <div key={i} className="animate-slide-right">
            <DealCard   item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default DealGuides;

function DealCard({item}) {
  return (
    <div className="w-[250px] sm:w-[280px] md:w-[320px] lg:w-[400px] xl:w-[450px] flex-shrink-0">
      <div className="h-44 sm:h-56 md:h-64 lg:h-80 relative">
        <Image
          src={item.image}
          alt="db"
          fill
          sizes="(max-width: 640px) 250px, (max-width: 768px) 280px, (max-width: 1024px) 320px, (max-width: 1280px) 400px, 450px"
          className="object-cover object-center"
        />
      </div>
      <div className="py-2">
        <div className=" text-[16px] sm:text-[18px] md:text-[20px] lg:text-[24px] font-semibold">
          {item.title}
        </div>
        <p className="text-[12px] sm:text-[14px] md:text-[15px] lg:text-[16px] text-(--muted-foreground) leading-relaxed line-clamp-2">
          {item.description}
        </p>
        <Link href={item.link}>
        <div className="flex items-center hover:border-b duration-150 ease-in-out  transition-transform border-(--primary) w-fit cursor-pointer py-1 gap-2">
          
                    <div className="text-(--primary) font-semibold">Explore Tips </div>
          <span>
            <ArrowRight size={20} className="text-(--primary) font-semibold" />
          </span>
        </div>
        </Link>
      </div>
    </div>
  );
}
