
"use client";

import { useEffect, useState } from "react";
import { RetroFooter } from "./RetroFooter";

export function BiosSimulator() {
  const tabs = ["Main", "Advanced", "Security", "Boot", "Exit"];
  const rowsByTab = {
    Main: [
      ["System Time", "[17:9:54]"],
      ["System Date", "[Wed 4/20/2026]"],
      ["Primary IDE Master", "[Not Detected]"],
      ["Primary IDE Slave", "[Not Detected]"],
      ["SATA1", "[HL-DT-ST DVDRW GH]"],
      ["SATA2", "[SAMSUNG HD103SJ]"],
      ["SATA3", "[Not Detected]"],
      ["SATA4", "[Not Detected]"],
      ["Storage Configuration", ""],
      ["System Information", ""],
    ],
    Advanced: [["CPU Configuration", "[Enabled]"], ["USB Configuration", "[Auto]"], ["Onboard Devices", ""], ["ACPI Settings", "[S3]"]],
    Security: [["Supervisor Password", "[Clear]"], ["User Password", "[Clear]"], ["TPM State", "[Enabled]"], ["Secure Boot", "[Disabled]"]],
    Boot: [["Boot Option #1", "[SATA2]"], ["Boot Option #2", "[USB Drive]"], ["Network Boot", "[Disabled]"], ["Fast Boot", "[Enabled]"]],
    Exit: [["Save Changes and Exit", ""], ["Discard Changes and Exit", ""], ["Load Setup Defaults", ""], ["Back to Main", ""]],
  };
  const [tabIndex, setTabIndex] = useState(0);
  const [selected, setSelected] = useState(9);
  const activeTab = tabs[tabIndex];
  const rows = rowsByTab[activeTab];
  useEffect(() => {
    const onKey = (event) => {
      if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Enter"].includes(event.key)) event.preventDefault();
      if (event.key === "ArrowDown") setSelected((value) => Math.min(rows.length - 1, value + 1));
      if (event.key === "ArrowUp") setSelected((value) => Math.max(0, value - 1));
      if (event.key === "ArrowRight") { setTabIndex((value) => Math.min(tabs.length - 1, value + 1)); setSelected(0); }
      if (event.key === "ArrowLeft") { setTabIndex((value) => Math.max(0, value - 1)); setSelected(0); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rows.length]);
  return (
    <main className="flex h-screen min-h-[640px] flex-col overflow-hidden bg-[#cfcfcf] font-mono text-black">
      <header className="bg-[#05d6b8] py-1 text-center text-[clamp(1rem,1.9vw,2rem)] font-black tracking-[0.08em]">
        Phoenix TrustedBios(tm) CMOS Setup Utility
      </header>
      <nav className="flex bg-[#122fe3] text-[clamp(1rem,1.9vw,2rem)] font-black text-white">
        {tabs.map((tabName, index) => (
          <button
            key={tabName}
            onClick={() => { setTabIndex(index); setSelected(0); }}
            className={`min-w-[7rem] px-8 py-1 text-left ${activeTab === tabName ? "bg-[#d7d7d7] text-[#1236df]" : "text-white"}`}
          >
            {tabName}
          </button>
        ))}
      </nav>
      <section className="m-6 grid min-h-0 flex-1 grid-cols-1 border-4 border-black bg-[#cfcfcf] lg:grid-cols-[2fr_1.1fr]">
        <div className="min-h-0 p-6 text-[clamp(1rem,2vw,2rem)] font-black leading-[1.42] text-[#1236df]">
          <p className="mb-10 text-black">Bios Version: 4S4EBBX0.86F<br />Service tag: XXXXX</p>
          {rows.map(([label, value], index) => (
            <button
              key={`${activeTab}-${label}`}
              onClick={() => setSelected(index)}
              className={`grid w-full grid-cols-[minmax(15rem,1fr)_auto] gap-4 text-left ${selected === index ? "bg-[#bdbdbd] text-white" : ""}`}
            >
              <span>{index > 1 && index < 9 ? "► " : ""}{label}</span>
              <span>{value ? `: ${value}` : ""}</span>
            </button>
          ))}
        </div>
        <aside className="hidden border-l-4 border-black lg:grid lg:grid-rows-[6rem_1fr]">
          <h2 className="border-b-4 border-black p-6 text-[clamp(1.2rem,1.8vw,2rem)] font-black text-[#1236df]">Item Specific Help</h2>
          <p className="p-6 text-[clamp(1rem,1.65vw,1.8rem)] font-black leading-tight">
            Use the keys in the footer to navigate.
            <br /><br />
            Selected: {rows[selected]?.[0]}
          </p>
        </aside>
      </section>
      <RetroFooter />
    </main>
  );
}
