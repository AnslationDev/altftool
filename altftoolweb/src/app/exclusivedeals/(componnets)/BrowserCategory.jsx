"use client";
import Image from 'next/image'
import React from 'react'
import seedData from "../(data)/db.json"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { categoryfirebase } from "../service/firebasecategory";
import { BrowserCategorySkeleton } from "../DealsPageSkeleton";

// db.json is the build-time copy of the same catalogue Firestore serves. Mapped
// here to the shape this component renders: Firestore calls it `name`, the
// bundled file calls it `categoryName`.
const SEED_CATEGORIES = (seedData.categories || [])
  .map((item) => ({
    id: item?.id,
    name: item?.categoryName,
    image: item?.image || item?.img,
  }))
  .filter((item) => item.id && item.name && item.image);

function BrowserCategory() {
    const [category, setcategory] = useState(SEED_CATEGORIES);
    const [loading, setLoading] = useState(SEED_CATEGORIES.length === 0);

    useEffect(() => {
      const unsubscribe = categoryfirebase((liveCategories) => {
        if (Array.isArray(liveCategories) && liveCategories.length) {
          setcategory(liveCategories);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, []);

    if (loading) return <BrowserCategorySkeleton />;
  
  return (
    <div className='section animate-slide-up'>
      <h2 className="section-title">Shop by Category</h2>
      <p className="section-subtitle !mx-0 text-left">Find deals across fashion, electronics, travel & more</p>

      {/* Mobile: horizontal scroll | Desktop: grid */}
      <div className='flex gap-4 overflow-x-auto pb-2 scrollbar-hide lg:grid lg:grid-cols-6 lg:gap-2 lg:overflow-visible no-scrollbar' >
        {category.map((item) => (
          <div key={item.id} className='flex-shrink-0 lg:flex-shrink animate-slide-right'>
            <Link href={`/exclusivedeals/all-stores?category=${encodeURIComponent(item.name)}`}>
              <CatCard item={item} />
            </Link>
          
          </div>
        ))}
      </div>
    </div>
  )
}

export default BrowserCategory


function CatCard({ item }) {
  return (
    <div className='flex justify-center items-center cursor-pointer flex-col min-h-[140px] py-4'>
      
      <div className='deals-image-shell rounded-full flex justify-center items-center overflow-hidden w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 lg:w-30 lg:h-30 xl:w-36 xl:h-36 2xl:w-40 2xl:h-40'>
        {item.id == 1 ? (
          <Image src={item.image} width={120} height={120} alt={item.name} className='object-cover animate-pulse transition-transform duration-300 hover:scale-110 xl:w-[130px] xl:h-[130px]' />
        ) : (
          <Image src={item.image} width={90} height={90} alt={item.name} className='object-cover transition-transform duration-300 hover:scale-110 w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-[90px] lg:h-[90px] xl:w-[94px] xl:h-[94px] 2xl:w-[100px] 2xl:h-[100px]' />
        )}
      </div>
      <div className='text-center mt-2 text-xs sm:text-sm font-bold'>{item.name}</div>
    </div>
  )
}
