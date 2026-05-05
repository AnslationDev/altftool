"use client"
import { useParams } from 'next/navigation'
import React from 'react'
import BrandDetail from './(components)/BrandDetail'

function page() {
   const {id} = useParams()

  return (
    <div>
         <BrandDetail  id={id} />
    </div>
  )
}

export default page