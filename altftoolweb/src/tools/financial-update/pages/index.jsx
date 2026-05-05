

import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw, Sparkles, AlertCircle, Search } from 'lucide-react';
import { getGeminiInsight, fetchRealStockData } from '../utils/api';

export default function ToolHome() {
  const [showApiInput, setShowApiInput] = useState(true);
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [stockData, setStockData] = useState([]);
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
const [error, setError] = useState('');
const [useRealData, setUseRealData] = useState(false);









  const [marketStats, setMarketStats] = useState({
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    high: 0,
    low: 0
  });

  const popularStocks = [
   { symbol: 'ALP', name: 'Alpha Corp' },
  { symbol: 'BTA', name: 'Beta Tech' },
  { symbol: 'GMS', name: 'Gamma Systems' },
  { symbol: 'DLT', name: 'Delta Works' },
  { symbol: 'NVA', name: 'Nova Labs' },
  { symbol: 'ORB', name: 'Orbit Solutions' }
  ];


// const fetchRealStockData = async (symbol) => {
//   const res = await fetch(
//     `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${STOCK_API_KEY}`
//   );

//   const json = await res.json();
//   const series = json['Time Series (Daily)'];

//   if (!series) throw new Error('Invalid symbol or API limit');

//   const data = Object.entries(series)
//     .slice(0, 30)
//     .reverse()
//     .map(([date, v]) => ({
//       date,
//       price: parseFloat(v['4. close']),
//       volume: parseInt(v['5. volume']),
//       high: parseFloat(v['2. high']),
//       low: parseFloat(v['3. low']),
//     }));

//   return data;
// };








  // Generate realistic mock data for demonstration
  
  
  const generateMockData = () => {
    const basePrice = Math.random() * 200 + 100;
    const data = [];
    for (let i = 0; i < 30; i++) {
      const variance = (Math.random() - 0.5) * 10;
      data.push({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        price: +(basePrice + variance).toFixed(2),
        volume: Math.floor(Math.random() * 10000000)
      });
    }
    return data;
  };

  // const updateStockData = () => {
  //   const data = generateMockData();
  //   setStockData(data);
    
  //   const latestPrice = data[data.length - 1].price;
  //   const previousPrice = data[data.length - 2].price;
  //   const change = latestPrice - previousPrice;
  //   const changePercent = (change / previousPrice) * 100;
    
  //   setMarketStats({
  //     price: latestPrice,
  //     change: change,
  //     changePercent: changePercent,
  //     volume: data[data.length - 1].volume,
  //     high: Math.max(...data.map(d => d.price)),
  //     low: Math.min(...data.map(d => d.price))
  //   });
  // };

const updateStockData = async (symbol = selectedStock) => {
  let data = [];

  if (useRealData) {
    data = await fetchRealStockData(symbol);
  } else {
    data = generateMockData();
  }

  setStockData(data);

  const latest = data.at(-1);
  const prev = data.at(-2);

  const change = latest.price - prev.price;

  setMarketStats({
    price: latest.price,
    change,
    changePercent: (change / prev.price) * 100,
    volume: latest.volume,
    high: Math.max(...data.map(d => d.price)),
    low: Math.min(...data.map(d => d.price)),
  });
};

//   useEffect(() => {   
//     updateStockData();
//     const interval = setInterval(updateStockData, 5000);
//     return () => clearInterval(interval);
//   }, [selectedStock]);
// useEffect(() => {
//   if (!useRealData) {
//     updateStockData();
//     const interval = setInterval(updateStockData, 5000);
//     return () => clearInterval(interval);
//   }
// }, [selectedStock, useRealData]);

useEffect(() => {
  if (!selectedStock) return;

  const fetchData = () => {
    updateStockData();
  };

  fetchData(); // initial call

   const interval = setInterval(fetchData, 5000);

  return () => clearInterval(interval);
}, [selectedStock, useRealData]);







const handleSearch = async () => {
  if (!searchQuery.trim()) {
    setError('Please enter stock symbol');
    return;
  }

  try {
    setLoading(true);
    setError('');

    setUseRealData(true);        // 🔥 switch ON
    setSelectedStock(searchQuery);

    await updateStockData(searchQuery);
    await getAIInsight();

  } catch (err) {
    setError('Invalid stock symbol or API limit reached');
  }

  setLoading(false);
};
  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className=" items-center justify-between mb-8">
          <div className=" items-center gap-3">
            
            <h1 className="heading text-center">Stock Update</h1>
            <p className="description  text-center">Get the latest stock price, volume, and trends live updates.</p>
          </div>
        {/* setting button */}
        </div>
{/* search bar */}
    <div className="flex items-center justify-between mb-6 gap-3">
            
              <input
                type="text"
                value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
  placeholder="Search your stock (e.g. AAPL, TSLA)"
             
               
                className="w-full px-4 py-3 border border-(--border) rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>


                <button 
                 onClick={() => handleSearch()}
                className="bg-(--primary) text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg flex items-center gap-2 cursor-pointer">  
                  <Search className="w-5 h-5 text-white " />
                  Search
                </button>
 
    </div>






        {/* Stock Selector */}
        <div className="bg-(--card) rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-(--foreground)">Select Stock</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {popularStocks.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => setSelectedStock(stock.symbol)}
                className={`p-3 rounded-lg font-semibold cursor-pointer transition-all ${
                  selectedStock === stock.symbol
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-(--card) text-(--foreground) '
                }`}
              >
                <div className="text-sm">{stock.symbol}</div>
                <div className="text-xs opacity-75 truncate">{stock.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-(--card) rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-(--muted-foreground) text-sm font-medium">Current Price</span>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-(--foreground)">${marketStats.price.toFixed(2)}</div>
            <div className={`flex items-center gap-1 mt-2 ${marketStats.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {marketStats.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-semibold">
                {marketStats.change >= 0 ? '+' : ''}{marketStats.change.toFixed(2)} ({marketStats.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="bg-(--card) rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-(--muted-foreground) text-sm font-medium">Volume</span>
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-(--foreground)">{(marketStats.volume / 1000000).toFixed(2)}M</div>
            <div className="text-sm text-(--muted-foreground) mt-2">Trading Volume</div>
          </div>

          <div className="bg-(--card) rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-(--muted-foreground) text-sm font-medium">Day High</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-(--foreground)">${marketStats.high.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-2">24h High</div>
          </div>

          <div className="bg-(--card) rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-(--muted-foreground) text-sm font-medium">Day Low</span>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-(--foreground)">${marketStats.low.toFixed(2)}</div>
            <div className="text-sm text-(--muted-foreground) mt-2">24h Low</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-(--card) rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-(--foreground)">Price Trend (30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-(--card) rounded-xl shadow-lg p-6 text-(--foreground)">
            <h3 className="text-xl font-semibold mb-4 text-(--foreground)">Volume Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="volume" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

       

        {/* Auto-refresh indicator */}
        <div className="mt-4 text-center text-blue-200 text-sm">
          <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
          Data updates every 5 seconds
        </div>
      </div>
    </div>
  );
};







// import React, { useState, useEffect } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
// import { TrendingUp, TrendingDown, Search, RefreshCw, Activity } from 'lucide-react';

// export default function ToolHome(){
//   const [stocks, setStocks] = useState([
//     { symbol: 'AAPL', name: 'Apple Inc.', price: 0, change: 0, changePercent: 0, data: [], loading: true },
//     { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 0, change: 0, changePercent: 0, data: [], loading: true },
//     { symbol: 'MSFT', name: 'Microsoft Corp.', price: 0, change: 0, changePercent: 0, data: [], loading: true },
//     { symbol: 'TSLA', name: 'Tesla Inc.', price: 0, change: 0, changePercent: 0, data: [], loading: true },
//     { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 0, change: 0, changePercent: 0, data: [], loading: true },
//     { symbol: 'META', name: 'Meta Platforms', price: 0, change: 0, changePercent: 0, data: [], loading: true },
//   ]);
//   const [selectedStock, setSelectedStock] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [lastUpdate, setLastUpdate] = useState(new Date());

//   const fetchStockData = async (symbol) => {
//     try {
//       // Using Twelve Data API - free tier available
//       const response = await fetch(
//         `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=5min&outputsize=30&format=JSON&apikey=R4TY7V8UOSX0AURX`
//       );
//       const data = await response.json();

//       if (data.values && data.values.length > 0) {
//         const latestPrice = parseFloat(data.values[0].close);
//         const previousPrice = parseFloat(data.values[1]?.close || data.values[0].open);
//         const change = latestPrice - previousPrice;
//         const changePercent = (change / previousPrice) * 100;

//         const chartData = data.values.slice(0, 20).reverse().map((item, index) => ({
//           time: item.datetime.split(' ')[1] || `${index}`,
//           price: parseFloat(item.close),
//           volume: parseInt(item.volume)
//         }));

//         return {
//           price: latestPrice,
//           change: change,
//           changePercent: changePercent,
//           data: chartData,
//           loading: false
//         };
//       }
      
//       // Fallback to mock data if API fails
//       return generateMockData(symbol);
//     } catch (error) {
//       console.error(`Error fetching data for ${symbol}:`, error);
//       return generateMockData(symbol);
//     }
//   };

//   const generateMockData = (symbol) => {
//     const basePrice = {
//       'AAPL': 185.50,
//       'GOOGL': 140.25,
//       'MSFT': 378.90,
//       'TSLA': 242.80,
//       'AMZN': 178.35,
//       'META': 486.50
//     }[symbol] || 100;

//     const change = (Math.random() - 0.5) * 10;
//     const changePercent = (change / basePrice) * 100;
//     const currentPrice = basePrice + change;

//     const chartData = Array.from({ length: 20 }, (_, i) => {
//       const variance = (Math.random() - 0.5) * 5;
//       return {
//         time: `${9 + Math.floor(i / 12)}:${(i % 12) * 5}`,
//         price: parseFloat((currentPrice + variance).toFixed(2)),
//         volume: Math.floor(Math.random() * 1000000) + 500000
//       };
//     });

//     return {
//       price: parseFloat(currentPrice.toFixed(2)),
//       change: parseFloat(change.toFixed(2)),
//       changePercent: parseFloat(changePercent.toFixed(2)),
//       data: chartData,
//       loading: false
//     };
//   };

//   const updateStocks = async () => {
//     setLoading(true);
    
//     const updatedStocks = await Promise.all(
//       stocks.map(async (stock) => {
//         const data = await fetchStockData(stock.symbol);
//         return { ...stock, ...data };
//       })
//     );
    
//     setStocks(updatedStocks);
//     setLastUpdate(new Date());
//     setLoading(false);
//   };

//   useEffect(() => {
//     updateStocks();
//     const interval = setInterval(updateStocks, 30000); // Update every 30 seconds
//     return () => clearInterval(interval);
//   }, []);

//   const filteredStocks = stocks.filter(stock =>
//     stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     stock.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const StockCard = ({ stock }) => {
//     const isPositive = stock.change >= 0;
    
//     return (
//       <div
//         onClick={() => setSelectedStock(stock)}
//         className="bg-white border-2 border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-xl hover:border-gray-300 transition-all duration-200"
//       >
//         <div className="flex justify-between items-start mb-3">
//           <div>
//             <h3 className="text-xl font-bold text-black">{stock.symbol}</h3>
//             <p className="text-sm text-gray-600 mt-1">{stock.name}</p>
//           </div>
//           <div className={`p-2 rounded-full ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
//             {isPositive ? (
//               <TrendingUp className="text-green-600" size={20} />
//             ) : (
//               <TrendingDown className="text-red-600" size={20} />
//             )}
//           </div>
//         </div>
        
//         {stock.loading ? (
//           <div className="flex items-center gap-2 mt-4">
//             <div className="animate-spin">
//               <Activity size={20} className="text-gray-400" />
//             </div>
//             <span className="text-sm text-gray-500">Loading...</span>
//           </div>
//         ) : (
//           <div className="mt-4">
//             <p className="text-3xl font-bold text-black">${stock.price.toFixed(2)}</p>
//             <div className="flex items-center gap-2 mt-2">
//               <span className={`text-sm font-bold px-2 py-1 rounded ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                 {isPositive ? '+' : ''}{stock.change.toFixed(2)}
//               </span>
//               <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
//                 ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
//               </span>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-white text-black">
//       {/* Header */}
//       <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-10 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div>
//               <h1 className="text-3xl sm:text-4xl font-bold text-black">Stock Market</h1>
//               <p className="text-sm text-gray-600 mt-1">Real-time market data</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="text-right hidden sm:block">
//                 <p className="text-xs text-gray-500">Last updated</p>
//                 <p className="text-sm font-semibold text-black">{lastUpdate.toLocaleTimeString()}</p>
//               </div>
//               <button
//                 onClick={updateStocks}
//                 disabled={loading}
//                 className="p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={20} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Search Bar */}
//         <div className="mb-8">
//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={22} />
//             <input
//               type="text"
//               placeholder="Search stocks by symbol or name..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black bg-white text-lg"
//             />
//           </div>
//         </div>

//         {/* Stock Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//           {filteredStocks.map((stock) => (
//             <StockCard key={stock.symbol} stock={stock} />
//           ))}
//         </div>

//         {/* Detailed View */}
//         {selectedStock && !selectedStock.loading && (
//           <div className="bg-white border-2 border-gray-300 rounded-xl p-6 sm:p-8 shadow-lg">
//             <div className="flex justify-between items-start mb-6">
//               <div>
//                 <h2 className="text-3xl sm:text-4xl font-bold text-black">{selectedStock.symbol}</h2>
//                 <p className="text-lg text-gray-600 mt-1">{selectedStock.name}</p>
//               </div>
//               <button
//                 onClick={() => setSelectedStock(null)}
//                 className="text-gray-500 hover:text-black text-3xl font-light leading-none"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="mb-8">
//               <p className="text-4xl sm:text-5xl font-bold text-black mb-3">
//                 ${selectedStock.price.toFixed(2)}
//               </p>
//               <div className="flex items-center gap-4">
//                 <span className={`text-xl font-bold px-3 py-1 rounded-lg ${selectedStock.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                   {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)}
//                 </span>
//                 <span className={`text-xl font-semibold ${selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                   ({selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)
//                 </span>
//               </div>
//             </div>

//             {/* Chart */}
//             {selectedStock.data.length > 0 && (
//               <div className="mt-8">
//                 <h3 className="text-xl font-bold text-black mb-4">Price Chart</h3>
//                 <div className="bg-gray-50 rounded-lg p-4">
//                   <ResponsiveContainer width="100%" height={350}>
//                     <AreaChart data={selectedStock.data}>
//                       <defs>
//                         <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="5%" stopColor={selectedStock.change >= 0 ? "#16a34a" : "#dc2626"} stopOpacity={0.3}/>
//                           <stop offset="95%" stopColor={selectedStock.change >= 0 ? "#16a34a" : "#dc2626"} stopOpacity={0}/>
//                         </linearGradient>
//                       </defs>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis 
//                         dataKey="time" 
//                         stroke="#6b7280"
//                         tick={{ fill: '#000', fontSize: 12 }}
//                       />
//                       <YAxis 
//                         stroke="#6b7280"
//                         tick={{ fill: '#000', fontSize: 12 }}
//                         domain={['auto', 'auto']}
//                       />
//                       <Tooltip 
//                         contentStyle={{ 
//                           backgroundColor: '#fff', 
//                           border: '2px solid #e5e7eb',
//                           borderRadius: '8px',
//                           color: '#000'
//                         }}
//                         formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
//                       />
//                       <Area 
//                         type="monotone" 
//                         dataKey="price" 
//                         stroke={selectedStock.change >= 0 ? '#16a34a' : '#dc2626'}
//                         strokeWidth={3}
//                         fill="url(#colorPrice)"
//                       />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Info Notice */}
//         <div className="mt-8 p-5 bg-gray-100 border border-gray-300 rounded-xl">
//           <p className="text-sm text-gray-800">
//             <strong className="text-black">📊 Live Data:</strong> Stock prices update automatically every 30 seconds. 
//             Click on any stock card to view detailed charts. The app uses real market data APIs with fallback to simulated data for demonstration.
//           </p>
//         </div>
//       </main>
//     </div>
//   );
// };

