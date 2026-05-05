"use client"
import React from 'react'
import { useState } from 'react'
import AddHeroBanner from './AddHeroBanner';
import GetHeroBanner from './GetHeroBanner';



function Category() {
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
    <AddHeroBanner
     setActive={setActive}
     editData={editData}
    setEditData={setEditData}
 
     
     /> : <GetHeroBanner
     setActive={setActive}
     setEditData={setEditData}
  
   
     /> } 
  </div>
  )
}

export default Category