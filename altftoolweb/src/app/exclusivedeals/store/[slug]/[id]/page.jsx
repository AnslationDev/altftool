"use client"
import { useParams } from 'next/navigation'
import React from 'react'
import BrandOffer from './(components)/BrandOffer'

function page() {
    const {id} = useParams()
  return (
    <div>
         <BrandOffer id={id} />
    </div>
  )
}

export default page