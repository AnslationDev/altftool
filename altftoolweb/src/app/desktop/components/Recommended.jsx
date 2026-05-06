"use client";

import ManagedImage from "@/components/ui/ManagedImage";
const recommendedApps = [
  {
    name: "Notion",
    category: "Productivity",
    rating: 4.6,
    icon: "https://img.icons8.com/color/240/notion.png",
    link: "https://www.notion.so/desktop",
  },
  {
    name: "Figma",
    category: "Design",
    rating: 4.7,
    icon: "https://img.icons8.com/color/240/figma.png",
    link: "https://www.figma.com/downloads/",
  },
  {
    name: "VS Code",
    category: "Developer",
    rating: 4.8,
    icon: "https://img.icons8.com/color/240/visual-studio-code-2019.png",
    link: "https://code.visualstudio.com/download",
  },
  {
    name: "Canva",
    category: "Design",
    rating: 4.7,
    icon: "https://img.icons8.com/color/240/canva.png",
    link: "https://www.canva.com/download/",
  },
  {
    name: "Dropbox",
    category: "Cloud",
    rating: 4.5,
    icon: "https://img.icons8.com/color/240/dropbox.png",
    link: "https://www.dropbox.com/install",
  },
  {
    name: "Google Drive",
    category: "Cloud",
    rating: 4.6,
    icon: "https://img.icons8.com/color/240/google-drive.png",
    link: "https://www.google.com/drive/download/",
  },
];

export default function RecommendedForYou() {
  return (
    <section className="  section bg-[var(--background)] text-[var(--foreground)] animate-slide-up">

      {/* Heading */}
      <h2 className="section-title">
        Recommended for you
      </h2>

      {/* Apps Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8  mt-4 sm:mt-6 md:mt-8 lg:mt-10 ">

        {recommendedApps.map((app, index) => (
          <a
            key={index}
            href={app.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col  animate-slide-right items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl sm:rounded-xl hover:shadow-xl hover:scale-105 hover:bg-[var(--card-hover)] transition-shadow duration-300 cursor-pointer"
          >

            {/* Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center bg-gray-50 rounded-xl sm:rounded-2xl">
              <ManagedImage
                src={app.icon}
                alt={app.name}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
              />
            </div>

            {/* Info */}
            <div className="text-center">

              <h3 className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl subheading">
                {app.name}
              </h3>

              <p className="text-gray-500 text-xs sm:text-sm md:text-base">
                {app.category}
              </p>

              <p className="text-yellow-500 text-sm sm:text-base md:text-lg">
                {app.rating} ★
              </p>

            </div>

          </a>
        ))}

      </div>
    </section>
  );
}
