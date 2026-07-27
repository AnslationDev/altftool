/**
 * Bulk Cart & Multi-Domain Escrow Checkout Drawer Component
 * Location: src/app/altflinking/components/marketplace/CartCheckoutDrawer.jsx
 */

"use client";

import React, { useState } from "react";
import { X, ShoppingBag, Trash2, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CartCheckoutDrawer({ isOpen, onClose, cartItems = [], onRemoveCartItem, onCheckoutEscrow }) {
  const [targetUrl, setTargetUrl] = useState("https://mycompany.com/saas");
  const [anchorText, setAnchorText] = useState("best growth platform");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.prices?.guestPost || 180), 0);

  const handleCheckout = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setIsSubmitting(true);

    setTimeout(() => {
      onCheckoutEscrow({
        items: cartItems,
        totalPrice,
        targetUrl,
        anchorText,
      });
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <>
      <div className="altf-drawer-overlay" onClick={onClose} />
      <div className="altf-drawer space-y-6">

        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Bulk Backlink Cart ({cartItems.length})</h2>
              <p className="text-xs text-slate-500">Lock multiple publisher orders into 100% escrow</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-10 text-center space-y-3 altf-card">
            <ShoppingBag className="h-10 w-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">Your Backlink Cart is Empty</p>
            <p className="text-xs text-slate-500">Add domains from the marketplace directory to initiate bulk escrow checkout.</p>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="space-y-5">
            {/* Items List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs">
                  <div>
                    <p className="font-bold text-white font-mono">{item.domain}</p>
                    <p className="text-[10px] text-slate-500">DR {item.dr} • {item.niche}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-indigo-400">${item.prices?.guestPost || 180}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveCartItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Campaign Inputs */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Landing Page URL *</label>
                <input
                  type="url"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="altf-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Anchor Text *</label>
                <input
                  type="text"
                  required
                  value={anchorText}
                  onChange={(e) => setAnchorText(e.target.value)}
                  className="altf-input text-xs"
                />
              </div>
            </div>

            {/* Total Price & Checkout */}
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Total Placement Amount ({cartItems.length} Domains)</span>
                <span className="text-lg font-black text-indigo-700 font-mono">$0.00 (100% FREE)</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="altf-btn-primary w-full py-3 text-xs font-bold"
              >
                {isSubmitting ? (
                  <span>Submitting Free Request...</span>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Submit Free Request ($0)</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </>
  );
}
