import React from 'react'
import Image from 'next/image'
import data from "../(data)/db.json"
import Link from 'next/link'


function TrendingStore() {
  const stores = data.trendingStores

  const card = stores.slice(0,4)
  return (
    <div className='' >
         <h1 className="text-2xl text-center md:text-start sm:text-2xl md:text-3xl font-bold mb-8">
          TRENDING STORE
         </h1>
          <div className='flex justify-center flex-wrap gap-8 md:gap-4 md:0 md:justify-between' >
            {card.length > 0 && card.map((store , index) => (
              <Link key={index} href={`/exclusivedeals/${store.slug}`} >
                   <div className='border-2  overflow-hidden border-gray-300 shadow-2xl drop-shadow-2xl-white w-72 h-56 rounded-3xl  '>
                   <div className='h-[50%] relative  bg-[#e6e6e6]'>
                       <Image 
                        src={store.img}
                         alt='al'
                         fill
                         className=''
                       />
                   </div>
                   <div className='h-[30%] flex justify-center items-center flex-col ' >
                   <p className='font-bold text-xl' >{store.name}</p>
                   <p className='text-sm text-(--foreground) ' >{store.deals} deals </p>
                   </div>
                   <div className='h-[20%] text-lg font-bold flex justify-center  items-center bg-[#f7d069] '>
                     <p >EXPLORE NOW</p>
                   </div>
   
                 </div>
              </Link>
            ))}
             
          </div>
    </div>
  )
}

export default TrendingStore