import React from 'react';

const FormatInspector = ({ data = "" }) => {
  const getEncodedView = (str, type) => {
    return str.split('').map(char => {
      const code = char.charCodeAt(0);
      return type === 'hex' 
        ? code.toString(16).padStart(2, '0').toUpperCase() 
        : code.toString(2).padStart(8, '0');
    }).join(' ');
  };

  const stats = [
    { label: "Character Type", value: /^[a-zA-Z0-9]*$/.test(data) ? "Alphanumeric" : "Complex/Special" },
    { label: "Encoding", value: "UTF-8 / Unicode" },
    { label: "Length", value: `${data.length} chars` },
    { label: "Byte Size", value: `${new Blob([data]).size} bytes` }
  ];

  return (
    <div className="bg-(--card) border border-(--border) rounded-lg p-6 font-light shadow-md">
      {/* Main Title */}
      <div className="flex items-center justify-between mb-6 border-b border-(--border) pb-3">
        <h3 className="text-(--foreground) font-light text-3xl tracking-tight">
          Format Inspector
        </h3>
        <span className="bg-(--primary) text-(--foreground) px-3 py-1 rounded-full text-[15px] uppercase font-light border border-(--border)">
          Live Analyzer
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-gray-100 p-3 rounded-md border border-gray-300 shadow-sm">
            {/* HEADING IN PURE BLACK */}
            <p className="text-[15px] text-black font-light uppercase mb-1 tracking-tighter">
              {stat.label}
            </p>
            {/* VALUE IN DARK GRAY FOR CONTRAST */}
            <p className="text-gray-700 font-light truncate text-xl">
              {data ? stat.value : "---"}
            </p>
          </div>
        ))}
      </div>

      {/* Technical Previews */}
      <div className="space-y-5">
        <div>
          <p className="text-2xl text-(--foreground) font-light mb-2">Hexadecimal Preview</p>
          <div className="bg-(--background) p-4 rounded-lg text-blue-500 break-all max-h-24 overflow-y-auto border border-(--border) leading-relaxed text-xl">
            {data ? getEncodedView(data, 'hex') : <span className="text-(--muted-foreground) italic">No input detected...</span>}
          </div>
        </div>
        
        <div>
          <p className="text-2xl text-(--foreground) font-light mb-2">Binary Stream</p>
          <div className="bg-(--background) p-4 rounded-lg text-blue-500 break-all max-h-24 overflow-y-auto border border-(--border) leading-tight text-xl">
            {data ? getEncodedView(data, 'binary') : <span className="text-(--muted-foreground) italic">No input detected...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormatInspector;