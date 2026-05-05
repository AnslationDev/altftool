import {
  Crop,
  Focus,
  Square,
  RectangleVertical,
  Maximize
} from "lucide-react";

export default function CropLayout({
  setOffsetX,
  setOffsetY,
  padding,
  setPadding,
  radius,
  setRadius,
  setAspect,
  setZoom,
}) {
  return (
    <div className="w-full  bg-(--card)  border border-(--border) backdrop-blur-md p-3 rounded-2xl shadow space-y-3 ">

      {/* Title */}
      <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm ">
        <Crop className="text-purple-500" size={16} />
        Crop & Layout
      </div>

      {/* Drag Controls */}
      <div className="flex justify-between">
        <button onClick={() => setOffsetY(p => p - 10)} className="px-2 py-1 bg-blue-100 text-blue-600 rounded">↑</button>
        <button onClick={() => setOffsetY(p => p + 10)} className="px-2 py-1 bg-blue-100 text-blue-600 rounded">↓</button>
        <button onClick={() => setOffsetX(p => p - 10)} className="px-2 py-1 bg-blue-100 text-blue-600 rounded">←</button>
        <button onClick={() => setOffsetX(p => p + 10)} className="px-2 py-1 bg-blue-100 text-blue-600 rounded">→</button>
      </div>

      {/* Aspect Ratio */}
      <div className="flex gap-2">
        <button onClick={() => setAspect(1)} className="bg-purple-100 px-2 py-1 rounded text-xs text-purple-600 flex items-center gap-1">
          <Square size={12}/> 1:1
        </button>
        <button onClick={() => setAspect(4/5)} className="bg-blue-100 px-2 py-1 rounded text-xs text-blue-600 flex items-center gap-1">
          <RectangleVertical size={12}/> 4:5
        </button>
        <button onClick={() => setAspect(9/16)} className="bg-green-100 px-2 py-1 rounded text-xs text-green-600 flex items-center gap-1">
          <Maximize size={12}/> 9:16
        </button>
      </div>

      {/* Padding */}
      <div>
        <p className="text-xs text-gray-500">Padding</p>
        <input
          type="range"
          min="0"
          max="25"
          value={padding}
          onChange={(e) => setPadding(Number(e.target.value))}
          className="w-full accent-purple-500"
        />
      </div>

      {/* Radius */}
      {/* <div>
        <p className="text-xs text-gray-500">Border Radius</p>
        <input
          type="range"
          min="0"
          max="100"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div> */}

      {/* Auto Fit */}
      <button
        onClick={() => {
          setOffsetX(0);
          setOffsetY(0);
          setZoom(1);
        }}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-1 rounded-xl flex items-center justify-center gap-2 text-xs"
      >
        <Focus size={12}/>
        Auto Fit
      </button>
    </div>
  );
}