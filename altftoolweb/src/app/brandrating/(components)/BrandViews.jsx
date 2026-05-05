"use client";

import { useEffect, useState } from "react";
import { getFormattedBrandData } from "../service/getFormattedBrandData";
import { div } from "@tensorflow/tfjs-core";




export default function DataView() {
    
    const [data , setData] = useState([])
    const [loading , setLoading] = useState(true)
    const [active , setActive] = useState(false)
    const [activeCategory, setActiveCategory] = useState(null); 

    useEffect(() => {
        async function fetchData() {
          try {
            const formatted = await getFormattedBrandData();
            setData(formatted);
          } catch (err) {
            console.log(err);
          } finally {
            setLoading(false);
          }
        }
      
        fetchData();
      }, []);

      const filterSubcategory = data.map((item) => (
        {...item,
        subcategories: item.subcategories?.slice(0, 1),
        }
    ))
    // console.log("nsjd" ,filterSubcategory )


console.log(data , "all data")


  return (
    <div className="flex gap-4">
    {data.map((item) => (
      <div
        key={item.name}
        className="relative"
        onMouseEnter={() => setActiveCategory(item.name)}   
        onMouseLeave={() => setActiveCategory(null)}       
      >
        {/* CATEGORY */}
        <div
          onClick={() => setActiveCategory(item.name)} 
          className="border px-4 py-2 border-gray-300 rounded-full cursor-pointer"
        >
          {item.name}
        </div>

        {/* SUBCATEGORY DROPDOWN */}
        {activeCategory === item.name && (
          <div className="absolute top-12 left-0 bg-white border rounded-lg shadow p-3 min-w-[150px]">
            {item.subcategories?.length ? (
              item.subcategories.map((sub) => (
                <div
                  key={sub.name}
                  className="py-1 text-sm hover:text-blue-600 cursor-pointer"
                >
                  {sub.name}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No subcategory</p>
            )}
          </div>
        )}
      </div>
    ))}
  </div>
  );
}
