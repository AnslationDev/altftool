import { useRef, useState } from "react";
import { Search, BookMarked, Brain, ChevronRight } from "lucide-react";

export default function TabBar({ activeView, setActiveView, savedWords }) {
  const scrollRef = useRef(null);
  const [showArrow, setShowArrow] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setShowArrow(!atEnd);
  };

  const tabs = [
    { id: "dictionary", label: "Dictionary", icon: <Search size={15} /> },
    { id: "vocab", label: "My Vocab", icon: <BookMarked size={15} /> },
    { id: "quiz", label: "Quiz", icon: <Brain size={15} /> },
    // { id: "synonyms", label: "Synonyms", icon: <Shuffle size={15} /> }
  ];

  return (
    <div className="border-b border-(--border) bg-(--card) w-full">

      {/* 🔹 MOBILE */}
      <div className="flex sm:hidden relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full"
          style={{
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              style={{ minWidth: "50%", flexShrink: 0 }}
              className={`py-3 px-3 font-medium transition whitespace-nowrap text-xs flex items-center justify-center gap-2
                ${
                  activeView === id
                    ? "text-(--primary) border-b-2 border-(--primary)"
                    : "text-(--muted-foreground)"
                }`}
            >
              {icon}
              {label}

              {/* badge */}
              {id === "vocab" && savedWords.length > 0 && (
                <span className="hidden ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full bg-(--primary) text-white">
                  {savedWords.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Arrow */}
        {showArrow && (
          <div className="absolute right-0 top-0 h-full flex items-center pointer-events-none w-8 bg-gradient-to-r from-transparent to-(--card)">
            <ChevronRight size={16} className="ml-auto mr-1 text-(--muted-foreground)" />
          </div>
        )}
      </div>

      {/* 🔹 DESKTOP */}
      <div className="hidden sm:flex w-full">
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`flex-1 py-4 px-3 font-medium transition whitespace-nowrap text-sm flex items-center justify-center gap-2
              ${
                activeView === id
                  ? "text-(--primary) border-b-2 border-(--primary)"
                  : "text-(--muted-foreground) hover:text-(--foreground)"
              }`}
          >
            {icon}
            {label}

            {/* badge */}
            {id === "vocab" && savedWords.length > 0 && (
              <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full bg-(--primary) text-white">
                {savedWords.length}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}