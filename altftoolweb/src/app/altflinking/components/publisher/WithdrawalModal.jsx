/**
 * Publisher Payout Withdrawal Modal Component
 * Location: src/app/altflinking/components/publisher/WithdrawalModal.jsx
 */

"use client";

import React, { useState } from "react";
import { X, Wallet, DollarSign, CheckCircle2, ArrowRight, Building2, CreditCard } from "lucide-react";

export default function WithdrawalModal({ isOpen, onClose, balance = 1240, onConfirmWithdrawal }) {
  const [amount, setAmount] = useState(balance.toString());
  const [method, setMethod] = useState("bank");
  const [accountDetails, setAccountDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = (e) => {
    e.preventDefault();
    if (!amount || !accountDetails) return;

    onConfirmWithdrawal({
      amount: Number(amount),
      method,
      accountDetails,
      date: new Date().toISOString(),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-md">
      <div className="altf-card w-full max-w-md p-6 space-y-5 border-cyan-500/40">

        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Publisher Wallet Payout</h3>
              <p className="text-xs text-slate-500">Withdraw available earnings to your bank account</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Available Wallet Balance</span>
              <span className="text-lg font-black text-emerald-400 font-mono">${balance.toLocaleString()}.00</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Withdrawal Amount ($)</label>
              <input
                type="number"
                max={balance}
                min={50}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="altf-input text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Payout Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="altf-input text-xs font-bold"
              >
                <option value="bank">Direct Bank Transfer (ACH / Wire)</option>
                <option value="paypal">PayPal Business</option>
                <option value="stripe">Stripe Connect Payout</option>
                <option value="crypto">Crypto USDT (TRC-20)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {method === "bank" ? "Bank Routing / IBAN Number" : method === "crypto" ? "USDT Wallet Address" : "PayPal / Stripe Account Email"} *
              </label>
              <input
                type="text"
                required
                placeholder={method === "bank" ? "US89374029340293" : "account@domain.com"}
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                className="altf-input text-xs font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="altf-btn-secondary py-2 px-4 text-xs">
                Cancel
              </button>
              <button type="submit" className="altf-btn-primary py-2 px-5 text-xs font-bold">
                <span>Request Payout (${amount})</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 mx-auto animate-bounce">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Payout Request Submitted!</h4>
            <p className="text-xs text-slate-500">Your withdrawal of ${amount} is queued for bank transfer processing.</p>
          </div>
        )}

      </div>
    </div>
  );
}
