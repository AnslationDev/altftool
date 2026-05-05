// import React, { useState, useEffect, useRef } from "react";

// export default function ToolHome() {
//   const [prices, setPrices] = useState({});
//   const [currency, setCurrency] = useState("USD");
//   const [unit, setUnit] = useState("oz");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);
//   const [lastUpdate, setLastUpdate] = useState(null);
//   const [autoRefresh, setAutoRefresh] = useState(false);
//   const [convertAmount, setConvertAmount] = useState(1);
//   const [fromUnit, setFromUnit] = useState("oz");
//   const [toUnit, setToUnit] = useState("gram");
//   const [convertResult, setConvertResult] = useState(0);
//   const autoRefreshInterval = useRef(null);
//   // f0be87a617d027782e74c385a0e72153

//   const API_KEY = "f0be87a617d027782e74c385a0e72153";
//   const BASE_URL = "https://api.metalpriceapi.com/v1";

//   const metals = [
//     {
//       symbol: "XAU",
//       name: "Gold",
//       icon: "⬛",
//       color: "from-yellow-100 to-yellow-50",
//       border: "border-yellow-400",
//     },
//     {
//       symbol: "XAG",
//       name: "Silver",
//       icon: "◼",
//       color: "from-gray-100 to-gray-50",
//       border: "border-gray-400",
//     },
//     {
//       symbol: "XPT",
//       name: "Platinum",
//       icon: "◾",
//       color: "from-slate-100 to-slate-50",
//       border: "border-slate-400",
//     },
//     {
//       symbol: "XPD",
//       name: "Palladium",
//       icon: "▪",
//       color: "from-zinc-100 to-zinc-50",
//       border: "border-zinc-400",
//     },
//     // {
//     //   symbol: "XCU",
//     //   name: "Copper",
//     //   icon: "◾",
//     //   color: "from-orange-100 to-orange-50",
//     //   border: "border-orange-400",
//     // },
//     // {
//     //   symbol: "XRH",
//     //   name: "Rhodium",
//     //   icon: "▪",
//     //   color: "from-indigo-100 to-indigo-50",
//     //   border: "border-indigo-400",
//     // },
//   ];

//   const currencies = [
//     { code: "USD", name: "US Dollar" },
//     { code: "EUR", name: "Euro" },
//     { code: "GBP", name: "British Pound" },
//     { code: "INR", name: "Indian Rupee" },
//     { code: "JPY", name: "Japanese Yen" },
//     { code: "CNY", name: "Chinese Yuan" },
//     { code: "AUD", name: "Australian Dollar" },
//     { code: "CAD", name: "Canadian Dollar" },
//     { code: "CHF", name: "Swiss Franc" },
//     { code: "AED", name: "UAE Dirham" },
//   ];

//   const fetchPrices = async () => {
//     setLoading(true);
//     setError(null);
//     setSuccess(false);

//     try {
//       const response = await fetch(
//         `${BASE_URL}/latest?api_key=${API_KEY}&base=${currency}&currencies=${metals.map((m) => m.symbol).join(",")}`,
//       );

//       if (!response.ok) {
//         throw new Error(`API Error: ${response.status}`);
//       }

//       const data = await response.json();

//       if (!data.success) {
//         throw new Error("Failed to fetch prices");
//       }

//       setPrices(data.rates);
//       setLastUpdate(new Date());
//       setSuccess(true);
//       setTimeout(() => setSuccess(false), 3000);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };



//   useEffect(() => {
//     fetchPrices();
//   }, [currency]);

//   // useEffect(() => {
//   //   if (autoRefresh) {
//   //     autoRefreshInterval.current = setInterval(fetchPrices, 60000);
//   //   } else {
//   //     if (autoRefreshInterval.current) {
//   //       clearInterval(autoRefreshInterval.current);
//   //     }
//   //   }
//   //   return () => {
//   //     if (autoRefreshInterval.current) {
//   //       clearInterval(autoRefreshInterval.current);
//   //     }
//   //   };
//   // }, [autoRefresh, currency]);


// useEffect(() => {
//   if (!autoRefresh) return;

//   const id = setInterval(fetchPrices, 60000);

//   return () => clearInterval(id);
// }, [autoRefresh, currency]);






//   useEffect(() => {
//     const conversions = {
//       oz: 1,
//       gram: 31.1035,
//       kg: 0.0311035,
//     };
//     const baseAmount = convertAmount / conversions[fromUnit];
//     const result = baseAmount * conversions[toUnit];
//     setConvertResult(result);
//   }, [convertAmount, fromUnit, toUnit]);

