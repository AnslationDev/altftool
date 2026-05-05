

// const STOCK_API_KEY = process.env.NEXT_PUBLIC_STOCK_API_KEY;


const MODEL_NAME = "gemini-2.5-flash";
const apiKey ="AIzaSyDkqOu026dv0aF0-KLuQQ53AwIH7Dvb9p0"
const stockApiKey = "BNEMEMFH6XCR6UGM"

//  GEMINI API
export const getGeminiInsight = async (prompt) => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

//  STOCK  market api 
// export const fetchRealStockData = async (symbol) => {
//   const res = await fetch(
//     `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${stockApiKey}`
//   );

//   const json = await res.json();
//   const series = json['Time Series (Daily)'];

//   if (!series) throw new Error('Invalid stock symbol');

//   return Object.entries(series)
//     .slice(0, 30)
//     .reverse()
//     .map(([date, v]) => ({
//       date,
//       price: parseFloat(v['4. close']),
//       volume: parseInt(v['5. volume']),
//       high: parseFloat(v['2. high']),
//       low: parseFloat(v['3. low']),
//     }));
// };


export const fetchRealStockData = async (symbol) => {
  if (!symbol) {
    throw new Error("Stock symbol is required");
  }

  const res = await fetch(
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${stockApiKey}`
  );

  const json = await res.json();

  // 🚨 API LIMIT
  if (json.Note) {
    throw new Error("API limit reached. Please wait a minute.");
  }

  // 🚨 INVALID SYMBOL / API ERROR
  if (json["Error Message"]) {
    throw new Error("Invalid stock symbol");
  }

  const series = json["Time Series (Daily)"];

  if (!series) {
    throw new Error("No stock data available");
  }

  return Object.entries(series)
    .slice(0, 30)
    .reverse()
    .map(([date, v]) => ({
      date,
      price: Number(v["4. close"]),
      volume: Number(v["5. volume"]),
      high: Number(v["2. high"]),
      low: Number(v["3. low"]),
    }));
};
