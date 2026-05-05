import BlogCard from "./BlogCard";
import { Sparkles } from "lucide-react";

export default function FeaturedSection({ featured, sideBlogs }) {
  if (!featured) return null;

  return (
    <div className="mb-16">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100
                        text-blue-600 text-[10px] font-bold uppercase tracking-widest
                        px-3 py-1.5 rounded-full">
          <Sparkles size={10} />
          Editor&apos;s Pick
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-blue-100 to-transparent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hero post — spans 2 cols */}
        <div className="lg:col-span-2">
          <BlogCard
            blog={featured}
            height="h-[340px] sm:h-[440px] lg:h-[520px]"
            showExcerpt
          />
        </div>

        {/* Side posts — 2×2 grid */}
        <div className="grid grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 gap-4">
          {sideBlogs.slice(0, 4).map((b, i) => (
            <BlogCard
              key={b.id}
              blog={b}
              height="h-[180px] sm:h-[200px] lg:h-[120px] xl:h-[116px]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
