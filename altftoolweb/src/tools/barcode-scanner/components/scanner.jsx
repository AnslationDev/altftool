import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RotateCcw, Package, Barcode, Info, X, Loader2, CheckCircle, AlertCircle, Scan } from 'lucide-react';


export default function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const codeReaderRef = useRef(null);

  
  useEffect(() => {
    const initializeReader = async () => {
      try {
        const { BrowserMultiFormatReader } = await import('https://cdn.jsdelivr.net/npm/@zxing/library@0.19.1/+esm');
        codeReaderRef.current = new BrowserMultiFormatReader();
        console.log('ZXing reader initialized');
      } catch (err) {
        console.error('Failed to initialize barcode reader:', err);
        setError('Failed to load barcode scanner library');
      }
    };
    
    initializeReader();

    return () => {
      stopCamera();
    };
  }, []);

  
  const startCamera = async () => {
    try {
      setError('');
      setScanSuccess(false);
      
      if (!codeReaderRef.current) {
        setError('Barcode scanner not initialized yet. Please wait and try again.');
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setError('No camera found on this device');
        return;
      }

      
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      ) || videoDevices[0];

      setCameraActive(true);
      setScanning(true);

     
      codeReaderRef.current.decodeFromVideoDevice(
        backCamera.deviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            const detectedBarcode = result.getText();
            console.log('Barcode detected:', detectedBarcode);
            
           
            setBarcode(detectedBarcode);
            setScanSuccess(true);
            stopCamera();
            fetchProductData(detectedBarcode);
          }
          
          if (err && !(err.name === 'NotFoundException')) {
            console.error('Scan error:', err);
          }
        }
      );

    } catch (err) {
      setError('Camera access denied or not available. Please enable camera permissions.');
      console.error('Camera error:', err);
      setCameraActive(false);
      setScanning(false);
    }
  };


  const stopCamera = () => {
    try {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      setCameraActive(false);
      setScanning(false);
    } catch (err) {
      console.error('Error stopping camera:', err);
    }
  };


  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      setError('');
      setScanSuccess(false);
      
      try {
        const imageUrl = URL.createObjectURL(file);
        
        if (!codeReaderRef.current) {
          throw new Error('Barcode scanner not initialized');
        }

        const result = await codeReaderRef.current.decodeFromImageUrl(imageUrl);
        const detectedBarcode = result.getText();
        
        setBarcode(detectedBarcode);
        setScanSuccess(true);
        fetchProductData(detectedBarcode);
        
        URL.revokeObjectURL(imageUrl);
      } catch (err) {
        setError('No barcode detected in the image. Please try with a clearer image.');
        console.error('Image scan error:', err);
        setLoading(false);
      }
    }
  };

 
  const fetchProductData = async (barcodeValue) => {
    try {
      setLoading(true);
      
      
      const offResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcodeValue}.json`);
      const offData = await offResponse.json();
      
      if (offData.status === 1 && offData.product) {
        const product = offData.product;
        setProductData({
          name: product.product_name || 'Unknown Product',
          brand: product.brands || 'Unknown Brand',
          barcode: barcodeValue,
          image: product.image_url || product.image_front_url || null,
          quantity: product.quantity || 'N/A',
          categories: product.categories || 'N/A',
          ingredients: product.ingredients_text || 'Not available',
          nutritionGrade: product.nutrition_grades?.toUpperCase() || 'N/A',
          countries: product.countries || 'N/A',
          packaging: product.packaging || 'N/A',
          labels: product.labels || 'N/A',
          stores: product.stores || 'N/A',
          source: 'Open Food Facts'
        });
        setLoading(false);
        return;
      }

 
      const upcResponse = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcodeValue}`);
      const upcData = await upcResponse.json();
      
      if (upcData.items && upcData.items.length > 0) {
        const item = upcData.items[0];
        setProductData({
          name: item.title || 'Unknown Product',
          brand: item.brand || 'Unknown Brand',
          barcode: barcodeValue,
          image: item.images?.[0] || null,
          quantity: 'N/A',
          categories: item.category || 'N/A',
          ingredients: item.description || 'Not available',
          nutritionGrade: 'N/A',
          countries: 'N/A',
          packaging: 'N/A',
          labels: 'N/A',
          stores: 'N/A',
          source: 'UPC Database'
        });
      } else {
       
        setProductData({
          name: 'Product Not Found in Database',
          brand: 'Unknown',
          barcode: barcodeValue,
          image: null,
          quantity: 'N/A',
          categories: 'N/A',
          ingredients: 'This product is not in our database yet.',
          nutritionGrade: 'N/A',
          countries: 'N/A',
          packaging: 'N/A',
          labels: 'N/A',
          stores: 'N/A',
          source: 'Manual Scan'
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product data:', err);
      setProductData({
        name: 'Error Loading Product',
        brand: 'Unknown',
        barcode: barcodeValue,
        image: null,
        quantity: 'N/A',
        categories: 'N/A',
        ingredients: 'Unable to fetch product information. Please check your internet connection.',
        nutritionGrade: 'N/A',
        countries: 'N/A',
        packaging: 'N/A',
        labels: 'N/A',
        stores: 'N/A',
        source: 'Error'
      });
      setLoading(false);
    }
  };

 
  const handleReset = () => {
    setBarcode('');
    setProductData(null);
    setError('');
    setLoading(false);
    setScanSuccess(false);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 ">
          <div className="flex items-center justify-center gap-3 mb-4">
           
            <h1 className="heading text-center">Barcode Scanner</h1>
          </div>
          <p className="description ">Real-time barcode scanning with instant product details</p>
        </div>

        {/* Main Card */}
        <div className="bg-(--card) border border-(--border) rounded-3xl shadow-xl overflow-hidden">
          {/* Camera/Upload Section */}
          {!productData && (
            <div className="p-6 md:p-10">
              {/* Success Message */}
              {scanSuccess && (
                <div className="mb-6 bg-green-50 border-2 border-green-400 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                  <div>
                    <p className="text-green-800 font-semibold">Barcode detected successfully!</p>
                    <p className="text-green-700 text-sm">Fetching product information...</p>
                  </div>
                </div>
              )}

              {/* Camera View */}
              {cameraActive && (
                <div className="mb-6">
                  <div className="relative bg-(--card) rounded-xl overflow-hidden shadow-2xl">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto max-h-96"
                    />
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-64 h-48 border-4 border-green-400 rounded-lg">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-400 animate-pulse"></div>
                      </div>
                    </div>
                    {/* Scanning indicator */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full font-semibold text-sm flex items-center gap-2 shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      Scanning...
                    </div>
                  </div>
                  <button
                    onClick={stopCamera}
                    className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200"
                  >
                    Stop Camera
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              {!cameraActive && !loading && (
                <div className="space-y-4">
                  <button
                    onClick={startCamera}
                    className="w-full bg-(--card)  text-(--foreground) border border-(--border) py-6 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-3 group"
                  >
                    <Camera className="w-6 h-6  transition-transform" />
                    Start Real-Time Scanning
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-(--card) text-(--foreground) font-medium">OR</span>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-(--card) border border-(--border) text-(--foreground) py-6 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-3 group"
                  >
                    <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Upload Barcode Image
                  </button>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="mt-8 flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <Loader2 className="w-20 h-20 text-(--foreground) " />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Barcode className="w-10 h-10 text-(--foreground)" />
                    </div>
                  </div>
                  <p className="text-(--foreground) text-xl font-semibold mt-6">Processing barcode...</p>
                  <p className="text-(--muted-foreground) mt-2">This will only take a moment</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-6 bg-red-50 border-2 border-red-400 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-semibold text-lg">Error</p>
                      <p className="text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {!cameraActive && !loading && !error && (
                <div className="mt-8 grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">1</span>
                    </div>
                    <h3 className="font-semibold text-black mb-2">Start Camera</h3>
                    <p className="text-gray-600 text-sm">Click to activate your device camera</p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">2</span>
                    </div>
                    <h3 className="font-semibold text-black mb-2">Scan Barcode</h3>
                    <p className="text-gray-600 text-sm">Point camera at barcode until detected</p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">3</span>
                    </div>
                    <h3 className="font-semibold text-black mb-2">View Details</h3>
                    <p className="text-gray-600 text-sm">Get instant product information</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Product Details */}
          {productData && !loading && (
            <div className="p-6 md:p-10">
              {/* Success Badge */}
              <div className="mb-6 bg-green-50 border-2 border-green-400 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-semibold">Product found successfully!</p>
              </div>

              {/* Product Header */}
              <div className="flex items-start gap-6 mb-8 pb-8 border-b-2 border-gray-200">
                {productData.image ? (
                  <img
                    src={productData.image}
                    alt={productData.name}
                    className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-2xl shadow-lg border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-100 border-2 border-gray-300 rounded-2xl flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">{productData.name}</h2>
                  <p className="text-xl md:text-2xl text-gray-700 font-semibold mb-4">{productData.brand}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg">
                      <Barcode className="w-5 h-5" />
                      <span className="font-mono text-base font-semibold">{productData.barcode}</span>
                    </div>
                    <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                      {productData.source}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Information Grid */}
              <div className="grid md:grid-cols-2 gap-5 mb-8">
                <InfoCard label="Quantity" value={productData.quantity} />
                <InfoCard label="Nutrition Grade" value={productData.nutritionGrade} />
                <InfoCard label="Categories" value={productData.categories} />
                <InfoCard label="Packaging" value={productData.packaging} />
                <InfoCard label="Labels" value={productData.labels} />
                <InfoCard label="Available in" value={productData.countries} />
              </div>

              {/* Ingredients */}
              {productData.ingredients && productData.ingredients !== 'Not available' && (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-black mb-3 flex items-center gap-2">
                    <Info className="w-6 h-6" />
                    Ingredients
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{productData.ingredients}</p>
                </div>
              )}

              {/* Stores */}
              {productData.stores && productData.stores !== 'N/A' && (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-black mb-3 flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    Available at
                  </h3>
                  <p className="text-gray-700">{productData.stores}</p>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="w-full bg-black hover:bg-gray-800 text-white py-5 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-3 group"
              >
                <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                Scan New Barcode
              </button>
            </div>
          )}
        </div>

        {/* Footer
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">Powered by ZXing Library • Open Food Facts • UPC Database</p>
        </div> */}
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

// Info Card Component
const InfoCard = ({ label, value }) => (
  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5">
    <h4 className="font-semibold text-gray-600 text-sm uppercase tracking-wide mb-2">{label}</h4>
    <p className="text-black font-semibold text-lg">{value}</p>
  </div>
);

