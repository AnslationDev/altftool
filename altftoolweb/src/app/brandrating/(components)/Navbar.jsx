"use client";
import React, { useState } from "react";
import Image from "next/image";
import { MenuIcon } from "lucide-react";
import SubMenu from "./SubMenu";
import { AnimatePresence } from "framer-motion";

function Navbar({ data }) {
  const [active, setActive] = useState(false);

  function handleClick() {
    setActive((prev) => !prev);
  }

  return (
    <div className="relative w-full">
      
      {/* Navbar */}
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-20 py-4">
        
        {/* Logo */}
        <div className="relative">
          {/* <Image src={consumer} alt="logo" width={200} height={60} priority /> */}

          <p className="text-xl sm:text-2xl md:text-3xl font-semibold">
            Brand
            <span className="text-red-600 text-2xl sm:text-3xl md:text-4xl ml-1">
              Rating
            </span>
          </p>
        </div>

        {/* Menu */}
        <div className="flex gap-2 items-center text-base sm:text-lg md:text-xl font-medium">
          <span className="hidden sm:block">Category</span>

          <span
            onClick={handleClick}
            className="cursor-pointer text-red-600 hover:scale-110 transition"
          >
            <MenuIcon size={26} />
          </span>
        </div>
      </div>

      {/* Submenu */}
      <div className="absolute z-20 -top-5 left-0 w-full">
        <AnimatePresence>
          {active && <SubMenu handleClick={handleClick} data={data} />}
        </AnimatePresence>
      </div>

    </div>
  );
}

export default Navbar;