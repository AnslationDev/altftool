"use client";

import React from "react";
import * as Icons from "lucide-react";
import { ambientSounds } from "../data/ambientSounds";

export default function SavedMixes({ savedMixes, onLoadMix, onDeleteMix }) {
  const getActiveSoundsString = (mix) => {
    return Object.keys(mix.sounds)
      .map((id) => {
        const sound = ambientSounds.find((s) => s.id === id);
        return sound ? sound.name : id;
      })
      .join(", ");
  };

  return (
    <div className="w-full bg-white/20 dark:bg-slate-900/30 border border-slate-250 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-5 border-b border-slate-250 dark:border-slate-850 pb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
          <Icons.Save size={20} />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50">
            My Saved Mixes
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
            Your customized ambient layouts
          </p>
        </div>
      </div>

      {savedMixes.length === 0 ? (
        <div className="text-center py-8 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-white/10 dark:bg-slate-950/20">
          <Icons.VolumeX size={32} className="mx-auto text-slate-500 dark:text-slate-400 mb-2" />
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            No Saved Mixes
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold max-w-xs mx-auto leading-relaxed">
            Create your favorite combination of sounds and save it using the global controls.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
          {savedMixes.map((mix) => (
            <div
              key={mix.id}
              className="flex items-center justify-between p-3.5 border border-slate-200 dark:border-slate-800/60 bg-white/30 dark:bg-slate-900/40 hover:bg-white/60 dark:hover:bg-slate-900/80 hover:border-sky-500/30 rounded-xl transition-all duration-200 group"
            >
              <button
                onClick={() => onLoadMix(mix)}
                className="flex-grow text-left flex flex-col min-w-0 pr-4"
                aria-label={`Load mix ${mix.name}`}
              >
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate group-hover:text-sky-500 transition-colors">
                  {mix.name}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold truncate mt-0.5">
                  {getActiveSoundsString(mix)}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-500 font-bold mt-1">
                  Saved on {mix.createdAt}
                </span>
              </button>

              <button
                onClick={() => onDeleteMix(mix.id)}
                className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                aria-label={`Delete mix ${mix.name}`}
              >
                <Icons.Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
