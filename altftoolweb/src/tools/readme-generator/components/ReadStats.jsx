import { Clock, Hash } from "lucide-react";

export default function ReadStats({ content }) {
  if (!content) return null;


  const cleanText = content.replace(/[#_*`>\-\n]/g, " ");

  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const characters = content.length;

  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="flex items-center gap-4 text-xs sm:text-sm text-(--muted-foreground) mt-1">
      
      {/* Read Time */}
      <div className="flex items-center gap-1">
        <Clock className="w-4 h-4 text-blue-500" />
        <span>
          <span className="font-semibold text-(--foreground)">
            {readTime}
          </span>{" "}
          min read
        </span>
      </div>

      {/* Characters */}
      <div className="flex items-center gap-1">
        <Hash className="w-4 h-4 text-green-500" />
        <span>
          <span className="font-semibold text-(--foreground)">
            {characters}
          </span>{" "}
          chars
        </span>
      </div>
    </div>
  );
}