import React, { useState, useRef, useEffect } from 'react';
import Quagga from 'quagga';
import { Camera, Upload, X, CheckCircle, AlertCircle, Scan } from 'lucide-react';

export default function ToolHome() {
  const [scanMode, setScanMode] = useState(null); // 'camera' or 'image'
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const scannerContainerRef = useRef(null);

  // Initialize camera scanner
  const startCameraScanner = () => {
    setError(null);
    setScannedData(null);
    setScanMode('camera');
    setCameraActive(true);

    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerContainerRef.current,
        constraints: {
          width: { min: 640 },
          height: { min: 480 },
          facingMode: "environment",
          aspectRatio: { min: 1, max: 2 }
        },
      },
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader"
        ],
        debug: {
          drawBoundingBox: true,
          showFrequency: false,
          drawScanline: true,
          showPattern: false
        }
      },
      locate: true,
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: 2,
      frequency: 10,
    }, (err) => {
      if (err) {
        console.error(err);
        setError("Failed to access camera. Please ensure camera permissions are granted.");
        setCameraActive(false);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((result) => {
      if (result && result.codeResult && result.codeResult.code) {
        setScannedData({
          code: result.codeResult.code,
          format: result.codeResult.format,
          timestamp: new Date().toLocaleString()
        });
        stopCameraScanner();
      }
    });
  };

  // Stop camera scanner
  const stopCameraScanner = () => {
    Quagga.stop();
    setCameraActive(false);
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError(null);
    setScannedData(null);
    setIsProcessing(true);
    setScanMode('image');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        Quagga.decodeSingle({
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "ean_8_reader",
              "code_39_reader",
              "code_39_vin_reader",
              "codabar_reader",
              "upc_reader",
              "upc_e_reader",
              "i2of5_reader"
            ]
          },
          locate: true,
          src: e.target.result
        }, (result) => {
          setIsProcessing(false);
          if (result && result.codeResult) {
            setScannedData({
              code: result.codeResult.code,
              format: result.codeResult.format,
              timestamp: new Date().toLocaleString(),
              image: e.target.result
            });
          } else {
            setError("No barcode detected in the image. Please try another image.");
          }
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Reset scanner
  const resetScanner = () => {
    if (cameraActive) {
      stopCameraScanner();
    }
    setScanMode(null);
    setScannedData(null);
    setError(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraActive) {
        Quagga.stop();
      }
    };
  }, [cameraActive]);

 
  const copyToClipboard = () => {
    if (scannedData?.code) {
      navigator.clipboard.writeText(scannedData.code);
    }
  };

  return (
    <div className="min-h-screen bg-(--background) py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
       
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
         
            <h1 className="heading text-center pt-5 animate-fade-up">Barcode Scanner</h1>
          </div>
          <p className="description text-center animate-fade-up">Scan barcodes using your camera or upload an image</p>
        </div>

        <div className="bg-(--card) rounded-2xl shadow-xl overflow-hidden">
          {!scanMode && !scannedData && (
            <div className="p-8 sm:p-12">
              <div className="grid sm:grid-cols-2 gap-6">
               
                <button
                  onClick={startCameraScanner}
                  className="group relative overflow-hidden bg-(--card) text-(--foreground) border border-(--border) rounded-xl p-8 transition-all duration-300 transform  shadow-lg "
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white/20 p-4 rounded-full group-hover:bg-white/30 transition-colors">
                      <Camera className="w-12 h-12" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Camera Scan</h3>
                      <p className="text-(--muted-foreground) text-sm">Use your device camera</p>
                    </div>
                  </div>
                </button>

                {/* Image Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative overflow-hidden bg-(--card) text-(--foreground) rounded-xl p-8 transition-all duration-300 border border-(--border) "
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white/20 p-4 rounded-full group-hover:bg-white/30 transition-colors">
                      <Upload className="w-12 h-12" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Upload Image</h3>
                      <p className="text-purple-100 text-sm">Select from gallery</p>
                    </div>
                  </div>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Camera Scanner View */}
          {cameraActive && (
            <div className="relative">
              <div ref={scannerContainerRef} className="relative bg-(--card) min-h-100 sm:min-h-125">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-4 border-(--border) w-64 h-48 sm:w-80 sm:h-56 rounded-lg shadow-lg"></div>
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <button
                  onClick={stopCameraScanner}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="bg-blue-600 text-(--muted-foreground) py-3 px-4 text-center">
                <p className="text-sm sm:text-base">Position barcode within the frame</p>
              </div>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
              <p className="text-(--muted-foreground) text-lg">Processing image...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-8">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-red-800 font-semibold mb-1">Error</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={resetScanner}
                  className="bg-red-500  text-white px-6 py-3 rounded-lg font-semibold cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Success Result */}
          {scannedData && (
            <div className="p-8">
              <div className="bg-(--card) border-l-4 border-(--border) p-6 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-green-800 font-semibold mb-1">Barcode Detected!</h3>
                    <p className="text-green-700 text-sm">Successfully scanned barcode</p>
                  </div>
                </div>
              </div>

              {scannedData.image && (
                <div className="mb-6 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={scannedData.image}
                    alt="Scanned barcode"
                    className="w-full h-auto max-h-64 object-contain bg-(--card)"
                  />
                </div>
              )}

              <div className="bg-(--card) rounded-lg p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-(--foreground) uppercase tracking-wide">
                    Barcode Value
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={scannedData.code}
                      readOnly
                      className="flex-1 bg-(--card) border-2 border-(--border) rounded-lg px-4 py-3 font-mono text-lg text-(--foreground)"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="bg-(--card)  text-(--muted-foreground) px-4 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-(--foreground) uppercase tracking-wide">
                      Format
                    </label>
                    <p className="mt-2 bg-(--card) border-2 border-gray-300 rounded-lg px-4 py-3 text-(--foreground)">
                      {scannedData.format.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-(--foreground) uppercase tracking-wide">
                      Scanned At
                    </label>
                    <p className="mt-2 bg-(--card) border-2 border-(--border) rounded-lg px-4 py-3 text-gray-900 text-sm">
                      {scannedData.timestamp}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={resetScanner}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
                >
                  Scan Another Barcode
                </button>
              </div>
            </div>
          )}
        </div>

       
      </div>
    </div>
  );
}