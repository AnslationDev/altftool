import { useState } from "react";
import { motion } from "framer-motion";

export default function PlateControls({ onAnswer, onSkip }) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAnswer(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-(--secondary-foreground)">
            What number do you see?
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter number or 'none'"
            className="w-full p-4 text-xl font-bold text-center bg-(--background) border-2 border-(--border) rounded-2xl focus:border-(--primary) outline-none transition-all"
            autoFocus
          />
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 btn-primary py-4 text-lg shadow-lg"
          >
            Submit Answer
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-4 btn-secondary text-lg"
          >
            Skip
          </button>
        </div>
      </form>
      
      <p className="text-xs text-(--muted-foreground) text-center italic">
        If you don't see any number, type "none" or skip the plate.
      </p>
    </div>
  );
}
