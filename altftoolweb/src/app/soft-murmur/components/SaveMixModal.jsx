"use client";

import React, { useState } from "react";
import * as Icons from "lucide-react";

export default function SaveMixModal({ isOpen, onClose, onSave }) {
  const [mixName, setMixName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mixName.trim()) {
      setErrorMsg("Please enter a name for your custom mix.");
      return;
    }
    const success = onSave(mixName.trim());
    if (success) {
      setMixName("");
      setErrorMsg("");
      onClose();
    } else {
      setErrorMsg("A mix with this name already exists.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content relative bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close modal"
        >
          <Icons.X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Icons.Save size={20} />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">
            Save Custom Mix
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
            Give your current selection of ambient sounds and volume balances a name to save it to your local list.
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Mix Name
            </label>
            <input
              type="text"
              maxLength="30"
              value={mixName}
              onChange={(e) => {
                setMixName(e.target.value);
                setErrorMsg("");
              }}
              placeholder="e.g. Study in Rain, Cozy Cabin"
              className="px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-900 dark:text-slate-100 font-semibold"
            />
            {errorMsg && <span className="text-[10px] font-bold text-rose-500">{errorMsg}</span>}
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Save Mix
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
