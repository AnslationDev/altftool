"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import ManagedImage from "@/components/ui/ManagedImage";

const FeaturedSection = () => {
  const scrollRef = useRef(null);
  const tools = [
    { id: 1, name: "PDF Converter", image: "/images/featured1.png" },
    { id: 2, name: "Age Calculator", image: "/images/featured2.png" },
    { id: 3, name: "QR Generator", image: "/images/featured3.png" },
    { id: 4, name: "Image Compressor", image: "/images/featured4.png" },
    { id: 5, name: "Color Picker", image: "/images/featured5.jpg" },
  ];

  const scroll = (direction) => {
    if (!scrollRef.current || !scrollRef.current.children.length) return;
    const firstItem = scrollRef.current.children[0];
    const itemWidth = firstItem.clientWidth;
    const amount = direction === "left" ? -(itemWidth + 16) : itemWidth + 16;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section className="section py-12 lg:py-20">
      <div className="container mx-auto px-6 lg:px-24 max-w-[1350px]">
        <div className="bg-gradient-to-b from-[#3B82F6] to-[#4FB3F6] text-white relative overflow-hidden rounded-2xl p-8 lg:p-12">

          <div className="grid items-center gap-8 lg:grid-cols-2">

            {/* LEFT TEXT CONTENT */}
            <motion.div
              className="z-10"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.3 } }, 
              }}
            >
              <motion.span
                className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur-sm"
                variants={fadeUp}
              >
                Featured
              </motion.span>

              <motion.h2
                className="mb-4 text-3xl font-bold lg:text-4xl"
                variants={fadeUp}
              >
                Popular Tools loved by Users
              </motion.h2>

              <motion.p
                className="text-lg text-[#E4E6EA]"
                variants={fadeUp}
              >
                Discover productivity focused tools crafted for speed and simplicity.
              </motion.p>
            </motion.div>

            {/* RIGHT CONTENT — CAROUSEL */}
            <div className="relative mt-6 lg:mt-0">
              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 no-scrollbar"
              >
                {tools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    className="min-w-full shrink-0 snap-start sm:min-w-[calc(50%-8px)]"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <div className="group relative w-full overflow-hidden rounded-2xl bg-white/10 border border-white/20 shadow-lg overflow-hidden">
                    <div className="relative w-full aspect-[4/3] bg-white/5 overflow-hidden">
                      <ManagedImage
                       src={tool.image}
                      alt={tool.name}
                      loading="eager"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{
                          WebkitBackfaceVisibility: "hidden", 
                         }}
                      />
                      </div>

                      {/* Fade Overlay */}
                      <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/10" />

                      {/* Text Overlay */}
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                        <p className="font-semibold text-white tracking-wide">
                          {tool.name}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* NAV BUTTONS */}
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => scroll("left")}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  onClick={() => scroll("right")}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
