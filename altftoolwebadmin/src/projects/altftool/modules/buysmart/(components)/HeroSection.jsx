"use client";

import React, { useState } from "react";
import AddHeroBanner from "./AddHeroBanner";
import GetHeroSectionData from "./GetHeroSectionData";




function HeroSection() {

  const [active, setActive] = useState(null);
  const [editHero, setEditHero] = useState(null)
  const [filter, setFilter] = useState({
    Search: "",
    status: "all",
  })

  function handleComponent() {
    setEditHero(null);
    setActive(true);
  }

  return (
    <div className="space-y-6 ">
      {!active && (
        <>
          <div className="flex items-center justify-end" >
            
            <div
              onClick={handleComponent}
              className=' h-12   flex justify-center'
            >
              <button className='btn btn-primary '>
                Add Hero Banner +
              </button>
            </div>
          </div>
        </>
      )}




      {active ?
        <AddHeroBanner
          setActive={setActive}
          setEditHero={setEditHero}
          editHero={editHero}

        /> :
        <GetHeroSectionData
          setActive={setActive}
          setEditHero={setEditHero}
          filter={filter}
        />}
    </div>
  );
}

export default HeroSection;



