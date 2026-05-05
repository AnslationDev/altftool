"use client"
import React from 'react'
import AddTrending from './AddTrending';
import GetTrending from "./GetTrending"
import { useState } from 'react'
import FilterSection from '../FilterSection';


function Trending() {
   const [active, setActive] = useState(null);
   const[editTrending , setEditTrending] = useState(null)
    const [filter , setFilter] = useState({
            Search:"",
            status: "all",
        })
  
        function handleComponent() {
          setEditTrending(null); 
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
             Add Trend Banner +
           </button>
         </div>
         </div>
      )}
  


    {active ? 
    <AddTrending
     setActive={setActive}
     editTrending={editTrending}
     setEditTrending={setEditTrending}
     
     /> : <GetTrending
     setActive={setActive}
     setEditTrending={setEditTrending}
     filter={filter}
     /> } 
  </div>
  )
}

export default Trending