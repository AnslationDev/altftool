import BlogCarousel from "./BlogCarousel";
import BlogSideList from "./BlogSideList";

export default function BlogHeroSection({
  carouselBlogs=[],
  leftBlogs=[],
  rightBlogs=[],
}) {
  return (
 <section className="px-4 py-8 ">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

    {/* LEFT LIST */}
    <div className="lg:col-span-3 h-full">
      <BlogSideList blogs={leftBlogs} />
    </div>

    {/* MIDDLE CAROUSEL */}
    <div className="lg:col-span-6 h-full">
      <BlogCarousel blogs={carouselBlogs} />
    </div>

    {/* RIGHT LIST */}
    <div className="lg:col-span-3 h-full">
      <BlogSideList blogs={rightBlogs} />
    </div>

  </div>
</section>

  );
}
