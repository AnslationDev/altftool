"use client";
import React, { useState, useRef , useEffect } from "react";
import { ChevronDown, Search, Menu, X } from "lucide-react";
import Categories from "./Categories";
import AllStoreSection from "./AllStoreSection";
import SearchBox from "./SearchBox";

function CouponHeader() {
  const [menu, setMenu] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);

  const navbarMenu = [
    { id: 1, item: "Categories" },
    { id: 2, item: "All Stores" },
    { id: 3, item: "Seasonal Sale" },
  ];

  const handleSearchClick = () => {
    setShowSearch(true);
    setMenu("");
  };

  const handleMobileMenuClick = (menuItem) => {
    setMenu(menu === menuItem ? "" : menuItem);
  };

  const handleMobileMenuToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const [showHamburger, setShowHamburger] = useState(true)
const [lastScrollY, setLastScrollY] = useState(0)

useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY

    // scrolling down → hide
    if (currentScrollY > lastScrollY && currentScrollY > 0) {
      setShowHamburger(false)
    }
    // scrolling up → show
    else {
      setShowHamburger(true)
    }

    setLastScrollY(currentScrollY)
  }

  window.addEventListener("scroll", handleScroll)
  return () => window.removeEventListener("scroll", handleScroll)
}, [lastScrollY])

  return (
    <>
      {/* HEADER */}
      <header className="bg-(--background) text-(--foreground)">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            
            <button
  type="button"
  onClick={handleMobileMenuToggle}
  className={`lg:hidden p-2 text-gray-700 z-50
    hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300
    rounded-md transition-all duration-300
    ${showHamburger ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}
  `}
  aria-label="Toggle mobile menu"
  aria-expanded={mobileMenuOpen}
>
  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
</button>

            {/* NAV - Desktop Only */}
            <nav className="hidden lg:flex gap-4 xl:gap-8">
              {navbarMenu.map((menuItem) => (
                <div
                  key={menuItem.id}
                  onMouseEnter={() => {
                    setMenu(menuItem.item);
                    setShowSearch(false);
                  }}
                  className="relative flex items-center gap-1 cursor-pointer group"
                >
                  <span className="text-sm xl:text-base font-medium group-hover:text-black">
                    {menuItem.item}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform  ${
                      menu === menuItem.item ? "rotate-180" : ""
                    }`}
                  />
                </div>
              ))}
            </nav>

            {/* SEARCH */}
            <div className="relative w-full  max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-96" ref={searchRef}>
              <Search 
                className="absolute left-3  sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                size={16}
              />
              <input
                type="search"
                onClick={handleSearchClick}
                onFocus={handleSearchClick}
                placeholder="Search for coupons, stores..."
                className="w-full pl-9 text-(--muted-foreground) sm:pl-11 z-50 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-full border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/10"
              />
              
              {/* SEARCH DROPDOWN */}
              {showSearch && (
                <div className="absolute  top-full mt-2 left-0 right-0 z-50">
                  <SearchBox onClose={() => setShowSearch(false)} />
                </div>
              )}
            </div>
          </div>

          {/* MOBILE MENU */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200">
              <nav className="py-2">
                {navbarMenu.map((menuItem) => (
                  <div key={menuItem.id}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleMobileMenuClick(menuItem.item);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 text-left"
                    >
                      <span className="text-sm sm:text-base font-medium text-gray-700">
                        {menuItem.item}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${
                          menu === menuItem.item ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    
                    {/* Mobile Dropdown Content */}
                    {menu === menuItem.item && (
                      <div className="bg-gray-50 px-4 py-4">
                        {menuItem.item === "Categories" && <Categories />}
                        {menuItem.item === "All Stores" && <AllStoreSection />}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* OVERLAY */}
      {showSearch && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowSearch(false)}
        />
      )}

      {/* DESKTOP FLOATING DROPDOWN */}
      {menu === "Categories" && !mobileMenuOpen && (
        <div
          onMouseEnter={() => setMenu("Categories")}
          onMouseLeave={() => setMenu("")}
          className="hidden lg:block absolute left-0 w-full z-40 bg-white shadow-2xl"
        >
          <div className="mx-auto bg-gray-200 py-10">
            <Categories />
          </div>
        </div>
      )}
      {menu === "All Stores" && !mobileMenuOpen && (
        <div
          onMouseEnter={() => setMenu("All Stores")}
          onMouseLeave={() => setMenu("")}
          className="hidden lg:block absolute left-0 w-full z-40 bg-white shadow-2xl"
        >
          <div className="mx-auto bg-gray-200 py-10">
            <AllStoreSection />
          </div>
        </div>
      )}
    </>
  );
}

export default CouponHeader;