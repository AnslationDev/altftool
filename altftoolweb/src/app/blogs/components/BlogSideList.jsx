import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";

export default function BlogSideList({ blogs = [] }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {blogs.map((blog) => (
        <Link key={blog.id} href={`/blogs/${blog.slug}`}>
          <div className="flex gap-3 sm:gap-4 items-center hover:shadow-lg hover:scale-[1.02] p-2 sm:p-2.5 rounded-lg transition cursor-pointer">
            <div className="flex-shrink-0 w-24 h-18 sm:w-28 sm:h-20 md:w-32 md:h-24 rounded-lg overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  src={blog.image}
                  alt={blog.imageAlt || blog.heading}
                  fill
                  sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full tracking-wider">
                {blog.category}
              </span>

              <h3 className="text-sm text-(--foreground) font-medium line-clamp-2 mt-1">
                {blog.heading}
              </h3>

              {blog.date && (
                <p className="flex items-center gap-1 text-(--muted-foreground) text-xs mt-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(blog.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
