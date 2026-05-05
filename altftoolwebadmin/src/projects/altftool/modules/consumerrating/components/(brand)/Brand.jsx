"use client"
import React from 'react'
import { useState } from 'react'
import AddBrand from './AddBrand';
import GetBrand from './GetBrand';



function Brand() {
  const [active, setActive] = useState(null);
  const [editBrand, setEditBrand] = useState(null); 

  function handleComponent() {
    setEditBrand(null); 
    setActive(true);
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
          Add Brand Detail +
        </button>
      </div>
      </div>
      }
   
    

   {active ? (
        <AddBrand
          setActive={setActive}
          editBrand={editBrand}      
          setEditBrand={setEditBrand} 
        />
      ) : (
        <GetBrand
          setActive={setActive}
          setEditBrand={setEditBrand} 
        />
      )}
  </div>
  )
}

export default Brand