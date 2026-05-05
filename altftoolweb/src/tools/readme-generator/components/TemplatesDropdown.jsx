import { useState } from "react";
import { LayoutTemplate } from "lucide-react";
import { templates } from "./Template";

export default function TemplatesDropdown({ setUserInput }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative  w-full sm:w-auto">
      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-(--muted)"
      >
        <LayoutTemplate />
      </button>

      {open && (
        <div className="  absolute top-full mt-2
  right-0
  w-44 sm:w-56
  max-w-[calc(100vw-2rem)]
  bg-(--card)
  border border-(--border)
  rounded-xl
  shadow-xl
  z-50">
    <div className="max-h-60 overflow-y-auto no-scrollbar">
  <div className="p-2 space-y-1">
          {Object.keys(templates).map((key) => (
            <button
              key={key}
              onClick={() => {
                setUserInput(templates[key]);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-(--muted)"
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        </div>
    </div>
      )}
    </div>
  );
}