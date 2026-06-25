import Link from "next/link";

export function AncestorHeader() {
  return (
    <header className="w-full bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <div className="max-w-[1840px] mx-auto px-4 sm:px-6 md:px-[8.75rem] h-14 flex items-center">
        <Link href="/ancestory" className="flex items-center gap-1.5 font-bold text-xl tracking-tight select-none">
          <span className="text-primary" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.5px" }}>altfestory</span>
        </Link>
      </div>
    </header>
  );
}
