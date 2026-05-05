
import Image from "next/image";
import React from "react";
import data from "../(data)/db.json";
import { useState } from "react";
import Link from "next/link";

function TrendingCategory() {
  const [trending] = useState(data.categories);
  const trendingCategory = trending.slice(0, 4);
  return (
    <div >
      <h1 className="md:text-3xl text-2xl text-center md:text-start font-bold mb-8">TRENDING CATEGORIES </h1>

      <div className="flex flex-wrap justify-center gap-4  md:justify-between">
        {trendingCategory?.map((c , index) => (
          <Link href={`exclusivedeals/${c.slug}`} key={index} >
              <div className="w-72  h-64  rounded-xl border-2 border-gray-300 shadow-xl overflow-hidden  hover:shadow-2xl cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-1.5">
          
              {/* Image Section */}
              <div className="relative h-[65%] border-b border-amber-100">
                <Image
                  src={c.img}
                  alt="category"
                  fill
                  className=""
                />
              </div>
    
              {/* Content Section */}
              <div className="h-[30%] flex flex-col justify-center">
                <p className="text-center text-2xl font-black py-2">
                  {c.categoryName}
                </p>
    
                <div className="flex text-(--forground) text-sm">
                  <div className="w-1/2 text-center border-r-2">
                    319 Coupons
                  </div>
                  <div className="w-1/2 text-center">
                    379 Offers
                  </div>
                </div>
              </div>
            </div>
            </Link>
        ))}
       
      </div>
    </div>
  );
}

export default TrendingCategory;