//   const calculatePrice = (rate) => {
//     if (!rate) return 0;
//     let price = 1 / rate;
//     if (unit === "gram") {
//       price = price / 31.1035;
//     } else if (unit === "kg") {
//       price = price / 0.0311035;
//     }
//     return price;
//   };

//   const swapUnits = () => {
//     setFromUnit(toUnit);
//     setToUnit(fromUnit);
//   };

//   const getUnitLabel = () => {
//     if (unit === "oz") return "oz";
//     if (unit === "gram") return "g";
//     return "kg";
//   };








//   return (
//     <div className="min-h-screen bg-(--background) text-(--foreground)">
     

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
//         {/* Header */}
//         <header className="mb-12 sm:mb-16">
//           <h1 className="heading text-center mb-4 aniamte-fade-up ">
//             Gold Price Checker
//           </h1>           
//             <p className="description text-center mb-8 animate-fade-up">
//              Instantly check the latest gold rates with live updates, price comparison.
//             </p>
         
//         </header>

//         {/* Controls */}
//         <div className="mb-10 sm:mb-12 bg-(--card) border-(--border) p-6 sm:p-8 rounded-xl">
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//             <div>
//               <label className="block content">
//                 Currency
//               </label>
//               <select
//                 value={currency}
//                 onChange={(e) => setCurrency(e.target.value)}
//                 className="w-full px-4 py-3 border border-(--border) bg-(--card)  text-(--foreground) rounded-md  focus:outline-none   transition-all"
//               >
//                 {currencies.map((curr) => (
//                   <option key={curr.code} value={curr.code}>
//                     {curr.code} - {curr.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block content">
//                 Weight Unit
//               </label>
//               <select
//                 value={unit}
//                 onChange={(e) => setUnit(e.target.value)}
//                 className="w-full px-4 py-3 border border-(--border) text-(--foreground) rounded-md"
//               >
//                 <option value="oz">Troy Ounce (oz)</option>
//                 <option value="gram">Gram (g)</option>
//                 <option value="kg">Kilogram (kg)</option>
//               </select>
//             </div>

//             {/* <div className="flex items-end">
//               <label className="flex items-center gap-3 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={autoRefresh}
//                   onChange={(e) => setAutoRefresh(e.target.checked)}
//                   className="w-5 h-5 border-2 border-black focus:ring-2 focus:ring-black"
//                 />
//                 <span className="text-sm uppercase tracking-wider text-black font-medium">
//                   Auto-Refresh (60s)
//                 </span>
//               </label>
//             </div> */}

//             <div className="flex items-end px-8 ">
//               <button
//                 onClick={fetchPrices}
//                 disabled={loading}
//                 className="w-full px-6 py-3 bg-(--primary)  border border-(--border) rounded-md text-white font-medium cursor-pointer"
//               >
//                 {loading ? "Loading..." : "Refresh Prices"}
//               </button>
//             </div>
//           </div>

//           {/* Status Messages */}
//           {loading && (
           
//               <p className="text-sm text-(--foreground) text-center font-medium pt-8">
//                 <span className="animate-pulse-custom inline-block mr-2">
//                   ●
//                 </span>
//                 Fetching  Prices...
//               </p>
           
//           )}

//           {success && (
            
//               <p className="text-sm text-green-500 text-center font-medium pt-8">
//                 ✓ Prices Updated Successfully
//               </p>
            
//           )}

//           {error && (
           
//               <p className="text-sm text-center text-red-500 pt-8 font-medium uppercase tracking-wider">
//                 ✕ Error: {error}
//               </p>
           
//           )}
//         </div>

//         {/* Metals Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 sm:mb-16 bg-(--background) border border-(--border) rounded-md p-8">
//           {metals.map((metal, index) => {
//             const rate = prices[metal.symbol];
//             const price = calculatePrice(rate);
//             const change = (Math.random() - 0.5) * 2;
//             const isPositive = change >= 0;

//             return (
//               <div
//                 key={metal.symbol}
//                 className=" bg-(--card) border border-(--border) rounded-md p-8"
                
//               >
//                 <div className="flex justify-between items-start bg-(--card) mb-6">
//                   <div>
//                     {/* <div className="text-4xl mb-2">{metal.icon}</div> */}
//                     <h3 className="content mb-1">
//                       {metal.name}
//                     </h3>
//                     <p className="content">
//                       {metal.symbol}
//                     </p>
//                   </div>
//                   <div
//                     className={`px-3 py-1 text-xs font-medium rounded-md uppercase tracking-wider ${
//                       isPositive
//                         ? "bg-green-100 text-green-800"
//                         : "bg-red-100 text-red-800"
//                     }`}
//                   >
//                     {isPositive ? "+" : ""}
//                     {change.toFixed(2)}%
//                   </div>
//                 </div>

