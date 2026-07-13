
"use client";

import { useState } from "react";
import { useInterval } from "../../hooks/useInterval";
import { RetroFooter } from "./RetroFooter";

export function DosTerminal({ slug }) {
  return slug === "google-terminal" ? <GoogleTerminal /> : <FakeDosTerminal />;
}

export function FakeDosTerminal() {
  const [lines, setLines] = useState([
    "Microsoft Windows [Version 10.0.14393]",
    "(c) 2017 Microsoft Corporation. All rights reserved.",
    "",
  ]);
  const [command, setCommand] = useState("");
  const commands = {
    HELP: "DIR, TREE, FORMAT, HACK, CLEAR, WIN",
    DIR: " Directory of C:\\\nPRANX.EXE          README.TXT       SYSTEM32_SAFE\nMATRIX.BAT         VIRUS-SAFE.COM   WINDOWS",
    TREE: "C:\\\n+-- PRANX\n|   +-- BIOS\n|   +-- GAMES\n+-- PROGRAMS\n+-- WINDOWS",
    FORMAT: "Formatting C: 11% complete\nFormat aborted. Safe prank mode cannot touch files.",
    HACK: "Dialing imaginary modem...\nAUTH OK\nACCESS GRANTED",
    WIN: "Windows is already running. Kind of.",
  };
  const submit = (event) => {
    event.preventDefault();
    const key = command.trim().toUpperCase();
    if (!key) return;
    setLines((current) => key === "CLEAR" ? [] : [...current, `C:\\>${command}`, commands[key] || "Bad command or file name"]);
    setCommand("");
  };
  return (
    <main className="h-screen min-h-[620px] overflow-hidden bg-black p-5 font-mono text-white">
      <div className="text-[clamp(1.35rem,2vw,2.15rem)] font-black leading-[1.28] tracking-[0.08em]">
        {lines.map((line, index) => <pre key={`${line}-${index}`} className="whitespace-pre-wrap">{line}</pre>)}
        <form onSubmit={submit} className="flex items-center">
          <span>C:\&gt;</span>
          <input
            autoFocus
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            className="w-full bg-transparent outline-none caret-white"
            aria-label="DOS command"
          />
        </form>
      </div>
    </main>
  );
}

export function GoogleTerminal() {
  const [booted, setBooted] = useState(false);
  const [query, setQuery] = useState("WEB:\\\\WGET\\https:\\\\google.com\\\\");
  const bootLines = [
    "PCx86 v2.23",
    "Loading /machines/pcx86/ibm/5170/rom/bios/1984-01-10/ATBIOS-REV1.json5........",
    "Loading /machines/pcx86/ibm/video/ega/1984-09-13/IBM-EGA.json5........",
    "Loading /machines/pcx86/diskettes.json........",
    "License: MIT DontSteal#1986",
    "Copyright (C) 2012-2025 Ferenc Denes",
    "HDC: Type 5 \"42Mb Hard Disk\" is fixed disk 0",
    "Busx86: 640kb RAM at 0x0",
    "Initialization complete",
  ];
  const ads = [
    ["Sound Board", "Play funny sound effects, memes, music and more with quick buttons."],
    ["Hacker Typer Simulator", "Simulate that you're a hacker with the hacker simulator."],
    ["Win XP Simulator", "Online Windows XP emulator with Minesweeper, Winamp IE7 etc."],
    ["Chat Screenshot", "Create Facebook, X, Tinder conversations and save them as an image."],
    ["Scare Maze", "Invite your friends to play the classic jump scare maze prank online."],
    ["Fake Virus", "Prank anyone opening this screen in their browser."],
  ];
  return (
    <main className="flex h-screen min-h-[680px] flex-col overflow-hidden bg-black font-mono text-white">
      <header className="bg-[#aaa] py-1 text-center text-[clamp(1rem,1.8vw,2rem)] font-black tracking-[0.08em] text-black">
        (C) Copyright <span className="text-red-600">Pranx</span> Corp Software Assoc Impex Prodcom.
      </header>
      <section className="m-5 flex min-h-0 flex-1 border-4 border-white p-2 shadow-[inset_0_0_0_3px_#fff]">
        {!booted ? (
          <button
            onClick={() => setBooted(true)}
            className="h-full w-full bg-black p-4 text-left text-[clamp(1rem,1.65vw,2rem)] font-black leading-[1.25] text-white outline-none"
          >
            {bootLines.map((line) => <pre key={line} className="whitespace-pre-wrap">{line}</pre>)}
            <span className="mt-3 inline-block animate-pulse">W</span>
          </button>
        ) : (
          <div className="grid w-full min-w-0 grid-cols-1 md:grid-cols-[1fr_40%]">
            <div className="relative flex min-h-[30rem] flex-col justify-end border-white p-4 md:border-r-4">
              <div className="mb-10 flex flex-wrap items-center gap-3 text-[clamp(1rem,1.45vw,1.8rem)] font-black">
                <span className="bg-red-400 px-3 py-1 text-black">Enter</span>
                <span>Search</span>
                <span className="bg-red-400 px-3 py-1 text-black">Esc</span>
                <span>I&#39;m Feeling Lucky</span>
              </div>
              <pre className="text-[clamp(3.4rem,9vw,9rem)] font-black leading-none tracking-tight">
                <span className="text-cyan-300">G</span><span className="text-red-500">o</span><span className="text-yellow-300">o</span><span className="text-fuchsia-400">g</span><span className="text-green-400">l</span><span className="text-red-500">e</span>
              </pre>
              <form className="mt-8 text-[clamp(1rem,1.6vw,2rem)] font-black" onSubmit={(event) => event.preventDefault()}>
                <label className="block">Search the web for:</label>
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-white outline-none" />
              </form>
            </div>
            <aside className="grid min-h-0 grid-rows-[auto_1fr_auto] border-white md:border-l-0">
              <h2 className="border-b-4 border-white p-4 text-yellow-300 text-[clamp(1.2rem,2vw,2.2rem)] font-black">Ads</h2>
              <div className="overflow-hidden p-3 text-[clamp(1rem,1.45vw,1.8rem)] font-black leading-tight">
                {ads.map(([title, text]) => (
                  <div key={title} className="mb-5">
                    <h3 className="text-red-400">{title}</h3>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
              <div className="border-t-4 border-white p-3 text-right text-cyan-300 text-[clamp(1rem,1.55vw,1.85rem)] font-black">
                17:21<br />Wed,20/4/2026
              </div>
            </aside>
          </div>
        )}
      </section>
      <RetroFooter mode="google" />
    </main>
  );
}
