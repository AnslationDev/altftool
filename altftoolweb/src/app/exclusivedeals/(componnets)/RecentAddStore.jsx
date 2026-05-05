// "use client"

// import React, { useRef } from "react"
// import Image from "next/image"
// import data from "../(data)/db.json"
// import { ChevronLeft, ChevronRight, Heart, HeartIcon } from "lucide-react"
// import Link from "next/link"
// import coco from "../(assets)/coco.png"

// function RecentlyAddedStore() {
//   const scrollRef = useRef(null)

//   const scroll = (direction) => {
//     if (!scrollRef.current) return
//     const amount = direction === "left" ? -350 : 350
//     scrollRef.current.scrollBy({ left: amount, behavior: "smooth" })
//   }

//   return (
//     <div className=" bg-(--background) text-(--foreground) md:my-20 my-12  relative">
//       <h1 className="md:text-3xl text-2xl text-center md:text-start font-bold mb-8">
//         RECENTLY ADDED STORE
//       </h1>

//       {/* Left Arrow - Hidden on mobile */}
//       <button
//         onClick={() => scroll("left")}
//         className="hidden md:block absolute  cursor-pointer top-[55%] z-10
//                      p-1.5 md:p-2 rounded-full
//                    hover:scale-110 transition"
//       >
//         <ChevronLeft size={18} className="md:w-5 md:h-5 lg:w-[22px] lg:h-[22px]" />
//       </button>

//       {/* Right Arrow - Hidden on mobile */}
//       <button
//         onClick={() => scroll("right")}
//         className="hidden md:block cursor-pointer absolute right-0.5 top-[55%] z-10
//                    p-1.5 md:p-2 rounded-full
//                    hover:scale-110 transition"
//       >
//         <ChevronRight size={18} className="md:w-5 md:h-5 lg:w-[22px] lg:h-[22px]" />
//       </button>

//       {/* Cards */}
//       <div
//         ref={scrollRef}
//         className="flex max-w-[94%] py-2 mx-auto gap-3 sm:gap-4  md:gap-6 lg:gap-8 overflow-x-auto md:overflow-x-hidden scrollbar-hide px-2"
//       >
//         {data.recentStores.map((store) => (
//           <Link key={store.id} href={`exclusivedeals/${store.slug}`} >
            
//           <div
//             key={store.id}
//             className="min-w-[265px] 
//                        relative
//                        bg-(--background) rounded-2xl sm:rounded-3xl
//                        flex items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 
//                        px-3 sm:px-4 md:px-5 lg:px-6 
//                        py-3 sm:py-4 md:py-5 lg:py-6
//                        border border-gray-100
//                          hover:shadow-md
//                        transition hover:-translate-y-1 cursor-pointer"
//           >

//             <div className="absolute top-2  right-4 ">
//               <HeartIcon size={22} className="text-yellow-500" />
//             </div>
          
//             {/* Image */}
//             <div className="relative  w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 lg:w-24 lg:h-24 
//                            rounded-full overflow-hidden flex-shrink-0">
//               <Image
//                 src={store.img}
//                 alt={store.name}
//                 fill
//                 className="object-cover"
//               />
//             </div>

//             {/* Info */}
//             <div  className="flex-1  min-w-0">
//               <h2 className=" text-center  text-(--foreground) sm:text-lg md:text-xl font-bold truncate">
//                 {store.name}
//               </h2>

//               <div className=" h-0.5 bg-(--foreground) my-1.5 sm:my-2" />

//               <p className="text-sm text-center text-(--foreground) sm:text-base ">
//                 {store.offers} Offers
//               </p>
//             </div>
          
            
//           </div>
         
//           </Link>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default RecentlyAddedStore




"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import data from "../(data)/db.json"
import { ChevronLeft, ChevronRight, HeartIcon } from "lucide-react"
import Link from "next/link"

function RecentlyAddedStore() {
  const items = data.recentStores

  const [index, setIndex] = useState(0)
  const [visibleCards, setVisibleCards] = useState(4)

  /* ---------- Responsive cards count ---------- */
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth

      if (width < 640) setVisibleCards(1)
      else if (width < 1024) setVisibleCards(2)
      else setVisibleCards(4)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  /* ---------- Manual Controls ---------- */
  const next = () => {
    setIndex((prev) => {
      const maxIndex = items.length - visibleCards
      return prev >= maxIndex ? 0 : prev + 1
    })
  }

  const prev = () => {
    setIndex((prev) => (prev <= 0 ? items.length - visibleCards : prev - 1))
  }

  /* ---------- Auto Scroll (Infinite) ---------- */
  useEffect(() => {
    if (!items.length) return

    const interval = setInterval(() => {
      setIndex((prev) => {
        const maxIndex = items.length - visibleCards
        return prev >= maxIndex ? 0 : prev + 1
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [items.length, visibleCards])

  return (
    <section className="md:my-20  my-12 relative overflow-hidden">
      {/* Header */}
      <div className="flex md:justify-between justify-center items-center mb-8">
        <h1 className="md:text-3xl   text-2xl font-bold">
          RECENTLY ADDED STORE
        </h1>

        {/* Arrows */}
        <div className="hidden md:flex gap-3">
          <button
            onClick={prev}
            className="w-10 h-10 flex items-center justify-center
                       rounded-full border
                       hover:bg-black hover:text-white transition"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={next}
            className="w-10 h-10 flex items-center justify-center
                       rounded-full border
                       hover:bg-black hover:text-white transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${index * (100 / visibleCards)}%)`,
          }}
        >
          {items.map((store) => (
            <div
              key={store.id}
              style={{ minWidth: `${100 / visibleCards}%` }}
              className="md:px-2 px-6"
            >
              <Link href={`exclusivedeals/${store.slug}`}>
                <div
                  className="relative bg-(--background)
                             rounded-2xl sm:rounded-3xl
                             flex items-center gap-4
                             px-6 sm:px-5 lg:px-6
                             py-6 sm:py-5
                             border border-gray-100
                             hover:shadow-md transition
                             hover:-translate-y-1 cursor-pointer"
                >
                  {/* Heart */}
                  <div className="absolute top-3 right-4">
                    <HeartIcon size={22} className="text-yellow-500" />
                  </div>

                  {/* Image */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24
                                  rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={store.img}
                      alt={store.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-center">
                    <h2 className="font-bold text-base sm:text-lg truncate">
                      {store.name}
                    </h2>

                    <div className="h-0.5 bg-(--foreground) my-2" />

                    <p className="text-sm sm:text-base">
                      {store.offers} Offers
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default RecentlyAddedStore
