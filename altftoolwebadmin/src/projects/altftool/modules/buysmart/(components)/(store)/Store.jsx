"use client"
import React from 'react'
import AddStore from './AddStore';
import GetStore from './GetStore';
import { useState } from 'react'
import FilterSection from '../FilterSection';


function Store() {
   const [active, setActive] = useState(null);
   const[editStore , setEditStore] = useState(null)
     const [filter , setFilter] = useState({
         Search:"",
         status: "all",
     })
  
     function handleComponent() {
      setEditStore(null); 
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
          Add Store Banner +
        </button>
      </div>
      </div>
      }
   
    

    {active ? 
    <AddStore 
     setActive={setActive}
     editStore={editStore}
     setEditStore={setEditStore}
     
     /> : <GetStore 
     setActive={setActive}
     setEditStore={setEditStore}
     filter={filter}
     /> } 
  </div>
  )
}

export default Store