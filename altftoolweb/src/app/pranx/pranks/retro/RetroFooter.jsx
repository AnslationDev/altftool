
"use client";

export function RetroFooter({ mode = "bios" }) {
  const items = mode === "norton"
    ? ["1Left", "2Right", "3View", "4Edit", "5Comp", "6DeComp", "7Find", "8History", "9EGA Ln", "10Tree"]
    : mode === "google"
      ? ["<-> Select Menu", "↑↓ Select Item", "Enter Select / Sub-Menu", "F9 Reboot", "F11 Full Screen", "ESC Back to Home"]
      : ["<-> Select Menu", "↑↓ Select Item", "Enter Select / Sub-Menu", "F9 Save and Exit"];
  return (
    <footer className={`${mode === "norton" ? "bg-black text-white" : "bg-[#08d6c0] text-black"} flex min-h-[4.6rem] flex-wrap items-center gap-x-12 gap-y-2 px-5 py-3 font-mono text-2xl font-black leading-tight`}>
      {items.map((item) => (
        <span key={item} className={mode === "norton" ? "tracking-wide" : ""}>{item}</span>
      ))}
    </footer>
  );
}
