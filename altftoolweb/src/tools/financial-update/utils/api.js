
export const getGeminiInsight = async (prompt) => {
  const res = await fetch("/api/tools/financial-update/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gemini insight failed");
  return data.text || "";
};

export const fetchRealStockData = async (symbol) => {
  if (!symbol) {
    throw new Error("Stock symbol is required");
  }

  const res = await fetch(
    `/api/tools/financial-update/stock?symbol=${encodeURIComponent(symbol)}`
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "No stock data available");
  return json.points || [];
};
