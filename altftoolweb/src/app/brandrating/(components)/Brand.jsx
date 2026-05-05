"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import news from "../(assets)/enews.png";
import benz from "../(assets)/benzinga.png";
import yahoo from "../(assets)/yahoo.png";
import bi from "../(assets)/bi.png";
import inc from "../(assets)/inc.png";

function Brand() {
  const brandLogo = [
    { id: 1, img: news },
    { id: 2, img: benz },
    { id: 3, img: yahoo },
    { id: 4, img: bi },
    { id: 5, img: inc },
  ];

  // duplicate for seamless loop
  const items = [...brandLogo, ...brandLogo];

  return (
    <div className="w-full overflow-hidden  py-6 animate-slide-up">
      

      <div className="overflow-hidden w-full  px-4 sm:px-6">

        <motion.div
          className="flex items-center whitespace-nowrap will-change-transform"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            repeat: Infinity,
            duration: 28,
            ease: [0.42, 0, 0.58, 1],
          }}
        >

      
          <div className="flex items-center gap-6 sm:gap-8 md:gap-12 pr-6 sm:pr-8 md:pr-12">
            {items.map((item, index) => (
              <div
                key={`a-${index}`}
                className="w-[120px] h-[60px] sm:w-[150px] sm:h-[80px] md:w-[180px] md:h-[90px] flex items-center justify-center shrink-0 hover:scale-110 transition-transform duration-300 ease-out"
              >
                <Image
                  src={item.img}
                  alt="brand"
                  width={130}
                  height={50}
                  className="object-contain max-h-[30px] sm:max-h-[40px] md:max-h-[45px] w-auto h-auto"
                />
              </div>
            ))}
          </div>

      
          <div className="flex items-center gap-12 pr-12">
            {items.map((item, index) => (
              <div
                key={`b-${index}`}
                className=" w-[120px] h-[60px] sm:w-[140px] sm:h-[70px] md:w-[160px] md:h-[80px] flex items-center justify-center shrink-0"
              >
                <Image
                  src={item.img}
                  alt="brand"
                  width={130}
                  height={50}
                  className="object-contain max-h-[45px]"
                />
              </div>
            ))}
          </div>

        </motion.div>

      </div>
    </div>
  );
}

export default Brand;
