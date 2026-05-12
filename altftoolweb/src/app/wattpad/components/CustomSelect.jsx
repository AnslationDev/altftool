"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronDown } from "lucide-react";

export default function CustomSelect({

  options = [],
  value,
  onChange,
  placeholder = "Select",
  desktopClass = "md:w-[220px]",
}) {

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  // OUTSIDE CLICK
  useEffect(() => {

    function handleClickOutside(event) {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {

        setOpen(false);

      }

    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);

  return (

    <div
      ref={dropdownRef}
      className={`relative w-full ${desktopClass}`}
    >

      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-11 px-4 rounded-xl border border-(--border) bg-(--background) flex items-center justify-between text-sm cursor-pointer"
      >

        <span className="truncate">

          {value || placeholder}

        </span>

        <ChevronDown
          size={18}
          className={`transition-all duration-300 shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />

      </button>

      {/* DROPDOWN */}
      <div
        className={`absolute bottom-[115%] left-0 w-full bg-(--card) border border-(--border) rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden z-50 origin-bottom transition-all duration-300 ${
          open
            ? "opacity-100 scale-100 visible"
            : "opacity-0 scale-95 invisible"
        }`}
      >

        <div className="max-h-[250px] overflow-y-auto">

          {options.map((option) => (

            <button
              key={option.value}
              onClick={() => {

                onChange(option.value);

                setOpen(false);

              }}
              className={`w-full text-left px-4 py-3 text-sm transition cursor-pointer hover:bg-(--background) ${
                value === option.value
                  ? "bg-(--background) font-semibold"
                  : ""
              }`}
            >

              {option.label}

            </button>

          ))}

        </div>

      </div>

    </div>

  );

}