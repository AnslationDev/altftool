"use client"
import React from 'react'
import { useState } from 'react'
import AddCoupon from './AddCoupon';
import GetCoupon from './GetCoupon';



function  TopCoupon() {
   const [active, setActive] = useState(null);
   const [editData, setEditData] = useState(null);
  
     function handleComponent() {
      setActive(true);
      setEditData(null)
    }

  return (
    <div className="space-y-6">

      {!active &&
         <div className="flex items-center justify-end" >
        
        <div
        onClick={handleComponent}
        className=' h-12  flex justify-center'
      >
        <button className='btn btn-primary '>
          Add  Coupon +
        </button>
      </div>
      </div>
      }
   
    

    {active ? 
    <AddCoupon
     setActive={setActive}
     editData={editData}
    setEditData={setEditData}
 
     
     /> : <GetCoupon
     setActive={setActive}
     setEditData={setEditData}
  
   
     /> } 
  </div>
  )
}

export default TopCoupon