import React, { useState } from "react";
import FAQSection from "./components/faq";
import HowItWorks from "./components/howitworks";

export default function App() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("in");
  const [note, setNote] = useState("");

  const addTransaction = () => {
    if (!amount) return alert("Enter Amount");

    const tx = {
      id: Date.now(),
      type,
      amount: Number(amount),
      note,
    };

    setTransactions([tx, ...transactions]);

    if (type === "in") setBalance(balance + Number(amount));
    else setBalance(balance - Number(amount));

    setAmount("");
    setNote("");
  };

  const deleteTx = (id, tx) => {
    setTransactions(transactions.filter((t) => t.id !== id));

    if (tx.type === "in") setBalance(balance - tx.amount);
    else setBalance(balance + tx.amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-grow max-w-2xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 text-indigo-700">
          💰 Digital Wallet
        </h1>

        {/* ===== BALANCE CARD ===== */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center border border-gray-100">
          <p className="text-gray-600 text-lg mb-2">Current Balance</p>
          <h2 className="text-5xl sm:text-6xl font-extrabold text-green-600">
            ₹{balance}
          </h2>
        </div>

        {/* ===== TRANSACTION FORM ===== */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
            Add Transaction
          </h3>

          <div className="space-y-4">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-(--background)
    text-(--foreground)
    placeholder:text-(--muted-foreground)
    border-(--border)

    dark:bg-(--background)
    dark:text-(--foreground)

    focus:bg-(--background)
    focus:text-(--foreground)
    focus-visible:ring-ring

    transition-none"
              >
                <option value="in" className="text-(--foreground)">Add Money</option>
                <option value="out">Expense</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (Optional)
              </label>
              <input
                placeholder="Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={addTransaction}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-95"
            >
              Save Transaction
            </button>
          </div>
        </div>

        {/* ===== TRANSACTIONS LIST ===== */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
            Recent Transactions
          </h3>

          {transactions.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {/* Note */}
                  <span className="text-gray-700 font-medium break-words">
                    {tx.note || "Transaction"}
                  </span>

                  {/* Amount & Delete */}
                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <b
                      className={`text-lg font-semibold ${
                        tx.type === "in" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ₹{tx.amount}
                    </b>
                    <button
                      onClick={() => deleteTx(tx.id, tx)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                      aria-label="Delete transaction"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      {/* <footer className="py-4 text-center text-gray-600 text-sm bg-white border-t mt-auto">
        © 2025 Digital Wallet | Secure & Trusted
      </footer> */}




      <HowItWorks/>

<FAQSection/>
    </div>
  );
}
