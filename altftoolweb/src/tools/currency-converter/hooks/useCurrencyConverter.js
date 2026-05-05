"use client";

import { useEffect, useState, useCallback } from "react";
import { API_URL, HISTORICAL_API_BASE } from "../constants/currencies";
import { calculateRate } from "../utils/calculateRate";

export const useCurrencyConverter = () => {
  const [amount, setAmount] = useState(1.0);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");

  const [rates, setRates] = useState({});
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Trend Chart
  const [trendDays, setTrendDays] = useState(7);
  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendStats, setTrendStats] = useState(null);

  // Alert
  const [alertValue, setAlertValue] = useState("");
  const [alertTriggered, setAlertTriggered] = useState(false);

  // Fees & Real Amount Calculator
  const [transferFeeType, setTransferFeeType] = useState("fixed");
  const [transferFee, setTransferFee] = useState("");
  const [bankMargin, setBankMargin] = useState("");
  const [finalReceivedAmount, setFinalReceivedAmount] = useState(null);

  // Historical Conversion Simulator
  const [historicalDate, setHistoricalDate] = useState("");
  const [historicalRate, setHistoricalRate] = useState(null);

  const [conversionHistory, setConversionHistory] = useState([]);

  // Bulk Conversion
  const [bulkInput, setBulkInput] = useState("");
  const [bulkResults, setBulkResults] = useState([]);

  // Tip Calculator
  const [tipPercent, setTipPercent] = useState(10);
  const [tipAmount, setTipAmount] = useState(null);

  // Split Bill
  const [splitCount, setSplitCount] = useState(2);
  const [splitResult, setSplitResult] = useState(null);

  // Travel Budget
  const [travelDays, setTravelDays] = useState(1);
  const [dailyBudget, setDailyBudget] = useState("");
  const [totalTravelBudget, setTotalTravelBudget] = useState(null);

  const [lastUpdated, setLastUpdated] = useState(null);

  // Multi-Currency Compare Mode
  const [compareCurrencies] = useState([
    "INR",
    "EUR",
    "AED",
    "GBP",
    "USD",
    "JPY",
    "CAD",
    "AUD",
  ]);

  const [compareResults, setCompareResults] = useState([]);

  // Currency Strength Meter
  const [currencyStrength, setCurrencyStrength] = useState(null);

  const [investmentInsight, setInvestmentInsight] = useState("");

  // Gamification
