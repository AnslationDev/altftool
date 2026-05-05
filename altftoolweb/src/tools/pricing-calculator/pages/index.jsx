"use client";

import { useState } from "react";
import Header from "../components/Header";
import InputField from "../components/InputField";
import Button from "../components/Button";
import TotalDisplay from "../components/TotalDisplay";
import Description from "../components/Description";

const DashboardCard = ({ title, value, subValue, trend, type = "neutral" }) => {
  const styles = {
    success: "bg-green-500/10 border-green-500/20 text-green-600",
    danger: "bg-red-500/10 border-red-500/20 text-red-600",
    neutral: "bg-[var(--muted)] border-[var(--border)] text-[var(--foreground)]",
    primary: "bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]",
  };

  return (
    <div className={`p-5 rounded-2xl border ${styles[type]} transition-all hover:scale-[1.02]`}>
      <p className="text-xs font-semibold uppercase opacity-60">{title}</p>
      <div className="flex justify-between items-end mt-2">
        <h3 className="text-2xl font-semibold">{value}</h3>
        {subValue && <span className="text-sm font-medium mb-1 opacity-80">{subValue}</span>}
      </div>
      {trend && <div className="mt-2 text-xs font-medium opacity-70">{trend}</div>}
    </div>
  );
};

export default function PricingCalculatorApp() {
  const [price, setPrice] = useState(15000);
  const [quantity, setQuantity] = useState(1);
  const [shipping, setShipping] = useState(500);
  const [discount, setDiscount] = useState(10);
  const [gst, setGst] = useState(18);
  const [platformFee, setPlatformFee] = useState(5);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [history, setHistory] = useState([]);

  const discAmt = (price * discount) / 100;
  const sellingPrice = price - discAmt;
  const baseRevenue = sellingPrice * quantity;
  const taxImpact = baseRevenue * (gst / 100);
  const feeImpact = baseRevenue * (platformFee / 100);
  const finalTotal = baseRevenue + taxImpact + feeImpact + Number(shipping);

  const costPrice = price * 0.65;
  const totalCost = (costPrice * quantity) + Number(shipping);
  const netProfit = finalTotal - totalCost - taxImpact - feeImpact;
  const margin = finalTotal > 0 ? (netProfit / finalTotal) * 100 : 0;

  const handleCompare = () => {
    const entry = {
      price,
      margin: Number(margin.toFixed(1)),
      profit: Number(netProfit.toFixed(0)),
      time: new Date().toLocaleTimeString(),
    };

    setHistory((prev) => [entry, ...prev].slice(0, 3));
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      
      <Header />

      {/* ✅ BOX START */}
      <div className="border border-[var(--border)] m-4">
        <main className="max-w-7xl mx-auto px-4 py-10 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[var(--card)] border border-[var(--border)] p-8">
                
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-[var(--primary)]"></span> 
                  Configuration
                </h2>

                <div className="space-y-8">

                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="text-xl font-medium text-[var(--muted-foreground)]">
                        Unit Price
                      </label>
                      <span className="text-xl text-[var(--primary)] font-semibold">
                        ₹{price.toLocaleString()}
                      </span>
                    </div>
                    <input type="range" min="500" max="200000" step="500" value={price} onChange={(e)=>setPrice(Number(e.target.value))} className="w-full"/>
                  </div>

                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="text-xl font-medium text-[var(--muted-foreground)]">
                        Discount %
                      </label>
                      <span className="text-lg text-[var(--primary)] font-semibold">{discount}%</span>
                    </div>
                    <input type="range" min="0" max="80" value={discount} onChange={(e)=>setDiscount(Number(e.target.value))} className="w-full"/>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xl">
                    <InputField label="Quantity" value={quantity} setValue={setQuantity} />
                    <InputField label="Shipping (₹)" value={shipping} setValue={setShipping} />
                  </div>

                  <button
                    onClick={() => setIsAdvanced(!isAdvanced)}
                    className="w-full py-3 border-2 border-dashed border-[var(--border)] text-xl font-medium text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
                  >
                    {isAdvanced ? "− Hide Business Taxes" : "+ Add GST & Platform Fees"}
                  </button>

                  {isAdvanced && (
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="GST (%)" value={gst} setValue={setGst} />
                      <InputField label="Platform Fee (%)" value={platformFee} setValue={setPlatformFee} />
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <Button text="Add to Comparison" onClick={handleCompare} />
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-7 space-y-6 flex flex-col">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DashboardCard title="Net Profit" value={`₹${Math.max(0, netProfit).toLocaleString()}`} type={netProfit > 0 ? "success" : "danger"} />
                <DashboardCard title="Profit Margin" value={`${margin.toFixed(1)}%`} type="primary" />
              </div>

              <div className="bg-[var(--muted)] border border-[var(--border)] p-6">
                <p className="text-xl font-semibold uppercase mb-2 text-[var(--primary)]">
                  Strategy Insight
                </p>
                <h4 className="text-xl font-semibold">
                  {margin < 20 
                    ? `Target price ₹${(totalCost / 0.75).toFixed(0)} to hit 25% margin.` 
                    : "Pricing is optimized for current market scaling."}
                </h4>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] p-8 text-center">
                <TotalDisplay total={finalTotal} />

                <div className="mt-10 flex justify-between text-xl border-t border-[var(--border)] pt-6">
                  <span>Break-even: ₹{totalCost.toLocaleString()}</span>
                  <span>Live Tracking Active</span>
                </div>
              </div>

            </div>
          </div>

          {/* COMPARISON */}
          {history.length > 0 && (
            <div className="bg-[var(--card)] border border-[var(--border)] p-6 mt-8">
              <h3 className="text-2xl font-semibold mb-4 text-[var(--primary)]">
                Comparison History
              </h3>

              {history.map((item, index) => (
                <div key={index} className="flex justify-between p-4 border border-[var(--border)] bg-[var(--muted)] rounded-xl mb-3">
                  <div>
                    <p>Price: ₹{item.price}</p>
                    <p>Profit: ₹{item.profit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--primary)] font-semibold">{item.margin}%</p>
                    <p>Margin</p>
                  </div>
                </div>
              ))}

              <button onClick={() => setHistory([])} className="text-red-500 mt-4">
                Clear History
              </button>
            </div>
          )}

        </main>
      </div>
      {/* ✅ BOX END */}

      {/* ✅ OUTSIDE BOX */}
      <Description />

    </div>
  );
}