//                 <div className="mb-6">
//                   <div className="content mb-2">
//                     {currency} {price.toFixed(2)}
//                   </div>
//                   <p className="content">
//                     per {getUnitLabel()}
//                   </p>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 pt-6 border-t-2 border-current">
//                   <div>
//                     <p className="content mb-1">
//                       Bid
//                     </p>
//                     <p className="content number-display">
//                       {(price * 0.995).toFixed(2)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="content mb-1">
//                       Ask
//                     </p>
//                     <p className="content number-display">
//                       {(price * 1.005).toFixed(2)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="content mb-1">
//                       24h High
//                     </p>
//                     <p className="content number-display">
//                       {(price * 1.02).toFixed(2)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="content mb-1">
//                       24h Low
//                     </p>
//                     <p className="content number-display">
//                       {(price * 0.98).toFixed(2)}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Price Comparison Chart */}
//         {/* <div className="mb-12 sm:mb-16 bg-(--card) border border-(--border) p-6 sm:p-8 rounded-xl">
//           <h2 className="subheading mb-8">
//             Price Comparison
//           </h2>
//           <div className="space-y-4">
//             {metals.map((metal) => {
//               const rate = prices[metal.symbol];
//               const price = calculatePrice(rate);
//               const maxPrice = Math.max(
//                 ...metals.map((m) => calculatePrice(prices[m.symbol]) || 0),
//               );
//               const percentage = (price / maxPrice) * 100;

//               return (
//                 <div key={metal.symbol} className="space-y-2">
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm font-medium uppercase tracking-wider text-(--foreground)">
//                       {metal.name}
//                     </span>
//                     <span className="text-sm font-semibold text-(--foreground) number-display">
//                       {currency} {price.toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="w-full bg-gray-200 h-8 border border-black">
//                     <div
//                       className="h-full bg-black transition-all duration-500"
//                       style={{ width: `${percentage}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div> */}

//         {/* Weight Converter */}
//         <div className="bg-(--card) border border-(--border) p-6 sm:p-8 mb-12">
//           <h2 className="subheading mb-8">
//             Weight Converter
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end  ">
//             <div className="space-y-4">
//               <div>
//                 <label className="block content mb-2">
//                   Amount
//                 </label>
//                 <input
//                   type="number"
//                   value={convertAmount}
//                   onChange={(e) =>
//                     setConvertAmount(parseFloat(e.target.value) || 0)
//                   }
//                   min="0"
//                   step="0.01"
//                   className="w-full px-4 py-3 border border-(--border) bg-(--card) rounded-md text-(--foreground) "
//                 />
//               </div>
//               <div>
//                 <label className="block content mb-2">
//                   From Unit
//                 </label>
//                 <select
//                   value={fromUnit}
//                   onChange={(e) => setFromUnit(e.target.value)}
//                    className="w-full px-4 py-3 border border-(--border) bg-(--card) rounded-md text-(--foreground) "
//                 >
//                   <option value="oz">Troy Ounce</option>
//                   <option value="gram">Gram</option>
//                   <option value="kg">Kilogram</option>
//                 </select>
//               </div>
//             </div>

//             <div className="flex justify-center items-center">
//               <button
//                 onClick={swapUnits}
//                 className="w-12 h-12 bg-(--card) text-(--foreground) flex items-center justify-center  text-2xl"
//               >
//                 ⇄
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className="block content mb-2">
//                   Result
//                 </label>
//                 <input
//                   type="text"
//                   value={convertResult.toFixed(6)}
//                   readOnly
//                   className="w-full px-4 py-3 border border-(--border) bg-(--card) text-(--foreground) rounded-md"
//                 />
//               </div>
//               <div>
//                 <label className="block content mb-2">
//                   To Unit
//                 </label>
//                 <select
//                   value={toUnit}
//                   onChange={(e) => setToUnit(e.target.value)}
//                   className="w-full px-4 py-3 border border-(--border) bg-(--card) text-(--foreground) rounded-md"
//                 >
//                   <option value="oz">Troy Ounce</option>
//                   <option value="gram">Gram</option>
//                   <option value="kg">Kilogram</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>   
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useRef } from "react";

