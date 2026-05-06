"use client";
import React from "react";
import { ArrowRightLeft } from "lucide-react";
import CurrencySelect from "../components/CurrencySelect";
import ConversionResult from "../components/ConversionResult";
import Description from "../components/Description";
import { useCurrencyConverter } from "../hooks/useCurrencyConverter";
import TrendChart from "../components/TrendChart";

const CurrencyConverter = () => {
  const {
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

    alertTriggered,
    alertValue,
    setAlertValue,

    transferFee,
    setTransferFee,
    transferFeeType,
    setTransferFeeType,
    bankMargin,
    setBankMargin,
    finalReceivedAmount,

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
  } = useCurrencyConverter();

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const flagMap = {
    INR: "🇮🇳",
    EUR: "🇪🇺",
    AED: "🇦🇪",
    GBP: "🇬🇧",
    USD: "🇺🇸",
    JPY: "🇯🇵",
    CAD: "🇨🇦",
    AUD: "🇦🇺",
  };

  const [animatedValue, setAnimatedValue] = React.useState(0);

React.useEffect(() => {
  if (!convertedAmount) return;

  let start = 0;
  const end = Number(convertedAmount);
  const duration = 500;
  const increment = end / (duration / 16);

  const counter = setInterval(() => {
    start += increment;
    if (start >= end) {
      setAnimatedValue(end);
      clearInterval(counter);
    } else {
      setAnimatedValue(start);
    }
  }, 16);

  return () => clearInterval(counter);
}, [convertedAmount]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-(--background) text-(--foreground)">
      <div className="flex flex-col items-center justify-center px-4 text-center sm:px-6">
        <h1 className="heading mt-5">
          <span className="breakwords">Currency Converter</span>
        </h1>

        <p className="description mt-2 w-full sm:max-w-2xl">
          Convert currencies instantly with accurate real-time exchange rates,
          compare values across countries, and stay updated with the latest
          market changes.
        </p>
      </div>

      <div className="m-1 mt-6 flex items-center justify-center px-3 sm:mt-10 sm:px-4">
        <div className="relative w-full  rounded-3xl p-4 shadow-2xl sm:p-6 md:p-10">
          {/* <div className="absolute -left-12.5 -top-12.5 h-40 w-40 rounded-full blur-3xl"></div> */}
          {/* <div className="absolute -bottom-12.5 -right-12.5 h-60 w-60 rounded-full blur-3xl"></div> */}

          <div className="relative z-10">
            {error && (
              <div className="mb-4 rounded-lg border border-red-600 bg-red-800/50 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Amount Input */}
            <label className="text-sm font-medium text-(--foreground)">
              Amount
            </label>

            <div className="relative mb-6">
              <div className="absolute -bottom-10 -right-10 h-32 w-48 rounded-full blur-3xl"></div>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="relative z-10 w-full rounded-xl border border-(--border) bg-(--card) backdrop-blur-md bg-white/10 px-4 py-3 text-2xl font-bold text-(--foreground) shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-(--primary) sm:text-3xl"
              />
            </div>

            {/* Currency Selectors */}
            <div className="mb-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <div className="min-w-0 w-full sm:flex-1">
                <CurrencySelect
                  label="From"
                  value={fromCurrency}
                  rates={rates}
                  loading={loading}
                  onChange={(e) => setFromCurrency(e.target.value)}
                />
              </div>

              <div className="flex flex-shrink-0 justify-center sm:pt-6">
                <button
                  onClick={handleSwap}
                  className="mt-6 rounded-full bg-blue-500 p-3 text-(--foreground) transition-all hover:bg-green-400"
                >
                  <ArrowRightLeft size={18} />
                </button>
              </div>

              <div className="min-w-0 w-full sm:flex-1">
                <CurrencySelect
                  label="To"
                  value={toCurrency}
                  rates={rates}
                  loading={loading}
                  onChange={(e) => setToCurrency(e.target.value)}
                />
              </div>
            </div>

            {/*  Popular & Recent Pairs */}
            <div className="mt-6 rounded-3xl border border-(--border) bg-(--card) backdrop-blur-md bg-white/10 p-5 sm:p-6 shadow-lg">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Popular Pairs */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-(--foreground)">
                    Popular Pairs
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {popularPairs.map((pair) => (
                      <button
                        key={`${pair.from}-${pair.to}`}
                        onClick={() => {
                          setFromCurrency(pair.from);
                          setToCurrency(pair.to);
                        }}
                        className="rounded-full border border-(--border) bg-(--card) backdrop-blur-md bg-white/10 px-4 py-2 text-sm text-(--foreground) transition-all hover:border-(--primary) hover:bg-(--background)"
                      >
                        {pair.from} → {pair.to}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recently Used */}
                {recentPairs.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-(--foreground)">
                      Recently Used
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {recentPairs.map((pair, index) => (
                        <button
                          key={`${pair.from}-${pair.to}-${index}`}
                          onClick={() => {
                            setFromCurrency(pair.from);
                            setToCurrency(pair.to);
                          }}
                          className="rounded-full border border-(--border) bg-(--background) px-4 py-2 text-sm text-(--foreground) transition-all hover:border-(--primary)"
                        >
                          {pair.from} → {pair.to}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Smart Travel Mode */}
            <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-lg sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[var(--foreground)] sm:text-lg">
                    Smart Travel Mode
                  </h3>

                  <p className="mt-1 text-sm text-[var(--foreground)]">
                    Get travel-friendly currency tips and quick conversions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setTravelMode((prev) => !prev)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    travelMode
                      ? "bg-green-500 text-white"
                      : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                  }`}
                >
                  Travel Mode {travelMode ? "ON" : "OFF"}
                </button>
              </div>

              {travelMode === true && selectedTravelData ? (
                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {selectedTravelData.emoji}
                      </span>

                      <div>
                        <p className="font-semibold text-[var(--foreground)]">
                          {selectedTravelData.country}
                        </p>

                        <p className="text-sm text-[var(--foreground)]">
                          Local Travel Tip
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-[var(--foreground)]">
                      {selectedTravelData.tip}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-sm text-[var(--foreground)]">
                      Approx Daily Cost
                    </p>

                    <p className="mt-2 text-xl font-bold text-[var(--foreground)]">
                      {selectedTravelData.dailyCost}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="mb-3 text-sm text-[var(--foreground)]">
                      Quick Conversion Shortcuts
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {selectedTravelData.shortcuts?.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setAmount(String(value))}
                          className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] transition-all hover:scale-[1.02] hover:border-[var(--primary)]"
                        >
                          {value} {fromCurrency}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            

            {/* Conversion Result */}
            <div className ="mt-6">
            <ConversionResult
              loading={loading}
              convertedAmount={animatedValue}
              exchangeRate={exchangeRate}
              amount={amount}
              fromCurrency={fromCurrency}
              toCurrency={toCurrency}
            />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
  
  {/* Investment Insight */}
  {trendStats && (
    <div className="rounded-2xl border border-(--border) bg-(--card) backdrop-blur-md bg-white/10 p-4">
      <p className="text-sm text-(--foreground)">Weekly Insight</p>
      <p className="mt-2 text-lg font-semibold text-(--foreground)">
        {trendStats.percentChange}% this week
      </p>
    </div>
  )}

  {/* Strength */}
  {currencyStrength && (
    <div className="rounded-2xl border border-(--border) bg-(--card) backdrop-blur-md bg-white/10 p-4">
      <p className="text-sm text-(--foreground)">Strength</p>
      <p className="mt-2 text-lg font-semibold">
        {currencyStrength.label}
      </p>
    </div>
  )}

</div>


            {/* Offline mode  */}
            {lastUpdated && (
              <p className="mt-2 text-xs text-(--foreground)">
                Last updated:{" "}
                {new Date(lastUpdated).toLocaleString()}
              </p>
            )}

            {/*  Historical Conversion Simulator */}
            <div className="mt-6 rounded-3xl border border-(--border) bg-(--card) backdrop-blur-md bg-white/10 p-5 shadow-lg sm:p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-(--foreground) sm:text-lg">
                  Historical Conversion Simulator
                </h3>

                <p className="mt-1 text-sm text-(--foreground)">
                  See what you would have received on a past date.
                </p>
              </div>

              {/* Date Picker */}
              <input
                type="date"
                value={historicalDate}
                onChange={(e) => setHistoricalDate(e.target.value)}
                className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none focus:border-(--primary)"
              />

              {/* Result */}
              {historicalRate && amount && (
                <div className="mt-4 rounded-2xl border border-(--border) bg-(--background) p-4">
                  <p className="text-sm text-(--foreground)">
                    If you converted on {historicalDate} →
                  </p>

                  <p className="mt-2 text-xl font-bold text-(--foreground)">
                    {(amount * historicalRate).toFixed(2)} {toCurrency}
                  </p>
                </div>
              )}
            </div>
            {/* Trend Chart */}
            <TrendChart
              trendDays={trendDays}
              setTrendDays={setTrendDays}
              trendData={trendData}
              trendLoading={trendLoading}
              trendStats={trendStats}
              fromCurrency={fromCurrency}
              toCurrency={toCurrency}
            />

            {/* Fees & Real Amount Calculator */}
            <div className="mt-6 rounded-3xl border border-(--border) bg-(--card) backdrop-blur-md bg-white/10 p-5 shadow-lg sm:p-6">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-(--foreground) sm:text-lg">
                  Fees & Real Amount Calculator
                </h3>

                <p className="mt-1 text-sm text-(--foreground)">
                  Add optional transfer fee and bank margin.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Transfer Fee */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-(--foreground)">
                    Transfer Fee
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={transferFee}
                      onChange={(e) => setTransferFee(e.target.value)}
                      placeholder={
                        transferFeeType === "percent" ? "e.g. 2" : "e.g. 100"
                      }
                      className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none focus:border-(--primary)"
                    />

                    <select
                      value={transferFeeType}
                      onChange={(e) => setTransferFeeType(e.target.value)}
                      className="rounded-xl border border-(--border) bg-(--background) px-3 py-3 text-(--foreground) outline-none focus:border-(--primary)"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="percent">%</option>
                    </select>
                  </div>
                </div>

                {/* Bank Margin */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-(--foreground)">
                    Bank Margin (%)
                  </label>

                  <input
                    type="number"
                    value={bankMargin}
                    onChange={(e) => setBankMargin(e.target.value)}
                    placeholder="e.g. 1.5"
                    className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none focus:border-(--primary)"
                  />
                </div>
              </div>

              {/* Final Received Amount */}
              {finalReceivedAmount !== null && (
                <div className="mt-5 rounded-2xl border border-(--border) bg-(--background) p-4 sm:p-5">
                  <p className="text-sm text-(--foreground)">
                    You will receive:
                  </p>

                  <p className="mt-2 text-xl font-bold text-(--foreground) sm:text-2xl">
                    {finalReceivedAmount} {toCurrency}
                  </p>

                  <p className="mt-2 text-sm text-(--foreground)">
                    after {transferFee || 0}
                    {transferFeeType === "percent"
                      ? "% transfer fee"
                      : ` ${toCurrency} transfer fee`}
                    {Number(bankMargin) > 0 &&
                      ` and ${bankMargin}% bank margin`}
                  </p>
                </div>
              )}
            </div>

            {/*  Multi Currency Compare Mode */}
            <div className="mt-6 rounded-3xl border border-(--border) bg-(--card) backdrop-blur-md bg-white/10 p-5 shadow-lg sm:p-6">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-(--foreground) sm:text-lg">
                  Multi-Currency Compare Mode
                </h3>

                <p className="mt-1 text-sm text-(--foreground)">
                  Compare {amount || 1} {fromCurrency} in multiple currencies at
                  once.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {compareResults?.length > 0 ? (
                  compareResults.map((item) => (
                    <div
                      key={item.code}
                      className="rounded-2xl border border-(--border) bg-(--background) p-4 transition-all duration-200 hover:scale-[1.02] hover:border-(--primary)"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-(--foreground)">
                            {fromCurrency} → {item.code}
                          </p>

                          <p className="mt-2 break-words text-xl font-bold text-(--foreground) sm:text-2xl">
                            {Number(item.amount).toFixed(2)} {item.code}
                          </p>
                        </div>

                        <div className="flex-shrink-0 text-3xl">
                          <span className="transition-transform duration-300 hover:scale-125">
                          {flagMap[item.code] || "🌍"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full rounded-2xl border border-dashed border-(--border) bg-(--background) p-6 text-center text-sm text-(--foreground)">
                    Enter a valid amount to compare multiple currencies.
                  </div>
                )}
              </div>
            </div>

            {/*  Currency Strength Meter */}
            {currencyStrength && (
              <div
                className={`mt-6 rounded-3xl border p-5 shadow-lg sm:p-6 ${currencyStrength.bg} ${currencyStrength.border}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-(--foreground) sm:text-lg">
                      Currency Strength Meter
                    </h3>

                    <p className="mt-1 text-sm text-(--foreground)">
                      Based on the recent {trendDays}-day trend of{" "}
                      {fromCurrency} → {toCurrency}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--background) px-4 py-3">
                    <span className="text-3xl">{currencyStrength.emoji}</span>

                    <div>
                      <p
                        className={`text-lg font-bold ${currencyStrength.color}`}
                      >
                        {currencyStrength.label}
                      </p>

                      <p className="text-sm text-(--foreground)">
                        {trendStats?.percentChange}% over last {trendDays} days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Investment Insight Mode */}
            {investmentInsight && (
              <div className="mt-4 rounded-2xl border border-(--border) bg-(--background) p-4">
                <p className="text-sm text-(--foreground)">
                  💰 {investmentInsight}
                </p>
              </div>
            )}

            {/*  Bulk Conversion Tool */}
            <div className="mt-6 rounded-3xl border border-(--border) bg-(--card) backdrop-blur-md bg-white/10 p-5 shadow-lg sm:p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-(--foreground) sm:text-lg">
                  Bulk Conversion Tool
                </h3>

                <p className="mt-1 text-sm text-(--foreground)">
                  Paste multiple values (e.g. 10 USD, 50 USD)
                </p>
              </div>

              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder={`10 USD\n50 USD\n100 USD`}
                className="w-full rounded-xl border border-(--border) bg-(--background) p-3 text-sm text-(--foreground) outline-none focus:border-(--primary)"
                rows={4}
              />

              <button
                onClick={handleBulkConvert}
                className="mt-3 rounded-xl bg-blue-500 px-4 py-2 text-sm text-white"
              >
                Convert All
              </button>

              {bulkResults.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {bulkResults.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-(--border) bg-(--background) p-3 text-sm text-(--foreground)"
                    >
                      {item.input} → <strong>{item.output}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/*  Currency Calculator Combo */}
            <div className="mt-6 rounded-3xl border border-(--border) bg-(--card) backdrop-blur-md bg-white/10 p-5 shadow-lg sm:p-6">
              <h3 className="text-base font-semibold text-(--foreground) sm:text-lg">
                Currency Calculator Combo
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Tip Calculator */}
                <div className="rounded-2xl border border-(--border) bg-(--background) p-4">
                  <p className="text-sm text-(--foreground)">Tip Calculator</p>

                  <input
                    type="number"
                    value={tipPercent}
                    onChange={(e) => setTipPercent(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-(--border) bg-(--background) p-2 text-(--foreground)"
                  />

                  <p className="mt-2 text-sm">
                    Tip: {tipAmount} {toCurrency}
                  </p>
                </div>

                {/* Split Bill */}
                <div className="rounded-2xl border border-(--border) bg-(--background) p-4">
                  <p className="text-sm text-(--foreground)">Split Bill</p>

                  <input
                    type="number"
                    value={splitCount}
                    onChange={(e) => setSplitCount(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-(--border) bg-(--background) p-2 text-(--foreground)"
                  />

                  <p className="mt-2 text-sm">
                    Per Person: {splitResult} {toCurrency}
                  </p>
                </div>

                {/* Travel Budget */}
                <div className="rounded-2xl border border-(--border) bg-(--background) p-4">
                  <p className="text-sm text-(--foreground)">Travel Budget</p>

                  <input
                    type="number"
                    placeholder="Days"
                    value={travelDays}
                    onChange={(e) => setTravelDays(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-(--border) bg-(--background) p-2 text-(--foreground)"
                  />

                  <input
                    type="number"
                    placeholder="Daily Budget"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-(--border) bg-(--background) p-2 text-(--foreground)"
                  />

                  <p className="mt-2 text-sm">
                    Total: {totalTravelBudget} {toCurrency}
                  </p>
                </div>
              </div>
            </div>

            {/* Gamification */}
<div className="mt-6 rounded-3xl border border-(--border) bg-(--card) backdrop-blur-md bg-white/10 p-5 shadow-lg sm:p-6">
  <h3 className="text-base font-semibold text-(--foreground) sm:text-lg">
    Your Activity
  </h3>

  <p className="mt-2 text-sm text-(--foreground)">
    You tracked {usageCount} conversions today
  </p>

  {badges.length > 0 && (
    <div className="mt-3 flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <span
          key={index}
          className="rounded-full border border-(--border) bg-(--background) px-3 py-1 text-xs text-(--foreground)"
        >
          {badge}
        </span>
      ))}
    </div>
  )}
</div>

            {/* Alert Card */}
            <div className="mt-6 rounded-3xl border border-(--border) bg-(--card) backdrop-blur-md bg-white/10 p-5 shadow-lg sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-(--foreground)">
                    Notify me when {fromCurrency} → {toCurrency} reaches
                  </label>

                  <input
                    type="number"
                    value={alertValue}
                    onChange={(e) => setAlertValue(e.target.value)}
                    placeholder="e.g. 95"
                    className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none focus:border-(--primary)"
                  />
                </div>

                <div className="min-w-[140px] text-sm text-(--foreground)">
                  {alertValue ? (
                    <p>
                      Alert set at{" "}
                      <span className="font-semibold">{alertValue}</span>
                    </p>
                  ) : (
                    <p>No alert set</p>
                  )}

                  {alertTriggered && (
                    <p className="mt-2 font-medium text-green-500">
                      Alert triggered
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Conversion History */}
            {conversionHistory?.length > 0 && (
              <div className="mt-6 rounded-3xl border border-(--border) bg-(--card) backdrop-blur-md bg-white/10 p-5 shadow-lg sm:p-6">
                <h3 className="text-base font-semibold text-(--foreground) sm:text-lg">
                  Recent Conversions
                </h3>

                <div className="mt-4 space-y-3">
                  {conversionHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-(--border) bg-(--background) p-3"
                    >
                      <div>
                        <p className="text-sm text-(--foreground)">
                          {item.amount} {item.from} → {item.to}
                        </p>
                        <p className="text-xs text-(--foreground)">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-(--foreground)">
                        {Number(item.result).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Description />
    </div>
  );
};

export default CurrencyConverter;
