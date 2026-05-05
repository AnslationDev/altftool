"use client";

import { useState } from "react";
import {
  Wrench,
  Puzzle,
  Gamepad2,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";

const tabs = [
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "extensions", label: "Extensions", icon: Puzzle },
  { id: "games", label: "Games", icon: Gamepad2 },
];

const trendingItems = {
  tools: [

    {
      name: "BG Remover",
      usage: "8.2k uses",
      trending: true,
      likes: 189,
      href: "/tools/bg-remover",

      image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773814892167-5st05l1hcfp.png?alt=media&token=23972ca0-c00e-4679-bb00-e00dddeabc4e",
    },
    {
      name: "Annimation Generator",
      usage: "6.8k uses",
      trending: false,
      likes: 156,
      href: "/tools/animation-generator",
      image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773815065249-6yfhw6pssdq.png?alt=media&token=c5166e75-eaa8-4b2b-a0e1-b7b43488bd7d",

    },
    {
      name: "Image Compressor",
      usage: "6.8k uses",
      trending: false,
      likes: 156,
      href: "/tools/image-compressor",
      image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773815229307-a1yon9oemew.png?alt=media&token=8b0bd5d6-b4d4-4f17-8403-38d16b5454d6",

    },
    {
      name: "FB-Ad Generator",
      usage: "6.8k uses",
      trending: false,
      likes: 156,
      href: "/tools/facebook-ad-generator",
      image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773815361567-szbb5zvr7b9.png?alt=media&token=64098cb5-dc31-4d17-8ba0-adddcb9c69f0",
    },
    {
      name: "Age Gender Detector",
      usage: "12.5k uses",
      trending: true,
      likes: 234,
      href: "/tools/age-gender-detector",
      image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773815460431-a30jnkf6pp6.png?alt=media&token=17634ac9-75ff-4c8a-b561-e48e87a0d029",
    },
    {
      name: "Youtube Video Analyzer",
      usage: "6.8k uses",
      trending: false,
      likes: 156,
      href: "/tools/youtube-video-analyzer",
      image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773815657102-mh79uqord8.png?alt=media&token=fd92f92e-8aca-411b-b37c-88a672b452d6",

    },
  ],
  extensions: [
    {
      name: "Auto Form Filler",
      usage: "9.3k installs",
      trending: true,
      likes: 312,
      href: "/extensions/auto-form-filler",
    },
    {
      name: "Auto Question Extractor",
      usage: "7.1k installs",
      trending: false,
      likes: 267,
      href: "/extensions/auto-question-extractor",
    },
    {
      name: "Bookmark Manager",
      usage: "7.1k installs",
      trending: false,
      likes: 267,
      href: "/extensions",
    },
    {
      name: "Budget Planner",
      usage: "7.1k installs",
      trending: false,
      likes: 267,
      href: "/extensions/budget-planner",
    },
    {
      name: "Image Cropper",
      usage: "7.1k installs",
      trending: false,
      likes: 267,
      href: "/extensions/image-cropper",
    },
    {
      name: "Image To PDF Converter",
      usage: "7.1k installs",
      trending: false,
      likes: 267,
      href: "/extensions/image-to-pdf",
    },
  ],
  games: [
    {
      name: "Cricket",
      usage: "15.2k plays",
      trending: true,
      likes: 456,
      href: "/games/cricket",
      image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773816241140-pcxaj7reguo.jpg?alt=media&token=6c897cdc-2960-4048-8e03-1044dc62d6db",
    },
    {
      name: "Fruit Clash",
      usage: "11.8k plays",
      trending: true,
      likes: 389,
      href: "/games/fruit-clash",
      image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773817184157-b4plp8wjzed.jpg?alt=media&token=2da3b865-10c8-41af-8df4-84bca6e19e81",
    },
    {
      name: "Flappy Bird",
      usage: "11.8k plays",
      trending: true,
      likes: 389,
      href: "/games/flappy-bird",
      image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773817317382-ft1eiig5n69.jpg?alt=media&token=761fac1c-53c1-435f-96b4-cd48e504b0f2",

    },
    {
      name: "Neon Racer",
      usage: "11.8k plays",
      trending: true,
      likes: 389,
      href: "/games/neon-racer",
      image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773817417982-a2u1ks5aac.png?alt=media&token=941d60af-7eed-4ddb-bfd7-692e60171c82",
    },
    {
      name: "Snake IO",
      usage: "11.8k plays",
      trending: true,
      likes: 389,
      href: "/games/snake-io",
      image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773817537478-ndjb5rceju.jpg?alt=media&token=37dcefe7-dcbb-4566-9981-a70d4ebbf427",
    },
    {
      name: "Chess",
      usage: "11.8k plays",
      trending: true,
      likes: 389,
      href: "/games/chess",
      image: "https://firebasestorage.googleapis.com/v0/b/altftool-bca36.firebasestorage.app/o/images%2FBanners%2F1773818124980-pycgz5by59q.png?alt=media&token=a2577987-4f75-4706-8867-905537dabf2b",
    },
  ],
};

export default function TrendingSection() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("tools");

  return (
    <section className="section animate-slide-up ">
      <div className="mx-auto px-0 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>
            <div className={`flex items-center gap-2 text-sm font-semibold mb-2 text-[var(--primary)] ${theme === "dark" ? "text-[var(--secondary-foreground)]" : "text-[var(--primary)]"
              } `}>
              <TrendingUp className="w-4 h-4" />
              TRENDING NOW
            </div>

            <h2 className="section-title">
              Trending Right Now
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-[var(--card)] p-1 rounded-full overflow-scroll no-scrollbar">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === id
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x pb-4">

          {trendingItems[activeTab].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group snap-start min-w-[342px] sm:min-w-[300px] lg:min-w-[320px] rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden transition hover:shadow-sm hover:bg-[var(--card-hover)]"
            >

              {/* Image */}
              <div className="relative w-full h-[180px] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 342px, (max-width: 1024px) 300px, 320px"
                  className="object-cover transition duration-300 hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">

                {/* Title + Badge */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-[var(--card-foreground)]">
                    {item.name}
                  </h3>

                  {/* <span className="text-xs px-3 py-1 rounded-full bg-[var(--muted)] text-[var(--primary)]">
                    {item.category}
                  </span> */}
                </div>

                {/* Description */}
                <p className="text-sm text-[var(--muted-foreground)]">
                  {item.desc}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">

                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <TrendingUp className="w-4 h-4" />
                    {item.usage}
                  </div>

                  <div className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] hover:-translate-y-1 ">
                    Try Now
                    <ExternalLink className="w-3 h-3" />
                  </div>

                </div>
              </div>

            </Link>
          ))}

        </div>
      </div>
    </section>
  );
}
