import { Zap } from "lucide-react";

export default function TranslateButton({ onClick, isLoading }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-6 py-3 cursor-pointer rounded-full font-semibold
                 text-(--primary-foreground) bg-(--primary) shadow-lg transition-all
                 hover:opacity-90 active:scale-95`}
    >
      <Zap className="w-5 h-5 mr-2" />
      {isLoading ? "Translating..." : "Translate"}
    </button>
  );
}