export default function ToolHome() {
  const [prices, setPrices] = useState({});
  const [currency, setCurrency] = useState("USD");
  const [unit, setUnit] = useState("oz");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [convertAmount, setConvertAmount] = useState(1);
  const [fromUnit, setFromUnit] = useState("oz");
  const [toUnit, setToUnit] = useState("gram");
  const [convertResult, setConvertResult] = useState(0);
  const autoRefreshInterval = useRef(null);

  const API_KEY = "f0be87a617d027782e74c385a0e72153";
  const BASE_URL = "https://api.metalpriceapi.com/v1";

  const metals = [
    {
      symbol: "XAU",
      name: "Gold",
      icon: "⬛",
      color: "from-yellow-100 to-yellow-50",
      border: "border-yellow-400",
    },
    {
      symbol: "XAG",
      name: "Silver",
      icon: "◼",
      color: "from-gray-100 to-gray-50",
      border: "border-gray-400",
    },
    {
      symbol: "XPT",
      name: "Platinum",
      icon: "◾",
      color: "from-slate-100 to-slate-50",
      border: "border-slate-400",
    },
    {
      symbol: "XPD",
      name: "Palladium",
      icon: "▪",
      color: "from-zinc-100 to-zinc-50",
      border: "border-zinc-400",
    },
  ];

  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "INR", name: "Indian Rupee" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "CNY", name: "Chinese Yuan" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "CHF", name: "Swiss Franc" },
    { code: "AED", name: "UAE Dirham" },
  ];

