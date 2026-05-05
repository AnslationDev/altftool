"use client"
import React from 'react'
import { useState } from 'react'
import AddCategory from './AddCategory';
import GetCategory from './GetCategory';



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
          Add Category Detail Banner +
        </button>
      </div>
      </div>
      }
   
    

    {active ? 
    <AddCategory
     setActive={setActive}
     editData={editData}
    setEditData={setEditData}
 
     
     /> : <GetCategory 
     setActive={setActive}
     setEditData={setEditData}
  
   
     /> } 
  </div>
  )
}

export default Category