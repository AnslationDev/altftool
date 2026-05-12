import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeader({ title, description, viewAllUrl }) {
  return (
    <div className="mb-3 lg:mb-8">
      <div className="w-full">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <h1 className="section-title">{title}</h1>

          {/* Mobile View All */}
          <Link
            href={viewAllUrl}
            className="group inline-flex sm:hidden justify-end"
          >
            <button className="relative flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-300 active:scale-95">
              <span className="relative font-medium text-md text-(--foreground) hover:text-blue-600 transition-all duration-300">
                View All
                <span className="absolute left-0 -bottom-1 h-[1.5px] w-0 bg-current transition-all duration-300 group-hover:w-full" />
              </span>

              <span
                className="relative text-(--foreground) h-5 w-5 rounded-full border border-(--foreground)
              flex items-center justify-center transition-all duration-300
              group-hover:translate-x-1 group-hover:rotate-[-45deg] group-hover:text-blue-600"
              >
                <ArrowRight size={20} />
              </span>
            </button>
          </Link>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          <p className="section-subtitle !mx-0 !mb-0 leading-relaxed">
            {description}
          </p>

          {/* Desktop View All */}
          <Link href={viewAllUrl} className="group hidden sm:inline-flex">
            <button className="relative flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-300 active:scale-95 cursor-pointer">
              <span className="relative font-medium text-md text-(--foreground) hover:text-blue-600 transition-all duration-300">
                View All
                <span className="absolute left-0 -bottom-1 h-[1.5px] w-0 bg-current transition-all duration-300 group-hover:w-full" />
              </span>

              <span
                className="relative text-(--foreground) sm:h-7 sm:w-7 rounded-full border border-(--foreground)
              flex items-center justify-center transition-all duration-300
              group-hover:translate-x-1 group-hover:rotate-[-45deg] group-hover:text-blue-600"
              >
                <ArrowRight size={20} />
              </span>
            </button>
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-(--muted-foreground) mt-2 opacity-60 hidden sm:block" />
    </div>
  );
}
