"use client";
import Image from "next/image";
import howWork from "../(assets)/Howitworks-banner.jpg";
import howWork1 from "../(assets)/Howitworks-banner-mobile.jpg";
import { HowItWorksSkeleton } from "../DealsPageSkeleton";
import { useState, useEffect } from "react";

export default function HowItWorks() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <HowItWorksSkeleton />;

  return (
    <>
      <div className="section hidden sm:block animate-slide-right">
        <Image
          src={howWork}
          alt="how-it-works"
          className="w-full lg:h-[290px] h-full rounded-[4px] lg:rounded-[20px] md:rounded-md"
          priority
        />
      </div>
      <div className="section block sm:hidden animate-slide-right">
        <Image
          src={howWork1}
          alt="how-it-works"
          className="w-full h-full rounded-[4px]"
          priority
        />
      </div>
    </>
  );
}
