"use client"
import React from 'react'
import { useParams, usePathname } from 'next/navigation'
import CategoryBrand from './(component)/CategoryBrand'

function page() {
    const{slug} = useParams()
    
  return (
    <div>
         <CategoryBrand  slug={slug}  />
    </div>
  )
}

export default page