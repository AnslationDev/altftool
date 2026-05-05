"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function DealOfDay({ dealOfDay = [] }) {
  const topCards = dealOfDay?.filter(
    (item) => item.row === "top"
  );

  const bottomCards = dealOfDay?.filter(
    (item) => item.row === "bottom"
  );

const CardWrapper = ({ item, children }) => {
  const isExternal = item.link?.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {children}
      </a>
    );
  }

  return <Link href={item.link || "#"}>{children}</Link>;
};

  return (
    <section className="section bg-(--background)">
      {/* Heading */}
      <div className="mb-6 md:mb-8">
        <h2 className="section-title text-left! mb-2">
          Deal Of The Day
        </h2>

        <p className="text-(--muted-foreground) text-sm md:text-lg font-secondary ">
          Limited-Time Deals On Top Picks. Grab Them Before They’re Gone.
        </p>
      </div>
      

      {/* TOP ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        {topCards.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            transition={{
              duration: 0.35,
              delay: index * 0.05,
            }}
            viewport={{ once: true }}
            className={
              item.size === "wide"
                ? "lg:col-span-7"
                : "lg:col-span-5"
            }
          >
            <CardWrapper item={item}> 
              <div className="relative overflow-hidden rounded-[22px] h-[255px] md:h-[310px] lg:h-[275px] xl:h-[360px] cursor-pointer group">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 58vw, 720px"
                  className="object-fill group-hover:scale-[1.01] transition duration-500"
                />
              </div>
            </CardWrapper>
          </motion.div>
        ))}
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bottomCards.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            transition={{
              duration: 0.35,
              delay: index * 0.05,
            }}
            viewport={{ once: true }}
          >
            <CardWrapper item={item}>
              <div className="relative overflow-hidden rounded-[22px] h-[235px] md:h-[265px] xl:h-[293px] cursor-pointer group">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 420px"
                  className="object-fill group-hover:scale-[1.01] transition duration-500"
                />
              </div>
           </CardWrapper>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
