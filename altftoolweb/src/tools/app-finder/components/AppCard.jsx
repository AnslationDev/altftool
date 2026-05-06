import { ExternalLink, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import ManagedImage from "@/components/ui/ManagedImage";

export const AppCard = ({ app, short, onCompare, onTagClick }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-(--card) group p-4 sm:p-5 border-2 border-(--border) rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col justify-between h-full">

      {/* TOP */}
      <div>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden shrink-0">
            {!imgError && app.artworkUrl100 ? (
              <ManagedImage
                src={app.artworkUrl100}
                alt={app.title}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <ImageIcon className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-(--foreground) mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {app.title}
            </h3>

            <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs text-(--muted-foreground)">
              <span>{app.rating ?? 4.0}</span>
              <span>{app.popularityScore ?? 80}</span>
              <span>
                {app.downloads
                  ? `${Math.round(app.downloads / 1000000)}M+`
                  : "1M+"}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-(--foreground) mb-3 leading-relaxed line-clamp-3">
          {short(app.snippet)}
        </p>

        <div className="text-xs text-(--muted-foreground) flex flex-col gap-1">
          <div>Permissions: {app.permissions}</div>
          <div>Privacy: {app.privacy}</div>
          <div>Ads: {app.ads}</div>

          <div className="font-medium text-(--foreground)">
            Safety Score: {app.safetyScore}/100
          </div>
        </div>

        {/* TAGS */}
        <div className="mt-3 flex flex-wrap gap-2">
          {app.tags?.map((tag, i) => (
            <span
              key={i}
              onClick={() => onTagClick && onTagClick(tag)}
              className="text-[10px] sm:text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full cursor-pointer hover:bg-blue-200 transition"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* LINKS */}
        <div className="flex flex-col gap-1 mt-3 mb-3">
          <a
            href={app.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 gap-1"
          >
            View in App Store
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href={app.androidLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 gap-1"
          >
            View in Play Store
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* BUTTON (ALWAYS BOTTOM) */}
      <button
        onClick={() => onCompare && onCompare(app)}
        className="w-full px-4 py-2 text-xs sm:text-sm bg-(--primary) text-white rounded-md flex items-center justify-center font-medium shadow-md mt-auto transition-all active:scale-95"
      >
        Compare
      </button>
    </div>
  );
};