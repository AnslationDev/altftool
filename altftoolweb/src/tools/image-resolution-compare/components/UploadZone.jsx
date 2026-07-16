import { useCallback, useState } from "react";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";

export default function UploadZone({ id, label, imageData, onUpload, onClear }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) onUpload(f);
  }, [onUpload]);

  const handleChange = useCallback((e) => {
    const f = e.target.files?.[0];
    if (f) onUpload(f);
  }, [onUpload]);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  return (
    <div className="flex flex-col gap-3 relative h-full">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-teal-500" />
        <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{label}</label>
      </div>
      
      {imageData?.url ? (
        <div className="relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-inner group flex-1 min-h-[250px] flex flex-col justify-between">
          <div className="flex-1 relative flex items-center justify-center p-4">
            {/* Checkerboard background for transparency */}
            <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYB8g8+kM2KrgEExjIoxagCDDAwAEtQEw2y42zMAAAAASUVORK5CYII=')] opacity-20"></div>
            <img 
              src={imageData.url} 
              alt={`Image ${id}`} 
              className="w-full h-full max-h-[300px] object-contain relative z-10 transition-transform duration-300 group-hover:scale-105" 
            />
          </div>
          
          <div className="flex justify-between items-center px-4 py-3 text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <span className="font-bold text-teal-600 dark:text-teal-400">{imageData.img.naturalWidth}×{imageData.img.naturalHeight}px</span>
            <span className="font-medium bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">{(imageData.file.size / 1024).toFixed(1)} KB</span>
          </div>
          
          <button 
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg cursor-pointer z-20" 
            onClick={onClear} 
            title="Remove image"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
          className={`flex-1 flex flex-col items-center justify-center gap-4 min-h-[250px] border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all text-center group ${
            dragOver 
            ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20" 
            : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-teal-500 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById(`ircp-file-${id}`)?.click()}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
            dragOver 
            ? 'bg-teal-500 text-white scale-110 shadow-lg shadow-teal-500/30' 
            : 'bg-teal-50 dark:bg-teal-900/30 text-teal-500 group-hover:scale-110 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50'
          }`}>
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-700 dark:text-slate-200 block mb-1">Click to upload or drag and drop</span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block max-w-[200px] mx-auto">SVG, PNG, JPG, GIF up to 20MB</span>
          </div>
        </div>
      )}
      <input id={`ircp-file-${id}`} type="file" className="hidden" accept="image/*" onChange={handleChange} />
    </div>
  );
}
