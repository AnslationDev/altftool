
"use client";

import { useState } from "react";
import { RetroFooter } from "./RetroFooter";

export function NortonCommander() {
  const leftFiles = [
    ["..", "", "", ""],
    ["PrinceOfPersia.exe", "GAME", "6-21-94", "12613"],
    ["pacman.exe", "GAME", "6-21-94", "4324"],
    ["prehistoric2.exe", "GAME", "5-11-94", "9032"],
    ["sfighter2.exe", "GAME", "6-21-94", "1342"],
    ["wolf3d.exe", "GAME", "6-21-94", "23422"],
  ];
  const rightFiles = [
    ["..", "", "", ""],
    ["GS", "<DIR>", "6-21-94", ""],
    ["LISTS", "<DIR>", "6-21-94", ""],
    ["TSL", "<DIR>", "6-21-94", ""],
    ["VOICE", "<DIR>", "6-21-94", ""],
    ["man1.dat", "DATA", "6-02-94", "8333"],
    ["pkun.zip", "ZIP", "6-11-94", "53444"],
    ["pv.exe", "EXE", "5-11-94", "112200"],
    ["help.txt", "TEXT", "5-28-94", "9203"],
    [".addressbook", "BOOK", "5-28-94", "125"],
    [".Xauthority", "AUTH", "5-28-94", "22"],
    [".Xmodmap", "XMD", "5-28-94", "3532"],
    [".XSM-Default", "XMS", "5-28-94", "2348"],
  ];
  const [active, setActive] = useState("left");
  const [selected, setSelected] = useState({ left: 1, right: 1 });
  const panel = (title, files, side) => (
    <section className="min-h-0 border-[3px] border-cyan-300 bg-[#1300a8]">
      <h2 className="mx-20 -mt-4 bg-[#1300a8] text-center text-[clamp(1rem,1.7vw,2rem)] font-black text-cyan-300">{title}</h2>
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] border-t-[3px] border-cyan-300 text-center text-[clamp(1rem,1.7vw,2rem)] font-black text-yellow-300">
        {["Name", "Type", "Date", "Size"].map((head) => <span key={head} className="border-r-[3px] border-cyan-300 py-4 last:border-r-0">{head}</span>)}
      </div>
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] text-[clamp(0.95rem,1.55vw,1.75rem)] font-black leading-tight text-white">
        {files.map((file, index) => (
          <button
            key={`${side}-${file[0]}-${index}`}
            onClick={() => { setActive(side); setSelected((value) => ({ ...value, [side]: index })); }}
            className={`contents ${active === side && selected[side] === index ? "text-yellow-300" : ""}`}
          >
            {file.map((cell, cellIndex) => <span key={cellIndex} className="min-w-0 truncate border-r-[3px] border-cyan-300 px-3 py-1 text-left last:border-r-0">{cell}</span>)}
          </button>
        ))}
      </div>
    </section>
  );
  return (
    <main className="flex h-screen min-h-[660px] flex-col overflow-hidden bg-black font-mono">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-2 md:grid-cols-2">
        {panel("C:\\STUFF\\GAMES", leftFiles, "left")}
        {panel("D:\\", rightFiles, "right")}
      </div>
      <div className="bg-black px-1 text-[clamp(1rem,1.7vw,2rem)] font-black text-white">C:\STUFF\GAMES&gt;<span className="animate-pulse">_</span></div>
      <RetroFooter mode="norton" />
    </main>
  );
}
