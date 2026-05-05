"use client"
import React from 'react'
import { useState } from 'react'
import AddBestCoupon from './AddBestCoupon';
import GetBestCoupon from './GetBestCoupon';



function  BestCoupon() {
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
          Add  Brand  +
        </button>
      </div>
      </div>
      }
   
    

    {active ? 
    <AddBestCoupon
     setActive={setActive}
     editData={editData}
    setEditData={setEditData}
 
     
     /> : <GetBestCoupon
     setActive={setActive}
     setEditData={setEditData}
  
   
     /> } 
  </div>
  )
}

export default BestCoupon