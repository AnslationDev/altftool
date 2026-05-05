"use client";
import { categories } from "../data/categories";
import { ExplorePlatformSkeleton } from "@/components/ui/skeleton";



export default function ExplorePlatform({
    loading = false,
    activeCategory,
    setActiveCategory,
}) {
    if (loading) {
        return <ExplorePlatformSkeleton />;
    }

    return (
        <section id="explore-platforms" className="section animate-slide-up">
            <div className="flex flex-col gap-2 sm:gap-5">


                <div className="animate-slide-right">
                    {/* <h2 className="academy-heading "> */}
                     <h2 className="section-title ">
                        Explore platforms  by your Goal
                        {/* <span className="whitespace-nowrap sm:contents inline-flex items-center"> */}
                      
                    </h2>

                    {/* <p className="academy-subheading"> */}
                    <p className="section-subtitle !mx-0 ">
                        Select a category to discover the most relevant platforms
                    </p>
                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((item, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                const next = activeCategory === item.title ? null : item.title;
                                setActiveCategory(next);
                                if (next) {
                                    const el = document.getElementById("academy-project");
                                    if (el) {
                                        el.scrollIntoView({ behavior: "smooth" });
                                    }
                                }

                            }}
                            className={`w-full rounded-xl sm:rounded-2xl 
                         animate-slide-up       
                         p-5 sm:p-6 
                         flex flex-col items-center text-center 
                         gap-3 sm:gap-4 
                          border border-(--border)
                         text-(--foreground)
                         transition-all duration-300 cursor-pointer 
                         hover:-translate-y-1 hover:border-(--primary)
                         shadow-[0px_12px_24px_0px_#0F172A05]
                         hover:shadow-[0px_12px_24px_0px_#0F172A05,0px_4px_20px_0px_#2563EB33]
                                ${activeCategory === item.title
                                    ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                                    : "border-(--border)"
                                }`}
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div
                                className={`flex items-center justify-center
                                   w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
                                  rounded-lg sm:rounded-xl

                                  transition-all duration-300 
                                  ${activeCategory === item.title
                                        ? "bg-[#F8FAFC] text-(--primary)"
                                        : "bg-[#EEF4FF] text-(--primary) group-hover dark:bg-[#F8FAFC]"
                                    }`}
                            >
                                {item.icon}
                            </div>

                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-[clamp(1rem,1.5vw,1.2rem)]">
                                    {item.title}
                                </h3>
                                <p
                                    className={`text-sm ${activeCategory === item.title
                                        ? "text-white/80"
                                        : "text-gray-500"
                                        }`}
                                >
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
