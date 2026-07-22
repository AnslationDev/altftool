import { Code } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-16 z-50 border-b border-orange-100 bg-white/80 backdrop-blur-lg shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Logo */}
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
            <Code className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>

          {/* Title */}
          <span className="truncate text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Chindi Lang 🇮🇳
          </span>
        </div>

      </div>
    </header>
  );
}