const fetchPrices = async () => {
  setLoading(true);
  setError(null);
  setSuccess(false);

  try {
    const metalCodes = metals.map((m) => m.symbol).join(",");
    const url = `${BASE_URL}/latest?api_key=${API_KEY}&base=${currency}&currencies=${metalCodes}`;
    
    console.log("Fetching from:", url);
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    if (!data.success) {
      // Handle error object properly - convert to string if it's an object
      let errorMessage = "Failed to fetch prices";
      if (data.error) {
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (typeof data.error === 'object') {
          // Try to extract common error fields or stringify the whole object
          errorMessage = data.error.message || data.error.info || JSON.stringify(data.error);
        }
      }
      throw new Error(errorMessage);
    }

    // The API returns rates like: { "XAU": 0.00052 } meaning 1 USD = 0.00052 oz of gold
    // To get price per oz: 1 / rate
    setPrices(data.rates);
    setLastUpdate(new Date());
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  } catch (err) {
    console.error("Fetch error:", err);
    setError(err.message);
    
    // Fallback demo data so UI still works
    setPrices({
      "XAU": 0.00052, // Gold: ~1923 USD/oz
      "XAG": 0.012,   // Silver: ~23 USD/oz
      "XPT": 0.00092, // Platinum: ~1087 USD/oz
      "XPD": 0.00095, // Palladium: ~1053 USD/oz
    });
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchPrices();
  }, [currency]); // Remove currency dependency to avoid too many requests

  useEffect(() => {
    if (autoRefresh) {
      const id = setInterval(fetchPrices, 60000);
      return () => clearInterval(id);
    }
  }, [autoRefresh]);

  useEffect(() => {
    const conversions = {
      oz: 1,
      gram: 31.1035,
      kg: 0.0311035,
    };
    const baseAmount = convertAmount / conversions[fromUnit];
    const result = baseAmount * conversions[toUnit];
    setConvertResult(result);
  }, [convertAmount, fromUnit, toUnit]);

  const calculatePrice = (rate) => {
    if (!rate) return 0;
    
    // The API returns how much of the base currency equals 1 oz of metal
    // So price per oz = 1 / rate
    let pricePerOz = 1 / rate;
    
    // Convert to selected unit
    if (unit === "gram") {
      return pricePerOz / 31.1035;
    } else if (unit === "kg") {
      return pricePerOz / 0.0311035;
    }
    return pricePerOz;
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const getUnitLabel = () => {
    if (unit === "oz") return "oz";
    if (unit === "gram") return "g";
    return "kg";
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-12 sm:mb-16">
          <h1 className="heading text-center mb-4 animate-fade-up">
            Gold Price Checker
          </h1>           
          <p className="description text-center mb-8 animate-fade-up">
            Instantly check the latest gold rates with live updates, price comparison.
          </p>
        </header>

        {/* Controls */}
        <div className="mb-10 sm:mb-12 bg-(--card) border-(--border) p-6 sm:p-8 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <label className="block content">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 border border-(--border) bg-(--card) text-(--foreground) rounded-md focus:outline-none transition-all"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block content">
                Weight Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-3 border border-(--border) text-(--foreground) rounded-md"
              >
                <option value="oz">Troy Ounce (oz)</option>
                <option value="gram">Gram (g)</option>
                <option value="kg">Kilogram (kg)</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-5 h-5 border-2 border-(--border) focus:ring-2 focus:ring-(--primary)"
                />
                <span className="text-sm uppercase tracking-wider text-(--foreground) font-medium">
                  Auto-Refresh (60s)
                </span>
              </label>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchPrices}
                disabled={loading}
                className="w-full px-6 py-3 bg-(--primary) border border-(--border) rounded-md text-white font-medium cursor-pointer hover:opacity-90 transition-opacity"
              >
                {loading ? "Loading..." : "Refresh Prices"}
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {loading && (
            <p className="text-sm text-(--foreground) text-center font-medium pt-8">
              <span className="animate-pulse-custom inline-block mr-2">
                ●
              </span>
              Fetching Prices...
            </p>
          )}

          {success && (
            <p className="text-sm text-green-500 text-center font-medium pt-8">
              ✓ Prices Updated Successfully
            </p>
          )}

          {error && (
            <p className="text-sm text-center text-red-500 pt-8 font-medium uppercase tracking-wider">
              ✕ Error: {error} (Showing demo data)
            </p>
          )}
        </div>

        {/* Metals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 sm:mb-16 bg-(--background) border border-(--border) rounded-md p-8">
          {metals.map((metal) => {
            const rate = prices[metal.symbol];
            const price = calculatePrice(rate);
            const change = (Math.random() - 0.5) * 2;
            const isPositive = change >= 0;

            return (
              <div
                key={metal.symbol}
                className="bg-(--card) border border-(--border) rounded-md p-8"
              >
                <div className="flex justify-between items-start bg-(--card) mb-6">
                  <div>
                    <h3 className="content mb-1">
                      {metal.name}
                    </h3>
                    <p className="content">
                      {metal.symbol}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 text-xs font-medium rounded-md uppercase tracking-wider ${
                      isPositive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {change.toFixed(2)}%
                  </div>
                </div>

                <div className="mb-6">
                  <div className="content mb-2 text-2xl font-bold">
                    {currency} {price.toFixed(2)}
                  </div>
                  <p className="content">
                    per {getUnitLabel()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t-2 border-(--border)">
                  <div>
                    <p className="content mb-1">
                      Bid
                    </p>
                    <p className="content number-display">
                      {(price * 0.995).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="content mb-1">
                      Ask
                    </p>
                    <p className="content number-display">
                      {(price * 1.005).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="content mb-1">
                      24h High
                    </p>
                    <p className="content number-display">
                      {(price * 1.02).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="content mb-1">
                      24h Low
                    </p>
                    <p className="content number-display">
                      {(price * 0.98).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weight Converter */}
        <div className="bg-(--card) border border-(--border) p-6 sm:p-8 mb-12">
          <h2 className="subheading mb-8">
            Weight Converter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-4">
              <div>
                <label className="block content mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={convertAmount}
                  onChange={(e) =>
                    setConvertAmount(parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-(--border) bg-(--card) rounded-md text-(--foreground)"
                />
              </div>
              <div>
                <label className="block content mb-2">
                  From Unit
                </label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full px-4 py-3 border border-(--border) bg-(--card) rounded-md text-(--foreground)"
                >
                  <option value="oz">Troy Ounce</option>
                  <option value="gram">Gram</option>
                  <option value="kg">Kilogram</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <button
                onClick={swapUnits}
                className="w-12 h-12 bg-(--card) text-(--foreground) flex items-center justify-center text-2xl hover:bg-(--border) rounded-full transition-colors"
              >
                ⇄
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block content mb-2">
                  Result
                </label>
                <input
                  type="text"
                  value={convertResult.toFixed(6)}
                  readOnly
                  className="w-full px-4 py-3 border border-(--border) bg-(--card) text-(--foreground) rounded-md"
                />
              </div>
              <div>
                <label className="block content mb-2">
                  To Unit
                </label>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full px-4 py-3 border border-(--border) bg-(--card) text-(--foreground) rounded-md"
                >
                  <option value="oz">Troy Ounce</option>
                  <option value="gram">Gram</option>
                  <option value="kg">Kilogram</option>
                </select>
              </div>
            </div>
          </div>
        </div>   
      </div>
    </div>
  );
}