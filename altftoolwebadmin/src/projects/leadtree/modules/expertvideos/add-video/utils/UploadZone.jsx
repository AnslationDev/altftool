import { useRef, useState } from "react";
import { UploadCloud, Trash2 } from "lucide-react";

const UploadZone = ({
  accept,
  preview,
  onFileChange,
  onDelete,
  placeholder,
  hint,
  shape = "rect",
  icon: Icon = UploadCloud,
  error,
}) => {
  const inputRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [videoHovering, setVideoHovering] = useState(false);

  const isCircle = shape === "circle";
  const isVideo = accept.startsWith("video");

  return (
    <div className="flex flex-col gap-1">
      <input
        type="file"
        accept={accept}
        ref={inputRef}
        className="hidden"
        onChange={onFileChange}
      />

      <div
        onClick={() => !preview && inputRef.current?.click()}
        onMouseEnter={() => !isVideo && setHovering(true)}
        onMouseLeave={() => !isVideo && setHovering(false)}
        className={`border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden
          ${isCircle ? "rounded-full w-50 h-50" : "rounded-md min-h-[180px] w-[400px]"}
          ${
            preview
              ? "border-gray-50 cursor-default"
              : "border-gray-300 hover:border-gray-400 cursor-pointer hover:bg-gray-50"
          }`}
      >
        {preview ? (
          <>
            {isVideo ? (
              // ── Video preview — apna alag hover state hai
              <div
                className="relative w-full h-[200px]"
                onMouseEnter={() => setVideoHovering(true)}
                onMouseLeave={() => setVideoHovering(false)}
              >
                <video
                  src={preview}
                  autoPlay
                  muted
                  
                  controls
                  className="w-full h-[200px] rounded-md object-cover"
                />
                {/* Remove button sirf hover pe, niche ki taraf */}
                {videoHovering && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Video
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // ── Image preview
              <>
                <img
                  src={preview}
                  alt="Preview"
                  className={`w-full object-cover ${
                    isCircle ? "h-[200px] rounded-full" : "h-[200px] rounded-md"
                  }`}
                />
                {hovering && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-150 shadow-lg cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3 items-center justify-center px-4 text-center">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-black opacity-70">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-gray-700 font-medium text-[12px]">
              {placeholder}
            </p>
            <span className="text-gray-600 text-[12px]">{hint}</span>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-[12px] mt-1">{error}</p>}
    </div>
  );
};

export default UploadZone;