const [usageCount, setUsageCount] = useState(0);
const [badges, setBadges] = useState([]);

  // Popular + Recent Pairs
  const popularPairs = [
    { from: "USD", to: "INR" },
    { from: "USD", to: "EUR" },
    { from: "USD", to: "AED" },
    { from: "USD", to: "GBP" },
    { from: "EUR", to: "USD" },
    { from: "GBP", to: "INR" },
  ];

  const [recentPairs, setRecentPairs] = useState([]);

  // Smart Travel Mode
  const [travelMode, setTravelMode] = useState(false);

  const travelData = {
    INR: {
      country: "India",
      emoji: "🇮🇳",
      dailyCost: "₹2,000 - ₹5,000 / day",
      tip: "carry some cash too while travelling  because UPI works in most places, but keep some cash for local markets and transport.",
      shortcuts: [100, 500, 1000],
    },
    USD: {
      country: "United States",
      emoji: "🇺🇸",
      dailyCost: "$50 - $150 / day",
      tip: "Card widely accepted, but small cash useful.",
      shortcuts: [10, 50, 100],
    },
    EUR: {
      country: "Europe",
      emoji: "🇪🇺",
      dailyCost: "€40 - €120 / day",
      tip: "Most places accept cards, keep coins too.",
      shortcuts: [10, 20, 50],
    },
    GBP: {
      country: "United Kingdom",
      emoji: "🇬🇧",
      dailyCost: "£50 - £130 / day",
      tip: "Contactless payment is very common.",
      shortcuts: [10, 20, 50],
    },
    AED: {
      country: "UAE",
      emoji: "🇦🇪",
      dailyCost: "AED 150 - 400 / day",
      tip: "Carry some cash for taxis and local shops.",
      shortcuts: [50, 100, 500],
    },
    JPY: {
      country: "Japan",
      emoji: "🇯🇵",
      dailyCost: "¥6,000 - ¥15,000 / day",
      tip: "Japan still uses a lot of cash.",
      shortcuts: [1000, 5000, 10000],
    },
    CAD: {
      country: "Canada",
      emoji: "🇨🇦",
      dailyCost: "CAD 70 - 180 / day",
      tip: "Cards are accepted almost everywhere, keep some cash too.",
      shortcuts: [20, 50, 100],
    },
    AUD: {
      country: "Australia",
      emoji: "🇦🇺",
      dailyCost: "AUD 80 - 200 / day",
      tip: "Tap-to-pay is common, but keep some coins for public transport.",
      shortcuts: [20, 50, 100],
    },
  };

  //  Only show travel data when travel mode is ON
  const selectedTravelData = travelMode ? travelData[toCurrency] || null : null;

  // Fetch Live Rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);

        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok || !data.rates) {
          throw new Error("Unable to fetch live exchange rates");
        }

        setRates(data.rates);
        setLastUpdated(new Date().toISOString());
        localStorage.setItem("cached-rates", JSON.stringify(data.rates));
        localStorage.setItem("rates-timestamp", new Date().toISOString());
        setError("");
      } catch (err) {
        setError(err.message);

        setRates({
          USD: 1,
          EUR: 0.92,
          GBP: 0.79,
          INR: 83.5,
          AED: 3.67,
          JPY: 154.5,
          CAD: 1.37,
          AUD: 1.5,
        });

const cached = localStorage.getItem("cached-rates");
const timestamp = localStorage.getItem("rates-timestamp");

if (cached) {
  setRates(JSON.parse(cached));
  setLastUpdated(timestamp);
}

      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  // fetch Trend Data
  const fetchTrendData = useCallback(async () => {
    try {
      setTrendLoading(true);

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - trendDays);

      const formatDate = (date) => date.toISOString().split("T")[0];

      const url = `${HISTORICAL_API_BASE}/${formatDate(start)}..${formatDate(
        end,
      )}?from=${fromCurrency}&to=${toCurrency}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.rates) {
        throw new Error("Unable to fetch trend data");
      }

      const formatted = Object.entries(data.rates).map(([date, value]) => ({
        date,
        rate: value[toCurrency],
      }));

      const first = formatted[0]?.rate ?? 0;
      const last = formatted[formatted.length - 1]?.rate ?? 0;

      const high = formatted.reduce(
        (max, item) => (item.rate > max.rate ? item : max),
        formatted[0],
      );

      const low = formatted.reduce(
        (min, item) => (item.rate < min.rate ? item : min),
        formatted[0],
      );

      const percentChange =
        first && last ? (((last - first) / first) * 100).toFixed(2) : 0;

      setTrendData(formatted);
      setTrendStats({ high, low, percentChange });

      const change = parseFloat(percentChange);

      if (change >= 1) {
        setCurrencyStrength({
          label: "Strong",
          color: "text-green-500",
          bg: "bg-green-500/10",
          border: "border-green-500/30",
        });
      } else if (change <= -1) {
        setCurrencyStrength({
          label: "Weak",
          emoji: "📉",
          color: "text-red-500",
          bg: "bg-red-500/10",
          border: "border-red-500/30",
        });
      } else {
        setCurrencyStrength({
          label: "Stable",
          emoji: "⚖️",
          color: "text-yellow-500",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
        });
      }

      // NEW: Investment Insight
      if (change >= 1) {
        setInvestmentInsight(
          `${fromCurrency} is up ${percentChange}% this week`,
        );
      } else if (change <= -1) {
        setInvestmentInsight(`${fromCurrency} weakened recently`);
      } else {
        setInvestmentInsight(`${fromCurrency} is stable currently`);
      }
    } catch {
      setTrendData([]);
      setTrendStats(null);
      setCurrencyStrength(null);
    } finally {
      setTrendLoading(false);
    }
  }, [fromCurrency, toCurrency, trendDays]);

  // Conversion Logic
  const convert = useCallback(() => {
    if (amount === "") {
      setConvertedAmount(null);
      setExchangeRate(null);
      setFinalReceivedAmount(null);
      return;
    }

    if (!rates || !amount) return;

    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setConvertedAmount(null);
      setExchangeRate(null);
      setFinalReceivedAmount(null);
      setCompareResults([]);
      return;
    }

    const { finalRate, result } = calculateRate(
      rates,
      fromCurrency,
      toCurrency,
      numericAmount,
    );

    setExchangeRate(finalRate);
    setConvertedAmount(result);

    // ✅ Gamification count
setUsageCount((prev) => {
  const updated = prev + 1;
  localStorage.setItem("usage-count", updated);
  return updated;
});

    // new entry
    const newEntry = {
      from: fromCurrency,
      to: toCurrency,
      amount: numericAmount,
      result,
      date: new Date().toISOString(),
    };

    setConversionHistory((prev) => {
      const updated = [newEntry, ...prev].slice(0, 10);
      localStorage.setItem("conversion-history", JSON.stringify(updated));
      return updated;
    });

    let updatedAmount = result;

    const marginValue = parseFloat(bankMargin);
    if (!isNaN(marginValue) && marginValue > 0) {
      updatedAmount -= (updatedAmount * marginValue) / 100;
    }

    const feeValue = parseFloat(transferFee);
    if (!isNaN(feeValue) && feeValue > 0) {
      if (transferFeeType === "percent") {
        updatedAmount -= (updatedAmount * feeValue) / 100;
      } else {
        updatedAmount -= feeValue;
      }
    }

    setFinalReceivedAmount(
      updatedAmount > 0 ? updatedAmount.toFixed(2) : "0.00",
    );
  }, [
    amount,
    fromCurrency,
    toCurrency,
    rates,
    transferFee,
    transferFeeType,
    bankMargin,
  ]);

useEffect(() => {
  const newBadges = [];

  if (usageCount >= 5) {
    newBadges.push("🔥 Active User");
  }

  if (recentPairs.length >= 3) {
    newBadges.push("✈️ Frequent Traveler");
  }

  setBadges(newBadges);
}, [usageCount, recentPairs]);

useEffect(() => {
  // load previous usage
  const saved = localStorage.getItem("usage-count");
  if (saved) {
    setUsageCount(Number(saved));
  }
}, []);

  // Tip + Split + Travel calculator
  useEffect(() => {
    if (!convertedAmount) return;

    // Tip
    const tip = (convertedAmount * tipPercent) / 100;
    setTipAmount(tip.toFixed(2));

    // Split
    if (splitCount > 0) {
      setSplitResult((convertedAmount / splitCount).toFixed(2));
    }

    // Travel Budget
    const daily = parseFloat(dailyBudget);
    if (!isNaN(daily) && travelDays > 0) {
      setTotalTravelBudget((daily * travelDays).toFixed(2));
    }
  }, [convertedAmount, tipPercent, splitCount, dailyBudget, travelDays]);

  const handleBulkConvert = useCallback(() => {
    if (!bulkInput || !rates) return;

    const lines = bulkInput.split("\n");

    const results = lines
      .map((line) => {
        const parts = line.trim().split(" ");
        if (parts.length < 2) return null;

        const value = parseFloat(parts[0]);
        const currency = parts[1].toUpperCase();

        if (isNaN(value) || !rates[currency]) return null;

        const { result } = calculateRate(rates, currency, toCurrency, value);

        return {
          input: `${value} ${currency}`,
          output: `${Number(result).toFixed(2)} ${toCurrency}`,
        };
      })
      .filter(Boolean);

    setBulkResults(results);
  }, [bulkInput, rates, toCurrency]);

  // Save Recent Pairs
  useEffect(() => {
    if (!fromCurrency || !toCurrency) return;

    const newPair = { from: fromCurrency, to: toCurrency };

    setRecentPairs((prev) => {
      const filtered = prev.filter(
        (item) => !(item.from === newPair.from && item.to === newPair.to),
      );

      const updated = [newPair, ...filtered].slice(0, 5);

      localStorage.setItem("recent-currency-pairs", JSON.stringify(updated));

      return updated;
    });
  }, [fromCurrency, toCurrency]);

  // Load Recent Pairs
  useEffect(() => {
    const saved = localStorage.getItem("recent-currency-pairs");

    if (saved) {
      try {
        setRecentPairs(JSON.parse(saved));
      } catch {
        setRecentPairs([]);
      }
    }
  }, []);

  // NEW: Load Conversion History
  useEffect(() => {
    const saved = localStorage.getItem("conversion-history");

    if (saved) {
      try {
        setConversionHistory(JSON.parse(saved));
      } catch {
        setConversionHistory([]);
      }
    }
  }, []);

  // Run Conversion
  useEffect(() => {
    const timer = setTimeout(() => {
      convert();
    }, 300);

    return () => clearTimeout(timer);
  }, [convert]);

  // Multi Currency Compare
  useEffect(() => {
    if (!rates || !amount || !fromCurrency) {
      setCompareResults([]);
      return;
    }

    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setCompareResults([]);
      return;
    }

    const results = compareCurrencies
      .filter((currency) => currency !== fromCurrency)
      .map((currency) => {
        const { result } = calculateRate(
          rates,
          fromCurrency,
          currency,
          numericAmount,
        );

        return {
          code: currency,
          amount: result,
        };
      });

    setCompareResults(results);
  }, [amount, fromCurrency, rates, compareCurrencies]);

  // Load Trend
  useEffect(() => {
    fetchTrendData();
  }, [fetchTrendData]);

  // Load Alert
  useEffect(() => {
    const savedAlert = localStorage.getItem("currency-alert");

    if (savedAlert) {
      const parsed = JSON.parse(savedAlert);

      if (
        parsed.fromCurrency === fromCurrency &&
        parsed.toCurrency === toCurrency
      ) {
        setAlertValue(parsed.target);
      }
    }
  }, [fromCurrency, toCurrency]);

  // Alert Trigger
  useEffect(() => {
    if (!alertValue || !exchangeRate) return;

    const target = parseFloat(alertValue);

    if (isNaN(target)) return;

    localStorage.setItem(
      "currency-alert",
      JSON.stringify({
        fromCurrency,
        toCurrency,
        target: alertValue,
      }),
    );

    const interval = setInterval(() => {
      if (exchangeRate >= target && !alertTriggered) {
        setAlertTriggered(true);
        alert(`${fromCurrency} → ${toCurrency} has reached ${target}`);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [alertValue, exchangeRate, fromCurrency, toCurrency, alertTriggered]);

  //  Historical Rate Fetch
  const fetchHistoricalRate = useCallback(
    async (date) => {
      if (!date || !fromCurrency || !toCurrency) return;

      try {
        const url = `${HISTORICAL_API_BASE}/${date}?from=${fromCurrency}&to=${toCurrency}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.rates) return;

        const rate = data.rates?.[date]?.[toCurrency];

        setHistoricalRate(rate || null);
      } catch (err) {
        console.error("Historical error:", err);
        setHistoricalRate(null);
      }
    },
    [fromCurrency, toCurrency],
  );

  // trigger when date changes
  useEffect(() => {
    if (historicalDate) {
      fetchHistoricalRate(historicalDate);
    }
  }, [historicalDate, fetchHistoricalRate]);

  return {
    amount,
    setAmount,
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    rates,
    convertedAmount,
    exchangeRate,
    loading,
    error,

    trendDays,
    setTrendDays,
    trendData,
    trendLoading,
    trendStats,

    alertValue,
    setAlertValue,
    alertTriggered,

    transferFeeType,
    setTransferFeeType,
    transferFee,
    setTransferFee,
    bankMargin,
    setBankMargin,
    finalReceivedAmount,

    compareCurrencies,
    compareResults,

    currencyStrength,

    popularPairs,
    recentPairs,

    travelMode,
    setTravelMode,
    selectedTravelData,

    historicalDate,
    setHistoricalDate,
    historicalRate,

    investmentInsight,

    conversionHistory,

    bulkInput,
    setBulkInput,
    bulkResults,
    handleBulkConvert,

    tipPercent,
    setTipPercent,
    tipAmount,

    splitCount,
    setSplitCount,
    splitResult,

    travelDays,
    setTravelDays,
    dailyBudget,
    setDailyBudget,
    totalTravelBudget,

    lastUpdated,

    usageCount,
badges,
  };
};
