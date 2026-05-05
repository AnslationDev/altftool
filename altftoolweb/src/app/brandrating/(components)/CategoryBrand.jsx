"use client"
import Link from 'next/link';
import React, { useEffect, useRef } from 'react'

function CategoryBrand({data}) {

  const scrollRef = useRef(null)

  const CategoryData = data?.categories || [];
  
  const oneBrandPerCategory = CategoryData.slice(0,4).map((item) => ({
    category: item.category,
    brand: item.brands?.[0]
  }));

  function getURlLink(category) {
    return category
      ?.toLowerCase()
      ?.trim()
      ?.replace(/\s+/g, "-")
  }

  // Auto scroll for mobile
  useEffect(() => {
    const container = scrollRef.current
    if(!container) return

    const interval = setInterval(() => {
      container.scrollBy({
        left: 220,
        behavior: "smooth"
      })

      if(
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth
      ){
        container.scrollTo({ left: 0, behavior: "smooth" })
      }

    },3000)

    return () => clearInterval(interval)

  },[])

  return (
    <section className='max-w-7xl mx-auto my-10 px-4 sm:px-6 lg:px-8'>

        <div
          ref={scrollRef}
          className='
          flex gap-6
          overflow-x-auto md:overflow-visible
          scrollbar-hide
          md:flex-wrap md:justify-between
          '
        >

            {oneBrandPerCategory.map((item , index) => (
              <Link
                key={index}
                href={`/brandrating/categories/${getURlLink(item.category)}/${getURlLink(item.brand?.name)}`}
              >

                 <div
                 className='
                 min-w-[220px] md:min-w-0
                 w-[220px] md:w-70
                 group h-36 md:h-40
                 cursor-pointer
                 hover:border-black
                 border-t-2 border-gray-300
                 '
                 >

                 <p className='text-xl md:text-3xl font-bold group-hover:text-red-500 py-3 md:py-4'>
                   {item.brand?.name}
                 </p>

                 <p className='text-sm md:text-base py-2 md:py-4'>
                   {item.category}
                 </p>

             </div>

             </Link>
            ))}
            
        </div>

    </section>
  )
}

export default CategoryBrand  