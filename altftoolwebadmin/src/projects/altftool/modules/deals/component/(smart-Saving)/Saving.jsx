"use client"
import React from 'react'
import { useState } from 'react'
import GetSaving from "./GetSaving"
import AddSaving from './AddSaving'



function  HeroBanner() {
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
          Add  Hero Banner +
        </button>
      </div>
      </div>
      }
   
    

    {active ? 
    <AddSaving
     setActive={setActive}
     editData={editData}
    setEditData={setEditData}
 
     
     /> : <GetSaving
     setActive={setActive}
     setEditData={setEditData}
  
   
     /> } 
  </div>
  )
}

export default HeroBanner