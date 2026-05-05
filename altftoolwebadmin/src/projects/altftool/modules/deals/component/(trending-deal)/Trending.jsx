"use client"
import React from 'react'
import { useState } from 'react'
import AddTrending from './AddTrending';
import GetTrending from './GetTrending';




function  Trending() {
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
    <AddTrending
     setActive={setActive}
     editData={editData}
    setEditData={setEditData}
 
     
     /> : <GetTrending
     setActive={setActive}
     setEditData={setEditData}
  
   
     /> } 
  </div>
  )
}

export default Trending