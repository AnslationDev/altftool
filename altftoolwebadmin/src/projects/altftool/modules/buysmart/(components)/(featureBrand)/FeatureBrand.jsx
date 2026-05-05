
"use client"
import React from 'react'
import AddFeatureBrand from './AddFeatureBrand';
import GetFeatureBrand from './GetFeatureBrand';
import { useState } from 'react'



function FeatureBrand() {
   const [active, setActive] = useState(null);
   const[editFeature , setEditFeature] = useState(null)
    
  
   function handleComponent() {
    setEditFeature(null); 
    setActive(true);
  }

    

    
  

  return (
    <div className="space-y-6">
      {!active && (
            <div className="flex items-center justify-end" >
           <div
           onClick={handleComponent}
           className='h-12  flex justify-center'
         >
           <button className='btn btn-primary '>
             Add Feature Banner +
           </button>
         </div>
         </div>
      )}
  


    {active ? 
    <AddFeatureBrand
     setActive={setActive}
     editFeature={editFeature}
     setEditFeature={setEditFeature}
     
     /> : <GetFeatureBrand
     setActive={setActive}
     setEditFeature={setEditFeature}
     /> } 
  </div>
  )
}

export default FeatureBrand