import React, { useState, useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';

export default function ToolHome() {
  const [barcodeData, setBarcodeData] = useState('123456789012');
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [lineColor, setLineColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(20);
  const [margin, setMargin] = useState(10);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);
  const svgRef = useRef(null);

  const barcodeFormats = [
    { value: 'CODE128', label: 'CODE128', example: 'Example123' },
    { value: 'CODE39', label: 'CODE39', example: 'CODE39' },
    { value: 'EAN13', label: 'EAN-13', example: '5901234123457' },
    { value: 'EAN8', label: 'EAN-8', example: '96385074' },
    { value: 'UPC', label: 'UPC-A', example: '123456789999' },
    { value: 'ITF14', label: 'ITF-14', example: '12345678901231' },
    { value: 'MSI', label: 'MSI', example: '1234567' },
    { value: 'pharmacode', label: 'Pharmacode', example: '1234' },
    { value: 'codabar', label: 'Codabar', example: '1234567' }
  ];

  const generateBarcode = () => {
    setError('');
    try {
      if (canvasRef.current && svgRef.current) {
        const options = {
          format: barcodeFormat,
          width: width,
          height: height,
          displayValue: displayValue,
          background: backgroundColor,
          lineColor: lineColor,
          fontSize: fontSize,
          margin: margin,
          valid: (valid) => {
            if (!valid) setError('Invalid data for selected barcode format');
          }
        };

        JsBarcode(canvasRef.current, barcodeData, options);
        JsBarcode(svgRef.current, barcodeData, options);
      }
    } catch (err) {
      setError(err.message || 'Error generating barcode');
    }
  };

  useEffect(() => {
    if (barcodeData) generateBarcode();
  }, [barcodeData, barcodeFormat, width, height, displayValue, backgroundColor, lineColor, fontSize, margin]);

  const downloadBarcode = (format) => {
    if (format === 'png') {
      const canvas = canvasRef.current;
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `barcode-${Date.now()}.png`;
      link.href = url;
      link.click();
    } else if (format === 'svg') {
      const svg = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.download = `barcode-${Date.now()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const setExample = () => {
    const format = barcodeFormats.find(f => f.value === barcodeFormat);
    if (format) setBarcodeData(format.example);
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 ">
          <h1 className="heading text-center pt-5 animate-fade-up">
            Barcode Generator
          </h1>
          <p className="text-slate-400 text-lg">
            Create professional barcodes with advanced customization
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT PANEL */}
          <div className="space-y-6 animate-slide-in">
            <div className="bg-(--card) rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-6">Configuration</h2>

              <div className="mb-6">
                <label className="content block mb-2">Barcode Data</label>
                <input
                  type="text"
                  value={barcodeData}
                  onChange={(e) => setBarcodeData(e.target.value)}
                  className="w-full px-4 py-3 border border-(--border) rounded-md input-field text-(--foreground)"
                />
              </div>

              <div className="mb-6">
                <label className="content block mb-2">Barcode Format</label>
                <select
                  value={barcodeFormat}
                  onChange={(e) => setBarcodeFormat(e.target.value)}
                  className="w-full bg-(--card) px-4 py-3 border border-(--border) rounded-md cursor-pointer"
                >
                  {barcodeFormats.map(format => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={setExample}
                  className="mt-2 text-blue-400 text-sm hover:text-blue-300"
                >
                  Use example data
                </button>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <label>Show Text Below Barcode</label>
                <button
                  onClick={() => setDisplayValue(!displayValue)}
                  className="w-14 h-7 rounded-full relative"
                >
                  <div className="w-5 h-5 bg-white rounded-full absolute top-1 left-1" />
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                  {error}
                </div>
              )}
            </div>

            {/* CURRENT FORMAT BLOCK */}
            <div className="bg-(--card) rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="content mb-3 text-(--foreground)">
                Current Format: {barcodeFormat}
              </h3>
              <p className="text-sm text-(--foreground) leading-relaxed">
                {barcodeFormat === 'CODE128' && 'CODE128 is a high-density barcode supporting ASCII characters.'}
                {barcodeFormat === 'CODE39' && 'CODE39 encodes uppercase letters and numbers.'}
                {barcodeFormat === 'EAN13' && 'EAN-13 is used worldwide for retail products.'}
                {barcodeFormat === 'EAN8' && 'EAN-8 is used for small packaging.'}
                {barcodeFormat === 'UPC' && 'UPC-A is common in North America.'}
                {barcodeFormat === 'ITF14' && 'ITF-14 is used for product packaging.'}
                {barcodeFormat === 'MSI' && 'MSI is used for warehouse inventory.'}
                {barcodeFormat === 'pharmacode' && 'Pharmacode is used in pharmaceuticals.'}
                {barcodeFormat === 'codabar' && 'Codabar is used in libraries and blood banks.'}
              </p>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-6 animate-slide-in">
            <div className="bg-(--card) rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-6">Preview</h2>
              <div className="flex justify-center">
                <canvas ref={canvasRef} />
                <svg ref={svgRef} className="hidden" />
              </div>
            </div>

            <div className="bg-(--card) rounded-2xl p-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => downloadBarcode('png')}
                  className="border px-6 py-4 rounded-xl"
                >
                  Download PNG
                </button>
                <button
                  onClick={() => downloadBarcode('svg')}
                  className="border px-6 py-4 rounded-xl"
                >
                  Download SVG
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS — 6 CARDS WITH LONGER TEXT */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-10">How It Works ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Enter Data", desc: "Enter text or numbers for the barcode. Make sure to double-check your input because this data will be encoded into the barcode. " },
              { title: "Select Format", desc: "Choose the barcode format from the available list. Different formats have different restrictions and use cases. " },
              { title: "Customize", desc: "Adjust styling, size, and other layout options. You can modify width, height, colors. " },
              { title: "Preview", desc: "See a live preview of your generated barcode. " },
              { title: "Validate", desc: "The tool automatically validates the barcode data against the selected format. " },
              { title: "Download", desc: "Export your barcode instantly as PNG or SVG." }
            ].map((card, index) => (
              <div
                key={index}
                className="group bg-(--card) rounded-2xl p-6 border border-(--border) hover:-translate-y-2 transition"
              >
                <h3 className="font-semibold mb-2 group-hover:text-blue-500">{card.title}</h3>
                <p className="text-sm text-(--muted-foreground)">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
