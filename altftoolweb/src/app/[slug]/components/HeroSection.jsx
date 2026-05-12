"use client";

import Image from "next/image";
import { useFirebaseData } from "../hooks/data.service";

export default function HeroSection() {
  const { hero } = useFirebaseData();

  if (!hero) return null;

  return (
    <div className="section">
      {hero.banner ? (
        <Image
          src={hero.banner}
          alt={hero.title}
          width={1200}
          height={300}
          className="rounded-2xl w-full object-cover"
        />
      ) : (
        <div className="h-40 bg-gray-100 rounded-2xl flex items-center justify-center">
          No Banner
        </div>
      )}
    </div>
  );
}