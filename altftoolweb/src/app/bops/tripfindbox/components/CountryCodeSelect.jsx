"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const countries = [
  { flag: "🇺🇸", name: "United States", code: "+1" },
  { flag: "🇨🇦", name: "Canada", code: "+1" },
  { flag: "🇬🇧", name: "United Kingdom", code: "+44" },
  { flag: "🇦🇫", name: "Afghanistan", code: "+93" },
  { flag: "🇦🇱", name: "Albania", code: "+355" },
  { flag: "🇮🇳", name: "India", code: "+91" },
  { flag: "🇦🇪", name: "United Arab Emirates", code: "+971" },
  { flag: "🇦🇺", name: "Australia", code: "+61" },
  { flag: "🇸🇬", name: "Singapore", code: "+65" },
  { flag: "🇫🇷", name: "France", code: "+33" },
  { flag: "🇩🇪", name: "Germany", code: "+49" },
  { flag: "🇯🇵", name: "Japan", code: "+81" },
];

export default function CountryCodeSelect() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(countries[0]);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="tripnest-country-select" ref={rootRef}>
      <button
        type="button"
        className="tripnest-country-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="tripnest-country-compact">
          <span aria-hidden="true">{selected.flag}</span>
          <strong>{selected.code}</strong>
        </span>
        <ChevronDown size={18} aria-hidden="true" />
      </button>
      {open ? (
        <div className="tripnest-country-menu" role="listbox">
          {countries.map((country) => (
            <button
              type="button"
              role="option"
              aria-selected={country.name === selected.name && country.code === selected.code}
              className="tripnest-country-option"
              key={`${country.name}-${country.code}`}
              onClick={() => {
                setSelected(country);
                setOpen(false);
              }}
            >
              <span aria-hidden="true">{country.flag}</span>
              <span>{country.name}</span>
              <strong>{country.code}</strong>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
